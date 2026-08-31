import { ToolDefinition } from '../types';

export interface TargetSizeLinkItem {
  slug: string;
  label: string;
  targetSizeKb: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';
  type: 'compress' | 'resize';
  mediaType?: 'image' | 'pdf';
}

export const EXACT_IMAGE_TARGET_SIZE_ITEMS: TargetSizeLinkItem[] = [5, 10, 20, 30, 50, 100, 200, 300, 500, 1000, 2000].map((kb) => ({
  slug: kb >= 1000 ? `compress-image-to-${kb / 1000}mb` : `compress-image-to-${kb}kb`,
  label: kb >= 1000 ? `Image to ${kb / 1000}MB` : `Image to ${kb}KB`,
  targetSizeKb: kb,
  type: 'compress',
  mediaType: 'image'
}));

export const EXACT_PDF_TARGET_SIZE_ITEMS: TargetSizeLinkItem[] = [20, 50, 100, 150, 200, 300, 500, 1000, 2000, 5000].map((kb) => ({
  slug: kb >= 1000 ? `compress-pdf-to-${kb / 1000}mb` : `compress-pdf-to-${kb}kb`,
  label: kb >= 1000 ? `PDF to ${kb / 1000}MB` : `PDF to ${kb}KB`,
  targetSizeKb: kb,
  format: 'application/pdf',
  type: 'compress',
  mediaType: 'pdf'
}));

export const EXACT_TARGET_SIZE_ITEMS: TargetSizeLinkItem[] = [
  ...EXACT_IMAGE_TARGET_SIZE_ITEMS,
  ...EXACT_PDF_TARGET_SIZE_ITEMS,
];

