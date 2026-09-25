/**
 * toc-nav.js
 *
 * Pages that render manual content (viewer.html, compare.html) set
 * <base href="../"> so relative fetch()/href resolution inside the existing
 * RenderDoc.mjs/DocSection.mjs pipeline still finds docDefs/, html/, css/,
 * img/ at the project root even though this page itself lives one folder
 * deeper (WebDashboard/).
 *
 * That <base> tag has a side effect: plain in-page anchors like
 * href="#Sec_3_1" (used throughout the TOC and cross-references) would
 * otherwise resolve against the base directory instead of this page and
 * trigger a real navigation/reload instead of a same-page scroll. This
 * module intercepts those clicks and does the scroll manually.
 *
 * (Rendered manual content is always plain <div>s, never <details>, so
 * there's nothing to expand on the content side. tocBuilder.mjs's
 * revealInToc() handles expanding folded TOC branches separately, for the
 * cases -- e.g. jumping in from a search result -- where the target's own
 * TOC entry might be hidden inside a collapsed branch.)
 */
export function installFragmentNav(root = document) {
    root.addEventListener(
        "click",
        (e) => {
            const a = e.target.closest('a[href^="#"]');
            if (!a) return;
            const id = a.getAttribute("href").slice(1);
            if (!id) return;
            const target = document.getElementById(id);
            if (!target) return;

            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        },
        true
    );
}
