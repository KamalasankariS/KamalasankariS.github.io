/* =========================================================
   WINDOWS 98 / IE5 PORTFOLIO — KAMALA SANKARI
   Interactive JavaScript
   ========================================================= */

'use strict';

/* ─────────────────────────────────────────────────────────
   BOOT SEQUENCE
───────────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  const boot = document.getElementById('boot');

  // Fade out after the progress bar animation finishes (3s fill + small buffer)
  setTimeout(() => {
    boot.classList.add('out');
    setTimeout(() => { boot.style.display = 'none'; }, 1200);
  }, 3400);
});

/* ─────────────────────────────────────────────────────────
   STARFIELD / GLITTER — removed (Y2K Mac aesthetic gone)
   buildStarfield() and buildGlitter() intentionally omitted.
───────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────
   CUSTOM CURSOR — removed (Win98 uses default cursor)
   mousemove cursor code and spawnSparkle() intentionally omitted.
───────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────
   WINDOW DRAGGING
───────────────────────────────────────────────────────── */
let zTop = 300;

function makeDraggable(win) {
  const chrome = win.querySelector('.wchrome');
  if (!chrome) return;
  let dragging = false, ox = 0, oy = 0;

  chrome.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('tl')) return;
    dragging = true;
    const rect = win.getBoundingClientRect();
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
    bringToFront(win);
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    let nx = e.clientX - ox;
    let ny = e.clientY - oy;
    nx = Math.max(0, Math.min(window.innerWidth - win.offsetWidth, nx));
    ny = Math.max(0, Math.min(window.innerHeight - win.offsetHeight, ny));
    win.style.left = nx + 'px';
    win.style.top  = ny + 'px';
    win.style.transform = 'none';
  });

  document.addEventListener('mouseup', () => { dragging = false; });
  win.addEventListener('mousedown', () => bringToFront(win));
}

function bringToFront(win) {
  document.querySelectorAll('.win').forEach(w => {
    w.classList.remove('top');
    w.classList.add('inactive');
  });
  win.style.zIndex = ++zTop;
  win.classList.add('top');
  win.classList.remove('inactive');
}

document.querySelectorAll('.win').forEach(makeDraggable);

/* ─────────────────────────────────────────────────────────
   TITLE BAR BUTTONS — Win98 style
───────────────────────────────────────────────────────── */
document.querySelectorAll('.tl.cl').forEach(btn => {
  btn.addEventListener('click', () => {
    const win = btn.closest('.win');
    if (win.id === 'player') {
      showDialog('This page is read-only.\n\nYou cannot close Kamala\'s portfolio!');
    } else {
      win.classList.add('hidden');
      syncTaskbar();
    }
  });
});

document.querySelectorAll('.tl.mn').forEach(btn => {
  btn.addEventListener('click', () => {
    const win = btn.closest('.win');
    if (win.id === 'player') {
      const isNowMini = !win.classList.contains('minimized');
      win.classList.toggle('minimized');
      const lbl = document.getElementById('status-lbl');
      if (lbl) {
        lbl.textContent = isNowMini
          ? `Loading: ${sectionLabels[sections[currentIdx]] || sections[currentIdx]}`
          : 'Done';
      }
      // Restoring from mini → clear inline styles so CSS default takes back over
      if (!isNowMini) {
        win.style.left = '';
        win.style.top = '';
        win.style.width = '';
        win.style.height = '';
        win.style.transform = '';
      }
    } else {
      win.classList.toggle('minimized');
    }
    syncTaskbar();
  });
});

document.querySelectorAll('.tl.mx').forEach(btn => {
  btn.addEventListener('click', () => {
    const win = btn.closest('.win');
    if (win.id === 'player') {
      win.classList.remove('minimized');
      const lbl = document.getElementById('status-lbl');
      if (lbl) lbl.textContent = 'Done';
      // Toggle native browser fullscreen
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } else {
      win.classList.remove('minimized');
    }
    syncTaskbar();
  });
});

// Keep player sized correctly when entering/exiting native fullscreen
document.addEventListener('fullscreenchange', () => {
  const player = document.getElementById('player');
  if (document.fullscreenElement) {
    player.classList.add('fullscreen');
  } else {
    player.classList.remove('fullscreen');
    // Clear any inline position overrides so CSS default takes back over
    player.style.left = '';
    player.style.top = '';
    player.style.width = '';
    player.style.height = '';
    player.style.transform = '';
  }
});

/* ─────────────────────────────────────────────────────────
   DIALOG
───────────────────────────────────────────────────────── */
function showDialog(msg) {
  document.getElementById('dialog-msg').textContent = msg;
  document.getElementById('dialog-overlay').classList.remove('hidden');
  playBeep();
}
document.getElementById('dialog-ok')?.addEventListener('click', () => {
  document.getElementById('dialog-overlay').classList.add('hidden');
});

