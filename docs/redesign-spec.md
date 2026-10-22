# AgendaAI — Visual Redesign Spec v1

**Scope:** landing page visual system only.
**Reference direction:** agendapro.com — white-dominant, vivid purple, oversized left-aligned display type, generous whitespace, pill CTAs, floating product UI, soft lilac surfaces, conversion-led.
**Hard rules:** copy unchanged; semantic HTML unchanged; JS hooks unchanged. Implementation lives in `css/styles.css` (plus the `#appointment-widget` overrides already at its end). Do **not** edit `index.html`, `js/main.js`, `css/widget.css`.

---

## 0. Guardrails & file contract

### 0.1 Preserved JS hooks (must keep exact names)

`#nav-menu`, `.nav-toggle`, `.nav-link`, `.header`, `.scroll-progress`, `#year`, `#agenda-days`, `#agenda-title`, `#agenda-slots`, `#agenda-slots-list`, `#agenda-slots-date`, `#agenda-slots-close`, `#agenda-slots-empty`, `#agenda-prev`, `#agenda-next`, `.agenda-view-btn`, `#agenda-view-panel`, `.chat-demo`, `.stat-value`, `[data-cta]`, `#appointment-widget`, `#chat-open`.

Also load-bearing for behaviour/ARIA: `.nav-links.open`, `.agenda-day` (`today|past|empty|has-slots|selected`), `.agenda-slot` (`available|booked|selected`), `.agenda-slot-status`, `.is-visible`, `.scrolled`, `.is-active`, `.is-live`, `.is-mock`, `.counted`, `.play`.

### 0.2 HTML policy

- No HTML changes required. Every visual move below is achievable with CSS on existing classes.
- Sanctioned-only additions if needed: empty decorative wrappers with `aria-hidden="true"`, and the optional marquee duplicate (see §6.6). No new text, no new images, no reordering of headings/sections.
- No `display:none` on content, no pseudo-element replacement of copy, no duplicate headings. The accessible text must remain byte-identical to today's copy.
- Do not use CSS `order` to visually reorder content in a way that diverges from DOM reading order.

### 0.3 Known defects to fix in passing

| Where | Issue | Fix |
|---|---|---|
| `.live-chat-card` (styles.css ~548) | `var(--shadow-2)` is undefined | use `var(--shadow-lg)` |
| `.btn-primary` | animates `background-position` (paint-heavy) | static gradient + `::after` overlay opacity transition |
| `.pricing-card.popular .btn-primary` | primary gradient on purple card = weak separation | override to white button with purple label |
| `.header` | warm `rgb(251 250 247 / .86)` | neutral white `rgb(255 255 255 / .88)` |
| `.hero-trust` | dashed border reads "wireframe" | solid 1px hairline |
| `.step:not(:last-child)::after` | dotted connector is dated and misaligns | remove on desktop, no connector |
| `.faq-item[open]` | inset 3px bar + row highlight feels legacy | replace with card border + icon state |
| `meta theme-color` | still `#1D1D3D` | out of scope (HTML); optional future `#812DF2` |

---

## 1. Art direction

**Positioning:** a confident, product-led SaaS gallery — an almost entirely white page where one saturated purple voice carries brand, action and emphasis, and the product UI floats like a real object. Type is the hero: oversized Clash Display headlines, hard left-aligned, with editorial air around them; color is rationed to lilac surfaces, magenta accents and deep-ink depth. The page should read as *software you can trust*, not a warm boutique studio.

**What changes vs. today, and why**

| Today | Redesign | Why |
|---|---|---|
| Warm paper `#FBFAF7`, cream `#F6F3EF` | Pure white canvas, cool lilac `#FAF8FF` / `#F5EEFF` | Category signal: clean, modern SaaS; removes the beige/editorial feel |
| Violet `#6E3AF0` | Brand purple `#812DF2` | Exact AgendaPro cue, more vivid on white |
| Orange in `--grad-text` | Purple → magenta only | Coherent brand gradient; orange muddied the accent system |
| Centered section headers | Left-aligned asymmetric 7/5 header grid | Bold editorial rhythm; better scanning |
| 14–20px radii | 20–32px cards, 40px CTA panel | Softer, more premium surfaces |
| Dark navy recommended price card | Vivid purple recommended card | Higher contrast against white siblings; stronger conversion focus |
| Single FAQ panel | Independent FAQ cards | Airier, clearer states, better mobile |
| Section padding 72–112px | 72–128px with 56px header gap | Generous whitespace without losing density |
| Grey shadows | Purple-tinted layered shadows | Depth that belongs to the brand |

**Non-negotiables of the look:** no cream, no dashed lines, no glassmorphism beyond the header, no more than two *large-surface* gradients visible in one viewport, no magenta body text, no decorative drop shadows on text.

---

## 2. Design tokens

### 2.1 Color — roles and exact values

| Token | Hex | Role | Contrast notes |
|---|---|---|---|
| `--bg` | `#FFFFFF` | Page canvas | — |
| `--bg-soft` | `#FAF8FF` | Alternating section canvas | 1.05:1 vs white (decorative) |
| `--bg-lilac` | `#F5EEFF` | Soft panels, flagship bento | 1.13:1 vs white |
| `--lavender` | `#EFE1FF` | Chips, icon plates, stage shapes | 1.24:1 vs white; `#1D1D3D` on it = 13.0:1 |
| `--surface` | `#FFFFFF` | Cards on soft canvases | — |
| `--ink` | `#1D1D3D` | Headings, primary text | 16.2:1 on white |
| `--ink-body` | `#4A4A63` | Body copy | 8.57:1 on white; 6.89:1 on lavender |
| `--ink-muted` | `#66667E` | Captions, notes, meta | 5.58:1 on white; 5.37:1 on `#FAF8FF` |
| `--action` | `#812DF2` | Primary brand / buttons / active | 5.85:1 on white; 4.70:1 on lavender |
| `--action-hover` | `#6A1FD0` | Hover, links, deep accent | 7.72:1 on white |
| `--accent-magenta` | `#FA23C3` | Decorative only: dots, glows, 1px accents | **3.45:1 on white** → never text below 24px |
| `--accent-magenta-ink` | `#C2148F` | Text-safe magenta, gradient end | 5.54:1 on white |
| `--accent-sky` | `#1F5AE0` | Icon accent / info | 5.84:1 on white |
| `--accent-sky-soft` | `#E8F0FF` | Icon tile | — |
| `--accent-peach` | `#B7410E` | Icon accent / third use-case | 5.04:1 on `#FFF1EA` |
| `--accent-peach-soft` | `#FFF1EA` | Use-case + icon tile | `#1D1D3D` on it = 14.7:1 |
| `--accent-mint` | `#0B7A55` | Success, checks | 5.34:1 on white; 4.83:1 on `#E7F7F0` |
| `--accent-mint-soft` | `#E7F7F0` | Check circles, success pill | — |
| `--warn-bg` | `#FFF4D6` | Demo note | `#7A4A00` on it passes AA |
| `--warn-ink` | `#7A4A00` | Demo note text | — |
| `--danger` | `#B42318` | Errors, close hover | — |
| `--danger-soft` | `#FDECEC` | Error surface | — |
| `--dark` | `#13132B` | Footer | `#FFFFFF` = 18.2:1; `#B9B9CE` = 9.43:1 |
| `--dark-2` | `#1D1D3D` | Dark gradients | — |
| `--line` | `#EDE8F6` | Decorative hairlines, card borders | 1.20:1 — decorative only |
| `--line-strong` | `#D9D2E6` | Decorative emphasis, dividers | 1.47:1 — decorative only |
| `--line-lilac` | `#E2CCFF` | Brand-tinted borders | 1.47:1 — decorative only |
| `--line-control` | `#8E88A6` | **Functional** control borders (outline buttons, text inputs) | 3.37:1 vs white → WCAG 1.4.11 |
| `--line-inverse` | `rgba(255,255,255,.14)` | Borders on dark/purple | — |

