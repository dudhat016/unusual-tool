import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { parseYouTubeUrl } from '../../utils/youtubeUrlParser';
import { Input } from '../ui/Input';
import { YouTubeService } from '../../services/youtubeService';
import { YouTubeThumbnailInfo } from '../../types/youtube';
import {
  Maximize2,
  Download,
  ExternalLink,
  Copy,
  Check,
  Search,
  AlertCircle,
  Eye,
  X,
  Layers,
  Sparkles,
  RefreshCw,
  Video,
} from 'lucide-react';

export const YouTubeThumbnailPreviewer: React.FC = () => {
  const { showToast, addToHistory } = useApp();
  const [urlInput, setUrlInput] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<YouTubeThumbnailInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModalImg, setActiveModalImg] = useState<YouTubeThumbnailInfo | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleVideos = [
    { label: '4K Ultra HD', url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ' },
    { label: 'Gaming Live Stream', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
    { label: 'Tech Review', url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk' },
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

      const best = checked.find((t) => t.isAvailable) || checked[0];
      addToHistory({
        toolId: 'youtube-thumbnail-previewer',
        toolName: 'YouTube Thumbnail Preview',
        thumbnail: best.url,
        originalName: `youtube-preview-${parsed.videoId}`,
        originalSize: 0,
        resultSize: 0,
        downloadName: `youtube-thumbnail-${parsed.videoId}.jpg`,
      });

      showToast('Loaded all thumbnail variants for comparison!', 'success');
    } catch (err) {
      console.error('Thumbnail inspection error:', err);
      showToast('Could not inspect thumbnails. Please check your connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (thumbnail: YouTubeThumbnailInfo) => {
    if (!videoId) return;
    showToast(`Downloading ${thumbnail.label}...`, 'info');
    try {
      await YouTubeService.downloadThumbnail(thumbnail.url, videoId, thumbnail.resolutionKey);
      showToast('Download complete.', 'success');
    } catch {
      showToast('Download failed. Try opening image in new tab.', 'error');
    }
  };

  const handleCopyUrl = async (url: string, key: string) => {
    const ok = await YouTubeService.copyToClipboard(url);
    if (ok) {
      setCopiedKey(key);
      showToast('Thumbnail URL copied to clipboard!', 'success');
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Input Box */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Eye className="h-4 w-4" />
            <span>Multi-Resolution Thumbnail Inspector & Comparator</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Inspect YouTube Thumbnail Resolutions
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Compare all 5 YouTube CDN thumbnail tiers side-by-side to check quality, sharpness, and aspect ratio crop differences.
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
              placeholder="https://www.youtube.com/watch?v=... or paste Video ID"
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
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white px-6 py-3.5 text-sm font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Inspecting...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Inspect Video</span>
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
          <span className="text-xs font-semibold text-slate-400">Samples:</span>
          {sampleVideos.map((sample) => (
            <button
              key={sample.url}
              onClick={() => {
                setUrlInput(sample.url);
                handleProcessUrl(sample.url);
              }}
              className="text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 hover:border-blue-300 dark:hover:border-blue-900 px-3 py-1 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Thumbnails Comparison List */}
      {videoId && thumbnails.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span>Resolution Tiers & CDN Variant Comparison</span>
            </h3>
            <span className="text-xs font-mono text-slate-500">ID: {videoId}</span>
          </div>

          <div className="space-y-6">
            {thumbnails.map((t, idx) => (
              <div
                key={t.resolutionKey}
                className={`rounded-3xl border p-5 sm:p-6 transition-all ${
                  t.isAvailable
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg'
                    : 'border-slate-200/60 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-950/40 opacity-70'
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-6 items-center">
                  {/* Image Viewport */}
                  <div
                    className="w-full lg:w-96 shrink-0 relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center cursor-pointer group shadow-inner"
                    onClick={() => t.isAvailable && setActiveModalImg(t)}
                  >
                    {t.isAvailable ? (
                      <>
                        <img
                          src={t.url}
                          alt={t.label}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/90 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                            <Maximize2 className="h-3.5 w-3.5" />
                            <span>Click to Expand</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500">
                        <AlertCircle className="h-7 w-7 text-amber-500 mb-1" />
                        <span className="text-xs font-bold">Image Tier Not Generated</span>
                        <span className="text-[11px] text-slate-400">YouTube CDN placeholder</span>
                      </div>
                    )}

                    <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                      #{idx + 1} • {t.resolutionKey}
                    </div>
                  </div>

                  {/* Metadata & Controls */}
                  <div className="flex-1 w-full space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            {t.label}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              t.isAvailable
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {t.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {t.isAvailable
                            ? `Native aspect ratio: ${t.aspectRatio} • File size: ${t.approxSize}`
                            : 'This resolution level was not rendered or provided by YouTube for this video.'}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                          {t.width} × {t.height} px
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">JPEG Format</div>
                      </div>
                    </div>

                    {/* CDN URL Bar */}
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      <code className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate flex-1 select-all">
                        {t.url}
                      </code>
                      <button
                        onClick={() => handleCopyUrl(t.url, t.resolutionKey)}
                        disabled={!t.isAvailable}
                        className="p-1.5 text-xs rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                        title="Copy CDN URL"
                      >
                        {copiedKey === t.resolutionKey ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => handleDownload(t)}
                        disabled={!t.isAvailable}
                        className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white px-4 py-2 text-xs font-bold disabled:opacity-40 transition-all shadow-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download JPG</span>
                      </button>

                      <button
                        onClick={() => t.isAvailable && setActiveModalImg(t)}
                        disabled={!t.isAvailable}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 disabled:opacity-40 transition-colors"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span>Preview Fullscreen</span>
                      </button>

                      <a
                        href={t.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={`flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors ${
                          !t.isAvailable ? 'pointer-events-none opacity-40' : ''
                        }`}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Open Raw Image</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {activeModalImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 sm:p-8 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setActiveModalImg(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 text-white">
              <div>
                <h3 className="font-bold text-base">{activeModalImg.label}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {activeModalImg.width} × {activeModalImg.height} px • {activeModalImg.resolutionKey}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(activeModalImg)}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 text-xs font-bold transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setActiveModalImg(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div className="flex-1 bg-black p-4 flex items-center justify-center overflow-auto">
              <img
                src={activeModalImg.url}
                alt={activeModalImg.label}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
