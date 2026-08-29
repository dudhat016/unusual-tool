import { ToolDefinition } from '../types';
import { parseTargetSizeRoute } from './targetSizeTools';
import { parseConverterRoute } from './converterTools';
import { YOUTUBE_TOOLS } from './youtubeTools';
import { PDF_TOOLS_REGISTRY } from './pdfTools';

export const TOOLS_REGISTRY: ToolDefinition[] = [
  ...YOUTUBE_TOOLS,
  ...PDF_TOOLS_REGISTRY,
  // 0. Free Online Notepad
  {
    id: 'free-online-notepad',
    slug: 'free-online-notepad',
    name: 'Free Online Notepad',
    shortDescription: 'Free browser-based notepad with rich text, autosave, multiple notes, and instant exports.',
    fullDescription: 'Private, distraction-free online text editor. Write, format with rich text, auto-save to browser storage, and export to TXT, Markdown, HTML, PDF, or Word with complete privacy and zero server uploads.',
    category: 'ocr',
    processingType: 'browser',
    icon: 'FileText',
    route: '/free-online-notepad',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['text/plain', 'text/markdown', 'text/html'],
    maxFileSizeMB: 10,
    isPopular: true,
    features: [
      '100% Client-Side Privacy: Notes are stored in your browser without server uploads',
      'Automatic instant saving with local IndexedDB & LocalStorage engines',
      'Rich formatting toolbar: Headings, Bold, Italic, Lists, Blockquotes, and Code',
      'Bidirectional RTL / LTR text support with direction-aware alignment',
      'Real-time writing stats: Word count, character count, and reading time',
      'Multi-note manager with search, tagging, pinning, and trash recovery',
      'Multi-format export: Download as .TXT, .MD (Markdown), .HTML, .PDF, or .DOCX',
      'Distraction-free Focus and Fullscreen writing modes'
    ],
    howToSteps: [
      { step: 1, title: 'Open and Start Typing', description: 'Start writing immediately in the editor. No account or sign-up needed.' },
      { step: 2, title: 'Format & Customize', description: 'Apply headings, bold, lists, and font sizes using the top toolbar.' },
      { step: 3, title: 'Save & Export', description: 'Your notes auto-save locally. Export anytime as PDF, Word, TXT, or Markdown.' }
    ],
    faqs: [
      { question: 'Is AetherPix Free Online Notepad really free?', answer: 'Yes, 100% free with no registration, word limits, or subscriptions required.' },
      { question: 'Where are my notes saved?', answer: 'All notes are stored directly in your browser using local IndexedDB and localStorage. They are never sent to our servers.' },
      { question: 'Does it work offline?', answer: 'Yes, once loaded, the notepad functions completely offline with full local persistence.' },
      { question: 'Can I download my notes as PDF or Word?', answer: 'Yes, you can export notes in 1-click as PDF, Microsoft Word (.docx), Markdown (.md), HTML, or plain text (.txt).' }
    ],
    seo: {
      title: 'Free Online Notepad – Write, Format & Save Notes Online',
      description: 'Private free online notepad with rich text formatting, autosave, multiple notes manager, word counter, and instant PDF, Word, & TXT export.',
      keywords: ['online notepad', 'free online notepad', 'online text editor', 'notepad online', 'quick notes online', 'browser notepad', 'private notes online'],
      canonicalSlug: 'free-online-notepad'
    }
  },

  // 1. Resize Image
  {
    id: 'resize-image',
    slug: 'resize',
    name: 'Resize Image',
    shortDescription: 'Resize photos by exact pixels, percentage, or print units with aspect ratio lock.',
    fullDescription: 'High-speed browser-side image resizer. Change dimensions by width/height in pixels, percentage scaling, or physical units (cm, mm, inches) with bicubic and bilinear interpolation.',
    category: 'resize',
    processingType: 'browser',
    icon: 'Scaling',
    route: '/resize',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: [
      'Resize by Pixels, Percentage, Centimeters, Millimeters, or Inches',
      'Lock aspect ratio to prevent distortion',
      'High-quality Bicubic, Bilinear, & Crisp interpolation algorithms',
      'Target DPI calculation for crisp print outputs (300 DPI)',
      '100% private in-browser processing without file uploads'
    ],
    howToSteps: [
      { step: 1, title: 'Upload Image', description: 'Drag and drop your photo or paste directly from your clipboard.' },
      { step: 2, title: 'Choose Resize Mode', description: 'Select pixels, percentage, or print units, and type your new dimensions.' },
      { step: 3, title: 'Process & Download', description: 'Preview your resized image instantly and download in JPG, PNG, or WebP.' }
    ],
    faqs: [
      { question: 'Will resizing reduce the quality of my image?', answer: 'Our browser engine uses sub-pixel bicubic interpolation to preserve maximum sharpness when downscaling or upscaling photos.' },
      { question: 'Is there a limit on how many images I can resize?', answer: 'No! Browser-based resizing is 100% free and unlimited with zero server limits.' },
      { question: 'Are my images uploaded to any server?', answer: 'No. All resizing happens entirely inside your web browser memory using HTML5 Canvas API.' }
    ],
    seo: {
      title: 'Free Online Image Resizer - Resize Photos in Pixels, % or CM',
      description: 'Quickly resize JPG, PNG, and WebP images online for free. Adjust dimensions by pixels, percentage, cm, or inches with aspect ratio lock.',
      keywords: ['resize image', 'image resizer', 'resize photo online', 'resize image to 100kb', 'scale picture', 'resize pixel dimensions'],
      canonicalSlug: 'resize'
    }
  },

  // 2. Compress Image
  {
    id: 'compress-image',
    slug: 'compress',
    name: 'Compress Image',
    shortDescription: 'Shrink file size up to 90% while maintaining crisp visual quality.',
    fullDescription: 'Smart lossless and lossy image compressor. Reduce file sizes to target exact benchmarks (50KB, 100KB, 200KB, 500KB) or use intelligent auto-compression for websites and email.',
    category: 'compress',
    processingType: 'browser',
    icon: 'Minimize2',
    route: '/compress',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: [
      'Target specific file sizes (20KB, 50KB, 100KB, 200KB, 500KB, 1MB)',
      'Intelligent iterative compression with live size reduction % calculation',
      'Side-by-side Before vs After visual preview slider',
      'Stripping unnecessary EXIF metadata to shave extra kilobytes',
      'Supports JPG, WebP, and PNG optimization'
    ],
    howToSteps: [
      { step: 1, title: 'Select File', description: 'Upload your heavy JPG, PNG, or WebP photo.' },
      { step: 2, title: 'Pick Target Size or Quality', description: 'Choose a preset like "100 KB" or adjust the visual quality slider.' },
      { step: 3, title: 'Download Compressed File', description: 'Compare the file size reduction and download your optimized image.' }
    ],
    faqs: [
      { question: 'How much can I compress an image without losing quality?', answer: 'Most modern WebP and JPEG photos can be compressed by 60% to 85% without noticeable loss in standard screen view.' },
      { question: 'Can I compress an image to exactly 100KB or 50KB?', answer: 'Yes! Select the "Target Size" mode, type your desired KB target, and our binary-search encoder will find the optimal setting.' }
    ],
    seo: {
      title: 'Compress Image Online - Reduce JPG, PNG, WebP File Size Free',
      description: 'Compress images online without losing quality. Reduce image file size to 20KB, 50KB, 100KB, 200KB easily in your browser.',
      keywords: ['compress image', 'reduce image size', 'compress jpg to 100kb', 'photo compressor', 'image optimizer online'],
      canonicalSlug: 'compress'
    }
  },

  // 3. Crop Image
  {
    id: 'crop-image',
    slug: 'crop',
    name: 'Crop Image',
    shortDescription: 'Crop photos with aspect ratio presets (1:1, 16:9, 4:3, Circle) & freeform selection.',
    fullDescription: 'Precision interactive image cropper. Easily trim unwanted borders, frame subjects with standard aspect ratios (Square, Story, Golden Ratio), or create circular profile avatars.',
    category: 'crop',
    processingType: 'browser',
    icon: 'Crop',
    route: '/crop',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: [
      'Interactive dragging, resizing handles with live pixel dimension badges',
      'Preset aspect ratios: 1:1 (Square), 16:9 (Widescreen), 4:3, 3:2, 9:16 (Story)',
      'Circle avatar crop mode with transparent background output',
      'Integrated rotate (90°, 180°, 270°) and horizontal/vertical flip',
      'Rule of thirds visual grid overlay'
    ],
    howToSteps: [
      { step: 1, title: 'Upload Photo', description: 'Drop your picture onto the cropper canvas.' },
      { step: 2, title: 'Adjust Crop Box', description: 'Drag the handles or pick an aspect ratio preset like 1:1 or 16:9.' },
      { step: 3, title: 'Apply & Save', description: 'Click Crop to render and export in your preferred format.' }
    ],
    faqs: [
      { question: 'Can I crop into a circle for profile pictures?', answer: 'Yes! Choose the "Circle Crop" preset to export a perfectly rounded PNG with transparent alpha background.' }
    ],
    seo: {
      title: 'Crop Image Online - Free Photo Cropper with Aspect Ratios',
      description: 'Crop images easily with customizable aspect ratios (1:1, 16:9, 4:3) and circle avatar crop. Free in-browser tool.',
      keywords: ['crop image', 'online photo cropper', 'square crop image', 'circle crop photo', 'crop picture online'],
      canonicalSlug: 'crop'
    }
  },

  // 4. Format Converter
  {
    id: 'convert-image',
    slug: 'convert',
    name: 'Image Converter',
    shortDescription: 'Convert between JPG, PNG, WEBP, GIF, and ICO formats instantly.',
    fullDescription: 'Universal image format transcoder. Convert single or batch images between modern WebP, crisp transparent PNG, standard JPG, animated GIF frames, and favicon ICO.',
    category: 'convert',
    processingType: 'browser',
    icon: 'RefreshCw',
    route: '/convert',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/x-icon', 'image/svg+xml'],
    maxFileSizeMB: 50,
    isPopular: true,
    features: [
      'Convert JPG to PNG, PNG to JPG, WebP to JPG, PNG to WebP, and more',
      'Custom background color selector when converting transparent PNGs to JPG',
      'Export multi-resolution Favicon (.ICO) files',
      'Batch conversion with one-click Zip download',
      'Lossless quality or adjustable compression balance'
    ],
    howToSteps: [
      { step: 1, title: 'Add Files', description: 'Upload one or multiple images you want to transform.' },
      { step: 2, title: 'Select Target Format', description: 'Pick PNG, JPG, WebP, GIF, or ICO from the format menu.' },
      { step: 3, title: 'Export', description: 'Convert instantly and download single files or a packed ZIP.' }
    ],
    faqs: [
      { question: 'Why should I convert my JPGs to WebP?', answer: 'WebP provides 25% to 35% smaller file sizes than JPEG at equivalent visual quality, speeding up webpage load times significantly.' },
      { question: 'What happens to transparent backgrounds when converting to JPG?', answer: 'Since JPEG does not support alpha transparency, you can choose a clean background fill color (white, black, or custom).' }
    ],
    seo: {
      title: 'Image Converter - Convert JPG, PNG, WEBP, GIF & ICO Online',
      description: 'Convert image files online for free. Fast batch converter for PNG to JPG, JPG to WebP, WebP to PNG, and ICO icon generator.',
      keywords: ['convert image', 'png to jpg', 'jpg to webp', 'image format converter', 'webp to png', 'convert photo to icon'],
      canonicalSlug: 'convert'
    }
  },

  // 5. Photo Effects & Filters
  {
    id: 'photo-effects',
    slug: 'effects',
    name: 'Photo Effects & Filters',
    shortDescription: 'Adjust brightness, contrast, blur, sharpen, vintage, sepia, and pixelate.',
    fullDescription: 'Full-featured creative photo filter workshop. Fine-tune image exposure, vibrancy, blur strength, unsharp mask sharpening, pixel art censor, vignette, and film grain in real time.',
    category: 'effects',
    processingType: 'browser',
    icon: 'Wand2',
    route: '/effects',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 40,
    isPopular: false,
    features: [
      'Interactive sliders: Brightness, Contrast, Saturation, and Vignette',
      'Creative filters: Vintage, Sepia, Black & White, Grayscale, Invert',
      'Censor & Security: Pixelate and Gaussian Blur',
      'Instant real-time canvas rendering with side-by-side comparison',
      'Reset individual controls or apply multi-filter recipes'
    ],
    howToSteps: [
      { step: 1, title: 'Upload Image', description: 'Select any photo to start editing.' },
      { step: 2, title: 'Fine-tune Filters', description: 'Drag the effect sliders or click one-tap aesthetic presets.' },
      { step: 3, title: 'Download Masterpiece', description: 'Save your polished high-resolution image.' }
    ],
    faqs: [
      { question: 'Can I use this to blur sensitive information or faces?', answer: 'Yes! Increase the Blur or Pixelate sliders and export the censored version.' }
    ],
    seo: {
      title: 'Photo Effects & Filters Online - Blur, Grayscale, Vintage, Pixelate',
      description: 'Free online photo effects and filters. Adjust brightness, contrast, add vintage tones, blur or pixelate images instantly.',
      keywords: ['photo effects', 'image filters online', 'blur image', 'grayscale photo', 'pixelate picture', 'vintage photo filter'],
      canonicalSlug: 'effects'
    }
  },

  // 6. Border & Frame Maker
  {
    id: 'border-maker',
    slug: 'border',
    name: 'Border & Frame Maker',
    shortDescription: 'Add aesthetic borders, vintage Polaroid frames, and rounded corners.',
    fullDescription: 'Style your photos with elegant borders, custom color frames, modern rounded corners, inner matting, and nostalgic Polaroid-style white cards with personalized captions.',
    category: 'edit',
    processingType: 'browser',
    icon: 'Square',
    route: '/border',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 40,
    features: [
      'Presets: Classic Solid, Polaroid with Caption, Golden Luxury, Double Frame, Minimalist Mat',
      'Custom border width, border color, and outer corner radius',
      'Customizable Polaroid bottom text with font family and size controls',
      'Real-time dynamic canvas rendering'
    ],
    howToSteps: [
      { step: 1, title: 'Upload Picture', description: 'Upload the photo you want to frame.' },
      { step: 2, title: 'Customize Frame', description: 'Select a style (Polaroid, Classic, Minimal) and adjust color and width.' },
      { step: 3, title: 'Export', description: 'Download your bordered creation ready for Instagram or printing.' }
    ],
    faqs: [
      { question: 'Can I add handwritten captions to my Polaroid frame?', answer: 'Yes, type your text in the caption field, and choose between serif, sans-serif, and handwritten font styles.' }
    ],
    seo: {
      title: 'Border & Frame Maker Online - Polaroid, Rounded Corners, Frames',
      description: 'Add beautiful borders, Polaroid frames with custom captions, and rounded corners to your photos online for free.',
      keywords: ['photo border maker', 'polaroid frame online', 'add border to photo', 'rounded corner image', 'picture frame tool'],
      canonicalSlug: 'border'
    }
  },

  // 7. Watermark & Logo Adder
  {
    id: 'watermark-image',
    slug: 'watermark',
    name: 'Watermark Photo',
    shortDescription: 'Protect your images by stamping custom text or logo watermarks.',
    fullDescription: 'Add copyright protection to your photography. Stamp transparent text, custom copyright symbols (©), or PNG logo overlays with opacity controls, angle rotation, and full-screen tile patterns.',
    category: 'edit',
    processingType: 'browser',
    icon: 'Stamp',
    route: '/watermark',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 40,
    features: [
      'Text watermarks with custom fonts, colors, transparency, and angles',
      'Image/Logo overlay with drag positioning and scale adjustment',
      'Full-frame diagonal repeat tile pattern for anti-theft proofing',
      'Position presets: Center, Bottom-Right, Top-Left, Diagonal Grid'
    ],
    howToSteps: [
      { step: 1, title: 'Upload Image', description: 'Upload your original artwork or photograph.' },
      { step: 2, title: 'Add Watermark', description: 'Type your brand name or upload a transparent PNG logo.' },
      { step: 3, title: 'Adjust & Save', description: 'Set opacity and position, then export your protected image.' }
    ],
    faqs: [
      { question: 'Will the watermark reduce image clarity?', answer: 'No, the watermark is rendered onto a pristine full-resolution canvas copy of your original photo.' }
    ],
    seo: {
      title: 'Watermark Photos Online - Add Text or Logo Watermark Free',
      description: 'Add text or logo watermarks to protect your photos online. Adjust opacity, position, and create anti-theft tiled patterns.',
      keywords: ['watermark photos', 'add watermark to image', 'logo watermark tool', 'copyright stamp on photo'],
      canonicalSlug: 'watermark'
    }
  },

  // 8. Passport & ID Photo Maker
  {
    id: 'passport-photo-maker',
    slug: 'passport-photo',
    name: 'Passport & ID Photo Maker',
    shortDescription: 'Generate official 2x2 in & 35x45 mm passport photos with printable sheets.',
    fullDescription: 'Create compliant biometric passport, visa, and ID photos. Automatically crop to international standard dimensions (US 2x2 inch, Schengen 35x45 mm, UK, India) and arrange onto printable 4x6 inch or A4 sheets.',
    category: 'passport',
    processingType: 'browser',
    icon: 'UserSquare2',
    route: '/passport-photo',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 40,
    isPopular: true,
    features: [
      'Official presets: US Passport / Visa (2x2 in), Schengen EU / UK (35x45 mm), India, Australia',
      'Background color replacer: Official Clean White, Sky Blue, Red, or Neutral Grey',
      'Printable Grid Generator: Tile 4, 6, or 8 photos onto a 4x6" or A4 sheet ready for printing at pharmacy/local print shops',
      'Biometric face alignment guide overlay'
    ],
    howToSteps: [
      { step: 1, title: 'Upload Portrait', description: 'Upload a clear, front-facing portrait photo.' },
      { step: 2, title: 'Select Country Preset', description: 'Pick your country specification and desired background color.' },
      { step: 3, title: 'Generate Print Sheet', description: 'Download the single photo or the multi-photo printable 4x6 sheet.' }
    ],
    faqs: [
      { question: 'What is the standard size for a US passport photo?', answer: 'US passport photos must be exactly 2 x 2 inches (51 x 51 mm) with a plain white or off-white background.' },
      { question: 'Can I print this at CVS, Walgreens, or Walmart?', answer: 'Yes! Download the 4x6 inch printable sheet preset and print it as a standard 4x6 photo for just a few cents.' }
    ],
    seo: {
      title: 'Free Passport Photo Maker Online - 2x2 Inch & 35x45mm Printable Sheets',
      description: 'Create compliant US, UK, and Schengen passport and visa photos online. Automatic sizing, background replacement, and 4x6 printable grid.',
      keywords: ['passport photo maker', '2x2 photo online', 'free passport photo generator', '35x45 mm photo maker', 'print passport photos at home'],
      canonicalSlug: 'passport-photo'
    }
  },

  // 9. Social Media Resizer
  {
    id: 'social-resizer',
    slug: 'social-media',
    name: 'Social Media Resizer',
    shortDescription: 'Crop & fit images for Instagram, YouTube, TikTok, Facebook, & X/Twitter.',
    fullDescription: 'Instant multi-platform social media graphic formatter. Convert any image into Instagram Posts, Stories, Reels covers, YouTube Thumbnails, Banners, LinkedIn banners, and Twitter headers with smart blur-fill backgrounds.',
    category: 'social',
    processingType: 'browser',
    icon: 'Share2',
    route: '/social-media',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 40,
    isPopular: true,
    features: [
      'Complete dimension library for Instagram (1080x1080, 1080x1350, 1080x1920), YouTube (1280x720, 2560x1440), TikTok, Facebook, Twitter, and LinkedIn',
      'Smart Fit options: Cover Crop, Contain with Color Pad, or Aesthetic Blurred Background Fill',
      'Live social mockup card preview'
    ],
    howToSteps: [
      { step: 1, title: 'Upload Graphic', description: 'Select your photo or banner artwork.' },
      { step: 2, title: 'Pick Platform & Preset', description: 'Choose Instagram Story, YouTube Thumbnail, TikTok, etc.' },
      { step: 3, title: 'Select Fit & Download', description: 'Pick Blurred Background or Solid Pad, then download.' }
    ],
    faqs: [
      { question: 'How does blur-fill background work?', answer: 'Blur-fill expands your original photo behind the main image and applies a heavy Gaussian blur, so non-standard aspect ratios fit social platforms without harsh black bars.' }
    ],
    seo: {
      title: 'Social Media Image Resizer - Instagram, YouTube, TikTok, Facebook',
      description: 'Resize and fit photos for Instagram posts, stories, YouTube thumbnails, Twitter headers, and TikTok with smart blur margins.',
      keywords: ['social media resizer', 'instagram photo resizer', 'youtube thumbnail size', 'fit image to instagram story'],
      canonicalSlug: 'social-media'
    }
  },

  // 10. Metadata Viewer & Stripper
  {
    id: 'metadata-tool',
    slug: 'metadata',
    name: 'Metadata Viewer & Stripper',
    shortDescription: 'Inspect hidden EXIF camera details & wipe private GPS/device tags.',
    fullDescription: 'Privacy-focused EXIF metadata tool. View technical camera exposure, lens specs, ISO, timestamp, and location tags, or wipe all metadata with 1-click before sharing online.',
    category: 'metadata',
    processingType: 'browser',
    icon: 'Info',
    route: '/metadata',
    supportsBatch: true,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 50,
    features: [
      'Inspect camera model, ISO, focal length, aperture, dimensions, color profile',
      'GPS & Location safety warning indicator',
      '1-Click "Clean & Strip All Metadata" to protect personal privacy',
      '100% private in-browser analysis'
    ],
    howToSteps: [
      { step: 1, title: 'Upload Photo', description: 'Drop your camera or smartphone photo.' },
      { step: 2, title: 'Inspect Details', description: 'Read detailed camera and image metadata in clean tables.' },
      { step: 3, title: 'Strip & Save', description: 'Download a cleansed image with all personal EXIF tags permanently removed.' }
    ],
    faqs: [
      { question: 'Why should I remove EXIF metadata?', answer: 'Photos taken with smartphones often embed your exact GPS coordinates, home location, and camera serial numbers. Stripping them prevents privacy leaks.' }
    ],
    seo: {
      title: 'EXIF Metadata Viewer & Stripper - Remove GPS & Camera Tags Free',
      description: 'View hidden EXIF camera metadata and strip GPS location tags from your photos online to protect personal privacy.',
      keywords: ['exif viewer', 'remove exif data', 'strip metadata from photo', 'check photo gps online', 'clean image metadata'],
      canonicalSlug: 'metadata'
    }
  },

  // 11. Color Palette & Picker
  {
    id: 'color-picker',
    slug: 'color-picker',
    name: 'Image Color Palette Picker',
    shortDescription: 'Extract dominant color palettes & sample exact pixel HEX / RGB values.',
    fullDescription: 'Colorist and designer toolkit. Automatically extract harmonious dominant color palettes from any photograph or click anywhere with the loupe eyedropper to copy HEX, RGB, and HSL codes.',
    category: 'effects',
    processingType: 'browser',
    icon: 'Pipette',
    route: '/color-picker',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 0,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 40,
    features: [
      'Automatic 6-color dominant harmony palette extraction',
      'Interactive magnifier loupe eyedropper for pixel-perfect sampling',
      'One-click copy to clipboard for HEX, RGB, and HSL',
      'Export palette as JSON or CSS color swatches'
    ],
    howToSteps: [
      { step: 1, title: 'Upload Artwork', description: 'Upload any graphic, illustration, or photo.' },
      { step: 2, title: 'View Dominant Swatches', description: 'Browse the auto-extracted palette or click any pixel on canvas.' },
      { step: 3, title: 'Copy Color Codes', description: 'Click any swatch to copy HEX or RGB to clipboard.' }
    ],
    faqs: [
      { question: 'How accurate is the color sampling?', answer: 'Our canvas engine reads exact 32-bit RGBA pixel buffers directly for 100% mathematical fidelity.' }
    ],
    seo: {
      title: 'Image Color Picker & Palette Generator - Extract HEX & RGB from Photos',
      description: 'Extract dominant color palettes and pick exact HEX and RGB color values from any photo online for free.',
      keywords: ['image color picker', 'extract palette from image', 'hex color picker from photo', 'photo palette generator'],
      canonicalSlug: 'color-picker'
    }
  },

  // 12. AI Background Remover
  {
    id: 'ai-background-remover',
    slug: 'background-remover',
    name: 'AI Background Remover',
    shortDescription: 'Isolate subjects and erase backgrounds with pinpoint AI precision.',
    fullDescription: 'Smart AI background cutout studio. Detects people, products, animals, and vehicles to remove backgrounds cleanly with smooth anti-aliased alpha edges, ready for transparent export or custom colored backdrops.',
    category: 'ai',
    processingType: 'ai',
    icon: 'Sparkles',
    route: '/background-remover',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 5,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 30,
    isPopular: true,
    isAi: true,
    features: [
      'Precision subject detection for portraits, ecommerce products, and graphics',
      'Export with transparent alpha channel, solid white, studio gradient, or custom color',
      'Feather edge smoothing and subject border refinement',
      'Original vs Transparent Before/After split comparison'
    ],
    howToSteps: [
      { step: 1, title: 'Upload Photo', description: 'Upload a portrait, product shot, or animal photo.' },
      { step: 2, title: 'AI Extraction', description: 'Click Remove Background to isolate the foreground subject.' },
      { step: 3, title: 'Download Transparent PNG', description: 'Save the cut-out image in high resolution PNG or WebP.' }
    ],
    faqs: [
      { question: 'Does it work well with curly hair and fine edges?', answer: 'Yes! Our AI algorithm uses edge feathering and alpha matting to preserve fine hair and translucent fabrics.' }
    ],
    seo: {
      title: 'AI Background Remover - Erase Photo Backgrounds Online Free',
      description: 'Remove background from images automatically with AI. Create transparent PNGs for portraits, products, and graphics in seconds.',
      keywords: ['background remover', 'remove background ai', 'transparent png maker', 'cut out subject photo', 'erase photo background'],
      canonicalSlug: 'background-remover'
    }
  },

  // 14. AI Image Enhancer
  {
    id: 'ai-image-enhancer',
    slug: 'image-enhancer',
    name: 'AI Image Enhancer',
    shortDescription: 'Restore clarity, fix low-light underexposure, and denoise photos with AI.',
    fullDescription: 'Next-generation neural photo restoration. Enhance facial clarity, correct lighting balance, eliminate sensor noise, and reveal rich natural textures without artificial over-smoothing.',
    category: 'ai',
    processingType: 'ai',
    icon: 'Sparkle',
    route: '/image-enhancer',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 5,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 30,
    isPopular: true,
    isAi: true,
    features: [
      'Smart Auto Enhance, Portrait Clarity, Low-Light Exposure, and Denoising modes',
      'Preserves authentic skin textures and natural facial likeness',
      'Boosts dynamic contrast and vibrant color range',
      'Interactive side-by-side comparison slider'
    ],
    howToSteps: [
      { step: 1, title: 'Upload Low-Quality Photo', description: 'Upload blurry, dark, or noisy photos.' },
      { step: 2, title: 'Select Enhancement Mode', description: 'Pick Portrait, Auto, Low-Light, or Denoise.' },
      { step: 3, title: 'Enhance & Download', description: 'Preview the restored picture and download in crisp quality.' }
    ],
    faqs: [
      { question: 'Will this make faces look fake or plastic?', answer: 'No! Our enhancement model prioritizes authentic biometric structure, avoiding plastic skin artifacts.' }
    ],
    seo: {
      title: 'AI Image Enhancer - Restore Photo Quality & Fix Lighting Online',
      description: 'Enhance image quality online using AI. Fix underexposure, reduce photo noise, and restore portrait clarity with natural results.',
      keywords: ['ai image enhancer', 'enhance photo quality', 'fix blurry photo', 'photo clarifier online', 'denoise image ai'],
      canonicalSlug: 'image-enhancer'
    }
  },

  // 15. AI Image Upscaler (2x / 4x)
  {
    id: 'ai-image-upscaler',
    slug: 'image-upscaler',
    name: 'AI Image Upscaler (2x / 4x)',
    shortDescription: 'Increase image resolution up to 400% with generative super-resolution.',
    fullDescription: 'Neural super-resolution upscaler. Magnify low-res graphics, old photos, and digital art to 2x (200%) or 4x (400%) resolution with sharp edge reconstruction and zero pixelation.',
    category: 'ai',
    processingType: 'ai',
    icon: 'Maximize',
    route: '/image-upscaler',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 10,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 25,
    isPopular: true,
    isAi: true,
    features: [
      '2x (200%) and 4x (400%) neural upscaling',
      'Super-resolution edge reconstruction for text, anime, photos, and UI graphics',
      'Side-by-side zoomed comparison loupe',
      'Exports in high-fidelity PNG or WebP'
    ],
    howToSteps: [
      { step: 1, title: 'Upload Low-Res Image', description: 'Upload any small or pixelated picture.' },
      { step: 2, title: 'Choose 2x or 4x Scale', description: 'Select your target enlargement factor.' },
      { step: 3, title: 'Download Ultra-HD Result', description: 'Save your newly upscaled high-resolution image.' }
    ],
    faqs: [
      { question: 'How is AI upscaling different from regular resizing?', answer: 'Regular resizing simply stretches pixels, creating blur or jaggedness. AI super-resolution generates missing high-frequency micro-details.' }
    ],
    seo: {
      title: 'AI Image Upscaler - Upscale Photos 2x and 4x Online Free',
      description: 'Upscale low-resolution photos to 4K using AI super-resolution. Enlarge images 2x or 4x without losing quality or sharpness.',
      keywords: ['ai image upscaler', 'upscale photo to 4k', 'enlarge image without losing quality', 'super resolution ai online'],
      canonicalSlug: 'image-upscaler'
    }
  },

  // 16. OCR / Image to Text
  {
    id: 'ocr-image-to-text',
    slug: 'ocr',
    name: 'OCR / Image to Text',
    shortDescription: 'Extract editable text, receipts, documents & tables from photos and screenshots.',
    fullDescription: 'Intelligent Optical Character Recognition. Accurately detect and extract printed or handwritten text from screenshots, scanned PDFs, receipts, and book pages with line preservation, search, and one-click copy.',
    category: 'ocr',
    processingType: 'ai',
    icon: 'FileText',
    route: '/ocr',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 2,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 30,
    isPopular: true,
    isAi: true,
    features: [
      'Multi-language text recognition (English, Spanish, French, German, Japanese, Chinese, etc.)',
      'Preserves paragraph structure, bullet points, and column tables',
      'One-click Copy to Clipboard, Download as .TXT or .MD Markdown',
      'Built-in in-browser text search & highlighted word matching'
    ],
    howToSteps: [
      { step: 1, title: 'Upload Screenshot or Document', description: 'Drop any image containing text.' },
      { step: 2, title: 'Extract Characters', description: 'Click Extract Text to run OCR.' },
      { step: 3, title: 'Edit, Search & Copy', description: 'Copy the extracted text or save as a TXT file.' }
    ],
    faqs: [
      { question: 'Can it extract text from receipts and invoices?', answer: 'Yes! Our OCR engine detects line items, numbers, and structured table layouts with high confidence.' }
    ],
    seo: {
      title: 'OCR Image to Text - Extract Text from Photos & Screenshots Free',
      description: 'Free online OCR tool to extract text from images, receipts, and screenshots. Copy extracted text or download as TXT/Markdown.',
      keywords: ['ocr image to text', 'extract text from photo', 'picture to text converter', 'scan receipt to text online'],
      canonicalSlug: 'ocr'
    }
  },

  // 17. AI Object Remover & Eraser
  {
    id: 'ai-object-remover',
    slug: 'object-remover',
    name: 'AI Object Remover & Inpaint',
    shortDescription: 'Paint over unwanted objects, people, or text to erase them seamlessly.',
    fullDescription: 'Neural generative inpainting eraser. Paint with an adjustable brush over photobombers, power lines, watermarks, or blemishes, and let the AI reconstruct the background flawlessly.',
    category: 'ai',
    processingType: 'ai',
    icon: 'Eraser',
    route: '/object-remover',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 10,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 30,
    isAi: true,
    features: [
      'Interactive canvas mask brush with adjustable size and eraser mode',
      'Generative inpainting that seamlessly synthesizes natural background textures',
      'Side-by-side comparison slider and multiple regenerate tries'
    ],
    howToSteps: [
      { step: 1, title: 'Upload Photo', description: 'Select the photo with unwanted items.' },
      { step: 2, title: 'Brush Over Object', description: 'Use the red highlighter brush over people, text, or blemishes.' },
      { step: 3, title: 'Erase & Save', description: 'Click Erase Object and download the cleaned photo.' }
    ],
    faqs: [
      { question: 'How do I get the cleanest inpainting result?', answer: 'Paint slightly beyond the borders of the object to help the AI blend the surrounding texture smoothly.' }
    ],
    seo: {
      title: 'AI Object Remover - Erase Unwanted Objects from Photos Online',
      description: 'Erase unwanted objects, people, powerlines, and text from photos using AI inpainting. Clean photo retouching online.',
      keywords: ['object remover', 'erase object from photo', 'ai inpainting online', 'remove person from background photo'],
      canonicalSlug: 'object-remover'
    }
  },

  // 18. AI Photo Unblur
  {
    id: 'ai-unblur',
    slug: 'unblur',
    name: 'AI Photo Unblur',
    shortDescription: 'Sharpen out-of-focus shots and motion blur with deep deconvolution.',
    fullDescription: 'Deconvolution neural network unblur tool. Recovers crisp focal lines and edges from camera shake, rapid motion, or lens defocus without creating ringing artifacts.',
    category: 'ai',
    processingType: 'ai',
    icon: 'Focus',
    route: '/unblur',
    supportsBatch: false,
    requiresAuth: false,
    creditCost: 5,
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeMB: 30,
    isAi: true,
    features: [
      'Modes: General Shake, Portrait Face Focus, Text & Document Unblur',
      'Multi-level intensity adjustment (Gentle, Standard, Deep Focus)',
      'Side-by-side interactive split preview'
    ],
    howToSteps: [
      { step: 1, title: 'Upload Blurry Image', description: 'Upload a picture affected by motion shake or slight defocus.' },
      { step: 2, title: 'Select Focus Mode', description: 'Choose General, Face, or Document mode.' },
      { step: 3, title: 'Unblur & Export', description: 'Download your recovered, sharp photo.' }
    ],
    faqs: [
      { question: 'Can it recover heavily ruined photos?', answer: 'Mild to moderate motion blur and soft focus can be recovered with high fidelity.' }
    ],
    seo: {
      title: 'AI Photo Unblur - Sharpen Blurry Photos & Motion Blur Online',
      description: 'Unblur photos online using AI deblurring technology. Fix motion blur and out-of-focus portraits and text documents.',
      keywords: ['unblur photo', 'ai photo unblur', 'fix blurry image', 'sharpen out of focus picture online'],
      canonicalSlug: 'unblur'
    }
  }
];

