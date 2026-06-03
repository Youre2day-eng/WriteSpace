// ─── WriteSpace · document templates ────────────────────────────────────────
// Each template renders a native-size artboard. Text nodes are <Editable>.
// Every doc carries one draggable AccentFlourish (theme accent color).

const fmt = (n) => '$' + (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Accent({ c, set, theme, zoom, sel, onSel }) {
  return (
    <AccentFlourish
      state={c.accent || { pos: c.accentPos || { x: 60, y: 60 } }}
      onChange={(s) => set('accent', s)}
      color={theme.accent}
      zoom={zoom}
      selected={sel}
      onSelect={onSel}
    />
  );
}

// ── Business Card ──────────────────────────────────────────────────────────
function DocBusinessCard({ theme, c, set, zoom, sel, onSel }) {
  return (
    <div className="artboard" style={{ width: 1050, height: 600, background: theme.bg, color: theme.text, fontFamily: theme.font }}>
      <div style={{ position: 'absolute', inset: 0, padding: 64, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
            <div style={{ width: 76, height: 76, borderRadius: 4, background: theme.headerBg, color: theme.headerText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 700 }}>
              <Editable value={c.monogram} onChange={(v) => set('monogram', v)} />
            </div>
            <div>
              <Editable value={c.company} onChange={(v) => set('company', v)} style={{ fontSize: 28, fontWeight: 700, letterSpacing: 3 }} />
              <Editable value={c.tagline} onChange={(v) => set('tagline', v)} style={{ fontSize: 12, letterSpacing: 4, opacity: 0.6, marginTop: 6 }} />
            </div>
          </div>
        </div>
        <div>
          <Editable value={c.name} onChange={(v) => set('name', v)} style={{ fontSize: 52, fontWeight: 700, letterSpacing: -1 }} />
          <Editable value={c.role} onChange={(v) => set('role', v)} style={{ fontSize: 19, color: theme.primary, marginTop: 4, letterSpacing: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 56, fontSize: 15, borderTop: `1px solid ${theme.border}33`, paddingTop: 22 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Editable value={c.phone} onChange={(v) => set('phone', v)} />
            <Editable value={c.email} onChange={(v) => set('email', v)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Editable value={c.site} onChange={(v) => set('site', v)} style={{ color: theme.primary, fontWeight: 600 }} />
            <Editable value={c.address} onChange={(v) => set('address', v)} style={{ opacity: 0.7 }} />
          </div>
        </div>
      </div>
      <Accent c={c} set={set} theme={theme} zoom={zoom} sel={sel} onSel={onSel} />
    </div>
  );
}

// ── Professional Invoice ─────────────────────────────────────────────────────
function DocInvoice({ theme, c, set, zoom, sel, onSel }) {
  const items = c.items || [];
  const subtotal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.rate) || 0), 0);
  const tax = subtotal * (Number(c.taxRate) || 0) / 100;
  const total = subtotal + tax;
  const setItem = (i, k, v) => set('items', items.map((it, idx) => idx === i ? { ...it, [k]: k === 'desc' ? v : (parseFloat(v.replace(/[^0-9.]/g, '')) || 0) } : it));
  const addItem = () => set('items', [...items, { desc: 'New line item', qty: 1, rate: 0 }]);
  const delItem = (i) => set('items', items.filter((_, idx) => idx !== i));

  return (
    <div className="artboard" style={{ width: 816, height: 1056, background: theme.bg, color: theme.text, fontFamily: theme.font }}>
      <div style={{ background: theme.headerBg, color: theme.headerText, padding: '34px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 6, border: `2px solid ${theme.headerText}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
            <Editable value={c.monogram} onChange={(v) => set('monogram', v)} />
          </div>
          <div>
            <Editable value={c.company} onChange={(v) => set('company', v)} style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }} />
            <Editable value={c.tagline} onChange={(v) => set('tagline', v)} style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }} />
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 4 }}>INVOICE</div>
          <Editable value={c.invoiceNo} onChange={(v) => set('invoiceNo', v)} style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }} />
        </div>
      </div>

      <div style={{ padding: '32px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: theme.primary, fontWeight: 700, marginBottom: 6 }}>Bill To</div>
            <Editable value={c.billTo} onChange={(v) => set('billTo', v)} style={{ fontWeight: 700, fontSize: 15 }} />
            <Editable value={c.billAddr} onChange={(v) => set('billAddr', v)} multiline style={{ opacity: 0.7, marginTop: 4, lineHeight: 1.5 }} />
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div><span style={{ opacity: 0.55 }}>Issued&nbsp;&nbsp;</span><Editable tag="span" value={c.date} onChange={(v) => set('date', v)} style={{ fontWeight: 600 }} /></div>
            <div><span style={{ opacity: 0.55 }}>Due&nbsp;&nbsp;</span><Editable tag="span" value={c.due} onChange={(v) => set('due', v)} style={{ fontWeight: 600 }} /></div>
          </div>
        </div>

        <div style={{ borderTop: `2px solid ${theme.primary}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 110px 120px 28px', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: theme.primary, fontWeight: 700, padding: '10px 0' }}>
            <div>Description</div><div style={{ textAlign: 'right' }}>Qty</div><div style={{ textAlign: 'right' }}>Rate</div><div style={{ textAlign: 'right' }}>Amount</div><div />
          </div>
          {items.map((it, i) => (
            <div key={i} className="ws-row" style={{ display: 'grid', gridTemplateColumns: '1fr 70px 110px 120px 28px', fontSize: 14, padding: '11px 0', borderTop: `1px solid ${theme.border}22`, alignItems: 'center' }}>
              <Editable value={it.desc} onChange={(v) => setItem(i, 'desc', v)} />
              <Editable value={String(it.qty)} onChange={(v) => setItem(i, 'qty', v)} style={{ textAlign: 'right' }} />
              <Editable value={fmt(it.rate)} onChange={(v) => setItem(i, 'rate', v)} style={{ textAlign: 'right' }} />
              <div style={{ textAlign: 'right', fontWeight: 600 }}>{fmt((Number(it.qty) || 0) * (Number(it.rate) || 0))}</div>
              <button className="ws-rowdel" onClick={() => delItem(i)} title="Remove line">×</button>
            </div>
          ))}
          <button className="ws-addrow" style={{ color: theme.primary }} onClick={addItem}>+ Add line item</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 22 }}>
          <div style={{ minWidth: 280 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '6px 0' }}><span style={{ opacity: 0.6 }}>Subtotal</span><span>{fmt(subtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '6px 0' }}>
              <span style={{ opacity: 0.6, whiteSpace: 'nowrap' }}>Tax (<Editable tag="span" value={String(c.taxRate)} onChange={(v) => set('taxRate', parseFloat(v) || 0)} />%)</span><span>{fmt(tax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 19, fontWeight: 800, padding: '12px 0', marginTop: 4, borderTop: `2px solid ${theme.primary}`, color: theme.primary }}><span>TOTAL</span><span>{fmt(total)}</span></div>
          </div>
        </div>

        <Editable value={c.note} onChange={(v) => set('note', v)} multiline style={{ marginTop: 40, fontSize: 12.5, opacity: 0.65, lineHeight: 1.6, borderTop: `1px solid ${theme.border}33`, paddingTop: 16 }} />
      </div>
      <Accent c={c} set={set} theme={theme} zoom={zoom} sel={sel} onSel={onSel} />
    </div>
  );
}

// ── Medical Guidelines ───────────────────────────────────────────────────────
function DocGuidelines({ theme, c, set, zoom, sel, onSel }) {
  const sections = c.sections || [];
  const checklist = c.checklist || [];
  const setSection = (i, k, v) => set('sections', sections.map((s, idx) => idx === i ? { ...s, [k]: v } : s));
  const toggle = (i) => set('checklist', checklist.map((it, idx) => idx === i ? { ...it, done: !it.done } : it));
  const setCheck = (i, v) => set('checklist', checklist.map((it, idx) => idx === i ? { ...it, t: v } : it));

  return (
    <div className="artboard" style={{ width: 816, height: 1056, background: theme.bg, color: theme.text, fontFamily: theme.font }}>
      <div style={{ background: theme.headerBg, color: theme.headerText, padding: '28px 48px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 46, height: 46, borderRadius: 8, background: theme.headerText, color: theme.headerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800, lineHeight: 1 }}>
          <Editable value={c.monogram} onChange={(v) => set('monogram', v)} />
        </div>
        <div>
          <Editable value={c.org} onChange={(v) => set('org', v)} style={{ fontSize: 20, fontWeight: 700 }} />
          <Editable value={c.dept} onChange={(v) => set('dept', v)} style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }} />
        </div>
      </div>
      <div style={{ padding: '34px 48px' }}>
        <Editable value={c.title} onChange={(v) => set('title', v)} style={{ fontSize: 28, fontWeight: 700, color: theme.primary, lineHeight: 1.15 }} />
        <Editable value={c.code} onChange={(v) => set('code', v)} style={{ fontSize: 12, letterSpacing: 1, opacity: 0.55, marginTop: 6, textTransform: 'uppercase' }} />
        <Editable value={c.intro} onChange={(v) => set('intro', v)} multiline style={{ fontSize: 14, lineHeight: 1.65, marginTop: 18, opacity: 0.9 }} />

        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sections.map((s, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${theme.accent}`, paddingLeft: 16 }}>
              <Editable value={s.h} onChange={(v) => setSection(i, 'h', v)} style={{ fontSize: 16, fontWeight: 700, color: theme.primary }} />
              <Editable value={s.b} onChange={(v) => setSection(i, 'b', v)} multiline style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 6, opacity: 0.88 }} />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 30, background: theme.secondary, borderRadius: 10, padding: '20px 24px' }}>
          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 700, color: theme.primary, marginBottom: 12 }}>Clinical Checklist</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {checklist.map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="ws-check" onClick={() => toggle(i)} style={{ borderColor: theme.primary, background: it.done ? theme.primary : 'transparent', color: theme.bg }}>{it.done ? '✓' : ''}</button>
                <Editable value={it.t} onChange={(v) => setCheck(i, v)} style={{ fontSize: 13.5, textDecoration: it.done ? 'line-through' : 'none', opacity: it.done ? 0.55 : 1 }} />
              </div>
            ))}
          </div>
        </div>

        <Editable value={c.footer} onChange={(v) => set('footer', v)} style={{ marginTop: 30, fontSize: 11, opacity: 0.5, borderTop: `1px solid ${theme.border}33`, paddingTop: 14, letterSpacing: 0.5 }} />
      </div>
      <Accent c={c} set={set} theme={theme} zoom={zoom} sel={sel} onSel={onSel} />
    </div>
  );
}

