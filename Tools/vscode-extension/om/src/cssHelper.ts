import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface CssClassInfo {
	className: string;
	category: string;
	detail?: string;
}

interface Banner {
	text: string;
	index: number;
}

/** Banner comments are whole-line comments (e.g. /*STANDARD IMAGE FORMATTING*\/) the CSS already
 *  uses to section itself; dash-only divider lines and inline trailing comments are excluded. */
function extractBanners(css: string): Banner[] {
	const banners: Banner[] = [];
	const lines = css.split('\n');
	let offset = 0;
	for (const line of lines) {
		const trimmed = line.trim();
		const m = /^\/\*(.*)\*\/$/.exec(trimmed);
		if (m) {
			const text = m[1].trim();
			if (text && !/^-+$/.test(text)) {
				banners.push({ text, index: offset });
			}
		}
		offset += line.length + 1;
	}
	return banners;
}

function stripCommentsPreserveOffsets(css: string): string {
	return css.replace(/\/\*[\s\S]*?\*\//g, (match) => ' '.repeat(match.length));
}

interface RawClassRule {
	className: string;
	index: number;
	body: string;
}

function extractClassRules(strippedCss: string): RawClassRule[] {
	const rules: RawClassRule[] = [];
	const ruleRe = /\.([A-Za-z0-9_-]+)\s*\{([^}]*)\}/g;
	let m: RegExpExecArray | null;
	while ((m = ruleRe.exec(strippedCss))) {
		rules.push({ className: m[1], index: m.index, body: m[2] });
	}
	return rules;
}

/** Parses css/elementStyling.css live so the picker never goes stale against Readme.md. */
export function parseElementStylingCss(cssText: string): CssClassInfo[] {
	const banners = extractBanners(cssText);
	const stripped = stripCommentsPreserveOffsets(cssText);
	const rules = extractClassRules(stripped);

	const seen = new Set<string>();
	const infos: CssClassInfo[] = [];
	for (const rule of rules) {
		if (seen.has(rule.className)) {
			continue;
		}
		seen.add(rule.className);

		let category = 'General';
		for (const b of banners) {
			if (b.index < rule.index) {
				category = b.text;
			} else {
				break;
			}
		}

		let detail: string | undefined;
		const widthMatch = /width:\s*([0-9.]+)(in|em|%)/.exec(rule.body);
		const heightMatch = /height:\s*([0-9.]+)(in|em|%)/.exec(rule.body);
		if (widthMatch && heightMatch) {
			detail = `${widthMatch[1]}${widthMatch[2]} × ${heightMatch[1]}${heightMatch[2]}`;
		} else if (widthMatch) {
			detail = `width: ${widthMatch[1]}${widthMatch[2]}`;
		}

		infos.push({ className: rule.className, category, detail });
	}
	return infos;
}

// Pagination-control utility classes from the top of css/pagedjs.css. Deliberately a fixed whitelist
// rather than parsing the whole file like parseElementStylingCss does for elementStyling.css: most of
// pagedjs.css is renderer-internal machinery (running headers, page counters, per-top-level-section
// page assignment) that authors should never manually apply to arbitrary content, so a generic parse
// would clutter the picker with things that don't belong in it.
const PAGE_BREAK_CLASS_NAMES = ['breakBeforeRight', 'breakBefore', 'dontBreakBefore', 'breakAfter', 'dontBreakAfter'];

function collectPageBreakClasses(pagedJsCssText: string): CssClassInfo[] {
	const infos: CssClassInfo[] = [];
	for (const name of PAGE_BREAK_CLASS_NAMES) {
		const re = new RegExp(`\\.${name}\\s*\\{([^}]*)\\}`);
		const m = re.exec(pagedJsCssText);
		if (m) {
			const detail = m[1].replace(/\s+/g, ' ').trim();
			infos.push({ className: name, category: 'PAGE BREAK CONTROL (pagedjs.css)', detail });
		}
	}
	return infos;
}

