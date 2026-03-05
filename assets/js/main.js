/* ===== THEME ===== */
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const iconSun = document.getElementById('icon-sun');
  const iconMoon = document.getElementById('icon-moon');

  function updateIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    iconSun.classList.toggle('hidden', !isDark);
    iconMoon.classList.toggle('hidden', isDark);
  }

  updateIcons();

  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateIcons();
  });
}

/* ===== NAVBAR ===== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);

    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) current = section.id;
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ===== MOBILE MENU ===== */
function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const iconBars = document.getElementById('icon-bars');
  const iconTimes = document.getElementById('icon-times');

  function closeMenu() {
    menu.classList.add('hidden');
    iconBars.classList.remove('hidden');
    iconTimes.classList.add('hidden');
  }

  toggle.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('hidden');
    if (isOpen) {
      closeMenu();
    } else {
      menu.classList.remove('hidden');
      iconBars.classList.add('hidden');
      iconTimes.classList.remove('hidden');
    }
  });

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* ===== TYPEWRITER ===== */
function initTypewriter() {
  const el = document.getElementById('typewriter-text');
  if (!el || !config.taglines) return;

  const words = config.taglines;
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const current = words[wordIndex];
    if (isDeleting) {
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;
    }

    let speed = isDeleting ? 45 : 95;

    if (!isDeleting && charIndex === current.length) {
      speed = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      speed = 450;
    }

    setTimeout(type, speed);
  }

  setTimeout(type, 800);
}

/* ===== BACK TO TOP ===== */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ===== TOAST ===== */
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  document.getElementById('toast-message').textContent = message;
  document.getElementById('toast-icon').className = type === 'success'
    ? 'fas fa-check-circle text-emerald-400 text-lg'
    : 'fas fa-exclamation-circle text-red-400 text-lg';

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4500);
}

/* ===== CERTIFICATIONS ===== */
function renderCertifications() {
  const container = document.getElementById('certifications-list');
  if (!container || !certifications) return;

  container.innerHTML = certifications.map(cert => `
    <div class="cert-badge">
      <div class="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
        <i class="fas fa-shield-halved text-[#00d4ff] text-sm"></i>
      </div>
      <div>
        <div class="text-sm font-semibold text-slate-200">${cert.name}</div>
        <div class="text-xs text-slate-500 mt-0.5">${cert.issuer} &middot; ${cert.date}</div>
      </div>
    </div>
  `).join('');
}

