// ─── WriteSpace · app shell ──────────────────────────────────────────────────
const { useState: uS, useEffect: uE, useCallback: uC, useRef: uR } = React;

const SHELL_MOODS = {
  graphite: { bg: '#0d0d0f', bg2: '#161619', panel: 'rgba(28,28,32,0.86)', text: '#ececf0', muted: '#8a8a93', border: 'rgba(255,255,255,0.09)' },
  ink:      { bg: '#080b16', bg2: '#0f1424', panel: 'rgba(18,24,42,0.88)', text: '#e6ebf5', muted: '#7d88a3', border: 'rgba(150,170,220,0.12)' },
  bone:     { bg: '#1a1815', bg2: '#221f1b', panel: 'rgba(40,36,31,0.9)', text: '#f2ede4', muted: '#9c9384', border: 'rgba(255,245,225,0.1)' },
};
const ACCENTS = { ember: '#e07a3c', gold: '#d4a64a', teal: '#3fb6a8', violet: '#9a7cf0' };
const MOTION = { lavish: '0.55s', tasteful: '0.32s', minimal: '0.14s' };

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mood": "graphite",
  "accent": "ember",
  "motion": "tasteful",
  "dotGrid": true,
  "spotlight": true
}/*EDITMODE-END*/;

function fitView(w, h) {
  const vw = window.innerWidth, vh = window.innerHeight;
  const zoom = Math.min((vw - 220) / w, (vh - 200) / h, 1.15);
  return { zoom, x: (vw - w * zoom) / 2, y: (vh - h * zoom) / 2 };
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [doc, setDoc] = uS(null); // { typeId, content }
  const [themeId, setThemeId] = uS(null);
  const [preview, setPreview] = uS(null); // hovered theme id
  const [view, setView] = uS({ zoom: 1, x: 0, y: 0 });
  const [docPos, setDocPos] = uS({ x: 0, y: 0 });
  const [launcher, setLauncher] = uS(true);
  const [themesOpen, setThemesOpen] = uS(false);
  const [palette, setPalette] = uS(false);
  const [accentSel, setAccentSel] = uS(false);

  // apply shell theme vars
  uE(() => {
    const m = SHELL_MOODS[t.mood] || SHELL_MOODS.graphite;
    const r = document.documentElement.style;
    r.setProperty('--bg', m.bg); r.setProperty('--bg2', m.bg2); r.setProperty('--panel', m.panel);
    r.setProperty('--text', m.text); r.setProperty('--muted', m.muted); r.setProperty('--border', m.border);
    r.setProperty('--accent', ACCENTS[t.accent] || ACCENTS.ember);
    r.setProperty('--dur', MOTION[t.motion] || MOTION.tasteful);
    document.body.classList.toggle('no-grid', !t.dotGrid);
    document.body.classList.toggle('no-spot', !t.spotlight);
  }, [t.mood, t.accent, t.motion, t.dotGrid, t.spotlight]);

  const createDoc = uC((typeId) => {
    const d = docTypeById(typeId);
    const content = JSON.parse(JSON.stringify(d.content));
    content.accent = { pos: { ...(content.accentPos || { x: 60, y: 60 }) }, p1: { x: 14, y: 96 }, p2: { x: 216, y: 54 } };
    setDoc({ typeId, content });
    setThemeId(d.defaultTheme);
    setPreview(null);
    setLauncher(false);
    setAccentSel(false);
    setDocPos({ x: 0, y: 0 });
    setView(fitView(d.w, d.h));
  }, []);

  const set = uC((field, value) => setDoc((dd) => ({ ...dd, content: { ...dd.content, [field]: value } })), []);
  const fit = uC(() => { if (doc) { const d = docTypeById(doc.typeId); setDocPos({ x: 0, y: 0 }); setView(fitView(d.w, d.h)); } }, [doc]);

  // keyboard
  uE(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette((p) => !p); }
      else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') { e.preventDefault(); setLauncher(true); }
      else if (e.key === 'Escape') { setPalette(false); setLauncher(false); setThemesOpen(false); setAccentSel(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const effTheme = themeById(preview || themeId);
  const DocComp = doc ? DOC_COMPONENTS[doc.typeId] : null;
  const dt = doc ? docTypeById(doc.typeId) : null;

  // command palette commands
  const commands = [
    ...DOC_TYPES.map((d) => ({ id: 'new-' + d.id, label: 'New · ' + d.name, group: 'Create', fn: () => createDoc(d.id) })),
    { id: 'themes', label: 'Browse themes', group: 'View', fn: () => setThemesOpen(true) },
    { id: 'fit', label: 'Fit to screen', group: 'View', fn: fit },
    { id: 'zin', label: 'Zoom in', group: 'View', fn: () => setView((v) => ({ ...v, zoom: Math.min(2.4, v.zoom * 1.2) })) },
    { id: 'zout', label: 'Zoom out', group: 'View', fn: () => setView((v) => ({ ...v, zoom: Math.max(0.3, v.zoom / 1.2) })) },
    { id: 'export', label: 'Export / Print document', group: 'Output', fn: doExport },
    ...THEMES.map((th) => ({ id: 'th-' + th.id, label: 'Theme · ' + th.name, group: th.category, swatch: th.primary, fn: () => { setThemeId(th.id); setPreview(null); } })),
  ];

  function doExport() {
    if (!doc) return;
    document.body.classList.add('ws-printing');
    setTimeout(() => { window.print(); setTimeout(() => document.body.classList.remove('ws-printing'), 400); }, 60);
  }

  return (
    <div className="ws-shell">
      <div className="ws-wordmark">Write<span>Space</span></div>
      {doc && <div className="ws-status">{dt.name} · {effTheme.name} · {Math.round(view.zoom * 100)}%</div>}

      {doc && (
        <Stage view={view} setView={setView} docPos={docPos} setDocPos={setDocPos} onDeselect={() => setAccentSel(false)}>
          <div className="ws-docframe">
            <DocComp theme={effTheme} c={doc.content} set={set} zoom={view.zoom} sel={accentSel} onSel={() => setAccentSel(true)} />
          </div>
        </Stage>
      )}

      {!doc && !launcher && (
        <div className="ws-empty"><button onClick={() => setLauncher(true)}>Forge a document</button></div>
      )}

      {doc && <Dock onNew={() => setLauncher(true)} onThemes={() => setThemesOpen((o) => !o)} onFit={fit} onPalette={() => setPalette(true)} onExport={doExport} themesOpen={themesOpen} />}

      <ThemePanel open={themesOpen} current={themeId} onHover={setPreview} onPick={(id) => { setThemeId(id); setPreview(null); }} onClose={() => setThemesOpen(false)} />
      <Launcher open={launcher} onPick={createDoc} onClose={() => doc && setLauncher(false)} />
      <CommandPalette open={palette} onClose={() => setPalette(false)} commands={commands} />

      <TweaksPanel>
        <TweakSection label="Shell mood" />
        <TweakRadio label="Surface" value={t.mood} options={['graphite', 'ink', 'bone']} onChange={(v) => setTweak('mood', v)} />
        <TweakColor label="Accent" value={ACCENTS[t.accent]} options={Object.values(ACCENTS)} onChange={(v) => setTweak('accent', Object.keys(ACCENTS).find((k) => ACCENTS[k] === v) || 'ember')} />
        <TweakSection label="Atmosphere" />
        <TweakRadio label="Motion" value={t.motion} options={['minimal', 'tasteful', 'lavish']} onChange={(v) => setTweak('motion', v)} />
        <TweakToggle label="Dot grid" value={t.dotGrid} onChange={(v) => setTweak('dotGrid', v)} />
        <TweakToggle label="Spotlight glow" value={t.spotlight} onChange={(v) => setTweak('spotlight', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
