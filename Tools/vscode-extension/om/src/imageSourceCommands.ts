import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ImageSourceRegistry } from './imageSourceRegistry';
import { ImageSourceTreeItem } from './imageSourceTree';
import { findNearestImageSrc } from './imageHelper';

interface PickItem extends vscode.QuickPickItem {
	relPath: string;
}

async function pickSources(registry: ImageSourceRegistry, alreadyLinked: string[]): Promise<string[] | undefined> {
	const allSources = await registry.getAllSources();
	const items: (PickItem & { picked?: boolean })[] = allSources.map((s) => ({
		label: path.basename(s),
		description: s,
		picked: alreadyLinked.includes(s),
		relPath: s
	}));
	const picked = await vscode.window.showQuickPick(items, {
		canPickMany: true,
		placeHolder: 'Select source file(s) for this image'
	});
	return picked?.map((p) => p.relPath);
}

async function pickImage(registry: ImageSourceRegistry): Promise<string | undefined> {
	const allImages = await registry.getAllImages();
	const items: PickItem[] = allImages.map((img) => ({ label: path.basename(img), description: img, relPath: img }));
	const picked = await vscode.window.showQuickPick(items, { placeHolder: 'Select an image to link' });
	return picked?.relPath;
}

/** Context menu on an image node (prompts for source(s)), on a source node (prompts for an image),
 *  or invoked standalone with no selection (Command Palette — prompts for the image first). */
export async function linkImageToSourceCommand(registry: ImageSourceRegistry, item?: ImageSourceTreeItem): Promise<void> {
	if (item && item.element.kind === 'image') {
		const selected = await pickSources(registry, item.element.sources);
		if (selected) {
			registry.setLinksForImage(item.element.relPath, selected);
		}
		return;
	}
	if (item && item.element.kind === 'source') {
		const imagePath = await pickImage(registry);
		if (imagePath) {
			registry.addLink(imagePath, item.element.relPath);
		}
		return;
	}
	const imagePath = await pickImage(registry);
	if (!imagePath) {
		return;
	}
	const selected = await pickSources(registry, registry.getLinksForImage(imagePath));
	if (selected) {
		registry.setLinksForImage(imagePath, selected);
	}
}

export async function openImageSourceCommand(workspaceRoot: string, item: ImageSourceTreeItem): Promise<void> {
	if (item.element.kind !== 'image') {
		return;
	}
	const sources = item.element.sources;
	if (sources.length === 0) {
		vscode.window.showInformationMessage('This image has no linked source file yet.');
		return;
	}
	let target = sources[0];
	if (sources.length > 1) {
		const picked = await vscode.window.showQuickPick(
			sources.map((s): PickItem => ({ label: path.basename(s), description: s, relPath: s })),
			{ placeHolder: 'Which source file?' }
		);
		if (!picked) {
			return;
		}
		target = picked.relPath;
	}
	await vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(path.join(workspaceRoot, target)));
}

export async function removeImageSourceLinkCommand(registry: ImageSourceRegistry, item: ImageSourceTreeItem): Promise<void> {
	if (item.element.kind !== 'image') {
		return;
	}
	const sources = item.element.sources;
	if (sources.length === 0) {
		return;
	}
	let target = sources[0];
	if (sources.length > 1) {
		const picked = await vscode.window.showQuickPick(
			sources.map((s): PickItem => ({ label: path.basename(s), description: s, relPath: s })),
			{ placeHolder: 'Remove which source link?' }
		);
		if (!picked) {
			return;
		}
		target = picked.relPath;
	}
	registry.removeLink(item.element.relPath, target);
}

/** Links the <img> nearest the cursor in the currently-edited fragment, reusing the same
 *  nearest-image-tag lookup already built for the reveal-in-Explorer command. */
export async function linkCurrentImageToSourceCommand(workspaceRoot: string, registry: ImageSourceRegistry): Promise<void> {
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
	if (!fs.existsSync(path.join(workspaceRoot, src))) {
		vscode.window.showErrorMessage(`Image file not found: ${src}`);
		return;
	}
	const selected = await pickSources(registry, registry.getLinksForImage(src));
	if (selected) {
		registry.setLinksForImage(src, selected);
	}
}
