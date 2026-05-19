# WriteSpace

Professional document transformer with brand presets, style themes, and AI-powered writing tools.

---

## What it does

Paste or upload any text → apply a style theme + brand preset → get a beautifully formatted document ready for PDF export or sharing.

**Key features:**
- 60+ style themes across 9 categories (Luxury, Medical, Athletic, Corporate, Creative, Tech, Gradient, Hospitality, Specialty)
- Brand presets with full style snapshots saved to localStorage
- Per-page layout engine (Standard, Editorial, Minimal, Bold, Invoice)
- Invoice mode with live line-item math
- Gradient header builder with color + angle controls
- Google Fonts picker (36 fonts, single CDN request)
- File import: `.txt`, `.md`, `.pdf`, `.docx`
- Claude AI chat integration (bring your own API key)
- Google Docs import via share URL
- Merge fields `{{variable}}`, watermark, page numbers
- Direct in-preview text editing with right-click format menu
- Export as self-contained HTML or print to PDF

---

## Repo structure

```
src/
├── types/index.ts          ← all TypeScript interfaces
├── data/
│   ├── themes/             ← theme bank, split by category
│   │   ├── medical.ts
│   │   ├── luxury.ts
│   │   ├── athletic.ts
│   │   ├── corporate.ts
│   │   ├── creative.ts
│   │   ├── hospitality.ts
│   │   ├── tech.ts
│   │   ├── gradient.ts
│   │   ├── specialty.ts
│   │   └── index.ts        ← assembles THEMES[]
│   ├── presets/
│   │   ├── defaults.ts     ← 8 built-in brand presets
│   │   └── index.ts
│   ├── fonts/
│   │   ├── googleFonts.ts  ← 36 Google Fonts + CDN URL
│   │   └── index.ts
│   └── layouts.ts          ← 5 page layouts
├── lib/
│   ├── parseDocument.ts    ← document rendering engine
│   └── storage.ts          ← localStorage helpers
├── components/
│   ├── transform/          ← main workspace tab
│   ├── presets/            ← brand preset manager
│   ├── library/            ← style library browser
│   └── connect/            ← file import, AI, Google Docs
└── App.tsx                 ← main app shell
```

---

## Adding themes

Add a new theme object to the appropriate file in `src/data/themes/`. The `index.ts` assembles them all — no other changes needed.

```ts
// src/data/themes/luxury.ts
export const luxuryThemes: Theme[] = [
  {
    id: 'my-new-theme',
    name: 'My New Theme',
    category: 'Luxury',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    primaryColor: '#c9a84c',
    secondaryColor: '#f5f0e8',
    accentColor: '#8b6914',
    fontFamily: "'Garamond', Georgia, serif",
    borderColor: '#c9a84c',
    headerBg: '#1a1208',
    headerText: '#c9a84c',
    suggestedLayout: 'minimal',
  },
  // ...existing themes
];
```

## Adding brand presets

Add to `src/data/presets/defaults.ts`. Presets reference a `themeId` and can override any style property.

```ts
{
  id: 'preset-mycompany',
  name: 'My Company',
  themeId: 'my-new-theme',
  primaryColor: '#c9a84c',
  secondaryColor: '#f5f0e8',
  accentColor: '#8b6914',
  fontFamily: "'Garamond', Georgia, serif",
  logoText: '◆',
  companyName: 'My Company Inc.',
  tagline: 'Excellence in every document',
  headerGradient: true,
  headerBgOverride: '#1a1208',
  headerGradientColor2: '#c9a84c',
  headerGradientAngle: 135,
  headerFontSize: 24,
  bodyFontSize: 13,
}
```

---

## Dev setup

```bash
npm install
npm run dev        # localhost:5173
npm run build      # dist/
```

**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui

---

## Bundling to single HTML

After `npm run build`, run:

```bash
python3 scripts/bundle.py
```

Outputs `dist/writespace.html` — fully self-contained, no server needed.