/** Finds the opening tag (e.g. <img ...>) enclosing the given position, skipping closing tags. */
function findEnclosingTagRange(document: vscode.TextDocument, position: vscode.Position): vscode.Range | undefined {
	const offset = document.offsetAt(position);
	const text = document.getText();
	let ltIndex = text.lastIndexOf('<', offset);
	while (ltIndex !== -1) {
		const gtIndex = text.indexOf('>', ltIndex);
		if (gtIndex === -1) {
			return undefined;
		}
		if (gtIndex >= offset) {
			if (text[ltIndex + 1] === '/') {
				ltIndex = ltIndex > 0 ? text.lastIndexOf('<', ltIndex - 1) : -1;
				continue;
			}
			return new vscode.Range(document.positionAt(ltIndex), document.positionAt(gtIndex + 1));
		}
		ltIndex = ltIndex > 0 ? text.lastIndexOf('<', ltIndex - 1) : -1;
	}
	return undefined;
}

export async function insertStyleClassCommand(workspaceRoot: string): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showWarningMessage('Open an HTML fragment and place your cursor inside an element first.');
		return;
	}

	const cssPath = path.join(workspaceRoot, 'css', 'elementStyling.css');
	let cssText: string;
	try {
		cssText = fs.readFileSync(cssPath, 'utf-8');
	} catch {
		vscode.window.showErrorMessage(`Could not read ${cssPath}`);
		return;
	}
	const classes = parseElementStylingCss(cssText);

	const pagedJsCssPath = path.join(workspaceRoot, 'css', 'pagedjs.css');
	try {
		const pagedJsCssText = fs.readFileSync(pagedJsCssPath, 'utf-8');
		classes.push(...collectPageBreakClasses(pagedJsCssText));
	} catch {
		// css/pagedjs.css missing shouldn't block the elementStyling.css classes from still working.
	}

	const items: (vscode.QuickPickItem & { className?: string })[] = [];
	let lastCategory: string | undefined;
	for (const c of classes) {
		if (c.category !== lastCategory) {
			items.push({ label: c.category, kind: vscode.QuickPickItemKind.Separator });
			lastCategory = c.category;
		}
		items.push({ label: c.className, description: c.detail, className: c.className });
	}

	const picked = await vscode.window.showQuickPick(items, { placeHolder: 'Select a CSS class to apply' });
	if (!picked || !picked.className) {
		return;
	}
	const pickedClassName = picked.className;

	const tagRange = findEnclosingTagRange(editor.document, editor.selection.active);
	if (!tagRange) {
		vscode.window.showWarningMessage('Place your cursor inside an element\'s opening tag, e.g. <img ...>, then run this command.');
		return;
	}
	const tagText = editor.document.getText(tagRange);
	const classAttrMatch = /class\s*=\s*"([^"]*)"/.exec(tagText);

	if (classAttrMatch) {
		const existing = classAttrMatch[1].trim();
		let newValue: string;
		if (!existing) {
			newValue = pickedClassName;
		} else if (existing.split(/\s+/).includes(pickedClassName)) {
			vscode.window.showInformationMessage(`Element already has class "${pickedClassName}".`);
			return;
		} else {
			const choice = await vscode.window.showQuickPick(
				[
					{ label: 'Add to existing classes', value: 'add' as const },
					{ label: 'Replace existing classes', value: 'replace' as const }
				],
				{ placeHolder: `Element already has class="${existing}"` }
			);
			if (!choice) {
				return;
			}
			newValue = choice.value === 'add' ? `${existing} ${pickedClassName}` : pickedClassName;
		}
		const newTagText = tagText.replace(/class\s*=\s*"([^"]*)"/, `class="${newValue}"`);
		await editor.edit((editBuilder) => editBuilder.replace(tagRange, newTagText));
	} else {
		const nameMatch = /^<([A-Za-z][A-Za-z0-9-]*)/.exec(tagText);
		if (nameMatch) {
			const insertOffset = editor.document.offsetAt(tagRange.start) + nameMatch[0].length;
			const insertPos = editor.document.positionAt(insertOffset);
			await editor.edit((editBuilder) => editBuilder.insert(insertPos, ` class="${pickedClassName}"`));
		}
	}
}
