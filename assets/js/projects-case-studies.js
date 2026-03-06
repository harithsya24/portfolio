/**
 * projects-case-studies.js
 * 
 * Implements Apple-style full-screen project case studies with
 * scroll tracking, cinematic visuals, and interactive overlays.
 */

'use strict';

(function () {
    const container = document.getElementById('proj-blocks-container');
    const progressBar = document.getElementById('proj-progress-bar');
    const currNum = document.getElementById('proj-curr-num');
    const totalNum = document.getElementById('proj-total-num');
    const overlay = document.getElementById('case-study-overlay');
    const closeBtn = document.getElementById('cs-close');

    if (!container) return;

    const ACCENTS = ['#00d4ff', '#a855f7', '#00d4ff', '#a855f7'];
    const GLOWS = ['rgba(0,212,255,0.25)', 'rgba(168,85,247,0.25)', 'rgba(0,212,255,0.25)', 'rgba(168,85,247,0.25)'];

    let projectsData = [];

    // ── Data Fetching ────────────────────────────────────────────────────────
    async function init() {
        try {
            const resp = await fetch('./data/projects.json');
            projectsData = await resp.json();

            // Limit to featured/top projects if necessary, or just render all
            renderBlocks(projectsData);
            setupScrollTracking();
            setupIntersectionObserver();
            setupOverlayHandlers();
        } catch (err) {
            console.error('Failed to load project data:', err);
        }
    }

    // ── Rendering ────────────────────────────────────────────────────────────
    function renderBlocks(data) {
        totalNum.textContent = String(data.length).padStart(2, '0');

        container.innerHTML = data.map((p, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            const glow = GLOWS[i % GLOWS.length];
            const num = String(i + 1).padStart(2, '0');

            return `
                <div class="proj-block" data-idx="${i}" style="--proj-accent: ${accent}; --proj-accent-glow: ${glow};">
                    <!-- Visual Layer Left -->
                    <div class="proj-block-left">
                        <div class="proj-ghost-num">${num}</div>
                        <div class="proj-cat reveal-left">// AI · ML · SYSTEMS</div>
                        <h3 class="proj-title-large reveal-left">${p.title}</h3>
                        <p class="proj-one-liner reveal-left">${p.description.split('.')[0]}.</p>
                        
                        <div class="proj-tech-stack reveal-left">
                            ${(p.tags || []).slice(0, 4).map(t => `<span class="proj-tech-pill">${t}</span>`).join('')}
                        </div>

                        <div class="proj-case-study-link reveal-left" onclick="window.openCaseStudy(${i})">
                            View Case Study <i class="fas fa-arrow-right"></i>
                        </div>
                    </div>

                    <!-- Visual Layer Right -->
                    <div class="proj-block-right reveal-right">
                        <div class="proj-visual-container">
                            <div class="proj-mesh"></div>
                            <div class="proj-lighting"></div>
                            
                            <!-- Geometric Decor -->
                            <div class="geo-shape geo-circle"></div>
                            <div class="geo-shape geo-ring"></div>
                            <div class="geo-shape geo-line"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ── Scroll Tracking ──────────────────────────────────────────────────────
    function setupScrollTracking() {
        const section = document.getElementById('projects');

        window.addEventListener('scroll', () => {
            const rect = section.getBoundingClientRect();
            const sectionHeight = section.offsetHeight;
            const scrollPos = window.scrollY + window.innerHeight / 2;
            const sectionTop = section.offsetTop;

            if (rect.top <= window.innerHeight && rect.bottom >= 0) {
                // Calculate progress within section
                let progress = (window.scrollY - sectionTop) / (sectionHeight - window.innerHeight);
                progress = Math.max(0, Math.min(1, progress));

                progressBar.style.height = `${progress * 100}%`;

                // Update counter based on visible block
                const blocks = document.querySelectorAll('.proj-block');
                blocks.forEach((block, idx) => {
                    const bRect = block.getBoundingClientRect();
                    if (bRect.top < window.innerHeight / 2 && bRect.bottom > window.innerHeight / 2) {
                        currNum.textContent = String(idx + 1).padStart(2, '0');
                    }
                });
            }
        });
    }

    // ── Reveal Animations ────────────────────────────────────────────────────
    function setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll('.proj-block').forEach(block => observer.observe(block));
    }

    // ── Overlay Logic ────────────────────────────────────────────────────────
    window.openCaseStudy = function (idx) {
        const p = projectsData[idx];
        if (!p) return;

        // Map data to overlay
        document.getElementById('cs-overlay-num').textContent = `// ${String(idx + 1).padStart(2, '0')}`;
        document.getElementById('cs-overlay-title').textContent = p.title;

        // Split description into sections (mocking for now as data is limited)
        const parts = p.description.split('.');
        document.getElementById('cs-problem').textContent = parts[0] + '.';
        document.getElementById('cs-solution').textContent = parts[1] ? parts.slice(1).join('.') : 'Custom AI infrastructure designed for scale and precision.';
        document.getElementById('cs-impact').textContent = `Successfully implemented ${p.title} with high precision and performance benchmarks.`;

        document.getElementById('cs-meta-year').textContent = p.date.split(' ').pop() || '2024';
        document.getElementById('cs-meta-stack').textContent = (p.tags || []).join(', ');

        document.getElementById('cs-github-link').href = p.github || '#';
        document.getElementById('cs-github-link').style.display = p.github ? 'flex' : 'none';
        document.getElementById('cs-demo-link').href = p.demo || '#';
        document.getElementById('cs-demo-link').style.display = p.demo ? 'flex' : 'none';

        // Animate open
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock scroll
    };

    function closeOverlay() {
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Unlock scroll
    }

    function setupOverlayHandlers() {
        closeBtn.addEventListener('click', closeOverlay);

        // Close on escape
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active')) {
                closeOverlay();
            }
        });

        // Close on backdrop click (optional, but good practice)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeOverlay();
        });
    }

    // Start
    init();

})();
