//@ts-check

import { DocSection } from '../code/DocSection.mjs'

let defSec_2_0_1 = new DocSection().i(true, "2.0.1", true, "Towing", true, "html/Maintenance/602/Towing_602.html");
let defSec_2_0_2 = new DocSection().i(true, "2.0.2", true, "Tie Down Instructions", true, "html/Maintenance/602/Tie Down Instructions_602.html");
let defSec_2_0_3 = new DocSection().i(true, "2.0.3", true, "Storage", true, "html/Maintenance/602/Storage_602.html");
let defSec_2_0_4 = new DocSection().i(true, "2.0.4", true, "Lifting and Jacking", true, "html/Maintenance/602/Lifting and Jacking_602.html");
let defSec_2_0_5 = new DocSection().i(true, "2.0.5", true, "Leveling", true, "html/Maintenance/602/Leveling_602.html");
let defSec_2_0_6 = new DocSection().i(true, "2.0.6", true, "Weight and Balance", true, "html/Maintenance/602/Weight and Balance_602.html");
let defSec_2_0_7 = new DocSection().i(true, "2.0.7", true, "Standard Torque and Bolt Installation", true, "html/Maintenance/602/TORQUE VALUES AND GUIDANCE FOR BOLT INSTALLATION_602.html");
let defSec_2_0_8 = new DocSection().i(true, "2.0.8", true, "Special Tools and Equipment", true, "html/Maintenance/602/Special Tools and Equipment_602.html");
let defSec_2_0_9 = new DocSection().i(true, "2.0.9", true, "Unapproved Parts", true, "html/Maintenance/602/Unapproved Parts_602.html");
let defSec_2_0_10 = new DocSection().i(true, "2.0.10", true, "Operational Best Practices", true, "html/Maintenance/602/Operational Best Practices_602.html");
let defSec_2_0_11 = new DocSection().i(true, "2.0.11", true, "Emergency and Normal Procedures", true, "html/Maintenance/602/Emergency and Normal Procedures_602.html");
let defSec_2_0_12 = new DocSection().i(true, "2.0.12", true, "Alterations", true, "html/Maintenance/602/Alterations_602.html");
let defSec_2_0_13 = new DocSection().i(true, "2.0.13", true, "Qualification of Personnel", true, "html/Maintenance/602/Qualification of Personnel_602.html");

let def_Sec_2_0 = new DocSection();
def_Sec_2_0
    .i(true, "2.0", true, "GENERAL", true, "html/Maintenance/602/Introduction_602.html")
    .s([
        defSec_2_0_1,
        defSec_2_0_2,
        defSec_2_0_3,
        defSec_2_0_4,
        defSec_2_0_5,
        defSec_2_0_6,
        defSec_2_0_7,
        defSec_2_0_8,
        defSec_2_0_9,
        defSec_2_0_10,
        defSec_2_0_11,
        defSec_2_0_12,
        defSec_2_0_13
    ]);





let defSec_2_10_1 = new DocSection().i(true, "2.10.1", true, "Ailerons", true, "html/Maintenance/602/Ailerons_602.html");
let defSec_2_10_2 = new DocSection().i(true, "2.10.2", true, "Reserved", false, ""); //"Aileron Counterweights_602.html"
let defSec_2_10_3 = new DocSection().i(true, "2.10.3", true, "Aileron and Flap Bellcranks and Supports", true, "html/Maintenance/602/Aileron and Flap Bellcranks and Supports_602.html"); //was "Aileron Supports and Bellcranks_602.html"
let def_Sec_2_10 = new DocSection();
def_Sec_2_10
    .i(true, "2.10", true, "AILERONS", false, "")
    .s([
        defSec_2_10_1,
        defSec_2_10_2,
        defSec_2_10_3
    ]);





let defSec_2_15_1 = new DocSection().i(true, "2.15.1", true, "Cautionary Information", true, "html/Maintenance/602/Cautionary Information_602.html");
let defSec_2_15_2 = new DocSection().i(true, "2.15.2", true, "R134a and PAG Oil Precautions", true, "html/Maintenance/602/R134a Information_602.html");
let defSec_2_15_3 = new DocSection().i(true, "2.15.3", true, "Approved Oil and Refrigerants", true, "html/Maintenance/602/Approved Oil and Refrigerants_602.html");
let defSec_2_15_4 = new DocSection().i(true, "2.15.4", true, "Common Causes of Compressor Failure", true, "html/Maintenance/602/Common Causes of Compressor Failure_602.html");
let defSec_2_15_5 = new DocSection().i(true, "2.15.5", true, "Diagnosis of Compressor Failure", true, "html/Maintenance/602/Diagnosis of Compressor Failure_602.html");
let defSec_2_15_6 = new DocSection().i(true, "2.15.6", true, "Compressor Removal and Replacement", true, "html/Maintenance/602/Compressor Replacement_602.html");
let defSec_2_15_7 = new DocSection().i(true, "2.15.7", true, "Belt Tensioning", true, "html/Maintenance/602/Belt Tensioning_602.html");
let defSec_2_15_8 = new DocSection().i(true, "2.15.8", true, "Service Procedures - Flushing", true, "html/Maintenance/602/Flushing_602.html");
let defSec_2_15_9 = new DocSection().i(true, "2.15.9", true, "Service Procedures - Evacuation", true, "html/Maintenance/602/Evacuation_602.html");
let defSec_2_15_10 = new DocSection().i(true, "2.15.10", true, "Service Procedures - Charging", true, "html/Maintenance/602/Charging_602.html");
let defSec_2_15_11 = new DocSection().i(true, "2.15.11", true, "Service Procedures - Oiling", true, "html/Maintenance/602/Oiling_602.html");
let defSec_2_15_12 = new DocSection().i(true, "2.15.12", true, "Service Procedures - Contamination Check", true, "html/Maintenance/602/Contamination Check_602.html");
let defSec_2_15_13 = new DocSection().i(true, "2.15.13", true, "Compressor Cooling", true, "html/Maintenance/602/AC Compressor Cooling_602.html");
let def_Sec_2_15 = new DocSection();
def_Sec_2_15
    .i(true, "2.15", true, "AIR CONDITIONER", true, "html/Maintenance/602/ENGINE DRIVEN AIR CONDITIONER_602.html")
    .s([
        defSec_2_15_1,
        defSec_2_15_2,
        defSec_2_15_3,
        defSec_2_15_4,
        defSec_2_15_5,
        defSec_2_15_6,
        defSec_2_15_7,
        defSec_2_15_8,
        defSec_2_15_9,
        defSec_2_15_10,
        defSec_2_15_11,
        defSec_2_15_12,
        defSec_2_15_13
    ]);




