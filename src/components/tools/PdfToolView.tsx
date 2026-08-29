import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Download,
  FileText,
  FileCode,
  Image as ImageIcon,
  RotateCw,
  RotateCcw,
  Split,
  Merge,
  Layers,
  Stamp,
  Lock,
  Unlock,
  Trash2,
  Move,
  Hash,
  PenTool,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Archive,
  Eye,
  Sliders,
  Copy,
  ChevronRight,
  Info
} from 'lucide-react';
import { ToolDefinition } from '../../types';
import { PdfEngine, PdfInspectionResult, PdfPageInfo, parsePageRangeString } from '../../engine/pdf/PdfEngine';
import { formatFileSize } from '../../engine/imageEngine';
import { useApp } from '../../context/AppContext';
import { Select, CustomSelect, Input, Slider, NumberInput, Textarea, IconButton } from '../ui';
import { Button } from '../ui/Button';

interface PdfToolViewProps {
  tool: ToolDefinition;
}

export const PdfToolView: React.FC<PdfToolViewProps> = ({ tool }) => {
  const { showToast } = useApp();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Inspection & Single Doc state
  const [inspection, setInspection] = useState<PdfInspectionResult | null>(null);
  const [pageThumbnails, setPageThumbnails] = useState<{ page: number; url: string }[]>([]);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  
  // Helper to extract initial target KB from tool definition or route
  const getInitialTargetKb = () => {
    if ((tool as any).targetSizeKb && (tool as any).targetSizeKb > 0) {
      return (tool as any).targetSizeKb;
    }
    const match = (tool.slug || tool.id || tool.route || '').match(/(\d+)(kb|mb)/i);
    if (match) {
      const val = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      return unit === 'mb' ? val * 1000 : val;
    }
    return 100;
  };

  const isTargetSizeTool = 
    Boolean((tool as any).targetSizeKb) ||
    tool.id.includes('to-') ||
    tool.slug.includes('to-') ||
    /(\d+)(kb|mb)/i.test(tool.slug || tool.id);

  // Tool-specific configurations
  const [compressMode, setCompressMode] = useState<'recommended' | 'low' | 'high' | 'target'>(() => {
    return isTargetSizeTool ? 'target' : 'recommended';
  });
  const [targetKb, setTargetKb] = useState<number>(getInitialTargetKb);

  // Sync state if user navigates between different PDF tools or target routes
  useEffect(() => {
    const isTarget = 
      Boolean((tool as any).targetSizeKb) ||
      tool.id.includes('to-') ||
      tool.slug.includes('to-') ||
      /(\d+)(kb|mb)/i.test(tool.slug || tool.id);
    
    if (isTarget) {
      setCompressMode('target');
      setTargetKb(getInitialTargetKb());
    }
  }, [tool.id, tool.slug, tool.route]);

  const [splitMode, setSplitMode] = useState<'all_pages' | 'ranges' | 'selected'>('all_pages');
  const [pageRangesStr, setPageRangesStr] = useState('1-2, 3-5');
  
  const [rotateAngle, setRotateAngle] = useState<90 | 180 | 270>(90);
  const [rotateTarget, setRotateTarget] = useState<'all' | 'odd' | 'even' | 'selected'>('all');

  const [imageToPdfSize, setImageToPdfSize] = useState<'A4' | 'Letter' | 'fit-image'>('A4');
  const [imageToPdfOrientation, setImageToPdfOrientation] = useState<'portrait' | 'landscape' | 'auto'>('portrait');
  const [imageToPdfMargin, setImageToPdfMargin] = useState<'none' | 'small' | 'large'>('small');

  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.35);
  const [watermarkRotation, setWatermarkRotation] = useState(45);
  const [watermarkPosition, setWatermarkPosition] = useState<'diagonal' | 'center' | 'tile' | 'bottom-right'>('diagonal');

  const [pageNumberPos, setPageNumberPos] = useState<'bottom-center' | 'bottom-right' | 'top-right' | 'bottom-left'>('bottom-center');
  const [pageNumberFormat, setPageNumberFormat] = useState<'number' | 'page_of_total'>('page_of_total');

  const [passwordInput, setPasswordInput] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // Signature state
  const [sigMode, setSigMode] = useState<'draw' | 'type'>('draw');
  const [typedSig, setTypedSig] = useState('John Doe');
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Metadata Edit state
  const [metaTitle, setMetaTitle] = useState('');
  const [metaAuthor, setMetaAuthor] = useState('');
  const [metaSubject, setMetaSubject] = useState('');

  // Output Result State
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState<string>('output.pdf');
  const [resultStats, setResultStats] = useState<{
    originalSize: number;
    outputSize: number;
    savedBytes: number;
    reductionPercentage: number;
    statusText: string;
  } | null>(null);
  const [extractedImages, setExtractedImages] = useState<{ page: number; url: string; fileName: string }[]>([]);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      pageThumbnails.forEach((t) => URL.revokeObjectURL(t.url));
    };
  }, [resultUrl, pageThumbnails]);

  // Handle files selection
  const handleFiles = async (newFiles: FileList | File[]) => {
    const list = Array.from(newFiles);
    if (list.length === 0) return;

    setFiles(list);
    setResultBlob(null);
    setResultUrl(null);
    setExtractedText(null);
    setExtractedImages([]);
    setResultStats(null);

    const primaryFile = list[0];
    if (primaryFile.type === 'application/pdf' || primaryFile.name.endsWith('.pdf')) {
      try {
        const info = await PdfEngine.inspectPdf(primaryFile);
        setInspection(info);
        setMetaTitle(info.title || '');
        setMetaAuthor(info.author || '');
        setMetaSubject(info.subject || '');
        setSelectedPages(Array.from({ length: info.pageCount }, (_, i) => i));

        // Generate quick thumbnails for the first 8 pages
        const thumbs: { page: number; url: string }[] = [];
        const pagesToPreview = Math.min(8, info.pageCount);
        for (let p = 1; p <= pagesToPreview; p++) {
          try {
            const canvas = await PdfEngine.renderPageToCanvas(primaryFile, p, 0.4);
            thumbs.push({ page: p, url: canvas.toDataURL('image/jpeg', 0.6) });
          } catch {}
        }
        setPageThumbnails(thumbs);
      } catch (err: any) {
        console.warn('PDF inspection failed:', err);
      }
    }
  };

  // Reorder files helper (for Merge / Images to PDF)
  const moveFile = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= files.length) return;
    const copy = [...files];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setFiles(copy);
  };

  const removeFile = (index: number) => {
    const copy = files.filter((_, i) => i !== index);
    setFiles(copy);
    if (copy.length === 0) {
      setInspection(null);
      setPageThumbnails([]);
    }
  };

  // Drawing Signature Canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Execute processing based on active tool ID/category
  const handleExecute = async () => {
    if (files.length === 0) {
      showToast('Please upload at least one file to process', 'error');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(10);
    setStatusMessage('Reading document streams...');

    try {
      const primaryFile = files[0];
      const baseName = primaryFile.name.replace(/\.[^/.]+$/, '');

      // 1. MERGE PDF
      if (tool.id === 'merge-pdf' || tool.route === '/merge-pdf' || tool.route === '/combine-pdf') {
        setStatusMessage('Merging PDF documents...');
        const mergedBytes = await PdfEngine.mergePdfs(files, (curr, total) => {
          setProcessingProgress(Math.round((curr / total) * 90));
        });
        const blob = new Blob([mergedBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResultBlob(blob);
        setResultUrl(url);
        setResultFileName(`${baseName}_merged.pdf`);
        setResultStats({
          originalSize: files.reduce((acc, f) => acc + f.size, 0),
          outputSize: blob.size,
          savedBytes: 0,
          reductionPercentage: 0,
          statusText: `Merged ${files.length} documents into 1 PDF`,
        });
      }

      // 2. SPLIT PDF
      else if (tool.id === 'split-pdf' || tool.route === '/split-pdf') {
        setStatusMessage('Splitting PDF pages...');
        const { files: splitFiles, zipBlob } = await PdfEngine.splitPdf(
          primaryFile,
          splitMode,
          pageRangesStr,
          selectedPages
        );
        if (zipBlob) {
          const url = URL.createObjectURL(zipBlob);
          setResultBlob(zipBlob);
          setResultUrl(url);
          setResultFileName(`${baseName}_split_pages.zip`);
          setResultStats({
            originalSize: primaryFile.size,
            outputSize: zipBlob.size,
            savedBytes: 0,
            reductionPercentage: 0,
            statusText: `Extracted ${splitFiles.length} separate parts`,
          });
        } else if (splitFiles.length > 0) {
          const blob = new Blob([splitFiles[0].bytes as unknown as BlobPart], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          setResultBlob(blob);
          setResultUrl(url);
          setResultFileName(splitFiles[0].name);
        }
      }

      // 3. ROTATE PDF
      else if (tool.id === 'rotate-pdf' || tool.route === '/rotate-pdf') {
        setStatusMessage('Rotating PDF pages...');
        const rotatedBytes = await PdfEngine.rotatePdf(primaryFile, rotateAngle, rotateTarget, selectedPages);
        const blob = new Blob([rotatedBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResultBlob(blob);
        setResultUrl(url);
        setResultFileName(`${baseName}_rotated.pdf`);
      }

      // 4. COMPRESS PDF
      else if (tool.id.includes('compress') || tool.category === 'pdf-compression') {
        setStatusMessage('Optimizing streams & compacting objects...');
        const isTarget = tool.id.includes('kb') || tool.id.includes('1mb') || compressMode === 'target';
        const res = await PdfEngine.compressPdf(
          primaryFile,
          {
            mode: isTarget ? 'target' : compressMode,
            targetKb: isTarget ? targetKb : undefined,
            stripMetadata: true,
          },
          (p) => setProcessingProgress(p)
        );
        const blob = new Blob([res.bytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResultBlob(blob);
        setResultUrl(url);
        setResultFileName(`${baseName}_compressed.pdf`);
        setResultStats({
          originalSize: res.originalSize,
          outputSize: res.outputSize,
          savedBytes: res.savedBytes,
          reductionPercentage: res.reductionPercentage,
          statusText: res.status,
        });
      }

      // 5. PDF TO WORD / DOCX
      else if (tool.id === 'pdf-to-word' || tool.id === 'pdf-to-docx' || tool.route === '/pdf-to-word' || tool.route === '/pdf-to-docx') {
        setStatusMessage('Parsing typography & generating Microsoft Word (.docx)...');
        const docxBlob = await PdfEngine.convertPdfToDocx(primaryFile);
        const url = URL.createObjectURL(docxBlob);
        setResultBlob(docxBlob);
        setResultUrl(url);
        setResultFileName(`${baseName}.docx`);
        setResultStats({
          originalSize: primaryFile.size,
          outputSize: docxBlob.size,
          savedBytes: 0,
          reductionPercentage: 0,
          statusText: 'Converted to editable Microsoft Word document',
        });
      }

      // 6. PDF TO JPG / PNG / WebP / EXTRACT IMAGES
      else if (
        tool.id === 'pdf-to-jpg' ||
        tool.id === 'pdf-to-png' ||
        tool.id === 'pdf-to-webp' ||
        tool.id === 'extract-images-from-pdf' ||
        tool.route.startsWith('/pdf-to-')
      ) {
        setStatusMessage('Rendering high-density raster pages...');
        const format = tool.id.includes('png') ? 'png' : tool.id.includes('webp') ? 'webp' : 'jpeg';
        const { images, zipBlob } = await PdfEngine.convertPdfToImages(
          primaryFile,
          format,
          2.0,
          selectedPages,
          (curr, total) => setProcessingProgress(Math.round((curr / total) * 90))
        );

        setExtractedImages(images);
        if (zipBlob) {
          const url = URL.createObjectURL(zipBlob);
          setResultBlob(zipBlob);
          setResultUrl(url);
          setResultFileName(`${baseName}_${format}_pages.zip`);
        } else if (images.length > 0) {
          setResultBlob(images[0].blob);
          setResultUrl(images[0].url);
          setResultFileName(images[0].fileName);
        }
        setResultStats({
          originalSize: primaryFile.size,
          outputSize: zipBlob ? zipBlob.size : (images[0]?.blob.size || 0),
          savedBytes: 0,
          reductionPercentage: 0,
          statusText: `Rendered ${images.length} high-res pages`,
        });
      }

      // 7. IMAGES TO PDF (JPG/PNG TO PDF)
      else if (
        tool.id === 'images-to-pdf' ||
        tool.id === 'jpg-to-pdf' ||
        tool.id === 'png-to-pdf' ||
        tool.route === '/jpg-to-pdf' ||
        tool.route === '/png-to-pdf' ||
        tool.route === '/images-to-pdf'
      ) {
        setStatusMessage('Compiling images into multi-page PDF...');
        const pdfBytes = await PdfEngine.imagesToPdf(files, {
          pageSize: imageToPdfSize,
          orientation: imageToPdfOrientation,
          margin: imageToPdfMargin,
          imageFit: 'contain',
          quality: 0.9,
        });
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResultBlob(blob);
        setResultUrl(url);
        setResultFileName(`${baseName}_images.pdf`);
        setResultStats({
          originalSize: files.reduce((acc, f) => acc + f.size, 0),
          outputSize: blob.size,
          savedBytes: 0,
          reductionPercentage: 0,
          statusText: `Compiled ${files.length} images into PDF`,
        });
      }

      // 8. WATERMARK PDF
      else if (tool.id === 'watermark-pdf' || tool.route === '/watermark-pdf') {
        setStatusMessage('Applying watermark layer...');
        const watermarkedBytes = await PdfEngine.watermarkPdf(primaryFile, {
          type: 'text',
          text: watermarkText,
          opacity: watermarkOpacity,
          rotation: watermarkRotation,
          position: watermarkPosition as any,
          pages: 'all',
        });
        const blob = new Blob([watermarkedBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResultBlob(blob);
        setResultUrl(url);
        setResultFileName(`${baseName}_watermarked.pdf`);
      }

      // 9. ADD PAGE NUMBERS
      else if (tool.id === 'add-page-numbers-to-pdf' || tool.route === '/add-page-numbers-to-pdf') {
        setStatusMessage('Calculating and stamping page numbers...');
        const numberedBytes = await PdfEngine.addPageNumbers(primaryFile, {
          position: pageNumberPos as any,
          format: pageNumberFormat,
          pages: 'all',
        });
        const blob = new Blob([numberedBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResultBlob(blob);
        setResultUrl(url);
        setResultFileName(`${baseName}_numbered.pdf`);
      }

      // 10. PROTECT PDF
      else if (tool.id === 'protect-pdf' || tool.route === '/protect-pdf') {
        if (!passwordInput) {
          showToast('Please enter an encryption password', 'error');
          setIsProcessing(false);
          return;
        }
        if (passwordInput !== passwordConfirm) {
          showToast('Passwords do not match', 'error');
          setIsProcessing(false);
          return;
        }
        setStatusMessage('Encrypting document streams...');
        const encBytes = await PdfEngine.protectPdf(primaryFile, passwordInput);
        const blob = new Blob([encBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResultBlob(blob);
        setResultUrl(url);
        setResultFileName(`${baseName}_protected.pdf`);
      }

      // 11. UNLOCK PDF
      else if (tool.id === 'unlock-pdf' || tool.route === '/unlock-pdf') {
        setStatusMessage('Removing password protection...');
        const decBytes = await PdfEngine.unlockPdf(primaryFile, passwordInput);
        const blob = new Blob([decBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResultBlob(blob);
        setResultUrl(url);
        setResultFileName(`${baseName}_unlocked.pdf`);
      }

      // 12. SIGN PDF
      else if (tool.id === 'sign-pdf' || tool.route === '/sign-pdf') {
        setStatusMessage('Embedding digital signature stamp...');
        let sigBlob: Blob | null = null;
        if (sigMode === 'draw' && sigCanvasRef.current) {
          sigBlob = await new Promise<Blob>((res) => sigCanvasRef.current!.toBlob((b) => res(b!), 'image/png'));
        } else {
          const tCanvas = document.createElement('canvas');
          tCanvas.width = 400;
          tCanvas.height = 160;
          const ctx = tCanvas.getContext('2d');
          if (ctx) {
            ctx.font = 'italic 36px cursive';
            ctx.fillStyle = '#0f172a';
            ctx.fillText(typedSig, 20, 90);
            sigBlob = await new Promise<Blob>((res) => tCanvas.toBlob((b) => res(b!), 'image/png'));
          }
        }

        if (sigBlob) {
          const signedBytes = await PdfEngine.signPdf(primaryFile, sigBlob, 0, 70, 80, 160, 70);
          const blob = new Blob([signedBytes as unknown as BlobPart], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          setResultBlob(blob);
          setResultUrl(url);
          setResultFileName(`${baseName}_signed.pdf`);
        }
      }

      // 13. OCR & TEXT EXTRACTION
      else if (tool.id === 'ocr-pdf' || tool.id === 'pdf-to-txt' || tool.route === '/pdf-to-txt' || tool.route === '/ocr-pdf') {
        setStatusMessage('Extracting selectable text from pages...');
        const { fullText } = await PdfEngine.extractText(primaryFile);
        setExtractedText(fullText);
        const blob = new Blob([fullText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        setResultBlob(blob);
        setResultUrl(url);
        setResultFileName(`${baseName}.txt`);
      }

      // 14. METADATA & STRIP
      else if (tool.id === 'pdf-metadata' || tool.id === 'remove-pdf-metadata' || tool.route === '/remove-pdf-metadata') {
        setStatusMessage('Sanitizing and saving metadata tags...');
        const isStrip = tool.id === 'remove-pdf-metadata' || tool.route === '/remove-pdf-metadata';
        const metaBytes = await PdfEngine.updateMetadata(primaryFile, {
          title: metaTitle,
          author: metaAuthor,
          subject: metaSubject,
          stripAll: isStrip,
        });
        const blob = new Blob([metaBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResultBlob(blob);
        setResultUrl(url);
        setResultFileName(`${baseName}_sanitized.pdf`);
      }

      // DEFAULT FALLBACK: Optimize & Save
      else {
        setStatusMessage('Processing PDF...');
        const res = await PdfEngine.compressPdf(primaryFile);
        const blob = new Blob([res.bytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setResultBlob(blob);
        setResultUrl(url);
        setResultFileName(`${baseName}_processed.pdf`);
      }

      setProcessingProgress(100);
      showToast('Processing completed successfully!', 'success');
    } catch (err: any) {
      console.error('PDF Tool Processing Error:', err);
      showToast(err?.message || 'Failed to process document', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const isMultiFileTool =
    tool.id === 'merge-pdf' ||
    tool.id === 'images-to-pdf' ||
    tool.id === 'jpg-to-pdf' ||
    tool.id === 'png-to-pdf';

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {files.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[0.99]'
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-900/60 shadow-sm'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={tool.supportsBatch || isMultiFileTool}
            accept={tool.supportedFormats?.join(',') || 'application/pdf,image/*'}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center shadow-inner">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Drop your {isMultiFileTool ? 'files' : 'PDF'} here, or{' '}
                <span className="text-blue-600 dark:text-blue-400">browse</span>
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Supports standard PDF, JPG, PNG & WebP (up to {tool.maxFileSizeMB || 100}MB) • 100% In-Browser Private
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Header & Re-upload */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {files.length === 1 ? files[0].name : `${files.length} Files Selected`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total Size: {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
                  {inspection && ` • ${inspection.pageCount} Pages`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="xs"
                onClick={() => fileInputRef.current?.click()}
              >
                Add More Files
              </Button>
              <IconButton
                icon={Trash2}
                aria-label="Clear all"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setFiles([]);
                  setResultBlob(null);
                  setResultUrl(null);
                }}
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={tool.supportedFormats?.join(',') || 'application/pdf,image/*'}
                onChange={(e) => e.target.files && handleFiles([...files, ...Array.from(e.target.files)])}
                className="hidden"
              />
            </div>
          </div>

          {/* Multi-file List with Reorder Controls (for Merge & Images to PDF) */}
          {isMultiFileTool && files.length > 1 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  File Sequence ({files.length})
                </span>
                <span className="text-xs text-slate-400">Use arrows to adjust order</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-xs"
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-200 truncate mr-2">
                      {idx + 1}. {file.name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveFile(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveFile(idx, 'down')}
                        disabled={idx === files.length - 1}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeFile(idx)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual Page Thumbnails Preview (when available) */}
          {pageThumbnails.length > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Page Preview ({inspection?.pageCount} total)
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {selectedPages.length} Pages Selected
                </span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
                {pageThumbnails.map((thumb) => {
                  const isSelected = selectedPages.includes(thumb.page - 1);
                  return (
                    <div
                      key={thumb.page}
                      onClick={() => {
                        const pageIdx = thumb.page - 1;
                        if (isSelected) {
                          setSelectedPages(selectedPages.filter((p) => p !== pageIdx));
                        } else {
                          setSelectedPages([...selectedPages, pageIdx].sort((a, b) => a - b));
                        }
                      }}
                      className={`relative shrink-0 w-28 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <img src={thumb.url} alt={`Page ${thumb.page}`} className="w-full h-36 object-contain bg-white" />
                      <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[10px] text-center py-0.5 font-bold">
                        Page {thumb.page}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Tool Control Panels */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            {/* COMPRESS CONTROLS */}
            {(tool.id.includes('compress') || tool.category === 'pdf-compression') && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-blue-600" />
                  Compression Mode & Target Benchmark
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'recommended', label: 'Recommended', desc: 'Balanced quality & size' },
                    { id: 'low', label: 'Low', desc: 'Preserves max graphics' },
                    { id: 'high', label: 'Extreme', desc: 'Maximum byte reduction' },
                    { id: 'target', label: 'Exact KB Target', desc: 'Strict upload limits' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setCompressMode(mode.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        compressMode === mode.id
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{mode.label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{mode.desc}</div>
                    </button>
                  ))}
                </div>

                {compressMode === 'target' && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Target File Size (KB):
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {[50, 100, 150, 200, 300, 500, 1000].map((kb) => (
                        <button
                          key={kb}
                          onClick={() => setTargetKb(kb)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            targetKb === kb
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {kb >= 1000 ? `${kb / 1000}MB` : `${kb}KB`}
                        </button>
                      ))}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <NumberInput
                          value={targetKb}
                          min={10}
                          onChange={(v) => setTargetKb(Math.max(10, v || 100))}
                          className="w-24"
                        />
                        <span className="text-xs text-slate-500 font-bold">KB</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SPLIT CONTROLS */}
            {(tool.id === 'split-pdf' || tool.route === '/split-pdf') && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Split className="h-4 w-4 text-blue-600" />
                  Split Mode
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'all_pages', label: 'Extract All Pages', desc: '1 PDF per page (ZIP)' },
                    { id: 'ranges', label: 'Custom Ranges', desc: 'e.g. 1-3, 5-8' },
                    { id: 'selected', label: 'Selected Pages', desc: 'From thumbnail grid' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSplitMode(m.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        splitMode === m.id
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{m.label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>

                {splitMode === 'ranges' && (
                  <Input
                    label="Page Ranges (comma-separated):"
                    type="text"
                    value={pageRangesStr}
                    onChange={(e) => setPageRangesStr(e.target.value)}
                    placeholder="e.g. 1-2, 3-5, 8"
                  />
                )}
              </div>
            )}

            {/* ROTATE CONTROLS */}
            {(tool.id === 'rotate-pdf' || tool.route === '/rotate-pdf') && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RotateCw className="h-4 w-4 text-blue-600" />
                  Rotation Angle & Target Pages
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  {[
                    { angle: 90, label: '90° Clockwise' },
                    { angle: 180, label: '180° Upside Down' },
                    { angle: 270, label: '270° Counter-CW' },
                  ].map((r) => (
                    <button
                      key={r.angle}
                      onClick={() => setRotateAngle(r.angle as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        rotateAngle === r.angle
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300">Apply to:</span>
                  {(['all', 'odd', 'even', 'selected'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setRotateTarget(t)}
                      className={`px-3 py-1 rounded-lg font-semibold capitalize ${
                        rotateTarget === t
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t} Pages
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* IMAGES TO PDF CONTROLS */}
            {(tool.id === 'images-to-pdf' || tool.id === 'jpg-to-pdf' || tool.id === 'png-to-pdf') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CustomSelect
                  label="Page Format:"
                  value={imageToPdfSize}
                  onChange={(val) => setImageToPdfSize(val)}
                  options={[
                    { value: 'A4', label: 'A4 Standard (210 x 297 mm)' },
                    { value: 'Letter', label: 'US Letter (8.5 x 11 in)' },
                    { value: 'fit-image', label: 'Fit to Image Dimensions' },
                  ]}
                />
                <CustomSelect
                  label="Orientation:"
                  value={imageToPdfOrientation}
                  onChange={(val) => setImageToPdfOrientation(val)}
                  options={[
                    { value: 'portrait', label: 'Portrait' },
                    { value: 'landscape', label: 'Landscape' },
                    { value: 'auto', label: 'Auto Match Photo' },
                  ]}
                />
                <CustomSelect
                  label="Margins:"
                  value={imageToPdfMargin}
                  onChange={(val) => setImageToPdfMargin(val)}
                  options={[
                    { value: 'none', label: 'No Margin (Full Bleed)' },
                    { value: 'small', label: 'Small Margin (0.25 in)' },
                    { value: 'large', label: 'Large Margin (0.5 in)' },
                  ]}
                />
              </div>
            )}

            {/* WATERMARK CONTROLS */}
            {(tool.id === 'watermark-pdf' || tool.route === '/watermark-pdf') && (
              <div className="space-y-4">
                <Input
                  label="Watermark Text"
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <Slider
                    label="Watermark Opacity"
                    min={10}
                    max={100}
                    step={5}
                    value={Math.round(watermarkOpacity * 100)}
                    unit="%"
                    onChange={(v) => setWatermarkOpacity(v / 100)}
                  />
                  <Slider
                    label="Rotation Angle"
                    min={0}
                    max={360}
                    step={15}
                    value={watermarkRotation}
                    unit="°"
                    onChange={(v) => setWatermarkRotation(v)}
                  />
                  <CustomSelect
                    label="Position:"
                    value={watermarkPosition}
                    onChange={(val) => setWatermarkPosition(val)}
                    options={[
                      { value: 'diagonal', label: 'Diagonal Center' },
                      { value: 'center', label: 'Center' },
                      { value: 'tile', label: 'Full Page Tile Pattern' },
                      { value: 'bottom-right', label: 'Bottom Right Corner' },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* PAGE NUMBERS CONTROLS */}
            {(tool.id === 'add-page-numbers-to-pdf' || tool.route === '/add-page-numbers-to-pdf') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomSelect
                  label="Position:"
                  value={pageNumberPos}
                  onChange={(val) => setPageNumberPos(val)}
                  options={[
                    { value: 'bottom-center', label: 'Bottom Center (Standard)' },
                    { value: 'bottom-right', label: 'Bottom Right' },
                    { value: 'top-right', label: 'Top Right' },
                    { value: 'bottom-left', label: 'Bottom Left' },
                  ]}
                />
                <CustomSelect
                  label="Numbering Format:"
                  value={pageNumberFormat}
                  onChange={(val) => setPageNumberFormat(val)}
                  options={[
                    { value: 'page_of_total', label: 'Page X of Y (e.g. Page 1 of 12)' },
                    { value: 'number', label: 'Single Number (e.g. 1, 2, 3)' },
                  ]}
                />
              </div>
            )}

            {/* PASSWORD SECURITY CONTROLS */}
            {(tool.id === 'protect-pdf' || tool.route === '/protect-pdf') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Set Password:"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter secure password"
                />
                <Input
                  label="Confirm Password:"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Re-enter password"
                />
              </div>
            )}

            {/* SIGN PDF CANVAS */}
            {(tool.id === 'sign-pdf' || tool.route === '/sign-pdf') && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSigMode('draw')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      sigMode === 'draw' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    Draw Signature
                  </button>
                  <button
                    onClick={() => setSigMode('type')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      sigMode === 'type' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    Type Cursive
                  </button>
                </div>

                {sigMode === 'draw' ? (
                  <div className="space-y-2">
                    <canvas
                      ref={sigCanvasRef}
                      width={450}
                      height={140}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-36 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl cursor-crosshair touch-none"
                    />
                    <button
                      onClick={clearCanvas}
                      className="text-xs text-red-500 hover:underline font-semibold"
                    >
                      Clear signature
                    </button>
                  </div>
                ) : (
                  <Input
                    type="text"
                    value={typedSig}
                    onChange={(e) => setTypedSig(e.target.value)}
                    placeholder="Type signature..."
                  />
                )}
              </div>
            )}

            {/* METADATA CONTROLS */}
            {(tool.id === 'pdf-metadata' || tool.route === '/pdf-metadata') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Title:"
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
                <Input
                  label="Author:"
                  type="text"
                  value={metaAuthor}
                  onChange={(e) => setMetaAuthor(e.target.value)}
                />
                <Input
                  label="Subject:"
                  type="text"
                  value={metaSubject}
                  onChange={(e) => setMetaSubject(e.target.value)}
                />
              </div>
            )}

            {/* ACTION EXECUTE BUTTON */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isProcessing}
                leftIcon={CheckCircle2}
                onClick={handleExecute}
              >
                {isProcessing ? (statusMessage || 'Processing...') : `Process ${tool.name}`}
              </Button>

              {isProcessing && (
                <div className="mt-3 space-y-1.5">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-slate-500">{processingProgress}% complete</p>
                </div>
              )}
            </div>
          </div>

          {/* Results Display Area */}
          {resultBlob && (
            <div className="p-6 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-4 animate-in fade-in">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Document Ready for Download
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {resultFileName} • {formatFileSize(resultBlob.size)}
                    </p>
                  </div>
                </div>

                <a
                  href={resultUrl!}
                  download={resultFileName}
                  className="py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-md shadow-emerald-600/25 transition-all"
                >
                  <Download className="h-4 w-4" />
                  Download Result
                </a>
              </div>

              {/* Compression Metric Stats Card */}
              {resultStats && resultStats.originalSize > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-800/40 text-xs">
                  <div>
                    <span className="text-slate-500 block">Original Size:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {formatFileSize(resultStats.originalSize)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Output Size:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatFileSize(resultStats.outputSize)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Bytes Saved:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {formatFileSize(resultStats.savedBytes)} ({resultStats.reductionPercentage}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Status:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 truncate block">
                      {resultStats.statusText}
                    </span>
                  </div>
                </div>
              )}

              {/* Extracted Images Grid (for PDF to Images) */}
              {extractedImages.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Extracted Images ({extractedImages.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {extractedImages.map((img) => (
                      <div
                        key={img.page}
                        className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white p-2 text-center space-y-2"
                      >
                        <img src={img.url} alt={`Page ${img.page}`} className="w-full h-32 object-contain bg-slate-50 rounded-lg" />
                        <a
                          href={img.url}
                          download={img.fileName}
                          className="block w-full py-1 text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          Download Page {img.page}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Text Area */}
              {extractedText && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Extracted Text</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(extractedText);
                        showToast('Text copied to clipboard!', 'success');
                      }}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy Text
                    </button>
                  </div>
                  <Textarea
                    readOnly
                    value={extractedText}
                    rows={8}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
