import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DocDefIndexService, DocSection, ModelId, MODEL_IDS, toContentFileUrl } from './modelIndex';
import { CustomTreeItem } from './mergedTree';
import { FigureIndexCache } from './figureIndex';

let currentPanel: vscode.WebviewPanel | undefined;
let currentDocUri: vscode.Uri | undefined;
let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let singleFragmentMode = false;

interface ComparePanelEntry {
	panel: vscode.WebviewPanel;
	model: ModelId;
	contentFileUrl: string;
	targetSection: DocSection;
}
let comparePanels: ComparePanelEntry[] = [];
let compareDebounceTimer: ReturnType<typeof setTimeout> | undefined;

/** Up to 9 numbered columns are supported by the API; 4 (one per model) is trivial. */
const COMPARE_COLUMNS = [vscode.ViewColumn.One, vscode.ViewColumn.Two, vscode.ViewColumn.Three, vscode.ViewColumn.Four];

interface XrefContext {
	workspaceRoot: string;
	figureIndexCache: FigureIndexCache;
	model?: ModelId;
	topSection?: DocSection;
}

function countChars(str: string, char: string): number {
	let count = 0;
	for (const c of str) {
		if (c === char) {
			count++;
		}
	}
	return count;
}

function headingTag(sectionNumber: string): string {
	const level = Math.min(6, countChars(sectionNumber, '.') + 1);
	return `h${level}`;
}

function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Finds the path of DocSection instances from root to target (both from the same live tree). */
function findAncestryPath(root: DocSection, target: DocSection): DocSection[] | undefined {
	if (root === target) {
		return [root];
	}
	for (const child of root.Sections ?? []) {
		const p = findAncestryPath(child, target);
		if (p) {
			return [root, ...p];
		}
	}
	return undefined;
}

function rewriteImageSrcs(html: string, webview: vscode.Webview, workspaceRoot: string): string {
	return html.replace(/src="([^"]+)"/g, (match, src: string) => {
		if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) {
			return match;
		}
		const abs = path.join(workspaceRoot, src);
		const uri = webview.asWebviewUri(vscode.Uri.file(abs));
		return `src="${uri.toString()}"`;
	});
}

interface ResolvedXref {
	text: string;
	resolved: boolean;
	title: string;
}

/**
 * Resolves an <xref>'s final display text the same way DocSection.ResolveXrefs does: the tag's own
 * placeholder inner text is always discarded, and real text is synthesized from prependLabel + the
 * resolved target. sectionTarget matches a SectionNumber; fileTarget first tries an EXACT match
 * against a numbered section's full ContentFileUrl (same as ResolveXrefs), then falls back to the
 * figure case — resolved via FigureIndexCache, which mirrors NumberFigures' whole-top-level-section
 * numbering rather than guessing.
 */
function resolveXrefText(attrsStr: string, indexService: DocDefIndexService, ctx: XrefContext): ResolvedXref {
	const sectionTargetMatch = /sectionTarget="([^"]*)"/.exec(attrsStr);
	const fileTargetMatch = /fileTarget="([^"]*)"/.exec(attrsStr);
	const prependLabelMatch = /prependLabel="([^"]*)"/.exec(attrsStr);
	const prependLabel = prependLabelMatch ? prependLabelMatch[1] : '';

	if (sectionTargetMatch) {
		const num = sectionTargetMatch[1];
		const entries = indexService.getEntry(num);
		const text = prependLabel ? `${prependLabel} ${num}` : num;
		if (entries.length > 0) {
			return { text, resolved: true, title: `→ ${num} - ${entries[0].section.SectionTitle}` };
		}
		return { text, resolved: false, title: `Unresolved sectionTarget: ${num}` };
	}

	if (fileTargetMatch) {
		const target = fileTargetMatch[1];
		const sectionEntries = indexService.findByContentFileUrl(target);
		if (sectionEntries.length > 0) {
			const num = sectionEntries[0].section.SectionNumber;
			const text = prependLabel ? `${prependLabel} ${num}` : num;
			return { text, resolved: true, title: `→ ${num} - ${sectionEntries[0].section.SectionTitle}` };
		}
		if (ctx.model && ctx.topSection) {
			const figNum = ctx.figureIndexCache.getFigureNumber(ctx.workspaceRoot, ctx.model, ctx.topSection, target);
			if (figNum !== undefined) {
				const numberPrepend = `Figure ${ctx.topSection.SectionNumber}-`;
				const text = prependLabel ? `${prependLabel} ${numberPrepend}${figNum}` : `${numberPrepend}${figNum}`;
				return { text, resolved: true, title: `→ ${numberPrepend}${figNum}` };
			}
		}
		const label = prependLabel || 'Figure';
		return { text: `${label} ?`, resolved: false, title: 'Could not locate this figure under the current top-level section' };
	}

	return { text: '', resolved: false, title: 'Malformed xref (no sectionTarget or fileTarget)' };
}

