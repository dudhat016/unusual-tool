export interface ColorPreset {
  id: string;
  label: string;
  value: string; // light mode HSL e.g. '258 90% 56%'
  darkValue: string; // dark mode HSL e.g. '258 78% 63%'
  hex: string;
}

export const PRIMARY_COLOR_PRESETS: ColorPreset[] = [
  { id: 'purple', label: 'Royal Purple', value: '258 90% 56%', darkValue: '258 78% 63%', hex: '#8B5CF6' },
  { id: 'indigo', label: 'Deep Indigo', value: '238 84% 59%', darkValue: '238 84% 65%', hex: '#6366F1' },
  { id: 'emerald', label: 'Emerald Green', value: '158 64% 45%', darkValue: '158 64% 52%', hex: '#10B981' },
  { id: 'rose', label: 'Vibrant Rose', value: '346 84% 61%', darkValue: '346 84% 65%', hex: '#F43F5E' },
  { id: 'amber', label: 'Amber Gold', value: '38 92% 50%', darkValue: '38 92% 55%', hex: '#F59E0B' },
  { id: 'cyan', label: 'Ocean Cyan', value: '199 89% 48%', darkValue: '199 89% 55%', hex: '#06B6D4' },
  { id: 'blue', label: 'Sky Blue', value: '217 91% 60%', darkValue: '217 91% 65%', hex: '#3B82F6' },
  { id: 'violet', label: 'Electric Violet', value: '271 91% 65%', darkValue: '271 91% 70%', hex: '#8B5CF6' },
  { id: 'orange', label: 'Sunset Orange', value: '24 95% 53%', darkValue: '24 95% 60%', hex: '#F97316' },
  { id: 'teal', label: 'Modern Teal', value: '173 80% 40%', darkValue: '173 80% 48%', hex: '#14B8A6' },
];

export const RADIUS_PRESETS = [0, 4, 8, 12, 16];

/**
 * Converts a hex color string (#RRGGBB or #RGB) into an HSL string: "H S% L%"
 */
export function hexToHsl(hexStr: string): string | null {
  if (!hexStr) return null;
  let hex = hexStr.trim().replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length !== 6) return null;

  const num = parseInt(hex, 16);
  if (isNaN(num)) return null;

  const r = (num >> 16) / 255;
  const g = ((num >> 8) & 0xff) / 255;
  const b = (num & 0xff) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = Math.round(h * 60);
  }

  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return `${h} ${sPercent}% ${lPercent}%`;
}

export interface GlobalThemeConfig {
  theme?: 'light' | 'dark' | 'system';
  primaryColor?: string;
  accentColor?: string;
  radius?: number;
  sidebarTheme?: 'default' | 'dark' | 'light' | 'gradient';
}

/**
 * Resolves color name or hex/HSL into exact HSL string for light & dark mode.
 */
export function resolvePrimaryHsl(colorInput?: string, isDark = false): { primaryHsl: string; hue: string } {
  const defaultPreset = PRIMARY_COLOR_PRESETS[0]; // purple
  if (!colorInput) {
    const val = isDark ? defaultPreset.darkValue : defaultPreset.value;
    return { primaryHsl: val, hue: val.split(' ')[0] };
  }

  // 1. Check if it matches a preset ID or label
  const matchedPreset = PRIMARY_COLOR_PRESETS.find(
    (p) => p.id.toLowerCase() === colorInput.toLowerCase() || p.label.toLowerCase() === colorInput.toLowerCase()
  );
  if (matchedPreset) {
    const val = isDark ? matchedPreset.darkValue : matchedPreset.value;
    return { primaryHsl: val, hue: val.split(' ')[0] };
  }

  // 2. Check if it is a hex code
  if (colorInput.startsWith('#') || /^[0-9A-Fa-f]{6}$/.test(colorInput) || /^[0-9A-Fa-f]{3}$/.test(colorInput)) {
    const converted = hexToHsl(colorInput);
    if (converted) {
      const parts = converted.split(' ');
      const hue = parts[0];
      const sat = parts[1] || '80%';
      const lightness = isDark ? '63%' : '56%';
      const val = `${hue} ${sat} ${lightness}`;
      return { primaryHsl: val, hue };
    }
  }

  // 3. Check if it's already an HSL triplet "258 90% 56%"
  if (/\d+\s+\d+%\s+\d+%/.test(colorInput)) {
    const hue = colorInput.split(' ')[0];
    return { primaryHsl: colorInput, hue };
  }

  // Fallback
  const val = isDark ? defaultPreset.darkValue : defaultPreset.value;
  return { primaryHsl: val, hue: val.split(' ')[0] };
}

/**
 * Applies theme appearance mode, primary & accent color variables, radius, and sidebar attributes to the DOM in real-time.
 */
export function applyGlobalThemeVariables(config: GlobalThemeConfig): { isDark: boolean; primaryHsl: string } {
  if (typeof document === 'undefined') {
    return { isDark: true, primaryHsl: '258 78% 63%' };
  }

  const root = document.documentElement;

  // 1. Determine light vs dark
  let isDark = true;
  if (config.theme === 'light') {
    isDark = false;
  } else if (config.theme === 'dark') {
    isDark = true;
  } else if (config.theme === 'system') {
    isDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } else {
    // If undefined, check existing class or system preference
    isDark = root.classList.contains('dark') || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  if (isDark) {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  // 2. Resolve primary & accent color
  const colorKey = config.primaryColor || config.accentColor || 'purple';
  const { primaryHsl, hue } = resolvePrimaryHsl(colorKey, isDark);

  root.style.setProperty('--primary', primaryHsl);
  root.style.setProperty('--ring', primaryHsl);

  // Accent & accent-foreground
  if (isDark) {
    root.style.setProperty('--accent', `${hue} 30% 15%`);
    root.style.setProperty('--accent-foreground', `${hue} 90% 80%`);
  } else {
    root.style.setProperty('--accent', `${hue} 100% 97%`);
    root.style.setProperty('--accent-foreground', `${hue} 90% 40%`);
  }

  // 3. Border Radius
  if (typeof config.radius === 'number') {
    root.style.setProperty('--radius', `${config.radius}px`);
  }

  // 4. Sidebar Theme
  if (config.sidebarTheme) {
    root.setAttribute('data-sidebar-theme', config.sidebarTheme);
    if (document.body) {
      document.body.setAttribute('data-sidebar-theme', config.sidebarTheme);
    }
  }

  // 5. Dispatch notification event for real-time subscribers
  try {
    window.dispatchEvent(
      new CustomEvent('aetherpix:theme-changed', {
        detail: { isDark, primaryHsl, hue, colorKey, radius: config.radius, sidebarTheme: config.sidebarTheme },
      })
    );
  } catch {}

  return { isDark, primaryHsl };
}