/* ─────────────────────────────────────────────────────────
   SECTION NAVIGATION
───────────────────────────────────────────────────────── */
const sections = ['home', 'about', 'projects', 'publications', 'contact'];
const sectionLabels = {
  home:         'home.exe',
  about:        'about_me.txt',
  projects:     'projects.dir',
  publications: 'papers.bib',
  contact:      'connect.url',
};
let currentIdx = 0;

function showSection(id) {
  document.querySelectorAll('.sec').forEach(s => s.classList.remove('on'));
  document.querySelectorAll('.pl-item').forEach(p => p.classList.remove('on'));

  const sec = document.getElementById('sec-' + id);
  const pl  = document.querySelector(`.pl-item[data-sec="${id}"]`);
  if (sec) sec.classList.add('on');
  if (pl)  pl.classList.add('on');

  currentIdx = sections.indexOf(id);

  // Update address bar (track-name element)
  const tn = document.getElementById('track-name');
  if (tn) {
    const sp = tn.querySelector('span');
    if (sp) sp.textContent = '📁 ' + (sectionLabels[id] || id);
  }

  // Scroll content to top
  const pc = document.querySelector('.pcontent');
  if (pc) pc.scrollTop = 0;

  // Update ticker (hidden but kept for JS compat)
  const tickerCur = document.getElementById('ticker-cur');
  if (tickerCur) tickerCur.textContent = sectionLabels[id] || id;

  // Sync taskbar icon highlight
  document.querySelectorAll('.tb-ico[data-sec]').forEach(b => {
    b.classList.toggle('on', b.dataset.sec === id);
  });

  // Update status label — Mac Finder style
  const lbl = document.getElementById('status-lbl');
  if (lbl) lbl.textContent = `${sections.length} items — ${sectionLabels[id] || id}`;

  // Keep status label in sync when minimized
  const playerWin = document.getElementById('player');
  if (lbl && playerWin && playerWin.classList.contains('minimized')) {
    lbl.textContent = `Loading: ${sectionLabels[id] || id}`;
  }

  // Progress: still called but prog-fill is hidden — no visual effect
  const progMap = { home: 8, about: 28, projects: 52, publications: 75, contact: 95 };
  animateProg(progMap[id] || 10);
}

document.querySelectorAll('.pl-item').forEach(item => {
  item.addEventListener('click', () => showSection(item.dataset.sec));
});

/* ─────────────────────────────────────────────────────────
   PLAYER CONTROLS (Back / Forward buttons in toolbar)
───────────────────────────────────────────────────────── */
let playing = true;
const playBtn = document.getElementById('play-btn');
const albumRing = document.querySelector('.album-ring');

// play-btn is hidden but kept for JS compat
playBtn?.addEventListener('click', () => {
  playing = !playing;
  playBtn.textContent = playing ? '▶' : '⏸';
  // album spin removed — no-op
});

document.getElementById('prev-btn')?.addEventListener('click', () => {
  const newIdx = (currentIdx - 1 + sections.length) % sections.length;
  showSection(sections[newIdx]);
});

document.getElementById('next-btn')?.addEventListener('click', () => {
  const newIdx = (currentIdx + 1) % sections.length;
  showSection(sections[newIdx]);
});

/* ─────────────────────────────────────────────────────────
   PROGRESS BAR — kept but hidden, no visual effect
───────────────────────────────────────────────────────── */
const progFill = document.querySelector('.prog-fill');
let progTarget = 8;
let progCurrent = 0;
let progInterval;

function animateProg(target) {
  progTarget = target;
  clearInterval(progInterval);
  progInterval = setInterval(() => {
    if (Math.abs(progCurrent - progTarget) < 0.5) {
      progCurrent = progTarget;
      clearInterval(progInterval);
      startCreeep();
    } else {
      progCurrent += (progTarget - progCurrent) * 0.08;
    }
    if (progFill) progFill.style.width = progCurrent + '%';
  }, 40);
}

function startCreeep() {
  if (progCurrent >= 98) return;
  const creepInterval = setInterval(() => {
    progCurrent = Math.min(98, progCurrent + 0.015);
    if (progFill) progFill.style.width = progCurrent + '%';
    if (progCurrent >= 98) clearInterval(creepInterval);
  }, 200);
}

animateProg(8);

/* CLOCK — redefined below with blinking colon */

/* ─────────────────────────────────────────────────────────
   TIME DISPLAY (status bar) — steady colon, updates every minute
───────────────────────────────────────────────────────── */
function updateTimeDisp() {
  const el = document.getElementById('time-disp');
  if (!el) return;
  const now = new Date();
  let h = now.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const m = String(now.getMinutes()).padStart(2, '0');
  el.textContent = `${h}:${m} ${ampm}`;
}
updateTimeDisp();
setInterval(updateTimeDisp, 60000);

/* ─────────────────────────────────────────────────────────
   TASKBAR WINDOW MANAGEMENT
───────────────────────────────────────────────────────── */
function syncTaskbar() {
  document.querySelectorAll('.tb-btn[data-win]').forEach(btn => {
    const win = document.getElementById(btn.dataset.win);
    if (!win) return;
    if (win.classList.contains('hidden') || win.classList.contains('minimized')) {
      btn.classList.remove('on');
    } else {
      btn.classList.add('on');
    }
  });
}

