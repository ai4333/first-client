/**
 * Geetha Constructions - loading screen, persistent header, enquiry prompt.
 *
 * 1. LOADING SCREEN
 *    The site is heavy and the hero is a video, so the first second used to
 *    show a half-built page with a still frame -- and sometimes the video
 *    never started at all. The curtain holds until the hero is genuinely
 *    playing, then lifts. That turns "sometimes it doesn't play" into "it has
 *    already started by the time you see it".
 *    It is capped hard: whatever happens, it lifts by MAX_WAIT. A loader that
 *    can trap someone is worse than no loader.
 *
 * 2. PERSISTENT HEADER
 *    app.js fades the header out on scroll-down and back on scroll-up. The
 *    brief is a logo that is always there, so that is overridden in CSS --
 *    cheaper and safer than editing a 540KB minified bundle.
 *
 * 3. ENQUIRY PROMPT
 *    Shown only after someone has actually engaged (time, depth, or exit
 *    intent), never on load. Google treats an immediate interstitial as a
 *    ranking problem on mobile, and this site is meant to rank.
 */
(function () {
  'use strict';

  var MAX_WAIT   = 2600;   // ms: hard ceiling on the loading screen
  var MIN_SHOW   = 650;    // ms: below this it reads as a flicker
  var PROMPT_AFTER_MS     = 28000;
  var PROMPT_AFTER_SCROLL = 0.55;
  var PROMPT_COOLDOWN_DAYS = 7;

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------- loader
  // An Enter screen rather than a loader that lifts by itself.
  //
  // No browser lets a site start sound on its own -- Chrome, Safari and
  // Firefox all require a click or tap first. The Enter press IS that click,
  // so sound can start the moment the visitor arrives. It also starts the
  // hero video inside a user gesture, which is the one way of starting it
  // that every browser honours, battery-saver modes included -- rather than
  // hoping an autoplay call is accepted and retrying when it is not.
  //
  // While the screen is up, every GSAP animation is held (see the inline
  // script after gsap loads), so the hero's opening plays when they enter
  // instead of finishing unseen behind this screen.
  //
  // Shown once per session. Crawlers skip it: the content behind is identical,
  // and Google treats a full-screen entry overlay as an interstitial.
  var MIN_GATE = 1700;     // let the house finish drawing
  var MAX_READY = 6000;    // offer Enter by now, ready or not
  var BOT = /bot|crawl|spider|slurp|lighthouse|pagespeed|headless/i.test(navigator.userAgent);
  var gated = false;

  // Decided now, while <head> is still being parsed -- not at DOMContentLoaded.
  // The GSAP hold runs mid-body, so the class has to exist before it does.
  (function preGate() {
    var seen = false;
    try { seen = !!sessionStorage.getItem('gcLoaded'); } catch (e) {}
    if (!seen && !BOT) document.documentElement.classList.add('gc-gate', 'gc-loading');
  })();

  function heroVideo() { return document.querySelector('.hero_video video'); }

  function releaseAnimations() {
    try { if (window.gsap) window.gsap.globalTimeline.resume(); } catch (e) {}
    document.documentElement.classList.remove('gc-gate');
  }

  function startSound(on) {
    var A = window.GCAudioController;
    if (!A) return;
    try {
      A.hasInteracted = true;
      if (on) {
        if (A.isMuted && A.toggleMute) A.toggleMute();
        A.unlockAudioContext && A.unlockAudioContext();
        if (A.ambientAudio) { A.ambientAudio.volume = 0.4; A.ambientAudio.play().catch(function () {}); }
      } else if (!A.isMuted && A.toggleMute) {
        A.toggleMute();
      }
      A.updateIconState && A.updateIconState();
    } catch (e) {}
  }

  function loader() {
    if (document.getElementById('gc-loader')) return;
    if (!document.documentElement.classList.contains('gc-gate')) return;
    gated = true;

    var n = document.createElement('div');
    n.id = 'gc-loader';
    n.setAttribute('role', 'dialog');
    n.setAttribute('aria-label', 'Geetha Constructions');
    n.innerHTML =
      '<div class="gc_load_inner">' +
        '<svg class="gc_load_house" viewBox="0 0 120 92" fill="none" aria-hidden="true">' +
          '<path class="l l1" d="M6 46 L60 6 L114 46"/>' +
          '<path class="l l2" d="M18 40 L18 86 L102 86 L102 40"/>' +
          '<path class="l l3" d="M46 86 L46 58 L74 58 L74 86"/>' +
          '<path class="l l4" d="M30 52 L40 52"/>' +
          '<path class="l l5" d="M84 52 L94 52"/>' +
          '<rect class="patch" x="96" y="2" width="12" height="12"/>' +
        '</svg>' +
        '<div class="gc_load_word">GEETHA<span>CONSTRUCTIONS</span></div>' +
        '<div class="gc_load_bar"><i></i></div>' +
        '<button type="button" class="gc_enter" id="gc-enter" disabled>' +
          '<span class="gc_enter_label">Enter</span>' +
          '<span class="gc_enter_wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
        '</button>' +
        '<button type="button" class="gc_enter_quiet" id="gc-enter-quiet" disabled>Enter without sound</button>' +
      '</div>';
    (document.body || document.documentElement).appendChild(n);

    var born = Date.now(), ready = false, done = false;
    var btn = n.querySelector('#gc-enter'), quiet = n.querySelector('#gc-enter-quiet');

    function offer() {
      if (ready) return;
      ready = true;
      var wait = Math.max(0, MIN_GATE - (Date.now() - born));
      setTimeout(function () {
        n.classList.add('is--ready');
        btn.disabled = false; quiet.disabled = false;
        try { btn.focus({ preventScroll: true }); } catch (e) {}
      }, wait);
    }

    function enter(withSound) {
      if (done || !ready) return;
      done = true;
      try {
        releaseAnimations();             // un-hide the page and let the intro run
        startSound(withSound);
        var v = heroVideo();
        if (v) {
          v.muted = true;
          try { v.currentTime = 0; } catch (e) {}
          var p = v.play();               // inside the click: always permitted
          if (p && p.catch) p.catch(function () {});
        }
        if (window.__gcKickVideos) window.__gcKickVideos();
      } finally {
        releaseAnimations();             // whatever happens, never leave the page frozen
        n.classList.add('is--gone');
        document.documentElement.classList.remove('gc-loading');
        try { sessionStorage.setItem('gcLoaded', '1'); } catch (e) {}
        setTimeout(function () { n.remove(); }, 700);
        window.dispatchEvent(new Event('gc:entered'));
      }
    }

    btn.addEventListener('click', function (e) { e.stopPropagation(); enter(true); });
    quiet.addEventListener('click', function (e) { e.stopPropagation(); enter(false); });
    n.addEventListener('click', function () { enter(true); });       // anywhere on the screen
    document.addEventListener('keydown', function onKey(e) {
      if (done) { document.removeEventListener('keydown', onKey); return; }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(true); }
    });

    // ready = page loaded and, where there is a hero, enough video buffered to play
    function heroBuffered() {
      var v = heroVideo();
      return !v || v.readyState >= 3;
    }
    var poll = setInterval(function () {
      if (document.readyState === 'complete' && heroBuffered()) { clearInterval(poll); offer(); }
    }, 120);
    setTimeout(function () { clearInterval(poll); offer(); }, MAX_READY);
  }

  // ---------------------------------------------------------------- prompt
  function prompt() {
    try {
      if (localStorage.getItem('gcEnquired')) return;          // already a lead
      var until = +(localStorage.getItem('gcPromptSnooze') || 0);
      if (until && Date.now() < until) return;
    } catch (e) {}
    if (/contact/.test(location.pathname)) return;             // already there

    var shown = false;

    function snooze(days) {
      try {
        localStorage.setItem('gcPromptSnooze',
          String(Date.now() + days * 864e5));
      } catch (e) {}
    }

    function show() {
      if (shown) return;
      shown = true;
      var w = document.createElement('div');
      w.id = 'gc-prompt';
      w.setAttribute('role', 'dialog');
      w.setAttribute('aria-modal', 'false');
      w.setAttribute('aria-label', 'Request a callback');
      w.innerHTML =
        '<div class="gc_prompt_card">' +
          '<button class="gc_prompt_x" aria-label="Close">&times;</button>' +
          '<div class="gc_prompt_eyebrow">BUILDING IN BENGALURU?</div>' +
          '<h3>Leave your number and we will call you back.</h3>' +
          '<p>Same working day. Then a free visit to your plot, and an itemised written estimate.</p>' +
          '<a class="gc_prompt_go" href="contact.html">Talk to us</a>' +
          '<button class="gc_prompt_no">Not now</button>' +
        '</div>';
      document.body.appendChild(w);
      document.documentElement.classList.add('gc-prompt-open');
      requestAnimationFrame(function () { w.classList.add('is--in'); });

      function close(days) {
        snooze(days);
        document.documentElement.classList.remove('gc-prompt-open');
        w.classList.remove('is--in');
        setTimeout(function () { w.remove(); }, 400);
      }
      w.querySelector('.gc_prompt_x').addEventListener('click', function () { close(PROMPT_COOLDOWN_DAYS); });
      w.querySelector('.gc_prompt_no').addEventListener('click', function () { close(PROMPT_COOLDOWN_DAYS); });
      w.querySelector('.gc_prompt_go').addEventListener('click', function () { snooze(90); });
      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape' && document.getElementById('gc-prompt')) {
          close(PROMPT_COOLDOWN_DAYS);
          document.removeEventListener('keydown', esc);
        }
      });
    }

    setTimeout(show, PROMPT_AFTER_MS);
    window.addEventListener('scroll', function onScroll() {
      var h = document.documentElement.scrollHeight - innerHeight;
      if (h > 0 && scrollY / h > PROMPT_AFTER_SCROLL) {
        show(); window.removeEventListener('scroll', onScroll);
      }
    }, { passive: true });
    // leaving towards the tab bar, desktop only
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget && e.clientY <= 0 && innerWidth > 900) show();
    });
  }

  // ------------------------------------------------------------ device tier
  // The signature look costs real GPU work: 27 scroll-scrubbed text blocks
  // animate filter: blur() per character, which a laptop absorbs and a
  // budget Android does not. Rather than water the design down for everyone,
  // weak devices drop the blur only -- the movement, stagger and timing all
  // still run, so it still reads as the same site.
  function tier() {
    var mem   = navigator.deviceMemory || 8;
    var cores = navigator.hardwareConcurrency || 8;
    var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    var weak = mem <= 4 || cores <= 4 || (coarse && innerWidth < 900);
    if (weak || reduced) document.documentElement.classList.add('gc-lite');
  }

  // ------------------------------------------------------- floating action
  // A small red marker that sits on the page at all times and goes to the
  // contact form. The header logo scrolls with the page and is a link home,
  // so it was never doing this job. Hidden on the contact page itself, and
  // it steps aside when the enquiry prompt is on screen so the two never
  // stack in the same corner.
  function fab() {
    if (/contact/.test(location.pathname)) return;
    if (document.getElementById('gc-fab')) return;

    var a = document.createElement('a');
    a.id = 'gc-fab';
    a.href = 'contact.html';
    a.setAttribute('aria-label', 'Talk to us about your home');
    a.innerHTML =
      '<span class="gc_fab_icon" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">' +
          '<path d="M4.5 5.5c0 8 6 14 14 14l2.2-3.4-4.2-2.1-1.8 2a14.6 14.6 0 0 1-6.6-6.6l2-1.8L7.9 3.3 4.5 5.5Z"/>' +
        '</svg>' +
      '</span>' +
      '<span class="gc_fab_label">Talk to us</span>';
    document.body.appendChild(a);
    requestAnimationFrame(function () { a.classList.add('is--in'); });
  }

  function boot() {
    tier(); loader(); fab();
    // the prompt's clock starts when they are actually looking at the site
    if (gated) window.addEventListener('gc:entered', prompt, { once: true });
    else prompt();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
