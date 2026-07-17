# Change Log

All notable changes to the "om" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

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