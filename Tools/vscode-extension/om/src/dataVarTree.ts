import * as vscode from 'vscode';
import { DocDefIndexService, MODEL_IDS, ModelId } from './modelIndex';

export type DataVarTreeElement =
	| { kind: 'var'; varName: string; valuesByModel: Map<ModelId, string> }
	| { kind: 'value'; varName: string; model: ModelId; value: string };

export class DataVarTreeItem extends vscode.TreeItem {
	constructor(public readonly element: DataVarTreeElement) {
		super('', vscode.TreeItemCollapsibleState.None);

		if (element.kind === 'var') {
			this.label = element.varName;
			this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
			this.contextValue = 'dataVar';
			const distinct = new Set(Array.from(element.valuesByModel.values()));
			this.description = distinct.size === 1 ? Array.from(distinct)[0] || '(unset)' : 'varies by model';
		} else {
			this.label = `${element.model}: ${element.value || '(unset)'}`;
			this.contextValue = 'dataVarValue';
			if (!element.value) {
				this.iconPath = new vscode.ThemeIcon('warning');
			}
			this.tooltip = `Go to ${element.varName} in docDefs/DocDef_${element.model}.mjs`;
			this.command = {
				command: 'om.goToDataVar',
				title: 'Go to Data Var',
				arguments: [element.model, element.varName]
			};
		}
	}
}

/** Lists every DocVars variable (code/data_vars.mjs) with its per-model value; clicking a value jumps to
 *  the `docVars.vars.X = "..."` line in that model's DocDef file. Rebuilt from the live index on every
 *  docDefs change, so edits made via the jump show up as soon as the file is saved. */
export class DataVarTreeDataProvider implements vscode.TreeDataProvider<DataVarTreeItem> {
	private readonly _onDidChangeTreeData = new vscode.EventEmitter<DataVarTreeItem | undefined | null | void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	constructor(private readonly indexService: DocDefIndexService) {
		indexService.onDidChange(() => this._onDidChangeTreeData.fire());
	}

	getTreeItem(element: DataVarTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: DataVarTreeItem): DataVarTreeItem[] {
		if (!element) {
			// The variable set is fixed by the DocVars class, so every model has the same keys — union
			// them anyway so a stray extra assignment in one model's docDef still shows up.
			const names = new Set<string>();
			for (const modelIndex of this.indexService.models.values()) {
				for (const name of Object.keys(modelIndex.docVars)) {
					names.add(name);
				}
			}
			return Array.from(names).sort((a, b) => a.localeCompare(b)).map((varName) => {
				const valuesByModel = new Map<ModelId, string>();
				for (const model of MODEL_IDS) {
					const modelIndex = this.indexService.models.get(model);
					if (modelIndex) {
						valuesByModel.set(model, modelIndex.docVars[varName] ?? '');
					}
				}
				return new DataVarTreeItem({ kind: 'var', varName, valuesByModel });
			});
		}
		if (element.element.kind !== 'var') {
			return [];
		}
		const { varName, valuesByModel } = element.element;
		return Array.from(valuesByModel).map(([model, value]) => new DataVarTreeItem({ kind: 'value', varName, model, value }));
	}
}
