import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Check,
  CheckCircle2,
  Database,
  Eye,
  Globe,
  HardDrive,
  Info,
  Layers,
  Lock,
  Mail,
  Moon,
  Palette,
  Power,
  RefreshCw,
  RotateCcw,
  Save,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  Sparkles,
  Sun,
  Wrench,
  Zap
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Switch } from '../components/ui/Switch';
import { DEFAULT_SYSTEM_SETTINGS } from '../config/systemSettings';
import { useApp } from '../context/AppContext';
import { SaaSDataService } from '../services/SaaSDataService';
import { SystemSettings } from '../types/admin';
import { PlanTier } from '../types/saas';
import { PRIMARY_COLOR_PRESETS, RADIUS_PRESETS, FONT_PRESETS, resolvePrimaryHsl, applyGlobalThemeVariables } from '../utils/themeHelper';

export const AdminSettingsView: React.FC = () => {
  const {
    user,
    isAdmin,
    systemSettings: globalSettings,
    updateSystemSettings,
    showToast,
    navigate,
    currentPath,
    tools
  } = useApp();

  const getSectionFromUrl = (): 'general' | 'theme' | 'maintenance' | 'traffic' | 'monetization' | 'emergency' | 'preview' => {
    if (typeof window === 'undefined') return 'general';
    const params = new URLSearchParams(window.location.search);
    const sec = params.get('section') || params.get('tab');
    if (sec && ['general', 'theme', 'maintenance', 'traffic', 'monetization', 'emergency', 'preview'].includes(sec)) {
      return sec as any;
    }
    const cleanPath = (window.location.pathname.replace(/\/$/, '') || '/').replace(/^\/(en|hi|es|fr|de|pt|it|ja|ko|zh|ar)/i, '') || '/';
    const segments = cleanPath.split('/').filter(Boolean);
    if (segments[0] === 'admin' && segments[1] === 'settings' && segments[2]) {
      const sub = segments[2];
      if (['general', 'theme', 'maintenance', 'traffic', 'monetization', 'emergency', 'preview'].includes(sub)) {
        return sub as any;
      }
    }
    return 'general';
  };

  // Local form state initialized with current system settings
  const [formData, setFormData] = useState<SystemSettings>(() => ({
    ...DEFAULT_SYSTEM_SETTINGS,
    ...globalSettings
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'theme' | 'maintenance' | 'traffic' | 'monetization' | 'emergency' | 'preview'>(getSectionFromUrl);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);

  // Sync active tab whenever URL route changes
  useEffect(() => {
    const section = getSectionFromUrl();
    setActiveTab(section);
  }, [currentPath]);

  const handleTabSelect = (tab: 'general' | 'theme' | 'maintenance' | 'traffic' | 'monetization' | 'emergency' | 'preview') => {
    setActiveTab(tab);
    navigate(`/admin/settings?section=${tab}`);
  };

  // Sync form data whenever global settings update from Firestore
  useEffect(() => {
    if (globalSettings) {
      setFormData((prev) => ({
        ...DEFAULT_SYSTEM_SETTINGS,
        ...globalSettings,
        // Retain any fields if previously populated
        allowedMaintenanceToolIds: globalSettings.allowedMaintenanceToolIds || []
      }));
    }
  }, [globalSettings]);

  // Load fresh settings directly from the Firestore 'system_settings' collection
  const fetchFreshSettings = async () => {
    setIsLoading(true);
    try {
      const fresh = await SaaSDataService.getSystemSettings();
      setFormData({
        ...DEFAULT_SYSTEM_SETTINGS,
        ...fresh,
        allowedMaintenanceToolIds: fresh.allowedMaintenanceToolIds || []
      });
      showToast('Loaded latest settings from Firestore system_settings document.', 'info');
    } catch {
      showToast('Failed to fetch settings from Firestore.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if form has unsaved modifications
  const isDirty = useMemo(() => {
    if (!globalSettings) return false;
    return JSON.stringify(formData) !== JSON.stringify({
      ...DEFAULT_SYSTEM_SETTINGS,
      ...globalSettings,
      allowedMaintenanceToolIds: globalSettings.allowedMaintenanceToolIds || []
    });
  }, [formData, globalSettings]);

  const handleTextChange = (field: keyof SystemSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberChange = (field: keyof SystemSettings, value: string) => {
    const parsed = parseInt(value, 10);
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(parsed) ? 0 : parsed
    }));
  };

  const handleToggleToolMaintenance = (toolId: string) => {
    setFormData((prev) => {
      const current = prev.allowedMaintenanceToolIds || [];
      const updated = current.includes(toolId)
        ? current.filter((id) => id !== toolId)
        : [...current, toolId];
      return {
        ...prev,
        allowedMaintenanceToolIds: updated
      };
    });
  };

  // Save changes directly to the Firestore 'system_settings' document
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isAdmin) {
      showToast('Unauthorized. Administrator permissions required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const success = await updateSystemSettings(formData);
      if (success) {
        setLastSavedTime(Date.now());
        showToast('System configuration saved directly to Firestore (system_settings/global).', 'success');
      } else {
        showToast('Failed to save system settings to Firestore.', 'error');
      }
    } catch (error) {
      console.error('Error saving settings to Firestore:', error);
      showToast('Error committing settings to Firestore document.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all form fields to system defaults? (Click Save afterwards to write to Firestore)')) {
      setFormData({ ...DEFAULT_SYSTEM_SETTINGS });
      showToast('Form reset to default parameters.', 'info');
    }
  };

  const handleRevertChanges = () => {
    setFormData({
      ...DEFAULT_SYSTEM_SETTINGS,
      ...globalSettings,
      allowedMaintenanceToolIds: globalSettings.allowedMaintenanceToolIds || []
    });
    showToast('Reverted modifications to current active configuration.', 'info');
  };

  // Unauthenticated or non-admin view
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 text-center space-y-4 shadow-xl">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 mx-auto">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Access Restricted</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          You must be an authenticated administrator to update system settings and configure Firestore system_settings.
        </p>
        <Button
          onClick={() => navigate('/')}
          className="w-full"
          size="sm"
        >
          Return to Platform
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-12">
      {/* Top Banner & Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-slate-50 to-purple-500/5 dark:from-slate-900/80 dark:via-slate-900/40 dark:to-slate-950 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <Settings className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              System Configuration
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Database className="h-3 w-3" />
              system_settings/global
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
            Manage global platform properties, brand details, traffic rate limits, and real-time maintenance mode directly in the Firestore database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchFreshSettings}
            disabled={isLoading || isSaving}
            leftIcon={RefreshCw}
            className={isLoading ? 'animate-pulse' : ''}
          >
            {isLoading ? 'Syncing...' : 'Reload from DB'}
          </Button>

          {isDirty && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevertChanges}
              disabled={isSaving}
              leftIcon={RotateCcw}
            >
              Revert
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSaveSettings()}
            disabled={isSaving}
            leftIcon={isSaving ? RefreshCw : Save}
            className={`shadow-md shadow-primary/20 ${isDirty ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900' : ''}`}
          >
            {isSaving ? 'Saving to Firestore...' : 'Save to Firestore'}
          </Button>
        </div>
      </div>

      {/* Maintenance Mode Alert Callout (If active) */}
      {formData.maintenanceMode && (
        <div className="p-4 rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-start gap-3.5 shadow-sm">
          <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
            <Wrench className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100">
                Maintenance Mode is Currently ACTIVE
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white uppercase tracking-wider">
                Live Outage
              </span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
              Non-admin visitors are currently redirected to the maintenance notice screen. Authenticated administrators can still navigate the console.
            </p>
            <p className="text-xs font-mono bg-amber-100 dark:bg-amber-900/60 p-2 rounded-lg mt-2 text-amber-950 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60">
              Notice: "{formData.maintenanceNotice}"
            </p>
          </div>
        </div>
      )}

      {/* Dirty Changes Floating Alert Banner */}
      {isDirty && (
        <div className="p-3 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>You have unsaved changes that have not been written to the Firestore <code>system_settings</code> document.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRevertChanges}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold underline cursor-pointer"
            >
              Discard
            </button>
            <button
              onClick={() => handleSaveSettings()}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Save Now
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2 scrollbar-none">
        <button
          onClick={() => handleTabSelect('general')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'general'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>General & Branding</span>
        </button>

        <button
          onClick={() => handleTabSelect('theme')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'theme'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>Theme & Accent Colors</span>
        </button>

        <button
          onClick={() => handleTabSelect('maintenance')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'maintenance'
              ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
              : formData.maintenanceMode
              ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Wrench className="h-4 w-4" />
          <span>Maintenance Mode</span>
          {formData.maintenanceMode && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => handleTabSelect('traffic')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'traffic'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>Rate Limits & Quotas</span>
        </button>

        <button
          onClick={() => handleTabSelect('emergency')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'emergency'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Emergency Killswitches</span>
        </button>

        <button
          onClick={() => handleTabSelect('monetization')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'monetization'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Monetization & Analytics</span>
        </button>

        <button
          onClick={() => handleTabSelect('preview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Eye className="h-4 w-4" />
          <span>Live Visitor Preview</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        {/* ================= 1. GENERAL & BRANDING ================= */}
        {activeTab === 'general' && (
          <Card className="p-6 space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Platform Branding & Defaults
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Core identity variables used across headers, transactional emails, and meta titles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Site Name / Brand Title <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={formData.siteName}
                  onChange={(e) => handleTextChange('siteName', e.target.value)}
                  placeholder="e.g. AetherPix Studio"
                  required
                />
                <p className="text-[11px] text-slate-400">
                  Displayed in navigation bars, browser window titles, and legal footers.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Canonical Base URL <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={formData.siteUrl}
                  onChange={(e) => handleTextChange('siteUrl', e.target.value)}
                  placeholder="https://aetherpix.studio"
                  required
                />
                <p className="text-[11px] text-slate-400">
                  Root domain for sitemaps, OpenGraph tags, and canonical links.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Support Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    value={formData.supportEmail}
                    onChange={(e) => handleTextChange('supportEmail', e.target.value)}
                    placeholder="support@aetherpix.studio"
                    type="email"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Contact address for billing inquiries and user support links.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Custom Logo URL (Optional)
                </label>
                <Input
                  value={formData.logoUrl || ''}
                  onChange={(e) => handleTextChange('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.svg"
                />
                <p className="text-[11px] text-slate-400">
                  Direct image URL to replace the default vector logo symbol.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Default Billing Currency
                </label>
                <select
                  value={formData.defaultCurrency}
                  onChange={(e) => handleTextChange('defaultCurrency', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="CAD">CAD ($ - Canadian Dollar)</option>
                  <option value="AUD">AUD ($ - Australian Dollar)</option>
                  <option value="JPY">JPY (¥ - Japanese Yen)</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Currency representation for pricing tables and checkout sessions.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Default New User Plan Tier
                </label>
                <select
                  value={formData.defaultPlan}
                  onChange={(e) => handleTextChange('defaultPlan', e.target.value as PlanTier)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="free">Free Tier (50 daily credits)</option>
                  <option value="starter">Starter Tier</option>
                  <option value="pro">Pro Tier</option>
                  <option value="enterprise">Enterprise Tier</option>
                </select>
                <p className="text-[11px] text-slate-400">
                  Initial subscription tier automatically assigned to new registrations.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ================= THEME & ACCENT COLORS ================= */}
        {activeTab === 'theme' && (
          <Card className="p-6 space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    Global Theme & Brand Accent Configuration
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Configure the platform default theme mode, primary brand palette, corner radius, and sidebar styling synchronized in real-time to all connected users.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  Real-time Firestore Sync
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Controls */}
              <div className="space-y-6">
                {/* 1. Default Appearance Mode */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Default Appearance Mode
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleTextChange('theme', 'dark')}
                      className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer ${
                        (formData.theme || 'dark') === 'dark'
                          ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary/50'
                      }`}
                    >
                      <Moon className="w-5 h-5 text-indigo-400" />
                      <span>Obsidian Dark</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTextChange('theme', 'light')}
                      className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer ${
                        formData.theme === 'light'
                          ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary/50'
                      }`}
                    >
                      <Sun className="w-5 h-5 text-amber-500" />
                      <span>Light Mode</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTextChange('theme', 'system')}
                      className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer ${
                        formData.theme === 'system'
                          ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary/50'
                      }`}
                    >
                      <Globe className="w-5 h-5 text-emerald-500" />
                      <span>System Match</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Determines the default color mode for guests and initial visitor sessions.
                  </p>
                </div>

                {/* 2. Global Primary & Accent Palette */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Primary Brand & Accent Color
                    </label>
                    <span className="text-xs font-mono font-bold text-primary">
                      {formData.primaryColor || formData.accentColor || 'purple'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {PRIMARY_COLOR_PRESETS.map((preset) => {
                      const selectedColor = formData.primaryColor || formData.accentColor || 'purple';
                      const isSelected = selectedColor.toLowerCase() === preset.id.toLowerCase();
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            handleTextChange('primaryColor', preset.id);
                            handleTextChange('accentColor', preset.id);
                          }}
                          className={`flex items-center gap-2 p-2.5 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-slate-900 dark:text-white shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full shrink-0 shadow-xs flex items-center justify-center text-white text-[10px]"
                            style={{ backgroundColor: preset.hex }}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </span>
                          <span className="truncate">{preset.label.split(' ')[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-2">
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Or Custom Accent Hex Code (e.g. #8B5CF6, #3B82F6, #10B981)
                    </label>
                    <Input
                      value={formData.primaryColor || formData.accentColor || ''}
                      onChange={(e) => {
                        handleTextChange('primaryColor', e.target.value);
                        handleTextChange('accentColor', e.target.value);
                      }}
                      placeholder="e.g. #8B5CF6 or purple"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Synchronizes CSS variables <code>--primary</code>, <code>--ring</code>, <code>--accent</code>, and <code>--accent-foreground</code> across the whole app.
                  </p>
                </div>

                {/* 3. Global Border Radius */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Default Border Radius
                    </label>
                    <span className="text-xs font-mono font-bold text-primary">
                      {formData.radius ?? 8}px
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {RADIUS_PRESETS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleTextChange('radius', r)}
                        className={`flex-1 h-10 border-2 font-mono font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                          (formData.radius ?? 8) === r
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary'
                        }`}
                        style={{ borderRadius: `${r}px` }}
                      >
                        {r}px
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Controls the global CSS variable <code>--radius</code> used for buttons, inputs, and cards.
                  </p>
                </div>

                {/* 4. Sidebar Theme */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Sidebar Navigation Styling
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['default', 'dark', 'light', 'gradient'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleTextChange('sidebarTheme', st)}
                        className={`py-2 rounded-xl border-2 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          (formData.sidebarTheme || 'dark') === st
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Typography & Font Family Stacks */}
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Typography & Font Family (Google Fonts)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FONT_PRESETS.map((font) => {
                      const isSelected = (formData.fontFamily || 'Inter').toLowerCase() === font.name.toLowerCase() || (formData.fontFamily || 'Inter').toLowerCase() === font.id.toLowerCase();
                      return (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => {
                            handleTextChange('fontFamily', font.name);
                            if (font.category === 'display') {
                              handleTextChange('fontDisplay', font.name);
                            }
                          }}
                          className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-slate-900 dark:text-white shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-xs font-bold truncate" style={{ fontFamily: font.cssValue }}>
                            {font.name}
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                            {font.category}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Branding & Assets */}
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Brand Assets & Taglines
                  </label>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Brand Logo URL
                      </label>
                      <Input
                        value={formData.logoUrl || ''}
                        onChange={(e) => handleTextChange('logoUrl', e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Favicon URL (.ico, .png, .svg)
                      </label>
                      <Input
                        value={formData.faviconUrl || ''}
                        onChange={(e) => handleTextChange('faviconUrl', e.target.value)}
                        placeholder="https://example.com/favicon.ico"
                      />
                    </div>
                  </div>
                </div>

                {/* 7. Custom CSS Root Injection */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Custom CSS Override Rules
                  </label>
                  <textarea
                    value={formData.customCss || ''}
                    onChange={(e) => handleTextChange('customCss', e.target.value)}
                    rows={3}
                    placeholder=":root { --custom-accent: #8b5cf6; }"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-[11px] text-slate-400">
                    Directly injected into document header as dynamic stylesheet.
                  </p>
                </div>
              </div>

              {/* Right Column: Live Design Token Preview */}
              <div className="space-y-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-6">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Live Token & Component Preview
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Mode: {formData.theme || 'dark'}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Sample Buttons */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-500">Buttons & Actions</span>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md shadow-primary/20 hover:opacity-90"
                      >
                        Primary Action
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 border border-primary/20"
                      >
                        Subtle Primary
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Secondary Outline
                      </button>
                    </div>
                  </div>

                  {/* Sample Card */}
                  <div className="p-4 rounded-2xl border border-primary/20 bg-white dark:bg-slate-900 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Interactive Card Item</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        Active Badge
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      When saved to Firestore <code>system_settings/global</code>, these visual tokens update in real-time without requiring any page reload.
                    </p>
                  </div>

                  {/* Sample CSS Variable Values */}
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-1 border border-slate-200 dark:border-slate-800">
                    <div>--primary: <span className="text-primary font-bold">{resolvePrimaryHsl(formData.primaryColor || formData.accentColor, formData.theme !== 'light').primaryHsl}</span></div>
                    <div>--radius: <span className="text-primary font-bold">{formData.radius ?? 8}px</span></div>
                    <div>--font-sans: <span className="text-primary font-bold">{formData.fontFamily || 'Inter'}</span></div>
                    <div>--sidebar: <span className="text-primary font-bold">{formData.sidebarTheme || 'dark'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ================= 2. MAINTENANCE MODE & OUTAGE CONTROLS ================= */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <Card className="p-6 space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-amber-500" />
                    Global Maintenance Lock & Outage Screen
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Instantly protect database integrity during migrations by putting the platform into maintenance mode.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${formData.maintenanceMode ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`}>
                    {formData.maintenanceMode ? 'ACTIVE (LOCKED)' : 'DISABLED (NORMAL)'}
                  </span>
                  <Switch
                    checked={formData.maintenanceMode}
                    onChange={(checked) => handleTextChange('maintenanceMode', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Visitor Outage Message Notice <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.maintenanceNotice}
                    onChange={(e) => handleTextChange('maintenanceNotice', e.target.value)}
                    placeholder="Describe the maintenance window, expected duration, and support instructions..."
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400">
                    This message will be rendered with the site maintenance headline to all public visitors.
                  </p>
                </div>

                {/* Live Notice Preview Box */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                    <span className="font-mono flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-amber-400" />
                      Live Visitor Screen Preview
                    </span>
                    <span className="text-amber-400 font-semibold">Rendered at /</span>
                  </div>
                  <div className="py-4 text-center space-y-2">
                    <div className="inline-flex h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-400 items-center justify-center">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      {formData.siteName || 'AetherPix Studio'} Maintenance
                    </h4>
                    <p className="text-xs text-slate-400 max-w-lg mx-auto">
                      {formData.maintenanceNotice || 'Undergoing scheduled maintenance. Please check back shortly.'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Allowed Tools During Maintenance */}
            <Card className="p-6 space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  Whitelisted Tools (Bypass Maintenance Mode)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select specific offline or read-only tools that remain operational for users even while maintenance mode is active.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tools.map((t) => {
                  const isWhitelisted = (formData.allowedMaintenanceToolIds || []).includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleToggleToolMaintenance(t.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isWhitelisted
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold truncate">{t.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{t.route}</p>
                      </div>
                      <div className={`h-5 w-5 rounded-lg flex items-center justify-center shrink-0 ${
                        isWhitelisted ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-700'
                      }`}>
                        {isWhitelisted && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* ================= 3. RATE LIMITS & QUOTAS ================= */}
        {activeTab === 'traffic' && (
          <Card className="p-6 space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Traffic Protection, Limits & Free Quotas
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure visitor rate limiting, file size barriers, and anonymous abuse prevention metrics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Anonymous Daily Job Limit
                </label>
                <Input
                  type="number"
                  min={0}
                  max={200}
                  value={formData.anonymousDailyLimit}
                  onChange={(e) => handleNumberChange('anonymousDailyLimit', e.target.value)}
                />
                <p className="text-[11px] text-slate-400">
                  Max number of image/PDF operations a guest can execute per calendar day.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Registered Free User Daily Limit
                </label>
                <Input
                  type="number"
                  min={0}
                  max={1000}
                  value={formData.registeredFreeDailyLimit}
                  onChange={(e) => handleNumberChange('registeredFreeDailyLimit', e.target.value)}
                />
                <p className="text-[11px] text-slate-400">
                  Daily job limit for authenticated users on the standard Free tier.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Anonymous Max File Size (MB)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  value={formData.anonymousMaxFileSizeMB}
                  onChange={(e) => handleNumberChange('anonymousMaxFileSizeMB', e.target.value)}
                />
                <p className="text-[11px] text-slate-400">
                  Cap on individual file uploads for unauthenticated visitors.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Anonymous Max Batch Count
                </label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={formData.anonymousMaxBatch}
                  onChange={(e) => handleNumberChange('anonymousMaxBatch', e.target.value)}
                />
                <p className="text-[11px] text-slate-400">
                  Maximum simultaneous files allowed in a single multi-file batch.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Standard Rate Limit (Req/min)
                </label>
                <Input
                  type="number"
                  min={5}
                  max={300}
                  value={formData.rateLimitNormalReqPerMin}
                  onChange={(e) => handleNumberChange('rateLimitNormalReqPerMin', e.target.value)}
                />
                <p className="text-[11px] text-slate-400">
                  Client-side throttling threshold for standard tool executions.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  AI Generation Rate Limit (Req/min)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={formData.rateLimitAiReqPerMin}
                  onChange={(e) => handleNumberChange('rateLimitAiReqPerMin', e.target.value)}
                />
                <p className="text-[11px] text-slate-400">
                  Strict throttling for high-cost AI Gemini models & background removal.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ================= 4. EMERGENCY KILLSWITCHES ================= */}
        {activeTab === 'emergency' && (
          <Card className="p-6 space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertOctagon className="h-5 w-5" />
                Emergency Operations & Killswitches
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Rapid mitigation toggles to halt resource exhaustion or API quota spikes instantly.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Emergency AI Kill Switch</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Instantly disable all AI operations across tools (Background Remover, Upscaler, Vectorizer).
                  </p>
                </div>
                <Switch
                  checked={formData.emergencyAiDisabled}
                  onChange={(checked) => handleTextChange('emergencyAiDisabled', checked)}
                />
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-500" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Emergency Batch Kill Switch</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Disallow multi-file batch uploads, restricting processing to single-file queue only.
                  </p>
                </div>
                <Switch
                  checked={formData.emergencyBatchDisabled}
                  onChange={(checked) => handleTextChange('emergencyBatchDisabled', checked)}
                />
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">Strict Emergency Rate Throttling</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Temporarily cut all guest rate limits by 50% during heavy DDOS or viral spikes.
                  </p>
                </div>
                <Switch
                  checked={formData.emergencyLimitsReduced}
                  onChange={(checked) => handleTextChange('emergencyLimitsReduced', checked)}
                />
              </div>
            </div>
          </Card>
        )}

        {/* ================= 5. MONETIZATION & ANALYTICS ================= */}
        {activeTab === 'monetization' && (
          <Card className="p-6 space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Monetization, AdSense & Google Analytics 4
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage global tracking identifiers and anti-adblock notifications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Google Analytics 4 Measurement ID
                </label>
                <Input
                  value={formData.googleAnalyticsId || ''}
                  onChange={(e) => handleTextChange('googleAnalyticsId', e.target.value)}
                  placeholder="e.g. G-XXXXXXXXXX"
                />
                <p className="text-[11px] text-slate-400">
                  Injected into the header tag for real-time visitor telemetry and tool tracking.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Google AdSense Publisher Client ID
                </label>
                <Input
                  value={formData.googleAdsClient || ''}
                  onChange={(e) => handleTextChange('googleAdsClient', e.target.value)}
                  placeholder="e.g. ca-pub-XXXXXXXXXXXXXXXX"
                />
                <p className="text-[11px] text-slate-400">
                  Publisher client code for banner and sidebar ad slots.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Anti-Adblocker Notice Prompt</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Displays a polite banner requesting visitors to disable adblockers or subscribe to Pro.
                </p>
              </div>
              <Switch
                checked={formData.adBlockNoticeEnabled}
                onChange={(checked) => handleTextChange('adBlockNoticeEnabled', checked)}
              />
            </div>
          </Card>
        )}

        {/* ================= 6. LIVE VISITOR PREVIEW ================= */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <Card className="p-6 space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-primary" />
                    Live System Branding & Header Simulation
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time visual demonstration of how your configured values appear to end-users.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Reactive Preview
                </span>
              </div>

              {/* Simulated Navigation Bar */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 text-[11px] text-slate-500 font-mono flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                  </div>
                  <span className="truncate">{formData.siteUrl || 'https://aetherpix.studio'}</span>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary to-purple-500 text-white flex items-center justify-center font-black text-sm shadow-sm">
                      {formData.siteName?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {formData.siteName || 'AetherPix Studio'}
                      </span>
                      <span className="text-[10px] text-primary ml-2 font-bold px-2 py-0.5 rounded-full bg-primary/10">
                        {formData.defaultPlan.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      Support: <span className="text-slate-700 dark:text-slate-300 font-medium">{formData.supportEmail}</span>
                    </span>
                    <button className="px-3 py-1 bg-primary text-white rounded-lg text-xs font-bold shadow-xs">
                      Sign In
                    </button>
                  </div>
                </div>
              </div>

              {/* Maintenance State Indicator */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Platform Accessibility:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    formData.maintenanceMode
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {formData.maintenanceMode ? 'Locked (Maintenance Screen Active)' : 'Publicly Accessible'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Whitelisted Bypassed Tools:</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {(formData.allowedMaintenanceToolIds || []).length} tool(s) active
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom Save & Actions Footer Bar */}
      <div className="sticky bottom-4 z-20 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Database className="h-4 w-4 text-emerald-500" />
          <span>
            Target: <code className="text-slate-800 dark:text-slate-200 font-mono font-semibold">firestore.system_settings.global</code>
          </span>
          {lastSavedTime && (
            <span className="text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-1 ml-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Saved at {new Date(lastSavedTime).toLocaleTimeString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetToDefaults}
            disabled={isSaving}
          >
            Reset Defaults
          </Button>

          {isDirty && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRevertChanges}
              disabled={isSaving}
            >
              Revert
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSaveSettings()}
            disabled={isSaving}
            leftIcon={isSaving ? RefreshCw : Save}
            className="shadow-md shadow-primary/20"
          >
            {isSaving ? 'Writing to Firestore...' : 'Save Configuration'}
          </Button>
        </div>
      </div>
    </div>
  );
};
