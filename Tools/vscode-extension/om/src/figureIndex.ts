import * as fs from 'fs';
import * as path from 'path';
import { DocSection, ModelId } from './modelIndex';

export interface FigureInfo {
	basename: string;
	topSectionNumber: string;
	figNum: number;
	caption?: string;
	fragmentFile: string;
}

/** Walks a top-level section's whole tree in document order, reading each fragment's raw text for
 *  <figure><img></figure> blocks, assigning sequential numbers — mirrors DocSection.NumberFigures'
 *  own traversal (a section's own content first, then its children, in array order). */
function collectFiguresForTopSection(workspaceRoot: string, topSection: DocSection): FigureInfo[] {
	const figs: FigureInfo[] = [];
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
						const captionMatch = /<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i.exec(m[0]);
						const caption = captionMatch ? captionMatch[1].replace(/<[^>]+>/g, '').trim() : undefined;
						figs.push({ basename, topSectionNumber: topSection.SectionNumber, figNum: counter, caption, fragmentFile: section.ContentFileUrl });
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
 * Mirrors DocSection.NumberFigures/ResolveXrefs: figure numbers are sequential across an ENTIRE
 * top-level section (e.g. all of "1 Description"), in document order — so resolving a figure
 * fileTarget requires walking every fragment under that top-level section. But the real ResolveXrefs
 * matches a fileTarget's basename against figures gathered across the WHOLE document (all top-level
 * sections concatenated, per RenderDoc.mjs), not just one section — so "does this image actually
 * exist in the document" needs a whole-model search, not a single-section one.
 * Cached per (model, topSectionNumber) and invalidated whenever the DocDef index rebuilds, since
 * re-reading every fragment under a whole top-level section on every keystroke would be too slow.
 */
export class FigureIndexCache {
	private cache = new Map<string, FigureInfo[]>();

	invalidate(): void {
		this.cache.clear();
	}

	private getForTopSection(workspaceRoot: string, model: ModelId, topSection: DocSection): FigureInfo[] {
		const key = `${model}:${topSection.SectionNumber}`;
		let figs = this.cache.get(key);
		if (!figs) {
			figs = collectFiguresForTopSection(workspaceRoot, topSection);
			this.cache.set(key, figs);
		}
		return figs;
	}

	getFigureNumber(workspaceRoot: string, model: ModelId, topSection: DocSection, targetBasename: string): number | undefined {
		return this.getForTopSection(workspaceRoot, model, topSection).find((f) => f.basename === targetBasename)?.figNum;
	}

	/** All figures across an entire model's document (every top-level numbered section), for
	 *  validating/browsing "does this image actually exist in the document" rather than guessing. */
	getAllFiguresForModel(workspaceRoot: string, model: ModelId, docDef: DocSection): FigureInfo[] {
		const all: FigureInfo[] = [];
		for (const topSection of docDef.Sections ?? []) {
			if (topSection.IsNumbered && topSection.SectionNumber) {
				all.push(...this.getForTopSection(workspaceRoot, model, topSection));
			}
		}
		return all;
	}
}