export const TOOL_CATEGORIES = [
  { id: 'all', name: 'All Tools', icon: 'Grid' },
  { id: 'ai', name: 'AI Super Tools', icon: 'Sparkles', badge: 'Popular' },
  { id: 'resize', name: 'Resize & Scale', icon: 'Scaling' },
  { id: 'compress', name: 'Compression', icon: 'Minimize2' },
  { id: 'crop', name: 'Crop & Cut', icon: 'Crop' },
  { id: 'convert', name: 'Format Converter', icon: 'RefreshCw' },
  { id: 'passport', name: 'Passport & ID', icon: 'UserSquare2' },
  { id: 'social', name: 'Social Media', icon: 'Share2' },
  { id: 'effects', name: 'Effects & Filters', icon: 'Wand2' },
  { id: 'edit', name: 'Borders & Watermark', icon: 'Stamp' },
  { id: 'ocr', name: 'OCR / Text', icon: 'FileText' },
  { id: 'metadata', name: 'Metadata & EXIF', icon: 'Info' },
  { id: 'youtube', name: 'YouTube Tools', icon: 'Video', badge: 'New' },
  { id: 'pdf', name: 'PDF Tools', icon: 'FileText', badge: 'Hot' }
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  const cleanSlug = slug.replace(/^\/+/, '');
  const found = TOOLS_REGISTRY.find(t => t.slug === cleanSlug || t.id === cleanSlug || t.route === `/${cleanSlug}`);
  if (found) return found;
  const targetSizeTool = parseTargetSizeRoute(cleanSlug);
  if (targetSizeTool) return targetSizeTool;
  return parseConverterRoute(cleanSlug);
}

export function getToolByRoute(route: string): ToolDefinition | undefined {
  const clean = route.replace(/\/+$/, '') || '/';
  const found = TOOLS_REGISTRY.find(t => t.route === clean || `/${t.slug}` === clean || `/${t.id}` === clean);
  if (found) return found;
  const targetSizeTool = parseTargetSizeRoute(clean);
  if (targetSizeTool) return targetSizeTool;
  return parseConverterRoute(clean);
}

export function getToolsByCategory(category: string): ToolDefinition[] {
  if (category === 'all') return TOOLS_REGISTRY;
  return TOOLS_REGISTRY.filter(t => t.category === category || (category === 'ai' && t.isAi));
}

export const CATEGORIES_METADATA = TOOL_CATEGORIES;
export const ALL_TOOLS = TOOLS_REGISTRY;

