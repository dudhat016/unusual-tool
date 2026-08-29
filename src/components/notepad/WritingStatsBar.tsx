import React, { useState } from 'react';
import { WritingStats } from '../../types/notepad';
import { Clock, FileText, AlignLeft, Volume2, Sparkles, BarChart2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';

interface WritingStatsBarProps {
  stats: WritingStats;
  compact?: boolean;
}

export const WritingStatsBar: React.FC<WritingStatsBarProps> = ({ stats, compact = false }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 py-2 px-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 select-none">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900 dark:text-white font-mono">
              {stats.words.toLocaleString()}
            </span>
            <span>words</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900 dark:text-white font-mono">
              {stats.characters.toLocaleString()}
            </span>
            <span>chars</span>
          </div>

          {!compact && (
            <>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {stats.charactersNoSpaces.toLocaleString()}
                </span>
                <span>(no spaces)</span>
              </div>

              <div className="hidden md:flex items-center gap-1.5">
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {stats.paragraphs.toLocaleString()}
                </span>
                <span>paragraphs</span>
              </div>
            </>
          )}

          <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
            <Clock className="w-3 h-3" />
            <span>{stats.readingTimeMinutes} min read</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsDetailsOpen(true)}
          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Detailed Stats</span>
        </button>
      </div>

      {/* Detailed Writing Analytics Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Writing & Readability Analysis"
        size="md"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 text-center">
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                {stats.words.toLocaleString()}
              </span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Total Words</p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 text-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {stats.characters.toLocaleString()}
              </span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Characters</p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 text-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {stats.charactersNoSpaces.toLocaleString()}
              </span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Chars (No Spaces)</p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 text-center">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {stats.paragraphs.toLocaleString()}
              </span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Paragraphs</p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 text-center">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {stats.sentences.toLocaleString()}
              </span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Sentences</p>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5 text-center">
              <span className="text-2xl font-black text-pink-600 dark:text-pink-400 font-mono">
                {stats.words > 0 && stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : '0'}
              </span>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Avg Words/Sentence</p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-purple-200/60 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Speaking & Reading Pace
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {stats.readingTimeMinutes} {stats.readingTimeMinutes === 1 ? 'minute' : 'minutes'}
                  </p>
                  <p className="text-slate-500">Estimated Silent Reading (200 wpm)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300 flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {stats.speakingTimeMinutes} {stats.speakingTimeMinutes === 1 ? 'minute' : 'minutes'}
                  </p>
                  <p className="text-slate-500">Estimated Speech Time (130 wpm)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
