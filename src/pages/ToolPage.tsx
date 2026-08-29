import React from 'react';
import { ToolDefinition } from '../types';
import { ToolHeaderSEO } from '../components/common/ToolHeaderSEO';
import { ToolFAQSection } from '../components/common/ToolFAQSection';
import { RelatedTools } from '../components/common/RelatedTools';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ToolSpecsTable } from '../components/common/ToolSpecsTable';
import { TopicalClusterLinks } from '../components/common/TopicalClusterLinks';
import { getSeoForRoute, getBreadcrumbsForRoute } from '../config/seoRegistry';

// Tool Views
import { ResizeToolView } from '../components/tools/ResizeToolView';
import { CompressToolView } from '../components/tools/CompressToolView';
import { CropToolView } from '../components/tools/CropToolView';
import { ConvertToolView } from '../components/tools/ConvertToolView';
import { PassportPhotoToolView } from '../components/tools/PassportPhotoToolView';
import { EffectsToolView } from '../components/tools/EffectsToolView';
import { BorderToolView } from '../components/tools/BorderToolView';
import { SocialResizeToolView } from '../components/tools/SocialResizeToolView';
import { MetadataToolView } from '../components/tools/MetadataToolView';
import { ColorPickerToolView } from '../components/tools/ColorPickerToolView';
import { WatermarkToolView } from '../components/tools/WatermarkToolView';
import { OCRToolView } from '../components/tools/OCRToolView';
import { AIToolGenericView } from '../components/tools/AIToolGenericView';
import { PdfToolView } from '../components/tools/PdfToolView';
import { OnlineNotepadView } from '../views/OnlineNotepadView';

// YouTube Suite Components
import { YouTubeToolsHub } from '../components/youtube/YouTubeToolsHub';
import { YouTubeThumbnailDownloader } from '../components/youtube/YouTubeThumbnailDownloader';
import { YouTubeThumbnailPreviewer } from '../components/youtube/YouTubeThumbnailPreviewer';
import { YouTubeTimestampGenerator } from '../components/youtube/YouTubeTimestampGenerator';
import { YouTubeEmbedGenerator } from '../components/youtube/YouTubeEmbedGenerator';
import { YouTubeChannelIdFinder } from '../components/youtube/YouTubeChannelIdFinder';
import { YouTubeTagExtractor } from '../components/youtube/YouTubeTagExtractor';

interface ToolPageProps {
  tool: ToolDefinition;
}

export const ToolPage: React.FC<ToolPageProps> = ({ tool }) => {
  // Check for Online Notepad
  if (tool.id === 'online-notepad' || tool.slug === 'online-notepad' || tool.route === '/online-notepad') {
    return <OnlineNotepadView />;
  }

  // Check for YouTube Tools Hub
  if (tool.id === 'youtube-tools' || tool.slug === 'youtube-tools' || tool.route === '/youtube-tools') {
    return <YouTubeToolsHub />;
  }

  const renderToolComponent = () => {
    // 0. PDF Suite Tools (Convert, Compress, Merge, Split, Protect, etc.)
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

    // 1. Compression / Target Size Tools
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

    // 2. Format Converter
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

    // 3. Crop & Cut
    if (
      tool.category === 'crop' ||
      tool.id === 'crop-image' ||
      tool.slug === 'crop' ||
      tool.slug === 'crop-image'
    ) {
      return <CropToolView />;
    }

    // 4. Passport & ID Photo Maker
    if (
      tool.category === 'passport' ||
      tool.id === 'passport-photo-maker' ||
      tool.slug === 'passport-photo' ||
      tool.slug === 'passport-photo-maker'
    ) {
      return <PassportPhotoToolView />;
    }

    // 5. Social Media Resizer
    if (
      tool.category === 'social' ||
      tool.id === 'social-resizer' ||
      tool.slug === 'social-media' ||
      tool.slug === 'social-resizer'
    ) {
      return <SocialResizeToolView />;
    }

    // 6. Border & Frame Maker
    if (
      tool.id === 'border-maker' ||
      tool.slug === 'border' ||
      tool.slug === 'border-maker'
    ) {
      return <BorderToolView />;
    }

    // 7. Watermark & Logo Overlay
    if (
      tool.id === 'watermark-image' ||
      tool.slug === 'watermark' ||
      tool.slug === 'watermark-image'
    ) {
      return <WatermarkToolView />;
    }

    // 8. Photo Effects & Filters
    if (
      (tool.category === 'effects' && tool.id !== 'color-picker' && tool.slug !== 'color-picker') ||
      tool.id === 'photo-effects' ||
      tool.slug === 'effects' ||
      tool.slug === 'photo-effects'
    ) {
      return <EffectsToolView />;
    }

    // 9. Color Palette Picker
    if (
      tool.id === 'color-picker' ||
      tool.slug === 'color-picker'
    ) {
      return <ColorPickerToolView />;
    }

    // 10. EXIF Metadata Viewer & Stripper
    if (
      tool.category === 'metadata' ||
      tool.id === 'metadata-tool' ||
      tool.slug === 'metadata' ||
      tool.slug === 'metadata-tool'
    ) {
      return <MetadataToolView />;
    }

    // 11. OCR / Image to Text
    if (
      tool.category === 'ocr' ||
      tool.id === 'ocr-image-to-text' ||
      tool.id === 'ocr-tool' ||
      tool.slug === 'ocr' ||
      tool.slug === 'ocr-tool'
    ) {
      return <OCRToolView />;
    }

    // 12. AI Tools (Background Remover, Enhancer, Upscaler, Object Remover, Unblur)
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

    // 14. Resize Image
    if (
      tool.category === 'resize' ||
      tool.id === 'resize-image' ||
      tool.slug === 'resize' ||
      tool.slug === 'resize-image'
    ) {
      return <ResizeToolView />;
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
    <div className="space-y-8 py-6 max-w-6xl mx-auto">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={breadcrumbs} />

      {/* SEO Title & Description Header */}
      <ToolHeaderSEO tool={tool} />

      {/* Main Interactive Tool Workspace */}
      <div className="min-h-[460px]">{renderToolComponent()}</div>

      {/* Factual Technical Specifications & Architecture */}
      {seoData && (
        <ToolSpecsTable
          toolName={tool.name}
          specs={seoData.formatSpecs}
          categoryName={seoData.categoryName}
        />
      )}

      {/* How To & FAQs Section */}
      <ToolFAQSection
        toolName={tool.name}
        howToSteps={tool.howToSteps}
        faqs={tool.faqs}
        features={tool.features}
      />

      {/* Topical Cluster Navigation & Internal Linking */}
      <TopicalClusterLinks
        currentCategorySlug={seoData?.categorySlug}
        currentToolId={tool.id}
        isCompressor={isCompressor}
        isConverter={isConverter}
      />

      {/* Related Tools for Discovery */}
      <RelatedTools currentToolId={tool.id} category={tool.category} />
    </div>
  );
};
