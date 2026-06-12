/* ============================================================
   Homepage hero — canvas atmosphere, aurora, anchor nav
   Loaded only on index.html
   ============================================================ */

(function () {
  const canvas   = document.getElementById('hero-canvas');
  const greeting = document.getElementById('time-greeting');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  const themes = {
    dawn:      { orbs: ['#FFDAB8','#FFC8C0','#D4C8E8','#C8D8F0'], op: 0.30, label: 'Good morning'  },
    morning:   { orbs: ['#FFE8B0','#FFD8A0','#C8E4F8','#E4F0C4'], op: 0.24, label: 'Good morning'  },
    midday:    { orbs: ['#D0E8FF','#D8F0F8','#F0F8D0','#FFF8C4'], op: 0.20, label: 'Good afternoon' },
    afternoon: { orbs: ['#FFD4A4','#F8D0C8','#D0D8F4','#E8D8F0'], op: 0.26, label: 'Good afternoon' },
    dusk:      { orbs: ['#FF9C6C','#FFBCA0','#8888CC','#C08898'], op: 0.30, label: 'Good evening'   },
    evening:   { orbs: ['#6458B8','#8060A4','#A07880','#5060A8'], op: 0.36, label: 'Good evening'   },
    night:     { orbs: ['#3428A0','#483880','#243090','#1E3080'], op: 0.42, label: 'Good night'     }
  };

  function getKey() {
    const h = new Date().getHours();
    if (h >= 4  && h < 7)  return 'dawn';
    if (h >= 7  && h < 12) return 'morning';
    if (h >= 12 && h < 14) return 'midday';
    if (h >= 14 && h < 18) return 'afternoon';
    if (h >= 18 && h < 21) return 'dusk';
    if (h >= 21)            return 'evening';
    return 'night';
  }

  const theme = themes[getKey()];

  if (greeting) greeting.textContent = theme.label;

  let orbs = [];

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function initOrbs() {
    orbs = theme.orbs.map((color, i) => ({
      x:     (canvas.width  / theme.orbs.length) * i + canvas.width  / (theme.orbs.length * 2),
      y:     canvas.height * (0.2 + (i % 2) * 0.5),
      r:     canvas.width  * (0.22 + (i % 3) * 0.08),
      vx:    (Math.random() - 0.5) * 0.32,
      vy:    (Math.random() - 0.5) * 0.22,
      color,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function hexToRgb(hex) {
    return `${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)}`;
  }

  let frame = 0;
  let running = false;
  let rafId = null;

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;
    orbs.forEach(orb => {
      orb.x += orb.vx + Math.sin(frame * 0.007 + orb.phase) * 0.38;
      orb.y += orb.vy + Math.cos(frame * 0.005 + orb.phase) * 0.28;
      if (orb.x < -orb.r)                orb.x = canvas.width  + orb.r;
      if (orb.x > canvas.width  + orb.r) orb.x = -orb.r;
      if (orb.y < -orb.r)                orb.y = canvas.height + orb.r;
      if (orb.y > canvas.height + orb.r) orb.y = -orb.r;
      const g = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
      g.addColorStop(0,   `rgba(${hexToRgb(orb.color)}, ${theme.op})`);
      g.addColorStop(0.5, `rgba(${hexToRgb(orb.color)}, ${theme.op * 0.4})`);
      g.addColorStop(1,   `rgba(${hexToRgb(orb.color)}, 0)`);
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });
    rafId = requestAnimationFrame(draw);
  }

  function startCanvas() {
    if (running || reduceMotion) return;
    running = true;
    draw();
  }

  function stopCanvas() {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  if (!reduceMotion) {
    requestAnimationFrame(() => { resize(); initOrbs(); startCanvas(); });
    setTimeout(() => canvas.classList.add('loaded'), 300);

    const hero = canvas.closest('.hero');
    if (hero) {
      const heroIo = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !document.hidden) startCanvas();
          else stopCanvas();
        });
      }, { threshold: 0 });
      heroIo.observe(hero);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopCanvas();
      else {
        const hero = canvas.closest('.hero');
        if (hero) {
          const r = hero.getBoundingClientRect();
          if (r.bottom > 0 && r.top < window.innerHeight) startCanvas();
        }
      }
    });
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); initOrbs(); }, 150);
  });
})();

