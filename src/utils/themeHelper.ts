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

export const RADIUS_PRESETS = [0, 4, 8, 12, 16, 24];

export interface FontPreset {
  id: string;
  name: string;
  category: 'sans' | 'display' | 'mono';
  googleFont?: string;
  fallback: string;
  cssValue: string;
}

export const FONT_PRESETS: FontPreset[] = [
  { id: 'inter', name: 'Inter', category: 'sans', googleFont: 'Inter:wght@300;400;500;600;700;800;900', fallback: 'ui-sans-serif, system-ui, sans-serif', cssValue: '"Inter", ui-sans-serif, system-ui, sans-serif' },
  { id: 'outfit', name: 'Outfit', category: 'display', googleFont: 'Outfit:wght@400;500;600;700;800;900', fallback: '"Inter", sans-serif', cssValue: '"Outfit", "Inter", ui-sans-serif, system-ui, sans-serif' },
  { id: 'plus-jakarta-sans', name: 'Plus Jakarta Sans', category: 'sans', googleFont: 'Plus+Jakarta+Sans:wght@400;500;600;700;800', fallback: '"Inter", sans-serif', cssValue: '"Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui, sans-serif' },
  { id: 'poppins', name: 'Poppins', category: 'sans', googleFont: 'Poppins:wght@400;500;600;700;800', fallback: 'sans-serif', cssValue: '"Poppins", ui-sans-serif, system-ui, sans-serif' },
  { id: 'space-grotesk', name: 'Space Grotesk', category: 'mono', googleFont: 'Space+Grotesk:wght@400;500;600;700', fallback: 'monospace', cssValue: '"Space Grotesk", ui-monospace, monospace' },
  { id: 'dm-sans', name: 'DM Sans', category: 'sans', googleFont: 'DM+Sans:ital,opsz,wght@0,9..40,400..800;1,9..40,400..800', fallback: 'sans-serif', cssValue: '"DM Sans", ui-sans-serif, system-ui, sans-serif' },
  { id: 'syne', name: 'Syne', category: 'display', googleFont: 'Syne:wght@600;700;800', fallback: 'sans-serif', cssValue: '"Syne", "Outfit", sans-serif' },
  { id: 'roboto', name: 'Roboto', category: 'sans', googleFont: 'Roboto:wght@400;500;700', fallback: 'sans-serif', cssValue: '"Roboto", ui-sans-serif, system-ui, sans-serif' },
  { id: 'fira-code', name: 'Fira Code', category: 'mono', googleFont: 'Fira+Code:wght@400;500;600;700', fallback: 'monospace', cssValue: '"Fira Code", ui-monospace, monospace' },
  { id: 'system', name: 'System Default', category: 'sans', fallback: 'system-ui, sans-serif', cssValue: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
];

/**
 * Dynamically loads a Google Web Font into document.head if not already present.
 */
export function loadDynamicGoogleFont(fontNameOrId: string): void {
  if (typeof document === 'undefined' || !fontNameOrId) return;

  const font = FONT_PRESETS.find(
    (f) => f.id.toLowerCase() === fontNameOrId.toLowerCase() || f.name.toLowerCase() === fontNameOrId.toLowerCase()
  );

  const googleQuery = font?.googleFont || (fontNameOrId.includes(':') ? fontNameOrId : `${fontNameOrId.replace(/\s+/g, '+')}:wght@400;500;600;700;800`);
  const elementId = `dynamic-google-font-${font?.id || fontNameOrId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  if (!document.getElementById(elementId)) {
    const link = document.createElement('link');
    link.id = elementId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${googleQuery}&display=swap`;
    document.head.appendChild(link);
  }
}

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

/**
 * Converts an HSL string "H S% L%" to RGB string "R, G, B" for CSS rgba() compatibility.
 */
export function hslToRgbString(hslStr: string): string {
  const parts = hslStr.split(/\s+/);
  if (parts.length < 3) return '139, 92, 246'; // fallback purple

  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1].replace('%', '')) / 100;
  const l = parseFloat(parts[2].replace('%', '')) / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return `${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}`;
}

export interface GlobalThemeConfig {
  theme?: 'light' | 'dark' | 'system';
  primaryColor?: string;
  accentColor?: string;
  radius?: number;
  sidebarTheme?: 'default' | 'dark' | 'light' | 'gradient';
  fontFamily?: string;
  fontDisplay?: string;
  fontMono?: string;
  fontScale?: number;
  siteName?: string;
  logoUrl?: string;
  faviconUrl?: string;
  customCss?: string;
}

export interface AppliedThemeResult {
  isDark: boolean;
  primaryHsl: string;
  appliedVariables: Record<string, string>;
}