let defSec_2_20_1 = new DocSection().i(true, "2.20.1", true, "Cockpit Cleaning and Maintenance", true, "html/Maintenance/602/Cockpit Cleaning and Maintenance_602.html");
let defSec_2_20_2 = new DocSection().i(true, "2.20.2", true, "Amsafe Airbag System", true, "html/Maintenance/602/Amsafe Airbag System_602.html");
let defSec_2_20_3 = new DocSection().i(true, "2.20.3", true, "Cockpit Fire Extinguisher", true, "html/Maintenance/602/Cockpit Fire Extinguisher_602.html");
let defSec_2_20_4 = new DocSection().i(true, "2.20.4", true, "Impact Risks and Sharp Edges", true, "html/Maintenance/602/Impact Risks and Sharp Edges_602.html");
let defSec_2_20_5 = new DocSection().i(true, "2.20.5", true, "Cockpit Controls", true, "html/Maintenance/602/COCKPIT CONTROLS_602.html");
let def_Sec_2_20 = new DocSection();
def_Sec_2_20
    .i(true, "2.20", true, "COCKPIT", false, "")
    .s([
        defSec_2_20_1,
        defSec_2_20_2,
        defSec_2_20_3,
        defSec_2_20_4,
        defSec_2_20_5
    ]);



let def_Sec_2_25 = new DocSection();
def_Sec_2_25
    .i(true, "2.25", true, "RESERVED", false, "")
    .s([

    ]);


let defSec_2_30_1 = new DocSection().i(true, "2.30.1", true, "Aileron Rigging ", true, "html/Maintenance/602/Aileron Rigging_602.html");
let defSec_2_30_2 = new DocSection().i(true, "2.30.2", true, "Aileron - Rudder Interconnect System Rigging", true, "html/Maintenance/602/Aileron - Rudder Interconnect System Rigging_602.html");
let defSec_2_30_3 = new DocSection().i(true, "2.30.3", true, "Aileron Boost Tab Trim and Rigging", true, "html/Maintenance/602/Aileron Boost Tab Trim and Rigging_602.html");
let defSec_2_30_4 = new DocSection().i(true, "2.30.4", true, "Elevator Controls", true, "html/Maintenance/602/Elevator Controls_602.html");
let defSec_2_30_5 = new DocSection().i(true, "2.30.5", true, "Elevator Trim Tab Controls", true, "html/Maintenance/602/Elevator Trim Tab Controls_602.html");
let defSec_2_30_6 = new DocSection().i(true, "2.30.6", true, "Elevator - Flap Interconnect System Rigging", true, "html/Maintenance/602/Elevator - Flap Interconnect System Rigging_602.html");
let defSec_2_30_7 = new DocSection().i(true, "2.30.7", true, "Rudder Controls", true, "html/Maintenance/602/Rudder Controls_602.html");
let defSec_2_30_8 = new DocSection().i(true, "2.30.8", true, "Rudder Trim Controls", true, "html/Maintenance/602/Rudder Trim Controls_602.html");
let def_Sec_2_30 = new DocSection();
def_Sec_2_30
    .i(true, "2.30", true, "CONTROL SYSTEMS", true, "html/Maintenance/602/Control Systems_602.html")
    .s([
        defSec_2_30_1,
        defSec_2_30_2,
        defSec_2_30_3,
        defSec_2_30_4,
        defSec_2_30_5,
        defSec_2_30_6,
        defSec_2_30_7,
        defSec_2_30_8
    ]);


let def_Sec_2_31 = new DocSection().i(true, "2.31", true, "CONTROL SURFACE UNBALANCE LIMITS", true, "html/Maintenance/602/CONTROL SURFACE UNBALANCE LIMITS_602.html");




let defSec_2_35_1 = new DocSection().i(true, "2.35.1", true, "Hopper Tanks", true, "html/Maintenance/602/Hopper Tanks_602.html");
let defSec_2_35_2 = new DocSection().i(true, "2.35.2", true, "Hopper Gate Box and Adapter", true, "html/Maintenance/602/Hopper Gate Box and Adapter_602.html");
let defSec_2_35_3 = new DocSection().i(true, "2.35.3", true, "Hopper Lid", true, "html/Maintenance/602/Hopper Lid_602.html");
let defSec_2_35_4 = new DocSection().i(true, "2.35.4", true, "Gate Box Controls", true, "html/Maintenance/602/Gate Box Controls_602.html");
let defSec_2_35_5 = new DocSection().i(true, "2.35.5", true, "Spray Lever Controls", true, "html/Maintenance/602/Spray Lever Controls_602.html");
let defSec_2_35_6 = new DocSection().i(true, "2.35.6", true, "Spray Pump", true, "html/Maintenance/602/Spray Pump_602.html");
let defSec_2_35_7 = new DocSection().i(true, "2.35.7", true, "Spray Plumbing", true, "html/Maintenance/602/Spray Plumbing_602.html");
let defSec_2_35_8 = new DocSection().i(true, "2.35.8", true, "Bottom- Load Plumbing", true, "html/Maintenance/602/Bottom - Load Plumbing_602.html");
let defSec_2_35_9 = new DocSection().i(true, "2.35.9", true, "Spray Nozzles", true, "html/Maintenance/602/Spray Nozzles_602.html");
let defSec_2_35_10 = new DocSection().i(true, "2.35.10", true, "Filling the Hopper Tanks", true, "html/Maintenance/602/Filling the Hopper Tanks_602.html");
let defSec_2_35_11 = new DocSection().i(true, "2.35.11", true, "Minimizing Spray System Corrosion", true, "html/Maintenance/602/Minimizing Spray System Corrosion_602.html");
let defSec_2_35_12 = new DocSection().i(true, "2.35.12", true, "Support Hangers and Straps", true, "html/Maintenance/602/Support Hangers and Straps_602.html");
let defSec_2_35_13 = new DocSection().i(true, "2.35.13", true, "Hopper Rinse System", true, "html/Maintenance/602/Hopper Rinse System_602.html");
let defSec_2_35_14 = new DocSection().i(true, "2.35.14", true, "Automatic Flagman Installations", true, "html/Maintenance/602/Automatic Flagman Installations_602.html");

