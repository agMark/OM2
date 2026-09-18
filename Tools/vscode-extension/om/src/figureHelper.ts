import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DocDefIndexService, toContentFileUrl } from './modelIndex';
import { FigureIndexCache } from './figureIndex';
import { parseElementStylingCss } from './cssHelper';
import { readClipboardImageToTemp, disposeClipboardImage } from './clipboardImage';

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
				usedElsewhere.set(fig.basename, `${model} Figure ${fig.topSectionNumber}-${fig.figNum} in ${fig.fragmentFile}`);
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

	const options = await promptFigureOptions(workspaceRoot);
	if (!options) {
		return;
	}
	await editor.insertSnippet(buildFigureSnippet(basename, options));
}

interface FigureOptions {
	className: string;
	caption?: string;
}

/** Asks for the image size class and caption — the part of the flow shared by every way of inserting
 *  a figure. Returns undefined if the user cancelled at the size-class step. */
async function promptFigureOptions(workspaceRoot: string): Promise<FigureOptions | undefined> {
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
		return undefined;
	}

	const caption = await vscode.window.showInputBox({ prompt: 'Figure caption text', placeHolder: 'e.g. Cockpit - Forward and Panel' });
	return { className: pickedClass.label, caption };
}

function buildFigureSnippet(basename: string, options: FigureOptions): vscode.SnippetString {
	const snippet = new vscode.SnippetString();
	snippet.appendText('<figure>\n    <img class="');
	snippet.appendText(options.className);
	snippet.appendText('" src="img/');
	snippet.appendText(basename);
	snippet.appendText('">\n    <figcaption class="centerText">');
	if (options.caption) {
		snippet.appendText(options.caption);
	} else {
		snippet.appendPlaceholder('Caption');
	}
	snippet.appendText('</figcaption>\n</figure>');
	return snippet;
}

const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/;

/**
 * Like insertFigureCommand, but the image comes from the system clipboard instead of an existing file
 * in img/: the clipboard image is saved into img/ as a PNG under a name you choose, and the figure
 * markup pointing at it is inserted at the cursor in one step. All prompts happen before anything is
 * written, so cancelling at any point leaves img/ untouched.
 */
export async function insertFigureFromClipboardCommand(workspaceRoot: string, indexService: DocDefIndexService, figureIndexCache: FigureIndexCache): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showWarningMessage('Open an HTML fragment and place your cursor where the figure should go.');
		return;
	}

	// Read the clipboard first so "nothing to paste" fails fast, before any prompts.
	const clip = await readClipboardImageToTemp();
	if (clip.error) {
		vscode.window.showErrorMessage(`OM: could not read the clipboard image: ${clip.error}`);
		return;
	}
	if (!clip.tempFile) {
		vscode.window.showWarningMessage('OM: the clipboard does not contain an image. Copy or capture one first (e.g. Win+Shift+S), then run this again.');
		return;
	}
	const tempFile = clip.tempFile;

	try {
		const imgDir = path.join(workspaceRoot, 'img');
		const currentUrl = toContentFileUrl(workspaceRoot, editor.document.uri.fsPath);
		const usedElsewhere = findExistingUsage(workspaceRoot, indexService, figureIndexCache, currentUrl);
		// Windows filenames are case-insensitive, so compare lowercased to catch "Fig.png" vs "fig.png".
		const existingLower = new Set(fs.existsSync(imgDir) ? fs.readdirSync(imgDir).map((f) => f.toLowerCase()) : []);

		const enteredName = await vscode.window.showInputBox({
			prompt: 'File name for the pasted image (saved in img/ as PNG; ".png" is added for you)',
			placeHolder: 'e.g. img_502_AileronBellcrank',
			validateInput: (value) => {
				const name = value.trim().replace(/\.png$/i, '');
				if (!name) {
					return 'Enter a file name.';
				}
				if (INVALID_FILENAME_CHARS.test(name) || name.startsWith('.') || name.endsWith('.')) {
					return 'File name cannot contain \\ / : * ? " < > | or start/end with a dot.';
				}
				const candidate = `${name}.png`;
				if (existingLower.has(candidate.toLowerCase())) {
					return `img/${candidate} already exists — pick a different name.`;
				}
				const usedNote = usedElsewhere.get(candidate);
				if (usedNote) {
					return `"${candidate}" is already used as ${usedNote} — figure filenames must be unique within a model.`;
				}
				return undefined;
			}
		});
		if (!enteredName) {
			return;
		}
		const basename = `${enteredName.trim().replace(/\.png$/i, '')}.png`;

		const options = await promptFigureOptions(workspaceRoot);
		if (!options) {
			return;
		}

		fs.mkdirSync(imgDir, { recursive: true });
		fs.copyFileSync(tempFile, path.join(imgDir, basename), fs.constants.COPYFILE_EXCL);
		await editor.insertSnippet(buildFigureSnippet(basename, options));
		vscode.window.setStatusBarMessage(`OM: saved img/${basename} and inserted figure`, 3000);
	} finally {
		disposeClipboardImage(tempFile);
	}
}
