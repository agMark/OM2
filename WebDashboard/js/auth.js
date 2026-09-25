/**
 * auth.js
 *
 * STUB auth gate for the OM Dashboard prototype.
 *
 * In production this page is expected to be reached only after the real
 * dashboard.airtractor.com login (WordPress) already authenticated the
 * owner/shop and handed control to this app -- see WebDashboard/README.md.
 * There is no real session check here yet.
 *
 * For internal testing, add ?dev=1 to any URL once (or click the button on
 * the gate screen) to set a local bypass flag in this browser. This is
 * intentionally easy to get around -- it is NOT a security boundary, just a
 * convenience so testers aren't blocked. Do not treat this as production auth.
 */

const DEV_FLAG_KEY = "omdash_devBypass";

function hasDevBypass() {
    try {
        if (new URLSearchParams(location.search).get("dev") === "1") {
            localStorage.setItem(DEV_FLAG_KEY, "1");
        }
        return localStorage.getItem(DEV_FLAG_KEY) === "1";
    } catch (e) {
        // localStorage unavailable (e.g. file:// in some browsers) -- fall back to query param only
        return new URLSearchParams(location.search).get("dev") === "1";
    }
}

function hasRealSession() {
    // Placeholder for a real session check once this is wired into
    // dashboard.airtractor.com's auth (e.g. a shared cookie or token).
    return false;
}

export function isAuthed() {
    return hasRealSession() || hasDevBypass();
}

export function isDevBypass() {
    return !hasRealSession() && hasDevBypass();
}

function buildGate(logoSrc) {
    const overlay = document.createElement("div");
    overlay.className = "omdb-gate";
    overlay.innerHTML = `
        <div class="omdb-gate-card">
            <img src="${logoSrc}" alt="Air Tractor" onerror="this.style.display='none'">
            <h2>Sign in required</h2>
            <p>This document library is normally reached through your Air Tractor account
            at dashboard.airtractor.com. This prototype doesn't have that login wired up yet.</p>
            <a class="omdb-btn" href="https://dashboard.airtractor.com/" target="_blank" rel="noopener">Go to Air Tractor Login</a>
            <div class="omdb-gate-note">
                Internal testing only -- bypasses auth entirely, do not ship this button.
                <button class="omdb-btn omdb-btn-secondary" id="omdb-dev-bypass-btn" type="button">Continue for internal testing</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector("#omdb-dev-bypass-btn").addEventListener("click", () => {
        try { localStorage.setItem(DEV_FLAG_KEY, "1"); } catch (e) { /* ignore */ }
        const params = new URLSearchParams(location.search);
        params.set("dev", "1");
        location.search = params.toString();
    });
}

/**
 * Call at the top of a page's script. Blocks the page behind a gate if
 * neither a real session nor the dev bypass flag is present.
 *
 * @param {string} logoSrc path to the AT logo relative to this document
 *   (pages with <base href="../"> should pass "img/AT-Logo1.png"; pages
 *   without a base tag should pass "../img/AT-Logo1.png").
 */
export function requireAuth(logoSrc = "../img/AT-Logo1.png") {
    if (isAuthed()) return true;
    buildGate(logoSrc);
    return false;
}
