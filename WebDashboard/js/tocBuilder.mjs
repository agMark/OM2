//@ts-check
/**
 * tocBuilder.mjs
 *
 * A dashboard-only replacement for DocSection.CreateWebToc (code/DocSection.mjs).
 * That method only attaches an isolate button to sections that have
 * subsections -- leaf sections (most of the actual manual content) render as
 * a plain link with no way to isolate just that one section. Since this
 * dashboard is CreateWebToc's only remaining consumer (the print/Paged.js
 * pipeline uses a different method, CreateToc), it's safer to give it its
 * own TOC builder here than to change shared rendering code -- every
 * numbered section gets a working isolate button, leaf or not.
 *
 * This also intentionally does NOT use native <details>/<summary> (which the
 * old version did): a summary's default click behavior both toggles
 * open/closed AND fires for clicks on anything nested inside it, including
 * the section link -- so intercepting the link click to navigate instead
 * (see toc-nav.js) also cancels the fold/unfold, and there's no visual cue
 * that a row even has children. Instead each row gets its own explicit caret
 * button (fold/unfold only) separate from the link (navigate only).
 *
 * Built directly from the DocSection tree (no fetch/content needed), so it
 * can run synchronously as soon as a model is chosen, before manual content
 * has even loaded.
 */
import { toggleIsolate } from "./IsolationManager.mjs";

function buildNode(section, parentUl) {
    if (!section.IsNumbered || !section.DisplayTitle) {
        // Matches DocSection.CreateWebToc's own gate; not expected to occur
        // for real content today, but recurse instead of silently dropping
        // the subtree if it ever does.
        section.Sections.forEach((s) => buildNode(s, parentUl));
        return;
    }

    const hasChildren = section.Sections.length > 0;
    const li = document.createElement("li");

    const row = document.createElement("div");
    row.className = "omdb-toc-row";

    let childUl = null;
    if (hasChildren) {
        const caret = document.createElement("button");
        caret.type = "button";
        caret.className = "omdb-toc-caret";
        caret.setAttribute("aria-expanded", "false");
        caret.setAttribute("aria-label", "Expand " + section.SectionTitle);
        row.appendChild(caret);

        childUl = document.createElement("ul");
        childUl.className = "omdb-toc-children";
        childUl.hidden = true;

        caret.addEventListener("click", () => {
            const expanded = caret.getAttribute("aria-expanded") === "true";
            caret.setAttribute("aria-expanded", String(!expanded));
            childUl.hidden = expanded;
        });
    } else {
        const spacer = document.createElement("span");
        spacer.className = "omdb-toc-caret-spacer";
        row.appendChild(spacer);
    }

    const a = document.createElement("a");
    a.href = "#" + section.ElementId;
    a.textContent = section.SectionNumber + " - " + section.SectionTitle;
    row.appendChild(a);

    const isolateBtn = document.createElement("span");
    isolateBtn.innerHTML = " ⊝";
    isolateBtn.className = "isolate-btn";
    isolateBtn.title = "Isolate this section";
    isolateBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleIsolate(section.ElementId, isolateBtn);
    });
    row.appendChild(isolateBtn);

    li.appendChild(row);
    if (childUl) {
        section.Sections.forEach((s) => buildNode(s, childUl));
        li.appendChild(childUl);
    }
    parentUl.appendChild(li);
}

/**
 * @param {*} docDef top-level DocDef for a model
 * @param {HTMLElement} targetUl the <ul> to fill
 */
export function buildToc(docDef, targetUl) {
    targetUl.innerHTML = "";
    docDef.Sections.forEach((s) => buildNode(s, targetUl));
}

/**
 * Expands every ancestor branch of the TOC entry for `elementId` so it's
 * actually visible, and optionally scrolls the TOC to show it. Used after
 * navigating to a section (e.g. from search) whose entry may be folded away.
 * @param {HTMLElement} tocRoot the <ul id="webToc"> element
 * @param {string} elementId
 */
export function revealInToc(tocRoot, elementId) {
    const link = tocRoot.querySelector(`a[href="#${elementId}"]`);
    if (!link) return;
    let node = link.parentElement;
    while (node && node !== tocRoot) {
        if (node.tagName === "UL" && node.classList.contains("omdb-toc-children")) {
            node.hidden = false;
            const li = node.parentElement;
            const caret = li && li.querySelector(":scope > .omdb-toc-row > .omdb-toc-caret");
            if (caret) caret.setAttribute("aria-expanded", "true");
        }
        node = node.parentElement;
    }
    link.scrollIntoView({ behavior: "smooth", block: "center" });
}