export const SOCIAL_PRESETS_MAP: Record<string, { name: string; width: number; height: number; platform: string; categorySlug: string }> = {
  // Instagram
  'instagram': { name: 'Resize Image for Instagram Square', width: 1080, height: 1080, platform: 'Instagram', categorySlug: 'resize-image-tools' },
  'instagram-portrait': { name: 'Resize Image for Instagram Portrait', width: 1080, height: 1350, platform: 'Instagram', categorySlug: 'resize-image-tools' },
  'instagram-story': { name: 'Resize Image for Instagram Story & Reel', width: 1080, height: 1920, platform: 'Instagram', categorySlug: 'resize-image-tools' },
  'instagram-landscape': { name: 'Resize Image for Instagram Landscape', width: 1080, height: 566, platform: 'Instagram', categorySlug: 'resize-image-tools' },
  'instagram-profile-picture': { name: 'Resize Image for Instagram Profile Picture', width: 320, height: 320, platform: 'Instagram', categorySlug: 'resize-image-tools' },

  // YouTube
  'youtube-banner': { name: 'Resize Image for YouTube Channel Banner', width: 2560, height: 1440, platform: 'YouTube', categorySlug: 'youtube-tools' },
  'youtube-thumbnail': { name: 'Resize Image for YouTube HD Thumbnail', width: 1280, height: 720, platform: 'YouTube', categorySlug: 'youtube-tools' },
  'youtube-channel-icon': { name: 'Resize Image for YouTube Channel Icon', width: 800, height: 800, platform: 'YouTube', categorySlug: 'youtube-tools' },
  'youtube-channel-art': { name: 'Resize Image for YouTube Channel Art', width: 2560, height: 1440, platform: 'YouTube', categorySlug: 'youtube-tools' },

  // Discord & Avatars
  'discord-profile-picture': { name: 'Resize Image for Discord Profile Picture', width: 512, height: 512, platform: 'Discord', categorySlug: 'resize-image-tools' },
  'discord-pfp': { name: 'Resize Image for Discord Pfp', width: 128, height: 128, platform: 'Discord', categorySlug: 'resize-image-tools' },
  'discord-banner': { name: 'Resize Image for Discord Banner', width: 600, height: 240, platform: 'Discord', categorySlug: 'resize-image-tools' },
  'avatar': { name: 'Resize Avatar Photo', width: 400, height: 400, platform: 'Avatar', categorySlug: 'resize-image-tools' },

  // Pinterest
  'pinterest-pin': { name: 'Resize Image for Pinterest Pin', width: 1000, height: 1500, platform: 'Pinterest', categorySlug: 'resize-image-tools' },
  'pinterest-large-pin': { name: 'Resize Image for Pinterest Large Pin', width: 1000, height: 1500, platform: 'Pinterest', categorySlug: 'resize-image-tools' },
  'pinterest-medium-pin': { name: 'Resize Image for Pinterest Medium Pin', width: 600, height: 900, platform: 'Pinterest', categorySlug: 'resize-image-tools' },
  'pinterest-small-pin': { name: 'Resize Image for Pinterest Small Pin', width: 236, height: 354, platform: 'Pinterest', categorySlug: 'resize-image-tools' },
  'pinterest-square-pin': { name: 'Resize Image for Pinterest Square Pin', width: 1000, height: 1000, platform: 'Pinterest', categorySlug: 'resize-image-tools' },
  'pinterest-profile-picture': { name: 'Resize Image for Pinterest Profile Picture', width: 165, height: 165, platform: 'Pinterest', categorySlug: 'resize-image-tools' },

  // Twitter / X
  'twitter-header': { name: 'Resize Image for X / Twitter Header Banner', width: 1500, height: 500, platform: 'X / Twitter', categorySlug: 'resize-image-tools' },
  'twitter-profile-picture': { name: 'Resize Image for X / Twitter Profile Picture', width: 400, height: 400, platform: 'X / Twitter', categorySlug: 'resize-image-tools' },
  'twitter-card': { name: 'Resize Image for X / Twitter Card', width: 1200, height: 628, platform: 'X / Twitter', categorySlug: 'resize-image-tools' },

  // Facebook
  'facebook-cover': { name: 'Resize Image for Facebook Cover Photo', width: 820, height: 312, platform: 'Facebook', categorySlug: 'resize-image-tools' },
  'facebook-profile-picture': { name: 'Resize Image for Facebook Profile Picture', width: 170, height: 170, platform: 'Facebook', categorySlug: 'resize-image-tools' },
  'facebook-post': { name: 'Resize Image for Facebook Post', width: 1200, height: 630, platform: 'Facebook', categorySlug: 'resize-image-tools' },
  'facebook-event-cover': { name: 'Resize Image for Facebook Event Cover', width: 1920, height: 1005, platform: 'Facebook', categorySlug: 'resize-image-tools' },
  'facebook-group-cover': { name: 'Resize Image for Facebook Group Cover', width: 1640, height: 856, platform: 'Facebook', categorySlug: 'resize-image-tools' },
  'facebook-page-cover': { name: 'Resize Image for Facebook Page Cover', width: 820, height: 312, platform: 'Facebook', categorySlug: 'resize-image-tools' },
  'facebook-story': { name: 'Resize Image for Facebook Story', width: 1080, height: 1920, platform: 'Facebook', categorySlug: 'resize-image-tools' },
  'facebook-app': { name: 'Resize Image for Facebook App Image', width: 1200, height: 628, platform: 'Facebook', categorySlug: 'resize-image-tools' },

  // LinkedIn
  'linkedin-header': { name: 'Resize Image for LinkedIn Cover Banner', width: 1584, height: 396, platform: 'LinkedIn', categorySlug: 'resize-image-tools' },
  'linkedin-banner': { name: 'Resize Image for LinkedIn Cover Banner', width: 1584, height: 396, platform: 'LinkedIn', categorySlug: 'resize-image-tools' },
  'linkedin-background': { name: 'Resize Image for LinkedIn Background Photo', width: 1584, height: 396, platform: 'LinkedIn', categorySlug: 'resize-image-tools' },
  'linkedin-profile-picture': { name: 'Resize Image for LinkedIn Profile Picture', width: 400, height: 400, platform: 'LinkedIn', categorySlug: 'resize-image-tools' },
  'linkedin-company-profile-picture': { name: 'Resize Image for LinkedIn Company Profile Picture', width: 300, height: 300, platform: 'LinkedIn', categorySlug: 'resize-image-tools' },
  'linkedin-company-cover': { name: 'Resize Image for LinkedIn Company Cover', width: 1128, height: 191, platform: 'LinkedIn', categorySlug: 'resize-image-tools' },
  'linkedin-post': { name: 'Resize Image for LinkedIn Post', width: 1200, height: 627, platform: 'LinkedIn', categorySlug: 'resize-image-tools' },

  // Threads
  'threads-profile-picture': { name: 'Resize Image for Threads Profile Picture', width: 320, height: 320, platform: 'Threads', categorySlug: 'resize-image-tools' },
  'threads-square-post': { name: 'Resize Image for Threads Square Post', width: 1080, height: 1080, platform: 'Threads', categorySlug: 'resize-image-tools' },
  'threads-landscape': { name: 'Resize Image for Threads Landscape Image', width: 1080, height: 566, platform: 'Threads', categorySlug: 'resize-image-tools' },
  'threads-link-preview': { name: 'Resize Image for Threads Link Preview', width: 1200, height: 630, platform: 'Threads', categorySlug: 'resize-image-tools' },

  // Tumblr
  'tumblr-tall-photo-post': { name: 'Resize Image for Tumblr Tall Photo Post', width: 1280, height: 1920, platform: 'Tumblr', categorySlug: 'resize-image-tools' },
  'tumblr-photo-post': { name: 'Resize Image for Tumblr Photo Post', width: 500, height: 750, platform: 'Tumblr', categorySlug: 'resize-image-tools' },
  'tumblr-header': { name: 'Resize Image for Tumblr Header', width: 3000, height: 1055, platform: 'Tumblr', categorySlug: 'resize-image-tools' },
  'tumblr-profile-picture': { name: 'Resize Image for Tumblr Profile Picture', width: 128, height: 128, platform: 'Tumblr', categorySlug: 'resize-image-tools' },

  // Twitch
  'twitch-profile-banner': { name: 'Resize Image for Twitch Profile Banner', width: 1200, height: 480, platform: 'Twitch', categorySlug: 'resize-image-tools' },
  'twitch-video-player-banner': { name: 'Resize Image for Twitch Video Player Banner', width: 1920, height: 1080, platform: 'Twitch', categorySlug: 'resize-image-tools' },
  'twitch-emotes': { name: 'Resize Image for Twitch Emotes', width: 112, height: 112, platform: 'Twitch', categorySlug: 'resize-image-tools' },
  'twitch-panel-header': { name: 'Resize Image for Twitch Panel Header', width: 320, height: 160, platform: 'Twitch', categorySlug: 'resize-image-tools' },

  // Snapchat
  'snapchat-story': { name: 'Resize Image for Snapchat Story', width: 1080, height: 1920, platform: 'Snapchat', categorySlug: 'resize-image-tools' },
  'snapchat-geofilter': { name: 'Resize Image for Snapchat Geofilter', width: 1080, height: 2340, platform: 'Snapchat', categorySlug: 'resize-image-tools' },
  'snapchat-shared': { name: 'Resize Image for Snapchat Shared Image', width: 1080, height: 1920, platform: 'Snapchat', categorySlug: 'resize-image-tools' },

  // WhatsApp
  'whatsapp-status': { name: 'Resize Image for WhatsApp Status', width: 1080, height: 1920, platform: 'WhatsApp', categorySlug: 'resize-image-tools' },
  'whatsapp-profile-picture': { name: 'Resize Image for WhatsApp Profile Picture', width: 500, height: 500, platform: 'WhatsApp', categorySlug: 'resize-image-tools' },
  'whatsapp-chat-image': { name: 'Resize Image for WhatsApp Chat Image', width: 800, height: 800, platform: 'WhatsApp', categorySlug: 'resize-image-tools' },

  // SoundCloud & Spotify
  'spotify-playlist-cover': { name: 'Resize Image for Spotify Playlist Cover', width: 300, height: 300, platform: 'Spotify', categorySlug: 'resize-image-tools' },
  'spotify-header-overlay': { name: 'Resize Image for Spotify Header Overlay', width: 2660, height: 1140, platform: 'Spotify', categorySlug: 'resize-image-tools' },
  'soundcloud-header': { name: 'Resize Image for SoundCloud Header', width: 2480, height: 520, platform: 'SoundCloud', categorySlug: 'resize-image-tools' },
  'soundcloud-track-art': { name: 'Resize Image for SoundCloud Track Art', width: 800, height: 800, platform: 'SoundCloud', categorySlug: 'resize-image-tools' },
  'soundcloud-profile-picture': { name: 'Resize Image for SoundCloud Profile Picture', width: 1000, height: 1000, platform: 'SoundCloud', categorySlug: 'resize-image-tools' },

  // Reddit & Telegram
  'reddit-banner': { name: 'Resize Image for Reddit Banner', width: 1920, height: 384, platform: 'Reddit', categorySlug: 'resize-image-tools' },
  'reddit-community-icon': { name: 'Resize Image for Reddit Community Icon', width: 256, height: 256, platform: 'Reddit', categorySlug: 'resize-image-tools' },
  'telegram-profile-picture': { name: 'Resize Image for Telegram Profile Picture', width: 512, height: 512, platform: 'Telegram', categorySlug: 'resize-image-tools' },
  'telegram-sticker': { name: 'Resize Image for Telegram Sticker', width: 512, height: 512, platform: 'Telegram', categorySlug: 'resize-image-tools' },
  'telegram-chat-background': { name: 'Resize Image for Telegram Chat Background', width: 1440, height: 2960, platform: 'Telegram', categorySlug: 'resize-image-tools' },
};

