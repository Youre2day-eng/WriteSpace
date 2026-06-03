# WriteSpace — Document OS

## Design handoff
All source-of-truth design files live in `design-handoff/`. Read these before touching any UI:

- `design-handoff/README.md` — full spec: screens, interactions, tokens, architecture, implementation order
- `design-handoff/WriteSpace.html` — all shell CSS (exact custom properties, animations, component classes)
- `design-handoff/app/data.jsx` — 29 THEMES[] + 5 DOC_TYPES[] with default content
- `design-handoff/app/canvas.jsx` — Editable, AccentFlourish, Stage (zoom/pan/drag logic)
- `design-handoff/app/templates.jsx` — five document templates + invoice math
- `design-handoff/app/chrome.jsx` — Launcher, Dock, CommandPalette, ThemePanel, Glyph icons
- `design-handoff/app/main.jsx` — App state, keyboard shortcuts, command list

## Stack
React 18 + TypeScript + Vite + Tailwind + shadcn/ui. Existing data lives in `src/data/` and `src/types/`.

## Key rules
- Recreate the design **pixel-accurately** — colors, spacing, motion are final
- Document themes are **data-driven** from THEMES[] — never hard-code theme colors into templates
- The `tweaks-panel.jsx` in the handoff is prototype-only — do NOT port it
- CSS custom properties from `WriteSpace.html <style>` are the ground truth for shell tokens
