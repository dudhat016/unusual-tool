import { CompressOptions, QualityMetrics } from '../../types';
import { ImageComplexityAnalyzer, ImageAnalysisReport } from '../analyzer/ImageComplexityAnalyzer';
import { PerceptualQualityScorer, PerceptualScoreResult } from '../quality/PerceptualQualityScorer';

interface CandidateEvaluation {
  format: string;
  scale: number;
  width: number;
  height: number;
  quality: number;
  canvas: HTMLCanvasElement;
  blob: Blob;
  size: number;
  scoreResult: PerceptualScoreResult;
}

export interface IntelligentCompressResult {
  canvas: HTMLCanvasElement;
  quality: number;
  format: string;
  blob: Blob;
  analysis: ImageAnalysisReport;
  metrics: QualityMetrics;
}

export class IntelligentTargetCompressor {
  private static supportedFormatsCache: { [key: string]: boolean } | null = null;

  /**
   * Check which formats browser canvas toBlob actually supports (e.g. image/webp, image/avif)
   */
  static async checkFormatSupport(): Promise<{ webp: boolean; avif: boolean }> {
    if (this.supportedFormatsCache) {
      return {
        webp: !!this.supportedFormatsCache['image/webp'],
        avif: !!this.supportedFormatsCache['image/avif'],
      };
    }

    const testCanvas = document.createElement('canvas');
    testCanvas.width = 4;
    testCanvas.height = 4;

    const testFormat = (mime: string): Promise<boolean> => {
      return new Promise((resolve) => {
        testCanvas.toBlob((blob) => {
          resolve(!!blob && blob.type === mime);
        }, mime, 0.8);
      });
    };

    const [webp, avif] = await Promise.all([
      testFormat('image/webp'),
      testFormat('image/avif'),
    ]);

    this.supportedFormatsCache = {
      'image/jpeg': true,
      'image/png': true,
      'image/webp': webp,
      'image/avif': avif,
    };

    return { webp, avif };
  }

