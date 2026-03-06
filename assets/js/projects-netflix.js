// assets/js/projects-netflix.js
// Netflix-style Projects section — rendered fully from data/projects.json

(async function () {
    // ── Tag → Category mapping ─────────────────────────────────────────────
    function getCategory(tags) {
        const t = tags.map(x => x.toLowerCase()).join(' ');
        if (t.includes('yolo') || t.includes('tensorflow') || t.includes('langchain') || t.includes('openai') || t.includes('rag') || t.includes('llm') || t.includes('crewai') || t.includes('langraph') || t.includes('langraph') || t.includes('bert') || t.includes('gpt') || t.includes('pinecone')) return 'ML/AI';
        if (t.includes('docker') || t.includes('kubernetes') || t.includes('aws') || t.includes('terraform') || t.includes('dvc') || t.includes('mlflow') || t.includes('github actions') || t.includes('ci/cd') || t.includes('ecr')) return 'MLOps';
        if (t.includes('react') || t.includes('node') || t.includes('supabase') || t.includes('typescript')) return 'Apps';
        return 'Research';
    }

    // ── Gradient thumbnail from tags ───────────────────────────────────────
    const GRADIENTS = {
        'ML/AI': 'linear-gradient(135deg, #0a1628 0%, #003366 40%, #001a4d 100%)',
        'MLOps': 'linear-gradient(135deg, #0d0a1e 0%, #2d0057 40%, #1a0033 100%)',
        'Apps': 'linear-gradient(135deg, #001a1a 0%, #004444 40%, #002233 100%)',
        'Research': 'linear-gradient(135deg, #1a0a00 0%, #4d1a00 40%, #330d00 100%)',
    };

    const ACCENT = { 'ML/AI': '#00d4ff', 'MLOps': '#a855f7', 'Apps': '#22d3ee', 'Research': '#f59e0b' };

    function tagIcon(cat) {
        return { 'ML/AI': 'fa-brain', 'MLOps': 'fa-cloud', 'Apps': 'fa-globe', 'Research': 'fa-flask' }[cat] || 'fa-cube';
    }

    // ── Fetch data ─────────────────────────────────────────────────────────
    let projects = [];
    try {
        projects = await fetch('./data/projects.json').then(r => r.json());
    } catch (e) { console.error('Failed to load projects.json', e); return; }

    projects = projects.map(p => ({ ...p, category: getCategory(p.tags) }));

    // ─────────────────────────────────────────────────────────────────────
    // FEATURED BANNER
    // ─────────────────────────────────────────────────────────────────────
    const featured = projects.find(p => p.featured) || projects[0];
    const featCat = featured.category;
    const featAccent = ACCENT[featCat];

    const banner = document.getElementById('projects-featured-banner');
    if (banner) {
        banner.style.background = `radial-gradient(ellipse at 60% 50%, ${featAccent}22 0%, #050a14 60%)`;
        banner.innerHTML = `
      <div class="proj-banner-content">
        <div class="proj-banner-label">// FEATURED PROJECT</div>
        <h2 class="proj-banner-title">${featured.title}</h2>
        <p class="proj-banner-desc">${featured.description.substring(0, 160)}…</p>
        <div class="proj-banner-tags">
          ${featured.tags.slice(0, 5).map(t => `<span class="proj-tag">${t}</span>`).join('')}
        </div>
        <div class="proj-banner-btns">
          ${featured.github ? `<a href="${featured.github}"  target="_blank" rel="noopener" class="proj-btn-primary"><i class="fab fa-github mr-2"></i>View Code</a>` : ''}
          <button class="proj-btn-outline" onclick="openProjectModal(${featured.id})"><i class="fas fa-info-circle mr-2"></i>More Info</button>
        </div>
      </div>
      <div class="proj-banner-fade"></div>
    `;
    }

    // ─────────────────────────────────────────────────────────────────────
    // CATEGORY ROWS
    // ─────────────────────────────────────────────────────────────────────
    const categories = ['ML/AI', 'MLOps', 'Apps', 'Research'];
    const rowsContainer = document.getElementById('projects-rows');
    if (!rowsContainer) return;

    let activeFilter = 'All';

    function buildRows(filter) {
        rowsContainer.innerHTML = '';
        const cats = filter === 'All' ? categories : [filter];

        cats.forEach(cat => {
            const catProjects = projects.filter(p => p.category === cat);
            if (catProjects.length === 0) return;

            const rowId = `proj-row-${cat.replace('/', '-')}`;
            const accent = ACCENT[cat];

            const rowEl = document.createElement('div');
            rowEl.className = 'proj-row';
            rowEl.innerHTML = `
        <div class="proj-row-header">
          <span class="proj-row-label" style="color:${accent}">
            <i class="fas ${tagIcon(cat)} mr-2"></i>${cat}
          </span>
        </div>
        <div class="proj-row-outer">
          <button class="proj-scroll-btn proj-scroll-left" aria-label="Scroll left"><i class="fas fa-chevron-left"></i></button>
          <div class="proj-row-track" id="${rowId}">
            ${catProjects.map(p => cardHtml(p, accent)).join('')}
          </div>
          <button class="proj-scroll-btn proj-scroll-right" aria-label="Scroll right"><i class="fas fa-chevron-right"></i></button>
        </div>
      `;

            rowsContainer.appendChild(rowEl);

            // Wire up scroll buttons + drag
            const track = rowEl.querySelector(`#${CSS.escape(rowId)}`);
            const leftBtn = rowEl.querySelector('.proj-scroll-left');
            const rightBtn = rowEl.querySelector('.proj-scroll-right');
            const STEP = 680;

            leftBtn.addEventListener('click', () => track.scrollBy({ left: -STEP, behavior: 'smooth' }));
            rightBtn.addEventListener('click', () => track.scrollBy({ left: STEP, behavior: 'smooth' }));

            // Drag-to-scroll
            let isDown = false, startX = 0, scrollStart = 0;
            track.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - track.offsetLeft; scrollStart = track.scrollLeft; track.style.cursor = 'grabbing'; });
            window.addEventListener('mouseup', () => { isDown = false; track.style.cursor = ''; });
            track.addEventListener('mousemove', e => { if (!isDown) return; e.preventDefault(); track.scrollLeft = scrollStart - (e.pageX - track.offsetLeft - startX); });

            // Touch
            let touchStartX = 0, touchScrollStart = 0;
            track.addEventListener('touchstart', e => { touchStartX = e.touches[0].pageX; touchScrollStart = track.scrollLeft; }, { passive: true });
            track.addEventListener('touchmove', e => { track.scrollLeft = touchScrollStart - (e.touches[0].pageX - touchStartX); }, { passive: true });

            // Hover dimming
            const cards = track.querySelectorAll('.proj-card');
            cards.forEach(card => {
                card.addEventListener('mouseenter', () => { cards.forEach(c => { if (c !== card) c.style.opacity = '0.4'; }); });
                card.addEventListener('mouseleave', () => { cards.forEach(c => c.style.opacity = ''); });
            });
        });
    }

    function cardHtml(p, accent) {
        const cat = p.category;
        const grad = GRADIENTS[cat];
        return `
      <div class="proj-card" data-id="${p.id}" style="--proj-accent: ${accent}; --proj-grad: ${grad};">
        <div class="proj-card-thumb">
          <div class="proj-card-thumb-bg" style="background: ${grad}">
            <i class="fas ${tagIcon(cat)} proj-card-thumb-icon"></i>
          </div>
          <div class="proj-card-name">${p.title}</div>
        </div>
        <div class="proj-card-hover">
          <div class="proj-card-hover-top" style="border-top: 2px solid ${accent}">
            <h4 class="proj-card-hover-title">${p.title}</h4>
            <p class="proj-card-hover-desc">${p.description.substring(0, 110)}…</p>
            <div class="proj-card-hover-tags">${p.tags.slice(0, 4).map(t => `<span class="proj-tag">${t}</span>`).join('')}</div>
            <div class="proj-card-hover-btns">
              ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener" class="proj-icon-btn" title="GitHub"><i class="fab fa-github"></i></a>` : ''}
              ${p.demo ? `<a href="${p.demo}" target="_blank" rel="noopener" class="proj-icon-btn" title="Live Demo"><i class="fas fa-arrow-up-right-from-square"></i></a>` : ''}
              <button class="proj-icon-btn" onclick="openProjectModal(${p.id})" title="More Info"><i class="fas fa-info-circle"></i></button>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    buildRows('All');

    // Filter pills
    const filterBtns = document.querySelectorAll('.proj-filter-pill');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            buildRows(activeFilter);
        });
    });

    // ─────────────────────────────────────────────────────────────────────
    // MODAL
    // ─────────────────────────────────────────────────────────────────────
    const modal = document.getElementById('proj-modal');
    const modalInner = document.getElementById('proj-modal-inner');
    if (!modal) return;

    window.openProjectModal = function (id) {
        const p = projects.find(pr => String(pr.id) === String(id));
        if (!p) return;
        const cat = p.category;
        const accent = ACCENT[cat];
        const grad = GRADIENTS[cat];

        modalInner.innerHTML = `
      <div class="proj-modal-header" style="background: radial-gradient(ellipse at 60% 40%, ${accent}22 0%, #050a14 70%)">
        <button class="proj-modal-close" id="proj-modal-close">✕</button>
        <div class="proj-modal-header-icon" style="background:${grad}">
          <i class="fas ${tagIcon(cat)}"></i>
        </div>
        <span class="proj-modal-cat" style="color:${accent}">${cat}</span>
        <h2 class="proj-modal-title">${p.title}</h2>
        <p class="proj-modal-date"><i class="far fa-calendar-alt mr-2"></i>${p.date}</p>
      </div>
      <div class="proj-modal-body">
        <p class="proj-modal-desc">${p.description}</p>
        <div class="proj-modal-tags">${p.tags.map(t => `<span class="proj-tag">${t}</span>`).join('')}</div>
        <div class="proj-modal-btns">
          ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener" class="proj-btn-primary"><i class="fab fa-github mr-2"></i>View Code</a>` : ''}
          ${p.demo ? `<a href="${p.demo}"   target="_blank" rel="noopener" class="proj-btn-outline"><i class="fas fa-arrow-up-right-from-square mr-2"></i>Live Demo</a>` : ''}
        </div>
      </div>
    `;

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        document.getElementById('proj-modal-close').addEventListener('click', closeModal);
    };

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();
