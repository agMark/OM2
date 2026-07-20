import * as vscode from 'vscode';
import * as path from 'path';
import { DocDefIndexService, compareSectionNumbers, toContentFileUrl } from './modelIndex';
import { FigureIndexCache, FigureInfo } from './figureIndex';

interface SectionPickItem extends vscode.QuickPickItem {
	sectionNumber: string;
}

async function pickSectionTarget(indexService: DocDefIndexService, currentFragmentUrl?: string): Promise<string | undefined> {
	let numbers: string[];
	if (currentFragmentUrl) {
		const owningModels = new Set(indexService.findByContentFileUrl(currentFragmentUrl).map((e) => e.model));
		if (owningModels.size > 0) {
			const scoped = new Set<string>();
			for (const model of owningModels) {
				const idx = indexService.models.get(model);
				if (idx) {
					for (const num of idx.bySectionNumber.keys()) {
						scoped.add(num);
					}
				}
			}
			numbers = Array.from(scoped);
		} else {
			numbers = indexService.getAllSectionNumbers();
		}
	} else {
		numbers = indexService.getAllSectionNumbers();
	}

	const items: SectionPickItem[] = numbers
		.map((num) => {
			const entries = indexService.getEntry(num);
			const title = entries[0]?.section.SectionTitle ?? '(untitled)';
			return { sectionNumber: num, label: `${num} - ${title}`, description: entries.map((e) => e.model).join(', ') };
		})
		.sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));

	const picked = await vscode.window.showQuickPick(items, { placeHolder: 'Search for a section to link to', matchOnDescription: true });
	return picked?.sectionNumber;
}

interface FigurePickItem extends vscode.QuickPickItem {
	basename?: string;
	browse?: boolean;
}

async function browseForFile(workspaceRoot: string): Promise<string | undefined> {
	const defaultUri = vscode.Uri.file(path.join(workspaceRoot, 'html'));
	const picked = await vscode.window.showOpenDialog({
		canSelectMany: false,
		defaultUri,
		openLabel: 'Use as fileTarget',
		filters: { 'HTML and Images': ['html', 'png', 'jpg', 'jpeg', 'gif'], 'All Files': ['*'] }
	});
	if (!picked || picked.length === 0) {
		return undefined;
	}
	// ResolveXrefs matches fileTarget against a basename, so only the filename is needed.
	return path.basename(picked[0].fsPath);
}

/** Picks a fileTarget scoped to figures ACTUALLY present in the document (validated via FigureIndexCache,
 *  scoped to whichever model(s) currently reference the open fragment) rather than blindly browsing the
 *  filesystem with no check that the picked image is embedded anywhere. Falls back to a raw file browse
 *  for edge cases (e.g. linking to a whole fragment file, or a figure this extension couldn't find). */
async function pickFileTarget(workspaceRoot: string, indexService: DocDefIndexService, figureIndexCache: FigureIndexCache, currentFragmentUrl?: string): Promise<string | undefined> {
	const figures: FigureInfo[] = [];
	const seen = new Set<string>();
	if (currentFragmentUrl) {
		const owningModels = new Set(indexService.findByContentFileUrl(currentFragmentUrl).map((e) => e.model));
		for (const model of owningModels) {
			const modelIndex = indexService.models.get(model);
			if (!modelIndex) {
				continue;
			}
			for (const fig of figureIndexCache.getAllFiguresForModel(workspaceRoot, model, modelIndex.docDef)) {
				if (!seen.has(fig.basename)) {
					seen.add(fig.basename);
					figures.push(fig);
				}
			}
		}
	}

	const items: FigurePickItem[] = figures
		.sort((a, b) => compareSectionNumbers(a.topSectionNumber, b.topSectionNumber) || a.figNum - b.figNum)
		.map((f) => ({
			label: `Figure ${f.topSectionNumber}-${f.figNum}`,
			description: f.caption ?? f.basename,
			detail: f.basename,
			basename: f.basename
		}));
	items.push({ label: '$(folder-opened) Browse for a file instead...', browse: true });

	const picked = await vscode.window.showQuickPick(items, {
		placeHolder: figures.length > 0 ? 'Pick an existing figure in this document' : 'No figures found in this document yet — browse for a file',
		matchOnDescription: true,
		matchOnDetail: true
	});
	if (!picked) {
		return undefined;
	}
	if (picked.browse) {
		return browseForFile(workspaceRoot);
	}
	return picked.basename;
}

