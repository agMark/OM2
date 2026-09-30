
# Owner's Manual Environment

The Repository is for editing the Air Tractor Owner's Manuals in html/xml format.

Please contact Mark for access to modify the files in this repository.



## What is this anyways?

Historically, these documents have been written and maintained in normal word processors like MSWord and WordPerfect.

These documents are getting too large and need to be better organized which makes maintenance with MSWord, very difficult or impossible.

Organizing all the content into HTML files allows for easier editing of individual sections.

The document is compiled from the HTML files into a single page that is then rendered for print using the Paged.js javscript library.

DocDef.js is the javascript script that links and orders all of the individual sections into a single document.

## Styles

Inline styling of elements needs to be limited in the HTML files or it will be difficult to maintain.  Generally, all the styling should be in elementStyling.css which is in the css folder.

Certain Paged.js related styles relating to pagination and headers and things like that are in pagedjs.css and should not be modified.

The easiest way to apply any of the classes below is the extension's **Insert Style Class...** / **Insert Figure...** / **Insert Caution/Warning Box...** commands (see [VS Code Extension](#vs-code-extension) below) — they parse `css/elementStyling.css` live, so the picker never drifts out of sync with what's actually defined.

### Text Utility Classes

| Class            | Effect                          |
|------------------|----------------------------------|
| `boldText`       | `font-weight: bold`             |
| `smallText`      | `font-size: .8em`                |
| `centerText`     | `text-align: center`             |
| `leftAlignText`  | `text-align: left`               |
| `rightAlignText` | `text-align: right`              |
| `tabOver`        | `padding-left: 40px` (indent)    |
| `marginTop1`     | adds top margin; combine with `plainTableLarge`/`plainTableMedium` (e.g. `class="marginTop1 plainTableLarge"`) to space a table off the preceding paragraph |

### Title Page

`titlePage1` / `titlePage2` / `titlePage3` are the large centered headings used on the manual's title page fragment only (decreasing font size, all bold except `titlePage3`).

## Rules of Thumb

The html files should be as small as practical.  A single paragraph is perfectly acceptable.
The overarching idea is that these small files can eventually be organized and reused in other documents to avoid copying and pasting.


## Images

We need to standardize the shape and formatting of images that are in the document.

Each accepted shape has a corresponding `imageCentered_WxH` css class in `css/elementStyling.css` (in inches) that should be applied to the `<img>` element. Currently defined shapes are:

    | Class                  | Width(in) | Height(in) |
    |------------------------|-----------|------------|
    | imageCentered_6x8      | 6.0       | 8.0        |
    | imageCentered_6x6      | 6.0       | 6.0        |
    | imageCentered_6x4      | 6.0       | 4.0        |
    | imageCentered_6x3      | 6.0       | 3.0        |
    | imageCentered_6x2      | 6.0       | 2.0        |
    | imageCentered_5x4      | 5.0       | 4.0        |
    | imageCentered_5x3      | 5.0       | 3.0        |
    | imageCentered_5x2      | 5.0       | 2.0        |
    | imageCentered_4x4      | 4.0       | 4.0        |
    | imageCentered_4x3      | 4.0       | 3.0        |
    | imageCentered_4x2      | 4.0       | 2.0        |
    | imageCentered_3x5      | 3.0       | 5.0        |
    | imageCentered_3x4      | 3.0       | 4.0        |
    | imageCentered_3x3      | 3.0       | 3.0        |
    | imageCentered_3x2      | 3.0       | 2.0        |

If none of these fit, add a new `imageCentered_WxH` class to `css/elementStyling.css` (under the "STANDARD IMAGE FORMATTING" section) rather than using an inline `style` attribute, and add it to this table.

## Caution and Warning Boxes

The standard caution and warning boxes are:

small: 3in wide x Content Height\
medium: 4.5in wide x Content Height\
large: 6in wide x Content Height

Each size has corresponding css classes that should be applied. There are two box types: `boxCaution*` (black border/text) and `boxWarning*` (red border/text), each with `Small`/`Medium`/`Large` variants.

