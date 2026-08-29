import React from 'react';
import { ToolFormatSpecs } from '../../types/seo';
import { FileCheck, Shield, HardDrive, Wifi, DollarSign, Layers } from 'lucide-react';

interface ToolSpecsTableProps {
  toolName: string;
  specs: ToolFormatSpecs;
  categoryName?: string;
}

export const ToolSpecsTable: React.FC<ToolSpecsTableProps> = ({ toolName, specs, categoryName }) => {
  if (!specs) return null;

  const inFormats = Array.isArray(specs.inputFormats) ? specs.inputFormats.join(', ') : 'All standard formats';
  const outFormats = Array.isArray(specs.outputFormats) ? specs.outputFormats.join(', ') : 'Direct output';

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {toolName} Technical Specifications
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {categoryName ? `${categoryName} • ` : ''}Factual architecture and verified format support
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
          Client-Verified
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-500 dark:text-slate-400">Supported Formats</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">
              {inFormats} → {outFormats}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <HardDrive className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-500 dark:text-slate-400">Max File Size</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">
              {specs.maxFileSizeMB && specs.maxFileSizeMB > 0 ? `Up to ${specs.maxFileSizeMB} MB per file` : 'No file size constraint'}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <Layers className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-500 dark:text-slate-400">Processing Architecture</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">
              {specs.processingMethod || 'Client-Side In-Browser Engine'}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-500 dark:text-slate-400">Privacy & Security</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">
              {specs.privacyGuarantee || 'Zero server uploads. 100% Private.'}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <Wifi className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-500 dark:text-slate-400">Offline / Network Usage</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">
              {specs.offlineSupported ? 'Fully offline-ready after load' : 'Requires network connection'}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-500 dark:text-slate-400">Pricing & Account Requirement</div>
            <div className="font-bold text-slate-900 dark:text-white mt-0.5">
              {specs.pricing || '100% Free'} • No Sign-up
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