**Color discipline**
- Magenta is a seasoning, not a text color: dots, 6–8px indicators, glows, gradient terminal, 2px rules. Never body copy.
- Primary gradient must keep white labels ≥4.5:1 across every stop: `#812DF2` (5.85) → `#A21BE0` (5.57) → `#C2148F` (5.54). Do **not** end a white-text gradient on `#FA23C3`.
- On purple surfaces, secondary text uses `#EFE1FF` (4.70 minimum on `#812DF2`) or `#F0E6FF`, never `#B9B9CE` or white at 70% opacity. On the magenta end (`#C2148F`) use `#FFFFFF` (5.54).

### 2.2 Typography

Loaded fonts are fixed: **Clash Display 500/600** and **Poppins 400/500/600**. Do not specify 700; it is not loaded and would synthesize.

| Token | Desktop | Mobile (<768) | Family | Weight | Line-height | Tracking |
|---|---|---|---|---|---|---|
| `--fs-display` (h1) | `clamp(2.75rem, 5.2vw, 5.25rem)` → 84px max | 44px | Clash Display | 600 | 0.94 | −0.04em |
| `--fs-h2` | `clamp(2.125rem, 3.6vw, 3.5rem)` → 56px max | 32px | Clash Display | 600 | 1.02 | −0.035em |
| `--fs-h3-lg` (demo/panel titles) | `1.875rem` / 30px | 24px | Clash Display | 600 | 1.10 | −0.03em |
| `--fs-h3` (card titles) | `1.25rem` / 20px | 18px | Clash Display | 600 | 1.25 | −0.015em |
| `--fs-price` | `4rem` / 64px | 52px | Clash Display | 600 | 1.00 | −0.03em, tabular |
| `--fs-stat` | `3.25rem` / 52px | 40px | Clash Display | 600 | 1.00 | −0.03em, tabular |
| `--fs-lead` | `1.25rem` / 20px | 17px | Poppins | 400 | 1.60 | 0 |
| `--fs-body` | `1rem` / 16px | 16px | Poppins | 400 | 1.70 | 0 |
| `--fs-body-s` | `0.9375rem` / 15px | 14.5px | Poppins | 400 | 1.65 | 0 |
| `--fs-small` | `0.875rem` / 14px | 13.5px | Poppins | 400 | 1.60 | 0 |
| `--fs-micro` | `0.8125rem` / 13px | 12.5px | Poppins | 400 | 1.55 | 0 |
| `--fs-label` | `0.75rem` / 12px | 11.5px | Poppins | 600 | 1.00 | 0.08em, uppercase |
| `--fs-nav` | `0.9375rem` / 15px | 16px | Poppins | 500 | 1.30 | 0 |

- H1/H2 use `text-wrap: balance`; paragraphs `text-wrap: pretty` (already present).
- `.highlight` keeps the gradient-text hack; fallback `#6A1FD0`; allow only on h1/h2 (large text).
- `.amount`, `.stat-value` get `font-variant-numeric: tabular-nums`.
- `body` `-webkit-font-smoothing: antialiased` stays.
- No italic, no all-caps headlines. Labels only.

### 2.3 Spacing

Base 4px.

| Token | px | Use |
|---|---|---|
| `--s1` | 4 | icon-to-label, dot gaps |
| `--s2` | 8 | inline gaps, chip padding-y |
| `--s3` | 12 | button gap, badge gaps |
| `--s4` | 16 | card inner tight, grid gap mobile |
| `--s5` | 20 | base grid gap |
| `--s6` | 24 | card padding mobile, grid gap desktop |
| `--s8` | 32 | card padding desktop |
| `--s10` | 40 | large card padding |
| `--s12` | 48 | header-to-content, panel padding |
| `--s16` | 64 | hero grid gap max |
| `--s20` | 80 | CTA padding |
| `--s24` | 96 | hero padding-y |
| `--s30` | 120 | max section padding |
| `--section-y` | `clamp(72px, 9vw, 128px)` | section block padding |
| `--header-gap` | `56px` (48 mobile) | `.section-header` bottom margin |

### 2.4 Layout

| Token | Value |
|---|---|
| `--container` | 1200px |
| `--container-wide` | 1280px (hero, CTA visual bleed) |
| `--container-narrow` | 820px (FAQ, contact) |
| `--gutter` | `clamp(20px, 4vw, 32px)` |
| `--grid-cols` | 12 desktop / 8 tablet / 4 mobile |
| `--grid-gap` | 24px desktop / 20px tablet / 16px mobile |
| `--header-h` | 76px desktop, 64px mobile |
| `--section-y` | see above |
| `--measure` | 66ch body, 46ch lead, 20ch h2 max |

### 2.5 Radii

| Token | Value | Use |
|---|---|---|
| `--r-xs` | 8px | inner chips, legend swatches |
| `--r-sm` | 12px | calendar cells, small controls |
| `--r-md` | 16px | icon tiles, inputs |
| `--r-lg` | 20px | FAQ items, stats |
| `--r-xl` | 24px | feature/use-case cards |
| `--r-2xl` | 28px | pricing, agenda, chat window |
| `--r-3xl` | 32px | big panels, live-chat card |
| `--r-4xl` | 40px | CTA poster, hero stage |
| `--pill` | 999px | buttons, badges, segmented control |

### 2.6 Shadows (purple-tinted, layered; no grey mud)

```css
--shadow-xs:  0 1px 2px rgb(19 19 43 / .04);
--shadow-sm:  0 2px 6px -2px rgb(19 19 43 / .06), 0 1px 2px rgb(19 19 43 / .04);
--shadow-md:  0 12px 24px -12px rgb(19 19 43 / .14), 0 2px 6px -2px rgb(19 19 43 / .06);
--shadow-lg:  0 28px 56px -24px rgb(19 19 43 / .20), 0 8px 16px -8px rgb(19 19 43 / .06);
--shadow-xl:  0 48px 96px -32px rgb(19 19 43 / .28), 0 12px 24px -12px rgb(19 19 43 / .08);
--shadow-action:  0 14px 28px -12px rgb(129 45 242 / .45);
--shadow-action-hover: 0 20px 40px -14px rgb(129 45 242 / .50);
--shadow-magenta: 0 18px 40px -18px rgb(250 35 195 / .35);
--inset-top: inset 0 1px 0 rgb(255 255 255 / .70);
```

Rule: default cards sit at `xs`/`sm`; only floating product surfaces and the recommended plan earn `lg`/`xl`.

### 2.7 Gradients

