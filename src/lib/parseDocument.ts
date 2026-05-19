import type {
  Theme, BrandPreset, LineItem, SignatureLine, ChecklistItem, PageData,
} from '../types';

// ─── Factory ───────────────────────────────────────────────────────────────────

export function newPage(rawText = '', layout = 'standard'): PageData {
  return {
    id: `page-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    layout, rawText,
    invoiceMode: false,
    lineItems: [
      { description: 'Consultation', qty: 1, rate: 250 },
      { description: 'Treatment', qty: 2, rate: 150 },
    ],
    taxRate: 8.5,
    signatureLines: [
      { id: 'sig-1', label: 'Authorized Signatory', name: '' },
      { id: 'sig-2', label: 'Client / Patient', name: '' },
    ],
    checklistItems: [],
    showChecklist: false,
    tableHeaders: [],
    tableRows: [],
    tableSmartMode: false,
    showTable: false,
  };
}

// ─── Helper: Cursive SVG ───────────────────────────────────────────────────────

export function generateCursiveSVG(name: string, color: string): string {
  return `<svg width="200" height="48" xmlns="http://www.w3.org/2000/svg">
    <text x="4" y="36" font-family="'Brush Script MT', 'Segoe Script', cursive"
      font-size="28" fill="${color}" opacity="0.85">${name}</text>
  </svg>`;
}

// ─── parseDocument ─────────────────────────────────────────────────────────────

export function parseDocument(
  text: string,
  theme: Theme,
  preset: Partial<BrandPreset> | null,
  invoiceMode: boolean,
  lineItems: LineItem[],
  taxRate: number,
  signatureLines: SignatureLine[],
  headerRadius: number,
  bodyRadius: number,
  pageLayout: string,
  projectName: string,
  checklistItems: ChecklistItem[],
  tableHeaders: string[],
  tableRows: string[][],
  tableSmartMode: boolean,
  headerGradient = false,
  headerGradientColor2 = '#6366f1',
  headerGradientAngle = 135,
  headerBgOverride = '',
  headerTextOverride = '',
  headerFontSize = 22,
  bodyFontSize = 13,
  logoImageDataUrl = '',
  googleFontImport = '',
  watermark = '',
  showPageNumbers = false,
  mergeFieldsMap: Record<string, string> = {}
): string {
  // Resolve effective brand
  const effectivePrimary = preset?.primaryColor || theme.primaryColor;
  const effectiveSecondary = preset?.secondaryColor || theme.secondaryColor;
  const effectiveAccent = preset?.accentColor || theme.accentColor;
  const effectiveFontFamily = preset?.fontFamily || theme.fontFamily;
  const effectiveLogo = preset?.logoText || '';
  const effectiveCompany = preset?.companyName || '';
  const effectiveTagline = preset?.tagline || '';

  // Build header
  const resolvedHeaderBg = headerGradient
    ? `linear-gradient(${headerGradientAngle}deg, ${headerBgOverride || theme.headerBg}, ${headerGradientColor2})`
    : (headerBgOverride || theme.headerBg);
  const headerTextColor = headerTextOverride || theme.headerText;
  const isBold = pageLayout === 'bold';
  const companyFontSize = headerFontSize;
  const taglineFontSize = Math.max(11, Math.round(headerFontSize * 0.56));
  const projFontSize = Math.max(12, Math.round(headerFontSize * 0.68));
  const logoFontSize = isBold ? Math.round(headerFontSize * 2.2) : Math.round(headerFontSize * 1.6);

  const headerHTML = `
    <div style="background:${resolvedHeaderBg};color:${headerTextColor};padding:${isBold ? '36px 32px' : '24px 32px'};border-radius:${headerRadius}px;margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:16px;">
        ${logoImageDataUrl
          ? `<img src="${logoImageDataUrl}" style="height:${logoFontSize}px;width:auto;max-width:150px;object-fit:contain;display:block;" />`
          : effectiveLogo ? `<span style="font-size:${logoFontSize}px;line-height:1;">${effectiveLogo}</span>` : ''
        }
        <div>
          ${effectiveCompany ? `<div style="font-size:${companyFontSize}px;font-weight:700;letter-spacing:-0.5px;">${effectiveCompany}</div>` : ''}
          ${effectiveTagline ? `<div style="font-size:${taglineFontSize}px;opacity:0.8;margin-top:2px;">${effectiveTagline}</div>` : ''}
          ${projectName ? `<div style="font-size:${projFontSize}px;font-weight:600;margin-top:6px;opacity:0.9;border-top:1px solid ${headerTextColor}40;padding-top:6px;">${projectName}</div>` : ''}
        </div>
      </div>
    </div>
  `;

  // Parse text body
  function parseTextToHTML(rawText: string): string {
    if (!rawText.trim()) return '';
    const lines = rawText.split('\n');
    let html = '';
    let inList = false;

    const closeList = () => { if (inList) { html += '</ul>'; inList = false; } };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        closeList();
        html += '<div style="height:8px;"></div>';
        continue;
      }

      // ALL CAPS line → h2
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && /[A-Z]/.test(trimmed) && !/^\d/.test(trimmed)) {
        closeList();
        const headingSize = isBold ? bodyFontSize + 5 : bodyFontSize + 3;
        html += `<h2 style="font-size:${headingSize}px;font-weight:700;color:${effectivePrimary};border-bottom:2px solid ${effectivePrimary};padding-bottom:4px;margin:20px 0 10px;">${trimmed}</h2>`;
        continue;
      }

      // Line ending with : → h3
      if (trimmed.endsWith(':') && trimmed.length > 2 && !trimmed.startsWith('-') && !trimmed.startsWith('•')) {
        closeList();
        html += `<h3 style="font-size:${bodyFontSize - 1}px;font-weight:600;color:${effectiveAccent};margin:14px 0 4px;text-transform:uppercase;letter-spacing:0.5px;">${trimmed}</h3>`;
        continue;
      }

      // List item
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        if (!inList) {
          html += `<ul style="margin:6px 0;padding-left:20px;list-style:disc;">`;
          inList = true;
        }
        const itemText = trimmed.slice(2);
        html += `<li style="margin:3px 0;font-size:${bodyFontSize}px;">${formatInline(itemText, effectiveAccent)}</li>`;
        continue;
      }

      closeList();

      // Regular paragraph
      const fontSize = isBold ? bodyFontSize + 2 : bodyFontSize;
      const lineHt = pageLayout === 'minimal' ? '1.8' : '1.6';
      html += `<p style="margin:4px 0;font-size:${fontSize}px;line-height:${lineHt};">${formatInline(trimmed, effectiveAccent)}</p>`;
    }

    closeList();
    return html;
  }

  function formatInline(text: string, accentColor: string): string {
    // Dollar amounts
    text = text.replace(/\$[\d,]+(\.\d{2})?/g, m => `<strong style="color:${accentColor};">${m}</strong>`);
    // URLs
    text = text.replace(/(https?:\/\/[^\s]+)/g, m => `<a href="${m}" style="color:${accentColor};">${m}</a>`);
    return text;
  }

  // Apply merge fields
  let processedText = text;
  Object.entries(mergeFieldsMap).forEach(([key, val]) => {
    processedText = processedText.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val || `{{${key}}}`);
  });

  const bodyText = parseTextToHTML(processedText);

  // Build body based on layout
  let bodyHTML = '';

  if (pageLayout === 'invoice-only') {
    bodyHTML = '';
  } else if (pageLayout === 'editorial') {
    bodyHTML = `<div style="columns:2;column-gap:32px;font-size:13px;line-height:1.6;">${bodyText}</div>`;
  } else if (pageLayout === 'minimal') {
    bodyHTML = `<div style="max-width:560px;margin:0 auto;line-height:1.85;">${bodyText}</div>`;
  } else {
    bodyHTML = bodyText;
  }

  // Invoice section
  let invoiceHTML = '';
  if (invoiceMode || pageLayout === 'invoice-only') {
    const subtotal = lineItems.reduce((sum, item) => sum + item.qty * item.rate, 0);
    const taxAmt = subtotal * (taxRate / 100);
    const total = subtotal + taxAmt;

    const rows = lineItems.map((item, i) => {
      const amount = item.qty * item.rate;
      const rowBg = i % 2 === 0 ? theme.secondaryColor + '30' : 'transparent';
      return `<tr style="background:${rowBg};">
        <td style="padding:8px 12px;border-bottom:1px solid ${theme.borderColor}20;">${item.description}</td>
        <td style="padding:8px 12px;border-bottom:1px solid ${theme.borderColor}20;text-align:center;">${item.qty}</td>
        <td style="padding:8px 12px;border-bottom:1px solid ${theme.borderColor}20;text-align:right;">$${item.rate.toFixed(2)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid ${theme.borderColor}20;text-align:right;font-weight:600;">$${amount.toFixed(2)}</td>
      </tr>`;
    }).join('');

    invoiceHTML = `
      <div style="margin:20px 0;">
        <h2 style="font-size:16px;font-weight:700;color:${effectivePrimary};border-bottom:2px solid ${effectivePrimary};padding-bottom:4px;margin-bottom:12px;">INVOICE</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:${effectivePrimary};color:${effectiveSecondary === '#ffffff' ? '#ffffff' : effectiveSecondary};">
              <th style="padding:10px 12px;text-align:left;font-weight:600;">Description</th>
              <th style="padding:10px 12px;text-align:center;font-weight:600;">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-weight:600;">Rate</th>
              <th style="padding:10px 12px;text-align:right;font-weight:600;">Amount</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="display:flex;justify-content:flex-end;margin-top:12px;">
          <div style="min-width:220px;border-top:2px solid ${effectivePrimary};padding-top:8px;">
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;">
              <span>Subtotal</span><span>$${subtotal.toFixed(2)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;">
              <span>Tax (${taxRate}%)</span><span>$${taxAmt.toFixed(2)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:15px;font-weight:700;border-top:2px solid ${effectivePrimary};margin-top:4px;color:${effectivePrimary};">
              <span>TOTAL</span><span>$${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Checklist section
  let checklistHTML = '';
  if (checklistItems.length > 0) {
    const items = checklistItems.map(item => {
      const checkIcon = item.checked
        ? `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="16" height="16" rx="3" fill="${effectivePrimary}"/><path d="M3 8l3.5 3.5 6.5-7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="16" height="16" rx="3" stroke="${effectivePrimary}" stroke-width="1.5"/></svg>`;
      return `<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid ${theme.borderColor}20;">
        ${checkIcon}
        <span style="font-size:13px;${item.checked ? 'text-decoration:line-through;opacity:0.6;' : ''}">${item.text}</span>
      </div>`;
    }).join('');

    checklistHTML = `
      <div style="margin:20px 0;">
        <h2 style="font-size:14px;font-weight:700;color:${effectivePrimary};margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Checklist</h2>
        ${items}
      </div>
    `;
  }

  // Custom table section
  let tableHTML = '';
  if (tableHeaders.length > 0 && tableRows.length > 0) {
    const lastHeaderLower = tableHeaders[tableHeaders.length - 1]?.toLowerCase() || '';
    const isSmartTotal = tableSmartMode && (lastHeaderLower.includes('total') || lastHeaderLower.includes('amount') || lastHeaderLower.includes('sum'));

    const headerCells = tableHeaders.map(h =>
      `<th style="padding:9px 12px;text-align:left;font-weight:600;font-size:12px;letter-spacing:0.3px;">${h}</th>`
    ).join('');

    const bodyRows = tableRows.map((row, ri) => {
      const rowBg = ri % 2 === 0 ? theme.secondaryColor + '25' : 'transparent';
      const cells = row.map((cell, ci) => {
        let displayVal = cell;
        if (isSmartTotal && ci === row.length - 1) {
          const nums = row.slice(0, -1).map(v => parseFloat(v.replace(/[^0-9.-]/g, ''))).filter(n => !isNaN(n));
          if (nums.length > 0) {
            displayVal = '$' + nums.reduce((a, b) => a + b, 0).toFixed(2);
          }
        }
        return `<td style="padding:8px 12px;border-bottom:1px solid ${theme.borderColor}15;font-size:13px;">${displayVal}</td>`;
      }).join('');
      return `<tr style="background:${rowBg};">${cells}</tr>`;
    }).join('');

    tableHTML = `
      <div style="margin:20px 0;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:${effectivePrimary};color:#fff;">${headerCells}</tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>
    `;
  }

  // Signature section
  let sigHTML = '';
  if (signatureLines.length > 0) {
    const sigItems = signatureLines.map(sig => {
      const svgStr = sig.name ? generateCursiveSVG(sig.name, effectivePrimary) : '';
      return `<div style="flex:1;min-width:160px;">
        ${svgStr ? `<div style="margin-bottom:2px;">${svgStr}</div>` : '<div style="height:40px;border-bottom:1px solid ' + theme.borderColor + ';margin-bottom:2px;"></div>'}
        <div style="border-top:1px solid ${effectivePrimary};padding-top:4px;">
          <div style="font-size:11px;font-weight:600;color:${effectivePrimary};text-transform:uppercase;letter-spacing:0.3px;">${sig.label}</div>
          ${sig.name ? `<div style="font-size:12px;opacity:0.7;margin-top:1px;">${sig.name}</div>` : ''}
        </div>
      </div>`;
    }).join('');

    sigHTML = `
      <div style="margin-top:32px;border-top:2px solid ${theme.borderColor};padding-top:20px;">
        <div style="display:flex;gap:32px;flex-wrap:wrap;">${sigItems}</div>
      </div>
    `;
  }

  const watermarkHTML = watermark ? `
    <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;font-weight:900;opacity:0.07;pointer-events:none;user-select:none;white-space:nowrap;color:${theme.primaryColor};letter-spacing:8px;">
      ${watermark}
    </div>` : '';

  const pageNumHTML = showPageNumbers ? `
    <div style="position:absolute;bottom:20px;right:36px;font-size:11px;opacity:0.5;font-family:${effectiveFontFamily};">
      Page 1
    </div>` : '';

  return `
    ${googleFontImport}
    <div style="width:816px;min-height:1056px;background:${theme.backgroundColor};color:${theme.textColor};font-family:${effectiveFontFamily};box-sizing:border-box;padding:48px 56px;border-radius:${bodyRadius}px;overflow:visible;position:relative;">
      ${watermarkHTML}
      ${headerHTML}
      ${bodyHTML}
      ${invoiceHTML}
      ${checklistHTML}
      ${tableHTML}
      ${sigHTML}
      ${pageNumHTML}
    </div>
  `;
}
