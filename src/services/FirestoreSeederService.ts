import { db } from '../config/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { ToolDefinition } from '../types';
import { ALL_SCENE_ROUTES } from '../config/socialMockup/sceneRegistry';
import { POPULAR_CONVERTER_PAIRS, createConverterToolDefinition } from '../config/converterTools';
import {
  EXACT_TARGET_SIZE_ITEMS,
  SOCIAL_PRESETS_LIST,
  PIXEL_DIMENSIONS_LIST,
  createTargetSizeToolDefinition
} from '../config/targetSizeTools';

// 1. Base 58 System Tools (Standalone, PDF, AI, YouTube, Developer)
export const BASE_SYSTEM_TOOLS: ToolDefinition[] = [
  // Developer Tools
  {
    id: 'ocr-image-to-text',
    slug: 'ocr-image-to-text',
    name: 'OCR Image to Text',
    shortDescription: 'Extract editable text from scanned documents, photos & screenshots locally.',
    fullDescription: 'In-browser Optical Character Recognition (OCR) engine. Transform screenshots, receipts, scanned PDFs, and text photos into editable, copyable text with 100% privacy.',
    category: 'developer',
    processingType: 'browser',
    icon: 'FileText',
    route: '/ocr-image-to-text',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: ['100% Client-Side OCR engine', 'Multi-language text recognition', 'One-click copy to clipboard'],
    howToSteps: [
      { step: 1, title: 'Upload Screenshot', description: 'Select photo or document image containing text.' },
      { step: 2, title: 'Run OCR', description: 'Engine recognizes text characters.' },
      { step: 3, title: 'Copy Text', description: 'Copy extracted text to clipboard.' }
    ],
    faqs: [{ question: 'Are documents uploaded to servers?', answer: 'No, OCR processing runs locally in browser WebAssembly.' }],
    seo: { title: 'Free OCR Image to Text Converter Online', description: 'Extract text from images online using OCR.', keywords: ['ocr image to text', 'extract text from photo', 'picture text reader'], canonicalSlug: 'ocr-image-to-text' }
  },
  {
    id: 'metadata-tool',
    slug: 'image-metadata-viewer',
    name: 'EXIF Metadata Inspector',
    shortDescription: 'Inspect and view camera EXIF tags, GPS coordinates, dimensions & metadata.',
    fullDescription: 'Read detailed EXIF tags, camera make & model, lens aperture, shutter speed, ISO, focal length, creation timestamp, color profile, and embedded GPS coordinates.',
    category: 'developer',
    processingType: 'browser',
    icon: 'Info',
    route: '/image-metadata-viewer',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/tiff', 'image/webp', 'image/heic'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: ['Detailed EXIF header inspection', 'GPS location tag reader', 'Zero server data upload'],
    howToSteps: [
      { step: 1, title: 'Upload Photo', description: 'Select a camera photo or graphic file.' },
      { step: 2, title: 'Inspect Tags', description: 'View full EXIF metadata breakdown table.' },
      { step: 3, title: 'Export JSON', description: 'Copy or export metadata properties.' }
    ],
    faqs: [{ question: 'Does this strip EXIF data?', answer: 'You can inspect and remove metadata tags privately.' }],
    seo: { title: 'EXIF Metadata Inspector Online', description: 'Read EXIF metadata and camera specs from photos online.', keywords: ['exif viewer', 'image metadata inspector', 'view photo exif data'], canonicalSlug: 'image-metadata-viewer' }
  },
  {
    id: 'color-picker',
    slug: 'color-picker',
    name: 'Color Picker & Palette',
    shortDescription: 'Extract HEX, RGB, HSL color codes and generate palettes from images.',
    fullDescription: 'Developer & designer tool to pick exact pixel color values (HEX, RGB, HSL, RGBA) from uploaded images and automatically extract dominant color palettes.',
    category: 'developer',
    processingType: 'browser',
    icon: 'Palette',
    route: '/color-picker',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: ['Eyedropper pixel magnifier', 'HEX / RGB / HSL code copy', 'Dominant palette extraction'],
    howToSteps: [
      { step: 1, title: 'Upload Image', description: 'Drop your UI mockup or photo.' },
      { step: 2, title: 'Hover & Pick', description: 'Click any pixel to inspect color.' },
      { step: 3, title: 'Copy Code', description: 'Copy HEX or RGB values.' }
    ],
    faqs: [{ question: 'Can I export color palettes?', answer: 'Yes, copy HEX codes with one click.' }],
    seo: { title: 'Online Image Color Picker & Palette Generator', description: 'Extract HEX/RGB color codes from images.', keywords: ['color picker from image', 'hex color extractor', 'developer color tools'], canonicalSlug: 'color-picker' }
  },

  // AI Smart Tools
  {
    id: 'ai-background-remover',
    slug: 'ai-background-remover',
    name: 'AI Background Remover',
    shortDescription: 'Automatically isolate subjects and erase photo backgrounds in browser.',
    fullDescription: 'Neural computer vision AI background eraser. Automatically detect humans, products, animals, and objects to generate transparent PNG cutouts instantly.',
    category: 'ai',
    isAi: true,
    processingType: 'ai',
    icon: 'Sparkles',
    route: '/ai-background-remover',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 1,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: ['Automatic subject isolation', 'Transparent PNG export', 'Edge refining brush'],
    howToSteps: [
      { step: 1, title: 'Upload Photo', description: 'Select product or portrait photo.' },
      { step: 2, title: 'AI Cutout', description: 'AI removes background automatically.' },
      { step: 3, title: 'Download PNG', description: 'Save transparent cutout.' }
    ],
    faqs: [{ question: 'What background format is generated?', answer: 'Output is saved as transparent PNG.' }],
    seo: { title: 'Free AI Background Remover Online', description: 'Remove photo backgrounds with AI online.', keywords: ['ai background remover', 'remove background from image', 'transparent png maker'], canonicalSlug: 'ai-background-remover' }
  },
  {
    id: 'ai-image-upscaler',
    slug: 'ai-image-upscaler',
    name: 'AI Image Upscaler',
    shortDescription: 'Upscale low-resolution images 2x/4x with neural pixel enhancement.',
    fullDescription: 'AI resolution upscaler and photo detail enhancer. Enlarge small photos and low-res graphics up to 4x resolution without blurriness or pixelation.',
    category: 'ai',
    isAi: true,
    processingType: 'ai',
    icon: 'ArrowUpRight',
    route: '/ai-image-upscaler',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 1,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: ['2x and 4x neural upscaling', 'Noise reduction & sharpening', 'Side-by-side comparison'],
    howToSteps: [
      { step: 1, title: 'Upload Image', description: 'Select image to enlarge.' },
      { step: 2, title: 'Choose Factor', description: 'Pick 2x or 4x scale.' },
      { step: 3, title: 'Download HD', description: 'Save upscaled high-res image.' }
    ],
    faqs: [{ question: 'Does upscaling preserve details?', answer: 'Yes, neural model reconstructs fine textures.' }],
    seo: { title: 'Free AI Image Upscaler Online', description: 'Upscale and enlarge images with AI.', keywords: ['ai image upscaler', 'enlarge photo without quality loss', 'super resolution ai'], canonicalSlug: 'ai-image-upscaler' }
  },
  {
    id: 'ai-image-enhancer',
    slug: 'ai-image-enhancer',
    name: 'AI Image Enhancer',
    shortDescription: 'Automatically balance lighting, contrast & color tones with AI.',
    fullDescription: 'Intelligent image tone and exposure balance model. Automatically fix dark shadows, overexposed highlights, and washed-out colors.',
    category: 'ai',
    isAi: true,
    processingType: 'ai',
    icon: 'Wand2',
    route: '/ai-image-enhancer',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 1,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: ['One-click lighting auto-fix', 'Neural contrast restoration', 'Color tone enhancement'],
    howToSteps: [
      { step: 1, title: 'Upload Photo', description: 'Select photo.' },
      { step: 2, title: 'Enhance', description: 'AI enhances exposure.' },
      { step: 3, title: 'Save', description: 'Download enhanced photo.' }
    ],
    faqs: [{ question: 'Is it free?', answer: 'Yes, includes free preview mode.' }],
    seo: { title: 'AI Photo Enhancer Online', description: 'Enhance photo lighting and colors with AI.', keywords: ['ai photo enhancer', 'fix dark photo online'], canonicalSlug: 'ai-image-enhancer' }
  },
  {
    id: 'ai-object-remover',
    slug: 'ai-object-remover',
    name: 'AI Object Remover',
    shortDescription: 'Erase unwanted people, text, logos & defects from photos.',
    fullDescription: 'Inpainting neural vision algorithm. Magic erase unwanted objects, watermarks, wires, photobombers, and blemishes seamlessly.',
    category: 'ai',
    isAi: true,
    processingType: 'ai',
    icon: 'Eraser',
    route: '/ai-object-remover',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 1,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: ['Magic brush object selection', 'Seamless neural texture filling', 'Zero trace removal'],
    howToSteps: [
      { step: 1, title: 'Upload Image', description: 'Drop photo.' },
      { step: 2, title: 'Brush Object', description: 'Paint over unwanted object.' },
      { step: 3, title: 'Erase', description: 'AI fills background seamlessly.' }
    ],
    faqs: [{ question: 'Can I remove text from photos?', answer: 'Yes, text and logos are easily erased.' }],
    seo: { title: 'AI Object & Watermark Remover', description: 'Erase unwanted objects from photos online.', keywords: ['ai object remover', 'remove watermark from photo'], canonicalSlug: 'ai-object-remover' }
  },
  {
    id: 'ai-unblur',
    slug: 'ai-unblur',
    name: 'AI Photo Unblur',
    shortDescription: 'Fix blurry photos, motion blur, and out-of-focus portraits with AI.',
    fullDescription: 'Neural deblurring tool. Reconstruct crisp edges, sharp facial features, and clear text on blurry or shaky photos.',
    category: 'ai',
    isAi: true,
    processingType: 'ai',
    icon: 'Focus',
    route: '/ai-unblur',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 1,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: ['Motion blur correction', 'Facial feature sharpening', 'Crisp text restoration'],
    howToSteps: [
      { step: 1, title: 'Upload Blurry Photo', description: 'Select out-of-focus image.' },
      { step: 2, title: 'Deblur', description: 'Neural engine sharpens details.' },
      { step: 3, title: 'Download Sharp Photo', description: 'Save clear output.' }
    ],
    faqs: [{ question: 'Does it work on old photos?', answer: 'Yes, restores old or shaky snapshots.' }],
    seo: { title: 'AI Photo Unblur Online', description: 'Unblur photos and sharpen blurred text online.', keywords: ['ai unblur photo', 'fix blurry image online'], canonicalSlug: 'ai-unblur' }
  },

  // Creative Photo Editors
  {
    id: 'crop-image',
    slug: 'crop-image',
    name: 'Precision Image Cropper',
    shortDescription: 'Crop, rotate, flip, and frame photos to custom ratio boxes.',
    fullDescription: 'Interactive image cropping tool with pre-set aspect ratios (1:1, 4:5, 16:9, 4:3), rotation controls, and horizontal/vertical flipping.',
    category: 'crop',
    processingType: 'browser',
    icon: 'Crop',
    route: '/crop-image',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: ['Preset aspect ratios', 'Rotate & flip controls', 'Pixel precise selection'],
    howToSteps: [
      { step: 1, title: 'Upload Photo', description: 'Select photo to crop.' },
      { step: 2, title: 'Adjust Frame', description: 'Drag crop handle box.' },
      { step: 3, title: 'Crop & Export', description: 'Download cropped photo.' }
    ],
    faqs: [{ question: 'Can I flip images?', answer: 'Yes, horizontal and vertical flips are supported.' }],
    seo: { title: 'Free Online Image Cropper', description: 'Crop images online for free.', keywords: ['crop image', 'photo cropper'], canonicalSlug: 'crop-image' }
  },
  {
    id: 'passport-photo-maker',
    slug: 'passport-photo-maker',
    name: 'Passport Photo Maker',
    shortDescription: 'Create official country passport & visa photos with exact mm/px specs.',
    fullDescription: 'Formatted passport & ID photo generator for US (2x2 in), Schengen Visa (35x45 mm), India Passport, UK Passport, and Canada Visa requirements.',
    category: 'passport',
    processingType: 'browser',
    icon: 'UserSquare2',
    route: '/passport-photo-maker',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: ['Official country size presets', 'Biometric face guide overlay', 'Printable sheet layout'],
    howToSteps: [
      { step: 1, title: 'Upload Portrait', description: 'Select your front-facing portrait.' },
      { step: 2, title: 'Choose Country', description: 'Select US, Schengen, UK, or India.' },
      { step: 3, title: 'Export', description: 'Download single photo or print grid.' }
    ],
    faqs: [{ question: 'Is this compliant with official specs?', answer: 'Yes, exact dimensions for 40+ countries are included.' }],
    seo: { title: 'Passport Photo Maker Online', description: 'Create passport photos online.', keywords: ['passport photo maker', 'id photo generator'], canonicalSlug: 'passport-photo-maker' }
  },
  {
    id: 'watermark-image',
    slug: 'image-watermark',
    name: 'Image Watermark Generator',
    shortDescription: 'Protect images with custom text & logo watermarks, opacity & tiling.',
    fullDescription: 'Add copyright protection to your photography and digital artwork. Customize text overlays, logo stamps, opacity levels, font sizes, and repeating grid patterns.',
    category: 'edit',
    processingType: 'browser',
    icon: 'Stamp',
    route: '/image-watermark',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
    isPopular: false,
    features: ['Text & logo watermarks', 'Grid tiling mode', 'Adjustable opacity'],
    howToSteps: [
      { step: 1, title: 'Upload Photo', description: 'Select photo.' },
      { step: 2, title: 'Configure Watermark', description: 'Enter text or logo image.' },
      { step: 3, title: 'Download', description: 'Save watermarked photo.' }
    ],
    faqs: [{ question: 'Can I watermark multiple photos?', answer: 'Yes, batch mode is supported.' }],
    seo: { title: 'Image Watermark Generator Online', description: 'Add watermark to photos online.', keywords: ['image watermark', 'watermark photo'], canonicalSlug: 'image-watermark' }
  },
  {
    id: 'border-maker',
    slug: 'image-border-generator',
    name: 'Image Border Generator',
    shortDescription: 'Add aesthetic padding, solid colors, rounded corners & shadow frames.',
    fullDescription: 'Enhance your graphics with clean borders, Instagram-style white frames, colored padding, drop shadows, and soft corner rounding.',
    category: 'edit',
    processingType: 'browser',
    icon: 'Frame',
    route: '/image-border-generator',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
    isPopular: false,
    features: ['Custom padding thickness', 'Color picker palette', 'Drop shadows & rounded corners'],
    howToSteps: [
      { step: 1, title: 'Upload Image', description: 'Select image file.' },
      { step: 2, title: 'Style Border', description: 'Set padding, color, and corners.' },
      { step: 3, title: 'Download', description: 'Export framed image.' }
    ],
    faqs: [{ question: 'Does it change aspect ratio?', answer: 'Padding is added around original image.' }],
    seo: { title: 'Image Border Generator Online', description: 'Add borders to photos online.', keywords: ['image border', 'photo frame generator'], canonicalSlug: 'image-border-generator' }
  },
  {
    id: 'photo-effects',
    slug: 'image-effects-filters',
    name: 'Image Effects & Filters',
    shortDescription: 'Apply vintage, grayscale, sepia, contrast, brightness & color filters.',
    fullDescription: 'Transform your photos with instant aesthetic filters. Adjust brightness, contrast, saturation, hue, blur, sharpen, vintage film tones, and monochrome styles.',
    category: 'effects',
    processingType: 'browser',
    icon: 'Wand2',
    route: '/image-effects-filters',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
    isPopular: false,
    features: ['10+ aesthetic preset filters', 'Custom HSL & contrast sliders', 'Live side-by-side preview'],
    howToSteps: [
      { step: 1, title: 'Upload Photo', description: 'Select your photo.' },
      { step: 2, title: 'Select Filter', description: 'Pick a preset or adjust sliders.' },
      { step: 3, title: 'Download', description: 'Save filtered photo.' }
    ],
    faqs: [{ question: 'Are filters non-destructive?', answer: 'Yes, original photo stays untouched.' }],
    seo: { title: 'Image Effects & Filters Online', description: 'Apply filters to photos online.', keywords: ['image filters', 'photo effects'], canonicalSlug: 'image-effects-filters' }
  },

  // Core Resizer & Converter
  {
    id: 'resize-image',
    slug: 'resize-image',
    name: 'Image Resizer',
    shortDescription: 'Resize photos to custom pixel dimensions or percentages with aspect ratio lock.',
    fullDescription: 'High-speed in-browser image resizer. Scale any JPEG, PNG, WebP or AVIF graphic to custom width and height with smooth Lanczos resampling.',
    category: 'resize',
    processingType: 'browser',
    icon: 'Scaling',
    route: '/resize-image',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: ['Custom pixel & percentage scaling', 'Aspect ratio locking', '100% in-browser processing'],
    howToSteps: [
      { step: 1, title: 'Upload Photo', description: 'Drag and drop your photo into the resizer.' },
      { step: 2, title: 'Set Dimensions', description: 'Enter target width and height in pixels.' },
      { step: 3, title: 'Download', description: 'Save your newly resized image.' }
    ],
    faqs: [{ question: 'Is it free?', answer: 'Yes, 100% free.' }],
    seo: { title: 'Free Online Image Resizer', description: 'Resize images online for free.', keywords: ['resize image', 'image resizer'], canonicalSlug: 'resize-image' }
  },
  {
    id: 'compress-image',
    slug: 'compress-image',
    name: 'Smart Image Compressor',
    shortDescription: 'Compress JPEG, PNG, WebP, and AVIF photos with custom quality & byte limits.',
    fullDescription: 'Smart browser-side image compressor. Reduce file sizes to target kilobytes (20KB, 50KB, 100KB, 200KB) for fast web loading and document uploads.',
    category: 'compress',
    processingType: 'browser',
    icon: 'Minimize2',
    route: '/compress-image',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: ['Exact KB target limits', 'Lossless & lossy optimization', 'Batch queue support'],
    howToSteps: [
      { step: 1, title: 'Upload Photo', description: 'Select your photo.' },
      { step: 2, title: 'Set Quality', description: 'Adjust compression level.' },
      { step: 3, title: 'Download', description: 'Save compressed photo.' }
    ],
    faqs: [{ question: 'Are files uploaded?', answer: 'No, processed locally in browser RAM.' }],
    seo: { title: 'Smart Image Compressor Online', description: 'Compress images online for free.', keywords: ['compress image', 'image compressor'], canonicalSlug: 'compress-image' }
  },
  {
    id: 'convert-image',
    slug: 'convert-image',
    name: 'Universal Image Converter',
    shortDescription: 'Convert between PNG, JPG, WebP, AVIF, HEIC, and SVG formats in browser.',
    fullDescription: 'Multi-format image transcoder engine. Convert Apple HEIC, WebP, SVG, PNG, and JPG graphics instantly without server uploads.',
    category: 'convert',
    processingType: 'browser',
    icon: 'RefreshCw',
    route: '/convert-image',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/svg+xml'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: ['100% in-browser transcode', 'HEIC to JPG support', 'Batch conversion'],
    howToSteps: [
      { step: 1, title: 'Upload File', description: 'Drop your image file.' },
      { step: 2, title: 'Select Format', description: 'Choose output target format.' },
      { step: 3, title: 'Convert', description: 'Export converted file.' }
    ],
    faqs: [{ question: 'Is conversion private?', answer: 'Yes, 100% private.' }],
    seo: { title: 'Universal Image Converter Online', description: 'Convert image formats online.', keywords: ['image converter', 'convert webp to jpg'], canonicalSlug: 'convert-image' }
  },
  {
    id: 'social-resizer',
    slug: 'social-resizer',
    name: 'Social Media Photo Resizer',
    shortDescription: 'Resize photos to exact dimensions for Instagram, YouTube, LinkedIn, X & Facebook.',
    fullDescription: 'Pre-set dimension resizer for all major social media platforms. Scale images to Instagram Square, Story, YouTube Banner, LinkedIn Header, and X Header.',
    category: 'resize',
    processingType: 'browser',
    icon: 'Share2',
    route: '/social-resizer',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: ['20+ Social Media presets', 'Zero crop loss preview', 'High DPI export'],
    howToSteps: [
      { step: 1, title: 'Select Platform', description: 'Pick Instagram, YouTube, or LinkedIn.' },
      { step: 2, title: 'Upload Image', description: 'Drop photo into frame.' },
      { step: 3, title: 'Export Presets', description: 'Download formatted social graphics.' }
    ],
    faqs: [{ question: 'Does it support 4:5 Instagram feed?', answer: 'Yes, supports 4:5 Portrait, Square 1:1 and 9:16 Stories.' }],
    seo: { title: 'Social Media Image Resizer Online', description: 'Resize images for Instagram, YouTube, LinkedIn, Twitter.', keywords: ['social media image resizer', 'instagram photo resizer'], canonicalSlug: 'social-resizer' }
  },
  {
    id: 'free-online-notepad',
    slug: 'free-online-notepad',
    name: 'Free Online Notepad',
    shortDescription: 'Distraction-free in-browser text editor & scratchpad with auto-save.',
    fullDescription: 'Privacy-focused online scratchpad and notes editor. Instant auto-save to browser LocalStorage with character count, word count, and plain text export.',
    category: 'developer',
    processingType: 'browser',
    icon: 'FileCode',
    route: '/free-online-notepad',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['text/plain'],
    maxFileSizeMB: 10,
    isPopular: false,
    features: ['LocalStorage auto-save', 'Live word & character count', 'TXT file download'],
    howToSteps: [
      { step: 1, title: 'Start Typing', description: 'Type or paste text directly.' },
      { step: 2, title: 'Auto-Save', description: 'Text saves automatically in browser.' },
      { step: 3, title: 'Export', description: 'Download as TXT file.' }
    ],
    faqs: [{ question: 'Is text sent to a server?', answer: 'No, all note data stays in local browser RAM/storage.' }],
    seo: { title: 'Free Online Notepad & Scratchpad', description: 'Simple online notepad with auto-save.', keywords: ['free online notepad', 'browser text editor'], canonicalSlug: 'free-online-notepad' }
  },

  // YouTube Creator Suite
  {
    id: 'youtube-thumbnail-downloader',
    slug: 'youtube-thumbnail-downloader',
    name: 'YouTube Thumbnail Downloader',
    shortDescription: 'Download 1080p Full HD, 720p HD, and SD YouTube thumbnails instantly.',
    fullDescription: 'Extract and download high-resolution cover thumbnail images from any YouTube video URL in 1080p Full HD, 720p HD, Medium, and Standard sizes.',
    category: 'youtube',
    processingType: 'browser',
    icon: 'Video',
    route: '/youtube-thumbnail-downloader',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['text/plain'],
    maxFileSizeMB: 10,
    isPopular: true,
    features: ['Full HD 1080p thumbnail extraction', 'One-click image download', 'Works with all public YouTube links'],
    howToSteps: [
      { step: 1, title: 'Paste Video URL', description: 'Enter YouTube video link.' },
      { step: 2, title: 'Preview Resolutions', description: 'View HD, SD, and 1080p covers.' },
      { step: 3, title: 'Download Image', description: 'Save thumbnail to device.' }
    ],
    faqs: [{ question: 'Is this tool free?', answer: 'Yes, 100% free with unlimited usage.' }],
    seo: { title: 'YouTube Thumbnail Downloader Online', description: 'Download HD YouTube thumbnails online.', keywords: ['youtube thumbnail downloader', 'get youtube cover photo'], canonicalSlug: 'youtube-thumbnail-downloader' }
  },
  {
    id: 'youtube-thumbnail-previewer',
    slug: 'youtube-thumbnail-previewer',
    name: 'YouTube Thumbnail Tester & Previewer',
    shortDescription: 'Test how your thumbnail looks on YouTube Home, Desktop, Mobile & Dark mode.',
    fullDescription: 'Preview your YouTube thumbnail image alongside competing videos on desktop home feed, mobile search results, sidebar recommendations, and dark mode.',
    category: 'youtube',
    processingType: 'browser',
    icon: 'Eye',
    route: '/youtube-thumbnail-previewer',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 10,
    isPopular: true,
    features: ['Desktop & mobile mockups', 'Dark mode & light mode toggle', 'Sidebar recommendation preview'],
    howToSteps: [
      { step: 1, title: 'Upload Cover Image', description: 'Select your draft thumbnail.' },
      { step: 2, title: 'Enter Title', description: 'Type video title and channel name.' },
      { step: 3, title: 'Inspect Feed', description: 'See how it stands out against competitors.' }
    ],
    faqs: [{ question: 'Can I test custom titles?', answer: 'Yes, customize title, channel name, and view count.' }],
    seo: { title: 'YouTube Thumbnail Tester & Feed Previewer', description: 'Test YouTube thumbnails on feed mockups.', keywords: ['youtube thumbnail previewer', 'test youtube cover image'], canonicalSlug: 'youtube-thumbnail-previewer' }
  },
  {
    id: 'youtube-timestamp-link-generator',
    slug: 'youtube-timestamp-generator',
    name: 'YouTube Timestamp Generator',
    shortDescription: 'Create clickable YouTube video timestamps and chapter links.',
    fullDescription: 'Generate exact timestamp URLs (e.g. ?t=1m45s) and organized video chapter lists for YouTube descriptions and comments.',
    category: 'youtube',
    processingType: 'browser',
    icon: 'Clock',
    route: '/youtube-timestamp-generator',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['text/plain'],
    maxFileSizeMB: 10,
    isPopular: false,
    features: ['MM:SS and HH:MM:SS format', 'Clickable link generator', 'Chapter list formatting'],
    howToSteps: [
      { step: 1, title: 'Paste Link', description: 'Paste YouTube video URL.' },
      { step: 2, title: 'Enter Time', description: 'Specify minutes and seconds.' },
      { step: 3, title: 'Copy Link', description: 'Copy timestamp link.' }
    ],
    faqs: [{ question: 'Does it work on mobile?', answer: 'Yes, links open at exact time on mobile and desktop.' }],
    seo: { title: 'YouTube Timestamp Link Generator', description: 'Create timestamped YouTube links.', keywords: ['youtube timestamp generator', 'youtube link with start time'], canonicalSlug: 'youtube-timestamp-generator' }
  },
  {
    id: 'youtube-embed-code-generator',
    slug: 'youtube-embed-generator',
    name: 'YouTube Embed Code Generator',
    shortDescription: 'Generate responsive, privacy-enhanced YouTube iframe embed codes.',
    fullDescription: 'Customize responsive HTML iframe embed codes for YouTube videos with autoplay, loop, modest branding, start times, and privacy-enhanced mode (youtube-nocookie.com).',
    category: 'youtube',
    processingType: 'browser',
    icon: 'Code',
    route: '/youtube-embed-generator',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['text/plain'],
    maxFileSizeMB: 10,
    isPopular: false,
    features: ['Responsive CSS aspect-ratio container', 'Privacy-enhanced nocookie domain', 'Autoplay & controls toggle'],
    howToSteps: [
      { step: 1, title: 'Paste URL', description: 'Enter YouTube video link.' },
      { step: 2, title: 'Configure Options', description: 'Set width, height, and controls.' },
      { step: 3, title: 'Copy HTML', description: 'Paste code into your website.' }
    ],
    faqs: [{ question: 'Is the embed code responsive?', answer: 'Yes, includes CSS wrapper for mobile responsiveness.' }],
    seo: { title: 'YouTube Embed Code Generator Online', description: 'Generate responsive iframe code for YouTube videos.', keywords: ['youtube embed generator', 'responsive youtube iframe'], canonicalSlug: 'youtube-embed-generator' }
  },
  {
    id: 'youtube-channel-id-finder',
    slug: 'youtube-channel-id-finder',
    name: 'YouTube Channel ID Finder',
    shortDescription: 'Look up unique YouTube Channel IDs from handles or URLs.',
    fullDescription: 'Find official 24-character YouTube Channel IDs (UC...) from any custom URL, user handle (@username), or video link.',
    category: 'youtube',
    processingType: 'browser',
    icon: 'Search',
    route: '/youtube-channel-id-finder',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['text/plain'],
    maxFileSizeMB: 10,
    isPopular: false,
    features: ['Instant Channel ID extraction', 'Supports @handles & legacy URLs', 'One-click copy'],
    howToSteps: [
      { step: 1, title: 'Enter Channel URL', description: 'Paste channel URL or @handle.' },
      { step: 2, title: 'Find ID', description: 'Extract unique UC channel ID.' },
      { step: 3, title: 'Copy', description: 'Copy ID for API or plugin integration.' }
    ],
    faqs: [{ question: 'What is a Channel ID?', answer: 'Unique identifier starting with UC used in YouTube API.' }],
    seo: { title: 'YouTube Channel ID Finder Online', description: 'Find YouTube Channel ID from handle or URL.', keywords: ['youtube channel id finder', 'find youtube channel id'], canonicalSlug: 'youtube-channel-id-finder' }
  },
  {
    id: 'youtube-handle-finder',
    slug: 'youtube-handle-finder',
    name: 'YouTube Handle Finder',
    shortDescription: 'Discover official handles and channel tags for YouTube creators.',
    fullDescription: 'Look up official YouTube handles (@name) and channel profile links for creators and brands.',
    category: 'youtube',
    processingType: 'browser',
    icon: 'AtSign',
    route: '/youtube-handle-finder',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['text/plain'],
    maxFileSizeMB: 10,
    isPopular: false,
    features: ['Handle lookup', 'Direct channel link verification', 'Zero API keys required'],
    howToSteps: [
      { step: 1, title: 'Search Name', description: 'Type channel or creator name.' },
      { step: 2, title: 'View Handle', description: 'Find official @handle.' },
      { step: 3, title: 'Copy', description: 'Copy handle link.' }
    ],
    faqs: [{ question: 'Are handles unique?', answer: 'Yes, handles are unique creator identifiers on YouTube.' }],
    seo: { title: 'YouTube Handle Finder Online', description: 'Find official YouTube handles.', keywords: ['youtube handle finder', 'search youtube handle'], canonicalSlug: 'youtube-handle-finder' }
  },
  {
    id: 'youtube-tag-extractor',
    slug: 'youtube-tag-extractor',
    name: 'YouTube Tag Extractor',
    shortDescription: 'Extract hidden SEO tags and keywords from any YouTube video.',
    fullDescription: 'Discover competitors video SEO strategy. Extract all tags, meta keywords, and topics from any public YouTube video link.',
    category: 'youtube',
    processingType: 'browser',
    icon: 'Tag',
    route: '/youtube-tag-extractor',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['text/plain'],
    maxFileSizeMB: 10,
    isPopular: true,
    features: ['Extract all hidden video tags', 'Copy tags as CSV or comma-separated list', 'Analyze competitor video SEO'],
    howToSteps: [
      { step: 1, title: 'Paste Video URL', description: 'Enter YouTube video link.' },
      { step: 2, title: 'Extract Tags', description: 'Read hidden meta tags.' },
      { step: 3, title: 'Copy Keywords', description: 'Copy list for your video SEO.' }
    ],
    faqs: [{ question: 'Are tags legal to view?', answer: 'Yes, video tags are part of public web page metadata.' }],
    seo: { title: 'YouTube Tag Extractor Online', description: 'Extract tags and keywords from YouTube videos.', keywords: ['youtube tag extractor', 'extract youtube tags', 'video seo tags'], canonicalSlug: 'youtube-tag-extractor' }
  },
  {
    id: 'youtube-tools',
    slug: 'youtube-tools',
    name: 'YouTube Creator Suite',
    shortDescription: 'Suite of HD thumbnail downloaders, embed code generators & tag extractors.',
    fullDescription: 'Complete creator toolkit for YouTube channel growth. Download thumbnails, create responsive embed codes, extract video tags, and test thumbnail mockups.',
    category: 'youtube',
    processingType: 'browser',
    icon: 'Video',
    route: '/youtube-tools',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['text/plain'],
    maxFileSizeMB: 10,
    isPopular: true,
    features: ['Full creator toolkit', 'Zero registration required', 'Fast in-browser utilities'],
    howToSteps: [
      { step: 1, title: 'Select Tool', description: 'Choose thumbnail downloader, embed generator, or tag extractor.' },
      { step: 2, title: 'Paste URL', description: 'Enter video or channel link.' },
      { step: 3, title: 'Get Results', description: 'Copy code or download images.' }
    ],
    faqs: [{ question: 'Are all creator tools free?', answer: 'Yes, 100% free.' }],
    seo: { title: 'YouTube Creator Suite Online', description: 'Free YouTube tools for creators.', keywords: ['youtube creator tools', 'youtube utility suite'], canonicalSlug: 'youtube-tools' }
  }
];

