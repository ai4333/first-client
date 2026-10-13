# Geetha Constructions — project state

Working log. Updated 13 Oct 2026. Read this first after any context loss.

---

## 1. What this is

Marketing + lead-gen site for **Geetha Constructions**, a residential builder in
west Bengaluru. Four static pages. Agency side is Nikhil (LREIX); this is his
first client and his main portfolio piece.

**The site's one job:** make a visitor believe this is a serious builder, then
make it trivial to reach them.

### Where things live

| | |
|---|---|
| Repo | `~/Desktop/COPY OF GEETHE AWWARDS /geetha awwwards` (note trailing space in parent) |
| Remote | `github.com/ai4333/first-client`, branch `main` |
| Local server | `python3 -m http.server 8899` |
| Client photos | `~/Desktop/GEETHA PHOTOTS` (191 images, 7 videos, 489MB) |
| Live (Vercel) | https://www.geethaconstruction.com and https://geethaconstruction.vercel.app |
| Vercel project | `ai4333s-projects/geetha` |
| Registrar | Namecheap, account **Mahesh Vanka**, `contact@lreix.com` |

Pages: `index.html`, `about.html`, `investors.html` (**this is the portfolio
page** — legacy filename), `contact.html`.

---

## 2. Origin — important context

This started as a **scraped copy of American Bitcoin Corp's live website**
(`abtc-eta.vercel.app`), not a licensed template. `make_offline.py` in the repo
is the scraper. Consequences that still bite:

- Webflow ships **CSS per page**. Components cloned from the homepage arrive
  unstyled elsewhere. That is why `assets/css/about-components.css` exists —
  46 rules lifted from the homepage sheet so About's cloned sections render.
- ABTC leftovers keep surfacing. Most are purged; see §6 for what remains.
- Awwwards explicitly rejects non-original work, so this codebase cannot be
  submitted. Raised with Nikhil; his call.

### Facts verified from documents, not assumed

| Fact | Source |
|---|---|
| Proprietor **Munindraiah Mahesh**, proprietorship | GST certificate |
| GSTIN `29EVFPM7246J1ZY`, registered 07/03/2022 | GST certificate |
| Office: Ground Floor, No. 49, I Cross, Jnanabharati I Stage, Mariyappana Palya, Bengaluru 560056 | GST certificate |
| Phone **+91 96060 85872** | printed on the client's own project renders |
| Founder (father) came to Bengaluru with no connections, built 250+ homes, has passed away; son **Mahesh** now runs it, 50+ homes | Nikhil |

**`geethaconstructions.com` (PLURAL) is a different company** — B K Manjunath's
firm, founded 2007, live on BigRock. Do not use its phone, email or address.
Our domain is **`geethaconstruction.com` (singular)**.

---

## 3. Theme / colourway — single source of truth

Brand tokens, defined in the Webflow sheets:

| Token | Hex |
|---|---|
| navy (primary ink) | `#171b33` |
| red (accent) | `#ff2c2f` |
| blue | `#2d4cff` |
| dark | `#0a0a0a` |
| light | `#fff` |
| navy-50 (page bg) | `#f5f6fc` |
| navy-900 | `#0b0d19` |
| green | `#9ec741` |

**Rules for any new work:**
- Use the CSS custom properties, e.g. `var(--_color-values---swatch--navy, #171b33)`.
- **Never `#000`** — the site's ink is navy. Black tints become `rgba(23,27,51,·)`.
- **Sharp corners.** `border-radius: 0`. The site has almost no radii; pills and
  rounded cards read as foreign.
- Spacing uses the `--_defaults---gap--N` scale (gap--5/6/7 for component padding).
- Surfaces use `--surface--secondary` (white) — the same token the header uses.
- The **"patch"** is the signature device: a small solid offset square, usually
  brand red. 50+ across the site (`hero_patch`, `header_block_patch`, …).

Audited 13 Oct: every colour in `investors.html`, `contact.html` and
`about-components.css` now maps to a brand token. The only exceptions are the
**MapLibre basemap palette** (`#f8f9fa`, `#dbeafe`, `#e2e8f0`, `#cbd5e1`), which
is intentionally the map's own.

