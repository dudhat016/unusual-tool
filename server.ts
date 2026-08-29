import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  generateSitemapXml,
  generateImageSitemapXml,
  generateRobotsTxt,
  getSeoForRoute,
  generateJsonLd,
  SITE_DOMAIN,
  SITE_NAME
} from './src/config/seoRegistry';
import { getCategoryBySlug } from './src/config/categoryData';

const app = express();
const PORT = 3000;

app.use(express.json());

// 0. Dynamic SEO Sitemaps and Robots.txt
app.get('/sitemap.xml', (req, res) => {
  const xml = generateSitemapXml(SITE_DOMAIN);
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(xml);
});

app.get('/sitemap-images.xml', (req, res) => {
  const xml = generateImageSitemapXml(SITE_DOMAIN);
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(xml);
});

app.get('/robots.txt', (req, res) => {
  const robots = generateRobotsTxt(SITE_DOMAIN);
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(robots);
});

// In-memory rate limiting map for YouTube API endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(ip: string, maxRequests = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count++;
  return true;
}

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. YouTube Thumbnail Proxy (Bypasses CORS & forces attachment download)
app.get('/api/youtube/thumbnail-proxy', async (req, res) => {
  try {
    const rawUrl = req.query.url as string;
    const filename = (req.query.filename as string) || 'youtube-thumbnail.jpg';

    if (!rawUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    // Security check: Only proxy valid YouTube image hostnames
    const allowedHosts = ['img.youtube.com', 'i.ytimg.com', 'ytimg.googleusercontent.com'];
    if (!allowedHosts.includes(parsedUrl.hostname)) {
      return res.status(403).json({ error: 'Forbidden image host' });
    }

    const imageResponse = await fetch(rawUrl);
    if (!imageResponse.ok) {
      return res.status(imageResponse.status).json({ error: 'Failed to fetch thumbnail from YouTube' });
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const buffer = await imageResponse.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/[^a-zA-Z0-9_.-]/g, '_')}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(Buffer.from(buffer));
  } catch (err: any) {
    console.error('Thumbnail proxy error:', err);
    return res.status(500).json({ error: 'Internal server error while proxying thumbnail' });
  }
});

