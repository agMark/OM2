# Change Log

All notable changes to the "om" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

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