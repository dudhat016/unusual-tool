import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { CategorySeoEntry } from '../types/seo';

const STORAGE_KEY = 'aetherpix_categories_cache_v1';

export class DynamicCategoryService {
  private static categoriesCache: CategorySeoEntry[] = [];
  private static isInitialized = false;
  private static unsubscribeFirestore: Unsubscribe | null = null;
  private static listeners: Set<(categories: CategorySeoEntry[]) => void> = new Set();

  public static init(): CategorySeoEntry[] {
    if (this.isInitialized && this.categoriesCache.length > 0) {
      return this.categoriesCache;
    }

    // Load from localStorage cache (last known Firestore state)
    if (typeof localStorage !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          this.categoriesCache = JSON.parse(cached);
        }
      } catch (e) {
        console.warn('Error reading categories from cache', e);
      }
    }

    this.isInitialized = true;

    if (typeof window !== 'undefined' && !this.unsubscribeFirestore) {
      this.startFirestoreListener();
    }

    return this.categoriesCache;
  }

  private static startFirestoreListener() {
    try {
      const col = collection(db, 'categories');
      this.unsubscribeFirestore = onSnapshot(
        col,
        (snapshot) => {
          if (!snapshot.empty) {
            const catMap = new Map<string, CategorySeoEntry>();
            snapshot.docs.forEach((d) => {
              catMap.set(d.id, d.data() as CategorySeoEntry);
            });
            this.categoriesCache = Array.from(catMap.values());
            this.saveToStorage(this.categoriesCache);
            this.notifyListeners();
          }
          // If empty — keep localStorage cache, no static fallback
        },
        (error) => {
          console.warn('Firestore categories subscription notice:', error);
        }
      );
    } catch (e) {
      console.warn('Could not start Firestore categories listener', e);
    }
  }


  private static saveToStorage(categories: CategorySeoEntry[]) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.warn('Error saving categories to localStorage', e);
    }
  }

  private static notifyListeners() {
    this.listeners.forEach((l) => {
      try {
        l(this.categoriesCache);
      } catch (e) {
        console.warn('Listener error in categories', e);
      }
    });
  }

  public static subscribe(callback: (categories: CategorySeoEntry[]) => void): () => void {
    this.init();
    this.listeners.add(callback);
    callback(this.categoriesCache);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public static getAllCategories(): CategorySeoEntry[] {
    if (!this.isInitialized || this.categoriesCache.length === 0) {
      this.init();
    }
    return this.categoriesCache;
  }

  public static getCategoryBySlug(slug: string): CategorySeoEntry | undefined {
    const categories = this.getAllCategories();
    const clean = slug.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (clean.includes('/') && !clean.startsWith('category/')) {
      return undefined;
    }
    if (clean === 'tools' || clean === 'all-tools' || clean === 'all' || clean === 'tool') {
      return categories.find((c) => c.id === 'image-tools') || categories[0];
    }

    const shortCategoryMap: Record<string, string> = {
      'resize': 'image-resizer-tools',
      'resize-image-tools': 'image-resizer-tools',
      'resize-tools': 'image-resizer-tools',
      'image-resize-tools': 'image-resizer-tools',
      'compress': 'image-compressor-tools',
      'compress-image-tools': 'image-compressor-tools',
      'compress-tools': 'image-compressor-tools',
      'convert': 'image-converter-tools',
      'convert-image-tools': 'image-converter-tools',
      'convert-tools': 'image-converter-tools',
      'edit': 'image-editing-tools',
      'editing': 'image-editing-tools',
      'image-edit-tools': 'image-editing-tools',
      'ai': 'ai-image-tools',
      'ai-tools': 'ai-image-tools',
      'ai-image-tools': 'ai-image-tools',
      'youtube': 'youtube-tools',
      'youtube-tools': 'youtube-tools',
      'pdf': 'pdf-tools',
      'pdf-tools': 'pdf-tools',
      'developer': 'developer-tools',
      'developer-tools': 'developer-tools',
      'dev-tools': 'developer-tools',
      'metadata': 'developer-tools',
      'metadata-tools': 'developer-tools',
    };

    const mappedId = shortCategoryMap[clean];
    if (mappedId) {
      const found = categories.find((c) => c.id === mappedId || c.slug === mappedId);
      if (found) return found;
    }

    const matched = categories.find(
      (c) =>
        c.slug.toLowerCase() === clean ||
        c.id.toLowerCase() === clean ||
        c.slug.toLowerCase() === `${clean}-tools` ||
        c.slug.toLowerCase() === `image-${clean}-tools` ||
        c.id.toLowerCase() === `image-${clean}-tools`
    );
    if (matched) return matched;

    const targetId = mappedId || (clean.endsWith('-tools') ? clean : `${clean}-tools`);
    const synthesizedDefaults: Record<string, CategorySeoEntry> = {
      'pdf-tools': {
        id: 'pdf-tools',
        slug: 'pdf-tools',
        name: 'PDF Tools Hub',
        h1: 'Free Online PDF Converter & Document Tools',
        title: 'PDF Tools Online - Merge, Split, Compress & Convert PDF Files',
        metaDescription: 'Free online PDF utility suite. Convert, merge, split, compress, protect, unlock, and OCR PDF documents with 100% in-browser privacy.',
        description: 'Free online PDF utility suite. Convert, merge, split, compress, protect, unlock, and OCR PDF documents with 100% in-browser privacy.',
        quickAnswer: 'Use our free PDF tools to convert, merge, split, and compress PDF documents privately in your browser.',
        primaryKeyword: 'pdf tools online',
        secondaryKeywords: ['merge pdf', 'compress pdf', 'convert pdf', 'split pdf'],
        toolSlugs: ['images-to-pdf', 'merge-pdf', 'split-pdf', 'compress-pdf'],
        keyWorkflows: ['Convert images to PDF', 'Merge multiple PDFs into one document', 'Compress PDF file size'],
        faq: [
          { question: 'Are PDF tools free to use?', answer: 'Yes, 100% free with zero file uploads to external servers.' }
        ],
        indexable: true,
        matchingCategories: ['pdf', 'pdf-tools', 'pdf-compression'],
      },
      'youtube-tools': {
        id: 'youtube-tools',
        slug: 'youtube-tools',
        name: 'YouTube Creator Tools',
        h1: 'Free YouTube Creator Utilities & Suite',
        title: 'YouTube Creator Tools - Thumbnail Downloader & Embed Generator',
        metaDescription: 'Essential utilities for YouTube creators. Download HD thumbnails, generate timestamp links, create embed codes, and extract tags.',
        description: 'Essential utilities for YouTube creators. Download HD thumbnails, generate timestamp links, create embed codes, and extract tags.',
        quickAnswer: 'Download YouTube thumbnails, generate responsive embed codes, and extract tags instantly.',
        primaryKeyword: 'youtube tools online',
        secondaryKeywords: ['youtube thumbnail downloader', 'youtube embed generator', 'youtube tag extractor'],
        toolSlugs: ['youtube-thumbnail-downloader', 'youtube-embed-code-generator', 'youtube-tag-extractor'],
        keyWorkflows: ['Download HD 1280x720 thumbnail', 'Generate responsive iframe embed code', 'Extract video tags'],
        faq: [
          { question: 'Is registration required?', answer: 'No registration is required to use any YouTube creator tool.' }
        ],
        indexable: true,
        matchingCategories: ['youtube', 'youtube-tools'],
      },
      'image-resizer-tools': {
        id: 'image-resizer-tools',
        slug: 'resize-image-tools',
        name: 'Resize Image Tools',
        h1: 'Free Online Image Resizer & Aspect Ratio Tool',
        title: 'Image Resizer Tools - Scale Photos to Pixels, Percent & Social Media',
        metaDescription: 'Resize photos to exact pixel dimensions, aspect ratios, target KB file sizes, and official social media presets.',
        description: 'Resize photos to exact pixel dimensions, aspect ratios, target KB file sizes, and official social media presets.',
        quickAnswer: 'Resize image dimensions or target file sizes in your browser with zero quality loss.',
        primaryKeyword: 'resize image online',
        secondaryKeywords: ['resize image for instagram', 'resize image to 100kb', 'scale image pixels'],
        toolSlugs: ['resize-image', 'social-resizer', 'crop-image'],
        keyWorkflows: ['Resize image to target KB', 'Resize image for YouTube thumbnail', 'Crop photo to ratio'],
        faq: [
          { question: 'How do I resize an image?', answer: 'Upload your photo, set custom width/height or target KB, and download.' }
        ],
        indexable: true,
        matchingCategories: ['resize', 'crop', 'passport', 'social', 'image-resizer-tools', 'resize-image-tools'],
      },
      'image-compressor-tools': {
        id: 'image-compressor-tools',
        slug: 'image-compressor-tools',
        name: 'Image Compressor Tools',
        h1: 'Free Online Image Compressor & Optimizer',
        title: 'Image Compressor Tools - Reduce JPG, PNG, WebP & AVIF File Sizes',
        metaDescription: 'Compress photos to 20KB, 50KB, 100KB, 200KB, 500KB with custom quality and zero server uploads.',
        description: 'Compress photos to 20KB, 50KB, 100KB, 200KB, 500KB with custom quality and zero server uploads.',
        quickAnswer: 'Compress image file sizes in your browser using fast lossy or lossless compression.',
        primaryKeyword: 'image compressor online',
        secondaryKeywords: ['compress image to 50kb', 'compress jpg to 100kb', 'shrink png file size'],
        toolSlugs: ['compress-image', 'compress-jpg-to-100kb', 'compress-png-to-50kb'],
        keyWorkflows: ['Compress image to 20KB', 'Compress photo for online application form'],
        faq: [
          { question: 'Are my images stored on servers?', answer: 'No, all compression runs 100% locally in your web browser.' }
        ],
        indexable: true,
        matchingCategories: ['compress', 'image-compressor-tools', 'compress-image-tools'],
      },
      'image-converter-tools': {
        id: 'image-converter-tools',
        slug: 'image-converter-tools',
        name: 'Image Converter Tools',
        h1: 'Free Online Image Format Converter',
        title: 'Image Converter Tools - WEBP to JPG, PNG, HEIC & SVG Converter',
        metaDescription: 'Convert WebP to JPG, PNG to WebP, HEIC to JPG, SVG to PNG, AVIF to JPG online with zero quality loss.',
        description: 'Convert WebP to JPG, PNG to WebP, HEIC to JPG, SVG to PNG, AVIF to JPG online with zero quality loss.',
        quickAnswer: 'Convert between popular image formats instantly in your browser.',
        primaryKeyword: 'convert image format online',
        secondaryKeywords: ['convert webp to jpg', 'convert heic to png', 'convert png to webp'],
        toolSlugs: ['convert-webp-to-jpg', 'convert-heic-to-jpg', 'convert-png-to-webp'],
        keyWorkflows: ['Convert WEBP to JPG', 'Convert HEIC photo to PNG'],
        faq: [
          { question: 'Will converting reduce image quality?', answer: 'No, you can adjust quality sliders to preserve maximum visual fidelity.' }
        ],
        indexable: true,
        matchingCategories: ['convert', 'image-converter-tools', 'convert-image-tools'],
      },
      'ai-image-tools': {
        id: 'ai-image-tools',
        slug: 'ai-image-tools',
        name: 'AI Image Tools',
        h1: 'AI Photo Enhancer & Background Remover',
        title: 'AI Image Tools - Background Remover, Upscaler & Photo Unblur',
        metaDescription: 'Next-gen AI tools for background removal, resolution upscaling, image enhancement, and object removal.',
        description: 'Next-gen AI tools for background removal, resolution upscaling, image enhancement, and object removal.',
        quickAnswer: 'Remove backgrounds and upscale photos using web AI models.',
        primaryKeyword: 'ai image tools online',
        secondaryKeywords: ['ai background remover', 'ai image upscaler', 'unblur photo online'],
        toolSlugs: ['ai-background-remover', 'ai-image-upscaler', 'ai-unblur'],
        keyWorkflows: ['Remove photo background', 'Upscale low-resolution image'],
        faq: [
          { question: 'How do AI image tools work?', answer: 'Computer vision neural models detect objects and enhance pixels.' }
        ],
        indexable: true,
        matchingCategories: ['ai', 'ai-image-tools'],
      },
      'developer-tools': {
        id: 'developer-tools',
        slug: 'developer-tools',
        name: 'Developer Tools Hub',
        h1: 'Free Online Developer Image Utilities & OCR Tools',
        title: 'Developer Tools Online - OCR Text Extraction, EXIF Metadata & Inspection',
        metaDescription: 'Essential online image utilities for developers. Extract OCR text, inspect EXIF metadata tags, and view image specs with 100% in-browser privacy.',
        description: 'Essential online image utilities for developers. Extract OCR text, inspect EXIF metadata tags, and view image specs with 100% in-browser privacy.',
        quickAnswer: 'Extract editable text from images with OCR, inspect EXIF metadata, and extract color palettes directly in your browser.',
        primaryKeyword: 'developer tools online',
        secondaryKeywords: ['ocr image to text', 'exif metadata viewer', 'image metadata inspector'],
        toolSlugs: ['ocr-image-to-text', 'image-metadata-viewer', 'color-picker'],
        keyWorkflows: ['Extract text from images using in-browser OCR', 'Inspect camera EXIF metadata and GPS tags', 'Extract HEX/RGB color palettes from images'],
        faq: [
          { question: 'Are developer tools free to use?', answer: 'Yes, 100% free with zero file uploads to external servers.' },
          { question: 'Are files stored on servers?', answer: 'No, all OCR, metadata inspection, and color picking processes run 100% locally in your web browser.' }
        ],
        indexable: true,
        matchingCategories: ['developer', 'developer-tools', 'dev', 'ocr', 'metadata'],
      },
      'image-editing-tools': {
        id: 'image-editing-tools',
        slug: 'image-editing-tools',
        name: 'Creative Editing Suite',
        h1: 'Free Online Photo Editor, Crop, Watermark & Border Tools',
        title: 'Creative Photo Editing Tools - Crop, Watermark, Borders & Filters',
        metaDescription: 'Edit photos online. Crop images, add text & logo watermarks, design aesthetic frames, apply vintage filters, and make passport photos.',
        description: 'Edit photos online. Crop images, add text & logo watermarks, design aesthetic frames, apply vintage filters, and make passport photos.',
        quickAnswer: 'Crop photos, add custom watermarks, borders, and filters in your browser.',
        primaryKeyword: 'photo editing tools online',
        secondaryKeywords: ['crop image', 'image watermark', 'image border generator', 'passport photo maker'],
        toolSlugs: ['crop-image', 'passport-photo-maker', 'image-watermark', 'image-border-generator', 'image-effects-filters'],
        keyWorkflows: ['Crop photos to custom ratios', 'Add logo watermarks to photography', 'Apply aesthetic borders and frames'],
        faq: [
          { question: 'Are photo editing tools free?', answer: 'Yes, 100% free with in-browser privacy.' }
        ],
        indexable: true,
        matchingCategories: ['edit', 'editing', 'crop', 'effects', 'passport', 'image-editing-tools'],
      },
    };

    return synthesizedDefaults[targetId] || {
      id: targetId,
      slug: clean,
      name: `${clean.replace(/-/g, ' ').toUpperCase()} Hub`,
      h1: `${clean.replace(/-/g, ' ').toUpperCase()} Utility Hub`,
      title: `${clean.replace(/-/g, ' ')} Tools – Free Online`,
      metaDescription: `Explore all online utilities in the ${clean.replace(/-/g, ' ')} category. 100% free and private.`,
      description: `Explore all online utilities in the ${clean.replace(/-/g, ' ')} category. 100% free and private.`,
      quickAnswer: `Access online utilities for ${clean.replace(/-/g, ' ')}.`,
      primaryKeyword: `${clean.replace(/-/g, ' ')} online`,
      secondaryKeywords: [`free ${clean.replace(/-/g, ' ')}`],
      toolSlugs: [],
      keyWorkflows: [`Use ${clean.replace(/-/g, ' ')} utilities`],
      faq: [{ question: `Is ${clean} free?`, answer: 'Yes, 100% free.' }],
      indexable: true,
    };
  }

  public static async saveCategory(category: CategorySeoEntry): Promise<boolean> {
    try {
      const docRef = doc(db, 'categories', category.id);
      await setDoc(docRef, category, { merge: true });
      return true;
    } catch (e) {
      console.error('Failed to save category to Firestore', e);
      return false;
    }
  }
}