export const SOCIAL_PRESETS_LIST = Object.entries(SOCIAL_PRESETS_MAP).map(([key, item]) => ({
  slug: `resize-image-for-${key}`,
  name: item.name.replace(/^Resize Image for /, ''),
  dimensions: `${item.width} × ${item.height} px`,
  platform: item.platform,
}));

export const PIXEL_DIMENSIONS_LIST = [
  { slug: 'resize-image-to-1920x1080', label: '1920 × 1080', desc: 'Full HD (16:9)' },
  { slug: 'resize-image-to-1080x1080', label: '1080 × 1080', desc: 'Square (1:1)' },
  { slug: 'resize-image-to-1280x720', label: '1280 × 720', desc: 'HD Ready (16:9)' },
  { slug: 'resize-image-to-1080x1350', label: '1080 × 1350', desc: 'Portrait (4:5)' },
  { slug: 'resize-image-to-800x600', label: '800 × 600', desc: 'Web (4:3)' },
  { slug: 'resize-image-to-400x400', label: '400 × 400', desc: 'Avatar (1:1)' },
];

export const FORMAT_RESIZE_LIST = [
  { slug: 'resize-png-to-200kb', label: 'Resize PNG to 200KB', format: 'PNG' },
  { slug: 'resize-jpeg-to-100kb', label: 'Resize JPEG to 100KB', format: 'JPEG' },
  { slug: 'resize-webp-to-50kb', label: 'Resize WebP to 50KB', format: 'WebP' },
];

