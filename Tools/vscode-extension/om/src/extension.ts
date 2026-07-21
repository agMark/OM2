import * as vscode from 'vscode';
import * as path from 'path';
import { DocDefIndexService } from './modelIndex';
import { MergedTreeDataProvider, CustomTreeItem, compareModelFiles } from './mergedTree';
import { insertStyleClassCommand } from './cssHelper';
import { insertXrefCommand, insertXrefForSection } from './xrefHelper';
import { insertFigureCommand } from './figureHelper';
import { insertBoxCommand } from './boxHelper';
import { openImageInExternalEditorCommand } from './imageHelper';
import { registerPreviewCommands } from './previewPanel';
import { FigureIndexCache } from './figureIndex';

export function activate(context: vscode.ExtensionContext): void {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	if (!workspaceFolder) {
		vscode.window.showWarningMessage('OM: open the OM2 repo folder to use this extension.');
		return;
	}
	const workspaceRoot = workspaceFolder.uri.fsPath;

	const indexService = new DocDefIndexService(workspaceRoot);
	context.subscriptions.push(indexService);
	context.subscriptions.push(indexService.startWatching());

	// Shared across the preview, the xref figure picker, and the insert-figure command, so all
	// three see the same cached figure data and invalidate together on a single index refresh.
	const figureIndexCache = new FigureIndexCache();
	context.subscriptions.push(indexService.onDidChange(() => figureIndexCache.invalidate()));

	const treeDataProvider = new MergedTreeDataProvider(indexService);
	context.subscriptions.push(vscode.window.registerTreeDataProvider('myTreeView', treeDataProvider));

	void indexService.refresh();

	// Opens a fragment file given its ContentFileUrl (workspace-relative path) — unchanged from before relocation.
	context.subscriptions.push(
		vscode.commands.registerCommand('myExtension.openFile', (filePath: string) => {
			if (!filePath) {
				vscode.window.showWarningMessage('No file path was provided.');
				return;
			}
			const fullPath = path.join(workspaceRoot, filePath);
			const fileUri = vscode.Uri.file(fullPath);
			vscode.workspace.openTextDocument(fileUri).then(
				(doc) => vscode.window.showTextDocument(doc),
				(error) => vscode.window.showErrorMessage(`Could not open file: ${error.message}`)
			);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('om.refresh', async () => {
			await indexService.refresh();
			vscode.window.setStatusBarMessage('OM: index refreshed', 2000);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('om.compareModelFiles', async (item: CustomTreeItem) => {
			await compareModelFiles(workspaceRoot, item);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('om.insertStyleClass', async () => {
			await insertStyleClassCommand(workspaceRoot);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('om.insertXref', async () => {
			await insertXrefCommand(workspaceRoot, indexService, figureIndexCache);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('om.insertFigure', async () => {
			await insertFigureCommand(workspaceRoot, indexService, figureIndexCache);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('om.insertBox', async () => {
			await insertBoxCommand(workspaceRoot);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('om.openImageInExternalEditor', async () => {
			await openImageInExternalEditorCommand(workspaceRoot);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('om.insertXrefForSection', async (item: CustomTreeItem) => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showWarningMessage('Open the fragment you want to insert the xref into first.');
				return;
			}
			if (item.element.kind !== 'merged') {
				return;
			}
			await insertXrefForSection(editor, item.element.node.sectionNumber);
		})
	);

	registerPreviewCommands(context, workspaceRoot, indexService, figureIndexCache);
}

export function deactivate(): void { }
