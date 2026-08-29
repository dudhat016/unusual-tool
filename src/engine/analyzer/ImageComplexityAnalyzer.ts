export type ImageClassification =
  | 'TEXT_HEAVY'
  | 'GRAPHIC'
  | 'PHOTO'
  | 'ILLUSTRATION'
  | 'MIXED'
  | 'SCREENSHOT';

export interface ImageAnalysisReport {
  classification: ImageClassification;
  label: string;
  edgeDensity: number; // 0.0 to 1.0
  textDetailScore: number; // 0.0 to 1.0
  colorVariance: number; // 0.0 to 1.0
  hasAlpha: boolean;
  recommendedFormat: 'image/webp' | 'image/avif' | 'image/jpeg' | 'image/png';
  recommendedFormatName: string;
  explanation: string;
  minSafeTargetKb: number;
  recommendedTargetSizes: number[];
}

export class ImageComplexityAnalyzer {
  /**
   * Fast, memory-efficient spatial complexity analysis of an image.
   * Samples a representative grid to avoid huge memory allocations on high-res files.
   */
  static analyze(
    img: HTMLImageElement | HTMLCanvasElement,
    width: number,
    height: number,
    originalSizeBytes?: number
  ): ImageAnalysisReport {
    // Sample to a fast analysis canvas (max 400px on long edge)
    const maxDim = 400;
    const scale = Math.min(1, maxDim / Math.max(width, height));
    const sampleW = Math.max(32, Math.round(width * scale));
    const sampleH = Math.max(32, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = sampleW;
    canvas.height = sampleH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      return this.getDefaultReport(width, height, originalSizeBytes);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';
    ctx.drawImage(img, 0, 0, sampleW, sampleH);

    const imgData = ctx.getImageData(0, 0, sampleW, sampleH);
    const data = imgData.data;
    const totalPixels = sampleW * sampleH;

    let totalEdgeStrength = 0;
    let highContrastEdges = 0;
    let hasAlpha = false;
    let alphaPixels = 0;
    let totalLuminance = 0;
    let sumSqDiff = 0;

    // Luminance buffer
    const lum = new Float32Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a < 250) {
        alphaPixels++;
      }
      // Perceptual luminance (BT.709)
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      lum[i] = l;
      totalLuminance += l;
    }

    if (alphaPixels > totalPixels * 0.005) {
      hasAlpha = true;
    }

    const meanLuminance = totalLuminance / totalPixels;

    // Measure variance
    for (let i = 0; i < totalPixels; i++) {
      const diff = lum[i] - meanLuminance;
      sumSqDiff += diff * diff;
    }
    const variance = sumSqDiff / totalPixels;
    const stdDev = Math.sqrt(variance);

    // Sobel operator for edge and text boundary detection
    for (let y = 1; y < sampleH - 1; y++) {
      for (let x = 1; x < sampleW - 1; x++) {
        const idx = y * sampleW + x;

        // Sobel kernels
        const gx =
          -lum[idx - sampleW - 1] +
          lum[idx - sampleW + 1] -
          2 * lum[idx - 1] +
          2 * lum[idx + 1] -
          lum[idx + sampleW - 1] +
          lum[idx + sampleW + 1];

        const gy =
          -lum[idx - sampleW - 1] -
          2 * lum[idx - sampleW] -
          lum[idx - sampleW + 1] +
          lum[idx + sampleW - 1] +
          2 * lum[idx + sampleW] +
          lum[idx + sampleW + 1];

        const mag = Math.sqrt(gx * gx + gy * gy);
        totalEdgeStrength += mag;

        // Sharp high-contrast transitions typical of typography, borders & icons
        if (mag > 120) {
          highContrastEdges++;
        }
      }
    }

    const interiorPixels = (sampleW - 2) * (sampleH - 2);
    const avgEdgeMagnitude = totalEdgeStrength / interiorPixels;
    const edgeDensity = Math.min(1.0, avgEdgeMagnitude / 65);
    const textDetailScore = Math.min(1.0, (highContrastEdges / interiorPixels) * 12);
    const colorVariance = Math.min(1.0, stdDev / 90);

