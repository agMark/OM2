//@ts-check
import {DocSection} from '../code/DocSection.mjs'

let def_Sec_5_1 = new DocSection().i(true, "5.1", true, "FUSELAGE FRAME REPAIRS", true, "html/Repairs/502/FUSELAGE FRAME REPAIRS_502.html");

let def_Sec_5_2 = new DocSection().i(true, "5.2", true, "FORWARD CLAMP BLOCK BOLT FAILURE", true, "html/Repairs/502/FORWARD CLAMP BLOCK BOLT FAILURE_502.html");

let def_Sec_5_3 = new DocSection().i(true, "5.3", true, "MAJOR STRUCTURAL DAMAGE", true, "html/Repairs/502/MAJOR STRUCTURAL DAMAGE_502.html");

let def_Sec_5_4 = new DocSection().i(true, "5.4", true, "MAIN LANDING GEAR SPRINGS", true, "html/Repairs/502/MAIN LANDING GEAR SPRINGS_502.html");

let def_Sec_5_5 = new DocSection().i(true, "5.5", true, "WATER IMMERSION", true, "html/Repairs/502/WATER IMMERSION_502.html");

let def_Sec_5_6_1 = new DocSection().i(true, "5.6.1", true, "Horizontal Stabilizer Strut Fitting", true, "html/Repairs/502/Horizontal Stabilizer Strut Fitting_502.html");
def_Sec_5_6_1.CustomClass = "breakBefore";

let def_Sec_5_6_2 = new DocSection().i(true, "5.6.2", true, "Main Gear Attach Tube Cracks", true, "html/Repairs/502/Main Gear Attach Tube Cracks_502.html");
def_Sec_5_6_2.CustomClass = "breakBefore";

let def_Sec_5_6_3 = new DocSection().i(true, "5.6.3", true, "Forward Lower Longeron", true, "html/Repairs/502/Forward Lower Longeron_502.html");
def_Sec_5_6_3.CustomClass = "breakBefore";

let def_Sec_5_6_4 = new DocSection().i(true, "5.6.4", true, "Fuselage Frame Aft Section", true, "html/Repairs/502/Fuselage Frame Aft Section_502.html");
def_Sec_5_6_4.CustomClass = "breakBefore";

let def_Sec_5_6_5 = new DocSection().i(true, "5.6.5", true, "Wing Main Spar Splice", true, "html/Repairs/502/Wing Main Spar Splice_502.html");
def_Sec_5_6_5.CustomClass = "breakBefore";

let def_Sec_5_6_6 = new DocSection().i(true, "5.6.6", true, "Leading Edge Rib", true, "html/Repairs/502/Leading Edge Rib_502.html");
def_Sec_5_6_6.CustomClass = "breakBefore";

let def_Sec_5_6_7 = new DocSection().i(true, "5.6.7", true, "Additional Wing Inspection Holes", true, "html/Repairs/502/Additional Wing Inspection Holes_502.html");
def_Sec_5_6_7.CustomClass = "breakBefore";

let def_Sec_5_6_8 = new DocSection().i(true, "5.6.8", true, "Oversized Horizontal Stabilizer Attach Holes", true, "html/Repairs/502/Oversized Horizontal Stabilizer Attach Holes_502.html");
def_Sec_5_6_8.CustomClass = "breakBefore";

let def_Sec_5_6_9 = new DocSection().i(true, "5.6.9", true, "Elevator / Rudder Hinge", true, "html/Repairs/502/Elevator - Rudder Hinge_502.html");
def_Sec_5_6_9.CustomClass = "breakBefore";

let def_Sec_5_6_10 = new DocSection().i(true, "5.6.10", true, "Tail Wheel Lock Bushing", true, "html/Repairs/502/Tail Wheel Lock Bushing_502.html");
def_Sec_5_6_10.CustomClass = "breakBefore";

let def_Sec_5_6_11 = new DocSection().i(true, "5.6.11", true, "Hopper Brace", true, "html/Repairs/502/Hopper Brace_502.html");
def_Sec_5_6_11.CustomClass = "breakBefore";

let def_Sec_5_6_12 = new DocSection().i(true, "5.6.12", true, "Front Section", true, "html/Repairs/502/Front Section_502.html");
def_Sec_5_6_12.CustomClass = "breakBefore";

let def_Sec_5_6_13 = new DocSection().i(true, "5.6.13", true, "Wing Attach Angle Replacement", true, "html/Repairs/502/Wing Attach Angle Replacement.html");
def_Sec_5_6_13.CustomClass = "breakBefore";

let def_Sec_5_6_50 = new DocSection().i(true, "5.6.50", true, "Minor Skin Damage", true, "html/Repairs/502/Minor Skin Damage_502.html");
def_Sec_5_6_50.CustomClass = "breakBefore";

let def_Sec_5_6_51 = new DocSection().i(true, "5.6.51", true, "Control Surface Skin Repairs", true, "html/Repairs/502/Control Surface Skin Repairs_502.html");
def_Sec_5_6_51.CustomClass = "breakBefore";

let def_Sec_5_6 = new DocSection().i(true, "5.6", true, "STANDARD STRUCTURAL REPAIRS", true, "html/Repairs/502/STANDARD STRUCTURAL REPAIRS_502.html");
def_Sec_5_6.s([
    def_Sec_5_6_1,
    def_Sec_5_6_2,
    def_Sec_5_6_3,
    def_Sec_5_6_4,
    def_Sec_5_6_5,
    def_Sec_5_6_6,
    def_Sec_5_6_7,
    def_Sec_5_6_8,
    def_Sec_5_6_9,
    def_Sec_5_6_10,
    def_Sec_5_6_11,
    def_Sec_5_6_12,
    def_Sec_5_6_13,
    def_Sec_5_6_50,
    def_Sec_5_6_51
]);

let def_Sec_5 = new DocSection().i(true, "5", true, "REPAIRS", false, "", "page-break-before:always;");
def_Sec_5.s([
    def_Sec_5_1,
    def_Sec_5_2,
    def_Sec_5_3,
    def_Sec_5_4,
    def_Sec_5_5,
    def_Sec_5_6
]);
def_Sec_5.SetElementId("Sec_5");
def_Sec_5.CustomClass = "sectionRepairs";


export {def_Sec_5}