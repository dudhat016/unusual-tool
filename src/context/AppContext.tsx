import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { HistoryItem, UserCredits } from '../types';
import {
  UserProfile,
  PlanConfig,
  PlanTier,
  CreditLedgerRecord,
  ProcessingJobRecord,
  SavedPreset,
} from '../types/saas';
import {
  SystemSettings,
  FeatureFlag,
} from '../types/admin';
import { AdSlotConfig } from '../types/ads';
import { DEFAULT_PLANS, IPaymentProvider, MockPaymentProviderAdapter } from '../config/plans';
import { DEFAULT_SYSTEM_SETTINGS } from '../config/systemSettings';
import { DEFAULT_FEATURE_FLAGS } from '../config/featureFlags';
import { DEFAULT_AD_SLOTS } from '../config/adSlots';
import { SaaSDataService } from '../services/SaaSDataService';
import { AbusePreventionService } from '../services/AbusePreventionService';
import { TrafficProtectionService, RateLimitCheckResult } from '../services/TrafficProtectionService';

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
  toggleTheme: () => void;

  // SaaS Auth & User Profile
  user: User | null;
  userProfile: UserProfile | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'signin' | 'signup';
  setAuthModalMode: (mode: 'signin' | 'signup') => void;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  logout: () => Promise<void>;
  isAdmin: boolean;

  // SaaS Credits & Ledger
  credits: UserCredits;
  activePlanConfig: PlanConfig;
  creditLedger: CreditLedgerRecord[];
  refreshLedger: () => Promise<void>;
  consumeCredits: (amount: number, description?: string, toolId?: string, jobId?: string) => Promise<boolean>;

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

  // Subscriptions & Payment Adapter
  paymentProvider: IPaymentProvider;
  upgradePlan: (planId: PlanTier, interval?: 'monthly' | 'yearly') => Promise<boolean>;

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
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  const [creditLedger, setCreditLedger] = useState<CreditLedgerRecord[]>([]);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJobRecord[]>([]);
  const [presets, setPresets] = useState<SavedPreset[]>([]);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(DEFAULT_FEATURE_FLAGS);
  const [adSlots, setAdSlots] = useState<AdSlotConfig[]>(DEFAULT_AD_SLOTS);

  const [paymentProvider] = useState<IPaymentProvider>(() => new MockPaymentProviderAdapter());

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aetherpix_favorites');
      return saved ? JSON.parse(saved) : ['resize-image', 'compress-image', 'convert-image', 'ai-background-remover'];
    } catch {
      return ['resize-image', 'compress-image'];
    }
  });

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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load global system configs and flags
  useEffect(() => {
    const initSystem = async () => {
      try {
        const [settings, flags, ads] = await Promise.all([
          SaaSDataService.getSystemSettings(),
          SaaSDataService.getFeatureFlags(),
          SaaSDataService.getAdSlots(),
        ]);
        setSystemSettings(settings);
        setFeatureFlags(flags);
        setAdSlots(ads);
      } catch (err) {
        console.warn('Using local configuration defaults', err);
      }
    };
    initSystem();
  }, []);

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profile = await SaaSDataService.getOrCreateUserProfile(
            firebaseUser.uid,
            firebaseUser.email,
            firebaseUser.displayName,
            firebaseUser.photoURL
          );
          setUserProfile(profile);

          refreshLedger(firebaseUser.uid);
          refreshJobs(firebaseUser.uid);
          refreshPresets(firebaseUser.uid);
        } catch (err) {
          console.error('Error fetching user profile', err);
        }
      } else {
        setUserProfile(null);
        setCreditLedger([]);
        setProcessingJobs([]);
        setPresets([]);
      }
    });

    return () => unsubscribe();
  }, []);

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

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const logout = async () => {
    await signOut(auth);
    showToast('Signed out successfully.', 'info');
  };

  // Derive current plan configuration
  const currentPlanTier: PlanTier = userProfile?.plan || 'free';
  const activePlanConfig: PlanConfig = DEFAULT_PLANS[currentPlanTier] || DEFAULT_PLANS.free;

  // Credits representation
  const credits: UserCredits = {
    total: activePlanConfig.monthlyCredits,
    used: userProfile ? Math.max(0, activePlanConfig.monthlyCredits - userProfile.credits) : 0,
    plan: currentPlanTier === 'business' ? 'business' : currentPlanTier === 'pro' ? 'pro' : 'free',
    resetsAt: userProfile?.subscription?.currentPeriodEnd || Date.now() + 30 * 24 * 3600 * 1000,
  };

  const isAdmin = userProfile?.role === 'admin' || user?.email === 'unusualgamerz16@gmail.com';

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
    const ok = await SaaSDataService.updateSystemSettings(newSettings, user?.email || 'admin');
    if (ok) {
      setSystemSettings((prev) => ({ ...prev, ...newSettings }));
      showToast('System settings updated successfully', 'success');
      return true;
    }
    showToast('Failed to update system settings', 'error');
    return false;
  };

  /**
   * Consume credits with Ledger Record Enforcement
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

    const res = await SaaSDataService.executeCreditTransaction(
      user.uid,
      'usage',
      -amount,
      description,
      toolId,
      jobId
    );

    if (res.success) {
      setUserProfile((prev) => (prev ? { ...prev, credits: res.newBalance } : null));
      refreshLedger();
      return true;
    } else {
      showToast(res.error || 'Failed to process credit transaction', 'error');
      return false;
    }
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

  const upgradePlan = async (planId: PlanTier, interval: 'monthly' | 'yearly' = 'monthly'): Promise<boolean> => {
    if (!user) {
      openAuthModal('signup');
      return false;
    }

    try {
      await paymentProvider.createCheckoutSession(planId, interval, user.uid, user.email || undefined);
      const success = await SaaSDataService.updateUserPlan(user.uid, planId, 'stripe');
      if (success) {
        setUserProfile((prev) => (prev ? { ...prev, plan: planId } : null));
        showToast(`Successfully updated plan to ${DEFAULT_PLANS[planId]?.name || planId}!`, 'success');
        refreshLedger();
        return true;
      }
      return false;
    } catch {
      showToast('Payment processing error', 'error');
      return false;
    }
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

  const toggleFavorite = (toolId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId];
      try {
        localStorage.setItem('aetherpix_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const isFavorite = (toolId: string) => favorites.includes(toolId);

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

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
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
        toggleTheme,
        user,
        userProfile,
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
        paymentProvider,
        upgradePlan,
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