// 2. Synthesize 27 Social Media Mockup Generator Tools
export const MOCKUP_GENERATOR_TOOLS: ToolDefinition[] = ALL_SCENE_ROUTES.map((scene) => ({
  id: scene.route.replace(/^\/+/, ''),
  slug: scene.route.replace(/^\/+/, ''),
  name: scene.name,
  shortDescription: scene.seoDescription || `Generate realistic ${scene.name} graphics in browser RAM.`,
  fullDescription: `${scene.seoTitle}. Professional ${scene.name} editor with 2x HD PNG export, custom avatars, text formatting, and realistic platform interface design.`,
  category: 'social',
  processingType: 'browser',
  icon: 'Share2',
  route: scene.route,
  supportsBatch: false,
  requiresAuth: false,
  creditCost: 0,
  supportedFormats: ['image/png', 'image/jpeg', 'image/webp'],
  maxFileSizeMB: 50,
  isPopular: true,
  features: ['2x High-DPI PNG export', 'Realistic platform UI preview', '100% in-browser privacy'],
  howToSteps: [
    { step: 1, title: 'Upload Avatar & Text', description: 'Enter username, avatar photo, and post content.' },
    { step: 2, title: 'Customize Indicators', description: 'Adjust likes, timestamps, and verified badges.' },
    { step: 3, title: 'Export PNG', description: 'Download clean 2x HD graphic.' }
  ],
  faqs: [{ question: 'Are graphics uploaded to servers?', answer: 'No, rendered 100% locally in browser RAM.' }],
  seo: {
    title: scene.seoTitle,
    description: scene.seoDescription,
    keywords: [scene.name.toLowerCase(), 'mockup generator'],
    canonicalSlug: scene.route.replace(/^\/+/, '')
  }
}));

