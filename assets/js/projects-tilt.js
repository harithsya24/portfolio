/**
 * Projects 3D Tilt & Expand Logic
 * Aesthetic: Deep Navy / Burnt Orange
 */

(async function () {
    const P_CARDS_WRAP = document.getElementById('proj-cards');
    if (!P_CARDS_WRAP) return;

    // 1. Fetch Projects Data
    let projects = [];
    try {
        const response = await fetch('./data/projects.json');
        projects = await response.json();
    } catch (err) {
        console.error("Failed to load projects.json", err);
        return;
    }

    // 2. Render Cards
    renderProjects(projects);

    function renderProjects(data) {
        P_CARDS_WRAP.innerHTML = data.map((proj, index) => {
            const accentClass = index % 2 === 0 ? 'accent-orange' : 'accent-amber';
            const techPills = (proj.tags || []).slice(0, 3).map(t => `<span class="proj-pill">${t}</span>`).join('');
            const fullTags = (proj.tags || []).map(t => `<span class="proj-tag">${t}</span>`).join('');

            return `
                <div class="proj-card ${accentClass} opacity-0 translate-y-8 transition-all duration-700" 
                     data-id="${proj.id}" 
                     style="transition-delay: ${index * 100}ms">
                    
                    <div class="proj-card-inner">
                        <div class="proj-main-content">
                            <h3 class="proj-title">${proj.title}</h3>
                            <p class="proj-short-desc">${proj.description.split('.')[0]}.</p>
                            <div class="proj-pills">${techPills}</div>
                        </div>
                        
                        <div class="proj-expand-icon">
                            <i class="fas fa-plus"></i>
                        </div>
                    </div>

                    <div class="proj-expanded-wrap">
                        <div class="proj-expanded-inner">
                            <div class="proj-divider"></div>
                            <p class="proj-full-desc">${proj.description}</p>
                            
                            <div class="proj-full-tags">
                                ${fullTags}
                            </div>

                            <div class="proj-actions">
                                ${proj.github ? `
                                    <a href="${proj.github}" target="_blank" class="proj-action-btn proj-btn-ghost">
                                        <i class="fab fa-github"></i> GitHub
                                    </a>
                                ` : ''}
                                ${proj.demo ? `
                                    <a href="${proj.demo}" target="_blank" class="proj-action-btn proj-btn-primary">
                                        <i class="fas fa-external-link-alt"></i> Live Demo
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        initInteractions();
    }

    function initInteractions() {
        const cards = document.querySelectorAll('.proj-card');

        // --- 3D Tilt Logic ---
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Max tilt 8 degrees
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
            });

            // --- Expand/Collapse Logic ---
            card.addEventListener('click', (e) => {
                // Ignore if clicking a button inside
                if (e.target.closest('.proj-action-btn')) return;

                const isExpanded = card.classList.contains('expanded');

                // Collapse all others
                cards.forEach(c => c.classList.remove('expanded'));

                if (!isExpanded) {
                    card.classList.add('expanded');
                }
            });
        });

        // --- Stagger Fade-Up on Scroll ---
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.remove('opacity-0', 'translate-y-8');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(card => observer.observe(card));
    }

})();