let def_Sec_2_35 = new DocSection();
def_Sec_2_35
    .i(true, "2.35", true, "DISPERSAL EQUIPMENT", false, "")
    .s([
        defSec_2_35_1,
        defSec_2_35_2,
        defSec_2_35_3,
        defSec_2_35_4,
        defSec_2_35_5,
        defSec_2_35_6,
        defSec_2_35_7,
        defSec_2_35_8,
        defSec_2_35_9,
        defSec_2_35_10,
        defSec_2_35_11,
        defSec_2_35_12,
        defSec_2_35_13,
        defSec_2_35_14
    ]);




let defSec_2_40_1 = new DocSection().i(true, "2.40.1", true, "General", true, "html/Maintenance/602/Electrical System General_602.html");
let defSec_2_40_2 = new DocSection().i(true, "2.40.2", true, "Starting / Charging / Power Distribution", true, "html/Maintenance/602/Starting and Charging_602.html");
let defSec_2_40_3 = new DocSection().i(true, "2.40.3", true, "Charging System Troubleshooting", true, "html/Maintenance/602/Charging System Troubleshooting_602.html");
let defSec_2_40_4 = new DocSection().i(true, "2.40.4", true, "Low-Voltage Warning Light", true, "html/Maintenance/602/Low-Voltage Warning Light_602.html");
let defSec_2_40_5 = new DocSection().i(true, "2.40.5", true, "Electrical Fuel Boost Pump", true, "html/Maintenance/602/Electrical Fuel Boost Pump_602.html");
let defSec_2_40_6 = new DocSection().i(true, "2.40.6", true, "Propeller Overspeed Solenoid", true, "html/Maintenance/602/Propeller Overspeed Solenoid_602.html");
let defSec_2_40_7 = new DocSection().i(true, "2.40.7", true, "Stall-Warning Horn", true, "html/Maintenance/602/Stall-Warning Horn_602.html");
let defSec_2_40_8 = new DocSection().i(true, "2.40.8", true, "Windshield Washer", true, "html/Maintenance/602/Windshield Washer_602.html");
let defSec_2_40_9 = new DocSection().i(true, "2.40.9", true, "Windshield Wiper", true, "html/Maintenance/602/Windshield Wiper_602.html");
let defSec_2_40_10 = new DocSection().i(true, "2.40.10", true, "Cockpit Lighting", true, "html/Maintenance/602/Cockpit Lighting_602.html");
let defSec_2_40_11 = new DocSection().i(true, "2.40.11", true, "Reserved", false, "");
let defSec_2_40_12 = new DocSection().i(true, "2.40.12", true, "Flap Light", true, "html/Maintenance/602/Flap Light_602.html");
let defSec_2_40_13 = new DocSection().i(true, "2.40.13", true, "Position (Nav) and Strobe Lights", true, "html/Maintenance/602/Nav and Strobe Lights_602.html");
let defSec_2_40_14 = new DocSection().i(true, "2.40.14", true, "Taxi Lights", true, "html/Maintenance/602/Taxi Lights_602.html");
let defSec_2_40_15 = new DocSection().i(true, "2.40.15", true, "Night Working Lights", true, "html/Maintenance/602/Night Working Lights_602.html");
let defSec_2_40_16 = new DocSection().i(true, "2.40.16", true, "Oil Cooler Blower", true, "html/Maintenance/602/Oil Cooler Blower_602.html");
let defSec_2_40_50 = new DocSection().i(true, "2.40.50", true, "Starter Generator Removal", true, "html/Maintenance/602/Starter Generator Removal_602.html");
let defSec_2_40_51 = new DocSection().i(true, "2.40.51", true, "Starter Generator Installation", true, "html/Maintenance/602/Starter Generator Installation_602.html");
let defSec_2_40_52 = new DocSection().i(true, "2.40.52", true, "Starter Generator Brush Inspection", true, "html/Maintenance/602/Starter Generator Brush Inspection_602.html");
let defSec_2_40_60 = new DocSection().i(true, "2.40.60", true, "Batteries", true, "html/Maintenance/602/Batteries_602.html")
let defSec_2_40_61 = new DocSection().i(true, "2.40.61", true, "Checking Batteries", true, "html/Maintenance/602/Checking the Batteries_602.html")
let defSec_2_40_62 = new DocSection().i(true, "2.40.62", true, "Battery Removal and Replacement", true, "html/Maintenance/602/Battery Removal and Replacement_602.html")
let defSec_2_40_63 = new DocSection().i(true, "2.40.63", true, "Installing a New Dry Charged Battery", true, "html/Maintenance/602/Installing a New Gill Dry Charged Battery_602.html")
let def_Sec_2_40 = new DocSection();
def_Sec_2_40
    .i(true, "2.40", true, "ELECTRICAL SYSTEM", false, "html/Maintenance/602/ELECTRICAL SYSTEM_602.html")
    .s([
        defSec_2_40_1,
        defSec_2_40_2,
        defSec_2_40_3,
        defSec_2_40_4,
        defSec_2_40_5,
        defSec_2_40_6,
        defSec_2_40_7,
        defSec_2_40_8,
        defSec_2_40_9,
        defSec_2_40_10,
        defSec_2_40_11,
        defSec_2_40_12,
        defSec_2_40_13,
        defSec_2_40_14,
        defSec_2_40_15,
        defSec_2_40_16,
        defSec_2_40_50,
        defSec_2_40_51,
        defSec_2_40_52,
        defSec_2_40_60,
        defSec_2_40_61,
        defSec_2_40_62,
        defSec_2_40_63
    ]);