```css
--grad-action: linear-gradient(100deg, #812DF2 0%, #A21BE0 55%, #C2148F 100%);
--grad-action-v: linear-gradient(160deg, #812DF2 0%, #6A1FD0 100%);
--grad-text: linear-gradient(95deg, #6A1FD0 0%, #812DF2 38%, #C2148F 100%);
--grad-surface: linear-gradient(155deg, #FFFFFF 0%, #F8F1FF 55%, #EFE1FF 100%);
--grad-hero:
  radial-gradient(60% 55% at 92% -8%, #EFE1FF 0%, rgb(239 225 255 / 0) 62%),
  radial-gradient(42% 38% at 0% 18%, #FFE9F8 0%, rgb(255 233 248 / 0) 65%),
  radial-gradient(46% 40% at 62% 108%, #EEE7FF 0%, rgb(238 231 255 / 0) 68%),
  #FFFFFF;
--grad-demo: linear-gradient(180deg, #FFFFFF 0%, #F8F1FF 20%, #F3EBFF 60%, #FFFFFF 100%);
--grad-cta:
  radial-gradient(70% 120% at 88% -10%, rgb(250 35 195 / .22) 0%, rgb(250 35 195 / 0) 60%),
  radial-gradient(60% 100% at 0% 110%, rgb(255 255 255 / .16), transparent 60%),
  linear-gradient(120deg, #812DF2 0%, #6A1FD0 100%);
--grad-dark: linear-gradient(150deg, #1B1B3A 0%, #13132B 55%, #0E0E22 100%);
```

### 2.8 Token migration map (old → new)

| Old | Old value | New | New value |
|---|---|---|---|
| `--bg` | `#FBFAF7` | `--bg` | `#FFFFFF` |
| `--bg-alt` | `#F6F3EF` | `--bg-soft` | `#FAF8FF` |
| `--violet` | `#6E3AF0` | `--action` | `#812DF2` |
| `--violet-deep` | `#5A22D6` | `--action-hover` | `#6A1FD0` |
| `--line` | `#E8E3DC` | `--line` | `#EDE8F6` |
| `--line-2` | `#D8D1C7` | `--line-strong` | `#D9D2E6` |
| `--line-accent` | `#E2CCFF` | `--line-lilac` | `#E2CCFF` |
| `--ink-3` | `#6E6E85` | `--ink-muted` | `#66667E` |
| `--radius` | 14px | `--r-md` | 16px |
| `--radius-lg` | 20px | `--r-lg` | 20px |
| `--radius-xl` | 28px | `--r-2xl` | 28px |
| `--radius-2xl` | 36px | `--r-3xl` | 32px |
| `--header-h` | 72px | `--header-h` | 76px |
| `--grad-brand` | `#7A2BF5→#C2148F` | `--grad-action` | `#812DF2→#A21BE0→#C2148F` |
| `--grad-text` | incl. orange | `--grad-text` | purple→magenta only |

Retain the legacy variable names as aliases during implementation to avoid breaking the 1,200 lines that already reference them; rename opportunistically, not in the first pass.

---

## 3. Layout & rhythm

### 3.1 The spine

Everything starts on the container's left edge. **Centered alignment is banned** except:
- `.logos-row` (sector strip),
- fine print (`.plan-note`, `.pricing-note`, `.cta-note`) and short legal text in `.footer-bottom`,
- nothing else.

`.section-header` becomes a 12-column asymmetric header:

```css
.section-header{
  display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);
  gap:8px 48px;align-items:end;text-align:left;
  max-width:none;margin:0 0 56px;
}
```

- `h2` occupies 7 cols, `max-width:20ch`.
- `.section-subtitle` occupies 5 cols, `max-width:46ch`, `margin:0 0 4px`, 17px.
- At ≤1024px: single column, 12px gap, subtitle follows heading.

This one change is the difference between "template" and "designed".

### 3.2 Section alternation

Not zebra striping. A white page with three soft interruptions and two loud moments.

| # | Section | Surface | Signature |
|---|---|---|---|
| 1 | Hero | White + `--grad-hero` mesh | Floating chat on lilac stage |
| 2 | Sector strip | `#FAF8FF`, hairlines top/bottom | Typographic band |
| 3 | Features | `#FAF8FF` | 2×2 flagship bento + colored icon tiles |
| 4 | How it works | White | Ghost numerals, open columns |
| 5 | Demo | `--grad-demo` | Two floating product cards + stat band |
| 6 | Use cases | White | Staggered colored cards |
| 7 | Pricing | `#FAF8FF` + soft radial | Vivid purple recommended card |
| 8 | FAQ | White | Independent accordion cards |
| 9 | CTA | White section, purple poster | Full 40px-radius purple panel |
| 10 | Contact | White | Lilac gradient card |
| 11 | Footer | `#13132B` | Watermark + gradient hairline |

### 3.3 Vertical rhythm

- Section padding: `clamp(72px, 9vw, 128px)` top and bottom. Hero: 72 top / 96 bottom.
- `.section-header` → content: 56px desktop, 40px tablet, 32px mobile.
- Card grids: 20px gap desktop, 16px mobile. Pricing/demo: 24px.
- Inside cards: 32px padding desktop, 24px mobile; h3 → p = 8px; p → CTA = 24px.
- Hero text stack: badge → h1 24px; h1 → description 24px; description → actions 32px; actions → micro 12px; micro → alt 4px; alt → trust 40px.
- Never rely on margin collapse for section spacing; `section` owns its padding.

### 3.4 Grid behavior

- 12-col desktop, 8 tablet, 4 mobile; all track definitions `minmax(0, 1fr)` to prevent overflow.
- Bento: 3 cols; card 1 spans 2×2. Tablet: 2 cols, card 1 spans 2. Mobile: 1 col, no spans.
- Demo: `1.1fr .9fr` (agenda / stats) with live-chat card full width above.
- Pricing: 2 cols, max 1000px, equal-height stretch.
- Use cases: 3 cols with intentional vertical offsets.
- Footer: `2fr 1fr 1fr`.

### 3.5 Asymmetry rules

- Hero 52/48 text/visual, not 50/50.
- Section headers 7/5.
- Use cases: `nth-child(2)` +32px, `nth-child(3)` +12px (desktop only).
- Demo: agenda card +24px relative to stats band.
- CTA: copy 7 cols, actions 5 cols.
- Symmetry is reserved for the sector strip and the footer bottom line.

---

## 4. Section-by-section visual specs

### 4.1 Header — `.header`, `.nav`, `.nav-links`, `.nav-link`, `.nav-toggle`, `.nav-cta-mobile`

- Height 76px; sticky; z-index 80 (unchanged).
- Background `rgb(255 255 255 / .88)`; `backdrop-filter: blur(16px) saturate(140%)`; transparent 1px border until scroll.
- `.header.scrolled`: height 64px, background `.96`, `border-bottom:1px solid var(--line)`, `box-shadow:var(--shadow-sm)`.
- Logo: 36px mark, radius 12px, solid `#812DF2`, soft action shadow; wordmark 20px Clash 600, `-0.02em`, ink.
- Nav links 15px Poppins 500 `#4A4A63`, gap 32px, 44px hit height.
- Active/hover underline: 2px, bottom −6px, `--grad-action`, radius 2, `scaleX` 0→1.
- CTA pill 44px, 15px 600.
- `.scroll-progress`: 2px (from 3px), `--grad-action`, no glow.

### 4.2 Hero — `.hero`, `.hero-grid`, `.hero-text`, `.hero-visual`

**Composition**
- Background `--grad-hero`; remove solid decorative circles in favor of diffuse radials. No `filter: blur()`.
- Grid: 12 cols, text ≈52% (cols 1–6), visual ≈48% (cols 7–12), gap 64px, `align-items:center`, min-height 620px.
- Padding: 72px top, 96px bottom. Keep `isolation:isolate` and `overflow:hidden`.
- Text max-width 620px; visual max-width 560px, justify-self:end.

