import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { parseElementStylingCss } from './cssHelper';

interface BoxClassInfo {
	family: string;
	size: string;
	detail?: string;
}

/** Finds box wrapper classes like boxCautionSmall/boxWarningMedium (not their *Header/*Text siblings),
 *  grouped by family (Caution, Warning, ...) and size (Small/Medium/Large) — live-parsed from
 *  css/elementStyling.css so a newly added family or size is picked up automatically. */
function collectBoxFamilies(cssText: string): BoxClassInfo[] {
	const classes = parseElementStylingCss(cssText);
	const boxes: BoxClassInfo[] = [];
	const re = /^box([A-Za-z]+?)(Small|Medium|Large)$/;
	for (const c of classes) {
		const m = re.exec(c.className);
		if (m) {
			boxes.push({ family: m[1], size: m[2], detail: c.detail });
		}
	}
	return boxes;
}

export async function insertBoxCommand(workspaceRoot: string): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showWarningMessage('Open an HTML fragment and place your cursor where the box should go.');
		return;
	}

	let cssText: string;
	try {
		cssText = fs.readFileSync(path.join(workspaceRoot, 'css', 'elementStyling.css'), 'utf-8');
	} catch {
		vscode.window.showErrorMessage('Could not read css/elementStyling.css');
		return;
	}
	const boxes = collectBoxFamilies(cssText);
	if (boxes.length === 0) {
		vscode.window.showWarningMessage('No box classes (e.g. boxCautionSmall) found in css/elementStyling.css.');
		return;
	}

	const families = Array.from(new Set(boxes.map((b) => b.family)));
	const pickedFamily = await vscode.window.showQuickPick(families, { placeHolder: 'Box type' });
	if (!pickedFamily) {
		return;
	}

	const sizeItems = boxes
		.filter((b) => b.family === pickedFamily)
		.map((b) => ({ label: b.size, description: b.detail }));
	const pickedSize = await vscode.window.showQuickPick(sizeItems, { placeHolder: 'Box size' });
	if (!pickedSize) {
		return;
	}

	const defaultHeader = pickedFamily.toUpperCase();
	const headerText = (await vscode.window.showInputBox({ prompt: 'Header text', value: defaultHeader })) ?? defaultHeader;
	const bodyText = await vscode.window.showInputBox({ prompt: 'Box text', placeHolder: "e.g. Do not exceed the placard airspeed." });

	const baseClass = `box${pickedFamily}${pickedSize.label}`;
	const snippet = new vscode.SnippetString();
	snippet.appendText(`<div class="${baseClass}">\n    <p class="${baseClass}Header">`);
	snippet.appendText(headerText);
	snippet.appendText(`</p>\n    <p class="${baseClass}Text">`);
	if (bodyText) {
		snippet.appendText(bodyText);
	} else {
		snippet.appendPlaceholder('Text');
	}
	snippet.appendText('</p>\n</div>');
	await editor.insertSnippet(snippet);
}
