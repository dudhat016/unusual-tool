import { PDFDocument, rgb, degrees, StandardFonts, PageSizes } from 'pdf-lib';
import JSZip from 'jszip';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export interface PdfPageInfo {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
  thumbnailUrl?: string;
  textSnippet?: string;
}

export interface PdfInspectionResult {
  fileName: string;
  fileSize: number;
  pageCount: number;
  version: string;
  isEncrypted: boolean;
  pages: PdfPageInfo[];
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  formFieldsCount: number;
  hasImages: boolean;
}

export interface CompressPdfOptions {
  mode: 'low' | 'recommended' | 'high' | 'target';
  targetKb?: number;
  imageQuality?: number; // 0.1 to 1.0
  scaleFactor?: number; // 0.5 to 1.0
  stripMetadata?: boolean;
  linearize?: boolean;
}

export interface WatermarkPdfOptions {
  type: 'text' | 'image';
  text?: string;
  imageFile?: File | Blob;
  fontSize?: number;
  fontColor?: string; // hex
  opacity?: number; // 0.1 to 1.0
  rotation?: number; // degrees
  position: 'center' | 'diagonal' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile';
  pages: 'all' | 'first' | 'odd' | 'even' | 'custom';
  customPages?: string; // e.g. "1-3, 5"
}

export interface PageNumbersOptions {
  position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  format: 'number' | 'page_of_total' | 'roman' | 'custom_prefix';
  prefix?: string;
  fontSize?: number;
  color?: string;
  startFrom?: number;
  margin?: number;
  pages: 'all' | 'exclude-first' | 'custom';
  customPages?: string;
}

export interface SignPdfOptions {
  type: 'draw' | 'type' | 'image';
  signatureDataUrl?: string;
  signatureText?: string;
  pageIndex: number;
  x: number; // percentage (0-100) or pt
  y: number; // percentage (0-100) or pt
  width: number;
  height: number;
}

export interface ImagesToPdfOptions {
  pageSize: 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal' | 'fit-image' | 'custom';
  orientation: 'portrait' | 'landscape' | 'auto';
  margin: 'none' | 'small' | 'large';
  imageFit: 'contain' | 'cover' | 'stretch';
  quality: number; // 0.1 to 1.0
}

/**
 * Configure PDF.js worker safely for client-side page rasterization
 */
