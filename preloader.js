(function () {
  const pre = document.getElementById('naamin-preloader');
  if (!pre) return;

  const minDuration = 120;   // keep transition smooth but fast
  const maxWait = 900;       // hard fallback in case ready signal fails
  const start = Date.now();
  let hidden = false;
  let appReady = false;
  let windowLoaded = document.readyState === 'complete';

  function stopAnimations() {
    pre.querySelectorAll('*').forEach((el) => {
      el.style.animationPlayState = 'paused';
    });
  }

  function hide() {
    if (hidden) return;
    hidden = true;

    stopAnimations();
    pre.classList.add('fade-out');

    setTimeout(() => {
      try { pre.remove(); } catch (e) {}
      if (document.body) {
        document.body.classList.remove('preloader-active');
        document.body.style.overflow = '';
      }
    }, 220);
  }

  function scheduleHide() {
    const elapsed = Date.now() - start;
    const wait = Math.max(0, minDuration - elapsed);
    setTimeout(hide, wait);
  }

  function maybeHide() {
    if (hidden) return;
    if (appReady || windowLoaded) {
      scheduleHide();
    }
  }

  function startIDot() {
    const iDot = pre.querySelector('.i-dot');
    if (iDot) iDot.classList.add('animate');
  }

  window.addEventListener('naamin:app-ready', () => {
    appReady = true;
    maybeHide();
  }, { once: true });

  window.addEventListener('load', () => {
    windowLoaded = true;
    maybeHide();
  }, { once: true });

  // Fallback: ensure preloader removed even if events are delayed
  setTimeout(hide, maxWait);

  setTimeout(startIDot, 260);
})();