**Type**
- `.hero-badge`: white 70% + 1px `#E2CCFF`, radius pill, 12px 600 uppercase `.08em`, `#6A1FD0`, dot `#0B7A55` 8px with a 2.4s soft ping. Padding 10×16.
- `h1`: 84px max, 0.94 LH, `-0.04em`, ink. `max-width:13ch` desktop. `.highlight` uses `--grad-text`; `margin-left:.12em` retained for Clash spacing.
- `.hero-description`: 20px/1.6, `#4A4A63`, max 46ch, margin 24px 0 0.
- `.hero-actions`: 12px gap, margin-top 32px. Primary 56px, secondary outline 56px.
- `.hero-micro`: 13px `#66667E`, margin-top 12px.
- `.hero-alt`: 14px; underline 3px offset; arrow inherits; hover `#A21BE0`.
- `.hero-trust`: margin-top 40px, padding-top 24px, **solid** `1px solid #F0EBF8` top border (no dashed). `.trust-text` 12px 600 uppercase tracking `.08em` `#66667E`. `.badge` pills on `#FFFFFF`, border `#EDE8F6`, 13px, shadow-xs.

**Visual**
- `.hero-visual::before`: lilac stage — `inset:8% -6% -8% 6%`, radius 40px, `linear-gradient(160deg,#F8F1FF,#EFE1FF)`, 1px `#E2CCFF`, `rotate(-3deg)`, z-index −2.
- `.hero-visual::after`: magenta radial 62% at top-right, opacity ≤ .22, no blur.
- `.demo-window`: white, radius 28px, border `#EDE8F6`, `--shadow-xl`, `perspective(1600px) rotateY(-3deg) rotateX(1deg)`. Hover: reset rotation, `translateY(-6px)`, shadow stays. Disable transform ≤1024 and in reduced motion.
- Window header: 56px, white, 1px bottom hairline; controls 10px neutral `#D9D2E6`, first `#812DF2`; title 12px `#66667E`; "Ejemplo" badge 11px lilac.
- `.chat-demo`: `#FCFBFF`, min-height 360px, padding 20px, gap 12px.
- `.message`: max-width 82%.
- Bot bubble: white, 1px `#EDE8F6`, radius `18px 18px 18px 6px`, 15px/1.5 ink, `--shadow-xs`.
- User bubble: `linear-gradient(135deg,#812DF2,#A21BE0)`, white, radius `18px 18px 6px 18px`, `--shadow-action` at 50%.
- Avatar: 32px, `#F3E8FF`, 1px `#E2CCFF`, `#812DF2`.
- Input area: 1px top hairline; `.fake-input` `#F6F3FB`, pill, 14px `#8E88A6`; `.fake-send` 44px, `--grad-action`, `--shadow-action`.

### 4.3 Sector strip — `.logos`, `.logos-row`

- Full-bleed `#FAF8FF`, 20px block padding, 1px `#F0EBF8` top and bottom.
- 12px 600 uppercase, tracking `.18em`, `#66667E`, centered, gap 20px 36px.
- Separator `·` (`span[aria-hidden]`) 4px visual weight: `#FA23C3` at 55% opacity, 14px.
- Container max 1000px; edge mask 6% for overflow safety.
- Mobile: horizontal scroll, `scroll-snap-type:x proximity`, no scrollbar, mask-right; items `flex:0 0 auto`.

### 4.4 Features — `.features`, `.features-grid`, `.feature-card`, `.feature-icon`

- Section canvas `#FAF8FF`, padding same as all sections.
- Grid 3 cols, gap 20px, `grid-auto-rows:minmax(220px, auto)`.
- Card: white, 1px `#EDE8F6`, radius 24px, padding 32px, `--shadow-xs`; hover `translateY(-4px)`, border `#E2CCFF`, `--shadow-md` (220ms).
- Titles 20px Clash 600; body 15px/1.65 `#4A4A63`; icon → h3 20px; h3 → p 8px.

**Bento mapping (order is fixed by DOM)**

| Card | Class/structure | Treatment |
|---|---|---|
| 1 Chat IA Natural | `.feature-card:nth-child(1)` | Flagship: spans 2 cols × 2 rows, radius 32px, padding 40px, `--grad-surface`, border `#E2CCFF`, inner top highlight. Icon 64px. h3 28px. `::after` becomes a 64px × 3px gradient rule aligned to the bottom. |
| 2 WhatsApp y widget web | `:nth-child(2)` | White; icon tile `#E8F0FF` / `#1F5AE0` |
| 3 Google Calendar | `:nth-child(3)` | White; icon tile `#F3E8FF` / `#812DF2` |
| 4 Recordatorios | `:nth-child(4)` | White; icon tile `#FFE9F8` / `#A21BE0` |
| 5 Multi-zona | `:nth-child(5)` | White; icon tile `#FFF1EA` / `#B7410E` |
| 6 WebMCP | `:nth-child(6)` | White; icon tile `#E7F7F0` / `#0B7A55` |

- `.feature-icon`: 52px, radius 16px, 1.5px stroke icons at 24px. Hover `translateY(-2px) scale(1.04)`.
- Replace existing nth-child overrides at styles.css ~L472–474 with this mapping.
- Mobile: single column; flagship 32px padding, 24px icon, 24px h3.

### 4.5 How it works — `.how`, `.steps`, `.step`, `.step-num`

- White canvas; optional 1px `#F0EBF8` top border. No card grid: this section should breathe differently from features.
- `.steps`: 3 cols, gap 40px, `align-items:start`.
- `.step`: `padding:32px 0 0`, `border-top:1px solid #EDE8F6`, background transparent, radius 0, no shadow. Hover: border-color `#E2CCFF`, no lift (keeps it editorial).
- `.step-num`: **ghost numeral**, Clash 600, `clamp(3.5rem, 6vw, 5rem)`, line-height .8, color `#E2CCFF`, margin-bottom 20px. Not a circle. `aria-hidden` already.
- `.step h3`: 24px; body 15px/1.65, max 34ch.
- Remove the `::after` connector (set `display:none`); use a 48px×2px gradient rule under the numeral instead.
- Mobile: stack, gap 32px, numerals 56px; hairline top per step retained.

### 4.6 Demo + agenda — `.demo`, `.demo-container`, `.live-chat-card`, `.agenda-widget`, `.demo-stats`

