//@ts-check
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});


//const fs = require("fs");
import * as fs from 'fs'

/**
 * 
 * @param {string[]} arr 
 * @param {string} prepend 
 */
let prependAll = (arr, prepend) => {
  for (let i = 0; i < arr.length; i++) {
    arr[i] = prepend + arr[i];
  }
};

let sec1Files = fs.readdirSync(".\\html\\Description");
prependAll(sec1Files, "html/Description/");
let sec2Files = fs.readdirSync(".\\html\\Maintenance");
prependAll(sec2Files, "html/Maintenance/");
let sec3Files = fs.readdirSync(".\\html\\Inspection");
prependAll(sec3Files, "html/Inspection/");
let sec4Files = fs.readdirSync(".\\html\\Lubrication");
prependAll(sec4Files, "html/Lubrication/");
let sec5Files = fs.readdirSync(".\\html\\Repairs");
prependAll(sec5Files, "html/Repairs/");
let sec6Files = fs.readdirSync(".\\html\\Limitations");
prependAll(sec6Files, "html/Limitations/");

let allFiles = [];
allFiles = allFiles.concat(sec1Files);
allFiles = allFiles.concat(sec2Files);
allFiles = allFiles.concat(sec3Files);
allFiles = allFiles.concat(sec4Files);
allFiles = allFiles.concat(sec5Files);
allFiles = allFiles.concat(sec6Files);

import { DocSection } from '../code/DocSection.mjs'
import { DocDef } from '../docDefs/DocDef_802.mjs'

let docDefFiles = [];
/**
 * 
 * @param {DocSection} section 
 * @param {*} fileReferenceArray 
 */
let getSectionFiles = (section, fileReferenceArray) => {
  if (section.HasContent) {
    fileReferenceArray.push({
      "SectionNumber": section.SectionNumber,
      "FileUrl": section.ContentFileUrl
    });
  }
  section.Sections.forEach(s => {
    getSectionFiles(s, fileReferenceArray);
  });
}
getSectionFiles(DocDef, docDefFiles);


let res = [];
for (let i = 0; i < allFiles.length; i++) {
  let fName = allFiles[i];
  let isUsed = false;
  let whereUsed = "";
  for (let j = 0; j < docDefFiles.length; j++) {
    if (allFiles[i] == docDefFiles[j].FileUrl) {
      isUsed = true;
      whereUsed = docDefFiles[j].SectionNumber;
      break; //should probably make it possible to find multiple uses
    }
  }
  res.push({
    fName,
    isUsed
  })
}

console.log("Unused Files:")
let outputFileText = "Unused Files:\n";
for (let i = 0; i < res.length; i++) {
  if (!res[i].isUsed) {
    console.log(res[i].fName);
    outputFileText += res[i].fName + "\n";
  }
}

fs.writeFileSync("DebugReport_HtmlFilesNotUsed.txt", outputFileText, "utf-8")



let breakPoint = 1;