/**
 * Venubi - Cosmic Background Engine
 * Deep space starfield with parallax depth, drifting nebulae,
 * an orbiting solar system and occasional shooting stars.
 * Smooth, premium, restrained — not too many effects.
 */

// ============================================================
// STAR — a single twinkling point of light in a parallax layer
// ============================================================
class Star {
    constructor(width, height, depth) {
        this.depth = depth; // 0 = far (small/dim), 1 = near (big/bright, more parallax)
        this.baseX = Math.random() * width;
        this.baseY = Math.random() * height;
        this.x = this.baseX;
        this.y = this.baseY;
        this.radius = (Math.random() * 0.9 + 0.3) * (0.6 + depth);
        this.baseAlpha = Math.random() * 0.5 + 0.3;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.phase = Math.random() * Math.PI * 2;
        // Most stars white; a few tinted (cool blue / warm gold)
        const r = Math.random();
        if (r < 0.12) this.color = '185, 164, 255';      // lavender star
        else if (r < 0.20) this.color = '255, 200, 150';  // warm gold star
        else if (r < 0.27) this.color = '150, 190, 255';  // cool blue star
        else this.color = '255, 255, 255';                 // white
        this.glow = this.radius > 1.2 && Math.random() < 0.5;
    }

    update(parallaxX, parallaxY) {
        this.phase += this.twinkleSpeed;
        // Parallax: nearer stars shift more with the mouse
        const shift = (this.depth + 0.2) * 14;
        this.x = this.baseX + parallaxX * shift;
        this.y = this.baseY + parallaxY * shift;
    }

