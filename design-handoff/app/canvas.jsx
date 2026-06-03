// ─── WriteSpace · canvas primitives ─────────────────────────────────────────
const { useState, useEffect, useRef, useCallback } = React;

// Double-click any text to edit inline. Enter commits (single-line), Esc cancels.
function Editable({ value, onChange, tag = 'div', style, multiline = false, className = '' }) {
  const ref = useRef(null);
  const [editing, setEditing] = useState(false);
  const Tag = tag;

  useEffect(() => {
    if (editing && ref.current) {
      const el = ref.current;
      el.innerText = value;
      el.focus();
      const r = document.createRange();
      r.selectNodeContents(el);
      const s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
    }
  }, [editing]); // eslint-disable-line

  const commit = () => {
    if (!editing) return;
    const txt = ref.current.innerText.replace(/\u00a0/g, ' ');
    setEditing(false);
    if (txt !== value) onChange(txt);
  };

  return (
    <Tag
      ref={ref}
      contentEditable={editing}
      suppressContentEditableWarning
      spellCheck={false}
      className={'ws-editable' + (editing ? ' is-editing' : '') + (className ? ' ' + className : '')}
      style={{ whiteSpace: multiline ? 'pre-wrap' : 'normal', ...style }}
      onPointerDown={(e) => { if (editing) e.stopPropagation(); }}
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (!multiline && e.key === 'Enter') { e.preventDefault(); ref.current.blur(); }
        if (e.key === 'Escape') { e.preventDefault(); setEditing(false); }
      }}
    >
      {editing ? null : value}
    </Tag>
  );
}

// A draggable decorative flourish. Drag the body to move it; when selected,
// drag either endpoint handle to reshape the curve. `zoom` keeps pointer math true.
function AccentFlourish({ state, onChange, color, zoom, selected, onSelect }) {
  const W = 230, H = 150;
  const { x, y } = state.pos;
  const p1 = state.p1 || { x: 14, y: 96 };
  const p2 = state.p2 || { x: 216, y: 54 };
  // control point: midpoint pulled toward the upper region for a calligraphic sweep
  const cx = (p1.x + p2.x) / 2;
  const cy = Math.min(p1.y, p2.y) - 46;
  const drag = useRef(null);

  const onDown = (mode) => (e) => {
    e.stopPropagation();
    e.target.setPointerCapture?.(e.pointerId);
    onSelect();
    drag.current = { mode, sx: e.clientX, sy: e.clientY, start: JSON.parse(JSON.stringify({ pos: state.pos, p1, p2 })) };
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const dx = (e.clientX - drag.current.sx) / zoom;
    const dy = (e.clientY - drag.current.sy) / zoom;
    const s = drag.current.start;
    if (drag.current.mode === 'move') onChange({ ...state, pos: { x: s.pos.x + dx, y: s.pos.y + dy } });
    if (drag.current.mode === 'p1') onChange({ ...state, p1: { x: s.p1.x + dx, y: s.p1.y + dy } });
    if (drag.current.mode === 'p2') onChange({ ...state, p2: { x: s.p2.x + dx, y: s.p2.y + dy } });
  };
  const onUp = () => { drag.current = null; };

  return (
    <div
      className={'ws-accent' + (selected ? ' is-selected' : '')}
      style={{ left: x, top: y, width: W, height: H }}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <svg width={W} height={H} style={{ overflow: 'visible', display: 'block' }}>
        {/* fat invisible hit-line for grabbing the body */}
        <path d={`M${p1.x},${p1.y} Q${cx},${cy} ${p2.x},${p2.y}`} stroke="transparent" strokeWidth="26" fill="none"
              style={{ cursor: 'grab' }} onPointerDown={onDown('move')} />
        <path d={`M${p1.x},${p1.y} Q${cx},${cy} ${p2.x},${p2.y}`} stroke={color} strokeWidth="2.5" fill="none"
              strokeLinecap="round" pointerEvents="none" />
        <circle cx={p1.x} cy={p1.y} r="4.5" fill={color} pointerEvents="none" />
        <circle cx={p2.x} cy={p2.y} r="4.5" fill={color} pointerEvents="none" />
        {selected && (
          <g>
            <circle className="ws-handle" cx={p1.x} cy={p1.y} r="9" onPointerDown={onDown('p1')} />
            <circle className="ws-handle" cx={p2.x} cy={p2.y} r="9" onPointerDown={onDown('p2')} />
          </g>
        )}
      </svg>
    </div>
  );
}

// The infinite cinematic stage: wheel to zoom toward cursor, drag empty space to
// pan, drag the document body to pick it up and move it.
function Stage({ view, setView, docPos, setDocPos, onDeselect, children }) {
  const ref = useRef(null);
  const drag = useRef(null);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    setView((v) => {
      if (e.ctrlKey || e.metaKey) {
        const rect = ref.current.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        const factor = Math.exp(-e.deltaY * 0.0015);
        const nz = Math.min(2.4, Math.max(0.3, v.zoom * factor));
        const k = nz / v.zoom;
        return { zoom: nz, x: mx - (mx - v.x) * k, y: my - (my - v.y) * k };
      }
      return { ...v, x: v.x - e.deltaX, y: v.y - e.deltaY };
    });
  }, [setView]);

  useEffect(() => {
    const el = ref.current;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  const startPan = (e) => {
    if (e.button !== 0) return;
    onDeselect?.();
    drag.current = { mode: 'pan', sx: e.clientX, sy: e.clientY, start: { ...view } };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const startDoc = (e) => {
    e.stopPropagation();
    drag.current = { mode: 'doc', sx: e.clientX, sy: e.clientY, start: { ...docPos } };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.sx, dy = e.clientY - drag.current.sy;
    if (drag.current.mode === 'pan') setView((v) => ({ ...v, x: drag.current.start.x + dx, y: drag.current.start.y + dy }));
    if (drag.current.mode === 'doc') setDocPos({ x: drag.current.start.x + dx / view.zoom, y: drag.current.start.y + dy / view.zoom });
  };
  const end = () => { drag.current = null; };

  return (
    <div ref={ref} className="ws-stage" onPointerDown={startPan} onPointerMove={move} onPointerUp={end} onPointerLeave={end}>
      <div className="ws-world" style={{ transform: `translate(${view.x}px,${view.y}px) scale(${view.zoom})` }}>
        <div className="ws-docpos" style={{ transform: `translate(${docPos.x}px,${docPos.y}px)` }} onPointerDown={startDoc}>
          {children}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Editable, AccentFlourish, Stage });