/* ===== EDUCATION ===== */
async function renderEducation() {
  const container = document.getElementById('education-list');
  if (!container) return;

  const data = await fetch('./data/education.json').then(r => r.json());

  container.innerHTML = data.map(edu => `
    <div class="glass-card rounded-2xl p-5">
      <div class="flex items-start justify-between gap-3 mb-2">
        <div>
          <h4 class="font-semibold text-slate-100 text-sm leading-snug">${edu.school}</h4>
          <p class="text-xs text-[#00d4ff] font-medium mt-0.5">${edu.degree}</p>
        </div>
        <span class="text-xs text-slate-500 whitespace-nowrap">${edu.start} – ${edu.end}</span>
      </div>
      <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
        <span><i class="fas fa-location-dot mr-1"></i>${edu.location}</span>
        <span><i class="fas fa-star mr-1 text-yellow-400/80"></i>GPA ${edu.gpa}</span>
      </div>
      ${edu.honors.length ? `
        <div class="flex flex-wrap gap-1.5 mt-3">
          ${edu.honors.map(h => `<span class="tag-badge">${h}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');
}

/* ===== SKILLS ===== */
async function renderSkills() {
  const container = document.getElementById('skills-grid');
  if (!container) return;

  const data = await fetch('./data/skills.json').then(r => r.json());

  container.innerHTML = data.map((cat, i) => `
    <div class="glass-card rounded-2xl p-6" data-aos="fade-up" data-aos-delay="${i * 80}">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
          <i class="fas ${cat.icon || 'fa-cog'} text-[#00d4ff] text-sm"></i>
        </div>
        <h3 class="font-display font-semibold text-slate-100 text-sm">${cat.category}</h3>
      </div>
      <div class="flex flex-wrap gap-2">
        ${cat.items.map(item => `<span class="tag-badge">${item}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

/* ===== EXPERIENCE ===== */
async function renderExperience() {
  const container = document.getElementById('experience-timeline');
  if (!container) return;

  const data = await fetch('./data/experience.json').then(r => r.json());

  const html = data.map((exp, i) => {
    const pos  = i % 2 === 0 ? 'above' : 'below';
    const num  = String(i + 1).padStart(2, '0');
    const dept = exp.department
      ? `<span class="text-slate-500 font-normal"> · ${exp.department}</span>`
      : '';
    return `
      <div class="chapter-item ${pos}">
        <div class="chapter-dot"></div>
        <div class="chapter-stem"></div>
        <div class="chapter-card-wrap">
          <div class="chapter-card">
            <span class="chapter-num">// ${num}</span>
            <h3 class="chapter-role">${exp.role}</h3>
            <p class="chapter-company">${exp.company}${dept}</p>
            <div class="chapter-meta">
              <span><i class="far fa-calendar mr-1"></i>${exp.start} – ${exp.end}</span>
              <span><i class="fas fa-location-dot mr-1"></i>${exp.location}</span>
            </div>
            <div class="chapter-divider"></div>
            <ul class="chapter-bullets">
              ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.insertAdjacentHTML('beforeend', html);

  // Arrow navigation
  const scrollEl = document.getElementById('exp-scroll');
  const prevBtn  = document.getElementById('exp-prev');
  const nextBtn  = document.getElementById('exp-next');
  const hint     = document.getElementById('exp-scroll-hint');
  const STEP     = 360;

  function updateArrows() {
    if (!scrollEl) return;
    const atStart = scrollEl.scrollLeft <= 10;
    const atEnd   = scrollEl.scrollLeft + scrollEl.clientWidth >= scrollEl.scrollWidth - 10;
    prevBtn?.classList.toggle('opacity-0', atStart);
    prevBtn?.classList.toggle('pointer-events-none', atStart);
    nextBtn?.classList.toggle('opacity-0', atEnd);
    nextBtn?.classList.toggle('pointer-events-none', atEnd);
  }

  prevBtn?.addEventListener('click', () => scrollEl.scrollBy({ left: -STEP, behavior: 'smooth' }));
  nextBtn?.addEventListener('click', () => scrollEl.scrollBy({ left:  STEP, behavior: 'smooth' }));

  if (scrollEl) {
    scrollEl.addEventListener('scroll', () => {
      updateArrows();
      if (scrollEl.scrollLeft > 40 && hint) hint.style.opacity = '0';
    }, { passive: true });

    // Drag-to-scroll
    let isDown = false, startX = 0, scrollStart = 0;
    scrollEl.addEventListener('mousedown', e => {
      isDown = true;
      startX = e.pageX - scrollEl.offsetLeft;
      scrollStart = scrollEl.scrollLeft;
    });
    scrollEl.addEventListener('mouseleave', () => { isDown = false; });
    scrollEl.addEventListener('mouseup',    () => { isDown = false; });
    scrollEl.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      scrollEl.scrollLeft = scrollStart - (e.pageX - scrollEl.offsetLeft - startX);
    });
  }

  updateArrows();
}

/* ===== PROJECTS ===== */
async function renderProjects() {
  const grid = document.getElementById('projects-grid');
  const filtersEl = document.getElementById('project-filters');
  if (!grid) return;

  const data = await fetch('./data/projects.json').then(r => r.json());

  // Build unique tag list
  const allTags = ['All', ...new Set(data.flatMap(p => p.tags))];

  if (filtersEl) {
    filtersEl.innerHTML = allTags.map(tag => `
      <button class="filter-btn ${tag === 'All' ? 'active' : ''}" data-tag="${tag}">${tag}</button>
    `).join('');

    filtersEl.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      const tag = btn.dataset.tag;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.project-card').forEach(card => {
        const tags = JSON.parse(card.dataset.tags);
        card.style.display = (tag === 'All' || tags.includes(tag)) ? '' : 'none';
      });
    });
  }

  grid.innerHTML = data.map((p, i) => `
    <div class="project-card glass-card rounded-2xl p-6 flex flex-col"
         data-tags='${JSON.stringify(p.tags)}'
         data-aos="fade-up" data-aos-delay="${i * 80}">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
          <i class="fas fa-cube text-[#00d4ff] text-sm"></i>
        </div>
        ${p.featured ? `<span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-[#00d4ff] border border-cyan-500/20">Featured</span>` : ''}
      </div>
      <h3 class="font-display font-semibold text-slate-100 leading-snug mb-2">${p.title}</h3>
      <p class="text-sm text-slate-400 leading-relaxed mb-4 flex-1">${p.description}</p>
      <div class="flex flex-wrap gap-1.5 mb-4">
        ${p.tags.map(t => `<span class="tag-badge">${t}</span>`).join('')}
      </div>
      <div class="flex items-center gap-4 pt-2 border-t border-slate-700/40">
        ${p.github ? `
          <a href="${p.github}" target="_blank" rel="noopener noreferrer"
             class="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-[#00d4ff] transition-colors">
            <i class="fab fa-github text-sm"></i> Code
          </a>
        ` : ''}
        ${p.demo ? `
          <a href="${p.demo}" target="_blank" rel="noopener noreferrer"
             class="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-[#00d4ff] transition-colors">
            <i class="fas fa-arrow-up-right-from-square text-xs"></i> Live Demo
          </a>
        ` : ''}
        <span class="ml-auto text-xs text-slate-600">${p.date}</span>
      </div>
    </div>
  `).join('');
}

/* ===== PUBLICATIONS ===== */
async function renderPublications() {
  const container = document.getElementById('publications-list');
  if (!container) return;

  const data = await fetch('./data/publications.json').then(r => r.json());

  container.innerHTML = data.map((pub, i) => {
    // Color-code by status/venue
    let color = 'cyan';
    if (pub.status === 'Under Review') color = 'amber';
    else if (pub.venue.includes('IEEE') || pub.venue.toLowerCase().includes('icraset')) color = 'violet';

    const year = pub.date.match(/\d{4}/)?.[0] || '';

    const statusBadge = pub.status === 'Published'
      ? `<span class="status-published"><i class="fas fa-circle-check"></i> Published</span>`
      : `<span class="status-review"><i class="fas fa-clock"></i> Under Review</span>`;

    const linkHtml = pub.link
      ? `<a href="${pub.link}" target="_blank" rel="noopener noreferrer" class="spine-tooltip-link">
           <i class="fas fa-arrow-up-right-from-square"></i>View Paper
         </a>`
      : '';

    return `
      <div class="book-spine spine-${color}" style="animation-delay:${i * 0.09}s" role="button" tabindex="0" aria-label="${pub.title}">
        ${pub.status === 'Under Review' ? '<span class="spine-review-dot" aria-hidden="true"></span>' : ''}
        <span class="spine-title">${pub.title}</span>
        <span class="spine-year">${year}</span>
        <div class="book-tooltip" role="tooltip">
          <div class="tooltip-status">${statusBadge}</div>
          <h4 class="tooltip-title">${pub.title}</h4>
          <p class="tooltip-venue"><i class="fas fa-book-open"></i>${pub.venue}</p>
          <p class="tooltip-meta"><i class="far fa-calendar mr-1"></i>${pub.date} &nbsp;·&nbsp; <i class="fas fa-user mr-1"></i>${pub.role}</p>
          ${linkHtml}
          <div class="tooltip-arrow" aria-hidden="true"></div>
        </div>
      </div>
    `;
  }).join('');
}

/* ===== CONTACT FORM (iMessage chat interface) ===== */
function initContactForm() {
  const chatBody   = document.getElementById('chat-body');
  const chatInput  = document.getElementById('chat-input');
  const sendBtn    = document.getElementById('chat-send-btn');
  const typingEl   = document.getElementById('typing-indicator');
  const phoneFrame = document.getElementById('phone-frame');
  const form       = document.getElementById('contact-form');
  const hiddenMsg  = document.getElementById('hidden-message');

  if (!chatBody) return;

  // Stagger-animate pre-filled bubbles when phone scrolls into view
  if (phoneFrame) {
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      obs.unobserve(phoneFrame);
      chatBody.querySelectorAll('.chat-msg[data-delay]').forEach(msg => {
        const delay = parseInt(msg.dataset.delay, 10) || 0;
        setTimeout(() => msg.classList.add('chat-visible'), delay);
      });
    }, { threshold: 0.25 });
    obs.observe(phoneFrame);
  }

  if (!chatInput || !sendBtn) return;

  function scrollBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function appendBubble(text, side) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const div  = document.createElement('div');
    div.className = `chat-msg ${side}`;
    div.innerHTML = `<div class="bubble">${text}</div><span class="msg-time">${time}</span>`;
    chatBody.insertBefore(div, typingEl);
    requestAnimationFrame(() => div.classList.add('chat-visible'));
    scrollBottom();
  }

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';
    sendBtn.disabled = true;

    appendBubble(text, 'them');

    if (typingEl) { typingEl.style.display = 'flex'; scrollBottom(); }

    // Silent Formspree POST — no toast, no error shown
    if (form && hiddenMsg) {
      hiddenMsg.value = text;
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      }).catch(() => {});
    }

    await new Promise(r => setTimeout(r, 2000));
    if (typingEl) typingEl.style.display = 'none';
    appendBubble("Thanks for your message! I'll get back to you soon 🚀", 'me');
    sendBtn.disabled = false;
  }

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
  });
}

/* ===== FOOTER YEAR ===== */
function initFooter() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initNavbar();
  initMobileMenu();
  initTypewriter();
  initBackToTop();
  initContactForm();
  initFooter();
  renderCertifications();

  await Promise.all([
    renderEducation(),
    renderSkills(),
    renderExperience(),
    renderPublications(),
    renderProjects(),
  ]);

  AOS.init({
    duration: 650,
    easing: 'ease-out-quart',
    once: true,
    offset: 60,
  });
});