let defSec_2_45_1 = new DocSection().i(true, "2.45.1", true, "Horizontal Stabilizers", true, "html/Maintenance/602/Horizontal Stabilizers_602.html");
let defSec_2_45_2 = new DocSection().i(true, "2.45.2", true, "Horizontal Stabilizer Struts", true, "html/Maintenance/602/Horizontal Stabilizer Struts_602.html");
let defSec_2_45_3 = new DocSection().i(true, "2.45.3", true, "Horizontal Stabilizer Rigging", true, "html/Maintenance/602/Horizontal Stabilizer Rigging_602.html");
let defSec_2_45_4 = new DocSection().i(true, "2.45.4", true, "Elevators ", true, "html/Maintenance/602/Elevators_602.html");
let defSec_2_45_5 = new DocSection().i(true, "2.45.5", true, "Elevator Removal and Replacement ", true, "html/Maintenance/602/Elevator Removal_602.html");
let defSec_2_45_6 = new DocSection().i(true, "2.45.6", true, "Elevator Trim Tabs", true, "html/Maintenance/602/Elevator Trim Tabs_602.html");
let defSec_2_45_7 = new DocSection().i(true, "2.45.7", true, "Vertical Fin", true, "html/Maintenance/602/Vertical Fin_602.html");
let defSec_2_45_8 = new DocSection().i(true, "2.45.8", true, "Rudder", true, "html/Maintenance/602/Rudder_602.html");
let defSec_2_45_9 = new DocSection().i(true, "2.45.9", true, "Rudder Removal and Replacement", true, "html/Maintenance/602/Rudder Removal and Replacement_602.html");
let defSec_2_45_10 = new DocSection().i(true, "2.45.10", true, "Rudder Trim Tab", true, "html/Maintenance/602/Rudder Trim Tab_602.html");
let defSec_2_45_11 = new DocSection().i(true, "2.45.11", true, "Deflector Cable", true, "html/Maintenance/602/Deflector Cable_602.html");
let defSec_2_45_12 = new DocSection().i(true, "2.45.12", true, "Rudder and Elevator Bearing Replacement", true, "html/Maintenance/602/Rudder and Elevator Bearing Replacement_602.html");
let def_Sec_2_45 = new DocSection();
def_Sec_2_45
    .i(true, "2.45", true, "EMPENNAGE", false, "")
    .s([
        defSec_2_45_1,
        defSec_2_45_2,
        defSec_2_45_3,
        defSec_2_45_4,
        defSec_2_45_5,
        defSec_2_45_6,
        defSec_2_45_7,
        defSec_2_45_8,
        defSec_2_45_9,
        defSec_2_45_10,
        defSec_2_45_11,
        defSec_2_45_12
    ]);




