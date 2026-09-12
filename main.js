/**
 * Venubi - Main JavaScript
 * Shared functionality across all pages.
 */

import { ElectricBackground } from './electric-bg.js';
import { initEffects } from './effects.js';

// Initialize Charging Loader
initChargingLoader();

// Initialize Electric Background after loader
document.addEventListener('DOMContentLoaded', () => {
    // Initialize background animation
    const bg = new ElectricBackground('electric-bg');

    // Initialize mobile navigation
    initMobileNav();

    // Initialize FAQ accordion (if present)
    initAccordion();

    // Initialize contact form (if present)
    initContactForm();

    // Initialize Theme Explosion
    initThemeExplosion(bg);

    // Initialize UI Effects (scroll reveal, buttons, cards, cursor glow, etc.)
    initEffects();
});

/**
 * Charging Loader Animation
 * Animates V logo fill and percent counter, then reveals page
 */
function initChargingLoader() {
    const loader = document.getElementById('charging-loader');
    if (!loader) return;

    // Arm the hero intro: elements hide now, animate in once the loader clears.
    document.body.classList.add('intro-armed');

    const percentEl = loader.querySelector('.percent-value');
    const statusEl = loader.querySelector('.loader-status');
    const wFill = loader.querySelector('.loader-w-fill');

    // Measure the actual path so the fill always completes, whatever the logo shape is
    let strokeLength = 142;
    if (wFill && typeof wFill.getTotalLength === 'function') {
        strokeLength = wFill.getTotalLength();
        wFill.style.strokeDasharray = strokeLength;
        wFill.style.strokeDashoffset = strokeLength;
    }

    let percent = 0;
    const duration = 2500; // 2.5 seconds loading
    const start = performance.now();

    function animate(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        const eased = 1 - Math.pow(1 - progress, 3);
        percent = Math.floor(eased * 100);

        // Update percent display
        if (percentEl) percentEl.textContent = percent;

        // Update V stroke fill
        if (wFill) {
            wFill.style.strokeDashoffset = strokeLength * (1 - eased);
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Loading complete
            completeLoading();
        }
    }

    function completeLoading() {
        // Change status text
        if (statusEl) {
            statusEl.classList.add('complete');
            statusEl.innerHTML = '<span class="status-text">Bereit!</span>';
        }

        // Wait a moment, then hide loader
        setTimeout(() => {
            loader.classList.add('loaded');

            // Play the hero intro animation as the loader fades away
            document.body.classList.add('intro-ready');

            // Remove loader from DOM after transition
            setTimeout(() => {
                loader.remove();
            }, 600);
        }, 500);
    }

    // Start animation
    requestAnimationFrame(animate);
}

/** 
 * Theme Shock Wave Logic 
 * Creates a radial electric shock wave from button position
 */
function initThemeExplosion(bgInstance) {
    const toggleBtn = document.getElementById('theme-explode');
    if (!toggleBtn) return;

    // Supernova shock front
    const shockWave = document.createElement('div');
    shockWave.id = 'shock-wave';
    document.body.appendChild(shockWave);

    // Full-screen flash that peaks with the explosion
    const novaFlash = document.createElement('div');
    novaFlash.id = 'nova-flash';
    document.body.appendChild(novaFlash);

    const THEME_KEY = 'venubi-theme';
    let isLight = localStorage.getItem(THEME_KEY) === 'light';
    let busy = false;

    // Restore the saved theme on load so the choice survives page navigation
    if (isLight) {
        document.body.classList.add('theme-light');
        if (bgInstance && bgInstance.setTheme) {
            bgInstance.setTheme(true);
        }
    }

    toggleBtn.addEventListener('click', () => {
        if (busy) return; // ignore rapid re-clicks mid-explosion
        busy = true;

        // Get button position for explosion origin
        const rect = toggleBtn.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top + rect.height / 2;

        // Size needed to cover the whole screen from the origin
        const maxDistance = Math.max(
            Math.hypot(originX, originY),
            Math.hypot(window.innerWidth - originX, originY),
            Math.hypot(originX, window.innerHeight - originY),
            Math.hypot(window.innerWidth - originX, window.innerHeight - originY)
        );
        const waveSize = maxDistance * 2.5;

        // Position shock front at the button
        shockWave.style.left = `${originX}px`;
        shockWave.style.top = `${originY}px`;
        shockWave.style.width = `${waveSize}px`;
        shockWave.style.height = `${waveSize}px`;

        // Aim the full-screen flash at the same origin
        novaFlash.style.setProperty('--nova-x', `${originX}px`);
        novaFlash.style.setProperty('--nova-y', `${originY}px`);

        // Trigger both animations
        shockWave.classList.remove('active');
        novaFlash.classList.remove('active');
        void shockWave.offsetWidth; // force reflow
        shockWave.classList.add('active');
        novaFlash.classList.add('active');

        // Reverse the colors at the peak of the flash
        setTimeout(() => {
            isLight = !isLight;
            document.body.classList.toggle('theme-light', isLight);
            localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark');
            if (bgInstance && bgInstance.setTheme) {
                bgInstance.setTheme(isLight);
            }
        }, 260);

        // Clean up
        setTimeout(() => {
            shockWave.classList.remove('active');
            novaFlash.classList.remove('active');
            busy = false;
        }, 1150);
    });
}

/**
 * Mobile Navigation Toggle
 */
function initMobileNav() {
    const toggle = document.querySelector('.header__mobile-toggle');
    const nav = document.querySelector('.header__nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        toggle.setAttribute('aria-expanded', nav.classList.contains('active'));
    });

    // Close nav when clicking on a link
    const navLinks = nav.querySelectorAll('.header__nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !toggle.contains(e.target)) {
            nav.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

/**
 * FAQ Accordion
 */
function initAccordion() {
    const accordionItems = document.querySelectorAll('.accordion__item');

    if (!accordionItems.length) return;

    accordionItems.forEach(item => {
        const button = item.querySelector('.accordion__button');

        if (!button) return;

        button.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all items
            accordionItems.forEach(i => i.classList.remove('active'));

            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/**
 * Contact Form, Web3Forms submission
 * Handles submit via fetch, shows loading / success / error states.
 * Drop your free access key into the hidden "access_key" field in contact.html.
 */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const statusEl = document.getElementById('form-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const keyField = form.querySelector('input[name="access_key"]');
    const accessKey = keyField ? keyField.value.trim() : '';
    const keyMissing = !accessKey || accessKey.indexOf('DEIN_WEB3FORMS') !== -1;

    const setStatus = (msg, type) => {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.className = 'form-status form-status--' + type + ' is-visible';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Infrastructure ready, but no key configured yet
        if (keyMissing) {
            setStatus('Der Formularversand ist gerade nicht aktiv. Bitte versuch es später noch einmal.', 'error');
            return;
        }

        const payload = Object.fromEntries(new FormData(form).entries());
        const originalLabel = submitBtn ? submitBtn.textContent : '';

        setStatus('Wird gesendet …', 'loading');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('is-loading');
            submitBtn.textContent = 'Wird gesendet …';
        }

        try {
            const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                form.reset();
                setStatus('Danke! Eure Anfrage ist angekommen. Wir melden uns mit Terminvorschlägen.', 'success');
            } else {
                setStatus('Das hat leider nicht geklappt. Bitte versuch es gleich noch einmal.', 'error');
            }
        } catch (err) {
            setStatus('Verbindungsfehler. Bitte versuch es später noch einmal.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('is-loading');
                submitBtn.textContent = originalLabel;
            }
        }
    });
}
