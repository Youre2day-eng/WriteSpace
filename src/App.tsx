import React, { useState, useEffect, useCallback, useRef } from 'react';

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface BrandPreset {
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

interface LineItem { description: string; qty: number; rate: number; }

interface ChecklistItem { text: string; checked: boolean; }

interface SignatureLine { id: string; label: string; name: string; }

interface PageData {
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

interface Theme {
  id: string; name: string; category: string;
  backgroundColor: string; textColor: string; primaryColor: string;
  secondaryColor: string; accentColor: string; fontFamily: string;
  borderColor: string; headerBg: string; headerText: string;
  suggestedLayout?: string;
  extraCSS?: string;
}

interface ContextMenu { x: number; y: number; visible: boolean; }

// ─── Factory ───────────────────────────────────────────────────────────────────

function newPage(rawText = '', layout = 'standard'): PageData {
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

// ─── Themes ────────────────────────────────────────────────────────────────────

const THEMES: Theme[] = [
  { id: 'dental-pro', name: 'Dental Pro', category: 'Medical/Dental', backgroundColor: '#ffffff', textColor: '#1a2744', primaryColor: '#1a2744', secondaryColor: '#4a90d9', accentColor: '#4a90d9', fontFamily: 'Georgia, serif', borderColor: '#1a2744', headerBg: '#1a2744', headerText: '#ffffff', suggestedLayout: 'standard' },
  { id: 'medspa-luxe', name: 'MedSpa Luxe', category: 'Luxury', backgroundColor: '#fdf8f5', textColor: '#4a3728', primaryColor: '#c9956b', secondaryColor: '#e8c8b8', accentColor: '#b87d5a', fontFamily: "'Palatino Linotype', Palatino, serif", borderColor: '#c9956b', headerBg: '#c9956b', headerText: '#ffffff', suggestedLayout: 'minimal' },
  { id: 'royal-court', name: 'Royal Court', category: 'Luxury', backgroundColor: '#1a0a2e', textColor: '#f0d060', primaryColor: '#8b5cf6', secondaryColor: '#c4a000', accentColor: '#f0d060', fontFamily: "'Times New Roman', Times, serif", borderColor: '#c4a000', headerBg: '#2d1a4e', headerText: '#f0d060', suggestedLayout: 'bold' },
  { id: 'gym-iron', name: 'Gym Iron', category: 'Athletic', backgroundColor: '#1a1a1a', textColor: '#e0e0e0', primaryColor: '#f0c000', secondaryColor: '#333333', accentColor: '#f0c000', fontFamily: "'Arial Black', Arial, sans-serif", borderColor: '#f0c000', headerBg: '#111111', headerText: '#f0c000', suggestedLayout: 'bold' },
  { id: 'law-firm', name: 'Law Firm', category: 'Corporate', backgroundColor: '#f8f6f0', textColor: '#2c2416', primaryColor: '#8b7355', secondaryColor: '#c9b99a', accentColor: '#c9a44a', fontFamily: "'Garamond', Georgia, serif", borderColor: '#8b7355', headerBg: '#2c2416', headerText: '#c9a44a', suggestedLayout: 'standard' },
  { id: 'tiffany-blue', name: 'Tiffany Blue', category: 'Luxury', backgroundColor: '#f0fffe', textColor: '#003d3b', primaryColor: '#0abab5', secondaryColor: '#e0f8f7', accentColor: '#007d7a', fontFamily: "'Gill Sans', Optima, sans-serif", borderColor: '#0abab5', headerBg: '#0abab5', headerText: '#ffffff', suggestedLayout: 'minimal' },
  { id: 'dark-mode-dev', name: 'Dark Mode Dev', category: 'Tech', backgroundColor: '#0d1117', textColor: '#c9d1d9', primaryColor: '#58a6ff', secondaryColor: '#21262d', accentColor: '#3fb950', fontFamily: "'Courier New', Courier, monospace", borderColor: '#30363d', headerBg: '#161b22', headerText: '#58a6ff', suggestedLayout: 'editorial' },
  { id: 'saas-blue', name: 'SaaS Blue', category: 'Tech', backgroundColor: '#f0f4ff', textColor: '#1e2a4a', primaryColor: '#3b82f6', secondaryColor: '#dbeafe', accentColor: '#1d4ed8', fontFamily: "'Inter', system-ui, sans-serif", borderColor: '#3b82f6', headerBg: 'linear-gradient(135deg,#3b82f6,#6366f1)', headerText: '#ffffff', suggestedLayout: 'editorial' },
  { id: 'kraft-paper', name: 'Kraft Paper', category: 'Creative', backgroundColor: '#d4a96a', textColor: '#2c1810', primaryColor: '#8b4513', secondaryColor: '#c4813a', accentColor: '#5c2d0a', fontFamily: "'Courier New', Courier, monospace", borderColor: '#8b4513', headerBg: '#8b4513', headerText: '#f5deb3', suggestedLayout: 'minimal' },
  { id: 'restaurant-fine', name: 'Restaurant Fine', category: 'Hospitality', backgroundColor: '#1a0a04', textColor: '#f5e6c8', primaryColor: '#c0392b', secondaryColor: '#2c1810', accentColor: '#e8b96a', fontFamily: "'Didot', 'Bodoni MT', Georgia, serif", borderColor: '#c0392b', headerBg: '#c0392b', headerText: '#f5e6c8', suggestedLayout: 'standard' },
  { id: 'wedding-planner', name: 'Wedding Planner', category: 'Specialty', backgroundColor: '#fefcf8', textColor: '#4a3728', primaryColor: '#d4af8a', secondaryColor: '#f0e6d6', accentColor: '#c9a060', fontFamily: "'Palatino Linotype', Palatino, serif", borderColor: '#d4af8a', headerBg: '#fdf4e8', headerText: '#8b6040', suggestedLayout: 'minimal' },
  { id: 'chanel-noir', name: 'Chanel Noir', category: 'Luxury', backgroundColor: '#ffffff', textColor: '#000000', primaryColor: '#000000', secondaryColor: '#ffffff', accentColor: '#000000', fontFamily: "'Bodoni MT', Didot, Georgia, serif", borderColor: '#000000', headerBg: '#000000', headerText: '#ffffff', suggestedLayout: 'minimal' },

  // ── Unique/Strong batch ──
  { id: 'neon-cyberpunk', name: 'Neon Cyberpunk', category: 'Creative', backgroundColor: '#050510', textColor: '#e0e0ff', primaryColor: '#ff00cc', secondaryColor: '#00ffee', accentColor: '#00ffee', fontFamily: "'Courier New', Courier, monospace", borderColor: '#ff00cc', headerBg: '#0a0020', headerText: '#ff00cc', suggestedLayout: 'bold' },
  { id: 'victorian-noir', name: 'Victorian Noir', category: 'Luxury', backgroundColor: '#120608', textColor: '#e8d5b0', primaryColor: '#c9a84c', secondaryColor: '#8b1a1a', accentColor: '#c9a84c', fontFamily: "'Times New Roman', Times, serif", borderColor: '#c9a84c', headerBg: '#1c0808', headerText: '#c9a84c', suggestedLayout: 'standard' },
  { id: 'arctic-minimal', name: 'Arctic Minimal', category: 'Corporate', backgroundColor: '#f8fbff', textColor: '#1a2840', primaryColor: '#2b5797', secondaryColor: '#ddeeff', accentColor: '#1a7abf', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", borderColor: '#b8d4e8', headerBg: '#b8d4e8', headerText: '#1a2840', suggestedLayout: 'minimal' },
  { id: 'terra-bloom', name: 'Terra Bloom', category: 'Hospitality', backgroundColor: '#faf0e6', textColor: '#3d1f0a', primaryColor: '#c4612a', secondaryColor: '#ffe8d6', accentColor: '#a0440a', fontFamily: "'Palatino Linotype', Palatino, serif", borderColor: '#c4612a', headerBg: '#c4612a', headerText: '#fff8f0', suggestedLayout: 'standard' },

  // ── Next 4 ──
  { id: 'emerald-prestige', name: 'Emerald Prestige', category: 'Luxury', backgroundColor: '#071a0f', textColor: '#e8f0e4', primaryColor: '#d4a843', secondaryColor: '#0d3320', accentColor: '#d4a843', fontFamily: "'Garamond', 'Georgia', serif", borderColor: '#d4a843', headerBg: '#0d3320', headerText: '#d4a843', suggestedLayout: 'bold' },
  { id: 'midnight-editorial', name: 'Midnight Editorial', category: 'Corporate', backgroundColor: '#07070f', textColor: '#c8c8e8', primaryColor: '#6d5aed', secondaryColor: '#13131f', accentColor: '#a78bfa', fontFamily: "'Inter', system-ui, sans-serif", borderColor: '#4f46e5', headerBg: '#13131f', headerText: '#a78bfa', suggestedLayout: 'editorial' },
  { id: 'manga-studio', name: 'Manga Studio', category: 'Creative', backgroundColor: '#ffffff', textColor: '#1a1a1a', primaryColor: '#e60026', secondaryColor: '#f5f5f5', accentColor: '#e60026', fontFamily: "'Arial Black', 'Arial Bold', sans-serif", borderColor: '#1a1a1a', headerBg: '#1a1a1a', headerText: '#e60026', suggestedLayout: 'bold' },
  { id: 'bourbon-street', name: 'Bourbon Street', category: 'Hospitality', backgroundColor: '#100804', textColor: '#f0e0c0', primaryColor: '#d4891a', secondaryColor: '#2a1508', accentColor: '#f0a030', fontFamily: "'Georgia', serif", borderColor: '#d4891a', headerBg: '#1e0e06', headerText: '#d4891a', suggestedLayout: 'standard' },

  // ── Gradient batch ──
  { id: 'aurora-borealis', name: 'Aurora Borealis', category: 'Gradient', backgroundColor: '#060d1a', textColor: '#d0eedd', primaryColor: '#0d9488', secondaryColor: '#1e1040', accentColor: '#34d399', fontFamily: "'Inter', system-ui, sans-serif", borderColor: '#0d9488', headerBg: 'linear-gradient(135deg,#7c3aed,#0d9488)', headerText: '#ffffff', suggestedLayout: 'bold' },
  { id: 'sunset-blaze', name: 'Sunset Blaze', category: 'Gradient', backgroundColor: '#fff8f0', textColor: '#2d1010', primaryColor: '#f97316', secondaryColor: '#fff0e8', accentColor: '#db2777', fontFamily: "'Georgia', serif", borderColor: '#f97316', headerBg: 'linear-gradient(135deg,#f97316,#db2777)', headerText: '#ffffff', suggestedLayout: 'standard' },
  { id: 'ocean-depth', name: 'Ocean Depth', category: 'Gradient', backgroundColor: '#040c18', textColor: '#c0d8f0', primaryColor: '#0891b2', secondaryColor: '#051020', accentColor: '#38bdf8', fontFamily: "'Helvetica Neue', Helvetica, sans-serif", borderColor: '#0891b2', headerBg: 'linear-gradient(135deg,#0891b2,#1e3a5f)', headerText: '#ffffff', suggestedLayout: 'editorial' },
  { id: 'rose-gold-rush', name: 'Rose Gold Rush', category: 'Gradient', backgroundColor: '#fef8f5', textColor: '#2d1020', primaryColor: '#e11d48', secondaryColor: '#fce8e8', accentColor: '#d4a843', fontFamily: "'Palatino Linotype', Palatino, serif", borderColor: '#e11d48', headerBg: 'linear-gradient(135deg,#e11d48,#d4a843)', headerText: '#ffffff', suggestedLayout: 'minimal' },
  { id: 'cosmic-galaxy', name: 'Cosmic Galaxy', category: 'Gradient', backgroundColor: '#02020e', textColor: '#ddd0ff', primaryColor: '#7c3aed', secondaryColor: '#0d0d24', accentColor: '#a78bfa', fontFamily: "'Inter', system-ui, sans-serif", borderColor: '#7c3aed', headerBg: 'linear-gradient(135deg,#7c3aed,#1e1b4b)', headerText: '#ffffff', suggestedLayout: 'bold' },
  { id: 'tropical-paradise', name: 'Tropical Paradise', category: 'Gradient', backgroundColor: '#f0fff8', textColor: '#0a2818', primaryColor: '#059669', secondaryColor: '#d1fae5', accentColor: '#0891b2', fontFamily: "'Gill Sans', Optima, sans-serif", borderColor: '#059669', headerBg: 'linear-gradient(135deg,#65a30d,#0891b2)', headerText: '#ffffff', suggestedLayout: 'standard' },
  { id: 'carbon-steel', name: 'Carbon Steel', category: 'Gradient', backgroundColor: '#0e1014', textColor: '#d0d4d8', primaryColor: '#6b7280', secondaryColor: '#1a1e24', accentColor: '#9ca3af', fontFamily: "'Arial', Helvetica, sans-serif", borderColor: '#374151', headerBg: 'linear-gradient(135deg,#1f2937,#6b7280)', headerText: '#f0f0f0', suggestedLayout: 'editorial' },
  { id: 'velvet-luxe', name: 'Velvet Luxe', category: 'Gradient', backgroundColor: '#080408', textColor: '#f0d8e8', primaryColor: '#9b1c4a', secondaryColor: '#150010', accentColor: '#c084fc', fontFamily: "'Times New Roman', Times, serif", borderColor: '#7f1d1d', headerBg: 'linear-gradient(135deg,#7f1d1d,#4c1d95)', headerText: '#fce7f3', suggestedLayout: 'bold' },

  // ── Medical / Dental expanded ──
  { id: 'pediatric-care', name: 'Pediatric Care', category: 'Medical/Dental', backgroundColor: '#fffbf0', textColor: '#2a1a2e', primaryColor: '#7c3aed', secondaryColor: '#fce7fe', accentColor: '#f59e0b', fontFamily: "'Trebuchet MS', 'Lucida Grande', sans-serif", borderColor: '#7c3aed', headerBg: 'linear-gradient(90deg,#f59e0b,#7c3aed)', headerText: '#ffffff', suggestedLayout: 'standard' },
  { id: 'orthodontics', name: 'Orthodontics', category: 'Medical/Dental', backgroundColor: '#f0fdff', textColor: '#0c3040', primaryColor: '#0891b2', secondaryColor: '#cffafe', accentColor: '#06b6d4', fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif", borderColor: '#0891b2', headerBg: '#0891b2', headerText: '#ffffff', suggestedLayout: 'standard' },
  { id: 'chiropractic', name: 'Chiropractic', category: 'Medical/Dental', backgroundColor: '#f7f9f4', textColor: '#1a2e1a', primaryColor: '#2d6a2d', secondaryColor: '#e8f5e8', accentColor: '#4a9e4a', fontFamily: "Georgia, 'Times New Roman', serif", borderColor: '#2d6a2d', headerBg: '#2d6a2d', headerText: '#f0f8f0', suggestedLayout: 'minimal' },
  { id: 'clinical-white', name: 'Clinical White', category: 'Medical/Dental', backgroundColor: '#ffffff', textColor: '#0a1628', primaryColor: '#1d4ed8', secondaryColor: '#eff6ff', accentColor: '#3b82f6', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", borderColor: '#1d4ed8', headerBg: '#1d4ed8', headerText: '#ffffff', suggestedLayout: 'minimal' },

  // ── Luxury / Fashion expanded ──
  { id: 'hermes-orange', name: 'Hermès Orange', category: 'Luxury', backgroundColor: '#fdf5ee', textColor: '#2c1404', primaryColor: '#e8622a', secondaryColor: '#fce8d8', accentColor: '#c44a14', fontFamily: "Didot, 'Bodoni MT', 'Times New Roman', serif", borderColor: '#e8622a', headerBg: '#e8622a', headerText: '#fdf5ee', suggestedLayout: 'minimal' },
  { id: 'black-diamond', name: 'Black Diamond', category: 'Luxury', backgroundColor: '#f8f8f8', textColor: '#080808', primaryColor: '#1a1a1a', secondaryColor: '#f0f0f0', accentColor: '#666666', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", borderColor: '#1a1a1a', headerBg: '#0a0a0a', headerText: '#e8e8e8', suggestedLayout: 'minimal' },
  { id: 'versace-gold', name: 'Versace Gold', category: 'Luxury', backgroundColor: '#0a0a00', textColor: '#f0d060', primaryColor: '#c9a84c', secondaryColor: '#1a1400', accentColor: '#f0d060', fontFamily: "'Times New Roman', Times, serif", borderColor: '#c9a84c', headerBg: '#080800', headerText: '#f0d060', suggestedLayout: 'bold' },
  { id: 'art-deco', name: 'Art Déco', category: 'Luxury', backgroundColor: '#0e0c08', textColor: '#e8d8a0', primaryColor: '#c9a84c', secondaryColor: '#1c1808', accentColor: '#e8d8a0', fontFamily: "'Palatino Linotype', Palatino, 'Book Antiqua', serif", borderColor: '#c9a84c', headerBg: '#1c1808', headerText: '#c9a84c', suggestedLayout: 'standard' },

  // ── Athletic / Fitness expanded ──
  { id: 'crossfit-brutal', name: 'CrossFit Brutal', category: 'Athletic', backgroundColor: '#0a0a0a', textColor: '#f0f0f0', primaryColor: '#f97316', secondaryColor: '#1a0a00', accentColor: '#f97316', fontFamily: "'Impact', 'Arial Narrow', Arial, sans-serif", borderColor: '#f97316', headerBg: '#f97316', headerText: '#0a0a0a', suggestedLayout: 'bold' },
  { id: 'yoga-flow', name: 'Yoga Flow', category: 'Athletic', backgroundColor: '#faf8f2', textColor: '#2d2416', primaryColor: '#6b7c4a', secondaryColor: '#eef0e8', accentColor: '#8b9e6a', fontFamily: "'Palatino Linotype', Palatino, Georgia, serif", borderColor: '#6b7c4a', headerBg: '#6b7c4a', headerText: '#faf8f2', suggestedLayout: 'minimal' },
  { id: 'martial-arts', name: 'Martial Arts', category: 'Athletic', backgroundColor: '#0a0000', textColor: '#f0e0e0', primaryColor: '#cc0000', secondaryColor: '#1a0000', accentColor: '#ff4444', fontFamily: "'Arial Black', 'Arial Bold', Arial, sans-serif", borderColor: '#cc0000', headerBg: '#cc0000', headerText: '#ffffff', suggestedLayout: 'bold' },
  { id: 'boxing-champ', name: 'Boxing Champion', category: 'Athletic', backgroundColor: '#080808', textColor: '#e8e8e8', primaryColor: '#c9a84c', secondaryColor: '#1a1400', accentColor: '#cc2200', fontFamily: "'Impact', 'Arial Narrow', sans-serif", borderColor: '#c9a84c', headerBg: '#0a0a0a', headerText: '#c9a84c', suggestedLayout: 'bold' },

  // ── Creative / Lifestyle expanded ──
  { id: 'blueprint', name: 'Blueprint', category: 'Creative', backgroundColor: '#1a2a4a', textColor: '#c0d8ff', primaryColor: '#4a90d9', secondaryColor: '#0a1428', accentColor: '#7ab8f5', fontFamily: "'Courier New', Courier, monospace", borderColor: '#4a90d9', headerBg: '#0a1428', headerText: '#7ab8f5', suggestedLayout: 'editorial' },
  { id: 'comic-book', name: 'Comic Book', category: 'Creative', backgroundColor: '#fff8c0', textColor: '#0a0a0a', primaryColor: '#0a0a0a', secondaryColor: '#fff8c0', accentColor: '#cc0000', fontFamily: "'Arial Black', 'Comic Sans MS', 'Trebuchet MS', sans-serif", borderColor: '#0a0a0a', headerBg: '#0a0a0a', headerText: '#fff000', suggestedLayout: 'bold' },
  { id: 'watercolor', name: 'Watercolor', category: 'Creative', backgroundColor: '#faf8ff', textColor: '#2a1a3a', primaryColor: '#7c4da0', secondaryColor: '#f0e8ff', accentColor: '#a060c0', fontFamily: "'Palatino Linotype', Palatino, Georgia, serif", borderColor: '#c0a0d8', headerBg: 'linear-gradient(135deg,#d8a8e8,#a8c8f8)', headerText: '#2a1a3a', suggestedLayout: 'minimal' },
  { id: 'notebook-paper', name: 'Notebook Paper', category: 'Creative', backgroundColor: '#fffef8', textColor: '#1a1a2e', primaryColor: '#cc3333', secondaryColor: '#e8f0ff', accentColor: '#1a4acc', fontFamily: "'Courier New', Courier, monospace", borderColor: '#aac4f0', headerBg: '#f0f4ff', headerText: '#cc3333', suggestedLayout: 'standard' },

  // ── Corporate / Professional expanded ──
  { id: 'real-estate', name: 'Real Estate', category: 'Corporate', backgroundColor: '#f8faf6', textColor: '#1a2e1a', primaryColor: '#2d5a27', secondaryColor: '#e8f5e8', accentColor: '#4a8c3f', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", borderColor: '#2d5a27', headerBg: '#2d5a27', headerText: '#f0f8f0', suggestedLayout: 'standard' },
  { id: 'finance-pro', name: 'Finance Pro', category: 'Corporate', backgroundColor: '#f5f7fa', textColor: '#1a2540', primaryColor: '#2c4a8a', secondaryColor: '#dce8f8', accentColor: '#3a6abf', fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif", borderColor: '#2c4a8a', headerBg: '#2c4a8a', headerText: '#ffffff', suggestedLayout: 'standard' },
  { id: 'consulting-elite', name: 'Consulting Elite', category: 'Corporate', backgroundColor: '#f9fafb', textColor: '#111827', primaryColor: '#1e3a5f', secondaryColor: '#e8eef8', accentColor: '#2c5f8a', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", borderColor: '#1e3a5f', headerBg: '#111827', headerText: '#d1d5db', suggestedLayout: 'editorial' },
  { id: 'insurance-shield', name: 'Insurance Shield', category: 'Corporate', backgroundColor: '#f8f9ff', textColor: '#0a1a3a', primaryColor: '#1a3a8a', secondaryColor: '#dce4f8', accentColor: '#cc2200', fontFamily: "Arial, 'Helvetica Neue', sans-serif", borderColor: '#1a3a8a', headerBg: '#1a3a8a', headerText: '#ffffff', suggestedLayout: 'standard' },

  // ── More Gradients ──
  { id: 'northern-lights', name: 'Northern Lights', category: 'Gradient', backgroundColor: '#030810', textColor: '#c0f0e0', primaryColor: '#059669', secondaryColor: '#042018', accentColor: '#34d399', fontFamily: "'Inter', system-ui, sans-serif", borderColor: '#059669', headerBg: 'linear-gradient(135deg,#065f46,#7c3aed)', headerText: '#ffffff', suggestedLayout: 'bold' },
  { id: 'golden-hour', name: 'Golden Hour', category: 'Gradient', backgroundColor: '#fffbf0', textColor: '#2c1804', primaryColor: '#d97706', secondaryColor: '#fef3c7', accentColor: '#f59e0b', fontFamily: "Georgia, 'Palatino Linotype', serif", borderColor: '#d97706', headerBg: 'linear-gradient(135deg,#f59e0b,#dc2626)', headerText: '#ffffff', suggestedLayout: 'standard' },
  { id: 'fire-ice', name: 'Fire & Ice', category: 'Gradient', backgroundColor: '#f8faff', textColor: '#0a1428', primaryColor: '#1d4ed8', secondaryColor: '#dbeafe', accentColor: '#dc2626', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", borderColor: '#1d4ed8', headerBg: 'linear-gradient(135deg,#dc2626,#1d4ed8)', headerText: '#ffffff', suggestedLayout: 'bold' },
  { id: 'lavender-dreams', name: 'Lavender Dreams', category: 'Gradient', backgroundColor: '#fef9ff', textColor: '#2a1040', primaryColor: '#7c3aed', secondaryColor: '#f3e8ff', accentColor: '#a855f7', fontFamily: "'Palatino Linotype', Palatino, Georgia, serif", borderColor: '#a855f7', headerBg: 'linear-gradient(135deg,#a855f7,#ec4899)', headerText: '#ffffff', suggestedLayout: 'minimal' },

  // ── Tech / Startup expanded ──
  { id: 'startup-bold', name: 'Startup Bold', category: 'Tech', backgroundColor: '#fafbff', textColor: '#0f0a28', primaryColor: '#7c3aed', secondaryColor: '#f0e8ff', accentColor: '#ec4899', fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif", borderColor: '#7c3aed', headerBg: 'linear-gradient(135deg,#7c3aed,#ec4899)', headerText: '#ffffff', suggestedLayout: 'editorial' },
  { id: 'ai-future', name: 'AI Future', category: 'Tech', backgroundColor: '#030a10', textColor: '#b0e8f8', primaryColor: '#0891b2', secondaryColor: '#041820', accentColor: '#22d3ee', fontFamily: "'Inter', 'Helvetica Neue', sans-serif", borderColor: '#0891b2', headerBg: '#041820', headerText: '#22d3ee', suggestedLayout: 'editorial' },
  { id: 'terminal-green', name: 'Terminal Green', category: 'Tech', backgroundColor: '#000800', textColor: '#00cc44', primaryColor: '#00cc44', secondaryColor: '#001400', accentColor: '#00ff55', fontFamily: "'Courier New', Courier, 'Lucida Console', monospace", borderColor: '#00cc44', headerBg: '#001400', headerText: '#00ff55', suggestedLayout: 'standard' },
  { id: 'neon-night', name: 'Neon Night', category: 'Tech', backgroundColor: '#020008', textColor: '#e0d0ff', primaryColor: '#cc00ff', secondaryColor: '#0a0018', accentColor: '#00ffcc', fontFamily: "'Courier New', Courier, monospace", borderColor: '#cc00ff', headerBg: '#0a0018', headerText: '#cc00ff', suggestedLayout: 'bold' },

  // ── Hospitality expanded ──
  { id: 'coffee-shop', name: 'Coffee Shop', category: 'Hospitality', backgroundColor: '#faf4ee', textColor: '#2c1808', primaryColor: '#6b3a1f', secondaryColor: '#f0e0d0', accentColor: '#9b5a30', fontFamily: "Georgia, 'Palatino Linotype', serif", borderColor: '#6b3a1f', headerBg: '#3d1c0a', headerText: '#d4a878', suggestedLayout: 'minimal' },
  { id: 'hotel-concierge', name: 'Hotel Concierge', category: 'Hospitality', backgroundColor: '#f8f7f4', textColor: '#1a1810', primaryColor: '#4a4030', secondaryColor: '#ece8e0', accentColor: '#c9a84c', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", borderColor: '#4a4030', headerBg: '#1a1810', headerText: '#c9a84c', suggestedLayout: 'minimal' },
];

// ─── Google Fonts ──────────────────────────────────────────────────────────────

interface GoogleFont { name: string; family: string; category: string; }

const GOOGLE_FONTS: GoogleFont[] = [
  // Serif — editorial, luxury, editorial
  { name: 'Playfair Display', family: "'Playfair Display', Georgia, serif", category: 'Serif' },
  { name: 'Cormorant Garamond', family: "'Cormorant Garamond', Georgia, serif", category: 'Serif' },
  { name: 'EB Garamond', family: "'EB Garamond', Georgia, serif", category: 'Serif' },
  { name: 'Lora', family: "'Lora', Georgia, serif", category: 'Serif' },
  { name: 'Merriweather', family: "'Merriweather', Georgia, serif", category: 'Serif' },
  { name: 'Libre Baskerville', family: "'Libre Baskerville', Georgia, serif", category: 'Serif' },
  { name: 'Crimson Pro', family: "'Crimson Pro', Georgia, serif", category: 'Serif' },
  { name: 'DM Serif Display', family: "'DM Serif Display', Georgia, serif", category: 'Serif' },

  // Sans — clean, modern, corporate
  { name: 'Inter', family: "'Inter', system-ui, sans-serif", category: 'Sans' },
  { name: 'DM Sans', family: "'DM Sans', system-ui, sans-serif", category: 'Sans' },
  { name: 'Nunito', family: "'Nunito', system-ui, sans-serif", category: 'Sans' },
  { name: 'Poppins', family: "'Poppins', system-ui, sans-serif", category: 'Sans' },
  { name: 'Outfit', family: "'Outfit', system-ui, sans-serif", category: 'Sans' },
  { name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', system-ui, sans-serif", category: 'Sans' },
  { name: 'Manrope', family: "'Manrope', system-ui, sans-serif", category: 'Sans' },
  { name: 'Sora', family: "'Sora', system-ui, sans-serif", category: 'Sans' },

  // Display — bold, impactful, titles
  { name: 'Bebas Neue', family: "'Bebas Neue', Impact, sans-serif", category: 'Display' },
  { name: 'Oswald', family: "'Oswald', Impact, sans-serif", category: 'Display' },
  { name: 'Montserrat', family: "'Montserrat', Arial, sans-serif", category: 'Display' },
  { name: 'Raleway', family: "'Raleway', Arial, sans-serif", category: 'Display' },
  { name: 'Anton', family: "'Anton', Impact, sans-serif", category: 'Display' },
  { name: 'Barlow Condensed', family: "'Barlow Condensed', Arial, sans-serif", category: 'Display' },
  { name: 'Black Han Sans', family: "'Black Han Sans', Impact, sans-serif", category: 'Display' },
  { name: 'Exo 2', family: "'Exo 2', Arial, sans-serif", category: 'Display' },

  // Mono — code, technical, precision
  { name: 'JetBrains Mono', family: "'JetBrains Mono', 'Courier New', monospace", category: 'Mono' },
  { name: 'Space Mono', family: "'Space Mono', 'Courier New', monospace", category: 'Mono' },
  { name: 'IBM Plex Mono', family: "'IBM Plex Mono', 'Courier New', monospace", category: 'Mono' },
  { name: 'Fira Code', family: "'Fira Code', 'Courier New', monospace", category: 'Mono' },
  { name: 'Source Code Pro', family: "'Source Code Pro', 'Courier New', monospace", category: 'Mono' },

  // Script — handwritten, elegant, creative
  { name: 'Dancing Script', family: "'Dancing Script', cursive", category: 'Script' },
  { name: 'Pacifico', family: "'Pacifico', cursive", category: 'Script' },
  { name: 'Great Vibes', family: "'Great Vibes', cursive", category: 'Script' },
  { name: 'Satisfy', family: "'Satisfy', cursive", category: 'Script' },
  { name: 'Caveat', family: "'Caveat', cursive", category: 'Script' },
  { name: 'Kalam', family: "'Kalam', cursive", category: 'Script' },
];

// Build a single combined Google Fonts URL (one HTTP request for all fonts)
const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?' +
  GOOGLE_FONTS.map(f => `family=${f.name.replace(/ /g, '+')}:wght@400;700`).join('&') +
  '&display=swap';

// ─── Layouts ───────────────────────────────────────────────────────────────────

const LAYOUTS = [
  { id: 'standard', name: 'Standard', desc: 'Classic single column' },
  { id: 'editorial', name: 'Editorial', desc: 'Two-column body text' },
  { id: 'minimal', name: 'Minimal', desc: 'Clean, lots of whitespace' },
  { id: 'bold', name: 'Bold', desc: 'Large header, strong typography' },
  { id: 'invoice-only', name: 'Invoice', desc: 'Invoice-optimized layout' },
];

// ─── Default Presets ───────────────────────────────────────────────────────────

const DEFAULT_PRESETS: BrandPreset[] = [
  {
    id: 'preset-aurora', name: 'Aurora Agency', themeId: 'aurora-borealis',
    primaryColor: '#0d9488', secondaryColor: '#1e1040', accentColor: '#34d399',
    fontFamily: "'Inter', system-ui, sans-serif", logoText: '✦',
    companyName: 'Aurora Creative Agency', tagline: 'Where ideas become light',
    headerGradient: true, headerBgOverride: '#7c3aed', headerGradientColor2: '#0d9488', headerGradientAngle: 135,
    headerFontSize: 26, bodyFontSize: 14,
  },
  {
    id: 'preset-cosmic', name: 'Cosmic Galaxy', themeId: 'cosmic-galaxy',
    primaryColor: '#7c3aed', secondaryColor: '#0d0d24', accentColor: '#a78bfa',
    fontFamily: "'Inter', system-ui, sans-serif", logoText: '🌌',
    companyName: 'Cosmic Labs', tagline: 'Beyond the known universe',
    headerGradient: true, headerBgOverride: '#7c3aed', headerGradientColor2: '#1e1b4b', headerGradientAngle: 135,
    headerFontSize: 28, bodyFontSize: 13,
  },
  {
    id: 'preset-sunset', name: 'Sunset Studio', themeId: 'sunset-blaze',
    primaryColor: '#f97316', secondaryColor: '#fff0e8', accentColor: '#db2777',
    fontFamily: "'Georgia', serif", logoText: '🌅',
    companyName: 'Sunset Creative Studio', tagline: 'Every project is golden hour',
    headerGradient: true, headerBgOverride: '#f97316', headerGradientColor2: '#db2777', headerGradientAngle: 135,
    headerFontSize: 24, bodyFontSize: 13,
  },
  {
    id: 'preset-velvet', name: 'Velvet Luxe', themeId: 'velvet-luxe',
    primaryColor: '#9b1c4a', secondaryColor: '#150010', accentColor: '#c084fc',
    fontFamily: "'Times New Roman', Times, serif", logoText: '♛',
    companyName: 'Velvet & Co.', tagline: 'Luxury without apology',
    headerGradient: true, headerBgOverride: '#7f1d1d', headerGradientColor2: '#4c1d95', headerGradientAngle: 135,
    headerFontSize: 26, bodyFontSize: 13,
  },
  {
    id: 'preset-ocean', name: 'Ocean Capital', themeId: 'ocean-depth',
    primaryColor: '#0891b2', secondaryColor: '#051020', accentColor: '#38bdf8',
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif", logoText: '🌊',
    companyName: 'Ocean Capital Partners', tagline: 'Navigate with confidence',
    headerGradient: true, headerBgOverride: '#0891b2', headerGradientColor2: '#1e3a5f', headerGradientAngle: 135,
    headerFontSize: 24, bodyFontSize: 14,
  },
  {
    id: 'preset-emerald', name: 'Emerald Society', themeId: 'emerald-prestige',
    primaryColor: '#d4a843', secondaryColor: '#0d3320', accentColor: '#d4a843',
    fontFamily: "'Garamond', Georgia, serif", logoText: '◆',
    companyName: 'The Emerald Society', tagline: 'Excellence is a tradition',
    headerFontSize: 26, bodyFontSize: 13,
  },
  {
    id: 'preset-cyberpunk', name: 'Cyberpunk Labs', themeId: 'neon-cyberpunk',
    primaryColor: '#ff00cc', secondaryColor: '#00ffee', accentColor: '#00ffee',
    fontFamily: "'Courier New', Courier, monospace", logoText: '⚡',
    companyName: 'CyberPunk Labs', tagline: 'The future is already here',
    headerFontSize: 24, bodyFontSize: 13,
  },
  {
    id: 'preset-rosegold', name: 'Rose Gold Studio', themeId: 'rose-gold-rush',
    primaryColor: '#e11d48', secondaryColor: '#fce8e8', accentColor: '#d4a843',
    fontFamily: "'Palatino Linotype', Palatino, serif", logoText: '🌹',
    companyName: 'Rose Gold Studio', tagline: 'Premium beauty, elevated',
    headerGradient: true, headerBgOverride: '#e11d48', headerGradientColor2: '#d4a843', headerGradientAngle: 135,
    headerFontSize: 24, bodyFontSize: 13,
  },
];

// ─── Helper: Cursive SVG ───────────────────────────────────────────────────────

function generateCursiveSVG(name: string, color: string): string {
  return `<svg width="200" height="48" xmlns="http://www.w3.org/2000/svg">
    <text x="4" y="36" font-family="'Brush Script MT', 'Segoe Script', cursive"
      font-size="28" fill="${color}" opacity="0.85">${name}</text>
  </svg>`;
}

// ─── parseDocument ─────────────────────────────────────────────────────────────

function parseDocument(
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
          // Try to parse and sum previous numeric cells
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

// ─── Main Component ────────────────────────────────────────────────────────────

export default function App() {
  const SAMPLE_TEXT = `PATIENT CONSULTATION REPORT

Patient Information:
Name: John Smith
Date of Birth: March 15, 1985
Visit Date: ${new Date().toLocaleDateString()}

CHIEF COMPLAINT

Patient presents with persistent discomfort in the lower left quadrant requiring comprehensive evaluation and treatment planning.

EXAMINATION FINDINGS

- Blood pressure: 120/80 mmHg
- Heart rate: 72 bpm
- Temperature: 98.6°F

TREATMENT PLAN

The following procedures are recommended:
- Initial consultation and assessment
- Follow-up examination in 2 weeks
- Specialist referral if symptoms persist

NOTES

All findings documented per standard protocol. Patient informed of treatment options and associated costs. Written consent obtained.`;

  // ── Global state ──
  const [selectedThemeId, setSelectedThemeId] = useState('dental-pro');
  const [selectedPresetId, setSelectedPresetId] = useState('');
  const [presets, setPresets] = useState<BrandPreset[]>(() => {
    const saved = localStorage.getItem('docforge_presets');
    return saved ? JSON.parse(saved) : DEFAULT_PRESETS;
  });
  const [brandOverride, setBrandOverride] = useState<Partial<BrandPreset>>({});
  const [showOverride, setShowOverride] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [headerRadius, setHeaderRadius] = useState(8);
  const [bodyRadius, setBodyRadius] = useState(4);
  const [projectName, setProjectName] = useState('');
  const [previewTab, setPreviewTab] = useState('preview');
  const [docHTML, setDocHTML] = useState('');
  const [pageHTMLs, setPageHTMLs] = useState<string[]>(['']);
  const [libSearch, setLibSearch] = useState('');
  const [libCategory, setLibCategory] = useState('All');
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [copied, setCopied] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenu>({ x: 0, y: 0, visible: false });
  const [activeTab, setActiveTab] = useState('transform');
  const [editingPreset, setEditingPreset] = useState<BrandPreset | null>(null);
  const [layoutWarning, setLayoutWarning] = useState<{ newLayout: string; pageIdx: number } | null>(null);
  const activePageRef = useRef<HTMLDivElement>(null);
  const [previewFocused, setPreviewFocused] = useState(false);
  const [selectedGoogleFont, setSelectedGoogleFont] = useState<GoogleFont | null>(null);
  const [fontPickerCategory, setFontPickerCategory] = useState('Sans');

  // ── Connect tab state ──
  const [claudeApiKey, setClaudeApiKey] = useState(() => localStorage.getItem('docforge_claude_key') || '');
  const [claudeKeyVisible, setClaudeKeyVisible] = useState(false);
  const [claudeConnected, setClaudeConnected] = useState(false);
  const [claudeMessages, setClaudeMessages] = useState<{role:'user'|'assistant', content:string}[]>([]);
  const [claudeInput, setClaudeInput] = useState('');
  const [claudeLoading, setClaudeLoading] = useState(false);
  const [claudeAction, setClaudeAction] = useState<'chat'|'generate'|'improve'|'rewrite'|'translate'>('chat');
  const [translateLang, setTranslateLang] = useState('Spanish');
  const [googleDocsUrl, setGoogleDocsUrl] = useState('');
  const [googleDocsLoading, setGoogleDocsLoading] = useState(false);
  const [fileImportLoading, setFileImportLoading] = useState(false);
  const [fileImportStatus, setFileImportStatus] = useState('');
  const [mergeFields, setMergeFields] = useState<{key:string, value:string}[]>([]);
  const [watermark, setWatermark] = useState('');
  const [showPageNumbers, setShowPageNumbers] = useState(false);
  const [connectSection, setConnectSection] = useState<'files'|'claude'|'google'|'tools'>('files');

  // ── Header & text style state ──
  const [headerGradient, setHeaderGradient] = useState(false);
  const [headerGradientColor2, setHeaderGradientColor2] = useState('#6366f1');
  const [headerGradientAngle, setHeaderGradientAngle] = useState(135);
  const [headerBgOverride, setHeaderBgOverride] = useState('');
  const [headerTextOverride, setHeaderTextOverride] = useState('');
  const [headerFontSize, setHeaderFontSize] = useState(22);
  const [bodyFontSize, setBodyFontSize] = useState(13);
  // Quick brand fields (sync'd into buildAndRender)
  const [quickLogo, setQuickLogo] = useState('');
  const [quickCompany, setQuickCompany] = useState('');
  const [quickTagline, setQuickTagline] = useState('');
  const [logoImage, setLogoImage] = useState(''); // base64 data URL for uploaded logo image

  const handleLogoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setLogoImage(ev.target?.result as string);
      setQuickLogo(''); // clear text logo when image is uploaded
    };
    reader.readAsDataURL(file);
  };

  // ── Per-page state ──
  const [pages, setPages] = useState<PageData[]>([newPage(SAMPLE_TEXT)]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);

  // ── Derived ──
  const theme = THEMES.find(t => t.id === selectedThemeId) ?? THEMES[0];
  const activePreset = presets.find(p => p.id === selectedPresetId) ?? null;
  const currentPage = pages[currentPageIdx] ?? pages[0];

  const updateCurrentPage = (updates: Partial<PageData>) =>
    setPages(ps => ps.map((p, i) => i === currentPageIdx ? { ...p, ...updates } : p));

  const updatePageAtIdx = (idx: number, updates: Partial<PageData>) =>
    setPages(ps => ps.map((p, i) => i === idx ? { ...p, ...updates } : p));

  // ── Build & render ──
  const buildAndRender = useCallback(() => {
    const ef: Partial<BrandPreset> = {
      ...(activePreset || {}),
      ...brandOverride,
      ...(quickLogo ? { logoText: quickLogo } : {}),
      ...(quickCompany ? { companyName: quickCompany } : {}),
      ...(quickTagline ? { tagline: quickTagline } : {}),
      // Google Font overrides theme/preset fontFamily when selected
      ...(selectedGoogleFont ? { fontFamily: selectedGoogleFont.family } : {}),
    };
    const googleFontImport = selectedGoogleFont
      ? `<link rel="stylesheet" href="${GOOGLE_FONTS_URL}" />`
      : '';
    const htmls = pages.map(pg =>
      parseDocument(
        pg.rawText, theme, ef, pg.invoiceMode, pg.lineItems, pg.taxRate,
        pg.signatureLines, headerRadius, bodyRadius, pg.layout, projectName,
        pg.checklistItems, pg.tableHeaders, pg.tableRows, pg.tableSmartMode,
        headerGradient, headerGradientColor2, headerGradientAngle,
        headerBgOverride, headerTextOverride, headerFontSize, bodyFontSize,
        logoImage, googleFontImport,
        watermark, showPageNumbers,
        Object.fromEntries(mergeFields.filter(f => f.key && f.value).map(f => [f.key, f.value]))
      )
    );
    setPageHTMLs(htmls);
    setDocHTML(htmls[currentPageIdx] || '');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedThemeId, selectedPresetId,
    JSON.stringify(brandOverride), JSON.stringify(pages),
    headerRadius, bodyRadius, projectName, currentPageIdx,
    headerGradient, headerGradientColor2, headerGradientAngle,
    headerBgOverride, headerTextOverride, headerFontSize, bodyFontSize,
    quickLogo, quickCompany, quickTagline, logoImage,
    selectedGoogleFont?.name,
    watermark, showPageNumbers, JSON.stringify(mergeFields),
  ]);

  useEffect(() => { buildAndRender(); }, [buildAndRender]);
  const handleGenerate = buildAndRender;

  // ── Load all Google Fonts in the browser (one combined request) ──
  useEffect(() => {
    if (document.querySelector('link[data-docforge-gfonts]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = GOOGLE_FONTS_URL;
    link.dataset.docforgeGfonts = '1';
    document.head.appendChild(link);
  }, []);

  // ── Sync active page HTML into contentEditable ref (skips when user is editing) ──
  useEffect(() => {
    if (activePageRef.current && !previewFocused) {
      activePageRef.current.innerHTML = pageHTMLs[currentPageIdx] || '';
    }
  }, [pageHTMLs, currentPageIdx, previewFocused]);

  // ── Layout change with warning ──
  const handleLayoutChange = (newLayout: string) => {
    const pg = currentPage;
    const hasContent = pg.rawText.trim().length > 0 || pg.tableHeaders.length > 0 || pg.checklistItems.length > 0;
    if (hasContent && pg.layout !== newLayout) {
      setLayoutWarning({ newLayout, pageIdx: currentPageIdx });
    } else {
      updateCurrentPage({ layout: newLayout });
    }
  };

  // ── Table management ──
  const addTableRow = () => {
    const pg = currentPage;
    if (pg.tableHeaders.length === 0) {
      updateCurrentPage({
        tableHeaders: ['Column 1', 'Column 2'],
        tableRows: [...pg.tableRows, ['', '']],
        showTable: true,
      });
    } else {
      updateCurrentPage({
        tableRows: [...pg.tableRows, pg.tableHeaders.map(() => '')],
      });
    }
  };

  const addTableCol = () => {
    const pg = currentPage;
    const newColIndex = pg.tableHeaders.length;
    updateCurrentPage({
      tableHeaders: [...pg.tableHeaders, `Column ${newColIndex + 1}`],
      tableRows: pg.tableRows.map(row => [...row, '']),
      showTable: true,
    });
  };

  const removeTableRow = (rowIdx: number) => {
    updateCurrentPage({ tableRows: currentPage.tableRows.filter((_, i) => i !== rowIdx) });
  };

  const removeTableCol = (colIdx: number) => {
    updateCurrentPage({
      tableHeaders: currentPage.tableHeaders.filter((_, i) => i !== colIdx),
      tableRows: currentPage.tableRows.map(row => row.filter((_, i) => i !== colIdx)),
    });
  };

  // ── Checklist management ──
  const addChecklistItem = () => {
    updateCurrentPage({
      checklistItems: [...currentPage.checklistItems, { text: 'New item', checked: false }],
      showChecklist: true,
    });
  };

  const removeChecklistItem = (idx: number) => {
    const updated = currentPage.checklistItems.filter((_, i) => i !== idx);
    updateCurrentPage({ checklistItems: updated, showChecklist: updated.length > 0 });
  };

  // ── Signature management ──
  const addSignatureLine = () => {
    updateCurrentPage({
      signatureLines: [
        ...currentPage.signatureLines,
        { id: `sig-${Date.now()}`, label: 'Signature', name: '' },
      ],
    });
  };

  const removeSignatureLine = (id: string) => {
    updateCurrentPage({
      signatureLines: currentPage.signatureLines.filter(s => s.id !== id),
    });
  };

  const updateSignatureLine = (id: string, updates: Partial<SignatureLine>) => {
    updateCurrentPage({
      signatureLines: currentPage.signatureLines.map(s => s.id === id ? { ...s, ...updates } : s),
    });
  };

  // ── Line items management ──
  const updateLineItem = (idx: number, updates: Partial<LineItem>) => {
    updateCurrentPage({
      lineItems: currentPage.lineItems.map((item, i) => i === idx ? { ...item, ...updates } : item),
    });
  };

  const addLineItem = () => {
    updateCurrentPage({
      lineItems: [...currentPage.lineItems, { description: 'New Item', qty: 1, rate: 0 }],
    });
  };

  const removeLineItem = (idx: number) => {
    updateCurrentPage({ lineItems: currentPage.lineItems.filter((_, i) => i !== idx) });
  };

  // ── Page management ──
  const addPage = () => {
    const newPg = newPage('', currentPage.layout);
    setPages(ps => [...ps, newPg]);
    setCurrentPageIdx(pages.length);
  };

  const deletePage = (idx: number) => {
    if (pages.length === 1) return;
    setPages(ps => ps.filter((_, i) => i !== idx));
    setCurrentPageIdx(Math.max(0, currentPageIdx - 1));
  };

  // ── Presets management ──
  const savePreset = () => {
    if (!newPresetName.trim()) return;
    const preset: BrandPreset = {
      id: `preset-${Date.now()}`,
      name: newPresetName.trim(),
      primaryColor: brandOverride.primaryColor || theme.primaryColor,
      secondaryColor: brandOverride.secondaryColor || theme.secondaryColor,
      accentColor: brandOverride.accentColor || theme.accentColor,
      fontFamily: brandOverride.fontFamily || theme.fontFamily,
      logoText: brandOverride.logoText || '🏢',
      companyName: brandOverride.companyName || 'My Company',
      tagline: brandOverride.tagline || '',
    };
    const updated = [...presets, preset];
    setPresets(updated);
    localStorage.setItem('docforge_presets', JSON.stringify(updated));
    setNewPresetName('');
  };

  const deletePreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    localStorage.setItem('docforge_presets', JSON.stringify(updated));
    if (selectedPresetId === id) setSelectedPresetId('');
  };

  const duplicatePreset = (preset: BrandPreset) => {
    const dup: BrandPreset = { ...preset, id: `preset-${Date.now()}`, name: preset.name + ' (Copy)' };
    const updated = [...presets, dup];
    setPresets(updated);
    localStorage.setItem('docforge_presets', JSON.stringify(updated));
  };

  const saveEditingPreset = () => {
    if (!editingPreset) return;
    const updated = presets.map(p => p.id === editingPreset.id ? editingPreset : p);
    setPresets(updated);
    localStorage.setItem('docforge_presets', JSON.stringify(updated));
    setEditingPreset(null);
  };

  // ── Apply preset (restores all style settings) ──
  const applyPreset = (preset: BrandPreset) => {
    setSelectedPresetId(preset.id);
    if (preset.themeId) setSelectedThemeId(preset.themeId);
    if (preset.headerBgOverride !== undefined) setHeaderBgOverride(preset.headerBgOverride);
    if (preset.headerTextOverride !== undefined) setHeaderTextOverride(preset.headerTextOverride);
    if (preset.headerGradient !== undefined) setHeaderGradient(preset.headerGradient);
    if (preset.headerGradientColor2 !== undefined) setHeaderGradientColor2(preset.headerGradientColor2);
    if (preset.headerGradientAngle !== undefined) setHeaderGradientAngle(preset.headerGradientAngle);
    if (preset.headerFontSize !== undefined) setHeaderFontSize(preset.headerFontSize);
    if (preset.bodyFontSize !== undefined) setBodyFontSize(preset.bodyFontSize);
    if (preset.logoText) setQuickLogo(preset.logoText);
    if (preset.companyName) setQuickCompany(preset.companyName);
    if (preset.tagline) setQuickTagline(preset.tagline);
    setActiveTab('transform');
  };

  // ── Save current full style as preset ──
  const [saveCurrentName, setSaveCurrentName] = useState('');
  const saveCurrentAsPreset = () => {
    const name = saveCurrentName.trim();
    if (!name) return;
    const preset: BrandPreset = {
      id: `preset-${Date.now()}`,
      name,
      themeId: selectedThemeId,
      primaryColor: brandOverride.primaryColor || theme.primaryColor,
      secondaryColor: brandOverride.secondaryColor || theme.secondaryColor,
      accentColor: brandOverride.accentColor || theme.accentColor,
      fontFamily: brandOverride.fontFamily || theme.fontFamily,
      logoText: quickLogo || brandOverride.logoText || '',
      companyName: quickCompany || brandOverride.companyName || '',
      tagline: quickTagline || brandOverride.tagline || '',
      headerBgOverride,
      headerTextOverride,
      headerGradient,
      headerGradientColor2,
      headerGradientAngle,
      headerFontSize,
      bodyFontSize,
    };
    const updated = [...presets, preset];
    setPresets(updated);
    localStorage.setItem('docforge_presets', JSON.stringify(updated));
    setSaveCurrentName('');
  };

  // ── Export presets as JSON ──
  const exportPresets = () => {
    const blob = new Blob([JSON.stringify(presets, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'docforge-presets.json'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Import presets from JSON file ──
  const importPresets = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const imported: BrandPreset[] = JSON.parse(ev.target?.result as string);
        const merged = [
          ...presets,
          ...imported.map(p => ({ ...p, id: `imported-${Date.now()}-${Math.random().toString(36).slice(2)}` })),
        ];
        setPresets(merged);
        localStorage.setItem('docforge_presets', JSON.stringify(merged));
      } catch { /* ignore invalid JSON */ }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── File import ──
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileImportLoading(true);
    setFileImportStatus(`Reading ${file.name}…`);

    try {
      if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text();
        updateCurrentPage({ rawText: text });
        setFileImportStatus(`✓ Imported ${file.name} (${text.length} chars)`);
      } else if (file.name.endsWith('.pdf')) {
        setFileImportStatus('Loading PDF engine…');
        if (!(window as any).pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
          });
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        const pdfjsLib = (window as any).pdfjsLib;
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          setFileImportStatus(`Extracting page ${i}/${pdf.numPages}…`);
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item: any) => item.str).join(' ') + '\n\n';
        }
        updateCurrentPage({ rawText: text.trim() });
        setFileImportStatus(`✓ Imported PDF: ${pdf.numPages} pages, ${text.length} chars`);
      } else if (file.name.endsWith('.docx')) {
        setFileImportStatus('Loading DOCX engine…');
        if (!(window as any).mammoth) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/mammoth@1.6.0/mammoth.browser.min.js';
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        const arrayBuffer = await file.arrayBuffer();
        const result = await (window as any).mammoth.extractRawText({ arrayBuffer });
        updateCurrentPage({ rawText: result.value });
        setFileImportStatus(`✓ Imported ${file.name} (${result.value.length} chars)`);
      } else {
        setFileImportStatus('❌ Unsupported format. Use .txt, .pdf, or .docx');
      }
    } catch (err) {
      setFileImportStatus(`❌ Error: ${(err as Error).message}`);
    }
    setFileImportLoading(false);
    e.target.value = '';
  };

  // ── Claude API ──
  const saveClaudeKey = (key: string) => {
    setClaudeApiKey(key);
    localStorage.setItem('docforge_claude_key', key);
  };

  const testClaudeConnection = async () => {
    if (!claudeApiKey.trim()) return;
    setClaudeLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-allow-browser': 'true',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });
      setClaudeConnected(res.ok);
      if (!res.ok) { const d = await res.json(); alert('API error: ' + (d.error?.message || res.status)); }
    } catch { setClaudeConnected(false); }
    setClaudeLoading(false);
  };

  const sendClaudeMessage = async () => {
    if (!claudeApiKey || !claudeInput.trim()) return;
    const docContext = currentPage.rawText.slice(0, 3000);

    let systemPrompt = `You are a professional document writing assistant integrated into DocForge, a document styling platform. The user's current document text is:\n\n---\n${docContext}\n---\n\nHelp the user improve, generate, or transform their document content. Keep responses focused and actionable. When providing document text, format it clearly.`;

    let userMessage = claudeInput;

    if (claudeAction === 'improve') {
      userMessage = `Please improve and refine the following document text while keeping the same meaning and structure:\n\n${docContext}`;
    } else if (claudeAction === 'generate') {
      userMessage = `Generate professional document content for: ${claudeInput}\n\nFormat it with clear headings (use ALL CAPS for main sections), bullet points (- item), and professional language suitable for a styled document.`;
    } else if (claudeAction === 'rewrite') {
      userMessage = `Rewrite the document in a more professional/formal tone:\n\n${docContext}`;
    } else if (claudeAction === 'translate') {
      userMessage = `Translate the following document text to ${translateLang}:\n\n${docContext}`;
    }

    const newMessages: {role:'user'|'assistant', content:string}[] = [
      ...claudeMessages,
      { role: 'user', content: claudeInput },
    ];
    setClaudeMessages(newMessages);
    setClaudeInput('');
    setClaudeLoading(true);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-allow-browser': 'true',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 2048,
          system: systemPrompt,
          messages: claudeAction === 'chat'
            ? [...claudeMessages, { role: 'user', content: userMessage }]
            : [{ role: 'user', content: userMessage }],
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || 'No response';
      setClaudeMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setClaudeMessages(prev => [...prev, { role: 'assistant', content: `Error: ${(err as Error).message}` }]);
    }
    setClaudeLoading(false);
  };

  // ── Google Docs import ──
  const importGoogleDoc = async () => {
    if (!googleDocsUrl.trim()) return;
    setGoogleDocsLoading(true);
    try {
      const match = googleDocsUrl.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
      if (!match) { alert('Could not find Google Doc ID in URL'); setGoogleDocsLoading(false); return; }
      const docId = match[1];
      const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
      const res = await fetch(exportUrl);
      if (!res.ok) throw new Error('Could not fetch document. Make sure it is publicly shared (Anyone with link can view).');
      const text = await res.text();
      updateCurrentPage({ rawText: text });
      setGoogleDocsUrl('');
    } catch (err) {
      alert((err as Error).message);
    }
    setGoogleDocsLoading(false);
  };

  // ── Merge fields ──
  const addMergeField = () => setMergeFields(mf => [...mf, { key: 'field_name', value: '' }]);
  const removeMergeField = (i: number) => setMergeFields(mf => mf.filter((_, idx) => idx !== i));
  const updateMergeField = (i: number, updates: Partial<{key:string, value:string}>) =>
    setMergeFields(mf => mf.map((f, idx) => idx === i ? { ...f, ...updates } : f));

  // ── Context menu ──
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true });
  };

  const applyFormat = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    setContextMenu(c => ({ ...c, visible: false }));
  };

  // ── Print / copy ──
  const handlePrint = () => { window.print(); };

  const handleCopyHTML = () => {
    navigator.clipboard.writeText(pageHTMLs[currentPageIdx] || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Close context menu on outside click ──
  useEffect(() => {
    const close = () => setContextMenu(c => ({ ...c, visible: false }));
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  // ── Category list for library ──
  const CATEGORIES = ['All', 'Gradient', 'Medical/Dental', 'Luxury', 'Athletic', 'Corporate', 'Creative', 'Hospitality', 'Tech', 'Specialty'];

  const filteredThemes = THEMES.filter(t => {
    const matchCat = libCategory === 'All' || t.category === libCategory;
    const matchSearch = !libSearch || t.name.toLowerCase().includes(libSearch.toLowerCase()) || t.category.toLowerCase().includes(libSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Invoice subtotal calc ──
  const invoiceSubtotal = currentPage.lineItems.reduce((s, i) => s + i.qty * i.rate, 0);
  const invoiceTax = invoiceSubtotal * (currentPage.taxRate / 100);
  const invoiceTotal = invoiceSubtotal + invoiceTax;

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Print target */}
      <div id="docforge-print-target" style={{ display: 'none' }}>
        {pageHTMLs.map((html, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: html }} style={{ pageBreakAfter: 'always' }} />
        ))}
      </div>

      <style>{`
        @media print {
          body > *:not(#docforge-print-target) { display: none !important; }
          #docforge-print-target { display: block !important; }
        }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #18181b; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 2px; }
      `}</style>

      {/* ── Header ── */}
      <header className="border-b border-zinc-800 px-6 py-3 flex items-center gap-4 flex-shrink-0 bg-zinc-900">
        <div className="flex items-center gap-2">
          <span className="text-blue-400 text-xl">⚡</span>
          <span className="font-bold text-lg tracking-tight text-white">DocForge</span>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded ml-1">v15</span>
        </div>
        <nav className="flex gap-1 ml-4">
          {(['transform', 'presets', 'library', 'connect'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${activeTab === tab ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
            >
              {tab === 'transform' ? '⚡ Transform' : tab === 'presets' ? '🎨 Brand Presets' : tab === 'library' ? '📚 Style Library' : '🔌 Connect'}
            </button>
          ))}
        </nav>
        <div className="ml-auto text-xs text-zinc-600">
          {pages.length} page{pages.length !== 1 ? 's' : ''} · {pageHTMLs[currentPageIdx]?.length || 0} chars
        </div>
      </header>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-hidden">

        {/* ══ TRANSFORM TAB ══ */}
        {activeTab === 'transform' && (
          <div className="flex flex-col-reverse md:flex-row h-full" style={{ height: 'calc(100vh - 57px)' }}>

            {/* Left panel — controls (bottom on mobile, left on desktop) */}
            <div className="md:w-2/5 w-full border-t md:border-t-0 md:border-r border-zinc-800 overflow-y-auto scrollbar-thin bg-zinc-900" style={{ maxHeight: '100%' }}>
              <div className="p-4 space-y-5">

                {/* Project Name */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Project Name</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder="e.g. Q4 Patient Report"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Text Input */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Document Text — Page {currentPageIdx + 1}</label>
                  <textarea
                    value={currentPage.rawText}
                    onChange={e => updateCurrentPage({ rawText: e.target.value })}
                    rows={8}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono resize-y"
                    placeholder="Paste your document text here..."
                  />
                </div>

                {/* Style Theme */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Style Theme</label>
                  <select
                    value={selectedThemeId}
                    onChange={e => setSelectedThemeId(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <optgroup key={cat} label={cat}>
                        {THEMES.filter(t => t.category === cat).map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <div className="mt-1.5 flex gap-1.5">
                    <div className="w-4 h-4 rounded" style={{ background: theme.primaryColor }} />
                    <div className="w-4 h-4 rounded" style={{ background: theme.secondaryColor, border: '1px solid #3f3f46' }} />
                    <div className="w-4 h-4 rounded" style={{ background: theme.accentColor }} />
                    <span className="text-xs text-zinc-500 ml-1">{theme.category}</span>
                  </div>
                </div>

                {/* ── FONT PICKER ── */}
                <div className="border border-zinc-700 rounded-xl overflow-hidden">
                  <div className="px-3 py-2.5 bg-zinc-800 flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-200">🔤 Font</span>
                    <div className="flex items-center gap-2">
                      {selectedGoogleFont && (
                        <span className="text-xs text-blue-400 truncate max-w-28">{selectedGoogleFont.name}</span>
                      )}
                      {selectedGoogleFont && (
                        <button onClick={() => setSelectedGoogleFont(null)}
                          className="text-xs text-zinc-500 hover:text-zinc-300 px-1">✕ reset</button>
                      )}
                    </div>
                  </div>
                  <div className="p-3">
                    {/* Category tabs */}
                    <div className="flex gap-1 mb-3 flex-wrap">
                      {['Sans', 'Serif', 'Display', 'Mono', 'Script'].map(cat => (
                        <button key={cat} onClick={() => setFontPickerCategory(cat)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${fontPickerCategory === cat ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                    {/* Font grid */}
                    <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto scrollbar-thin">
                      {/* System default option */}
                      {fontPickerCategory === 'Sans' && (
                        <button
                          onClick={() => setSelectedGoogleFont(null)}
                          className={`px-2.5 py-2 rounded-lg border text-left transition-colors ${!selectedGoogleFont ? 'border-blue-500 bg-blue-600/10 text-blue-300' : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500'}`}
                        >
                          <div className="text-xs font-medium">Theme Default</div>
                          <div className="text-xs opacity-60" style={{ fontFamily: 'system-ui' }}>Aa Bb Cc</div>
                        </button>
                      )}
                      {GOOGLE_FONTS.filter(f => f.category === fontPickerCategory).map(font => (
                        <button
                          key={font.name}
                          onClick={() => setSelectedGoogleFont(font)}
                          className={`px-2.5 py-2 rounded-lg border text-left transition-colors ${selectedGoogleFont?.name === font.name ? 'border-blue-500 bg-blue-600/10 text-blue-300' : 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-750'}`}
                        >
                          <div className="text-xs font-medium truncate">{font.name}</div>
                          <div className="text-sm mt-0.5 truncate" style={{ fontFamily: font.family }}>Aa Bb Cc 123</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── HEADER STYLE (always visible) ── */}
                <div className="border border-zinc-700 rounded-xl overflow-hidden">
                  <div className="px-3 py-2.5 bg-zinc-800 text-sm font-semibold text-zinc-200">🎨 Header &amp; Text Style</div>
                  <div className="p-3 space-y-3">

                    {/* Company / Logo / Tagline row */}
                    <div className="grid grid-cols-5 gap-2">
                      <div className="col-span-1">
                        <label className="text-xs text-zinc-400 block mb-1">Logo</label>
                        {logoImage ? (
                          <div className="relative">
                            <img src={logoImage} alt="logo" className="w-full h-14 object-contain rounded-lg border border-zinc-600 bg-zinc-800" />
                            <button
                              onClick={() => setLogoImage('')}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 hover:bg-red-400 rounded-full text-white text-xs flex items-center justify-center leading-none"
                              title="Remove image"
                            >✕</button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <input type="text" value={quickLogo} onChange={e => setQuickLogo(e.target.value)}
                              placeholder="🏢"
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-base text-center focus:outline-none focus:border-blue-500" />
                            <label className="flex items-center justify-center gap-0.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg py-1 text-xs text-zinc-300 cursor-pointer transition-colors">
                              <span>📎</span>
                              <input type="file" accept="image/*" className="hidden" onChange={handleLogoImageUpload} />
                            </label>
                          </div>
                        )}
                      </div>
                      <div className="col-span-4 space-y-2">
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Company Name</label>
                          <input type="text" value={quickCompany} onChange={e => setQuickCompany(e.target.value)}
                            placeholder="e.g. BrightSmile Dental"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Tagline</label>
                          <input type="text" value={quickTagline} onChange={e => setQuickTagline(e.target.value)}
                            placeholder="e.g. Straighten Your Future"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                        </div>
                      </div>
                    </div>

                    {/* Header BG color + gradient */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs text-zinc-400">Header Background</label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500">Gradient</span>
                          <button
                            onClick={() => setHeaderGradient(v => !v)}
                            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${headerGradient ? 'bg-blue-500' : 'bg-zinc-600'}`}
                          >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${headerGradient ? 'translate-x-3' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input type="color"
                          value={headerBgOverride || theme.headerBg.replace(/linear-gradient[^)]+\)/, theme.primaryColor)}
                          onChange={e => setHeaderBgOverride(e.target.value)}
                          className="w-10 h-9 rounded-lg border border-zinc-600 cursor-pointer bg-transparent p-0.5" />
                        <input type="text"
                          value={headerBgOverride}
                          onChange={e => setHeaderBgOverride(e.target.value)}
                          placeholder={theme.headerBg.startsWith('linear') ? '(theme gradient)' : theme.headerBg}
                          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500" />
                        {headerBgOverride && (
                          <button onClick={() => setHeaderBgOverride('')} className="text-xs text-zinc-500 hover:text-zinc-300 px-1">✕</button>
                        )}
                      </div>
                      {headerGradient && (
                        <div className="mt-2 space-y-2">
                          <div className="flex gap-2 items-center">
                            <span className="text-xs text-zinc-500 w-16 flex-shrink-0">End color</span>
                            <input type="color" value={headerGradientColor2} onChange={e => setHeaderGradientColor2(e.target.value)}
                              className="w-10 h-8 rounded-lg border border-zinc-600 cursor-pointer bg-transparent p-0.5" />
                            <input type="text" value={headerGradientColor2} onChange={e => setHeaderGradientColor2(e.target.value)}
                              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500" />
                          </div>
                          {/* Live gradient preview */}
                          <div className="h-8 rounded-lg border border-zinc-600"
                            style={{ background: `linear-gradient(${headerGradientAngle}deg, ${headerBgOverride || theme.primaryColor}, ${headerGradientColor2})` }} />
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 w-16 flex-shrink-0">Angle {headerGradientAngle}°</span>
                            <input type="range" min={0} max={360} value={headerGradientAngle}
                              onChange={e => setHeaderGradientAngle(+e.target.value)}
                              className="flex-1 accent-blue-500" />
                          </div>
                          {/* Preset directions */}
                          <div className="flex gap-1 flex-wrap">
                            {[['→', 90], ['↓', 180], ['↘', 135], ['↗', 45], ['⟳', 225]].map(([label, angle]) => (
                              <button key={angle} onClick={() => setHeaderGradientAngle(angle as number)}
                                className={`px-2 py-0.5 rounded text-xs transition-colors ${headerGradientAngle === angle ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}>
                                {label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Header text color */}
                    <div>
                      <label className="text-xs text-zinc-400 block mb-1.5">Header Text Color</label>
                      <div className="flex gap-2 items-center">
                        <input type="color"
                          value={headerTextOverride || theme.headerText}
                          onChange={e => setHeaderTextOverride(e.target.value)}
                          className="w-10 h-9 rounded-lg border border-zinc-600 cursor-pointer bg-transparent p-0.5" />
                        <input type="text"
                          value={headerTextOverride}
                          onChange={e => setHeaderTextOverride(e.target.value)}
                          placeholder={theme.headerText}
                          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500" />
                        {headerTextOverride && (
                          <button onClick={() => setHeaderTextOverride('')} className="text-xs text-zinc-500 hover:text-zinc-300 px-1">✕</button>
                        )}
                      </div>
                    </div>

                    {/* Font sizes */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Header Size: <span className="text-zinc-200">{headerFontSize}px</span></label>
                        <input type="range" min={14} max={48} value={headerFontSize}
                          onChange={e => setHeaderFontSize(+e.target.value)}
                          className="w-full accent-blue-500" />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Body Size: <span className="text-zinc-200">{bodyFontSize}px</span></label>
                        <input type="range" min={10} max={20} value={bodyFontSize}
                          onChange={e => setBodyFontSize(+e.target.value)}
                          className="w-full accent-blue-500" />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Page Layout */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Page Layout</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {LAYOUTS.map(l => {
                      const isRec = theme.suggestedLayout === l.id;
                      const isActive = currentPage.layout === l.id;
                      return (
                        <button
                          key={l.id}
                          onClick={() => handleLayoutChange(l.id)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${isActive ? 'bg-zinc-700 text-white border border-zinc-500' : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-750 hover:border-zinc-600'}`}
                        >
                          <div>
                            <span className="font-medium">{l.name}</span>
                            <span className="text-xs text-zinc-500 ml-2">{l.desc}</span>
                          </div>
                          {isRec && <span className="text-xs text-yellow-400 ml-2">★ Rec</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Brand Preset */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Brand Preset</label>
                  <select
                    value={selectedPresetId}
                    onChange={e => setSelectedPresetId(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">— None —</option>
                    {presets.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Brand Override */}
                <div className="border border-zinc-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowOverride(v => !v)}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-sm font-medium transition-colors"
                  >
                    <span>🎨 Brand Override</span>
                    <span className="text-zinc-500">{showOverride ? '▲' : '▼'}</span>
                  </button>
                  {showOverride && (
                    <div className="p-3 space-y-3 bg-zinc-850 border-t border-zinc-700">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Logo / Emoji</label>
                          <input type="text" value={brandOverride.logoText || ''} onChange={e => setBrandOverride(b => ({ ...b, logoText: e.target.value }))}
                            placeholder="🏢" className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Font Family</label>
                          <input type="text" value={brandOverride.fontFamily || ''} onChange={e => setBrandOverride(b => ({ ...b, fontFamily: e.target.value }))}
                            placeholder="Georgia, serif" className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Company Name</label>
                        <input type="text" value={brandOverride.companyName || ''} onChange={e => setBrandOverride(b => ({ ...b, companyName: e.target.value }))}
                          placeholder="My Company" className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Tagline</label>
                        <input type="text" value={brandOverride.tagline || ''} onChange={e => setBrandOverride(b => ({ ...b, tagline: e.target.value }))}
                          placeholder="Your tagline..." className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Primary</label>
                          <div className="flex gap-1 items-center">
                            <input type="color" value={brandOverride.primaryColor || theme.primaryColor} onChange={e => setBrandOverride(b => ({ ...b, primaryColor: e.target.value }))}
                              className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" />
                            <input type="text" value={brandOverride.primaryColor || ''} onChange={e => setBrandOverride(b => ({ ...b, primaryColor: e.target.value }))}
                              placeholder={theme.primaryColor} className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Secondary</label>
                          <div className="flex gap-1 items-center">
                            <input type="color" value={brandOverride.secondaryColor || theme.secondaryColor} onChange={e => setBrandOverride(b => ({ ...b, secondaryColor: e.target.value }))}
                              className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" />
                            <input type="text" value={brandOverride.secondaryColor || ''} onChange={e => setBrandOverride(b => ({ ...b, secondaryColor: e.target.value }))}
                              placeholder={theme.secondaryColor} className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Accent</label>
                          <div className="flex gap-1 items-center">
                            <input type="color" value={brandOverride.accentColor || theme.accentColor} onChange={e => setBrandOverride(b => ({ ...b, accentColor: e.target.value }))}
                              className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent" />
                            <input type="text" value={brandOverride.accentColor || ''} onChange={e => setBrandOverride(b => ({ ...b, accentColor: e.target.value }))}
                              placeholder={theme.accentColor} className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Header Radius: {headerRadius}px</label>
                        <input type="range" min={0} max={20} value={headerRadius} onChange={e => setHeaderRadius(+e.target.value)} onPointerUp={handleGenerate}
                          className="w-full accent-blue-500" />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Body Radius: {bodyRadius}px</label>
                        <input type="range" min={0} max={12} value={bodyRadius} onChange={e => setBodyRadius(+e.target.value)} onPointerUp={handleGenerate}
                          className="w-full accent-blue-500" />
                      </div>
                      <div className="pt-1 border-t border-zinc-700">
                        <div className="flex gap-2">
                          <input type="text" value={newPresetName} onChange={e => setNewPresetName(e.target.value)} placeholder="Preset name..."
                            className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                          <button onClick={savePreset} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors font-medium">Save</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Invoice Mode */}
                <div className="border border-zinc-700 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2.5 bg-zinc-800">
                    <span className="text-sm font-medium">💰 Invoice Mode</span>
                    <button
                      onClick={() => updateCurrentPage({ invoiceMode: !currentPage.invoiceMode })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${currentPage.invoiceMode ? 'bg-blue-600' : 'bg-zinc-600'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${currentPage.invoiceMode ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {currentPage.invoiceMode && (
                    <div className="p-3 border-t border-zinc-700 space-y-2">
                      <div className="grid grid-cols-12 gap-1 text-xs font-semibold text-zinc-400 px-1">
                        <div className="col-span-5">Description</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-3 text-right">Rate</div>
                        <div className="col-span-2 text-right">Amt</div>
                      </div>
                      {currentPage.lineItems.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-1 items-center">
                          <input value={item.description} onChange={e => updateLineItem(idx, { description: e.target.value })}
                            className="col-span-5 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
                          <input type="number" value={item.qty} onChange={e => updateLineItem(idx, { qty: +e.target.value })}
                            className="col-span-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 text-center" />
                          <input type="number" value={item.rate} onChange={e => updateLineItem(idx, { rate: +e.target.value })}
                            className="col-span-3 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 text-right" />
                          <div className="col-span-1 text-xs text-zinc-300 text-right">${(item.qty * item.rate).toFixed(0)}</div>
                          <button onClick={() => removeLineItem(idx)} className="col-span-1 text-zinc-500 hover:text-red-400 text-xs text-center transition-colors">✕</button>
                        </div>
                      ))}
                      <button onClick={addLineItem} className="w-full py-1.5 border border-dashed border-zinc-600 rounded text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors">
                        + Add Line Item
                      </button>
                      <div className="flex items-center gap-2 pt-1">
                        <label className="text-xs text-zinc-400">Tax %</label>
                        <input type="number" value={currentPage.taxRate} onChange={e => updateCurrentPage({ taxRate: +e.target.value })}
                          className="w-16 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
                        <div className="ml-auto text-xs text-zinc-300 space-x-2">
                          <span>Sub: ${invoiceSubtotal.toFixed(2)}</span>
                          <span>Tax: ${invoiceTax.toFixed(2)}</span>
                          <span className="text-white font-bold">Total: ${invoiceTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Checklist Builder */}
                <div className="border border-zinc-700 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2.5 bg-zinc-800">
                    <span className="text-sm font-medium">☑ Checklist</span>
                    <button onClick={addChecklistItem} className="text-xs bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded transition-colors">+ Add Item</button>
                  </div>
                  {currentPage.checklistItems.length > 0 && (
                    <div className="p-3 border-t border-zinc-700 space-y-2">
                      {currentPage.checklistItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <button
                            onClick={() => updateCurrentPage({ checklistItems: currentPage.checklistItems.map((c, i) => i === idx ? { ...c, checked: !c.checked } : c) })}
                            className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${item.checked ? 'bg-blue-600 border-blue-600' : 'border-zinc-500'}`}
                          >
                            {item.checked && <span className="text-white text-xs">✓</span>}
                          </button>
                          <input
                            value={item.text}
                            onChange={e => updateCurrentPage({ checklistItems: currentPage.checklistItems.map((c, i) => i === idx ? { ...c, text: e.target.value } : c) })}
                            className={`flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 ${item.checked ? 'line-through text-zinc-500' : ''}`}
                          />
                          <button onClick={() => removeChecklistItem(idx)} className="text-zinc-500 hover:text-red-400 text-xs transition-colors">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Table Builder */}
                <div className="border border-zinc-700 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2.5 bg-zinc-800">
                    <span className="text-sm font-medium">📊 Table Builder</span>
                    <div className="flex gap-1">
                      <button onClick={addTableRow} className="text-xs bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded transition-colors">+ Row</button>
                      <button onClick={addTableCol} className="text-xs bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded transition-colors">+ Col</button>
                    </div>
                  </div>
                  {currentPage.tableHeaders.length > 0 && (
                    <div className="p-3 border-t border-zinc-700 space-y-2 overflow-x-auto">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400">Smart Mode</span>
                          <button
                            onClick={() => updateCurrentPage({ tableSmartMode: !currentPage.tableSmartMode })}
                            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${currentPage.tableSmartMode ? 'bg-blue-600' : 'bg-zinc-600'}`}
                          >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${currentPage.tableSmartMode ? 'translate-x-3' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400">Show</span>
                          <button
                            onClick={() => updateCurrentPage({ showTable: !currentPage.showTable })}
                            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${currentPage.showTable ? 'bg-blue-600' : 'bg-zinc-600'}`}
                          >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${currentPage.showTable ? 'translate-x-3' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                      </div>
                      <div className="min-w-max">
                        {/* Headers */}
                        <div className="flex gap-1 mb-1">
                          {currentPage.tableHeaders.map((h, ci) => (
                            <div key={ci} className="flex items-center gap-0.5" style={{ minWidth: 80 }}>
                              <input
                                value={h}
                                onChange={e => updateCurrentPage({ tableHeaders: currentPage.tableHeaders.map((hh, i) => i === ci ? e.target.value : hh) })}
                                className="flex-1 bg-blue-900/30 border border-blue-700/40 rounded px-1.5 py-1 text-xs text-zinc-200 font-semibold focus:outline-none focus:border-blue-500"
                                style={{ minWidth: 60 }}
                              />
                              <button onClick={() => removeTableCol(ci)} className="text-zinc-600 hover:text-red-400 text-xs transition-colors">✕</button>
                            </div>
                          ))}
                        </div>
                        {/* Rows */}
                        {currentPage.tableRows.map((row, ri) => (
                          <div key={ri} className="flex gap-1 mb-1 items-center">
                            {row.map((cell, ci) => (
                              <input
                                key={ci}
                                value={cell}
                                onChange={e => updateCurrentPage({ tableRows: currentPage.tableRows.map((r, i) => i === ri ? r.map((c, j) => j === ci ? e.target.value : c) : r) })}
                                className="bg-zinc-800 border border-zinc-700 rounded px-1.5 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                                style={{ minWidth: 80, maxWidth: 120 }}
                              />
                            ))}
                            <button onClick={() => removeTableRow(ri)} className="text-zinc-600 hover:text-red-400 text-xs transition-colors ml-0.5">✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Signature Lines */}
                <div className="border border-zinc-700 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2.5 bg-zinc-800">
                    <span className="text-sm font-medium">✍ Signatures</span>
                    <button onClick={addSignatureLine} className="text-xs bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded transition-colors">+ Add</button>
                  </div>
                  {currentPage.signatureLines.length > 0 && (
                    <div className="p-3 border-t border-zinc-700 space-y-3">
                      {currentPage.signatureLines.map(sig => (
                        <div key={sig.id} className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <input
                              value={sig.label}
                              onChange={e => updateSignatureLine(sig.id, { label: e.target.value })}
                              placeholder="Label (e.g. Doctor)"
                              className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                            />
                            <button onClick={() => removeSignatureLine(sig.id)} className="text-zinc-500 hover:text-red-400 text-xs transition-colors">✕</button>
                          </div>
                          <input
                            value={sig.name}
                            onChange={e => updateSignatureLine(sig.id, { name: e.target.value })}
                            placeholder="Pre-signed name (optional)"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-400 focus:outline-none focus:border-blue-500 italic"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Page Management */}
                <div className="border border-zinc-700 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2.5 bg-zinc-800">
                    <span className="text-sm font-medium">📄 Pages ({pages.length})</span>
                    <button onClick={addPage} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors">+ Add Page</button>
                  </div>
                  <div className="p-3 border-t border-zinc-700 flex gap-2 flex-wrap">
                    {pages.map((pg, i) => (
                      <div key={pg.id} className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPageIdx(i)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${i === currentPageIdx ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
                        >
                          {i + 1}
                        </button>
                        {pages.length > 1 && (
                          <button onClick={() => deletePage(i)} className="text-zinc-600 hover:text-red-400 text-xs transition-colors">✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 overflow-hidden flex flex-col bg-zinc-950">
              {/* Toolbar */}
              <div className="border-b border-zinc-800 px-4 py-2 flex items-center gap-3 bg-zinc-900 flex-shrink-0">
                {/* Page tabs */}
                <div className="flex gap-1 overflow-x-auto">
                  {pages.map((pg, i) => (
                    <button
                      key={pg.id}
                      onClick={() => setCurrentPageIdx(i)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${i === currentPageIdx ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                    >
                      <span>Page {i + 1}</span>
                      <span className="text-zinc-500">·</span>
                      <span className="capitalize text-zinc-400">{pg.layout}</span>
                      {pages.length > 1 && (
                        <span
                          onClick={e => { e.stopPropagation(); deletePage(i); }}
                          className="ml-0.5 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                        >🗑</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="ml-auto flex items-center gap-2">
                  {/* Preview/HTML/Print tabs */}
                  {(['preview', 'html', 'print'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setPreviewTab(t)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${previewTab === t ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                    >
                      {t === 'preview' ? '👁 Preview' : t === 'html' ? '</> HTML' : '🖨 Print'}
                    </button>
                  ))}
                  <div className="w-px h-4 bg-zinc-700" />
                  <button onClick={handlePrint} className="px-2.5 py-1 rounded text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-white transition-colors">
                    Download PDF
                  </button>
                  <button onClick={handleCopyHTML} className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-zinc-700 hover:bg-zinc-600 text-white'}`}>
                    {copied ? '✓ Copied!' : 'Copy HTML'}
                  </button>
                </div>
              </div>

              {/* Preview area */}
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {previewTab === 'preview' && (
                  <div className="p-6 flex flex-col items-center gap-6">
                    {pageHTMLs.map((html, i) => (
                      <div key={pages[i]?.id || i}>
                        <div className="text-xs text-zinc-500 mb-2 text-center flex items-center justify-center gap-2">
                          <span>Page {i + 1} — <span className="capitalize">{pages[i]?.layout || 'standard'}</span></span>
                          {i === currentPageIdx
                            ? <span className="text-blue-400">● click to edit · right-click to format</span>
                            : <span className="text-zinc-600">click to select</span>}
                        </div>
                        {i === currentPageIdx ? (
                          // Active page — contentEditable for direct text editing + right-click formatting
                          <div
                            ref={activePageRef}
                            contentEditable
                            suppressContentEditableWarning
                            onFocus={() => setPreviewFocused(true)}
                            onBlur={() => setPreviewFocused(false)}
                            onContextMenu={handleContextMenu}
                            style={{
                              outline: '2px solid #3b82f6',
                              outlineOffset: '3px',
                              borderRadius: '4px',
                              cursor: 'text',
                              transition: 'outline-color 0.15s',
                            }}
                          />
                        ) : (
                          // Other pages — static, click to switch
                          <div
                            onClick={() => setCurrentPageIdx(i)}
                            style={{
                              outline: '2px solid transparent',
                              outlineOffset: '3px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'outline-color 0.15s',
                              opacity: 0.75,
                            }}
                            dangerouslySetInnerHTML={{ __html: html || '<div style="width:816px;min-height:200px;background:#fff;display:flex;align-items:center;justify-content:center;color:#999;font-family:sans-serif;">Empty page</div>' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {previewTab === 'html' && (
                  <div className="p-4">
                    <textarea
                      readOnly
                      value={pageHTMLs[currentPageIdx] || ''}
                      className="w-full h-full bg-zinc-900 text-zinc-300 font-mono text-xs border border-zinc-700 rounded-lg p-4 resize-none focus:outline-none"
                      style={{ minHeight: 'calc(100vh - 200px)' }}
                    />
                  </div>
                )}

                {previewTab === 'print' && (
                  <div className="p-6 flex flex-col items-center gap-6">
                    <div className="text-zinc-500 text-sm mb-2">Print Preview — all pages</div>
                    {pageHTMLs.map((html, i) => (
                      <div key={i} dangerouslySetInnerHTML={{ __html: html }} style={{ marginBottom: 24 }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ PRESETS TAB ══ */}
        {activeTab === 'presets' && (
          <div className="p-6 overflow-y-auto scrollbar-thin" style={{ maxHeight: 'calc(100vh - 57px)' }}>

            {/* Header toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <h2 className="text-lg font-bold mr-auto">Brand Presets</h2>

              {/* Save current style as preset */}
              <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2">
                <span className="text-xs text-zinc-400 whitespace-nowrap">💾 Save current:</span>
                <input
                  type="text" value={saveCurrentName} onChange={e => setSaveCurrentName(e.target.value)}
                  placeholder="Preset name…"
                  onKeyDown={e => e.key === 'Enter' && saveCurrentAsPreset()}
                  className="bg-zinc-700 border border-zinc-600 rounded-lg px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 w-36"
                />
                <button onClick={saveCurrentAsPreset}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition-colors whitespace-nowrap">
                  Save
                </button>
              </div>

              {/* Import / Export */}
              <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5">
                📥 Import
                <input type="file" accept=".json" className="hidden" onChange={importPresets} />
              </label>
              <button onClick={exportPresets}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5">
                📤 Export
              </button>
              <button
                onClick={() => setEditingPreset({ id: `preset-${Date.now()}`, name: '', primaryColor: '#1a2744', secondaryColor: '#ffffff', accentColor: '#4a90d9', fontFamily: 'Georgia, serif', logoText: '🏢', companyName: '', tagline: '' })}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors"
              >
                + New Preset
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {presets.map(preset => {
                const cardHeaderBg = preset.headerGradient
                  ? `linear-gradient(${preset.headerGradientAngle ?? 135}deg, ${preset.headerBgOverride || preset.primaryColor}, ${preset.headerGradientColor2 || preset.accentColor})`
                  : (preset.headerBgOverride || preset.primaryColor);
                const cardHeaderText = preset.headerTextOverride || '#ffffff';
                return (
                <div key={preset.id} className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden hover:border-zinc-500 transition-colors">
                  {/* Card header — gradient-aware */}
                  <div className="px-4 py-5 flex items-center gap-3" style={{ background: cardHeaderBg, color: cardHeaderText, minHeight: 72 }}>
                    <span className="text-3xl leading-none">{preset.logoText}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate">{preset.companyName || preset.name}</div>
                      {preset.tagline && <div className="text-xs opacity-80 mt-0.5 truncate">{preset.tagline}</div>}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-semibold text-zinc-200 mb-2 truncate">{preset.name}</div>
                    <div className="flex gap-1.5 mb-2 items-center">
                      {preset.headerGradient ? (
                        <div className="h-5 w-16 rounded" style={{ background: `linear-gradient(90deg, ${preset.headerBgOverride || preset.primaryColor}, ${preset.headerGradientColor2 || preset.accentColor})` }} title="Gradient header" />
                      ) : (
                        <>
                          <div className="w-5 h-5 rounded" style={{ background: preset.primaryColor }} title="Primary" />
                          <div className="w-5 h-5 rounded border border-zinc-600" style={{ background: preset.secondaryColor }} title="Secondary" />
                          <div className="w-5 h-5 rounded" style={{ background: preset.accentColor }} title="Accent" />
                        </>
                      )}
                      <span className="text-xs text-zinc-500 ml-1 truncate">{(preset.fontFamily || '').split(',')[0]}</span>
                    </div>
                    {preset.themeId && (
                      <div className="text-xs text-zinc-600 mb-2">Theme: {THEMES.find(t => t.id === preset.themeId)?.name || preset.themeId}</div>
                    )}
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => applyPreset(preset)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition-colors">Apply ↗</button>
                      <button onClick={() => setEditingPreset({ ...preset })}
                        className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs rounded transition-colors">Edit</button>
                      <button onClick={() => duplicatePreset(preset)}
                        className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs rounded transition-colors">Copy</button>
                      <button onClick={() => deletePreset(preset.id)}
                        className="px-2 py-1 bg-red-900/40 hover:bg-red-900/70 text-red-400 text-xs rounded transition-colors">✕</button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Edit preset modal */}
            {editingPreset && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-lg space-y-4 overflow-y-auto" style={{ maxHeight: '90vh' }}>
                  <h3 className="font-bold text-lg">{editingPreset.id.startsWith('preset-') && !presets.find(p => p.id === editingPreset.id) ? 'New Preset' : 'Edit Preset'}</h3>
                  {[
                    { label: 'Preset Name', key: 'name', placeholder: 'My Brand' },
                    { label: 'Company Name', key: 'companyName', placeholder: 'Acme Corp' },
                    { label: 'Tagline', key: 'tagline', placeholder: 'Your tagline...' },
                    { label: 'Logo / Emoji', key: 'logoText', placeholder: '🏢' },
                    { label: 'Font Family', key: 'fontFamily', placeholder: 'Georgia, serif' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs text-zinc-400 block mb-1">{f.label}</label>
                      <input type="text" value={(editingPreset as Record<string, string>)[f.key] || ''} placeholder={f.placeholder}
                        onChange={e => setEditingPreset(ep => ep ? { ...ep, [f.key]: e.target.value } : null)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Primary Color', key: 'primaryColor' },
                      { label: 'Secondary Color', key: 'secondaryColor' },
                      { label: 'Accent Color', key: 'accentColor' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-xs text-zinc-400 block mb-1">{f.label}</label>
                        <input type="color" value={(editingPreset as Record<string, string>)[f.key] || '#000000'}
                          onChange={e => setEditingPreset(ep => ep ? { ...ep, [f.key]: e.target.value } : null)}
                          className="w-full h-9 rounded border border-zinc-600 cursor-pointer bg-transparent" />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        if (!editingPreset.name.trim()) return;
                        const exists = presets.find(p => p.id === editingPreset.id);
                        const updated = exists ? presets.map(p => p.id === editingPreset.id ? editingPreset : p) : [...presets, editingPreset];
                        setPresets(updated);
                        localStorage.setItem('docforge_presets', JSON.stringify(updated));
                        setEditingPreset(null);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-medium transition-colors"
                    >Save Preset</button>
                    <button onClick={() => setEditingPreset(null)} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ LIBRARY TAB ══ */}
        {activeTab === 'library' && (
          <div className="p-6 overflow-y-auto scrollbar-thin" style={{ maxHeight: 'calc(100vh - 57px)' }}>
            <div className="flex items-center gap-4 mb-5">
              <h2 className="text-lg font-bold flex-shrink-0">Style Library</h2>
              <input
                type="text"
                value={libSearch}
                onChange={e => setLibSearch(e.target.value)}
                placeholder="Search themes..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap mb-5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setLibCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${libCategory === cat ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {filteredThemes.map(t => (
                <div key={t.id} className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
                  {/* Mini preview */}
                  <div style={{ height: 80, background: t.backgroundColor, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ background: t.headerBg, height: 36, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                      <div style={{ width: 60, height: 10, background: t.headerText, opacity: 0.8, borderRadius: 3 }} />
                    </div>
                    <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ width: '70%', height: 7, background: t.textColor, opacity: 0.6, borderRadius: 2 }} />
                      <div style={{ width: '50%', height: 7, background: t.textColor, opacity: 0.35, borderRadius: 2 }} />
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-zinc-200">{t.name}</span>
                      <span className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{t.category}</span>
                    </div>
                    <div className="flex gap-1 mb-2.5">
                      <div className="w-4 h-4 rounded" style={{ background: t.primaryColor }} />
                      <div className="w-4 h-4 rounded border border-zinc-600" style={{ background: t.backgroundColor }} />
                      <div className="w-4 h-4 rounded" style={{ background: t.accentColor }} />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedThemeId(t.id); setActiveTab('transform'); }}
                        className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                      >Apply</button>
                      <button
                        onClick={() => setPreviewTheme(t)}
                        className="flex-1 px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs rounded transition-colors"
                      >Preview</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Theme preview modal */}
            {previewTheme && (
              <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-6" onClick={() => setPreviewTheme(null)}>
                <div onClick={e => e.stopPropagation()} className="max-w-3xl w-full bg-zinc-900 rounded-xl border border-zinc-700 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
                    <div>
                      <span className="font-bold">{previewTheme.name}</span>
                      <span className="text-zinc-500 text-sm ml-2">{previewTheme.category}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedThemeId(previewTheme.id); setPreviewTheme(null); setActiveTab('transform'); }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                      >Apply Theme</button>
                      <button onClick={() => setPreviewTheme(null)} className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded transition-colors">Close</button>
                    </div>
                  </div>
                  <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 60px)' }}>
                    <div className="p-4 flex justify-center">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: parseDocument(
                            SAMPLE_TEXT, previewTheme, null, false,
                            [{ description: 'Consultation', qty: 1, rate: 250 }], 8.5,
                            [{ id: 's1', label: 'Doctor', name: 'Dr. Sample' }],
                            8, 4, previewTheme.suggestedLayout || 'standard',
                            'Theme Preview', [], [], [], false
                          )
                        }}
                        style={{ transform: 'scale(0.65)', transformOrigin: 'top center', marginBottom: -240 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* ══ CONNECT TAB ══ */}
        {activeTab === 'connect' && (
          <div className="flex h-full" style={{ height: 'calc(100vh - 57px)' }}>
            {/* Sidebar nav */}
            <div className="w-48 flex-shrink-0 border-r border-zinc-800 bg-zinc-900 p-3 space-y-1">
              {([
                { id: 'files', icon: '📄', label: 'File Import' },
                { id: 'claude', icon: '🤖', label: 'Claude AI' },
                { id: 'google', icon: '🌐', label: 'Google Docs' },
                { id: 'tools', icon: '🛠', label: 'Doc Tools' },
              ] as const).map(s => (
                <button key={s.id} onClick={() => setConnectSection(s.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${connectSection === s.id ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}>
                  <span>{s.icon}</span><span>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-6">

              {/* ── FILE IMPORT ── */}
              {connectSection === 'files' && (
                <div className="max-w-xl space-y-5">
                  <div>
                    <h2 className="text-lg font-bold mb-1">📄 File Import</h2>
                    <p className="text-sm text-zinc-400">Import .txt, .pdf, or .docx files. Text is extracted and fed into the document pipeline — your theme wraps it automatically.</p>
                  </div>

                  {/* Drop zone */}
                  <label className="block border-2 border-dashed border-zinc-600 hover:border-blue-500 rounded-xl p-10 text-center cursor-pointer transition-colors group">
                    <div className="text-4xl mb-3">📂</div>
                    <div className="text-zinc-300 font-medium group-hover:text-white transition-colors">
                      {fileImportLoading ? fileImportStatus : 'Click to browse or drag & drop'}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">Supports: .txt, .md, .pdf, .docx</div>
                    <input type="file" accept=".txt,.md,.pdf,.docx" className="hidden"
                      onChange={handleFileImport} disabled={fileImportLoading} />
                  </label>

                  {fileImportStatus && !fileImportLoading && (
                    <div className={`text-sm px-4 py-3 rounded-lg ${fileImportStatus.startsWith('✓') ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                      {fileImportStatus}
                    </div>
                  )}

                  <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-400 space-y-1">
                    <div className="font-semibold text-zinc-300 mb-2">How it works:</div>
                    <div>1. Pick a file → text is extracted automatically</div>
                    <div>2. Extracted text fills the current page's Document Text field</div>
                    <div>3. Your selected theme and brand preset wrap it instantly</div>
                    <div className="text-xs text-zinc-600 pt-2">PDF/DOCX engines load on-demand from CDN (~1–2s first use)</div>
                  </div>
                </div>
              )}

              {/* ── CLAUDE AI ── */}
              {connectSection === 'claude' && (
                <div className="max-w-2xl space-y-5">
                  <div>
                    <h2 className="text-lg font-bold mb-1">🤖 Claude AI Assistant</h2>
                    <p className="text-sm text-zinc-400">Connect your Anthropic API key to generate content, improve text, translate, and chat about your document.</p>
                  </div>

                  {/* API Key */}
                  <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">API Key</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${claudeConnected ? 'bg-green-900/40 text-green-400' : 'bg-zinc-700 text-zinc-400'}`}>
                        {claudeConnected ? '● connected' : '○ not tested'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type={claudeKeyVisible ? 'text' : 'password'}
                        value={claudeApiKey}
                        onChange={e => saveClaudeKey(e.target.value)}
                        placeholder="sk-ant-..."
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-blue-500"
                      />
                      <button onClick={() => setClaudeKeyVisible(v => !v)}
                        className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-xs text-zinc-300 transition-colors">
                        {claudeKeyVisible ? 'Hide' : 'Show'}
                      </button>
                      <button onClick={testClaudeConnection} disabled={claudeLoading || !claudeApiKey}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-xs text-white font-medium transition-colors">
                        Test
                      </button>
                    </div>
                    <div className="text-xs text-zinc-600">Key stored in localStorage on your device only. Get a key at console.anthropic.com</div>
                  </div>

                  {/* Action selector */}
                  <div className="flex gap-2 flex-wrap">
                    {([
                      { id: 'chat', label: '💬 Chat' },
                      { id: 'generate', label: '✨ Generate' },
                      { id: 'improve', label: '✏️ Improve' },
                      { id: 'rewrite', label: '🔄 Rewrite' },
                      { id: 'translate', label: '🌍 Translate' },
                    ] as const).map(a => (
                      <button key={a.id} onClick={() => setClaudeAction(a.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${claudeAction === a.id ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'}`}>
                        {a.label}
                      </button>
                    ))}
                    {claudeAction === 'translate' && (
                      <select value={translateLang} onChange={e => setTranslateLang(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500">
                        {['Spanish','French','German','Portuguese','Italian','Japanese','Mandarin','Arabic','Russian','Korean'].map(l => (
                          <option key={l}>{l}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Chat area */}
                  <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
                    <div className="h-72 overflow-y-auto scrollbar-thin p-4 space-y-3">
                      {claudeMessages.length === 0 && (
                        <div className="text-zinc-600 text-sm text-center mt-8">
                          {claudeAction === 'chat' ? 'Ask anything about your document…' :
                           claudeAction === 'generate' ? 'Describe what content to generate…' :
                           claudeAction === 'improve' ? 'Click Send to improve your current document text' :
                           claudeAction === 'rewrite' ? 'Click Send to rewrite your document' :
                           `Click Send to translate to ${translateLang}`}
                        </div>
                      )}
                      {claudeMessages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-md px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-200 border border-zinc-700'}`}>
                            {m.content}
                            {m.role === 'assistant' && (
                              <button
                                onClick={() => updateCurrentPage({ rawText: m.content })}
                                className="block mt-2 text-xs text-blue-400 hover:text-blue-300 border-t border-zinc-600 pt-1.5 w-full text-left transition-colors">
                                ↓ Use as document text
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {claudeLoading && (
                        <div className="flex justify-start">
                          <div className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded-xl text-sm text-zinc-400">
                            <span className="animate-pulse">Claude is thinking…</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-zinc-700 p-3 flex gap-2">
                      <input
                        type="text"
                        value={claudeInput}
                        onChange={e => setClaudeInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendClaudeMessage()}
                        placeholder={claudeAction === 'chat' ? 'Ask Claude…' : claudeAction === 'generate' ? 'Describe the content to generate…' : 'Press Send →'}
                        disabled={!claudeApiKey || claudeLoading}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                      />
                      <button onClick={sendClaudeMessage} disabled={!claudeApiKey || claudeLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg font-medium transition-colors">
                        Send
                      </button>
                      {claudeMessages.length > 0 && (
                        <button onClick={() => setClaudeMessages([])}
                          className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-400 text-sm rounded-lg transition-colors">✕</button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── GOOGLE DOCS ── */}
              {connectSection === 'google' && (
                <div className="max-w-xl space-y-5">
                  <div>
                    <h2 className="text-lg font-bold mb-1">🌐 Google Docs Import</h2>
                    <p className="text-sm text-zinc-400">Paste a Google Docs share link to import its text content directly. The document must be shared as "Anyone with the link can view".</p>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
                    <label className="text-sm font-semibold block">Google Docs URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={googleDocsUrl}
                        onChange={e => setGoogleDocsUrl(e.target.value)}
                        placeholder="https://docs.google.com/document/d/..."
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                      />
                      <button onClick={importGoogleDoc} disabled={googleDocsLoading || !googleDocsUrl}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg font-medium transition-colors whitespace-nowrap">
                        {googleDocsLoading ? 'Importing…' : 'Import ↓'}
                      </button>
                    </div>
                    <div className="text-xs text-zinc-600 space-y-1">
                      <div>1. Open your Google Doc</div>
                      <div>2. Share → "Anyone with the link" → Viewer</div>
                      <div>3. Copy & paste the link above</div>
                    </div>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-2">
                    <div className="text-sm font-semibold mb-2">Export to Google Docs</div>
                    <p className="text-xs text-zinc-500">Copy the HTML output and paste into a Google Doc, or download as PDF and upload to Drive.</p>
                    <button
                      onClick={() => { navigator.clipboard.writeText(pageHTMLs[currentPageIdx] || ''); }}
                      className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-sm rounded-lg transition-colors">
                      Copy Page HTML
                    </button>
                  </div>
                </div>
              )}

              {/* ── DOC TOOLS ── */}
              {connectSection === 'tools' && (
                <div className="max-w-2xl space-y-6">
                  <div>
                    <h2 className="text-lg font-bold mb-1">🛠 Document Tools</h2>
                    <p className="text-sm text-zinc-400">Merge fields, watermarks, page numbers, and more.</p>
                  </div>

                  {/* Merge Fields */}
                  <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">🏷️ Merge Fields</div>
                        <div className="text-xs text-zinc-500 mt-0.5">Use {'{{field_name}}'} in your document text — it gets replaced at render time</div>
                      </div>
                      <button onClick={addMergeField}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors">+ Add</button>
                    </div>
                    {mergeFields.length === 0 && (
                      <div className="text-xs text-zinc-600 italic">No merge fields yet. Add one and use {'{{field_name}}'} in your document.</div>
                    )}
                    {mergeFields.map((f, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="text-xs text-zinc-500 whitespace-nowrap">{'{{'}</span>
                        <input value={f.key} onChange={e => updateMergeField(i, { key: e.target.value.replace(/\s/g, '_') })}
                          placeholder="field_name"
                          className="w-32 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 font-mono focus:outline-none focus:border-blue-500" />
                        <span className="text-xs text-zinc-500">{'}}'} =</span>
                        <input value={f.value} onChange={e => updateMergeField(i, { value: e.target.value })}
                          placeholder="replacement value"
                          className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" />
                        <button onClick={() => removeMergeField(i)} className="text-zinc-500 hover:text-red-400 text-xs">✕</button>
                      </div>
                    ))}
                  </div>

                  {/* Watermark */}
                  <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
                    <div className="text-sm font-semibold">💧 Watermark</div>
                    <div className="flex gap-2 flex-wrap">
                      {['', 'DRAFT', 'CONFIDENTIAL', 'SAMPLE', 'VOID', 'APPROVED'].map(w => (
                        <button key={w} onClick={() => setWatermark(w)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${watermark === w ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'}`}>
                          {w || 'None'}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 items-center">
                      <input value={watermark} onChange={e => setWatermark(e.target.value)}
                        placeholder="Custom watermark text…"
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                      {watermark && <button onClick={() => setWatermark('')} className="text-xs text-zinc-500 hover:text-zinc-300 px-1">✕</button>}
                    </div>
                  </div>

                  {/* Page Numbers */}
                  <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">#️⃣ Page Numbers</div>
                        <div className="text-xs text-zinc-500 mt-0.5">Show page number in footer of each document page</div>
                      </div>
                      <button onClick={() => setShowPageNumbers(v => !v)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${showPageNumbers ? 'bg-blue-600' : 'bg-zinc-600'}`}>
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showPageNumbers ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Roadmap */}
                  <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                    <div className="text-sm font-semibold mb-3">🗺️ What's Next — Feature Roadmap</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { done: true, label: 'File import (.txt, .pdf, .docx)' },
                        { done: true, label: 'Claude AI chat & generation' },
                        { done: true, label: 'Google Docs import' },
                        { done: true, label: 'Merge fields {{variable}}' },
                        { done: true, label: 'Watermark overlay' },
                        { done: true, label: 'Page numbers' },
                        { done: false, label: 'CSV → auto table import' },
                        { done: false, label: 'QR code generator for URLs' },
                        { done: false, label: 'Document templates library' },
                        { done: false, label: 'Table of contents auto-gen' },
                        { done: false, label: 'Cover page builder' },
                        { done: false, label: 'Custom CSS editor' },
                        { done: false, label: 'Google Drive export' },
                        { done: false, label: 'Email document delivery' },
                        { done: false, label: 'Multi-column signature layout' },
                        { done: false, label: 'Barcode / QR per line item' },
                      ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-1.5 ${item.done ? 'text-green-400' : 'text-zinc-500'}`}>
                          <span>{item.done ? '✅' : '⬜'}</span>
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* ── Context menu ── */}
      {contextMenu.visible && (
        <div
          className="fixed z-50 bg-zinc-900 border border-zinc-600 rounded-xl shadow-2xl py-1.5 min-w-40"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          <div className="px-3 py-1 text-xs text-zinc-500 font-semibold uppercase tracking-wider border-b border-zinc-700 mb-1">Format Selection</div>
          {[
            { label: '𝐁  Bold', cmd: 'bold', hint: '⌘B' },
            { label: '𝘐  Italic', cmd: 'italic', hint: '⌘I' },
            { label: 'U̲  Underline', cmd: 'underline', hint: '⌘U' },
            { label: '🖊  Strikethrough', cmd: 'strikeThrough', hint: '' },
          ].map(item => (
            <button
              key={item.cmd}
              onMouseDown={e => { e.preventDefault(); applyFormat(item.cmd); }}
              className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              <span>{item.label}</span>
              {item.hint && <span className="text-xs text-zinc-500">{item.hint}</span>}
            </button>
          ))}
          <div className="border-t border-zinc-700 mt-1 pt-1">
            {[
              { label: '🟡 Highlight Yellow', color: '#fef08a' },
              { label: '🟢 Highlight Green', color: '#bbf7d0' },
              { label: '🔵 Highlight Blue', color: '#bfdbfe' },
              { label: '🔴 Highlight Red', color: '#fecaca' },
            ].map(item => (
              <button
                key={item.color}
                onMouseDown={e => { e.preventDefault(); document.execCommand('hiliteColor', false, item.color); setContextMenu(c => ({ ...c, visible: false })); }}
                className="w-full text-left px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
              >
                {item.label}
              </button>
            ))}
            <button
              onMouseDown={e => { e.preventDefault(); document.execCommand('hiliteColor', false, 'transparent'); setContextMenu(c => ({ ...c, visible: false })); }}
              className="w-full text-left px-3 py-1.5 text-sm text-zinc-400 hover:bg-zinc-700 transition-colors"
            >
              ✕ Clear Highlight
            </button>
          </div>
        </div>
      )}

      {/* ── Layout warning modal ── */}
      {layoutWarning && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="font-bold text-lg mb-2">Change Page {layoutWarning.pageIdx + 1} Layout?</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Switching to <strong className="text-white">{LAYOUTS.find(l => l.id === layoutWarning.newLayout)?.name}</strong> layout.
              Here's what will happen to your content:
            </p>
            <div className="space-y-2 mb-5 text-sm">
              <div className="text-green-400">✓ Text content is preserved and re-styled</div>
              {pages[layoutWarning.pageIdx]?.tableHeaders.length > 0 && (
                <div className="text-yellow-400">
                  ⚠ Table ({pages[layoutWarning.pageIdx].tableHeaders.length} columns × {pages[layoutWarning.pageIdx].tableRows.length} rows) will be re-rendered in the new layout
                </div>
              )}
              {pages[layoutWarning.pageIdx]?.checklistItems.length > 0 && (
                <div className="text-yellow-400">
                  ⚠ Checklist ({pages[layoutWarning.pageIdx].checklistItems.length} items) will be re-rendered
                </div>
              )}
              {pages[layoutWarning.pageIdx]?.invoiceMode && (
                <div className="text-yellow-400">
                  ⚠ Invoice data will be re-rendered in the new layout
                </div>
              )}
              {layoutWarning.newLayout === 'invoice-only' && (
                <div className="text-blue-400">
                  ℹ Invoice-only layout will hide body text and show only the invoice table
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  updatePageAtIdx(layoutWarning.pageIdx, { layout: layoutWarning.newLayout });
                  setLayoutWarning(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-medium transition-colors"
              >
                Change to {LAYOUTS.find(l => l.id === layoutWarning.newLayout)?.name}
              </button>
              <button
                onClick={() => setLayoutWarning(null)}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                Keep Current
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