let defSec_2_50_1 = new DocSection().i(true, "2.50.1", true, "Cleaning Engine Exterior", true, "html/Maintenance/602/Cleaning Engine Exterior_602.html");
let defSec_2_50_2 = new DocSection().i(true, "2.50.2", true, "Fuel Requirements", true, "html/Maintenance/602/Fuel Requirements_602.html");
let defSec_2_50_3 = new DocSection().i(true, "2.50.3", true, "Fuel Filters", true, "html/Maintenance/602/Fuel Filter Cleaning_602.html");
let defSec_2_50_4 = new DocSection().i(true, "2.50.4", true, "Fuel Header Tank Sump Draining ", true, "html/Maintenance/602/Fuel Header Tank Sump Draining_602.html");
let defSec_2_50_5 = new DocSection().i(true, "2.50.5", true, "Negative Fuel Pressure Warning", true, "html/Maintenance/602/Negative Fuel Pressure Warning_602.html");
let defSec_2_50_6 = new DocSection().i(true, "2.50.6", true, "Fuel Nozzle Cleaning", true, "html/Maintenance/602/Fuel Nozzle Cleaning_602.html");
let defSec_2_50_7 = new DocSection().i(true, "2.50.7", true, "Oil Requirements ", true, "html/Maintenance/602/Oil Requirements_602.html");
let defSec_2_50_8 = new DocSection().i(true, "2.50.8", true, "Oil Filter", true, "html/Maintenance/602/Oil Filter_602.html");
let defSec_2_50_9 = new DocSection().i(true, "2.50.9", true, "Chip Detector", true, "html/Maintenance/602/Chip Detector_602.html");
let defSec_2_50_10 = new DocSection().i(true, "2.50.10", true, "Air Filters", true, "html/Maintenance/602/Air Filters_602.html");
let defSec_2_50_11 = new DocSection().i(true, "2.50.11", true, "Engine-Control Cables", true, "html/Maintenance/602/Engine-Control Cables_602.html");
let defSec_2_50_12 = new DocSection().i(true, "2.50.12", true, "Compressor Washes", true, "html/Maintenance/602/Compressor Washes_602.html");
let defSec_2_50_13 = new DocSection().i(true, "2.50.13", true, "Engine Starting Procedures", true, "html/Maintenance/602/Engine Starting Procedures_602.html");
let defSec_2_50_14 = new DocSection().i(true, "2.50.14", true, "Engine Ground Run Procedures", true, "html/Maintenance/602/Ground Run Procedures_602.html");
let defSec_2_50_15 = new DocSection().i(true, "2.50.15", true, "Engine Removal", true, "html/Maintenance/602/Engine Removal_602.html");
let defSec_2_50_16 = new DocSection().i(true, "2.50.16", true, "Engine Build Up", true, "html/Maintenance/602/Engine Build Up_602.html");
let defSec_2_50_17 = new DocSection().i(true, "2.50.17", true, "Engine Replacement", true, "html/Maintenance/602/Engine Replacement_602.html");
let defSec_2_50_18 = new DocSection().i(true, "2.50.18", true, "Engine Air Plenum", true, "html/Maintenance/602/Engine Air Plenum_602.html");
let defSec_2_50_19 = new DocSection().i(true, "2.50.19", true, "SCEET Flexible Duct Installation and Routing", true, "html/Maintenance/602/SCEET Flexible Duct Installation and Routing_602.html");
let defSec_2_50_20 = new DocSection().i(true, "2.50.20", true, "PT6A-67F engines that are subject to modification by PWC SB14505", true, "html/Maintenance/602/PT6A-67F engines that are subject to modification by PWC SB14505_602.html");
let defSec_2_50_21 = new DocSection().i(true, "2.50.21", true, "Engine Driven Low Pressure Fuel Pump", true, "html/Maintenance/602/Engine Driven Low Pressure Fuel Pump_602.html");
let defSec_2_50_22 = new DocSection().i(true, "2.50.22", true, "Reserved", true, "");
let defSec_2_50_23 = new DocSection().i(true, "2.50.23", true, "Reserved", true, ""); // Was "P3 Air Pressure Tube_602.html"
let defSec_2_50_24 = new DocSection().i(true, "2.50.24", true, "Exhaust Pipe Repair", true, "html/Maintenance/602/Exhaust Pipe Repair_602.html");
let defSec_2_50_40 = new DocSection().i(true, "2.50.40", true, "Air Conditioner Drive Pad",true,"html/Maintenance/602/Air Conditioner Drive Pad_602.html");
let defSec_2_50_41 = new DocSection().i(true, "2.50.41", true, "Air Conditioner Drive Pad Inspection",true,"html/Maintenance/602/Air Conditioner Drive Pad Inspection_602.html");
let defSec_2_50_42 = new DocSection().i(true, "2.50.42", true, "Air Conditioner Drive Pad Overhaul",true,"html/Maintenance/602/Air Conditioner Drive Pad Overhaul_602.html");
let defSec_2_50_50 = new DocSection().i(true, "2.50.50", true, "XFlow Air Filter", true, "html/Maintenance/602/XFlow Air Filter_602.html");
let def_Sec_2_50 = new DocSection();
def_Sec_2_50
    .i(true, "2.50", true, "ENGINE MAINTENANCE", true, "html/Maintenance/602/ENGINE MAINTENANCE_602.html")
    .s([
        defSec_2_50_1,
        defSec_2_50_2,
        defSec_2_50_3,
        defSec_2_50_4,
        defSec_2_50_5,
        defSec_2_50_6,
        defSec_2_50_7,
        defSec_2_50_8,
        defSec_2_50_9,
        defSec_2_50_10,
        defSec_2_50_11,
        defSec_2_50_12,
        defSec_2_50_13,
        defSec_2_50_14,
        defSec_2_50_15,
        defSec_2_50_16,
        defSec_2_50_17,
        defSec_2_50_18,
        defSec_2_50_19,
        defSec_2_50_20,
        defSec_2_50_21,
        defSec_2_50_22,
        defSec_2_50_23,
        defSec_2_50_24,
        defSec_2_50_40,
        defSec_2_50_41,
        defSec_2_50_42,
        defSec_2_50_50
    ]);


let defSec_2_55_1 = new DocSection().i(true, "2.55.1", true, "Power Lever Rigging Procedures", true, "html/Maintenance/602/Power Lever Rigging Procedures_602.html");
let defSec_2_55_2 = new DocSection().i(true, "2.55.2", true, "Propeller Lever Rigging Procedures", true, "html/Maintenance/602/Propeller Lever Rigging Procedures_602.html");
let defSec_2_55_3 = new DocSection().i(true, "2.55.3", true, "Start Control Lever Rigging Procedures", true, "html/Maintenance/602/Start Control Lever Rigging Procedures_602.html");
let defSec_2_55_4 = new DocSection().i(true, "2.55.4", true, "Kawak Throttle Quadrant ", true, "html/Maintenance/602/Kawak Throttle Quadrant_602.html");
let defSec_2_55_5 = new DocSection().i(true, "2.55.5", true, "Air Tractor Quadrant Friction", true, "html/Maintenance/602/Air Tractor Quadrant Friction_602.html");
let def_Sec_2_55 = new DocSection();
def_Sec_2_55
    .i(true, "2.55", true, "ENGINE CONTROLS", false, "")
    .s([
        defSec_2_55_1,
        defSec_2_55_2,
        defSec_2_55_3,
        defSec_2_55_4,
        defSec_2_55_5
    ]);



let defSec_2_56_1 = new DocSection().i(true, "2.56.1", true, "Analog Engine Instruments", true, "html/Maintenance/602/Engine Instruments_602.html");
let defSec_2_56_2 = new DocSection().i(true, "2.56.2", true, "MVP-50T Engine Instrument System", true, "html/Maintenance/602/MVP-50T_602.html");
let defSec_2_56_3 = new DocSection().i(true, "2.56.3", true, "Low Fuel Warning System", true, "html/Maintenance/602/Low Fuel Warning System_602.html");
let defSec_2_56_4 = new DocSection().i(true, "2.56.4", true, "Analog Engine Instrument Calibration", true, "html/Maintenance/602/Analog Engine Instrument Calibration_602.html");
let defSec_2_56_5 = new DocSection().i(true, "2.56.5", true, "MVP-50T Engine Instrument Calibration", true, "html/Maintenance/602/MVP50T Engine Instrument Calibration_602.html")
let def_Sec_2_56 = new DocSection();
def_Sec_2_56
    .i(true, "2.56", true, "ENGINE INSTRUMENTS", false, "")
    .s([
        defSec_2_56_1,
        defSec_2_56_2,
        defSec_2_56_3,
        defSec_2_56_4,
        defSec_2_56_5
    ]);


let defSec_2_60_1 = new DocSection().i(true, "2.60.1", true, "FCU Manual Override Rigging", true, "html/Maintenance/602/FCU Manual Override Rigging_602.html");
let def_Sec_2_60 = new DocSection();
def_Sec_2_60
    .i(true, "2.60", true, "FCU MANUAL OVERRIDE", false, "")
    .s([
        defSec_2_60_1
    ]);


