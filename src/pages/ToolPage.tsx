import React, { Suspense } from 'react';
import { CommonToolLayout } from '../components/common/CommonToolLayout';
import { ToolDefinition } from '../types';
import { getSceneConfigByRoute } from '../config/socialMockup/sceneRegistry';

// Direct Tool View Imports
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
import { AudioToolView } from '../components/tools/AudioToolView';
import { OnlineNotepadView } from '../views/OnlineNotepadView';
import { UniversalSocialMockupEditor } from '../components/socialMockup/UniversalSocialMockupEditor';

// YouTube Suite Components
import { YouTubeChannelIdFinder } from '../components/youtube/YouTubeChannelIdFinder';
import { YouTubeEmbedGenerator } from '../components/youtube/YouTubeEmbedGenerator';
import { YouTubeTagExtractor } from '../components/youtube/YouTubeTagExtractor';
import { YouTubeThumbnailDownloader } from '../components/youtube/YouTubeThumbnailDownloader';
import { YouTubeThumbnailPreviewer } from '../components/youtube/YouTubeThumbnailPreviewer';
import { YouTubeTimestampGenerator } from '../components/youtube/YouTubeTimestampGenerator';
import { YouTubeToolsHub } from '../components/youtube/YouTubeToolsHub';

const ToolLoadingFallback: React.FC = () => (
  <div className="w-full min-h-[350px] flex flex-col items-center justify-center p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm space-y-4">
    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    <div className="text-center space-y-1">
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Loading Tool Studio...</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">Initializing in-browser engine</p>
    </div>
  </div>
);

interface ToolPageProps {
  tool: ToolDefinition;
}

export const ToolPage: React.FC<ToolPageProps> = ({ tool }) => {
  const renderToolComponent = () => {
    // Check for Online Notepad
    if (
      tool.id === 'free-online-notepad' ||
      tool.slug === 'free-online-notepad' ||
      tool.route === '/free-online-notepad' ||
      tool.id === 'online-notepad'
    ) {
      return <OnlineNotepadView embedded />;
    }

    // Check for YouTube Tools Hub
    if (
      tool.id === 'youtube-tools' ||
      tool.slug === 'youtube-tools' ||
      tool.route === '/youtube-tools'
    ) {
      return <YouTubeToolsHub />;
    }

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

    // Social Mockup Studio & Fake Post / Chat / Feed Generators
    const isMockupTool =
      (tool.category as string) === 'social-mockup' ||
      (tool.category as string) === 'mockup' ||
      Boolean((tool as any).platformId) ||
      Boolean((tool as any).sceneType) ||
      tool.id.endsWith('-generator') ||
      tool.slug.endsWith('-generator') ||
      tool.slug.includes('-mockup') ||
      tool.id.includes('-mockup') ||
      Boolean(getSceneConfigByRoute(tool.slug || tool.route || tool.id));

    if (isMockupTool && tool.id !== 'youtube-embed-code-generator' && tool.id !== 'youtube-timestamp-link-generator') {
      const sceneConfig = getSceneConfigByRoute(tool.slug || tool.route || tool.id);
      const platformId = (tool as any).platformId || sceneConfig?.platformId || 'instagram';
      const sceneType = (tool as any).sceneType || sceneConfig?.sceneType || 'post';
      return <UniversalSocialMockupEditor initialPlatformId={platformId} initialSceneType={sceneType} />;
    }

    // Format Converter Tools
    if (
      tool.category === 'convert' ||
      tool.id === 'convert-image' ||
      tool.slug === 'convert' ||
      tool.slug === 'convert-image' ||
      tool.slug.startsWith('convert-') ||
      tool.slug.startsWith('convert/') ||
      (tool.route && tool.route.includes('/convert-image-tools/')) ||
      tool.slug.includes('-to-')
    ) {
      return <ConvertToolView tool={tool} />;
    }

    // Compression / Target Size Tools
    if (
      tool.category === 'compress' ||
      tool.id === 'compress-image' ||
      tool.slug === 'compress' ||
      tool.slug === 'compress-image' ||
      tool.slug.startsWith('compress-')
    ) {
      return <CompressToolView tool={tool} />;
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

    // Audio & Video Converters (MP4 to MP3, Video to MP3, WAV to MP3, etc.)
    if (
      tool.category === 'audio' ||
      tool.id.includes('mp3') ||
      tool.slug.includes('mp3') ||
      tool.slug.includes('to-mp3')
    ) {
      return <AudioToolView tool={tool} />;
    }

    // Default fallback
    return <ResizeToolView />;
  };

  return (
    <CommonToolLayout tool={tool}>
      <Suspense fallback={<ToolLoadingFallback />}>
        {renderToolComponent()}
      </Suspense>
    </CommonToolLayout>
  );
};

