import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Heading2,
  Heading3,
  Heading4,
  Pilcrow as ParagraphIcon,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Table as TableIcon,
  Minus,
  RemoveFormatting,
  Code2,
  Eye,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';

interface VisualRichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  minHeight?: string;
  className?: string;
}

export const VisualRichTextEditor: React.FC<VisualRichTextEditorProps> = ({
  value,
  onChange,
  minHeight = '420px',
  className = '',
}) => {
  const [mode, setMode] = useState<'visual' | 'code'>('visual');
  const editableRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Saved range for restoring selection when modal opens
  const savedRangeRef = useRef<Range | null>(null);

  // Link Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkText, setLinkText] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(false);

  // Active selection formatting states
  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    unorderedList: false,
    orderedList: false,
    blockquote: false,
    code: false,
    heading: 'p', // 'h2' | 'h3' | 'h4' | 'p' | 'blockquote' | 'pre'
    align: 'left', // 'left' | 'center' | 'right' | 'justify'
  });

  // Sync value to editable area when mode changes or initial load
  useEffect(() => {
    if (editableRef.current && !isUpdatingRef.current && mode === 'visual') {
      editableRef.current.innerHTML = value || '<p><br></p>';
    }
  }, [mode, value]);

  const handleVisualInput = () => {
    if (!editableRef.current) return;
    isUpdatingRef.current = true;
    const currentHtml = editableRef.current.innerHTML;
    onChange(currentHtml);
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 50);
  };

  const checkActiveStates = useCallback(() => {
    if (mode !== 'visual' || !editableRef.current) return;

    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const anchorNode = selection.anchorNode;
      if (anchorNode && !editableRef.current.contains(anchorNode)) return;

      const isBold = document.queryCommandState('bold');
      const isItalic = document.queryCommandState('italic');
      const isUnderline = document.queryCommandState('underline');
      const isStrikeThrough = document.queryCommandState('strikeThrough');
      const isUnorderedList = document.queryCommandState('insertUnorderedList');
      const isOrderedList = document.queryCommandState('insertOrderedList');

      // Traversal to detect active block element (h2, h3, h4, blockquote, pre)
      let currentEl: HTMLElement | null =
        anchorNode?.nodeType === Node.ELEMENT_NODE
          ? (anchorNode as HTMLElement)
          : anchorNode?.parentElement || null;

      let detectedHeading = 'p';
      let detectedBlockquote = false;
      let detectedCode = false;
      let detectedAlign = 'left';

      while (currentEl && currentEl !== editableRef.current) {
        const tagName = currentEl.tagName.toLowerCase();
        if (['h2', 'h3', 'h4', 'h1', 'p', 'pre'].includes(tagName)) {
          if (detectedHeading === 'p') detectedHeading = tagName;
        }
        if (tagName === 'blockquote') {
          detectedBlockquote = true;
          detectedHeading = 'blockquote';
        }
        if (tagName === 'pre' || tagName === 'code') {
          detectedCode = true;
        }
        if (currentEl.style.textAlign) {
          detectedAlign = currentEl.style.textAlign;
        }
        currentEl = currentEl.parentElement;
      }

      if (detectedAlign === 'left') {
        if (document.queryCommandState('justifyCenter')) detectedAlign = 'center';
        else if (document.queryCommandState('justifyRight')) detectedAlign = 'right';
        else if (document.queryCommandState('justifyFull')) detectedAlign = 'justify';
      }

      setActiveStates({
        bold: isBold,
        italic: isItalic,
        underline: isUnderline,
        strikeThrough: isStrikeThrough,
        unorderedList: isUnorderedList,
        orderedList: isOrderedList,
        blockquote: detectedBlockquote,
        code: detectedCode,
        heading: detectedHeading,
        align: detectedAlign,
      });
    } catch {}
  }, [mode]);

  useEffect(() => {
    const handleSelectionChange = () => {
      checkActiveStates();
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [checkActiveStates]);

  const execCmd = (command: string, arg: string | undefined = undefined) => {
    if (mode === 'code') return;
    document.execCommand(command, false, arg);
    handleVisualInput();
    checkActiveStates();
    editableRef.current?.focus();
  };

  const handleAlign = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    if (mode === 'code' || !editableRef.current) return;

    const cmdMap: Record<string, string> = {
      left: 'justifyLeft',
      center: 'justifyCenter',
      right: 'justifyRight',
      justify: 'justifyFull',
    };

    document.execCommand(cmdMap[alignment], false);

    // Explicitly apply text-align style to nearest block element so heading alignment always works
    try {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let currentEl: HTMLElement | null =
          selection.anchorNode?.nodeType === Node.ELEMENT_NODE
            ? (selection.anchorNode as HTMLElement)
            : selection.anchorNode?.parentElement || null;

        while (currentEl && currentEl !== editableRef.current) {
          const tag = currentEl.tagName.toLowerCase();
          if (['h1', 'h2', 'h3', 'h4', 'p', 'blockquote', 'div'].includes(tag)) {
            currentEl.style.textAlign = alignment;
            break;
          }
          currentEl = currentEl.parentElement;
        }
      }
    } catch {}

    handleVisualInput();
    checkActiveStates();
    editableRef.current?.focus();
  };

  const handleFormatHeading = (tag: string) => {
    if (tag === 'p') {
      execCmd('formatBlock', '<p>');
    } else {
      execCmd('formatBlock', `<${tag}>`);
    }
  };

  // Open Link Insertion Modal
  const handleOpenLinkModal = () => {
    try {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        savedRangeRef.current = selection.getRangeAt(0);
        const selectedText = selection.toString();
        setLinkText(selectedText);

        // If selection is already an <a> tag, prefill url
        let currentEl: HTMLElement | null =
          selection.anchorNode?.nodeType === Node.ELEMENT_NODE
            ? (selection.anchorNode as HTMLElement)
            : selection.anchorNode?.parentElement || null;

        while (currentEl && currentEl !== editableRef.current) {
          if (currentEl.tagName.toLowerCase() === 'a') {
            const href = currentEl.getAttribute('href') || 'https://';
            const target = currentEl.getAttribute('target');
            setLinkUrl(href);
            setOpenInNewTab(target === '_blank');
            break;
          }
          currentEl = currentEl.parentElement;
        }
      }
    } catch {}

    setIsLinkModalOpen(true);
  };

  // Confirm and insert link HTML
  const handleConfirmInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;

    setIsLinkModalOpen(false);
    editableRef.current?.focus();

    // Restore saved range
    if (savedRangeRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);
      }
    }

    const displayText = linkText.trim() || linkUrl;
    const targetAttr = openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : '';
    const linkHtml = `<a href="${linkUrl}" ${targetAttr} class="text-primary underline font-bold">${displayText}</a>`;

    document.execCommand('insertHTML', false, linkHtml);
    handleVisualInput();
    checkActiveStates();

    // Reset Modal form
    setLinkUrl('https://');
    setLinkText('');
    setOpenInNewTab(false);
    savedRangeRef.current = null;
  };

  const handleInsertTable = () => {
    const tableHtml = `
<table class="w-full border-collapse border border-slate-300 dark:border-slate-700 my-4 text-sm">
  <thead>
    <tr class="bg-slate-100 dark:bg-slate-800 font-bold">
      <th class="border border-slate-300 dark:border-slate-700 p-2.5 text-left">Header 1</th>
      <th class="border border-slate-300 dark:border-slate-700 p-2.5 text-left">Header 2</th>
      <th class="border border-slate-300 dark:border-slate-700 p-2.5 text-left">Header 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="border border-slate-300 dark:border-slate-700 p-2.5">Feature A</td>
      <td class="border border-slate-300 dark:border-slate-700 p-2.5">Supported</td>
      <td class="border border-slate-300 dark:border-slate-700 p-2.5">Fast</td>
    </tr>
    <tr>
      <td class="border border-slate-300 dark:border-slate-700 p-2.5">Feature B</td>
      <td class="border border-slate-300 dark:border-slate-700 p-2.5">100% Free</td>
      <td class="border border-slate-300 dark:border-slate-700 p-2.5">Browser-based</td>
    </tr>
  </tbody>
</table>
<p><br></p>
`.trim();
    execCmd('insertHTML', tableHtml);
  };

  const getButtonClass = (isActive: boolean) =>
    `p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
      isActive
        ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/40 font-black'
        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
    }`;

  return (
    <div className={`rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-xs ${className}`}>
      {/* Editor Top Toolbar */}
      <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-wrap items-center justify-between gap-2 select-none">
        {/* Primary Formatting Controls */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Headings */}
          <button
            type="button"
            onClick={() => handleFormatHeading('h2')}
            className={getButtonClass(activeStates.heading === 'h2')}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
            <span className="hidden sm:inline">H2</span>
          </button>

          <button
            type="button"
            onClick={() => handleFormatHeading('h3')}
            className={getButtonClass(activeStates.heading === 'h3')}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
            <span className="hidden sm:inline">H3</span>
          </button>

          <button
            type="button"
            onClick={() => handleFormatHeading('h4')}
            className={getButtonClass(activeStates.heading === 'h4')}
            title="Heading 4"
          >
            <Heading4 className="h-4 w-4" />
            <span className="hidden sm:inline">H4</span>
          </button>

          <button
            type="button"
            onClick={() => handleFormatHeading('p')}
            className={getButtonClass(activeStates.heading === 'p')}
            title="Normal Paragraph"
          >
            <ParagraphIcon className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Inline styles */}
          <button
            type="button"
            onClick={() => execCmd('bold')}
            className={getButtonClass(activeStates.bold)}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => execCmd('italic')}
            className={getButtonClass(activeStates.italic)}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => execCmd('underline')}
            className={getButtonClass(activeStates.underline)}
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => execCmd('strikeThrough')}
            className={getButtonClass(activeStates.strikeThrough)}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => execCmd('insertUnorderedList')}
            className={getButtonClass(activeStates.unorderedList)}
            title="Bulleted List"
          >
            <List className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => execCmd('insertOrderedList')}
            className={getButtonClass(activeStates.orderedList)}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Alignments */}
          <button
            type="button"
            onClick={() => handleAlign('left')}
            className={getButtonClass(activeStates.align === 'left')}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => handleAlign('center')}
            className={getButtonClass(activeStates.align === 'center')}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => handleAlign('right')}
            className={getButtonClass(activeStates.align === 'right')}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => handleAlign('justify')}
            className={getButtonClass(activeStates.align === 'justify')}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Blocks & Media */}
          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<blockquote>')}
            className={getButtonClass(activeStates.blockquote)}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<pre>')}
            className={getButtonClass(activeStates.code)}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleOpenLinkModal}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Insert Link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleInsertTable}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Insert Info Table"
          >
            <TableIcon className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => execCmd('insertHorizontalRule')}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Horizontal Divider"
          >
            <Minus className="h-4 w-4" />
          </button>

          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => execCmd('undo')}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => execCmd('redo')}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => execCmd('removeFormat')}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-rose-500 cursor-pointer"
            title="Clear Formatting"
          >
            <RemoveFormatting className="h-4 w-4" />
          </button>
        </div>

        {/* View Mode Switcher (Visual vs Code) */}
        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('visual')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'visual'
                ? 'bg-white dark:bg-slate-900 text-primary shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Visual Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('code')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'code'
                ? 'bg-white dark:bg-slate-900 text-primary shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>HTML Code</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {mode === 'visual' ? (
        <div
          ref={editableRef}
          contentEditable
          onInput={() => {
            handleVisualInput();
            checkActiveStates();
          }}
          onBlur={handleVisualInput}
          onClick={checkActiveStates}
          onKeyUp={checkActiveStates}
          onMouseUp={checkActiveStates}
          style={{ minHeight }}
          className="p-5 focus:outline-none max-w-none text-slate-900 dark:text-slate-100
            [&_h2]:text-2xl [&_h2]:font-black [&_h2]:tracking-tight [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-slate-200 dark:[&_h2]:border-slate-800 [&_h2]:pb-2
            [&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:text-slate-800 dark:[&_h3]:text-slate-100 [&_h3]:mt-5 [&_h3]:mb-2.5
            [&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-slate-700 dark:[&_h4]:text-slate-200 [&_h4]:mt-4 [&_h4]:mb-2
            [&_p]:text-sm sm:[&_p]:text-base [&_p]:leading-relaxed [&_p]:my-3 [&_p]:text-slate-700 dark:[&_p]:text-slate-300
            [&_strong]:font-black [&_strong]:text-slate-900 dark:[&_strong]:text-white
            [&_em]:italic [&_em]:text-slate-800 dark:[&_em]:text-slate-200
            [&_u]:underline [&_u]:decoration-primary [&_u]:underline-offset-2
            [&_s]:line-through [&_s]:opacity-75
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ul]:space-y-1.5 [&_ul]:text-slate-700 dark:[&_ul]:text-slate-300
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_ol]:space-y-1.5 [&_ol]:text-slate-700 dark:[&_ol]:text-slate-300
            [&_li]:pl-1
            [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:bg-primary/5 dark:[&_blockquote]:bg-slate-900/60 [&_blockquote]:py-3 [&_blockquote]:px-4 [&_blockquote]:rounded-r-2xl [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-slate-800 dark:[&_blockquote]:text-slate-200
            [&_code]:font-mono [&_code]:bg-slate-100 dark:[&_code]:bg-slate-800 [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-xs [&_code]:font-bold
            [&_pre]:font-mono [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-4 [&_pre]:rounded-2xl [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:text-xs
            [&_a]:text-primary [&_a]:underline [&_a]:font-bold hover:[&_a]:opacity-80
            [&_table]:w-full [&_table]:my-4 [&_table]:text-left [&_table]:text-xs sm:[&_table]:text-sm [&_table]:border-collapse [&_table]:rounded-xl [&_table]:overflow-hidden
            [&_th]:bg-slate-100 dark:[&_th]:bg-slate-800 [&_th]:p-3 [&_th]:font-extrabold [&_th]:border [&_th]:border-slate-200 dark:[&_th]:border-slate-700 [&_th]:text-slate-900 dark:[&_th]:text-white
            [&_td]:p-3 [&_td]:border [&_td]:border-slate-200 dark:[&_td]:border-slate-800 [&_td]:text-slate-700 dark:[&_td]:text-slate-300"
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight }}
          className="w-full p-4 font-mono text-xs sm:text-sm leading-relaxed text-slate-900 dark:text-slate-100 bg-slate-950/5 dark:bg-slate-950 focus:outline-none"
          placeholder="<h2>What Is Image Compression?</h2>..."
        />
      )}

      {/* Insert Hyperlink Modal */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Insert Hyperlink"
        description="Add a web URL or internal route link to the selected text."
        size="md"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmInsertLink}>
              Insert Link
            </Button>
          </div>
        }
      >
        <form onSubmit={handleConfirmInsertLink} className="space-y-4">
          <Input
            label="Link URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com or /compress-image"
            autoFocus
            required
          />

          <Input
            label="Display Text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Anchor text to display..."
          />

          <Checkbox
            checked={openInNewTab}
            onChange={(e) => setOpenInNewTab(e.target.checked)}
            label={
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <span>Open in new tab (`target="_blank"`)</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </span>
            }
          />
        </form>
      </Modal>
    </div>
  );
};
