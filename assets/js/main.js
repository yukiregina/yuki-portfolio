/* ============================================================
   YUKI REGINA — Interactions
   02. Nav scroll state + progress bar
   03. Hero headline mask reveal
   04. Scroll-triggered fade/scale reveals
   05. Magnetic CTA buttons
   06. Project card 3D tilt
   07. Page fade transitions
   08. Contact icon micro-bounce
   09. Asterisk logo spin on load
   10. Active nav state
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 02. Nav scroll state + progress bar ──────────────── */
  const nav         = document.querySelector('.nav');
  const progressBar = document.querySelector('.scroll-progress');

  if (nav) {
    const updateNav = () => {
      const scrolled = window.scrollY > 40;
      nav.classList.toggle('scrolled', scrolled);

      if (progressBar) {
        const total    = document.documentElement.scrollHeight - window.innerHeight;
        const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
        progressBar.style.width = progress + '%';
      }
    };
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  // Active nav link
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .footer-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });


  /* ── 03. Hero entrance ────────────────────────────────── */
  // Hero entrance (headline mask reveal, supporting fades, badge) is now
  // driven entirely by fast, mount-fired CSS animations in index.html so
  // the first viewport is readable within ~500ms with no JS dependency.


  /* ── 04. Scroll reveal (IntersectionObserver) ─────────── */
  const prefersReducedMotion =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  if (revealEls.length) {
    if (prefersReducedMotion) {
      // No entrance animation — show everything immediately.
      revealEls.forEach(el => el.classList.add('revealed'));
    } else {
      // Above-the-fold elements reveal on mount — never wait for a scroll.
      requestAnimationFrame(() => {
        revealEls.forEach(el => {
          if (el.getBoundingClientRect().top < window.innerHeight) {
            el.classList.add('revealed');
          }
        });
      });

      // Everything below the fold reveals once it is ~20% into the viewport.
      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      revealEls.forEach(el => {
        if (!el.classList.contains('revealed')) io.observe(el);
      });
    }
  }


  /* ── 05. Magnetic CTA buttons ─────────────────────────── */
  document.querySelectorAll('.btn-primary, .btn-outline, .cta-pill').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * 0.22;
      const dy = (e.clientY - (r.top  + r.height / 2)) * 0.22;
      btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-2px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });


  /* ── 06. Project card 3D tilt ─────────────────────────── */
  document.querySelectorAll('.project-card, .project-row-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.15s ease, box-shadow 0.5s ease';
    });
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateY(-6px) scale(1.01)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.5s ease';
      card.style.transform  = '';
    });
  });


  /* ── 07. Smooth page fade transitions ─────────────────── */
  // Build overlay
  const overlay = Object.assign(document.createElement('div'), {});
  overlay.style.cssText = `
    position:fixed;inset:0;background:var(--bg);
    z-index:9990;opacity:0;pointer-events:none;
    transition:opacity 0.22s ease;
  `;
  document.body.appendChild(overlay);

  // Fade in on page load — skipped entirely when reduced motion is preferred
  // so content is never briefly hidden behind the overlay.
  if (!prefersReducedMotion) {
    overlay.style.opacity        = '1';
    overlay.style.pointerEvents  = 'all';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      overlay.style.opacity       = '0';
      overlay.style.pointerEvents = 'none';
    }));
  }

  // Fade out on link click
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') ||
        href.startsWith('tel') || href.startsWith('http')) return;
    // Let downloads (e.g. the CV PDF) and explicit new-tab links behave natively
    if (link.hasAttribute('download') || link.getAttribute('target') === '_blank') return;
    // NDA cards handle their own navigation via the password modal — skip them
    if (link.querySelector('.project-nda')) return;

    link.addEventListener('click', e => {
      if (prefersReducedMotion) return; // navigate normally, no transition
      e.preventDefault();
      overlay.style.opacity       = '1';
      overlay.style.pointerEvents = 'all';
      setTimeout(() => { window.location.href = href; }, 220);
    });
  });


  /* ── 08. Contact icon micro-bounce on hover ──────────── */
  document.querySelectorAll('.contact-item').forEach((item, i) => {
    item.style.opacity    = '0';
    item.style.transform  = 'translateY(20px)';
    item.style.transition = `opacity 0.55s ease ${0.25 + i * 0.09}s, transform 0.55s ease ${0.25 + i * 0.09}s`;
    // Trigger after brief delay
    requestAnimationFrame(() => requestAnimationFrame(() => {
      item.style.opacity   = '1';
      item.style.transform = 'translateY(0)';
    }));
  });


  /* ── 09. Asterisk logo — entrance spin on load ─────────── */
  const logoMark = document.querySelector('.nav-logo-mark');
  if (logoMark) {
    logoMark.style.transform  = 'rotate(-90deg)';
    logoMark.style.opacity    = '0';
    logoMark.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1) 0.05s, opacity 0.3s ease 0.05s';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      logoMark.style.transform = 'rotate(0deg)';
      logoMark.style.opacity   = '1';
    }));
  }


  /* ── 10. Staggered children of [data-stagger] ──────────── */
  document.querySelectorAll('[data-stagger]').forEach(group => {
    group.querySelectorAll('.reveal, .reveal-scale').forEach((child, i) => {
      child.style.transitionDelay = `${Math.min(i, 3) * 0.05}s`;
    });
  });


  /* ── 11. Lazy-load / pause case-study videos ───────────── */
  document.querySelectorAll('video').forEach(video => {
    video.preload = 'none';

    if (prefersReducedMotion) {
      video.removeAttribute('autoplay');
      video.pause();
      return;
    }

    const syncPlayback = () => {
      const r = video.getBoundingClientRect();
      const inView = r.bottom > 0 && r.top < window.innerHeight;
      if (inView && !document.hidden) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !document.hidden) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.2 });

    io.observe(video);
    document.addEventListener('visibilitychange', syncPlayback);
  });

});