// 3. YouTube Channel ID & Metadata Resolution
app.post('/api/youtube/channel-info', async (req, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip, 40, 60000)) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please slow down.' });
    }

    const { input } = req.body;
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a YouTube channel URL or handle.' });
    }

    const trimmed = input.trim();
    const apiKey = process.env.YOUTUBE_API_KEY;

    // Pattern 1: Direct Channel ID (UC...)
    const directChannelMatch = trimmed.match(/(UC[a-zA-Z0-9_-]{22})/);
    if (directChannelMatch) {
      const channelId = directChannelMatch[1];
      
      // If API key is available, enrich with title and statistics
      if (apiKey) {
        try {
          const apiRes = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?id=${channelId}&part=snippet,contentDetails,statistics&key=${apiKey}`
          );
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData.items && apiData.items.length > 0) {
              const item = apiData.items[0];
              return res.json({
                success: true,
                channel: {
                  channelId: item.id,
                  title: item.snippet?.title || 'YouTube Channel',
                  handle: item.snippet?.customUrl,
                  customUrl: item.snippet?.customUrl,
                  description: item.snippet?.description,
                  avatarUrl: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url,
                  subscriberCount: item.statistics?.subscriberCount,
                  videoCount: item.statistics?.videoCount,
                  source: 'api',
                  url: `https://www.youtube.com/channel/${item.id}`,
                },
              });
            }
          }
        } catch (e) {
          console.warn('YouTube API channel fetch failed, falling back to direct ID:', e);
        }
      }

      // Return direct verified channel ID
      return res.json({
        success: true,
        channel: {
          channelId,
          title: `Channel (${channelId})`,
          url: `https://www.youtube.com/channel/${channelId}`,
          source: 'direct_url',
        },
      });
    }

    // Extract handle / username
    let handle = '';
    const handleMatch = trimmed.match(/@([a-zA-Z0-9_.-]+)/);
    if (handleMatch) {
      handle = `@${handleMatch[1]}`;
    } else if (trimmed.includes('/c/') || trimmed.includes('/user/')) {
      const parts = trimmed.split('/');
      handle = parts[parts.length - 1]?.split('?')[0] || '';
    } else if (!trimmed.startsWith('http')) {
      handle = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
    }

    // Pattern 2: Resolve handle via YouTube Data API v3 if key configured
    if (apiKey && handle) {
      try {
        const cleanHandle = handle.replace(/^@/, '');
        const apiRes = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?forHandle=${encodeURIComponent(
            cleanHandle
          )}&part=snippet,contentDetails,statistics&key=${apiKey}`
        );

        if (apiRes.status === 403) {
          console.warn('YouTube API quota exceeded or forbidden');
        } else if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.items && apiData.items.length > 0) {
            const item = apiData.items[0];
            return res.json({
              success: true,
              channel: {
                channelId: item.id,
                title: item.snippet?.title || handle,
                handle: `@${cleanHandle}`,
                customUrl: item.snippet?.customUrl,
                description: item.snippet?.description,
                avatarUrl: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url,
                subscriberCount: item.statistics?.subscriberCount,
                videoCount: item.statistics?.videoCount,
                source: 'api',
                url: `https://www.youtube.com/channel/${item.id}`,
              },
            });
          }
        }
      } catch (err) {
        console.warn('Error querying YouTube Data API for handle:', err);
      }
    }

    // Pattern 3: Resolve via Public Structured Page Metadata (no scraping, purely meta tags)
    if (handle) {
      try {
        const targetUrl = handle.startsWith('@')
          ? `https://www.youtube.com/${handle}`
          : `https://www.youtube.com/@${handle}`;

        const pageRes = await fetch(targetUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        });

        if (pageRes.ok) {
          const html = await pageRes.text();

          // Extract standard itemprop or canonical channel ID
          const channelIdMatch =
            html.match(/<meta\s+itemprop="channelId"\s+content="(UC[a-zA-Z0-9_-]{22})"/i) ||
            html.match(/href="https:\/\/www\.youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})"/i) ||
            html.match(/"externalId":"(UC[a-zA-Z0-9_-]{22})"/i) ||
            html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/i);

          const titleMatch =
            html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
            html.match(/<title>([^<]+)<\/title>/i);

          const avatarMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);

          if (channelIdMatch) {
            const channelId = channelIdMatch[1];
            let title = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : handle;
            const avatarUrl = avatarMatch ? avatarMatch[1] : undefined;

            return res.json({
              success: true,
              channel: {
                channelId,
                title,
                handle,
                url: `https://www.youtube.com/channel/${channelId}`,
                avatarUrl,
                source: 'page_metadata',
              },
            });
          }
        }
      } catch (err) {
        console.warn('Page metadata channel resolution failed:', err);
      }
    }

    return res.status(404).json({
      success: false,
      message:
        'Could not resolve Channel ID for this handle. Please ensure the handle/URL is valid, or configure YOUTUBE_API_KEY on the server.',
    });
  } catch (err: any) {
    console.error('Channel resolution endpoint error:', err);
    return res.status(500).json({ success: false, message: 'Server error while resolving channel.' });
  }
});

