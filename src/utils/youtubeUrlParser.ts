import {
  YouTubeUrlParseResult,
  YouTubeThumbnailResolution,
  YouTubeThumbnailInfo,
  YouTubeEmbedOptions,
} from '../types/youtube';

/**
 * Robust, unified YouTube URL Parser & Extractor
 * Handles watch, shorts, live, embed, youtu.be, channels, handles, and custom URLs.
 */
export function parseYouTubeUrl(inputUrl: string): YouTubeUrlParseResult {
  const trimmed = (inputUrl || '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      originalUrl: inputUrl,
      errorMessage: 'Please enter a YouTube video or channel URL.',
    };
  }

  // Pre-check: If user just pasted a bare 11-char video ID (e.g. dQw4w9WgXcQ)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return {
      isValid: true,
      urlType: 'watch',
      videoId: trimmed,
      cleanUrl: `https://www.youtube.com/watch?v=${trimmed}`,
      originalUrl: inputUrl,
    };
  }

  let parsed: URL;
  try {
    // Add protocol if missing
    const urlWithProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    parsed = new URL(urlWithProto);
  } catch {
    return {
      isValid: false,
      originalUrl: inputUrl,
      errorMessage: 'Invalid URL format. Please enter a valid URL.',
    };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
  const pathname = parsed.pathname;
  const searchParams = parsed.searchParams;

  const isYouTubeHost =
    hostname === 'youtube.com' ||
    hostname === 'youtu.be' ||
    hostname === 'youtube-nocookie.com';

  if (!isYouTubeHost) {
    return {
      isValid: false,
      originalUrl: inputUrl,
      errorMessage: 'The URL is not from youtube.com or youtu.be domain.',
    };
  }

  // Extract timestamp if present in search params
  let timestampSeconds: number | undefined;
  const rawT = searchParams.get('t') || searchParams.get('start') || searchParams.get('time_continue');
  if (rawT) {
    timestampSeconds = parseTimestampStringToSeconds(rawT);
  }

  const playlistId = searchParams.get('list') || undefined;

  // 1. youtu.be/VIDEO_ID
  if (hostname === 'youtu.be') {
    const videoId = pathname.replace(/^\/+/, '').split('/')[0];
    if (videoId && isValidVideoId(videoId)) {
      return {
        isValid: true,
        urlType: 'short_url',
        videoId,
        playlistId,
        timestampSeconds,
        timestampFormatted: timestampSeconds !== undefined ? formatSecondsToTimestamp(timestampSeconds) : undefined,
        cleanUrl: `https://youtu.be/${videoId}${timestampSeconds ? `?t=${timestampSeconds}` : ''}`,
        originalUrl: inputUrl,
      };
    }
  }

  // 2. youtube.com/watch?v=VIDEO_ID
  if (pathname.startsWith('/watch')) {
    const videoId = searchParams.get('v');
    if (videoId && isValidVideoId(videoId)) {
      return {
        isValid: true,
        urlType: 'watch',
        videoId,
        playlistId,
        timestampSeconds,
        timestampFormatted: timestampSeconds !== undefined ? formatSecondsToTimestamp(timestampSeconds) : undefined,
        cleanUrl: `https://www.youtube.com/watch?v=${videoId}`,
        originalUrl: inputUrl,
      };
    }
  }

  // 3. youtube.com/shorts/VIDEO_ID
  if (pathname.startsWith('/shorts/')) {
    const videoId = pathname.split('/shorts/')[1]?.split('/')[0]?.split('?')[0];
    if (videoId && isValidVideoId(videoId)) {
      return {
        isValid: true,
        urlType: 'short',
        videoId,
        timestampSeconds,
        timestampFormatted: timestampSeconds !== undefined ? formatSecondsToTimestamp(timestampSeconds) : undefined,
        cleanUrl: `https://www.youtube.com/shorts/${videoId}`,
        originalUrl: inputUrl,
      };
    }
  }

  // 4. youtube.com/live/VIDEO_ID
  if (pathname.startsWith('/live/')) {
    const videoId = pathname.split('/live/')[1]?.split('/')[0]?.split('?')[0];
    if (videoId && isValidVideoId(videoId)) {
      return {
        isValid: true,
        urlType: 'live',
        videoId,
        timestampSeconds,
        timestampFormatted: timestampSeconds !== undefined ? formatSecondsToTimestamp(timestampSeconds) : undefined,
        cleanUrl: `https://www.youtube.com/live/${videoId}`,
        originalUrl: inputUrl,
      };
    }
  }

  // 5. youtube.com/embed/VIDEO_ID
  if (pathname.startsWith('/embed/')) {
    const videoId = pathname.split('/embed/')[1]?.split('/')[0]?.split('?')[0];
    if (videoId && isValidVideoId(videoId)) {
      return {
        isValid: true,
        urlType: 'embed',
        videoId,
        playlistId,
        timestampSeconds,
        cleanUrl: `https://www.youtube.com/embed/${videoId}`,
        originalUrl: inputUrl,
      };
    }
  }

  // 6. Channel / Handle Patterns
  // 6a. youtube.com/channel/CHANNEL_ID (Starts with UC...)
  if (pathname.startsWith('/channel/')) {
    const channelId = pathname.split('/channel/')[1]?.split('/')[0];
    if (channelId) {
      return {
        isValid: true,
        urlType: 'channel',
        channelId,
        cleanUrl: `https://www.youtube.com/channel/${channelId}`,
        originalUrl: inputUrl,
      };
    }
  }

  // 6b. youtube.com/@handle
  if (pathname.startsWith('/@')) {
    const handle = pathname.split('/')[1]?.split('?')[0];
    if (handle) {
      return {
        isValid: true,
        urlType: 'handle',
        handle: handle.startsWith('@') ? handle : `@${handle}`,
        cleanUrl: `https://www.youtube.com/${handle}`,
        originalUrl: inputUrl,
      };
    }
  }

  // 6c. youtube.com/c/CustomName or /user/Username
  if (pathname.startsWith('/c/') || pathname.startsWith('/user/')) {
    const segments = pathname.split('/').filter(Boolean);
    const identifier = segments[1];
    return {
      isValid: true,
      urlType: pathname.startsWith('/c/') ? 'custom_channel' : 'user',
      handle: identifier,
      cleanUrl: `https://www.youtube.com/${segments[0]}/${identifier}`,
      originalUrl: inputUrl,
    };
  }

  // Check if pathname itself is a direct handle or ID
  const firstSeg = pathname.replace(/^\/+/, '').split('/')[0];
  if (firstSeg && firstSeg.startsWith('@')) {
    return {
      isValid: true,
      urlType: 'handle',
      handle: firstSeg,
      cleanUrl: `https://www.youtube.com/${firstSeg}`,
      originalUrl: inputUrl,
    };
  }

  return {
    isValid: false,
    originalUrl: inputUrl,
    errorMessage: 'Could not extract a valid YouTube video ID or channel identifier.',
  };
}

