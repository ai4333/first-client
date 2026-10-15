/**
 * Geetha Constructions - background video playback.
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
 *
 * Why this is more defensive than it looks: the hero failed to start on maybe
 * one load in three, which read as "the page didn't load". Three separate
 * causes, all of which had to be closed:
 *
 *   a) attempt() used to bail out when the element had no source resolved yet
 *      and nothing ever asked again. IntersectionObserver only re-fires when
 *      visibility *changes*, and the hero is visible from the start, so a
 *      video that was not ready at that instant stayed paused forever. It now
 *      waits for the media to signal readiness and retries.
 *   b) Chrome pauses "video-only background media ... to save power" on its
 *      own, at any time, even on screen. Nothing was listening, so one
 *      power-save pause was permanent. We now watch for a pause we did not
 *      ask for and resume it.
 *   c) app.js starts the hero from inside document.fonts.ready.then(), once,
 *      with no retry -- so a slow font also meant no video. That call still
 *      happens; this file no longer depends on it.
 *
 * The three Stage videos are deliberately NOT force-played: the strategy
 * timeline in app.js owns their playback and seeks them to 0 as each layer
 * becomes current. We only pause them when they scroll out of view.
 */
(function () {
  var observer = null;
  var wantPlaying = new WeakSet();   // we asked for this one to be running
  var retries = new WeakMap();       // per-video resume budget
  var MAX_RETRIES = 6;

  function isStageVideo(v) {
    return !!(v.closest && v.closest('.strategy_content'));
  }

  function prime(v) {
    // Autoplay is only permitted for muted, inline video. Set both the
    // property and the attribute - some engines only honour the attribute
    // when it is present before the first load.
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
  }

  function attempt(v) {
    if (!v.isConnected) return;

    // Not ready yet. Previously this returned and the video was never
    // revisited. Ask the element to tell us when it can play instead.
    if (v.readyState < 2) {
      if (!v.__gcWaiting) {
        v.__gcWaiting = true;
        var go = function () {
          v.__gcWaiting = false;
          v.removeEventListener('loadeddata', go);
          v.removeEventListener('canplay', go);
          if (wantPlaying.has(v)) attempt(v);
        };
        v.addEventListener('loadeddata', go);
        v.addEventListener('canplay', go);
        // No v.load() here: it aborts any play() already in flight, which was
        // itself one of the ways the hero ended up stuck.
      }
      return;
    }

    var p = v.play();
    if (p && typeof p.catch === 'function') {
      p.then(function () { rejects.set(v, 0); })
       .catch(function () { retryRejected(v); });
    }
  }

  // THE bug behind "the hero doesn't play until I scroll away and back".
  // A play() that is rejected at load -- interrupted, power-saved, raced by
  // another call -- fires no 'pause' event, because the video was never
  // playing. So the pause handler below never ran, and the element just sat
  // there until a visibility change made the observer call play() again.
  // Retry it directly, backing off, for as long as we still want it running.
  var rejects = new WeakMap();
  function retryRejected(v) {
    var n = (rejects.get(v) || 0) + 1;
    rejects.set(v, n);
    if (n > 10) return;
    var delay = Math.min(2000, 150 * n);
    setTimeout(function () {
      if (wantPlaying.has(v) && v.paused && !document.hidden) attempt(v);
    }, delay);
  }

  // Chrome can pause a muted background video by itself to save power. If we
  // asked for this video to be running and it is still on screen, start it
  // again -- but only a bounded number of times, so a browser that is
  // determined to keep it paused does not turn this into a loop.
  function onUnexpectedPause(e) {
    var v = e.target;
    if (!wantPlaying.has(v)) return;
    if (document.hidden) return;
    if (v.ended) return;
    var n = retries.get(v) || 0;
    if (n >= MAX_RETRIES) return;
    retries.set(v, n + 1);
    setTimeout(function () { if (wantPlaying.has(v) && v.paused) attempt(v); }, 120);
  }

  function manage(v) {
    prime(v);
    if (v.__gcPauseBound && observer) { observer.observe(v); return; }
    if (!v.__gcPauseBound) {
      v.__gcPauseBound = true;
      v.addEventListener('pause', onUnexpectedPause);
    }
    if (observer) observer.observe(v);
    else if (!isStageVideo(v)) { wantPlaying.add(v); attempt(v); }
  }

  function setup() {
    var videos = document.querySelectorAll('video');
    if (!videos.length) return;

    if ('IntersectionObserver' in window && !observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var v = entry.target;
          if (entry.isIntersecting) {
            // The Stage videos are cued by the scroll timeline, not by us.
            if (isStageVideo(v)) return;
            wantPlaying.add(v);
            retries.set(v, 0);
            attempt(v);
          } else {
            wantPlaying.delete(v);
            if (!v.paused) v.pause();
          }
        });
      }, { rootMargin: '200px 0px', threshold: 0.01 });
    }

    videos.forEach(manage);
  }

  // One-shot gesture recovery: if the browser blocked autoplay, the first real
  // interaction unblocks it. We only need this once per page.
  function gestureRecovery() {
    var done = false;
    function recover() {
      if (done) return;
      done = true;
      document.querySelectorAll('video').forEach(function (v) {
        if (v.paused && !isStageVideo(v)) { wantPlaying.add(v); retries.set(v, 0); attempt(v); }
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

  // Binding once at DOMContentLoaded is not enough. Webflow's background-video
  // module and Taxi both touch this part of the DOM after that point, and a
  // <video> replaced afterwards carries none of our listeners -- so whether
  // the hero was managed at all came down to timing, which is what made the
  // failure come and go. setup() is cheap and idempotent (manage() no-ops on
  // an element it has already bound), so run it again at the points where the
  // DOM is known to have settled.
  window.addEventListener('load', setup);
  setTimeout(setup, 600);
  setTimeout(setup, 2000);

  // For the first ten seconds, look every 400ms for a video we want running
  // that is paused but ready to play, and start it. Events are the primary
  // mechanism; this is the net under them for the window in which Webflow,
  // Taxi, the loading screen and app.js's intro are all touching the hero.
  var watchStart = Date.now();
  var watch = setInterval(function () {
    if (Date.now() - watchStart > 10000) { clearInterval(watch); return; }
    if (document.hidden) return;
    document.querySelectorAll('video').forEach(function (v) {
      if (wantPlaying.has(v) && v.paused && v.readyState >= 2 && !v.ended) attempt(v);
    });
  }, 400);

  // Let other scripts (the loading screen) ask for a nudge.
  window.__gcKickVideos = function () {
    document.querySelectorAll('video').forEach(function (v) {
      if (wantPlaying.has(v) && v.paused) { rejects.set(v, 0); attempt(v); }
    });
  };

  // Returning to the tab, or arriving via bfcache, can leave videos paused.
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    document.querySelectorAll('video').forEach(function (v) {
      if (v.paused && wantPlaying.has(v)) { retries.set(v, 0); attempt(v); }
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