let def_Sec_2_65 = new DocSection();
def_Sec_2_65
    .i(true, "2.65", true, "FIRE RETARDANT DISPERSAL SYSTEM", true, "html/Maintenance/602/FIRE RETARDANT DISPERSAL SYSTEM_602.html")
    .s([
    ]);


let defSec_2_70_1 = new DocSection().i(true, "2.70.1", true, "Flap Removal", true, "html/Maintenance/602/Flap Removal_602.html");
let defSec_2_70_2 = new DocSection().i(true, "2.70.2", true, "Flap Installation", true, "html/Maintenance/602/Flap Installation_602.html");
let defSec_2_70_3 = new DocSection().i(true, "2.70.3", true, "Flap Rigging", true, "html/Maintenance/602/Flap Rigging_602.html");
let defSec_2_70_4 = new DocSection().i(true, "2.70.4", true, "Reserved", false, "");
let defSec_2_70_5 = new DocSection().i(true, "2.70.5", true, "Flap Actuator Troubleshooting", true, "html/Maintenance/602/Flap Actuator Troubleshooting_602.html");
let defSec_2_70_6 = new DocSection().i(true, "2.70.6", true, "Flap Motor Troubleshooting", true, "html/Maintenance/602/Flap Motor Troubleshooting_602.html");
let defSec_2_70_7 = new DocSection().i(true, "2.70.7", true, "Flap Relay Troubleshooting", true, "html/Maintenance/602/Flap Relay Troubleshooting_602.html");
let defSec_2_70_8 = new DocSection().i(true, "2.70.8", true, "Flap Actuator Removal Instructions", true, "html/Maintenance/602/Flap Actuator Removal Instructions_602.html");
let defSec_2_70_9 = new DocSection().i(true, "2.70.9", true, "Flap Actuator Installation Instructions", true, "html/Maintenance/602/Flap Actuator Installation Instructions_602.html");
let defSec_2_70_10 = new DocSection().i(true, "2.70.10", true, "C100168-4 Flap Actuator Maintenance", true, "html/Maintenance/602/Flap Actuator_602.html");
let defSec_2_70_11 = new DocSection().i(true, "2.70.11", true, "71112-1 Flap Actuator Maintenance", true, "html/Maintenance/602/71112 Flap Actuator_602.html");
let defSec_2_70_12 = new DocSection().i(true, "2.70.12", true, "Flap Relay Upgrade", true, "html/Maintenance/602/Flap Relay Upgrade_602.html");
let defSec_2_70_51 = new DocSection().i(true, "2.70.51", true, "Inspection of B100-6 Coupling used on C100168-4 Actuators", true, "html/Maintenance/602/Flap Motor Coupler and Inspection_602.html");
let defSec_2_70_52 = new DocSection().i(true, "2.70.52", true, "Inspection of Flap Torque Tube Attachment (SL347 and AD 2021-05-14)", true, "html/Maintenance/602/Flap Torque Tube Attachment_602.html");
let defSec_2_70_53 = new DocSection().i(true, "2.70.53", true, "Inspection of Flap Drive System Free Play Inspection", true, "html/Maintenance/602/Flap Drive System Free Play Inspection_602.html");
let def_Sec_2_70 = new DocSection();
def_Sec_2_70
    .i(true, "2.70", true, "FLAPS", true, "html/Maintenance/602/Flaps_602.html")
    .s([
        defSec_2_70_1,
        defSec_2_70_2,
        defSec_2_70_3,
        defSec_2_70_4,
        defSec_2_70_5,
        defSec_2_70_6,
        defSec_2_70_7,
        defSec_2_70_8,
        defSec_2_70_9,
        defSec_2_70_10,
        defSec_2_70_11,
        defSec_2_70_12,
        defSec_2_70_51,
        defSec_2_70_52,
        defSec_2_70_53
    ]);

let defSec_2_75_1 = new DocSection().i(true, "2.75.1", true, "Fuel Tanks", true, "html/Maintenance/602/Fuel Tanks_602.html");
let defSec_2_75_2 = new DocSection().i(true, "2.75.2", true, "Fuel Tank Sealing", true, "html/Maintenance/602/Fuel Tank Sealing_602.html");
let defSec_2_75_5 = new DocSection().i(true, "2.75.5", true, "Fuel System Drains", true, "html/Maintenance/602/Fuel System Drains_602.html");
let defSec_2_75_6 = new DocSection().i(true, "2.75.6", true, "Fuel System Screens and Filters", true, "html/Maintenance/602/Fuel System Screens and Filters_602.html");
let defSec_2_75_7 = new DocSection().i(true, "2.75.7", true, "Airframe Electric Fuel Boost Pump", true, "html/Maintenance/602/Airframe Fuel Pump_602.html");
let defSec_2_75_8 = new DocSection().i(true, "2.75.8", true, "Fuel Tank Placards", true, "html/Maintenance/602/Fuel Tank Placards_602.html");
let defSec_2_75_9 = new DocSection().i(true, "2.75.9", true, "Ferry Fuel System", true, "html/Maintenance/602/Ferry Fuel System_602.html");
let defSec_2_75_10 = new DocSection().i(true, "2.75.10", true, "Fuel Selector Valve", true, "html/Maintenance/602/Fuel Selector Valve_602.html");
let defSec_2_75_20 = new DocSection().i(true, "2.75.20", true, "Fuel Tank Quantity System Senders - Resistive", true, "html/Maintenance/602/Fuel Tank Senders_602.html");
let defSec_2_75_21 = new DocSection().i(true, "2.75.21", true, "Reserved", false, "");
let defSec_2_75_22 = new DocSection().i(true, "2.75.22", true, "Fuel Tank Quantity System Gauges - Analog", true, "html/Maintenance/602/Fuel Tank Receiver_602.html");
let defSec_2_75_23 = new DocSection().i(true, "2.75.23", true, "Fuel Tank Quantity System Gauges - MVP-50T", true, "html/Maintenance/602/MVP Fuel Gauges_602.html");
let def_Sec_2_75 = new DocSection();
def_Sec_2_75
    .i(true, "2.75", true, "FUEL SYSTEM", false, "")
    .s([
        defSec_2_75_1,
        defSec_2_75_2,

        
        defSec_2_75_5,
        defSec_2_75_6,
        defSec_2_75_7,
        defSec_2_75_8,
        defSec_2_75_9,
        defSec_2_75_10,
        defSec_2_75_20,
        defSec_2_75_21,
        defSec_2_75_22,
        defSec_2_75_23
    ]);