export async function insertXrefCommand(workspaceRoot: string, indexService: DocDefIndexService, figureIndexCache: FigureIndexCache): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showWarningMessage('Open an HTML fragment and place your cursor where the xref should go.');
		return;
	}
	const currentUrl = toContentFileUrl(workspaceRoot, editor.document.uri.fsPath);

	const mode = await vscode.window.showQuickPick(
		[
			{ label: 'Link to a Section', value: 'section' as const },
			{ label: 'Link to a File/Figure', value: 'file' as const }
		],
		{ placeHolder: 'What should this xref link to?' }
	);
	if (!mode) {
		return;
	}

	let sectionTarget: string | undefined;
	let fileTarget: string | undefined;

	if (mode.value === 'section') {
		sectionTarget = await pickSectionTarget(indexService, currentUrl);
		if (!sectionTarget) {
			return;
		}
	} else {
		fileTarget = await pickFileTarget(workspaceRoot, indexService, figureIndexCache, currentUrl);
		if (!fileTarget) {
			return;
		}
	}

	const xrefType = await vscode.window.showQuickPick(['link', 'text'], { placeHolder: 'xrefType (default: link)' }) ?? 'link';
	const prependLabel = await vscode.window.showInputBox({ prompt: 'prependLabel (optional, e.g. "Section" or "Figure")', placeHolder: '' });

	await insertXrefSnippet(editor, { sectionTarget, fileTarget, xrefType, prependLabel });
}

/** Also used by the tree view's "Insert xref to this section" context action. */
export async function insertXrefForSection(editor: vscode.TextEditor, sectionNumber: string): Promise<void> {
	const xrefType = await vscode.window.showQuickPick(['link', 'text'], { placeHolder: 'xrefType (default: link)' }) ?? 'link';
	const prependLabel = await vscode.window.showInputBox({ prompt: 'prependLabel (optional, e.g. "Section")', value: 'Section' });
	await insertXrefSnippet(editor, { sectionTarget: sectionNumber, xrefType, prependLabel });
}

interface XrefFields {
	sectionTarget?: string;
	fileTarget?: string;
	xrefType: string;
	prependLabel?: string;
}

/** Uses the SnippetString builder API (not raw string concatenation) so free-text fields like
 *  prependLabel can't break the snippet syntax if they happen to contain "$" or "}". */
async function insertXrefSnippet(editor: vscode.TextEditor, fields: XrefFields): Promise<void> {
	const attrs: [string, string][] = [];
	if (fields.fileTarget) {
		attrs.push(['fileTarget', fields.fileTarget]);
	}
	if (fields.sectionTarget) {
		attrs.push(['sectionTarget', fields.sectionTarget]);
	}
	attrs.push(['xrefType', fields.xrefType]);
	if (fields.prependLabel) {
		attrs.push(['prependLabel', fields.prependLabel]);
	}

	const snippet = new vscode.SnippetString();
	snippet.appendText('<xref ');
	attrs.forEach(([name, value], i) => {
		snippet.appendText(`${name}="`);
		snippet.appendText(value);
		snippet.appendText('"');
		if (i < attrs.length - 1) {
			snippet.appendText(' ');
		}
	});
	snippet.appendText('>');
	snippet.appendPlaceholder('ref');
	snippet.appendText('</xref>');
	await editor.insertSnippet(snippet);
}
