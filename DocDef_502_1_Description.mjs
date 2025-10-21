//@ts-check

import { DocSection } from './code/DocSection.mjs'


let def_Sec_1_0_1 = new DocSection().i(true, "1.0.1", true, "CERTIFICATION BASIS", true, `html/Description/502/CERTIFICATION BASIS_502.html`);
let def_Sec_1_0_2 = new DocSection();
def_Sec_1_0_2
    .i(true, "1.0.2", true, "INSTRUCTIONS FOR CONTINUED AIRWORTHINESS (ICA's)", true, "html/Description/INSTRUCTIONS FOR CONTINUED AIRWORTHINESS.html")
    .s([
        new DocSection().i(false, "", false, "", true, "html/Description/502/502OM.html", "break-after: avoid"),
        new DocSection().i(false, "", false, "", true, "html/Description/ADDRESS AIR TRACTOR.html", "padding-left: 5em;"),
        new DocSection().i(false, "", false, "", true, "html/Description/502/502 SERVICE LETTERS.html", "break-after: avoid"),
        new DocSection().i(false, "", false, "", true, "html/Description/ADDRESS AIR TRACTOR.html", "padding-left: 5em;"),
        new DocSection().i(false, "", false, "", true, "html/Description/MANUAL PROPELLER.html", "break-after: avoid"),
        new DocSection().i(false, "", false, "", true, "html/Description/ADDRESS HARTZELL.html", "padding-left: 5em;"),
        new DocSection().i(false, "", false, "", true, "html/Description/502/MANUAL PT6A_15AG.html", "break-after: avoid"),
        new DocSection().i(false, "", false, "", true, "html/Description/ADDRESS PWC.html", "padding-left: 5em;"),
        new DocSection().i(false, "", false, "", true, "html/Description/502/MANUAL PT6A_34AG.html", "break-after: avoid"),
        new DocSection().i(false, "", false, "", true, "html/Description/ADDRESS PWC.html", "padding-left: 5em;"),
        new DocSection().i(false, "", false, "", true, "html/Description/502/MANUAL PT6A_45R.html", "break-after: avoid"),
        new DocSection().i(false, "", false, "", true, "html/Description/ADDRESS PWC.html", "padding-left: 5em;"),
        new DocSection().i(false, "", false, "", true, "html/Description/502/MANUAL PT6A_60AG.html", "break-after: avoid"),
        new DocSection().i(false, "", false, "", true, "html/Description/ADDRESS PWC.html", "padding-left: 5em;"),
        new DocSection().i(false, "", false, "", true, "html/Description/502/MANUAL PT6A_65AG.html", "break-after: avoid"),
        new DocSection().i(false, "", false, "", true, "html/Description/ADDRESS PWC.html", "padding-left: 5em;"),
        new DocSection().i(false, "", false, "", true, "html/Description/502/MANUAL PT6A_140AG.html", "break-after: avoid"),
        new DocSection().i(false, "", false, "", true, "html/Description/ADDRESS PWC.html", "padding-left: 5em;")
    ]);
let def_Sec_1_0 = new DocSection();
def_Sec_1_0
    .i(true, "1.0", true, "GENERAL INFORMATION AND REFERENCES", true, "html/Description/502/GENERAL INFORMATION AND REFERENCES_502.html")
    .s([def_Sec_1_0_1, def_Sec_1_0_2]);

let def_Sec_1_30 = new DocSection();
def_Sec_1_30
    .i(true, "1.30", true, "CONTROL SYSTEMS", false, "")
    .s([
        new DocSection().i(true, "1.30.1", true, "Aileron and Elevator Controls", true, "html/Description/502/Aileron and Elevator Controls_502.html"),
        new DocSection().i(true, "1.30.2", true, "Elevator Trim Controls", true, "html/Description/502/Elevator and Trim Controls_502.html"),
        new DocSection().i(true, "1.30.3", true, "Electric Aileron Trim Tab", true, "html/Description/502/Electric Aileron Trim Tab_502.html"),
        new DocSection().i(true, "1.30.4", true, "Rudder Controls", true, "html/Description/502/Rudder Controls_502.html"),
        new DocSection().i(true, "1.30.6", true, "Aileron - Rudder Interconnect System", true, "html/Description/502/Aileron - Rudder Interconnect System_502.html"),
        new DocSection().i(true, "1.30.7", true, "Elevator - Flap Interconnect System", true, "html/Description/502/Elevator - Flap Interconnect System_502.html")
    ]);
let def_Sec_1_35 = new DocSection();
def_Sec_1_35
    .i(true, "1.35", true, "DISPERSAL SYSTEM", true, "html/Description/502/Dispersal System_502.html");
let def_Sec_1_40 = new DocSection();
def_Sec_1_40
    .i(true, "1.40", true, "ELECTRICAL SYSTEM", false, "")
    .s([
        new DocSection().i(true, "1.40.1", true, "Starter-Generator System", true, "html/Description/502/Starter Generator System_502.html"),
        new DocSection().i(true, "1.40.2", true, "Batteries", true, "html/Description/502/Batteries_502.html")
    ]);
let def_Sec_1_50 = new DocSection();
def_Sec_1_50
    .i(true, "1.50", true, "ENGINE", true, "html/Description/502/Engine_502.html")
    .s([
        new DocSection().i(true, "1.50.1", true, "Induction System", true, "html/Description/502/Induction System_502.html"),
        new DocSection().i(true, "1.50.2", true, "Exhaust System", true, "html/Description/502/Exhaust System_502.html")
    ]);