let defSec_2_80_1 = new DocSection().i(true, "2.80.1", true, "Fuselage Removable Skins", true, "html/Maintenance/602/Fuselage Removable Skins_602.html");
let defSec_2_80_2 = new DocSection().i(true, "2.80.2", true, "Fuselage Fixed Skins", true, "html/Maintenance/602/Fuselage Fixed Skins_602.html");
let defSec_2_80_3 = new DocSection().i(true, "2.80.3", true, "Fuselage Cockpit Skins", true, "html/Maintenance/602/Fuselage Cockpit Skins_602.html");
let defSec_2_80_4 = new DocSection().i(true, "2.80.4", true, "Fuselage Frame", true, "html/Maintenance/602/Fuselage Frame_602.html");
let defSec_2_80_5 = new DocSection().i(true, "2.80.5", true, "Windshield", true, "html/Maintenance/602/Windshield_602.html");
let defSec_2_80_6 = new DocSection().i(true, "2.80.6", true, "Canopy Doors", true, "html/Maintenance/602/Canopy Doors_602.html");
let defSec_2_80_7 = new DocSection().i(true, "2.80.7", true, "Seat", true, "html/Maintenance/602/Seat_602.html");
let defSec_2_80_8 = new DocSection().i(true, "2.80.8", true, "Engine Mount Inspection", true, "html/Maintenance/602/Engine Mount Inspection_602.html");
let defSec_2_80_9 = new DocSection().i(true, "2.80.9", true, "Baggage Compartment", true, "html/Maintenance/602/Baggage Compartment_602.html");
let def_Sec_2_80 = new DocSection();
def_Sec_2_80
    .i(true, "2.80", true, "FUSELAGE", false, "")
    .s([
        defSec_2_80_1,
        defSec_2_80_2,
        defSec_2_80_3,
        defSec_2_80_4,
        defSec_2_80_5,
        defSec_2_80_6,
        defSec_2_80_7,
        defSec_2_80_8,
        defSec_2_80_9
    ]);


let defSec_2_85_1 = new DocSection().i(true, "2.85.1", true, "Altimeter / Static System", true, "html/Maintenance/602/Altimeter - Static System_602.html");

let defSec_2_85_3 = new DocSection().i(true, "2.85.3", true, "Compass", true, "html/Maintenance/602/Compass Calibration_602.html");
let defSec_2_85_4 = new DocSection().i(true, "2.85.4", true, "Reserved", false, "");
let def_Sec_2_85 = new DocSection();
def_Sec_2_85
    .i(true, "2.85", true, "INSTRUMENTS", false, "")
    .s([
        defSec_2_85_1,

        defSec_2_85_3,
        defSec_2_85_4
    ]);



let defSec_2_90_1 = new DocSection().i(true, "2.90.1", true, "Tire Inflation", true, "html/Maintenance/602/Tire Inflation_602.html");
let defSec_2_90_2 = new DocSection().i(true, "2.90.2", true, "Main Wheels", true, "html/Maintenance/602/Main Wheels_602.html");
let defSec_2_90_3 = new DocSection().i(true, "2.90.3", true, "Main Wheel Alignment", true, "html/Maintenance/602/Main Wheel Alignment_602.html");
let defSec_2_90_4 = new DocSection().i(true, "2.90.4", true, "Main Gear Spring", true, "html/Maintenance/602/Main Gear Spring_602.html");
let defSec_2_90_5 = new DocSection().i(true, "2.90.5", true, "Tail Wheel", true, "html/Maintenance/602/Tail Wheel_602.html");
let defSec_2_90_6 = new DocSection().i(true, "2.90.6", true, "Tail Wheel Fork", true, "html/Maintenance/602/Tail Wheel Fork_602.html");
let defSec_2_90_7 = new DocSection().i(true, "2.90.7", true, "Tail Wheel Fork Housing", true, "html/Maintenance/602/Tail Wheel Fork Housing_602.html");
let defSec_2_90_8 = new DocSection().i(true, "2.90.8", true, "Tail Wheel Lock Pin and Housing", true, "html/Maintenance/602/Tail Wheel Lock Pin and Housing_602.html");
let defSec_2_90_9 = new DocSection().i(true, "2.90.9", true, "Tail Gear Spring", true, "html/Maintenance/602/Tail Gear Spring_602.html");
let defSec_2_90_10 = new DocSection().i(true, "2.90.10", true, "Brake Removal and Replacement", true, "html/Maintenance/602/Brake Removal and Replacement_602.html");
let defSec_2_90_11 = new DocSection().i(true, "2.90.11", true, "Brake Discs", true, "html/Maintenance/602/Brake Discs_602.html");
let defSec_2_90_12 = new DocSection().i(true, "2.90.12", true, "Brake Linings", true, "html/Maintenance/602/Brake Linings_602.html");
let defSec_2_90_13 = new DocSection().i(true, "2.90.13", true, "Brake Master-Cylinders", true, "html/Maintenance/602/Brake Master-Cylinders_602.html");
let defSec_2_90_14 = new DocSection().i(true, "2.90.14", true, "Brake Bleeding", true, "html/Maintenance/602/Brake Bleeding_602.html");
let defSec_2_90_15 = new DocSection().i(true, "2.90.15", true, "Parking Brake", true, "html/Maintenance/602/Parking Brake_602.html");
let defSec_2_90_16 = new DocSection().i(true, "2.90.16", true, "Main and Tail Gear Attach Bolts", true, "html/Maintenance/602/MAIN AND TAIL GEAR ATTACH BOLTS_602.html");
let defSec_2_90_50 = new DocSection().i(true, "2.90.50", true, "Main Gear Spring Block Inspection", true, "html/Maintenance/602/Main Gear Spring Block Inspection_602.html");
let defSec_2_90_70 = new DocSection().i(true, "2.90.70", true, "Master Cylinder Overhaul", true, "html/Maintenance/502/Master Cylinder Overhaul_502.html");
let def_Sec_2_90 = new DocSection();
def_Sec_2_90
    .i(true, "2.90", true, "LANDING GEAR AND BRAKES", false, "")
    .s([
        defSec_2_90_1,
        defSec_2_90_2,
        defSec_2_90_3,
        defSec_2_90_4,
        defSec_2_90_5,
        defSec_2_90_6,
        defSec_2_90_7,
        defSec_2_90_8,
        defSec_2_90_9,
        defSec_2_90_10,
        defSec_2_90_11,
        defSec_2_90_12,
        defSec_2_90_13,
        defSec_2_90_14,
        defSec_2_90_15,
        defSec_2_90_16,
        defSec_2_90_50,
        defSec_2_90_70
    ]);


