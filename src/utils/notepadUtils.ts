import { WritingStats } from '../types/notepad';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

/**
 * Accurately calculate writing statistics across all languages including Latin, Arabic, CJK, and Indic scripts.
 */
export function calculateWritingStats(text: string): WritingStats {
  if (!text || text.trim() === '') {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      paragraphs: 0,
      sentences: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
    };
  }

  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const characters = cleanText.length;
  const charactersNoSpaces = cleanText.replace(/\s+/g, '').length;

  // Words calculation: Handles Latin whitespace splitting and CJK glyph counting
  const wordsMatch = cleanText.trim().match(/[\p{L}\p{N}_\-]+|[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/gu);
  const words = wordsMatch ? wordsMatch.length : 0;

  // Paragraphs calculation (non-empty blocks)
  const paragraphList = cleanText
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  const paragraphs = Math.max(1, paragraphList.length);

  // Sentences calculation
  const sentenceMatches = cleanText.match(/[^.!?؟।]+[.!?؟।]+(\s|$)/g);
  const sentences = sentenceMatches ? sentenceMatches.length : (words > 0 ? 1 : 0);

  // Reading time: Average 200 words per minute
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  // Speaking time: Average 130 words per minute
  const speakingTimeMinutes = Math.max(1, Math.ceil(words / 130));

  return {
    words,
    characters,
    charactersNoSpaces,
    paragraphs,
    sentences,
    readingTimeMinutes,
    speakingTimeMinutes,
  };
}

/**
 * Strip HTML tags and extract clean plain text.
 */
export function extractPlainTextFromHtml(html: string): string {
  if (!html) return '';
  if (typeof document === 'undefined') {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.innerText || tempDiv.textContent || '';
}

/**
 * Sanitize a string for safe filesystem saving.
 */
export function sanitizeFileName(name: string, defaultName = 'untitled-note'): string {
  if (!name || !name.trim()) return defaultName;
  const clean = name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return clean.slice(0, 80) || defaultName;
}

/**
 * Download a blob/string to the user's filesystem.
 */
export function triggerFileDownload(content: BlobPart, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Convert HTML formatted content into clean Markdown.
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';
  let md = html;

  // Headings
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');

  // Text formatting
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_');
  md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
  md = md.replace(/<strike[^>]*>(.*?)<\/strike>/gi, '~~$1~~');

  // Code
  md = md.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n');

  // Lists
  md = md.replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1\n');
  md = md.replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1\n');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');

  // Paragraphs & Line Breaks
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br\s*[\/]?>/gi, '\n');
  md = md.replace(/<hr\s*[\/]?>/gi, '\n---\n\n');

  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  md = md
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Clean excessive blank lines
  return md.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Convert simple markdown/plain text into clean formatted HTML for import.
 */
export function markdownToHtml(md: string): string {
  if (!md) return '';
  let html = md;

  // Escape basic HTML entities first
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold / Italic / Strike
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/~~(.*?)~~/g, '<s>$1</s>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Bullet Lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gis, '<ul>$1</ul>');

  // Paragraphs
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<blockquote')
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .join('\n');

  return html;
}

/**
 * Generate a standalone, styled HTML document for export.
 */
export function generateExportableHtml(title: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Untitled Note'} - AetherPix Notepad</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      color: #1e293b;
      line-height: 1.7;
    }
    h1, h2, h3 { color: #0f172a; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 700; }
    h1 { font-size: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }
    p { margin: 1em 0; }
    blockquote { border-inline-start: 4px solid #8b5cf6; margin: 1.5em 0; padding: 0.5em 1em; color: #475569; background: #f8fafc; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
    pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; overflow-x: auto; }
    ul, ol { padding-inline-start: 24px; margin: 1em 0; }
    li { margin-bottom: 0.3em; }
    .meta-footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 0.85em; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <h1>${title || 'Untitled Note'}</h1>
  <div class="note-body">
    ${contentHtml || '<p><em>Empty note</em></p>'}
  </div>
  <div class="meta-footer">
    Exported from AetherPix Free Online Notepad • https://aetherpix.studio/online-notepad
  </div>
</body>
</html>`;
}

/**
 * Generate a valid, downloadable PDF file using pdf-lib.
 */
export async function generatePdfFromNote(title: string, plainText: string): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  const pageWidth = 595.28; // A4 width in points
  const pageHeight = 841.89; // A4 height in points
  const contentWidth = pageWidth - margin * 2;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Title
  const cleanTitle = title || 'Untitled Note';
  page.drawText(cleanTitle, {
    x: margin,
    y: y - 20,
    size: 20,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.2),
  });

  // Divider
  y -= 35;
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.9),
  });

  y -= 25;

  // Body text wrapping
  const fontSize = 11;
  const lineHeight = 16;
  const lines = plainText.split('\n');

  for (const rawLine of lines) {
    if (!rawLine.trim()) {
      y -= lineHeight * 0.8;
      if (y < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      continue;
    }

    // Split long lines by word wrapping
    const words = rawLine.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (textWidth < contentWidth) {
        currentLine = testLine;
      } else {
        if (y < margin + 30) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }

        page.drawText(currentLine, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0.15, 0.15, 0.18),
        });

        y -= lineHeight;
        currentLine = word;
      }
    }

    if (currentLine) {
      if (y < margin + 30) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }

      page.drawText(currentLine, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0.15, 0.15, 0.18),
      });

      y -= lineHeight;
    }
  }

  // Footer on all pages
  const totalPages = pdfDoc.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    const p = pdfDoc.getPage(i);
    p.drawText(`Page ${i + 1} of ${totalPages} • AetherPix Online Notepad`, {
      x: margin,
      y: 25,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.55),
    });
  }

  const pdfBytes = await pdfDoc.save();
  const filename = `${sanitizeFileName(title)}.pdf`;
  triggerFileDownload(pdfBytes, filename, 'application/pdf');
}

/**
 * Generate a genuine Microsoft Word (.docx) document using docx package.
 */
export async function generateDocxFromNote(title: string, plainText: string): Promise<void> {
  const paragraphs = plainText.split('\n').map((line) => {
    return new Paragraph({
      children: [
        new TextRun({
          text: line,
          font: 'Arial',
          size: 24, // 12pt
        }),
      ],
      spacing: { after: 120 },
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title || 'Untitled Note',
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 240 },
          }),
          ...paragraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${sanitizeFileName(title)}.docx`;
  triggerFileDownload(
    blob,
    filename,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
}

/**
 * Print note content in clean, printer-friendly layout.
 */
export function printNote(title: string, contentHtml: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title || 'Untitled Note'} - Print</title>
        <style>
          body {
            font-family: serif;
            color: #000;
            padding: 40px;
            line-height: 1.6;
          }
          h1 {
            font-size: 24pt;
            border-bottom: 2px solid #333;
            padding-bottom: 8px;
            margin-bottom: 20px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${title || 'Untitled Note'}</h1>
        <div>${contentHtml}</div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}
