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
  { slug: 'webp-to-png', fromFormat: 'image/webp', toFormat: 'image/png', fromExt: 'WEBP', toExt: 'PNG', title: 'Convert WEBP to PNG', description: 'Convert WebP images to lossless transparent PNG format online.' },
  { slug: 'webp-to-jpg', fromFormat: 'image/webp', toFormat: 'image/jpeg', fromExt: 'WEBP', toExt: 'JPG', title: 'Convert WEBP to JPG', description: 'Convert modern WebP pictures into universal JPG/JPEG format.' },
  { slug: 'heic-to-jpg', fromFormat: 'image/heic', toFormat: 'image/jpeg', fromExt: 'HEIC', toExt: 'JPG', title: 'Convert HEIC to JPG', description: 'Convert Apple iPhone HEIC and HEIF photos to high-compatibility JPG.' },
  { slug: 'heic-to-png', fromFormat: 'image/heic', toFormat: 'image/png', fromExt: 'HEIC', toExt: 'PNG', title: 'Convert HEIC to PNG', description: 'Convert iPhone HEIC photos to lossless PNG with transparency support.' },
  { slug: 'png-to-svg', fromFormat: 'image/png', toFormat: 'image/svg+xml', fromExt: 'PNG', toExt: 'SVG', title: 'Convert PNG to SVG Vector', description: 'Vectorize raster PNG images into scalable SVG vector graphics.' },
  { slug: 'jpg-to-svg', fromFormat: 'image/jpeg', toFormat: 'image/svg+xml', fromExt: 'JPG', toExt: 'SVG', title: 'Convert JPG to SVG Vector', description: 'Trace JPG photos into vector SVG paths with clean contour smoothing.' },
  { slug: 'svg-to-png', fromFormat: 'image/svg+xml', toFormat: 'image/png', fromExt: 'SVG', toExt: 'PNG', title: 'Convert SVG to PNG', description: 'Rasterize vector SVG files into crisp high-resolution PNG images.' },
  { slug: 'png-to-ico', fromFormat: 'image/png', toFormat: 'image/x-icon', fromExt: 'PNG', toExt: 'ICO', title: 'Convert PNG to ICO Favicon', description: 'Generate multi-resolution Windows ICO favicon files from PNG.' },
  { slug: 'png-to-pdf', fromFormat: 'image/png', toFormat: 'application/pdf', fromExt: 'PNG', toExt: 'PDF', title: 'Convert PNG to PDF', description: 'Convert single or multiple PNG images into printable PDF documents.' },
  { slug: 'jpg-to-pdf', fromFormat: 'image/jpeg', toFormat: 'application/pdf', fromExt: 'JPG', toExt: 'PDF', title: 'Convert JPG to PDF', description: 'Turn JPG photos and document scans into clean PDF pages.' },
  { slug: 'tiff-to-jpg', fromFormat: 'image/tiff', toFormat: 'image/jpeg', fromExt: 'TIFF', toExt: 'JPG', title: 'Convert TIFF to JPG', description: 'Convert multi-page TIFF and TIF image files into lightweight JPG.' },
  { slug: 'avif-to-jpg', fromFormat: 'image/avif', toFormat: 'image/jpeg', fromExt: 'AVIF', toExt: 'JPG', title: 'Convert AVIF to JPG', description: 'Convert next-generation AVIF images into standard JPEG format.' },
  { slug: 'avif-to-png', fromFormat: 'image/avif', toFormat: 'image/png', fromExt: 'AVIF', toExt: 'PNG', title: 'Convert AVIF to PNG', description: 'Convert AVIF files to lossless PNG with alpha channel preservation.' },
  { slug: 'gif-to-png', fromFormat: 'image/gif', toFormat: 'image/png', fromExt: 'GIF', toExt: 'PNG', title: 'Convert GIF to PNG Frames', description: 'Extract and convert animated GIF frames into crisp PNG images.' },
];

export function createConverterToolDefinition(
  slug: string,
  fromExt: string,
  toExt: string,
  fromFormat: string,
  toFormat: string
): ToolDefinition {
  const name = `Convert ${fromExt.toUpperCase()} to ${toExt.toUpperCase()}`;

  return {
    id: `convert-${slug}`,
    slug: `convert/${slug}`,
    name,
    shortDescription: `Convert ${fromExt.toUpperCase()} images directly to ${toExt.toUpperCase()} format in your browser with zero quality loss.`,
    fullDescription: `Instant browser-side ${fromExt.toUpperCase()} to ${toExt.toUpperCase()} converter. Transform files locally without uploading them to any remote server. Features high-speed canvas rasterization, alpha preservation, and instant downloads.`,
    category: 'convert',
    processingType: 'browser',
    icon: 'RefreshCw',
    route: `/convert/${slug}`,
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

export function parseConverterRoute(path: string): ToolDefinition | undefined {
  const clean = path.replace(/^\/+|\/+$/g, '').toLowerCase();

  // Check prefix: convert/xxx-to-yyy or convert-xxx-to-yyy
  let pairSlug = '';
  if (clean.startsWith('convert/')) {
    pairSlug = clean.replace('convert/', '');
  } else if (clean.startsWith('convert-')) {
    pairSlug = clean.replace('convert-', '');
  }

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
