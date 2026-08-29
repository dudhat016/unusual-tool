import { DetectedFormatResult } from '../types';

/**
 * Reads initial bytes of a File to determine true MIME type via Magic Bytes
 */
export async function detectImageFormat(file: File): Promise<DetectedFormatResult> {
  const slice = file.slice(0, 64);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const headerHex = Array.from(bytes.slice(0, 16))
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

  // 1. JPEG / JPG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    const orientation = await parseExifOrientation(file);
    return {
      mimeType: 'image/jpeg',
      extension: 'jpg',
      name: 'JPEG Image',
      isSupported: true,
      hasAlpha: false,
      magicHeaderHex: headerHex,
      exifOrientation: orientation,
    };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return {
      mimeType: 'image/png',
      extension: 'png',
      name: 'Portable Network Graphics (PNG)',
      isSupported: true,
      hasAlpha: true,
      magicHeaderHex: headerHex,
    };
  }

  // 3. GIF: 47 49 46 38 (GIF87a or GIF89a)
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return {
      mimeType: 'image/gif',
      extension: 'gif',
      name: 'Graphics Interchange Format (GIF)',
      isSupported: true,
      hasAlpha: true,
      magicHeaderHex: headerHex,
    };
  }

  // 4. WebP: 52 49 46 46 ... 57 45 42 50 ("RIFF" ... "WEBP")
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return {
      mimeType: 'image/webp',
      extension: 'webp',
      name: 'Google WebP Image',
      isSupported: true,
      hasAlpha: true,
      magicHeaderHex: headerHex,
    };
  }

  // 5. BMP: 42 4D ("BM")
  if (bytes[0] === 0x42 && bytes[1] === 0x4d) {
    return {
      mimeType: 'image/bmp',
      extension: 'bmp',
      name: 'Bitmap (BMP)',
      isSupported: true,
      hasAlpha: false,
      magicHeaderHex: headerHex,
    };
  }

  // 6. TIFF: 49 49 2A 00 (Little Endian) or 4D 4D 00 2A (Big Endian)
  if (
    (bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00) ||
    (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a)
  ) {
    return {
      mimeType: 'image/tiff',
      extension: 'tiff',
      name: 'Tagged Image File Format (TIFF)',
      isSupported: true,
      hasAlpha: true,
      magicHeaderHex: headerHex,
    };
  }

  // 7. AVIF / HEIF / HEIC: Check ftyp brand in bytes 4..12
  const ftypBrand = String.fromCharCode(...bytes.slice(4, 12));
  if (ftypBrand.includes('avif') || ftypBrand.includes('avis')) {
    return {
      mimeType: 'image/avif',
      extension: 'avif',
      name: 'AV1 Image File (AVIF)',
      isSupported: true,
      hasAlpha: true,
      magicHeaderHex: headerHex,
    };
  }

  if (
    ftypBrand.includes('heic') ||
    ftypBrand.includes('heix') ||
    ftypBrand.includes('mif1') ||
    ftypBrand.includes('msf1') ||
    ftypBrand.includes('hevc')
  ) {
    return {
      mimeType: 'image/heic',
      extension: 'heic',
      name: 'High Efficiency Image Container (HEIC/HEIF)',
      isSupported: isHeicNativeSupported(),
      hasAlpha: true,
      magicHeaderHex: headerHex,
      validationError: isHeicNativeSupported()
        ? undefined
        : 'HEIC/HEIF requires Safari or iOS. For Chrome/Firefox, please convert or use JPEG/PNG/WebP.',
    };
  }

  // 8. PDF: 25 50 44 46 ("%PDF")
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return {
      mimeType: 'application/pdf',
      extension: 'pdf',
      name: 'Portable Document Format (PDF)',
      isSupported: true,
      hasAlpha: false,
      magicHeaderHex: headerHex,
    };
  }

  // 9. SVG: Text-based XML check
  const textSample = new TextDecoder().decode(bytes.slice(0, 64)).toLowerCase();
  if (textSample.includes('<svg') || textSample.includes('<?xml')) {
    return {
      mimeType: 'image/svg+xml',
      extension: 'svg',
      name: 'Scalable Vector Graphics (SVG)',
      isSupported: true,
      hasAlpha: true,
      magicHeaderHex: headerHex,
    };
  }

  // 9. Fallback by declared file type or extension
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg'].includes(ext)) {
    return {
      mimeType: 'image/jpeg',
      extension: 'jpg',
      name: 'JPEG Image',
      isSupported: true,
      hasAlpha: false,
      magicHeaderHex: headerHex,
    };
  }
  if (ext === 'png') {
    return {
      mimeType: 'image/png',
      extension: 'png',
      name: 'PNG Image',
      isSupported: true,
      hasAlpha: true,
      magicHeaderHex: headerHex,
    };
  }
  if (ext === 'webp') {
    return {
      mimeType: 'image/webp',
      extension: 'webp',
      name: 'WebP Image',
      isSupported: true,
      hasAlpha: true,
      magicHeaderHex: headerHex,
    };
  }

  if (ext === 'pdf') {
    return {
      mimeType: 'application/pdf',
      extension: 'pdf',
      name: 'Portable Document Format (PDF)',
      isSupported: true,
      hasAlpha: false,
      magicHeaderHex: headerHex,
    };
  }
  if (['doc', 'docx'].includes(ext)) {
    return {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: 'docx',
      name: 'Word Document',
      isSupported: true,
      hasAlpha: false,
      magicHeaderHex: headerHex,
    };
  }
  if (ext === 'txt') {
    return {
      mimeType: 'text/plain',
      extension: 'txt',
      name: 'Text Document',
      isSupported: true,
      hasAlpha: false,
      magicHeaderHex: headerHex,
    };
  }

  // Unsupported or corrupted
  return {
    mimeType: file.type || 'application/octet-stream',
    extension: ext || 'bin',
    name: 'Unknown Format',
    isSupported: false,
    hasAlpha: false,
    magicHeaderHex: headerHex,
    validationError: `Unsupported or invalid image file structure (${file.name}). Please provide a standard JPEG, PNG, WebP, GIF, SVG, or BMP image.`,
  };
}