For a small caution box, html markup is as follows:
```html
<div class="boxCautionSmall">
    <p class="boxCautionSmallHeader">CAUTION</p>
    <p class="boxCautionSmallText">Caution's text goes here.</p>
</div>
```

For a small warning box, html markup is as follows:
```html
<div class="boxWarningSmall">
    <p class="boxWarningSmallHeader">WARNING</p>
    <p class="boxWarningSmallText">Warning's text goes here.</p>
</div>
```

Medium and Large variants follow the same pattern, substituting `Medium`/`Large` for `Small` in all three class names (e.g. `boxCautionMedium`/`boxCautionMediumHeader`/`boxCautionMediumText`, `boxWarningLarge`/`boxWarningLargeHeader`/`boxWarningLargeText`).


## Tables
There is a lot of content that is formatted as tables.  Some are simple and can use standard style classes, others require column spanning and other complicated styles that will need to be done in the html elements.

The standard table styles are `plainTableSmall` (3in wide), `plainTableMedium` (4.5in wide), and `plainTableLarge` (6in wide).

The cells are styled as follows

```html
<table class="plainTableLarge">
    <tr>
        <th class=plainTableHeaderCell>Header Cell 1</th>
        <th class=plainTableHeaderCell>Header Cell 2</th>
    </tr>
    <tr>
        <td class="plainTableNormalCell centerText">Row 1 Cell 1</td>
        <td class="plainTableNormalCell centerText">Row 2 Cell 1</td>
    </tr>
</table>
```

To fix an individual column's width (rather than letting it size to content), add one of `cellWidth1_0` / `cellWidth1_5` / `cellWidth2_0` / `cellWidth3_0` (1.0in/1.5in/2.0in/3.0in) alongside `plainTableNormalCell` on a `<td>`.

### Special-purpose tables

A couple of sections have their own dedicated table classes rather than using `plainTable*`:

- **Inspection tables** (`tableInspections`, plus per-cell `cellInspectionNumber` / `cellInspectionInterval` / `cellInspectionText`) — used for the recurring inspection-interval tables.
- **Limitations table** (`limitationsTable`, `limitationsTableCell`) — the fixed 6in-wide bordered table used in the Limitations section.
- **Table of contents** (`tocHeader`, `tocLevel2`/`tocLevel3`/`tocLevel4`, `tocGrid`, `tocLeaders`) — these style the generated TOC entries and shouldn't need to be hand-applied in ordinary content; see [Table of Contents](#table-of-contents) under Paged.js Notes below for how TOC page numbers actually get filled in.

## Cross References
Cross references to other sections should be made using xref elements.
The xref element should have attributes.

fileTarget: If note empty, fileTarget should indicate the html file name for the section that is desired to be linked.

sectionTarget: If not empty, section Target should indicate the section number (a string) to link to.

xrefType: options are link and text.  "link" will make a clickable link using an anchor element.

prependLabel: Text that you want before the cross reference number.  "Section" in a link that says "Section 2.1".

When processing, sectionTarget is prioritized over fileTarget.  One of the two must be specified.

**`fileTarget` should only be used to reference figures/images.** It is unstable for referencing sections — a section's file can be swapped out or reused elsewhere (e.g. via divergent per-model `docDefs`), which silently breaks or mis-targets the xref. For sections, always use `sectionTarget` instead.

```html
<p>See <xref sectionTarget="2.0.1" xrefType="link", prependLabel="Section"></xref> for more information.</p>
```
will render like:

See Section 2.0.1 for more information.

With "Section 2.0.1" being the clickable link.


# Paged.js Notes
## Page Number Counters
Page number counters are finnicky.
To track individual section counters, it works best to declare a counter against the body in css:
```css
body{
    counter-reset: CounterName
}
```
Then use the header elements class to increment the counter.  
```css
.descriptionHeaderRight {
    counter-increment: CounterName;
}

.descriptionHeaderLeft {
    counter-increment: CounterName;
}
```
If you try to add a new custom counter that increments on @page, pagedjs has a runtime error.

