/**
 * compareDiff.js
 *
 * Small word-level diff (LCS-based) for the "highlight differences"
 * experimental toggle in compare.html. Deliberately simple: it diffs the
 * plain visible TEXT of two rendered manual sections, not the HTML/markup,
 * because diffing rich content safely (figures, tables) is a much bigger
 * problem than this prototype needs to solve. Good for short-to-medium
 * sections; on sections with heavy rewording the highlighting can look noisy
 * -- that's expected and called out in the UI as experimental.
 */

function tokenize(text) {
    return text.split(/(\s+)/).filter((t) => t.length > 0);
}

/**
 * @param {string} textA
 * @param {string} textB
 * @returns {{htmlA: string, htmlB: string}} escaped HTML with <span> diff markup
 */
export function diffText(textA, textB) {
    const a = tokenize(textA);
    const b = tokenize(textB);
    const n = a.length;
    const m = b.length;

    // LCS table
    const lcs = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
            lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
        }
    }

    const outA = [];
    const outB = [];
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
        if (a[i] === b[j]) {
            outA.push(escapeHtml(a[i]));
            outB.push(escapeHtml(b[j]));
            i++;
            j++;
        } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
            outA.push(`<span class="omdb-diff-del">${escapeHtml(a[i])}</span>`);
            i++;
        } else {
            outB.push(`<span class="omdb-diff-add">${escapeHtml(b[j])}</span>`);
            j++;
        }
    }
    while (i < n) {
        outA.push(`<span class="omdb-diff-del">${escapeHtml(a[i])}</span>`);
        i++;
    }
    while (j < m) {
        outB.push(`<span class="omdb-diff-add">${escapeHtml(b[j])}</span>`);
        j++;
    }

    return { htmlA: outA.join(""), htmlB: outB.join("") };
}

function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
