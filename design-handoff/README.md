# Handoff: WriteSpace — Document OS

## Overview
WriteSpace is a document-creation tool reimagined as a **cinematic "document OS"**: a dark, infinite canvas on which a single document floats like a spotlit object. There are **no static panels or windows** — the document is the only persistent surface. Everything else (a new-doc launcher, a dock, a command palette, a theme browser) appears on demand and gets out of the way.

Users **forge** a document from a preset bank of types (business card, invoice, medical guidelines, letterhead, certificate), then style it with one of ~29 themes, edit any text inline by double-clicking, drag the document around an infinite zoom/pan canvas, and reposition a decorative SVG flourish (including dragging its two curve endpoints). Output is print/PDF.

This redesigns the original WriteSpace React/TS/Vite/Tailwind app's **shell** while preserving its data model (themes, presets, layouts, invoice math).

---

## About the Design Files
The files in this bundle (`WriteSpace.html` + the `app/*.jsx` scripts) are a **design reference created in HTML/React-via-Babel** — a working prototype showing the intended look and behavior. They are **not production code to ship directly.** Babel-in-the-browser, global `window` exports, and inline `<script type="text/babel">` are prototype conveniences, not patterns to copy.

Your task is to **recreate this design in the target codebase's environment** using its established patterns and libraries. The original lives in a **React 18 + TypeScript + Vite + Tailwind + shadcn/ui** repo (`Youre2day-eng/WriteSpace`) — recreate it there, reusing the existing `src/types/index.ts` interfaces and `src/data/` theme/preset/layout banks. If you are starting fresh, React + TypeScript + Vite is the natural choice.

The prototype's logic (zoom/pan math, inline-edit pattern, draggable accent with endpoints, live invoice math) is sound and worth porting closely — it's the *delivery mechanism* (Babel, window globals) that should be replaced with real modules/components.

---

## Fidelity
**High-fidelity.** Colors, typography, spacing, motion, and interactions are final and intentional. Recreate the shell pixel-accurately. The **document templates** themselves should match the prototype, but their per-theme colors/fonts are data-driven (see Design Tokens → Themes) and come from the existing theme bank — don't hard-code them.

---

## Architecture at a glance
```
WriteSpace.html        Shell DOM + all CSS (custom properties, panels, dock, launcher, print)
app/data.jsx           THEMES[] (29) + DOC_TYPES[] (5) with default editable content
app/canvas.jsx         <Editable>, <AccentFlourish>, <Stage> (zoom/pan/drag primitives)
app/templates.jsx      One component per doc type (+ live invoice math) + <Accent> wrapper
app/chrome.jsx         <Glyph>, <Launcher>, <Dock>, <CommandPalette>, <ThemePanel>
app/main.jsx           <App> — wires state, keyboard, commands, Tweaks
tweaks-panel.jsx       Prototype-only tweak controls (NOT part of the product; drop on port)
```
Suggested real-codebase mapping: `data.jsx` → `src/data/*` (already exists in repo) + a `docTypes.ts`; `canvas.jsx`/`templates.jsx`/`chrome.jsx` → `src/components/`; `main.jsx` → `App.tsx`. CSS custom properties → Tailwind theme tokens or a CSS layer.

---

## Screens / Views
This is a single-screen spatial app. The "views" are overlays/panels over one persistent canvas.

### 1. Canvas (always present)
- **Purpose:** Hold and manipulate the floating document.
- **Layout:** Full-viewport (`position:fixed; inset:0`). Background is a radial gradient `radial-gradient(120% 90% at 50% -10%, var(--bg2), var(--bg) 60%)`, with two fixed pseudo-layers:
  - `::before` — dot grid: `radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px)`, `background-size:30px 30px`, `opacity:.5`.
  - `::after` — spotlight: `radial-gradient(60% 50% at 50% 32%, rgba(255,255,255,.06), transparent 70%)`.
