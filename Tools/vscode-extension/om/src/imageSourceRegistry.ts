import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface ImageSourceEntry {
	sources: string[];
	notes?: string;
}

interface RegistryFile {
	version: number;
	images: Record<string, ImageSourceEntry>;
}

const REGISTRY_RELATIVE_PATH = 'Tools/imageSourceRegistry.json';
const IMAGE_GLOB = 'img/**/*.{png,jpg,jpeg,gif,PNG,JPG,JPEG,GIF}';
const SOURCE_GLOB = 'imgSrc/**/*';

function toRelPath(workspaceRoot: string, absPath: string): string {
	return path.relative(workspaceRoot, absPath).split(path.sep).join('/');
}

/**
 * Persists the img/ <-> imgSrc/ link registry at Tools/imageSourceRegistry.json (workspace-relative,
 * forward-slash keys/paths, many-to-many: an image can list more than one source file). Nothing is
 * auto-populated from filename similarity — links are only ever entered by hand, since matching by
 * name was confirmed unreliable against the real files in this repo (loose correlation for some pairs,
 * none at all for others).
 */
export class ImageSourceRegistry implements vscode.Disposable {
	private data: RegistryFile = { version: 1, images: {} };
	private readonly _onDidChange = new vscode.EventEmitter<void>();
	readonly onDidChange = this._onDidChange.event;
	private _registryWatcher: vscode.FileSystemWatcher | undefined;
	private _filesWatcher: vscode.FileSystemWatcher | undefined;
	private _debounceTimer: ReturnType<typeof setTimeout> | undefined;

	constructor(private readonly workspaceRoot: string) {
		this.load();
	}

	private get registryPath(): string {
		return path.join(this.workspaceRoot, ...REGISTRY_RELATIVE_PATH.split('/'));
	}

	/** Force-reloads from disk and notifies listeners — used by the manual refresh command as a
	 *  fallback in case the file watcher missed an external change. */
	reload(): void {
		this.load();
		this._onDidChange.fire();
	}

	private load(): void {
		try {
			const raw = fs.readFileSync(this.registryPath, 'utf-8');
			const parsed = JSON.parse(raw);
			this.data = { version: parsed.version ?? 1, images: parsed.images ?? {} };
		} catch {
			this.data = { version: 1, images: {} };
		}
	}

	private save(): void {
		fs.mkdirSync(path.dirname(this.registryPath), { recursive: true });
		fs.writeFileSync(this.registryPath, JSON.stringify(this.data, null, 2) + '\n', 'utf-8');
	}

	startWatching(): vscode.Disposable {
		this._registryWatcher = vscode.workspace.createFileSystemWatcher(
			new vscode.RelativePattern(this.workspaceRoot, REGISTRY_RELATIVE_PATH)
		);
		this._filesWatcher = vscode.workspace.createFileSystemWatcher(
			new vscode.RelativePattern(this.workspaceRoot, '{img,imgSrc}/**/*')
		);

		const scheduleRefresh = (reloadFromDisk: boolean) => {
			if (this._debounceTimer) {
				clearTimeout(this._debounceTimer);
			}
			this._debounceTimer = setTimeout(() => {
				if (reloadFromDisk) {
					this.load();
				}
				this._onDidChange.fire();
			}, 300);
		};

		// External edits to the registry itself (e.g. a teammate's change pulled via git) reload it;
		// files appearing/disappearing under img/imgSrc only need the file lists re-walked, not a reload.
		this._registryWatcher.onDidChange(() => scheduleRefresh(true));
		this._registryWatcher.onDidCreate(() => scheduleRefresh(true));
		this._registryWatcher.onDidDelete(() => scheduleRefresh(true));
		this._filesWatcher.onDidCreate(() => scheduleRefresh(false));
		this._filesWatcher.onDidDelete(() => scheduleRefresh(false));

		return vscode.Disposable.from(this._registryWatcher, this._filesWatcher);
	}

	getLinksForImage(relImagePath: string): string[] {
		return this.data.images[relImagePath]?.sources ?? [];
	}

	setLinksForImage(relImagePath: string, sources: string[]): void {
		if (sources.length === 0) {
			delete this.data.images[relImagePath];
		} else {
			this.data.images[relImagePath] = { ...this.data.images[relImagePath], sources };
		}
		this.save();
		this._onDidChange.fire();
	}

	addLink(relImagePath: string, relSourcePath: string): void {
		const existing = this.getLinksForImage(relImagePath);
		if (!existing.includes(relSourcePath)) {
			this.setLinksForImage(relImagePath, [...existing, relSourcePath]);
		}
	}

	removeLink(relImagePath: string, relSourcePath: string): void {
		this.setLinksForImage(relImagePath, this.getLinksForImage(relImagePath).filter((s) => s !== relSourcePath));
	}

	async getAllImages(): Promise<string[]> {
		const uris = await vscode.workspace.findFiles(new vscode.RelativePattern(this.workspaceRoot, IMAGE_GLOB));
		return uris.map((u) => toRelPath(this.workspaceRoot, u.fsPath)).sort();
	}

	async getAllSources(): Promise<string[]> {
		const uris = await vscode.workspace.findFiles(new vscode.RelativePattern(this.workspaceRoot, SOURCE_GLOB));
		return uris.map((u) => toRelPath(this.workspaceRoot, u.fsPath)).sort();
	}

	async getUnlinkedImages(): Promise<string[]> {
		const all = await this.getAllImages();
		return all.filter((img) => this.getLinksForImage(img).length === 0);
	}

	async getLinkedImages(): Promise<string[]> {
		const all = await this.getAllImages();
		return all.filter((img) => this.getLinksForImage(img).length > 0);
	}

	async getUnreferencedSources(): Promise<string[]> {
		const allSources = await this.getAllSources();
		const referenced = new Set<string>();
		for (const entry of Object.values(this.data.images)) {
			for (const s of entry.sources) {
				referenced.add(s);
			}
		}
		return allSources.filter((s) => !referenced.has(s));
	}

	dispose(): void {
		this._registryWatcher?.dispose();
		this._filesWatcher?.dispose();
		this._onDidChange.dispose();
		if (this._debounceTimer) {
			clearTimeout(this._debounceTimer);
		}
	}
}
