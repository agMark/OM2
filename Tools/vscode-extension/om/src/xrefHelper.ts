import * as vscode from 'vscode';
import * as path from 'path';
import { DocDefIndexService, toContentFileUrl } from './modelIndex';

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

async function pickFileTarget(workspaceRoot: string): Promise<string | undefined> {
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

export async function insertXrefCommand(workspaceRoot: string, indexService: DocDefIndexService): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showWarningMessage('Open an HTML fragment and place your cursor where the xref should go.');
		return;
	}

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
		const currentUrl = toContentFileUrl(workspaceRoot, editor.document.uri.fsPath);
		sectionTarget = await pickSectionTarget(indexService, currentUrl);
		if (!sectionTarget) {
			return;
		}
	} else {
		fileTarget = await pickFileTarget(workspaceRoot);
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

async function insertXrefSnippet(editor: vscode.TextEditor, fields: XrefFields): Promise<void> {
	const attrs: string[] = [];
	if (fields.fileTarget) {
		attrs.push(`fileTarget="${fields.fileTarget}"`);
	}
	if (fields.sectionTarget) {
		attrs.push(`sectionTarget="${fields.sectionTarget}"`);
	}
	attrs.push(`xrefType="${fields.xrefType}"`);
	if (fields.prependLabel) {
		attrs.push(`prependLabel="${fields.prependLabel}"`);
	}

	const snippet = new vscode.SnippetString('<xref ' + attrs.join(' ') + '>${1:ref}</xref>');
	await editor.insertSnippet(snippet);
}
