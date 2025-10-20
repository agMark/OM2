import { DocSection } from './code/DocSection.mjs'

let def_Sec_0 = new DocSection();
def_Sec_0
    .i(false, "", false, "", true, "html/Intro/TITLE_402.html")
    .s([
        new DocSection().i(false, "", true, "OVERVIEW", true, "html/Intro/OVERVIEW.html"),
        new DocSection().i(false, "", true, "MANUAL DISTRIBUTION", true, "html/Intro/MANUAL DISTRIBUTION.html"),
        new DocSection().i(false, "", false, "", true, "html/Intro/TOC AND NOTES_402.html")
    ]);

export {def_Sec_0}