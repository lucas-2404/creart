// js/faq.js
(function () {
    'use strict';

    /**
     * Initialises the FAQ accordion.
     * - Only one item open at a time.
     * - Uses max-height trick for smooth CSS transition.
     * - Fully keyboard-accessible (Enter / Space via native <button>).
     */
    function initFaqAccordion() {
        const accordion = document.querySelector('.accordion');
        if (!accordion) return;

        const items = accordion.querySelectorAll('.accordion__item');

        items.forEach(function (item) {
            const trigger = item.querySelector('.accordion__trigger');
            const panel   = item.querySelector('.accordion__panel');

            if (!trigger || !panel) return;

            trigger.addEventListener('click', function () {
                const isAlreadyOpen = item.classList.contains('is-open');

                // Close ALL items first (accordion behaviour: one open at a time)
                items.forEach(function (otherItem) {
                    if (otherItem.classList.contains('is-open')) {
                        closeItem(otherItem);
                    }
                });

                // If the clicked item was not open, open it
                if (!isAlreadyOpen) {
                    openItem(item);
                }
            });
        });
    }

    function openItem(item) {
        const panel   = item.querySelector('.accordion__panel');
        const trigger = item.querySelector('.accordion__trigger');

        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');

        // Measure real height then animate
        panel.style.maxHeight = panel.scrollHeight + 'px';
    }

    function closeItem(item) {
        const panel   = item.querySelector('.accordion__panel');
        const trigger = item.querySelector('.accordion__trigger');

        item.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = '0';
    }

    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFaqAccordion);
    } else {
        initFaqAccordion();
    }
})();
