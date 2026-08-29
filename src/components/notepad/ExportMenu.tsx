import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Code, FileCode, Printer, Copy, Check, ChevronDown, File } from 'lucide-react';
import {
  htmlToMarkdown,
  generateExportableHtml,
  generatePdfFromNote,
  generateDocxFromNote,
  printNote,
  triggerFileDownload,
  sanitizeFileName,
} from '../../utils/notepadUtils';
import { useApp } from '../../context/AppContext';

interface ExportMenuProps {
  title: string;
  contentHtml: string;
  plainText: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
  title,
  contentHtml,
  plainText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleDownloadTxt = () => {
    const filename = `${sanitizeFileName(title)}.txt`;
    triggerFileDownload(plainText, filename, 'text/plain;charset=utf-8');
    showToast('Downloaded as .TXT', 'success');
    setIsOpen(false);
  };

  const handleDownloadMd = () => {
    const md = htmlToMarkdown(contentHtml);
    const filename = `${sanitizeFileName(title)}.md`;
    triggerFileDownload(md, filename, 'text/markdown;charset=utf-8');
    showToast('Downloaded as .MD (Markdown)', 'success');
    setIsOpen(false);
  };

  const handleExportHtml = () => {
    const fullHtml = generateExportableHtml(title, contentHtml);
    const filename = `${sanitizeFileName(title)}.html`;
    triggerFileDownload(fullHtml, filename, 'text/html;charset=utf-8');
    showToast('Exported as standalone .HTML', 'success');
    setIsOpen(false);
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      await generatePdfFromNote(title, plainText);
      showToast('Exported PDF successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to export PDF', 'error');
    } finally {
      setIsExportingPdf(false);
      setIsOpen(false);
    }
  };

  const handleExportDocx = async () => {
    try {
      setIsExportingDocx(true);
      await generateDocxFromNote(title, plainText);
      showToast('Exported Word (.DOCX) document', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to export DOCX', 'error');
    } finally {
      setIsExportingDocx(false);
      setIsOpen(false);
    }
  };

  const handlePrint = () => {
    printNote(title, contentHtml);
    setIsOpen(false);
  };

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      showToast('Note content copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
      setIsOpen(false);
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer select-none"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute end-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl z-50 text-xs select-none animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100 dark:divide-slate-800">
          <div className="py-1 space-y-0.5">
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left rtl:text-right"
            >
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="font-bold">Plain Text (.txt)</p>
                <p className="text-[10px] text-slate-400">Standard text file</p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleDownloadMd}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left rtl:text-right"
            >
              <Code className="w-4 h-4 text-primary" />
              <div>
                <p className="font-bold">Markdown (.md)</p>
                <p className="text-[10px] text-slate-400">Formatted with headers & lists</p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleExportHtml}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left rtl:text-right"
            >
              <FileCode className="w-4 h-4 text-pink-600 dark:text-pink-400" />
              <div>
                <p className="font-bold">Web Page (.html)</p>
                <p className="text-[10px] text-slate-400">Clean styled HTML file</p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left rtl:text-right disabled:opacity-50"
            >
              <File className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <div>
                <p className="font-bold">{isExportingPdf ? 'Generating PDF...' : 'PDF Document (.pdf)'}</p>
                <p className="text-[10px] text-slate-400">Print-ready A4 document</p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left rtl:text-right disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-bold">{isExportingDocx ? 'Generating Word...' : 'Word Document (.docx)'}</p>
                <p className="text-[10px] text-slate-400">Microsoft Word document</p>
              </div>
            </button>
          </div>

          <div className="py-1 space-y-0.5">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left rtl:text-right"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Note</span>
            </button>

            <button
              type="button"
              onClick={handleCopyAll}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left rtl:text-right"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4 text-slate-500" />
              )}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
