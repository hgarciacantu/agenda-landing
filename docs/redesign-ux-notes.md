# AgendaAI — Redesign UX & Conversion Notes

**Scope:** visual-only redesign (layout, type, color, spacing, components, motion).
**Hard constraints:** no copy changes, no semantic HTML changes, no DOM reorder, no JS logic changes in this pass.
**Reference direction:** white-dominant, single vivid purple `#812DF2`, large display type, pill CTAs, floating product UI, trust bands (agendapro-like legibility, not a clone).
**Primary conversion:** open the WhatsApp bot. **Secondary:** on-page demo. **Tertiary:** pricing / FAQ / contact.

Read with: `index.html`, `css/styles.css`, `css/widget.css`, `js/main.js`, `js/demo-chat.js`, `AUDIT-2026-10-17.md`.

---

## 0. Executive read (one paragraph)

The page's **structure and copy are already conversion-literate** — honest claims, no fake metrics, a real multi-turn demo, risk-reversal microcopy, transparent pricing. What is failing is **visual authority**: five competing accent colors, gradient CTAs everywhere, a hero with four asks, a fake chat widget that looks interactive but isn't, and a demo that is visually buried and ends in a dead end (slot selection books nothing). The redesign does not need new content. It needs **one accent, one loud thing per viewport, and an honest product visual**. That alone is worth more than any new section.

> ⚠️ **Blocker outside visual scope:** all 9 WhatsApp links (8 CTAs + footer social icon) point to `https://wa.me/521XXXXXXXXXX` (placeholder). Primary conversion is literally unreachable. No redesign can compensate. See §1.2 D1.

---

## 1. Conversion diagnosis of the current page

### 1.1 What already helps (do not "fix" these)

| Asset | Why it works | Selector |
|---|---|---|
| Specific outcome in H1 area | "consulta los huecos, propone horarios, confirma… sin llamadas" — concrete mechanism, not adjectives | `.hero-description` |
| Risk reversal under the CTA | "te confirma plan y precio antes de cualquier pago · No hay que instalar nada" | `.hero-micro` |
| Honest demo labelling | Window header says "Conversación de ejemplo · Ejemplo" | `.window-header .badge` |
| Real demo, no signup | 4 stat facts (`24/7`, `3`, `2`, `0`) are verifiable, not promise-metrics | `.demo-stats` |
| Objection handling at decision point | FAQ sits right after pricing; first item open by default | `.faq-item[open]` |
| Price transparency + no-contract note | "Sin contrato forzoso", "más IVA", annual note | `.pricing-note` |
| No forms, no cookies banner | Zero lead-capture friction | — |
| Solid a11y baseline | skip link, `details/summary`, `role=grid`, reduced-motion block, verified 0 axe violations | — |

### 1.2 Conversion leaks, ranked by cost