/** Replaces each <xref>...</xref> with its resolved final text, styled as a real link when resolved. */
function flagXrefs(html: string, indexService: DocDefIndexService, ctx: XrefContext): string {
	return html.replace(/<xref\b([^>]*)>[\s\S]*?<\/xref>/gi, (_match, attrsStr: string) => {
		const { text, resolved, title } = resolveXrefText(attrsStr, indexService, ctx);
		if (resolved) {
			return `<a href="#" class="om-xref-ok" title="${escapeHtml(title)}">${escapeHtml(text)}</a>`;
		}
		return `<span class="om-xref-bad" title="${escapeHtml(title)}">${escapeHtml(text)}</span>`;
	});
}

function renderLeaf(leaf: DocSection, workspaceRoot: string, webview: vscode.Webview, indexService: DocDefIndexService, xrefCtx: XrefContext, currentUrl: string, skipHeading: boolean): string {
	let out = '';
	if (!skipHeading && leaf.DisplayTitle && leaf.SectionTitle) {
		if (leaf.IsNumbered) {
			const tag = headingTag(leaf.SectionNumber);
			out += `<${tag}>${escapeHtml(leaf.SectionNumber)} - ${escapeHtml(leaf.SectionTitle)}</${tag}>`;
		} else {
			out += `<p class="unnumberedHeader">${escapeHtml(leaf.SectionTitle)}</p>`;
		}
	}
	if (leaf.HasContent && leaf.ContentFileUrl) {
		const isCurrent = leaf.ContentFileUrl === currentUrl;
		try {
			const abs = path.join(workspaceRoot, leaf.ContentFileUrl);
			const raw = fs.readFileSync(abs, 'utf-8');
			const rendered = flagXrefs(rewriteImageSrcs(raw, webview, workspaceRoot), indexService, xrefCtx);
			out += `<div class="${isCurrent ? 'om-current-fragment' : ''}">${rendered}</div>`;
		} catch {
			out += `<p class="om-preview-note">Could not read ${escapeHtml(leaf.ContentFileUrl)}</p>`;
		}
	}
	return out;
}

/** Renders a section's ancestor-heading chain + its own content (or its content-bearing children) —
 *  the core body shared by both the "follows the active editor" preview and the compare-all-models panes. */
function renderSectionBody(workspaceRoot: string, webview: vscode.Webview, indexService: DocDefIndexService, figureIndexCache: FigureIndexCache, model: ModelId, target: DocSection, currentUrl: string): string {
	const modelIndex = indexService.models.get(model);
	const ancestry = modelIndex ? findAncestryPath(modelIndex.docDef, target) : undefined;
	const numberedPath = (ancestry ?? []).filter((s) => s.IsNumbered && s.SectionNumber);
	const sectionForContext = numberedPath.length > 0 ? numberedPath[numberedPath.length - 1] : target;
	const breadcrumb = numberedPath.slice(0, -1);
	const xrefCtx: XrefContext = { workspaceRoot, figureIndexCache, model, topSection: numberedPath[0] };

	let html = `<p class="om-preview-note">Context: model ${escapeHtml(model)}</p>`;
	for (const anc of breadcrumb) {
		if (anc.DisplayTitle) {
			const tag = headingTag(anc.SectionNumber);
			html += `<${tag} class="om-ancestor">${escapeHtml(anc.SectionNumber)} - ${escapeHtml(anc.SectionTitle)}</${tag}>`;
		}
	}

	if (sectionForContext.DisplayTitle) {
		if (sectionForContext.IsNumbered) {
			const tag = headingTag(sectionForContext.SectionNumber);
			html += `<${tag}>${escapeHtml(sectionForContext.SectionNumber)} - ${escapeHtml(sectionForContext.SectionTitle)}</${tag}>`;
		} else {
			html += `<p class="unnumberedHeader">${escapeHtml(sectionForContext.SectionTitle)}</p>`;
		}
	}

	if (sectionForContext.HasContent) {
		html += renderLeaf(sectionForContext, workspaceRoot, webview, indexService, xrefCtx, currentUrl, true);
	} else {
		for (const child of sectionForContext.Sections ?? []) {
			if (child.HasContent) {
				html += renderLeaf(child, workspaceRoot, webview, indexService, xrefCtx, currentUrl, false);
			}
		}
	}
	return html;
}

