import {
  AlertCircle,
  AtSign,
  Check,
  Copy,
  ExternalLink,
  Film,
  RefreshCw,
  Search,
  User,
  Users
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { YouTubeService } from '../../services/youtubeService';
import { YouTubeChannelResult } from '../../types/youtube';
import { parseYouTubeUrl } from '../../utils/youtubeUrlParser';
import { Input } from '../ui/Input';

export const YouTubeChannelIdFinder: React.FC = () => {
  const { showToast, addToHistory } = useApp();
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [channelData, setChannelData] = useState<YouTubeChannelResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const sampleChannels = [
    { label: '@veritasium', val: 'https://www.youtube.com/@veritasium' },
    { label: '@mkbhd', val: 'https://www.youtube.com/@mkbhd' },
    { label: 'Direct UC... Channel ID', val: 'https://www.youtube.com/channel/UC7_gcs09iThXybpVgjHZ_7g' },
  ];

  const handleFindChannel = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a YouTube channel URL, handle, or channel ID.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      // 1. Check if input is a direct channel ID in URL (e.g. /channel/UC...)
      const parsed = parseYouTubeUrl(trimmed);
      if (parsed.channelId) {
        const directResult: YouTubeChannelResult = {
          channelId: parsed.channelId,
          title: `Channel (${parsed.channelId})`,
          url: `https://www.youtube.com/channel/${parsed.channelId}`,
          source: 'direct_url',
        };
        setChannelData(directResult);
        showToast('Channel ID extracted successfully!', 'success');
        addToHistory({
          toolId: 'youtube-channel-id-finder',
          toolName: 'YouTube Channel ID Finder',
          thumbnail: '',
          originalName: parsed.channelId,
          originalSize: 0,
          resultSize: 0,
          downloadName: `channel-${parsed.channelId}.txt`,
        });
        setIsLoading(false);
        return;
      }

      // 2. Fetch via Server API endpoint (uses YouTube Data API or metadata resolution)
      const res = await YouTubeService.resolveChannelInfo(trimmed);
      setChannelData(res);
      showToast(`Channel "${res.title}" resolved!`, 'success');

      addToHistory({
        toolId: 'youtube-channel-id-finder',
        toolName: 'YouTube Channel ID Finder',
        thumbnail: res.avatarUrl || '',
        originalName: res.title,
        originalSize: 0,
        resultSize: 0,
        downloadName: `channel-${res.channelId}.txt`,
      });
    } catch (err: any) {
      console.error('Channel search error:', err);
      setErrorMsg(
        err.message ||
          'Could not resolve YouTube Channel ID. Please verify the URL or handle, or check server connection.'
      );
      setChannelData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, key: string) => {
    const ok = await YouTubeService.copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      showToast('Copied to clipboard!', 'success');
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Input Card */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <AtSign className="h-4 w-4" />
            <span>Channel ID & Metadata Resolver</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Find YouTube Channel ID from Any Link or Handle
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Convert modern <code className="font-mono text-emerald-600 dark:text-emerald-400">@handles</code>, custom URLs, or user profiles into standard canonical 24-character YouTube Channel IDs (<code className="font-mono">UC...</code>).
          </p>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Input
              type="text"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFindChannel(inputVal);
              }}
              placeholder="Enter channel handle, custom URL, video link, or channel ID..."
            />
            {inputVal && (
              <button
                onClick={() => {
                  setInputVal('');
                  setChannelData(null);
                  setErrorMsg(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={() => handleFindChannel(inputVal)}
            disabled={isLoading || !inputVal.trim()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white px-6 py-3.5 text-sm font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Resolving...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Find Channel ID</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sample Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-400">Quick Samples:</span>
          {sampleChannels.map((sample) => (
            <button
              key={sample.val}
              onClick={() => {
                setInputVal(sample.val);
                handleFindChannel(sample.val);
              }}
              className="text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 hover:border-emerald-300 dark:hover:border-emerald-900 px-3 py-1 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resolved Result Card */}
      {channelData && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-4">
              {channelData.avatarUrl ? (
                <img
                  src={channelData.avatarUrl}
                  alt={channelData.title}
                  className="h-16 w-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-md"
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                  <User className="h-8 w-8" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{channelData.title}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                    Verified
                  </span>
                </div>
                {channelData.handle && (
                  <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {channelData.handle}
                  </p>
                )}
              </div>
            </div>

            <a
              href={channelData.url}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open on YouTube</span>
            </a>
          </div>

          {/* Stats Bar (if retrieved) */}
          {(channelData.subscriberCount || channelData.videoCount) && (
            <div className="grid grid-cols-2 gap-4">
              {channelData.subscriberCount && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Subscribers</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {parseInt(channelData.subscriberCount, 10).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {channelData.videoCount && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                    <Film className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Total Videos</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {parseInt(channelData.videoCount, 10).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Key Identification Fields */}
          <div className="space-y-4">
            {/* Primary Channel ID Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Canonical YouTube Channel ID (24 Characters)
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">Standard API Format</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  readOnly
                  value={channelData.channelId}
                />
                <button
                  onClick={() => handleCopy(channelData.channelId, 'id')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all"
                >
                  {copiedKey === 'id' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>Copy ID</span>
                </button>
              </div>
            </div>

            {/* Direct Channel Canonical URL */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Canonical Channel URL
              </span>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  readOnly
                  value={channelData.url}
                />
                <button
                  onClick={() => handleCopy(channelData.url, 'url')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white text-xs font-bold transition-colors"
                >
                  {copiedKey === 'url' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