| # | Leak | Evidence in the page | Cost |
|---|---|---|---|
| D1 | **Primary CTA is a placeholder** | 9× `wa.me/521XXXXXXXXXX` (nav, nav-mobile, hero, 2 pricing, final CTA, contact, footer link, footer social icon) | 100% of primary conversions |
| D2 | **No single accent owns the action** | `--violet #6E3AF0` + `--magenta #FA23C3` + `--coral #FF7A59` + `--success` + navy. CTA is a violet→magenta gradient; H1 highlight is violet→magenta→**orange** (`--grad-text`, `#D9480F`) | Users must re-learn "what is clickable" in every section |
| D3 | **Four asks in the first screen** | `nav-bot-mobile`, `hero-bot`, `#demo` ("Ver la demo"), `#how` ("Cómo funciona en 3 pasos ↓") | Choice paralysis at the exact moment of highest intent |
| D4 | **Primary and secondary are the same size** | Both `.btn-lg` = 54px min-height, same radius, same width on mobile (§`max-width:768px`) | Eye reads "two options", not "one action" |
| D5 | **False interactivity in the hero mockup** | `.fake-input` with blinking caret (`::after` `blink 1.1s`), `.fake-send` as a violet gradient circle, window chrome, `.hero-visual:hover` moves the whole window | People try to type; nothing happens; trust cost at the trust-building moment |
| D6 | **The real demo is buried and dead-ends** | Real chat is 2–3 screens down behind a second click (`#chat-open`); the on-page calendar lets you pick a slot and then **does nothing** — no booking, no handoff, no next step | Secondary conversion leaks; "looks broken" |
| D7 | **The widget auto-opens on scroll** | `watchCard()` opens the 380px panel at 30% visibility of `.live-chat-card` (desktop ≥900px) | Interrupts reading; covers `.demo-stats` / right column; feels like an ad |
| D8 | **Alarm-yellow boxes for neutral info** | `.live-chat-note`, `.chat-mode.is-mock` use `--warn-bg #FFF4D6` | "Something is wrong" signal inside the funnel |
| D9 | **Sector strip reads as fake client logos** | `.logos` = 5 uppercase words, `mask-image` fade, magenta dots, immediately after hero | Wasted first scroll; "who is this for?" answered decoratively |
| D10 | **Feature grid weight is inverted** | 2×2 bento on `Chat IA Natural` (already the hero's claim); `Google Calendar` and `Recordatorios` (the real differentiators) get 1×1; `WebMCP Ready` (developer jargon for a clinic owner) gets 1/6 of the grid | The grid sells the category, not the product |
| D11 | **Hover lift on non-clickable cards** | `.feature-card`, `.step`, `.stat`, `.testimonial-card`, `.pricing-card` all `translateY` + shadow on hover, none are links | Every section promises clickability it doesn't have |
| D12 | **Gradient text on 7 headings** | `.highlight` in every `h2` + H1; `margin-left:.12em` hack; 3 hues in one word | Legibility ↓, hierarchy flat (nothing is special if everything is) |
| D13 | **Dark-slab ending** | `pricing-card.popular` navy → `.cta-card` navy → `.footer` navy-deep, back to back | The final CTA has no contrast advantage over pricing |
| D14 | **Three identical asks in a row** | `.cta` → `.contact` (gradient card + primary button) → footer WhatsApp link | Fatigue, not reinforcement |
| D15 | **Demo promise vs. outcome gap** | Subtitle: "reserva una cita de prueba" — but the calendar cannot book | Expectation break at the exact proof moment |
| D16 | **Broken token** | `.live-chat-card{box-shadow:var(--shadow-2)}` — `--shadow-2` is never defined → the demo's hero card has **no elevation** | The most important card on the page looks unfinished |
| D17 | **Palette is not tokenized end-to-end** | Header bg hardcodes `rgb(251 250 247/.86)`; 6 hardcoded magenta/coral/blue `rgb()` in `::before` layers; widget brand lives in `styles.css` **and** `js/demo-chat.js` | Any recolor drifts out of sync (see §8.4) |

### 1.3 Above-the-fold reality (1440×900, computed from the CSS, verify in browser)

`.hero-text` is capped at `36rem`; H1 is `clamp(2.7rem,5.8vw,4.9rem)` → **78px** at 1440 with `text-wrap:balance` inside a ~532px column → **4 lines ≈ 308px**.

| Element | Approx. y (px) |
|---|---|
| Header | 0–72 |
| Badge | 176 |
| H1 (4 lines) | 218–526 |
| Description | 546–668 |
| **Primary CTA** | **696–750** ✅ visible |
| Microcopy | 764–785 |
| "Cómo funciona ↓" | 791–814 |
| Trust badges | 903–985 ❌ **below the fold** |
| Hero ends | ~1011 |

Fixes: cap display type so the H1 is **3 lines** (`clamp(2.5rem,4.6vw,4.05rem)`, i.e. ~66px at 1440) and widen `.hero-text` to `38–40rem`. Saves ~77px → CTA rises to ~y620 and the trust row enters the fold at 900px.

### 1.4 Mobile issues

- **Hero density at 390px:** badge + ~4-line H1 (43px) + 4–5 line description means the first CTA lands at ~y580. On a 667px-tall device only the first CTA fits; the second button and all trust signals are below the fold.
- **Duplicate purple:** `.nav-cta-mobile` ("Abrir bot", 44px) sits 60px above a 54px full-width hero CTA with the same destination — reads as a UI bug.
- **Header crowding at 320px:** logo (icon + wordmark) + CTA + 44px burger in 280px of content width. Tested as no-overflow, but visually compressed.
- **Calendar hit width:** 7 columns at 320px → ~32px wide day cells (`min-height:44px` only fixes height). Passes WCAG 2.2 AA (24×24) but misses the 44×44 guideline.
- **Demo CTA is late:** at ≤768px `.live-chat-card` becomes one column: tag → h3 → paragraph → 3 bullets → yellow note → **then** the button (~500px into the section).
- **Auto-open is disabled on mobile** (`max-width:900px`) — good — but the manual sheet is 70vh with no body-scroll lock (JS).
- **Recommended plan is second** in DOM; on mobile it stacks below the cheaper plan.
- **Footer links** are 32px tall (`min-height:32px`), below the 44px guideline.

---

## 2. Hero visual hierarchy (copy untouched)

### 2.1 Eye path 1‑2‑3

1. **H1, line 1** — `Automatiza tus Citas…` at 66px, `--ink #14122B`, `letter-spacing:-.035em`, `line-height:.98`. The `.highlight` span keeps its position but becomes **solid `#812DF2`**, not a 3-hue gradient. Within the H1, the color difference should be a *step*, not a *theme change*: ink for the subject, violet for the capability.
2. **Primary CTA** — the **only filled violet element in the viewport**: `.btn-primary.btn-lg`, 54px, radius 999px, `--sh-cta: 0 10px 24px -10px rgb(129 45 242/.45)`, white label, `font-weight:600`, 16px.
3. **Product mockup** — flat, top-aligned with the H1 (not vertically centered), ~55% of the H1's visual weight. Its job is *evidence*, not decoration: the conversation is legible, crisp, and obviously an example.

Reading order (unchanged DOM, restyled weights): badge → H1 → description → CTAs → microcopy → `#how` link → trust row.

### 2.2 Concrete hero treatment

| Element | Change | Why |
|---|---|---|
| `.hero-badge` | White bg, 1px `#E9E6F2`, violet text 12px/600, **sentence case** (`text-transform:none`), static dot (kill `ping-soft`) | It's a qualifier, not an alarm; the ping implies "someone is online" |
| `.hero-text` | `max-width:38rem` | 3-line H1 instead of 4 |
| H1 | `clamp(2.5rem, 4.6vw, 4.05rem)` | Frees 77px, brings trust row above the fold |
| `.hero-description` | 1.0625rem/1.6, `--ink-2`, `max-width:33rem` | Current 18px/1.7 is slightly loose for a lead |
| `.hero-actions` | `gap:12px`; primary first; secondary as **white pill + 1px `#D8D3E8` + ink text** (no violet border) | Two equal pills = two decisions |
| `.hero-micro` | 13px, `--ink-2` (AA), max 2 lines | Risk reversal must be readable, not fine print |
| `.hero-alt` | 13px, `--ink-2`, underline retained, no `↓` emphasis (keep the glyph — copy), 6px margin | Third action must read as tertiary |
| `.hero-trust` | Solid hairline `#E9E6F2` (drop `dashed`), 3 checks in one row, 13px | Dashed borders read "placeholder" in a premium page |
| `.hero-visual::before` | Delete the rotated gradient slab | It's a 2021 motif; adds paint cost and muddies the mockup edge |
| `.demo-window` | `transform:none` (no perspective/rotate), border `#E9E6F2`, `--sh-2` | **3D rotation blurs 14px text on Windows** — measurable quality loss on the one element meant to prove polish |
| `.hero-visual:hover .demo-window` | Remove the hover transform | Implies interactivity that doesn't exist |
| `.window-header` | White bg, 12px muted title, controls at 8px or hidden | Chrome shouldn't out-weigh the conversation |
| `.chat-demo` | `#F8F7FC` (violet-tinted, not warm), gap 10px | Cleaner separation from white cards |
| `.message.bot .message-content` | White + 1px `#E9E6F2`, ink text | Incoming messages read as neutral, outgoing as violet |
| `.message.user .message-content` | Solid `#812DF2`, white, no gradient, no magenta shadow | One product color |
| `.fake-input` | Kill the blinking caret; `#F3F1F8` bg, `--ink-2` text, no cursor | **Stop faking a live input** |
| `.fake-send` | Neutral `#F3F1F8` + violet glyph, no shadow, or hide the element | A second violet circle competes with the hero CTA |

> If you want the hero mockup to be *provably* a demo, the cheapest honest move is a visual connector from the mockup to `#demo` ("prueba esta misma conversación" is already in the copy below, not in the hero). Do **not** add text; instead give `.hero-visual` a 1px violet-tinted frame and let `.hero-alt` be the only path.

---

## 3. CTA hierarchy & placement rules

### 3.1 Three tiers, defined only by visual treatment

| Tier | Treatment | Where |
|---|---|---|
| **Commit (T1)** | Filled `#812DF2`, white 600, pill, 52–56px, `--sh-cta` | Hero primary · recommended plan · final CTA · desktop header |
| **Explore (T2)** | White pill, 1px `#D8D3E8`, ink text 600, no shadow, 52–56px | "Ver la demo" · non-recommended plan · "Probar la demo aquí" |
| **Reference (T3)** | Underlined text link, 13–14px, violet or ink-2, no pill | `#how` in hero · footer links · FAQ summaries are not CTAs |

### 3.2 Rules

1. **R1 — one T1 per viewport band.** No two filled violet pills within 240px vertically, except the sticky header vs. page content.
2. **R2 — T2 never uses violet as a fill or a full-strength border.** If it's outlined in violet at 1.5px it reads as a second primary.
3. **R3 — the label never decides the hierarchy; the surface does.** (Copy is frozen, so `Preguntar por el plan Fundador` vs `Hablar del plan Estándar` must be separated by fill only.)
4. **R4 — inverted (white-on-violet) is reserved** for the recommended badge and the final CTA button. Nothing else.
5. **R5 — every T1 has a reason-to-believe within 24px** (`hero-micro`, `plan-note`, `cta-note` — all already exist). Keep them at ≥12.5px and AA contrast.
6. **R6 — header CTA is wayfinding, not conversion.** Desktop: `btn-sm` filled, 40px, smaller shadow. **Mobile: ghost** (violet text, 1.5px `rgb(129 45 242/.28)` border, white bg) so the hero owns the only fill.
7. **R7 — no new CTA components in this pass** (no sticky bottom bar, no exit popup). The page already has 8; more would lower the value of each.

### 3.3 Resulting cadence

`hero T1` → features (proof) → how (proof) → `demo T2` → cases (proof) → `pricing T1` → FAQ (objections) → `final T1` → contact **T2 only** → footer.

Only three T1 commits on the whole page + the header. The final CTA is the largest button on the page (58px) and the only place where the *page background* turns violet.

---

## 4. Trust / proof strategy (existing content only)

No new claims, no numbers, no logos, no testimonials. Every proof asset below already exists in the DOM; the job is **placement weight**, and the DOM order is fixed.

| Proof asset | Funnel question | Current place | Recommended visual role |
|---|---|---|---|
| Badge "Bot por WhatsApp · Demo sin registro" | What is it? | Hero | Quiet qualifier pill (not the loudest small element) |
| 3 hero badges (3 mensajes / recordatorios / Calendar) | Can it do the thing? | Hero bottom | **One** trust row, 3 checks, hairline above |
| Sector strip (Clínicas…Talleres) | Is this for me? | Right after hero ✅ | A real band: white/tint, 1px rules, 14px labels, dot separators, no mask fade |
| Feature grid | What's inside? | #features | 2 cards promoted (Calendar, Recordatorios), WebMCP demoted |
| 3 steps | How hard is setup? | #how | Numbered rail, connectors visible at all widths |
| Demo | Does it actually work? | #demo | **The centerpiece**: 2-step visual flow (calendar → chat), neutral info chip |
| Stat band (24/7, 3, 2, 0) | Facts, not promises | Inside #demo, right column | Full-width band closing the demo, divider-separated, not 4 floating cards |
| 3 use cases | Does it fit my business? | #casos | 3 equal white cards; scenario headline first; no colored surfaces |
| Pricing notes | What's the catch? | #pricing | Visible, AA, separated by a hairline; keep the Fundador trade-off legible (honesty > squeeze) |
| FAQ (8) | Objections | After pricing ✅ | Flat rows, 16px/600 questions, one open |
| Contact note (data handling) | Is my data safe? | #contact | Footnote style, AA, not 12px gray |

**Placement principles**

- **Proof must sit next to the ask, not in a separate "trust section".** Hero micro ↔ hero CTA; plan note ↔ plan CTA; contact note ↔ contact CTA.
- **The sector strip is the only "for whom" signal above the features.** It should look like a sentence, not like client logos. Sentence-case, 14px, `--ink-2`, `·` as a 4px dot, generous 20px vertical padding, no fade mask.
- **The stat band is the demo's closing argument.** Let it span the full container width under the grid (`grid-column:1/-1`), 4 columns with 1px dividers, value 40px violet / label 13px ink-2. On ≤768px: 2×2 with dividers only horizontally.
- **No invented social proof.** Do not add stars, "N negocios", avatars, or "recomendado por". The audit removed exactly these; putting them back visually would be a regression.
- **The "Ejemplo" chip stays.** It is the page's honesty signal.

---

## 5. Section-by-section UX recommendations

Legend: **P** = pure CSS, **J** = needs JS (out of this pass, ticket it), **H** = needs an HTML edit (non-copy, avoid).

### 5.1 Header / nav (`.header`, `.nav`, `.nav-links`, `.nav-toggle`, `.nav-cta-mobile`)

| Issue | Recommendation | Kind |
|---|---|---|
| `backdrop-filter:blur(14px)` runs on every scroll frame | Opaque white header + 1px `#E9E6F2` + `--sh-1` when `.scrolled` | P |
| Header height animates 72→64px | Fix at 60px (desktop) / 56px (mobile); no height transition. It currently fights `scroll-padding-top` and jitters the open mobile menu by 8px at 769–920px | P |
| Active link = 2px gradient underline | 2px solid violet + `font-weight:600`; the gradient adds a third violet idiom | P |
| Mobile CTA duplicates the hero CTA | Ghost style (§3 R6) | P |
| Nav menu has no scrim; page behind still scrolls | Add `.nav-links` backdrop (scrim via `box-shadow: 0 0 0 100vmax rgb(20 18 43/.35)`) + scroll lock | P + J |
| `#how` and `#casos` never get `.is-active` | Expected (no nav link). Leave; don't add nav links (copy/DOM) | — |
| Logo `currentColor` violet square + white bars | Keep; it's the only place the brand mark is unmistakable. Drop the 8px violet glow | P |

### 5.2 Hero (`.hero`, `.hero-grid`, `.hero-text`, `.hero-visual`)

Covered in §2. Additional notes:

- **Reading-order risk:** if you flip columns or `order` children to put the mockup left, screen readers still read text first — that's fine — but on mobile the mockup would come before the CTA visually only if reordered, which would break the visual/logical match. **Do not reorder.**
- **Content-hiding risk:** `.hero{overflow:hidden}` is required for the glow layers. If you remove the glow layers (recommended), keep `overflow:hidden` only if you also keep a bleed element; otherwise `overflow:clip` is safer.
- The hero has **no image**, so LCP is the H1. Do not start the H1 at `opacity:0` (§8.3).

### 5.3 Sector strip (`.logos`, `.logos-row`)

- `mask-image` fades the first/last 6% and, on mobile, the right 12% — **it literally hides letters** of "Clínicas"/"Talleres". Remove the mask; use padding instead.
- On mobile the row becomes `overflow-x:auto` with **no keyboard access** to the overflow and no scroll affordance. Prefer `flex-wrap:wrap` and center (2 lines at 320px). If you keep the scroll, add `tabindex="0"` + a visible edge fade on the right only.
- Uppercase 0.74rem `--ink-3` on `--bg-alt` computes to **~4.45:1 → fails AA at 11.8px**. Use `--ink-2` and 14px, `letter-spacing:.02em`, no `text-transform`.
- Solve "does this look like fake client logos?" by removing logo semantics: no fade, no dots in magenta, no uppercase.

### 5.4 Features (`.features-grid`, `.feature-card`)

- **Keep the bento** (it's a good pattern) but make the 2×2 card a *capability* card, not a repetition of the hero: it already is "Chat IA Natural". Since copy is frozen, reduce its visual dominance instead: same white surface, 1px border, violet icon tile; let **size** carry the hierarchy, not a peach gradient.
- **Visual order vs DOM order:** the grid is `1:bento, 2:WhatsApp, 3:Calendar, 4:Recordatorios, 5:Multi-zona, 6:WebMCP`. Do **not** use `order`/`grid-area` to promote Calendar above WhatsApp: cards contain no focusables, so keyboard order is unaffected, but screen-reader order would diverge from the visual order and the "bento" reading path becomes unpredictable at 1024/768 breakpoints. Instead, demote WebMCP with weight: neutral icon tile (no color), smaller title, `--ink-2` body, 0.9 opacity on the card border.
- `nth-child(1)::after` decorative 54×4 gradient bar: replace with a 1px violet top rule or drop it.
- **Remove the hover lift** on `.feature-card` (§1.2 D11). Keep `border-color` change at most — and only if the card were clickable. It isn't.
- Grid gap 20px with 36px radii = "pillow" look. Use 24px radius + 16px gap for a crisper grid.

### 5.5 How it works (`.steps`, `.step`, `.step-num`)

- Connectors are `::after` 20px long in a 28px gap → they read as broken dashes. Either make them full-gap (28px) 1px `#E9E6F2` at `top:47px`, or drop them and let the numbered circles imply sequence.
- `.step` cards are `--bg` on a white section = muddy. Use white cards with 1px border on a tinted band, or drop card surfaces entirely and use a 3-column rail with a top hairline. The rail reads more "process", less "features again" — important because this section follows a 6-card grid.
- `.step-num` 42px gradient circle + action shadow = a third violet gradient idiom. Solid violet, no shadow, 40px, tabular numerals.
- Mobile: `.step` cards stack with 20px gap and no connectors — fine, but add the step number inline with the title (flex) to keep the sequence legible without scrolling back.

### 5.6 Demo (`.demo`, `.live-chat-card`, `.agenda-widget`, `.demo-stats`) — highest-leverage section

Problems to solve, in order:

1. **Two demos, no bridge.** `.live-chat-card` (chat) and `.agenda-widget` (calendar) sit side by side with no visual relationship, and the calendar is a dead end. Fix visually:
   - Give the section a two-step *visual* rhythm without adding text: the chat card gets a solid violet 3px top accent and the calendar gets a violet hairline header, so they read as the same product.
   - Add a **CSS-only bridge**: when a slot is selected, highlight the chat CTA using `:has()`:
     ```css
     .demo-container:has(.agenda-slot.selected) .live-chat-cta{
       box-shadow:0 0 0 2px #812DF2, 0 12px 28px -14px rgb(129 45 242/.45);
     }
     ```
     (Progressive enhancement; no structural change. Verify `:has()` support — baseline since 2023.)
   - Ticket the real fix (J): selecting a slot should open the chat pre-filled with that date/time.
2. **`.live-chat-note` in yellow.** It's a privacy assurance. Use `--violet-050` bg + `#812DF2` text at 13px with a lock glyph, or a neutral `#F7F5FD`. Save amber for nothing on this page.
3. **`.live-chat-tag` with `.pulse-dot` says "Demo en vivo"** while the mode chip says "no crea citas reales". Remove the ping and the green dot; use a static violet dot. (Copy stays.)
4. **`--shadow-2` is undefined** → `.live-chat-card` has no shadow today. Define it or use `--sh-2`.
5. **`.agenda-widget` `border-radius:36px` + `overflow:hidden` + `position:absolute` slots panel**: the slots panel covers the calendar including its header, so the user loses context ("which month am I in?"). Keep `.agenda-slots-header` **sticky** inside the panel, and add a bottom fade (`::after`, 40px, white gradient, `pointer-events:none`) to signal scrollability.
6. **Calendar semantics overload:** `.agenda-day.has-slots::before` = 6px **magenta** dot top-right; `.agenda-day.today::after` = 4px white dot bottom-center; `.agenda-day.selected` = lavender + 2px violet inset ring; `.agenda-day.today` = violet fill. Four signals, three colors, one 40px cell. Reduce to: violet tint for available days, violet fill for today, violet outline for selected, **one** dot max. Removing the magenta dot also removes the last magenta leak.
7. **`.demo-stats` should close the section, not sit in a corner.** `grid-column:1/-1` under both cards, 4 columns, dividers, 40px values, 13px labels. On mobile, 2×2.
8. **Auto-open (J).** Turn it off. It's the single most conversion-hostile behavior on the page: an unsolicited 380px panel that covers content and steals focus while the user is reading the demo it was supposed to explain. If it must stay, gate it behind intent (hover/click) and never on scroll.
9. **The CTA panel** `.live-chat-cta` uses `--grad-surface` (lavender→peach). Make it white with a 1px violet-tinted border, and let only the button be violet. On mobile this panel is also the only "next step" — reduce the copy block above it (§6.3).

### 5.7 Use cases (`.testimonials`, `.testimonial-card`, `.use-case-card`)

- The class names are legacy (`testimonials`) — **do not rename** (CSS is fine, but `main.js` reveal targets `.testimonial-card`). If you rename, add the new selector to the `targets` query string (J/H).
- **Coral card (`nth-child(3)`) is the only peach surface in the design system** → it reads as "featured" for no reason and imports a second brand hue. Make all three white with a 1px border and a 2px violet top rule on the first only (or none).
- `.use-case-card .feature-icon` is 48px white tile with a shadow; on a white card, it needs a 1px border or a tinted tile to remain visible.
- At ≤1024 they go 2-column (`auto 1fr`) which is good; verify the paragraph doesn't sit under a 48px icon column at 360px (it wraps to `display:flex` at ≤560 — the icon then stacks, fine).
- No metrics, no names — keep it that way. The subtitle already says "Sin métricas prometidas"; the visual must not imply testimonials (no quote marks, no stars, no avatars).

### 5.8 Pricing (`.pricing-grid`, `.pricing-card.popular`, `.pricing-note`, `.plan-note`)

- **The dark card is the loudest object on the page** and it competes with the final CTA. Options:
  - **Preferred:** white card, 2px `#812DF2` border, `--violet-050` header tint, violet badge, violet filled button. The recommended plan wins by *ring + tint + badge*, not by turning the page dark.
  - **If the dark card stays:** reserve navy exclusively for it and make the final CTA violet `#812DF2` instead of navy, so the two never look like siblings.
- **`translateY(-10px)`** on `.popular` breaks the grid baseline and makes the two cards look misaligned; the badge already communicates priority. Use `z-index` + ring instead.
- `.popular-badge` is `top:-16px` with a magenta shadow → sits outside the card and can be clipped by `.pricing` overflow on small screens. Use `top:12px; right:12px` inside the card, or keep the overflow and reduce to -12px.
- **`plan-note` for Fundador** ("A cambio de un testimonio y 2 colegas…") is a pre-purchase ask placed under the CTA. Visually it must be readable (≥12.5px, AA) and clearly separated by a hairline — do not hide it, and do not let it look like a condition of purchase by making it bold.
- **`.pricing-note` ×2** at 13.8px `--ink-3` on `--bg` ≈ **4.7:1** (passes, barely). At 0.86rem it's borderline for comfort; move to 14px `--ink-2`, `max-width:62ch`, centered.
- **Mobile stacking:** keep DOM order (Fundador → Estándar). Do **not** reorder with `order` — the CTA is a focusable link and the visual/reading order would diverge. Instead make the recommended card unmistakable: ring + tint + badge + filled button, and remove the 10px lift.
- Price typography: `.amount` 2.75–3.5rem is good. Ensure `font-variant-numeric:tabular-nums` stays, and align `$` and `/mes` on the baseline (already).

### 5.9 FAQ (`.faq`, `.faq-grid`, `.faq-item`)

- Structure is correct (`details/summary`, first open). Keep.
- `.faq-grid` is a single white card with `overflow:hidden`. If you add focus rings with `outline-offset` > 0 they'll clip; currently `outline-offset:-4px` handles it. Keep that, or drop the `overflow:hidden` and use `border-radius` on first/last children.
- Visual weight: 8 questions at 60px = 480px of white slab. Add a 1px divider between rows (exists) and reduce the card's border-radius to 16px; the current 28px + shadow reads as a "modal", not a list.
- `summary` 0.98rem/600 → 1rem/600, `--ink`. The `+`/`−` 30px circle is good; make the open state violet text only (drop `inset 3px 0 0 violet` + lavender bg — two open-state signals is enough with the icon).
- `container-narrow` 820px is slightly wide for 8 one-line answers; 720px reads better and keeps ~70ch.
- Do not convert to a two-column accordion on desktop — reading order across columns breaks.

### 5.10 Final CTA (`.cta`, `.cta-card`)

- This should be **the** moment. Make the card `#812DF2` (solid, optional 2% radial highlight), radius 24px, and the primary button **white filled** (`btn-white`), 58px. The secondary `btn-outline-white` at 60% white border is fine but must not be the same width on mobile (stack, 12px gap).
- Remove the 3-gradient `::before` stack (magenta + coral + violet) — it's the most expensive paint on the page and it muddies the only pure-brand surface.
- `.cta-note` at 13.4px `#B9B9CE` ≈ 7:1 → fine; keep.
- **Proximity risk:** `.cta` is `padding:48–80px` and `.contact` follows immediately. Two big cards within ~120px. See 5.11.

### 5.11 Contact (`.contact`, `.contact-card`)

- Currently the **third** consecutive WhatsApp ask (CTA → contact → footer) and visually as loud as the main CTA (gradient surface + 54px filled button). Demote:
  - White card, 1px border, no gradient, no shadow.
  - Button T2 (outline), not T1.
  - `.contact-card h3` 1.25rem, body 15px.
  - `.contact-note` 13px `--ink-2` (today `--ink-3` on `--grad-surface` ≈ **4.1–4.4:1 → fails AA**).
- Keep the section (it's the support path), but it must read as "support", not "buy".

### 5.12 Footer (`.footer`, `.footer-grid`, `.footer-column`)

- `.footer-column a{min-height:32px}` → 44px (or 40 + 8px gap). Currently the only sub-44 targets on the page.
- `.footer-grid::after` giant "AgendaAI" watermark at `rgb(255 255 255/.04)` sits behind links on desktop and is hidden ≤768. Keep or drop; if kept, ensure `pointer-events:none` (it has) and that it never overlaps the link columns at 1024–1200 (it does overlap the 3rd column at `bottom:-48px` — check at 1024).
- Keep the 3px gradient top strip? It's a fourth violet-gradient idiom. Use 3px solid `#812DF2`.
- Footer stays `--navy-deep` — that's the correct "end of page" color, and it makes the violet CTA above it pop.

---

## 6. Mobile-first behavior

### 6.1 Targets & header

- **Tap targets:** 44×44 minimum (WCAG 2.2 AA requires 24×24; 44 is the iOS/Material guideline). Fix: `.footer-column a` 32 → 44; `.agenda-view-btn` 40 → 44 on all breakpoints; `.agenda-day` min-width 40 at ≥360, 36 at 320 (accept 24-min there).
- **Header:** 56px fixed, opaque, no blur, no height animation. Order: logo → ghost CTA → 44px burger. Below 360px, reduce logo wordmark to 1.125rem and icon to 30px; do not hide the wordmark (brand recognition on a cold landing).
- **Menu:** full-width panel under the header, white, scrim behind, body scroll locked, focus moved to the first link, `Escape` closes and returns focus (Escape already works). Add `aria-expanded` (exists).
- **Safe areas:** `padding-bottom: env(safe-area-inset-bottom)` on the header menu and the widget container.

### 6.2 Hero

- Stack: badge → H1 (3 lines at 40px) → description (16px/1.6) → **primary full-width** → **secondary full-width** (12px gap) → micro → `#how` link → trust row.
- Hero top padding 32px at ≤400px (today 48px), bottom 40px.
- Keep the mockup after the text (DOM) but compress it: hide `.window-controls` (decorative, `aria-hidden`), title 11px, padding 12px, message font 13.5px, gap 8px, `min-height:auto`. Target ≤ 400px tall so the sector strip is reachable in ~1.3 screens.

### 6.3 Demo (mobile is the secondary conversion surface)

- The CTA sits below tag + h3 + paragraph + 3 bullets + note. Compress without hiding:
  - `.live-chat-points` 13px/1.5, gap 6px, 16px check circles → saves ~30px.
  - `.live-chat-note` 12.5px, padding 8px 10px, neutral tint → saves ~20px.
  - `.live-chat-card` padding 20px at ≤560 → saves ~16px.
  - Result: the button appears ~70px higher, still after the copy.
- The agenda widget: `.agenda-header` stacks (already). Reduce `.agenda-grid` padding to 8px at ≤400px. Sticky `.agenda-slots-header` + bottom fade.
- Slots: 48px rows (already) but each available slot is a separate tab stop (J). Visual only: keep the row height, remove `box-shadow` on selected and use a 2px violet border + violet-050 fill (cheaper paint on scroll).
- **Widget sheet:** at ≤480px it covers 70vh full-width with no scroll lock. Ticket: lock body scroll, add a visible close, keep focus inside. Visually, ensure the float button is 16px from the safe-area edges and never overlaps the header.
- Do not open the chat automatically on mobile (already respected).

### 6.4 Pricing

- One column, `max-width:560px`, 24px gap. No `translateY` on the recommended card.
- Price 44px, features 14px/1.55 with 18px checks, CTA 52px full-width, `plan-note` 12.5px.
- `.pricing-note` 14px/1.6, left-aligned on mobile (centered fine print is harder to scan).

### 6.5 FAQ

- `summary` min-height 56px, padding 16px 18px, question 15.5px/600, answer 14.5px/1.65, 18px side padding. Accordion stays single-column. First item open (keeps the section from looking like a wall).
- Do not animate height on open (native `details` doesn't animate; the current `p{animation:rise-in}` is fine and cheap).

---

## 7. Accessibility checklist for this redesign

### 7.1 Text contrast (computed from hex, WCAG 2.x; re-verify with axe)

| Pair | Ratio | Verdict |
|---|---|---|
| `--ink #14122B` on `#FFFFFF` | ~17.9 | ✅ AAA |
| `--ink-2 #45435C` on `#FFFFFF` | ~9.5 | ✅ AAA |
| `--ink-2` on `#F7F5FD` | ~8.9 | ✅ |
| `--ink-3 #5F5F78` on `#FFFFFF` | ~6.1 | ✅ (new muted token) |
| `--ink-3` on `#F7F5FD` | ~5.7 | ✅ |
| `--ink-3` on `#F3EAFF` | ~5.4 | ✅ |
| `#812DF2` on `#FFFFFF` | ~5.8 | ✅ AA normal text |
| `#FFFFFF` on `#812DF2` | ~5.8 | ✅ AA (buttons ≥16px) |
| `#FFFFFF` on `#6D1FD6` (hover) | ~7.3 | ✅ |
| `#812DF2` on `#F3EAFF` | ~5.2 | ✅ |
| **Current failures to fix** | | |
| `#6E6E85` on `#F7F0FF` (`.window-title`, `.live-chat-hint`) | **4.41** | ❌ at 12.8px |
| `#6E6E85` on `#F6F3EF` (`.logos-row`) | **4.45** | ❌ |
| `#6E6E85` on `#F4F1FB` (`.fake-input`) | **4.34** | ❌ |
| `#6E6E85` on `--grad-surface` (`.contact-note`, ~#F7F0FF→#FFE7DF) | **4.1–4.4** | ❌ |
| **Watch-out** | | |
| `#6E6E85` on `#FBFAF7` (`.hero-micro`, `.pricing-note`) | ~4.7 | ⚠️ passes by ~0.2 |
| `#D9480F` (orange stop of `--grad-text`) on white | ~3.97 | ⚠️ only OK as large text; retire it |
| `.agenda-day.past{opacity:.42}` | ~2.1 | ✅ exception (inactive UI, `aria-disabled`) |

**Rule:** no muted text below 6:1 in the new system, and never below 14px for `--ink-3`.

### 7.2 Non-text contrast & focus rings

Requirement: focus indicator ≥3:1 against its adjacent colors, and visible on **violet, lilac and dark** surfaces.

| Surface | Ring |
|---|---|
| White / tint (`#FFFFFF`, `#F7F5FD`, `#F3EAFF`) | `outline:3px solid #812DF2; outline-offset:2px` |
| Violet fill (`#812DF2`) — `.btn-primary`, `.agenda-day.today`, `.agenda-day.selected`, `.agenda-view-btn.active` | `outline:3px solid #FFFFFF; outline-offset:2px; box-shadow:0 0 0 5px #812DF2` (two-tone) — a violet ring on a violet button is 1:1 |
| Dark (`.cta-card`, `.pricing-card.popular`, `.footer`, nav overlay) | `outline:3px solid #FFFFFF; outline-offset:3px` (exists) |
| Inside `overflow:hidden` (`.faq-grid`, `.agenda-widget`) | `outline-offset:-3px` so the ring isn't clipped |

Additional:

- `.skip-link:focus` → use `:focus-visible` too, so a mouse click doesn't reveal it.
- `.agenda-slot:focus-visible` and `.agenda-day:focus-visible` currently use violet offset 2 inside a white grid — fine; with the new tint backgrounds re-check 3:1.
- The `.agenda-view-toggle` active pill is violet with white text: add the two-tone ring.
- Hover-only states must never be the only affordance (`.feature-card:hover` etc. are being removed anyway).

### 7.3 Keyboard

- **Nav:** order is logo → 5 links → CTA → (mobile) CTA + burger. Keep that order; don't use `order` to move the CTA.
- **Mobile menu:** no focus trap and no scroll lock today (J). `Escape` works and returns focus ✅.
- **Calendar (J):** in month view every non-past, non-empty day is focusable → up to **31 tab stops**. Needs roving tabindex + arrow keys. Visual-only mitigation: none; ticket it.
- **Slots (J):** every available slot has `tabindex=0` → up to 24 tab stops inside a listbox. Needs single tab stop + arrow keys.
- **Tabs:** arrow keys work ✅; roving tabindex not implemented (minor; all 3 tabs tabbable).
- **FAQ:** native `details` — Enter/Space toggles ✅.
- **Demo:** `#agenda-slots` receives focus on open and Escape closes + restores focus ✅. Keep these behaviors when restyling.
- **Link affordance:** `a{text-decoration:none}` globally. Every inline link in prose must be underlined (`.hero-alt a` is ✅; footer links are not, but they're in a nav list — acceptable). If you add any inline link, underline it.
- **Zoom:** test 200% at 1280px and 400% at 320px. The 7-column calendar is the failure candidate.

### 7.4 Motion

- `prefers-reduced-motion` block exists and is thorough ✅ (kills animation, forces `.reveal` visible, hides progress bar, flattens the hero).
- Gaps: the **JS counters** still animate (`main.js` §motion) and the **widget auto-open** still occurs. Both need the media query (J).
- Do not add: parallax, scroll-linked transforms, staggered card entrances > 400ms, looping animations beyond the existing `pulse-dot` (which should be removed).
- Max 2 animated properties (transform + opacity), 160–240ms for feedback, ≤300ms for entrance.

### 7.5 Semantics (unchanged, but verify you didn't break them)

- H1 unique, H2 per section, H3 in cards — visual redesign must not introduce `::before` content that reads as a heading. No text in `content:` that carries meaning (screen readers may or may not announce it).
- `.highlight` gradient text: with a solid violet you can drop `-webkit-text-fill-color:transparent`, which is a robustness win in forced-colors and older engines.
- Keep `role="img"` + `aria-label` on `.chat-demo`; if you visually truncate the conversation on mobile, the label would describe content that isn't visible → **don't truncate**.
- Keep the `aria-hidden` on `.window-controls`, `.fake-input`, `.fake-send`. If you delete them visually, delete the nodes only via CSS `display:none` (no DOM change).
- The `.logos` section keeps its `aria-label`; don't turn it into an image.

---

## 8. Performance guardrails

### 8.1 Current measured baseline (from the audit + file sizes)

| Metric | Now |
|---|---|
| `styles.css` | 51.5 KB raw |
| `widget.css` | 15.9 KB raw |
| `main.js` + `widget.js` + `demo-chat.js` | 19.9 + 26.3 + 26.5 = **72.7 KB raw** |
| HTML | 49.4 KB |
| Requests / LCP / CLS (localhost) | 8 / 328 ms / 0 |

### 8.2 Budgets for the redesign

| Budget | Limit |
|---|---|
| CSS after purge (both files) | ≤ 50 KB raw / ≤ 11 KB brotli |
| JS | ≤ 72 KB raw (no growth) / ≤ 22 KB brotli |
| Total page transfer (cold, no cache) | ≤ 220 KB |
| Requests before first interaction | ≤ 12 |
| LCP (Moto G4 / Slow 4G) | ≤ 1.8 s (LCP element = H1) |
| CLS | ≤ 0.02 |
| INP | ≤ 200 ms |
| Long tasks on load | ≤ 2, none > 120 ms |
| New images | none in this pass; if added later: ≤ 90 KB, AVIF/WebP, explicit dimensions |

### 8.3 What to avoid

1. **`backdrop-filter` on the sticky header.** It's a full-width blur recomputed on every scroll frame, on top of a 3px scroll-progress bar and animated shadows. Replace with opaque white + border. (Keep the blur only on `dialog::backdrop`, which is transient and unused.)
2. **Gradient stacks.** The hero has 5 layers (3 mesh stops + `::before` + `::after`), `.cta-card` has 3, `.pricing-card.popular::before` has 2, `.demo::before` has 1. Each large radial gradient is a full-surface paint. Budget: **≤ 2 radial layers per section**, max 900px diameter, no `filter:blur`.
3. **Animating `box-shadow`.** `.btn`, `.feature-card`, `.step`, `.stat`, `.testimonial-card`, `.pricing-card` all transition `box-shadow` → paint on every hover. Use `transform` + a `::after` with `opacity`, or no transition at all for non-interactive cards.
4. **Animated opacity on the LCP element.** `.hero-text>*{animation:rise-in .65s both}` starts the H1 at `opacity:0`. It delays perceived paint on slow devices and can delay LCP measurement. Animate transform only, or drop the hero entrance.
5. **`transform: perspective()/rotateY()` on text containers.** Subpixel antialiasing is lost; 14px chat text looks soft on Windows. Flat is sharper and cheaper.
6. **Reveal-on-scroll applied to section headers.** Anchor jumps (`#pricing`, `#faq`) can land on an invisible header for ~500ms. Keep reveals on cards only, or reduce to 8px/240ms and never on `.section-header`.
7. **Font swaps without metric fallback.** Two origins are already loaded non-blockingly (`media="print"` + `onload`). Add a fallback `@font-face` with `size-adjust`/`ascent-override` for Poppins and Clash so the swap doesn't shift the 3-line H1. Do not add a third family or a 700 weight.
8. **`content-visibility:auto` on `#demo` or `#pricing`.** It breaks in-page anchor scrolling and focus targeting in some engines. Use it only on long static sections, if at all.
9. **JS scroll effects** (parallax, sticky counters). The existing `rAF`-throttled scroll listener is acceptable; don't add more.

### 8.4 Token propagation map (critical)

The new violet must be applied in **four** places, or the page will be visibly inconsistent:

| Where | What |
|---|---|
| `css/styles.css` `:root` | `--violet`, `--violet-deep`, `--grad-brand`, `--shadow-action`, `--line-accent`, `--lavender*` |
| Hardcoded `rgb()` in `styles.css` | lines ~211, 259, 263, 329, 531, 822–823, 921–923, 984, 150 (all magenta/coral/blue) |
| `styles.css` `#appointment-widget` block (lines 1218–1239) | `--appt-primary`, `--appt-user-message`, 3 gradient overrides |
| `js/demo-chat.js` `applyBrandVars()` + `primaryColor` (lines 588–604) | **JS change — ticket it.** Otherwise the floating chat stays `#6E3AF0` while the page is `#812DF2`. |

Also `index.html` `<meta name="theme-color" content="#1D1D3D">` → `#FFFFFF` (or `#812DF2`). Presentation-only HTML edit.

### 8.5 Contract with existing JS (do not rename)

`main.js` / `demo-chat.js` query these; renaming any of them silently kills a feature:

`#nav-menu`, `.nav-toggle`, `.nav-link`, `.header`, `.scroll-progress`, `.chat-demo`, `.message`, `.stat-value`, `.live-chat-card`, `.chat-mode`, `#chat-open`, `#year`, `[data-cta]`, `.section-header`, `.feature-card`, `.step`, `.stat`, `.testimonial-card`, `.pricing-card`, `.faq-item`, `.cta-card`, `.contact-card`, `.agenda-widget`, `.logos-row`, `.pricing-note`, `.features-grid`, `.steps`, `.testimonials-grid`, `.pricing-grid`, `.demo-stats`, and every `#agenda-*` id plus `.agenda-day`, `.agenda-slot`, `.agenda-view-btn[data-view]`, `.agenda-slots-*`.

`data-cta` values are the analytics contract — don't touch them either.

---

## 9. "Do not do" list

Visually trendy, conversion-hostile on **this** page:

1. **No fake social proof.** No logos, star ratings, "N negocios", counters of customers, or avatars. The page's credibility rests on *not* having invented them (the audit removed them once).
2. **No auto-opening chat / exit-intent modal / "¿Hablamos?" popup.** The demo already asks.
3. **No scroll-jacking, horizontal scrollers, or pinned sections.** The page has 9 anchors and a sticky header; hijacking breaks navigation.
4. **No glassmorphism / stacked `backdrop-filter` cards.** Costly, and it lowers text contrast.
5. **No gradient text.** Solid `#812DF2` on the highlight spans; gradients on 7 headings erase hierarchy and hurt legibility at 12–14px.
6. **No hover lift on non-clickable elements.** If a card moves, it must be a link.
7. **No "one big dark card per section" rhythm.** One dark/violet moment (final CTA) + footer.
8. **No pure-color availability encoding** in the calendar. Every state needs shape or text redundancy; the legend already has labels — the cells must too.
9. **No hiding content to make the layout breathe.** Specifically: the `mask-image` on `.logos-row`, truncating the chat example, or "show 3 of 6 features" with a *Ver más* (new copy + new interaction).
10. **No sticky bottom CTA bar** in this pass. It would stack with the chat FAB and cover the mobile demo.
11. **No animated price counters, no "typing…" on the hero mockup.** Fake activity erodes trust faster than static honesty.
12. **No video/autoplay in the hero.** LCP and mobile data cost for zero added clarity.
13. **No emoji as UI iconography** beyond what's already in the copy (the ✅ inside a message). No emoji in badges or buttons.
14. **No `order`/`grid-area` reordering of pricing, use cases, or features.** Keyboard and screen-reader order would diverge from the visual order.
15. **No new sections, no new copy.** The page has enough; the problem is weight, not inventory.
16. **No `prefers-reduced-motion` regressions** — don't add motion that the block can't neutralize.

---

## 10. Top 8 highest-impact visual changes

Ranked by expected conversion impact ÷ effort. Impact = expected lift in primary + secondary conversion; Effort S ≤ 1 file / few rules, M = several components or a JS ticket.

| # | Change | Why it wins | Impact | Effort | Where |
|---|---|---|---|---|---|
| 1 | **Re-palette: white-dominant + one violet `#812DF2`; delete magenta, coral and the 3-hue text gradient** | Every section currently teaches a different "action color". One accent makes the CTA instantly findable and the product look bought-and-paid-for | ★★★★★ | S | `:root`, `.highlight`, `.btn-primary`, all `::before` layers, `.use-case-card`, `.feature-card:nth-child(1)` |
| 2 | **Hero authority: 3-line H1 + one filled CTA + ghost secondary + quiet tertiary; mobile header CTA → ghost** | Removes 3 of 4 competing asks in the first screen; raises the CTA ~75px; kills the duplicate purple at the top of mobile | ★★★★★ | S | `.hero-text`, `h1`, `.hero-actions`, `.hero-alt`, `.nav-cta-mobile` |
| 3 | **De-fake the hero mockup: flat (no 3D), no hover motion, no blinking caret, neutral send button** | The most visible element currently lies about being interactive and renders text blurry. Honest + crisp = trust at first contact | ★★★★☆ | S | `.demo-window`, `.hero-visual:hover`, `.fake-input`, `.fake-send` |
| 4 | **Fix the demo funnel: neutral (not yellow) note, sticky slots header + scroll fade, calendar→chat highlight via `:has()`, stat band as full-width close** | The secondary conversion currently ends in a dead end and looks broken. This is the only place a user can experience the product before WhatsApp | ★★★★☆ | M | `.live-chat-card`, `.agenda-*`, `.demo-stats` |
| 5 | **Kill false affordances: no hover lift on non-clickable cards; no pulsing "live" dots; "Ejemplo" chip stays** | 5 card types move on hover and none are links; the "Demo en vivo" ping contradicts "no crea citas reales" | ★★★★☆ | S | `@media(hover)` block, `.pulse-dot`, `.live-chat-tag` |
| 6 | **Collapse the surface zoo (9 → 4): pricing dark card → white + violet ring; coral use-case → white; contact → quiet; final CTA is the only violet** | Today the page has three "loud" endings that cancel each other. One loud moment per page | ★★★★☆ | M | `.pricing-card.popular`, `.use-case-card`, `.contact-card`, `.cta-card` |
| 7 | **Trust bands as bands: sector strip restyled (no mask, no uppercase, AA), hero trust row as one line, stat band with dividers** | Turns three decorative fragments into one readable "for whom / what it does / facts" story | ★★★☆☆ | S | `.logos-row`, `.hero-trust`, `.demo-stats` |
| 8 | **Contrast + focus token pass (muted `#5F5F78`, two-tone rings, 44px footer links)** | 4 real AA failures exist today (12.8px muted text at 4.1–4.45:1). This is a **compliance gate**, not an option | ★★★☆☆ | S | `--ink-3`, `.window-title`, `.live-chat-hint`, `.contact-note`, `.logos-row`, `:focus-visible`, `.footer-column a` |

**Sequencing suggestion:** 1 → 2 → 3 → 8 (one CSS pass, no layout risk) → 5 → 7 → 6 (layout pass) → 4 (most structural; needs the JS tickets for auto-open and the slot→chat bridge).

**Do not start with:** the demo redesign. It's the highest-leverage *after* the palette and hero are fixed; doing it first means designing a component system you're about to replace.

---

## Appendix A — Proposed token set (spec only, not applied)

```css
:root{
  /* Surfaces: 4, not 9 */
  --bg:#FFFFFF;
  --bg-tint:#F7F5FD;
  --surface:#FFFFFF;
  --navy:#14122B;

  /* Ink */
  --ink:#14122B;      /* 17.9:1 */
  --ink-2:#45435C;    /* 9.5:1  */
  --ink-3:#5F5F78;    /* 6.1:1  — new muted floor */

  /* Brand: one hue */
  --violet:#812DF2;   /* 5.8:1 on white */
  --violet-hover:#6D1FD6;
  --violet-050:#F3EAFF;
  --violet-100:#E7D8FF;
  --on-violet:#FFFFFF;

  /* Status (never decorative) */
  --success:#0B7A55;
  --success-soft:#E7F7EF;

  /* Lines */
  --line:#E9E6F2;
  --line-strong:#D8D3E8;

  /* Radii: 3 + pill */
  --r-sm:10px;
  --r-md:16px;
  --r-lg:24px;
  --r-pill:999px;

  /* Elevation: 3 steps, CTA accent shadow only */
  --sh-1:0 1px 2px rgb(20 18 43/.06);
  --sh-2:0 8px 24px -12px rgb(20 18 43/.16);
  --sh-3:0 24px 48px -24px rgb(20 18 43/.22);
  --sh-cta:0 10px 24px -10px rgb(129 45 242/.45);

  /* Type */
  --t-display:clamp(2.5rem,4.6vw,4.05rem);
  --t-h2:clamp(1.9rem,3vw,2.75rem);
  --t-h3:clamp(1.125rem,1.4vw,1.3rem);
  --t-lead:1.0625rem;
  --t-body:1rem;
  --t-small:.875rem;
  --t-micro:.8125rem;   /* 13px floor for fine print */

  /* Spacing (4px grid) */
  --s-1:4px; --s-2:8px; --s-3:12px; --s-4:16px;
  --s-6:24px; --s-8:32px; --s-12:48px; --s-16:64px; --s-24:96px;

  /* Layout */
  --container:1180px;
  --container-narrow:720px;
  --gutter:clamp(20px,4vw,40px);
  --header-h:60px;
}
```

## Appendix B — Verification checklist before sign-off

- [ ] axe-core 0 violations at 1440×900, 768×1024, 390×844, 320×667.
- [ ] Contrast spot-check of the five pairs in §7.1 that fail today.
- [ ] Keyboard-only pass: skip link → nav → mobile menu (Escape) → hero CTAs → demo button → calendar (note the tab-stop count) → slots → FAQ → footer.
- [ ] Keyboard tab-through with the floating chat **closed** and **open** (focus trap).
- [ ] `prefers-reduced-motion: reduce`: no entrance animation, all content visible, counters static, no auto-open.
- [ ] 200% zoom at 1280px and 400% at 320px: no horizontal scroll except the intended calendar.
- [ ] Anchor test: `#features #demo #pricing #faq #contact #casos #main` land with the H2 fully below the sticky header at both header heights.
- [ ] Ocultar JS: all content visible (the `.reveal` class is added by JS, so CSS must never pre-hide).
- [ ] LCP element = H1, not the hero mockup; no `opacity:0` on it at first paint.
- [ ] Mobile: no two violet fills in the first viewport; both hero CTAs above 667px fold.
- [ ] The floating widget's colors match the page (§8.4).
- [ ] `data-cta` values unchanged; one test click per CTA fires the analytics handler.
