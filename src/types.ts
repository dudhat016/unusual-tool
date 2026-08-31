export type ToolCategory =
  | 'all'
  | 'ai'
  | 'resize'
  | 'compress'
  | 'convert'
  | 'crop'
  | 'edit'
  | 'ocr'
  | 'passport'
  | 'social'
  | 'effects'
  | 'metadata'
  | 'batch'
  | 'youtube'
  | 'pdf'
  | 'pdf-conversion'
  | 'pdf-compression'
  | 'pdf-organize'
  | 'pdf-edit'
  | 'pdf-security'
  | 'pdf-image'
  | 'pdf-ocr'
  | 'pdf-utils'
  | 'audio'
  | 'video';

export * from './types/youtube';

export type ProcessingType = 'browser' | 'server' | 'ai' | 'hybrid';

export type ProcessorType = 'browser' | 'server' | 'ai';

export interface SEOInfo {
  title: string;
  description: string;
  keywords: string[];
  canonicalSlug: string;
  structuredFaq?: { question: string; answer: string }[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface UsageStep {
  step: number;
  title: string;
  description: string;
}

export interface ToolDefinition {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: ToolCategory;
  processingType: ProcessingType;
  icon: string; // Lucide icon name
  route: string;
  supportsBatch: boolean;
  supportsMixedFormats?: boolean;
  supportsAI?: boolean;
  requiresServer?: boolean;
  supportsZip?: boolean;
  supportsPerImageSettings?: boolean;
  requiresAuth: boolean;
  creditCost?: number;
  supportedFormats?: string[];
  maxFileSizeMB?: number;
  isPopular?: boolean;
  isNew?: boolean;
  isAi?: boolean;
  seo: SEOInfo;
  faqs?: FAQItem[];
  howToSteps?: UsageStep[];
  features?: string[];
}

export interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  detectedMime?: string;
  width: number;
  height: number;
  aspectRatio: number;
  previewUrl: string;
  lastModified: number;
}

export interface QualityMetrics {
  qualityScore: number; // 0 to 100
  ssim: number; // 0.0 to 1.0
  psnr: number; // dB
  qualityGrade: 'Exceptional' | 'High Fidelity' | 'Good' | 'Acceptable' | 'Degraded';
  isDegraded: boolean;
  classification: 'TEXT_HEAVY' | 'GRAPHIC' | 'PHOTO' | 'ILLUSTRATION' | 'MIXED' | 'SCREENSHOT';
  recommendedTargetKb?: number[];
  advisoryMessage?: string;
  formatUsed: string;
  qualityFactor: number;
  resolutionScale: number;
  strategy: string;
}

/**
 * Universal Result Object according to Platform Specification
 */
export interface UniversalProcessResult {
  id: string;
  originalFile: File;
  resultFile: File;
  originalSize: number;
  resultSize: number;
  originalWidth: number;
  originalHeight: number;
  resultWidth: number;
  resultHeight: number;
  processingTime: number; // in milliseconds
  toolId: string;
  status: 'completed' | 'failed' | 'processing' | 'queued';
  processorType: ProcessorType;
  
  // UI and download helpers
  blob: Blob;
  dataUrl: string;
  downloadUrl: string;
  name: string;
  type: string;
  reductionPercentage?: number;
  extractedText?: string;
  metadata?: Record<string, any>;
  palette?: string[];
  errorMessage?: string;

  // Intelligent Quality & Compression Analytics
  qualityMetrics?: QualityMetrics;

  // Backwards compatibility aliases
  size?: number;
  width?: number;
  height?: number;
  processingTimeMs?: number;
}

// Backward-compatible alias
export type ProcessedResult = UniversalProcessResult;

// Format Detection Result
export interface DetectedFormatResult {
  mimeType: string;
  extension: string;
  name: string;
  isSupported: boolean;
  hasAlpha: boolean;
  magicHeaderHex: string;
  exifOrientation?: number;
  validationError?: string;
}

// Batch Queue Item Status
export type QueueItemStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface BatchQueueItem {
  id: string;
  file: File;
  status: QueueItemStatus;
  progress: number; // 0 to 100
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  result?: UniversalProcessResult;
  error?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

// Processing options interfaces
export interface ResizeOptions {
  mode: 'pixels' | 'percentage' | 'units';
  unit?: 'cm' | 'mm' | 'inches';
  width: number;
  height: number;
  percentage: number;
  lockAspectRatio: boolean;
  interpolation: 'bilinear' | 'bicubic' | 'nearest' | 'crisp';
  targetDpi?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number;
  fitMode?: 'stretch' | 'crop' | 'pad' | 'fill';
  bgColor?: string;
}

export interface CompressOptions {
  mode: 'auto' | 'target-size' | 'quality';
  targetSizeKb?: number;
  quality: number;
  outputFormat: 'auto' | 'image/jpeg' | 'image/webp' | 'image/avif' | 'image/png';
  qualityMode?: 'best-quality' | 'balanced' | 'smallest-file';
  preserveDimensions?: boolean;
  optimizeForText?: boolean;
  optimizeForGraphics?: boolean;
  allowWebpBetter?: boolean;
  allowAvifBetter?: boolean;
  stripMetadata: boolean;
  useServerFallback?: boolean;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatioPreset?: 'free' | '1:1' | '16:9' | '4:3' | '3:2' | '2:3' | '9:16' | 'circle';
}

export interface ConvertOptions {
  targetFormat: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'image/x-icon' | 'image/avif' | 'image/tiff' | string;
  quality: number;
  backgroundColorForTransparent?: string;
}

export interface EffectsOptions {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  blur: number; // 0 to 50
  sharpen: number; // 0 to 100
  grayscale: boolean;
  sepia: number; // 0 to 100
  invert: boolean;
  vintage: boolean;
  pixelate: number; // 1 to 50
  vignette: number; // 0 to 100
}

export interface BorderOptions {
  style: 'classic' | 'polaroid' | 'double' | 'golden' | 'film' | 'minimal';
  borderWidth: number;
  borderColor: string;
  cornerRadius: number;
  innerPadding: number;
  captionText?: string;
  captionFont?: string;
  captionColor?: string;
}

export interface WatermarkOptions {
  type: 'text' | 'image';
  text?: string;
  fontSize: number;
  textColor: string;
  opacity: number;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile';
  rotation: number;
  imageWatermarkUrl?: string;
}

export interface PassportOptions {
  preset: 'us-passport' | 'eu-schengen' | 'uk-passport' | 'india-passport' | 'custom';
  widthMm: number;
  heightMm: number;
  backgroundColor: 'white' | 'blue' | 'red' | 'light-grey' | 'custom';
  customBgHex?: string;
  generatePrintSheet: boolean;
  sheetSize: '4x6' | 'A4' | 'single';
}

export interface SocialResizeOptions {
  platform: 'instagram' | 'facebook' | 'youtube' | 'twitter' | 'linkedin' | 'tiktok' | 'pinterest' | 'whatsapp';
  presetId: string;
  fitMode: 'cover' | 'contain' | 'blur-fill';
  backgroundColor: string;
}

export interface HistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  timestamp: number;
  thumbnail: string;
  originalName: string;
  originalSize: number;
  resultSize: number;
  originalWidth?: number;
  originalHeight?: number;
  resultWidth?: number;
  resultHeight?: number;
  processingTime?: number;
  processorType?: ProcessorType;
  downloadName: string;
  blobDataUrl?: string;
  optionsSnapshot?: any;
}

export interface UserCredits {
  total: number;
  used: number;
  plan: 'free' | 'pro' | 'business';
  resetsAt: number;
}
