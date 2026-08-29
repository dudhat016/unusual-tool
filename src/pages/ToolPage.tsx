import React, { useEffect, useState } from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ContentRenderer } from '../components/common/ContentRenderer';
import { DynamicFaqAccordion } from '../components/common/DynamicFaqAccordion';
import { RelatedTools } from '../components/common/RelatedTools';
import { SeoStructuredData } from '../components/common/SeoStructuredData';
import { TableOfContents } from '../components/common/TableOfContents';
import { ToolHeaderSEO } from '../components/common/ToolHeaderSEO';
import { getBreadcrumbsForRoute, getSeoForRoute } from '../config/seoRegistry';
import { ToolContentService } from '../services/ToolContentService';
import { ToolDefinition } from '../types';
import { ToolDetailContent } from '../types/toolCms';

// Tool Views
import { AIToolGenericView } from '../components/tools/AIToolGenericView';
import { BorderToolView } from '../components/tools/BorderToolView';
import { ColorPickerToolView } from '../components/tools/ColorPickerToolView';
import { CompressToolView } from '../components/tools/CompressToolView';
import { ConvertToolView } from '../components/tools/ConvertToolView';
import { CropToolView } from '../components/tools/CropToolView';
import { EffectsToolView } from '../components/tools/EffectsToolView';
import { MetadataToolView } from '../components/tools/MetadataToolView';
import { OCRToolView } from '../components/tools/OCRToolView';
import { PassportPhotoToolView } from '../components/tools/PassportPhotoToolView';
import { PdfToolView } from '../components/tools/PdfToolView';
import { ResizeToolView } from '../components/tools/ResizeToolView';
import { SocialResizeToolView } from '../components/tools/SocialResizeToolView';
import { WatermarkToolView } from '../components/tools/WatermarkToolView';
import { OnlineNotepadView } from '../views/OnlineNotepadView';

// YouTube Suite Components
import { YouTubeChannelIdFinder } from '../components/youtube/YouTubeChannelIdFinder';
import { YouTubeEmbedGenerator } from '../components/youtube/YouTubeEmbedGenerator';
import { YouTubeTagExtractor } from '../components/youtube/YouTubeTagExtractor';
import { YouTubeThumbnailDownloader } from '../components/youtube/YouTubeThumbnailDownloader';
import { YouTubeThumbnailPreviewer } from '../components/youtube/YouTubeThumbnailPreviewer';
import { YouTubeTimestampGenerator } from '../components/youtube/YouTubeTimestampGenerator';
import { YouTubeToolsHub } from '../components/youtube/YouTubeToolsHub';

interface ToolPageProps {
  tool: ToolDefinition;
}

