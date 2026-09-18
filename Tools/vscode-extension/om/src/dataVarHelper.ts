import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
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

function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Jumps to where a data var's value is assigned in a model's `docDefs/DocDef_<model>.mjs`
 * (`docVars.vars.NAME = "value";`) and selects the value literal so it can be retyped directly. Like
 * revealInDocDef (mergedTree.ts), this is a textual scan — the imported `docVars` object carries no
 * source-location info. A var that exists in the DocVars class but was never assigned for this model
 * has no line to find, so it falls back to the `new DocVars()` declaration where the assignment belongs.
 */
export async function goToDataVarCommand(workspaceRoot: string, model: ModelId, varName: string): Promise<void> {
	const filePath = path.join(workspaceRoot, 'docDefs', `DocDef_${model}.mjs`);
	let lines: string[];
	try {
		lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/);
	} catch {
		vscode.window.showWarningMessage(`OM: could not read docDefs/DocDef_${model}.mjs.`);
		return;
	}

	const assignment = new RegExp(String.raw`^\s*docVars\.vars\.${escapeRegExp(varName)}\s*=\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')`);
	const declaration = /\bnew\s+DocVars\s*\(/;
	let target: vscode.Range | undefined;
	let declarationLine: number | undefined;
	for (let i = 0; i < lines.length && !target; i++) {
		const m = assignment.exec(lines[i]);
		if (m) {
			const start = m[0].length - m[1].length;
			target = new vscode.Range(i, start, i, m[0].length);
		} else if (declarationLine === undefined && declaration.test(lines[i])) {
			declarationLine = i;
		}
	}
	if (!target) {
		if (declarationLine === undefined) {
			vscode.window.showWarningMessage(`OM: could not find "${varName}" in docDefs/DocDef_${model}.mjs.`);
			return;
		}
		target = new vscode.Range(declarationLine, 0, declarationLine, 0);
		vscode.window.showInformationMessage(`OM: ${varName} is not set in DocDef_${model}.mjs — add "docVars.vars.${varName} = ..." below the "new DocVars()" line.`);
	}

	const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
	const editor = await vscode.window.showTextDocument(doc);
	editor.selection = new vscode.Selection(target.start, target.end);
	editor.revealRange(target, vscode.TextEditorRevealType.InCenter);
}
