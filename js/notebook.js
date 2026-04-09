/* ============================================================
   REALISTIC NOTEBOOK PAGE TURN ENGINE (PRODUCTION VERSION)
   ============================================================ */

/* ---- ELEMENTS ---- */
const cover = document.getElementById('cover');
const notebook = document.querySelector('.notebook');
const spreads = Array.from(document.querySelectorAll('.spread'));
const tabs = Array.from(document.querySelectorAll('.side-tab'));

/* ---- STATE ---- */
let current = 0;
let busy = false;
let animationToken = 0;
let activeGhost = null;

/* ============================================================
   COVER — auto-open on load
   ============================================================ */
if (cover && notebook) {
  // show notebook behind immediately (hidden by cover z-index)
  notebook.classList.add('visible');

  setTimeout(() => {
    cover.classList.add('opened');
    // remove cover after animation completes
    setTimeout(() => {
      cover.style.display = 'none';
    }, 1500);
  }, 1000);
}

/* ============================================================
   HELPERS
   ============================================================ */

function getPage(spread, primary, fallback) {
  return spread?.querySelector(primary) || spread?.querySelector(fallback) || null;
}

function updateTabs(idx) {
  tabs.forEach(t => t.classList.remove('active'));
  if (tabs[idx]) tabs[idx].classList.add('active');
}

function cleanSpreads() {
  spreads.forEach(spread => {
    spread.classList.remove('active', 'incoming');
    spread.querySelectorAll('.pg').forEach(p => p.removeAttribute('style'));
  });
}

function sanitizeClone(el) {
  if (el.nodeType !== 1) return;
  el.removeAttribute('id');
  el.onclick = null;
  el.removeAttribute('onclick');
  Array.from(el.children).forEach(sanitizeClone);
}

/* ============================================================
   GHOST CREATION
   ============================================================ */

function captureGhost(pageEl, backsideEl) {
  if (!pageEl) return null;

  const rect = pageEl.getBoundingClientRect();
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  const ghost = document.createElement('div');
  ghost.className = 'page-ghost';
  ghost.style.cssText = `
    position:absolute;
    top:${rect.top + scrollY}px;
    left:${rect.left + scrollX}px;
    width:${rect.width}px;
    height:${rect.height}px;
    z-index:999;
    pointer-events:none;
    transform-style:preserve-3d;
    will-change:transform,opacity;
  `;

  // front face
  const front = document.createElement('div');
  front.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;';
  const frontClone = pageEl.cloneNode(true);
  frontClone.style.margin = '0';
  sanitizeClone(frontClone);
  front.appendChild(frontClone);
  ghost.appendChild(front);

  // back face
  if (backsideEl) {
    const back = document.createElement('div');
    back.style.cssText = 'position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(180deg);overflow:hidden;';
    const backClone = backsideEl.cloneNode(true);
    sanitizeClone(backClone);
    back.appendChild(backClone);
    ghost.appendChild(back);
  }

  document.body.appendChild(ghost);
  activeGhost = ghost;
  return { ghost, rect };
}

/* ============================================================
   PAGE TURN ANIMATION
   ============================================================ */

function pageTurn(ghost, forward, token, onDone) {
  if (!ghost) { onDone?.(); return; }

  const duration = 1200;
  const start = performance.now();
  const dir = forward ? -1 : 1;
  const startAngle = 6;

  ghost.style.transformOrigin = forward ? 'left center' : 'right center';
  ghost.style.perspective = '2000px';

  function ease(t) { return t * (2 - t); }

  function frame(now) {
    if (token !== animationToken) return;

    const raw = Math.min((now - start) / duration, 1);
    const t = ease(raw);
    const angle = startAngle + t * (180 - startAngle);
    const rad = angle * Math.PI / 180;
    const lift = Math.sin(rad);
    const bend = lift * 0.6 * (forward ? 1 : -1);

    ghost.style.transform = `rotateY(${dir * angle}deg) rotateX(${bend}deg)`;

    const shX = Math.round(dir * -1 * lift * 12);
    const shY = Math.round(3 + lift * 6);
    const shBlur = Math.round(6 + lift * 24);
    ghost.style.boxShadow = `${shX}px ${shY}px ${shBlur}px rgba(30,15,50,${(0.03 + lift * 0.14).toFixed(3)})`;

    ghost.style.opacity = angle > 140 ? String(Math.max(0, 1 - (angle - 140) / 40)) : '1';

    if (raw < 1) {
      requestAnimationFrame(frame);
    } else {
      ghost.remove();
      activeGhost = null;
      onDone?.();
    }
  }

  requestAnimationFrame(frame);
}

/* ============================================================
   NAVIGATION
   ============================================================ */

function goTo(idx) {
  if (busy || idx === current || idx < 0 || idx >= spreads.length) return;

  busy = true;
  animationToken++;
  const token = animationToken;
  const forward = idx > current;

  const currentSpread = spreads[current];
  const nextSpread = spreads[idx];

  if (!currentSpread || !nextSpread) { busy = false; return; }

  if (activeGhost) { activeGhost.remove(); activeGhost = null; }

  const turningPage = forward
    ? getPage(currentSpread, '.pg-right', '.pg-left')
    : getPage(currentSpread, '.pg-left', '.pg-right');

  const backsidePage = forward
    ? getPage(nextSpread, '.pg-left', '.pg-right')
    : getPage(nextSpread, '.pg-right', '.pg-left');

  if (!turningPage) { busy = false; return; }

  const captured = captureGhost(turningPage, backsidePage);

  cleanSpreads();
  nextSpread.classList.add('active');
  updateTabs(idx);
  current = idx;

  pageTurn(captured?.ghost, forward, token, () => {
    if (token === animationToken) busy = false;
  });
}

/* ============================================================
   INPUT HANDLING
   ============================================================ */

function safeNavigate(idx) {
  if (busy) return;
  goTo(idx);
}

tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => safeNavigate(i));
});

document.addEventListener('keydown', e => {
  if (busy) return;
  if (['ArrowRight', 'ArrowDown'].includes(e.key)) { e.preventDefault(); safeNavigate(current + 1); }
  if (['ArrowLeft', 'ArrowUp'].includes(e.key)) { e.preventDefault(); safeNavigate(current - 1); }
});

let sx = 0, sy = 0;
document.addEventListener('touchstart', e => { sx = e.changedTouches[0].screenX; sy = e.changedTouches[0].screenY; }, { passive: true });
document.addEventListener('touchend', e => {
  if (busy) return;
  const dx = e.changedTouches[0].screenX - sx, dy = e.changedTouches[0].screenY - sy;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) { dx < 0 ? safeNavigate(current + 1) : safeNavigate(current - 1); }
}, { passive: true });

/* ============================================================
   INIT
   ============================================================ */

cleanSpreads();
if (spreads[0]) spreads[0].classList.add('active');
if (tabs[0]) tabs[0].classList.add('active');
