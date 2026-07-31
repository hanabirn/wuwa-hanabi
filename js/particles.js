/* ===== Ambient drifting particle background =====
   Ported from the Bolt.new reference design (also applied to the main
   Hanabiの小天地 site) — layered on top of the existing character-art
   carousel (#bg-carousel/#bg-overlay in base.css), not replacing it.
   Colors follow this site's own teal/mint palette rather than the
   neon-pink one used on the main site. */
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

    const COLORS = [
        'rgba(57,197,187,',   // accent teal
        'rgba(125,211,252,',  // sky blue
        'rgba(167,139,250,',  // violet
        'rgba(255,111,165,',  // pink
    ];

    function makeParticle() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 2.2 + 0.4,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            a: Math.random() * 0.55 + 0.15,
            da: (Math.random() - 0.5) * 0.004,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
        };
    }

    const COUNT = 90;
    const particles = Array.from({ length: COUNT }, makeParticle);

    function draw() {
        ctx.clearRect(0, 0, W, H);
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.a += p.da;
            if (p.a <= 0.1 || p.a >= 0.7) p.da *= -1;
            if (p.x < 0) p.x = W;
            if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H;
            if (p.y > H) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.a + ')';
            ctx.fill();
        }
        requestAnimationFrame(draw);
    }
    draw();
})();