Removed in that pass: off-brand dark green `#0b3d16` (→ red), pure black
(→ navy), `#7f7f7f` and `#f0f0f0` greys (→ navy tints).

---

## 4. Cache-busting — read before testing

Every asset ref carries `?v=YYYYMMDD<letter>`. **Bump it on every CSS/JS change
or the browser serves a stale file.** A fix of mine silently did nothing because
I replaced the wrong version string. Current: all four pages at `?v=20261013m`
except `about.html` at `?v=20261013k`.

When testing, also append a throwaway query to the page URL (`?v=6`) — the HTML
itself is not cache-busted.

---

## 5. What has been done

### Performance
- 17.06 MB / 73 req → **4.59 MB / 58 req** on the homepage
- hero video 5.0 MB → 743 KB, re-encoded as a seamless ping-pong loop
- `custom_house_new.png` 7.7 MB → 35 KB (AVIF/WebP + srcset)
- fonts were loading from **Webflow's CDN** using ABTC asset IDs; now self-hosted WOFF2
- killed a `setInterval(playAll, 3000)` that restarted every video forever
- purged ~74 MB of unreferenced ABTC assets + a dead WebGL prototype

### Content / SEO
- "Layer 1: Mining / Treasury / Ecosystem" → **Stage 1/2/3 Design / Structure / Finish**
- About `*BUILD SPECIALISTS*` literal asterisks → proper italics
- `robots.txt` no longer blocks `/assets/` and `/public_assets/` (Google could not render the site)
- added `sitemap.xml`, absolute `og:image`, per-page `og:url`
- deleted `security.js` (it blocked Cmd+C, so nobody could copy the phone number) and the cookie banner
- homepage credited a fabricated "Geetha S., Founder & MD" → real proprietor

### Header
- wordmark was `#ffffff` on a `#ffffff` header — **invisible on every page at desktop width**. Now navy, 16.9:1
- mobile lockup was an SVG containing only "GEETHA"; now GEETHA / CONSTRUCTIONS
- removed dead `ANALYTICS` nav item, renumbered 01–04

### Mobile menu
One tap produced **two** class mutations — `app.js`'s hamburger module **and** a
duplicate inline script on all four pages, cancelling out. Inline one removed.

### Portfolio (`investors.html`)
- five **real projects with real client names**: Sridhar, Yugandhar,
  Shivalingaiah, Parasmal, Mahesh — replacing "Nagarbhavi Project 1/2" whose
  pins landed 35–60 km out in farmland
- pins now on real localities near their Jnanabharathi office
- **real photographs lead**; renders demoted to a labelled "Elevation drawing"
- interior walkthrough on Sridhar (11 shots)
- spec fields changed from invented (15,000 sq ft, Q3 2026) to defensible:
  Configuration, Drawings, and "On request"
- panel restored to the inset floating grid after I broke the nesting
- **list scroll**: Lenis swallows wheel events globally, and
  `data-lenis-prevent` is not honoured by this build — the list and panel carry
  their own wheel handler that drives `scrollTop` and releases at the extremes
- **lightbox**: click hero → full screen, prev/next, arrows, Esc. Width ladder
  falls back `full → 1600 → 1400 → 1200 → 1120` because the real photos came
  through WhatsApp at 1200px and have no larger variant
- **photo dump**: "ALL PHOTOS" → two drifting strips of 24 real site photos,
  drag to scrub, hover to pause, click to enlarge

### Homepage
- Stage posters all pointed at `hero-poster.jpg` (the hero house); each now
  posters its own still
- **Stage 1/2/3 overlap**: `app.js` sets `zIndex` on all three layers, but layer
  0 was `position: static` and **CSS ignores z-index on static elements**, so it
  bled through Stages 2 and 3. `.strategy_content { position: relative }`

### Contact
- removed the Karnataka map (showed Belagavi/Hubballi under a Bengaluru address)
- Call + WhatsApp as primary actions, real H1, facts demoted
- email was `info@geethaconstruction**s**.com` — **the competitor's domain**
- form rebuilt: required **6 → 2**; budget started at ₹1.5Cr (wrong market) now
  starts "Not sure yet" from under ₹50 lakh; location listed the firm's own
  offices, now lists localities they build in; added "Where are you now?";
  added reassurance + "What happens next" 1-2-3

