// ─── WriteSpace · chrome (launcher · dock · palette · theme panel) ───────────

function Glyph({ name, size = 26 }) {
  const s = { width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    card: <g><rect x="3" y="6" width="18" height="12" rx="1.5" /><line x1="6" y1="14" x2="13" y2="14" /><circle cx="16.5" cy="11" r="2" /></g>,
    invoice: <g><path d="M6 3h9l3 3v15H6z" /><line x1="9" y1="10" x2="15" y2="10" /><line x1="9" y1="13.5" x2="15" y2="13.5" /><line x1="9" y1="17" x2="12.5" y2="17" /></g>,
    cross: <g><rect x="4" y="4" width="16" height="16" rx="2" /><line x1="12" y1="8.5" x2="12" y2="15.5" /><line x1="8.5" y1="12" x2="15.5" y2="12" /></g>,
    letter: <g><rect x="3" y="6" width="18" height="13" rx="1.5" /><path d="M3.5 7l8.5 6 8.5-6" /></g>,
    seal: <g><circle cx="12" cy="10" r="5.5" /><path d="M9 14.5l-1.5 6 4.5-2.5 4.5 2.5-1.5-6" /></g>,
    palette: <g><circle cx="12" cy="12" r="8.5" /><circle cx="9" cy="9.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="14.5" cy="9" r="1.2" fill="currentColor" stroke="none" /><circle cx="16" cy="13.5" r="1.2" fill="currentColor" stroke="none" /></g>,
    plus: <g><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></g>,
    fit: <g><path d="M4 8V4h4" /><path d="M20 8V4h-4" /><path d="M4 16v4h4" /><path d="M20 16v4h-4" /></g>,
    cmd: <g><path d="M9 6a2.5 2.5 0 1 0 2.5 2.5V6zM15 6a2.5 2.5 0 1 1-2.5 2.5V6z" transform="translate(-1.5 1.5)" /><rect x="8" y="8" width="8" height="8" rx="1.5" /></g>,
    export: <g><path d="M12 15V4" /><path d="M8 8l4-4 4 4" /><path d="M5 16v3h14v-3" /></g>,
  };
  return <svg viewBox="0 0 24 24" style={s}>{paths[name] || paths.card}</svg>;
}

// Spotlight launcher — forge a new document
function Launcher({ open, onPick, onClose }) {
  if (!open) return null;
  return (
    <div className="ws-launcher" onClick={onClose}>
      <div className="ws-launcher-card" onClick={(e) => e.stopPropagation()}>
        <div className="ws-launcher-head">
          <span className="ws-spark" />
          <span>Forge a document</span>
        </div>
        <div className="ws-launcher-grid">
          {DOC_TYPES.map((d) => {
            const t = themeById(d.defaultTheme);
            return (
              <button key={d.id} className="ws-launch-tile" onClick={() => onPick(d.id)}>
                <div className="ws-launch-glyph" style={{ color: t.primary }}><Glyph name={d.glyph} size={30} /></div>
                <div className="ws-launch-name">{d.name}</div>
                <div className="ws-launch-blurb">{d.blurb}</div>
                <div className="ws-launch-swatches">
                  {[t.headerBg, t.primary, t.accent, t.bg].map((c, i) => <span key={i} style={{ background: c }} />)}
                </div>
              </button>
            );
          })}
        </div>
        <div className="ws-launcher-foot">Press <kbd>esc</kbd> to dismiss</div>
      </div>
    </div>
  );
}

// Floating dock — expands on hover
function Dock({ onNew, onThemes, onFit, onPalette, onExport, themesOpen }) {
  const items = [
    { id: 'new', glyph: 'plus', label: 'New', fn: onNew },
    { id: 'themes', glyph: 'palette', label: 'Themes', fn: onThemes, active: themesOpen },
    { id: 'fit', glyph: 'fit', label: 'Fit', fn: onFit },
    { id: 'cmd', glyph: 'cmd', label: '⌘K', fn: onPalette },
    { id: 'export', glyph: 'export', label: 'Export', fn: onExport },
  ];
  return (
    <div className="ws-dock">
      {items.map((it) => (
        <button key={it.id} className={'ws-dock-btn' + (it.active ? ' is-active' : '')} onClick={it.fn}>
          <Glyph name={it.glyph} size={22} />
          <span className="ws-dock-label">{it.label}</span>
        </button>
      ))}
    </div>
  );
}

// Command palette (⌘K)
function CommandPalette({ open, onClose, commands }) {
  const [q, setQ] = React.useState('');
  const [idx, setIdx] = React.useState(0);
  const inputRef = React.useRef(null);
  React.useEffect(() => { if (open) { setQ(''); setIdx(0); setTimeout(() => inputRef.current?.focus(), 30); } }, [open]);
  if (!open) return null;
  const filtered = commands.filter((c) => (c.label + ' ' + (c.group || '')).toLowerCase().includes(q.toLowerCase()));
  const run = (c) => { c.fn(); onClose(); };
  return (
    <div className="ws-palette" onClick={onClose}>
      <div className="ws-palette-card" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="ws-palette-input"
          placeholder="Search actions, doc types, themes…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setIdx(0); }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(filtered.length - 1, i + 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
            if (e.key === 'Enter' && filtered[idx]) run(filtered[idx]);
          }}
        />
        <div className="ws-palette-list">
          {filtered.length === 0 && <div className="ws-palette-empty">No matches</div>}
          {filtered.map((c, i) => (
            <button key={c.id} className={'ws-palette-item' + (i === idx ? ' is-active' : '')} onMouseEnter={() => setIdx(i)} onClick={() => run(c)}>
              {c.swatch && <span className="ws-palette-swatch" style={{ background: c.swatch }} />}
              <span className="ws-palette-label">{c.label}</span>
              {c.group && <span className="ws-palette-group">{c.group}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Slide-in theme browser. Hover a swatch → live-morph the document.
function ThemePanel({ open, current, onHover, onPick, onClose }) {
  const [cat, setCat] = React.useState('All');
  const list = THEMES.filter((t) => cat === 'All' || t.category === cat);
  return (
    <div className={'ws-themepanel' + (open ? ' is-open' : '')} onMouseLeave={() => onHover(null)}>
      <div className="ws-tp-head">
        <span>Themes</span>
        <button className="ws-tp-close" onClick={onClose}>×</button>
      </div>
      <div className="ws-tp-cats">
        {THEME_CATEGORIES.map((c) => (
          <button key={c} className={'ws-tp-cat' + (cat === c ? ' is-active' : '')} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      <div className="ws-tp-grid">
        {list.map((t) => (
          <button
            key={t.id}
            className={'ws-tp-card' + (current === t.id ? ' is-current' : '')}
            onMouseEnter={() => onHover(t.id)}
            onClick={() => onPick(t.id)}
          >
            <div className="ws-tp-preview" style={{ background: t.bg }}>
              <div className="ws-tp-band" style={{ background: t.headerBg }} />
              <div className="ws-tp-lines">
                <span style={{ background: t.text, width: '70%' }} />
                <span style={{ background: t.primary, width: '45%' }} />
                <span style={{ background: t.text, opacity: 0.4, width: '85%' }} />
              </div>
              <span className="ws-tp-dot" style={{ background: t.accent }} />
            </div>
            <div className="ws-tp-name">{t.name}</div>
            <div className="ws-tp-cat-label">{t.category}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Glyph, Launcher, Dock, CommandPalette, ThemePanel });
