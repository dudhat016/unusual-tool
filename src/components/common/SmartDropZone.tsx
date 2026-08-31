import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Upload,
  Sparkles,
  FileText,
  Minimize2,
  Scaling,
  RefreshCw,
  Scissors,
  CheckCircle2,
  ArrowRight,
  X,
  FileCheck,
  Zap,
} from 'lucide-react';
import { Link } from './Link';

interface RecommendedTool {
  id: string;
  name: string;
  route: string;
  iconName: string;
  badge: string;
  color: string;
}

export const SmartDropZone: React.FC = () => {
  const { navigate, tools } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    sizeKb: number;
    sizeFormatted: string;
    type: string;
    ext: string;
    dimensions?: { width: number; height: number };
  } | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const processFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
    const sizeKb = Math.round(file.size / 1024);
    const sizeFormatted = formatFileSize(file.size);

    const fileData = {
      name: file.name,
      sizeKb,
      sizeFormatted,
      type: file.type,
      ext,
    };

    if (file.type.startsWith('image/')) {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        setSelectedFile({
          ...fileData,
          dimensions: { width: img.width, height: img.height },
        });
        URL.revokeObjectURL(objectUrl);
      };
      img.onerror = () => {
        setSelectedFile(fileData);
      };
      img.src = objectUrl;
    } else {
      setSelectedFile(fileData);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Compute smart recommendations based on file analysis
  const getRecommendations = (): RecommendedTool[] => {
    if (!selectedFile) return [];

    const recs: RecommendedTool[] = [];
    const isImage = selectedFile.type.startsWith('image/') || ['JPG', 'PNG', 'WEBP', 'HEIC', 'AVIF', 'GIF'].includes(selectedFile.ext);
    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.ext === 'PDF';

    if (isPdf) {
      recs.push({
        id: 'compress-pdf',
        name: 'Compress PDF Document',
        route: '/compress-pdf-to-200kb',
        iconName: 'Minimize2',
        badge: 'Recommended',
        color: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900',
      });
      recs.push({
        id: 'pdf-to-png',
        name: 'Convert PDF to Images',
        route: '/convert/pdf-to-png',
        iconName: 'RefreshCw',
        badge: 'Format',
        color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900',
      });
      return recs;
    }

    if (isImage) {
      // Large file size -> recommend compression
      if (selectedFile.sizeKb > 300) {
        recs.push({
          id: 'compress',
          name: `Compress ${selectedFile.ext} (${selectedFile.sizeFormatted} → <100KB)`,
          route: '/compress',
          iconName: 'Minimize2',
          badge: 'High Impact',
          color: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900',
        });
      }

      // Format recommendations
      if (selectedFile.ext !== 'WEBP') {
        recs.push({
          id: 'convert-webp',
          name: `Convert ${selectedFile.ext} to WebP (Next-Gen)`,
          route: `/convert/${selectedFile.ext.toLowerCase()}-to-webp`,
          iconName: 'RefreshCw',
          badge: 'Next-Gen',
          color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900',
        });
      } else {
        recs.push({
          id: 'convert-png',
          name: 'Convert WebP to Transparent PNG',
          route: '/convert/webp-to-png',
          iconName: 'RefreshCw',
          badge: 'Universal',
          color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900',
        });
      }

      // Large dimensions -> recommend resizer
      if (selectedFile.dimensions && (selectedFile.dimensions.width > 1920 || selectedFile.dimensions.height > 1080)) {
        recs.push({
          id: 'resize',
          name: `Resize Dimensions (${selectedFile.dimensions.width}×${selectedFile.dimensions.height} → 1080p)`,
          route: '/resize',
          iconName: 'Scaling',
          badge: 'Resolution',
          color: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900',
        });
      }

      // AI Super Tool recommendation
      recs.push({
        id: 'bg-remover',
        name: 'AI Background Remover',
        route: '/background-remover',
        iconName: 'Sparkles',
        badge: 'AI Magic',
        color: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900',
      });
    }

    return recs;
  };

  const recommendations = getRecommendations();

  return (
    <div className="w-full max-w-3xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept="image/*,application/pdf"
        className="hidden"
      />

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer rounded-3xl border-2 border-dashed p-6 sm:p-10 text-center transition-all ${
            dragActive
              ? 'border-primary bg-primary/10 scale-[1.01] shadow-xl'
              : 'border-slate-300/80 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 hover:border-primary/60 hover:bg-slate-50/50 dark:hover:bg-slate-850 shadow-sm'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-xs">
              <Upload className="h-7 w-7" />
            </div>

            <div>
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Drag & Drop any photo or PDF here
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Auto-detects file format & size to recommend instant tools • Or{' '}
                <span className="text-primary font-bold hover:underline">Browse File</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-slate-400 font-medium">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
                JPG & PNG
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
                WebP & AVIF
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
                HEIC & SVG
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
                PDF Documents
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-primary/30 bg-white dark:bg-slate-900 p-6 shadow-lg space-y-5 text-left">
          {/* Header File Card */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center justify-center shrink-0">
                <FileCheck className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                    {selectedFile.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                    {selectedFile.ext}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  <span>Size: {selectedFile.sizeFormatted}</span>
                  {selectedFile.dimensions && (
                    <>
                      <span>•</span>
                      <span>Dimensions: {selectedFile.dimensions.width} × {selectedFile.dimensions.height} px</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedFile(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Clear file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Smart AI Recommendations Header */}
          <div>
            <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Smart Tool Recommendations for Your File</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  href={rec.route}
                  className={`group flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all hover:scale-[1.01] cursor-pointer ${rec.color}`}
                >
                  <div className="min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-wider opacity-80">
                      {rec.badge}
                    </span>
                    <p className="text-xs font-extrabold truncate mt-0.5">
                      {rec.name}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
