import React, { useState, useEffect, useRef } from 'react';
import { UploadedFileItem } from '../../types';
import { extractColorPalette } from '../../engine/imageEngine';
import { useApp } from '../../context/AppContext';
import { UploadZone } from '../common/UploadZone';
import { Button } from '../ui/Button';
import { Pipette, Copy, Check } from 'lucide-react';

export const ColorPickerToolView: React.FC = () => {
  const { showToast } = useApp();
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [palette, setPalette] = useState<string[]>([]);
  const [hoveredColor, setHoveredColor] = useState<string>('#3B82F6');
  const [selectedColor, setSelectedColor] = useState<string>('#3B82F6');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFile = files[0];

  useEffect(() => {
    if (currentFile) {
      extractColorPalette(currentFile.file).then((res) => {
        setPalette(res.palette);
        setSelectedColor(res.dominant);
      });

      // Draw onto canvas for pixel inspection
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0);
      };
      img.src = currentFile.previewUrl;
    }
  }, [currentFile]);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    showToast(`Copied ${hex} to clipboard!`, 'success');
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
      setHoveredColor(hex);
    } catch {}
  };

  const handleCanvasClick = () => {
    setSelectedColor(hoveredColor);
    copyToClipboard(hoveredColor);
  };

  return (
    <div className="space-y-8">
      {files.length === 0 ? (
        <UploadZone
          onFilesSelected={(newFiles) => setFiles(newFiles)}
          multiple={false}
          maxFileSizeMB={40}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Pipette className="h-4 w-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Color Palette</h3>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setFiles([]);
                    setPalette([]);
                  }}
                >
                  Change Photo
                </Button>
              </div>

              {/* Selected / Eyedropper Color Preview Card */}
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                <div className="flex items-center gap-4">
                  <div
                    className="h-14 w-14 rounded-xl border shadow-inner shrink-0"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Selected Color</span>
                    <h4 className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
                      {selectedColor}
                    </h4>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  leftIcon={copiedHex === selectedColor ? Check : Copy}
                  onClick={() => copyToClipboard(selectedColor)}
                >
                  {copiedHex === selectedColor ? 'Copied to Clipboard!' : 'Copy Color Code'}
                </Button>
              </div>

              {/* Dominant Palette Swatches */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Dominant Harmonic Palette
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {palette.map((hex, idx) => (
                    <button
                      key={idx}
                      onClick={() => copyToClipboard(hex)}
                      className="group p-2 rounded-xl border border-slate-200 bg-white hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900 text-left transition-all"
                    >
                      <div className="h-10 w-full rounded-lg border mb-1.5" style={{ backgroundColor: hex }} />
                      <p className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600">
                        {hex}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-center dark:border-slate-800 min-h-[420px] flex flex-col items-center justify-center relative">
              <div className="relative inline-block overflow-hidden rounded-xl border border-slate-800 cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  onMouseMove={handleCanvasMouseMove}
                  onClick={handleCanvasClick}
                  className="max-h-[380px] w-auto object-contain block cursor-crosshair"
                />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-4 w-4 rounded-full border border-white" style={{ backgroundColor: hoveredColor }} />
                <span className="text-xs font-mono text-slate-300">
                  Hover: {hoveredColor} • Click anywhere to sample & copy
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
