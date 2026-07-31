/* ===== Sound-wave particle + waveform canvas =====
   Ported from the Bolt.new "Wuthering Waves sci-fi acoustic" reference
   design (bolt.new/~/sb1-2gkeccgn, v2). Layered on top of the existing
   character-art carousel (#bg-carousel/#bg-overlay in base.css), not
   replacing it — colors reuse this site's own --accent/--accent-yellow
   CSS variables rather than Bolt's separate hardcoded teal/gold hexes,
   so it stays in sync with the site's own palette (incl. light mode). */
(function () {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function cssVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }
    function hexToRgb(hex) {
        const m = hex.replace('#', '').match(/.{1,2}/g);
        return m ? `${parseInt(m[0], 16)},${parseInt(m[1], 16)},${parseInt(m[2], 16)}` : '57,197,187';
    }

    // Re-read on theme toggle so light/dark both use their own accent hues.
    let TEAL, GOLD, SLATE, PCOLORS;
    function refreshColors() {
        TEAL = `rgba(${hexToRgb(cssVar('--accent') || '#39c5bb')},`;
        GOLD = `rgba(${hexToRgb(cssVar('--accent-yellow') || '#fbbf24')},`;
        SLATE = `rgba(${hexToRgb(cssVar('--accent-purple') || '#a78bfa')},`;
        PCOLORS = [TEAL, TEAL, TEAL, GOLD, SLATE];
    }
    refreshColors();
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', () => setTimeout(refreshColors, 0));

    // ── Floating data particles ──
    function makeParticle() {
        const c = PCOLORS[Math.floor(Math.random() * PCOLORS.length)];
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 1.8 + 0.4,
            vx: (Math.random() - 0.5) * 0.22,
            vy: (Math.random() - 0.5) * 0.22,
            a: Math.random() * 0.50 + 0.10,
            da: (Math.random() - 0.5) * 0.003,
            color: c,
            square: Math.random() < 0.25,
        };
    }
    const particles = Array.from({ length: 120 }, makeParticle);

    // ── Waveforms ──
    const WAVE_COUNT = 5;
    const waves = Array.from({ length: WAVE_COUNT }, (_, i) => ({
        yRatio: 0.20 + i * 0.15,
        amplitude: 18 + Math.random() * 22,
        frequency: 0.006 + Math.random() * 0.006,
        speed: 0.003 + Math.random() * 0.003,
        phase: Math.random() * Math.PI * 2,
        goldTinted: i % 3 === 1,
        alpha: 0.06 + Math.random() * 0.07,
        lineWidth: 0.8 + Math.random() * 0.6,
    }));

    // ── Moving scan line ──
    let scanY = 0;
    const SCAN_SPEED = 0.4;

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // — Waveforms (with a faint mirrored echo below) —
        for (const wave of waves) {
            wave.phase += wave.speed;
            const y0 = H * wave.yRatio;
            const color = (wave.goldTinted ? GOLD : TEAL);

            ctx.beginPath();
            for (let x = 0; x <= W; x += 2) {
                const y = y0 + Math.sin(x * wave.frequency + wave.phase) * wave.amplitude;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = color + wave.alpha + ')';
            ctx.lineWidth = wave.lineWidth;
            ctx.stroke();

            ctx.beginPath();
            for (let x = 0; x <= W; x += 2) {
                const y = y0 + 14 + Math.sin(x * wave.frequency + wave.phase + 0.6) * wave.amplitude * 0.5;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = color + (wave.alpha * 0.4) + ')';
            ctx.lineWidth = wave.lineWidth * 0.7;
            ctx.stroke();
        }

        // — Particles —
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.a += p.da;
            if (p.a > 0.65 || p.a < 0.08) p.da *= -1;
            if (p.x < -8) p.x = W + 8;
            if (p.x > W + 8) p.x = -8;
            if (p.y < -8) p.y = H + 8;
            if (p.y > H + 8) p.y = -8;

            const alpha = p.a.toFixed(2);
            if (p.square) {
                ctx.fillStyle = p.color + alpha + ')';
                ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color + alpha + ')';
                ctx.fill();
            }

            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
            g.addColorStop(0, p.color + (p.a * 0.28).toFixed(2) + ')');
            g.addColorStop(1, p.color + '0)');
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();
        }

        // — Moving scan line —
        scanY = (scanY + SCAN_SPEED) % H;
        const sg = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
        sg.addColorStop(0, TEAL + '0)');
        sg.addColorStop(0.5, TEAL + '0.04)');
        sg.addColorStop(1, TEAL + '0)');
        ctx.fillStyle = sg;
        ctx.fillRect(0, scanY - 30, W, 60);

        requestAnimationFrame(draw);
    }
    draw();
})();