### About
- rebuilt around the real founder story with the founders photo
- tracer sat 186px above its section (`bottom:130%` tuned for the homepage's
  taller intro) → `bottom:100%`, now behind the heading, on the right

### Domain
- registrant address was the literal string `"address"` → fixed to the GST address
- ICANN verification completed; suspension lifted
- DNS cleaned to exactly: `A @ → 216.198.79.1`, `CNAME www → 79750bdd3aaec0ca.vercel-dns-017.com.`
- deleting records needs the **"Delete Record? Yes/No"** confirmation popup

---

## 6. Open items

### Blocking — needs Nikhil
1. **The contact form does not submit.** `action="#"`, no handler. Every lead is
   lost. Needs one destination email; ~10 min to wire (Formspree/Web3Forms).
2. **`info@geethaconstruction.com` probably does not exist** — mailbox must be created.
3. Confirm **+91 96060 85872** is the number leads should go to.

### Decided but not done
4. **Cut the "We will not be the cheapest quote" block from About.** It is a
   clone of the homepage section *and* its six icons are still **ABTC's Bitcoin
   Lottie files** (`Finite_Supply.json`, `Hedging_Asset.json`,
   `Deflationary_Supply.json` …) — a circle-B, a lattice, a crosshair. Nikhil
   agreed in principle; awaiting the word.

### Known, not yet addressed
5. **Safari performance.** 27 scroll-scrubbed text blocks animate
   `filter: blur()` per character per frame (~186 chars on the homepage), plus
   12 `backdrop-filter`s, 4 simultaneous videos, Lottie on the **svg** renderer,
   and Lenis fighting native momentum. Chromium absorbs it; WebKit does not.
   Fix list: Lottie `svg`→`canvas`, blur per word not per char, trim
   backdrop-filters, defer offscreen videos.
6. **Homepage background video placement** — Nikhil wants to judge it himself on
   a laptop first.
7. 404 on every page: `assets/js/webflow.achunk.2aaad8b9b407aaec.js` → `ChunkLoadError`.
8. Real photos cap at **1200px** (WhatsApp compression). Originals off the phone
   would be far better for the lightbox.
9. Google Business Profile exists via a friend — highest-value local-SEO lever, unclaimed.
10. No analytics of any kind. The old `G-Q1CXW48MZ4` was ABTC's and was removed.

---

## 7. Working agreements

- **Desktop/laptop is the priority** right now; mobile after.
- **Do not fabricate facts** — no invented sq ft, handover dates, founding years,
  addresses or statistics. Use "On request" or ask. This has caused real problems
  (fake Koramangala address, fake "Geetha S." founder, ₹1.5Cr budget floor).
- **Label renders as renders.** Real photographs are the credibility; unlabelled
  renders beside them drag everything down to brochure level.
- **Keep the design, sound and motion.** The animation, hover audio and page
  transitions are the good part. Fix what is broken around them.
- **Nothing goes live without review.** Commit locally; Nikhil reviews; then push.
- **Verify in the DOM, not from pane screenshots.** The preview pane backgrounds
  itself, freezing rAF and stalling CSS transitions — it has produced false bug
  reports three times (an "11.3s" intro that was 3.7s; a "broken" mobile panel
  that worked; a "misaligned" header that was fine). Measure computed styles and
  rects; treat screenshots as a hint.

---

## 8. Commit history (this engagement)

```
cdf2822  About: close the tracer gap. Portfolio: build the photo dump.
06d8c06  Real photo thumbnails; rebuild the contact form around fewer fields
9d44f48  Portfolio: make the project list scrollable, add image lightbox
8c9e689  Fix Stage 1/2/3 layers overlapping instead of stacking
b094644  Portfolio: restore inset panel, lead with real photographs
b842b0e  Contact page: drop the wrong map, lead with Call and WhatsApp
150e6ac  Portfolio: real projects, real names, interior walkthrough
c237849  Fix mobile menu (double-toggle) and wrong Stage posters
7309e84  Header: make the brand name visible, fix the nav
8af398f  Fix About page: clone real section markup + ship the CSS it needs
79c01c0  Rebuild About page around the real founder story
2aa928a  Performance, asset and SEO pass (no design changes)
```

Rollback a deploy: Vercel → Deployments → previous → Promote to Production.
