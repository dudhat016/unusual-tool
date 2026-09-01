import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DEFAULT_AD_SLOTS } from '../config/adSlots';
import { DEFAULT_FEATURE_FLAGS } from '../config/featureFlags';
import { auth, googleProvider } from '../config/firebase';
import { DEFAULT_PLANS, IPaymentProvider, MockPaymentProviderAdapter } from '../config/plans';
import { DEFAULT_SYSTEM_SETTINGS } from '../config/systemSettings';
import { AbusePreventionService } from '../services/AbusePreventionService';
import { CreditManager } from '../services/CreditManager';
import { SaaSDataService } from '../services/SaaSDataService';
import { SubscriptionManager, ChangePlanParams } from '../services/SubscriptionManager';
import { DynamicToolService } from '../services/DynamicToolService';
import { DynamicSeoService } from '../services/DynamicSeoService';
import { PRIMARY_COLOR_PRESETS, applyGlobalThemeVariables } from '../utils/themeHelper';
import { RateLimitCheckResult, TrafficProtectionService } from '../services/TrafficProtectionService';
import { HistoryItem, ToolDefinition, UserCredits } from '../types';
import { ToolSeoEntry } from '../types/seo';
import {
  CreditAnalyticsSummary,
  CreditCheckResult,
  CreditCostEstimate,
  CreditTopUpPackage,
  DEFAULT_CREDIT_PACKAGES,
  TransactionType,
} from '../types/credits';
import {
  FeatureFlag,
  SystemSettings,
} from '../types/admin';
import { AdSlotConfig } from '../types/ads';
import {
  BillingCycle,
  CreditLedgerRecord,
  InvoiceItem,
  PlanConfig,
  PlanTier,
  ProcessingJobRecord,
  SavedPreset,
  UserProfile,
  UserSubscriptionRecord,
} from '../types/saas';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  // Navigation & UI
  currentPath: string;
  navigate: (path: string) => void;
  favorites: string[];
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  radius: number;
  setRadius: (r: number) => void;
  sidebarTheme: 'default' | 'dark' | 'light' | 'gradient';
  setSidebarTheme: (st: 'default' | 'dark' | 'light' | 'gradient') => void;
  resetThemeConfig: () => void;

  // Dynamic Tools & SEO Catalog
  tools: ToolDefinition[];
  getToolBySlug: (slug: string) => ToolDefinition | undefined;
  getToolByRoute: (route: string) => ToolDefinition | undefined;
  getToolsByCategory: (category: string) => ToolDefinition[];
  getSeoForRoute: (route: string) => Partial<ToolSeoEntry> | undefined;

  // SaaS Auth & User Profile (Firestore 'users' collection & Firebase Auth)
  user: User | null;
  userProfile: UserProfile | null;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  updateUserPreferences: (prefs: {
    displayName?: string;
    photoURL?: string;
    avatar?: string;
    preferredLanguage?: string;
    theme?: 'light' | 'dark' | 'system';
    privacySettings?: Partial<UserProfile['privacySettings']>;
  }) => Promise<boolean>;
  refreshUserProfile: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'signin' | 'signup' | 'forgot_password';
  setAuthModalMode: (mode: 'signin' | 'signup' | 'forgot_password') => void;
  openAuthModal: (mode?: 'signin' | 'signup' | 'forgot_password') => void;
  logout: () => Promise<void>;
  isAdmin: boolean;

  // SaaS Credits & Ledger (CreditManager)
  credits: UserCredits;
  activePlanConfig: PlanConfig;
  creditLedger: CreditLedgerRecord[];
  refreshLedger: () => Promise<void>;
  consumeCredits: (amount: number, description?: string, toolId?: string, jobId?: string) => Promise<boolean>;
  grantCredits: (amount: number, type?: TransactionType, description?: string) => Promise<boolean>;
  refundCredits: (amount: number, reason: string, jobId?: string, toolId?: string) => Promise<boolean>;
  checkCreditAvailability: (requiredAmount: number) => Promise<CreditCheckResult>;
  purchaseCreditPackage: (packageId: string) => Promise<boolean>;
  estimateToolCost: (toolId: string, options?: { isAi?: boolean; batchSize?: number; resolutionMegapixels?: number }) => CreditCostEstimate;
  getCreditAnalytics: () => Promise<CreditAnalyticsSummary>;

  // SaaS Jobs & Telemetry
  processingJobs: ProcessingJobRecord[];
  logJob: (job: Omit<ProcessingJobRecord, 'id' | 'userId' | 'timestamp'>) => Promise<ProcessingJobRecord | null>;
  refreshJobs: () => Promise<void>;

  // Saved Presets
  presets: SavedPreset[];
  savePreset: (title: string, toolId: string, options: any) => Promise<SavedPreset | null>;
  refreshPresets: () => Promise<void>;

  // System Settings & Feature Flags
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => Promise<boolean>;
  featureFlags: FeatureFlag[];
  isFeatureEnabled: (key: string) => boolean;

  // Ad Monetization Slots
  adSlots: AdSlotConfig[];

  // Dynamic Credit Top-Up Packages
  creditPackages: CreditTopUpPackage[];

  // Subscriptions, Plans & Billing Manager
  plans: Record<string, PlanConfig>;
  userSubscriptions: UserSubscriptionRecord[];
  activeSubscription: UserSubscriptionRecord | null;
  invoices: InvoiceItem[];
  paymentProvider: IPaymentProvider;
  upgradePlan: (planId: PlanTier, interval?: 'monthly' | 'yearly') => Promise<boolean>;
  changePlan: (params: Omit<ChangePlanParams, 'userId'>) => Promise<boolean>;
  cancelSubscription: (subscriptionId?: string, cancelAtPeriodEnd?: boolean) => Promise<boolean>;
  resumeSubscription: (subscriptionId?: string) => Promise<boolean>;
  updatePaymentMethod: (paymentMethod: { brand: string; last4: string; expMonth: number; expYear: number }, subscriptionId?: string) => Promise<boolean>;
  refreshSubscriptions: () => Promise<void>;

  // Traffic & Abuse checks
  checkExecutionAllowed: (fileCount?: number, isAi?: boolean) => RateLimitCheckResult;
  recordSuccessfulProcess: (count?: number) => void;
  checkFileSize: (size: number) => { allowed: boolean; message?: string };
  checkBatchSize: (count: number) => { allowed: boolean; message?: string };
  checkResolution: (width: number, height: number) => { allowed: boolean; message?: string };
  checkAiQuota: () => { allowed: boolean; reason?: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'forgot_password'>('signin');

  const [creditLedger, setCreditLedger] = useState<CreditLedgerRecord[]>([]);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJobRecord[]>([]);
  const [presets, setPresets] = useState<SavedPreset[]>([]);

  // SaaS Plans from Firestore 'plans' collection & User Subscriptions sub-collection
  const [plans, setPlans] = useState<Record<string, PlanConfig>>(DEFAULT_PLANS);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscriptionRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);

  // Real-time listener for top-level 'plans' Firestore collection
  useEffect(() => {
    const unsub = SubscriptionManager.subscribeToPlans((livePlans) => {
      setPlans(livePlans);
    });
    return unsub;
  }, []);

  // Real-time listener for user's subscriptions sub-collection (/users/{userId}/subscriptions)
  useEffect(() => {
    if (!user?.uid) {
      setUserSubscriptions([]);
      setInvoices([]);
      return;
    }

    const unsub = SubscriptionManager.subscribeToUserSubscriptions(user.uid, (subs) => {
      setUserSubscriptions(subs);
      const allInvs: InvoiceItem[] = [];
      subs.forEach((s) => {
        if (s.invoiceHistory && Array.isArray(s.invoiceHistory)) {
          allInvs.push(...s.invoiceHistory);
        }
      });
      setInvoices(allInvs.sort((a, b) => b.date - a.date));
    });

    return unsub;
  }, [user?.uid]);

  // Dynamic Tools & SEO state
  const [tools, setTools] = useState<ToolDefinition[]>(() => DynamicToolService.getAllTools());

  useEffect(() => {
    const unsub = DynamicToolService.subscribe((updated) => {
      setTools([...updated]);
    });
    return unsub;
  }, []);

  const getToolBySlug = useCallback((slug: string) => DynamicToolService.getToolBySlug(slug), [tools]);
  const getToolByRoute = useCallback((route: string) => DynamicToolService.getToolByRoute(route), [tools]);
  const getToolsByCategory = useCallback((category: string) => DynamicToolService.getToolsByCategory(category), [tools]);
  const getSeoForRoute = useCallback((route: string) => DynamicSeoService.getSeoForRoute(route), []);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(DEFAULT_FEATURE_FLAGS);
  const [adSlots, setAdSlots] = useState<AdSlotConfig[]>(DEFAULT_AD_SLOTS);
  const [creditPackages, setCreditPackages] = useState<CreditTopUpPackage[]>(DEFAULT_CREDIT_PACKAGES);

  // Live Firestore subscriptions for system settings, feature flags, ad slots, and credit packages
  useEffect(() => {
    const unsubSettings = SaaSDataService.subscribeToSystemSettings((liveSettings) => {
      setSystemSettings(liveSettings);
    });
    const unsubFlags = SaaSDataService.subscribeToFeatureFlags((liveFlags) => {
      setFeatureFlags(liveFlags);
    });
    const unsubAds = SaaSDataService.subscribeToAdSlots((liveAds) => {
      setAdSlots(liveAds);
    });
    const unsubPackages = SaaSDataService.subscribeToCreditPackages((livePackages) => {
      setCreditPackages(livePackages);
    });

    return () => {
      unsubSettings();
      unsubFlags();
      unsubAds();
      unsubPackages();
    };
  }, []);

  const [paymentProvider] = useState<IPaymentProvider>(() => new MockPaymentProviderAdapter());

  // Cloud-synced user favorites (Empty for guests; requires Firebase login)
  const [favorites, setFavorites] = useState<string[]>([]);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('aetherpix_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('aetherpix_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {}
    return 'dark';
  });

  const [primaryColor, setPrimaryColor] = useState<string>(() => {
    try {
      return localStorage.getItem('aetherpix_primary_color') || 'purple';
    } catch {
      return 'purple';
    }
  });

  const [radius, setRadius] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('aetherpix_radius');
      return saved ? parseInt(saved, 10) : 8;
    } catch {
      return 8;
    }
  });

  const [sidebarTheme, setSidebarTheme] = useState<'default' | 'dark' | 'light' | 'gradient'>(() => {
    try {
      return (localStorage.getItem('aetherpix_sidebar_theme') as any) || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Dynamic DOM theme & design tokens synchronization
  useEffect(() => {
    applyGlobalThemeVariables({
      theme,
      primaryColor,
      radius,
      sidebarTheme,
    });

    try {
      localStorage.setItem('aetherpix_theme', theme);
      localStorage.setItem('aetherpix_radius', String(radius));
      localStorage.setItem('aetherpix_primary_color', primaryColor);
      localStorage.setItem('aetherpix_sidebar_theme', sidebarTheme);
    } catch {}
  }, [theme, radius, primaryColor, sidebarTheme]);

  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    try {
      localStorage.setItem('aetherpix_theme', newTheme);
    } catch {}

    // Immediately synchronize the Tailwind 'dark' class and design tokens across the DOM
    applyGlobalThemeVariables({
      theme: newTheme,
      primaryColor,
      radius,
      sidebarTheme,
    });

    // Update the user's theme preference in the 'users' Firestore document if authenticated
    if (user?.uid) {
      setUserProfile((prev) => (prev ? { ...prev, theme: newTheme, themePreference: newTheme } : null));
      SaaSDataService.updateUserTheme(user.uid, newTheme).catch((err) => {
        console.warn('Failed to sync theme preference to Firestore user document:', err);
      });
    }
  };

  const toggleTheme = () => {
    const nextTheme: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark';
    handleSetTheme(nextTheme);
  };

  const resetThemeConfig = () => {
    handleSetTheme('dark');
    setPrimaryColor('purple');
    setRadius(8);
    setSidebarTheme('dark');
  };

  // Real-time listener for the 'system_settings' Firestore document ('global' doc ID)
  useEffect(() => {
    const unsubscribe = SaaSDataService.subscribeToSystemSettings((liveSettings) => {
      setSystemSettings(liveSettings);

      // Dynamically sync theme, accent/primary color, radius, and sidebar variables globally in real-time
      if (liveSettings.theme) {
        if (liveSettings.theme === 'system') {
          const systemIsDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          setTheme(systemIsDark ? 'dark' : 'light');
        } else {
          setTheme(liveSettings.theme);
        }
      }

      if (liveSettings.primaryColor || liveSettings.accentColor) {
        setPrimaryColor(liveSettings.primaryColor || liveSettings.accentColor || 'purple');
      }

      if (typeof liveSettings.radius === 'number') {
        setRadius(liveSettings.radius);
      }

      if (liveSettings.sidebarTheme) {
        setSidebarTheme(liveSettings.sidebarTheme);
      }

      // Immediately apply CSS variables to the document root in real time
      applyGlobalThemeVariables({
        theme: liveSettings.theme,
        primaryColor: liveSettings.primaryColor || liveSettings.accentColor,
        radius: liveSettings.radius,
        sidebarTheme: liveSettings.sidebarTheme,
        fontFamily: liveSettings.fontFamily,
        fontDisplay: liveSettings.fontDisplay,
        fontMono: liveSettings.fontMono,
        fontScale: liveSettings.fontScale,
        siteName: liveSettings.siteName,
        logoUrl: liveSettings.logoUrl,
        faviconUrl: liveSettings.faviconUrl,
        customCss: liveSettings.customCss,
      });
    });

    // Also fetch initial feature flags and ad slots
    const fetchOtherConfigs = async () => {
      try {
        const [flags, ads] = await Promise.all([
          SaaSDataService.getFeatureFlags(),
          SaaSDataService.getAdSlots(),
        ]);
        setFeatureFlags(flags);
        setAdSlots(ads);
      } catch (err) {
        console.warn('Config fetch error', err);
      }
    };
    fetchOtherConfigs();

    return () => {
      unsubscribe();
    };
  }, []);

  // DEV Admin emails list
  const DEV_ADMIN_EMAILS = ['chintandudhat1286@gmail.com', 'unusualgamerz16@gmail.com'];

  // Firebase Auth State Listener (Single source of truth for user session)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profile = await SaaSDataService.getOrCreateUserProfile(
            firebaseUser.uid,
            firebaseUser.email,
            firebaseUser.displayName,
            firebaseUser.photoURL
          );
          setUserProfile(profile);

          if (profile.theme && (profile.theme === 'light' || profile.theme === 'dark')) {
            setTheme(profile.theme);
          }

          refreshLedger(firebaseUser.uid);
          refreshJobs(firebaseUser.uid);
          refreshPresets(firebaseUser.uid);
        } catch (err) {
          console.warn('Firebase profile fetch warning', err);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore 'users' collection listener for UserProfile
  useEffect(() => {
    if (!user?.uid) return;

    let isSubscribed = true;
    const unsubscribe = SaaSDataService.subscribeToUserProfile(user.uid, (cloudProfile) => {
      if (!isSubscribed) return;
      if (cloudProfile) {
        setUserProfile(cloudProfile);
        if (cloudProfile.theme && (cloudProfile.theme === 'light' || cloudProfile.theme === 'dark')) {
          setTheme(cloudProfile.theme);
        }
      }
    });

    // Real-time Firestore Ledger listener via CreditManager
    const unsubLedger = CreditManager.subscribeToLedger(user.uid, (records) => {
      if (!isSubscribed) return;
      setCreditLedger(records);
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
      unsubLedger();
    };
  }, [user?.uid]);

  // Cross-device User Favorites Listener via Firestore 'favorites' collection (Requires Auth)
  useEffect(() => {
    if (!user?.uid) {
      setFavorites([]);
      try {
        localStorage.removeItem('aetherpix_favorites');
      } catch {}
      return;
    }

    let isSubscribed = true;
    const unsubscribe = SaaSDataService.subscribeToUserFavorites(user.uid, (cloudFavorites) => {
      if (!isSubscribed) return;
      if (cloudFavorites && Array.isArray(cloudFavorites)) {
        setFavorites(cloudFavorites);
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [user?.uid]);

  // History & routing
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openAuthModal = (mode: 'signin' | 'signup' | 'forgot_password' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const signInWithEmail = async (emailInput: string, passwordInput: string): Promise<User> => {
    const cred = await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
    if (cred.user) {
      const profile = await SaaSDataService.getOrCreateUserProfile(
        cred.user.uid,
        cred.user.email,
        cred.user.displayName,
        cred.user.photoURL
      );
      setUser(cred.user);
      setUserProfile(profile);
    }
    return cred.user;
  };

  const signUpWithEmail = async (
    emailInput: string,
    passwordInput: string,
    nameInput?: string
  ): Promise<User> => {
    const cleanEmail = emailInput.trim();
    const cleanName = (nameInput || '').trim() || cleanEmail.split('@')[0];
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, passwordInput);
    if (cred.user) {
      try {
        await updateProfile(cred.user, { displayName: cleanName });
      } catch (profileErr) {
        console.warn('Could not update Firebase user displayName', profileErr);
      }
      const profile = await SaaSDataService.getOrCreateUserProfile(
        cred.user.uid,
        cleanEmail,
        cleanName,
        null
      );
      setUser(cred.user);
      setUserProfile(profile);
    }
    return cred.user;
  };

  const signInWithGoogle = async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      const profile = await SaaSDataService.getOrCreateUserProfile(
        result.user.uid,
        result.user.email,
        result.user.displayName,
        result.user.photoURL
      );
      setUser(result.user);
      setUserProfile(profile);
    }
    return result.user;
  };

  const sendPasswordReset = async (emailInput: string): Promise<void> => {
    await sendPasswordResetEmail(auth, emailInput.trim());
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out error', err);
    } finally {
      setUserProfile(null);
      setUser(null);
      setFavorites([]);
      try {
        localStorage.removeItem('aetherpix_favorites');
      } catch {}
      showToast('Signed out successfully.', 'info');
    }
  };

  // Derive current plan configuration from Firestore live plans or fallback
  const currentPlanTier: PlanTier = userProfile?.plan || 'free';
  const activePlanConfig: PlanConfig = plans[currentPlanTier] || DEFAULT_PLANS[currentPlanTier] || DEFAULT_PLANS.free;

  // Active user subscription from sub-collection
  const activeSubscription: UserSubscriptionRecord | null =
    userSubscriptions.find((s) => s.status === 'active' || s.status === 'trialing') ||
    userSubscriptions[0] ||
    null;

  // Credits representation
  const credits: UserCredits = {
    total: activePlanConfig.monthlyCredits,
    used: userProfile ? Math.max(0, activePlanConfig.monthlyCredits - userProfile.credits) : 0,
    plan: currentPlanTier === 'business' ? 'business' : currentPlanTier === 'pro' ? 'pro' : 'free',
    resetsAt: activeSubscription?.currentPeriodEnd || userProfile?.subscription?.currentPeriodEnd || (Date.now() + 30 * 24 * 3600 * 1000),
  };

  const isAdmin =
    userProfile?.role === 'admin' ||
    (user?.email ? DEV_ADMIN_EMAILS.includes(user.email.toLowerCase()) : false);

  const refreshUserProfile = async () => {
    if (!user?.uid) return;
    try {
      const profile = await SaaSDataService.getUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (e) {
      console.warn('Could not refresh user profile', e);
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user?.uid) {
      showToast('Please sign in to update your profile.', 'error');
      return false;
    }

    try {
      const normalizedUpdates: Partial<UserProfile> = { ...updates };
      if (updates.avatar && !updates.photoURL) {
        normalizedUpdates.photoURL = updates.avatar;
      } else if (updates.photoURL && !updates.avatar) {
        normalizedUpdates.avatar = updates.photoURL;
      }

      // Optimistic update of local userProfile state
      setUserProfile((prev) => (prev ? { ...prev, ...normalizedUpdates, updatedAt: Date.now() } : null));

      if (normalizedUpdates.displayName !== undefined || normalizedUpdates.photoURL !== undefined || normalizedUpdates.avatar !== undefined) {
        setUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            displayName: normalizedUpdates.displayName !== undefined ? normalizedUpdates.displayName : prev.displayName,
            photoURL: normalizedUpdates.photoURL !== undefined ? normalizedUpdates.photoURL : (normalizedUpdates.avatar || prev.photoURL),
          } as User;
        });
      }

      // 1. Write to Firestore 'users' collection
      const success = await SaaSDataService.updateUserAccountSettings(user.uid, normalizedUpdates);

      // 2. Sync Firebase Auth user token if available
      if (auth.currentUser && (normalizedUpdates.displayName !== undefined || normalizedUpdates.photoURL !== undefined)) {
        try {
          await updateProfile(auth.currentUser, {
            displayName: normalizedUpdates.displayName !== undefined ? (normalizedUpdates.displayName || '') : auth.currentUser.displayName,
            photoURL: normalizedUpdates.photoURL !== undefined ? (normalizedUpdates.photoURL || undefined) : (auth.currentUser.photoURL || undefined),
          });
        } catch (authErr) {
          console.warn('Firebase Auth updateProfile warning', authErr);
        }
      }

      if (success) {
        showToast('Profile updated successfully in Firestore', 'success');
      } else {
        showToast('Failed to save profile changes to cloud', 'error');
      }
      return success;
    } catch (e) {
      console.error('Error updating user profile in Firestore', e);
      showToast('Failed to update profile settings', 'error');
      return false;
    }
  };

  const updateUserPreferences = async (prefs: {
    displayName?: string;
    photoURL?: string;
    avatar?: string;
    preferredLanguage?: string;
    theme?: 'light' | 'dark' | 'system';
    privacySettings?: Partial<UserProfile['privacySettings']>;
  }): Promise<boolean> => {
    const payload: Partial<UserProfile> = {};
    if (prefs.displayName !== undefined) payload.displayName = prefs.displayName;
    if (prefs.photoURL !== undefined) payload.photoURL = prefs.photoURL;
    if (prefs.avatar !== undefined) payload.avatar = prefs.avatar;
    if (prefs.preferredLanguage !== undefined) payload.preferredLanguage = prefs.preferredLanguage;
    if (prefs.theme !== undefined) {
      payload.theme = prefs.theme;
      payload.themePreference = prefs.theme;
      if (prefs.theme === 'light' || prefs.theme === 'dark') {
        handleSetTheme(prefs.theme);
      }
    }
    if (prefs.privacySettings !== undefined) {
      payload.privacySettings = {
        ...(userProfile?.privacySettings || { telemetryOptIn: true, autoPurgeHistoryMinutes: 0 }),
        ...prefs.privacySettings,
      };
    }
    return updateUserProfile(payload);
  };

  const refreshLedger = async (uid?: string) => {
    const targetUid = uid || user?.uid;
    if (!targetUid) return;
    try {
      const records = await SaaSDataService.getUserLedger(targetUid);
      setCreditLedger(records);
    } catch (err) {
      console.warn('Could not refresh ledger', err);
    }
  };

  const refreshJobs = async (uid?: string) => {
    const targetUid = uid || user?.uid;
    if (!targetUid) return;
    try {
      const records = await SaaSDataService.getUserProcessingJobs(targetUid);
      setProcessingJobs(records);
    } catch (err) {
      console.warn('Could not refresh jobs', err);
    }
  };

  const refreshPresets = async (uid?: string) => {
    const targetUid = uid || user?.uid;
    if (!targetUid) return;
    try {
      const p = await SaaSDataService.getUserPresets(targetUid);
      setPresets(p);
    } catch (err) {
      console.warn('Could not refresh presets', err);
    }
  };

  const isFeatureEnabled = (key: string): boolean => {
    const flag = featureFlags.find((f) => f.key === key);
    if (!flag) return true;
    if (flag.status === 'disabled') return false;
    if (flag.status === 'premium_only') {
      return userProfile?.plan === 'pro' || userProfile?.plan === 'business';
    }
    return true;
  };

  const updateSystemSettings = async (newSettings: Partial<SystemSettings>): Promise<boolean> => {
    // Optimistically apply theme/accent color if present
    if (newSettings.theme || newSettings.primaryColor || newSettings.accentColor || typeof newSettings.radius === 'number' || newSettings.sidebarTheme) {
      applyGlobalThemeVariables({
        theme: newSettings.theme || theme,
        primaryColor: newSettings.primaryColor || newSettings.accentColor || primaryColor,
        radius: typeof newSettings.radius === 'number' ? newSettings.radius : radius,
        sidebarTheme: newSettings.sidebarTheme || sidebarTheme,
      });
    }

    const ok = await SaaSDataService.updateSystemSettings(newSettings, user?.email || 'admin');
    if (ok) {
      setSystemSettings((prev) => ({ ...prev, ...newSettings }));
      showToast('System settings updated successfully and broadcasted in real-time', 'success');
      return true;
    }
    showToast('Failed to update system settings', 'error');
    return false;
  };

  /**
   * Centralized CreditManager Operations (Firestore Atomic Transactions)
   */
  const consumeCredits = async (
    amount: number,
    description = 'Image Processing',
    toolId?: string,
    jobId?: string
  ): Promise<boolean> => {
    if (amount <= 0) return true;

    if (!user) {
      // Local fallback for guest preview
      return true;
    }

    if ((userProfile?.credits || 0) < amount) {
      showToast(`Insufficient credits (${userProfile?.credits || 0} available). You need ${amount} credits.`, 'error');
      openAuthModal('signin');
      return false;
    }

    const res = await CreditManager.consumeCredits({
      userId: user.uid,
      amount,
      description,
      toolId,
      jobId,
      userEmail: user.email || undefined,
    });

    if (res.success) {
      setUserProfile((prev) => (prev ? { ...prev, credits: res.newBalance } : null));
      return true;
    } else {
      showToast(res.error || 'Failed to process credit transaction', 'error');
      return false;
    }
  };

  const grantCredits = async (
    amount: number,
    type: TransactionType = 'bonus',
    description = 'Credit Grant'
  ): Promise<boolean> => {
    if (!user) return false;
    const res = await CreditManager.grantCredits({
      userId: user.uid,
      amount,
      type,
      description,
      adminEmail: user.email || undefined,
    });
    if (res.success) {
      setUserProfile((prev) => (prev ? { ...prev, credits: res.newBalance } : null));
      showToast(`Added +${amount} credits to your account!`, 'success');
      return true;
    } else {
      showToast(res.error || 'Failed to grant credits', 'error');
      return false;
    }
  };

  const refundCredits = async (
    amount: number,
    reason: string,
    jobId?: string,
    toolId?: string
  ): Promise<boolean> => {
    if (!user) return false;
    const res = await CreditManager.refundCredits({
      userId: user.uid,
      amount,
      reason,
      jobId,
      toolId,
    });
    if (res.success) {
      setUserProfile((prev) => (prev ? { ...prev, credits: res.newBalance } : null));
      showToast(`Refunded +${amount} credits for failed operation.`, 'info');
      return true;
    }
    return false;
  };

  const checkCreditAvailability = async (requiredAmount: number): Promise<CreditCheckResult> => {
    if (!user) {
      return {
        allowed: false,
        currentBalance: 0,
        requiredAmount,
        deficit: requiredAmount,
        userPlan: 'free',
      };
    }
    return CreditManager.checkCreditAvailability(user.uid, requiredAmount);
  };

  const purchaseCreditPackage = async (packageId: string): Promise<boolean> => {
    if (!user) {
      showToast('Please sign in to purchase credit packs.', 'info');
      openAuthModal('signin');
      return false;
    }
    const res = await CreditManager.purchaseTopUpPackage(user.uid, packageId);
    if (res.success) {
      setUserProfile((prev) => (prev ? { ...prev, credits: res.newBalance } : null));
      showToast(`Successfully purchased +${res.creditsAdded} credits!`, 'success');
      return true;
    } else {
      showToast(res.error || 'Failed to complete credit purchase.', 'error');
      return false;
    }
  };

  const estimateToolCost = (
    toolId: string,
    options?: { isAi?: boolean; batchSize?: number; resolutionMegapixels?: number }
  ): CreditCostEstimate => {
    return CreditManager.calculateCost(toolId, options);
  };

  const getCreditAnalytics = async (): Promise<CreditAnalyticsSummary> => {
    if (!user?.uid) {
      return {
        currentBalance: 0,
        totalEarned: 0,
        totalSpent: 0,
        spentToday: 0,
        spentThisMonth: 0,
        transactionsCount: 0,
        byToolBreakdown: {},
        byTypeBreakdown: {},
        dailySpendHistory: [],
        burnRatePerDay: 0,
        projectedRunwayDays: null,
      };
    }
    return CreditManager.getCreditAnalytics(user.uid, creditLedger);
  };

  const logJob = async (job: Omit<ProcessingJobRecord, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) return null;
    try {
      const record = await SaaSDataService.logProcessingJob(user.uid, {
        ...job,
        userEmail: user.email || undefined,
      });
      refreshJobs();
      return record;
    } catch (err) {
      console.warn('Could not log job', err);
      return null;
    }
  };

  const savePreset = async (title: string, toolId: string, options: any) => {
    if (!user) {
      showToast('Please sign in to save presets to your cloud profile.', 'info');
      openAuthModal('signin');
      return null;
    }
    try {
      const saved = await SaaSDataService.savePreset(user.uid, title, toolId, options);
      showToast(`Preset "${title}" saved!`, 'success');
      refreshPresets();
      return saved;
    } catch (err) {
      showToast('Failed to save preset.', 'error');
      return null;
    }
  };

  const refreshSubscriptions = async () => {
    if (!user?.uid) return;
    try {
      const subs = await SubscriptionManager.getUserSubscriptions(user.uid);
      setUserSubscriptions(subs);
      const allInvs: InvoiceItem[] = [];
      subs.forEach((s) => {
        if (s.invoiceHistory && Array.isArray(s.invoiceHistory)) {
          allInvs.push(...s.invoiceHistory);
        }
      });
      setInvoices(allInvs.sort((a, b) => b.date - a.date));
    } catch (err) {
      console.warn('Could not refresh subscriptions', err);
    }
  };

  const changePlan = async (params: Omit<ChangePlanParams, 'userId'>): Promise<boolean> => {
    if (!user) {
      openAuthModal('signup');
      return false;
    }

    try {
      const res = await SubscriptionManager.changePlan({
        userId: user.uid,
        userEmail: user.email,
        ...params,
      });

      if (res.success) {
        setUserProfile((prev) => (prev ? { ...prev, plan: params.targetPlanId } : null));
        const planName = plans[params.targetPlanId]?.name || DEFAULT_PLANS[params.targetPlanId]?.name || params.targetPlanId;
        showToast(`Successfully upgraded/downgraded to ${planName}!`, 'success');
        refreshLedger(user.uid);
        refreshSubscriptions();
        return true;
      }
      showToast(res.error || 'Failed to update subscription', 'error');
      return false;
    } catch {
      showToast('Subscription processing error', 'error');
      return false;
    }
  };

  const cancelSubscription = async (subscriptionId?: string, cancelAtPeriodEnd = true): Promise<boolean> => {
    if (!user) {
      openAuthModal('signin');
      return false;
    }
    const targetSubId = subscriptionId || activeSubscription?.id;
    if (!targetSubId) {
      showToast('No active subscription found to cancel', 'error');
      return false;
    }

    try {
      const success = await SubscriptionManager.cancelSubscription(user.uid, targetSubId, cancelAtPeriodEnd);
      if (success) {
        showToast(
          cancelAtPeriodEnd
            ? 'Subscription scheduled for cancellation at the end of the billing period.'
            : 'Subscription canceled immediately.',
          'info'
        );
        refreshSubscriptions();
        refreshUserProfile();
        return true;
      }
      showToast('Failed to cancel subscription', 'error');
      return false;
    } catch {
      showToast('Error processing cancellation request', 'error');
      return false;
    }
  };

  const resumeSubscription = async (subscriptionId?: string): Promise<boolean> => {
    if (!user) return false;
    const targetSubId = subscriptionId || activeSubscription?.id;
    if (!targetSubId) return false;

    try {
      const success = await SubscriptionManager.resumeSubscription(user.uid, targetSubId);
      if (success) {
        showToast('Subscription renewed and active auto-billing resumed!', 'success');
        refreshSubscriptions();
        refreshUserProfile();
        return true;
      }
      showToast('Failed to resume subscription', 'error');
      return false;
    } catch {
      showToast('Error resuming subscription', 'error');
      return false;
    }
  };

  const updatePaymentMethod = async (
    paymentMethod: { brand: string; last4: string; expMonth: number; expYear: number },
    subscriptionId?: string
  ): Promise<boolean> => {
    if (!user) return false;
    const targetSubId = subscriptionId || activeSubscription?.id;
    if (!targetSubId) {
      showToast('No subscription found to update payment method', 'error');
      return false;
    }

    try {
      const success = await SubscriptionManager.updatePaymentMethod(user.uid, targetSubId, paymentMethod);
      if (success) {
        showToast('Payment method updated successfully!', 'success');
        refreshSubscriptions();
        return true;
      }
      showToast('Failed to update payment method', 'error');
      return false;
    } catch {
      showToast('Error updating payment method', 'error');
      return false;
    }
  };

  const upgradePlan = async (planId: PlanTier, interval: 'monthly' | 'yearly' = 'monthly'): Promise<boolean> => {
    return changePlan({
      targetPlanId: planId,
      billingCycle: interval,
      provider: 'stripe',
    });
  };

  // Traffic Protection Checks
  const checkExecutionAllowed = (fileCount = 1, isAi = false): RateLimitCheckResult => {
    return TrafficProtectionService.validateExecution(userProfile, activePlanConfig, systemSettings, fileCount, isAi);
  };

  const recordSuccessfulProcess = (count = 1) => {
    if (!user) {
      TrafficProtectionService.recordAnonymousUsage(count);
    }
  };

  const checkFileSize = (size: number) => AbusePreventionService.validateFileSize(size, activePlanConfig);
  const checkBatchSize = (count: number) => AbusePreventionService.validateBatchSize(count, activePlanConfig);
  const checkResolution = (w: number, h: number) => AbusePreventionService.validateResolution(w, h, activePlanConfig);
  const checkAiQuota = () => AbusePreventionService.checkAiRateLimit(user?.uid || 'guest', activePlanConfig);

  const toggleFavorite = async (toolId: string) => {
    if (!user?.uid) {
      showToast('Please sign in to save favorite tools to your account', 'info');
      openAuthModal('signin');
      return;
    }

    const isAdding = !favorites.includes(toolId);
    const next = isAdding
      ? [...favorites, toolId]
      : favorites.filter((id) => id !== toolId);

    // Optimistic UI state update
    setFavorites(next);

    try {
      const success = await SaaSDataService.updateUserFavorites(user.uid, next);
      if (success) {
        showToast(isAdding ? 'Added to your favorites' : 'Removed from favorites', 'success');
      } else {
        // Revert on failure
        setFavorites(favorites);
        showToast('Failed to sync favorite to cloud database', 'error');
      }
    } catch (err) {
      console.warn('Failed to sync favorite to Firestore', err);
      setFavorites(favorites);
      showToast('Failed to sync favorite to cloud database', 'error');
    }
  };

  const isFavorite = (toolId: string) => {
    if (!user?.uid) return false;
    return favorites.includes(toolId);
  };

  const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    setHistory((prev) => {
      const next = [newItem, ...prev.slice(0, 29)];
      try {
        localStorage.setItem('aetherpix_history', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const removeFromHistory = (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('aetherpix_history', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('aetherpix_history');
    } catch {}
  };

  return (
    <AppContext.Provider
      value={{
        currentPath,
        navigate,
        favorites,
        toggleFavorite,
        isFavorite,
        history,
        addToHistory,
        removeFromHistory,
        clearHistory,
        toasts,
        showToast,
        removeToast,
        isSearchOpen,
        setIsSearchOpen,
        theme,
        setTheme: handleSetTheme,
        toggleTheme,
        primaryColor,
        setPrimaryColor,
        radius,
        setRadius,
        sidebarTheme,
        setSidebarTheme,
        resetThemeConfig,
        tools,
        getToolBySlug,
        getToolByRoute,
        getToolsByCategory,
        getSeoForRoute,
        user,
        userProfile,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        updateUserProfile,
        updateUserPreferences,
        refreshUserProfile,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        logout,
        isAdmin,
        credits,
        activePlanConfig,
        creditLedger,
        refreshLedger,
        consumeCredits,
        grantCredits,
        refundCredits,
        checkCreditAvailability,
        purchaseCreditPackage,
        estimateToolCost,
        getCreditAnalytics,
        processingJobs,
        logJob,
        refreshJobs,
        presets,
        savePreset,
        refreshPresets,
        systemSettings,
        updateSystemSettings,
        featureFlags,
        isFeatureEnabled,
        adSlots,
        creditPackages,
        plans,
        userSubscriptions,
        activeSubscription,
        invoices,
        paymentProvider,
        upgradePlan,
        changePlan,
        cancelSubscription,
        resumeSubscription,
        updatePaymentMethod,
        refreshSubscriptions,
        checkExecutionAllowed,
        recordSuccessfulProcess,
        checkFileSize,
        checkBatchSize,
        checkResolution,
        checkAiQuota,
      }}
    >
      <div className={theme === 'dark' ? 'dark' : ''}>{children}</div>
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
