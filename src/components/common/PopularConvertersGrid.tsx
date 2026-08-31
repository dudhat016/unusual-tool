import React from 'react';
import { POPULAR_CONVERTER_PAIRS } from '../../config/converterTools';
import { RefreshCw } from 'lucide-react';
import { Link } from './Link';

export const PopularConvertersGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {POPULAR_CONVERTER_PAIRS.map((pair) => (
        <Link
          key={pair.slug}
          href={`/convert-image-tools/${pair.slug}`}
          className="group flex flex-col items-start justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 text-left shadow-2xs hover:border-blue-500 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all"
        >
          <div className="flex items-center gap-1.5 mb-1.5 w-full justify-between">
            <div className="flex items-center gap-1">
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {pair.fromExt}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">to</span>
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                {pair.toExt}
              </span>
            </div>
            <RefreshCw className="h-3 w-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>

          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 transition-colors line-clamp-1">
            {pair.title}
          </p>
          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
            {pair.description}
          </p>
        </Link>
      ))}
    </div>
  );
};
