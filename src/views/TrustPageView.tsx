import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ShieldCheck, Lock, Cpu, CheckCircle, Mail, HelpCircle, FileText, Globe } from 'lucide-react';

interface TrustPageViewProps {
  pageType: 'about' | 'privacy' | 'terms' | 'security' | 'contact' | 'faq';
}

export const TrustPageView: React.FC<TrustPageViewProps> = ({ pageType }) => {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: pageType.toUpperCase(), url: `/${pageType}` }
  ];

  if (pageType === 'about') {
    return (
      <div className="space-y-8 py-6 max-w-4xl mx-auto text-slate-800 dark:text-slate-200">
        <Breadcrumbs items={breadcrumbs} />
        <header className="border-b border-slate-200/80 pb-6 dark:border-slate-800">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            About AetherPix Studio
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 mt-2">
            Next-generation in-browser image utilities and creator automation engine.
          </p>
        </header>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Mission: Client-Side First</h2>
          <p>
            AetherPix Studio was built with a single objective: to replace slow, ad-cluttered, privacy-invasive online image editors with ultra-fast, 100% in-browser utilities. By leveraging HTML5 Canvas, WebAssembly, and modern Web Workers, your photos are processed directly in your device's memory without uploading files to remote servers.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <ShieldCheck className="h-6 w-6 text-emerald-500 mb-2" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">100% Client Privacy</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Zero server storage. Files stay on your machine.</p>
          </div>
          <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <Cpu className="h-6 w-6 text-blue-500 mb-2" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">WebAssembly Speed</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hardware-accelerated sub-millisecond conversions.</p>
          </div>
          <div className="p-5 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <Lock className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">No Accounts Required</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Instant free access with no logins or subscriptions.</p>
          </div>
        </div>


      </div>
    );
  }

  if (pageType === 'privacy') {
    return (
      <div className="space-y-8 py-6 max-w-4xl mx-auto text-slate-800 dark:text-slate-200">
        <Breadcrumbs items={breadcrumbs} />
        <header className="border-b border-slate-200/80 pb-6 dark:border-slate-800">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Effective Date: August 2026</p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Local In-Browser Processing (Zero Server Uploads)</h2>
          <p>
            Standard image utilities (Resize, Compress, Convert, Crop, Passport Photo, Metadata, Watermark, Border, Batch Processing) execute 100% locally inside your web browser. When you upload or drag-and-drop a file, it is loaded into your local RAM. It is never transmitted across the network or stored on any server.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4">2. AI Features & Temporary Processing</h2>
          <p>
            For specialized neural AI features (e.g. AI Background Remover, AI Upscaler), images are transmitted via encrypted HTTPS to our neural inference worker for immediate processing. Images are never retained, logged, or used for model training, and are automatically purged from memory immediately upon completion.
          </p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4">3. Cookies & Analytics</h2>
          <p>
            We do not use tracking cookies or sell your personal information. Local client-side settings (such as dark mode preferences and recent history) are stored exclusively in your browser's localStorage.
          </p>
        </section>


      </div>
    );
  }

  if (pageType === 'security') {
    return (
      <div className="space-y-8 py-6 max-w-4xl mx-auto text-slate-800 dark:text-slate-200">
        <Breadcrumbs items={breadcrumbs} />
        <header className="border-b border-slate-200/80 pb-6 dark:border-slate-800">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Security & Client-Side Architecture
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 mt-2">
            Technical breakdown of our zero-upload privacy architecture.
          </p>
        </header>

        <section className="space-y-4 text-sm sm:text-base leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Zero Trust & Local Isolation</h2>
          <p>
            AetherPix is architected from the ground up to prevent data leaks. Rather than uploading user files to backend storage buckets (S3/GCS), all decoding, rasterization, color transformation, and encoding are performed via browser APIs:
          </p>
          <ul className="space-y-2 pt-2 text-xs sm:text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>OffscreenCanvas & WebAssembly:</strong> Multi-threaded image transformations occur inside isolated browser worker sandboxes.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Memory Garbage Collection:</strong> Object URLs and pixel buffer arrays are explicitly revoked and garbage-collected upon download.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Strict Content Security Policy (CSP):</strong> Prevents unauthorized script injections and data exfiltration.</span>
            </li>
          </ul>
        </section>


      </div>
    );
  }

  if (pageType === 'terms') {
    return (
      <div className="space-y-8 py-6 max-w-4xl mx-auto text-slate-800 dark:text-slate-200">
        <Breadcrumbs items={breadcrumbs} />
        <header className="border-b border-slate-200/80 pb-6 dark:border-slate-800">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Effective Date: August 2026</p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
          <p>By using AetherPix Studio, you agree to these Terms of Service. If you do not agree, do not use our utilities.</p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4">2. Permitted Use</h2>
          <p>You may use AetherPix utilities for personal, commercial, and educational image processing. You retain 100% intellectual property ownership of all images you process.</p>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white pt-4">3. Disclaimer of Warranties</h2>
          <p>All services are provided &quot;as is&quot; without warranty of any kind. We are not liable for accidental data corruption or browser memory crashes.</p>
        </section>


      </div>
    );
  }

  if (pageType === 'contact') {
    return (
      <div className="space-y-8 py-6 max-w-3xl mx-auto text-slate-800 dark:text-slate-200">
        <Breadcrumbs items={breadcrumbs} />
        <header className="border-b border-slate-200/80 pb-6 dark:border-slate-800">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Contact & Support
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 mt-2">
            Have questions, feedback, or custom integration requests?
          </p>
        </header>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">Direct Email Inquiries</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">support@aetherpix.studio</div>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            We actively monitor feedback and release new browser tool updates weekly.
          </p>
        </div>


      </div>
    );
  }

  return null;
};
