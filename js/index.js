document.addEventListener('DOMContentLoaded', () => {
    const conceptTriggers = document.querySelectorAll('#concept-svg .concept-trigger');
    const conceptContents = document.querySelectorAll('#concept-text .concept-content');

    // The initial state, where "何为大六壬" is shown, is handled by the default HTML.
    // The code that previously forced "阴阳" to be active on load has been removed.

    conceptTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const concept = trigger.dataset.concept;

            // Update SVG active state
            conceptTriggers.forEach(t => t.classList.remove('active-svg'));
            trigger.classList.add('active-svg');

            // Update text content active state
            conceptContents.forEach(content => {
                // We need to hide all content panels first, including the default one.
                content.classList.remove('active-concept');
            });
            // Then, we show the one corresponding to the clicked concept.
            document.querySelector(`.concept-content[data-concept="${concept}"]`).classList.add('active-concept');
        });
    });
});
