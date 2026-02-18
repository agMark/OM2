// Tools/buildStaticHtml.js
// Builds a single static HTML file from docDef_802.json and HTML fragments
// Usage: node buildStaticHtml.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.resolve(__dirname, '..');
const docJsonPath = path.join(baseDir, 'docDef_802.json');
const outputHtmlPath = path.join(baseDir, 'static_802.html');

function readHtmlFragment(fragmentPath) {
    const absPath = path.join(baseDir, fragmentPath);
    if (fs.existsSync(absPath)) {
        return fs.readFileSync(absPath, 'utf8');
    } else {
        return `<div style="color:red">Missing: ${fragmentPath}</div>`;
    }
}

function renderSection(section) {
    let html = '';
    if (section.DisplayTitle && section.SectionTitle) {
        html += `<h2>${section.SectionNumber ? section.SectionNumber + ' - ' : ''}${section.SectionTitle}</h2>\n`;
    }
    if (section.HasContent && section.ContentFileUrl) {
        html += readHtmlFragment(section.ContentFileUrl) + '\n';
    }
    if (section.Sections && section.Sections.length > 0) {
        for (const sub of section.Sections) {
            html += renderSection(sub);
        }
    }
    return html;
}

function buildHtml(docJson) {
    return `<!DOCTYPE html>\n<html>\n<head>\n<title>${docJson.SectionTitle || 'Document'}</title>\n<link href="css/elementStyling.css" rel="stylesheet">\n</head>\n<body>\n${renderSection(docJson)}\n</body>\n</html>`;
}

function main() {
    if (!fs.existsSync(docJsonPath)) {
        console.error('docDef_802.json not found. Run exportDocDefJson.js first.');
        process.exit(1);
    }
    const docJson = JSON.parse(fs.readFileSync(docJsonPath, 'utf8'));
    const html = buildHtml(docJson);
    fs.writeFileSync(outputHtmlPath, html, 'utf8');
    console.log('Static HTML built at', outputHtmlPath);
}

main();
