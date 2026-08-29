import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider } from './i18n';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { QuickSearchModal } from './components/common/QuickSearchModal';
import { AuthModal } from './components/auth/AuthModal';

// Pages & Views
import { HomePage } from './pages/HomePage';
import { ToolPage } from './pages/ToolPage';
import { HistoryPage } from './pages/HistoryPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { CategoryPageView } from './views/CategoryPageView';
import { GuidePageView } from './views/GuidePageView';
import { TrustPageView } from './views/TrustPageView';
import { SeoAdminView } from './views/SeoAdminView';
import { UIKitCatalogView } from './views/UIKitCatalogView';
import { OnlineNotepadView } from './views/OnlineNotepadView';
import { SeoHeadUpdater } from './components/common/SeoHeadUpdater';

import { getToolByRoute, TOOLS_REGISTRY } from './config/tools';
import { getCategoryBySlug } from './config/categoryData';
import { getGuideBySlug } from './config/guidesData';
import { Wrench } from 'lucide-react';

const AppRouter: React.FC = () => {
  const { currentPath, isAuthModalOpen, setIsAuthModalOpen, authModalMode, systemSettings, isAdmin } = useApp();

  // Normalize path
  const normalizedPath = currentPath.split('?')[0].replace(/\/$/, '') || '/';

  // Maintenance mode gate (admins bypass)
  if (systemSettings.maintenanceMode && !isAdmin && normalizedPath !== '/admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center space-y-4">
        <div className="h-16 w-16 rounded-3xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
          <Wrench className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black">{systemSettings.siteName} Maintenance</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          {systemSettings.maintenanceNotice}
        </p>
      </div>
    );
  }

  // Check if route matches a registered tool
  const matchedTool = getToolByRoute(normalizedPath);

  // Check if route matches a category hub
  const matchedCategory = getCategoryBySlug(normalizedPath);

  // Check if route matches a guide
  const matchedGuide = getGuideBySlug(normalizedPath);

  const renderContent = () => {
    if (normalizedPath === '/' || normalizedPath === '/home') {
      return <HomePage />;
    }

    // UI Component Library & Design System Catalog
    if (normalizedPath === '/ui-kit' || normalizedPath === '/design-system' || normalizedPath === '/components') {
      return <UIKitCatalogView />;
    }

    // SEO Diagnostic Admin Dashboard
    if (normalizedPath === '/admin/seo' || normalizedPath === '/admin-seo' || normalizedPath === '/seo-admin') {
      return <SeoAdminView />;
    }

    if (normalizedPath === '/dashboard' || normalizedPath === '/account' || normalizedPath === '/pricing') {
      return <DashboardPage />;
    }

    if (normalizedPath === '/admin' || normalizedPath === '/admin-console') {
      return <AdminPage />;
    }

    if (normalizedPath === '/history') {
      return <HistoryPage />;
    }

    // Online Notepad Free Tool
    if (
      normalizedPath === '/online-notepad' ||
      normalizedPath === '/notepad' ||
      normalizedPath === '/notes' ||
      normalizedPath === '/free-online-notepad'
    ) {
      return <OnlineNotepadView />;
    }

    // Specific Tool Pages
    if (matchedTool) {
      return <ToolPage tool={matchedTool} />;
    }

    // Category Hub Pages
    if (matchedCategory) {
      return <CategoryPageView category={matchedCategory} />;
    }

    // Educational Guide Pages
    if (matchedGuide) {
      return <GuidePageView guide={matchedGuide} />;
    }

    // Trust & Policy Pages
    if (normalizedPath === '/about') {
      return <TrustPageView pageType="about" />;
    }
    if (normalizedPath === '/privacy') {
      return <TrustPageView pageType="privacy" />;
    }
    if (normalizedPath === '/terms') {
      return <TrustPageView pageType="terms" />;
    }
    if (normalizedPath === '/security') {
      return <TrustPageView pageType="security" />;
    }
    if (normalizedPath === '/contact') {
      return <TrustPageView pageType="contact" />;
    }

    // Fallback: Check if path matches slug directly (e.g. /resize-image)
    const toolBySlug = TOOLS_REGISTRY.find(
      (t) => `/${t.slug}` === normalizedPath || `/${t.id}` === normalizedPath
    );
    if (toolBySlug) {
      return <ToolPage tool={toolBySlug} />;
    }

    // Default 404 fallback to Home
    return <HomePage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors">
      <SeoHeadUpdater currentPath={normalizedPath} />
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>
      <Footer />
      <QuickSearchModal />
      <ToastContainer />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};

const LanguageConnectedApp: React.FC = () => {
  const { userProfile } = useApp();

  return (
    <LanguageProvider userLanguage={userProfile?.preferredLanguage || null}>
      <AppRouter />
    </LanguageProvider>
  );
};

export default function App() {
  return (
    <AppProvider>
      <LanguageConnectedApp />
    </AppProvider>
  );
}
