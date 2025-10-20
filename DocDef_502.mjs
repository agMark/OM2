//@ts-check
import { DocSection } from './code/DocSection.mjs'
import { def_Sec_0 } from './DocDef_502_0_Intro.mjs'
import { def_Sec_1 } from './DocDef_502_1_Description.mjs'
import { def_Sec_2 } from './DocDef_502_2_Maintenance.mjs'
import { def_Sec_3 } from './DocDef_502_3_Inspections.mjs'
import { def_Sec_4 } from './DocDef_502_4_Lubrication.mjs'
import { def_Sec_5 } from './DocDef_502_5_Repairs.mjs'
import { def_Sec_6 } from './DocDef_502_6_AirworthinessLimitations.mjs'
import { DocVars } from './code/data_vars.mjs'



/**@type {DocSection} */
var DocDef = new DocSection();
DocDef.IsNumbered = false;
DocDef.SectionNumber = "-1";
DocDef.DisplayTitle = false;
DocDef.SectionTitle = "DOCUMENT";
DocDef.HasContent = false;
DocDef.ContentFileUrl = "";
DocDef.Sections = [
    def_Sec_0,
    def_Sec_1,
    def_Sec_2,
    def_Sec_3,
    def_Sec_4,
    def_Sec_5,
    def_Sec_6
];

var docVars= new DocVars();
docVars.vars.DOCNUM = "03-0110";
docVars.vars.SHORTDATE = "3/1/26";
docVars.vars.LONGDATE = "3/1/2026";
docVars.vars.SHORTMODELS = "AT-502A/502B/504";

export { DocDef, def_Sec_1, def_Sec_2, def_Sec_3, def_Sec_4, def_Sec_5, def_Sec_6, docVars}