document.querySelectorAll('.tb-btn[data-win]').forEach(btn => {
  btn.addEventListener('click', () => {
    const win = document.getElementById(btn.dataset.win);
    if (!win) return;
    if (win.classList.contains('hidden')) {
      win.classList.remove('hidden');
      win.classList.remove('minimized');
      bringToFront(win);
    } else if (win.classList.contains('minimized')) {
      win.classList.remove('minimized');
      bringToFront(win);
    } else {
      win.classList.add('minimized');
    }
    syncTaskbar();
  });
});

/* ─────────────────────────────────────────────────────────
   TASKBAR ICONS → navigate sections
───────────────────────────────────────────────────────── */
document.querySelectorAll('.tb-ico[data-sec]').forEach(btn => {
  btn.addEventListener('click', () => {
    const playerWin = document.getElementById('player');
    playerWin.classList.remove('hidden', 'minimized');
    // reset inline styles so CSS default centres it
    playerWin.style.left = '';
    playerWin.style.top = '';
    playerWin.style.width = '';
    playerWin.style.height = '';
    playerWin.style.transform = '';
    bringToFront(playerWin);
    showSection(btn.dataset.sec);
    // highlight active icon
    document.querySelectorAll('.tb-ico').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
  });
});

/* ─────────────────────────────────────────────────────────
   KEYBOARD NAV
───────────────────────────────────────────────────────── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    const newIdx = (currentIdx + 1) % sections.length;
    showSection(sections[newIdx]);
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    const newIdx = (currentIdx - 1 + sections.length) % sections.length;
    showSection(sections[newIdx]);
  }
});

/* ─────────────────────────────────────────────────────────
   INIT
───────────────────────────────────────────────────────── */
// Show home section, all windows start inactive except player
showSection('home');
syncTaskbar();
document.querySelectorAll('.win').forEach(w => w.classList.add('inactive'));
document.getElementById('player')?.classList.remove('inactive');

/* ─────────────────────────────────────────────────────────
   MAC STARTUP CHORD — played after boot screen fades
───────────────────────────────────────────────────────── */
function playStartupChord() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Classic Mac startup: C major chord with low C bass
    const notes = [
      { freq: 65.4,  gain: 0.22, dur: 3.2 },  // C2
      { freq: 130.8, gain: 0.18, dur: 3.0 },  // C3
      { freq: 164.8, gain: 0.14, dur: 2.8 },  // E3
      { freq: 196.0, gain: 0.12, dur: 2.6 },  // G3
      { freq: 261.6, gain: 0.10, dur: 2.4 },  // C4
    ];
    notes.forEach(n => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = n.freq;
      gain.gain.setValueAtTime(n.gain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + n.dur);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + n.dur);
    });
  } catch (e) {}
}

/* ─────────────────────────────────────────────────────────
   MAC ALERT BEEP — triangle wave, single short tone
───────────────────────────────────────────────────────── */
function playBeep() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {}
}

// Play chord after boot fades (at ~3.8s)
window.addEventListener('load', () => {
  setTimeout(playStartupChord, 200);
});

/* ─────────────────────────────────────────────────────────
   CLOCK — blinking colon (Mac menu bar clock blinks every second)
───────────────────────────────────────────────────────── */
let _colonOn = true;
function updateClock() {
  const el = document.getElementById('tb-clock');
  if (!el) return;
  const now = new Date();
  let h = now.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const m = String(now.getMinutes()).padStart(2, '0');
  const sep = _colonOn ? ':' : '\u2009'; // thin space when colon hidden
  el.textContent = `${h}${sep}${m} ${ampm}`;
  _colonOn = !_colonOn;
}
updateClock();
setInterval(updateClock, 500); // 500ms for blinking colon

/* ─────────────────────────────────────────────────────────
   APPLE MENU
───────────────────────────────────────────────────────── */
const appleMenu = document.getElementById('apple-menu');
document.getElementById('mmb-apple-btn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  appleMenu?.classList.toggle('hidden');
});
document.addEventListener('click', () => appleMenu?.classList.add('hidden'));

document.getElementById('amenu-about')?.addEventListener('click', () => {
  document.getElementById('about-overlay')?.classList.remove('hidden');
});
document.getElementById('about-ok')?.addEventListener('click', () => {
  document.getElementById('about-overlay')?.classList.add('hidden');
});
document.getElementById('amenu-sleep')?.addEventListener('click', () => {
  const player = document.getElementById('player');
  player?.classList.toggle('minimized');
  syncTaskbar();
});
document.getElementById('amenu-shut')?.addEventListener('click', () => {
  showDialog('It is now safe to close your browser tab.');
});

/* ─────────────────────────────────────────────────────────
   TRASH
───────────────────────────────────────────────────────── */
document.getElementById('trash-icon')?.addEventListener('click', () => {
  showDialog('The Trash is empty.');
});