let def_Sec_1_55 = new DocSection();
def_Sec_1_55
    .i(true, "1.55", true, "ENGINE CONTROLS", true, "html/Description/502/Engine Controls_502.html")
    .s([
        new DocSection().i(true, "1.55.1", true, "Air Tractor Throttle Quadrant", true, "html/Description/502/Air Tractor Throttle Quadrant_502.html"),
        new DocSection().i(true, "1.55.2", true, "Kawak Throttle Quadrant", true, "html/Description/502/Kawak Throttle Quadrant_502.html")
    ]);
let def_Sec_1_56_1 = new DocSection();
def_Sec_1_56_1
    .i(true, "1.56.1", true, "Analog Engine Instruments", false, "")
    .s([
        new DocSection().i(false, "", true, "Fuel Gauges", true, "html/Description/502/Fuel Gauges_502.html"),
        new DocSection().i(false, "", true, "ITT Gauge", true, "html/Description/502/ITT Gauge_502.html"),
        new DocSection().i(false, "", true, "Gas Generator Tachometer", true, "html/Description/502/Gas Generator Tachometer_502.html"),
        new DocSection().i(false, "", true, "Oil Pressure Gauge", true, "html/Description/502/Oil Pressure Gauge_502.html"),
        new DocSection().i(false, "", true, "Oil Temperature Gauge", true, "html/Description/502/Oil Temperature Gauge_502.html"),
        new DocSection().i(false, "", true, "Propeller Tachometer", true, "html/Description/502/Propeller Tachometer_502.html"),
        new DocSection().i(false, "", true, "Torque-Meter", true, "html/Description/502/Torque-Meter_502.html"),
        new DocSection().i(false, "", true, "Volt-Ammeter and Voltmeter", true, "html/Description/502/Volt-Ammeter and Voltmeter_502.html")
    ]);
let def_Sec_1_56 = new DocSection();
def_Sec_1_56
    .i(true, "1.56", true, "ENGINE INSTRUMENTS", false, "")
    .s([
        def_Sec_1_56_1,
        new DocSection().i(true, "1.56.2", true, "MVP-50T Digital Instruments", true, "html/Description/502/MVP-50T_502.html"),
        new DocSection().i(true, "1.56.3", true, "Low Fuel Warning Light System", true, "html/Description/502/Low Fuel Warning Light System_502.html"),
    ]);
let def_Sec_1_70 = new DocSection();
def_Sec_1_70
    .i(true, "1.70", true, "FLAPS", true, "html/Description/502/FLAPS_502.html")
    .s([
        new DocSection().i(true, "1.70.1", true, "Flap Actuator", true, "html/Description/502/Flap Actuator_502.html")
    ]);

let def_Sec_1_85 = new DocSection();
def_Sec_1_85
    .i(true, "1.85", true, "INSTRUMENTS", true, "html/Description/502/INSTRUMENTS_502.html")
    .s([
        new DocSection().i(true, "1.85.1", true, "Altimeter", true, "html/Description/502/Altimeter_502.html"),
        new DocSection().i(true, "1.85.2", true, "Airspeed Indicator", true, "html/Description/502/Airspeed Indicator_502.html"),
        new DocSection().i(true, "1.85.3", true, "Compass", true, "html/Description/502/Compass_502.html"),
        new DocSection().i(true, "1.85.4", true, "Attitude Indicator", true, "html/Description/502/Attitude Indicator_502.html")        
    ]);

let def_Sec_1_90 = new DocSection();
def_Sec_1_90
    .i(true, "1.90", true, "LANDING GEAR AND BRAKES", true, "html/Description/502/Landing Gear and Brakes_502.html");

let def_Sec_1_95 = new DocSection();
def_Sec_1_95
    .i(true, "1.95", true, "PROPELLER AND GOVERNOR", true, "html/Description/502/Propellor and Governor_502.html");

let def_Sec_1_100 = new DocSection();
def_Sec_1_100
    .i(true, "1.100", true, "WINGS", true, "html/Description/502/Wings_502.html");

let def_Sec_1 = new DocSection();
def_Sec_1
    .i(true, "1", true, "DESCRIPTION", false, "")
    .s([
        def_Sec_1_0,
        new DocSection().i(true, "1.10", true, "AILERONS", true, "html/Description/502/AILERONS_502.html"),
        new DocSection().i(true, "1.15", true, "AIR CONDITIONER", true, "html/Description/502/AIR CONDITIONER_502.html"),
        new DocSection().i(true, "1.20", true, "COCKPIT", true, "html/Description/502/COCKPIT_502.html"),
        new DocSection().i(true, "1.25", true, "COCKPIT HEATER", true, "html/Description/502/COCKPIT HEATER_502.html"),
        def_Sec_1_30,
        def_Sec_1_35,
        def_Sec_1_40,
        new DocSection().i(true, "1.45", true, "EMPENNAGE", true, "html/Description/502/EMPENNAGE_502.html"),
        def_Sec_1_50,
        def_Sec_1_55,
        def_Sec_1_56,
        new DocSection().i(true, "1.60", true, "FCU MANUAL OVERRIDE", true, "html/Description/502/FCU MANUAL OVERRIDE_502.html"),
        new DocSection().i(true, "1.65", true, "FIRE RETARDANT DISPERSAL SYSTEM (FRDS)", true, "html/Description/502/FIRE RETARDANT DISPERSAL SYSTEM_502.html"),
        def_Sec_1_70,
        new DocSection().i(true, "1.75", true, "FUEL SYSTEM", true, "html/Description/502/Fuel System_502.html"),
        new DocSection().i(true, "1.80", true, "FUSELAGE", true, "html/Description/502/FUSELAGE_502.html"),
        def_Sec_1_85,
        def_Sec_1_90,
        def_Sec_1_95,
        def_Sec_1_100
    ])
    .SetElementId("Sec_1")
    .CustomClass = "sectionDescription";



export { def_Sec_1 }