import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Switch } from '../ui/Switch';
import { Input, NumberInput } from '../ui';
import {
  parseYouTubeUrl,
  generateIframeCode,
  buildEmbedUrl,
  parseTimestampStringToSeconds,
  formatSecondsToTimestamp,
} from '../../utils/youtubeUrlParser';
import { YouTubeService } from '../../services/youtubeService';
import { YouTubeEmbedOptions } from '../../types/youtube';
import {
  Code,
  Copy,
  Check,
  Play,
  Settings2,
  Shield,
  Eye,
  Sparkles,
  Smartphone,
  Tv,
  Maximize,
  AlertCircle,
  ExternalLink,
  VolumeX,
} from 'lucide-react';

export const YouTubeEmbedGenerator: React.FC = () => {
  const { showToast, addToHistory } = useApp();
  const [urlInput, setUrlInput] = useState('https://www.youtube.com/watch?v=LXb3EKWsInQ');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Embed Customization State
  const [isResponsive, setIsResponsive] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1' | '9:16'>('16:9');
  const [customWidth, setCustomWidth] = useState(640);
  const [customHeight, setCustomHeight] = useState(360);

  const [startTimeStr, setStartTimeStr] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('');

  const [autoplay, setAutoplay] = useState(false);
  const [mute, setMute] = useState(false);
  const [controls, setControls] = useState(true);
  const [loop, setLoop] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState(false); // rel=0 by default for cleanliness
  const [fullscreen, setFullscreen] = useState(true);
  const [privacyEnhanced, setPrivacyEnhanced] = useState(true); // youtube-nocookie.com

  const parsed = useMemo(() => {
    return parseYouTubeUrl(urlInput);
  }, [urlInput]);

  const embedOptions = useMemo<YouTubeEmbedOptions>(() => {
    const videoId = parsed.isValid && parsed.videoId ? parsed.videoId : 'LXb3EKWsInQ';
    const startSec = startTimeStr ? parseTimestampStringToSeconds(startTimeStr) : undefined;
    const endSec = endTimeStr ? parseTimestampStringToSeconds(endTimeStr) : undefined;

    return {
      videoId,
      isResponsive,
      aspectRatio,
      width: customWidth,
      height: customHeight,
      startTime: startSec && startSec > 0 ? startSec : undefined,
      endTime: endSec && endSec > 0 ? endSec : undefined,
      autoplay,
      mute: autoplay ? true : mute, // Browsers require mute for autoplay
      controls,
      loop,
      relatedVideos,
      fullscreen,
      privacyEnhanced,
    };
  }, [
    parsed,
    isResponsive,
    aspectRatio,
    customWidth,
    customHeight,
    startTimeStr,
    endTimeStr,
    autoplay,
    mute,
    controls,
    loop,
    relatedVideos,
    fullscreen,
    privacyEnhanced,
  ]);

  const iframeHtml = useMemo(() => {
    return generateIframeCode(embedOptions);
  }, [embedOptions]);

  const embedUrl = useMemo(() => {
    return buildEmbedUrl(embedOptions);
  }, [embedOptions]);

  const handleCopy = async (text: string, key: string) => {
    const ok = await YouTubeService.copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      showToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopiedKey(null), 2000);

      if (parsed.videoId) {
        addToHistory({
          toolId: 'youtube-embed-code-generator',
          toolName: 'YouTube Embed Generator',
          thumbnail: `https://img.youtube.com/vi/${parsed.videoId}/mqdefault.jpg`,
          originalName: `youtube-embed-${parsed.videoId}`,
          originalSize: 0,
          resultSize: 0,
          downloadName: `embed-${parsed.videoId}.html`,
        });
      }
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Input Bar */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Code className="h-4 w-4" />
            <span>Responsive & Privacy-Enhanced Iframe Generator</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Customize YouTube Video Embed Code
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Generate clean, responsive HTML embed codes with custom start times, autoplay options, and privacy-enhanced mode (youtube-nocookie.com).
          </p>
        </div>

          <Input
            label="YouTube Video URL"
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
          />
      </div>

      {/* Main Two-Column Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Embed Settings (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Settings2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Player Configuration</span>
          </h3>

          {/* Sizing Mode */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Layout & Dimensions
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsResponsive(true)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  isResponsive
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span>Responsive (100%)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsResponsive(false)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  !isResponsive
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Tv className="h-4 w-4" />
                <span>Fixed (Pixels)</span>
              </button>
            </div>

            {isResponsive ? (
              <div className="pt-2">
                <span className="text-xs text-slate-500 block mb-1.5 font-medium">Aspect Ratio Preset</span>
                <div className="grid grid-cols-4 gap-2">
                  {(['16:9', '4:3', '1:1', '9:16'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        aspectRatio === ratio
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <NumberInput
                  label="Width (px)"
                  value={customWidth}
                  onChange={(v) => setCustomWidth(v || 560)}
                />
                <NumberInput
                  label="Height (px)"
                  value={customHeight}
                  onChange={(v) => setCustomHeight(v || 315)}
                />
              </div>
            )}
          </div>

          {/* Time Trimming */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Playback Timing
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Time (MM:SS)"
                type="text"
                value={startTimeStr}
                onChange={(e) => setStartTimeStr(e.target.value)}
                placeholder="e.g. 01:30 or 90"
              />
              <Input
                label="End Time (MM:SS)"
                type="text"
                value={endTimeStr}
                onChange={(e) => setEndTimeStr(e.target.value)}
                placeholder="e.g. 03:45"
              />
            </div>
          </div>

          {/* Toggles & Permissions */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Behavior & Privacy
            </label>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Switch
                  checked={privacyEnhanced}
                  onChange={(c) => setPrivacyEnhanced(c)}
                  label="Privacy-Enhanced Mode"
                  description="Uses youtube-nocookie.com (GDPR compliant)"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Switch
                  checked={autoplay}
                  onChange={(c) => {
                    setAutoplay(c);
                    if (c) setMute(true);
                  }}
                  label="Autoplay (Auto-Muted)"
                  description="Starts automatically when player mounts"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Switch
                  checked={mute}
                  onChange={(c) => setMute(c)}
                  label="Mute Audio"
                  description="Initializes player in muted state"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Switch
                  checked={controls}
                  onChange={(c) => setControls(c)}
                  label="Show Player Controls"
                  description="Progress bar, volume, and quality settings"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Switch
                  checked={loop}
                  onChange={(c) => setLoop(c)}
                  label="Loop Video"
                  description="Repeats continuously upon ending"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Switch
                  checked={fullscreen}
                  onChange={(c) => setFullscreen(c)}
                  label="Allow Fullscreen"
                  description="Enables fullscreen expand button"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview & Generated Code (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Preview Container */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Play className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Live Interactive Embed Preview</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {isResponsive ? `Aspect ${aspectRatio}` : `${customWidth}×${customHeight}px`}
              </span>
            </div>

            {/* Rendered Preview Box */}
            <div className="w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner flex items-center justify-center">
              {isResponsive ? (
                <div
                  className={`w-full relative ${
                    aspectRatio === '16:9'
                      ? 'aspect-video'
                      : aspectRatio === '4:3'
                      ? 'aspect-[4/3]'
                      : aspectRatio === '1:1'
                      ? 'aspect-square'
                      : 'aspect-[9/16] max-w-xs mx-auto'
                  }`}
                >
                  <iframe
                    key={embedUrl}
                    src={embedUrl}
                    title="YouTube Embed Preview"
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen={fullscreen}
                  />
                </div>
              ) : (
                <div className="overflow-auto p-4 max-w-full flex justify-center">
                  <iframe
                    key={embedUrl}
                    src={embedUrl}
                    width={customWidth}
                    height={customHeight}
                    title="YouTube Embed Preview"
                    className="border-0 rounded-xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen={fullscreen}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Generated Code Block */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Generated HTML Embed Code</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(embedUrl, 'url')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  {copiedKey === 'url' ? 'URL Copied!' : 'Copy Embed URL'}
                </button>
                <button
                  onClick={() => handleCopy(iframeHtml, 'code')}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all"
                >
                  {copiedKey === 'code' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy HTML Code</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-2xl bg-slate-950 text-indigo-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 select-all">
                {iframeHtml}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
