import React, { useState, useRef, useCallback } from 'react';
import { SlidersHorizontal, ArrowLeftRight } from 'lucide-react';

interface ImageCompareSliderProps {
  originalUrl: string;
  processedUrl: string;
  originalSize?: number;
  processedSize?: number;
  className?: string;
}

export const ImageCompareSlider: React.FC<ImageCompareSliderProps> = ({
  originalUrl,
  processedUrl,
  originalSize,
  processedSize,
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 to 100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const percentSavings =
    originalSize && processedSize && originalSize > 0
      ? Math.round(((originalSize - processedSize) / originalSize) * 100)
      : null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>Interactive Quality Comparison</span>
        </div>
        {percentSavings !== null && (
          <span
            className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
              percentSavings > 0
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {percentSavings > 0 ? `${percentSavings}% Smaller` : 'Optimized Output'}
          </span>
        )}
      </div>

      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        className="relative h-64 sm:h-80 w-full overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-950 select-none cursor-ew-resize shadow-md"
      >
        {/* Original Image (Background Right) */}
        <img
          src={originalUrl}
          alt="Original"
          className="absolute inset-0 h-full w-full object-contain"
        />

        {/* Processed Image (Clipped Left) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={processedUrl}
            alt="Processed"
            className="absolute inset-y-0 left-0 h-full max-w-none object-contain"
            style={{ width: containerRef.current?.getBoundingClientRect().width || '100%' }}
          />
        </div>

        {/* Vertical Divider Handle Line */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white shadow-lg pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-xl border border-slate-200">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
        </div>

        {/* Labels Overlay */}
        <div className="absolute bottom-3 left-3 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
          Processed {formatBytes(processedSize)}
        </div>
        <div className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
          Original {formatBytes(originalSize)}
        </div>
      </div>
    </div>
  );
};
