/**
 * Geetha Constructions — background video playback.
 *
 * Replaces the previous setInterval(playAll, 3000) approach, which fought the
 * browser's own power-saving pause and forced every video on the page to
 * re-play four times a minute (battery cost on mobile, constant AbortError
 * noise in the console).
 *
 * Goals, in order:
 *   1. The hero must start on its own, every time, so it reads as part of the
 *      page rather than as an embedded video.
 *   2. Only the video actually on screen is allowed to decode.
 *   3. If the browser refuses autoplay, recover silently on the first gesture.
 */
(function () {
  var observer = null;

  function prime(v) {
    // Autoplay is only permitted for muted, inline video. Set both the
    // property and the attribute — some engines only honour the attribute
    // when it is present before the first load.
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
  }

  function attempt(v) {
    if (!v.isConnected || v.readyState === 0 && v.networkState === v.NETWORK_NO_SOURCE) return;
    var p = v.play();
    if (p && typeof p.catch === 'function') p.catch(function () { /* recovered on gesture */ });
  }

  function observe(v) {
    if (!observer) return attempt(v);
    observer.observe(v);
  }

  function setup() {
    var videos = document.querySelectorAll('video');
    if (!videos.length) return;

    if ('IntersectionObserver' in window && !observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var v = entry.target;
          if (entry.isIntersecting) {
            attempt(v);
          } else if (!v.paused) {
            v.pause();
          }
        });
      }, { rootMargin: '200px 0px', threshold: 0.01 });
    }

    videos.forEach(function (v) {
      prime(v);
      observe(v);
    });
  }

  // One-shot gesture recovery: if the browser blocked autoplay, the first real
  // interaction unblocks it. We only need this once per page.
  function gestureRecovery() {
    var done = false;
    function recover() {
      if (done) return;
      done = true;
      document.querySelectorAll('video').forEach(function (v) {
        if (v.paused) attempt(v);
      });
      ['pointerdown', 'touchstart', 'keydown', 'wheel'].forEach(function (e) {
        window.removeEventListener(e, recover);
      });
    }
    ['pointerdown', 'touchstart', 'keydown', 'wheel'].forEach(function (e) {
      window.addEventListener(e, recover, { passive: true, once: true });
    });
  }

  function boot() {
    setup();
    gestureRecovery();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Returning to the tab, or arriving via bfcache, can leave videos paused.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    document.querySelectorAll('video').forEach(function (v) {
      if (v.paused) attempt(v);
    });
  });
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) boot();
  });

  // Taxi swaps the DOM without a reload, so re-bind after every transition.
  document.addEventListener('taxi:transition-end', function () {
    if (observer) { observer.disconnect(); observer = null; }
    setup();
  });
})();
