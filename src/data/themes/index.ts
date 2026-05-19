import type { Theme } from '../../types';
import { medicalThemes } from './medical';
import { luxuryThemes } from './luxury';
import { athleticThemes } from './athletic';
import { corporateThemes } from './corporate';
import { creativeThemes } from './creative';
import { hospitalityThemes } from './hospitality';
import { techThemes } from './tech';
import { gradientThemes } from './gradient';
import { specialtyThemes } from './specialty';

export const THEMES: Theme[] = [
  ...medicalThemes,
  ...luxuryThemes,
  ...athleticThemes,
  ...corporateThemes,
  ...creativeThemes,
  ...hospitalityThemes,
  ...techThemes,
  ...gradientThemes,
  ...specialtyThemes,
];