## Table of Contents
The page number feature in the table of contents doesn't work as described in paged.js documentation.Actually it does but it doesn't work as one would hope.

Using the target-counter() css function can only use the built in "page" counter.  This means that custom named and declared counters for individual sections cannot be used.

To get around this, a javascript function has been written.  It is in TocPostProcess.js.  This file should be loaded by the main html file and be ready for use after the paged.js processing routine is finished.

To run, do this in the console or via some other method:

```js
tocPostProcess()
```

# Tools

`Tools/` holds standalone Node scripts for auditing and building the manuals. Run them with `node` from either the repo root or the `Tools/` folder (paths below assume the repo root):

- **`findIncompleteSections.mjs`** — the tool to reach for when checking a manual's completeness. Walks the section tree that's actually wired up in `docDefs/DocDef_<series>.mjs` (the authoritative source of what's in the compiled manual — see [OM docDefs note](#a-note-on-docdefs-vs-html) below) and flags the in-line `color:red` editorial markers used to mark missing/unverified/copied-pending-review content.
  ```
  node Tools/findIncompleteSections.mjs [series]
  ```
  `series` defaults to `502` (e.g. `node Tools/findIncompleteSections.mjs 402`). Writes a dated JSON report plus a `_latest.json` and an `_report.html` into `Tools/reports/`.
- **`find_unused_images.js`** — scans every `.html`/`.js`/`.mjs` file for image references and lists the files under `img/` that nothing points to.
- **`exportDocDefJson.js`** / **`buildStaticHtml.js`** — a pair used to export a model's `DocDef` tree to JSON and then compile it plus its HTML fragments into one static file. Mainly useful for producing a standalone build outside the normal Paged.js/Live Server render.
- **`imageSourceRegistry.json`** — data (not a script): maps `img/*` files to their `imgSrc/*` CAD/source file(s). This is what backs the extension's Image Sources view (see below); edit it through the extension's linking commands rather than by hand.
- **`MissingFiles.mjs`** / **`make502Filesm.js`** — older, narrower scripts (hardcoded to specific models/folders) kept for reference; `findIncompleteSections.mjs` above is the current, general-purpose replacement for auditing section completeness.

### A note on docDefs vs. html/

`docDefs/DocDef_<model>.mjs` (via each section's `ContentFileUrl`) is the authoritative list of what content is actually compiled into a given model's manual. The `html/` folder is organized by topic, not by model, and accumulates orphaned per-model files left over from old edits that no `DocDef` references anymore. When checking whether a file is "used", grep `docDefs/*.mjs` for its path rather than assuming everything under `html/` is live.

# VS Code Extension

`Tools/vscode-extension/om` is a purpose-built VS Code extension ("OM") for authoring and cross-checking these manuals — it understands the `docDefs`/`html`/`css` structure directly, so most day-to-day navigation and insertion tasks described above are faster through it than by hand.

### Installing / running it

- **From a packaged build**: in VS Code, run **Extensions: Install from VSIX...** and pick the newest `Tools/vscode-extension/om/om-<version>.vsix`.
- **From source (for extension development)**: open `Tools/vscode-extension/om` as its own VS Code window, run `npm install`, then press `F5` to launch an Extension Development Host with it loaded.

Either way, the extension needs the `OM2` repo (or any folder containing `docDefs/`, `html/`, `css/` in this same layout) open as the workspace folder to find its data.

### What it does

- **Unified navigation tree** (activity bar → "My Custom Explorer" → "My Tree View"): all 4 models (402/502/602/802) merged into one section-numbered tree, loaded live from `docDefs/DocDef_*.mjs`. Sections where models diverge (different underlying file, or a model missing the section) get a warning icon; **OM: Compare Model Files...** diffs two models' files with a similarity score to help prioritize review.
- **Content insertion helpers** (see step-by-step usage below), all live-parsed from `css/elementStyling.css` / the doc index so they can't go stale: **Insert Xref...**, **Insert Style Class...**, **Insert Figure...**, **Insert Figure from Clipboard...**, **Insert Caution/Warning Box...**.
- **In-editor styled preview** (editor title bar icon): a fast, approximate live preview of the fragment you're editing, styled with `elementStyling.css`. **OM: Compare All Models in Preview** shows one pane per model side by side. For a full, publish-ready render (real pagination, resolved xrefs, figure numbering), still use Live Server against `index*.html` — **OM: Open Manual in Live Server...** picks a model and browser for you. For a web-display rendering (no pagination) instead of the print layout, see [OM Dashboard](#om-dashboard-web-prototype) below.
- **Data Vars view** (activity bar): every `data-vars="X"` placeholder from `code/data_vars.mjs` with its per-model value; jump straight to an assignment, or use **OM: Find Where Data Var Is Used...** / **OM: Insert Data Var...** to work in the other direction.
- **Image Sources view** (activity bar): tracks which `img/*` files are linked to their `imgSrc/*` CAD/source file(s) (backed by `Tools/imageSourceRegistry.json`), with commands to link/unlink and jump to the source file.
- **Figure diagnostics**: flags figure images reused more than once within the same model as warnings in the Problems panel.
- **Change reports**: **OM: Tag Release Baseline...** tags the current state per model in git (tag names can't contain spaces — use hyphens, e.g. `502-20260901-FAA-Submission-1`); **OM: Generate Change Report...** / **OM: Export Change Report...** diff a model against a tagged baseline (or the working tree) and produce a reviewable, then exportable HTML report of what changed section-by-section.

The full, version-by-version command list is kept current in [`Tools/vscode-extension/om/README.md`](Tools/vscode-extension/om/README.md) and [`Tools/vscode-extension/om/changelog.md`](Tools/vscode-extension/om/changelog.md) — check those for anything not covered above.

### Using the insertion commands

All of these run from an open `.html` fragment: right-click in the editor (or use the Command Palette, `Ctrl+Shift+P`) and pick the `OM:` command. Each is a short wizard of Quick Pick / input-box prompts — press `Esc` at any step to cancel without inserting anything.

**Insert Figure...**
1. Place your cursor where the `<figure>` block should go, then run **OM: Insert Figure...**.
2. Pick the image from the Quick Pick list of everything under `img/`. If a name is already used as a figure elsewhere in a model that also owns this fragment, it's marked `⚠ already used as ...` — you'll get a confirmation prompt if you pick one anyway, since duplicate figure basenames break xref resolution at render time.
3. Pick the image size class (e.g. `imageCentered_5x3`) from the list parsed live from `css/elementStyling.css`.
4. Type the figure caption (optional — leave blank to get an editable placeholder instead).
5. The `<figure>`/`<img>`/`<figcaption>` markup is inserted at your cursor.

**Insert Figure from Clipboard...**
1. Copy or capture an image first (e.g. `Win+Shift+S`), then place your cursor and run **OM: Insert Figure from Clipboard...**.
2. Enter a file name (no extension needed — `.png` is added, and the name is checked against existing files/figure usages before you can proceed).
3. Pick a size class and enter a caption, same as **Insert Figure...** above.
4. The image is saved to `img/<name>.png` and the figure markup is inserted in one step.

Windows only (it reads the clipboard via PowerShell).

**Insert Xref...**
1. Place your cursor where the cross-reference should go and run **OM: Insert Xref...**.
2. Choose **Link to a Section** or **Link to a File/Figure**. Per the [Cross References](#cross-references) guidance above, use **Link to a Section** for sections — reserve **Link to a File/Figure** for figures/images.
   - *Section*: search/pick the target section from the live section index (`sectionTarget` is filled in for you).
   - *File/Figure*: pick an existing figure already in this document, or browse the filesystem for a file (`fileTarget` is filled in for you).
3. Pick `xrefType` (`link` or `text`).
4. Optionally type a `prependLabel` (e.g. `Section` or `Figure`).
5. The `<xref>` tag is inserted with the attributes you picked.

From the navigation tree, right-clicking a section and choosing **OM: Insert Xref to This Section** skips straight to step 3 with `sectionTarget` already set.

**Insert Style Class...**
1. Place your cursor inside the element you want to style (or select it) and run **OM: Insert Style Class...**.
2. Pick a class from the list — parsed live from `css/elementStyling.css` (and the pagination-control classes in `css/pagedjs.css`), grouped/described the same way this Readme groups them.
3. The class is applied to the element at your cursor.

**Insert Caution/Warning Box...**
1. Place your cursor where the box should go and run **OM: Insert Caution/Warning Box...**.
2. Pick the box type (Caution/Warning) — parsed from the `box*Small/Medium/Large` families defined in `css/elementStyling.css`.
3. Pick the size (Small/Medium/Large).
4. The full `<div class="box...">` / header / text markup is inserted, ready for you to fill in the message.

# Publishing the Manual

The preferred way to produce the print-ready PDF for a model is to render the real manual in Chrome and print it from there — not to print a screenshot of the extension's fast in-editor fragment preview, which is intentionally approximate and doesn't paginate or resolve xrefs (see [In-editor styled preview](#what-it-does) above).

1. Click the Live Server button on the "My Tree View" title bar (or run **OM: Open Manual in Live Server...**), pick the model (402/502/602/802), and pick Chrome as the browser. This serves and opens the actual `index<model>.html` through Paged.js — the fully paginated render with resolved xrefs and real figure numbers.
2. Let it finish rendering before printing. Paged.js paginates the whole document and then runs the table-of-contents page-number fix-up automatically; watch for the page to stop reflowing.
3. Print to PDF from Chrome (`Ctrl+P` → Destination: **Save as PDF**):
   - Turn on **Background graphics** (under "More settings") — without it, shaded table headers (`plainTableHeaderCell`) and other background colors are dropped from the PDF.
   - Turn off Chrome's own headers and footers — the manual already renders its own running headers/sidebars, and Chrome's added ones will duplicate or overlap them.
4. **Before distributing the PDF, open it and click through a handful of `<xref>` links** — at least one section link and one figure link — to confirm they still jump to the right page. Hyperlink behavior can silently break in a print-to-PDF pass even when the on-screen render looked correct, so treat this check as a required step every time, not just when something looks off.

# OM Dashboard (web prototype)

`WebDashboard/` holds a separate, self-contained prototype for a web-based owner/shop document dashboard (landing page, per-model manual viewer with in-manual search, and a cross-model section compare tool), styled to match `dashboard.airtractor.com`. It reuses `RenderDoc.mjs`/`docDefs`/`css/elementStyling.css` unmodified and lives entirely in its own folder — see [`WebDashboard/README.md`](WebDashboard/README.md) for how it works, how to run it, and what's still stubbed (auth, serial number lookup).

### Recent Changes panel (`webChangeLog.json`)

The dashboard's "Recent Changes" panel reads [`webChangeLog.json`](webChangeLog.json) at the repo root. When a revision is published, add an entry to the **top** of `entries`:

```json
{ "date": "2026-09-20", "models": ["802"], "text": "What changed, written for owners.", "link": "supporting/ER2840.pdf", "linkLabel": "ER 2840" }
```

`date` (YYYY-MM-DD) and `text` are required; `models` is a list of model names to display (e.g. `["AT-802", "AT-802A"]`; the numbers `402`/`502`/`602`/`802` are expanded to the full model name, and `["all"]` shows "All models"); `link` (a URL, or a path relative to `webChangeLog.json`, e.g. a change report PDF) and `linkLabel` are optional. Entries missing a date or text are skipped and the newest 10 are shown. Keep it valid JSON (double quotes, no trailing comma) — if it's broken the panel just shows "No recent changes to show." Whatever publishes the site needs to copy `webChangeLog.json` (and any files it links to) along with `WebDashboard/`, keeping their relative positions.