  /**
   * High-Quality Stepped Downscaler with text edge preservation and crisp resampling.
   */
  static renderSteppedCanvas(
    source: HTMLImageElement | HTMLCanvasElement,
    srcW: number,
    srcH: number,
    targetW: number,
    targetH: number,
    format: string,
    optimizeForText: boolean = true
  ): HTMLCanvasElement {
    if (srcW === targetW && srcH === targetH) {
      const c = document.createElement('canvas');
      c.width = targetW;
      c.height = targetH;
      const ctx = c.getContext('2d');
      if (!ctx) throw new Error('Could not create 2D canvas context');
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetW, targetH);
      }
      ctx.drawImage(source, 0, 0);
      return c;
    }

    let curW = srcW;
    let curH = srcH;
    let curCanvas: HTMLCanvasElement = document.createElement('canvas');
    curCanvas.width = curW;
    curCanvas.height = curH;
    let curCtx = curCanvas.getContext('2d');
    if (!curCtx) throw new Error('Could not create 2D canvas context');

    if (format === 'image/jpeg') {
      curCtx.fillStyle = '#FFFFFF';
      curCtx.fillRect(0, 0, curW, curH);
    }
    curCtx.drawImage(source, 0, 0, curW, curH);

    // Multi-pass stepped downscaling (half-stepping) for anti-aliased, crisp results
    while (curW > targetW * 1.7 && curH > targetH * 1.7) {
      const nextW = Math.max(targetW, Math.round(curW * 0.55));
      const nextH = Math.max(targetH, Math.round(curH * 0.55));
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

    // Final scaling step to target dimension
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

    // Apply high-pass sharpening to maintain crisp text legibility if downscaled significantly
    if (optimizeForText && srcW > targetW * 1.15 && curCtx) {
      try {
        const imgData = curCtx.getImageData(0, 0, targetW, targetH);
        const data = imgData.data;
        const width = targetW;
        const height = targetH;
        const copy = new Uint8ClampedArray(data);

        // Adaptive unsharp kernel
        const weight = 0.20;
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
        // Silently skip if canvas security sandbox blocks direct pixel manipulation
      }
    }

    return curCanvas;
  }

  /**
   * Helper to convert canvas to blob with exact format and quality factor
   */
  private static canvasToBlob(canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob> {
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob || new Blob());
        },
        format,
        quality
      );
    });
  }

  /**
   * Main Intelligent Target Size Compression Algorithm.
   * Evaluates multiple format + dimension + quality candidates, scores them perceptually,
   * and selects the visually superior result under the target byte budget.
   */
  static async compressToTargetSize(
    img: HTMLImageElement,
    origW: number,
    origH: number,
    originalSizeBytes: number,
    options: CompressOptions,
    onProgress?: (progress: number, message?: string) => void
  ): Promise<IntelligentCompressResult> {
    const targetKb = options.targetSizeKb || 50;
    const targetBytes = targetKb * 1024;
    const qualityMode = options.qualityMode || 'best-quality';
    const preserveDimensions = !!options.preserveDimensions;
    const optimizeForText = options.optimizeForText !== false;

    // 1. Analyze image spatial complexity & classification
    onProgress?.(15, 'Analyzing image complexity and typography...');
    const analysis = ImageComplexityAnalyzer.analyze(img, origW, origH, originalSizeBytes);

    // 2. Discover format capabilities
    const browserFormats = await this.checkFormatSupport();

    // 3. Determine formats to test
    const formatsToTest: string[] = [];
    const requestedFormat = options.outputFormat || 'auto';

    if (requestedFormat === 'auto') {
      if (browserFormats.avif && options.allowAvifBetter !== false) {
        formatsToTest.push('image/avif');
      }
      if (browserFormats.webp && options.allowWebpBetter !== false) {
        formatsToTest.push('image/webp');
      }
      formatsToTest.push('image/jpeg');
    } else {
      formatsToTest.push(requestedFormat);
    }

    // 4. Determine dimension scale candidates to evaluate
    let scaleCandidates: number[] = [1.0];

    if (!preserveDimensions) {
      if (qualityMode === 'best-quality') {
        // High fidelity scales
        scaleCandidates = [1.0, 0.92, 0.82, 0.72, 0.62, 0.50, 0.40];
      } else if (qualityMode === 'balanced') {
        scaleCandidates = [1.0, 0.85, 0.70, 0.55, 0.42];
      } else {
        // smallest-file
        scaleCandidates = [1.0, 0.75, 0.55, 0.40, 0.30];
      }
    }

    // Cache original reference canvas for perceptual scoring
    const originalRefCanvas = this.renderSteppedCanvas(img, origW, origH, origW, origH, 'image/jpeg', false);

    onProgress?.(30, `Evaluating multi-pass candidates for ${targetKb}KB...`);

    const validEvaluations: CandidateEvaluation[] = [];
    let bestFallback: CandidateEvaluation | null = null;
    let totalAttempts = formatsToTest.length * scaleCandidates.length;
    let completedAttempts = 0;

    for (const fmt of formatsToTest) {
      for (const scale of scaleCandidates) {
        completedAttempts++;
        const currentProgress = 30 + Math.round((completedAttempts / totalAttempts) * 55);
        onProgress?.(
          currentProgress,
          `Testing ${fmt.replace('image/', '').toUpperCase()} at ${Math.round(scale * 100)}% scale...`
        );

        const targetW = Math.max(24, Math.round(origW * scale));
        const targetH = Math.max(24, Math.round(origH * scale));

        const canvas = this.renderSteppedCanvas(img, origW, origH, targetW, targetH, fmt, optimizeForText);

        // Quality boundaries for binary search
        const minQ = fmt === 'image/jpeg' ? 0.35 : fmt === 'image/webp' ? 0.30 : 0.25;
        const maxQ = 0.96;

        // Binary search on quality factor (6 iterations for rapid, high-precision search)
        let lowQ = minQ;
        let highQ = maxQ;
        let candidateBlob: Blob | null = null;
        let candidateQuality = 0.8;

        for (let iter = 0; iter < 6; iter++) {
          const testQ = (lowQ + highQ) / 2;
          const blob = await this.canvasToBlob(canvas, fmt, testQ);

          if (blob.size <= targetBytes) {
            candidateBlob = blob;
            candidateQuality = testQ;
            lowQ = testQ; // try to get higher quality while still <= targetBytes
          } else {
            highQ = testQ; // size too big, reduce quality
          }
        }

        if (candidateBlob && candidateBlob.size <= targetBytes) {
          const scoreResult = PerceptualQualityScorer.evaluate(originalRefCanvas, canvas, origW, origH);
          validEvaluations.push({
            format: fmt,
            scale,
            width: targetW,
            height: targetH,
            quality: candidateQuality,
            canvas,
            blob: candidateBlob,
            size: candidateBlob.size,
            scoreResult,
          });
        } else {
          // If even lowest quality was over target, track as fallback
          const fallbackBlob = await this.canvasToBlob(canvas, fmt, minQ);
          if (!bestFallback || fallbackBlob.size < bestFallback.size) {
            const scoreResult = PerceptualQualityScorer.evaluate(originalRefCanvas, canvas, origW, origH);
            bestFallback = {
              format: fmt,
              scale,
              width: targetW,
              height: targetH,
              quality: minQ,
              canvas,
              blob: fallbackBlob,
              size: fallbackBlob.size,
              scoreResult,
            };
          }
        }
      }
    }

    onProgress?.(90, 'Selecting perceptually superior candidate...');

    // 5. Pick the winning candidate:
    // Criteria:
    // 1. Highest perceptual scoreResult.score
    // 2. Tie breaker: larger SSIM and higher edge preservation
    let winner: CandidateEvaluation;

    if (validEvaluations.length > 0) {
      // Sort descending by score, then by ssim
      validEvaluations.sort((a, b) => {
        if (Math.abs(b.scoreResult.score - a.scoreResult.score) > 2) {
          return b.scoreResult.score - a.scoreResult.score;
        }
        return b.scoreResult.ssim - a.scoreResult.ssim;
      });
      winner = validEvaluations[0];
    } else if (bestFallback) {
      winner = bestFallback;
    } else {
      // Hard fallback
      const fallbackCanvas = this.renderSteppedCanvas(img, origW, origH, Math.round(origW * 0.5), Math.round(origH * 0.5), 'image/jpeg');
      const blob = await this.canvasToBlob(fallbackCanvas, 'image/jpeg', 0.6);
      winner = {
        format: 'image/jpeg',
        scale: 0.5,
        width: fallbackCanvas.width,
        height: fallbackCanvas.height,
        quality: 0.6,
        canvas: fallbackCanvas,
        blob,
        size: blob.size,
        scoreResult: PerceptualQualityScorer.evaluate(originalRefCanvas, fallbackCanvas, origW, origH),
      };
    }

    // 6. Check for severe degradation warning
    const isDegraded = winner.scoreResult.isDegraded || winner.scoreResult.score < 66;
    let advisoryMessage: string | undefined;

    if (isDegraded) {
      advisoryMessage = `${targetKb} KB is very tight for this high-resolution (${origW}×${origH}px) ${analysis.label.toLowerCase()}. To prevent visual artifacts, consider ${analysis.recommendedTargetSizes[0]} KB or ${analysis.recommendedTargetSizes[1]} KB.`;
    }

    const formatName = winner.format === 'image/webp' ? 'WebP' : winner.format === 'image/avif' ? 'AVIF' : winner.format === 'image/png' ? 'PNG' : 'JPEG';
    const strategyDescription =
      winner.scale >= 0.99
        ? `100% full resolution @ ${Math.round(winner.quality * 100)}% ${formatName} encoding`
        : `${Math.round(winner.scale * 100)}% stepped resolution (${winner.width}×${winner.height}px) @ ${Math.round(winner.quality * 100)}% crisp ${formatName}`;

    const metrics: QualityMetrics = {
      qualityScore: winner.scoreResult.score,
      ssim: winner.scoreResult.ssim,
      psnr: winner.scoreResult.psnr,
      qualityGrade: winner.scoreResult.grade,
      isDegraded,
      classification: analysis.classification,
      recommendedTargetKb: analysis.recommendedTargetSizes,
      advisoryMessage,
      formatUsed: winner.format,
      qualityFactor: winner.quality,
      resolutionScale: winner.scale,
      strategy: strategyDescription,
    };

    onProgress?.(100, 'Compression completed with optimal fidelity.');

    return {
      canvas: winner.canvas,
      quality: winner.quality,
      format: winner.format,
      blob: winner.blob,
      analysis,
      metrics,
    };
  }
}
