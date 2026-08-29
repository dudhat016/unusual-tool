import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { parseYouTubeUrl } from '../../utils/youtubeUrlParser';
import { Input } from '../ui/Input';
import { YouTubeService } from '../../services/youtubeService';
import { YouTubeTagResult } from '../../types/youtube';
import {
  Hash,
  Search,
  Copy,
  Check,
  Download,
  Filter,
  BarChart2,
  FileText,
  Layers,
  Sparkles,
  AlertCircle,
  RefreshCw,
  CheckSquare,
  Square,
  CheckCircle2,
  Share2,
  Tag,
} from 'lucide-react';

export const YouTubeTagExtractor: React.FC = () => {
  const { showToast, addToHistory } = useApp();
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tagData, setTagData] = useState<YouTubeTagResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const sampleVideos = [
    { label: 'Science / Edu', url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ' },
    { label: 'Music Live', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
  ];

  const handleExtractTags = async (input: string) => {
    setErrorMsg(null);
    const parsed = parseYouTubeUrl(input);

    if (!parsed.isValid || !parsed.videoId) {
      setErrorMsg(parsed.errorMessage || 'Please enter a valid YouTube video URL.');
      setTagData(null);
      return;
    }

    setIsLoading(true);

    try {
      const res = await YouTubeService.extractVideoTags(parsed.videoId);
      setTagData(res);
      setSelectedTags(new Set(res.tags)); // Select all by default

      addToHistory({
        toolId: 'youtube-tag-extractor',
        toolName: 'YouTube Tag Extractor',
        thumbnail: `https://img.youtube.com/vi/${parsed.videoId}/mqdefault.jpg`,
        originalName: res.title || `youtube-tags-${parsed.videoId}`,
        originalSize: 0,
        resultSize: 0,
        downloadName: `tags-${parsed.videoId}.txt`,
      });

      if (res.tags.length > 0) {
        showToast(`Extracted ${res.tags.length} video tags!`, 'success');
      } else {
        showToast('No tags found for this video.', 'info');
      }
    } catch (err: any) {
      console.error('Tag extraction error:', err);
      setErrorMsg(err.message || 'Failed to retrieve video tags. Please try again.');
      setTagData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered tags based on search input
  const filteredTags = useMemo(() => {
    if (!tagData) return [];
    if (!searchFilter.trim()) return tagData.tags;
    const q = searchFilter.toLowerCase();
    return tagData.tags.filter((t) => t.toLowerCase().includes(q));
  }, [tagData, searchFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    if (!tagData || tagData.tags.length === 0) return null;
    const tags = tagData.tags;
    const totalCount = tags.length;
    const totalChars = tags.reduce((acc, t) => acc + t.length, 0);
    const avgLength = (totalChars / totalCount).toFixed(1);

    let longest = tags[0];
    let shortest = tags[0];
    tags.forEach((t) => {
      if (t.length > longest.length) longest = t;
      if (t.length < shortest.length) shortest = t;
    });

    const uniqueCount = new Set(tags.map((t) => t.toLowerCase())).size;

    return {
      totalCount,
      totalChars,
      avgLength,
      longest,
      shortest,
      uniqueCount,
      hasDuplicates: uniqueCount < totalCount,
    };
  }, [tagData]);

  const toggleTagSelect = (tag: string) => {
    const next = new Set(selectedTags);
    if (next.has(tag)) {
      next.delete(tag);
    } else {
      next.add(tag);
    }
    setSelectedTags(next);
  };

  const handleSelectAll = () => {
    if (!tagData) return;
    setSelectedTags(new Set(tagData.tags));
  };

  const handleClearSelection = () => {
    setSelectedTags(new Set());
  };

  const handleCopyTags = async (tagsToCopy: string[], mode: 'comma' | 'newline', key: string) => {
    if (tagsToCopy.length === 0) {
      showToast('No tags selected to copy.', 'info');
      return;
    }

    const text = mode === 'comma' ? tagsToCopy.join(', ') : tagsToCopy.join('\n');
    const ok = await YouTubeService.copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      showToast(`Copied ${tagsToCopy.length} tags to clipboard!`, 'success');
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Input Card */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <Hash className="h-4 w-4" />
            <span>YouTube SEO Video Tag & Keyword Extractor</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Extract SEO Tags and Hidden Keywords
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Analyze competitors, find ranking keywords, and export video tags in CSV or TXT formats.
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
                if (e.key === 'Enter') handleExtractTags(urlInput);
              }}
              placeholder="https://www.youtube.com/watch?v=... or paste Video ID"
            />
            {urlInput && (
              <button
                onClick={() => {
                  setUrlInput('');
                  setTagData(null);
                  setErrorMsg(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={() => handleExtractTags(urlInput)}
            disabled={isLoading || !urlInput.trim()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white px-6 py-3.5 text-sm font-bold shadow-lg shadow-rose-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Extract Tags</span>
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
                handleExtractTags(sample.url);
              }}
              className="text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 hover:border-rose-300 dark:hover:border-rose-900 px-3 py-1 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      {tagData && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Video Metadata Header */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                  {tagData.channelTitle}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {tagData.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                    tagData.isFromOfficialApi
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tagData.isFromOfficialApi ? 'Official Data API' : 'Page Metadata'}
                </span>
              </div>
            </div>

            {/* Status Message */}
            {tagData.statusMessage && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span>{tagData.statusMessage}</span>
              </p>
            )}
          </div>

          {/* Tag Statistics Grid (if tags exist) */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Tags</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {stats.totalCount}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Characters</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {stats.totalChars}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Avg Tag Length</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                  {stats.avgLength} <span className="text-xs font-normal text-slate-400">chars</span>
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Selected Tags</span>
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                  {selectedTags.size} / {tagData.tags.length}
                </span>
              </div>
            </div>
          )}

          {/* Interactive Tags Hub */}
          {tagData.tags.length > 0 ? (
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl space-y-6">
              {/* Controls & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter tags..."
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleClearSelection}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleCopyTags(Array.from(selectedTags), 'comma', 'selected-comma')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 active:scale-[0.98] transition-all"
                >
                  {copiedKey === 'selected-comma' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy Selected (Comma)</span>
                </button>

                <button
                  onClick={() => handleCopyTags(tagData.tags, 'comma', 'all-comma')}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white text-xs font-bold transition-colors"
                >
                  {copiedKey === 'all-comma' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy All Tags</span>
                </button>

                <button
                  onClick={() => YouTubeService.downloadTagsAsTxt(tagData.tags, tagData.title)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .TXT</span>
                </button>

                <button
                  onClick={() => YouTubeService.downloadTagsAsCsv(tagData.tags, tagData.title)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Download .CSV</span>
                </button>
              </div>

              {/* Tag Pills Display */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                {filteredTags.map((tag, idx) => {
                  const isSelected = selectedTags.has(tag);
                  return (
                    <button
                      key={`${tag}-${idx}`}
                      onClick={() => toggleTagSelect(tag)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        isSelected
                          ? 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-200 shadow-2xs'
                          : 'bg-slate-50 border-slate-200/80 text-slate-600 dark:bg-slate-950/60 dark:border-slate-800 dark:text-slate-400 opacity-60'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                      ) : (
                        <Square className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      <span>{tag}</span>
                      <span className="text-[10px] font-mono opacity-60 ml-0.5">({tag.length})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">No Public Tags Found</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                The author of this video has either omitted video tags, or tags are private. You can also configure <code className="font-mono text-rose-500">YOUTUBE_API_KEY</code> on your server for comprehensive metadata retrieval.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
