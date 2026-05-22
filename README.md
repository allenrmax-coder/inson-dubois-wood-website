# Inson Dubois Wood — Design &amp; Build Atelier

Marketing site for **Inson Dubois Wood**, a Harvard-trained design and build atelier composing residences across three continents. Dark cinematic visual treatment with scroll-driven storytelling.

## Tech

- Plain HTML / CSS / JavaScript — no build step
- [GSAP 3](https://greensock.com/gsap/) + [ScrollTrigger](https://greensock.com/scrolltrigger/) for scroll-tied animations (loaded via CDN)
- Google Fonts — Cormorant Garamond (display), Inter (UI), JetBrains Mono (micro-type)

## Run locally

The site is fully static — open `index.html` directly, or serve the folder with any static file server:

```bash
# Python (built-in)
python -m http.server 5500

# Node
npx serve .
```

Then visit <http://localhost:5500>.

## File layout

```
.
├── index.html      Page structure
├── styles.css      All styling (tokens, sections, responsive, reduced-motion)
├── script.js       Loader, scroll triggers, scene timelines, form
└── README.md
```

## Section structure

1. **Hero** — full-bleed background image, mask-reveal headline, intro lede, CTAs
2. **Intro** — pulled statement about the atelier
3. **Cinematic Reveal** — Sondaven-style scroll pullback: tight detail crop expands to full-bleed, cross-fading captions
4. **Selected Work** — horizontal pinned gallery (six residences) on desktop, native swipe on mobile
5. **Services** — vertical list with a persistent preview image that swaps on hover
6. **Process** — four cross-fading acts (Listen → Compose → Build → Finish), pinned on desktop, stacked on mobile
7. **Atelier** — portrait + bio + animated stats
8. **Contact** — large headline, email link, form, address / phone / social

## Editing copy

All copy lives in `index.html`. Look for the section comment markers (`═════ HERO ═════`, etc.).

## Editing colours / typography

Open `styles.css` and edit the `:root` tokens at the top:

```css
--ink:        #0a0908;   /* page background */
--paper:      #f3ede2;   /* main text / light surfaces */
--bronze-2:   #e2c08a;   /* italic accent / highlights */
--serif:      'Cormorant Garamond', ...;
--sans:       'Inter', ...;
```

## Replacing images

All `<img>` tags in `index.html` currently point at the existing `insonduboiswood.com` CDN. Drop in new project URLs (or local paths) to swap in updated photography. Recommended aspect ratio is 4:5 for portrait crops, 3:2 for landscape.

## Accessibility

- Honors `prefers-reduced-motion` — all scroll-tied scenes degrade to static
- All animated entrances have a CSS auto-hide fallback if JS fails
- Focus styles on form fields and primary buttons
- Semantic landmarks (`header`, `main`, `nav`, `section`, `footer`)

---

© 2026 Inson Dubois Wood, LLC. Site code free to adapt.
