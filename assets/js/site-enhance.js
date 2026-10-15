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
  function loader() {
    if (document.getElementById('gc-loader')) return;
    if (sessionStorage.getItem('gcLoaded')) return;   // once per session

    var n = document.createElement('div');
    n.id = 'gc-loader';
    n.setAttribute('aria-hidden', 'true');
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
      '</div>';
    document.documentElement.classList.add('gc-loading');
    (document.body || document.documentElement).appendChild(n);

    var born = Date.now(), done = false;

    function lift() {
      if (done) return;
      done = true;
      var wait = Math.max(0, MIN_SHOW - (Date.now() - born));
      setTimeout(function () {
        n.classList.add('is--gone');
        document.documentElement.classList.remove('gc-loading');
        try { sessionStorage.setItem('gcLoaded', '1'); } catch (e) {}
        setTimeout(function () { n.remove(); }, 650);
      }, wait);
    }

    // lift when the hero is actually running, or when patience runs out
    function heroReady() {
      var v = document.querySelector('.hero_video video');
      if (!v) return true;                       // no hero on this page
      return !v.paused && v.currentTime > 0.05;
    }
    var poll = setInterval(function () {
      if (document.readyState === 'complete' && heroReady()) {
        clearInterval(poll); lift();
      }
    }, 90);
    setTimeout(function () { clearInterval(poll); lift(); }, MAX_WAIT);
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
      requestAnimationFrame(function () { w.classList.add('is--in'); });

      function close(days) {
        snooze(days);
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

  function boot() { loader(); prompt(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
