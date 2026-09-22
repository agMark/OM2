//@ts-check
/**
 * manualIndex.mjs
 *
 * Builds a lightweight index of every model's manual sections directly from
 * the authored docDefs -- no separate generated/duplicated data to go stale.
 * Importing a top-level DocDef_XXX.mjs is synchronous and side-effect free
 * (it just builds the DocSection tree in memory); it does NOT fetch any
 * html/*.html content, so this is cheap enough to run on every page load.
 *
 * This file intentionally only reads from docDefs/ -- it never writes to it,
 * keeping the authors' manual-editing files untouched.
 */

import { DocDef as DocDef402 } from "../docDefs/DocDef_402.mjs";
import { DocDef as DocDef502 } from "../docDefs/DocDef_502.mjs";
import { DocDef as DocDef602 } from "../docDefs/DocDef_602.mjs";
import { DocDef as DocDef802 } from "../docDefs/DocDef_802.mjs";

export const MODELS = [
    { id: "402", label: "AT-402/402A", docDef: DocDef402, docDefPath: "docDefs/DocDef_402.mjs" },
    { id: "502", label: "AT-502/502A/502B", docDef: DocDef502, docDefPath: "docDefs/DocDef_502.mjs" },
    { id: "602", label: "AT-602", docDef: DocDef602, docDefPath: "docDefs/DocDef_602.mjs" },
    { id: "802", label: "AT-802/802A", docDef: DocDef802, docDefPath: "docDefs/DocDef_802.mjs" },
];

function collect(section, modelId, out) {
    if (section.IsNumbered && section.DisplayTitle) {
        out.push({
            modelId,
            number: section.SectionNumber,
            title: section.SectionTitle,
            elementId: section.ElementId,
            depth: (section.SectionNumber.match(/\./g) || []).length,
        });
    }
    section.Sections.forEach((s) => collect(s, modelId, out));
}

let _cache = null;

/**
 * Flat list of {modelId, number, title, elementId, depth} across all models.
 */
export function buildSectionIndex() {
    if (_cache) return _cache;
    const rows = [];
    MODELS.forEach((m) => collect(m.docDef, m.id, rows));
    _cache = rows;
    return rows;
}

/**
 * Simple case-insensitive search over section numbers + titles.
 * @param {string} query
 * @param {number} limit
 */
export function searchSections(query, limit = 20) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const rows = buildSectionIndex();
    const results = [];
    for (const row of rows) {
        if (row.title.toLowerCase().includes(q) || row.number.toLowerCase().includes(q)) {
            results.push(row);
            if (results.length >= limit) break;
        }
    }
    return results;
}

/**
 * Find a section (by number) within a specific model's DocDef tree, walking
 * live so callers get the actual DocSection object (with GetContent/RenderContent).
 * @param {string} modelId
 * @param {string} sectionNumber
 */
export function findSection(modelId, sectionNumber) {
    const model = MODELS.find((m) => m.id === modelId);
    if (!model) return null;

    function walk(section) {
        if (section.SectionNumber === sectionNumber) return section;
        for (const s of section.Sections) {
            const found = walk(s);
            if (found) return found;
        }
        return null;
    }
    return walk(model.docDef);
}

/**
 * Chapters are the direct children of a model's top-level DocDef
 * (0 Intro, 1 Description, 2 Maintenance, 3 Inspections, 4 Lubrication,
 * 5 Repairs, 6 Airworthiness Limitations) -- used to populate pickers.
 */
export function getChapters(modelId) {
    const model = MODELS.find((m) => m.id === modelId);
    if (!model) return [];
    return model.docDef.Sections.map((s) => ({
        number: s.SectionNumber,
        title: s.SectionTitle,
    }));
}
