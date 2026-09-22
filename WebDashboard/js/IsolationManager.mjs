/**
 * IsolationManager.mjs
 * Centralized logic for HTML Manual Section Isolation
 */

export function toggleIsolate(targetId, iconElement) {
    const contentContainer = document.getElementById('contentTarget');
    // Clean the ID (handles "#Sec_3" or "Sec_3")
    const cleanId = targetId.replace('#', '').trim();
    const targetElement = document.getElementById(cleanId);
    
    if (!targetElement) {
        console.error(`Isolation Error: ID "${cleanId}" not found.`);
        return;
    }

    const isActivating = !iconElement.classList.contains('active');
    const tocItems = document.querySelectorAll('#webToc li');
    const allIcons = document.querySelectorAll('.isolate-btn');

    // 1. Reset UI States
    allIcons.forEach(btn => btn.classList.remove('active'));
    tocItems.forEach(li => li.classList.remove('toc-inactive'));

    if (isActivating) {
        // 2. Activate Isolation
        iconElement.classList.add('active');
        document.body.classList.add('omdb-isolating');

        // Find every rendered section wrapper, numbered or not (see
        // sectionMarkers.mjs -- unnumbered sections like the Intro chapter
        // have no "Sec_" id, so they're tagged separately).
        const allSections = contentContainer.querySelectorAll('[data-omdb-section="true"]');

        allSections.forEach(section => {
            // Keep visible: the target itself, its ancestors (for context), and
            // its own descendants (they're part of "that section"). Everything
            // else -- siblings, cousins, unrelated chapters -- gets hidden.
            const isTarget = section === targetElement;
            const isAncestor = section.contains(targetElement);
            const isDescendant = targetElement.contains(section);
            if (isTarget || isAncestor || isDescendant) {
                section.classList.remove('hidden-section');
            } else {
                section.classList.add('hidden-section');
            }
        });

        // 3. Update TOC Visuals
        tocItems.forEach(li => {
            if (!li.contains(iconElement)) {
                li.classList.add('toc-inactive');
            }
        });

        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        // 4. Deactivate: Show All
        resetManualView();
    }
}

export function resetManualView() {
    const contentContainer = document.getElementById('contentTarget');
    contentContainer.querySelectorAll('.hidden-section').forEach(el => {
        el.classList.remove('hidden-section');
    });
    document.querySelectorAll('.isolate-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#webToc li').forEach(li => li.classList.remove('toc-inactive'));
    document.body.classList.remove('omdb-isolating');
}