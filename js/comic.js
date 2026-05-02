/* ============================================================
   KAMALA COMICS — comic.js
   All interactive effects and animations
   ============================================================ */

(function () {
  'use strict';

  // Fade-in on page load for smooth transitions
  if (!document.getElementById('loader') || sessionStorage.getItem('kamala-loaded')) {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { document.body.style.opacity = '1'; });
    });
  }

  /* ============================================================
     1. LOADER
     ============================================================ */
  const loader = document.getElementById('loader');
  const siteContent = document.getElementById('site-content');
  let barcodeClicks = 0;

  function hideLoader() {
    if (!loader) return;
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.style.display = 'none';
      if (siteContent) siteContent.classList.add('revealed');
      checkReveal();
    }, 600);
  }

  // Show loader ONLY on:
  //   1. Very first visit (no sessionStorage flag)
  //   2. Hard refresh (reload via refresh button, F5, or Cmd+R)
  // Skip loader on internal page navigation (clicking nav links)
  if (loader) {
    const isReload = (performance.getEntriesByType('navigation')[0] || {}).type === 'reload';
    const hasVisited = sessionStorage.getItem('kamala-loaded');

    if (!hasVisited || isReload) {
      // First visit or hard refresh — show the loader
      sessionStorage.setItem('kamala-loaded', '1');
      setTimeout(hideLoader, 2500);
    } else {
      // Internal navigation — skip loader instantly
      loader.style.display = 'none';
      if (siteContent) siteContent.classList.add('revealed');
      setTimeout(checkReveal, 50);
    }
  }

  // Barcode Easter Egg
  const barcode = document.getElementById('loader-barcode');
  if (barcode) {
    barcode.addEventListener('click', () => {
      barcodeClicks++;
      barcode.style.transform = `scale(${1 + barcodeClicks * 0.05})`;
      if (barcodeClicks >= 3) {
        // Delay to show the panel after loader hides
        setTimeout(showSecretPanel, 100);
        barcodeClicks = 0;
      }
    });
  }

  /* ============================================================
     2. CUSTOM CURSOR + TRAIL
     ============================================================ */
  const cursorDot = document.getElementById('cursor-dot');
  const TRAIL_COUNT = 9;
  const trailDots = [];
  const trailColors = ['#FF3CAC', '#FFD93D', '#5EF2C2', '#6EDCFF', '#FF5DA2', '#B8FF3C', '#FF3B3B', '#3CF2FF', '#FF3CAC'];

  for (let i = 0; i < TRAIL_COUNT; i++) {
    const d = document.createElement('div');
    d.className = 'cursor-trail-dot';
    d.style.background = trailColors[i % trailColors.length];
    d.style.opacity = String(1 - i * 0.1);
    d.style.width = d.style.height = `${8 - i * 0.6}px`;
    document.body.appendChild(d);
    trailDots.push({ el: d, x: -100, y: -100 });
  }

  let mouseX = -100, mouseY = -100;
  let dotX = -100, dotY = -100;
  const positions = Array(TRAIL_COUNT).fill(null).map(() => ({ x: -100, y: -100 }));

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouseX = -200; mouseY = -200;
  });

  function animateCursor() {
    // Main dot: immediate
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top  = dotY + 'px';

    // Trail: each follows previous
    positions[0].x += (mouseX - positions[0].x) * 0.25;
    positions[0].y += (mouseY - positions[0].y) * 0.25;

    for (let i = 1; i < TRAIL_COUNT; i++) {
      positions[i].x += (positions[i - 1].x - positions[i].x) * 0.35;
      positions[i].y += (positions[i - 1].y - positions[i].y) * 0.35;
    }

    trailDots.forEach((dot, i) => {
      dot.el.style.left = positions[i].x + 'px';
      dot.el.style.top  = positions[i].y + 'px';
    });

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  /* ============================================================
     3. PANEL 3D TILT ON HOVER
     ============================================================ */
  function initTilt(selector) {
    const els = document.querySelectorAll(selector);
    els.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width  / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const rotX = -dy * 8;
        const rotY =  dx * 8;
        el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  // Apply tilt after content loads
  window.addEventListener('load', () => {
    initTilt('.comic-panel');
    initTilt('.pub-card');
    initTilt('.exp-card');
  });

  /* ============================================================
     4. BURST CLICK ANIMATION
     ============================================================ */
  const burstColors = ['#FF3CAC', '#FFD93D', '#5EF2C2', '#6EDCFF', '#FF5DA2', '#B8FF3C', '#FF3B3B'];
  let burstColorIdx = 0;

  function spawnBurst(x, y) {
    const burst = document.createElement('div');
    burst.className = 'click-burst';
    const size = 60 + Math.random() * 40;
    burst.style.cssText = `
      left: ${x}px;
      top:  ${y}px;
      width:  ${size}px;
      height: ${size}px;
      background: ${burstColors[burstColorIdx % burstColors.length]};
      border: 3px solid #1a1a1a;
    `;
    burstColorIdx++;
    document.body.appendChild(burst);
    burst.addEventListener('animationend', () => burst.remove());
  }

  document.addEventListener('click', (e) => {
    spawnBurst(e.clientX, e.clientY);
    playClick();
  });

  /* ============================================================
     5. SCROLL REVEAL (IntersectionObserver)
     ============================================================ */
  function checkReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  checkReveal();

  /* ============================================================
     6. NAVIGATION
     ============================================================ */
  // Desktop nav: highlight active section
  const sections = document.querySelectorAll('section[id]');
  const navBubbles = document.querySelectorAll('.nav-bubble');

  // Only run the section observer on the home page (where nav uses # anchors)
  const hasAnchorNav = Array.from(navBubbles).some(nb => (nb.getAttribute('href') || '').startsWith('#'));
  if (hasAnchorNav) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navBubbles.forEach(nb => {
            nb.classList.toggle('active', nb.getAttribute('href') === '#' + entry.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => navObserver.observe(s));
  }

  // Nav click: flash transition (anchors scroll, .html links navigate with transition)
  navBubbles.forEach(nb => {
    nb.addEventListener('click', (e) => {
      const href = nb.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        flashAndScroll(href);
      } else if (href && href.endsWith('.html')) {
        e.preventDefault();
        // Smooth page transition
        document.body.style.transition = 'opacity 0.25s ease';
        document.body.style.opacity = '0';
        setTimeout(() => { window.location.href = href; }, 250);
      }
    });
  });

  function flashAndScroll(href) {
    const flash = document.getElementById('page-flash');
    if (flash) {
      flash.classList.add('flash');
      flash.addEventListener('animationend', function handler() {
        flash.classList.remove('flash');
        flash.removeEventListener('animationend', handler);
      });
    }
    const target = document.querySelector(href);
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }

  // Mobile FAB nav
  const navFab = document.getElementById('nav-fab');
  const fabBtn = document.getElementById('nav-fab-btn');
  if (fabBtn) {
    fabBtn.addEventListener('click', () => {
      navFab.classList.toggle('open');
    });
  }

  document.querySelectorAll('.fab-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        navFab.classList.remove('open');
        flashAndScroll(href);
      } else if (href && href.endsWith('.html')) {
        e.preventDefault();
        navFab.classList.remove('open');
        document.body.style.transition = 'opacity 0.25s ease';
        document.body.style.opacity = '0';
        setTimeout(() => { window.location.href = href; }, 250);
      }
    });
  });

  /* ============================================================
     7. PROJECT CARD FLIP (touch/click support)
     ============================================================ */
  // Card flip is handled by inline script on projects.html

  /* ============================================================
     8. SECRET PANEL
     ============================================================ */
  const secretPanel   = document.getElementById('secret-panel');
  const secretOverlay = document.getElementById('secret-overlay');
  const secretClose   = document.getElementById('secret-close');

  function showSecretPanel() {
    secretOverlay.classList.add('active');
    secretPanel.classList.add('active');
    playSecretSound();
  }

  function hideSecretPanel() {
    secretOverlay.classList.remove('active');
    secretPanel.classList.remove('active');
  }

  if (secretClose)   secretClose.addEventListener('click', hideSecretPanel);
  if (secretOverlay) secretOverlay.addEventListener('click', hideSecretPanel);

  /* ============================================================
     9. SOUND EFFECTS (AudioContext — no external files)
     ============================================================ */
  let sfxEnabled = localStorage.getItem('kamala-sfx') === '1';
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  function playTone(freq, type, duration, vol) {
    if (!sfxEnabled) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + duration);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (e) { /* silence errors */ }
  }

  function playClick()  { playTone(440, 'square', 0.1, 0.15); }
  function playHover()  { playTone(660, 'sine',   0.08, 0.08); }
  function playSecretSound() {
    if (!sfxEnabled) return;
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => playTone(f, 'sine', 0.25, 0.15), i * 120);
    });
  }

  // Hover SFX on interactive elements
  document.querySelectorAll('a, button, .project-card, .nav-bubble, .skill-sticker').forEach(el => {
    el.addEventListener('mouseenter', playHover);
  });

  // SFX Toggle button
  const sfxToggle = document.getElementById('sfx-toggle');
  if (sfxToggle) {
    // Restore state from previous page
    if (sfxEnabled) {
      sfxToggle.classList.add('on');
    }
    sfxToggle.addEventListener('click', (e) => {
      e.stopPropagation(); // don't trigger global click burst at same time as toggle
      sfxEnabled = !sfxEnabled;
      localStorage.setItem('kamala-sfx', sfxEnabled ? '1' : '0');
      sfxToggle.classList.toggle('on', sfxEnabled);
      if (sfxEnabled) {
        playTone(880, 'sine', 0.15, 0.15);
      }
    });
  }

  /* ============================================================
     10. HERO NAME — extra jitter on mouse proximity
     ============================================================ */
  const heroName = document.getElementById('hero-name');
  if (heroName) {
    document.addEventListener('mousemove', (e) => {
      const rect = heroName.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist < 300) {
        const intensity = (300 - dist) / 300;
        const dx = (e.clientX - cx) / 300 * intensity * 6;
        const dy = (e.clientY - cy) / 300 * intensity * 6;
        heroName.style.textShadow = `
          ${6 + dx}px ${6 + dy}px 0 var(--pink),
          ${-3 + dx * 0.5}px ${-3 + dy * 0.5}px 0 var(--pink),
          ${3 + dx * 0.5}px ${-3 + dy * 0.5}px 0 var(--pink),
          ${-3 + dx * 0.5}px ${3 + dy * 0.5}px 0 var(--pink)
        `;
      } else {
        heroName.style.textShadow = '';
      }
    });
  }

  /* ============================================================
     11. CONTACT FORM
     ============================================================ */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.submit-burst');
      const orig = btn.textContent;
      btn.textContent = 'SENT! ★';
      btn.style.background = 'var(--mint)';
      btn.style.color = 'var(--ink)';
      [440, 550, 660, 880].forEach((f, i) => {
        setTimeout(() => playTone(f, 'sine', 0.2, 0.15), i * 100);
      });
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
        btn.style.color = '';
        contactForm.reset();
      }, 3000);
    });
  }

  /* ============================================================
     12. STAGGER ANIMATION for skill stickers
     ============================================================ */
  const skillsPanel = document.querySelector('.skills-grid');
  if (skillsPanel) {
    const staggerObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        skillsPanel.querySelectorAll('.skill-sticker').forEach((sticker, i) => {
          sticker.style.opacity = '0';
          sticker.style.transform = 'scale(0) rotate(-10deg)';
          setTimeout(() => {
            sticker.style.transition = 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            sticker.style.opacity = '1';
            sticker.style.transform = '';
          }, 100 + i * 80);
        });
        staggerObserver.disconnect();
      }
    }, { threshold: 0.5 });
    staggerObserver.observe(skillsPanel);
  }

  /* ============================================================
     13. SCROLL PROGRESS indicator on loader-bottom (repurposed as header bar)
     ============================================================ */
  // Only add progress bar on mosaic page, not inner pages
  if (!document.body.classList.contains('inner-page')) {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
      position: fixed; top: 0; left: 0; height: 4px;
      background: var(--pink); z-index: 9998;
      width: 0%; transition: width 0.1s linear;
      box-shadow: 0 0 8px var(--pink);
      border-right: 2px solid var(--ink);
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
    });
  }

  /* ============================================================
     14. BARCODE ALSO CLICKABLE AFTER LOADER GONE (via secret trigger)
     ============================================================ */
  // Re-expose the secret panel trigger for people who know about it
  window.__showSecret = showSecretPanel;

})();