    draw(ctx, light) {
        const alpha = this.baseAlpha * (0.65 + Math.sin(this.phase) * 0.35);
        ctx.beginPath();
        if (light) {
            // Ink dots on paper
            ctx.shadowBlur = 0;
            ctx.fillStyle = `rgba(46, 42, 78, ${alpha * 0.55})`;
        } else {
            if (this.glow) {
                ctx.shadowBlur = 6;
                ctx.shadowColor = `rgba(${this.color}, 0.9)`;
            } else {
                ctx.shadowBlur = 0;
            }
            ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
        }
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============================================================
// PLANET — orbits the central star on an elliptical path
// ============================================================
class Planet {
    constructor(config) {
        this.orbitX = config.orbitX;      // ellipse half-width
        this.orbitY = config.orbitY;      // ellipse half-height
        this.angle = config.angle;
        this.speed = config.speed;        // radians per frame
        this.size = config.size;
        this.color = config.color;
        this.glow = config.glow;
        this.ring = config.ring || false;
    }

    update() {
        this.angle += this.speed;
    }

    draw(ctx, cx, cy, light) {
        const x = cx + Math.cos(this.angle) * this.orbitX;
        const y = cy + Math.sin(this.angle) * this.orbitY;

        // Faint orbit path
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy, this.orbitX, this.orbitY, 0, 0, Math.PI * 2);
        ctx.strokeStyle = light ? 'rgba(60, 58, 92, 0.12)' : 'rgba(160, 160, 220, 0.05)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.stroke();
        ctx.restore();

        // Planet body
        ctx.save();
        const grad = ctx.createRadialGradient(
            x - this.size * 0.3, y - this.size * 0.3, this.size * 0.1,
            x, y, this.size
        );
        if (light) {
            // Inked planet on paper — readable, soft
            ctx.shadowBlur = 6;
            ctx.shadowColor = 'rgba(46, 42, 78, 0.2)';
            grad.addColorStop(0, this.color);
            grad.addColorStop(1, 'rgba(46, 42, 78, 0.6)');
        } else {
            ctx.shadowBlur = 18;
            ctx.shadowColor = this.glow;
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.25, this.color);
            grad.addColorStop(1, 'rgba(0,0,0,0.85)');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Optional ring (Saturn vibe)
        if (this.ring) {
            ctx.shadowBlur = 0;
            ctx.strokeStyle = light ? 'rgba(109, 74, 224, 0.4)' : 'rgba(200, 180, 255, 0.35)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(x, y, this.size * 1.9, this.size * 0.7, -0.5, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
}

// ============================================================
// SHOOTING STAR — rare diagonal comet streak
// ============================================================
class ShootingStar {
    constructor(width, height) {
        this.x = Math.random() * width * 0.8;
        this.y = Math.random() * height * 0.4;
        const angle = Math.PI * 0.18 + Math.random() * 0.25; // shallow downward
        const speed = Math.random() * 6 + 9;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.len = Math.random() * 120 + 90;
        this.life = 1;
        this.decay = 0.012;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        const tailX = this.x - this.vx * (this.len / 12);
        const tailY = this.y - this.vy * (this.len / 12);
        const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${this.life})`);
        grad.addColorStop(0.4, `rgba(185, 164, 255, ${this.life * 0.5})`);
        grad.addColorStop(1, 'rgba(185, 164, 255, 0)');

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(185, 164, 255, 0.8)';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        ctx.restore();
    }
}

// ============================================================
// COSMIC BACKGROUND ENGINE
// (exported as ElectricBackground for drop-in compatibility)
// ============================================================
export class ElectricBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        this.stars = [];
        this.planets = [];
        this.shootingStars = [];
        this.mouse = { x: 0.5, y: 0.5 };      // normalized 0..1
        this.parallax = { x: 0, y: 0 };       // smoothed offset -0.5..0.5
        this.lastShooting = 0;
        this.light = false;

        this.config = {
            bgTop: '#05050f',
            bgBottom: '#03030c',
            isLight: false
        };

        this.init();
    }

    init() {
        this.resize();
        this.buildScene();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.buildNebula();
    }

    buildScene() {
        // Starfield — density scaled to screen area, three depth layers
        const target = Math.min(420, Math.floor((this.width * this.height) / 4200));
        this.stars = [];
        for (let i = 0; i < target; i++) {
            const depth = i / target; // spread across depth layers
            this.stars.push(new Star(this.width, this.height, Math.random()));
        }
        this.stars.sort((a, b) => a.depth - b.depth); // far first

        // Solar system — central star is off to one side for composition
        this.center = { x: this.width * 0.78, y: this.height * 0.28 };
        this.planets = [
            new Planet({ orbitX: 90, orbitY: 34, angle: 0.6, speed: 0.0042, size: 4, color: '#7FB0FF', glow: 'rgba(127,176,255,0.7)' }),
            new Planet({ orbitX: 165, orbitY: 62, angle: 2.1, speed: 0.0026, size: 6, color: '#7B5BE0', glow: 'rgba(123,91,224,0.7)' }),
            new Planet({ orbitX: 250, orbitY: 95, angle: 4.0, speed: 0.0016, size: 5, color: '#FF9E6B', glow: 'rgba(255,158,107,0.6)', ring: true }),
            new Planet({ orbitX: 330, orbitY: 124, angle: 5.4, speed: 0.0011, size: 3.5, color: '#8FE6C2', glow: 'rgba(120,220,180,0.6)' }),
        ];

        // Lone bodies in the lower / side areas so the frame isn't empty away from the sun.
        // The big ringed planet is darkOnly — in light mode it looks too heavy.
        this.lonePlanets = [
            { x: this.width * 0.13, y: this.height * 0.82, size: 26, color: '#9B7DFF', glow: 'rgba(110,134,255,0.55)', ring: true, moon: true, darkOnly: true },
            { x: this.width * 0.93, y: this.height * 0.66, size: 14, color: '#FF9E6B', glow: 'rgba(255,158,107,0.5)' },
            { x: this.width * 0.06, y: this.height * 0.45, size: 10, color: '#7FB0FF', glow: 'rgba(127,176,255,0.5)' },
        ];

        this.buildSketch();
    }

    makeConstellation(px, py, n, rnd) {
        const pts = [];
        for (let i = 0; i < n; i++) {
            pts.push({ x: px, y: py });
            px += rnd(-55, 95);
            py += rnd(-70, 55);
        }
        return pts;
    }

    // Decorative star-chart marks (constellations shared by both themes)
    buildSketch() {
        const rnd = (a, b) => a + Math.random() * (b - a);
        const w = this.width, h = this.height;

        // "+" survey ticks (light mode only) — kept sparse so the page stays airy
        this.plusMarks = [];
        const markCount = Math.floor((w * h) / 260000) + 3;
        for (let i = 0; i < markCount; i++) {
            this.plusMarks.push({ x: rnd(0, w), y: rnd(0, h), s: rnd(3, 6) });
        }

        // A couple of dashed sketch circles (light mode only)
        this.sketchCircles = [];
        for (let i = 0; i < 2; i++) {
            this.sketchCircles.push({ x: rnd(w * 0.08, w * 0.92), y: rnd(h * 0.12, h * 0.92), r: rnd(12, 38) });
        }

        // Constellations — used in BOTH themes, placed in the lower part of the frame
        this.constellations = [
            this.makeConstellation(rnd(w * 0.05, w * 0.22), rnd(h * 0.6, h * 0.78), 6, rnd),
            this.makeConstellation(rnd(w * 0.6, w * 0.82), rnd(h * 0.72, h * 0.88), 5, rnd),
        ];
    }

    buildNebula() {
        // Pre-compute soft nebula clouds (drawn faint each frame)
        this.nebulae = [
            { x: this.width * 0.22, y: this.height * 0.7, r: this.width * 0.45, color: 'rgba(110, 70, 200, 0.10)' },
            { x: this.width * 0.8, y: this.height * 0.35, r: this.width * 0.4, color: 'rgba(190, 60, 180, 0.07)' },
            { x: this.width * 0.55, y: this.height * 0.1, r: this.width * 0.35, color: 'rgba(60, 90, 220, 0.07)' },
        ];
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.buildScene();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX / this.width;
            this.mouse.y = e.clientY / this.height;
        });
    }

    spawnShootingStar() {
        const now = Date.now();
        // Rare: at least 4s apart, ~1.5% chance per frame thereafter
        if (now - this.lastShooting > 4000 && Math.random() < 0.015) {
            this.shootingStars.push(new ShootingStar(this.width, this.height));
            this.lastShooting = now;
        }
    }

    update() {
        // Smoothly ease parallax toward mouse offset (premium drift)
        const targetX = (this.mouse.x - 0.5);
        const targetY = (this.mouse.y - 0.5);
        this.parallax.x += (targetX - this.parallax.x) * 0.04;
        this.parallax.y += (targetY - this.parallax.y) * 0.04;

        this.stars.forEach(s => s.update(this.parallax.x, this.parallax.y));
        this.planets.forEach(p => p.update());

        this.spawnShootingStar();
        this.shootingStars = this.shootingStars.filter(s => {
            s.update();
            return s.life > 0 && s.x < this.width + 200 && s.y < this.height + 200;
        });
    }

    drawNebula() {
        this.nebulae.forEach(n => {
            const grad = this.ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
            grad.addColorStop(0, n.color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(0, 0, this.width, this.height);
        });
    }

    drawGrid() {
        const ctx = this.ctx;
        const step = 46;
        ctx.save();
        ctx.lineWidth = 1;
        // Fine graph-paper lines
        ctx.strokeStyle = 'rgba(60, 58, 92, 0.05)';
        ctx.beginPath();
        for (let x = 0; x <= this.width; x += step) {
            ctx.moveTo(x + 0.5, 0);
            ctx.lineTo(x + 0.5, this.height);
        }
        for (let y = 0; y <= this.height; y += step) {
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(this.width, y + 0.5);
        }
        ctx.stroke();
        // Bolder lines every 5th cell (Blockblatt feel)
        ctx.strokeStyle = 'rgba(60, 58, 92, 0.09)';
        ctx.beginPath();
        for (let x = 0; x <= this.width; x += step * 5) {
            ctx.moveTo(x + 0.5, 0);
            ctx.lineTo(x + 0.5, this.height);
        }
        for (let y = 0; y <= this.height; y += step * 5) {
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(this.width, y + 0.5);
        }
        ctx.stroke();
        ctx.restore();
    }

    // Constellations — drawn in BOTH themes (ink on paper / glowing stars in space)
    drawConstellations(light) {
        const ctx = this.ctx;
        const lineColor = light ? 'rgba(60, 58, 92, 0.16)' : 'rgba(170, 160, 255, 0.13)';
        const nodeColor = light ? 'rgba(60, 58, 92, 0.5)' : 'rgba(222, 216, 255, 0.75)';
        ctx.save();
        ctx.shadowBlur = 0;
        (this.constellations || []).forEach(pts => {
            if (pts.length < 2) return;
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
            ctx.stroke();
            pts.forEach(p => {
                if (!light) {
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = 'rgba(150, 140, 255, 0.8)';
                }
                ctx.fillStyle = nodeColor;
                ctx.beginPath();
                ctx.arc(p.x, p.y, light ? 2.2 : 1.8, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.shadowBlur = 0;
        });
        ctx.restore();
    }

    // Light-mode-only extras: survey "+" ticks and dashed sketch circles
    drawLightExtras() {
        const ctx = this.ctx;
        const ink = (a) => `rgba(60, 58, 92, ${a})`;
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = ink(0.22);
        ctx.lineWidth = 1;
        (this.plusMarks || []).forEach(m => {
            ctx.beginPath();
            ctx.moveTo(m.x - m.s, m.y);
            ctx.lineTo(m.x + m.s, m.y);
            ctx.moveTo(m.x, m.y - m.s);
            ctx.lineTo(m.x, m.y + m.s);
            ctx.stroke();
        });
        ctx.setLineDash([4, 5]);
        ctx.strokeStyle = ink(0.15);
        (this.sketchCircles || []).forEach(c => {
            ctx.beginPath();
            ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
            ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.restore();
    }

    // A single celestial body at a fixed spot (used for the lone planets)
    drawOrb(b, light) {
        const ctx = this.ctx;
        ctx.save();
        const grad = ctx.createRadialGradient(
            b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.1,
            b.x, b.y, b.size
        );
        if (light) {
            ctx.shadowBlur = 6;
            ctx.shadowColor = 'rgba(46, 42, 78, 0.2)';
            grad.addColorStop(0, b.color);
            grad.addColorStop(1, 'rgba(46, 42, 78, 0.6)');
        } else {
            ctx.shadowBlur = 22;
            ctx.shadowColor = b.glow;
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.28, b.color);
            grad.addColorStop(1, 'rgba(0,0,0,0.85)');
        }
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();

        if (b.ring) {
            ctx.shadowBlur = 0;
            ctx.strokeStyle = light ? 'rgba(109, 74, 224, 0.4)' : 'rgba(200, 180, 255, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(b.x, b.y, b.size * 1.9, b.size * 0.7, -0.5, 0, Math.PI * 2);
            ctx.stroke();
        }

        if (b.moon) {
            const mx = b.x + b.size * 2.2;
            const my = b.y - b.size * 1.3;
            const ms = Math.max(2, b.size * 0.18);
            if (light) {
                ctx.shadowBlur = 0;
                ctx.fillStyle = 'rgba(46, 42, 78, 0.7)';
            } else {
                ctx.shadowBlur = 8;
                ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
                ctx.fillStyle = '#fff';
            }
            ctx.beginPath();
            ctx.arc(mx, my, ms, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    drawLoneBodies(light) {
        (this.lonePlanets || []).forEach(b => {
            if (light && b.darkOnly) return; // keep light mode airy
            this.drawOrb(b, light);
        });
    }

    draw() {
        const ctx = this.ctx;
        const light = this.light;

        // Background vertical gradient
        const bg = ctx.createLinearGradient(0, 0, 0, this.height);
        bg.addColorStop(0, this.config.bgTop);
        bg.addColorStop(1, this.config.bgBottom);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, this.width, this.height);

        // Paper grid in light mode, nebula clouds in dark mode
        if (light) {
            this.drawGrid();
            this.drawLightExtras();
        } else {
            this.drawNebula();
        }

        // Constellations appear in both themes (lower part of the frame)
        this.drawConstellations(light);

        // Stars (far → near)
        this.stars.forEach(s => s.draw(ctx, light));

        // Central star glow (the "sun")
        const cx = this.center.x + this.parallax.x * 8;
        const cy = this.center.y + this.parallax.y * 8;
        ctx.save();
        const sun = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70);
        if (light) {
            sun.addColorStop(0, 'rgba(255, 236, 205, 0.55)');
            sun.addColorStop(0.4, 'rgba(123, 91, 224, 0.10)');
            sun.addColorStop(1, 'rgba(123, 91, 224, 0)');
        } else {
            sun.addColorStop(0, 'rgba(255, 248, 230, 0.9)');
            sun.addColorStop(0.3, 'rgba(255, 210, 170, 0.35)');
            sun.addColorStop(1, 'rgba(255, 180, 140, 0)');
        }
        ctx.fillStyle = sun;
        ctx.beginPath();
        ctx.arc(cx, cy, 70, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Lone bodies scattered around the frame
        this.drawLoneBodies(light);

        // Planets orbiting the central star
        this.planets.forEach(p => p.draw(ctx, cx, cy, light));

        // Shooting stars on top
        ctx.shadowBlur = 0;
        this.shootingStars.forEach(s => s.draw(ctx));
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    // Toggle between deep-space dark and the paper-white "lined vacuum"
    setTheme(isLight) {
        this.light = isLight;
        this.config.isLight = isLight;
        if (isLight) {
            // Warm paper white
            this.config.bgTop = '#FAF9F3';
            this.config.bgBottom = '#F1EFE6';
        } else {
            this.config.bgTop = '#05050f';
            this.config.bgBottom = '#03030c';
        }
    }
}
