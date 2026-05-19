// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface BrandPreset {
  id: string; name: string; primaryColor: string; secondaryColor: string;
  accentColor: string; fontFamily: string; logoText: string;
  companyName: string; tagline: string; isDefault?: boolean; pageLayout?: string;
  // Saved style snapshot
  themeId?: string;
  headerBgOverride?: string;
  headerTextOverride?: string;
  headerGradient?: boolean;
  headerGradientColor2?: string;
  headerGradientAngle?: number;
  headerFontSize?: number;
  bodyFontSize?: number;
}

export interface LineItem { description: string; qty: number; rate: number; }

export interface ChecklistItem { text: string; checked: boolean; }

export interface SignatureLine { id: string; label: string; name: string; }

export interface PageData {
  id: string;
  layout: string;
  rawText: string;
  invoiceMode: boolean;
  lineItems: LineItem[];
  taxRate: number;
  signatureLines: SignatureLine[];
  checklistItems: ChecklistItem[];
  showChecklist: boolean;
  tableHeaders: string[];
  tableRows: string[][];
  tableSmartMode: boolean;
  showTable: boolean;
}

export interface Theme {
  id: string; name: string; category: string;
  backgroundColor: string; textColor: string; primaryColor: string;
  secondaryColor: string; accentColor: string; fontFamily: string;
  borderColor: string; headerBg: string; headerText: string;
  suggestedLayout?: string;
  extraCSS?: string;
}

export interface ContextMenu { x: number; y: number; visible: boolean; }

export interface GoogleFont { name: string; family: string; category: string; }
