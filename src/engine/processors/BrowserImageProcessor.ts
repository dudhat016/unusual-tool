import { IImageProcessor, ProcessorContext } from './IImageProcessor';
import { UniversalProcessResult, QualityMetrics } from '../../types';
import { detectImageFormat } from '../formatDetector';
import { applyOrientationTransform } from '../exifHelper';
import { runPixelWorker } from '../worker/pixelWorker';
import { IntelligentTargetCompressor } from '../compressor/IntelligentTargetCompressor';
import { decodeAdvancedImageFile, encodeCanvasToTiff, encodeCanvasToIco } from '../advancedDecoders';

export class BrowserImageProcessor implements IImageProcessor {
  readonly name = 'Browser Canvas & Web Worker Engine';
  readonly type = 'browser' as const;

  canHandle(toolId: string): boolean {
    const browserTools = [
      'resize-image',
      'compress-image',
      'crop-image',
      'convert-image',
      'passport-photo-maker',
      'social-resizer',
      'photo-effects',
      'border-maker',
      'watermark-image',
      'metadata-tool',
      'color-picker',
    ];
    return browserTools.includes(toolId);
  }

  async process(file: File, context: ProcessorContext): Promise<UniversalProcessResult> {
    const startTime = performance.now();
    const { toolId, options = {}, onProgress } = context;

    onProgress?.(10, 'Detecting image structure and EXIF metadata...');
    const detected = await detectImageFormat(file);

    if (!detected.isSupported && detected.validationError) {
      throw new Error(detected.validationError);
    }

    onProgress?.(25, 'Loading image into memory...');
    const { img, origW, origH, orientation } = await this.loadImage(file, detected.exifOrientation);

    onProgress?.(50, 'Executing client-side image transformation...');

    let canvas: HTMLCanvasElement;
    let outWidth = origW;
    let outHeight = origH;
    let outputMime = file.type || 'image/jpeg';
    let outputQuality = 0.92;
    let fileNameSuffix = 'processed';
    let extractedText: string | undefined;
    let metadata: Record<string, any> | undefined;
    let palette: string[] | undefined;
    let precomputedBlob: Blob | null = null;
    let qualityMetrics: QualityMetrics | undefined;

    switch (toolId) {
      case 'resize-image': {
        const res = this.handleResize(img, origW, origH, options);
        canvas = res.canvas;
        outWidth = res.width;
        outHeight = res.height;
        outputMime = options.format || (detected.hasAlpha ? 'image/png' : 'image/jpeg');
        outputQuality = options.quality || 0.92;
        fileNameSuffix = `resized_${outWidth}x${outHeight}`;
        break;
      }

      case 'compress-image': {
        const res = await this.handleCompress(img, origW, origH, file.size, options, onProgress);
        canvas = res.canvas;
        outWidth = res.canvas.width;
        outHeight = res.canvas.height;
        outputMime = res.format || options.outputFormat || 'image/jpeg';
        outputQuality = res.quality;
        precomputedBlob = res.blob || null;
        qualityMetrics = res.metrics;
        fileNameSuffix = options.targetSizeKb ? `compressed_${options.targetSizeKb}kb` : 'compressed';
        break;
      }

      case 'crop-image': {
        const res = this.handleCrop(img, origW, origH, options);
        canvas = res.canvas;
        outWidth = res.width;
        outHeight = res.height;
        outputMime = options.targetFormat || (options.aspectRatioPreset === 'circle' ? 'image/png' : 'image/jpeg');
        outputQuality = options.quality || 0.95;
        fileNameSuffix = `cropped_${outWidth}x${outHeight}`;
        break;
      }

      case 'convert-image': {
        const res = this.handleConvert(img, origW, origH, options);
        canvas = res.canvas;
        outWidth = res.width;
        outHeight = res.height;
        outputMime = options.targetFormat === 'image/x-icon' ? 'image/png' : options.targetFormat;
        outputQuality = options.quality || 0.92;
        const ext = options.targetFormat === 'image/x-icon' ? 'ico' : options.targetFormat.split('/')[1] || 'png';
        fileNameSuffix = `converted.${ext}`;
        break;
      }

      case 'passport-photo-maker': {
        const res = this.handlePassport(img, origW, origH, options);
        canvas = res.canvas;
        outWidth = res.width;
        outHeight = res.height;
        outputMime = 'image/jpeg';
        outputQuality = 0.98;
        fileNameSuffix = options.generatePrintSheet ? 'passport_sheet_4x6' : 'passport_photo';
        break;
      }

      case 'social-resizer': {
        const res = this.handleSocialResize(img, origW, origH, options);
        canvas = res.canvas;
        outWidth = res.width;
        outHeight = res.height;
        outputMime = 'image/jpeg';
        outputQuality = 0.95;
        fileNameSuffix = res.presetName;
        break;
      }

      case 'photo-effects': {
        const res = await this.handleEffects(img, origW, origH, options);
        canvas = res.canvas;
        outWidth = origW;
        outHeight = origH;
        outputMime = 'image/jpeg';
        outputQuality = 0.95;
        fileNameSuffix = 'effects';
        break;
      }

      case 'border-maker': {
        const res = this.handleBorder(img, origW, origH, options);
        canvas = res.canvas;
        outWidth = res.width;
        outHeight = res.height;
        outputMime = 'image/jpeg';
        outputQuality = 0.95;
        fileNameSuffix = 'framed';
        break;
      }

      case 'watermark-image': {
        const res = this.handleWatermark(img, origW, origH, options);
        canvas = res.canvas;
        outWidth = origW;
        outHeight = origH;
        outputMime = 'image/jpeg';
        outputQuality = 0.95;
        fileNameSuffix = 'watermarked';
        break;
      }

      case 'metadata-tool': {
        const res = this.handleStripMetadata(img, origW, origH, file);
        canvas = res.canvas;
        outWidth = origW;
        outHeight = origH;
        outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        outputQuality = 0.96;
        fileNameSuffix = 'cleaned_no_exif';
        metadata = await this.extractMetadata(file, origW, origH);
        break;
      }

      case 'color-picker': {
        palette = this.extractPalette(img);
        canvas = document.createElement('canvas');
        canvas.width = origW;
        canvas.height = origH;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        fileNameSuffix = 'palette';
        break;
      }

      default: {
        canvas = document.createElement('canvas');
        canvas.width = origW;
        canvas.height = origH;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        break;
      }
    }

    onProgress?.(85, 'Finalizing output encoding...');
    let blob: Blob;

    if (precomputedBlob) {
      blob = precomputedBlob;
    } else if (outputMime === 'image/tiff') {
      blob = await encodeCanvasToTiff(canvas);
    } else if (outputMime === 'image/x-icon') {
      blob = await encodeCanvasToIco(canvas);
    } else {
      blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to encode image to blob'));
          },
          outputMime,
          outputQuality
        );
      });
    }

    const ext = this.getExtensionForMime(outputMime);
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const outName = `${baseName}_${fileNameSuffix}.${ext}`;
    const resultFile = new File([blob], outName, { type: outputMime });
    const downloadUrl = URL.createObjectURL(blob);
    let dataUrl = '';
    try {
      dataUrl = canvas.toDataURL(outputMime, outputQuality);
    } catch {
      dataUrl = URL.createObjectURL(blob);
    }

    onProgress?.(100, 'Processing completed.');
    const processingTime = Math.round(performance.now() - startTime);

    return {
      id: `proc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      originalFile: file,
      resultFile,
      originalSize: file.size,
      resultSize: blob.size,
      originalWidth: origW,
      originalHeight: origH,
      resultWidth: outWidth,
      resultHeight: outHeight,
      processingTime,
      toolId,
      status: 'completed',
      processorType: 'browser',
      blob,
      dataUrl,
      downloadUrl,
      name: outName,
      type: outputMime,
      reductionPercentage: Math.round(((file.size - blob.size) / file.size) * 100),
      extractedText,
      metadata,
      palette,
      qualityMetrics,
    };
  }

  // --- Helper Methods ---

  private async loadImage(
    file: File,
    exifOrientation: number = 1
  ): Promise<{ img: HTMLImageElement; origW: number; origH: number; orientation: number }> {
    const decoded = await decodeAdvancedImageFile(file);
    if (decoded) {
      const dataUrl = decoded.canvas.toDataURL('image/png');
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            img,
            origW: decoded.width,
            origH: decoded.height,
            orientation: exifOrientation,
          });
        };
        img.onerror = reject;
        img.src = dataUrl;
      });
    }

    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        URL.revokeObjectURL(url);
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        resolve({ img, origW: w, origH: h, orientation: exifOrientation });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not decode image file in browser canvas.'));
      };

      img.src = url;
    });
  }

  private handleResize(
    img: HTMLImageElement,
    origW: number,
    origH: number,
    options: any
  ): { canvas: HTMLCanvasElement; width: number; height: number } {
    let targetW = options.width || origW;
    let targetH = options.height || origH;

    if (options.mode === 'percentage') {
      const factor = (options.percentage || 100) / 100;
      targetW = Math.max(1, Math.round(origW * factor));
      targetH = Math.max(1, Math.round(origH * factor));
    } else if (options.mode === 'units') {
      const dpi = options.targetDpi || 300;
      let factor = 1;
      if (options.unit === 'cm') factor = dpi / 2.54;
      else if (options.unit === 'mm') factor = dpi / 25.4;
      else if (options.unit === 'inches') factor = dpi;

      targetW = Math.max(1, Math.round((options.width || 10) * factor));
      targetH = Math.max(1, Math.round((options.height || 10) * factor));
    }

    targetW = Math.max(1, Math.min(16000, targetW));
    targetH = Math.max(1, Math.min(16000, targetH));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas 2D context');

    if (options.interpolation === 'nearest') {
      ctx.imageSmoothingEnabled = false;
    } else {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    const fitMode = options.fitMode || 'stretch';

    if (fitMode === 'crop' || fitMode === 'fill') {
      let sx = 0;
      let sy = 0;
      let sw = origW;
      let sh = origH;

      if (options.cropBounds && options.cropBounds.width > 0 && options.cropBounds.height > 0) {
        sx = options.cropBounds.x;
        sy = options.cropBounds.y;
        sw = options.cropBounds.width;
        sh = options.cropBounds.height;
      } else {
        const scale = Math.max(targetW / origW, targetH / origH);
        sw = targetW / scale;
        sh = targetH / scale;
        sx = (origW - sw) / 2;
        sy = (origH - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
    } else if (fitMode === 'pad') {
      // Background padding with blurred image background
      ctx.fillStyle = options.bgColor || '#1e293b';
      ctx.fillRect(0, 0, targetW, targetH);

      // Draw blurred backdrop
      ctx.save();
      ctx.filter = 'blur(20px) brightness(0.7)';
      ctx.drawImage(img, -20, -20, targetW + 40, targetH + 40);
      ctx.restore();

      // Fit contained image
      const scale = Math.min(targetW / origW, targetH / origH);
      const dw = origW * scale;
      const dh = origH * scale;
      const dx = (targetW - dw) / 2;
      const dy = (targetH - dh) / 2;
      ctx.drawImage(img, 0, 0, origW, origH, dx, dy, dw, dh);
    } else {
      // Default: stretch to exact targetW & targetH
      ctx.drawImage(img, 0, 0, targetW, targetH);
    }

    return { canvas, width: targetW, height: targetH };
  }

  private renderSteppedCanvas(
    img: HTMLImageElement | HTMLCanvasElement,
    srcW: number,
    srcH: number,
    targetW: number,
    targetH: number,
    format: string,
    applySharpen: boolean = true
  ): HTMLCanvasElement {
    let curW = srcW;
    let curH = srcH;
    let curCanvas: HTMLCanvasElement = document.createElement('canvas');
    curCanvas.width = curW;
    curCanvas.height = curH;
    let curCtx = curCanvas.getContext('2d');
    if (!curCtx) throw new Error('Could not create canvas context');

    if (format === 'image/jpeg') {
      curCtx.fillStyle = '#FFFFFF';
      curCtx.fillRect(0, 0, curW, curH);
    }
    curCtx.drawImage(img, 0, 0, curW, curH);

    // Multi-pass stepped downscaling (half-stepping) for crisp, anti-aliased results
    while (curW > targetW * 1.8 && curH > targetH * 1.8) {
      const nextW = Math.max(targetW, Math.round(curW * 0.5));
      const nextH = Math.max(targetH, Math.round(curH * 0.5));
      const nextCanvas = document.createElement('canvas');
      nextCanvas.width = nextW;
      nextCanvas.height = nextH;
      const nextCtx = nextCanvas.getContext('2d');
      if (!nextCtx) break;

      if (format === 'image/jpeg') {
        nextCtx.fillStyle = '#FFFFFF';
        nextCtx.fillRect(0, 0, nextW, nextH);
      }
      nextCtx.imageSmoothingEnabled = true;
      nextCtx.imageSmoothingQuality = 'high';
      nextCtx.drawImage(curCanvas, 0, 0, nextW, nextH);

      curW = nextW;
      curH = nextH;
      curCanvas = nextCanvas;
      curCtx = nextCtx;
    }

    // Final scaling step to exact target dimension
    if (curW !== targetW || curH !== targetH) {
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetW;
      finalCanvas.height = targetH;
      const finalCtx = finalCanvas.getContext('2d');
      if (finalCtx) {
        if (format === 'image/jpeg') {
          finalCtx.fillStyle = '#FFFFFF';
          finalCtx.fillRect(0, 0, targetW, targetH);
        }
        finalCtx.imageSmoothingEnabled = true;
        finalCtx.imageSmoothingQuality = 'high';
        finalCtx.drawImage(curCanvas, 0, 0, targetW, targetH);
        curCanvas = finalCanvas;
        curCtx = finalCtx;
      }
    }

    // Apply subtle high-pass sharpening to keep text and fine details crisp if downscaled
    if (applySharpen && srcW > targetW * 1.25 && curCtx) {
      try {
        const imgData = curCtx.getImageData(0, 0, targetW, targetH);
        const data = imgData.data;
        const width = targetW;
        const height = targetH;
        const copy = new Uint8ClampedArray(data);

        // Unsharp kernel (weight 0.22)
        const weight = 0.22;
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            for (let c = 0; c < 3; c++) {
              const top = copy[((y - 1) * width + x) * 4 + c];
              const bottom = copy[((y + 1) * width + x) * 4 + c];
              const left = copy[(y * width + (x - 1)) * 4 + c];
              const right = copy[(y * width + (x + 1)) * 4 + c];
              const center = copy[idx + c];
              const laplacian = 4 * center - top - bottom - left - right;
              data[idx + c] = Math.min(255, Math.max(0, center + laplacian * weight));
            }
          }
        }
        curCtx.putImageData(imgData, 0, 0);
      } catch (e) {
        // Fallback silently if getImageData fails in certain browser environments
      }
    }

    return curCanvas;
  }

  private async handleCompress(
    img: HTMLImageElement,
    width: number,
    height: number,
    originalSize: number,
    options: any,
    onProgress?: (p: number, msg?: string) => void
  ): Promise<{ canvas: HTMLCanvasElement; quality: number; format?: string; blob?: Blob; metrics?: QualityMetrics }> {
    const isTargetSize = options.mode === 'target-size' || (options.targetSizeKb && options.targetSizeKb > 0);

    if (isTargetSize) {
      const res = await IntelligentTargetCompressor.compressToTargetSize(
        img,
        width,
        height,
        originalSize,
        options,
        onProgress
      );
      return {
        canvas: res.canvas,
        quality: res.quality,
        format: res.format,
        blob: res.blob,
        metrics: res.metrics,
      };
    }

    // Default Quality / Manual Mode
    const format = options.outputFormat || 'image/jpeg';
    const canvas = this.renderSteppedCanvas(img, width, height, width, height, format, false);
    const optimalQuality = options.quality !== undefined ? options.quality : options.mode === 'auto' ? 0.82 : 0.8;
    return { canvas, quality: optimalQuality, format };
  }

  private handleCrop(
    img: HTMLImageElement,
    origW: number,
    origH: number,
    options: any
  ): { canvas: HTMLCanvasElement; width: number; height: number } {
    let x = 0;
    let y = 0;
    let w = origW;
    let h = origH;

    if (options.normalized) {
      // Relative normalized coordinates (0 to 1)
      const nx = Math.max(0, Math.min(0.95, options.normalized.relX ?? 0));
      const ny = Math.max(0, Math.min(0.95, options.normalized.relY ?? 0));
      const nw = Math.max(0.05, Math.min(1 - nx, options.normalized.relWidth ?? 1));
      const nh = Math.max(0.05, Math.min(1 - ny, options.normalized.relHeight ?? 1));

      x = Math.round(nx * origW);
      y = Math.round(ny * origH);
      w = Math.round(nw * origW);
      h = Math.round(nh * origH);
    } else if (options.aspectRatioPreset && options.aspectRatioPreset !== 'free') {
      const preset = options.aspectRatioPreset;
      if (preset === '1:1' || preset === 'circle') {
        const side = Math.min(origW, origH) * 0.9;
        w = side;
        h = side;
        x = (origW - w) / 2;
        y = (origH - h) / 2;
      } else if (preset === '16:9') {
        w = origW * 0.9;
        h = w * (9 / 16);
        if (h > origH) {
          h = origH * 0.9;
          w = h * (16 / 9);
        }
        x = (origW - w) / 2;
        y = (origH - h) / 2;
      } else if (preset === '4:3') {
        w = origW * 0.9;
        h = w * (3 / 4);
        if (h > origH) {
          h = origH * 0.9;
          w = h * (4 / 3);
        }
        x = (origW - w) / 2;
        y = (origH - h) / 2;
      } else if (preset === '9:16') {
        h = origH * 0.9;
        w = h * (9 / 16);
        if (w > origW) {
          w = origW * 0.9;
          h = w * (16 / 9);
        }
        x = (origW - w) / 2;
        y = (origH - h) / 2;
      } else if (preset === '3:2') {
        w = origW * 0.9;
        h = w * (2 / 3);
        if (h > origH) {
          h = origH * 0.9;
          w = h * (3 / 2);
        }
        x = (origW - w) / 2;
        y = (origH - h) / 2;
      } else if (preset === '2:3') {
        h = origH * 0.9;
        w = h * (2 / 3);
        if (w > origW) {
          w = origW * 0.9;
          h = w * (3 / 2);
        }
        x = (origW - w) / 2;
        y = (origH - h) / 2;
      } else {
        x = Math.max(0, Math.min(origW - 10, options.x || 0));
        y = Math.max(0, Math.min(origH - 10, options.y || 0));
        w = Math.max(10, Math.min(origW - x, options.width || origW));
        h = Math.max(10, Math.min(origH - y, options.height || origH));
      }
    } else {
      x = Math.max(0, Math.min(origW - 10, options.x || 0));
      y = Math.max(0, Math.min(origH - 10, options.y || 0));
      w = Math.max(10, Math.min(origW - x, options.width || origW));
      h = Math.max(10, Math.min(origH - y, options.height || origH));
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w);
    canvas.height = Math.round(h);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context');

    if (options.aspectRatioPreset === 'circle') {
      ctx.beginPath();
      const radius = Math.min(w, h) / 2;
      ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    }

    // Draw crop region
    ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

    // Check for rotation or flip
    if (options.rotation || options.flipHorizontal || options.flipVertical) {
      const rot = (options.rotation || 0) % 360;
      const is90or270 = rot === 90 || rot === 270;
      const finalW = is90or270 ? canvas.height : canvas.width;
      const finalH = is90or270 ? canvas.width : canvas.height;

      const transCanvas = document.createElement('canvas');
      transCanvas.width = finalW;
      transCanvas.height = finalH;
      const tCtx = transCanvas.getContext('2d');
      if (tCtx) {
        tCtx.translate(finalW / 2, finalH / 2);
        if (rot !== 0) {
          tCtx.rotate((rot * Math.PI) / 180);
        }
        tCtx.scale(options.flipHorizontal ? -1 : 1, options.flipVertical ? -1 : 1);
        tCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
        return { canvas: transCanvas, width: finalW, height: finalH };
      }
    }

    return { canvas, width: Math.round(w), height: Math.round(h) };
  }

  private handleConvert(
    img: HTMLImageElement,
    width: number,
    height: number,
    options: any
  ): { canvas: HTMLCanvasElement; width: number; height: number } {
    if (options.targetFormat === 'image/x-icon') {
      const icoCanvas = document.createElement('canvas');
      icoCanvas.width = 256;
      icoCanvas.height = 256;
      const ctx = icoCanvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, 256, 256);
      return { canvas: icoCanvas, width: 256, height: 256 };
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context');

    if (options.targetFormat === 'image/jpeg') {
      ctx.fillStyle = options.backgroundColorForTransparent || '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.drawImage(img, 0, 0, width, height);
    return { canvas, width, height };
  }

  private handlePassport(
    img: HTMLImageElement,
    origW: number,
    origH: number,
    options: any
  ): { canvas: HTMLCanvasElement; width: number; height: number } {
    const dpi = 300;
    let targetW = 600; // 2x2 inches (US)
    let targetH = 600;

    if (options.preset === 'eu-schengen' || options.preset === 'uk-passport') {
      targetW = Math.round((35 / 25.4) * dpi); // 413px
      targetH = Math.round((45 / 25.4) * dpi); // 531px
    } else if (options.preset === 'india-passport') {
      targetW = Math.round((35 / 25.4) * dpi);
      targetH = Math.round((35 / 25.4) * dpi);
    }

    const singleCanvas = document.createElement('canvas');
    singleCanvas.width = targetW;
    singleCanvas.height = targetH;
    const sCtx = singleCanvas.getContext('2d');
    if (!sCtx) throw new Error('Could not create passport canvas');

    const bgMap: Record<string, string> = {
      white: '#FFFFFF',
      blue: '#2B70C9',
      red: '#D32F2F',
      'light-grey': '#E0E0E0',
      custom: options.customBgHex || '#FFFFFF',
    };
    sCtx.fillStyle = bgMap[options.backgroundColor] || '#FFFFFF';
    sCtx.fillRect(0, 0, targetW, targetH);

    const srcRatio = origW / origH;
    const dstRatio = targetW / targetH;
    let sw = origW;
    let sh = origH;
    let sx = 0;
    let sy = 0;

    if (srcRatio > dstRatio) {
      sw = origH * dstRatio;
      sx = (origW - sw) / 2;
    } else {
      sh = origW / dstRatio;
      sy = (origH - sh) * 0.2;
    }
    sCtx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);

    if (options.generatePrintSheet) {
      const sheetW = 4 * dpi; // 1200px
      const sheetH = 6 * dpi; // 1800px
      const sheetCanvas = document.createElement('canvas');
      sheetCanvas.width = sheetW;
      sheetCanvas.height = sheetH;
      const sheetCtx = sheetCanvas.getContext('2d');
      if (sheetCtx) {
        sheetCtx.fillStyle = '#FFFFFF';
        sheetCtx.fillRect(0, 0, sheetW, sheetH);

        const cols = 2;
        const rows = options.preset === 'us-passport' ? 2 : 3;
        const gapX = Math.round((sheetW - cols * targetW) / (cols + 1));
        const gapY = Math.round((sheetH - rows * targetH) / (rows + 1));

        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            const posX = gapX + c * (targetW + gapX);
            const posY = gapY + r * (targetH + gapY);
            sheetCtx.drawImage(singleCanvas, posX, posY, targetW, targetH);
            sheetCtx.strokeStyle = '#D1D5DB';
            sheetCtx.lineWidth = 1;
            sheetCtx.setLineDash([4, 4]);
            sheetCtx.strokeRect(posX, posY, targetW, targetH);
            sheetCtx.setLineDash([]);
          }
        }
        return { canvas: sheetCanvas, width: sheetW, height: sheetH };
      }
    }

    return { canvas: singleCanvas, width: targetW, height: targetH };
  }

  private handleSocialResize(
    img: HTMLImageElement,
    origW: number,
    origH: number,
    options: any
  ): { canvas: HTMLCanvasElement; width: number; height: number; presetName: string } {
    const presetsMap: Record<string, { w: number; h: number; name: string }> = {
      'ig-square': { w: 1080, h: 1080, name: 'Instagram_Post' },
      'ig-portrait': { w: 1080, h: 1350, name: 'Instagram_Portrait' },
      'ig-story': { w: 1080, h: 1920, name: 'Instagram_Story' },
      'yt-thumb': { w: 1280, h: 720, name: 'YouTube_Thumbnail' },
      'yt-banner': { w: 2560, h: 1440, name: 'YouTube_Banner' },
      'fb-post': { w: 1200, h: 630, name: 'Facebook_Post' },
      'fb-cover': { w: 820, h: 312, name: 'Facebook_Cover' },
      'tw-post': { w: 1600, h: 900, name: 'Twitter_Post' },
      'li-banner': { w: 1584, h: 396, name: 'LinkedIn_Banner' },
      'tiktok-video': { w: 1080, h: 1920, name: 'TikTok_Cover' },
    };

    const selected = presetsMap[options.presetId] || { w: 1080, h: 1080, name: 'Social_Post' };
    const targetW = selected.w;
    const targetH = selected.h;

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas');

    if (options.fitMode === 'blur-fill') {
      ctx.save();
      ctx.filter = 'blur(28px) brightness(0.8)';
      ctx.drawImage(img, -targetW * 0.1, -targetH * 0.1, targetW * 1.2, targetH * 1.2);
      ctx.restore();

      const scale = Math.min(targetW / origW, targetH / origH);
      const nw = origW * scale;
      const nh = origH * scale;
      const nx = (targetW - nw) / 2;
      const ny = (targetH - nh) / 2;

      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 20;
      ctx.drawImage(img, nx, ny, nw, nh);
    } else if (options.fitMode === 'contain') {
      ctx.fillStyle = options.backgroundColor || '#0F172A';
      ctx.fillRect(0, 0, targetW, targetH);

      const scale = Math.min(targetW / origW, targetH / origH);
      const nw = origW * scale;
      const nh = origH * scale;
      const nx = (targetW - nw) / 2;
      const ny = (targetH - nh) / 2;
      ctx.drawImage(img, nx, ny, nw, nh);
    } else {
      const scale = Math.max(targetW / origW, targetH / origH);
      const nw = origW * scale;
      const nh = origH * scale;
      const nx = (targetW - nw) / 2;
      const ny = (targetH - nh) / 2;
      ctx.drawImage(img, nx, ny, nw, nh);
    }

    return { canvas, width: targetW, height: targetH, presetName: selected.name };
  }

  private async handleEffects(
    img: HTMLImageElement,
    width: number,
    height: number,
    effects: any
  ): Promise<{ canvas: HTMLCanvasElement }> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Could not create canvas 2D context');

    ctx.drawImage(img, 0, 0, width, height);

    // Run pixel transformations in Web Worker for non-blocking UI
    const imgData = ctx.getImageData(0, 0, width, height);
    const processedImgData = await runPixelWorker('filters', imgData, width, height, effects);
    ctx.putImageData(processedImgData, 0, 0);

    // Handle sharpen if requested
    if (effects.sharpen && effects.sharpen > 0) {
      const currentData = ctx.getImageData(0, 0, width, height);
      const sharpenedData = await runPixelWorker('sharpen', currentData, width, height, { strength: effects.sharpen });
      ctx.putImageData(sharpenedData, 0, 0);
    }

    return { canvas };
  }

  private handleBorder(
    img: HTMLImageElement,
    origW: number,
    origH: number,
    options: any
  ): { canvas: HTMLCanvasElement; width: number; height: number } {
    let outW = origW;
    let outH = origH;
    let imgX = 0;
    let imgY = 0;
    let bottomPadding = 0;
    const bw = options.borderWidth || 20;

    if (options.style === 'polaroid') {
      bottomPadding = Math.max(80, Math.round(origH * 0.22));
      outW = origW + bw * 2;
      outH = origH + bw + bottomPadding;
      imgX = bw;
      imgY = bw;
    } else {
      outW = origW + bw * 2;
      outH = origH + bw * 2;
      imgX = bw;
      imgY = bw;
    }

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas');

    ctx.fillStyle = options.style === 'polaroid' ? '#FFFFFF' : options.borderColor || '#000000';
    ctx.fillRect(0, 0, outW, outH);

    if (options.style === 'golden') {
      const goldGrad = ctx.createLinearGradient(0, 0, outW, outH);
      goldGrad.addColorStop(0, '#D4AF37');
      goldGrad.addColorStop(0.5, '#FFDF73');
      goldGrad.addColorStop(1, '#AA771C');
      ctx.fillStyle = goldGrad;
      ctx.fillRect(0, 0, outW, outH);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(bw / 2, bw / 2, outW - bw, outH - bw);
    }

    ctx.drawImage(img, imgX, imgY, origW, origH);

    if (options.style === 'polaroid' && options.captionText) {
      ctx.fillStyle = options.captionColor || '#222222';
      const fontSize = Math.max(18, Math.round(bottomPadding * 0.35));
      ctx.font = `italic ${fontSize}px "Caveat", "Dancing Script", cursive, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(options.captionText, outW / 2, origH + bw + bottomPadding / 2);
    }

    return { canvas, width: outW, height: outH };
  }

  private handleWatermark(
    img: HTMLImageElement,
    width: number,
    height: number,
    options: any
  ): { canvas: HTMLCanvasElement } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context');

    ctx.drawImage(img, 0, 0, width, height);
    ctx.save();
    ctx.globalAlpha = Math.max(0.05, Math.min(1.0, options.opacity || 0.4));

    if (options.type === 'text' && options.text) {
      const fontSize = options.fontSize || Math.round(width * 0.04);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = options.textColor || '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 6;

      if (options.position === 'tile') {
        const stepX = fontSize * 10;
        const stepY = fontSize * 5;
        ctx.rotate((-25 * Math.PI) / 180);
        for (let x = -width; x < width * 2; x += stepX) {
          for (let y = -height; y < height * 2; y += stepY) {
            ctx.fillText(options.text, x, y);
          }
        }
      } else {
        let x = width / 2;
        let y = height / 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (options.position === 'top-left') {
          x = 40;
          y = 40 + fontSize;
          ctx.textAlign = 'left';
        } else if (options.position === 'top-right') {
          x = width - 40;
          y = 40 + fontSize;
          ctx.textAlign = 'right';
        } else if (options.position === 'bottom-left') {
          x = 40;
          y = height - 40;
          ctx.textAlign = 'left';
        } else if (options.position === 'bottom-right') {
          x = width - 40;
          y = height - 40;
          ctx.textAlign = 'right';
        }

        if (options.rotation !== 0) {
          ctx.translate(x, y);
          ctx.rotate((options.rotation * Math.PI) / 180);
          ctx.fillText(options.text, 0, 0);
        } else {
          ctx.fillText(options.text, x, y);
        }
      }
    }
    ctx.restore();
    return { canvas };
  }

  private handleStripMetadata(
    img: HTMLImageElement,
    width: number,
    height: number,
    file: File
  ): { canvas: HTMLCanvasElement } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context');
    ctx.drawImage(img, 0, 0, width, height);
    return { canvas };
  }

  private async extractMetadata(file: File, width: number, height: number): Promise<Record<string, any>> {
    return {
      filename: file.name,
      mimeType: file.type,
      fileSizeBytes: file.size,
      width,
      height,
      aspectRatio: (width / height).toFixed(2),
      lastModifiedDate: new Date(file.lastModified).toLocaleString(),
      colorSpace: 'sRGB (8-bit per channel)',
      alphaChannel: file.type === 'image/png' || file.type === 'image/webp' ? 'Supported' : 'No Alpha',
      estimatedPixels: `${((width * height) / 1000000).toFixed(2)} Megapixels`,
    };
  }

  private extractPalette(img: HTMLImageElement): string[] {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#1E293B'];

    ctx.drawImage(img, 0, 0, 64, 64);
    const imgData = ctx.getImageData(0, 0, 64, 64).data;
    const colorCounts: Record<string, number> = {};

    for (let i = 0; i < imgData.length; i += 16) {
      const r = Math.round(imgData[i] / 24) * 24;
      const g = Math.round(imgData[i + 1] / 24) * 24;
      const b = Math.round(imgData[i + 2] / 24) * 24;
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
      colorCounts[hex] = (colorCounts[hex] || 0) + 1;
    }

    const sorted = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .map((item) => item[0]);

    return sorted.slice(0, 6);
  }

  private getExtensionForMime(mime: string): string {
    switch (mime) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/webp':
        return 'webp';
      case 'image/avif':
        return 'avif';
      case 'image/tiff':
        return 'tiff';
      case 'image/gif':
        return 'gif';
      case 'image/bmp':
        return 'bmp';
      case 'image/x-icon':
        return 'ico';
      case 'image/svg+xml':
        return 'svg';
      default:
        return 'png';
    }
  }
}
