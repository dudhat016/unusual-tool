import {
  YouTubeThumbnailInfo,
  YouTubeChannelResult,
  YouTubeTagResult,
} from '../types/youtube';
import { getThumbnailVariants } from '../utils/youtubeUrlParser';

/**
 * Client-Side YouTube Service
 * Handles thumbnail real availability probing, real downloads, and API communication.
 */
export class YouTubeService {
  /**
   * Probes all 5 thumbnail variants for a given video ID to verify which ones actually exist.
   * Note: YouTube serves a 120x90 placeholder image when maxresdefault or sddefault is missing.
   */
  static async checkAllThumbnailsAvailability(videoId: string): Promise<YouTubeThumbnailInfo[]> {
    const variants = getThumbnailVariants(videoId);

    const checkPromises = variants.map((variant) => {
      return new Promise<YouTubeThumbnailInfo>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          // YouTube returns a 120x90 gray error placeholder when maxresdefault/sddefault does not exist
          if (variant.resolutionKey === 'maxresdefault' && img.naturalWidth <= 120 && img.naturalHeight <= 90) {
            resolve({ ...variant, isAvailable: false });
          } else if (variant.resolutionKey === 'sddefault' && img.naturalWidth <= 120 && img.naturalHeight <= 90) {
            resolve({ ...variant, isAvailable: false });
          } else if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            resolve({
              ...variant,
              isAvailable: true,
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
          } else {
            resolve({ ...variant, isAvailable: false });
          }
        };

        img.onerror = () => {
          resolve({ ...variant, isAvailable: false });
        };

        img.src = variant.url;
      });
    });

    return Promise.all(checkPromises);
  }

  /**
   * Real Thumbnail Downloader: Fetches the image as a Blob and initiates native browser file download.
   * Uses server proxy if CORS or direct fetch is blocked.
   */
  static async downloadThumbnail(
    imageUrl: string,
    videoId: string,
    resolutionKey: string
  ): Promise<void> {
    const filename = `youtube-thumbnail-${videoId}-${resolutionKey}.jpg`;

    try {
      // First attempt direct fetch
      const response = await fetch(imageUrl, { mode: 'cors' });
      if (response.ok) {
        const blob = await response.blob();
        this.triggerBlobDownload(blob, filename);
        return;
      }
    } catch {
      // Direct CORS restricted, try server proxy
    }

    try {
      const proxyUrl = `/api/youtube/thumbnail-proxy?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(
        filename
      )}`;
      const proxyRes = await fetch(proxyUrl);
      if (proxyRes.ok) {
        const blob = await proxyRes.blob();
        this.triggerBlobDownload(blob, filename);
        return;
      }
    } catch {
      // Proxy failed or unavailable
    }

    // Canvas fallback
    try {
      const canvasBlob = await this.loadImageToBlobViaCanvas(imageUrl);
      this.triggerBlobDownload(canvasBlob, filename);
      return;
    } catch (e: any) {
      // If canvas is tainted, direct anchor download
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = filename;
      a.target = '_blank';
      a.rel = 'noreferrer noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  private static loadImageToBlobViaCanvas(url: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context unavailable'));
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob from canvas'));
        }, 'image/jpeg', 0.95);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  private static triggerBlobDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Fetch Channel Info via Server API
   */
  static async resolveChannelInfo(channelInput: string): Promise<YouTubeChannelResult> {
    const response = await fetch('/api/youtube/channel-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: channelInput }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to resolve YouTube channel information.');
    }

    return data.channel;
  }

  /**
   * Fetch Video Tags and Metadata via Server API
   */
  static async extractVideoTags(videoId: string): Promise<YouTubeTagResult> {
    const response = await fetch(`/api/youtube/video-tags?videoId=${encodeURIComponent(videoId)}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to retrieve video tags.');
    }

    return data.result;
  }

  /**
   * Copy string to clipboard with navigator.clipboard and textarea fallback
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fallback
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch {
      return false;
    }
  }

  /**
   * Download tags as TXT file
   */
  static downloadTagsAsTxt(tags: string[], videoTitle: string = 'video'): void {
    const content = tags.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const cleanTitle = videoTitle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    this.triggerBlobDownload(blob, `youtube-tags-${cleanTitle}.txt`);
  }

  /**
   * Download tags as CSV file
   */
  static downloadTagsAsCsv(tags: string[], videoTitle: string = 'video'): void {
    const rows = ['Index,Tag,Length'];
    tags.forEach((tag, idx) => {
      // Escape CSV quotes
      const escaped = `"${tag.replace(/"/g, '""')}"`;
      rows.push(`${idx + 1},${escaped},${tag.length}`);
    });
    const content = rows.join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const cleanTitle = videoTitle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    this.triggerBlobDownload(blob, `youtube-tags-${cleanTitle}.csv`);
  }
}