export function createTargetSizeToolDefinition(
  slug: string,
  targetSizeKb: number,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  type: 'compress' | 'resize' = 'compress'
): ToolDefinition {
  const isMb = targetSizeKb >= 1000;
  const sizeLabel = isMb ? `${targetSizeKb / 1000}MB` : `${targetSizeKb}KB`;
  const formatExt = format === 'image/png' ? 'PNG' : format === 'image/webp' ? 'WebP' : 'JPEG';
  const name = type === 'resize' ? `Resize Image to ${sizeLabel}` : `Compress Image to ${sizeLabel}`;

  return {
    id: `target-${slug}`,
    slug: slug,
    name,
    shortDescription: `${type === 'resize' ? 'Resize' : 'Compress'} ${formatExt} photo directly to ${sizeLabel} or less online.`,
    fullDescription: `Instant browser-side image optimizer engineered to hit exact ${sizeLabel} target file size limits. Adjusts JPEG quality, canvas sampling, and quantization to guarantee strict upload compliance for government portals, job applications, and visa documents.`,
    category: type === 'resize' ? 'resize' : 'compress',
    processingType: 'browser',
    icon: type === 'resize' ? 'Scaling' : 'Minimize2',
    route: `/${type === 'resize' ? 'resize-image-tools' : 'compress-image-tools'}/${slug}`,
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: [
      `Exact ${sizeLabel} target file size ceiling guarantee`,
      '100% client-side WebAssembly optimization with zero server uploads',
      'Preserves original pixel dimensions while adjusting quantization matrix',
      'Instant side-by-side preview and comparison of original vs compressed bytes',
    ],
    howToSteps: [
      { step: 1, title: 'Upload Photo', description: `Drag and drop your photo. Target is pre-set to ${sizeLabel}.` },
      { step: 2, title: 'Verify Target Settings', description: `Engine tunes compression to stay strictly under ${sizeLabel}.` },
      { step: 3, title: 'Download Optimized Image', description: `Download your newly optimized ${sizeLabel} image.` },
    ],
    faqs: [
      {
        question: `How do I reduce an image to ${sizeLabel}?`,
        answer: `Upload your photo on this page. Our engine automatically adjusts compression quality to meet ${sizeLabel}.`,
      },
    ],
    seo: {
      title: `${name} Online Free – Reduce File Size Under ${sizeLabel}`,
      description: `${type === 'resize' ? 'Resize' : 'Compress'} photo size under ${sizeLabel} online for free. Guaranteed to meet strict portal limits.`,
      keywords: [
        `compress image to ${sizeLabel.toLowerCase()}`,
        `reduce photo size to ${sizeLabel.toLowerCase()}`,
        `image optimizer ${sizeLabel.toLowerCase()}`,
      ],
      canonicalSlug: slug,
    },
  };
}