// 3. Synthesize Format Converter Tools
export const FORMAT_CONVERTER_TOOLS: ToolDefinition[] = POPULAR_CONVERTER_PAIRS.map((p) =>
  createConverterToolDefinition(p.slug, p.fromExt, p.toExt, p.fromFormat, p.toFormat)
);

// 4. Synthesize Target Size Image & PDF Compressor Tools
export const TARGET_SIZE_COMPRESSOR_TOOLS: ToolDefinition[] = EXACT_TARGET_SIZE_ITEMS.map((item) =>
  createTargetSizeToolDefinition(
    item.slug,
    item.targetSizeKb,
    (item.format as any) || 'image/jpeg',
    item.type
  )
);

// 5. Synthesize Preset Resizer Tools
export const RESIZER_PRESET_TOOLS: ToolDefinition[] = [
  ...SOCIAL_PRESETS_LIST.map((p) => ({
    id: p.slug,
    slug: p.slug,
    name: `Resize Image for ${p.platform} ${p.name}`,
    shortDescription: `Resize photos to exact ${p.platform} ${p.name} dimensions (${p.dimensions}).`,
    fullDescription: `Formatted ${p.platform} graphic resizer preset. Scale photos to ${p.dimensions} with aspect ratio locks and zero distortion.`,
    category: 'resize' as const,
    processingType: 'browser' as const,
    icon: 'Scaling',
    route: `/${p.slug}`,
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
    isPopular: false,
    features: [`Official ${p.platform} spec (${p.dimensions})`, 'Auto aspect lock', 'High DPI export'],
    howToSteps: [
      { step: 1, title: 'Upload Graphic', description: 'Select photo.' },
      { step: 2, title: 'Apply Preset', description: `Preset sets frame to ${p.dimensions}.` },
      { step: 3, title: 'Download', description: 'Save formatted social graphic.' }
    ],
    faqs: [{ question: 'Does it fit perfectly?', answer: `Yes, matches official ${p.platform} requirements.` }],
    seo: {
      title: `Resize Image for ${p.platform} ${p.name} Online`,
      description: `Resize photo to ${p.dimensions} for ${p.platform}.`,
      keywords: [p.slug, `resize image for ${p.platform.toLowerCase()}`],
      canonicalSlug: p.slug
    }
  })),
  ...PIXEL_DIMENSIONS_LIST.map((p) => ({
    id: p.slug,
    slug: p.slug,
    name: `Resize Image to ${p.label}`,
    shortDescription: `Resize photos to exact ${p.label} pixels (${p.desc}).`,
    fullDescription: `High-speed pixel resizer. Scale images to exact ${p.label} resolution for ${p.desc}.`,
    category: 'resize' as const,
    processingType: 'browser' as const,
    icon: 'Scaling',
    route: `/${p.slug}`,
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
    isPopular: false,
    features: [`Exact ${p.label} pixel resolution`, 'Smooth resampling', 'Aspect ratio locking'],
    howToSteps: [
      { step: 1, title: 'Upload Photo', description: 'Select photo.' },
      { step: 2, title: 'Scale', description: `Dimensions set to ${p.label}.` },
      { step: 3, title: 'Download', description: 'Save resized photo.' }
    ],
    faqs: [{ question: 'Can I lock aspect ratio?', answer: 'Yes, toggle aspect ratio lock anytime.' }],
    seo: {
      title: `Resize Image to ${p.label} Pixels Online`,
      description: `Resize photos to ${p.label} pixels online.`,
      keywords: [p.slug, `resize image to ${p.label}`],
      canonicalSlug: p.slug
    }
  }))
];

