//@ts-check
/**
 * sectionMarkers.mjs
 *
 * The isolate hide/show logic in IsolationManager.mjs needs to find every
 * rendered section wrapper div. DocSection only sets an element `id` when a
 * section IsNumbered (see code/DocSection.mjs AutoSetElementId) -- unnumbered
 * sections like the Intro chapter (docDefs/DocDef_*_0_Intro.mjs: title page,
 * overview, manual distribution) get a wrapper div with no id at all, so a
 * selector like `[id^="Sec_"]` can never find/hide them. That's why the
 * intro kept showing no matter what was isolated.
 *
 * Rather than change DocSection.mjs (shared with the print/Paged.js
 * pipeline), this walks the already-imported DocSection tree and the
 * rendered DOM in lockstep -- RenderContent renders exactly one wrapper
 * <div> per section, in the same order as `section.Sections`, so the last
 * N element children of a section's div are always its N subsections'
 * wrapper divs, however many header/content nodes precede them -- and tags
 * every wrapper (numbered or not) with a data attribute the isolate logic
 * can select on uniformly.
 */
export function markSections(docDef, contentTarget) {
    const rootDiv = contentTarget.firstElementChild;
    if (!rootDiv) return;

    function walk(section, div) {
        if (!div) return;
        div.dataset.omdbSection = "true";
        const n = section.Sections.length;
        if (n === 0) return;
        const children = Array.from(div.children);
        const subDivs = children.slice(children.length - n);
        section.Sections.forEach((sub, i) => walk(sub, subDivs[i]));
    }

    const topDivs = Array.from(rootDiv.children);
    docDef.Sections.forEach((section, i) => walk(section, topDivs[i]));
}
