// ─── WriteSpace · data layer ────────────────────────────────────────────────
// Themes ported from the WriteSpace repo (curated set across all categories),
// plus document-type definitions + their default editable content.

const THEMES = [
  // ── Medical / Dental ──
  { id:'clinical-white', name:'Clinical White', category:'Medical', bg:'#ffffff', text:'#0a1628', primary:'#1d4ed8', secondary:'#eff6ff', accent:'#3b82f6', font:"'Helvetica Neue', Helvetica, Arial, sans-serif", border:'#1d4ed8', headerBg:'#1d4ed8', headerText:'#ffffff' },
  { id:'dental-pro', name:'Dental Pro', category:'Medical', bg:'#ffffff', text:'#1a2744', primary:'#1a2744', secondary:'#4a90d9', accent:'#4a90d9', font:'Georgia, serif', border:'#1a2744', headerBg:'#1a2744', headerText:'#ffffff' },
  { id:'orthodontics', name:'Orthodontics', category:'Medical', bg:'#f0fdff', text:'#0c3040', primary:'#0891b2', secondary:'#cffafe', accent:'#06b6d4', font:"'Gill Sans', Calibri, sans-serif", border:'#0891b2', headerBg:'#0891b2', headerText:'#ffffff' },
  { id:'pediatric-care', name:'Pediatric Care', category:'Medical', bg:'#fffbf0', text:'#2a1a2e', primary:'#7c3aed', secondary:'#fce7fe', accent:'#f59e0b', font:"'Trebuchet MS', sans-serif", border:'#7c3aed', headerBg:'linear-gradient(90deg,#f59e0b,#7c3aed)', headerText:'#ffffff' },
  { id:'chiropractic', name:'Chiropractic', category:'Medical', bg:'#f7f9f4', text:'#1a2e1a', primary:'#2d6a2d', secondary:'#e8f5e8', accent:'#4a9e4a', font:"Georgia, 'Times New Roman', serif", border:'#2d6a2d', headerBg:'#2d6a2d', headerText:'#f0f8f0' },

  // ── Luxury ──
  { id:'chanel-noir', name:'Chanel Noir', category:'Luxury', bg:'#ffffff', text:'#000000', primary:'#000000', secondary:'#f4f4f4', accent:'#000000', font:"'Bodoni MT', Didot, Georgia, serif", border:'#000000', headerBg:'#000000', headerText:'#ffffff' },
  { id:'emerald-prestige', name:'Emerald Prestige', category:'Luxury', bg:'#071a0f', text:'#e8f0e4', primary:'#d4a843', secondary:'#0d3320', accent:'#d4a843', font:"'Garamond', Georgia, serif", border:'#d4a843', headerBg:'#0d3320', headerText:'#d4a843' },
  { id:'hermes-orange', name:'Hermès Orange', category:'Luxury', bg:'#fdf5ee', text:'#2c1404', primary:'#e8622a', secondary:'#fce8d8', accent:'#c44a14', font:"Didot, 'Bodoni MT', serif", border:'#e8622a', headerBg:'#e8622a', headerText:'#fdf5ee' },
  { id:'black-diamond', name:'Black Diamond', category:'Luxury', bg:'#f8f8f8', text:'#080808', primary:'#1a1a1a', secondary:'#f0f0f0', accent:'#888888', font:"'Helvetica Neue', Helvetica, Arial, sans-serif", border:'#1a1a1a', headerBg:'#0a0a0a', headerText:'#e8e8e8' },
  { id:'medspa-luxe', name:'MedSpa Luxe', category:'Luxury', bg:'#fdf8f5', text:'#4a3728', primary:'#c9956b', secondary:'#e8c8b8', accent:'#b87d5a', font:"'Palatino Linotype', Palatino, serif", border:'#c9956b', headerBg:'#c9956b', headerText:'#ffffff' },
  { id:'victorian-noir', name:'Victorian Noir', category:'Luxury', bg:'#120608', text:'#e8d5b0', primary:'#c9a84c', secondary:'#8b1a1a', accent:'#c9a84c', font:"'Times New Roman', Times, serif", border:'#c9a84c', headerBg:'#1c0808', headerText:'#c9a84c' },

  // ── Corporate ──
  { id:'law-firm', name:'Law Firm', category:'Corporate', bg:'#f8f6f0', text:'#2c2416', primary:'#8b7355', secondary:'#c9b99a', accent:'#c9a44a', font:"'Garamond', Georgia, serif", border:'#8b7355', headerBg:'#2c2416', headerText:'#c9a44a' },
  { id:'arctic-minimal', name:'Arctic Minimal', category:'Corporate', bg:'#f8fbff', text:'#1a2840', primary:'#2b5797', secondary:'#ddeeff', accent:'#1a7abf', font:"'Helvetica Neue', Helvetica, Arial, sans-serif", border:'#b8d4e8', headerBg:'#b8d4e8', headerText:'#1a2840' },
  { id:'midnight-editorial', name:'Midnight Editorial', category:'Corporate', bg:'#07070f', text:'#c8c8e8', primary:'#6d5aed', secondary:'#13131f', accent:'#a78bfa', font:"'Inter', system-ui, sans-serif", border:'#4f46e5', headerBg:'#13131f', headerText:'#a78bfa' },

  // ── Tech ──
  { id:'dark-mode-dev', name:'Dark Mode Dev', category:'Tech', bg:'#0d1117', text:'#c9d1d9', primary:'#58a6ff', secondary:'#21262d', accent:'#3fb950', font:"'Courier New', Courier, monospace", border:'#30363d', headerBg:'#161b22', headerText:'#58a6ff' },
  { id:'saas-blue', name:'SaaS Blue', category:'Tech', bg:'#f0f4ff', text:'#1e2a4a', primary:'#3b82f6', secondary:'#dbeafe', accent:'#1d4ed8', font:"'Inter', system-ui, sans-serif", border:'#3b82f6', headerBg:'linear-gradient(135deg,#3b82f6,#6366f1)', headerText:'#ffffff' },

  // ── Creative ──
  { id:'neon-cyberpunk', name:'Neon Cyberpunk', category:'Creative', bg:'#050510', text:'#e0e0ff', primary:'#ff00cc', secondary:'#00ffee', accent:'#00ffee', font:"'Courier New', Courier, monospace", border:'#ff00cc', headerBg:'#0a0020', headerText:'#ff00cc' },
  { id:'manga-studio', name:'Manga Studio', category:'Creative', bg:'#ffffff', text:'#1a1a1a', primary:'#e60026', secondary:'#f5f5f5', accent:'#e60026', font:"'Arial Black', sans-serif", border:'#1a1a1a', headerBg:'#1a1a1a', headerText:'#e60026' },
  { id:'kraft-paper', name:'Kraft Paper', category:'Creative', bg:'#d4a96a', text:'#2c1810', primary:'#8b4513', secondary:'#c4813a', accent:'#5c2d0a', font:"'Courier New', Courier, monospace", border:'#8b4513', headerBg:'#8b4513', headerText:'#f5deb3' },

  // ── Hospitality ──
  { id:'restaurant-fine', name:'Restaurant Fine', category:'Hospitality', bg:'#1a0a04', text:'#f5e6c8', primary:'#c0392b', secondary:'#2c1810', accent:'#e8b96a', font:"Didot, 'Bodoni MT', Georgia, serif", border:'#c0392b', headerBg:'#c0392b', headerText:'#f5e6c8' },
  { id:'bourbon-street', name:'Bourbon Street', category:'Hospitality', bg:'#100804', text:'#f0e0c0', primary:'#d4891a', secondary:'#2a1508', accent:'#f0a030', font:"'Georgia', serif", border:'#d4891a', headerBg:'#1e0e06', headerText:'#d4891a' },
  { id:'terra-bloom', name:'Terra Bloom', category:'Hospitality', bg:'#faf0e6', text:'#3d1f0a', primary:'#c4612a', secondary:'#ffe8d6', accent:'#a0440a', font:"'Palatino Linotype', Palatino, serif", border:'#c4612a', headerBg:'#c4612a', headerText:'#fff8f0' },

  // ── Gradient ──
  { id:'aurora-borealis', name:'Aurora Borealis', category:'Gradient', bg:'#060d1a', text:'#d0eedd', primary:'#0d9488', secondary:'#1e1040', accent:'#34d399', font:"'Inter', system-ui, sans-serif", border:'#0d9488', headerBg:'linear-gradient(135deg,#7c3aed,#0d9488)', headerText:'#ffffff' },
  { id:'sunset-blaze', name:'Sunset Blaze', category:'Gradient', bg:'#fff8f0', text:'#2d1010', primary:'#f97316', secondary:'#fff0e8', accent:'#db2777', font:"'Georgia', serif", border:'#f97316', headerBg:'linear-gradient(135deg,#f97316,#db2777)', headerText:'#ffffff' },
  { id:'ocean-depth', name:'Ocean Depth', category:'Gradient', bg:'#040c18', text:'#c0d8f0', primary:'#0891b2', secondary:'#051020', accent:'#38bdf8', font:"'Helvetica Neue', Helvetica, sans-serif", border:'#0891b2', headerBg:'linear-gradient(135deg,#0891b2,#1e3a5f)', headerText:'#ffffff' },
  { id:'cosmic-galaxy', name:'Cosmic Galaxy', category:'Gradient', bg:'#02020e', text:'#ddd0ff', primary:'#7c3aed', secondary:'#0d0d24', accent:'#a78bfa', font:"'Inter', system-ui, sans-serif", border:'#7c3aed', headerBg:'linear-gradient(135deg,#7c3aed,#1e1b4b)', headerText:'#ffffff' },
  { id:'velvet-luxe', name:'Velvet Luxe', category:'Gradient', bg:'#080408', text:'#f0d8e8', primary:'#9b1c4a', secondary:'#150010', accent:'#c084fc', font:"'Times New Roman', Times, serif", border:'#7f1d1d', headerBg:'linear-gradient(135deg,#7f1d1d,#4c1d95)', headerText:'#fce7f3' },
  { id:'rose-gold-rush', name:'Rose Gold Rush', category:'Gradient', bg:'#fef8f5', text:'#2d1020', primary:'#e11d48', secondary:'#fce8e8', accent:'#d4a843', font:"'Palatino Linotype', Palatino, serif", border:'#e11d48', headerBg:'linear-gradient(135deg,#e11d48,#d4a843)', headerText:'#ffffff' },

  // ── Specialty ──
  { id:'wedding-planner', name:'Wedding Planner', category:'Specialty', bg:'#fefcf8', text:'#4a3728', primary:'#d4af8a', secondary:'#f0e6d6', accent:'#c9a060', font:"'Palatino Linotype', Palatino, serif", border:'#d4af8a', headerBg:'#fdf4e8', headerText:'#8b6040' },
];

