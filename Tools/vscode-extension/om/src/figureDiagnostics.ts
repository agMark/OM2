import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DocDefIndexService } from './modelIndex';
import { FigureIndexCache, FigureInfo } from './figureIndex';

/** Converts a character offset into a raw text buffer to a vscode.Position, without needing the
 *  document to be open in an editor (diagnostics must work for files nobody has open yet). */
function offsetToPosition(text: string, offset: number): vscode.Position {
	let line = 0;
	let lastNewline = -1;
	for (let i = 0; i < offset; i++) {
		if (text.charCodeAt(i) === 10 /* \n */) {
			line++;
			lastNewline = i;
		}
	}
	return new vscode.Position(line, offset - lastNewline - 1);
}

/**
 * Recomputes, for every indexed model, which figure image basenames are reused by more than one
 * <figure> in that model's document, and republishes a warning Diagnostic on each offending <img>
 * tag. This is the same check insertFigureCommand (figureHelper.ts) already runs at insert time via
 * findExistingUsage — duplicated here as a standing check because authors regularly hand-type or
 * copy/paste <figure> blocks directly in the HTML fragments instead of using the Insert Figure
 * command, and a duplicate basename only surfaces as a render-time crash ("Multiple figure targets
 * found" in code/DocSection.mjs ResolveXrefs) if some xref later happens to target it by filename.
 */
export function refreshFigureDiagnostics(
	workspaceRoot: string,
	indexService: DocDefIndexService,
	figureIndexCache: FigureIndexCache,
	collection: vscode.DiagnosticCollection
): void {
	// fragmentFile (workspace-relative) -> diagnostics accumulated for it across all models.
	const byFragment = new Map<string, vscode.Diagnostic[]>();
	// Dedupe identical (range, message) pairs that would otherwise repeat once per model sharing the fragment.
	const seen = new Set<string>();

	for (const [model, modelIndex] of indexService.models) {
		const figs = figureIndexCache.getAllFiguresForModel(workspaceRoot, model, modelIndex.docDef);

		const byBasename = new Map<string, FigureInfo[]>();
		for (const fig of figs) {
			const list = byBasename.get(fig.basename) ?? [];
			list.push(fig);
			byBasename.set(fig.basename, list);
		}

		for (const [basename, group] of byBasename) {
			if (group.length < 2) {
				continue;
			}
			for (const fig of group) {
				const others = group.filter((f) => f !== fig);
				const otherDescriptions = others
					.map((o) => `${model} Figure ${o.topSectionNumber}-${o.figNum} in ${o.fragmentFile}`)
					.join('; ');
				const message =
					`"${basename}" is also used by ${otherDescriptions}. Figure image filenames must be unique ` +
					`within a model's document, or an xref targeting this filename will crash rendering ` +
					`("Multiple figure targets found").`;

				const dedupeKey = `${fig.fragmentFile}:${fig.imgStart}:${message}`;
				if (seen.has(dedupeKey)) {
					continue;
				}
				seen.add(dedupeKey);

				const absPath = path.join(workspaceRoot, fig.fragmentFile);
				let raw: string;
				try {
					raw = fs.readFileSync(absPath, 'utf-8');
				} catch {
					continue;
				}
				const range = new vscode.Range(
					offsetToPosition(raw, fig.imgStart),
					offsetToPosition(raw, fig.imgEnd)
				);
				const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Warning);
				diagnostic.source = 'om';
				diagnostic.code = 'duplicate-figure-basename';

				const list = byFragment.get(fig.fragmentFile) ?? [];
				list.push(diagnostic);
				byFragment.set(fig.fragmentFile, list);
			}
		}
	}

	collection.clear();
	for (const [fragmentFile, diagnostics] of byFragment) {
		collection.set(vscode.Uri.file(path.join(workspaceRoot, fragmentFile)), diagnostics);
	}
}
