# OM Dashboard (prototype)

A first-pass "document library" dashboard for owners/shops, styled to match
`dashboard.airtractor.com` / `airtractor.com`, built on top of the existing
owner's manual rendering pipeline (`RenderDoc.mjs`, `docDefs/`, `code/DocSection.mjs`).
`js/IsolationManager.mjs` (the section isolate/"Show Full Manual" logic) lives
here too -- it was originally a root-level file shared with the now-retired
`web802.html` prototype, but this dashboard is its only remaining consumer.

This folder is intentionally kept separate from the root of the project so
that authors editing manual content in `docDefs/`, `html/`, `css/` never need
to know it exists. **Nothing in this folder modifies any file outside of it.**

## Running it locally

Serve the repo root (`OM2/OM2/`) with any static file server -- e.g. VS
Code's Live Server extension, or `npx serve` -- the same way `index*.html` is
normally served for Paged.js rendering. Then open:

- `WebDashboard/index.html` -- the landing page / document library
- `WebDashboard/viewer.html?model=802` -- a single model's manual
- `WebDashboard/compare.html?modelA=402&modelB=802` -- side-by-side compare

Opening these via `file://` directly will not work -- the rendering pipeline
uses `fetch()` for manual content and ES module `import()`, both of which
require `http(s)://`.

## Auth (stubbed)

There's no real login yet. In production this app is expected to only be
reached after the real `dashboard.airtractor.com` WordPress login already
authenticated the user, via a "Document Library" link/redirect from there.

For now, every page shows a blocking gate unless a **dev bypass** is active:
add `?dev=1` once, or click "Continue for internal testing" on the gate. That
sets a `localStorage` flag (`omdash_devBypass`) for that browser. This is
explicitly *not* a security boundary -- see `js/auth.js`.

## Why `<base href="../">` is in viewer.html / compare.html

Those two pages render actual manual content, which means they exercise the
existing `DocSection.GetContent()` -> `fetch(this.ContentFileUrl)` calls
(e.g. `fetch("html/Inspection/GENERAL.html")`). Those paths are written
relative to the project root and resolve against the *page's* URL, not the
importing script's URL. Since this page lives one folder below the root
(`WebDashboard/viewer.html`), a `<base href="../">` tag makes those
already-correct relative paths resolve against the root again, exactly as
they resolved for the old root-level `web802.html` prototype this replaced --
with zero changes to `RenderDoc.mjs`, `DocSection.mjs`, or any docDef.

Side effect: with `<base>` set, plain in-page anchors (`href="#Sec_3_1"`,
used throughout the TOC and cross-references) would otherwise trigger a real
navigation instead of a same-page scroll. `js/toc-nav.js` intercepts all
`a[href^="#"]` clicks and does the scroll manually, expanding any ancestor
`<details>` first.

Because of `<base>`, every reference to this app's *own* assets on those two
pages -- including `WebDashboard/js/IsolationManager.mjs`, even though it has
no imports of its own to worry about -- is written with a `WebDashboard/`
prefix (e.g. `WebDashboard/css/dashboard.css`); references to root-level
assets (`docDefs/`, `css/elementStyling.css`, `img/`, `RenderDoc.mjs`) are
written the same way `index*.html` writes them. `index.html` doesn't render
manual content and has no `<base>` tag, so
its own asset paths are plain relative paths as usual.

## What's real vs. stubbed in this pass

| Area | Status |
|---|---|
| Model manual rendering (viewer.html) | Real -- reuses `RenderDoc.mjs`/`docDefs` unmodified |
| TOC + isolate-a-section | Real -- `js/IsolationManager.mjs` logic unmodified, reskinned |
| Compare view (side-by-side) | Real -- fetches/renders the matching section from each selected model |
| Compare view diff highlighting | Real but experimental -- word-level, **text only** (loses tables/figures/formatting), off by default |
| Section search (landing page + within a manual) | Real, but section-*title* search only on the landing page (built from docDef section numbers/titles, not full body text); within a manual it searches the already-rendered text |
| Cross-model full-text body search | **Not implemented.** Would need a build-time index of actual fetched `html/*.html` content across all models; flagged as a follow-on |
| Serial number -> model lookup | **Stubbed** (`js/serials.js`) -- fake prefix matching, not the real production data. Per current scope, SN is only used to pick the *model*, not a specific manual revision |
| Manual revision effectivity by aircraft age | **Not in scope for this pass** -- always shows the current/latest revision |
| Login | **Stubbed gate + dev bypass**, see above |
| Changelog on landing page | **Sample/placeholder data**, not generated from real revisions |
| Service letters | **Not built** -- out of scope for this pass; the manual-viewing dashboard is the focus |

## Structure

```
WebDashboard/
  README.md
  index.html        Landing page: model grid, SN lookup, search, changelog stub
  viewer.html        Single-model manual viewer (redesigned nav around the existing renderer)
  compare.html        Side-by-side section compare across 2+ models, optional text diff
  manualIndex.mjs    Reads docDefs/* (unmodified) to build a section index for search/compare pickers
  css/dashboard.css  Shell design system, tokens pulled from airtractor.com's live theme
  js/auth.js               Stub auth gate + dev bypass
  js/serials.js            Stub serial number -> model lookup
  js/toc-nav.js            Fragment-link click interceptor (see <base> note above)
  js/compareDiff.js        Word-level LCS text diff for the compare view
  js/IsolationManager.mjs  Section isolate / "Show Full Manual" logic (moved here from the repo root; only viewer.html uses it)
```

## Design tokens

Pulled directly from `airtractor.com`'s live Kadence theme CSS custom
properties (`--global-palette*`), so the shell matches the real site:

- Navy `#1a468c`, Yellow `#ffd33d`, Ink `#292929`
- Grays `#3c4042` / `#606368` / `#e5e5e5` / `#f3f3f3`
- Semantic: green `#13612e`, link blue `#1159af`, red `#b82105`, orange `#f7630c`, amber `#f5a524`
- Font: `aktiv-grotesk` (Air Tractor's licensed Adobe Fonts/Typekit face) with a
  system-sans fallback stack. If this project has a licensed Typekit kit, add
  its `<link>` (`https://use.typekit.net/nzb6noa.css`) to a page's `<head>`
  and the fallback stack picks it up automatically.

`dashboard.airtractor.com` itself sits behind a Cloudflare bot check and its
own login wall, so its exact CSS couldn't be pulled directly -- these tokens
come from the public `airtractor.com` marketing site, which shares the same
brand/theme.
