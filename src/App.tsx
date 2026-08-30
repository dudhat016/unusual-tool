import React, { lazy, Suspense, useEffect } from 'react';
import { AuthModal } from './components/auth/AuthModal';
import { CustomizerDrawer } from './components/common/CustomizerDrawer';
import { Footer } from './components/common/Footer';
import { Header } from './components/common/Header';
import { QuickSearchModal } from './components/common/QuickSearchModal';
import { SeoHeadUpdater } from './components/common/SeoHeadUpdater';
import { ToastContainer } from './components/common/ToastContainer';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider } from './i18n';

// Core sync pages
import { HomePage } from './pages/HomePage';
import { ToolPage } from './pages/ToolPage';

// Lazy-loaded route components for code splitting & faster bundle loading
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })));
const CategoryPageView = lazy(() => import('./views/CategoryPageView').then((m) => ({ default: m.CategoryPageView })));
const TrustPageView = lazy(() => import('./views/TrustPageView').then((m) => ({ default: m.TrustPageView })));
const UIKitCatalogView = lazy(() => import('./views/UIKitCatalogView').then((m) => ({ default: m.UIKitCatalogView })));
const BlogHubView = lazy(() => import('./views/BlogHubView').then((m) => ({ default: m.BlogHubView })));
const BlogPostView = lazy(() => import('./views/BlogPostView').then((m) => ({ default: m.BlogPostView })));
const NotFoundView = lazy(() => import('./views/NotFoundView').then((m) => ({ default: m.NotFoundView })));

const RouteLoadingSpinner: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center space-y-3">
    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
    <p className="text-xs font-semibold text-slate-500 animate-pulse">Loading view...</p>
  </div>
);

import { Wrench } from 'lucide-react';
import { DynamicCategoryService } from './services/DynamicCategoryService';
import { useTranslation } from './i18n';

const SUPPORTED_LOCALES = ['en', 'hi', 'es', 'fr', 'de', 'pt', 'it', 'ja', 'ko', 'zh', 'ar'];

const AppRouter: React.FC = () => {
  const { currentPath, isAuthModalOpen, setIsAuthModalOpen, authModalMode, systemSettings, isAdmin, getToolByRoute, getToolBySlug } = useApp();
  const { setLanguage, language } = useTranslation();

  // Normalize path and extract locale prefix (e.g. /es/compress-image -> locale: 'es', path: '/compress-image')
  const rawPath = currentPath.split('?')[0].replace(/\/$/, '') || '/';
  const pathSegments = rawPath.split('/').filter(Boolean);
  const firstSegment = pathSegments[0] || '';
  const isLocalePrefix = SUPPORTED_LOCALES.includes(firstSegment.toLowerCase());
  const activeUrlLocale = isLocalePrefix ? firstSegment.toLowerCase() : 'en';

  const normalizedPath = (isLocalePrefix
    ? '/' + pathSegments.slice(1).join('/')
    : rawPath).replace(/\/$/, '') || '/';

  // Sync i18n language state with URL locale prefix & auto-prefix address bar
  useEffect(() => {
    if (isLocalePrefix) {
      if (language !== activeUrlLocale) {
        setLanguage(activeUrlLocale as any);
      }
    } else {
      const lang = language || 'en';
      const targetPath = `/${lang}${rawPath === '/' ? '' : rawPath}`;
      window.history.replaceState({}, '', targetPath);
    }
  }, [isLocalePrefix, activeUrlLocale, language, setLanguage, rawPath]);

  // Scroll to top on route navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [currentPath]);

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
  const matchedCategory = DynamicCategoryService.getCategoryBySlug(normalizedPath);

  const renderContent = () => {
    if (normalizedPath === '/') {
      return <HomePage />;
    }

    if (
      normalizedPath === '/dashboard' ||
      normalizedPath.startsWith('/dashboard/')
    ) {
      return <DashboardPage />;
    }

    if (
      normalizedPath === '/admin' ||
      normalizedPath.startsWith('/admin/')
    ) {
      return <AdminPage />;
    }



    // Specific Tool Pages
    if (matchedTool) {
      return <ToolPage tool={matchedTool} />;
    }

    // Category Hub Pages
    if (matchedCategory) {
      return <CategoryPageView category={matchedCategory} />;
    }

    // Dynamic Parametric Target Size Tool Route Matcher (e.g. /compress-image-to-15kb, /compress-jpg-to-2mb)
    const isTargetSizeRoute = /^\/(compress|resize)-(image|jpeg|jpg|png|webp|avif|pdf)?-?(?:between-)?(\d+)?(?:kb|mb)?(?:-to-)?(\d+)(kb|mb|px)$/i.test(normalizedPath);
    if (isTargetSizeRoute) {
      const compressTool = getToolByRoute('/compress-image') || getToolByRoute('/compress') || getToolBySlug('compress');
      if (compressTool) {
        return <ToolPage tool={compressTool} />;
      }
    }

    // Blog Directory & Article Detail Views
    if (
      normalizedPath === '/blog' ||
      normalizedPath === '/blogs' ||
      normalizedPath.startsWith('/blog/category/') ||
      normalizedPath.startsWith('/blog/tag/') ||
      normalizedPath.startsWith('/blog/author/')
    ) {
      return <BlogHubView />;
    }

    if (normalizedPath.startsWith('/blog/') || normalizedPath.startsWith('/blogs/')) {
      const blogSlug = normalizedPath.replace(/^\/blogs?\//, '');
      return <BlogPostView slug={blogSlug} />;
    }

    if (normalizedPath.startsWith('/guides/')) {
      const guideSlug = normalizedPath.replace(/^\/guides\//, '');
      return <BlogPostView slug={guideSlug} />;
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
    const toolBySlug = getToolBySlug(normalizedPath);
    if (toolBySlug) {
      return <ToolPage tool={toolBySlug} />;
    }

    // Catch-All 404 Not Found Page
    return <NotFoundView path={normalizedPath} />;
  };

  const isFullAppLayout =
    normalizedPath.startsWith('/admin') ||
    normalizedPath.startsWith('/seo-admin') ||
    normalizedPath.startsWith('/dashboard');

  if (isFullAppLayout) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors">
        <SeoHeadUpdater currentPath={normalizedPath} />
        <Suspense fallback={<RouteLoadingSpinner />}>
          {renderContent()}
        </Suspense>
        <ToastContainer />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialMode={authModalMode}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors">
      <SeoHeadUpdater currentPath={normalizedPath} />
      <Header />
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<RouteLoadingSpinner />}>
          {renderContent()}
        </Suspense>
      </main>
      <Footer />
      <QuickSearchModal />
      <ToastContainer />
      <CustomizerDrawer />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
};

const LanguageConnectedApp: React.FC = () => {
  const { userProfile, updateUserProfile } = useApp();

  return (
    <LanguageProvider
      userLanguage={userProfile?.preferredLanguage || null}
      onLanguagePersist={(lang) => {
        if (userProfile && userProfile.preferredLanguage !== lang) {
          updateUserProfile({ preferredLanguage: lang });
        }
      }}
    >
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
