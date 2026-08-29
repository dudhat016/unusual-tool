import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Download,
  Clock,
  Code,
  Eye,
  AtSign,
  Hash,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Video,
  Layers,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

import { DynamicFaqAccordion } from '../common/DynamicFaqAccordion';
import { Link } from '../common/Link';

export const YouTubeToolsHub: React.FC = () => {
  const { navigate } = useApp();

  const youtubeTools = [
    {
      id: 'youtube-thumbnail-downloader',
      name: 'YouTube Thumbnail Downloader',
      description: 'Download high-definition (1280x720) YouTube thumbnails in original JPEG format instantly.',
      route: '/youtube-thumbnail-downloader',
      icon: Download,
      color: 'from-red-500 to-rose-600',
      badge: 'Popular',
    },
    {
      id: 'youtube-timestamp-link-generator',
      name: 'YouTube Timestamp Link Generator',
      description: 'Create shareable timestamp links and short youtu.be URLs starting at an exact second or minute.',
      route: '/youtube-timestamp-link-generator',
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      badge: 'Essential',
    },
    {
      id: 'youtube-embed-code-generator',
      name: 'YouTube Embed Code Generator',
      description: 'Generate responsive, GDPR-compliant (youtube-nocookie) HTML iframe embed codes with custom start times.',
      route: '/youtube-embed-code-generator',
      icon: Code,
      color: 'from-indigo-500 to-blue-600',
      badge: 'Web Tool',
    },
    {
      id: 'youtube-thumbnail-previewer',
      name: 'YouTube Thumbnail Previewer',
      description: 'Inspect and compare all 5 YouTube CDN resolution tiers (HD, SD, HQ, MQ, Default) side-by-side.',
      route: '/youtube-thumbnail-previewer',
      icon: Eye,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Inspector',
    },
    {
      id: 'youtube-channel-id-finder',
      name: 'YouTube Channel ID Finder',
      description: 'Convert modern @handles, custom URLs, and channel links into canonical 24-character Channel IDs.',
      route: '/youtube-channel-id-finder',
      icon: AtSign,
      color: 'from-emerald-500 to-teal-600',
      badge: 'Fast API',
    },
    {
      id: 'youtube-tag-extractor',
      name: 'YouTube Tag Extractor',
      description: 'Extract video SEO tags, hidden keywords, and competitor metadata with one-click TXT & CSV exports.',
      route: '/youtube-tag-extractor',
      icon: Hash,
      color: 'from-rose-500 to-pink-600',
      badge: 'SEO Suite',
    },
  ];

  const faqs = [
    {
      q: 'Are these YouTube tools completely free to use?',
      a: 'Yes! All utilities in the YouTube Tools Suite are 100% free with no registration required.',
    },
    {
      q: 'How does the thumbnail downloader achieve maximum quality?',
      a: 'We directly query the official YouTube high-definition CDN (maxresdefault.jpg) to fetch uncompressed 1280×720 master thumbnails uploaded by creators.',
    },
    {
      q: 'What is privacy-enhanced mode in the Embed Generator?',
      a: 'Privacy-enhanced mode switches the iframe domain to youtube-nocookie.com, preventing YouTube from storing cookies on your visitors’ browsers until they actively play the video.',
    },
    {
      q: 'How does the Channel ID Finder handle new @handles?',
      a: 'Our server layer queries the YouTube Data API and analyzes canonical channel metadata to instantly resolve any handle (e.g. @mkbhd) into its true canonical UC... ID.',
    },
  ];

  return (
    <div className="space-y-16 py-4 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-200/80 bg-red-50/80 px-4 py-1.5 text-xs font-bold text-red-700 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-300 shadow-2xs">
          <Video className="h-4 w-4 text-red-600" />
          <span>Professional YouTube Tools Suite</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          YouTube Tools
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Free YouTube tools for thumbnails, timestamps, embeds, channel IDs, and video tags.
        </p>

        {/* Quick Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-left">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Quality</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">HD MaxRes (720p)</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Privacy</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">No Cookies Option</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Exports</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">JPG, CSV, TXT</span>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Speed</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">Instant Results</span>
          </div>
        </div>
      </section>

      {/* 6-Card YouTube Tools Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Explore YouTube Utilities
          </h2>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">6 Powerful Tools</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {youtubeTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.route}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-lg hover:shadow-xl hover:border-red-400/80 dark:hover:border-red-900 transition-all cursor-pointer overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${tool.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {tool.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="pt-6 flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 group-hover:translate-x-1 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FAQs Section */}
      <DynamicFaqAccordion
        faqs={faqs}
        subtitle="Everything you need to know about our YouTube utility suite."
        className="max-w-4xl mx-auto pt-8 border-t border-slate-200/80 dark:border-slate-800"
      />
    </div>
  );
};
