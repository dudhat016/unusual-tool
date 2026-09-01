import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, onSnapshot, getDoc, setDoc, collection } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { SystemSettings } from '../types/admin';
import { DEFAULT_SYSTEM_SETTINGS } from '../config/systemSettings';
import {
  applyGlobalThemeVariables,
  GlobalThemeConfig,
  AppliedThemeResult,
  resolvePrimaryHsl,
  loadDynamicGoogleFont,
  resolveFontCss,
} from '../utils/themeHelper';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore SystemSettings Error:', JSON.stringify(errInfo));
  return errInfo;
}

export interface UseSystemSettingsReturn {
  /** The current active system settings document */
  settings: SystemSettings;
  /** Whether the initial Firestore listener is still retrieving data */
  loading: boolean;
  /** Alias for loading */
  isLoading: boolean;
  /** Any connection or Firestore error encountered */
  error: Error | null;
  /** Whether the active computed theme is dark mode */
  isDark: boolean;
  /** Dictionary of all currently applied CSS variables on :root */
  appliedVariables: Record<string, string>;
  /** Update system settings in Firestore and apply immediately */
  updateSettings: (newSettings: Partial<SystemSettings>, adminEmail?: string) => Promise<boolean>;
  /** Live preview settings locally without persisting immediately */
  previewSettings: (previewConfig: Partial<SystemSettings>) => void;
  /** Reset visual branding and system settings back to defaults */
  resetToDefaults: (adminEmail?: string) => Promise<boolean>;
  /** Force refetch from Firestore */
  refresh: () => Promise<void>;
}

const LOCAL_STORAGE_CACHE_KEY = 'aetherpix_system_settings_cache_v2';

/**
 * Custom hook that listens to the 'system_settings' Firestore collection in real-time.
 * Dynamically updates the CSS variable root (--primary, --background, --foreground, etc.)
 * directly on document.documentElement, ensuring site-wide branding updates instantly
 * across the application without requiring page reloads.
 */
