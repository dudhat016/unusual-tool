import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Sparkles, SlidersHorizontal, ArrowLeftRight } from 'lucide-react';
import { formatFileSize } from '../../engine/imageEngine';
import { Button, IconButton } from '../ui';

interface BeforeAfterComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalUrl: string;
  resultUrl: string;
  originalName: string;
  resultName?: string;
  originalSize: number;
  resultSize: number;
  originalDimensions?: { width: number; height: number };
  resultDimensions?: { width: number; height: number };
  downloadUrl?: string;
}

export const BeforeAfterComparisonModal: React.FC<BeforeAfterComparisonModalProps> = ({
  isOpen,
  onClose,
  originalUrl,
  resultUrl,
  originalName,
  resultName,
  originalSize,
  resultSize,
  originalDimensions,
  resultDimensions,
  downloadUrl,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'difference'>('slider');

  const containerRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef<boolean>(false);
  const startPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMouseDownSlider = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      setSliderPosition((x / rect.width) * 100);
    } else if (isPanningRef.current) {
      setPan({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    isPanningRef.current = false;
  };

  const handleStartPan = (e: React.MouseEvent) => {
    if (zoom > 1 && !isDragging) {
      isPanningRef.current = true;
      startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const resetTransform = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSliderPosition(50);
  };

  const sizeDiff = originalSize - resultSize;
  const savingsPercent =
    originalSize > 0 ? Math.round(((originalSize - resultSize) / originalSize) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-sm"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="relative flex h-full max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden text-white">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white truncate max-w-md">
                {originalName}
              </h3>
              <p className="text-xs text-slate-400">
                Original: {formatFileSize(originalSize)} • Processed: {formatFileSize(resultSize)}
                {savingsPercent > 0 && (
                  <span className="ml-2 font-semibold text-emerald-400">
                    (-{savingsPercent}% / -{formatFileSize(sizeDiff)})
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex rounded-lg border border-slate-700 bg-slate-800/80 p-0.5 text-xs gap-1">
              <Button
                variant={viewMode === 'slider' ? 'primary' : 'ghost'}
                size="xs"
                onClick={() => setViewMode('slider')}
              >
                Split Slider
              </Button>
              <Button
                variant={viewMode === 'side-by-side' ? 'primary' : 'ghost'}
                size="xs"
                onClick={() => setViewMode('side-by-side')}
              >
                Side-by-Side
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
              <IconButton
                icon={ZoomOut}
                aria-label="Zoom Out"
                size="xs"
                variant="ghost"
                onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
              />
              <span className="text-xs font-mono text-slate-300 w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <IconButton
                icon={ZoomIn}
                aria-label="Zoom In"
                size="xs"
                variant="ghost"
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              />
              <IconButton
                icon={RotateCcw}
                aria-label="Reset View"
                size="xs"
                variant="ghost"
                onClick={resetTransform}
              />
            </div>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download={resultName || `processed_${originalName}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            )}

            <IconButton
              icon={X}
              aria-label="Close modal"
              size="sm"
              variant="ghost"
              onClick={onClose}
            />
          </div>
        </div>

        {/* Viewport Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleStartPan}
          className={`relative flex-1 overflow-hidden bg-slate-950/90 flex items-center justify-center select-none ${
            zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          }`}
        >
          {viewMode === 'slider' ? (
            <div
              className="relative max-h-full max-w-full overflow-hidden"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transformOrigin: 'center center',
              }}
            >
              {/* Processed / Result Image (Underneath) */}
              <img
                src={resultUrl}
                alt="Processed result"
                className="max-h-[68vh] w-auto object-contain pointer-events-none"
              />

              {/* Original Image (Clipped on top) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src={originalUrl}
                  alt="Original"
                  className="max-h-[68vh] w-auto object-contain pointer-events-none"
                />
              </div>

              {/* Divider Line & Handle */}
              <div
                className="absolute top-0 bottom-0 z-20 cursor-ew-resize flex items-center justify-center"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                onMouseDown={handleMouseDownSlider}
              >
                <div className="h-full w-0.5 bg-white shadow-lg" />
                <div className="absolute flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-lg">
                  <ArrowLeftRight className="h-4 w-4" />
                </div>
              </div>

              {/* Badges */}
              <span className="absolute bottom-3 left-3 z-10 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
                Original ({formatFileSize(originalSize)})
              </span>
              <span className="absolute bottom-3 right-3 z-10 rounded-md bg-primary/90 px-2 py-1 text-[11px] font-semibold text-primary-foreground backdrop-blur-xs">
                Processed ({formatFileSize(resultSize)})
              </span>
            </div>
          ) : (
            <div
              className="grid grid-cols-2 gap-4 p-4 max-h-full w-full"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              }}
            >
              <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900/60 p-2 border border-slate-800">
                <p className="text-xs font-semibold text-slate-400 mb-2">Original</p>
                <img
                  src={originalUrl}
                  alt="Original"
                  className="max-h-[58vh] object-contain rounded-lg"
                />
                <p className="text-[11px] text-slate-400 mt-2">
                  {originalDimensions
                    ? `${originalDimensions.width}×${originalDimensions.height}px • `
                    : ''}
                  {formatFileSize(originalSize)}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900/60 p-2 border border-slate-800">
                <p className="text-xs font-semibold text-blue-400 mb-2">Processed Result</p>
                <img
                  src={resultUrl}
                  alt="Processed"
                  className="max-h-[58vh] object-contain rounded-lg"
                />
                <p className="text-[11px] text-emerald-400 mt-2 font-medium">
                  {resultDimensions
                    ? `${resultDimensions.width}×${resultDimensions.height}px • `
                    : ''}
                  {formatFileSize(resultSize)} (-{savingsPercent}%)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/90 px-5 py-2.5 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-4">
            <span>
              Drag split handle to compare quality & compression differences
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
