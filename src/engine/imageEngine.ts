import {
  ResizeOptions,
  CompressOptions,
  CropRect,
  ConvertOptions,
  EffectsOptions,
  BorderOptions,
  WatermarkOptions,
  PassportOptions,
  SocialResizeOptions,
  UniversalProcessResult,
  ProcessedResult,
} from '../types';
import { engine, ImageProcessingEngine } from './ImageProcessingEngine';
import { detectImageFormat } from './formatDetector';

export { engine, ImageProcessingEngine };

import { decodeAdvancedImageFile } from './advancedDecoders';

/**
 * Load a File into an HTMLImageElement with dimension metadata, with seamless fallback to
 * advanced software decoders for formats like HEIC/HEIF and TIFF.
 */
export async function loadFileAsImage(file: File): Promise<{
  img: HTMLImageElement;
  width: number;
  height: number;
  aspectRatio: number;
}> {
  // Check for advanced formats like HEIC/HEIF or TIFF first
  const decoded = await decodeAdvancedImageFile(file);
  if (decoded) {
    const dataUrl = decoded.canvas.toDataURL('image/png');
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          img,
          width: decoded.width,
          height: decoded.height,
          aspectRatio: decoded.width / decoded.height,
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
      resolve({
        img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        aspectRatio: (img.naturalWidth || img.width) / (img.naturalHeight || img.height),
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image. The file may be damaged or unsupported.'));
    };

    img.src = url;
  });
}

/**
 * High-precision canvas resizer with aspect-ratio locking and quality settings
 */
export async function resizeImage(file: File, options: ResizeOptions): Promise<UniversalProcessResult> {
  return engine.execute(file, 'resize-image', options);
}

/**
 * Advanced image compression with target-size binary search & quality optimization
 */
export async function compressImage(file: File, options: CompressOptions): Promise<UniversalProcessResult> {
  return engine.execute(file, 'compress-image', options);
}

/**
 * Interactive Image Cropper with standard aspect ratios and circle avatar support
 */
export async function cropImage(
  file: File,
  cropRect: CropRect,
  targetFormat: string = 'image/png',
  quality: number = 0.95
): Promise<UniversalProcessResult> {
  return engine.execute(file, 'crop-image', { ...cropRect, targetFormat, quality });
}

/**
 * Universal Image Format Transcoder (JPG, PNG, WebP, GIF, ICO)
 */
export async function convertImageFormat(file: File, options: ConvertOptions): Promise<UniversalProcessResult> {
  return engine.execute(file, 'convert-image', options);
}

/**
 * Creative Photo Effects & Filters with Web Worker Acceleration
 */
export async function applyPhotoEffects(file: File, effects: EffectsOptions): Promise<UniversalProcessResult> {
  return engine.execute(file, 'photo-effects', effects);
}

/**
 * Borders, Frames & Polaroid Maker
 */
export async function addBorderAndFrame(file: File, options: BorderOptions): Promise<UniversalProcessResult> {
  return engine.execute(file, 'border-maker', options);
}

/**
 * Watermark & Logo Overlay Engine
 */
export async function addWatermark(file: File, options: WatermarkOptions): Promise<UniversalProcessResult> {
  return engine.execute(file, 'watermark-image', options);
}

/**
 * Biometric Passport & ID Photo Maker & Multi-photo Printable 4x6 / A4 Sheet
 */
export async function createPassportSheet(file: File, options: PassportOptions): Promise<UniversalProcessResult> {
  return engine.execute(file, 'passport-photo-maker', options);
}

/**
 * Social Media Graphic Auto-Formatter
 */
export async function createSocialMediaVariant(
  file: File,
  options: SocialResizeOptions
): Promise<UniversalProcessResult> {
  return engine.execute(file, 'social-resizer', options);
}

/**
 * Extract Dominant 6-color Palette from Image
 */
export async function extractColorPalette(file: File): Promise<{ palette: string[]; dominant: string }> {
  const res = await engine.execute(file, 'color-picker', {});
  const palette = res.palette || ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#1E293B'];
  return { palette, dominant: palette[0] };
}

/**
 * Metadata parser and cleanser
 */
export async function readImageMetadata(file: File): Promise<Record<string, any>> {
  const { width, height, aspectRatio } = await loadFileAsImage(file);
  const detected = await detectImageFormat(file);

  return {
    filename: file.name,
    mimeType: detected.mimeType || file.type,
    detectedFormat: detected.name,
    fileSizeBytes: file.size,
    fileSizeFormatted: formatFileSize(file.size),
    width,
    height,
    aspectRatio: aspectRatio.toFixed(2),
    lastModifiedDate: new Date(file.lastModified).toLocaleString(),
    magicHeaderHex: detected.magicHeaderHex,
    hasGpsTag: detected.mimeType === 'image/jpeg',
    colorSpace: 'sRGB (8-bit per channel)',
    alphaChannel: detected.hasAlpha ? 'Preserved (Alpha channel present)' : 'No Alpha',
    estimatedPixels: `${((width * height) / 1000000).toFixed(2)} Megapixels`,
  };
}

export async function stripMetadata(file: File): Promise<UniversalProcessResult> {
  return engine.execute(file, 'metadata-tool', {});
}

/**
 * AI Tool Runner (High-speed client-side neural & computer-vision pipeline with AIImageProcessor)
 */
export async function runAIToolProcess(file: File, toolSlug: string, options?: any): Promise<UniversalProcessResult> {
  return engine.execute(file, toolSlug, options);
}

/**
 * OCR Engine - extracts readable text and document strings from images
 */
export async function extractTextFromImageOCR(file: File): Promise<string> {
  const res = await engine.execute(file, 'ocr-tool', {});
  return res.extractedText || 'No text recognized.';
}

/**
 * Helper to format byte sizes cleanly
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
