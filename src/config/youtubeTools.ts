import { ToolDefinition } from '../types';

export const YOUTUBE_TOOLS: ToolDefinition[] = [
  {
    id: 'youtube-tools',
    slug: 'youtube-tools',
    name: 'YouTube Tools Hub',
    shortDescription: 'Free YouTube tools for thumbnails, timestamps, embeds, channel IDs, and video tags.',
    fullDescription: 'Comprehensive all-in-one YouTube creator suite. Download high-definition thumbnails, generate timestamp share links, build responsive embed players, find canonical Channel IDs from @handles, and extract SEO tags.',
    category: 'youtube',
    processingType: 'browser',
    icon: 'Video',
    route: '/youtube-tools',
    supportsBatch: false,
    requiresAuth: false,
    isPopular: true,
    features: [
      'YouTube Thumbnail Downloader (HD MaxRes 1280x720)',
      'Timestamp Link & youtu.be Short URL Generator',
      'Privacy-Enhanced Responsive Embed Iframe Generator',
      'Multi-Tier Thumbnail Resolution Previewer',
      'Channel ID Finder from @handles & custom URLs',
      'Video SEO Tag & Keyword Extractor with CSV/TXT export'
    ],
    howToSteps: [
      { step: 1, title: 'Choose a Tool', description: 'Select any of our 6 free YouTube utilities from the hub.' },
      { step: 2, title: 'Paste YouTube URL', description: 'Enter any video, shorts, live stream, or channel link.' },
      { step: 3, title: 'Get Instant Results', description: 'Download images, copy formatted links, or export metadata.' }
    ],
    faqs: [
      { question: 'Are these tools free?', answer: 'Yes, 100% free with no account or sign-in required.' },
      { question: 'Does it support YouTube Shorts and Live Streams?', answer: 'Yes! All URL formats including /shorts/, /live/, and youtu.be short links are supported.' }
    ],
    seo: {
      title: 'YouTube Tools - Free Thumbnail Downloader, Timestamp & Embed Generator',
      description: 'Free online YouTube tools for creators. Download thumbnails in HD, generate timestamp links, build responsive embeds, find channel IDs, and extract video tags.',
      keywords: ['youtube tools', 'youtube thumbnail downloader', 'youtube timestamp generator', 'youtube embed generator', 'youtube channel id finder', 'youtube tag extractor'],
      canonicalSlug: 'youtube-tools'
    }
  },
  {
    id: 'youtube-thumbnail-downloader',
    slug: 'youtube-thumbnail-downloader',
    name: 'YouTube Thumbnail Downloader',
    shortDescription: 'Download high-definition (1280x720) YouTube thumbnails in full original JPEG format.',
    fullDescription: 'Official YouTube thumbnail grabber. Extracts uncompressed MaxRes (1280×720), Standard (640×480), High Quality (480×360), Medium (320×180), and Default thumbnails instantly with guaranteed direct downloads.',
    category: 'youtube',
    processingType: 'browser',
    icon: 'Download',
    route: '/youtube-thumbnail-downloader',
    supportsBatch: false,
    requiresAuth: false,
    isPopular: true,
    features: [
      'Full 1280x720 HD MaxRes original JPEG extraction',
      'Automatic fallback to highest available quality tier',
      'Instant availability checker across all 5 thumbnail sizes',
      'Supports YouTube Shorts, Live streams, and youtu.be links',
      'One-click direct browser download without CORS blockage'
    ],
    howToSteps: [
      { step: 1, title: 'Paste Video URL', description: 'Copy and paste any YouTube video or shorts URL.' },
      { step: 2, title: 'Inspect Available Sizes', description: 'The tool checks which resolutions were uploaded by the creator.' },
      { step: 3, title: 'Download Thumbnail', description: 'Click Download JPG to save the image to your computer or phone.' }
    ],
    faqs: [
      { question: 'Why is 1280x720 unavailable for some videos?', answer: 'YouTube only provides 1280x720 HD thumbnails if the video creator uploaded a custom high-definition image. When unavailable, our tool automatically selects the next highest resolution (such as HQ 480x360).' },
      { question: 'Can I download thumbnails from YouTube Shorts?', answer: 'Yes! Simply paste any /shorts/ URL to download its thumbnail.' }
    ],
    seo: {
      title: 'YouTube Thumbnail Downloader - Download 4K & HD 1080p/720p Thumbnails',
      description: 'Download YouTube thumbnails in full HD 1280x720 quality. Free online tool for high-resolution MaxRes YouTube thumbnail image downloads.',
      keywords: ['youtube thumbnail downloader', 'download youtube thumbnail', 'get youtube thumbnail', 'youtube thumbnail hd 1080p', 'save youtube thumbnail'],
      canonicalSlug: 'youtube-thumbnail-downloader'
    }
  },
  {
    id: 'youtube-thumbnail-previewer',
    slug: 'youtube-thumbnail-previewer',
    name: 'YouTube Thumbnail Previewer',
    shortDescription: 'Inspect and compare all 5 YouTube CDN resolution tiers side-by-side.',
    fullDescription: 'Side-by-side resolution comparator and thumbnail inspector. View maxresdefault, sddefault, hqdefault, mqdefault, and default tiers to check image sharpness, cropping, and aspect ratios.',
    category: 'youtube',
    processingType: 'browser',
    icon: 'Eye',
    route: '/youtube-thumbnail-previewer',
    supportsBatch: false,
    requiresAuth: false,
    features: [
      'Side-by-side comparison of all 5 YouTube resolution variants',
      'Aspect ratio analysis (16:9 widescreen vs 4:3 cropped)',
      'Fullscreen lightbox inspection modal',
      'Direct CDN URL copy and raw image viewer'
    ],
    howToSteps: [
      { step: 1, title: 'Enter YouTube Video URL', description: 'Paste the link to the YouTube video you want to inspect.' },
      { step: 2, title: 'Compare Resolution Tiers', description: 'Review the dimensions and sharpness of each variant.' },
      { step: 3, title: 'Inspect Fullscreen', description: 'Click any thumbnail to inspect pixel details in high resolution.' }
    ],
    faqs: [
      { question: 'Why does YouTube create 5 different thumbnail sizes?', answer: 'YouTube serves different sizes depending on the device: small default for search lists, medium for related sidebars, and maxres for full desktop player embeds.' }
    ],
    seo: {
      title: 'YouTube Thumbnail Previewer - Inspect All Thumbnail Resolutions Online',
      description: 'Preview and compare all 5 YouTube CDN thumbnail variants. Check dimensions, aspect ratios, and image quality for any video.',
      keywords: ['youtube thumbnail previewer', 'inspect youtube thumbnail', 'youtube thumbnail viewer', 'youtube maxresdefault preview'],
      canonicalSlug: 'youtube-thumbnail-previewer'
    }
  },
  {
    id: 'youtube-timestamp-link-generator',
    slug: 'youtube-timestamp-link-generator',
    name: 'YouTube Timestamp Link Generator',
    shortDescription: 'Create shareable links and short youtu.be URLs starting at an exact second.',
    fullDescription: 'Timestamped YouTube link creator. Jump directly to any moment in a video. Supports HH:MM:SS format, individual hour/min/sec dials, end timestamp parameters, and live in-app player verification.',
    category: 'youtube',
    processingType: 'browser',
    icon: 'Clock',
    route: '/youtube-timestamp-link-generator',
    supportsBatch: false,
    requiresAuth: false,
    isPopular: true,
    features: [
      'Bi-directional time sync (HH:MM:SS, MM:SS, pure seconds)',
      'Generates standard watch links (youtube.com) and short links (youtu.be)',
      'Preserves existing playlist (&list=) and share parameters',
      'Optional end timestamp for embed clips',
      'Live in-app player verification to confirm exact frame'
    ],
    howToSteps: [
      { step: 1, title: 'Paste Video URL', description: 'Enter the YouTube video link you want to share.' },
      { step: 2, title: 'Set Start Time', description: 'Enter the timestamp (e.g. 01:23:45) or use the hour/minute/second counters.' },
      { step: 3, title: 'Copy Share Link', description: 'Copy the generated youtu.be or youtube.com link with one click.' }
    ],
    faqs: [
      { question: 'How do timestamp links work on mobile devices?', answer: 'Both youtu.be?t=... and youtube.com/watch?v=...&t=... open the official YouTube app on iOS and Android and start playback at your chosen second.' }
    ],
    seo: {
      title: 'YouTube Timestamp Link Generator - Share YouTube Video at Exact Time',
      description: 'Create YouTube links that start at a specific timestamp. Free tool to generate shareable youtu.be and youtube.com timestamp URLs.',
      keywords: ['youtube timestamp link generator', 'youtube link at specific time', 'youtube start time link', 'share youtube at timestamp'],
      canonicalSlug: 'youtube-timestamp-link-generator'
    }
  },
  {
    id: 'youtube-embed-code-generator',
    slug: 'youtube-embed-code-generator',
    name: 'YouTube Embed Code Generator',
    shortDescription: 'Generate responsive, privacy-enhanced HTML iframe embed codes with custom start times.',
    fullDescription: 'Custom iframe embed builder for web developers and creators. Configures responsive aspect ratios (16:9, 4:3, 1:1, 9:16 Shorts), autoplay, mute, controls, loop, and GDPR-friendly youtube-nocookie.com mode.',
    category: 'youtube',
    processingType: 'browser',
    icon: 'Code',
    route: '/youtube-embed-code-generator',
    supportsBatch: false,
    requiresAuth: false,
    features: [
      '100% responsive fluid wrapper with modern aspect-ratio CSS',
      'Privacy-Enhanced Mode (youtube-nocookie.com)',
      'Custom Start Time & End Time configuration',
      'Autoplay, Mute, Controls, Loop, and Fullscreen toggles',
      'Live interactive iframe player preview with real-time reload'
    ],
    howToSteps: [
      { step: 1, title: 'Paste Video URL', description: 'Enter the video you want to embed on your website.' },
      { step: 2, title: 'Configure Options', description: 'Select responsive or fixed size, timing, and privacy settings.' },
      { step: 3, title: 'Copy HTML Code', description: 'Copy the generated iframe code and paste into your WordPress, React, or HTML site.' }
    ],
    faqs: [
      { question: 'Why should I use Privacy-Enhanced Mode?', answer: 'youtube-nocookie.com prevents YouTube from storing tracking cookies on your site visitors before they play the video, helping you comply with GDPR and privacy regulations.' }
    ],
    seo: {
      title: 'YouTube Embed Code Generator - Responsive & Privacy-Enhanced Iframes',
      description: 'Generate clean, responsive YouTube iframe embed codes. Supports custom start time, autoplay, loop, and youtube-nocookie privacy mode.',
      keywords: ['youtube embed code generator', 'youtube iframe generator', 'responsive youtube embed', 'youtube nocookie embed'],
      canonicalSlug: 'youtube-embed-code-generator'
    }
  },
  {
    id: 'youtube-channel-id-finder',
    slug: 'youtube-channel-id-finder',
    name: 'YouTube Channel ID Finder',
    shortDescription: 'Convert modern @handles, custom URLs, and channel links into canonical Channel IDs.',
    fullDescription: 'Canonical 24-character YouTube Channel ID resolver. Instantly lookup channel IDs (UC...) for any @handle, username, or custom vanity URL for use in APIs, Discord bots, and RSS feeds.',
    category: 'youtube',
    processingType: 'server',
    icon: 'AtSign',
    route: '/youtube-channel-id-finder',
    supportsBatch: false,
    requiresAuth: false,
    features: [
      'Instant resolution of modern @handles (e.g. @veritasium, @mkbhd)',
      'Extracts canonical 24-character UC... Channel ID',
      'Displays subscriber counts, video totals, and avatar image',
      'Generates direct canonical channel URLs'
    ],
    howToSteps: [
      { step: 1, title: 'Enter Handle or URL', description: 'Type or paste any @handle (e.g. @mkbhd) or channel link.' },
      { step: 2, title: 'Resolve Channel', description: 'Click Find Channel ID to query canonical metadata.' },
      { step: 3, title: 'Copy Channel ID', description: 'Copy the 24-character UC... ID for use in your API or application.' }
    ],
    faqs: [
      { question: 'What is a YouTube Channel ID?', answer: 'A unique 24-character string starting with UC that permanently identifies a YouTube channel, required by the YouTube Data API and RSS feeds.' }
    ],
    seo: {
      title: 'YouTube Channel ID Finder - Find Channel ID from @Handle or URL',
      description: 'Find any YouTube Channel ID from a handle, username, or channel URL. Get the canonical 24-character UC... ID instantly.',
      keywords: ['youtube channel id finder', 'find youtube channel id', 'get youtube channel id from handle', 'youtube handle to channel id'],
      canonicalSlug: 'youtube-channel-id-finder'
    }
  },
  {
    id: 'youtube-tag-extractor',
    slug: 'youtube-tag-extractor',
    name: 'YouTube Tag Extractor',
    shortDescription: 'Extract video SEO tags, hidden keywords, and competitor metadata with one-click TXT & CSV exports.',
    fullDescription: 'Video SEO tag analyzer and extractor. Discover ranking keywords used by top creators, inspect character counts, filter tags, and export cleanly to CSV or TXT format.',
    category: 'youtube',
    processingType: 'server',
    icon: 'Hash',
    route: '/youtube-tag-extractor',
    supportsBatch: false,
    requiresAuth: false,
    isPopular: true,
    features: [
      'Full video SEO tag extraction from official API & public metadata',
      'Interactive tag multi-selector & live keyword search filter',
      'Comprehensive tag statistics (length, total chars, duplicate check)',
      'Export tags as TXT file or formatted CSV spreadsheet',
      'Copy comma-separated tags directly into YouTube Studio'
    ],
    howToSteps: [
      { step: 1, title: 'Paste Video URL', description: 'Enter the URL of any YouTube video you want to analyze.' },
      { step: 2, title: 'Review Extracted Tags', description: 'View all ranking keywords, character counts, and keyword density.' },
      { step: 3, title: 'Copy or Export', description: 'Copy tags directly into YouTube Studio or download as CSV/TXT.' }
    ],
    faqs: [
      { question: 'Do video tags still matter for YouTube SEO?', answer: 'Yes! Tags help YouTube understand your video context, correct common search misspellings, and suggest your video in related search results.' }
    ],
    seo: {
      title: 'YouTube Tag Extractor - Extract SEO Tags & Keywords from Any Video',
      description: 'Extract and analyze YouTube video tags online. Discover competitor keywords and export tags to CSV and TXT for YouTube Studio.',
      keywords: ['youtube tag extractor', 'extract youtube tags', 'youtube keyword extractor', 'view youtube video tags', 'youtube seo tag generator'],
      canonicalSlug: 'youtube-tag-extractor'
    }
  }
];
