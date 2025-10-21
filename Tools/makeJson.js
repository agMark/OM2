//This file converts from the original javascript doc def to a json file.


import { DocDef } from '../DocDef_402.mjs'

import fs from 'fs'

fs.writeFileSync("jsonDataOut.json",JSON.stringify(DocDef));

console.log("done");