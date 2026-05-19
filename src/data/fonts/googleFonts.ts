export type { GoogleFont } from '../../types';
import type { GoogleFont } from '../../types';

export const GOOGLE_FONTS: GoogleFont[] = [
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
export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?' +
  GOOGLE_FONTS.map(f => `family=${f.name.replace(/ /g, '+')}:wght@400;700`).join('&') +
  '&display=swap';
