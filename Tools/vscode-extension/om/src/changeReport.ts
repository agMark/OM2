import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFile } from 'child_process';
import { DocDefIndexService, DocSection, ModelId, ModelIndex, compareSectionNumbers } from './modelIndex';

export interface ChangeEntry {
	sectionNumber: string;
	title: string;
	added: boolean;
	removed: boolean;
	/** Title or ContentFileUrl mapping changed in docDefs while the section number stayed the same. */
	structureChanged: boolean;
	contentChanged: boolean;
	figureChanged: boolean;
	draftCommentary: string;
}

export interface FinalizedEntry {
	sectionNumber: string;
	title: string;
	changeType: string;
	commentary: string;
}

export function runGit(cwd: string, args: string[]): Promise<string> {
	return new Promise((resolve, reject) => {
		execFile('git', args, { cwd, maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
			if (err) {
				reject(new Error(stderr || err.message));
				return;
			}
			resolve(stdout);
		});
	});
}

function parseNameStatus(output: string): { status: string; path: string }[] {
	return output.split('\n').filter(Boolean).map((line) => {
		const parts = line.split('\t');
		// Rename/copy lines are "R100\told\tnew" — the new path (last field) is what we care about.
		return { status: parts[0], path: parts[parts.length - 1] };
	});
}

function diffArgs(baselineRef: string, targetRef: string | undefined, pathspec: string): string[] {
	const args = ['diff', '--name-status', baselineRef];
	if (targetRef) {
		args.push(targetRef);
	}
	args.push('--', pathspec);
	return args;
}

interface RefContext {
	modelIndex: ModelIndex | undefined;
	/** Directory containing this ref's docDefs/ and code/ — either the live workspace root (working
	 *  tree) or a temp worktree checkout, for section-declaration lookups (findChapterFileForSection). */
	dirRoot: string;
}

/**
 * Resolves a git ref to one model's section index. `undefined` ref means "the live working tree" —
 * reuses the extension's already-loaded DocDefIndexService, no checkout needed. Any other ref gets a
 * temporary `git worktree` checkout, since DocDefIndexService just needs a directory on disk to import
 * docDefs/*.mjs from and doesn't care which one.
 *
 * The worktree is created under the OS temp directory, never inside this OneDrive-synced repo tree —
 * a bulk file copy inside a OneDrive-synced folder causes noticeable sync slowdown in this environment,
 * so a second full checkout must land outside it. Only docDefs/ and code/ are checked out (via
 * `checkout <ref> -- docDefs code` after a `--no-checkout` worktree add) since that's all
 * DocDefIndexService reads — html/img diffing below never touches checked-out files, only git blobs.
 */
async function withRefModelIndex<T>(
	workspaceRoot: string,
	ref: string | undefined,
	model: ModelId,
	workingTreeIndexService: DocDefIndexService,
	fn: (ctx: RefContext) => Promise<T>
): Promise<T> {
	if (!ref) {
		return fn({ modelIndex: workingTreeIndexService.models.get(model), dirRoot: workspaceRoot });
	}

	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'om-changereport-'));
	const tempIndexService = new DocDefIndexService(tmpDir);
	try {
		await runGit(workspaceRoot, ['worktree', 'add', '--detach', '--no-checkout', tmpDir, ref]);
		await runGit(tmpDir, ['checkout', ref, '--', 'docDefs', 'code']);
		await tempIndexService.refresh();
		return await fn({ modelIndex: tempIndexService.models.get(model), dirRoot: tmpDir });
	} finally {
		tempIndexService.dispose();
		try {
			await runGit(workspaceRoot, ['worktree', 'remove', '--force', tmpDir]);
		} catch {
			// Best-effort cleanup — an orphaned temp worktree under the OS temp dir is harmless and rare.
		}
	}
}

async function readContentAtRef(workspaceRoot: string, ref: string | undefined, contentFileUrl: string): Promise<string | undefined> {
	if (!ref) {
		try {
			return fs.readFileSync(path.join(workspaceRoot, contentFileUrl), 'utf-8');
		} catch {
			return undefined;
		}
	}
	try {
		return await runGit(workspaceRoot, ['show', `${ref}:${contentFileUrl}`]);
	} catch {
		return undefined;
	}
}

/**
 * Maps an image basename to every section whose fragment references it, so a changed file under img/
 * can be traced back to its owning section(s) even when the referencing fragment's own <img src="...">
 * markup didn't change. Adapted from the <img src="..."> scan in figureIndex.ts (used there for figure
 * numbering) — here we just need "which fragment(s) reference this basename", not figure numbers, so
 * any <img>, not only ones inside <figure>, counts.
 */
