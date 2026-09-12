/**
 * Venubi Effects - All UI Enhancement Phases
 * Phase 1: Scroll Reveal
 * Phase 2: Button Effects (Magnetic, Ripple, 3D)
 * Phase 3: Hero Upgrades (Typing, Floating)
 * Phase 4: Card Effects (3D Tilt, Shimmer)
 * Phase 5: Loading States
 * Phase 6: Cursor Glow
 */

// ============================================
// PHASE 1: SCROLL REVEAL SYSTEM
// ============================================
class ScrollReveal {
    constructor() {
        this.elements = document.querySelectorAll('[data-reveal]');
        if (!this.elements.length) return;

        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersect(entries),
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        this.elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            this.observer.observe(el);
        });
    }

    handleIntersect(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.revealDelay || 0;
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, delay);
                this.observer.unobserve(entry.target);
            }
        });
    }
}

// ============================================
// STAT COUNTER ANIMATION (for Bento-Grid)
// ============================================
class StatCounter {
    constructor() {
        this.stats = document.querySelectorAll('[data-count]');
        if (!this.stats.length) return;

        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersect(entries),
            { threshold: 0.5 }
        );

        this.stats.forEach(el => this.observer.observe(el));
    }

    handleIntersect(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.animateCount(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }

    animateCount(el) {
        const target = parseFloat(el.dataset.count);
        const duration = 2000;
        const start = performance.now();
        const isDecimal = target % 1 !== 0;

        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;

            el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                el.textContent = isDecimal ? target.toFixed(1) : target;
            }
        };

        requestAnimationFrame(animate);
    }
}

// ============================================
// PHASE 2: BUTTON EFFECTS
// ============================================
class ButtonEffects {
    constructor() {
        this.buttons = document.querySelectorAll('.btn');
        this.buttons.forEach(btn => {
            this.addMagnetic(btn);
            this.addRipple(btn);
            this.add3D(btn);
        });
    }

    addMagnetic(btn) {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    }

    addRipple(btn) {
        btn.addEventListener('click', (e) => {
            const rect = btn.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'btn-ripple';
            ripple.style.left = `${e.clientX - rect.left}px`;
            ripple.style.top = `${e.clientY - rect.top}px`;
            btn.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    }

    add3D(btn) {
        btn.addEventListener('mousedown', () => {
            btn.style.transform += ' scale(0.97)';
        });
        btn.addEventListener('mouseup', () => {
            btn.style.transform = btn.style.transform.replace(' scale(0.97)', '');
        });
    }
}

// ============================================
// PHASE 3: HERO UPGRADES
// ============================================
class HeroEffects {
    constructor() {
        this.initTyping();
        this.initFloating();
    }

    initTyping() {
        const typingEl = document.querySelector('[data-typing]');
        if (!typingEl) return;

        const text = typingEl.dataset.typing;
        typingEl.textContent = '';
        typingEl.style.borderRight = '2px solid var(--color-primary)';

        let i = 0;
        const type = () => {
            if (i < text.length) {
                typingEl.textContent += text.charAt(i);
                i++;
                setTimeout(type, 80);
            } else {
                // Blink cursor then remove
                setTimeout(() => {
                    typingEl.style.borderRight = 'none';
                }, 2000);
            }
        };

        setTimeout(type, 500);
    }

    initFloating() {
        const floaters = document.querySelectorAll('[data-float]');
        floaters.forEach((el, i) => {
            el.style.animation = `float ${3 + i * 0.5}s ease-in-out infinite`;
            el.style.animationDelay = `${i * 0.2}s`;
        });
    }
}

// ============================================
// PHASE 4: CARD EFFECTS
// ============================================
class CardEffects {
    constructor() {
        this.cards = document.querySelectorAll('.feature-card, .pricing-card, .testimonial-card');
        this.cards.forEach(card => {
            this.add3DTilt(card);
            this.addShimmer(card);
        });
    }

    add3DTilt(card) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    }

    addShimmer(card) {
        const shimmer = document.createElement('div');
        shimmer.className = 'card-shimmer';
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        card.appendChild(shimmer);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            shimmer.style.left = `${x - 100}px`;
            shimmer.style.opacity = '1';
        });

        card.addEventListener('mouseleave', () => {
            shimmer.style.opacity = '0';
        });
    }
}

// ============================================
// PHASE 5: LOADING STATES
// ============================================
class LoadingStates {
    constructor() {
        this.createLoader();
        this.hideLoaderOnLoad();
    }

    createLoader() {
        const loader = document.createElement('div');
        loader.id = 'page-loader';
        loader.innerHTML = `
      <div class="loader-content">
        <div class="loader-spinner"></div>
        <div class="loader-text">Venubi</div>
      </div>
    `;
        document.body.prepend(loader);
    }

    hideLoaderOnLoad() {
        window.addEventListener('load', () => {
            const loader = document.getElementById('page-loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.remove(), 500);
            }
        });
    }
}

// ============================================
// PHASE 6: CURSOR GLOW
// ============================================
class CursorGlow {
    constructor() {
        // Skip on touch devices
        if ('ontouchstart' in window) return;

        this.cursor = document.createElement('div');
        this.cursor.id = 'cursor-glow';
        document.body.appendChild(this.cursor);

        this.pos = { x: 0, y: 0 };
        this.mouse = { x: 0, y: 0 };

        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        this.animate();
    }

    animate() {
        // Smooth follow
        this.pos.x += (this.mouse.x - this.pos.x) * 0.15;
        this.pos.y += (this.mouse.y - this.pos.y) * 0.15;

        this.cursor.style.left = `${this.pos.x}px`;
        this.cursor.style.top = `${this.pos.y}px`;

        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// INITIALIZE ALL EFFECTS
// ============================================
function initEffects() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    new ScrollReveal();
    new StatCounter();
    new ButtonEffects();
    new HeroEffects();
    new CardEffects();
    new LoadingStates();
    new CursorGlow();
}

// Export for ES modules
export { initEffects };
