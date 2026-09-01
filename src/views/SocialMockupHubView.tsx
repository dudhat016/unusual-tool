import React, { useState, useEffect } from 'react';
import { PLATFORMS_LIST, PLATFORM_REGISTRY } from '../config/socialMockup/platformRegistry';
import { ALL_SCENE_ROUTES, getRouteForPlatformScene, getSceneConfigByRoute } from '../config/socialMockup/sceneRegistry';
import { UniversalSocialMockupEditor } from '../components/socialMockup/UniversalSocialMockupEditor';
import { PlatformCategory, PlatformId, SceneTypeId } from '../types/socialMockup';
import { Sparkles, Search, ArrowRight } from 'lucide-react';
import { Link } from '../components/common/Link';
import { DynamicFaqAccordion } from '../components/common/DynamicFaqAccordion';
import { SUPPORTED_LOCALES } from '../i18n/config';

const LOCALE_REGEX = new RegExp(`^\\/(?:${SUPPORTED_LOCALES.join('|')})(?=\\/|$)`, 'i');

export const SocialMockupHubView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<PlatformCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-detect route parameters from window.location.pathname
  const [activePlatformId, setActivePlatformId] = useState<PlatformId | null>(() => {
    if (typeof window === 'undefined') return null;
    const rawPath = window.location.pathname;
    const routePath = rawPath.replace(LOCALE_REGEX, '');
    const config = getSceneConfigByRoute(routePath);
    return config ? config.platformId : null;
  });

  const [activeSceneType, setActiveSceneType] = useState<SceneTypeId>(() => {
    if (typeof window === 'undefined') return 'post';
    const rawPath = window.location.pathname;
    const routePath = rawPath.replace(LOCALE_REGEX, '');
    const config = getSceneConfigByRoute(routePath);
    return config ? config.sceneType : 'post';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const rawPath = window.location.pathname;
    const routePath = rawPath.replace(LOCALE_REGEX, '');
    const config = getSceneConfigByRoute(routePath);
    if (config) {
      setActivePlatformId(config.platformId);
      setActiveSceneType(config.sceneType);
    }
  }, []);

  const filteredPlatforms = PLATFORMS_LIST.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const launchEditorFor = (pId: PlatformId, sType: SceneTypeId = 'post') => {
    setActivePlatformId(pId);
    setActiveSceneType(sType);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const mockupFaqs = [
    {
      question: 'Are generated social media mockups free to use?',
      answer: 'Yes! All basic mockup generators, previews, and high-definition PNG/JPG exports are 100% free with zero watermarks.',
    },
    {
      question: 'Are my uploaded media files or mock data stored on servers?',
      answer: 'No. All images, avatars, captions, and chat messages are processed 100% locally in your browser memory for absolute privacy.',
    },
    {
      question: 'What are social media mockups used for?',
      answer: 'Social media mockups are designed for creative storytelling, marketing campaigns, film/video props, UI/UX prototypes, presentations, and educational demonstrations.',
    },
  ];

  return (
    <div className="space-y-12 py-8 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Hero Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200/60 dark:border-purple-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Platform Social Media Mockup Studio</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Create Fictional Social Media & Chat Scenes
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300">
          Design realistic post mockups, chat conversations, stories, and profiles for Instagram, WhatsApp, LinkedIn, TikTok, X, and iMessage.
        </p>
      </div>

      {/* Editor Embed if launched */}
      {activePlatformId ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Studio Editor: {PLATFORM_REGISTRY[activePlatformId].name}
            </h2>
            <button
              onClick={() => setActivePlatformId(null)}
              className="text-xs font-bold text-purple-600 hover:underline"
            >
              ← Back to Platform Catalog
            </button>
          </div>
          <UniversalSocialMockupEditor initialPlatformId={activePlatformId} initialSceneType={activeSceneType} />
        </div>
      ) : (
        <>
          {/* Search & Category Filter */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search generators (Instagram, WhatsApp...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {(['all', 'social', 'messaging', 'video', 'professional', 'community'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-bold uppercase transition-all shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Platforms Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlatforms.map((p) => (
                <div
                  key={p.id}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{p.name}</h3>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {p.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {p.supportedSceneTypes.map((st) => (
                        <Link
                          key={st}
                          href={getRouteForPlatformScene(p.id, st)}
                          onClick={(e) => {
                            if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                              e.preventDefault();
                              launchEditorFor(p.id, st);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 hover:text-purple-600 text-xs font-semibold border border-slate-200/60 dark:border-slate-700 inline-block"
                        >
                          {st.replace('_', ' ')}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={getRouteForPlatformScene(p.id)}
                    onClick={(e) => {
                      if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                        e.preventDefault();
                        launchEditorFor(p.id);
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all text-center cursor-pointer"
                  >
                    <span>Launch {p.name} Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Scene Generators Directory */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              All Generator Routes Directory
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {ALL_SCENE_ROUTES.map((sr) => (
                <Link
                  key={sr.route}
                  href={sr.route}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-900/30 border border-slate-200/60 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 flex items-center justify-between"
                >
                  <span>{sr.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              ))}
            </div>
          </div>

          {/* FAQ Accordion */}
          <DynamicFaqAccordion faqs={mockupFaqs} toolName="Social Media Mockup Studio" />
        </>
      )}
    </div>
  );
};