export function createPdfTargetSizeToolDefinition(
  slug: string,
  targetSizeKb: number
): ToolDefinition {
  const isMb = targetSizeKb >= 1000;
  const sizeLabel = isMb ? `${targetSizeKb / 1000}MB` : `${targetSizeKb}KB`;
  const name = `Compress PDF to ${sizeLabel}`;

  return {
    id: `target-${slug}`,
    slug: slug,
    name,
    shortDescription: `Compress PDF document directly to ${sizeLabel} or less online.`,
    fullDescription: `Instant browser-side PDF compressor engineered to hit exact ${sizeLabel} target file size limits. Optimizes font streams, vector paths, embedded imagery, and removes unneeded metadata to guarantee strict portal, job, or visa upload compliance.`,
    category: 'pdf',
    processingType: 'browser',
    icon: 'Minimize',
    route: `/pdf-tools/${slug}`,
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['application/pdf'],
    maxFileSizeMB: 150,
    isPopular: true,
    features: [
      `Exact ${sizeLabel} target file size ceiling guarantee`,
      '100% client-side PDF stream optimization with zero server uploads',
      'Preserves sharp vector text glyphs, form fields, and layout structures',
    ],
    howToSteps: [
      { step: 1, title: 'Upload PDF Document', description: `Drag and drop your PDF file. Target is pre-set to ${sizeLabel}.` },
      { step: 2, title: 'Verify Target Settings', description: `Engine tunes object streams to stay strictly under ${sizeLabel}.` },
      { step: 3, title: 'Download Compressed PDF', description: `Download your compressed ${sizeLabel} PDF immediately.` },
    ],
    faqs: [
      {
        question: `How do I compress a PDF under ${sizeLabel}?`,
        answer: `Upload your PDF document on this page. Our engine automatically consolidates object streams to stay within ${sizeLabel}.`,
      },
    ],
    seo: {
      title: `${name} Online Free – Reduce PDF Size Under ${sizeLabel}`,
      description: `Compress and shrink PDF document size under ${sizeLabel} online for free. Guaranteed to meet strict portal limits.`,
      keywords: [
        `compress pdf to ${sizeLabel.toLowerCase()}`,
        `reduce pdf size to ${sizeLabel.toLowerCase()}`,
      ],
      canonicalSlug: slug,
    },
  };
}

