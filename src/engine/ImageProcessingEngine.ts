import { IImageProcessor, ProcessorContext } from './processors/IImageProcessor';
import { BrowserImageProcessor } from './processors/BrowserImageProcessor';
import { ServerImageProcessor } from './processors/ServerImageProcessor';
import { AIImageProcessor } from './processors/AIImageProcessor';
import { UniversalProcessResult, ProcessorType } from '../types';
import { detectImageFormat } from './formatDetector';

export class ImageProcessingEngine {
  private static instance: ImageProcessingEngine;
  private processors: Map<ProcessorType, IImageProcessor> = new Map();
  private activeObjectUrls: Set<string> = new Set();

  private constructor() {
    // Register standard processor adapters
    this.registerProcessor(new BrowserImageProcessor());
    this.registerProcessor(new ServerImageProcessor());
    this.registerProcessor(new AIImageProcessor());
  }

  public static getInstance(): ImageProcessingEngine {
    if (!ImageProcessingEngine.instance) {
      ImageProcessingEngine.instance = new ImageProcessingEngine();
    }
    return ImageProcessingEngine.instance;
  }

  public registerProcessor(processor: IImageProcessor) {
    this.processors.set(processor.type, processor);
  }

  /**
   * Automatically select the optimal processor based on task and parameters
   */
  public selectProcessor(toolId: string, options?: any): IImageProcessor {
    // 1. Explicit preference check
    if (options?.preferredProcessor) {
      const preferred = this.processors.get(options.preferredProcessor as ProcessorType);
      if (preferred && preferred.canHandle(toolId, options)) {
        return preferred;
      }
    }

    // 2. AI Tools route to AIImageProcessor
    const aiTools = [
      'background-remover',
      'image-upscaler',
      'image-enhancer',
      'object-remover',
      'unblur-image',
      'unblur',
      'ocr-tool',
    ];
    if (aiTools.includes(toolId)) {
      const aiProcessor = this.processors.get('ai');
      if (aiProcessor) return aiProcessor;
    }

    // 3. Heavy Server compression fallback
    if (toolId === 'compress-image' && options?.useServerFallback) {
      const serverProcessor = this.processors.get('server');
      if (serverProcessor) return serverProcessor;
    }

    // 4. Default to fast, zero-upload local BrowserImageProcessor
    const browserProcessor = this.processors.get('browser');
    if (browserProcessor) {
      return browserProcessor;
    }

    // Fallback: first available processor
    return Array.from(this.processors.values())[0];
  }

  /**
   * Main Execution Entry Point
   */
  public async execute(
    file: File,
    toolId: string,
    options: any = {},
    onProgress?: (percent: number, message?: string) => void
  ): Promise<UniversalProcessResult> {
    const processor = this.selectProcessor(toolId, options);
    const context: ProcessorContext = {
      toolId,
      options,
      onProgress,
    };

    try {
      const result = await processor.process(file, context);
      if (result.downloadUrl) {
        this.activeObjectUrls.add(result.downloadUrl);
      }
      return result;
    } catch (err: any) {
      const errorMsg = err?.message || 'Processing failed';
      return {
        id: `err_${Date.now()}`,
        originalFile: file,
        resultFile: file,
        originalSize: file.size,
        resultSize: 0,
        originalWidth: 0,
        originalHeight: 0,
        resultWidth: 0,
        resultHeight: 0,
        processingTime: 0,
        toolId,
        status: 'failed',
        processorType: processor.type,
        errorMessage: errorMsg,
        blob: new Blob([]),
        dataUrl: '',
        downloadUrl: '',
        name: file.name,
        type: file.type,
      };
    }
  }

  /**
   * Cleans up allocated object URLs to prevent browser memory leaks
   */
  public cleanupUrl(url: string) {
    if (this.activeObjectUrls.has(url)) {
      try {
        URL.revokeObjectURL(url);
      } catch {}
      this.activeObjectUrls.delete(url);
    }
  }

  public cleanupAllUrls() {
    this.activeObjectUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    });
    this.activeObjectUrls.clear();
  }
}

// Global Singleton Instance Export
export const engine = ImageProcessingEngine.getInstance();
