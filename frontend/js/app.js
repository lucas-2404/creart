// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('[data-link]');
    const views = document.querySelectorAll('.view');
    const menuBtn = document.querySelector('.header__menu-btn');
    const navMenu = document.querySelector('.header__nav');

    // Navigation logic
    function navigateTo(viewId) {
        // Hide all views
        views.forEach(view => {
            view.classList.remove('active-view');
        });

        // Show target view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active-view');
            window.scrollTo(0, 0);
        }

        // Update active nav links
        document.querySelectorAll('.header__menu a').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.link === viewId) {
                link.classList.add('active');
            }
        });

        // Close mobile menu if open
        if (navMenu.classList.contains('open')) {
            toggleMenu();
        }
    }

    // Attach click events to nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Check if clicking logo, navigate to inicio
            const targetLink = e.currentTarget;
            const viewId = targetLink.dataset.link;
            
            navigateTo(viewId);
        });
    });

    // Mobile Menu Toggle
    function toggleMenu() {
        menuBtn.classList.toggle('open');
        navMenu.classList.toggle('open');
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', toggleMenu);
    }

    // Initial load route
    navigateTo('inicio');
});