export function createSocialPresetToolDefinition(
  slug: string,
  platformKey: string
): ToolDefinition {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
  const preset = SOCIAL_PRESETS_MAP[platformKey] || {
    name: `Resize Image for ${platformKey.charAt(0).toUpperCase() + platformKey.slice(1)}`,
    width: 1080,
    height: 1080,
    platform: platformKey.charAt(0).toUpperCase() + platformKey.slice(1),
    categorySlug: 'resize-image-tools',
  };

  const name = preset.name;

  return {
    id: cleanSlug,
    slug: cleanSlug,
    name,
    shortDescription: `Resize photos to exact ${preset.platform} dimensions (${preset.width}x${preset.height} px) online.`,
    fullDescription: `Instant browser-side image resizer for ${preset.platform}. Automatically frames, scales, and cuts photos to exact ${preset.width}×${preset.height} pixel aspect ratios with 100% in-browser privacy protection.`,
    category: 'resize',
    processingType: 'browser',
    icon: 'Scaling',
    route: `/${preset.categorySlug}/${cleanSlug}`,
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: [
      `Pre-cut ${preset.platform} aspect ratio (${preset.width} × ${preset.height} px)`,
      'Lock aspect ratio toggle with high-quality Lanczos resampling',
      'Zero server uploads ensuring absolute photo privacy',
    ],
    howToSteps: [
      { step: 1, title: 'Upload Photo', description: `Select your graphic or photo. Pre-set for ${preset.platform}.` },
      { step: 2, title: 'Confirm Dimensions', description: `Target dimensions are pre-filled to ${preset.width} x ${preset.height} px.` },
      { step: 3, title: 'Download Resized Image', description: 'Save your perfectly formatted image.' },
    ],
    faqs: [
      {
        question: `What are the exact dimensions for ${preset.platform}?`,
        answer: `The official recommended dimension for ${preset.name} is ${preset.width} x ${preset.height} pixels.`,
      },
    ],
    seo: {
      title: `${name} – Free Online Tool`,
      description: `Resize photos for ${preset.platform} (${preset.width}x${preset.height} px) online for free. Fast, private in-browser photo resizer.`,
      keywords: [
        `resize image for ${preset.platform.toLowerCase()}`,
        `${preset.platform.toLowerCase()} image size converter`,
      ],
      canonicalSlug: cleanSlug,
    },
  };
}

export function createDimensionResizeToolDefinition(
  slug: string,
  width: number,
  height: number
): ToolDefinition {
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
  const name = `Resize Image to ${width}x${height} Pixels`;

  return {
    id: cleanSlug,
    slug: cleanSlug,
    name,
    shortDescription: `Resize photos to exact ${width}x${height} pixel dimensions online.`,
    fullDescription: `High-speed browser-side image resizer. Scale any JPEG, PNG, or WebP graphic to ${width}×${height} pixels without distortion.`,
    category: 'resize',
    processingType: 'browser',
    icon: 'Scaling',
    route: `/resize-image-tools/${slug}`,
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: [
      `Exact ${width} × ${height} pixel dimension scaling`,
      'Lanczos interpolation engine for sharp details',
    ],
    howToSteps: [
      { step: 1, title: 'Upload Photo', description: 'Drop your photo into the resizer.' },
      { step: 2, title: 'Apply Dimensions', description: `Width: ${width}px and Height: ${height}px are pre-set.` },
      { step: 3, title: 'Download Image', description: 'Export your newly sized image.' },
    ],
    faqs: [
      {
        question: `How do I resize an image to ${width}x${height}?`,
        answer: `Upload your photo on this page. Our engine automatically applies ${width}x${height} pixel dimensions.`,
      },
    ],
    seo: {
      title: `${name} Free Online`,
      description: `Resize photos to ${width}x${height} pixels online for free. Fast, private in-browser photo resizer.`,
      keywords: [
        `resize image to ${width}x${height}`,
        `change photo size to ${width}x${height} pixels`,
      ],
      canonicalSlug: slug,
    },
  };
}

/**
 * Dynamically parses any route matching pattern /compress-*-to-* or /resize-*-to-* or /reduce-*-to-*
 */
