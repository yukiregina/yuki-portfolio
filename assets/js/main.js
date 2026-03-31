/* ============================================================
   YUKI REGINA — Interactions
   01. Custom cursor (lag + expand)
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

  /* ── 01. Custom Cursor ─────────────────────────────────── */
  const ring = document.querySelector('.cursor-ring');
  const dot  = document.querySelector('.cursor-dot');

  if (ring && dot) {
    let mx = 0, my = 0;   // mouse position
    let rx = 0, ry = 0;   // ring position (lagged)
    const speed = 0.11;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      // Dot follows instantly
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });

    (function animRing() {
      rx += (mx - rx) * speed;
      ry += (my - ry) * speed;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(animRing);
    })();

    // Expand ring on interactive elements
    const hoverTargets = document.querySelectorAll(
      'a, button, .project-card, .project-row, .testimonial-card, .contact-item, .before-card'
    );
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });

    document.addEventListener('mousedown', () => ring.classList.add('clicking'));
    document.addEventListener('mouseup',   () => ring.classList.remove('clicking'));
    document.addEventListener('mouseleave', () => document.body.classList.add('cursor-hidden'));
    document.addEventListener('mouseenter', () => document.body.classList.remove('cursor-hidden'));
  }


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


  /* ── 03. Hero headline mask reveal ────────────────────── */
  const heroLines = document.querySelectorAll('.reveal-line');
  if (heroLines.length) {
    // Small delay so layout is painted before animation starts
    requestAnimationFrame(() => {
      setTimeout(() => {
        heroLines.forEach(l => l.classList.add('animated'));
      }, 180);
    });
  }

  // Hero supporting elements fade up
  document.querySelectorAll('.hero-fade').forEach((el, i) => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(16px)';
    el.style.transition = `opacity 0.7s ease ${0.55 + i * 0.12}s, transform 0.7s ease ${0.55 + i * 0.12}s`;
    setTimeout(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    }, 100);
  });

  // Badge entrance
  const badge = document.querySelector('.badge');
  if (badge) {
    badge.style.cssText += 'opacity:0;transform:translateY(10px) scale(0.96);transition:opacity 0.5s ease 0.35s,transform 0.5s ease 0.35s';
    setTimeout(() => {
      badge.style.opacity   = '1';
      badge.style.transform = 'translateY(0) scale(1)';
    }, 100);
  }


  /* ── 04. Scroll reveal (IntersectionObserver) ─────────── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale');
  if (revealEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));
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
    transition:opacity 0.32s ease;
  `;
  document.body.appendChild(overlay);

  // Fade in on page load
  overlay.style.opacity        = '1';
  overlay.style.pointerEvents  = 'all';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    overlay.style.opacity       = '0';
    overlay.style.pointerEvents = 'none';
  }));

  // Fade out on link click
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') ||
        href.startsWith('tel') || href.startsWith('http')) return;
    // NDA cards handle their own navigation via the password modal — skip them
    if (link.querySelector('.project-nda')) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.style.opacity       = '1';
      overlay.style.pointerEvents = 'all';
      setTimeout(() => { window.location.href = href; }, 320);
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
    logoMark.style.transition = 'transform 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.1s, opacity 0.4s ease 0.1s';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      logoMark.style.transform = 'rotate(0deg)';
      logoMark.style.opacity   = '1';
    }));
  }


  /* ── 10. Staggered children of [data-stagger] ──────────── */
  document.querySelectorAll('[data-stagger]').forEach(group => {
    group.querySelectorAll('.reveal, .reveal-scale').forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.09}s`;
    });
  });

});