export function useSystemSettings(): UseSystemSettingsReturn {
  // Initialize state with cached settings from localStorage if available, or default settings
  const [settings, setSettings] = useState<SystemSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          return { ...DEFAULT_SYSTEM_SETTINGS, ...parsed };
        }
      } catch {}
    }
    return DEFAULT_SYSTEM_SETTINGS;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [appliedVariables, setAppliedVariables] = useState<Record<string, string>>({});

  const isInitialMount = useRef<boolean>(true);

  /**
   * Applies all CSS variables dynamically to document.documentElement (:root)
   */
  const applyThemeToDom = useCallback((currentSettings: SystemSettings): AppliedThemeResult => {
    if (typeof document === 'undefined') {
      return { isDark: true, primaryHsl: '258 78% 63%', appliedVariables: {} };
    }

    const root = document.documentElement;

    // 1. Resolve Light / Dark Appearance Mode
    let dark = true;
    if (currentSettings.theme === 'light') {
      dark = false;
    } else if (currentSettings.theme === 'system') {
      dark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      dark = root.classList.contains('dark') || (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    // Toggle dark class on <html> element
    root.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';

    // 2. Apply theme config via helper
    const themeConfig: GlobalThemeConfig = {
      theme: currentSettings.theme || (dark ? 'dark' : 'light'),
      primaryColor: currentSettings.primaryColor || currentSettings.accentColor || 'purple',
      accentColor: currentSettings.accentColor || currentSettings.primaryColor || 'purple',
      radius: typeof currentSettings.radius === 'number' ? currentSettings.radius : 8,
      sidebarTheme: currentSettings.sidebarTheme || 'dark',
      fontFamily: currentSettings.fontFamily || 'Inter',
      fontDisplay: currentSettings.fontDisplay || 'Outfit',
      fontMono: currentSettings.fontMono || 'Space Grotesk',
      fontScale: currentSettings.fontScale || 100,
      siteName: currentSettings.siteName || 'AetherPix Studio',
      logoUrl: currentSettings.logoUrl,
      faviconUrl: currentSettings.faviconUrl,
      customCss: currentSettings.customCss,
    };

    const result = applyGlobalThemeVariables(themeConfig);

    // 3. Additional root variable overrides for comprehensive theme parity
    const { primaryHsl } = resolvePrimaryHsl(themeConfig.primaryColor, dark);

    if (dark) {
      root.style.setProperty('--background', '240 10% 3.9%');
      root.style.setProperty('--foreground', '0 0% 98%');
      root.style.setProperty('--card', '240 10% 5.5%');
      root.style.setProperty('--card-foreground', '0 0% 98%');
      root.style.setProperty('--muted', '240 4% 16%');
      root.style.setProperty('--muted-foreground', '240 5% 65%');
      root.style.setProperty('--border', '240 4% 16%');
      root.style.setProperty('--input', '240 4% 16%');
    } else {
      root.style.setProperty('--background', '0 0% 99%');
      root.style.setProperty('--foreground', '240 10% 3.9%');
      root.style.setProperty('--card', '0 0% 100%');
      root.style.setProperty('--card-foreground', '240 10% 3.9%');
      root.style.setProperty('--muted', '240 5% 96%');
      root.style.setProperty('--muted-foreground', '240 4% 46%');
      root.style.setProperty('--border', '240 6% 90%');
      root.style.setProperty('--input', '240 6% 90%');
    }

    setIsDark(result.isDark);
    setAppliedVariables({
      ...result.appliedVariables,
      '--background': dark ? '240 10% 3.9%' : '0 0% 99%',
      '--foreground': dark ? '0 0% 98%' : '240 10% 3.9%',
      '--primary': primaryHsl,
    });

    return result;
  }, []);

  // Synchronously apply initial theme variables on render
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      applyThemeToDom(settings);
    }
  }, [applyThemeToDom, settings]);

  // Real-time Firestore snapshot listener on the 'system_settings' collection
  useEffect(() => {
    const docPath = 'system_settings/global';
    let isMounted = true;

    try {
      const settingsDocRef = doc(db, 'system_settings', 'global');

      const unsubscribe = onSnapshot(
        settingsDocRef,
        (snapshot) => {
          if (!isMounted) return;

          let mergedSettings: SystemSettings = DEFAULT_SYSTEM_SETTINGS;

          if (snapshot.exists()) {
            const data = snapshot.data();
            mergedSettings = {
              ...DEFAULT_SYSTEM_SETTINGS,
              ...data,
            };
          }

          setSettings(mergedSettings);
          setLoading(false);
          setError(null);

          // Update local cache
          try {
            localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(mergedSettings));
          } catch {}

          // Dynamically inject CSS variables onto :root
          applyThemeToDom(mergedSettings);
        },
        async (err) => {
          if (!isMounted) return;
          handleFirestoreError(err, OperationType.GET, docPath);

          // Fallback to one-time fetch
          try {
            const fallbackSnap = await getDoc(doc(db, 'system_config', 'settings'));
            if (fallbackSnap.exists()) {
              const fbData = { ...DEFAULT_SYSTEM_SETTINGS, ...fallbackSnap.data() } as SystemSettings;
              if (isMounted) {
                setSettings(fbData);
                applyThemeToDom(fbData);
              }
            }
          } catch {
            // Keep cached settings
          }

          setLoading(false);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      );

      return () => {
        isMounted = false;
        unsubscribe();
      };
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return () => {};
    }
  }, [applyThemeToDom]);

  /**
   * Preview settings locally without writing immediately to Firestore
   */
  const previewSettings = useCallback(
    (previewConfig: Partial<SystemSettings>) => {
      const merged: SystemSettings = {
        ...settings,
        ...previewConfig,
      };
      applyThemeToDom(merged);
    },
    [settings, applyThemeToDom]
  );

  /**
   * Persist changes directly to Firestore system_settings/global
   */
  const updateSettings = useCallback(
    async (newSettings: Partial<SystemSettings>, adminEmail = 'admin'): Promise<boolean> => {
      const docPath = 'system_settings/global';
      try {
        const merged: SystemSettings = {
          ...settings,
          ...newSettings,
        };

        // Optimistic DOM update
        setSettings(merged);
        applyThemeToDom(merged);

        // Write to Firestore system_settings/global
        await setDoc(doc(db, 'system_settings', 'global'), newSettings, { merge: true });

        // Maintain fallback compatibility with system_config/settings
        try {
          await setDoc(doc(db, 'system_config', 'settings'), newSettings, { merge: true });
        } catch {}

        // Update local storage cache
        try {
          localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(merged));
        } catch {}

        return true;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
        setError(err instanceof Error ? err : new Error(String(err)));
        return false;
      }
    },
    [settings, applyThemeToDom]
  );

  /**
   * Reset theme and system settings to defaults
   */
  const resetToDefaults = useCallback(
    async (adminEmail = 'admin'): Promise<boolean> => {
      const defaultSettings: Partial<SystemSettings> = {
        theme: 'dark',
        primaryColor: 'purple',
        accentColor: 'purple',
        radius: 8,
        sidebarTheme: 'dark',
        fontFamily: 'Inter',
        fontDisplay: 'Outfit',
        fontMono: 'Space Grotesk',
        fontScale: 100,
        customCss: '',
      };
      return updateSettings(defaultSettings, adminEmail);
    },
    [updateSettings]
  );

  /**
   * Force fresh getDoc fetch from Firestore
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'system_settings', 'global'));
      if (snap.exists()) {
        const live = { ...DEFAULT_SYSTEM_SETTINGS, ...snap.data() } as SystemSettings;
        setSettings(live);
        applyThemeToDom(live);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [applyThemeToDom]);

  return {
    settings,
    loading,
    isLoading: loading,
    error,
    isDark,
    appliedVariables,
    updateSettings,
    previewSettings,
    resetToDefaults,
    refresh,
  };
}

export default useSystemSettings;
