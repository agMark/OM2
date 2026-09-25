/**
 * serials.js
 *
 * STUB serial-number -> model/year lookup.
 *
 * There is no real production-database integration for this yet (per project
 * decision: SN just needs to pick which model manual to show, not a specific
 * manual revision). In production, whatever hands off to this app from
 * dashboard.airtractor.com is expected to resolve the owner's serial number
 * and pass along the model directly (e.g. ?sn=... or ?model=...); this table
 * exists purely so the prototype can demonstrate that flow end to end.
 *
 * Real ranges are NOT accurate -- replace with the real production database
 * (or have the caller pass ?model= directly) before this goes live.
 */

const SERIAL_RANGES = [
    { model: "402", label: "AT-402/402A", prefixes: ["402"] },
    { model: "502", label: "AT-502/502A/502B", prefixes: ["502"] },
    { model: "602", label: "AT-602", prefixes: ["602"] },
    { model: "802", label: "AT-802/802A", prefixes: ["802"] },
];

/**
 * @param {string} sn Serial number as entered by the owner, e.g. "802-1234"
 * @returns {{model: string, label: string, serial: string} | null}
 */
export function resolveSerial(sn) {
    if (!sn) return null;
    const clean = String(sn).trim().toUpperCase();
    for (const range of SERIAL_RANGES) {
        for (const prefix of range.prefixes) {
            if (clean.startsWith(prefix)) {
                return { model: range.model, label: range.label, serial: clean };
            }
        }
    }
    return null;
}

export { SERIAL_RANGES };