/**
 * Check if the current browser environment can render HEIC natively
 */
export function isHeicNativeSupported(): boolean {
  if (typeof window === 'undefined') return false;
  // Safari / WebKit on macOS/iOS has native HEIC decoding
  const isSafari =
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
    /iPad|iPhone|iPod/.test(navigator.userAgent);
  return isSafari;
}

/**
 * Parse EXIF orientation tag from JPEG header bytes
 */
async function parseExifOrientation(file: File): Promise<number> {
  try {
    const buffer = await file.slice(0, 64 * 1024).arrayBuffer();
    const view = new DataView(buffer);

    if (view.getUint16(0, false) !== 0xffd8) return 1;

    let offset = 2;
    const length = view.byteLength;

    while (offset < length) {
      if (view.getUint16(offset + 2, false) <= 8) return 1;
      const marker = view.getUint16(offset, false);
      offset += 2;

      if (marker === 0xffe1) {
        if (view.getUint32((offset += 2), false) !== 0x45786966) return 1; // "Exif"

        const little = view.getUint16((offset += 6), false) === 0x4949;
        offset += view.getUint32(offset + 4, little);

        const tags = view.getUint16(offset, little);
        offset += 2;

        for (let i = 0; i < tags; i++) {
          if (view.getUint16(offset + i * 12, little) === 0x0112) {
            // Orientation tag
            return view.getUint16(offset + i * 12 + 8, little);
          }
        }
      } else if ((marker & 0xff00) !== 0xff00) {
        break;
      } else {
        offset += view.getUint16(offset, false);
      }
    }
  } catch {
    // Graceful fallback
  }
  return 1;
}