export const ToolPage: React.FC<ToolPageProps> = ({ tool }) => {
  const currentLanguage = 'en';
  const [cmsContent, setCmsContent] = useState<ToolDetailContent | null>(null);

  useEffect(() => {
    let isMounted = true;
    ToolContentService.getToolContent(tool.id, currentLanguage || 'en').then((data) => {
      if (isMounted) setCmsContent(data);
    });
    return () => {
      isMounted = false;
    };
  }, [tool.id, currentLanguage]);

  // Check for Online Notepad
  if (tool.id === 'free-online-notepad' || tool.slug === 'free-online-notepad' || tool.route === '/free-online-notepad' || tool.id === 'online-notepad') {
    return <OnlineNotepadView />;
  }

  // Check for YouTube Tools Hub
  if (tool.id === 'youtube-tools' || tool.slug === 'youtube-tools' || tool.route === '/youtube-tools') {
    return <YouTubeToolsHub />;
  }

  const renderToolComponent = () => {
    // PDF Suite Tools
    if (
      tool.category === 'pdf' ||
      tool.category?.startsWith('pdf-') ||
      tool.id.includes('pdf') ||
      tool.slug.includes('pdf') ||
      tool.route.includes('pdf') ||
      tool.id === 'images-to-pdf' ||
      tool.id === 'jpg-to-pdf' ||
      tool.id === 'png-to-pdf' ||
      tool.id === 'word-to-pdf' ||
      tool.id === 'txt-to-pdf' ||
      tool.id === 'merge-pdf' ||
      tool.id === 'split-pdf' ||
      tool.id === 'rotate-pdf' ||
      tool.id === 'protect-pdf' ||
      tool.id === 'unlock-pdf' ||
      tool.id === 'watermark-pdf' ||
      tool.id === 'sign-pdf' ||
      tool.id === 'ocr-pdf'
    ) {
      return <PdfToolView tool={tool} />;
    }

    // YouTube Tools
    if (tool.id === 'youtube-thumbnail-downloader' || tool.slug === 'youtube-thumbnail-downloader') {
      return <YouTubeThumbnailDownloader />;
    }
    if (tool.id === 'youtube-thumbnail-previewer' || tool.slug === 'youtube-thumbnail-previewer') {
      return <YouTubeThumbnailPreviewer />;
    }
    if (tool.id === 'youtube-timestamp-link-generator' || tool.slug === 'youtube-timestamp-link-generator') {
      return <YouTubeTimestampGenerator />;
    }
    if (tool.id === 'youtube-embed-code-generator' || tool.slug === 'youtube-embed-code-generator') {
      return <YouTubeEmbedGenerator />;
    }
    if (tool.id === 'youtube-channel-id-finder' || tool.slug === 'youtube-channel-id-finder') {
      return <YouTubeChannelIdFinder />;
    }
    if (tool.id === 'youtube-tag-extractor' || tool.slug === 'youtube-tag-extractor') {
      return <YouTubeTagExtractor />;
    }

    // Compression / Target Size Tools
    if (
      tool.category === 'compress' ||
      tool.id === 'compress-image' ||
      tool.slug === 'compress' ||
      tool.slug === 'compress-image' ||
      tool.slug.startsWith('compress-') ||
      tool.slug.includes('-to-')
    ) {
      return <CompressToolView tool={tool} />;
    }

    // Format Converter
    if (
      tool.category === 'convert' ||
      tool.id === 'convert-image' ||
      tool.slug === 'convert' ||
      tool.slug === 'convert-image' ||
      tool.slug.startsWith('convert-') ||
      tool.slug.startsWith('convert/') ||
      tool.slug.includes('-to-')
    ) {
      return <ConvertToolView tool={tool} />;
    }

    // Crop & Cut
    if (
      tool.category === 'crop' ||
      tool.id === 'crop-image' ||
      tool.slug === 'crop' ||
      tool.slug === 'crop-image'
    ) {
      return <CropToolView />;
    }

    // Passport & ID Photo Maker
    if (
      tool.category === 'passport' ||
      tool.id === 'passport-photo-maker' ||
      tool.slug === 'passport-photo' ||
      tool.slug === 'passport-photo-maker'
    ) {
      return <PassportPhotoToolView />;
    }

    // Social Media Resizer
    if (
      tool.category === 'social' ||
      tool.id === 'social-resizer' ||
      tool.slug === 'social-media' ||
      tool.slug === 'social-resizer'
    ) {
      return <SocialResizeToolView />;
    }

    // Border & Frame Maker
    if (
      tool.id === 'border-maker' ||
      tool.slug === 'border' ||
      tool.slug === 'border-maker'
    ) {
      return <BorderToolView />;
    }

    // Watermark & Logo Overlay
    if (
      tool.id === 'watermark-image' ||
      tool.slug === 'watermark' ||
      tool.slug === 'watermark-image'
    ) {
      return <WatermarkToolView />;
    }

    // Photo Effects & Filters
    if (
      (tool.category === 'effects' && tool.id !== 'color-picker' && tool.slug !== 'color-picker') ||
      tool.id === 'photo-effects' ||
      tool.slug === 'effects' ||
      tool.slug === 'photo-effects'
    ) {
      return <EffectsToolView />;
    }

    // Color Palette Picker
    if (
      tool.id === 'color-picker' ||
      tool.slug === 'color-picker'
    ) {
      return <ColorPickerToolView />;
    }

    // EXIF Metadata Viewer & Stripper
    if (
      tool.category === 'metadata' ||
      tool.id === 'metadata-tool' ||
      tool.slug === 'metadata' ||
      tool.slug === 'metadata-tool'
    ) {
      return <MetadataToolView />;
    }

    // OCR / Image to Text
    if (
      tool.category === 'ocr' ||
      tool.id === 'ocr-image-to-text' ||
      tool.id === 'ocr-tool' ||
      tool.slug === 'ocr' ||
      tool.slug === 'ocr-tool'
    ) {
      return <OCRToolView />;
    }

    // AI Tools
    if (
      tool.category === 'ai' ||
      tool.isAi ||
      tool.id === 'ai-background-remover' ||
      tool.slug === 'background-remover' ||
      tool.id === 'ai-image-enhancer' ||
      tool.slug === 'image-enhancer' ||
      tool.id === 'ai-image-upscaler' ||
      tool.slug === 'image-upscaler' ||
      tool.id === 'ai-object-remover' ||
      tool.slug === 'object-remover' ||
      tool.id === 'ai-unblur' ||
      tool.slug === 'unblur'
    ) {
      return <AIToolGenericView tool={tool} />;
    }

    // Default fallback
    return <ResizeToolView />;
  };

  const routePath = tool.route || `/${tool.slug}`;
  const seoData = getSeoForRoute(routePath);
  const breadcrumbs = getBreadcrumbsForRoute(routePath);

  const isCompressor = tool.category === 'compress' || tool.id.includes('compress');
  const isConverter = tool.category === 'convert' || tool.id.includes('convert');

  return (
    <div className="space-y-8 py-6 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Dynamic JSON-LD Structured Data Schema */}
      {cmsContent && <SeoStructuredData tool={tool} content={cmsContent} />}

      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={breadcrumbs} />

      {/* SEO Title & Description Header */}
      <ToolHeaderSEO tool={tool} content={cmsContent} />

      {/* LAYER 1: Main Interactive Tool Workspace */}
      <div>{renderToolComponent()}</div>

      {/* LAYER 2: SEO/AEO Rich Content Layer */}
      {cmsContent && cmsContent.status === 'published' && (
        <div className="pt-6 space-y-8">
          {/* Table of Contents (Top) */}
          {cmsContent.tocEnabled && (
            <div className="w-full">
              <TableOfContents html={cmsContent.contentHtml} />
            </div>
          )}

          {/* Long-Form Rich Content Body (Bottom) */}
          <div className="w-full">
            <ContentRenderer html={cmsContent.contentHtml} />
          </div>

          {/* Dynamic FAQ Accordion */}
          {cmsContent.faqs && cmsContent.faqs.length > 0 && (
            <DynamicFaqAccordion faqs={cmsContent.faqs} toolName={tool.name} />
          )}
        </div>
      )}

      {/* Related Tools for Discovery */}
      <RelatedTools currentToolId={tool.id} category={tool.category} />
    </div>
  );
};