// ── Letterhead ───────────────────────────────────────────────────────────────
function DocLetterhead({ theme, c, set, zoom, sel, onSel }) {
  return (
    <div className="artboard" style={{ width: 816, height: 1056, background: theme.bg, color: theme.text, fontFamily: theme.font }}>
      <div style={{ padding: '40px 56px 22px', borderBottom: `3px double ${theme.primary}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', background: theme.headerBg, color: theme.headerText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>
            <Editable value={c.monogram} onChange={(v) => set('monogram', v)} />
          </div>
          <div>
            <Editable value={c.company} onChange={(v) => set('company', v)} style={{ fontSize: 26, fontWeight: 700, color: theme.primary, letterSpacing: 0.5 }} />
            <Editable value={c.tagline} onChange={(v) => set('tagline', v)} style={{ fontSize: 13, opacity: 0.7, letterSpacing: 3, textTransform: 'uppercase', marginTop: 2 }} />
          </div>
        </div>
      </div>
      <div style={{ padding: '12px 56px 0', fontSize: 10.5, letterSpacing: 0.5, opacity: 0.6, textAlign: 'center' }}>
        <Editable value={c.contact} onChange={(v) => set('contact', v)} />
      </div>
      <div style={{ padding: '40px 56px' }}>
        <Editable value={c.date} onChange={(v) => set('date', v)} style={{ fontSize: 13.5, opacity: 0.75 }} />
        <Editable value={c.recipient} onChange={(v) => set('recipient', v)} multiline style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 26 }} />
        <Editable value={c.salutation} onChange={(v) => set('salutation', v)} style={{ fontSize: 14, marginTop: 26, fontWeight: 600 }} />
        <Editable value={c.body} onChange={(v) => set('body', v)} multiline style={{ fontSize: 14, lineHeight: 1.7, marginTop: 16 }} />
        <div style={{ marginTop: 36 }}>
          <Editable value={c.closing} onChange={(v) => set('closing', v)} style={{ fontSize: 14 }} />
          <div style={{ height: 30 }} />
          <div style={{ width: 220, borderBottom: `1px solid ${theme.primary}` }} />
          <Editable value={c.signer} onChange={(v) => set('signer', v)} style={{ fontSize: 14, fontWeight: 700, marginTop: 6, color: theme.primary }} />
          <Editable value={c.signerRole} onChange={(v) => set('signerRole', v)} style={{ fontSize: 12, opacity: 0.65 }} />
        </div>
      </div>
      <Accent c={c} set={set} theme={theme} zoom={zoom} sel={sel} onSel={onSel} />
    </div>
  );
}

// ── Certificate (landscape) ──────────────────────────────────────────────────
function DocCertificate({ theme, c, set, zoom, sel, onSel }) {
  return (
    <div className="artboard" style={{ width: 1056, height: 816, background: theme.bg, color: theme.text, fontFamily: theme.font }}>
      <div style={{ position: 'absolute', inset: 22, border: `2px solid ${theme.primary}` }} />
      <div style={{ position: 'absolute', inset: 30, border: `1px solid ${theme.accent}66` }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 120px' }}>
        <div style={{ fontSize: 40, color: theme.accent }}><Editable value={c.monogram} onChange={(v) => set('monogram', v)} /></div>
        <Editable value={c.org} onChange={(v) => set('org', v)} style={{ fontSize: 16, letterSpacing: 6, marginTop: 10, color: theme.primary, fontWeight: 700 }} />
        <Editable value={c.kicker} onChange={(v) => set('kicker', v)} style={{ fontSize: 13, letterSpacing: 4, marginTop: 30, opacity: 0.6 }} />
        <Editable value={c.presented} onChange={(v) => set('presented', v)} style={{ fontSize: 14, marginTop: 18, opacity: 0.7, fontStyle: 'italic' }} />
        <Editable value={c.recipient} onChange={(v) => set('recipient', v)} style={{ fontSize: 56, fontWeight: 700, color: theme.primary, marginTop: 14, letterSpacing: 0.5 }} />
        <div style={{ width: 220, height: 2, background: theme.accent, margin: '18px 0 4px' }} />
        <Editable value={c.reason} onChange={(v) => set('reason', v)} multiline style={{ fontSize: 14, lineHeight: 1.65, marginTop: 14, maxWidth: 620, opacity: 0.85 }} />
        <div style={{ display: 'flex', gap: 120, marginTop: 56 }}>
          {[['sig1'], ['sig2']].map(([k], i) => (
            <div key={k} style={{ textAlign: 'center' }}>
              <div style={{ width: 200, borderBottom: `1px solid ${theme.primary}`, marginBottom: 6 }} />
              <Editable value={c[k]} onChange={(v) => set(k, v)} style={{ fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7 }} />
            </div>
          ))}
        </div>
        <Editable value={c.date} onChange={(v) => set('date', v)} style={{ fontSize: 12, marginTop: 26, opacity: 0.55 }} />
      </div>
      <Accent c={c} set={set} theme={theme} zoom={zoom} sel={sel} onSel={onSel} />
    </div>
  );
}

const DOC_COMPONENTS = {
  'business-card': DocBusinessCard,
  'invoice': DocInvoice,
  'guidelines': DocGuidelines,
  'letterhead': DocLetterhead,
  'certificate': DocCertificate,
};
Object.assign(window, { DOC_COMPONENTS });