async function buildImageBasenameMap(workspaceRoot: string, ref: string | undefined, modelIndex: ModelIndex): Promise<Map<string, DocSection[]>> {
	const map = new Map<string, DocSection[]>();
	for (const [contentFileUrl, sections] of modelIndex.byContentFileUrl) {
		const raw = await readContentAtRef(workspaceRoot, ref, contentFileUrl);
		if (!raw) {
			continue;
		}
		const imgRe = /<img\b[^>]*\bsrc="([^"]+)"/gi;
		let m: RegExpExecArray | null;
		while ((m = imgRe.exec(raw))) {
			const basename = path.basename(m[1]);
			const arr = map.get(basename) ?? [];
			arr.push(...sections);
			map.set(basename, arr);
		}
	}
	return map;
}

const SECTION_DECL_RE = /\.i\(\s*(?:true|false)\s*,\s*"([^"]*)"/;

/** Finds which of this model's docDefs chapter files declares a given section number — same regex
 *  scan mergedTree.ts's findSectionSourceLocation uses for "reveal in DocDef source" navigation. Used
 *  to seed draft commentary for structural changes (added/removed/retitled sections), since those
 *  edits happen in docDefs, not in an html fragment. */
function findChapterFileForSection(dirRoot: string, model: ModelId, sectionNumber: string): string | undefined {
	const docDefsDir = path.join(dirRoot, 'docDefs');
	let files: string[];
	try {
		files = fs.readdirSync(docDefsDir).filter((f) => f.startsWith(`DocDef_${model}_`) && f.endsWith('.mjs'));
	} catch {
		return undefined;
	}
	for (const file of files) {
		try {
			const lines = fs.readFileSync(path.join(docDefsDir, file), 'utf-8').split('\n');
			if (lines.some((l) => SECTION_DECL_RE.exec(l)?.[1] === sectionNumber)) {
				return `docDefs/${file}`;
			}
		} catch {
			// Unreadable — skip.
		}
	}
	return undefined;
}

async function computeEntries(
	workspaceRoot: string,
	model: ModelId,
	baselineRef: string,
	targetRef: string | undefined,
	baselineCtx: RefContext,
	targetCtx: RefContext
): Promise<ChangeEntry[]> {
	const entries = new Map<string, ChangeEntry>();
	const ensure = (sectionNumber: string, title: string): ChangeEntry => {
		let e = entries.get(sectionNumber);
		if (!e) {
			e = { sectionNumber, title, added: false, removed: false, structureChanged: false, contentChanged: false, figureChanged: false, draftCommentary: '' };
			entries.set(sectionNumber, e);
		}
		return e;
	};

	if (!targetCtx.modelIndex) {
		return [];
	}
	const baselineIndex = baselineCtx.modelIndex;
	const targetIndex = targetCtx.modelIndex;

	const baselineNumbers = baselineIndex ? new Set(baselineIndex.bySectionNumber.keys()) : new Set<string>();
	const targetNumbers = new Set(targetIndex.bySectionNumber.keys());

	// Structural: added, retitled/remapped (same number, both refs), and removed.
	for (const num of targetNumbers) {
		const targetSection = targetIndex.bySectionNumber.get(num)!;
		if (!baselineNumbers.has(num)) {
			ensure(num, targetSection.SectionTitle).added = true;
			continue;
		}
		const baselineSection = baselineIndex!.bySectionNumber.get(num)!;
		if (targetSection.SectionTitle !== baselineSection.SectionTitle || targetSection.ContentFileUrl !== baselineSection.ContentFileUrl) {
			ensure(num, targetSection.SectionTitle).structureChanged = true;
		}
	}
	for (const num of baselineNumbers) {
		if (!targetNumbers.has(num)) {
			const baselineSection = baselineIndex!.bySectionNumber.get(num)!;
			ensure(num, baselineSection.SectionTitle).removed = true;
		}
	}

	// Content: html fragment text differs.
	const htmlDiff = parseNameStatus(await runGit(workspaceRoot, diffArgs(baselineRef, targetRef, 'html')));
	for (const f of htmlDiff) {
		const sections = targetIndex.byContentFileUrl.get(f.path) ?? baselineIndex?.byContentFileUrl.get(f.path);
		if (!sections) {
			continue;
		}
		for (const s of sections) {
			ensure(s.SectionNumber, s.SectionTitle).contentChanged = true;
		}
	}

	// Figures: an image file differs even though the referencing fragment's markup didn't.
	const imgDiff = parseNameStatus(await runGit(workspaceRoot, diffArgs(baselineRef, targetRef, 'img')));
	if (imgDiff.length > 0) {
		const basenameMap = await buildImageBasenameMap(workspaceRoot, targetRef, targetIndex);
		for (const f of imgDiff) {
			const sections = basenameMap.get(path.basename(f.path));
			if (!sections) {
				continue;
			}
			for (const s of sections) {
				ensure(s.SectionNumber, s.SectionTitle).figureChanged = true;
			}
		}
	}

	// Draft commentary, seeded from commit subjects touching the relevant file.
	for (const entry of entries.values()) {
		let filePath: string | undefined;
		if (entry.contentChanged || entry.figureChanged) {
			filePath = targetIndex.bySectionNumber.get(entry.sectionNumber)?.ContentFileUrl
				|| baselineIndex?.bySectionNumber.get(entry.sectionNumber)?.ContentFileUrl;
		}
		if (!filePath) {
			// Added / removed / retitled-only: the edit happened in docDefs, not in an html fragment.
			const dirRoot = entry.removed ? baselineCtx.dirRoot : targetCtx.dirRoot;
			filePath = findChapterFileForSection(dirRoot, model, entry.sectionNumber);
		}
		if (filePath) {
			try {
				const range = `${baselineRef}..${targetRef ?? 'HEAD'}`;
				const log = await runGit(workspaceRoot, ['log', range, '--pretty=%s', '--', filePath]);
				const subjects = Array.from(new Set(log.split('\n').filter(Boolean)));
				entry.draftCommentary = subjects.join('; ');
			} catch {
				entry.draftCommentary = '';
			}
		}
	}

	return Array.from(entries.values()).sort((a, b) => compareSectionNumbers(a.sectionNumber, b.sectionNumber));
}