- Background `--grad-demo`; add a 1px dot grid (`radial-gradient(#812DF2 0.8px, transparent 0.8px)` at 24px / 4% opacity) masked to the top 60%. No blur.
- `.demo-container`: grid `1.1fr .9fr`, gap 24px.
- `.live-chat-card`: full width, white, radius 32px, padding 40–48px, border `#EDE8F6`, `--shadow-lg`, grid `1fr 340px`, gap 48px.
- `.live-chat-tag`: pill, lilac, 12px 600 uppercase.
- `.live-chat-copy h3`: 30px; copy 16px/1.65, max 44ch.
- `.live-chat-points li`: 15px; 22px mint circle with 12px check; gap 12px.
- `.live-chat-note`: `#FFF4D6`, 1px `#F2D79B`, radius 12px, 13px `#7A4A00` — keep but reduce visual weight (padding 12×14).
- `.live-chat-cta`: `--grad-surface`, radius 24px, border `#E2CCFF`, padding 28px, `--inset-top`; `.chat-mode` white pill 12px; button full width 54px; hint 13px `#66667E`.
- `.agenda-widget`: white, radius 28px, border `#EDE8F6`, `--shadow-xl`; `margin-top:24px` on desktop for asymmetry.
- `.agenda-header`: `#FBFAFF`, 1px bottom hairline, padding 16px 20px.
- `.agenda-nav-btn`: 44px, `#F6F3FB`, border `#EDE8F6`, radius 12px; hover lilac + purple icon.
- `.agenda-title`: Clash 600, 18px.
- `.agenda-view-toggle`: track `#F3EEFA`, radius pill, 4px padding. `.agenda-view-btn`: min-height 44px, 13px 600; active `#812DF2` white with `--shadow-action` at 50%; hover ink.
- `.agenda-day-headers`: 11px 600 uppercase `.08em`, `#8E88A6`.
- `.agenda-day`: 44px, radius 12px, 15px 500 ink; hover lilac; `.today` purple filled white; `.has-slots::before` 6px magenta dot; `.selected` lilac fill + 2px inset purple ring; `.past` opacity .48, cursor not-allowed.
- `.agenda-slots`: overlay radius 28px, white, padding 24px; slide-in from 16px; `.agenda-slot` 48px, `#FAF8FF`, radius 12px, border `#EDE8F6`, hover lilac; selected lilac + purple border; status pills 12px 600.
- `.agenda-legend`: `#FAF8FF`, 1px top hairline, 12px `#66667E`; swatches 10px radius 3px.
- `.demo-stats`: 2×2, gap 16px. `.stat`: white, radius 20px, border `#EDE8F6`, padding 24px 20px, shadow-xs. `.stat-value` 52px `#812DF2`, tabular. `.stat-label` 13px `#66667E`. Hover −3px.
- Mobile: demo 1 col; stats 2 cols at ≤768 then 2 cols retained ≤560 (not 1) to keep the band compact; agenda header stacked; stats min-height 104.

### 4.7 Use cases — `.testimonials`, `.testimonials-grid`, `.use-case-card`

- White canvas. Header left-aligned.
- 3 cols, gap 20px, `align-items:start`.
- Card 1 `#F5EEFF` / border `#E2CCFF`; card 2 white / `#EDE8F6`; card 3 `#FFF1EA` / `#FFD9C9`.
- Radius 24px, padding 32px, min-height 260px, `--shadow-xs`.
- Icon tile 52px white with colored icon + shadow-xs (card 1 purple, card 2 ink, card 3 `#B7410E`).
- h3 20px; body 15px/1.65 `#4A4A63`; gap 16px.
- Stagger: card 2 `margin-top:32px`, card 3 `margin-top:12px` (≥1025 only).
- Hover: `translateY(-4px)` + `--shadow-md`; border stays colored.
- Mobile: stack, offsets removed, icon left of text (existing grid pattern at ≤1024 retained).

### 4.8 Pricing — `.pricing`, `.pricing-grid`, `.pricing-card`, `.popular`

- Canvas `#FAF8FF` with a soft radial (`40% × 50% at 50% 0%`, `rgba(239,225,255,.55)`) behind the recommended card.
- Grid 2 cols, max 1000px, gap 24px, stretch.
- Standard card: white, 1px `#EDE8F6`, radius 28px, padding 40px, shadow-sm.
- h3 20px; `.price` margin 20px 0 12px; `.amount` 64px ink; `.currency` 20px `#66667E`; `.period` 15px `#66667E`.
- `.pricing-desc` 14.5px/1.6 `#4A4A63`, margin-bottom 24px.
- `.pricing-features`: 14.5px, gap 12px; check icon 18px in a 22px `#E7F7F0` circle, `#0B7A55`.
- CTA 52px; notes 13px `#66667E`.
- **Popular card:** `--grad-action-v` (`#812DF2→#6A1FD0`), radius 28px, white text, `translateY(-12px) scale(1.02)`, `--shadow-xl`, 1px `rgba(255,255,255,.16)` inner border, magenta radial 18% top-right. All secondary copy `#EFE1FF` (≥4.7:1); feature checks `#FFFFFF` with `rgba(255,255,255,.18)` circles.
- `.popular-badge`: **white pill, `#6A1FD0` text**, 12px 600, radius pill, shadow-md, top −14px; remove the gradient badge.
- Popular CTA override: white background, `#6A1FD0` label, hover `#F5EEFF`; never a purple gradient on a purple card.
- Mobile: 1 col max 520px; popular offset removed; badge stays centered at −12px.
- `.pricing-note`: 13px/1.65 `#66667E`, max 66ch, centered (allowed: fine print).

### 4.9 FAQ — `.faq`, `.faq-grid`, `.faq-item`

- White canvas. `.container-narrow` 820px. Header left-aligned.
- `.faq-grid`: flex column, gap 12px, **no shared card shell**, background transparent, no border, no outer shadow.
- `.faq-item`: white, 1px `#EDE8F6`, radius 20px, shadow-xs, overflow hidden.
- `summary`: min-height 64px, padding 20px 24px, 16px 600 ink, gap 16px.
- Plus/minus: 32px circle, `#F3E8FF`, purple glyph 16px; open = filled `#812DF2`, white glyph.
- Open state: border `#E2CCFF`, shadow-md, background `#FCFAFF`; remove the inset 3px purple bar.
- Answer: padding 0 24px 22px, 15px/1.7 `#4A4A63`, max 68ch; 180ms fade + 4px rise.
- Hover: border `#E2CCFF`, background `#FCFAFF`.
- Mobile: summary 17px, padding 18px; answer 15px.

### 4.10 CTA — `.cta`, `.cta-card`, `.cta-buttons`, `.cta-note`

- Section white, padding 96px top / 112px bottom.
- `.cta-card`: `--grad-cta`, radius 40px, padding 64–80px, border 1px `rgba(255,255,255,.12)`, shadow-xl, `overflow:hidden`, `isolation:isolate`. Layout 7/5: copy left, actions right, bottom-aligned.
- h2 white 48px max, max 16ch; p `#FFFFFF` 18px/1.65, max 42ch (solid white keeps ≥5.0:1 even over the magenta glow).
- `.cta-buttons`: vertical stack on the right, width 100%, max 320px, gap 12px; `.btn-white` + `.btn-outline-white` both 54px. Mobile: full-width stack under the copy.
- `.cta-note`: 13px `#FFFFFF`, margin-top 20px.
- Decorative: one magenta radial top-right, one white radial bottom-left; no grid pattern, no illustration.

### 4.11 Contact — `.contact`, `.contact-card`

- White canvas, 820px narrow; header left-aligned.
- `.contact-card`: `linear-gradient(160deg,#FFFFFF,#F7F0FF)`, radius 32px, padding 48px, border `#E2CCFF`, shadow-sm; **left-aligned**, not centered, max 720px, margin 0 (not auto).
- h3 28px; body 16px/1.7 max 52ch `#4A4A63`; button 54px margin-top 8px; note 13px `#66667E` margin-top 20px.
- Optional decorative 120px radial magenta at 8% top-right.
- Mobile: padding 32px 24px; full-width button.

### 4.12 Footer — `.footer`, `.footer-grid`, `.footer-brand`, `.footer-column`, `.footer-bottom`