/* ── Aurora right — fade in + pause when hero off-screen ─ */
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setTimeout(() => {
    const aurora = document.getElementById('aurora-right');
    const hero   = document.querySelector('.hero');
    if (!aurora || !hero) return;
    aurora.classList.add('loaded');

    const heroIo = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        aurora.classList.toggle('paused', !entry.isIntersecting || document.hidden);
      });
    }, { threshold: 0 });
    heroIo.observe(hero);

    document.addEventListener('visibilitychange', () => {
      const r = hero.getBoundingClientRect();
      const inView = r.bottom > 0 && r.top < window.innerHeight;
      aurora.classList.toggle('paused', document.hidden || !inView);
    });
  }, 400);
}

/* ── Japanese characters + click ripples ────────────── */
(function () {
  const fx = document.getElementById('hero-fx');
  if (!fx) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = fx.getContext('2d');

  const JP = 'レレレレレレジジジジジジーーーーーーナナナナナナユユユユユユキキキキキキ雪雪雪あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよわをんアイウエオカキクケコサシスセソタチツテトハヒフヘホマミムメモヤユヨラリルレロ夢空花心時光道形美';

  let cols = [];
  const GAP = 34, FS = 18;

  function initCols() {
    cols = [];
    const count = Math.floor(fx.width / GAP);
    for (let i = 0; i < count; i++) {
      cols.push({
        x:    i * GAP + GAP / 2,
        y:    Math.random() * -fx.height,
        spd:  0.35 + Math.random() * 0.5,
        op:   0.055 + Math.random() * 0.045,
        ch:   JP[Math.floor(Math.random() * JP.length)],
        tick: 0,
        int:  50 + Math.floor(Math.random() * 90)
      });
    }
  }

  function resize() {
    fx.width  = fx.offsetWidth;
    fx.height = fx.offsetHeight;
    initCols();
  }

  const ripples = [];
  const heroEl = fx.closest('.hero') || document.querySelector('.hero');
  heroEl.addEventListener('click', e => {
    const r = fx.getBoundingClientRect();
    ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, rad: 0, max: 70 + Math.random() * 30 });
    ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, rad: 0, max: 40 + Math.random() * 20, delay: 8 });
  });

  let running = false;
  let rafId = null;

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, fx.width, fx.height);
    ctx.font = `${FS}px serif`;

    for (const col of cols) {
      col.y   += col.spd;
      col.tick++;
      if (col.tick >= col.int) { col.ch = JP[Math.floor(Math.random() * JP.length)]; col.tick = 0; }
      if (col.y > fx.height + FS) { col.y = -FS * 2; }
      ctx.globalAlpha = col.op;
      ctx.fillStyle = '#015FA6';
      ctx.fillText(col.ch, col.x, col.y);
    }

    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      if (rip.delay && rip.delay-- > 0) continue;
      rip.rad += 1.2;
      const prog  = rip.rad / rip.max;
      const alpha = (1 - prog) * 0.18;
      if (alpha <= 0.005) { ripples.splice(i, 1); continue; }
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#015FA6';
      ctx.lineWidth   = 0.7;
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.rad, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(draw);
  }

  function startFx() {
    if (running) return;
    running = true;
    draw();
  }

  function stopFx() {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function init() {
    resize();
    if (fx.width === 0 || fx.height === 0) {
      setTimeout(init, 100);
      return;
    }
    startFx();

    const heroIo = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !document.hidden) startFx();
        else stopFx();
      });
    }, { threshold: 0 });
    heroIo.observe(heroEl);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopFx();
      else {
        const r = heroEl.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) startFx();
      }
    });
  }

  setTimeout(init, 50);
  window.addEventListener('resize', () => resize());
})();

/* ── Anchor nav — highlight active section on scroll ── */
(function () {
  const sections = ['work', 'about', 'contact'];
  const links    = document.querySelectorAll('.nav-link, .footer-link');
  const visible  = new Set();

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visible.add(entry.target.id);
      else visible.delete(entry.target.id);
    });
    const activeId = sections.find(id => visible.has(id)) || null;
    links.forEach(l => {
      l.classList.toggle('active', activeId !== null && l.getAttribute('href') === '#' + activeId);
    });
  }, { threshold: 0.25 });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });
})();
