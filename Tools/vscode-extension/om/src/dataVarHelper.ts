import * as vscode from 'vscode';
import { DocDefIndexService, ModelId, toContentFileUrl } from './modelIndex';

interface DataVarPickItem extends vscode.QuickPickItem {
	varName: string;
}

const TAG_CHOICES = ['span', 'b', 'i', 'p', 'Other...'];

/** Inserts a `<TAG data-vars="X">...</TAG>` element, letting the author pick X from the variables
 *  actually declared in a DocDef's `docVars` (code/data_vars.mjs DocVars) rather than typing the name
 *  blind — a typo or stale name here is exactly what throws "unrecognized or unset variable" at
 *  render time, and now shows up red in the preview too (see previewPanel.ts injectDataVars). */
export async function insertDataVarCommand(workspaceRoot: string, indexService: DocDefIndexService): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showWarningMessage('Open an HTML fragment and place your cursor where the variable should go.');
		return;
	}
	const currentUrl = toContentFileUrl(workspaceRoot, editor.document.uri.fsPath);
	const owningModels = Array.from(new Set(indexService.findByContentFileUrl(currentUrl).map((e) => e.model)));
	// The variable set is fixed by the DocVars class (every model's docVars has the same keys), so any
	// model's key list works for the picker — prefer models that actually own this fragment so the
	// "(unset)" hints reflect models this fragment really renders under.
	const referenceModels: ModelId[] = owningModels.length > 0 ? owningModels : Array.from(indexService.models.keys());

	const varNames = new Set<string>();
	for (const model of referenceModels) {
		const docVars = indexService.models.get(model)?.docVars;
		if (docVars) {
			for (const name of Object.keys(docVars)) {
				varNames.add(name);
			}
		}
	}
	if (varNames.size === 0) {
		vscode.window.showWarningMessage('No data vars found — is any docDefs/DocDef_*.mjs loaded?');
		return;
	}

	const items: DataVarPickItem[] = Array.from(varNames)
		.sort((a, b) => a.localeCompare(b))
		.map((varName) => {
			const valuesByModel = referenceModels
				.map((model) => `${model}: ${indexService.models.get(model)?.docVars[varName] || '(unset)'}`)
				.join('   ');
			return { varName, label: varName, description: valuesByModel };
		});

	const picked = await vscode.window.showQuickPick(items, {
		placeHolder: 'Pick a data var to insert',
		matchOnDescription: true
	});
	if (!picked) {
		return;
	}

	const tagChoice = await vscode.window.showQuickPick(TAG_CHOICES, { placeHolder: 'Element to wrap it in (default: span)' });
	if (!tagChoice) {
		return;
	}
	let tagName = tagChoice;
	if (tagChoice === 'Other...') {
		tagName = (await vscode.window.showInputBox({ prompt: 'HTML tag name', value: 'span' })) ?? '';
		if (!tagName) {
			return;
		}
	}

	const snippet = new vscode.SnippetString();
	snippet.appendText(`<${tagName} data-vars="${picked.varName}">`);
	snippet.appendPlaceholder(picked.varName);
	snippet.appendText(`</${tagName}>`);
	await editor.insertSnippet(snippet);
}
