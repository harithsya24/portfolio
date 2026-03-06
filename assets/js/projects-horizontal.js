/**
 * projects-horizontal.js
 * 
 * Implements a horizontally scrollable card row for projects
 * with drag-to-scroll functionality and dynamic rendering.
 */

'use strict';

(function () {
    const container = document.getElementById('proj-h-container');
    if (!container) return;

    const ACCENT_TINTS = [
        'rgba(0, 212, 255, 0.4)',  // Cyan
        'rgba(168, 85, 247, 0.4)', // Violet
        'rgba(247, 37, 133, 0.4)', // Pink
        'rgba(76, 201, 240, 0.4)'  // Light Blue
    ];

    let projectsData = [];

    // ── Data Fetching ────────────────────────────────────────────────────────
    async function init() {
        try {
            const resp = await fetch('./data/projects.json');
            projectsData = await resp.json();
            renderCards(projectsData);
            setupDragScroll();
        } catch (err) {
            console.error('Failed to load project data:', err);
        }
    }

    // ── Rendering ────────────────────────────────────────────────────────────
    function renderCards(data) {
        container.innerHTML = data.map((p, i) => {
            const tint = ACCENT_TINTS[i % ACCENT_TINTS.length];
            const imageHtml = p.image
                ? `<div class="proj-h-card-img" style="background-image: url('${p.image}');"></div>`
                : `<div class="proj-h-card-img fallback-gradient"></div>`;

            // Card is now very minimal
            return `
                <div class="project-h-card" 
                     data-id="${p.id}" 
                     data-index="${i}"
                     style="--card-accent: ${tint};">
                    ${imageHtml}
                    <div class="proj-h-card-overlay"></div>
                    <div class="proj-h-cat">// ${p.tags ? p.tags[0] : 'Project'}</div>
                    <div class="proj-h-card-content">
                        <h3 class="proj-h-title">${p.title}</h3>
                    </div>
                </div>
            `;
        }).join('');

        setupPopupInteractions();
    }

    // ── Billboard Popup Logic ───────────────────────────────────────────────
    function setupPopupInteractions() {
        const popup = document.createElement('div');
        popup.className = 'billboard-popup';
        document.body.appendChild(popup);

        let activeTimer;

        const cards = container.querySelectorAll('.project-h-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                if (window.innerWidth < 768) return; // Skip on mobile

                const index = card.getAttribute('data-index');
                const p = projectsData[index];
                if (!p) return;

                showPopup(p, card, popup);
            });

            card.addEventListener('mouseleave', () => {
                hidePopup(popup);
            });

            card.addEventListener('click', () => {
                const index = card.getAttribute('data-index');
                const p = projectsData[index];
                if (window.innerWidth < 768 && p.github) {
                    window.open(p.github, '_blank');
                }
            });
        });

        // Keep popup alive when hovering the popup itself
        popup.addEventListener('mouseenter', () => {
            clearTimeout(activeTimer);
            popup.classList.add('active');
        });
        popup.addEventListener('mouseleave', () => {
            hidePopup(popup);
        });
    }

    function showPopup(p, card, popup) {
        const status = p.featured ? 'Live' : 'Research';

        popup.innerHTML = `
            <div class="billboard-popup-img-zone" style="background-image: url('${p.image || ''}');">
                <span class="billboard-status-badge">${status}</span>
            </div>
            <div class="billboard-content">
                <h4 class="billboard-title">${p.title}</h4>
                <div class="billboard-divider"></div>
                <p class="billboard-desc">${p.description}</p>
                <div class="billboard-tags">
                    ${(p.tags || []).slice(0, 4).map(t => `<span class="billboard-tag">${t}</span>`).join('')}
                </div>
                <div class="billboard-links">
                    ${p.github ? `<a href="${p.github}" target="_blank" class="billboard-link github">GitHub ↗</a>` : ''}
                    ${p.demo ? `<a href="${p.demo}" target="_blank" class="billboard-link demo">Live Demo ↗</a>` : ''}
                </div>
            </div>
            <div class="billboard-arrow"></div>
        `;

        // Position Logic
        const rect = card.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect(); // Note: width/height fixed in CSS (320px)
        const popupWidth = 320;
        const popupHeight = popup.offsetHeight || 400; // Estimated or measured after content injection

        let top = rect.top - popupHeight - 12;
        let left = rect.left + (rect.width / 2) - (popupWidth / 2);
        let arrowPos = 'bottom';

        // 1. Flip to bottom if too close to top
        if (rect.top < 250) {
            top = rect.bottom + 12;
            arrowPos = 'top';
        }

        // 2. Shift left/right if near edges
        const margin = 20;
        if (left < margin) {
            left = margin;
        } else if (left + popupWidth > window.innerWidth - margin) {
            left = window.innerWidth - popupWidth - margin;
        }

        popup.style.top = `${top}px`;
        popup.style.left = `${left}px`;

        // Adjust arrow position
        const arrow = popup.querySelector('.billboard-arrow');
        arrow.className = `billboard-arrow ${arrowPos}`;

        // Center arrow relative to card
        const cardCenter = rect.left + rect.width / 2;
        const arrowLeft = cardCenter - left;
        arrow.style.left = `${arrowLeft}px`;

        popup.classList.add('active');
    }

    function hidePopup(popup) {
        popup.classList.remove('active');
    }

    // ── Drag to Scroll ──────────────────────────────────────────────────────
    function setupDragScroll() {
        let isDown = false;
        let startX;
        let scrollLeft;

        container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.classList.add('active');
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('mouseleave', () => {
            isDown = false;
            container.classList.remove('active');
        });

        container.addEventListener('mouseup', () => {
            isDown = false;
            container.classList.remove('active');
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });

        // Touch support
        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            const x = e.touches[0].pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        }, { passive: true });
    }

    init();
})();
