import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DocDefIndexService, DocSection, toContentFileUrl } from './modelIndex';

let currentPanel: vscode.WebviewPanel | undefined;
let currentDocUri: vscode.Uri | undefined;
let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let singleFragmentMode = false;

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

/** Visually flags <xref> resolution status using the already-built section index; fileTarget xrefs
 *  (which may point at a figure) aren't verified since that needs a figure index this extension doesn't build. */
function flagXrefs(html: string, indexService: DocDefIndexService): string {
	return html
		.replace(/<xref\b([^>]*)>/gi, (match, attrsStr: string) => {
			const sectionTargetMatch = /sectionTarget="([^"]*)"/.exec(attrsStr);
			const fileTargetMatch = /fileTarget="([^"]*)"/.exec(attrsStr);
			if (sectionTargetMatch) {
				const num = sectionTargetMatch[1];
				const entries = indexService.getEntry(num);
				if (entries.length > 0) {
					return `<span class="om-xref-ok" title="→ ${escapeHtml(num)} - ${escapeHtml(entries[0].section.SectionTitle)}">${match}`;
				}
				return `<span class="om-xref-bad" title="Unresolved sectionTarget: ${escapeHtml(num)}">${match}`;
			}
			if (fileTargetMatch) {
				return `<span class="om-xref-unknown" title="fileTarget not verified in preview">${match}`;
			}
			return match;
		})
		.replace(/<\/xref>/gi, '</xref></span>');
}

function renderLeaf(leaf: DocSection, workspaceRoot: string, webview: vscode.Webview, indexService: DocDefIndexService, currentUrl: string, skipHeading: boolean): string {
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
			const rendered = flagXrefs(rewriteImageSrcs(raw, webview, workspaceRoot), indexService);
			out += `<div class="${isCurrent ? 'om-current-fragment' : ''}">${rendered}</div>`;
		} catch {
			out += `<p class="om-preview-note">Could not read ${escapeHtml(leaf.ContentFileUrl)}</p>`;
		}
	}
	return out;
}

async function buildPreviewHtml(webview: vscode.Webview, workspaceRoot: string, indexService: DocDefIndexService, doc: vscode.TextDocument, contentWidthIn: number): Promise<string> {
	const cssUri = webview.asWebviewUri(vscode.Uri.file(path.join(workspaceRoot, 'css', 'elementStyling.css')));
	const currentUrl = toContentFileUrl(workspaceRoot, doc.uri.fsPath);
	const rawFragmentText = doc.getText();

	let bodyHtml: string;

	if (singleFragmentMode) {
		bodyHtml = flagXrefs(rewriteImageSrcs(rawFragmentText, webview, workspaceRoot), indexService);
	} else {
		const entries = indexService.findByContentFileUrl(currentUrl);
		if (entries.length === 0) {
			bodyHtml = '<p class="om-preview-note">This fragment isn\'t referenced by any model\'s DocDef yet — showing raw content.</p>'
				+ flagXrefs(rewriteImageSrcs(rawFragmentText, webview, workspaceRoot), indexService);
		} else {
			const { model, section: target } = entries[0];
			const modelIndex = indexService.models.get(model);
			const ancestry = modelIndex ? findAncestryPath(modelIndex.docDef, target) : undefined;
			const numberedPath = (ancestry ?? []).filter((s) => s.IsNumbered && s.SectionNumber);
			const sectionForContext = numberedPath.length > 0 ? numberedPath[numberedPath.length - 1] : target;
			const breadcrumb = numberedPath.slice(0, -1);

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
				html += renderLeaf(sectionForContext, workspaceRoot, webview, indexService, currentUrl, true);
			} else {
				for (const child of sectionForContext.Sections ?? []) {
					if (child.HasContent) {
						html += renderLeaf(child, workspaceRoot, webview, indexService, currentUrl, false);
					}
				}
			}
			bodyHtml = html;
		}
	}

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
  .om-xref-ok { border-bottom: 1px dashed green; }
  .om-xref-bad { border-bottom: 1px dashed red; }
  .om-xref-unknown { border-bottom: 1px dotted #999; }
</style>
</head>
<body>
<div class="om-preview-page">
${bodyHtml}
</div>
</body>
</html>`;
}

async function refreshPreview(workspaceRoot: string, indexService: DocDefIndexService): Promise<void> {
	if (!currentPanel || !currentDocUri) {
		return;
	}
	const doc = await vscode.workspace.openTextDocument(currentDocUri);
	const config = vscode.workspace.getConfiguration('om.preview');
	const contentWidthIn = config.get<number>('contentWidthIn', 6.5);
	currentPanel.webview.html = await buildPreviewHtml(currentPanel.webview, workspaceRoot, indexService, doc, contentWidthIn);
}

export function registerPreviewCommands(context: vscode.ExtensionContext, workspaceRoot: string, indexService: DocDefIndexService): void {
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
		await refreshPreview(workspaceRoot, indexService);
	};

	context.subscriptions.push(
		vscode.commands.registerCommand('om.showPreview', () => openPreview(false)),
		vscode.commands.registerCommand('om.showPreviewToSide', () => openPreview(true)),
		vscode.commands.registerCommand('om.preview.toggleSingleFragment', async () => {
			singleFragmentMode = !singleFragmentMode;
			vscode.window.showInformationMessage(`OM Preview: ${singleFragmentMode ? 'single-fragment' : 'whole-section'} mode`);
			await refreshPreview(workspaceRoot, indexService);
		}),
		vscode.workspace.onDidChangeTextDocument((e) => {
			if (!currentPanel || !currentDocUri || e.document.uri.toString() !== currentDocUri.toString()) {
				return;
			}
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
			debounceTimer = setTimeout(() => { void refreshPreview(workspaceRoot, indexService); }, 250);
		}),
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (!currentPanel || !editor || editor.document.languageId !== 'html') {
				return;
			}
			currentDocUri = editor.document.uri;
			void refreshPreview(workspaceRoot, indexService);
		})
	);
}
