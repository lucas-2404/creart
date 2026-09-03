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
        if (navMenu && navMenu.classList.contains('open')) {
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
        if (!menuBtn || !navMenu) return;
        const isOpen = menuBtn.classList.toggle('open');
        navMenu.classList.toggle('open');
        document.body.classList.toggle('no-scroll', isOpen);
        menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', toggleMenu);
    }

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu && navMenu.classList.contains('open')) {
            if (!navMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                toggleMenu();
            }
        }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('open')) {
            toggleMenu();
        }
    });

    // Initial load route
    navigateTo('inicio');
});
