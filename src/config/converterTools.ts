import { ToolDefinition } from '../types';

export interface ConverterPairItem {
  slug: string;
  fromFormat: string;
  toFormat: string;
  fromExt: string;
  toExt: string;
  title: string;
  description: string;
}

export const POPULAR_CONVERTER_PAIRS: ConverterPairItem[] = [
  { fromExt: 'WEBP', toExt: 'PNG', fromFormat: 'image/webp', toFormat: 'image/png' },
  { fromExt: 'WEBP', toExt: 'JPG', fromFormat: 'image/webp', toFormat: 'image/jpeg' },
  { fromExt: 'HEIC', toExt: 'JPG', fromFormat: 'image/heic', toFormat: 'image/jpeg' },
  { fromExt: 'HEIC', toExt: 'PNG', fromFormat: 'image/heic', toFormat: 'image/png' },
  { fromExt: 'PNG', toExt: 'SVG', fromFormat: 'image/png', toFormat: 'image/svg+xml' },
  { fromExt: 'JPG', toExt: 'SVG', fromFormat: 'image/jpeg', toFormat: 'image/svg+xml' },
  { fromExt: 'SVG', toExt: 'PNG', fromFormat: 'image/svg+xml', toFormat: 'image/png' },
  { fromExt: 'PNG', toExt: 'ICO', fromFormat: 'image/png', toFormat: 'image/x-icon' },
  { fromExt: 'PNG', toExt: 'PDF', fromFormat: 'image/png', toFormat: 'application/pdf' },
  { fromExt: 'JPG', toExt: 'PDF', fromFormat: 'image/jpeg', toFormat: 'application/pdf' },
  { fromExt: 'AVIF', toExt: 'JPG', fromFormat: 'image/avif', toFormat: 'image/jpeg' },
].map((p) => ({
  slug: `${p.fromExt.toLowerCase()}-to-${p.toExt.toLowerCase()}`,
  fromFormat: p.fromFormat,
  toFormat: p.toFormat,
  fromExt: p.fromExt,
  toExt: p.toExt,
  title: `Convert ${p.fromExt} to ${p.toExt}`,
  description: `Convert ${p.fromExt} images directly to ${p.toExt} format online.`
}));

export function createConverterToolDefinition(
  slug: string,
  fromExt: string,
  toExt: string,
  fromFormat: string,
  toFormat: string
): ToolDefinition {
  const name = `Convert ${fromExt.toUpperCase()} to ${toExt.toUpperCase()}`;
  const cleanSlug = slug.replace(/^(?:convert-image-tools\/|convert\/|convert-)/i, '');

  return {
    id: `convert-${cleanSlug}`,
    slug: cleanSlug,
    name,
    shortDescription: `Convert ${fromExt.toUpperCase()} images directly to ${toExt.toUpperCase()} format in your browser with zero quality loss.`,
    fullDescription: `Instant browser-side ${fromExt.toUpperCase()} to ${toExt.toUpperCase()} converter. Transform files locally without uploading them to any remote server. Features high-speed canvas rasterization, alpha preservation, and instant downloads.`,
    category: 'convert',
    processingType: 'browser',
    icon: 'RefreshCw',
    route: `/convert-image-tools/${cleanSlug}`,
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: [fromFormat, 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/tiff', 'image/svg+xml'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: [
      `100% Client-Side ${fromExt.toUpperCase()} to ${toExt.toUpperCase()} conversion`,
      'Zero server uploads ensuring absolute document and photo privacy',
      'Batch queue support with one-click ZIP archive packaging',
      'Custom quality, background fill, and resolution options',
      'Instant side-by-side preview and comparison',
    ],
    howToSteps: [
      { step: 1, title: `Upload ${fromExt.toUpperCase()} Image`, description: `Drag and drop your ${fromExt.toUpperCase()} file or choose from your computer.` },
      { step: 2, title: `Adjust ${toExt.toUpperCase()} Settings`, description: `Target format is pre-configured to ${toExt.toUpperCase()}. Fine-tune quality or background color.` },
      { step: 3, title: 'Convert & Download', description: `Click Convert to download your new ${toExt.toUpperCase()} image instantly.` },
    ],
    faqs: [
      {
        question: `How do I convert ${fromExt.toUpperCase()} to ${toExt.toUpperCase()} without uploading?`,
        answer: `Our browser graphics engine decodes the ${fromExt.toUpperCase()} in your local device RAM and re-encodes it into ${toExt.toUpperCase()} instantly. Your files never touch external servers.`,
      },
      {
        question: `Will converting to ${toExt.toUpperCase()} preserve quality?`,
        answer: `Yes! You can choose maximum quality or adjust compression ratios to suit your exact needs.`,
      },
    ],
    seo: {
      title: `${name} Online - Free & Private ${fromExt.toUpperCase()} Converter`,
      description: `Fast and free online ${fromExt.toUpperCase()} to ${toExt.toUpperCase()} converter. Convert ${fromExt.toUpperCase()} to ${toExt.toUpperCase()} in your web browser with 100% privacy and zero server uploads.`,
      keywords: [
        `${fromExt.toLowerCase()} to ${toExt.toLowerCase()}`,
        `convert ${fromExt.toLowerCase()} to ${toExt.toLowerCase()}`,
        `free ${fromExt.toLowerCase()} converter`,
        `${fromExt.toLowerCase()} to ${toExt.toLowerCase()} online`,
      ],
      canonicalSlug: `convert/${slug}`,
    },
  };
}

