import React, { useState, useRef, useEffect } from 'react';
import { X, Crop as CropIcon, Check, Move } from 'lucide-react';
import { Button } from '../ui/Button';

export interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  originalWidth: number;
  originalHeight: number;
  targetWidth?: number;
  targetHeight?: number;
  onApplyCrop: (cropData: { x: number; y: number; width: number; height: number }) => void;
}

export const CropModal: React.FC<CropModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  originalWidth,
  originalHeight,
  targetWidth = 1280,
  targetHeight = 720,
  onApplyCrop,
}) => {
  if (!isOpen) return null;

  const targetRatio = targetWidth && targetHeight ? targetWidth / targetHeight : 16 / 9;

  const [activeRatioMode, setActiveRatioMode] = useState<'resize' | 'free' | 'square' | 'landscape' | 'custom'>('resize');
  const [customRatioW, setCustomRatioW] = useState<number>(1);
  const [customRatioH, setCustomRatioH] = useState<number>(1);

  // Crop box state in percentage (0..100)
  const [cropState, setCropState] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 10,
    y: 10,
    w: 80,
    h: 80,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);
  const dragType = useRef<string | null>(null);
  const dragStart = useRef<{ mouseX: number; mouseY: number; cropX: number; cropY: number; cropW: number; cropH: number }>({
    mouseX: 0,
    mouseY: 0,
    cropX: 0,
    cropY: 0,
    cropW: 0,
    cropH: 0,
  });

  // Calculate ratio constraint based on selection
  const getSelectedRatio = (): number | null => {
    if (activeRatioMode === 'resize') return targetRatio;
    if (activeRatioMode === 'square') return 1;
    if (activeRatioMode === 'landscape') return 16 / 9;
    if (activeRatioMode === 'custom' && customRatioW > 0 && customRatioH > 0) return customRatioW / customRatioH;
    return null; // freeform
  };

  // Adjust crop box whenever ratio preset changes
  useEffect(() => {
    const ratio = getSelectedRatio();
    if (!ratio) return;

    // Adjust cropState height/width according to ratio relative to original image aspect
    const imageAspect = originalWidth / originalHeight;
    let w = 80;
    let h = (w * imageAspect) / ratio;

    if (h > 90) {
      h = 80;
      w = (h * ratio) / imageAspect;
    }

    setCropState({
      x: Math.max(0, Math.min(100 - w, (100 - w) / 2)),
      y: Math.max(0, Math.min(100 - h, (100 - h) / 2)),
      w: Math.max(10, Math.min(100, w)),
      h: Math.max(10, Math.min(100, h)),
    });
  }, [activeRatioMode, customRatioW, customRatioH]);

  const handleMouseDown = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    dragType.current = type;
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      cropX: cropState.x,
      cropY: cropState.y,
      cropW: cropState.w,
      cropH: cropState.h,
    };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dxPercent = ((ev.clientX - dragStart.current.mouseX) / rect.width) * 100;
      const dyPercent = ((ev.clientY - dragStart.current.mouseY) / rect.height) * 100;

      const ratio = getSelectedRatio();
      const imageAspect = originalWidth / originalHeight;

      if (dragType.current === 'move') {
        const newX = Math.max(0, Math.min(100 - dragStart.current.cropW, dragStart.current.cropX + dxPercent));
        const newY = Math.max(0, Math.min(100 - dragStart.current.cropH, dragStart.current.cropY + dyPercent));
        setCropState((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (dragType.current === 'se') {
        let newW = Math.max(10, Math.min(100 - dragStart.current.cropX, dragStart.current.cropW + dxPercent));
        let newH = Math.max(10, Math.min(100 - dragStart.current.cropY, dragStart.current.cropH + dyPercent));
        if (ratio) {
          newH = (newW * imageAspect) / ratio;
        }
        setCropState((prev) => ({ ...prev, w: newW, h: newH }));
      } else if (dragType.current === 'sw') {
        let newW = Math.max(10, Math.min(dragStart.current.cropX + dragStart.current.cropW, dragStart.current.cropW - dxPercent));
        let newX = dragStart.current.cropX + (dragStart.current.cropW - newW);
        let newH = Math.max(10, Math.min(100 - dragStart.current.cropY, dragStart.current.cropH + dyPercent));
        if (ratio) {
          newH = (newW * imageAspect) / ratio;
        }
        setCropState((prev) => ({ ...prev, x: newX, w: newW, h: newH }));
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      dragType.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleApply = () => {
    const pixelX = Math.round((cropState.x / 100) * originalWidth);
    const pixelY = Math.round((cropState.y / 100) * originalHeight);
    const pixelW = Math.round((cropState.w / 100) * originalWidth);
    const pixelH = Math.round((cropState.h / 100) * originalHeight);

    onApplyCrop({
      x: Math.max(0, pixelX),
      y: Math.max(0, pixelY),
      width: Math.max(1, pixelW),
      height: Math.max(1, pixelH),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CropIcon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Crop Image</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-y-auto">
          {/* Left Canvas Preview */}
          <div className="lg:col-span-8 bg-slate-100 dark:bg-slate-950 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[400px]">
            <div
              ref={containerRef}
              className="relative inline-block overflow-hidden rounded-lg select-none max-h-[500px]"
            >
              <img
                src={imageSrc}
                alt="Source to crop"
                className="max-h-[460px] w-auto object-contain block opacity-60 pointer-events-none"
              />

              {/* Interactive Crop Selection Box */}
              <div
                onMouseDown={(e) => handleMouseDown(e, 'move')}
                className="absolute border-2 border-dashed border-white bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] cursor-move flex items-center justify-center group"
                style={{
                  left: `${cropState.x}%`,
                  top: `${cropState.y}%`,
                  width: `${cropState.w}%`,
                  height: `${cropState.h}%`,
                }}
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
                  <Move className="h-3 w-3" />
                  <span>
                    {Math.round((cropState.w / 100) * originalWidth)} × {Math.round((cropState.h / 100) * originalHeight)} px
                  </span>
                </div>

                {/* Corner & Edge Drag Handles */}
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'nw')}
                  className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-primary rounded-xs cursor-nwse-resize"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'ne')}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-primary rounded-xs cursor-nesw-resize"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'sw')}
                  className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-primary rounded-xs cursor-nesw-resize"
                />
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'se')}
                  className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-primary rounded-xs cursor-nwse-resize"
                />
              </div>
            </div>
          </div>

          {/* Right Aspect Ratio Controls (matching imresizer design) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-900 dark:text-white block">
                Aspect Ratio
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveRatioMode('resize')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeRatioMode === 'resize'
                      ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold">Resize Ratio</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {targetWidth} : {targetHeight} ratio
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRatioMode('free')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeRatioMode === 'free'
                      ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold">Free Form</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">No constraints</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRatioMode('square')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeRatioMode === 'square'
                      ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold">Square</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">1:1 ratio</p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRatioMode('landscape')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    activeRatioMode === 'landscape'
                      ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold">Landscape</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">16:9 ratio</p>
                </button>
              </div>

              {/* Custom Ratio Mode */}
              <button
                type="button"
                onClick={() => setActiveRatioMode('custom')}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeRatioMode === 'custom'
                    ? 'border-primary bg-primary text-white shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <p className="text-xs font-bold">Custom</p>
                <p className={`text-[10px] mt-0.5 ${activeRatioMode === 'custom' ? 'text-white/80' : 'text-slate-400'}`}>
                  Set your own ratio
                </p>
              </button>

              {activeRatioMode === 'custom' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    min="1"
                    value={customRatioW}
                    onChange={(e) => setCustomRatioW(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                  <span className="font-bold text-slate-400">:</span>
                  <input
                    type="number"
                    min="1"
                    value={customRatioH}
                    onChange={(e) => setCustomRatioH(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {/* Instructions checklist matching screenshot */}
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-4 space-y-2 text-xs">
                <p className="font-bold text-slate-700 dark:text-slate-300">Instructions:</p>
                <ul className="space-y-1 text-[11px] text-slate-500 list-disc pl-4">
                  <li>Drag the crop area to move it</li>
                  <li>Use corner handles to adjust the crop box</li>
                  <li>Aspect ratio is locked to your selected target ratio</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="md" onClick={onClose} fullWidth>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={handleApply} leftIcon={Check} fullWidth>
                Apply Crop
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
