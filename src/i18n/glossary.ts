import { TranslationGlossaryTerm } from './types';

export const TRANSLATION_GLOSSARY: TranslationGlossaryTerm[] = [
  {
    key: 'compress',
    en: 'Compress',
    definition: 'Reduce file byte size using lossy or lossless compression algorithms.',
  },
  {
    key: 'convert',
    en: 'Convert',
    definition: 'Transform a file from one container format to another (e.g. JPG to PNG).',
  },
  {
    key: 'resize',
    en: 'Resize',
    definition: 'Change visual pixel dimensions (width and height) or DPI scale.',
  },
  {
    key: 'crop',
    en: 'Crop',
    definition: 'Trim and isolate a rectangular bounding box from an image.',
  },
  {
    key: 'pdf',
    en: 'PDF',
    definition: 'Portable Document Format standard for page-based documents.',
  },
  {
    key: 'ocr',
    en: 'OCR',
    definition: 'Optical Character Recognition to extract editable text from images or scans.',
  },
  {
    key: 'watermark',
    en: 'Watermark',
    definition: 'Overlay text or logo branding onto images or PDF pages.',
  },
  {
    key: 'metadata',
    en: 'Metadata / EXIF',
    definition: 'Header information including camera data, GPS geolocation, and timestamps.',
  },
  {
    key: 'clientSide',
    en: 'Client-Side (In-Browser)',
    definition: 'Files are processed directly inside the user browser with zero cloud uploads.',
  },
  {
    key: 'batch',
    en: 'Batch Processing',
    definition: 'Simultaneously process multiple files in parallel queues.',
  },
];