const THEME_CATEGORIES = ['All', ...Array.from(new Set(THEMES.map(t => t.category)))];
const themeById = (id) => THEMES.find(t => t.id === id) || THEMES[0];

// ─── Document types ───────────────────────────────────────────────────────────
// Each type: artboard size (px), a default theme, and default editable content.
// Components live in templates.jsx and read `content` + `theme`.

const DOC_TYPES = [
  {
    id:'business-card', name:'Business Card', blurb:'3.5 × 2 in · premium stock', glyph:'card',
    defaultTheme:'black-diamond', w:1050, h:600,
    content:{
      name:'Adrian Vale', role:'Founder & Principal',
      company:'VALE & CO.', tagline:'STRATEGY · DESIGN · CAPITAL',
      phone:'+1 415 555 0147', email:'adrian@valeand.co',
      site:'valeand.co', address:'One Market St · San Francisco',
      monogram:'V', accentPos:{x:720,y:300},
    },
  },
  {
    id:'invoice', name:'Professional Invoice', blurb:'Live line-item math', glyph:'invoice',
    defaultTheme:'arctic-minimal', w:816, h:1056,
    content:{
      company:'Northbeam Studio', tagline:'Design & Development', monogram:'N',
      invoiceNo:'INV-2048', date:'June 3, 2026', due:'June 30, 2026',
      billTo:'Lighthouse Ventures', billAddr:'448 Howard Street\nSan Francisco, CA 94105',
      taxRate:8.5, accentPos:{x:120,y:770},
      items:[
        { desc:'Brand & identity system', qty:1, rate:6500 },
        { desc:'Marketing site design', qty:1, rate:4800 },
        { desc:'Front-end build (per page)', qty:6, rate:650 },
        { desc:'Motion & interaction pass', qty:1, rate:2400 },
      ],
      note:'Payment due within 30 days. Wire details on request. Thank you.',
    },
  },
  {
    id:'guidelines', name:'Medical Guidelines', blurb:'Clinical protocol sheet', glyph:'cross',
    defaultTheme:'clinical-white', w:816, h:1056,
    content:{
      org:'Meridian Health', dept:'Department of Internal Medicine', monogram:'+',
      title:'Hypertension Management Protocol', code:'CP-114 · Rev. 2026.2',
      intro:'This protocol standardizes the assessment and management of adult hypertension across all outpatient clinics. Apply alongside clinical judgment.',
      sections:[
        { h:'1 · Initial Assessment', b:'Confirm elevated BP on two separate readings. Measure in both arms; use the higher value. Document heart rate, BMI, and relevant history.' },
        { h:'2 · Staging', b:'Normal <120/80. Elevated 120–129/<80. Stage 1: 130–139 or 80–89. Stage 2: ≥140 or ≥90. Crisis: >180/120 — escalate immediately.' },
        { h:'3 · First-Line Therapy', b:'Initiate lifestyle modification for all patients. For Stage 1 with risk factors or Stage 2, begin pharmacotherapy per the algorithm below.' },
      ],
      checklist:[
        { t:'Two confirmed elevated readings on file', done:true },
        { t:'Secondary causes screened', done:true },
        { t:'Cardiovascular risk calculated', done:false },
        { t:'Patient counseled on lifestyle', done:false },
      ],
      footer:'Reviewed by the Clinical Standards Committee · Confidential',
      accentPos:{x:110,y:905},
    },
  },
  {
    id:'letterhead', name:'Letterhead', blurb:'Formal correspondence', glyph:'letter',
    defaultTheme:'law-firm', w:816, h:1056,
    content:{
      company:'Hartwell & Associates', tagline:'Attorneys at Law', monogram:'H',
      contact:'1200 Wilshire Blvd, Suite 400 · Los Angeles, CA 90017 · (213) 555-0190',
      date:'June 3, 2026',
      recipient:'Ms. Eleanor Pruitt\nPruitt Holdings, LLC\n88 Kearny Street, San Francisco',
      salutation:'Dear Ms. Pruitt,',
      body:'Thank you for entrusting our firm with the matter referenced above. Following our review of the documents you provided, we are pleased to share our preliminary assessment and the recommended path forward.\n\nWe have identified no material impediments to closing within the proposed timeline. Our team will circulate a revised draft for your review by the end of the week, and we remain available should any questions arise in the interim.',
      closing:'With warm regards,', signer:'Marcus Hartwell', signerRole:'Managing Partner',
      accentPos:{x:540,y:120},
    },
  },
  {
    id:'certificate', name:'Certificate', blurb:'Award · landscape', glyph:'seal',
    defaultTheme:'emerald-prestige', w:1056, h:816,
    content:{
      org:'THE EMERALD SOCIETY', monogram:'◆',
      kicker:'CERTIFICATE OF ACHIEVEMENT', presented:'This certificate is proudly presented to',
      recipient:'Juliette Marchetti', reason:'In recognition of outstanding distinction and exemplary dedication to the craft, conferred with the highest honors of the Society.',
      date:'June 3, 2026', sig1:'Director', sig2:'Chair of the Board',
      accentPos:{x:770,y:560},
    },
  },
];
const docTypeById = (id) => DOC_TYPES.find(d => d.id === id) || DOC_TYPES[0];

Object.assign(window, { THEMES, THEME_CATEGORIES, themeById, DOC_TYPES, docTypeById });
