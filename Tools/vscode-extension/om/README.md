# om README

Navigation, cross-model comparison, and authoring helpers for the Air Tractor Owner's Manual repo (`OM2`).

## Features

- **Unified navigation tree** (activity bar → "My Custom Explorer" → "My Tree View"): all 4 models (402/502/602/802) are loaded automatically by dynamically importing `docDefs/DocDef_*.mjs` directly — no manual JSON export step. The tree is keyed by section number and refreshes automatically when a `docDefs/**/*.mjs` file changes, or on demand via the refresh icon in the view title.
- **Cross-model divergence markers**: sections where models point at different underlying fragment files (or where a model is missing a section entirely) show a warning icon and expand into one leaf per model. Right-click a divergent section → **OM: Compare Model Files...** to open a diff view between two models' files (with a similarity score to help prioritize which pairs are worth reviewing first).
- **Insert Xref...** (editor context menu on `.html` fragments): build a `<xref>` tag by picking a `sectionTarget` from the live section index, or a `fileTarget` via a native file picker — no more hand-typing section numbers or file paths.
- **Insert Style Class...** (editor context menu on `.html` fragments): browse and apply the actual CSS classes defined in `css/elementStyling.css` (image sizes, caution/warning boxes, tables, etc.), parsed live from the CSS file itself so it never drifts out of sync with `Readme.md`.
- **In-editor styled preview** (`$(open-preview)` icon in the editor title bar): shows the fragment you're editing — with its section heading and ancestor context — styled with `css/elementStyling.css`, updating as you type. This is a fast, approximate companion for iterative editing; it does not paginate or fully resolve xrefs. For a full-fidelity, publish-ready render (real pagination, xref resolution, figure numbering), keep using Live Server against the real `index*.html`/`web802.html` entry points.

## Requirements

Must be opened with the `OM2` repo (or a folder containing `docDefs/`, `html/`, `css/` in the same layout) as the workspace folder.

## Possible follow-ups

- One-click "rewire this model to the shared file" command once the compare/review workflow above has been used for a while and is trusted (today it's detect + diff only — the actual `docDefs/*.mjs` edit and file deletion stay manual).
- Filtering the style-class picker by the tag under the cursor (e.g. only image classes for `<img>`).

## Release Notes

### 0.1.0

Added the unified multi-model tree with divergence markers, the compare-files command, the style-class and xref insertion helpers, and the in-editor styled preview. Retired the manual "Load Custom File" JSON-picker workflow.

### 0.0.1

Initial release — single-model tree view loaded from a manually-exported JSON file.

**Enjoy!**
