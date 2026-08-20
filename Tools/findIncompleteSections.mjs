// Scans a series manual (html/*/<series>/*.html) for the in-line "color:red"
// editorial markers used throughout these manuals to flag content that is
// missing, unverified, or copied from another series pending review.
//
// Usage (run from repo root):
//   node Tools/findIncompleteSections.mjs [series]
//
// series defaults to 502. Examples: node Tools/findIncompleteSections.mjs 402
//
// Writes, into Tools/reports/:
//   incomplete_<series>_<YYYY-MM-DD>.json   - machine-readable snapshot, for diffing runs over time
//   incomplete_<series>_latest.json         - same content, stable filename for easy diffing/scripting
//   incomplete_<series>_report.html         - standalone, self-contained report you can just open in a browser

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const series = process.argv[2] || '502';
const root = path.resolve(__dirname, '..', 'html');
const reportsDir = path.resolve(__dirname, 'reports');

const RED_TAG_RE = /<(span|p|div|font|b|strong|em|i)\b[^>]*style\s*=\s*(['"])[^'"]*color\s*:\s*(?:red|#f00\b|#ff0000|rgb\(\s*255\s*,\s*0\s*,\s*0\s*\))[^'"]*\2[^>]*>([\s\S]*?)<\/\1>/gi;
const BOX_RE = /<div[^>]*class\s*=\s*(['"])[^'"]*box(?:Caution|Warning)[^'"]*\1[^>]*>[\s\S]*?<\/div>/gi;

function stripTags(s) {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function findAllHtmlFiles(dir, seriesDirName, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findAllHtmlFiles(full, seriesDirName, out);
    } else if (path.basename(dir) === seriesDirName && /\.html?$/i.test(entry.name)) {
      out.push(full);
    }
  }
}

const files = [];
findAllHtmlFiles(root, series, files);
files.sort();

if (files.length === 0) {
  console.error(`No html files found under any "${series}" folder inside ${root}. Known series subfolders: 402, 502, 602.`);
  process.exit(1);
}

const results = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');

  // ranges of legitimate approved WARNING/CAUTION boxes - these are sometimes
  // styled with inline color:red too, but they are real approved content, not
  // an editorial "this isn't done yet" flag, so matches inside them are excluded.
  const boxRanges = [];
  for (const m of content.matchAll(BOX_RE)) {
    boxRanges.push([m.index, m.index + m[0].length]);
  }
  const insideBox = (idx) => boxRanges.some(([s, e]) => idx >= s && idx < e);

  const notesRaw = [];
  for (const m of content.matchAll(RED_TAG_RE)) {
    if (insideBox(m.index)) continue;
    const text = stripTags(m[3]);
    if (text.length > 1) notesRaw.push(text);
  }
  if (notesRaw.length === 0) continue;

  // dedupe while preserving order, drop bare box-header words that slip through
  const notes = [];
  for (const n of notesRaw) {
    if (['WARNING', 'CAUTION', 'NOTE'].includes(n.trim().toUpperCase())) continue;
    if (!notes.includes(n)) notes.push(n);
  }
  if (notes.length === 0) continue;

  const rel = path.relative(root, file).split(path.sep).join('/');
  const parts = rel.split('/');
  const chapter = parts[0];
  const title = path.basename(file).replace(new RegExp(`_${series}\\.html?$`, 'i'), '');
  const isEmpty = notes.length === 1 && notes[0].trim().toUpperCase() === 'CONTENT NOT CREATED';

  results.push({
    chapter,
    title,
    path: rel,
    severity: isEmpty ? 'empty' : 'flagged',
    notes,
  });
}

const emptyCount = results.filter(r => r.severity === 'empty').length;
const flaggedCount = results.length - emptyCount;

console.log(`Series ${series}: scanned ${files.length} files, ${results.length} flagged (${emptyCount} not created, ${flaggedCount} partial/needs review).`);

