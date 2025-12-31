/**
 * Mobile Navigation Menu Script
 * Works on all pages with .mobile-menu-toggle, .mobile-close-btn, and .nav-links elements
 */

document.addEventListener('DOMContentLoaded', function () {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileClose = document.getElementById('mobile-close-btn');
    const navLinks = document.getElementById('nav-links');

    // Open mobile menu
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function () {
            navLinks.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Close mobile menu
    if (mobileClose && navLinks) {
        mobileClose.addEventListener('click', function () {
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Close on link click
    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Close on escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});
