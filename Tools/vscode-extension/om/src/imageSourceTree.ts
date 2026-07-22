import * as vscode from 'vscode';
import * as path from 'path';
import { ImageSourceRegistry } from './imageSourceRegistry';

export type ImageTreeElement =
	| { kind: 'group'; groupType: 'unlinked' | 'linked' | 'unreferenced'; label: string; count: number }
	| { kind: 'image'; relPath: string; sources: string[] }
	| { kind: 'source'; relPath: string };

export class ImageSourceTreeItem extends vscode.TreeItem {
	constructor(public readonly element: ImageTreeElement, workspaceRoot: string) {
		super('', vscode.TreeItemCollapsibleState.None);

		if (element.kind === 'group') {
			this.label = `${element.label} (${element.count})`;
			this.collapsibleState = element.count > 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None;
			this.contextValue = 'group';
			if (element.groupType === 'unlinked') {
				this.iconPath = new vscode.ThemeIcon('warning');
			}
		} else if (element.kind === 'image') {
			this.label = path.basename(element.relPath);
			this.description = element.sources.length > 0 ? element.sources.map((s) => path.basename(s)).join(', ') : '(unlinked)';
			this.tooltip = element.relPath;
			this.contextValue = element.sources.length > 0 ? 'linkedImage' : 'unlinkedImage';
			this.command = {
				command: 'vscode.open',
				title: 'Open Image',
				arguments: [vscode.Uri.file(path.join(workspaceRoot, element.relPath))]
			};
		} else {
			this.label = path.basename(element.relPath);
			this.description = element.relPath;
			this.contextValue = 'sourceFile';
			this.command = {
				command: 'revealFileInOS',
				title: 'Reveal in File Explorer',
				arguments: [vscode.Uri.file(path.join(workspaceRoot, element.relPath))]
			};
		}
	}
}

export class ImageSourceTreeDataProvider implements vscode.TreeDataProvider<ImageSourceTreeItem> {
	private readonly _onDidChangeTreeData = new vscode.EventEmitter<ImageSourceTreeItem | undefined | null | void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	constructor(private readonly workspaceRoot: string, private readonly registry: ImageSourceRegistry) {
		registry.onDidChange(() => this.refresh());
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: ImageSourceTreeItem): vscode.TreeItem {
		return element;
	}

	async getChildren(element?: ImageSourceTreeItem): Promise<ImageSourceTreeItem[]> {
		if (!element) {
			const [unlinked, linked, unreferenced] = await Promise.all([
				this.registry.getUnlinkedImages(),
				this.registry.getLinkedImages(),
				this.registry.getUnreferencedSources()
			]);
			return [
				new ImageSourceTreeItem({ kind: 'group', groupType: 'unlinked', label: 'Unlinked Images', count: unlinked.length }, this.workspaceRoot),
				new ImageSourceTreeItem({ kind: 'group', groupType: 'linked', label: 'Linked Images', count: linked.length }, this.workspaceRoot),
				new ImageSourceTreeItem({ kind: 'group', groupType: 'unreferenced', label: 'Unreferenced Source Files', count: unreferenced.length }, this.workspaceRoot)
			];
		}

		if (element.element.kind !== 'group') {
			return [];
		}

		if (element.element.groupType === 'unlinked') {
			const imgs = await this.registry.getUnlinkedImages();
			return imgs.map((relPath) => new ImageSourceTreeItem({ kind: 'image', relPath, sources: [] }, this.workspaceRoot));
		}
		if (element.element.groupType === 'linked') {
			const imgs = await this.registry.getLinkedImages();
			return imgs.map((relPath) => new ImageSourceTreeItem({ kind: 'image', relPath, sources: this.registry.getLinksForImage(relPath) }, this.workspaceRoot));
		}
		const sources = await this.registry.getUnreferencedSources();
		return sources.map((relPath) => new ImageSourceTreeItem({ kind: 'source', relPath }, this.workspaceRoot));
	}
}