/** Builds one model's change report between two git refs. `targetRef: undefined` means the live
 *  working tree (uncommitted + committed local state). Scoped to a single model — see changeReport.ts
 *  module docs / the design plan for why reports are per-model, not merged across the 4 manuals. */
export async function buildChangeReport(
	workspaceRoot: string,
	model: ModelId,
	baselineRef: string,
	targetRef: string | undefined,
	workingTreeIndexService: DocDefIndexService
): Promise<ChangeEntry[]> {
	return withRefModelIndex(workspaceRoot, baselineRef, model, workingTreeIndexService, (baselineCtx) =>
		withRefModelIndex(workspaceRoot, targetRef, model, workingTreeIndexService, (targetCtx) =>
			computeEntries(workspaceRoot, model, baselineRef, targetRef, baselineCtx, targetCtx)
		)
	);
}

export function describeChangeType(e: ChangeEntry): string {
	if (e.added) {
		return 'Section added';
	}
	if (e.removed) {
		return 'Section removed';
	}
	const parts: string[] = [];
	if (e.contentChanged) {
		parts.push('Content');
	}
	if (e.figureChanged) {
		parts.push('figure');
	}
	if (parts.length > 0) {
		return `${parts.join(' and ')} updated`;
	}
	if (e.structureChanged) {
		return 'Section renumbered/retitled';
	}
	return 'Changed';
}

export function renderDraftMarkdown(model: ModelId, entries: ChangeEntry[], baselineRef: string, targetRef: string | undefined): string {
	const targetLabel = targetRef ?? 'working tree';
	let out = `# ${model} Change Report — ${baselineRef} to ${targetLabel}\n\n`;
	if (entries.length === 0) {
		out += '_No changes detected between these refs._\n';
		return out;
	}
	for (const e of entries) {
		out += `## Section ${e.sectionNumber} — ${e.title}\n`;
		out += `**Change type:** ${describeChangeType(e)}\n\n`;
		out += '<!-- commentary: edit below -->\n';
		out += `${e.draftCommentary || '(add commentary here)'}\n\n`;
	}
	return out;
}

/** Reads back the format renderDraftMarkdown wrote, after the user has hand-edited it. */
export function parseFinalizedMarkdown(text: string): FinalizedEntry[] {
	const out: FinalizedEntry[] = [];
	const sectionRe = /^## Section (\S+) — (.*)$/gm;
	const matches = Array.from(text.matchAll(sectionRe));
	for (let i = 0; i < matches.length; i++) {
		const m = matches[i];
		const start = m.index! + m[0].length;
		const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
		const block = text.slice(start, end);
		const changeTypeMatch = /\*\*Change type:\*\* (.*)/.exec(block);
		const commentaryMatch = /<!-- commentary: edit below -->\n([\s\S]*)/.exec(block);
		out.push({
			sectionNumber: m[1],
			title: m[2].trim(),
			changeType: changeTypeMatch ? changeTypeMatch[1].trim() : '',
			commentary: commentaryMatch ? commentaryMatch[1].trim() : ''
		});
	}
	return out;
}
