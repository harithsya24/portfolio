// assets/js/experience-scroll.js
// Horizontal scroll + canvas frame scrub for the Experience section

document.addEventListener("DOMContentLoaded", () => {
    const section = document.getElementById("experience");
    const sticky = document.getElementById("exp-sticky");
    const track = document.getElementById("exp-track");
    const canvas = document.getElementById("exp-canvas");
    if (!section || !sticky || !track || !canvas) return;

    const ctx = canvas.getContext("2d");
    const PANEL_COUNT = 5;
    const FRAME_COUNT = 144;  // frame_000 to frame_143

    // ── Build frame paths ────────────────────────────────────────────────────
    const frames = [];
    const images = [];
    let loadedImages = 0;
    let isReady = false;

    for (let i = 0; i < FRAME_COUNT; i++) {
        const padded = String(i).padStart(3, "0");
        frames.push(`./experience/frame_${padded}_delay-0.041s.png`);
    }

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawFrame(index) {
        if (!isReady) return;
        const img = images[index];
        if (!img) return;

        const cw = window.innerWidth;
        const ch = window.innerHeight;
        const ir = img.naturalWidth / img.naturalHeight;
        const cr = cw / ch;

        let dw, dh, dx, dy;
        if (cr > ir) {
            dw = cw; dh = cw / ir;
            dx = 0; dy = (ch - dh) / 2;
        } else {
            dh = ch; dw = ch * ir;
            dy = 0; dx = (cw - dw) / 2;
        }
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, dx, dy, dw, dh);
    }

    // Preload all frames
    frames.forEach((src, i) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            loadedImages++;
            if (loadedImages === FRAME_COUNT) {
                isReady = true;
                resizeCanvas();
                drawFrame(0);
            }
        };
        images[i] = img;
    });

    // ── Scroll handler ───────────────────────────────────────────────────────
    let rafId = null;

    function onScroll() {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            rafId = null;
            if (!section) return;

            const rect = section.getBoundingClientRect();
            const maxScroll = section.offsetHeight - window.innerHeight;
            const scrolled = -rect.top;
            let progress = Math.max(0, Math.min(1, scrolled / maxScroll));

            // Horizontal translate: 0 → -(PANEL_COUNT - 1) * 100vw
            const translateX = -progress * (PANEL_COUNT - 1) * window.innerWidth;
            track.style.transform = `translateX(${translateX}px)`;

            // Canvas frame index
            const frameIndex = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));
            drawFrame(frameIndex);

            // Progress bar dots
            const panelIndex = Math.min(PANEL_COUNT - 1, Math.floor(progress * PANEL_COUNT));
            document.querySelectorAll(".exp-pip").forEach((pip, i) => {
                pip.classList.toggle("active", i === panelIndex);
            });

            // Arrow visibility
            const prevBtn = document.getElementById("exp-hint-left");
            const nextBtn = document.getElementById("exp-hint-right");
            if (prevBtn) prevBtn.style.opacity = panelIndex === 0 ? "0" : "0.6";
            if (nextBtn) nextBtn.style.opacity = panelIndex === PANEL_COUNT - 1 ? "0" : "0.6";
        });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
        resizeCanvas();
        onScroll();
    });

    // Initial draw
    resizeCanvas();
    onScroll();
});
