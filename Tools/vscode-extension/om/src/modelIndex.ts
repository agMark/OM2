import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// Duck-typed against the real code/DocSection.mjs shape.
export interface DocSection {
	IsNumbered: boolean;
	SectionNumber: string;
	DisplayTitle: boolean;
	SectionTitle: string;
	HasContent: boolean;
	ContentFileUrl: string;
	CustomStyle: string;
	CustomClass: string;
	ElementId: string;
	Sections: DocSection[];
}

export const MODEL_IDS = ['402', '502', '602', '802'] as const;
export type ModelId = typeof MODEL_IDS[number];

export interface ModelIndex {
	model: ModelId;
	docDef: DocSection;
	bySectionNumber: Map<string, DocSection>;
	byContentFileUrl: Map<string, DocSection[]>;
}

export interface SectionEntry {
	model: ModelId;
	section: DocSection;
}

/** Numeric, dot-path aware comparison so "1.9" sorts before "1.10". */
export function compareSectionNumbers(a: string, b: string): number {
	const pa = a.split('.').map(Number);
	const pb = b.split('.').map(Number);
	const len = Math.max(pa.length, pb.length);
	for (let i = 0; i < len; i++) {
		const na = pa[i] ?? 0;
		const nb = pb[i] ?? 0;
		if (na !== nb) {
			return na - nb;
		}
	}
	return 0;
}

function walk(section: DocSection, bySectionNumber: Map<string, DocSection>, byContentFileUrl: Map<string, DocSection[]>): void {
	if (section.IsNumbered && section.SectionNumber) {
		bySectionNumber.set(section.SectionNumber, section);
	}
	if (section.HasContent && section.ContentFileUrl) {
		const arr = byContentFileUrl.get(section.ContentFileUrl) ?? [];
		arr.push(section);
		byContentFileUrl.set(section.ContentFileUrl, arr);
	}
	for (const child of section.Sections ?? []) {
		walk(child, bySectionNumber, byContentFileUrl);
	}
}

let cacheBuster = 0;

async function importDocDef(workspaceRoot: string, model: ModelId): Promise<DocSection> {
	const absPath = path.join(workspaceRoot, 'docDefs', `DocDef_${model}.mjs`);
	cacheBuster++;
	// Cache-busting query defeats Node's ESM module cache so edits are picked up on refresh,
	// matching the pattern already proven in Tools/exportDocDefJson.js for loading a DocDef live.
	const url = new URL('file://' + absPath.replace(/\\/g, '/'));
	url.searchParams.set('t', String(cacheBuster));
	const mod: { DocDef: DocSection } = await import(url.href);
	return mod.DocDef;
}

async function loadModel(workspaceRoot: string, model: ModelId): Promise<ModelIndex | undefined> {
	const filePath = path.join(workspaceRoot, 'docDefs', `DocDef_${model}.mjs`);
	if (!fs.existsSync(filePath)) {
		return undefined;
	}
	const docDef = await importDocDef(workspaceRoot, model);
	const bySectionNumber = new Map<string, DocSection>();
	const byContentFileUrl = new Map<string, DocSection[]>();
	walk(docDef, bySectionNumber, byContentFileUrl);
	return { model, docDef, bySectionNumber, byContentFileUrl };
}

/**
 * Loads and indexes all 4 models' DocDef trees directly from docDefs/*.mjs (dynamic import,
 * no JSON intermediate), and keeps the index fresh via a file watcher on docDefs/**\/*.mjs.
 */
export class DocDefIndexService implements vscode.Disposable {
	private _models = new Map<ModelId, ModelIndex>();
	private readonly _onDidChange = new vscode.EventEmitter<void>();
	readonly onDidChange = this._onDidChange.event;
	private _watcher: vscode.FileSystemWatcher | undefined;
	private _debounceTimer: ReturnType<typeof setTimeout> | undefined;

	constructor(private readonly workspaceRoot: string) { }

	get models(): ReadonlyMap<ModelId, ModelIndex> {
		return this._models;
	}

	async refresh(): Promise<void> {
		const results = await Promise.all(
			MODEL_IDS.map(async (m) => [m, await loadModel(this.workspaceRoot, m)] as const)
		);
		this._models.clear();
		for (const [m, idx] of results) {
			if (idx) {
				this._models.set(m, idx);
			}
		}
		this._onDidChange.fire();
	}

	startWatching(): vscode.Disposable {
		this._watcher = vscode.workspace.createFileSystemWatcher(
			new vscode.RelativePattern(this.workspaceRoot, 'docDefs/**/*.mjs')
		);
		const scheduleRefresh = () => {
			if (this._debounceTimer) {
				clearTimeout(this._debounceTimer);
			}
			this._debounceTimer = setTimeout(() => { void this.refresh(); }, 300);
		};
		this._watcher.onDidChange(scheduleRefresh);
		this._watcher.onDidCreate(scheduleRefresh);
		this._watcher.onDidDelete(scheduleRefresh);
		return this._watcher;
	}

	/** All section numbers appearing in any model, numerically sorted. */
	getAllSectionNumbers(): string[] {
		const set = new Set<string>();
		for (const idx of this._models.values()) {
			for (const num of idx.bySectionNumber.keys()) {
				set.add(num);
			}
		}
		return Array.from(set).sort(compareSectionNumbers);
	}

	/** Every model's entry (if any) for a given section number. */
	getEntry(sectionNumber: string): SectionEntry[] {
		const out: SectionEntry[] = [];
		for (const [model, idx] of this._models) {
			const s = idx.bySectionNumber.get(sectionNumber);
			if (s) {
				out.push({ model, section: s });
			}
		}
		return out;
	}

	/** Which models/sections reference this exact ContentFileUrl (a fragment can be reused). */
	findByContentFileUrl(contentFileUrl: string): SectionEntry[] {
		const out: SectionEntry[] = [];
		for (const [model, idx] of this._models) {
			const sections = idx.byContentFileUrl.get(contentFileUrl);
			if (sections) {
				for (const s of sections) {
					out.push({ model, section: s });
				}
			}
		}
		return out;
	}

	dispose(): void {
		this._watcher?.dispose();
		this._onDidChange.dispose();
		if (this._debounceTimer) {
			clearTimeout(this._debounceTimer);
		}
	}
}

/** Converts an absolute fragment path back to the workspace-relative, forward-slash form used as ContentFileUrl. */
export function toContentFileUrl(workspaceRoot: string, absPath: string): string {
	return path.relative(workspaceRoot, absPath).split(path.sep).join('/');
}
