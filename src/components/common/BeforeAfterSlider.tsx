import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Columns, SplitSquareVertical } from 'lucide-react';

interface BeforeAfterSliderProps {
  originalUrl: string;
  processedUrl: string;
  originalLabel?: string;
  processedLabel?: string;
  originalDetails?: string;
  processedDetails?: string;
  className?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalUrl,
  processedUrl,
  originalLabel = 'ORIGINAL',
  processedLabel = 'RESULT',
  originalDetails,
  processedDetails,
  className = '',
}) => {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = Fit, 1.5, 2, 3
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');

  const containerRef = useRef<HTMLDivElement>(null);
  const sliderFrameRef = useRef<HTMLDivElement>(null);

  // Divider dragging
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderFrameRef.current) return;
    const rect = sliderFrameRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPos(percent);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging) {
        handleSliderMove(e.touches[0].clientX);
      } else if (isPanning && zoomLevel > 1) {
        const dx = e.touches[0].clientX - panStart.x;
        const dy = e.touches[0].clientY - panStart.y;
        setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    },
    [isDragging, isPanning, zoomLevel, panStart, handleSliderMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        handleSliderMove(e.clientX);
      } else if (isPanning && zoomLevel > 1) {
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    },
    [isDragging, isPanning, zoomLevel, panStart, handleSliderMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isDragging || isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isPanning, handleMouseMove, handleMouseUp, handleTouchMove]);

  // Handle ESC for fullscreen exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(3, +(prev + 0.5).toFixed(1)));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(1, +(prev - 0.5).toFixed(1));
      if (next === 1) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSliderPos(50);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden shadow-xl ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen bg-slate-950/95 p-4' : className
      }`}
    >
      {/* Control Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-slate-200 text-xs backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'slider' ? 'side-by-side' : 'slider')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Toggle View Mode"
          >
            {viewMode === 'slider' ? <Columns className="w-3.5 h-3.5" /> : <SplitSquareVertical className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline font-medium">{viewMode === 'slider' ? 'Side by Side' : 'Split Slider'}</span>
          </button>

          {/* Quick labels / metadata */}
          {originalDetails && (
            <span className="hidden md:inline text-slate-400 bg-slate-800/60 px-2 py-1 rounded">
              Original: {originalDetails}
            </span>
          )}
          {processedDetails && (
            <span className="hidden md:inline text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2 py-1 rounded">
              Result: {processedDetails}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-mono font-bold text-slate-300">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {zoomLevel > 1 && (
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Reset Zoom & Pan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors ml-1"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Visual Stage */}
      <div
        className={`relative flex-1 select-none overflow-hidden flex items-center justify-center p-2 min-h-[320px] max-h-[600px] ${
          isFullscreen ? 'max-h-none h-full' : ''
        }`}
        style={{
          cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
        }}
        onMouseDown={(e) => {
          if (zoomLevel > 1 && e.button === 0) {
            setIsPanning(true);
            setPanStart({ x: e.clientX, y: e.clientY });
          }
        }}
        onTouchStart={(e) => {
          if (zoomLevel > 1) {
            setIsPanning(true);
            setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
          }
        }}
      >
        {viewMode === 'side-by-side' ? (
          /* Side by Side Comparison */
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full max-w-5xl items-center"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 p-2 flex flex-col items-center justify-center h-full">
              <span className="absolute top-3 left-3 z-10 rounded-md bg-black/70 px-2.5 py-1 text-[11px] font-bold tracking-wider text-slate-200 backdrop-blur-md">
                {originalLabel}
              </span>
              <img
                src={originalUrl}
                alt="Original input"
                className="max-h-[440px] w-full object-contain pointer-events-none"
              />
            </div>

            <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 p-2 flex flex-col items-center justify-center h-full">
              <span className="absolute top-3 right-3 z-10 rounded-md bg-primary/90 px-2.5 py-1 text-[11px] font-bold tracking-wider text-primary-foreground backdrop-blur-md">
                {processedLabel}
              </span>
              <img
                src={processedUrl}
                alt="Processed output"
                className="max-h-[440px] w-full object-contain pointer-events-none"
              />
            </div>
          </div>
        ) : (
          /* Interactive Curtain Slider */
          <div
            ref={sliderFrameRef}
            className="relative w-full h-full max-w-4xl max-h-[500px] flex items-center justify-center select-none"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            {/* Background: Processed Result */}
            <img
              src={processedUrl}
              alt="Processed output"
              className="block h-full max-h-[500px] w-auto max-w-full object-contain pointer-events-none mx-auto rounded-lg"
            />

            {/* Foreground: Clipped Original Image */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
              style={{
                clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
              }}
            >
              <img
                src={originalUrl}
                alt="Original input"
                className="block h-full max-h-[500px] w-auto max-w-full object-contain pointer-events-none mx-auto rounded-lg"
              />
            </div>

            {/* Divider Line & Grab Handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] pointer-events-none z-10"
              style={{ left: `${sliderPos}%` }}
            >
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDragging(true);
                  handleSliderMove(e.clientX);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setIsDragging(true);
                  handleSliderMove(e.touches[0].clientX);
                }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 shadow-2xl border-2 border-primary pointer-events-auto cursor-ew-resize hover:scale-115 active:scale-95 transition-transform"
              >
                <svg className="h-4 w-4 fill-current text-slate-800" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41zM15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
                </svg>
              </div>
            </div>

            {/* In-frame Badges */}
            <div className="absolute top-3 left-3 pointer-events-none z-10">
              <span className="rounded-lg bg-black/75 px-3 py-1 text-[11px] font-bold tracking-wider text-white backdrop-blur-md shadow">
                {originalLabel}
              </span>
            </div>
            <div className="absolute top-3 right-3 pointer-events-none z-10">
              <span className="rounded-lg bg-primary/90 px-3 py-1 text-[11px] font-bold tracking-wider text-primary-foreground backdrop-blur-md shadow">
                {processedLabel}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Drag instructions on touch or zoom */}
      {zoomLevel > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[10px] text-slate-300 backdrop-blur-md border border-slate-700">
            Click & drag image to pan viewport
          </span>
        </div>
      )}
    </div>
  );
};
