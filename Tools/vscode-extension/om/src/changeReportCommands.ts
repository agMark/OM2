import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DocDefIndexService, MODEL_IDS, ModelId } from './modelIndex';
import { buildChangeReport, parseFinalizedMarkdown, renderDraftMarkdown, runGit } from './changeReport';

const WORKING_TREE = '__OM_WORKING_TREE__';
const WORKING_TREE_LABEL = 'Working tree (current)';

function todayDateStamp(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function sanitizeRefForFilename(ref: string): string {
	return ref.replace(/[^a-zA-Z0-9._-]/g, '-');
}

function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function tagReleaseBaselineCommand(workspaceRoot: string): Promise<void> {
	const picks = await vscode.window.showQuickPick(
		MODEL_IDS.map((m) => ({ label: m, picked: true })),
		{ canPickMany: true, placeHolder: 'Which model(s) does this release cover?' }
	);
	if (!picks || picks.length === 0) {
		return;
	}

	const dateStamp = todayDateStamp();
	const tagNames: string[] = [];
	for (const p of picks) {
		const name = await vscode.window.showInputBox({
			prompt: `Tag name for ${p.label}`,
			value: `${p.label}-rev-${dateStamp}`
		});
		if (name) {
			tagNames.push(name);
		}
	}
	if (tagNames.length === 0) {
		return;
	}

	for (const name of tagNames) {
		try {
			await runGit(workspaceRoot, ['tag', name]);
		} catch (err) {
			vscode.window.showErrorMessage(`OM: failed to create tag "${name}": ${(err as Error).message}`);
			return;
		}
	}
	vscode.window.setStatusBarMessage(`OM: created tag(s) ${tagNames.join(', ')}`, 3000);
}

/** Prompts for a git ref via QuickPick, populated from `git tag`. Returns the WORKING_TREE sentinel
 *  when the user picks the live-workspace option (only offered when allowWorkingTree is set), a real
 *  ref string, or undefined if the user cancelled. */
async function pickRef(workspaceRoot: string, placeHolder: string, allowWorkingTree: boolean): Promise<string | undefined> {
	let tags: string[] = [];
	try {
		tags = (await runGit(workspaceRoot, ['tag', '--list'])).split('\n').filter(Boolean).sort().reverse();
	} catch {
		// No tags yet — proceed with an empty list.
	}

	const items: vscode.QuickPickItem[] = [];
	if (allowWorkingTree) {
		items.push({ label: WORKING_TREE_LABEL, description: 'uncommitted + committed local state' });
	}
	items.push({ label: 'Enter ref manually…' });
	for (const t of tags) {
		items.push({ label: t });
	}

	const pick = await vscode.window.showQuickPick(items, { placeHolder });
	if (!pick) {
		return undefined;
	}
	if (pick.label === WORKING_TREE_LABEL) {
		return WORKING_TREE;
	}
	if (pick.label === 'Enter ref manually…') {
		return vscode.window.showInputBox({ prompt: 'Git ref (tag, branch, or commit SHA)' });
	}
	return pick.label;
}

async function generateChangeReportCommand(workspaceRoot: string, indexService: DocDefIndexService): Promise<void> {
	const baselinePick = await pickRef(workspaceRoot, 'Baseline ref (the previously released revision)', false);
	if (!baselinePick) {
		return;
	}
	const targetPick = await pickRef(workspaceRoot, 'Target ref (the new revision to report on)', true);
	if (!targetPick) {
		return;
	}
	const targetRef = targetPick === WORKING_TREE ? undefined : targetPick;

	const modelPicks = await vscode.window.showQuickPick(
		MODEL_IDS.map((m) => ({ label: m, picked: true })),
		{ canPickMany: true, placeHolder: 'Which model(s) to generate a report for?' }
	);
	if (!modelPicks || modelPicks.length === 0) {
		return;
	}

	await vscode.window.withProgress(
		{ location: vscode.ProgressLocation.Notification, title: 'OM: generating change report(s)…' },
		async () => {
			const baselineLabel = sanitizeRefForFilename(baselinePick);
			const targetLabel = sanitizeRefForFilename(targetRef ?? 'working-tree');

			for (const { label: model } of modelPicks as { label: ModelId }[]) {
				try {
					const entries = await buildChangeReport(workspaceRoot, model, baselinePick, targetRef, indexService);
					const md = renderDraftMarkdown(model, entries, baselinePick, targetRef);
					const dir = path.join(workspaceRoot, 'changeReports', model);
					fs.mkdirSync(dir, { recursive: true });
					const filePath = path.join(dir, `changeReport_${model}_${baselineLabel}_to_${targetLabel}.md`);
					fs.writeFileSync(filePath, md, 'utf-8');
					const doc = await vscode.workspace.openTextDocument(filePath);
					await vscode.window.showTextDocument(doc, { preview: false });
				} catch (err) {
					vscode.window.showErrorMessage(`OM: failed to generate change report for ${model}: ${(err as Error).message}`);
				}
			}
		}
	);
}

function renderExportHtml(title: string, entries: ReturnType<typeof parseFinalizedMarkdown>, workspaceRoot: string): string {
	let css = '';
	try {
		css = fs.readFileSync(path.join(workspaceRoot, 'css', 'elementStyling.css'), 'utf-8');
	} catch {
		// Stylesheet not found — export with just the base styling below.
	}
	const body = entries.map((e) => `
<h2>Section ${escapeHtml(e.sectionNumber)} — ${escapeHtml(e.title)}</h2>
<p><em>${escapeHtml(e.changeType)}</em></p>
<p>${escapeHtml(e.commentary).replace(/\n/g, '<br>')}</p>
`).join('\n');

	return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)}</title>
<style>
${css}
body { font-family: Calibri, Arial, sans-serif; max-width: 7.5in; margin: 1in auto; }
h1 { margin-bottom: 0.25em; }
h2 { margin-top: 1.5em; border-bottom: 1px solid #ccc; padding-bottom: 0.2em; }
p em { color: #555; }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
${body}
</body>
</html>`;
}

async function exportChangeReportCommand(workspaceRoot: string): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor || !path.basename(editor.document.fileName).startsWith('changeReport_')) {
		vscode.window.showWarningMessage('OM: open a changeReport_*.md draft first.');
		return;
	}
	await editor.document.save();

	const text = editor.document.getText();
	const entries = parseFinalizedMarkdown(text);
	if (entries.length === 0) {
		vscode.window.showWarningMessage('OM: no "## Section ..." entries found in this draft.');
		return;
	}

	const titleMatch = /^# (.*)$/m.exec(text);
	const html = renderExportHtml(titleMatch ? titleMatch[1] : 'Change Report', entries, workspaceRoot);
	const htmlPath = editor.document.fileName.replace(/\.md$/, '.html');
	fs.writeFileSync(htmlPath, html, 'utf-8');
	await vscode.env.openExternal(vscode.Uri.file(htmlPath));
}

export function registerChangeReportCommands(context: vscode.ExtensionContext, workspaceRoot: string, indexService: DocDefIndexService): void {
	context.subscriptions.push(
		vscode.commands.registerCommand('om.tagReleaseBaseline', async () => {
			await tagReleaseBaselineCommand(workspaceRoot);
		}),
		vscode.commands.registerCommand('om.generateChangeReport', async () => {
			await generateChangeReportCommand(workspaceRoot, indexService);
		}),
		vscode.commands.registerCommand('om.exportChangeReport', async () => {
			await exportChangeReportCommand(workspaceRoot);
		})
	);
}