/**
 * Resolves color name or hex/HSL into exact HSL string for light & dark mode.
 */
export function resolvePrimaryHsl(colorInput?: string, isDark = false): { primaryHsl: string; hue: string; hex: string } {
  const defaultPreset = PRIMARY_COLOR_PRESETS[0]; // purple
  if (!colorInput) {
    const val = isDark ? defaultPreset.darkValue : defaultPreset.value;
    return { primaryHsl: val, hue: val.split(' ')[0], hex: defaultPreset.hex };
  }

  // 1. Check if it matches a preset ID or label
  const matchedPreset = PRIMARY_COLOR_PRESETS.find(
    (p) => p.id.toLowerCase() === colorInput.toLowerCase() || p.label.toLowerCase() === colorInput.toLowerCase()
  );
  if (matchedPreset) {
    const val = isDark ? matchedPreset.darkValue : matchedPreset.value;
    return { primaryHsl: val, hue: val.split(' ')[0], hex: matchedPreset.hex };
  }

  // 2. Check if it is a hex code
  if (colorInput.startsWith('#') || /^[0-9A-Fa-f]{6}$/.test(colorInput) || /^[0-9A-Fa-f]{3}$/.test(colorInput)) {
    const hexClean = colorInput.startsWith('#') ? colorInput : `#${colorInput}`;
    const converted = hexToHsl(hexClean);
    if (converted) {
      const parts = converted.split(' ');
      const hue = parts[0];
      const sat = parts[1] || '80%';
      const lightness = isDark ? '63%' : '56%';
      const val = `${hue} ${sat} ${lightness}`;
      return { primaryHsl: val, hue, hex: hexClean };
    }
  }

  // 3. Check if it's already an HSL triplet "258 90% 56%"
  if (/\d+\s+\d+%\s+\d+%/.test(colorInput)) {
    const hue = colorInput.split(' ')[0];
    return { primaryHsl: colorInput, hue, hex: defaultPreset.hex };
  }

  // Fallback
  const val = isDark ? defaultPreset.darkValue : defaultPreset.value;
  return { primaryHsl: val, hue: val.split(' ')[0], hex: defaultPreset.hex };
}

/**
 * Resolves font-family CSS value with proper fallbacks.
 */
export function resolveFontCss(fontNameOrValue?: string, category: 'sans' | 'display' | 'mono' = 'sans'): string {
  if (!fontNameOrValue) {
    if (category === 'display') return '"Outfit", "Inter", ui-sans-serif, system-ui, sans-serif';
    if (category === 'mono') return '"Space Grotesk", ui-monospace, monospace';
    return '"Inter", ui-sans-serif, system-ui, sans-serif';
  }

  const preset = FONT_PRESETS.find(
    (f) => f.id.toLowerCase() === fontNameOrValue.toLowerCase() || f.name.toLowerCase() === fontNameOrValue.toLowerCase()
  );

  if (preset) {
    return preset.cssValue;
  }

  // If already a comma-separated font stack
  if (fontNameOrValue.includes(',')) {
    return fontNameOrValue;
  }

  // Wrap user font in quotes with standard fallback
  return `"${fontNameOrValue}", ui-sans-serif, system-ui, sans-serif`;
}

/**
 * Applies theme appearance mode, primary & accent color variables, fonts, branding, radius, and sidebar attributes to the DOM in real-time.
 */
