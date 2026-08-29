import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  parseYouTubeUrl,
  parseTimestampStringToSeconds,
  formatSecondsToTimestamp,
  generateTimestampUrls,
} from '../../utils/youtubeUrlParser';
import { YouTubeService } from '../../services/youtubeService';
import {
  Clock,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  Play,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Share2,
  Video,
} from 'lucide-react';

export const YouTubeTimestampGenerator: React.FC = () => {
  const { showToast, addToHistory } = useApp();
  const [urlInput, setUrlInput] = useState('');
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(1);
  const [seconds, setSeconds] = useState<number>(30);
  const [timeFormattedInput, setTimeFormattedInput] = useState('00:01:30');

  const [hasEndTime, setHasEndTime] = useState(false);
  const [endHours, setEndHours] = useState<number>(0);
  const [endMinutes, setEndMinutes] = useState<number>(3);
  const [endSeconds, setEndSeconds] = useState<number>(0);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPlayerPreview, setShowPlayerPreview] = useState(true);

  // Sync formatted string when numeric dials change
  const totalStartSeconds = useMemo(() => {
    return Math.max(0, (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0));
  }, [hours, minutes, seconds]);

  const totalEndSeconds = useMemo(() => {
    if (!hasEndTime) return undefined;
    return Math.max(0, (endHours || 0) * 3600 + (endMinutes || 0) * 60 + (endSeconds || 0));
  }, [hasEndTime, endHours, endMinutes, endSeconds]);

  // Parse initial URL if it already has timestamp embedded
  const parsedUrl = useMemo(() => {
    if (!urlInput.trim()) return null;
    return parseYouTubeUrl(urlInput);
  }, [urlInput]);

  useEffect(() => {
    if (parsedUrl?.timestampSeconds !== undefined && parsedUrl.timestampSeconds > 0) {
      const sec = parsedUrl.timestampSeconds;
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      setHours(h);
      setMinutes(m);
      setSeconds(s);
      setTimeFormattedInput(formatSecondsToTimestamp(sec));
    }
  }, [parsedUrl?.timestampSeconds]);

  const handleFormattedTimeChange = (val: string) => {
    setTimeFormattedInput(val);
    const parsedSec = parseTimestampStringToSeconds(val);
    const h = Math.floor(parsedSec / 3600);
    const m = Math.floor((parsedSec % 3600) / 60);
    const s = parsedSec % 60;
    setHours(h);
    setMinutes(m);
    setSeconds(s);
  };

  const handleNumericChange = (type: 'h' | 'm' | 's', val: number) => {
    let newH = hours;
    let newM = minutes;
    let newS = seconds;

    if (type === 'h') newH = Math.max(0, val);
    if (type === 'm') newM = Math.max(0, Math.min(59, val));
    if (type === 's') newS = Math.max(0, Math.min(59, val));

    setHours(newH);
    setMinutes(newM);
    setSeconds(newS);
    const total = newH * 3600 + newM * 60 + newS;
    setTimeFormattedInput(formatSecondsToTimestamp(total));
  };

  const generatedUrls = useMemo(() => {
    if (!parsedUrl?.isValid || !parsedUrl?.videoId) return null;
    return generateTimestampUrls(parsedUrl.videoId, totalStartSeconds, totalEndSeconds, {
      list: parsedUrl.playlistId,
    });
  }, [parsedUrl, totalStartSeconds, totalEndSeconds]);

  const handleCopy = async (text: string, key: string) => {
    const ok = await YouTubeService.copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      showToast('Timestamp link copied to clipboard!', 'success');
      setTimeout(() => setCopiedKey(null), 2000);

      if (parsedUrl?.videoId) {
        addToHistory({
          toolId: 'youtube-timestamp-link-generator',
          toolName: 'YouTube Timestamp Link',
          thumbnail: `https://img.youtube.com/vi/${parsedUrl.videoId}/mqdefault.jpg`,
          originalName: `youtube-timestamp-${parsedUrl.videoId}`,
          originalSize: 0,
          resultSize: 0,
          downloadName: `timestamp-${formatSecondsToTimestamp(totalStartSeconds)}.txt`,
        });
      }
    } else {
      showToast('Failed to copy link', 'error');
    }
  };

  const sampleUrls = [
    { label: 'Nature Docu', url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ' },
    { label: 'Music Session', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Input & Timestamp Controls */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4" />
            <span>Precise Timestamp URL Generator</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Create YouTube Links That Start at an Exact Time
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Generate timestamped shareable links and embed codes that jump directly to any specific second, minute, or hour.
          </p>
        </div>

        {/* Video URL Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. YouTube Video URL
          </label>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 px-4 py-3.5 text-sm font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all"
          />
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-slate-400">Try Sample:</span>
            {sampleUrls.map((s) => (
              <button
                key={s.url}
                onClick={() => setUrlInput(s.url)}
                className="text-xs px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-amber-300 transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Selector Controls */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            2. Start Timestamp
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Direct HH:MM:SS text input */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Timestamp Format (HH:MM:SS or MM:SS)
              </span>
              <div className="relative">
                <input
                  type="text"
                  value={timeFormattedInput}
                  onChange={(e) => handleFormattedTimeChange(e.target.value)}
                  placeholder="01:23:45 or 45:00 or 90s"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-base font-mono font-bold text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  ={totalStartSeconds}s
                </span>
              </div>
            </div>

            {/* Dial selectors: Hours, Minutes, Seconds */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Individual Time Units
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Hours</label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={hours}
                    onChange={(e) => handleNumericChange('h', parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-center font-mono font-bold text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => handleNumericChange('m', parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-center font-mono font-bold text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Seconds</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(e) => handleNumericChange('s', parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-center font-mono font-bold text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Optional End Timestamp toggle */}
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={hasEndTime}
                onChange={(e) => setHasEndTime(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              <span>Specify End Timestamp (for embeds & looped clips)</span>
            </label>

            {hasEndTime && (
              <div className="grid grid-cols-3 gap-2 max-w-sm mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 animate-in fade-in duration-150">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">End Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={endHours}
                    onChange={(e) => setEndHours(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-center font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">End Min</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={endMinutes}
                    onChange={(e) => setEndMinutes(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-center font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">End Sec</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={endSeconds}
                    onChange={(e) => setEndSeconds(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-center font-mono font-bold text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Links & Verification Section */}
      {parsedUrl?.isValid && parsedUrl?.videoId && generatedUrls && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary Banner */}
          <div className="rounded-3xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                <Sparkles className="h-4 w-4" />
                <span>Timestamp Configured</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Video will start playing at{' '}
                <span className="text-amber-600 dark:text-amber-400 underline decoration-amber-400">
                  {formatSecondsToTimestamp(totalStartSeconds)}
                </span>{' '}
                ({totalStartSeconds} seconds)
                {hasEndTime && totalEndSeconds && (
                  <span> and end at {formatSecondsToTimestamp(totalEndSeconds)}</span>
                )}
              </h3>
            </div>

            <a
              href={generatedUrls.watchUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white px-5 py-3 text-xs sm:text-sm font-bold shadow-lg shadow-amber-600/20 active:scale-[0.98] transition-all shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Test on YouTube</span>
            </a>
          </div>

          {/* Links Grid */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Share2 className="h-4 w-4 text-amber-500" />
              <span>Generated Share Links & Formats</span>
            </h3>

            <div className="space-y-4">
              {/* Option 1: Standard Watch URL */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Standard Watch Link (youtube.com)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Best for emails & desktop browsers</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedUrls.watchUrl}
                    className="flex-1 font-mono text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 select-all focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopy(generatedUrls.watchUrl, 'watch')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white text-xs font-bold transition-colors"
                  >
                    {copiedKey === 'watch' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Short youtu.be Link */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Short Link (youtu.be)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Best for Twitter, WhatsApp, & Discord</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedUrls.shortUrl}
                    className="flex-1 font-mono text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 select-all focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopy(generatedUrls.shortUrl, 'short')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white text-xs font-bold transition-colors"
                  >
                    {copiedKey === 'short' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Option 3: Embed Link */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Direct Embed URL (for iframes)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">URL parameter: ?start={totalStartSeconds}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedUrls.embedUrl}
                    className="flex-1 font-mono text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 select-all focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopy(generatedUrls.embedUrl, 'embed')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white text-xs font-bold transition-colors"
                  >
                    {copiedKey === 'embed' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live In-App Verification Player */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Play className="h-4 w-4 text-red-600" />
                <span>Live In-App Player Verification</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Starts at {formatSecondsToTimestamp(totalStartSeconds)}</span>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner">
              <iframe
                key={`${parsedUrl.videoId}-${totalStartSeconds}-${totalEndSeconds}`}
                src={generatedUrls.embedUrl}
                title="YouTube Timestamp Preview"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