function wrapHtmlShell(webview: vscode.Webview, workspaceRoot: string, contentWidthIn: number, bodyHtml: string): string {
	const cssUri = webview.asWebviewUri(vscode.Uri.file(path.join(workspaceRoot, 'css', 'elementStyling.css')));
	return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} data:;">
<link rel="stylesheet" href="${cssUri}">
<style>
  body { background: #eee; }
  .om-preview-page { max-width: ${contentWidthIn}in; margin: 1em auto; background: white; padding: 0.5in; box-shadow: 0 0 8px rgba(0,0,0,0.2); }
  .om-preview-note { color: #888; font-style: italic; font-size: 0.85em; }
  .om-ancestor { opacity: 0.6; }
  .om-current-fragment { outline: 2px dashed #0066cc; outline-offset: 4px; }
  .om-xref-ok { color: #0645AD; text-decoration: underline; }
  .om-xref-bad { color: #b00; border-bottom: 1px dashed #b00; cursor: help; }
</style>
</head>
<body>
<div class="om-preview-page">
${bodyHtml}
</div>
</body>
</html>`;
}

function getContentWidthIn(): number {
	return vscode.workspace.getConfiguration('om.preview').get<number>('contentWidthIn', 6.5);
}

async function buildPreviewHtml(webview: vscode.Webview, workspaceRoot: string, indexService: DocDefIndexService, figureIndexCache: FigureIndexCache, doc: vscode.TextDocument, contentWidthIn: number): Promise<string> {
	const currentUrl = toContentFileUrl(workspaceRoot, doc.uri.fsPath);
	const rawFragmentText = doc.getText();

	let bodyHtml: string;
	if (singleFragmentMode) {
		bodyHtml = flagXrefs(rewriteImageSrcs(rawFragmentText, webview, workspaceRoot), indexService, { workspaceRoot, figureIndexCache });
	} else {
		const entries = indexService.findByContentFileUrl(currentUrl);
		if (entries.length === 0) {
			bodyHtml = '<p class="om-preview-note">This fragment isn\'t referenced by any model\'s DocDef yet — showing raw content.</p>'
				+ flagXrefs(rewriteImageSrcs(rawFragmentText, webview, workspaceRoot), indexService, { workspaceRoot, figureIndexCache });
		} else {
			const { model, section: target } = entries[0];
			bodyHtml = renderSectionBody(workspaceRoot, webview, indexService, figureIndexCache, model, target, currentUrl);
		}
	}

	return wrapHtmlShell(webview, workspaceRoot, contentWidthIn, bodyHtml);
}

async function refreshPreview(workspaceRoot: string, indexService: DocDefIndexService, figureIndexCache: FigureIndexCache): Promise<void> {
	if (!currentPanel || !currentDocUri) {
		return;
	}
	const doc = await vscode.workspace.openTextDocument(currentDocUri);
	currentPanel.webview.html = await buildPreviewHtml(currentPanel.webview, workspaceRoot, indexService, figureIndexCache, doc, getContentWidthIn());
}

function refreshComparePanel(workspaceRoot: string, indexService: DocDefIndexService, figureIndexCache: FigureIndexCache, entry: ComparePanelEntry): void {
	const bodyHtml = renderSectionBody(workspaceRoot, entry.panel.webview, indexService, figureIndexCache, entry.model, entry.targetSection, entry.contentFileUrl);
	entry.panel.webview.html = wrapHtmlShell(entry.panel.webview, workspaceRoot, getContentWidthIn(), bodyHtml);
}

/** Opens one preview pane per model that has content for the given section, side by side, for
 *  visually comparing how each model's version actually renders (e.g. before consolidating them). */
function openCompareAllModels(workspaceRoot: string, indexService: DocDefIndexService, figureIndexCache: FigureIndexCache, item: CustomTreeItem): void {
	if (item.element.kind !== 'merged') {
		return;
	}
	const { node } = item.element;
	const candidates = MODEL_IDS
		.map((model) => ({ model, section: node.perModel.get(model) }))
		.filter((e): e is { model: ModelId; section: DocSection } => !!e.section && e.section.HasContent && !!e.section.ContentFileUrl);

	if (candidates.length < 2) {
		vscode.window.showInformationMessage('Need at least 2 models with content to compare.');
		return;
	}

	// Close any previously-opened compare panels first so repeated use doesn't accumulate stale ones.
	for (const entry of comparePanels) {
		entry.panel.dispose();
	}
	comparePanels = [];

	for (let i = 0; i < candidates.length; i++) {
		const { model, section } = candidates[i];
		const panel = vscode.window.createWebviewPanel(
			'omComparePreview',
			`OM: ${model} — ${node.sectionNumber} ${node.title}`,
			COMPARE_COLUMNS[i] ?? vscode.ViewColumn.Beside,
			{ enableScripts: false, localResourceRoots: [vscode.Uri.file(workspaceRoot)] }
		);
		const entry: ComparePanelEntry = { panel, model, contentFileUrl: section.ContentFileUrl, targetSection: section };
		comparePanels.push(entry);
		refreshComparePanel(workspaceRoot, indexService, figureIndexCache, entry);
		panel.onDidDispose(() => {
			comparePanels = comparePanels.filter((e) => e.panel !== panel);
		});
	}
}

export function registerPreviewCommands(context: vscode.ExtensionContext, workspaceRoot: string, indexService: DocDefIndexService, figureIndexCache: FigureIndexCache): void {
	const openPreview = async (toSide: boolean) => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('Open an HTML fragment first.');
			return;
		}
		currentDocUri = editor.document.uri;
		if (!currentPanel) {
			currentPanel = vscode.window.createWebviewPanel(
				'omPreview',
				'OM Preview',
				toSide ? vscode.ViewColumn.Beside : vscode.ViewColumn.Active,
				{ enableScripts: false, localResourceRoots: [vscode.Uri.file(workspaceRoot)] }
			);
			currentPanel.onDidDispose(() => { currentPanel = undefined; });
		} else {
			currentPanel.reveal(toSide ? vscode.ViewColumn.Beside : undefined);
		}
		await refreshPreview(workspaceRoot, indexService, figureIndexCache);
	};

	context.subscriptions.push(
		vscode.commands.registerCommand('om.showPreview', () => openPreview(false)),
		vscode.commands.registerCommand('om.showPreviewToSide', () => openPreview(true)),
		vscode.commands.registerCommand('om.preview.toggleSingleFragment', async () => {
			singleFragmentMode = !singleFragmentMode;
			vscode.window.showInformationMessage(`OM Preview: ${singleFragmentMode ? 'single-fragment' : 'whole-section'} mode`);
			await refreshPreview(workspaceRoot, indexService, figureIndexCache);
		}),
		vscode.commands.registerCommand('om.compareAllModelsPreview', (item: CustomTreeItem) => {
			openCompareAllModels(workspaceRoot, indexService, figureIndexCache, item);
		}),
		vscode.workspace.onDidChangeTextDocument((e) => {
			if (currentPanel && currentDocUri && e.document.uri.toString() === currentDocUri.toString()) {
				if (debounceTimer) {
					clearTimeout(debounceTimer);
				}
				debounceTimer = setTimeout(() => { void refreshPreview(workspaceRoot, indexService, figureIndexCache); }, 250);
			}

			if (comparePanels.length > 0) {
				const changedUrl = toContentFileUrl(workspaceRoot, e.document.uri.fsPath);
				const affected = comparePanels.filter((entry) => entry.contentFileUrl === changedUrl);
				if (affected.length > 0) {
					if (compareDebounceTimer) {
						clearTimeout(compareDebounceTimer);
					}
					compareDebounceTimer = setTimeout(() => {
						for (const entry of affected) {
							refreshComparePanel(workspaceRoot, indexService, figureIndexCache, entry);
						}
					}, 250);
				}
			}
		}),
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (!currentPanel || !editor || editor.document.languageId !== 'html') {
				return;
			}
			currentDocUri = editor.document.uri;
			void refreshPreview(workspaceRoot, indexService, figureIndexCache);
		})
	);
}