// Combine ALL system tools (140+ Tools)
export const ALL_SYSTEM_TOOLS: ToolDefinition[] = [
  ...BASE_SYSTEM_TOOLS,
  ...MOCKUP_GENERATOR_TOOLS,
  ...FORMAT_CONVERTER_TOOLS,
  ...TARGET_SIZE_COMPRESSOR_TOOLS,
  ...RESIZER_PRESET_TOOLS
];

/**
 * Seeder utility to populate Firestore with all 140+ tools.
 */
export async function seedAllToolsToFirestore(): Promise<{ added: number; updated: number }> {
  try {
    let addedCount = 0;
    let updatedCount = 0;

    const snapshot = await getDocs(collection(db, 'tools'));
    const existingIds = new Set(snapshot.docs.map((d) => d.id));

    for (const tool of ALL_SYSTEM_TOOLS) {
      const docRef = doc(db, 'tools', tool.id);
      if (existingIds.has(tool.id)) {
        updatedCount++;
      } else {
        addedCount++;
      }
      await setDoc(docRef, tool, { merge: true });
    }

    console.log(`Firestore Seeding Complete: ${addedCount} added, ${updatedCount} updated.`);
    return { added: addedCount, updated: updatedCount };
  } catch (error) {
    console.error('Error seeding tools to Firestore:', error);
    throw error;
  }
}