/**
 * Validate standard 11-char YouTube video ID
 */
export function isValidVideoId(id: string): boolean {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(id);
}

/**
 * Parse human timestamp ("1:23:45", "04:30", "90s", "1h20m10s", "45") into total seconds.
 */
export function parseTimestampStringToSeconds(input: string): number {
  if (!input) return 0;
  const str = input.trim();

  // Pattern: 1h20m30s or 20m15s or 90s
  if (/[hms]/.test(str)) {
    let total = 0;
    const hMatch = str.match(/(\d+)\s*h/i);
    const mMatch = str.match(/(\d+)\s*m/i);
    const sMatch = str.match(/(\d+)\s*s/i);

    if (hMatch) total += parseInt(hMatch[1], 10) * 3600;
    if (mMatch) total += parseInt(mMatch[1], 10) * 60;
    if (sMatch) total += parseInt(sMatch[1], 10);
    return Math.max(0, total);
  }

  // Pattern: HH:MM:SS or MM:SS
  if (str.includes(':')) {
    const parts = str.split(':').map((p) => parseInt(p, 10) || 0);
    if (parts.length === 3) {
      // HH:MM:SS
      return Math.max(0, parts[0] * 3600 + parts[1] * 60 + parts[2]);
    }
    if (parts.length === 2) {
      // MM:SS
      return Math.max(0, parts[0] * 60 + parts[1]);
    }
  }

  // Pure numeric seconds
  const numeric = parseInt(str, 10);
  return isNaN(numeric) ? 0 : Math.max(0, numeric);
}

/**
 * Format total seconds into clean HH:MM:SS or MM:SS
 */