- `--grad-dark`, top 2px `--grad-action` rule, padding 72px top / 24px bottom.
- Add one radial `rgba(129,45,242,.18)` 520px at bottom-right, no blur.
- `.footer-grid`: 2fr 1fr 1fr, gap 48px; brand max 24rem.
- Wordmark watermark: "AgendaAI" 112px Clash, `rgba(255,255,255,.04)`, right/bottom, `white-space:nowrap`. Keep; increase size and lower opacity.
- Logo white; mark `#812DF2`; footer body `#B9B9CE` 14.5px/1.7.
- `.footer-title`: 12px 600 uppercase `.14em` `#8E8EAA`.
- Links 14.5px `#B9B9CE`, 36px rows; hover white + 2px translate, no underline.
- Social 40px, radius 12px, `rgba(255,255,255,.06)` + 1px `rgba(255,255,255,.12)`; hover purple 18% fill.
- `.footer-bottom`: 1px `rgba(255,255,255,.10)`, 13px `#8E8EAA`, top 24px.
- Mobile: 1 col, watermark hidden, bottom stacked.

### 4.13 Floating widget — `#appointment-widget`

- Update the existing override block at the end of `styles.css` (do not touch `widget.css`):

```css
#appointment-widget{
  --appt-primary:#812DF2;
  --appt-primary-hover:#6A1FD0;
  --appt-primary-light:#EFE1FF;
  --appt-background:#FFFFFF;
  --appt-surface:#FBFAFF;
  --appt-border:#E9E5F0;
  --appt-text-primary:#1D1D3D;
  --appt-text-secondary:#4A4A63;
  --appt-text-muted:#66667E;
  --appt-user-message:#812DF2;
  --appt-assistant-message:#F5EEFF;
  --appt-assistant-text:#1D1D3D;
  --appt-radius:24px;
  --appt-radius-sm:12px;
  --appt-shadow:0 32px 64px -28px rgb(19 19 43 / .30);
}
```