- **Transform model (critical):** Two nested transforms.
  - World layer: `translate(view.x, view.y) scale(view.zoom)`, `transform-origin:0 0`.
  - Doc-position layer (inside world): `translate(docPos.x, docPos.y)`.
  - The artboard sits at `0,0` inside the doc layer. So the artboard's top-left lands at screen `(view.x, view.y)`.
- **Persistent chrome (not windows — minimal, non-interactive):**
  - Wordmark, top-left: `Write` + `Space` (the "Space" colored `var(--accent)`), `font-weight:700; font-size:15px; opacity:.5; pointer-events:none`.
  - Status line, bottom-left: monospace, `11px`, `var(--muted)`, format `"{Doc Type} · {Theme Name} · {zoom%}"`.

### 2. The Document (floating artboard)
- **Purpose:** The deliverable. Editable in place.
- **Frame:** `.ws-docframe::before` is a soft glow (`radial-gradient(...rgba(255,255,255,.10)...)`, inset `-60px`, hidden when spotlight is off).
- **Artboard:** `position:relative; overflow:hidden; border-radius:6px;` with layered shadow:
  `0 2px 4px rgba(0,0,0,.4), 0 40px 80px -20px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.04)`.
- **Native sizes (px = the prototype's design pixels; map to print at 96dpi → 816px ≈ 8.5in):**
  - Business Card: **1050 × 600**
  - Invoice: **816 × 1056**
  - Medical Guidelines: **816 × 1056**
  - Letterhead: **816 × 1056**
  - Certificate: **1056 × 816** (landscape)
- Document colors/fonts come 100% from the active theme object (see tokens).

### 3. Launcher (overlay) — "Forge a document"
- **Trigger:** App start (no doc), Dock "New", ⌘N, command palette.
- **Layout:** Full-screen scrim `rgba(8,8,10,.55)` + `backdrop-filter:blur(14px)`, centered card `min(760px, 92vw)`, `var(--panel)` bg, `border:1px solid var(--border)`, `border-radius:22px`, `padding:28px`, shadow `0 40px 100px -30px rgba(0,0,0,.8)`.
- **Header:** an `var(--accent)` glowing dot (14px, `box-shadow:0 0 18px var(--accent)`) + "Forge a document" (`20px/700`).
- **Grid:** `repeat(auto-fill, minmax(210px, 1fr))`, gap 14px. Each tile: doc glyph (in the type's default-theme primary color), name (`15px/700`), blurb (`11.5px`, muted), and a 4-chip swatch row (header bg / primary / accent / bg), each chip `22×10px, radius 3px`.
- **Tile hover:** `translateY(-4px)`, border → accent, bg `rgba(255,255,255,.06)`.
- **Entrance:** scrim fades (`wsFade`), card pops (`wsPop`: from `opacity:0; translateY(14px) scale(.97)`).
- **Foot:** "Press esc to dismiss".

### 4. Dock (floating, bottom-center) — appears once a doc exists
- **Container:** `position:fixed; bottom:22px; left:50%; translateX(-50%)`, flex, gap 6px, padding 8px, `border-radius:18px`, `var(--panel)` + `backdrop-filter:blur(20px)`, `border:1px solid var(--border)`, shadow `0 16px 40px -12px rgba(0,0,0,.6)`.
- **Buttons (5):** New (plus), Themes (palette), Fit (frame), ⌘K (cmd), Export (upload-arrow). Each: 54px wide column, icon + tiny `9.5px` label.
- **Hover (the "magnify"):** `translateY(-6px) scale(1.06)`, bg `rgba(255,255,255,.08)`, transition `var(--dur) cubic-bezier(.2,.9,.3,1.4)`. Active state (Themes open): icon → accent.

### 5. Command Palette (overlay) — ⌘K
- **Layout:** top-anchored (`padding-top:14vh`) scrim + blur(10px); card `min(580px,92vw)`, radius 16px, `var(--panel)`.
- **Input:** borderless, `17px`, placeholder "Search actions, doc types, themes…", bottom border `1px var(--border)`.
- **List:** max-height `46vh`, scroll. Each item: optional 12px swatch + label (flex:1) + uppercase group tag (`10.5px`, muted). Active row bg `rgba(255,255,255,.08)`.
- **Commands generated:** New · {each doc type} (group "Create"); Browse themes / Fit to screen / Zoom in / Zoom out (group "View"); Export/Print (group "Output"); Theme · {each of 29} (group = theme category, swatch = theme.primary).
- **Keys:** ↑/↓ move selection, Enter runs, Esc closes. Filter matches label + group, case-insensitive.

### 6. Theme Panel (slide-in, right) — Dock "Themes" or palette
- **Container:** `position:fixed; top:0; right:0; height:100%; width:340px`; closed = `translateX(108%)`, open = `translateX(0)`; transition `var(--dur) cubic-bezier(.4,0,.2,1)`. `var(--panel)` + `blur(24px)`, left border, shadow `-20px 0 50px -20px rgba(0,0,0,.6)`.
- **Header:** "Themes" (`16px/700`) + × close.
- **Category chips:** All, Medical, Luxury, Corporate, Tech, Creative, Hospitality, Gradient, Specialty. Active chip = filled accent.
- **Grid:** 2 columns, gap 12px. Each card = a mini document preview: bg = theme.bg; a 22px band = theme.headerBg; three text "lines" (theme.text 70%w, theme.primary 45%w, theme.text@40% 85%w, each 4px tall, radius 2px); an accent dot (12px) bottom-right = theme.accent; then name (`12px/600`) + category (`10px`, muted).
- **Card hover → LIVE MORPH:** hovering a card sets a `previewThemeId` that overrides the document's theme in real time (no click needed). Mouse-leaving the panel clears the preview. **Click** commits the theme. Current theme card shows accent ring.

---

## Interactions & Behavior

### Inline text editing (every text node in a document)
- Implemented by `<Editable>`. **Double-click** → element becomes `contentEditable`, text is selected. **Enter** commits (single-line), **Esc** cancels, **blur** commits. On commit, the new `innerText` is written back to the document content state.
- Implementation detail that matters: while editing, render `children = null` so React's reconciler doesn't fight the contentEditable DOM; set the text imperatively via ref on entering edit (and select-all). Read `innerText` on commit.
- **Hover affordance:** `background:rgba(127,127,127,.16)` + `box-shadow:0 0 0 4px rgba(127,127,127,.16)`, cursor text. **Editing:** `box-shadow:0 0 0 2px var(--accent)`. (Neutral gray tint works on both light and dark document themes.)
- `multiline` variant uses `white-space:pre-wrap` and allows Enter as newline.

### Zoom / Pan / Drag (the `<Stage>`)
- **Wheel:** plain wheel pans (`view.x -= deltaX; view.y -= deltaY`). **Ctrl/⌘ + wheel** zooms toward cursor: `factor = exp(-deltaY * 0.0015)`, `zoom` clamped **[0.3, 2.4]**, and `view.x/y` adjusted so the point under the cursor stays fixed. Attach wheel with `{passive:false}` and `preventDefault`.
- **Drag empty canvas:** pans the world (cursor `grab`/`grabbing`). Also deselects the accent.
- **Drag the document body:** "picks up" the document — updates `docPos` by `delta / zoom`. (Pointer-down on a non-editing text bubbles to the doc layer, so dragging text moves the doc; double-click still edits.)
- **Fit to screen:** `zoom = min((vw-220)/w, (vh-200)/h, 1.15)`, then center: `x=(vw - w*zoom)/2, y=(vh - h*zoom)/2`, `docPos={0,0}`. Run on doc creation and via Dock "Fit". (Compute synchronously from `window.innerWidth/Height` — do **not** defer to rAF.)

### Draggable SVG accent flourish (`<AccentFlourish>`)
- One per document, in `theme.accent` color. A quadratic curve drawn between two endpoints `p1`,`p2`; control point = midpoint of p1/p2 raised by ~46px (`cy = min(p1.y,p2.y) - 46`). Small filled dots at each end.
- **Drag the curve body** (a fat transparent 26px-wide hit-path) → moves the whole accent (`pos.x/y += delta/zoom`).
- **Select** (click) → shows two draggable endpoint handles (9px circles, white fill, `var(--accent)` stroke) + a dashed selection outline. **Drag a handle** → moves that endpoint (`p1`/`p2`), reshaping the curve live. All pointer deltas divided by `zoom`.
- Local SVG box 230×150, `overflow:visible`. Endpoints default `p1={14,96}`, `p2={216,54}`; the group's default `pos` is per doc type (see content defaults).

### Export
- Adds `body.ws-printing`, then `window.print()`, then removes the class. Print CSS hides all chrome (dock, panel, wordmark, status, accent handles, glow), neutralizes the world/doc transforms (`transform:none; position:static`), and strips the artboard shadow/radius so one document prints per page (`@page{margin:0}`). In a real app, prefer a dedicated print route or a PDF lib, but the "isolate the artboard, reset transforms" approach is the key.

### Keyboard
- **⌘/Ctrl+K** toggle palette · **⌘/Ctrl+N** open launcher · **Esc** closes palette/launcher/theme panel and deselects accent.

### Motion
- Single duration token `--dur` (default `.32s`); Tweaks switch it between `.14s / .32s / .55s`. Dock magnify and pop/fade use spring-ish `cubic-bezier(.2,.9,.3,1.4)`; panel slide uses `cubic-bezier(.4,0,.2,1)`.

---

## State Management
Top-level app state (in `<App>`):
- `doc: { typeId, content } | null` — the active document. `content` is a deep clone of the doc type's default content, **plus** `content.accent = { pos:{x,y}, p1:{x,y}, p2:{x,y} }` seeded on create.
- `themeId: string` — committed theme id.
- `preview: string | null` — hovered theme id (live morph). Effective theme = `themeById(preview ?? themeId)`.
- `view: { zoom, x, y }` — canvas transform.
- `docPos: { x, y }` — document position within the world.
- `launcher / themesOpen / palette: bool` — overlay visibility.
- `accentSel: bool` — accent selection (shows endpoint handles).
- Tweaks (`mood, accent, motion, dotGrid, spotlight`) — shell-only, persisted; **omit from the product** unless you want a settings surface.

Key transitions: pick type → `createDoc(typeId)` (clone content, seed accent, set default theme, close launcher, fit view). Edit field → `set(field, value)` merges into `doc.content`. Invoice line edits update `content.items[]` and totals recompute on render.

Data fetching: none. Original repo additionally supports file import (.txt/.md/.pdf/.docx), Google Docs URL import, and a Claude chat — out of scope here but present in the source repo if needue.

---

## Design Tokens

### Shell CSS custom properties (default "graphite" mood)
```
--bg:    #0d0d0f      /* canvas base */
--bg2:   #161619      /* canvas radial center */
--panel: rgba(28,28,32,0.86)   /* dock / panels / overlays */
--text:  #ececf0
--muted: #8a8a93
--border: rgba(255,255,255,0.09)
--accent: #e07a3c     /* ember (default) */
--dur:   0.32s
--ui:    'Helvetica Neue', Helvetica, Arial, sans-serif   /* all chrome */
--mono:  ui-monospace, 'SF Mono', 'Menlo', monospace      /* status line */
```
Alternate moods (Tweaks): **ink** `bg:#080b16 bg2:#0f1424 panel:rgba(18,24,42,.88) text:#e6ebf5 muted:#7d88a3 border:rgba(150,170,220,.12)`; **bone** `bg:#1a1815 bg2:#221f1b panel:rgba(40,36,31,.9) text:#f2ede4 muted:#9c9384 border:rgba(255,245,225,.1)`.
Accent options: ember `#e07a3c`, gold `#d4a64a`, teal `#3fb6a8`, violet `#9a7cf0`. Motion: `.14s / .32s / .55s`.

### Radii
Artboard 6px · dock 18px · launcher card 22px · palette card 16px · theme cards 12px · dock buttons 12px · editable hover 3px.

### Document themes (data-driven — do NOT hard-code into templates)
Each theme is: `{ id, name, category, bg, text, primary, secondary, accent, font, border, headerBg, headerText }`. `headerBg` may be a solid hex **or** a CSS gradient string (e.g. `linear-gradient(135deg,#3b82f6,#6366f1)`) — render it directly as `background`. The 29 themes ship in `app/data.jsx` (ported from the repo's `src/data/themes/*`). Examples:
- `clinical-white` (Medical): bg `#ffffff`, text `#0a1628`, primary `#1d4ed8`, accent `#3b82f6`, headerBg `#1d4ed8`, font Helvetica Neue.
- `black-diamond` (Luxury): bg `#f8f8f8`, text `#080808`, primary `#1a1a1a`, headerBg `#0a0a0a`, font Helvetica Neue.
- `emerald-prestige` (Luxury): bg `#071a0f`, text `#e8f0e4`, primary/accent `#d4a843`, headerBg `#0d3320`, font Garamond.
- `arctic-minimal` (Corporate): bg `#f8fbff`, text `#1a2840`, primary `#2b5797`, headerBg `#b8d4e8`.
Categories: Medical, Luxury, Corporate, Tech, Creative, Hospitality, Gradient, Specialty. Full list + hexes in `app/data.jsx`.

### Doc-type default content (the editable seed values)
Defined in `app/data.jsx` `DOC_TYPES[]`. Each has `id, name, blurb, glyph, defaultTheme, w, h, content{}`. Defaults are realistic sample copy (e.g. invoice "Northbeam Studio", four line items, taxRate 8.5). Default accent `pos` per type: card `{720,300}`, invoice `{120,770}`, guidelines `{110,905}`, letterhead `{540,120}`, certificate `{770,560}`.

### Invoice math
`subtotal = Σ qty×rate`; `tax = subtotal × taxRate/100`; `total = subtotal + tax`. Currency formatted `en-US` 2-dp with `$`. Editing qty/rate strips non-numeric chars and reparses; rows are addable/removable; amount column is derived (read-only).

---

## Assets
- **No external image assets.** All iconography is inline SVG (`<Glyph>` in `app/chrome.jsx`: card, invoice, cross, letter, seal, palette, plus, fit, cmd, export) — simple line icons, `stroke:currentColor`, 1.6 stroke. Replace with your icon system (e.g. Lucide) if preferred; shapes are intentionally minimal.
- The accent flourish is generated SVG (no asset).
- **Fonts:** UI uses system Helvetica Neue stack. Document themes reference web-safe/system fonts (Georgia, Garamond, Palatino, Bodoni, Didot, Gill Sans, Times, Courier, Arial Black, Helvetica) plus **Inter** (loaded from Google Fonts in the prototype) — keep Inter available or swap to your font stack.
- Original repo also has `public/favicon.svg` and `public/icons.svg` if you want the existing brand mark.

---

## Files (in this bundle)
- `WriteSpace.html` — shell markup + all CSS. Read the `<style>` block for exact values.
- `app/data.jsx` — themes + doc types + default content.
- `app/canvas.jsx` — `Editable`, `AccentFlourish`, `Stage` (the reusable interaction primitives).
- `app/templates.jsx` — the five document components + invoice math.
- `app/chrome.jsx` — launcher, dock, palette, theme panel, glyphs.
- `app/main.jsx` — app composition, state, keyboard, command list.
- `tweaks-panel.jsx` — prototype tweak harness only; **do not port**.

## Implementation order (suggested)
1. `<Stage>` (zoom/pan/drag) + render one static artboard.
2. `<Editable>` and wire one template's text.
3. Theme model + apply to a template; then the Theme Panel with live morph.
4. Remaining templates; invoice math.
5. `<AccentFlourish>` (move + endpoint handles).
6. Launcher → command palette → dock → keyboard.
7. Print/export.