export function createAudioConverterToolDefinition(
  slug: string,
  fromExt: string = 'MP4',
  toExt: string = 'MP3'
): ToolDefinition {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
  const name = `Convert ${fromExt.toUpperCase()} to ${toExt.toUpperCase()}`;

  return {
    id: `audio-${cleanSlug}`,
    slug: cleanSlug,
    name,
    shortDescription: `Extract and convert ${fromExt.toUpperCase()} video/audio streams directly to high-quality ${toExt.toUpperCase()} in your browser.`,
    fullDescription: `Instant 100% in-browser ${fromExt.toUpperCase()} to ${toExt.toUpperCase()} converter. Extract background music, podcast audio, and voice tracks from ${fromExt.toUpperCase()} videos with customizable bitrate options (128k, 192k, 256k, 320k) and zero server uploads.`,
    category: 'audio',
    processingType: 'browser',
    icon: 'Music',
    route: `/image-converter-tools/${cleanSlug}`,
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/aac', 'audio/ogg'],
    maxFileSizeMB: 200,
    isPopular: true,
    features: [
      `100% Client-Side ${fromExt.toUpperCase()} to ${toExt.toUpperCase()} audio extraction`,
      'Configurable audio bitrate (128 kbps up to 320 kbps studio quality)',
      'Zero server uploads ensuring absolute privacy',
      'Built-in audio player and waveform preview',
    ],
    howToSteps: [
      { step: 1, title: `Upload ${fromExt.toUpperCase()} File`, description: `Select your ${fromExt.toUpperCase()} video or audio file.` },
      { step: 2, title: 'Choose Bitrate', description: 'Select 192 kbps or 320 kbps audio quality.' },
      { step: 3, title: `Download ${toExt.toUpperCase()}`, description: `Click Convert to export your new ${toExt.toUpperCase()} file.` },
    ],
    faqs: [
      {
        question: `How do I convert ${fromExt.toUpperCase()} to ${toExt.toUpperCase()}?`,
        answer: `Drop your file on this page. Our in-browser Web Audio engine extracts the audio and encodes it into ${toExt.toUpperCase()} instantly.`,
      },
    ],
    seo: {
      title: `${name} Online Free - High Quality Audio Extractor`,
      description: `Free online ${fromExt.toUpperCase()} to ${toExt.toUpperCase()} converter. Extract high quality ${toExt.toUpperCase()} audio from ${fromExt.toUpperCase()} videos in your browser with 100% privacy.`,
      keywords: [
        `${fromExt.toLowerCase()} to ${toExt.toLowerCase()}`,
        `convert ${fromExt.toLowerCase()} to ${toExt.toLowerCase()}`,
        `extract audio from ${fromExt.toLowerCase()}`,
      ],
      canonicalSlug: cleanSlug,
    },
  };
}

export function parseConverterRoute(path: string): ToolDefinition | undefined {
  const clean = path.replace(/^\/+|\/+$/g, '').toLowerCase();

  // Match Audio & Video Converters (e.g. mp4-to-mp3, video-to-mp3, convert-wav-to-mp3)
  const audioMatch = clean.match(/^(?:convert-image-tools\/|convert\/|convert-)?(mp4|video|mov|avi|webm|wav|m4a|aac|flac|ogg)-to-(mp3|wav|m4a|ogg)(?:-converter)?$/i);
  if (audioMatch) {
    const fromExt = audioMatch[1].toUpperCase();
    const toExt = audioMatch[2].toUpperCase();
    return createAudioConverterToolDefinition(clean, fromExt, toExt);
  }

  // Strip known converter prefixes: convert-image-tools/, image-converter-tools/, convert/, or convert-
  let pairSlug = clean
    .replace(/^convert-image-tools\//, '')
    .replace(/^image-converter-tools\//, '')
    .replace(/^convert\//, '')
    .replace(/^convert-/, '');

  if (!pairSlug) return undefined;

  // Match known popular pairs
  const found = POPULAR_CONVERTER_PAIRS.find((p) => p.slug === pairSlug);
  if (found) {
    return createConverterToolDefinition(
      found.slug,
      found.fromExt,
      found.toExt,
      found.fromFormat,
      found.toFormat
    );
  }

  // Dynamic pair match: xxx-to-yyy
  const match = pairSlug.match(/^([a-z0-9]+)-to-([a-z0-9]+)$/i);
  if (match) {
    const fromExt = match[1].toUpperCase();
    const toExt = match[2].toUpperCase();
    const toMime =
      toExt === 'PNG' ? 'image/png' :
      toExt === 'JPG' || toExt === 'JPEG' ? 'image/jpeg' :
      toExt === 'WEBP' ? 'image/webp' :
      toExt === 'AVIF' ? 'image/avif' :
      toExt === 'SVG' ? 'image/svg+xml' :
      toExt === 'ICO' ? 'image/x-icon' :
      toExt === 'PDF' ? 'application/pdf' : 'image/png';

    return createConverterToolDefinition(
      pairSlug,
      fromExt,
      toExt,
      'image/*',
      toMime
    );
  }

  return undefined;
}
