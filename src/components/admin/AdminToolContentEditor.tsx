import React, { useState, useEffect, useMemo, useRef } from 'react';
import { VisualRichTextEditor } from './VisualRichTextEditor';
import { ALL_TOOLS } from '../../config/tools';
import { ToolContentService } from '../../services/ToolContentService';
import { ToolDetailContent, ToolFaqItem } from '../../types/toolCms';
import { extractTocHeadings } from '../common/TableOfContents';
import { ContentRenderer } from '../common/ContentRenderer';
import { DynamicFaqAccordion } from '../common/DynamicFaqAccordion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { CustomSelect } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { Modal } from '../ui/Modal';
import {
  FileText,
  Search,
  HelpCircle,
  Eye,
  Save,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  List,
  Heading2,
  Heading3,
  Heading4,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Table as TableIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';

export function stripOuterParagraphTags(str: string): string {
  if (!str) return '';
  return str
    .replace(/^<p\b[^>]*>/i, '')
    .replace(/<\/p>$/i, '')
    .trim();
}

interface AdminToolContentEditorProps {
  toolId: string;
  onBack: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminToolContentEditor: React.FC<AdminToolContentEditorProps> = ({
  toolId,
  onBack,
  showToast,
}) => {
  const tool = useMemo(() => ALL_TOOLS.find((t) => t.id === toolId || t.slug === toolId), [toolId]);

  const [locale, setLocale] = useState('en');
  const [content, setContent] = useState<ToolDetailContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'faqs' | 'settings'>('content');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Load CMS data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    ToolContentService.getToolContent(toolId, locale).then((data) => {
      if (isMounted) {
        setContent(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [toolId, locale]);

  // Real-time Outline Headings
  const outlineHeadings = useMemo(() => {
    return content ? extractTocHeadings(content.contentHtml) : [];
  }, [content?.contentHtml]);

  // Health Checks
  const healthWarnings = useMemo(() => {
    return content ? ToolContentService.runHealthCheck(content) : [];
  }, [content]);

  if (loading || !content) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-xs font-bold text-slate-500">Loading CMS editor for {toolId}...</p>
      </div>
    );
  }

  // Update handlers
  const updateSeoField = (field: keyof ToolDetailContent['seo'], value: any) => {
    setContent((prev) => prev ? { ...prev, seo: { ...prev.seo, [field]: value } } : null);
  };

  const updateContentHtml = (newHtml: string) => {
    setContent((prev) => {
      if (!prev) return null;
      const updated = { ...prev, contentHtml: newHtml };
      updated.metrics = ToolContentService.calculateMetrics(newHtml, prev.faqs);
      return updated;
    });
  };

  const insertHtmlTag = (openTag: string, closeTag: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = `${openTag}${selectedText || 'Sample text'}${closeTag}`;

    const newContent =
      textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    updateContentHtml(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, start + openTag.length + selectedText.length);
    }, 50);
  };

  // FAQ Handlers
  const handleAddFaq = () => {
    const newFaq: ToolFaqItem = {
      id: `faq_${Date.now()}`,
      question: 'New Question?',
      answerHtml: '<p>Answer details...</p>',
      order: content.faqs.length + 1,
      enabled: true,
    };
    setContent((prev) => (prev ? { ...prev, faqs: [...prev.faqs, newFaq] } : null));
  };

  const handleUpdateFaq = (index: number, field: keyof ToolFaqItem, value: any) => {
    setContent((prev) => {
      if (!prev) return null;
      const nextFaqs = [...prev.faqs];
      nextFaqs[index] = { ...nextFaqs[index], [field]: value };
      return { ...prev, faqs: nextFaqs };
    });
  };

  const handleDeleteFaq = (index: number) => {
    setContent((prev) => {
      if (!prev) return null;
      const nextFaqs = prev.faqs.filter((_, i) => i !== index);
      return { ...prev, faqs: nextFaqs };
    });
  };

  const handleMoveFaq = (index: number, direction: 'up' | 'down') => {
    setContent((prev) => {
      if (!prev) return null;
      const nextFaqs = [...prev.faqs];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= nextFaqs.length) return prev;

      const temp = nextFaqs[index];
      nextFaqs[index] = nextFaqs[targetIndex];
      nextFaqs[targetIndex] = temp;

      return { ...prev, faqs: nextFaqs };
    });
  };

  // Action handlers
  const handleSaveDraft = async () => {
    await ToolContentService.saveToolContent({ ...content, status: 'draft' });
    showToast('Saved draft content successfully', 'success');
  };

  const handlePublish = async () => {
    const publishedContent = { ...content, status: 'published' as const, publishedAt: Date.now() };
    await ToolContentService.saveToolContent(publishedContent);
    setContent(publishedContent);
    showToast(`Published ${tool?.name || toolId} SEO content`, 'success');
  };

  const handleUnpublish = async () => {
    const unpublishedContent = { ...content, status: 'unpublished' as const };
    await ToolContentService.saveToolContent(unpublishedContent);
    setContent(unpublishedContent);
    showToast('Unpublished tool content', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Back to tools table"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {tool?.name || toolId}
              </h2>
              <span
                className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wider ${
                  content.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : content.status === 'draft'
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                }`}
              >
                {content.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Route: /{content.seo.slug} • Locale: {content.locale.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Locale & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-32">
            <CustomSelect
              value={locale}
              onChange={(val) => setLocale(val)}
              options={[
                { value: 'en', label: 'English (EN)' },
                { value: 'ar', label: 'Arabic (AR)' },
                { value: 'es', label: 'Spanish (ES)' },
                { value: 'fr', label: 'French (FR)' },
                { value: 'de', label: 'German (DE)' },
              ]}
            />
          </div>

          <Button variant="outline" size="sm" leftIcon={Save} onClick={handleSaveDraft}>
            Save Draft
          </Button>

          <Button variant="secondary" size="sm" leftIcon={Eye} onClick={() => setIsPreviewOpen(true)}>
            Preview
          </Button>

          {content.status !== 'published' ? (
            <Button variant="primary" size="sm" leftIcon={CheckCircle2} onClick={handlePublish}>
              Publish
            </Button>
          ) : (
            <Button variant="destructive" size="sm" onClick={handleUnpublish}>
              Unpublish
            </Button>
          )}
        </div>
      </div>

      {/* Editor Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'content', label: 'Rich Content', icon: FileText },
          { id: 'seo', label: 'SEO & Metadata', icon: Search },
          { id: 'faqs', label: `FAQs (${content.faqs.length})`, icon: HelpCircle },
          { id: 'settings', label: 'Quality & Health', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: RICH CONTENT EDITOR & LIVE OUTLINE */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor Column */}
          <div className="lg:col-span-2 space-y-4">

            {/* Intro Lead Paragraph */}
            <Textarea
              label="Intro Lead Paragraph (Above TOC)"
              value={stripOuterParagraphTags(content.introHtml)}
              onChange={(e) => {
                const text = e.target.value;
                const formatted = text ? `<p class="lead">${text}</p>` : '';
                setContent((prev) => (prev ? { ...prev, introHtml: formatted } : null));
              }}
              rows={2}
              placeholder="Short catchy introduction..."
            />

            {/* Visual WYSIWYG Rich Text Editor */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                Long-Form Rich Content (Visual Editor)
              </label>
              <VisualRichTextEditor
                value={content.contentHtml}
                onChange={(newHtml) => updateContentHtml(newHtml)}
                minHeight="420px"
              />
            </div>
          </div>

          {/* Sidebar: Real-time TOC Outline & Metrics */}
          <div className="space-y-6">
            {/* Auto Content Outline */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-black uppercase text-slate-900 dark:text-white">
                <List className="h-4 w-4 text-primary" />
                <span>Auto Content Outline ({outlineHeadings.length})</span>
              </div>

              {outlineHeadings.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No H2, H3, or H4 headings detected yet.</p>
              ) : (
                <ul className="space-y-1.5 text-xs">
                  {outlineHeadings.map((h) => (
                    <li
                      key={h.id}
                      className={`truncate ${
                        h.level === 3 ? 'pl-3 text-slate-600 dark:text-slate-400' : 'font-semibold text-slate-900 dark:text-white'
                      }`}
                    >
                      <span className="text-[10px] font-mono text-primary mr-1.5">H{h.level}</span>
                      <span>{h.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Live Quality Metrics</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Words</span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">{content.metrics.wordCount}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Headings</span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">{content.metrics.headingCount}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Active FAQs</span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">{content.metrics.faqCount}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-slate-400 block text-[10px]">Internal Links</span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">{content.metrics.internalLinkCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SEO & METADATA */}
      {activeTab === 'seo' && (
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
          <div className="space-y-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Tool Page Display Header</h3>
            <Input
              label="Tool Page Title (H1 Display Title)"
              value={content.seo.h1Title ?? tool?.name ?? ''}
              onChange={(e) => updateSeoField('h1Title', e.target.value)}
              placeholder="e.g. YouTube Thumbnail Downloader"
            />

            <Textarea
              label="Tool Header Subheading Description"
              value={content.seo.headerDescription ?? tool?.fullDescription ?? ''}
              onChange={(e) => updateSeoField('headerDescription', e.target.value)}
              rows={2}
              placeholder="Official YouTube thumbnail grabber. Extracts uncompressed MaxRes (1280×720)..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="SEO Title Tag (<title>)"
                value={content.seo.seoTitle}
                onChange={(e) => updateSeoField('seoTitle', e.target.value)}
                placeholder="Target SEO Title..."
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {content.seo.seoTitle.length} characters (Recommended: 50–60)
              </span>
            </div>

            <div>
              <Input
                label="URL Slug / Custom Route"
                value={content.seo.slug}
                onChange={(e) => updateSeoField('slug', e.target.value)}
                placeholder="youtube-thumbnail-downloader"
              />
            </div>
          </div>

          <div>
            <Textarea
              label="Meta Description"
              value={content.seo.metaDescription}
              onChange={(e) => updateSeoField('metaDescription', e.target.value)}
              rows={3}
              placeholder="High-converting search snippet..."
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              {content.seo.metaDescription.length} characters (Recommended: 150–160)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Canonical URL (Optional Override)"
              value={content.seo.canonicalUrl || ''}
              onChange={(e) => updateSeoField('canonicalUrl', e.target.value)}
              placeholder="https://aetherpix.com/compress-image"
            />

            <div className="flex items-center gap-6 pt-6">
              <Switch
                label="Index Page (Robots)"
                checked={content.seo.robotsIndex}
                onChange={(val) => updateSeoField('robotsIndex', val)}
              />
              <Switch
                label="Follow Links (Robots)"
                checked={content.seo.robotsFollow}
                onChange={(val) => updateSeoField('robotsFollow', val)}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FAQ MANAGER */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dynamic FAQ List</h3>
            <Button variant="primary" size="sm" leftIcon={Plus} onClick={handleAddFaq}>
              Add FAQ
            </Button>
          </div>

          <div className="space-y-4">
            {content.faqs.map((faq, index) => (
              <div
                key={faq.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-mono font-bold text-slate-400">#{index + 1}</span>
                    <Input
                      value={faq.question}
                      onChange={(e) => handleUpdateFaq(index, 'question', e.target.value)}
                      placeholder="Question title..."
                      className="font-bold text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Switch
                      checked={faq.enabled}
                      onChange={(val) => handleUpdateFaq(index, 'enabled', val)}
                    />

                    <button
                      onClick={() => handleMoveFaq(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveFaq(index, 'down')}
                      disabled={index === content.faqs.length - 1}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(index)}
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <Textarea
                  value={stripOuterParagraphTags(faq.answerHtml)}
                  onChange={(e) => {
                    const text = e.target.value;
                    const formatted = text ? `<p>${text}</p>` : '';
                    handleUpdateFaq(index, 'answerHtml', formatted);
                  }}
                  rows={2}
                  placeholder="Answer explanation text..."
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: QUALITY & HEALTH */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Automated Content & SEO Health Report</span>
          </h3>

          {healthWarnings.length === 0 ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Great job! No SEO or formatting warnings detected.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {healthWarnings.map((w) => (
                <div
                  key={w.id}
                  className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${
                    w.type === 'error'
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                      : w.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">{w.message}</strong>
                    <span className="text-slate-500 dark:text-slate-400">{w.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LIVE PREVIEW MODAL */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={`Live Preview: ${tool?.name || toolId}`}
        size="full"
      >
        <div className="space-y-6 py-4 max-w-5xl mx-auto">
          {/* Mock Lead */}
          <div dangerouslySetInnerHTML={{ __html: content.introHtml }} />

          {/* Render Content */}
          <ContentRenderer html={content.contentHtml} />

          {/* Render FAQs */}
          <DynamicFaqAccordion faqs={content.faqs} toolName={tool?.name} />
        </div>
      </Modal>
    </div>
  );
};
