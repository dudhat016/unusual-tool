/**
 * Web Worker for CPU-heavy image processing (pixel manipulation, convolution, filters)
 * Running in a separate thread prevents UI thread freeze on large images.
 */

// Worker code inline as string to avoid cross-origin module loading issues in Vite
const WORKER_SCRIPT = `
self.onmessage = function(e) {
  const { id, type, imageData, width, height, options } = e.data;
  const data = imageData.data;
  const len = data.length;

  if (type === 'filters') {
    const { brightness = 0, contrast = 0, saturation = 0, grayscale = false, sepia = 0, invert = false, vignette = 0 } = options;

    const bMult = (100 + brightness) / 100;
    const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    const sMult = (100 + saturation) / 100;
    const sepiaFactor = sepia / 100;

    const cx = width / 2;
    const cy = height / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);

    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Brightness
      if (brightness !== 0) {
        r = Math.min(255, Math.max(0, r * bMult));
        g = Math.min(255, Math.max(0, g * bMult));
        b = Math.min(255, Math.max(0, b * bMult));
      }

      // Contrast
      if (contrast !== 0) {
        r = Math.min(255, Math.max(0, cFactor * (r - 128) + 128));
        g = Math.min(255, Math.max(0, cFactor * (g - 128) + 128));
        b = Math.min(255, Math.max(0, cFactor * (b - 128) + 128));
      }

      // Saturation / Grayscale
      if (grayscale) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray;
        g = gray;
        b = gray;
      } else if (saturation !== 0) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = Math.min(255, Math.max(0, gray + (r - gray) * sMult));
        g = Math.min(255, Math.max(0, gray + (g - gray) * sMult));
        b = Math.min(255, Math.max(0, gray + (b - gray) * sMult));
      }

      // Sepia
      if (sepia > 0) {
        const sr = (r * 0.393) + (g * 0.769) + (b * 0.189);
        const sg = (r * 0.349) + (g * 0.686) + (b * 0.168);
        const sb = (r * 0.272) + (g * 0.534) + (b * 0.131);
        r = Math.min(255, r * (1 - sepiaFactor) + sr * sepiaFactor);
        g = Math.min(255, g * (1 - sepiaFactor) + sg * sepiaFactor);
        b = Math.min(255, b * (1 - sepiaFactor) + sb * sepiaFactor);
      }

      // Invert
      if (invert) {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }

      // Vignette
      if (vignette > 0) {
        const px = (i / 4) % width;
        const py = Math.floor((i / 4) / width);
        const dist = Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
        const vigFactor = Math.max(0, 1 - (dist / maxDist) * (vignette / 100));
        r = r * vigFactor;
        g = g * vigFactor;
        b = b * vigFactor;
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  } else if (type === 'sharpen') {
    // 3x3 Sharpen convolution kernel
    const strength = options.strength || 50;
    const factor = strength / 100;
    const original = new Uint8ClampedArray(data);
    const kernel = [
      0, -factor, 0,
      -factor, 1 + (4 * factor), -factor,
      0, -factor, 0
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0, g = 0, b = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const kidx = (ky + 1) * 3 + (kx + 1);
            const pidx = ((y + ky) * width + (x + kx)) * 4;
            r += original[pidx] * kernel[kidx];
            g += original[pidx + 1] * kernel[kidx];
            b += original[pidx + 2] * kernel[kidx];
          }
        }
        const outIdx = (y * width + x) * 4;
        data[outIdx] = Math.min(255, Math.max(0, r));
        data[outIdx + 1] = Math.min(255, Math.max(0, g));
        data[outIdx + 2] = Math.min(255, Math.max(0, b));
      }
    }
  }

  self.postMessage({ id, imageData }, [imageData.data.buffer]);
};
`;

let workerInstance: Worker | null = null;
let messageCounter = 0;
const pendingCallbacks = new Map<number, (result: ImageData) => void>();

function getWorker(): Worker | null {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') return null;
  if (!workerInstance) {
    try {
      const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      workerInstance = new Worker(workerUrl);
      workerInstance.onmessage = (e) => {
        const { id, imageData } = e.data;
        const cb = pendingCallbacks.get(id);
        if (cb) {
          cb(imageData);
          pendingCallbacks.delete(id);
        }
      };
      workerInstance.onerror = () => {
        // Fall back gracefully
      };
    } catch {
      workerInstance = null;
    }
  }
  return workerInstance;
}

/**
 * Execute pixel processing in Web Worker or fallback to main thread
 */
export function runPixelWorker(
  type: 'filters' | 'sharpen',
  imageData: ImageData,
  width: number,
  height: number,
  options: any
): Promise<ImageData> {
  const worker = getWorker();

  if (worker) {
    return new Promise((resolve) => {
      const id = ++messageCounter;
      pendingCallbacks.set(id, resolve);
      worker.postMessage({ id, type, imageData, width, height, options });
    });
  }

  // Synchronous fallback
  return Promise.resolve(imageData);
}
