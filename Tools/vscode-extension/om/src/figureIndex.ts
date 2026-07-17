import * as fs from 'fs';
import * as path from 'path';
import { DocSection, ModelId } from './modelIndex';

/** Walks a top-level section's whole tree in document order, reading each fragment's raw text for
 *  <figure><img></figure> blocks, assigning sequential numbers — mirrors DocSection.NumberFigures'
 *  own traversal (a section's own content first, then its children, in array order). */
function collectFigureNumbers(workspaceRoot: string, topSection: DocSection): Map<string, number> {
	const figs = new Map<string, number>();
	let counter = 0;

	const walk = (section: DocSection): void => {
		if (section.HasContent && section.ContentFileUrl) {
			try {
				const raw = fs.readFileSync(path.join(workspaceRoot, section.ContentFileUrl), 'utf-8');
				const figureRe = /<figure\b[\s\S]*?<\/figure>/gi;
				let m: RegExpExecArray | null;
				while ((m = figureRe.exec(raw))) {
					const imgMatch = /<img\b[^>]*\bsrc="([^"]+)"/i.exec(m[0]);
					if (imgMatch) {
						counter++;
						const basename = path.basename(imgMatch[1]);
						if (!figs.has(basename)) {
							figs.set(basename, counter);
						}
					}
				}
			} catch {
				// Unreadable fragment — skip, matching the real renderer's log-and-continue behavior.
			}
		}
		for (const child of section.Sections ?? []) {
			walk(child);
		}
	};

	walk(topSection);
	return figs;
}

/**
 * Mirrors DocSection.NumberFigures: figure numbers are sequential across an ENTIRE top-level section
 * (e.g. all of "1 Description"), in document order, not just within the fragment being previewed —
 * so resolving a figure fileTarget requires walking every fragment under that top-level section.
 * Cached per (model, topSectionNumber) and invalidated whenever the DocDef index rebuilds, since
 * re-reading every fragment under a whole top-level section on every keystroke would be too slow.
 */
export class FigureIndexCache {
	private cache = new Map<string, Map<string, number>>();

	invalidate(): void {
		this.cache.clear();
	}

	getFigureNumber(workspaceRoot: string, model: ModelId, topSection: DocSection, targetBasename: string): number | undefined {
		const key = `${model}:${topSection.SectionNumber}`;
		let figs = this.cache.get(key);
		if (!figs) {
			figs = collectFigureNumbers(workspaceRoot, topSection);
			this.cache.set(key, figs);
		}
		return figs.get(targetBasename);
	}
}
