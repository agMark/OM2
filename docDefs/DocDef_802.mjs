//@ts-check
import { DocSection } from '../code/DocSection.mjs'
import { def_Sec_0 } from '../docDefs/DocDef_802_0_Intro.mjs'
import { def_Sec_1 } from '../docDefs/DocDef_802_1_Description.mjs'
import { def_Sec_2 } from '../docDefs/DocDef_802_2_Maintenance.mjs'
import { def_Sec_3 } from '../docDefs/DocDef_802_3_Inspections.mjs'
import { def_Sec_4 } from '../docDefs/DocDef_802_4_Lubrication.mjs'
import { def_Sec_5 } from '../docDefs/DocDef_802_5_Repairs.mjs'
import { def_Sec_6 } from '../docDefs/DocDef_802_6_AirworthinessLimitations.mjs'
import { DocVars } from '../code/data_vars.mjs'



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
docVars.vars.DOCNUM = "03-0121";
docVars.vars.SHORTDATE = "9/1/25";
docVars.vars.LONGDATE = "9/1/2025";
docVars.vars.SHORTMODELS = "AT-802/802A";



export { DocDef, def_Sec_1, def_Sec_2, def_Sec_3, def_Sec_4, def_Sec_5, def_Sec_6, docVars}
