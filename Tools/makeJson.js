//This file converts from the original javascript doc def to a json file.
import fs from 'fs'

console.log("Loading 402");
import { DocDef as DocDef402} from '../docDefs/DocDef_402.mjs'
console.log("Writing 402");
fs.writeFileSync("json402.json",JSON.stringify(DocDef402));
console.log("Done");


console.log("Loading 502");
import { DocDef as DocDef502} from '../docDefs/DocDef_502.mjs'
console.log("Writing 502");
fs.writeFileSync("json502.json",JSON.stringify(DocDef502));
console.log("Done");

console.log("Loading 602");
import { DocDef as DocDef602} from '../docDefs/DocDef_602.mjs'
console.log("Writing 602");
fs.writeFileSync("json602.json",JSON.stringify(DocDef602));
console.log("Done");

console.log("Loading 802");
import { DocDef as DocDef802} from '../docDefs/DocDef_802.mjs'
console.log("Writing 402");
fs.writeFileSync("json802.json",JSON.stringify(DocDef802));
console.log("Done");

console.log("Done with all.");