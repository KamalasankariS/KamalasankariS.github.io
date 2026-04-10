const cover = document.getElementById('cover');
const flipbook = document.querySelector('.flipbook');
const tabs = Array.from(document.querySelectorAll('.side-tab'));

if (cover && flipbook) {
  setTimeout(() => {
    cover.classList.add('opened');
    setTimeout(() => cover.style.display = 'none', 1500);
  }, 1000);
}

function goTo(spreadIdx) {
  $(flipbook).turn('page', spreadIdx * 2 + 1);
}

function updateTabs(page) {
  const spread = Math.floor((page - 1) / 2);
  tabs.forEach(t => t.classList.remove('active'));
  if (spread < 4 && tabs[spread]) tabs[spread].classList.add('active');
}

$(document).ready(function () {
  const shell = document.querySelector('.book');

  $(flipbook).turn({
    width: shell.offsetWidth,
    height: shell.offsetHeight,
    autoCenter: true,
    gradients: true,
    acceleration: true,
    when: {
      turned: function (e, page) {
        updateTabs(page);
      }
    }
  });

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => goTo(i));
  });

  document.addEventListener('keydown', e => {
    if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      $(flipbook).turn('next');
    }
    if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      $(flipbook).turn('previous');
    }
  });

  let sx = 0, sy = 0;

  document.addEventListener('touchstart', e => {
    sx = e.changedTouches[0].screenX;
    sy = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - sx;
    const dy = e.changedTouches[0].screenY - sy;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      dx < 0 ? $(flipbook).turn('next') : $(flipbook).turn('previous');
    }
  }, { passive: true });

  updateTabs(1);
});