import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { parseTargetSizeRoute } from '../config/targetSizeTools';
import { parseConverterRoute } from '../config/converterTools';
import { parseSocialMockupRoute } from '../config/socialMockup/sceneRegistry';
import { ToolDefinition } from '../types';

const STORAGE_KEY = 'aetherpix_dynamic_tools_v2';
const SYNC_TIMESTAMP_KEY = 'aetherpix_tools_last_synced';

import { seedAllToolsToFirestore } from './FirestoreSeederService';

export class DynamicToolService {
  private static toolsCache: ToolDefinition[] = [];
  private static isInitialized = false;
  private static listeners: Set<(tools: ToolDefinition[]) => void> = new Set();
  private static unsubscribeFirestore: Unsubscribe | null = null;

  /**
   * Initializes tool catalog from localStorage cache and live Firebase Firestore.
   */
  public static init(): ToolDefinition[] {
    if (this.isInitialized && this.toolsCache.length > 0) {
      return this.toolsCache;
    }

    // Load from localStorage cache (last known Firestore state)
    if (typeof localStorage !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as ToolDefinition[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.toolsCache = parsed;
          }
        }
      } catch (e) {
        console.warn('Error reading tools from cache', e);
      }
    }

    this.isInitialized = true;

    // Start live Firestore listener in browser environment
    if (typeof window !== 'undefined' && !this.unsubscribeFirestore) {
      this.startFirestoreListener();
    }

    return this.toolsCache;
  }

  /**
   * Realtime Firestore listener — Firebase Firestore is the single source of truth.
   */
  private static startFirestoreListener() {
    try {
      const toolsCol = collection(db, 'tools');
      this.unsubscribeFirestore = onSnapshot(
        toolsCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreTools: (ToolDefinition & { isDeleted?: boolean })[] = snapshot.docs.map((d) => d.data() as any);
            const toolMap = new Map<string, ToolDefinition>();

            firestoreTools.forEach((t) => {
              if (!t.isDeleted) {
                toolMap.set(t.id, t);
              }
            });

            const tools = Array.from(toolMap.values());
            this.toolsCache = tools;
            this.saveToStorage(tools);
            this.notifyListeners();

            // Auto-sync missing catalog tools to Firebase Firestore if count is under 100
            if (snapshot.docs.length < 100) {
              seedAllToolsToFirestore().catch((err) => console.warn('Firestore seeding error:', err));
            }
          } else {
            // Auto-seed Firestore if collection is empty
            seedAllToolsToFirestore().catch((err) => console.warn('Firestore seeding error:', err));
          }
        },
        (error) => {
          console.warn('Firestore tools listener error:', error);
        }
      );
    } catch (e) {
      console.warn('Could not establish Firestore tools listener', e);
    }
  }



  private static saveToStorage(tools: ToolDefinition[]) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
      localStorage.setItem(SYNC_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
      console.warn('Error saving tools to localStorage', e);
    }
  }

  private static notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.toolsCache);
      } catch (e) {
        console.error('Error in tool change listener', e);
      }
    });
  }

  /**
   * Subscribe to dynamic tool updates.
   */
  public static subscribe(callback: (tools: ToolDefinition[]) => void): () => void {
    this.init();
    this.listeners.add(callback);
    callback(this.toolsCache);

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Returns all dynamic tools.
   */
  public static getAllTools(): ToolDefinition[] {
    return this.init();
  }

  /**
   * Look up a tool by slug or route dynamically.
   */
  public static getToolBySlug(slug: string): ToolDefinition | undefined {
    const tools = this.init();
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
    const segments = cleanSlug.split('/');
    const lastSegment = segments[segments.length - 1];

    // 1. Direct match on full cleanSlug (e.g., category/tool or tool)
    const directMatch = tools.find(
      (t) => t.slug === cleanSlug || t.id === cleanSlug || t.route === `/${cleanSlug}`
    );
    if (directMatch) return directMatch;

    // 2. Match by last segment (tool slug/id)
    const segmentMatch = tools.find(
      (t) => t.slug === lastSegment || t.id === lastSegment || t.route === `/${lastSegment}`
    );
    if (segmentMatch) return segmentMatch;

    // 3. Dynamic virtual generator fallbacks (social mockups, target sizes & format converters)
    const socialMockupTool = parseSocialMockupRoute(cleanSlug) || parseSocialMockupRoute(lastSegment);
    if (socialMockupTool) return socialMockupTool;

    const targetSizeTool = parseTargetSizeRoute(cleanSlug) || parseTargetSizeRoute(lastSegment);
    if (targetSizeTool) return targetSizeTool;

    return parseConverterRoute(cleanSlug) || parseConverterRoute(lastSegment);
  }

  /**
   * Look up a tool by its exact route or hierarchical category route.
   */
  public static getToolByRoute(route: string): ToolDefinition | undefined {
    const clean = route.replace(/^\/+|\/+$/g, '');
    return this.getToolBySlug(clean);
  }

  /**
   * Look up a tool by its unique ID.
   */
  public static getToolById(id: string): ToolDefinition | undefined {
    const tools = this.init();
    return tools.find((t) => t.id === id);
  }

  /**
   * Filter tools by category.
   */
  public static getToolsByCategory(category: string): ToolDefinition[] {
    const tools = this.init();
    if (category === 'all') return tools;
    return tools.filter((t) => t.category === category || (category === 'ai' && t.isAi));
  }

  /**
   * Save or update a tool in Firestore & local cache (Admin action).
   */
  public static async saveTool(tool: ToolDefinition): Promise<ToolDefinition> {
    this.init();
    const cleanTool = { ...tool, isDeleted: false };
    const existingIndex = this.toolsCache.findIndex((t) => t.id === tool.id);

    if (existingIndex >= 0) {
      this.toolsCache[existingIndex] = { ...this.toolsCache[existingIndex], ...cleanTool };
    } else {
      this.toolsCache.unshift(cleanTool);
    }

    this.saveToStorage(this.toolsCache);
    this.notifyListeners();

    // Persist to Firestore
    try {
      await setDoc(doc(db, 'tools', tool.id), cleanTool, { merge: true });
    } catch (e) {
      console.error('Failed to save tool to Firestore', e);
      throw e;
    }

    return cleanTool;
  }

  /**
   * Update tool configuration (tier access, maintenance mode, etc.).
   */
  public static async updateToolConfig(
    toolId: string,
    updates: Partial<ToolDefinition>
  ): Promise<ToolDefinition | undefined> {
    this.init();
    const tool = this.toolsCache.find((t) => t.id === toolId);
    if (!tool) return undefined;

    const updated = { ...tool, ...updates };
    return this.saveTool(updated);
  }

  /**
   * Delete a tool from Firestore & local cache (Admin action).
   */
  public static async deleteTool(toolId: string): Promise<boolean> {
    this.init();
    const prevLen = this.toolsCache.length;
    this.toolsCache = this.toolsCache.filter((t) => t.id !== toolId);
    this.saveToStorage(this.toolsCache);
    this.notifyListeners();

    try {
      // All tools are Firestore-managed: hard delete the document
      await deleteDoc(doc(db, 'tools', toolId));
    } catch (e) {
      console.warn('Failed to delete tool from Firestore', e);
      throw e;
    }

    return this.toolsCache.length < prevLen;
  }

  /**
   * Batch-writes an array of tools to Firestore (used by admin import).
   */
  public static async syncToolsToFirestore(toolsToSync: ToolDefinition[]): Promise<number> {
    this.init();
    try {
      const chunkSize = 25;
      for (let i = 0; i < toolsToSync.length; i += chunkSize) {
        const chunk = toolsToSync.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach((tool) => {
          const docRef = doc(db, 'tools', tool.id);
          batch.set(docRef, { ...tool, isDeleted: false }, { merge: true });
        });
        await batch.commit();
      }
      await this.refreshFromFirestore();
      return toolsToSync.length;
    } catch (e) {
      console.error('Error syncing tools to Firestore', e);
      throw e;
    }
  }

  /**
   * Manually force a refresh from the Firestore tools collection.
   */
  public static async refreshFromFirestore(): Promise<ToolDefinition[]> {
    this.init();
    try {
      const snap = await getDocs(collection(db, 'tools'));
      if (!snap.empty) {
        const firestoreTools: (ToolDefinition & { isDeleted?: boolean })[] = snap.docs.map((d) => d.data() as any);
        const toolMap = new Map<string, ToolDefinition>();

        firestoreTools.forEach((t) => {
          if (!t.isDeleted) {
            toolMap.set(t.id, t);
          }
        });
        const tools = Array.from(toolMap.values());
        this.toolsCache = tools;
        this.saveToStorage(tools);
        this.notifyListeners();
      }
    } catch (e) {
      console.error('Error refreshing tools from Firestore', e);
      throw e;
    }
    return this.toolsCache;
  }
}

export const PRIMARY_STANDALONE_TOOLS: ToolDefinition[] = [
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
    id: 'image-watermark',
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
    id: 'image-border-generator',
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
    id: 'image-effects-filters',
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
  {
    id: 'image-metadata-viewer',
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
    id: 'youtube-timestamp-generator',
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
    id: 'youtube-embed-generator',
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
  }
];