let defSec_2_95_1 = new DocSection().i(true, "2.95.1", true, "Propeller Removal", true, "html/Maintenance/602/Propeller Removal_602.html");
let defSec_2_95_2 = new DocSection().i(true, "2.95.2", true, "Propeller Replacement", true, "html/Maintenance/602/Propeller Replacement_602.html");
let defSec_2_95_3 = new DocSection().i(true, "2.95.3", true, "Beta System", true, "html/Maintenance/602/Beta System_602.html");
let defSec_2_95_4 = new DocSection().i(true, "2.95.4", true, "Propeller Grease", true, "html/Maintenance/602/Propeller Grease_602.html");
let def_Sec_2_95 = new DocSection();
def_Sec_2_95
    .i(true, "2.95", true, "PROPELLER MAINTENANCE", true, "html/Maintenance/602/PROPELLER MAINTENANCE_602.html")
    .s([
        defSec_2_95_1,
        defSec_2_95_2,
        defSec_2_95_3,
        defSec_2_95_4
    ]);

let defSec_2_100_1 = new DocSection().i(true, "2.100.1", true, "Wing Attachment to Fuselage", true, "html/Maintenance/602/Wing Attachment to Fuselage_602.html");
let defSec_2_100_2 = new DocSection().i(true, "2.100.2", true, "Wing Center Splice Connection", true, "html/Maintenance/602/Wing Center Splice Connection_602.html");
let defSec_2_100_3 = new DocSection().i(true, "2.100.3", true, "Wing Walk", true, "html/Maintenance/602/Wing Walk_602.html");
let def_Sec_2_100 = new DocSection();
def_Sec_2_100
    .i(true, "2.100", true, "WINGS", true, "html/Maintenance/602/WINGS_602.html")
    .s([
        defSec_2_100_1,
        defSec_2_100_2,
        defSec_2_100_3
    ]);


let defSec_2_105_1 = new DocSection().i(true, "2.105.1", true, "Stripping and Repainting Aluminum Parts", true, "html/Maintenance/602/Stripping and Repainting Aluminum Parts_602.html");
let defSec_2_105_2 = new DocSection().i(true, "2.105.2", true, "Priming Aluminum Parts with Chromated Alkyd Primer", true, "html/Maintenance/602/Priming Aluminum Parts with Chromated Alkyd Primer_602.html");
let defSec_2_105_3 = new DocSection().i(true, "2.105.3", true, "Stripping and Repainting Steel Parts", true, "html/Maintenance/602/Stripping and Repainting Steel Parts_602.html");
let defSec_2_105_4 = new DocSection().i(true, "2.105.4", true, "Materials Used for Stripping Painting and Preservation", true, "html/Maintenance/602/Materials Used for Stripping Painting and Preservation_602.html");
let defSec_2_105_5 = new DocSection().i(true, "2.105.5", true, "Corrosion Inspection", true, "html/Maintenance/602/Corrosion Inspection_602.html");
let def_Sec_2_105 = new DocSection();
def_Sec_2_105
    .i(true, "2.105", true, "PAINT AND FINISHES", false, "")
    .s([
        defSec_2_105_1,
        defSec_2_105_2,
        defSec_2_105_3,
        defSec_2_105_4,
        defSec_2_105_5
    ]);

let defSec_2_200_1 = new DocSection().i(true, "2.200.1", true, "Recommended Time Limits", true, "html/Maintenance/602/Recommended Time Limits_602.html");
let defSec_2_200_2 = new DocSection().i(true, "2.200.2", true, "Suggested Time Limits", true, "html/Maintenance/602/Suggested Time Limits_602.html");
let def_Sec_2_200 = new DocSection();
def_Sec_2_200
    .i(true, "2.200", true, "TIME LIMITED PARTS", true, "html/Maintenance/602/TIME LIMITED PARTS_602.html")
    .s([
        defSec_2_200_1,
        defSec_2_200_2
    ]);

let def_Sec_2 = new DocSection().i(true, "2", true, "MAINTENANCE", false, "", "break-before:right;");
def_Sec_2.s([
    def_Sec_2_0,
    def_Sec_2_10,
    def_Sec_2_15,
    def_Sec_2_20,
    def_Sec_2_25,
    def_Sec_2_30,
    def_Sec_2_31,
    def_Sec_2_35,
    def_Sec_2_40,
    def_Sec_2_45,
    def_Sec_2_50,
    def_Sec_2_55,
    def_Sec_2_56,
    def_Sec_2_60,
    def_Sec_2_65,
    def_Sec_2_70,
    def_Sec_2_75,
    def_Sec_2_80,
    def_Sec_2_85,
    def_Sec_2_90,
    def_Sec_2_95,
    def_Sec_2_100,
    def_Sec_2_105,
    def_Sec_2_200
]);
def_Sec_2.CustomClass = "sectionMaintenance";
def_Sec_2.SetElementId("Sec_2");




export { def_Sec_2 }