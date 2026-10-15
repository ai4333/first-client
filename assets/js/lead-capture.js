/**
 * Geetha Constructions - lead capture.
 *
 * The contact form posted to action="#", which means every enquiry anyone
 * typed was silently discarded: no network request, no error, the page just
 * sat there. This sends it somewhere and tells the visitor what happened.
 *
 * Where it goes: a Google Apps Script web app that appends a row to a Google
 * Sheet. Free, no database, no third party holding the client's leads, and
 * the Sheet exports anywhere because it is already a spreadsheet. Set
 * ENDPOINT below to the /exec URL -- see tools/apps-script/README.md.
 *
 * If the endpoint is unset or the request fails, the form does NOT pretend to
 * have worked. It hands the visitor off to WhatsApp with their details
 * already written out, so a lead is never lost to a network error.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------
  var ENDPOINT = '';                 // <-- paste the Apps Script /exec URL
  var WHATSAPP = '919606085872';     // fallback destination
  // ---------------------------------------------------------------------

  var FIELDS = ['name', 'phone', 'email', 'location', 'stage', 'budget', 'message'];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function note(form) {
    var n = form.querySelector('.gc_form_note');
    if (!n) {
      n = el('div', 'gc_form_note');
      n.setAttribute('role', 'status');
      n.setAttribute('aria-live', 'polite');
      var anchor = form.querySelector('.gc_submit_wrapper') || form;
      anchor.appendChild(n);
    }
    return n;
  }

  function collect(form) {
    var data = {};
    FIELDS.forEach(function (f) {
      var input = form.querySelector('[name="' + f + '"]');
      data[f] = input ? String(input.value || '').trim() : '';
    });
    data.page = location.pathname;
    data.referrer = document.referrer || 'direct';
    data.submittedAt = new Date().toISOString();
    return data;
  }

  function whatsappHandoff(data) {
    var lines = ['Hi Geetha Constructions, I would like to discuss building a home.', ''];
    if (data.name)     lines.push('Name: ' + data.name);
    if (data.phone)    lines.push('Phone: ' + data.phone);
    if (data.email)    lines.push('Email: ' + data.email);
    if (data.location) lines.push('Plot: ' + data.location);
    if (data.stage)    lines.push('Stage: ' + data.stage);
    if (data.budget)   lines.push('Budget: ' + data.budget);
    if (data.message)  lines.push('Notes: ' + data.message);
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  function wire(form) {
    if (!form || form.__gcWired) return;
    form.__gcWired = true;

    // Spam trap. Bots fill every field they find; people never see this one.
    var trap = el('input');
    trap.type = 'text';
    trap.name = 'company_website';
    trap.tabIndex = -1;
    trap.autocomplete = 'off';
    trap.setAttribute('aria-hidden', 'true');
    trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0;';
    form.appendChild(trap);

    var started = Date.now();

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var btn = form.querySelector('[type="submit"]');
      var msg = note(form);
      var data = collect(form);

      if (!data.name || !data.phone) {
        msg.className = 'gc_form_note is--error';
        msg.textContent = 'Please add your name and phone number so we can call you back.';
        return;
      }
      // Bot signals: the trap was filled, or the form was completed
      // impossibly fast. Pretend it worked rather than telling a bot why.
      if (trap.value || Date.now() - started < 1200) {
        msg.className = 'gc_form_note is--ok';
        msg.textContent = 'Thank you. We will call you back.';
        form.reset();
        return;
      }

      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; }
      msg.className = 'gc_form_note';
      msg.textContent = 'Sending…';

      function ok() {
        msg.className = 'gc_form_note is--ok';
        msg.textContent = 'Thank you, ' + data.name.split(' ')[0] +
          '. We have your details and will call you back the same working day.';
        form.reset();
        started = Date.now();
        if (btn) { btn.disabled = false; }
        try { localStorage.setItem('gcEnquired', '1'); } catch (err) {}
      }

      function fallback() {
        msg.className = 'gc_form_note is--error';
        msg.innerHTML = '';
        msg.appendChild(document.createTextNode('We could not send that automatically. '));
        var a = el('a', null, 'Send it on WhatsApp instead');
        a.href = whatsappHandoff(data);
        a.target = '_blank';
        a.rel = 'noopener';
        msg.appendChild(a);
        msg.appendChild(document.createTextNode(' — your details are already filled in.'));
        if (btn) { btn.disabled = false; }
      }

      if (!ENDPOINT) { fallback(); return; }

      // text/plain keeps this a "simple" request, so the browser does not
      // send a CORS preflight that Apps Script would not answer.
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        ok();
      }).catch(fallback);
    });
  }

  function boot() {
    wire(document.getElementById('contact-form'));
    // The footer newsletter posted to "#" as well.
    document.querySelectorAll('form.footer_form').forEach(function (f) {
      if (f.__gcWired) return;
      f.__gcWired = true;
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = f.querySelector('input[type="email"]');
        var msg = note(f);
        if (!email || !email.value.trim()) {
          msg.className = 'gc_form_note is--error';
          msg.textContent = 'Please enter an email address.';
          return;
        }
        var payload = { name: '', phone: '', email: email.value.trim(), location: '',
                        stage: 'Newsletter signup', budget: '', message: '',
                        page: location.pathname, referrer: document.referrer || 'direct',
                        submittedAt: new Date().toISOString() };
        if (ENDPOINT) {
          fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                            body: JSON.stringify(payload) }).catch(function () {});
        }
        msg.className = 'gc_form_note is--ok';
        msg.textContent = 'Thank you — you are on the list.';
        f.reset();
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  // Taxi swaps the DOM without a reload.
  document.addEventListener('taxi:transition-end', boot);
})();