export function applyGlobalThemeVariables(config: GlobalThemeConfig): AppliedThemeResult {
  const appliedVariables: Record<string, string> = {};

  if (typeof document === 'undefined') {
    return { isDark: true, primaryHsl: '258 78% 63%', appliedVariables };
  }

  const root = document.documentElement;

  // 1. Determine light vs dark appearance
  let isDark = true;
  if (config.theme === 'light') {
    isDark = false;
  } else if (config.theme === 'dark') {
    isDark = true;
  } else if (config.theme === 'system') {
    isDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  } else {
    isDark = root.classList.contains('dark') || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  if (isDark) {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  // 2. Resolve primary & accent color tokens
  const colorKey = config.primaryColor || config.accentColor || 'purple';
  const { primaryHsl, hue, hex } = resolvePrimaryHsl(colorKey, isDark);
  const primaryRgb = hslToRgbString(primaryHsl);

  root.style.setProperty('--primary', primaryHsl);
  root.style.setProperty('--ring', primaryHsl);
  root.style.setProperty('--primary-hex', hex);
  root.style.setProperty('--primary-rgb', primaryRgb);
  root.style.setProperty('--primary-hue', hue);

  appliedVariables['--primary'] = primaryHsl;
  appliedVariables['--ring'] = primaryHsl;
  appliedVariables['--primary-hex'] = hex;
  appliedVariables['--primary-rgb'] = primaryRgb;

  // Accent & accent-foreground
  let accentVal = `${hue} 30% 15%`;
  let accentFgVal = `${hue} 90% 80%`;
  if (!isDark) {
    accentVal = `${hue} 100% 97%`;
    accentFgVal = `${hue} 90% 40%`;
  }

  root.style.setProperty('--accent', accentVal);
  root.style.setProperty('--accent-foreground', accentFgVal);
  appliedVariables['--accent'] = accentVal;
  appliedVariables['--accent-foreground'] = accentFgVal;

  // Update browser mobile tab color / theme-color meta tag
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', isDark ? '#09090b' : hex);
  }

  // 3. Border Radius tokens
  if (typeof config.radius === 'number') {
    const r = config.radius;
    root.style.setProperty('--radius', `${r}px`);
    root.style.setProperty('--radius-sm', `${Math.max(0, r * 0.5)}px`);
    root.style.setProperty('--radius-md', `${r}px`);
    root.style.setProperty('--radius-lg', `${r * 1.5}px`);
    root.style.setProperty('--radius-xl', `${r * 2}px`);
    root.style.setProperty('--radius-2xl', `${r * 2.5}px`);
    root.style.setProperty('--radius-3xl', `${r * 3}px`);

    appliedVariables['--radius'] = `${r}px`;
  }

  // 4. Typography & Font tokens
  if (config.fontFamily) {
    loadDynamicGoogleFont(config.fontFamily);
    const fontSans = resolveFontCss(config.fontFamily, 'sans');
    root.style.setProperty('--font-sans', fontSans);
    appliedVariables['--font-sans'] = fontSans;
  }

  if (config.fontDisplay) {
    loadDynamicGoogleFont(config.fontDisplay);
    const fontDisplay = resolveFontCss(config.fontDisplay, 'display');
    root.style.setProperty('--font-display', fontDisplay);
    appliedVariables['--font-display'] = fontDisplay;
  }

  if (config.fontMono) {
    loadDynamicGoogleFont(config.fontMono);
    const fontMono = resolveFontCss(config.fontMono, 'mono');
    root.style.setProperty('--font-mono', fontMono);
    appliedVariables['--font-mono'] = fontMono;
  }

  if (typeof config.fontScale === 'number' && config.fontScale > 0) {
    const scale = `${config.fontScale}%`;
    root.style.setProperty('--font-scale', scale);
    appliedVariables['--font-scale'] = scale;
  }

  // 5. Sidebar Styling Attributes
  if (config.sidebarTheme) {
    root.setAttribute('data-sidebar-theme', config.sidebarTheme);
    if (document.body) {
      document.body.setAttribute('data-sidebar-theme', config.sidebarTheme);
    }
    appliedVariables['data-sidebar-theme'] = config.sidebarTheme;
  }

  // 6. Branding & Favicon Injection
  if (config.siteName) {
    root.style.setProperty('--brand-name', `"${config.siteName}"`);
    appliedVariables['--brand-name'] = config.siteName;
  }

  if (config.logoUrl) {
    root.style.setProperty('--brand-logo-url', `url("${config.logoUrl}")`);
    appliedVariables['--brand-logo-url'] = config.logoUrl;
  }

  if (config.faviconUrl) {
    let favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'shortcut icon';
      document.head.appendChild(favicon);
    }
    favicon.href = config.faviconUrl;
  }

  // 7. Custom CSS override injection
  const customCssTagId = 'aetherpix-dynamic-custom-css';
  let customStyleTag = document.getElementById(customCssTagId) as HTMLStyleElement | null;
  if (config.customCss && config.customCss.trim().length > 0) {
    if (!customStyleTag) {
      customStyleTag = document.createElement('style');
      customStyleTag.id = customCssTagId;
      document.head.appendChild(customStyleTag);
    }
    customStyleTag.textContent = config.customCss;
  } else if (customStyleTag) {
    customStyleTag.textContent = '';
  }

  // 8. Dispatch notification event for real-time subscribers & decoupled components
  try {
    window.dispatchEvent(
      new CustomEvent('aetherpix:theme-changed', {
        detail: {
          isDark,
          primaryHsl,
          hue,
          hex,
          colorKey,
          radius: config.radius,
          sidebarTheme: config.sidebarTheme,
          fontFamily: config.fontFamily,
          siteName: config.siteName,
          appliedVariables,
        },
      })
    );
  } catch {}

  return { isDark, primaryHsl, appliedVariables };
}

