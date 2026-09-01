import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { SystemSettings } from '../types/admin';
import { DEFAULT_SYSTEM_SETTINGS } from '../config/systemSettings';
import {
  applyGlobalThemeVariables,
  GlobalThemeConfig,
  AppliedThemeResult,
  resolvePrimaryHsl,
  PRIMARY_COLOR_PRESETS,
  RADIUS_PRESETS,
  FONT_PRESETS,
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

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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

export interface UseSystemSettingsThemeReturn {
  settings: SystemSettings;
  isLoading: boolean;
  error: Error | null;
  isDark: boolean;
  appliedVariables: Record<string, string>;
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  radius: number;
  sidebarTheme: 'default' | 'dark' | 'light' | 'gradient';
  fontFamily: string;
  fontDisplay: string;
  fontMono: string;
  siteName: string;
  logoUrl?: string;
  faviconUrl?: string;
  customCss?: string;
  updateSettings: (newSettings: Partial<SystemSettings>, adminEmail?: string) => Promise<boolean>;
  previewTheme: (previewConfig: Partial<GlobalThemeConfig>) => void;
  resetThemeToDefaults: (adminEmail?: string) => Promise<boolean>;
  forceRefresh: () => Promise<void>;
}

const LOCAL_STORAGE_CACHE_KEY = 'aetherpix_system_settings_cache_v2';

/**
 * Custom hook that listens to the 'system_settings' collection in real-time in Firestore
 * and injects all theme, font, and branding variables into a CSS variable root (:root) override,
 * ensuring theme settings update instantly across the entire application without requiring page reloads.
 */
export function useSystemSettingsTheme(): UseSystemSettingsThemeReturn {
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

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [appliedVariables, setAppliedVariables] = useState<Record<string, string>>({});
  const [isDark, setIsDark] = useState<boolean>(true);

  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Helper function to inject variables into document.documentElement (:root)
   */
  const injectThemeVariables = useCallback((currentSettings: SystemSettings): AppliedThemeResult => {
    const config: GlobalThemeConfig = {
      theme: currentSettings.theme || 'dark',
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

    const result = applyGlobalThemeVariables(config);
    setIsDark(result.isDark);
    setAppliedVariables(result.appliedVariables);
    return result;
  }, []);

  // Synchronously inject initial theme variables on initial render
  useEffect(() => {
    injectThemeVariables(settings);
  }, [injectThemeVariables]);

  // Real-time Firestore snapshot listener on system_settings/global
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
          setIsLoading(false);
          setError(null);

          // Update localStorage cache
          try {
            localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(mergedSettings));
          } catch {}

          // Real-time CSS Variable Root injection
          injectThemeVariables(mergedSettings);
        },
        async (err) => {
          if (!isMounted) return;
          handleFirestoreError(err, OperationType.GET, docPath);

          // Fallback to one-time getDoc from system_settings or system_config/settings
          try {
            const fallbackSnap = await getDoc(doc(db, 'system_config', 'settings'));
            if (fallbackSnap.exists()) {
              const fbData = { ...DEFAULT_SYSTEM_SETTINGS, ...fallbackSnap.data() } as SystemSettings;
              if (isMounted) {
                setSettings(fbData);
                injectThemeVariables(fbData);
              }
            }
          } catch {
            // Retain existing cached settings
          }

          setIsLoading(false);
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      );

      return () => {
        isMounted = false;
        unsubscribe();
        if (previewTimeoutRef.current) {
          clearTimeout(previewTimeoutRef.current);
        }
      };
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return () => {};
    }
  }, [injectThemeVariables]);

  /**
   * Temporarily preview theme options (e.g., during live color picking or font testing)
   */
  const previewTheme = useCallback(
    (previewConfig: Partial<GlobalThemeConfig>) => {
      const mergedConfig: GlobalThemeConfig = {
        theme: previewConfig.theme ?? settings.theme ?? 'dark',
        primaryColor: previewConfig.primaryColor ?? settings.primaryColor ?? settings.accentColor ?? 'purple',
        accentColor: previewConfig.accentColor ?? settings.accentColor ?? settings.primaryColor ?? 'purple',
        radius: previewConfig.radius ?? settings.radius ?? 8,
        sidebarTheme: previewConfig.sidebarTheme ?? settings.sidebarTheme ?? 'dark',
        fontFamily: previewConfig.fontFamily ?? settings.fontFamily ?? 'Inter',
        fontDisplay: previewConfig.fontDisplay ?? settings.fontDisplay ?? 'Outfit',
        fontMono: previewConfig.fontMono ?? settings.fontMono ?? 'Space Grotesk',
        fontScale: previewConfig.fontScale ?? settings.fontScale ?? 100,
        siteName: previewConfig.siteName ?? settings.siteName,
        logoUrl: previewConfig.logoUrl ?? settings.logoUrl,
        faviconUrl: previewConfig.faviconUrl ?? settings.faviconUrl,
        customCss: previewConfig.customCss ?? settings.customCss,
      };

      const result = applyGlobalThemeVariables(mergedConfig);
      setIsDark(result.isDark);
      setAppliedVariables(result.appliedVariables);
    },
    [settings]
  );

  /**
   * Persist changes directly to the Firestore system_settings collection ('global' doc)
   */
  const updateSettings = useCallback(
    async (newSettings: Partial<SystemSettings>, adminEmail = 'admin'): Promise<boolean> => {
      const docPath = 'system_settings/global';
      try {
        const merged: SystemSettings = {
          ...settings,
          ...newSettings,
        };

        // Optimistically apply theme immediately
        setSettings(merged);
        injectThemeVariables(merged);

        // Save to Firestore system_settings/global
        await setDoc(doc(db, 'system_settings', 'global'), newSettings, { merge: true });

        // Keep system_config/settings synchronized for backwards compatibility
        try {
          await setDoc(doc(db, 'system_config', 'settings'), newSettings, { merge: true });
        } catch {}

        // Update local cache
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
    [settings, injectThemeVariables]
  );

  /**
   * Reset theme settings back to system defaults
   */
  const resetThemeToDefaults = useCallback(
    async (adminEmail = 'admin'): Promise<boolean> => {
      const defaultThemeSettings: Partial<SystemSettings> = {
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
      return updateSettings(defaultThemeSettings, adminEmail);
    },
    [updateSettings]
  );

  /**
   * Force fresh fetch from Firestore and re-apply
   */
  const forceRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const snap = await getDoc(doc(db, 'system_settings', 'global'));
      if (snap.exists()) {
        const live = { ...DEFAULT_SYSTEM_SETTINGS, ...snap.data() } as SystemSettings;
        setSettings(live);
        injectThemeVariables(live);
      }
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [injectThemeVariables]);

  return {
    settings,
    isLoading,
    error,
    isDark,
    appliedVariables,
    theme: settings.theme || 'dark',
    primaryColor: settings.primaryColor || settings.accentColor || 'purple',
    accentColor: settings.accentColor || settings.primaryColor || 'purple',
    radius: typeof settings.radius === 'number' ? settings.radius : 8,
    sidebarTheme: settings.sidebarTheme || 'dark',
    fontFamily: settings.fontFamily || 'Inter',
    fontDisplay: settings.fontDisplay || 'Outfit',
    fontMono: settings.fontMono || 'Space Grotesk',
    siteName: settings.siteName || 'AetherPix Studio',
    logoUrl: settings.logoUrl,
    faviconUrl: settings.faviconUrl,
    customCss: settings.customCss,
    updateSettings,
    previewTheme,
    resetThemeToDefaults,
    forceRefresh,
  };
}

export const useSystemTheme = useSystemSettingsTheme;
export default useSystemSettingsTheme;