    // Classify image based on metrics
    let classification: ImageClassification = 'MIXED';
    let label = 'Mixed Graphic & Media';
    let recommendedFormat: 'image/webp' | 'image/avif' | 'image/jpeg' | 'image/png' = 'image/webp';
    let recommendedFormatName = 'WebP';
    let explanation = '';

    if (hasAlpha) {
      classification = 'GRAPHIC';
      label = 'Transparent Graphic';
      recommendedFormat = 'image/png';
      recommendedFormatName = 'PNG / WebP';
      explanation = 'Image contains transparent regions. WebP or PNG will preserve transparency cleanly.';
    } else if (textDetailScore > 0.35 || (textDetailScore > 0.22 && edgeDensity > 0.38)) {
      classification = 'TEXT_HEAVY';
      label = 'Text-Heavy Graphic & Mockup';
      recommendedFormat = 'image/webp';
      recommendedFormatName = 'WebP (Recommended)';
      explanation =
        'High density of typography and sharp UI edges detected. WebP/AVIF avoids the severe 8x8 block artifacts and color ringing that occur in JPEG at tight file sizes.';
    } else if (textDetailScore > 0.18 && colorVariance < 0.45) {
      classification = 'GRAPHIC';
      label = 'Vector / Flat Graphic';
      recommendedFormat = 'image/webp';
      recommendedFormatName = 'WebP';
      explanation = 'Flat color regions and sharp vector shapes detected. WebP retains crisp outlines with minimal compression loss.';
    } else if (edgeDensity < 0.28 && colorVariance > 0.5) {
      classification = 'PHOTO';
      label = 'Natural Photograph';
      recommendedFormat = 'image/jpeg';
      recommendedFormatName = 'JPEG / WebP';
      explanation = 'Continuous photographic tones detected. Both JPEG and WebP perform efficiently on natural scenes.';
    } else if (edgeDensity > 0.45 && colorVariance > 0.4) {
      classification = 'MIXED';
      label = 'Complex Graphic & Product Mockup';
      recommendedFormat = 'image/webp';
      recommendedFormatName = 'WebP';
      explanation = 'Rich mixture of product mockups, typography, and gradients detected. WebP balances high-frequency details with clean color transitions.';
    } else {
      classification = 'ILLUSTRATION';
      label = 'Illustration / Creative Artwork';
      recommendedFormat = 'image/webp';
      recommendedFormatName = 'WebP';
      explanation = 'Creative illustration detected. WebP delivers smooth gradients and clean line art.';
    }

    // Determine safe minimum target size in KB based on resolution and complexity
    const megaPixels = (width * height) / 1_000_000;
    let minSafeTargetKb = 50;
    if (megaPixels > 4.0) {
      minSafeTargetKb = textDetailScore > 0.3 ? 120 : 90;
    } else if (megaPixels > 2.0) {
      minSafeTargetKb = textDetailScore > 0.3 ? 80 : 60;
    } else if (megaPixels > 1.0) {
      minSafeTargetKb = textDetailScore > 0.3 ? 50 : 40;
    } else {
      minSafeTargetKb = 25;
    }

    // Recommended presets
    const recommendedTargetSizes = [
      Math.max(50, Math.round(minSafeTargetKb * 0.7)),
      Math.max(100, Math.round(minSafeTargetKb * 1.2)),
      Math.max(200, Math.round(minSafeTargetKb * 2.2)),
    ];

    return {
      classification,
      label,
      edgeDensity,
      textDetailScore,
      colorVariance,
      hasAlpha,
      recommendedFormat,
      recommendedFormatName,
      explanation,
      minSafeTargetKb,
      recommendedTargetSizes,
    };
  }

  private static getDefaultReport(width: number, height: number, originalSizeBytes?: number): ImageAnalysisReport {
    return {
      classification: 'MIXED',
      label: 'Standard Image',
      edgeDensity: 0.4,
      textDetailScore: 0.3,
      colorVariance: 0.5,
      hasAlpha: false,
      recommendedFormat: 'image/webp',
      recommendedFormatName: 'WebP',
      explanation: 'WebP provides superior compression for mixed graphic and photographic content.',
      minSafeTargetKb: 75,
      recommendedTargetSizes: [50, 100, 200],
    };
  }
}
