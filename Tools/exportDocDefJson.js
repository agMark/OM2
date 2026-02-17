// Tools/exportDocDefJson.js
// Exports the DocDef structure as JSON for static HTML compilation
// Usage: node exportDocDefJson.js

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the DocDef .mjs file
const docDefPath = path.resolve(__dirname, '../docDefs/DocDef_802.mjs');

async function main() {
    // Convert to file:// URL for Windows compatibility
    const docDefUrl = new URL('file://' + docDefPath.replace(/\\/g, '/'));
    const docDefModule = await import(docDefUrl);
    const DocDef = docDefModule.DocDef;

    function sectionToJson(section) {
        return {
            SectionTitle: section.SectionTitle,
            SectionNumber: section.SectionNumber,
            DisplayTitle: section.DisplayTitle,
            HasContent: section.HasContent,
            ContentFileUrl: section.ContentFileUrl,
            CustomStyle: section.CustomStyle,
            CustomClass: section.CustomClass,
            ElementId: section.ElementId,
            Sections: section.Sections ? section.Sections.map(sectionToJson) : []
        };
    }

    const docJson = sectionToJson(DocDef);
    const outPath = path.resolve(__dirname, '../docDef_802.json');
    fs.writeFileSync(outPath, JSON.stringify(docJson, null, 2), 'utf8');
    console.log('DocDef exported to', outPath);
}

main();