fs.mkdirSync(reportsDir, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const jsonDated = path.join(reportsDir, `incomplete_${series}_${today}.json`);
const jsonLatest = path.join(reportsDir, `incomplete_${series}_latest.json`);
const htmlOut = path.join(reportsDir, `incomplete_${series}_report.html`);

const payload = {
  series,
  generatedAt: new Date().toISOString(),
  totals: { files: files.length, flagged: results.length, empty: emptyCount, partial: flaggedCount },
  sections: results,
};

fs.writeFileSync(jsonDated, JSON.stringify(payload, null, 2), 'utf8');
fs.writeFileSync(jsonLatest, JSON.stringify(payload, null, 2), 'utf8');
fs.writeFileSync(htmlOut, buildHtmlReport(series, results, emptyCount, flaggedCount), 'utf8');

console.log(`Wrote ${jsonDated}`);
console.log(`Wrote ${jsonLatest}`);
console.log(`Wrote ${htmlOut}`);

// --- previous run comparison, if one exists ---
const priorDated = fs
  .readdirSync(reportsDir)
  .filter(f => f.startsWith(`incomplete_${series}_`) && f.endsWith('.json') && !f.endsWith('_latest.json') && f !== path.basename(jsonDated))
  .sort();
if (priorDated.length > 0) {
  const priorFile = priorDated[priorDated.length - 1];
  const prior = JSON.parse(fs.readFileSync(path.join(reportsDir, priorFile), 'utf8'));
  const priorPaths = new Set(prior.sections.map(s => s.path));
  const currentPaths = new Set(results.map(s => s.path));
  const resolved = [...priorPaths].filter(p => !currentPaths.has(p));
  const newlyFlagged = [...currentPaths].filter(p => !priorPaths.has(p));
  console.log(`\nCompared to ${priorFile} (${prior.generatedAt}):`);
  console.log(`  resolved (no longer flagged): ${resolved.length}`);
  resolved.forEach(p => console.log(`    + ${p}`));
  console.log(`  newly flagged: ${newlyFlagged.length}`);
  newlyFlagged.forEach(p => console.log(`    - ${p}`));
}

function buildHtmlReport(series, sections, emptyCount, flaggedCount) {
  const data = JSON.stringify(sections);
  return `<title>AT-${series} OM — Incomplete Sections Audit</title>
<style>
  :root{
    --bg:#f5f3ea; --surface:#ffffff; --surface-2:#eeeade; --ink:#22262d; --ink-muted:#666b58; --ink-faint:#8b8f7c;
    --border:#dcd6c4; --border-strong:#c7c0a9; --accent:#2c5f7c; --accent-ink:#ffffff;
    --empty:#a92419; --empty-bg:#f7e4e1; --empty-border:#e3b4ac;
    --flagged:#8a5c07; --flagged-bg:#f6ecd6; --flagged-border:#e0c98c; --code-bg:#eee9d9;
  }
  @media (prefers-color-scheme: dark){
    :root:not([data-theme="light"]){
      --bg:#13161a; --surface:#1b1f25; --surface-2:#20252c; --ink:#e8e6dc; --ink-muted:#9a9d8e; --ink-faint:#6f7266;
      --border:#2b2f36; --border-strong:#3a3f47; --accent:#7fb3d6; --accent-ink:#0f1720;
      --empty:#ff8177; --empty-bg:#2e1b19; --empty-border:#5a3330;
      --flagged:#eab35a; --flagged-bg:#2c2515; --flagged-border:#5a4a26; --code-bg:#242920;
    }
  }
  :root[data-theme="dark"]{
    --bg:#13161a; --surface:#1b1f25; --surface-2:#20252c; --ink:#e8e6dc; --ink-muted:#9a9d8e; --ink-faint:#6f7266;
    --border:#2b2f36; --border-strong:#3a3f47; --accent:#7fb3d6; --accent-ink:#0f1720;
    --empty:#ff8177; --empty-bg:#2e1b19; --empty-border:#5a3330;
    --flagged:#eab35a; --flagged-bg:#2c2515; --flagged-border:#5a4a26; --code-bg:#242920;
  }
  *{ box-sizing:border-box; }
  html,body{ margin:0; padding:0; }
  body{ background:var(--bg); color:var(--ink); font-family:"Segoe UI","Helvetica Neue",Arial,sans-serif; font-size:15px; line-height:1.5; }
  .display{ font-family:"Bahnschrift SemiCondensed","Bahnschrift","Arial Narrow","Segoe UI",sans-serif; font-weight:600; letter-spacing:0.01em; }
  .mono{ font-family:"Consolas","Cascadia Mono","SF Mono",ui-monospace,monospace; font-variant-numeric:tabular-nums; }
  header{ background:var(--surface); border-bottom:1px solid var(--border); padding:28px clamp(16px,4vw,48px) 22px; }
  .eyebrow{ font-family:"Consolas","SF Mono",monospace; font-size:11.5px; letter-spacing:0.12em; text-transform:uppercase; color:var(--accent); margin:0 0 8px; }
  h1{ font-size:clamp(22px,3vw,30px); margin:0 0 6px; text-wrap:balance; }
  .subhead{ color:var(--ink-muted); margin:0 0 20px; max-width:62ch; font-size:14.5px; }
  .stats{ display:flex; flex-wrap:wrap; gap:10px; }
  .stat{ background:var(--surface-2); border:1px solid var(--border); border-radius:8px; padding:10px 16px; min-width:118px; }
  .stat .num{ font-family:"Consolas","SF Mono",monospace; font-size:22px; font-weight:700; line-height:1.1; }
  .stat .lbl{ font-size:11px; letter-spacing:0.06em; text-transform:uppercase; color:var(--ink-muted); margin-top:2px; }
  .stat.empty .num{ color:var(--empty); } .stat.flagged .num{ color:var(--flagged); }
  .controls{ position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--border); padding:12px clamp(16px,4vw,48px); display:flex; flex-wrap:wrap; gap:10px; align-items:center; }
  #search{ flex:1 1 240px; min-width:180px; background:var(--surface); border:1px solid var(--border-strong); color:var(--ink); border-radius:7px; padding:9px 12px; font-size:14px; font-family:inherit; }
  #search:focus{ outline:2px solid var(--accent); outline-offset:1px; }
  .chipset{ display:flex; gap:6px; flex-wrap:wrap; }
  .chip{ background:var(--surface); border:1px solid var(--border-strong); color:var(--ink-muted); border-radius:999px; padding:6px 13px; font-size:12.5px; cursor:pointer; user-select:none; }
  .chip:hover{ border-color:var(--accent); color:var(--ink); }
  .chip:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }
  .chip.active{ background:var(--accent); border-color:var(--accent); color:var(--accent-ink); font-weight:600; }
  .count-visible{ margin-left:auto; color:var(--ink-faint); font-size:12.5px; font-family:"Consolas","SF Mono",monospace; white-space:nowrap; }
  main{ padding:6px clamp(16px,4vw,48px) 60px; max-width:1080px; margin:0 auto; }
  .chapter{ margin-top:34px; }
  .chapter-head{ display:flex; align-items:baseline; gap:10px; border-bottom:2px solid var(--border-strong); padding-bottom:8px; margin-bottom:14px; }
  .chapter-head h2{ font-size:17px; margin:0; text-transform:uppercase; letter-spacing:0.04em; }
  .chapter-head .chapter-count{ color:var(--ink-faint); font-family:"Consolas","SF Mono",monospace; font-size:12.5px; }
  .row{ display:grid; grid-template-columns:92px 1fr; gap:14px; padding:12px 4px; border-bottom:1px solid var(--border); align-items:start; }
  .row:last-child{ border-bottom:none; }
  .tag{ display:inline-flex; align-items:center; justify-content:center; height:22px; padding:0 9px; border-radius:5px; font-size:10.5px; font-weight:700; letter-spacing:0.06em; font-family:"Consolas","SF Mono",monospace; white-space:nowrap; }
  .tag.empty{ background:var(--empty-bg); color:var(--empty); border:1px solid var(--empty-border); }
  .tag.flagged{ background:var(--flagged-bg); color:var(--flagged); border:1px solid var(--flagged-border); }
  .row-title{ font-size:15px; font-weight:600; margin:0 0 2px; }
  .row-path{ font-size:11.5px; color:var(--ink-faint); margin:0 0 8px; word-break:break-word; }
  .notes{ margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:5px; }
  .notes li{ font-size:13.5px; color:var(--ink-muted); padding-left:14px; position:relative; }
  .notes li::before{ content:"–"; position:absolute; left:0; color:var(--ink-faint); }
  .notes li.placeholder{ font-family:"Consolas","SF Mono",monospace; font-size:12px; background:var(--code-bg); color:var(--ink); display:inline-block; padding:2px 8px; border-radius:4px; margin-right:4px; }
  .notes li.placeholder::before{ content:""; }
  .note-full{ display:none; } .note-clamped{ display:block; }
  .note-toggle{ background:none; border:none; color:var(--accent); font-size:12.5px; cursor:pointer; padding:2px 0 0 14px; font-family:inherit; }
  .note-toggle:hover{ text-decoration:underline; }
  .empty-state{ display:none; padding:60px 0; text-align:center; color:var(--ink-faint); }
  footer{ padding:20px clamp(16px,4vw,48px) 40px; color:var(--ink-faint); font-size:12px; max-width:1080px; margin:0 auto; }
  @media (max-width:520px){ .row{ grid-template-columns:1fr; } .tag{ width:fit-content; } }
</style>
<header>
  <p class="eyebrow display">AT-${series} Series &middot; Operator's Manual</p>
  <h1 class="display">Content Completeness Audit</h1>
  <p class="subhead">Every section carrying an in-line editorial flag &mdash; text styled in red within the HTML source, the convention this manual uses to mark content that is missing, unverified, or copied from another series pending review. Generated ${new Date().toISOString().slice(0, 10)}.</p>
  <div class="stats">
    <div class="stat total"><div class="num mono">${sections.length}</div><div class="lbl">Flagged sections</div></div>
    <div class="stat empty"><div class="num mono">${emptyCount}</div><div class="lbl">Content not created</div></div>
    <div class="stat flagged"><div class="num mono">${flaggedCount}</div><div class="lbl">Partial / needs review</div></div>
  </div>
</header>
<div class="controls">
  <input id="search" type="text" placeholder="Search section, path, or note text…" autocomplete="off" />
  <div class="chipset" id="severity-chips">
    <button class="chip active" data-sev="all">All</button>
    <button class="chip" data-sev="empty">Not created</button>
    <button class="chip" data-sev="flagged">Flagged</button>
  </div>
  <div class="chipset" id="chapter-chips"></div>
  <div class="count-visible" id="count-visible"></div>
</div>
<main id="main">
  <div class="empty-state" id="empty-state">No sections match this filter.</div>
</main>
<footer>Generated from inline <span class="mono">color:red</span> markers in <span class="mono">html/*/${series}/*.html</span>. Approved WARNING/CAUTION boxes are excluded even when styled in red. Re-run <span class="mono">node Tools/findIncompleteSections.mjs ${series}</span> to refresh.</footer>
<script id="data" type="application/json">${data}</script>
<script>
(function(){
  var data = JSON.parse(document.getElementById('data').textContent);
  var chapterOrder = ["Intro","Description","Inspection","Maintenance","Repairs","Limitations"];
  data.sort(function(a,b){
    var ca = chapterOrder.indexOf(a.chapter), cb = chapterOrder.indexOf(b.chapter);
    if (ca !== cb) return ca - cb;
    if (a.severity !== b.severity) return a.severity === 'empty' ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
  var chapters = [];
  data.forEach(function(d){ if (chapters.indexOf(d.chapter) === -1) chapters.push(d.chapter); });
  var chapterChipWrap = document.getElementById('chapter-chips');
  var allChip = document.createElement('button');
  allChip.className = 'chip active'; allChip.textContent = 'All chapters'; allChip.dataset.ch = 'all';
  chapterChipWrap.appendChild(allChip);
  chapters.forEach(function(ch){
    var c = document.createElement('button');
    c.className = 'chip'; c.textContent = ch; c.dataset.ch = ch;
    chapterChipWrap.appendChild(c);
  });
  function isPlaceholder(note){
    var t = note.trim();
    if (/^INSERT\\b/i.test(t)) return true;
    if (/^X{2,}(-X{2,})?$/i.test(t)) return true;
    if (/^X{1,4}$/i.test(t)) return true;
    return false;
  }
  var main = document.getElementById('main');
  var emptyState = document.getElementById('empty-state');
  function render(){
    main.querySelectorAll('.chapter').forEach(function(n){ n.remove(); });
    var q = document.getElementById('search').value.trim().toLowerCase();
    var sev = document.querySelector('#severity-chips .chip.active').dataset.sev;
    var ch = document.querySelector('#chapter-chips .chip.active').dataset.ch;
    var visible = 0; var byChapter = {};
    data.forEach(function(d){
      if (sev !== 'all' && d.severity !== sev) return;
      if (ch !== 'all' && d.chapter !== ch) return;
      if (q){
        var hay = (d.title + ' ' + d.path + ' ' + d.notes.join(' ')).toLowerCase();
        if (hay.indexOf(q) === -1) return;
      }
      if (!byChapter[d.chapter]) byChapter[d.chapter] = [];
      byChapter[d.chapter].push(d);
      visible++;
    });
    chapterOrder.forEach(function(chName){
      var items = byChapter[chName];
      if (!items || !items.length) return;
      var sec = document.createElement('section');
      sec.className = 'chapter';
      var head = document.createElement('div');
      head.className = 'chapter-head';
      head.innerHTML = '<h2 class="display">' + chName + '</h2><span class="chapter-count">' + items.length + ' section' + (items.length === 1 ? '' : 's') + '</span>';
      sec.appendChild(head);
      items.forEach(function(d){
        var row = document.createElement('div');
        row.className = 'row';
        var tag = document.createElement('span');
        tag.className = 'tag ' + d.severity;
        tag.textContent = d.severity === 'empty' ? 'NOT CREATED' : 'FLAGGED';
        var tagWrap = document.createElement('div');
        tagWrap.appendChild(tag);
        var body = document.createElement('div');
        var title = document.createElement('p');
        title.className = 'row-title'; title.textContent = d.title;
        body.appendChild(title);
        var pathEl = document.createElement('p');
        pathEl.className = 'row-path mono'; pathEl.textContent = 'html/' + d.path;
        body.appendChild(pathEl);
        if (d.severity !== 'empty'){
          var ul = document.createElement('ul');
          ul.className = 'notes';
          d.notes.forEach(function(n){
            var li = document.createElement('li');
            if (isPlaceholder(n)){
              li.className = 'placeholder'; li.textContent = n;
            } else if (n.length > 260){
              var clamped = document.createElement('span');
              clamped.className = 'note-clamped'; clamped.textContent = n.slice(0, 220).trim() + '…';
              var full = document.createElement('span');
              full.className = 'note-full'; full.textContent = n;
              var btn = document.createElement('button');
              btn.className = 'note-toggle'; btn.textContent = 'Show full note';
              btn.addEventListener('click', function(){
                var expanded = full.style.display === 'inline';
                full.style.display = expanded ? 'none' : 'inline';
                clamped.style.display = expanded ? 'inline' : 'none';
                btn.textContent = expanded ? 'Show full note' : 'Show less';
              });
              li.appendChild(clamped); li.appendChild(full);
              li.appendChild(document.createElement('br')); li.appendChild(btn);
            } else {
              li.textContent = n;
            }
            ul.appendChild(li);
          });
          body.appendChild(ul);
        }
        row.appendChild(tagWrap); row.appendChild(body);
        sec.appendChild(row);
      });
      main.appendChild(sec);
    });
    document.getElementById('count-visible').textContent = visible + ' / ' + data.length + ' shown';
    emptyState.style.display = visible === 0 ? 'block' : 'none';
  }
  document.getElementById('search').addEventListener('input', render);
  document.getElementById('severity-chips').addEventListener('click', function(e){
    if (!e.target.classList.contains('chip')) return;
    this.querySelectorAll('.chip').forEach(function(c){ c.classList.remove('active'); });
    e.target.classList.add('active'); render();
  });
  chapterChipWrap.addEventListener('click', function(e){
    if (!e.target.classList.contains('chip')) return;
    this.querySelectorAll('.chip').forEach(function(c){ c.classList.remove('active'); });
    e.target.classList.add('active'); render();
  });
  render();
})();
</script>
`;
}
