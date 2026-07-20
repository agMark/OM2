import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/** Finds the <img src="..."> nearest the cursor by character-offset distance — fragments are small
 *  (per the repo's own convention) so this is reliably correct without needing a full HTML parse. */
function findNearestImageSrc(document: vscode.TextDocument, position: vscode.Position): string | undefined {
	const text = document.getText();
	const offset = document.offsetAt(position);
	const imgRe = /<img\b[^>]*\bsrc="([^"]+)"/gi;
	let best: { src: string; distance: number } | undefined;
	let m: RegExpExecArray | null;
	while ((m = imgRe.exec(text))) {
		const distance = Math.abs(m.index - offset);
		if (!best || distance < best.distance) {
			best = { src: m[1], distance };
		}
	}
	return best?.src;
}

/**
 * Reveals the image nearest the cursor in the OS file explorer (pre-selected) rather than trying to
 * trigger an "Open With" picker programmatically. Two earlier approaches (the undocumented
 * `rundll32 shell32.dll,OpenAs_RunDLL` trick, then a Shell.Application COM `InvokeVerb('openas')`
 * call via a spawned PowerShell process) both worked when run interactively but were confirmed
 * unreliable specifically when launched programmatically/headlessly — neither showed a dialog when
 * spawned from Node, including from inside the real extension itself. Revealing in Explorer instead
 * uses `vscode.commands.executeCommand('revealFileInOS', ...)`, VS Code's own built-in, reliable
 * command; from there, the OS's native right-click "Open with" menu — guaranteed to work since it's
 * the OS's own UI, not anything scripted — lets each author pick whichever installed editor they want.
 */
export async function openImageInExternalEditorCommand(workspaceRoot: string): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showWarningMessage('Open an HTML fragment and place your cursor near an <img> tag first.');
		return;
	}

	const src = findNearestImageSrc(editor.document, editor.selection.active);
	if (!src) {
		vscode.window.showWarningMessage('No <img> tag found in this fragment.');
		return;
	}

	const absPath = path.join(workspaceRoot, src);
	if (!fs.existsSync(absPath)) {
		vscode.window.showErrorMessage(`Image file not found: ${absPath}`);
		return;
	}

	await vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(absPath));
}
