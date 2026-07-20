import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DocDefIndexService, toContentFileUrl } from './modelIndex';
import { FigureIndexCache } from './figureIndex';
import { parseElementStylingCss } from './cssHelper';

interface ImagePickItem extends vscode.QuickPickItem {
	relPath?: string;
}

/** Builds a "basename -> where it's already used" map across whichever model(s) currently reference
 *  the open fragment, since figure image basenames must be unique per model (ResolveXrefs throws
 *  "Multiple figure targets found" otherwise) — reused to warn before inserting a duplicate. */
function findExistingUsage(workspaceRoot: string, indexService: DocDefIndexService, figureIndexCache: FigureIndexCache, currentFragmentUrl: string): Map<string, string> {
	const usedElsewhere = new Map<string, string>();
	const owningModels = new Set(indexService.findByContentFileUrl(currentFragmentUrl).map((e) => e.model));
	for (const model of owningModels) {
		const modelIndex = indexService.models.get(model);
		if (!modelIndex) {
			continue;
		}
		for (const fig of figureIndexCache.getAllFiguresForModel(workspaceRoot, model, modelIndex.docDef)) {
			if (!usedElsewhere.has(fig.basename)) {
				usedElsewhere.set(fig.basename, `${model} Figure ${fig.topSectionNumber}-${fig.figNum}`);
			}
		}
	}
	return usedElsewhere;
}

export async function insertFigureCommand(workspaceRoot: string, indexService: DocDefIndexService, figureIndexCache: FigureIndexCache): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showWarningMessage('Open an HTML fragment and place your cursor where the figure should go.');
		return;
	}

	const currentUrl = toContentFileUrl(workspaceRoot, editor.document.uri.fsPath);
	const usedElsewhere = findExistingUsage(workspaceRoot, indexService, figureIndexCache, currentUrl);

	const imageUris = await vscode.workspace.findFiles(new vscode.RelativePattern(workspaceRoot, 'img/**/*.{png,jpg,jpeg,gif,PNG,JPG,JPEG,GIF}'));
	const items: ImagePickItem[] = imageUris
		.map((uri) => {
			const relPath = toContentFileUrl(workspaceRoot, uri.fsPath);
			const basename = path.basename(relPath);
			const usedNote = usedElsewhere.get(basename);
			return {
				label: basename,
				description: usedNote ? `⚠ already used as ${usedNote}` : undefined,
				relPath
			};
		})
		.sort((a, b) => a.label.localeCompare(b.label));

	const pickedImage = await vscode.window.showQuickPick(items, { placeHolder: 'Pick an image to insert as a figure', matchOnDescription: true });
	if (!pickedImage?.relPath) {
		return;
	}
	const basename = path.basename(pickedImage.relPath);

	if (usedElsewhere.has(basename)) {
		const choice = await vscode.window.showWarningMessage(
			`"${basename}" is already used as ${usedElsewhere.get(basename)}. Figure image filenames must be unique within a model's document — reusing this one will break xref resolution at render time ("Multiple figure targets found"). Insert anyway?`,
			{ modal: true },
			'Insert Anyway'
		);
		if (choice !== 'Insert Anyway') {
			return;
		}
	}

	let imageClasses: { className: string; detail?: string }[] = [];
	try {
		const cssText = fs.readFileSync(path.join(workspaceRoot, 'css', 'elementStyling.css'), 'utf-8');
		imageClasses = parseElementStylingCss(cssText).filter((c) => c.className.startsWith('imageCentered_'));
	} catch {
		// Fall through with an empty list — the class still gets typed literally below.
	}
	const pickedClass = await vscode.window.showQuickPick(
		imageClasses.map((c) => ({ label: c.className, description: c.detail })),
		{ placeHolder: 'Pick an image size class' }
	);
	if (!pickedClass) {
		return;
	}

	const caption = await vscode.window.showInputBox({ prompt: 'Figure caption text', placeHolder: 'e.g. Cockpit - Forward and Panel' });

	const snippet = new vscode.SnippetString();
	snippet.appendText('<figure>\n    <img class="');
	snippet.appendText(pickedClass.label);
	snippet.appendText('" src="img/');
	snippet.appendText(basename);
	snippet.appendText('">\n    <figcaption class="centerText">');
	if (caption) {
		snippet.appendText(caption);
	} else {
		snippet.appendPlaceholder('Caption');
	}
	snippet.appendText('</figcaption>\n</figure>');
	await editor.insertSnippet(snippet);
}