export function formatSecondsToTimestamp(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const seconds = safeSec % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Generate all 5 standard thumbnail definitions for a YouTube video
 */
export function getThumbnailVariants(videoId: string): YouTubeThumbnailInfo[] {
  return [
    {
      resolutionKey: 'maxresdefault',
      label: 'Maximum Resolution (HD)',
      width: 1280,
      height: 720,
      aspectRatio: '16:9',
      url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      isAvailable: true, // Probed dynamically on client
      fileType: 'JPG',
      approxSize: '~150 - 300 KB',
    },
    {
      resolutionKey: 'sddefault',
      label: 'Standard Definition (SD)',
      width: 640,
      height: 480,
      aspectRatio: '4:3',
      url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
      isAvailable: true,
      fileType: 'JPG',
      approxSize: '~40 - 80 KB',
    },
    {
      resolutionKey: 'hqdefault',
      label: 'High Quality (HQ)',
      width: 480,
      height: 360,
      aspectRatio: '4:3',
      url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      isAvailable: true,
      fileType: 'JPG',
      approxSize: '~25 - 50 KB',
    },
    {
      resolutionKey: 'mqdefault',
      label: 'Medium Quality (MQ)',
      width: 320,
      height: 180,
      aspectRatio: '16:9',
      url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      isAvailable: true,
      fileType: 'JPG',
      approxSize: '~15 - 30 KB',
    },
    {
      resolutionKey: 'default',
      label: 'Default / Thumbnail',
      width: 120,
      height: 90,
      aspectRatio: '4:3',
      url: `https://img.youtube.com/vi/${videoId}/default.jpg`,
      isAvailable: true,
      fileType: 'JPG',
      approxSize: '~5 - 10 KB',
    },
  ];
}

/**
 * Generate timestamp share URLs
 */
export function generateTimestampUrls(
  videoId: string,
  startSeconds: number,
  endSeconds?: number,
  existingParams?: { list?: string; si?: string }
): {
  watchUrl: string;
  shortUrl: string;
  embedUrl: string;
} {
  const watchBase = new URL('https://www.youtube.com/watch');
  watchBase.searchParams.set('v', videoId);
  if (startSeconds > 0) {
    watchBase.searchParams.set('t', `${startSeconds}s`);
  }
  if (existingParams?.list) {
    watchBase.searchParams.set('list', existingParams.list);
  }
  if (existingParams?.si) {
    watchBase.searchParams.set('si', existingParams.si);
  }

  const shortBase = new URL(`https://youtu.be/${videoId}`);
  if (startSeconds > 0) {
    shortBase.searchParams.set('t', `${startSeconds}`);
  }
  if (existingParams?.si) {
    shortBase.searchParams.set('si', existingParams.si);
  }

  const embedBase = new URL(`https://www.youtube.com/embed/${videoId}`);
  if (startSeconds > 0) {
    embedBase.searchParams.set('start', `${startSeconds}`);
  }
  if (endSeconds && endSeconds > startSeconds) {
    embedBase.searchParams.set('end', `${endSeconds}`);
  }

  return {
    watchUrl: watchBase.toString(),
    shortUrl: shortBase.toString(),
    embedUrl: embedBase.toString(),
  };
}

/**
 * Build real YouTube Embed URL with user-configured parameters
 */
export function buildEmbedUrl(options: YouTubeEmbedOptions): string {
  const domain = options.privacyEnhanced ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com';
  const url = new URL(`${domain}/embed/${options.videoId}`);

  if (options.autoplay) url.searchParams.set('autoplay', '1');
  if (options.mute) url.searchParams.set('mute', '1');
  if (!options.controls) url.searchParams.set('controls', '0');
  if (options.loop) {
    url.searchParams.set('loop', '1');
    url.searchParams.set('playlist', options.videoId);
  }
  if (!options.relatedVideos) url.searchParams.set('rel', '0');
  if (options.startTime && options.startTime > 0) url.searchParams.set('start', `${options.startTime}`);
  if (options.endTime && options.endTime > (options.startTime || 0)) url.searchParams.set('end', `${options.endTime}`);

  return url.toString();
}

/**
 * Build iframe HTML markup
 */
export function generateIframeCode(options: YouTubeEmbedOptions): string {
  const embedUrl = buildEmbedUrl(options);

  if (options.isResponsive) {
    const aspectStyle =
      options.aspectRatio === '16:9'
        ? 'aspect-video'
        : options.aspectRatio === '4:3'
        ? 'aspect-[4/3]'
        : options.aspectRatio === '1:1'
        ? 'aspect-square'
        : options.aspectRatio === '9:16'
        ? 'aspect-[9/16]'
        : 'aspect-video';

    return `<div style="position: relative; width: 100%; padding-bottom: ${
      options.aspectRatio === '4:3' ? '75%' : options.aspectRatio === '1:1' ? '100%' : options.aspectRatio === '9:16' ? '177.77%' : '56.25%'
    }; height: 0; overflow: hidden; border-radius: 12px;">
  <iframe
    src="${embedUrl}"
    title="YouTube video player"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    ${options.fullscreen ? 'allowfullscreen' : ''}
  ></iframe>
</div>`;
  }

  return `<iframe
  width="${options.width || 560}"
  height="${options.height || 315}"
  src="${embedUrl}"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  ${options.fullscreen ? 'allowfullscreen' : ''}
></iframe>`;
}
