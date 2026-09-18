# Change Log

All notable changes to the "om" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.3.6]

- Added `OM: Find Where Data Var Is Used...`: right-click a variable (or one of its per-model values) in the "Data Vars" view. Scans `html/**/*.html` for `data-vars="X"` and lists every use as `file:line` with the models whose docDefs reference that fragment (or "not referenced by any docDef"); pick one to jump to it. Reports when a variable isn't used anywhere.
- The index now also refreshes when `code/data_vars.mjs` is saved, so adding a variable to the `DocVars` class shows up in the "Data Vars" view (and the Insert Data Var picker) without a manual refresh.

## [0.3.5]

- Added a "Data Vars" view (activity bar → "My Custom Explorer", between the section tree and Image Sources): lists every docVar from `code/data_vars.mjs` (DOCNUM, SHORTDATE, ...) with a per-model child (`402: 03-0105`, ...). Clicking a model's value opens that model's `docDefs/DocDef_<model>.mjs` at the `docVars.vars.X = "..."` line with the value selected, ready to retype; a var not yet set for a model shows a warning icon and jumps to the `new DocVars()` line instead. Refreshes automatically when a docDef is saved.

## [0.3.4]

- Added `OM: Insert Figure from Clipboard...` (command palette + editor context menu on `.html`): saves the image currently on the clipboard (e.g. a Win+Shift+S capture) into `img/` as a PNG under a name you enter, and inserts the same `<figure>` markup as `OM: Insert Figure...` in one step. Rejects names that already exist in `img/` or are already used as a figure in the model; all prompts run before anything is written, so cancelling leaves `img/` untouched. Windows only (reads the clipboard via PowerShell, since VS Code's clipboard API is text-only).

## [0.3.3]

- Added `OM: Open Manual in Live Server...` (view/title button + command palette): pick a model (402/502/602/802) and a browser (only browsers actually detected on this machine, plus "Default Browser"), and it starts/reuses Live Server and opens the manual — replaces hunting for the right `indexNNN.html` in the Explorer and right-clicking "Open with Live Server".

## [0.3.2]

- Fixed the unnumbered "Intro" block (title page + OVERVIEW/MANUAL DISTRIBUTION/TOC fragments, each model's `docDefs/DocDef_*_0_Intro.mjs`) being silently dropped from the tree — it has no numbered ancestor to attach to, so it never appeared as a root or as a flat child of anything. Now synthesized as a "0 - INTRO" root node.

## [0.2.0]

- Added the Image Source Tracking tool: a new "Image Sources" view (Unlinked / Linked / Unreferenced Source Files) backed by `Tools/imageSourceRegistry.json`, linking `img/*` files to their `imgSrc/*` CAD/source files (many-to-many). Commands: `OM: Link Image to Source File...`, `OM: Open Source in File Explorer`, `OM: Remove Source Link...`, `OM: Link Current Image to Source File...` (from an open fragment), `OM: Refresh Image Sources`.

## [0.1.1] – [0.1.9]

- Fixed a real ESM-caching bug where edits to a `docDefs/*.mjs` section file (e.g. `DocDef_402_2_Maintenance.mjs`) weren't picked up on refresh — the top-level `DocDef_XXX.mjs` re-import was cache-busted but its statically-imported section sub-files weren't; fixed by rewriting import specifiers to fresh cache-busted URLs and evaluating via a `data:` URL.
- Fixed a tree-item bug where a section with both its own content and child subsections (e.g. "1.0") lost its open-file command once it became expandable.
- Fixed the merged section title always picking the first model's title even when that model was just a "Reserved" placeholder and another model had the real content; also broadened divergence detection to flag "Reserved in some models, real content in another" as divergent.
- `<xref>` elements in the preview now render their actual resolved final text (e.g. "Section 1.85", "Figure 1-5") instead of raw tag markup, including real whole-top-level-section figure numbering.
- Added `OM: Compare All Models in Preview` (side-by-side preview panes, one per model).
- Added `OM: Insert Figure...` and `OM: Insert Caution/Warning Box...`, both live-parsed from the CSS.
- The xref file/figure picker now validates against figures actually present in the document (via the same figure index used for numbering) instead of blindly browsing the filesystem.
- Added `OM: Reveal Image in File Explorer (for Open With...)` — after confirming two more "automatically launch the OS Open With dialog" approaches were unreliable when run programmatically, this uses VS Code's built-in `revealFileInOS` instead.
- `Insert Style Class...` now also includes the 5 pagination-control classes from the top of `css/pagedjs.css`.
- Fixed the figure index cache never invalidating on `html/**/*.html` changes (only on `docDefs/*.mjs` changes), so a newly-inserted figure wouldn't show up in the xref picker until an unrelated docDefs edit happened to trigger a refresh.

## [0.1.0]

- Relocated the extension into the `OM2` repo (`Tools/vscode-extension/om/`) so tooling and content live in one place.
- Replaced the manual "Load Custom File" JSON-picker with automatic, live loading of all 4 models directly from `docDefs/DocDef_*.mjs` (dynamic import, file-watcher refresh).
- Tree view now shows section numbers and merges all 4 models into one tree, with divergence markers where models point at different files or a model is missing a section.
- Added `OM: Compare Model Files...` (diff view + similarity-ranked pair picker for 3+-way divergence).
- Added `OM: Insert Style Class...`, parsing `css/elementStyling.css` live.
- Added `OM: Insert Xref...` (section picker + file picker) and the tree's `OM: Insert Xref to This Section`.
- Added the in-editor styled preview (`OM: Show Preview` / `OM: Show Preview to the Side`, `om.preview.contentWidthIn` setting).

## 0.0.1

- Initial release