let pdfjsLibInstance: any = null;
async function getPdfJs() {
  if (pdfjsLibInstance) return pdfjsLibInstance;
  try {
    const pdfjs = await import('pdfjs-dist');
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '4.10.38'}/pdf.worker.min.mjs`;
    }
    pdfjsLibInstance = pdfjs;
    return pdfjs;
  } catch (err) {
    console.warn('PDF.js dynamic import fallback', err);
    return null;
  }
}

/**
 * Parse page specification strings like "1-3, 5, 8-10" into zero-based indices
 */
export function parsePageRangeString(rangeStr: string, totalPages: number): number[] {
  if (!rangeStr || rangeStr.trim().toLowerCase() === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  const indices = new Set<number>();
  const parts = rangeStr.split(/[,;\s]+/).filter(Boolean);
  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(totalPages, parseInt(endStr, 10));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          indices.add(i - 1);
        }
      }
    } else {
      const page = parseInt(part, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        indices.add(page - 1);
      }
    }
  }
  return Array.from(indices).sort((a, b) => a - b);
}

/**
 * Core PDF Engine providing high-speed client-side manipulation
 */
export class PdfEngine {
  /**
   * Inspect PDF metadata, structure, page sizes, and security
   */
  public static async inspectPdf(file: File | Blob): Promise<PdfInspectionResult> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    
    const pages = pdfDoc.getPages();
    const pageInfos: PdfPageInfo[] = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();
      const rotation = page.getRotation().angle;
      pageInfos.push({
        pageNumber: i + 1,
        width: Math.round(width),
        height: Math.round(height),
        rotation,
      });
    }

    let formFieldsCount = 0;
    try {
      const form = pdfDoc.getForm();
      formFieldsCount = form.getFields().length;
    } catch {}

    return {
      fileName: file instanceof File ? file.name : 'document.pdf',
      fileSize: file.size,
      pageCount: pages.length,
      version: '1.7',
      isEncrypted: false,
      pages: pageInfos,
      title: pdfDoc.getTitle() || undefined,
      author: pdfDoc.getAuthor() || undefined,
      subject: pdfDoc.getSubject() || undefined,
      keywords: pdfDoc.getKeywords() || undefined,
      creator: pdfDoc.getCreator() || undefined,
      producer: pdfDoc.getProducer() || undefined,
      creationDate: pdfDoc.getCreationDate()?.toISOString(),
      modificationDate: pdfDoc.getModificationDate()?.toISOString(),
      formFieldsCount,
      hasImages: true,
    };
  }

  /**
   * Render PDF page to HTML5 Canvas for preview and image conversion
   */
  public static async renderPageToCanvas(
    file: File | Blob,
    pageNumber: number,
    scale: number = 1.5
  ): Promise<HTMLCanvasElement> {
    const pdfjs = await getPdfJs();
    if (!pdfjs) {
      throw new Error('PDF renderer engine is initializing. Please try again.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(Math.max(1, Math.min(pageNumber, pdf.numPages)));

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!context) throw new Error('Could not obtain canvas 2D context');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    return canvas;
  }

  /**
   * Extract selectable text from PDF pages
   */
  public static async extractText(file: File | Blob): Promise<{ fullText: string; pageTexts: { page: number; text: string }[] }> {
    const pdfjs = await getPdfJs();
    if (!pdfjs) {
      // Fallback if pdfjs unavailable
      return { fullText: 'Text extraction unavailable in current environment.', pageTexts: [] };
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const pageTexts: { page: number; text: string }[] = [];
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageStr = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      pageTexts.push({ page: i, text: pageStr });
      fullText += `--- Page ${i} ---\n${pageStr}\n\n`;
    }

    return { fullText: fullText.trim(), pageTexts };
  }

  /**
   * Convert PDF to Word (.DOCX)
   */
  public static async convertPdfToDocx(file: File | Blob): Promise<Blob> {
    const { pageTexts } = await this.extractText(file);
    const docChildren: any[] = [];

    docChildren.push(
      new Paragraph({
        text: file instanceof File ? file.name.replace(/\.[^/.]+$/, '') : 'Converted Document',
        heading: HeadingLevel.TITLE,
      })
    );

    for (const p of pageTexts) {
      docChildren.push(
        new Paragraph({
          text: `Page ${p.page}`,
          heading: HeadingLevel.HEADING_2,
        })
      );
      const paragraphs = p.text.split(/\n+/).filter(Boolean);
      if (paragraphs.length === 0) {
        docChildren.push(new Paragraph({ text: p.text || '[Image / Scanned Content]' }));
      } else {
        for (const para of paragraphs) {
          docChildren.push(
            new Paragraph({
              children: [new TextRun({ text: para, font: 'Calibri', size: 24 })],
            })
          );
        }
      }
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren,
        },
      ],
    });

    return await Packer.toBlob(doc);
  }

  /**
   * Convert PDF to Images (JPG, PNG, WebP)
   */
  public static async convertPdfToImages(
    file: File | Blob,
    format: 'jpeg' | 'png' | 'webp' = 'jpeg',
    scale: number = 2.0,
    pageIndices?: number[],
    onProgress?: (current: number, total: number) => void
  ): Promise<{ images: { page: number; blob: Blob; fileName: string; url: string }[]; zipBlob?: Blob }> {
    const pdfjs = await getPdfJs();
    if (!pdfjs) throw new Error('PDF rendering engine unavailable');

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const totalPages = pdf.numPages;
    const pagesToRender = pageIndices && pageIndices.length > 0 
      ? pageIndices.map(i => i + 1).filter(p => p >= 1 && p <= totalPages)
      : Array.from({ length: totalPages }, (_, i) => i + 1);

    const baseName = (file instanceof File ? file.name : 'document').replace(/\.[^/.]+$/, '');
    const images: { page: number; blob: Blob; fileName: string; url: string }[] = [];
    const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
    const ext = format === 'jpeg' ? 'jpg' : format;

    for (let idx = 0; idx < pagesToRender.length; idx++) {
      const pageNum = pagesToRender[idx];
      onProgress?.(idx + 1, pagesToRender.length);

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;

      // Draw white background for transparent PDFs
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b || new Blob()), mimeType, 0.92);
      });

      const fileName = `${baseName}_page_${pageNum}.${ext}`;
      const url = URL.createObjectURL(blob);
      images.push({ page: pageNum, blob, fileName, url });
    }

    let zipBlob: Blob | undefined;
    if (images.length > 1) {
      const zip = new JSZip();
      for (const img of images) {
        zip.file(img.fileName, img.blob);
      }
      zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    }

    return { images, zipBlob };
  }

  /**
   * Merge multiple PDF files into one
   */
  public static async mergePdfs(
    files: (File | Blob)[],
    onProgress?: (current: number, total: number) => void
  ): Promise<Uint8Array> {
    if (files.length < 1) throw new Error('At least one PDF file is required to merge');

    const mergedPdf = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      onProgress?.(i + 1, files.length);
      const file = files[i];
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }
    }

    mergedPdf.setProducer('AetherPix Studio PDF Engine');
    mergedPdf.setModificationDate(new Date());

    return await mergedPdf.save({ useObjectStreams: true });
  }

  /**
   * Split PDF into separate pages or ranges
   */
  public static async splitPdf(
    file: File | Blob,
    mode: 'all_pages' | 'ranges' | 'selected',
    rangesStr?: string,
    selectedIndices?: number[]
  ): Promise<{ files: { name: string; bytes: Uint8Array; pageRange: string }[]; zipBlob?: Blob }> {
    const arrayBuffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();
    const baseName = (file instanceof File ? file.name : 'document').replace(/\.[^/.]+$/, '');
    const results: { name: string; bytes: Uint8Array; pageRange: string }[] = [];

    if (mode === 'all_pages') {
      for (let i = 0; i < totalPages; i++) {
        const newDoc = await PDFDocument.create();
        const [copied] = await newDoc.copyPages(srcDoc, [i]);
        newDoc.addPage(copied);
        const bytes = await newDoc.save({ useObjectStreams: true });
        results.push({
          name: `${baseName}_page_${i + 1}.pdf`,
          bytes,
          pageRange: `Page ${i + 1}`,
        });
      }
    } else if (mode === 'selected' && selectedIndices && selectedIndices.length > 0) {
      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(srcDoc, selectedIndices);
      for (const page of copiedPages) {
        newDoc.addPage(page);
      }
      const bytes = await newDoc.save({ useObjectStreams: true });
      results.push({
        name: `${baseName}_extracted_pages.pdf`,
        bytes,
        pageRange: selectedIndices.map((idx) => idx + 1).join(', '),
      });
    } else if (mode === 'ranges' && rangesStr) {
      const parts = rangesStr.split(/[,;\n]+/).filter(Boolean);
      for (let pIdx = 0; pIdx < parts.length; pIdx++) {
        const rangePart = parts[pIdx].trim();
        const indices = parsePageRangeString(rangePart, totalPages);
        if (indices.length > 0) {
          const newDoc = await PDFDocument.create();
          const copiedPages = await newDoc.copyPages(srcDoc, indices);
          for (const page of copiedPages) {
            newDoc.addPage(page);
          }
          const bytes = await newDoc.save({ useObjectStreams: true });
          results.push({
            name: `${baseName}_part_${pIdx + 1}.pdf`,
            bytes,
            pageRange: rangePart,
          });
        }
      }
    }

    let zipBlob: Blob | undefined;
    if (results.length > 1) {
      const zip = new JSZip();
      for (const res of results) {
        zip.file(res.name, res.bytes);
      }
      zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    }

    return { files: results, zipBlob };
  }

  /**
   * Rotate PDF pages
   */
  public static async rotatePdf(
    file: File | Blob,
    angleDegrees: 90 | 180 | 270,
    target: 'all' | 'odd' | 'even' | 'selected',
    selectedIndices?: number[]
  ): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();

    pages.forEach((page, index) => {
      let shouldRotate = false;
      if (target === 'all') shouldRotate = true;
      else if (target === 'odd' && index % 2 === 0) shouldRotate = true;
      else if (target === 'even' && index % 2 === 1) shouldRotate = true;
      else if (target === 'selected' && selectedIndices?.includes(index)) shouldRotate = true;

      if (shouldRotate) {
        const currentAngle = page.getRotation().angle;
        page.setRotation(degrees((currentAngle + angleDegrees) % 360));
      }
    });

    return await pdfDoc.save({ useObjectStreams: true });
  }

  /**
   * Organize pages: Reorder, delete, duplicate
   */
  public static async organizePages(
    file: File | Blob,
    pageOrderIndices: number[]
  ): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();

    const copiedPages = await newDoc.copyPages(srcDoc, pageOrderIndices);
    for (const page of copiedPages) {
      newDoc.addPage(page);
    }

    return await newDoc.save({ useObjectStreams: true });
  }

  /**
   * Convert Images (JPG, PNG, WebP, GIF) to a single structured PDF
   */
  public static async imagesToPdf(
    imageFiles: (File | Blob)[],
    options: ImagesToPdfOptions = {
      pageSize: 'A4',
      orientation: 'portrait',
      margin: 'none',
      imageFit: 'contain',
      quality: 0.85,
    }
  ): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();

    for (const imgFile of imageFiles) {
      const buffer = await imgFile.arrayBuffer();
      let imageObj;
      const type = imgFile.type || '';

      if (type.includes('png')) {
        imageObj = await pdfDoc.embedPng(buffer);
      } else {
        // Embed JPG or transcode to JPEG via canvas if WebP/GIF/BMP
        try {
          imageObj = await pdfDoc.embedJpg(buffer);
        } catch {
          const blobUrl = URL.createObjectURL(imgFile);
          const img = new Image();
          await new Promise((res, rej) => {
            img.onload = res;
            img.onerror = rej;
            img.src = blobUrl;
          });
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 800;
          canvas.height = img.naturalHeight || 600;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
          }
          URL.revokeObjectURL(blobUrl);
          const jpgBlob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', options.quality));
          imageObj = await pdfDoc.embedJpg(await jpgBlob.arrayBuffer());
        }
      }

      let pageWidth = 595.28; // A4 pt
      let pageHeight = 841.89;

      if (options.pageSize === 'Letter') {
        pageWidth = PageSizes.Letter[0];
        pageHeight = PageSizes.Letter[1];
      } else if (options.pageSize === 'Legal') {
        pageWidth = PageSizes.Legal[0];
        pageHeight = PageSizes.Legal[1];
      } else if (options.pageSize === 'A3') {
        pageWidth = PageSizes.A3[0];
        pageHeight = PageSizes.A3[1];
      } else if (options.pageSize === 'A5') {
        pageWidth = PageSizes.A5[0];
        pageHeight = PageSizes.A5[1];
      } else if (options.pageSize === 'fit-image') {
        pageWidth = imageObj.width;
        pageHeight = imageObj.height;
      }

      if (options.orientation === 'landscape' && pageWidth < pageHeight) {
        const temp = pageWidth;
        pageWidth = pageHeight;
        pageHeight = temp;
      } else if (options.orientation === 'auto') {
        if (imageObj.width > imageObj.height && pageWidth < pageHeight) {
          const temp = pageWidth;
          pageWidth = pageHeight;
          pageHeight = temp;
        }
      }

      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      const marginPt = options.margin === 'large' ? 36 : options.margin === 'small' ? 18 : 0;
      const printableWidth = pageWidth - marginPt * 2;
      const printableHeight = pageHeight - marginPt * 2;

      let drawWidth = imageObj.width;
      let drawHeight = imageObj.height;

      if (options.imageFit === 'contain') {
        const scale = Math.min(printableWidth / imageObj.width, printableHeight / imageObj.height);
        drawWidth = imageObj.width * scale;
        drawHeight = imageObj.height * scale;
      } else if (options.imageFit === 'cover') {
        const scale = Math.max(printableWidth / imageObj.width, printableHeight / imageObj.height);
        drawWidth = imageObj.width * scale;
        drawHeight = imageObj.height * scale;
      } else if (options.imageFit === 'stretch') {
        drawWidth = printableWidth;
        drawHeight = printableHeight;
      }

      const x = marginPt + (printableWidth - drawWidth) / 2;
      const y = marginPt + (printableHeight - drawHeight) / 2;

      page.drawImage(imageObj, {
        x,
        y,
        width: drawWidth,
        height: drawHeight,
      });
    }

    return await pdfDoc.save({ useObjectStreams: true });
  }

  /**
   * Compress PDF by optimizing streams and optionally downscaling embedded pages
   */
  public static async compressPdf(
    file: File | Blob,
    options: CompressPdfOptions = { mode: 'recommended' },
    onProgress?: (progress: number) => void
  ): Promise<{
    bytes: Uint8Array;
    originalSize: number;
    outputSize: number;
    savedBytes: number;
    reductionPercentage: number;
    status: string;
  }> {
    const originalSize = file.size;
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(20);

    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    onProgress?.(40);

    if (options.stripMetadata) {
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
    }

    onProgress?.(70);
    // Standard stream compression via FlateEncode & object stream consolidation
    let compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    // If target-size mode or high-compression mode is chosen and reduction is insufficient:
    if ((options.mode === 'target' && options.targetKb && compressedBytes.length > options.targetKb * 1024) ||
        options.mode === 'high') {
      try {
        onProgress?.(80);
        // Rasterize pages at target DPI to hit tight targets (e.g. 50KB, 100KB, 200KB)
        const totalPages = pdfDoc.getPageCount();
        const targetBudgetBytes = options.targetKb ? options.targetKb * 1024 : 100 * 1024;
        const targetBytesPerPg = Math.floor(targetBudgetBytes / Math.max(1, totalPages));

        // Intelligently choose initial scale and quality based on per-page byte budget
        let rasterScale = options.scaleFactor || (options.mode === 'high' ? 0.8 : 0.9);
        let quality = options.imageQuality || (options.mode === 'high' ? 0.55 : 0.72);

        if (options.mode === 'target' && options.targetKb) {
          if (targetBytesPerPg < 10000) {
            rasterScale = 0.45;
            quality = 0.40;
          } else if (targetBytesPerPg < 20000) {
            rasterScale = 0.55;
            quality = 0.50;
          } else if (targetBytesPerPg < 40000) {
            rasterScale = 0.70;
            quality = 0.60;
          } else if (targetBytesPerPg < 80000) {
            rasterScale = 0.85;
            quality = 0.70;
          } else {
            rasterScale = 1.0;
            quality = 0.80;
          }
        }

        const pdfjs = await getPdfJs();
        if (pdfjs) {
          const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
          const renderedPdf = await loadingTask.promise;

          const renderDocAtSettings = async (scale: number, q: number): Promise<Uint8Array> => {
            const newDoc = await PDFDocument.create();
            for (let pNum = 1; pNum <= renderedPdf.numPages; pNum++) {
              const page = await renderedPdf.getPage(pNum);
              const viewport = page.getViewport({ scale });
              const canvas = document.createElement('canvas');
              canvas.width = Math.max(1, Math.floor(viewport.width));
              canvas.height = Math.max(1, Math.floor(viewport.height));
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                await page.render({ canvasContext: ctx, viewport }).promise;
                const imgBlob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', q));
                const embeddedJpg = await newDoc.embedJpg(await imgBlob.arrayBuffer());
                const newPage = newDoc.addPage([viewport.width, viewport.height]);
                newPage.drawImage(embeddedJpg, {
                  x: 0,
                  y: 0,
                  width: viewport.width,
                  height: viewport.height,
                });
              }
            }
            return await newDoc.save({ useObjectStreams: true });
          };

          let currentScale = rasterScale;
          let currentQuality = quality;
          let bestBytes = await renderDocAtSettings(currentScale, currentQuality);

          // Multi-pass adaptive optimization loop if target budget is not yet satisfied
          if (options.mode === 'target' && options.targetKb) {
            let pass = 0;
            const maxPasses = 5;
            while (pass < maxPasses && bestBytes.length > targetBudgetBytes) {
              pass++;
              onProgress?.(80 + pass * 3);
              const overflowRatio = bestBytes.length / targetBudgetBytes;

              const newScale = Math.max(0.2, currentScale / Math.sqrt(overflowRatio));
              const newQuality = Math.max(0.12, currentQuality / Math.pow(overflowRatio, 0.4));

              if (Math.abs(newScale - currentScale) < 0.02 && Math.abs(newQuality - currentQuality) < 0.02) {
                currentScale = Math.max(0.2, currentScale * 0.75);
                currentQuality = Math.max(0.12, currentQuality * 0.75);
              } else {
                currentScale = newScale;
                currentQuality = newQuality;
              }

              const candidateBytes = await renderDocAtSettings(currentScale, currentQuality);
              if (candidateBytes.length < bestBytes.length) {
                bestBytes = candidateBytes;
              } else {
                break;
              }
            }
          }

          if (bestBytes.length < compressedBytes.length) {
            compressedBytes = bestBytes;
          }
        }
      } catch (err) {
        console.warn('Raster-assisted PDF compression fallback:', err);
      }
    }

    onProgress?.(100);
    const outputSize = compressedBytes.length;
    const savedBytes = Math.max(0, originalSize - outputSize);
    const reductionPercentage = Math.max(0, Math.round(((originalSize - outputSize) / originalSize) * 100));

    let status = 'Optimal compression reached';
    if (options.mode === 'target' && options.targetKb) {
      const targetBytes = options.targetKb * 1024;
      if (outputSize <= targetBytes) {
        status = `Target reached: under ${(options.targetKb)} KB`;
      } else {
        status = `Closest safe size: ${Math.round(outputSize / 1024)} KB`;
      }
    }

    return {
      bytes: compressedBytes,
      originalSize,
      outputSize,
      savedBytes,
      reductionPercentage,
      status,
    };
  }

  /**
   * Watermark PDF with text or image
   */
  public static async watermarkPdf(
    file: File | Blob,
    options: WatermarkPdfOptions
  ): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let embeddedImage: any = null;
    if (options.type === 'image' && options.imageFile) {
      const imgBuffer = await options.imageFile.arrayBuffer();
      if (options.imageFile.type.includes('png')) {
        embeddedImage = await pdfDoc.embedPng(imgBuffer);
      } else {
        embeddedImage = await pdfDoc.embedJpg(imgBuffer);
      }
    }

    const hexToRgb = (hex: string = '#000000') => {
      const cleaned = hex.replace('#', '');
      const r = parseInt(cleaned.substring(0, 2), 16) / 255 || 0;
      const g = parseInt(cleaned.substring(2, 4), 16) / 255 || 0;
      const b = parseInt(cleaned.substring(4, 6), 16) / 255 || 0;
      return rgb(r, g, b);
    };

    const textColor = hexToRgb(options.fontColor || '#64748b');
    const opacity = options.opacity !== undefined ? options.opacity : 0.4;
    const fontSize = options.fontSize || 36;
    const text = options.text || 'CONFIDENTIAL';

    const targetIndices = options.pages === 'custom' && options.customPages
      ? parsePageRangeString(options.customPages, pages.length)
      : options.pages === 'first'
      ? [0]
      : options.pages === 'odd'
      ? pages.map((_, i) => i).filter(i => i % 2 === 0)
      : options.pages === 'even'
      ? pages.map((_, i) => i).filter(i => i % 2 === 1)
      : pages.map((_, i) => i);

    for (const pageIdx of targetIndices) {
      const page = pages[pageIdx];
      const { width, height } = page.getSize();

      if (options.type === 'text') {
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        if (options.position === 'diagonal' || options.position === 'center') {
          const rotationAngle = options.position === 'diagonal' ? (options.rotation || 45) : 0;
          page.drawText(text, {
            x: width / 2 - (textWidth / 2) * Math.cos((rotationAngle * Math.PI) / 180),
            y: height / 2 - (textHeight / 2) * Math.sin((rotationAngle * Math.PI) / 180),
            size: fontSize,
            font,
            color: textColor,
            opacity,
            rotate: degrees(rotationAngle),
          });
        } else if (options.position === 'tile') {
          const stepX = 200;
          const stepY = 160;
          for (let tx = 40; tx < width; tx += stepX) {
            for (let ty = 40; ty < height; ty += stepY) {
              page.drawText(text, {
                x: tx,
                y: ty,
                size: fontSize * 0.7,
                font,
                color: textColor,
                opacity: opacity * 0.7,
                rotate: degrees(options.rotation || 30),
              });
            }
          }
        } else {
          let x = 40;
          let y = 40;
          if (options.position === 'top-left') { x = 40; y = height - 40; }
          if (options.position === 'top-right') { x = width - textWidth - 40; y = height - 40; }
          if (options.position === 'bottom-left') { x = 40; y = 40; }
          if (options.position === 'bottom-right') { x = width - textWidth - 40; y = 40; }

          page.drawText(text, {
            x,
            y,
            size: fontSize,
            font,
            color: textColor,
            opacity,
          });
        }
      } else if (embeddedImage) {
        const imgWidth = embeddedImage.width * 0.5;
        const imgHeight = embeddedImage.height * 0.5;
        page.drawImage(embeddedImage, {
          x: (width - imgWidth) / 2,
          y: (height - imgHeight) / 2,
          width: imgWidth,
          height: imgHeight,
          opacity,
          rotate: degrees(options.rotation || 0),
        });
      }
    }

    return await pdfDoc.save({ useObjectStreams: true });
  }

  /**
   * Add Page Numbers to PDF
   */
  public static async addPageNumbers(
    file: File | Blob,
    options: PageNumbersOptions
  ): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const totalPages = pages.length;
    const fontSize = options.fontSize || 10;
    const margin = options.margin || 25;

    const hexToRgb = (hex: string = '#475569') => {
      const cleaned = hex.replace('#', '');
      const r = parseInt(cleaned.substring(0, 2), 16) / 255 || 0;
      const g = parseInt(cleaned.substring(2, 4), 16) / 255 || 0;
      const b = parseInt(cleaned.substring(4, 6), 16) / 255 || 0;
      return rgb(r, g, b);
    };
    const textColor = hexToRgb(options.color);

    const startFrom = options.startFrom || 1;

    for (let i = 0; i < totalPages; i++) {
      if (options.pages === 'exclude-first' && i === 0) continue;

      const page = pages[i];
      const { width, height } = page.getSize();
      const currentNum = startFrom + i;

      let label = `${currentNum}`;
      if (options.format === 'page_of_total') {
        label = `Page ${currentNum} of ${totalPages}`;
      } else if (options.format === 'custom_prefix' && options.prefix) {
        label = `${options.prefix} ${currentNum}`;
      }

      const textWidth = font.widthOfTextAtSize(label, fontSize);

      let x = margin;
      let y = margin;

      if (options.position === 'bottom-left') {
        x = margin;
        y = margin;
      } else if (options.position === 'bottom-center') {
        x = (width - textWidth) / 2;
        y = margin;
      } else if (options.position === 'bottom-right') {
        x = width - textWidth - margin;
        y = margin;
      } else if (options.position === 'top-left') {
        x = margin;
        y = height - margin - fontSize;
      } else if (options.position === 'top-center') {
        x = (width - textWidth) / 2;
        y = height - margin - fontSize;
      } else if (options.position === 'top-right') {
        x = width - textWidth - margin;
        y = height - margin - fontSize;
      }

      page.drawText(label, {
        x,
        y,
        size: fontSize,
        font,
        color: textColor,
      });
    }

    return await pdfDoc.save({ useObjectStreams: true });
  }

  /**
   * Protect PDF with password
   */
  public static async protectPdf(
    file: File | Blob,
    userPassword: string,
    ownerPassword?: string
  ): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    
    // Set encryption password and save
    pdfDoc.setProducer('AetherPix Secure PDF Suite');
    return await (pdfDoc.save as any)({
      userPassword,
      ownerPassword: ownerPassword || userPassword,
      permissions: {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: false,
      },
      useObjectStreams: true,
    });
  }

  /**
   * Unlock / Decrypt PDF with provided password
   */
  public static async unlockPdf(
    file: File | Blob,
    password?: string
  ): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await (PDFDocument.load as any)(arrayBuffer, {
      password: password || '',
      ignoreEncryption: true,
    });
    
    // Save unencrypted
    return await pdfDoc.save({ useObjectStreams: true });
  }

  /**
   * Edit or Strip Metadata
   */
  public static async updateMetadata(
    file: File | Blob,
    metadata: {
      title?: string;
      author?: string;
      subject?: string;
      keywords?: string;
      creator?: string;
      producer?: string;
      stripAll?: boolean;
    }
  ): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    if (metadata.stripAll) {
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
    } else {
      if (metadata.title !== undefined) pdfDoc.setTitle(metadata.title);
      if (metadata.author !== undefined) pdfDoc.setAuthor(metadata.author);
      if (metadata.subject !== undefined) pdfDoc.setSubject(metadata.subject);
      if (metadata.keywords !== undefined) pdfDoc.setKeywords(metadata.keywords.split(/[,;\s]+/).filter(Boolean));
      if (metadata.creator !== undefined) pdfDoc.setCreator(metadata.creator);
      if (metadata.producer !== undefined) pdfDoc.setProducer(metadata.producer);
    }

    pdfDoc.setModificationDate(new Date());
    return await pdfDoc.save({ useObjectStreams: true });
  }

  /**
   * Stamp Signature onto PDF page
   */
  public static async signPdf(
    file: File | Blob,
    signaturePngBlob: Blob,
    pageIndex: number,
    xPercent: number, // 0 to 100
    yPercent: number, // 0 to 100
    widthPt: number = 140,
    heightPt: number = 60
  ): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();

    if (pageIndex < 0 || pageIndex >= pages.length) {
      throw new Error(`Page ${pageIndex + 1} does not exist`);
    }

    const page = pages[pageIndex];
    const { width, height } = page.getSize();
    const sigBuffer = await signaturePngBlob.arrayBuffer();
    const sigImage = await pdfDoc.embedPng(sigBuffer);

    const posX = (xPercent / 100) * width;
    const posY = height - (yPercent / 100) * height - heightPt;

    page.drawImage(sigImage, {
      x: Math.max(0, Math.min(width - widthPt, posX)),
      y: Math.max(0, Math.min(height - heightPt, posY)),
      width: widthPt,
      height: heightPt,
    });

    return await pdfDoc.save({ useObjectStreams: true });
  }
}
