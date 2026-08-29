import { GuideArticleEntry } from '../types/seo';

export const GUIDES_REGISTRY: GuideArticleEntry[] = [
  {
    id: 'how-to-compress-an-image',
    slug: 'guides/how-to-compress-an-image',
    title: 'How to Compress an Image: Step-by-Step Optimization Guide',
    metaDescription: 'Learn how to compress JPG, PNG, and WebP images without losing visible quality. Reduce file size for websites, emails, and online applications.',
    h1: 'How to Compress an Image Without Losing Quality',
    category: 'Optimization Guides',
    readTime: '4 min read',
    publishedDate: '2026-01-15',
    updatedDate: '2026-08-20',
    author: {
      name: 'AetherPix Imaging Team',
      role: 'Digital Media Engineers'
    },
    primaryKeyword: 'how to compress an image',
    secondaryKeywords: ['compress image without losing quality', 'reduce image file size', 'online image compression tutorial', 'image optimizer'],
    relatedToolSlug: '/compress',
    quickAnswer: 'To compress an image, upload your photo to a reliable image compressor, choose between smart automatic compression or an exact target file size (such as 50KB or 100KB), apply the compression algorithm, and download the optimized file. Modern WebP and JPEG encoders can reduce file size by 60% to 85% while preserving human visual fidelity.',
    sections: [
      {
        heading: 'Understanding Lossless vs. Lossy Compression',
        content: 'Image compression falls into two primary categories depending on your visual and storage requirements:',
        bullets: [
          'Lossless Compression: Strips redundant metadata (EXIF camera tags, device profiles) and optimizes pixel Huffman encoding without discarding any image data. Best for screenshots, text graphics, and medical imagery.',
          'Lossy Compression: Intelligently simplifies color variations and frequencies that the human eye is least sensitive to. Delivers 50-80% file size savings and is standard for web photography.'
        ]
      },
      {
        heading: 'Step-by-Step: Compressing Photos in Your Browser',
        content: 'Follow this workflow to compress any picture quickly and safely:',
        bullets: [
          'Step 1: Open the AetherPix Image Compressor.',
          'Step 2: Drag and drop your JPG, PNG, or WebP photo into the workspace.',
          'Step 3: Select your desired compression level (Balanced 80%, Max Compression 60%, or enter a specific target like 50KB).',
          'Step 4: Review the live side-by-side Before/After preview to verify clarity.',
          'Step 5: Click Download to save your lightweight image.'
        ]
      },
      {
        heading: 'Choosing the Right Format for Web and Portals',
        content: 'Format selection directly impacts how well an image compresses. Use WebP for modern websites, JPEG for legacy compatibility and photography, and PNG when transparent alpha backgrounds are required.'
      }
    ],
    faq: [
      {
        question: 'How much can I compress an image without noticeable quality loss?',
        answer: 'For standard photographic JPEGs and WebP files, a quality setting between 75% and 85% typically reduces file size by 65% to 75% without perceptible degradation on high-density displays.'
      },
      {
        question: 'Are my images stored on your servers when compressing?',
        answer: 'No. AetherPix executes image compression directly inside your web browser using HTML5 Canvas and WebAssembly algorithms. Your photos never leave your device.'
      }
    ],
    indexable: true
  },
  {
    id: 'how-to-convert-webp-to-png',
    slug: 'guides/how-to-convert-webp-to-png',
    title: 'How to Convert WebP to PNG: Transparent & Lossless Guide',
    metaDescription: 'Step-by-step tutorial on converting Google WebP images to standard PNG format. Preserve alpha transparency and fix software compatibility issues.',
    h1: 'How to Convert WebP to PNG Images',
    category: 'Format Guides',
    readTime: '3 min read',
    publishedDate: '2026-02-10',
    updatedDate: '2026-08-22',
    author: {
      name: 'AetherPix Imaging Team',
      role: 'Digital Media Engineers'
    },
    primaryKeyword: 'how to convert webp to png',
    secondaryKeywords: ['convert webp to png', 'webp to png transparent', 'turn webp into png', 'open webp in photoshop'],
    relatedToolSlug: '/convert/webp-to-png',
    quickAnswer: 'To convert a WebP file to PNG, drop your WebP image into a dedicated converter, select PNG as the target format, ensure alpha transparency retention is enabled, and click Convert. The converter decodes the WebP pixel buffer and re-encodes it as a universal 32-bit PNG file.',
    sections: [
      {
        heading: 'Why Convert WebP to PNG?',
        content: 'While WebP is excellent for web page speed, PNG remains the industry standard for graphic design software, video editors, and legacy desktop applications. Converting to PNG allows you to open images in older versions of Photoshop, Premiere Pro, or desktop publishing software without installing third-party plugins.'
      },
      {
        heading: 'Preserving Transparency During Conversion',
        content: 'WebP supports both lossy and lossless alpha transparency. When converting to PNG, a high-quality converter must preserve the 8-bit alpha channel so your logos, cutouts, and stickers maintain clean transparent backgrounds without ugly white borders.'
      }
    ],
    faq: [
      {
        question: 'Will converting WebP to PNG increase file size?',
        answer: 'Yes. PNG is a lossless format designed for editing fidelity rather than web compression. The resulting PNG will typically be 2x to 4x larger than the original WebP, but it ensures maximum editing compatibility.'
      },
      {
        question: 'Can I convert multiple WebP files at once?',
        answer: 'Yes! You can use the Bulk Image Studio or Batch Converter to transcode dozens of WebP files to PNG simultaneously and download them in a single ZIP archive.'
      }
    ],
    indexable: true
  },
  {
    id: 'how-to-reduce-image-size',
    slug: 'guides/how-to-reduce-image-size',
    title: 'How to Reduce Image Size in KB: Meet Upload Requirements',
    metaDescription: 'Complete guide on reducing image file size in kilobytes (KB) for passport portals, job forms, college applications, and email attachments.',
    h1: 'How to Reduce Image Size in Kilobytes (KB)',
    category: 'Optimization Guides',
    readTime: '4 min read',
    publishedDate: '2026-03-01',
    updatedDate: '2026-08-24',
    author: {
      name: 'AetherPix Imaging Team',
      role: 'Digital Media Engineers'
    },
    primaryKeyword: 'how to reduce image size',
    secondaryKeywords: ['reduce image size in kb', 'compress photo for government portal', 'reduce picture size to 50kb', 'shrink photo size'],
    relatedToolSlug: '/compress-image-to-50kb',
    quickAnswer: 'To reduce an image to a specific kilobyte threshold (e.g. 20KB, 50KB, 100KB, or 200KB), combine dimensional resizing with binary-search JPEG quantizing and EXIF stripping. Dedicated target-size compressors automatically adjust dimensions and compression ratios until the output file fits precisely under your required limit.',
    sections: [
      {
        heading: 'Why Online Portals Have Strict KB Limits',
        content: 'Government portals, visa processing systems, job boards, and exam registration websites enforce strict 20KB to 100KB limits to manage database storage and ensure fast processing across millions of user submissions.'
      },
      {
        heading: 'The 3-Step Strategy to Hit Exact KB Targets',
        content: '1. Strip Unnecessary Metadata: EXIF camera tags, GPS coordinates, and thumbnail caches often consume 10KB to 50KB alone.\n2. Scale Pixel Dimensions: Downscale ultra-high resolution camera photos (e.g. 4000x3000) to web-appropriate dimensions (e.g. 800x600).\n3. Optimize Compression Quantization: Adjust JPEG quality factors using binary-search encoders to stay strictly within the target threshold.'
      }
    ],
    faq: [
      {
        question: 'How do I compress an image to under 50KB?',
        answer: 'Use the AetherPix "Compress Image to 50KB" tool. Upload your photo, and the tool will automatically calculate the exact quantization curve to produce a file strictly at or under 50KB.'
      }
    ],
    indexable: true
  },
  {
    id: 'how-to-resize-an-image',
    slug: 'guides/how-to-resize-an-image',
    title: 'How to Resize an Image: Pixel, Percentage & Print Units',
    metaDescription: 'Learn how to resize digital photos by exact pixel dimensions, percentage scaling, or physical print measurements (cm, mm, inches) without distortion.',
    h1: 'How to Resize Images Correctly',
    category: 'Editing Guides',
    readTime: '3 min read',
    publishedDate: '2026-03-15',
    updatedDate: '2026-08-25',
    author: {
      name: 'AetherPix Imaging Team',
      role: 'Digital Media Engineers'
    },
    primaryKeyword: 'how to resize an image',
    secondaryKeywords: ['resize photo online', 'change image dimensions', 'resize image in cm', 'scale picture pixels'],
    relatedToolSlug: '/resize',
    quickAnswer: 'To resize an image, open an image resizer, choose your preferred unit (Pixels for web/social, Percentage for quick scaling, or CM/Inches for printing), enter your new width or height while keeping the aspect ratio locked, and download the resized graphic.',
    sections: [
      {
        heading: 'Maintaining Aspect Ratio',
        content: 'Always ensure the aspect ratio lock is enabled unless you deliberately wish to stretch or distort your image. Changing only width or height automatically calculates the matching dimension to preserve authentic proportions.'
      },
      {
        heading: 'Resizing for Print (DPI vs. Pixels)',
        content: 'For crisp printing at 300 DPI (Dots Per Inch), multiply your desired print dimensions in inches by 300. For example, a 4x6 inch print requires a 1200x1800 pixel image.'
      }
    ],
    faq: [
      {
        question: 'Does resizing an image make it blurry?',
        answer: 'Downscaling (making an image smaller) retains crisp sharpness with bicubic interpolation. Upscaling (making a small image larger) can cause softness unless using neural AI super-resolution.'
      }
    ],
    indexable: true
  },
  {
    id: 'what-is-webp',
    slug: 'guides/what-is-webp',
    title: 'What is WebP? Format Comparison, Benefits & Compatibility',
    metaDescription: 'Discover what WebP format is, how it compares to JPEG and PNG, browser compatibility, and why it is the standard for modern web performance.',
    h1: 'What is WebP? The Modern Web Image Format',
    category: 'Format Guides',
    readTime: '4 min read',
    publishedDate: '2026-04-01',
    updatedDate: '2026-08-26',
    author: {
      name: 'AetherPix Imaging Team',
      role: 'Digital Media Engineers'
    },
    primaryKeyword: 'what is webp',
    secondaryKeywords: ['webp format explained', 'webp vs jpeg', 'webp vs png', 'is webp good for seo'],
    relatedToolSlug: '/convert/webp-to-jpg',
    quickAnswer: 'WebP is a modern raster image format developed by Google that provides superior lossless and lossy compression for web images. WebP files are on average 25% to 35% smaller than comparable JPEG and PNG files at equivalent visual quality, dramatically speeding up web page loading times and improving Google Core Web Vitals.',
    sections: [
      {
        heading: 'Key Advantages of WebP',
        content: '1. Smaller File Sizes: Shaves up to 35% of byte size compared to JPEG.\n2. Transparency Support: Supports 8-bit alpha channels in both lossy and lossless modes.\n3. Animation Support: Supports animated sequences like GIF with significantly smaller file footprint.\n4. Universal Browser Support: Supported by over 97% of all active web browsers worldwide.'
      }
    ],
    faq: [
      {
        question: 'Can I convert WebP back to JPG if I need to print or share it?',
        answer: 'Yes! Use the AetherPix WebP to JPG converter to instantly transform any WebP file into standard JPEG format.'
      }
    ],
    indexable: true
  },
  {
    id: 'passport-photo-size-guide',
    slug: 'guides/passport-photo-size-guide',
    title: 'Passport & Visa Photo Size Guide: Global Standards & Specs',
    metaDescription: 'Official dimensions and biometric requirements for US Passport (2x2 inch), Schengen Visa (35x45mm), UK, India, and Canadian identification photos.',
    h1: 'International Passport Photo Size & Biometric Guide',
    category: 'Biometric Guides',
    readTime: '5 min read',
    publishedDate: '2026-04-15',
    updatedDate: '2026-08-26',
    author: {
      name: 'AetherPix Imaging Team',
      role: 'Digital Media Engineers'
    },
    primaryKeyword: 'passport photo size guide',
    secondaryKeywords: ['us passport photo dimensions', '35x45mm photo size', 'schengen visa photo requirements', 'passport photo 2x2'],
    relatedToolSlug: '/passport-photo',
    quickAnswer: 'Standard passport photo sizes vary by country: The United States requires 2x2 inches (51x51 mm) with a plain white background; European Schengen countries and the UK require 35x45 mm with a light grey or cream background; India requires 35x45 mm or 35x35 mm. The head height must typically occupy between 50% and 70% of the total frame height.',
    sections: [
      {
        heading: 'Country-by-Country Specifications',
        content: '• United States: 2 x 2 inches (51 x 51 mm, 600x600 px at 300 DPI), pure white background.\n• Schengen Europe & UK: 35 x 45 mm (413x531 px at 300 DPI), off-white or neutral light grey background.\n• India: 35 x 45 mm, white background, matte or glossy finish.\n• Canada: 50 x 70 mm, white background.'
      }
    ],
    faq: [
      {
        question: 'Can I take a passport photo at home and print it?',
        answer: 'Yes! Use our Passport & ID Photo Maker to auto-align your face, replace the background with compliant white or blue, and generate a printable 4x6 sheet containing 6 ready-to-cut photos.'
      }
    ],
    indexable: true
  },
  {
    id: 'youtube-thumbnail-size-guide',
    slug: 'guides/youtube-thumbnail-size-guide',
    title: 'YouTube Thumbnail Size Guide: Ideal Dimensions, Ratio & Limits',
    metaDescription: 'The definitive guide to YouTube thumbnail size, best aspect ratios (16:9), 1280x720 resolution, file size limits (2MB), and click-through optimization tips.',
    h1: 'YouTube Thumbnail Size & Optimization Guide',
    category: 'Creator Guides',
    readTime: '4 min read',
    publishedDate: '2026-05-01',
    updatedDate: '2026-08-26',
    author: {
      name: 'AetherPix Imaging Team',
      role: 'Digital Media Engineers'
    },
    primaryKeyword: 'youtube thumbnail size',
    secondaryKeywords: ['youtube thumbnail dimensions', 'best size for youtube thumbnail', 'youtube thumbnail aspect ratio', 'youtube thumbnail 1280x720'],
    relatedToolSlug: '/youtube-thumbnail-downloader',
    quickAnswer: 'The ideal YouTube thumbnail size is 1280 x 720 pixels, with a minimum width of 640 pixels and an aspect ratio of 16:9. Supported image formats are JPG, PNG, and WebP, with a strict maximum file size of 2MB (or 10MB for podcasts).',
    sections: [
      {
        heading: 'Official YouTube Guidelines',
        content: '1. Resolution: 1280x720 (HD widescreen).\n2. Aspect Ratio: 16:9 widescreen.\n3. Maximum File Size: 2 MB.\n4. Formats: JPG, GIF, PNG, or WebP.'
      }
    ],
    faq: [
      {
        question: 'How can I download a 1280x720 HD thumbnail from any video?',
        answer: 'Use the AetherPix YouTube Thumbnail Downloader. Paste any video URL and download the uncompressed MaxRes (1280x720) JPEG instantly.'
      }
    ],
    indexable: true
  },
  {
    id: 'bulk-image-processing-guide',
    slug: 'guides/bulk-image-processing-guide',
    title: 'Bulk Image Processing Workflows: Automating Large Photo Batches',
    metaDescription: 'Master bulk photo processing: how to resize, compress, transcode formats, and watermark hundreds of images simultaneously with client-side pipelines.',
    h1: 'Bulk Image Processing & Multi-Step Automation Guide',
    category: 'Workflow Guides',
    readTime: '5 min read',
    publishedDate: '2026-06-10',
    updatedDate: '2026-08-26',
    author: {
      name: 'AetherPix Imaging Team',
      role: 'Digital Media Engineers'
    },
    primaryKeyword: 'bulk image processing',
    secondaryKeywords: ['batch photo processing', 'bulk resize images', 'bulk convert webp', 'multi step image pipeline'],
    relatedToolSlug: '/tools',
    quickAnswer: 'Bulk image processing allows you to apply transformations across dozens or hundreds of files concurrently. Modern multi-step pipelines execute chained transformations (e.g. Resize to 1920px → Transcode to WebP 80% → Stamp Watermark → Export ZIP) in memory using multi-threaded web worker pools.',
    sections: [
      {
        heading: 'Benefits of Client-Side Concurrency',
        content: 'By running image pipelines in your browser using Web Workers and OffscreenCanvas, you eliminate server upload wait times, bypass cloud storage limits, and ensure 100% data confidentiality.'
      }
    ],
    faq: [
      {
        question: 'Is there a limit on batch sizes in AetherPix?',
        answer: 'There is no hard file limit because processing is handled locally by your device with intelligent memory recycling and controlled concurrency.'
      }
    ],
    indexable: true
  }
];

export function getGuideBySlug(slug: string): GuideArticleEntry | undefined {
  const clean = slug.replace(/^\/+|\/+$/g, '').toLowerCase();
  return GUIDES_REGISTRY.find(
    (g) => g.slug.toLowerCase() === clean || g.id.toLowerCase() === clean || `guides/${g.id}` === clean
  );
}
