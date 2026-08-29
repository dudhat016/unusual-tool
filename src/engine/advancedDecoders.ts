/**
 * Universal pixel-level decoder for advanced formats not natively decoded by standard HTML5 <img> tags
 * (e.g. HEIC/HEIF, TIFF, ICO).
 */

export async function decodeAdvancedImageFile(file: File): Promise<{
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  mimeType: string;
} | null> {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  // 1. TIFF / TIF Decoding using UTIF
  if (fileType.includes('tiff') || fileName.endsWith('.tiff') || fileName.endsWith('.tif')) {
    try {
      const UTIF = await import('utif');
      const utifModule: any = (UTIF as any).default || UTIF;
      const buffer = await file.arrayBuffer();
      const ifds = utifModule.decode(buffer);
      if (ifds && ifds.length > 0) {
        const firstPage = ifds[0];
        utifModule.decodeImage(buffer, firstPage);
        const rgba = utifModule.toRGBA8(firstPage);
        const width = firstPage.width;
        const height = firstPage.height;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const imgData = ctx.createImageData(width, height);
          imgData.data.set(rgba);
          ctx.putImageData(imgData, 0, 0);
          return { canvas, width, height, mimeType: 'image/tiff' };
        }
      }
    } catch (err) {
      console.warn('UTIF decoding error, falling back to standard image loader:', err);
    }
  }

  // 2. HEIC / HEIF Decoding using heic2any
  if (fileType.includes('heic') || fileType.includes('heif') || fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
    try {
      const heic2anyModule = await import('heic2any');
      const heic2any = heic2anyModule.default || heic2anyModule;
      const convertedBlobOrBlobs = await (heic2any as any)({
        blob: file,
        toType: 'image/png',
        quality: 1,
      });

      const blob = Array.isArray(convertedBlobOrBlobs) ? convertedBlobOrBlobs[0] : convertedBlobOrBlobs;
      const imgUrl = URL.createObjectURL(blob);

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(imgUrl);
            resolve({
              canvas,
              width: canvas.width,
              height: canvas.height,
              mimeType: 'image/heic',
            });
          } else {
            URL.revokeObjectURL(imgUrl);
            reject(new Error('Failed to get 2d context for HEIC canvas'));
          }
        };
        img.onerror = (e) => {
          URL.revokeObjectURL(imgUrl);
          reject(e);
        };
        img.src = imgUrl;
      });
    } catch (err) {
      console.warn('heic2any decoding error:', err);
    }
  }

  return null;
}

/**
 * Encode raw canvas pixel data to TIFF format via UTIF
 */
export async function encodeCanvasToTiff(canvas: HTMLCanvasElement): Promise<Blob> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context for TIFF encoding');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  try {
    const UTIF = await import('utif');
    const utifModule: any = (UTIF as any).default || UTIF;
    const tiffBuffer = utifModule.encodeImage(imgData.data, canvas.width, canvas.height);
    return new Blob([tiffBuffer], { type: 'image/tiff' });
  } catch {
    // Canvas PNG fallback with TIFF MIME
    return new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob([], { type: 'image/tiff' })), 'image/png');
    });
  }
}

/**
 * Encode raw canvas to ICO format (Windows icon header + PNG/BMP payload)
 */
export function encodeCanvasToIco(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((pngBlob) => {
      if (!pngBlob) {
        resolve(new Blob([], { type: 'image/x-icon' }));
        return;
      }
      pngBlob.arrayBuffer().then((pngBuffer) => {
        const pngBytes = new Uint8Array(pngBuffer);
        const icoHeader = new Uint8Array(6 + 16);
        const view = new DataView(icoHeader.buffer);

        // ICONDIR Header
        view.setUint16(0, 0, true); // Reserved
        view.setUint16(2, 1, true); // 1 = ICO
        view.setUint16(4, 1, true); // Number of images

        // ICONDIRENTRY
        view.setUint8(6, Math.min(canvas.width, 256) % 256); // Width
        view.setUint8(7, Math.min(canvas.height, 256) % 256); // Height
        view.setUint8(8, 0); // Palette count
        view.setUint8(9, 0); // Reserved
        view.setUint16(10, 1, true); // Color planes
        view.setUint16(12, 32, true); // Bits per pixel
        view.setUint32(14, pngBytes.length, true); // Size of image data
        view.setUint32(18, 22, true); // Offset of image data

        const finalIco = new Uint8Array(icoHeader.length + pngBytes.length);
        finalIco.set(icoHeader, 0);
        finalIco.set(pngBytes, icoHeader.length);

        resolve(new Blob([finalIco], { type: 'image/x-icon' }));
      });
    }, 'image/png');
  });
}
