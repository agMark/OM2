//@ts-check

import { DocDef } from "../DocDef_802.mjs";
import { DocSection } from "../code/DocSection.mjs";
import fs from 'fs';
import path from 'path';

let allHtmlFiles = [];

/**
 * 
 * @param {DocSection} section 
 * @param {string[]} array 
 */
let getAllHtmlFiles = (section, array) => {
    if(section.HasContent){
        array.push(section.ContentFileUrl);
    }
    section.Sections.forEach( (s) => {
        getAllHtmlFiles(s, array);
    })
}
getAllHtmlFiles(DocDef.Sections[3], allHtmlFiles);


for(let i=0; i < allHtmlFiles.length; i++){
    let parsedPath = path.parse(allHtmlFiles[i]);
    let fileNameWithoutExtension = parsedPath.name;
    let newFileName = fileNameWithoutExtension + "_402.html";
    let newFilePath = "./temp/" + newFileName;
    let content = "<p style='color:red;'>CONTENT NOT CREATED</p>";
    fs.writeFileSync(newFilePath, content, "utf-8");
    let x = 1;
}

let stopHere = 1;