export function parseTargetSizeRoute(path: string): ToolDefinition | undefined {
  const clean = path.replace(/^\/+|\/+$/g, '').toLowerCase();

  // 1. Check exact predefined match in PDF items first
  const predefinedPdf = EXACT_PDF_TARGET_SIZE_ITEMS.find((item) => item.slug.toLowerCase() === clean);
  if (predefinedPdf) {
    return createPdfTargetSizeToolDefinition(predefinedPdf.slug, predefinedPdf.targetSizeKb);
  }

  // 2. Check exact predefined match in Image items
  const predefinedImg = EXACT_IMAGE_TARGET_SIZE_ITEMS.find((item) => item.slug.toLowerCase() === clean);
  if (predefinedImg) {
    const imgFormat = predefinedImg.format === 'image/png' || predefinedImg.format === 'image/webp' ? predefinedImg.format : 'image/jpeg';
    return createTargetSizeToolDefinition(
      predefinedImg.slug,
      predefinedImg.targetSizeKb,
      imgFormat,
      predefinedImg.type
    );
  }

  // 3. Dynamic Social Media Presets: /resize-(image|photo|picture)-for-([a-z0-9-]+) or [preset]-(resizer|cropper|maker)
  const socialMatch = clean.match(/^resize-(?:image|photo|picture)-for-([a-z0-9-]+)$/i);
  if (socialMatch && SOCIAL_PRESETS_MAP[socialMatch[1].toLowerCase()]) {
    return createSocialPresetToolDefinition(clean, socialMatch[1].toLowerCase());
  }

  const normalizedKey = clean
    .replace(/^resize-(?:image|photo|picture)-for-/, '')
    .replace(/-(?:resizer|cropper|maker|photo|picture|image)$/i, '')
    .toLowerCase();

  if (SOCIAL_PRESETS_MAP[normalizedKey]) {
    return createSocialPresetToolDefinition(clean, normalizedKey);
  }

  // 4. Dynamic Pixel Dimensions: /resize-(image|photo|picture)-to-(\d+)x(\d+)$/i
  const dimMatch = clean.match(/^resize-(?:image|photo|picture)-to-(\d+)x(\d+)$/i);
  if (dimMatch) {
    const w = parseInt(dimMatch[1], 10);
    const h = parseInt(dimMatch[2], 10);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
      return createDimensionResizeToolDefinition(clean, w, h);
    }
  }

  // 5. Dynamic PDF pattern matching:
  const pdfMatch = clean.match(/^(compress|reduce|shrink|optimize)-(?:pdf|document|pdf-file|pdf-document)-(?:between-(\d+)(?:kb)?-to-)?(?:to-)?(\d+)(kb|mb)$/i) ||
                   clean.match(/^(?:compress|reduce|shrink)-pdf-size-to-(\d+)(kb|mb)$/i);
  if (pdfMatch) {
    const num = parseInt(pdfMatch[pdfMatch.length - 2], 10);
    const unit = pdfMatch[pdfMatch.length - 1].toLowerCase();
    const targetSizeKb = unit === 'mb' ? num * 1000 : num;

    if (!isNaN(targetSizeKb) && targetSizeKb > 0) {
      return createPdfTargetSizeToolDefinition(clean, targetSizeKb);
    }
  }

  // 6. Dynamic Image pattern matching:
  const imgMatch = clean.match(/^(compress|resize|reduce)-(image|jpeg|jpg|png|webp|photos?)-(?:between-(\d+)(?:kb)?-to-)?(?:to-)?(\d+)(kb|mb)$/i);
  if (imgMatch) {
    const actionType = imgMatch[1] === 'resize' ? 'resize' : 'compress';
    const rawFmt = imgMatch[2].toLowerCase();
    const format: 'image/jpeg' | 'image/png' | 'image/webp' =
      rawFmt === 'png' ? 'image/png' : rawFmt === 'webp' ? 'image/webp' : 'image/jpeg';
    const num = parseInt(imgMatch[4], 10);
    const unit = imgMatch[5].toLowerCase();
    const targetSizeKb = unit === 'mb' ? num * 1000 : num;

    if (!isNaN(targetSizeKb) && targetSizeKb > 0) {
      return createTargetSizeToolDefinition(clean, targetSizeKb, format, actionType);
    }
  }

  if (clean.includes('between-20kb-to-50kb')) {
    if (clean.includes('pdf')) {
      return createPdfTargetSizeToolDefinition(clean, 35);
    }
    return createTargetSizeToolDefinition(clean, 35, 'image/jpeg', 'compress');
  }

  return undefined;
}
