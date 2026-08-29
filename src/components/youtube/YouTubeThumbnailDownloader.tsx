import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Layers,
  RefreshCw,
  Search,
  Video
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { YouTubeService } from '../../services/youtubeService';
import { YouTubeThumbnailInfo } from '../../types/youtube';
import { parseYouTubeUrl } from '../../utils/youtubeUrlParser';
import { Input } from '../ui/Input';

export const YouTubeThumbnailDownloader: React.FC = () => {
  const { showToast, addToHistory } = useApp();
  const [urlInput, setUrlInput] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<YouTubeThumbnailInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleVideos = [
    { label: '4K Nature (HD MaxRes)', url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ' },
    { label: 'Lo-Fi Girl (Standard)', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
    { label: 'YouTube Short', url: 'https://www.youtube.com/shorts/3lO4t1t-F-g' },
  ];

  const handleProcessUrl = async (input: string) => {
    setErrorMsg(null);
    const parsed = parseYouTubeUrl(input);

    if (!parsed.isValid || !parsed.videoId) {
      setErrorMsg(parsed.errorMessage || 'Please enter a valid YouTube video URL.');
      setVideoId(null);
      setThumbnails([]);
      return;
    }

    setVideoId(parsed.videoId);
    setIsLoading(true);

    try {
      const checked = await YouTubeService.checkAllThumbnailsAvailability(parsed.videoId);
      setThumbnails(checked);

      // Add to history
      const best = checked.find((t) => t.isAvailable) || checked[checked.length - 1];
      addToHistory({
        toolId: 'youtube-thumbnail-downloader',
        toolName: 'YouTube Thumbnail Download',
        thumbnail: best.url,
        originalName: `youtube-${parsed.videoId}`,
        originalSize: 0,
        resultSize: 0,
        downloadName: `youtube-thumbnail-${parsed.videoId}.jpg`,
      });

      showToast('YouTube video detected! Thumbnails loaded.', 'success');
    } catch (err: any) {
      console.error('Failed to probe thumbnails:', err);
      showToast('Could not load thumbnails. Please check your internet connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (thumbnail: YouTubeThumbnailInfo) => {
    if (!videoId) return;
    setDownloadingKey(thumbnail.resolutionKey);
    showToast(`Downloading ${thumbnail.label}...`, 'info');

    try {
      await YouTubeService.downloadThumbnail(thumbnail.url, videoId, thumbnail.resolutionKey);
      showToast('Download complete.', 'success');
    } catch (err: any) {
      console.error('Download error:', err);
      showToast('Failed to download image. Try clicking Open Image and save directly.', 'error');
    } finally {
      setDownloadingKey(null);
    }
  };

  const handleCopyUrl = async (url: string, key: string) => {
    const ok = await YouTubeService.copyToClipboard(url);
    if (ok) {
      setCopiedKey(key);
      showToast('Thumbnail URL copied to clipboard!', 'success');
      setTimeout(() => setCopiedKey(null), 2000);
    } else {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const highestAvailable = thumbnails.find((t) => t.isAvailable) || thumbnails[0];
  const maxResMissing = thumbnails.length > 0 && !thumbnails.find((t) => t.resolutionKey === 'maxresdefault')?.isAvailable;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Input Hero Card */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            <Video className="h-4 w-4" />
            <span>Official High-Definition Thumbnail Extractor</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Paste YouTube Video URL
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Supports standard videos, shorts, live streams, and youtu.be short links.
          </p>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleProcessUrl(urlInput);
              }}
              placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
            />
            {urlInput && (
              <button
                onClick={() => {
                  setUrlInput('');
                  setVideoId(null);
                  setThumbnails([]);
                  setErrorMsg(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={() => handleProcessUrl(urlInput)}
            disabled={isLoading || !urlInput.trim()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white px-6 py-3.5 text-sm font-bold shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Get Thumbnails</span>
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sample Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-400">Quick Samples:</span>
          {sampleVideos.map((sample) => (
            <button
              key={sample.url}
              onClick={() => {
                setUrlInput(sample.url);
                handleProcessUrl(sample.url);
              }}
              className="text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 hover:border-red-300 dark:hover:border-red-900 px-3 py-1 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      {videoId && thumbnails.length > 0 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* MaxRes Missing Notice */}
          {maxResMissing && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs sm:text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="font-bold">Maximum HD Resolution (1280×720) is not available for this video.</p>
                <p className="text-xs opacity-90 mt-0.5">
                  The video creator did not upload a 720p HD custom thumbnail. We have automatically selected the highest available resolution ({highestAvailable.width}×{highestAvailable.height}px).
                </p>
              </div>
            </div>
          )}

          {/* Primary / Highest Quality Hero Preview Card */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold mb-1 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Best Available Quality</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {highestAvailable.label} ({highestAvailable.width} × {highestAvailable.height})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(highestAvailable)}
                  disabled={downloadingKey === highestAvailable.resolutionKey}
                  className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 active:scale-[0.98] transition-all"
                >
                  {downloadingKey === highestAvailable.resolutionKey ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Download JPG</span>
                    </>
                  )}
                </button>

                <a
                  href={highestAvailable.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline">Open</span>
                </a>
              </div>
            </div>

            {/* Big Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-inner group">
              <img
                src={highestAvailable.url}
                alt="YouTube Thumbnail Best Quality"
                className="w-full max-h-[480px] object-contain"
              />
              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono px-2.5 py-1 rounded-lg border border-white/10">
                {highestAvailable.width} × {highestAvailable.height} px • JPG
              </div>
            </div>
          </div>

          {/* All Available Resolutions Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span>All Thumbnail Resolutions & Variants</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {thumbnails.map((t) => (
                <div
                  key={t.resolutionKey}
                  className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                    t.isAvailable
                      ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md'
                      : 'border-slate-200/60 dark:border-slate-800/40 bg-slate-100/50 dark:bg-slate-950/40 opacity-60'
                  }`}
                >
                  {/* Thumbnail Image Box */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
                    {t.isAvailable ? (
                      <img
                        src={t.url}
                        alt={t.label}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center text-slate-500">
                        <AlertCircle className="h-6 w-6 mb-1 text-slate-400" />
                        <span className="text-xs font-semibold">Unavailable for this video</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          t.isAvailable
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {t.isAvailable ? 'Available' : 'Not Uploaded'}
                      </span>
                    </div>

                    {/* Dimensions Pill */}
                    {t.isAvailable && (
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs">
                        {t.width} × {t.height} px
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.label}</h4>
                        <span className="text-[11px] font-mono text-slate-400">{t.fileType}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Key: <code className="font-mono text-[11px] text-red-600 dark:text-red-400">{t.resolutionKey}</code>
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleDownload(t)}
                        disabled={!t.isAvailable || downloadingKey === t.resolutionKey}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white py-2 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        {downloadingKey === t.resolutionKey ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() => handleCopyUrl(t.url, t.resolutionKey)}
                        disabled={!t.isAvailable}
                        title="Copy Image URL"
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition-colors"
                      >
                        {copiedKey === t.resolutionKey ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <a
                        href={t.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={`p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors ${
                          !t.isAvailable ? 'pointer-events-none opacity-40' : ''
                        }`}
                        title="Open Full Image in New Tab"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