- Keep `all:initial` and `position:fixed` behaviour untouched. `#appointment-widget` must remain outside `<main>` (it already is) so ancestor transforms never capture it.
- Float button: 60px desktop / 56px mobile, `--grad-action`, white glyph, ring shadow `0 14px 28px -12px rgb(129 45 242 / .5)`, hover `scale(1.05)` (override widget.css's 1.1), active `.97`.
- Open panel: 380px wide, radius 24px, 1px `#E9E5F0`, `--shadow-xl`; header `--grad-action`; assistant bubble `#F5EEFF`; input radius pill; focus = 2px `#812DF2` ring + 3px `#EFE1FF` halo.
- Mobile ≤480: bottom sheet radius 24px 24px 0 0, max-height 78dvh; button 16px from edges.
- Verify no CSS here leaks into `.appt-widget__*` names outside the container scope.

---

## 5. Component specs

### 5.1 Buttons — `.btn`, `.btn-primary`, `.btn-outline`, `.btn-white`, `.btn-outline-white`

| Variant | Surface | Text | Border | Hover |
|---|---|---|---|---|
| Primary | `--grad-action` | `#FFFFFF` | none | lift −2px, `--shadow-action-hover`, overlay lightens |
| Secondary (`.btn-outline`) | `#FFFFFF` | `#1D1D3D` | 1.5px `#8E88A6` | `#F7F0FF` bg, `#812DF2` border/text, lift −2px |
| Ghost (optional, not currently in markup) | transparent | `#6A1FD0` | none | `#F5EEFF` bg |
| White (`.btn-white`) | `#FFFFFF` | `#6A1FD0` | none | `#F5EEFF` bg, lift −2px |
| Outline white | `rgba(255,255,255,.08)` | `#FFFFFF` | 1.5px `rgba(255,255,255,.9)` | `rgba(255,255,255,.16)` bg, white border |

- Radius pill; font Poppins 600; sizes: sm 44/18, md 48/24, lg 54/28 (padding-x).
- Transition 200ms: transform, box-shadow, background-color, border-color, color.
- Hover gradient: use `::after` overlay (`background:#fff; opacity:.08`) instead of `background-position`, so only opacity animates.
- Active: `translateY(0) scale(.985)`.
- Focus: 3px `#812DF2` outline, 3px offset; on purple/dark, white outline. Never `outline:none` without a replacement.
- Disabled/loading: opacity .6, pointer-events none, cursor not-allowed; spinner unchanged.
- Buttons never narrower than 44px in either axis; on mobile, primary actions full width.

### 5.2 Badges / chips — `.badge`, `.hero-badge`, `.live-chat-tag`, `.chat-mode`, `.popular-badge`

- Shape: pill; height 28–32px; padding 6–8px × 12–14px; 12px 600.
- Default: white, 1px `#EDE8F6`, `#4A4A63`, shadow-xs.
- Brand: `#F5EEFF`, 1px `#E2CCFF`, `#6A1FD0`.
- Live: `#E7F7F0`, 1px `#A7E8CD`, `#0B7A55` + ping dot.
- Warning: `#FFF4D6`, `#7A4A00`.
- Popular (on purple): white bg, `#6A1FD0` text.
- Never use magenta text on a badge; use the magenta dot instead.

### 5.3 Pricing card

- Structure: header (h3, price, desc) → features → CTA + note.
- Equal heights via flex + `margin-top:auto` on `.pricing-cta-form` (already present).
- Standard: white, radius 28, padding 40, 1px hairline.
- Recommended: purple gradient, white, lift −12px, scale 1.02, shadow-xl, white pill badge.
- Price typography: currency 20px aligned to top third of the amount; period 15px baseline; `font-variant-numeric: tabular-nums`.
- Feature checks: 22px circle + 18px stroke check; 12px gap; no bullet characters.
- On hover, do not move the recommended card further; only standard card lifts −4px.

### 5.4 FAQ accordion

- Native `<details>/<summary>` preserved.
- 64px min row; 16px 600; +/- icon 32px; card radius 20px; 12px stack gap.
- Open: lilac-tinted background, lilac border, filled purple icon, no inset bar.
- Answer constrained to 68ch; paragraphs only.
- Focus: `outline-offset:-4px` (current) is acceptable but ensure the ring is 3px purple and visible against white.
- No custom JS; `details` handles state, animation is CSS-only.

### 5.5 Chat mockup (hero)

- Window chrome: 56px white header with 1px hairline; 3 × 10px dots (purple, neutral, neutral); 12px title; 11px "Ejemplo" chip.
- Body `#FCFBFF`, 20px padding, 12px gap, min-height 360px.
- Bot: white bubble + hairline + shadow-xs; 15px/1.5 ink; avatar 32px.
- User: purple gradient, white, right-aligned, 82% max width.
- Input: 56px tall area, pill fake input `#F6F3FB`, 44px send button.
- Desktop tilt ≤3°; reset on hover; no tilt on touch/mobile.
- All content remains inside `role="img"` with the existing aria-label.

### 5.6 Calendar

- Header: month title Clash 600 18px, centered between 44px prev/next; segmented control right.
- Grid: 7 equal columns, 4px gap, day cells 44px, 15px 500.
- States: available (transparent), today (purple filled), selected (lilac + 2px purple ring), booked (not a day state; handled in slots), past (opacity .48 + disabled), has-slots (6px magenta dot top-right).
- Slots overlay: white, radius 28, 24px padding, header 20px Clash, close 44px circle, list 48px rows, status pill 12px 600.
- Ensure `hidden`/`aria-selected`/`tabindex` behaviour untouched.
- Do not rely on color alone: booked/selected slots carry text labels already; keep them.

### 5.7 Footer

- 3-column grid, brand 2fr; 72px top padding; 48px gaps.
- Dark gradient, 2px brand rule, subtle purple radial.
- Watermark wordmark; link rows 36px; 40px social tiles.
- Focus rings white on dark.

### 5.8 Mobile navigation

- `≤920px`: `.nav-links` becomes a fixed sheet under the header, white, radius 0 0 24px 24px, 1px bottom `#EDE8F6`, shadow-lg, padding 16px 20px 24px.
- Links 16px 500, 52px rows, 1px separators `#F3EEFA`, radius 12px hover lilac.
- CTA inside menu: full width, 52px, `--grad-action`.
- Open animation: opacity 0→1 + translateY(−8px)→0, 180ms ease-out. `display:none → flex` stays, so animate only on `.open`.
- Keep `#nav-menu`, `.open`, `aria-expanded`, Escape handling.
- Header bar at ≤920: logo + compact CTA + 44px toggle; gap 8px. Below 380px, compact CTA label stays visible (do not hide conversion).
- No focus trap (would require JS); ensure focus order follows DOM and the sheet closes on link click (already handled).

---

## 6. Motion spec

**Principles:** motion confirms hierarchy, never decorates for its own sake. Only `transform` and `opacity` animate. Durations 150–800ms. No looping motion except the optional marquee and the live dot.

### 6.1 Tokens

```css
--ease-out: cubic-bezier(.22,.61,.36,1);
--ease-in-out: cubic-bezier(.4,0,.2,1);
--ease-spring: cubic-bezier(.34,1.4,.64,1);
--dur-fast: 150ms;
--dur-base: 220ms;
--dur-slow: 520ms;
--dur-hero: 800ms;
```

### 6.2 Entrance (hero)

| Element | From | To | Duration | Delay |
|---|---|---|---|---|
| `.hero-text > *` | opacity 0, y 20px | 1, 0 | 620ms | 60ms stagger, max 360ms |
| `.hero-visual` | opacity 0, scale .985, y 12px | 1, 1, 0 | 800ms | 120ms |
| `.header` | none | static | — | — |

No entrance animation on the nav or on above-the-fold CTAs beyond the text stagger.

### 6.3 Scroll reveal (existing JS)

- `.reveal`: opacity 0 → 1, `translateY(18px)` → 0, 520ms `--ease-out`, delay from `--reveal-delay` (70ms × index, capped 350ms).
- `.reveal-scale` optional for the pricing and demo cards: `translateY(14px) scale(.99)` → none.
- Trigger threshold .12, rootMargin −8% (current). Do not add new observers.
- Content must be visible if JS fails: keep the current fallback and reduced-motion override.

### 6.4 Hover / press

| Element | Change | Duration |
|---|---|---|
| Cards (`.feature-card`, `.stat`, `.testimonial-card`, `.pricing-card`) | `translateY(-4px)`, shadow xs/sm → md | 220ms |
| `.btn` | `translateY(-2px)`, shadow deepen | 200ms |
| `.feature-icon` | `translateY(-2px) scale(1.04)` | 260ms spring |
| Nav underline | `scaleX(0→1)`, origin left | 240ms |
| `.agenda-day` | background only | 150ms |
| `.faq-item` | border-color, background | 180ms |
| Footer links | `translateX(2px)` | 180ms |
| Press | `scale(.985)` | 120ms |

Wrap all hover lifts in `@media (hover:hover) and (pointer:fine)` (already the pattern).

### 6.5 Chat & accordion

- `.chat-demo .message`: opacity 0, y 10 → 1, 0; 420ms; 150ms stagger (existing `.play` orchestration).
- `.agenda-slots`: opacity 0, x 16 → 1, 0; 280ms ease-out.
- FAQ answer: opacity 0, y 4 → 1, 0; 180ms; no height animation (native `details`).
- Counters: 900ms cubic ease-out, `font-variant-numeric: tabular-nums`, min-width reserved.

### 6.6 Marquee (optional, HTML addition required)

The existing markup has a single set of sector words. A true seamless marquee needs a duplicate set. If approved:

```html
<div class="logos-row">
  <!-- original 5 items + separators (stays accessible) -->
</div>
<div class="logos-row logos-row--ghost" aria-hidden="true" tabindex="-1">
  <!-- exact duplicate, hidden from AT -->
</div>
```

- Track: flex, `gap:48px`, `width:max-content`, animation `translateX(0 → -50%)` 28s linear infinite.
- Pause on hover **and** focus-within.
- Mask 80px on both edges.
- Static fallback: if duplication is rejected (recommended for scope and a11y), keep the centered strip and the mobile scroll-snap version; **no fake marquee**.
- Disabled entirely under `prefers-reduced-motion`.

### 6.7 Reduced motion

```css
@media (prefers-reduced-motion: reduce){
  *,*::before,*::after{animation:none!important;transition:none!important;}
  .reveal{opacity:1!important;transform:none!important;}
  .chat-demo .message{opacity:1!important;transform:none!important;}
  .demo-window,.hero-visual:hover .demo-window{transform:none!important;}
  .logos-row{animation:none!important;}
  html{scroll-behavior:auto;}
}
```

- Hover states must retain a non-motion signal (color/border/shadow).
- Counters do not run (JS early-return already).
- No parallax, no autoplay video, no scroll-jacking anywhere.

---

## 7. Responsive breakpoints

| Breakpoint | What reflows |
|---|---|
| **≥1280px** | Full 12-col; container 1200; hero 52/48; h1 up to 84px; bento 3 cols with 2×2 flagship; pricing 2 cols with −12px recommended offset. |
| **1025–1279px** | Container 1200 with 32px gutters; hero gap 48; h1 64–72; features 3 cols but tighter padding (28px); demo 1.08/0.92. |
| **≤1024px** | Hero stacks (text first, visual max 620 centered, no tilt); features 2 cols, flagship spans 2 but drops the second row; steps stack 1 col; demo 1 col, agenda then stats (4 cols); pricing 1 col max 560, recommended offset removed; use-case offsets removed; footer 2 cols with brand full width. |
| **≤920px** | Desktop nav → sheet; `.nav-toggle` visible; `.nav-cta-mobile` visible; header height 64; sheet top offset tracks scrolled header (64). |
| **≤768px** | Section padding 72; h2 32–40; one-column everywhere; stats 2 cols; live-chat-card 1 col (copy then CTA); CTA card 1 col; FAQ/contact full width; footer 1 col; agenda header stacked; buttons full width in hero/CTA/contact. |
| **≤560px** | H1 44px; body 16; hero badge 11px; chat padding 16, bubbles 14px; stat value 40px; pricing padding 24; CTA padding 40 24; section padding 64. |
| **≤420px** | Gutter 20; agenda header stacks nav/toggle; calendar cells 40px wide (44px tall) at ≤360px; calendar gap 2px; footer social 44px. |

**Overflow rules:** all grids use `minmax(0,1fr)`; no fixed widths above 100%; chat, agenda, pricing never exceed viewport; long Spanish words wrap (`overflow-wrap:anywhere` only on headings if needed).

---

## 8. Accessibility & performance guardrails

### 8.1 Contrast (computed, WCAG 2.2)

| Pair | Ratio | Verdict |
|---|---|---|
| `#1D1D3D` / `#FFFFFF` | 16.21 | AAA |
| `#4A4A63` / `#FFFFFF` | 8.57 | AAA |
| `#66667E` / `#FFFFFF` | 5.58 | AA |
| `#812DF2` / `#FFFFFF` | 5.85 | AA (text and UI) |
| `#6A1FD0` / `#FFFFFF` | 7.72 | AAA |
| `#FFFFFF` / `#812DF2` | 5.85 | AA |
| `#FFFFFF` / `#A21BE0` | 5.57 | AA |
| `#FFFFFF` / `#C2148F` | 5.54 | AA |
| `#FFFFFF` / `#6A1FD0` | 7.72 | AAA |
| `#EFE1FF` / `#812DF2` | 4.70 | AA (minimum) |
| `#FA23C3` / `#FFFFFF` | **3.45** | Large text only / decorative |
| `#C2148F` / `#FFFFFF` | 5.54 | AA |
| `#8E88A6` / `#FFFFFF` | 3.37 | UI boundary only (1.4.11) |
| `#B9B9CE` / `#13132B` | 9.43 | AAA |
| `#8E8EAA` / `#13132B` | 5.71 | AA |
| `#B7410E` / `#FFF1EA` | 5.04 | AA |

**Rules**
- White text on `--grad-action` must be checked at every stop; do not add `#FA23C3` to any white-label gradient.
- Magenta only as non-text accent, or large display (≥24px/600) where 3:1 applies.
- `.highlight` only on h1/h2; fallback `#6A1FD0`; forced-colors fallback preserved.
- Never reduce text opacity to create hierarchy; use `--ink-body` / `--ink-muted`.

### 8.2 Focus

- Global: `outline: 3px solid #812DF2; outline-offset: 3px; border-radius: 8px`.
- On purple/dark: `outline-color:#FFFFFF`.
- On lilac surfaces: add a 2px white inner gap via `box-shadow: 0 0 0 2px #fff, 0 0 0 5px #812DF2` for buttons and calendar cells.
- Do not remove the existing `:focus-visible` rules; only retune color/width.
- Mobile nav: sheet links must show focus; Escape still closes (JS).
- Skip link: white text on ink, 12px radius, visible on focus.

### 8.3 Interaction & semantics

- Tap targets ≥44×44px: buttons, nav links, calendar days, slots, close, social, toggle. Single exception: calendar cells at ≤360px viewport are 40px wide (still above the WCAG 2.5.8 24px minimum).
- `summary` rows ≥56px and full-width clickable.
- Calendar states are not color-only: status text remains in slots; selected days have a ring; today has fill + dot.
- Preserve all `aria-label`, `role`, `aria-selected`, `aria-expanded`, `aria-live`, `tabindex` values.
- Don't add `aria-hidden` to anything focusable. Decorative duplicate strip must also be `tabindex="-1"`.
- Anchor scrolling: `scroll-padding-top: calc(var(--header-h) + 24px)` remains; update with header height.
- 200% text zoom: no horizontal scroll; grid tracks collapse; buttons wrap, not clip.
- `forced-colors: active`: borders become `CanvasText`; ensure `.highlight`, `.popular`, and gradient buttons keep visible text (the current fallback is a good base).
- `prefers-contrast: more`: raise functional borders to `#6F6A87`, disable soft-only state changes.

### 8.4 Performance / CLS

- **No new images or fonts.** Keep Poppins 400/500/600 + Clash 500/600 exactly.
- Total CSS growth target ≤ 15KB gzip. Prefer overriding existing rules over duplicating them.
- Reserve space:
  - `.demo-window` min-height 520px desktop / 480 mobile; `.chat-demo` min-height 360px.
  - `.agenda-widget` min-height 520px; `.stat` min-height 108px.
  - `.hero-visual` `aspect-ratio: 10 / 11` where possible.
  - `.amount`, `.stat-value` tabular + min-width.
- Fonts already use `media="print" onload` + `display=swap`; don't change to blocking.
- Animate only `transform`, `opacity`, `background-color`, `border-color`, `color`, `box-shadow` (prefer pseudo-element opacity for shadows on large cards).
- No `filter: blur()` on decorative blobs; use radial gradients.
- Backdrop filter only on the sticky header and mobile sheet; no glass cards.
- No scroll-jacking; no new scroll listeners; the existing rAF-throttled listener stays.
- Avoid `content-visibility:auto` on anchored sections (it can disturb find-in-page and anchor reveal); if used, set `contain-intrinsic-size`.
- Target: CLS < 0.05, LCP < 2.5s on 4G, no long tasks from paint-heavy gradients (max 3 radial layers per section).
- Verify the floating widget remains fixed and unaffected by hero transforms (it is outside `<main>`).

---

## 9. Top 10 visual moves (prioritized by impact ÷ effort)

1. **Kill the warm paper.** `#FFFFFF` canvas, `#FAF8FF` / `#F5EEFF` alternates, cool `#EDE8F6` hairlines, no cream/dashed anywhere. *Impact 10, effort 1.* Single biggest step-change.
2. **Switch the action color to `#812DF2` and rebuild the gradient.** `#812DF2 → #A21BE0 → #C2148F` for all white-label surfaces; remove orange from text gradients. *Impact 9, effort 1.*
3. **Left-align and enlarge the type.** 7/5 asymmetric `.section-header`, h1 up to 84px, h2 up to 56px, tracking −0.04em, 128px section rhythm. *Impact 10, effort 2.*
4. **Make the hero a product stage.** Lilac rotated panel behind a floating chat window, 52/48 grid, 28px radius, `--shadow-xl`, mesh background instead of blobs. *Impact 9, effort 3.*
5. **Turn the recommended plan purple.** Vivid gradient card, white pill badge, −12px lift, white CTA, 64px price. *Impact 9, effort 2.*
6. **Rebuild the FAQ as cards.** 12px stack gap, 20px radius, lilac open state, purple +/− disc, no inset bar. *Impact 8, effort 1.*
7. **Make the CTA a poster.** 40px radius purple panel, magenta radial, 7/5 split, white pill primary. *Impact 8, effort 2.*
8. **Give the bento a flagship + a color system.** 2×2 lilac gradient card, 64px icon, 28px title; five icon tiles in sky/lilac/pink/peach/mint. *Impact 8, effort 2.*
9. **Layer the demo.** Soft gradient stage + dot grid, floating agenda with offset, 2×2 stat band with 52px purple numerals. *Impact 8, effort 3.*
10. **Polish the edges.** 20–32px radii, layered purple-tinted shadows, 2px gradient scroll bar, cool footer watermark, button overlay hover instead of gradient sliding. *Impact 7, effort 2.*

**Deliberately rejected:** dark navy pricing card (fights the purple), marquee by default (needs duplication; low value), glassmorphism, animated gradient backgrounds, 3D tilt on every card, icon illustrations, new fonts, new copy, extra badges.

---

## 10. Implementation order & QA

1. Token block + body/typography + section scaffolding (no component edits yet).
2. Header, hero, buttons.
3. Features, how, demo/agenda, stats.
4. Use cases, pricing, FAQ.
5. CTA, contact, footer, widget variables.
6. Responsive passes at 1440 / 1280 / 1024 / 920 / 768 / 560 / 390 / 320.
7. Motion pass + reduced-motion pass.
8. A11y pass: contrast, focus, keyboard, 200% zoom, forced-colors.
9. Verify all JS hooks (§0.1) and the widget open/close, calendar navigation, slots, view tabs, counters, nav sheet, year, scroll progress.
10. Lighthouse: a11y ≥ 98, perf ≥ 90 mobile, CLS < 0.05; visual diff desktop + mobile.

**Visual acceptance:** at a glance the page should read white first, purple second, product third. If a section introduces a third background tone, a second shadow style, or a headline that is not left-aligned, it is off-spec.