// 4. YouTube Video Tags & Metadata Extraction
app.get('/api/youtube/video-tags', async (req, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip, 40, 60000)) {
      return res.status(429).json({ success: false, message: 'Rate limit exceeded. Please wait a minute.' });
    }

    const videoId = req.query.videoId as string;
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing YouTube video ID.' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    // Step 1: Query YouTube Data API v3 if API key configured
    if (apiKey) {
      try {
        const apiRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics,contentDetails&key=${apiKey}`
        );

        if (apiRes.status === 403) {
          console.warn('YouTube API quota exceeded or forbidden');
        } else if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.items && apiData.items.length > 0) {
            const item = apiData.items[0];
            const tags: string[] = item.snippet?.tags || [];

            return res.json({
              success: true,
              result: {
                videoId: item.id,
                title: item.snippet?.title || 'YouTube Video',
                channelTitle: item.snippet?.channelTitle || 'Unknown Channel',
                channelId: item.snippet?.channelId,
                tags,
                description: item.snippet?.description,
                viewCount: item.statistics?.viewCount,
                publishedAt: item.snippet?.publishedAt,
                duration: item.contentDetails?.duration,
                hasApiData: true,
                isFromOfficialApi: true,
                statusMessage:
                  tags.length > 0
                    ? `Successfully retrieved ${tags.length} official tags via YouTube Data API.`
                    : 'This video does not have any public tags assigned by the creator.',
              },
            });
          } else {
            return res.status(404).json({
              success: false,
              message: 'Video not found or is private/deleted.',
            });
          }
        }
      } catch (err) {
        console.warn('YouTube API call failed:', err);
      }
    }

    // Step 2: Fallback to structured HTML page metadata
    try {
      const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (pageRes.ok) {
        const html = await pageRes.text();

        const titleMatch = html.match(/<meta\s+name="title"\s+content="([^"]+)"/i) || html.match(/<title>([^<]+)<\/title>/i);
        const keywordsMatch = html.match(/<meta\s+name="keywords"\s+content="([^"]+)"/i);
        const channelMatch = html.match(/<link\s+itemprop="name"\s+content="([^"]+)"/i);

        const title = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : 'YouTube Video';
        const channelTitle = channelMatch ? channelMatch[1] : 'YouTube Creator';

        let tags: string[] = [];
        if (keywordsMatch && keywordsMatch[1]) {
          tags = keywordsMatch[1]
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0 && t.toLowerCase() !== 'video' && t.toLowerCase() !== 'sharing');
        }

        return res.json({
          success: true,
          result: {
            videoId,
            title,
            channelTitle,
            tags,
            hasApiData: false,
            isFromOfficialApi: false,
            statusMessage:
              tags.length > 0
                ? `Retrieved ${tags.length} tags from public page metadata.`
                : 'Tags are not available for this video through public page metadata. To enable full tag extraction, configure YOUTUBE_API_KEY in server environment settings.',
          },
        });
      }
    } catch (err) {
      console.warn('Failed to fetch public video page metadata:', err);
    }

    return res.status(200).json({
      success: true,
      result: {
        videoId,
        title: `YouTube Video (${videoId})`,
        channelTitle: 'YouTube',
        tags: [],
        hasApiData: false,
        isFromOfficialApi: false,
        statusMessage:
          'Tags are not available for this video through current method. For full tag extraction, configure YOUTUBE_API_KEY in environment variables.',
      },
    });
  } catch (err: any) {
    console.error('Video tags error:', err);
    return res.status(500).json({ success: false, message: 'Server error while retrieving video tags.' });
  }
});

// Helper function to inject dynamic SEO metadata and crawlable fallback HTML
function injectSeoIntoHtml(html: string, reqPath: string): string {
  const clean = reqPath.split('?')[0].replace(/\/$/, '') || '/';
  let title = `${SITE_NAME} – Free In-Browser Image Utilities & Creator Tools`;
  let description = 'All-in-one free online image utility suite: resize, compress, convert, passport photos, watermarks, metadata strippers, YouTube thumbnails, and bulk pipelines with 100% in-browser privacy.';
  let canonical = `${SITE_DOMAIN}${clean === '/' ? '' : clean}`;
  let h1 = 'AetherPix Studio';
  let quickAnswer = 'AetherPix Studio provides fast, secure in-browser image processing utilities and YouTube creator tools with zero server file uploads.';
  let howTo: { step: number; title: string; description: string }[] = [];
  let faqs: { question: string; answer: string }[] = [];

  const toolSeo = getSeoForRoute(clean);
  const categorySeo = getCategoryBySlug(clean);

  if (toolSeo) {
    title = toolSeo.title;
    description = toolSeo.metaDescription;
    canonical = `${SITE_DOMAIN}${toolSeo.canonicalUrl}`;
    h1 = toolSeo.h1;
    quickAnswer = toolSeo.quickAnswer;
    howTo = toolSeo.howItWorks || [];
    faqs = toolSeo.faq || [];
  } else if (categorySeo) {
    title = categorySeo.title;
    description = categorySeo.metaDescription;
    canonical = `${SITE_DOMAIN}/${categorySeo.slug}`;
    h1 = categorySeo.h1;
    quickAnswer = categorySeo.quickAnswer;
    faqs = categorySeo.faq || [];
  } else if (clean === '/about') {
    title = `About Us – ${SITE_NAME}`;
    description = 'Learn about our 100% in-browser client-side image processing architecture.';
    h1 = 'About AetherPix Studio';
  } else if (clean === '/privacy') {
    title = `Privacy Policy – ${SITE_NAME}`;
    description = 'Our commitment to 100% client-side privacy with zero server storage.';
    h1 = 'Privacy Policy';
  } else if (clean === '/security') {
    title = `Security Architecture – ${SITE_NAME}`;
    description = 'Deep dive into our zero-upload WebAssembly and Canvas client architecture.';
    h1 = 'Security & Client-Side Architecture';
  }

  const schemas = generateJsonLd(clean, SITE_DOMAIN);

  let modifiedHtml = html;

  // Replace Title
  modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

  // Replace Description
  modifiedHtml = modifiedHtml.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${description.replace(/"/g, '&quot;')}" />`
  );

  // Replace Canonical
  modifiedHtml = modifiedHtml.replace(
    /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
    `<link rel="canonical" href="${canonical}" />`
  );

  // Replace OG tags
  modifiedHtml = modifiedHtml.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />`
  );
  modifiedHtml = modifiedHtml.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${canonical}" />`
  );

  // Inject JSON-LD
  const jsonLdTag = `<script id="aetherpix-jsonld" type="application/ld+json">${JSON.stringify(schemas)}</script>`;
  modifiedHtml = modifiedHtml.replace('</head>', `  ${jsonLdTag}\n</head>`);

  // Inject Crawlable Semantic Content Fallback for Non-JS Crawlers
  const crawlableFallback = `
    <noscript id="seo-crawlable-fallback">
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: system-ui, sans-serif;">
        <h1>${h1}</h1>
        <p><strong>Quick Summary:</strong> ${quickAnswer}</p>
        ${
          howTo.length > 0
            ? `<h2>How It Works</h2><ol>${howTo.map((s) => `<li><strong>${s.title}:</strong> ${s.description}</li>`).join('')}</ol>`
            : ''
        }
        ${
          faqs.length > 0
            ? `<h2>Frequently Asked Questions</h2><ul>${faqs.map((f) => `<li><strong>${f.question}</strong><p>${f.answer}</p></li>`).join('')}</ul>`
            : ''
        }
        <hr />
        <p>Explore <a href="/image-compressor-tools">Image Compressor Tools</a>, <a href="/image-converter-tools">Image Converter Tools</a>, <a href="/bulk-image-tools">Bulk Image Studio</a>, and <a href="/youtube-tools">YouTube Creator Suite</a>.</p>
      </div>
    </noscript>
  `;
  modifiedHtml = modifiedHtml.replace('<div id="root"></div>', `<div id="root"></div>\n${crawlableFallback}`);

  return modifiedHtml;
}

// Vite middleware setup (development vs production)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    
    // In dev, intercept HTML navigation requests to inject SEO tags
    app.use(async (req, res, next) => {
      const url = req.originalUrl || req.url;
      if (
        req.method === 'GET' &&
        !url.startsWith('/api/') &&
        !url.includes('.') &&
        req.headers.accept?.includes('text/html')
      ) {
        try {
          const indexPath = path.resolve(process.cwd(), 'index.html');
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          const htmlWithSeo = injectSeoIntoHtml(template, url);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(htmlWithSeo);
          return;
        } catch (e) {
          vite.ssrFixStacktrace(e as Error);
          next(e);
          return;
        }
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      try {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          const rawHtml = fs.readFileSync(indexPath, 'utf-8');
          const htmlWithSeo = injectSeoIntoHtml(rawHtml, req.path);
          res.status(200).set({ 'Content-Type': 'text/html' }).send(htmlWithSeo);
        } else {
          res.sendFile(indexPath);
        }
      } catch (err) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AetherPix Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
