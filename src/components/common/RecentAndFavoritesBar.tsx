import React from 'react';
import { useApp } from '../../context/AppContext';
import { DynamicIcon } from './DynamicIcon';
import { Star } from 'lucide-react';
import { Link } from './Link';

export const RecentAndFavoritesBar: React.FC = () => {
  const { user, favorites, tools } = useApp();

  if (!user) return null;

  // Find favorite tool definitions
  const favoriteTools = tools.filter((t) => favorites.includes(t.id));

  if (favoriteTools.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span>Your Favorite Quick Access Tools ({favoriteTools.length})</span>
        </h4>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {favoriteTools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.route}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xs transition-all text-left shrink-0 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <DynamicIcon name={tool.icon} className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {tool.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
