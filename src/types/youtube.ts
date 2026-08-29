export interface YouTubeUrlParseResult {
  isValid: boolean;
  urlType?: 'watch' | 'short' | 'live' | 'embed' | 'short_url' | 'channel' | 'handle' | 'custom_channel' | 'user' | 'unknown';
  videoId?: string;
  channelId?: string;
  handle?: string;
  playlistId?: string;
  timestampSeconds?: number;
  timestampFormatted?: string;
  cleanUrl?: string;
  originalUrl: string;
  errorMessage?: string;
}

export type YouTubeThumbnailResolution = 'maxresdefault' | 'sddefault' | 'hqdefault' | 'mqdefault' | 'default';

export interface YouTubeThumbnailInfo {
  resolutionKey: YouTubeThumbnailResolution;
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
  url: string;
  isAvailable: boolean;
  fileType: 'JPG';
  approxSize?: string;
}

export interface YouTubeChannelResult {
  channelId: string;
  title: string;
  handle?: string;
  customUrl?: string;
  description?: string;
  avatarUrl?: string;
  subscriberCount?: string;
  videoCount?: string;
  source: 'direct_url' | 'api' | 'page_metadata';
  url: string;
}

export interface YouTubeTagResult {
  videoId: string;
  title: string;
  channelTitle: string;
  channelId?: string;
  tags: string[];
  description?: string;
  viewCount?: string;
  publishedAt?: string;
  duration?: string;
  hasApiData: boolean;
  statusMessage?: string;
  isFromOfficialApi: boolean;
}

export interface YouTubeEmbedOptions {
  videoId: string;
  isResponsive: boolean;
  aspectRatio: '16:9' | '4:3' | '1:1' | '9:16' | 'custom';
  width: number;
  height: number;
  startTime?: number; // seconds
  endTime?: number; // seconds
  autoplay: boolean;
  mute: boolean;
  controls: boolean;
  loop: boolean;
  relatedVideos: boolean; // rel=0 vs rel=1
  fullscreen: boolean;
  privacyEnhanced: boolean; // youtube-nocookie.com
}
