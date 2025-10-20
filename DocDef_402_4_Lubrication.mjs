//@ts-check
import {DocSection} from './code/DocSection.mjs'


let def_Sec_4_1 = new DocSection().i(true, "4.1", true, "GREASE AND LUBRICANTS", true, "html/Lubrication/GREASE AND LUBRICANTS.html");


let def_Sec_4_2_1 = new DocSection().i(true, "4.2.1", true, "Daily", true, "html/Lubrication/Daily.html");
let def_Sec_4_2_2 = new DocSection().i(true, "4.2.2", true, "Weekly", true, "html/Lubrication/Weekly.html");
let def_Sec_4_2_3 = new DocSection().i(true, "4.2.3", true, "Every 100 Hours", true, "html/Lubrication/100 Hour.html");
let def_Sec_4_2_4 = new DocSection().i(true, "4.2.4", true, "Every 12 Months", true, "html/Lubrication/12 Month.html");
let def_Sec_4_2 = new DocSection().i(true, "4.2", true, "LUBRICATION SCHEDULE", true, "html/Lubrication/LUBRICATION SCHEDULE.html");
def_Sec_4_2.s([
    def_Sec_4_2_1,
    def_Sec_4_2_2,
    def_Sec_4_2_3,
    def_Sec_4_2_4
]);




let def_Sec_4 = new DocSection().i(true, "4", true, "LUBRICATION", false, "", "page-break-before:always;");
def_Sec_4.s([
    def_Sec_4_1,
    def_Sec_4_2
]);
def_Sec_4.SetElementId("Sec_4");
def_Sec_4.CustomClass = "sectionLubrication";


export {def_Sec_4}