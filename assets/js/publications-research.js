// assets/js/publications-research.js
// Research Journal UI — loads data/publications.json

(async function () {
    let pubs = [];
    try {
        pubs = await fetch('./data/publications.json').then(r => r.json());
    } catch (e) { console.error('Failed to load publications.json', e); return; }

    const published = pubs.filter(p => p.status === 'Published');
    const underReview = pubs.filter(p => p.status === 'Under Review');

    // ── Abstract placeholder map (can be personalised later) ─────────────
    const ABSTRACTS = {
        '1': 'MedESQ introduces a complexity-aware benchmark for evaluating Text-to-NoSQL querying systems in clinical settings, addressing the unique challenges posed by healthcare databases including nested schemas and domain-specific terminology.',
        '2': 'This systematic review comprehensively analyses state-of-the-art machine learning and deep learning frameworks applied to network intrusion detection, covering CNN, RNN, LSTM, GAN, and ensemble approaches across 80+ studies.',
        '3': 'We present a deep learning pipeline for audio source separation in karaoke systems, leveraging U-Net and transformer architectures to achieve real-time vocal isolation with superior SDR scores compared to traditional signal processing methods.',
        '4': 'This paper presents an energy harvesting system using piezoelectric transducers integrated with power conditioning circuits, achieving efficient conversion of ambient mechanical vibrations into usable electrical energy for IoT sensor nodes.',
        '5': 'An interactive companion robot designed for children with Autism Spectrum Disorder (ASD), integrating facial expression recognition, emotion-adaptive responses, and gamified social skill exercises validated in clinical pilot studies.',
        '6': 'A scalable, cloud-native bus ticket reservation platform built on AWS microservices, featuring real-time seat availability, QR-based boarding passes, and analytics dashboards for transit operators.',
    };

    // ── Research areas derived from paper topics ──────────────────────────
    const AREAS = ['NLP / LLMs', 'Computer Vision', 'Deep Learning', 'MLOps', 'IoT / Embedded', 'Cybersecurity'];

    // ── Render cards ──────────────────────────────────────────────────────
    function cardHtml(pub, idx) {
        const isPublished = pub.status === 'Published';
        const accentColor = isPublished ? '#00d4ff' : '#a855f7';
        const badgeClass = isPublished ? 'pub-badge-published' : 'pub-badge-review';
        const abstract = ABSTRACTS[pub.id] || 'Abstract not available.';

        return `
      <article class="pub-card" data-id="${pub.id}" style="animation-delay:${idx * 0.09}s">
        <div class="pub-card-bar" style="background:${accentColor}"></div>
        <div class="pub-card-body">
          <div class="pub-card-top">
            <div class="pub-card-meta-left">
              <span class="pub-year">${pub.date}</span>
              <span class="pub-role">${pub.role}</span>
            </div>
            <span class="${badgeClass}">${isPublished ? '● PUBLISHED' : '◐ UNDER REVIEW'}</span>
          </div>
          <h3 class="pub-title">${pub.link ? `<a href="${pub.link}" target="_blank" rel="noopener">${pub.title}</a>` : pub.title}</h3>
          <p class="pub-venue"><i class="fas fa-book-open mr-2 opacity-50"></i>${pub.venue}</p>
          <div class="pub-actions">
            ${pub.link ? `<a href="${pub.link}" target="_blank" rel="noopener" class="pub-action-pill pub-action-read"><i class="fas fa-external-link-alt mr-1.5"></i>Read Paper</a>` : '<span class="pub-action-pill pub-action-locked"><i class="fas fa-lock mr-1.5 opacity-40"></i>Under Review</span>'}
            <button class="pub-action-pill pub-action-abstract" data-id="${pub.id}" aria-expanded="false">
              Cite Abstract <i class="fas fa-chevron-down ml-1.5 pub-chevron"></i>
            </button>
          </div>
          <div class="pub-abstract-wrap" id="abstract-${pub.id}">
            <div class="pub-abstract-inner">
              <p class="pub-abstract-text">${abstract}</p>
              <button class="pub-copy-btn" data-abstract="${pub.id}">
                <i class="fas fa-copy mr-1.5"></i>Copy Citation
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
    }

    // ── Render list ───────────────────────────────────────────────────────
    let activeFilter = 'all';

    function renderList(filter) {
        const container = document.getElementById('pub-cards-list');
        if (!container) return;
        const list = filter === 'all' ? pubs : filter === 'published' ? published : underReview;
        container.innerHTML = list.map((p, i) => cardHtml(p, i)).join('');
        bindAbstractToggles();
    }

    function bindAbstractToggles() {
        document.querySelectorAll('.pub-action-abstract').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const wrap = document.getElementById(`abstract-${id}`);
                const icon = btn.querySelector('.pub-chevron');
                const open = wrap.classList.contains('open');
                wrap.classList.toggle('open', !open);
                icon.style.transform = open ? '' : 'rotate(180deg)';
                btn.setAttribute('aria-expanded', String(!open));
            });
        });

        document.querySelectorAll('.pub-copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.abstract;
                const pub = pubs.find(p => p.id === id);
                if (pub) {
                    navigator.clipboard.writeText(`${pub.title}. ${pub.venue}, ${pub.date}.`).then(() => {
                        btn.innerHTML = '<i class="fas fa-check mr-1.5"></i>Copied!';
                        setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy mr-1.5"></i>Copy Citation'; }, 2200);
                    });
                }
            });
        });
    }

    renderList('all');

    // Filter pills
    document.querySelectorAll('.pub-filter-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pub-filter-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            renderList(activeFilter);
        });
    });

    // ── Sidebar stats ─────────────────────────────────────────────────────
    const statEls = {
        total: document.getElementById('pub-stat-total'),
        pub: document.getElementById('pub-stat-published'),
        review: document.getElementById('pub-stat-review'),
    };

    function animateCount(el, target, duration = 1200) {
        if (!el) return;
        let start = null;
        function step(ts) {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            el.textContent = Math.round(progress * target);
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // Trigger count-up when sidebar scrolls into view
    const sidebar = document.getElementById('pub-sidebar');
    if (sidebar) {
        const obs = new IntersectionObserver(entries => {
            if (!entries[0].isIntersecting) return;
            obs.unobserve(sidebar);
            animateCount(statEls.total, pubs.length);
            animateCount(statEls.pub, published.length);
            animateCount(statEls.review, underReview.length);
        }, { threshold: 0.3 });
        obs.observe(sidebar);
    }

    // ── Arc chart (pure Canvas) ───────────────────────────────────────────
    const arcCanvas = document.getElementById('pub-arc-canvas');
    if (arcCanvas) {
        const ctx = arcCanvas.getContext('2d');
        const W = arcCanvas.width = 140;
        const H = arcCanvas.height = 140;
        const cx = W / 2, cy = H / 2, r = 52, sw = 12;
        const pct = published.length / pubs.length;

        // Background track
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = sw;
        ctx.stroke();

        // Published arc (cyan)
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = sw;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(0, 212, 255, 0.5)';
        ctx.shadowBlur = 10;
        ctx.stroke();

        // Under Review arc (violet) — picks up where cyan left off
        if (underReview.length > 0) {
            const start = -Math.PI / 2 + Math.PI * 2 * pct + 0.06;
            ctx.beginPath();
            ctx.arc(cx, cy, r, start, start + Math.PI * 2 * (underReview.length / pubs.length) - 0.06);
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = sw;
            ctx.lineCap = 'round';
            ctx.shadowColor = 'rgba(168,85,247,0.5)';
            ctx.shadowBlur = 10;
            ctx.stroke();
        }

        // Center label
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = `bold 22px 'Syne', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pubs.length, cx, cy - 10);
        ctx.fillStyle = '#94a3b8';
        ctx.font = `11px 'Space Mono', monospace`;
        ctx.fillText('papers', cx, cy + 12);
    }

    // ── Area tags ─────────────────────────────────────────────────────────
    const areasEl = document.getElementById('pub-areas-tags');
    if (areasEl) {
        areasEl.innerHTML = AREAS.map(a => `<span class="pub-area-tag">${a}</span>`).join('');
    }
})();
