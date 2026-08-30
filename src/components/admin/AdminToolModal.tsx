import React, { useState, useEffect, useMemo } from 'react';
import { ToolDefinition } from '../../types';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Zap,
  Cpu,
  FileImage,
  FileText,
  Sliders,
  Scissors,
  Crop,
  Maximize2,
  Minimize2,
  RefreshCw,
  Palette,
  Shield,
  Eye,
  Camera,
  QrCode,
  Flame,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Code,
  FileType,
  Tag
} from 'lucide-react';

interface AdminToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tool: ToolDefinition) => Promise<void>;
  editingTool?: ToolDefinition | null;
  existingTools: ToolDefinition[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const COMMON_CATEGORIES = [
  'resize',
  'compress',
  'convert',
  'crop',
  'pdf',
  'ai',
  'ocr',
  'effects',
  'utilities',
  'qr',
  'color',
  'social',
  'metadata'
];

const AVAILABLE_ICONS = [
  { name: 'Sparkles', icon: Sparkles, label: 'Sparkles (AI/Magic)' },
  { name: 'Wand2', icon: Sparkles, label: 'Wand (Neural Engine)' },
  { name: 'FileImage', icon: FileImage, label: 'Image File' },
  { name: 'FileText', icon: FileText, label: 'Document / Text' },
  { name: 'FileType', icon: FileType, label: 'File Format / Converter' },
  { name: 'Crop', icon: Crop, label: 'Crop Tool' },
  { name: 'Scissors', icon: Scissors, label: 'Cut / Remove' },
  { name: 'Maximize2', icon: Maximize2, label: 'Upscale / Enlarge' },
  { name: 'Minimize2', icon: Minimize2, label: 'Compress / Shrink' },
  { name: 'Layers', icon: Layers, label: 'Layers / Composite' },
  { name: 'Zap', icon: Zap, label: 'Zap / Fast Utility' },
  { name: 'Cpu', icon: Cpu, label: 'Processor / Neural' },
  { name: 'Palette', icon: Palette, label: 'Color / Palette' },
  { name: 'Eye', icon: Eye, label: 'Visual / OCR' },
  { name: 'Camera', icon: Camera, label: 'Camera / Photo' },
  { name: 'QrCode', icon: QrCode, label: 'QR Code' },
  { name: 'Sliders', icon: Sliders, label: 'Filters / Adjustments' },
  { name: 'RefreshCw', icon: RefreshCw, label: 'Converter / Rotate' },
  { name: 'Flame', icon: Flame, label: 'Popular / Trending' },
  { name: 'Shield', icon: Shield, label: 'Security / Privacy' }
];

const POPULAR_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
  'image/tiff',
  'image/bmp',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/html'
];

export const AdminToolModal: React.FC<AdminToolModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTool,
  existingTools,
  showToast
}) => {
  const isEdit = Boolean(editingTool);

  const [formData, setFormData] = useState<Partial<ToolDefinition>>({
    id: '',
    name: '',
    slug: '',
    route: '',
    category: 'resize',
    shortDescription: '',
    fullDescription: '',
    creditCost: 0,
    maxFileSizeMB: 50,
    processingType: 'browser',
    icon: 'Sparkles',
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    supportsBatch: true,
    requiresAuth: false,
    isPopular: false,
    isNew: false,
    isAi: false,
    isPremiumOnly: false as any,
    maintenanceMode: false as any,
    features: [],
    seo: {
      title: '',
      description: '',
      keywords: [],
      canonicalSlug: ''
    }
  });

  const [customCategory, setCustomCategory] = useState('');
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [customMimeText, setCustomMimeText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'processing' | 'features' | 'seo' | 'flags'>('basic');
  const [iconSearch, setIconSearch] = useState('');

  // Populate form data when modal opens or editingTool changes
  useEffect(() => {
    if (editingTool) {
      setFormData({
        ...editingTool,
        isPremiumOnly: Boolean((editingTool as any).isPremiumOnly || (editingTool as any).isPro),
        maintenanceMode: Boolean((editingTool as any).maintenanceMode),
        supportedFormats: editingTool.supportedFormats || ['image/jpeg', 'image/png', 'image/webp'],
        features: editingTool.features || [],
        seo: {
          title: editingTool.seo?.title || `${editingTool.name} – Free Online Tool | AetherPix`,
          description: editingTool.seo?.description || editingTool.shortDescription || '',
          keywords: editingTool.seo?.keywords || [],
          canonicalSlug: editingTool.seo?.canonicalSlug || editingTool.slug || editingTool.id
        }
      });

      const isKnownCategory = COMMON_CATEGORIES.includes(editingTool.category);
      setUseCustomCategory(!isKnownCategory);
      if (!isKnownCategory) {
        setCustomCategory(editingTool.category);
      }

      setKeywordsText(editingTool.seo?.keywords?.join(', ') || '');
    } else {
      // Default new tool
      setFormData({
        id: '',
        name: '',
        slug: '',
        route: '',
        category: 'resize',
        shortDescription: '',
        fullDescription: '',
        creditCost: 0,
        maxFileSizeMB: 50,
        processingType: 'browser',
        icon: 'Sparkles',
        supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
        supportsBatch: true,
        requiresAuth: false,
        isPopular: false,
        isNew: true,
        isAi: false,
        isPremiumOnly: false as any,
        maintenanceMode: false as any,
        features: [
          '100% Client-Side Privacy & In-Browser Processing',
          'High Quality Output with Zero Server Bottlenecks',
          'Fast Processing Engine with Batch Queue Support'
        ],
        seo: {
          title: '',
          description: '',
          keywords: [],
          canonicalSlug: ''
        }
      });
      setUseCustomCategory(false);
      setCustomCategory('');
      setKeywordsText('');
    }
  }, [editingTool, isOpen]);

  // Auto-generate slug and route when name changes (for new tools only)
  const handleNameChange = (name: string) => {
    if (isEdit) {
      setFormData((prev) => ({ ...prev, name }));
      return;
    }

    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      name,
      id: prev.id ? prev.id : generatedSlug,
      slug: generatedSlug,
      route: `/${generatedSlug}`,
      seo: {
        ...prev.seo,
        title: `${name} – Free Online Tool | AetherPix Studio`,
        description: prev.shortDescription || `Use ${name} online for free. Fast, private in-browser processing.`,
        canonicalSlug: generatedSlug
      }
    }));
  };

  const handleToggleFormat = (mime: string) => {
    const current = formData.supportedFormats || [];
    if (current.includes(mime)) {
      setFormData({
        ...formData,
        supportedFormats: current.filter((f) => f !== mime)
      });
    } else {
      setFormData({
        ...formData,
        supportedFormats: [...current, mime]
      });
    }
  };

  const handleAddCustomFormat = () => {
    if (!customMimeText.trim()) return;
    const formatted = customMimeText.trim().toLowerCase();
    if (!formData.supportedFormats?.includes(formatted)) {
      setFormData({
        ...formData,
        supportedFormats: [...(formData.supportedFormats || []), formatted]
      });
    }
    setCustomMimeText('');
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFormData({
      ...formData,
      features: [...(formData.features || []), newFeatureText.trim()]
    });
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index: number) => {
    const updated = [...(formData.features || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, features: updated });
  };

  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return AVAILABLE_ICONS;
    const q = iconSearch.toLowerCase();
    return AVAILABLE_ICONS.filter(
      (i) => i.name.toLowerCase().includes(q) || i.label.toLowerCase().includes(q)
    );
  }, [iconSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id?.trim()) {
      showToast('Tool ID is required', 'error');
      return;
    }
    if (!formData.name?.trim()) {
      showToast('Display Name is required', 'error');
      return;
    }
    if (!formData.route?.trim()) {
      showToast('Route path is required', 'error');
      return;
    }

    // Check unique ID when creating
    const cleanId = formData.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (!isEdit) {
      const isDuplicate = existingTools.some((t) => t.id === cleanId);
      if (isDuplicate) {
        showToast(`A tool with ID "${cleanId}" already exists in the catalog`, 'error');
        return;
      }
    }

    const cleanRoute = formData.route.trim().startsWith('/') ? formData.route.trim() : `/${formData.route.trim()}`;
    const cleanSlug = (formData.slug || cleanId).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const finalCategory = (useCustomCategory ? customCategory : formData.category) || 'resize';

    // Parse keywords
    const keywordsList = keywordsText
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const finalTool: ToolDefinition = {
      id: cleanId,
      name: formData.name.trim(),
      slug: cleanSlug,
      route: cleanRoute,
      category: finalCategory as any,
      shortDescription: formData.shortDescription?.trim() || `${formData.name} tool.`,
      fullDescription:
        formData.fullDescription?.trim() ||
        `${formData.name} high performance processing utility. Convert, transform, and optimize media directly in your browser.`,
      creditCost: Math.max(0, Number(formData.creditCost) || 0),
      maxFileSizeMB: Math.max(1, Number(formData.maxFileSizeMB) || 50),
      processingType: (formData.processingType as any) || 'browser',
      icon: formData.icon || 'Sparkles',
      supportedFormats: formData.supportedFormats && formData.supportedFormats.length > 0
        ? formData.supportedFormats
        : ['image/jpeg', 'image/png', 'image/webp'],
      supportsBatch: Boolean(formData.supportsBatch),
      requiresAuth: Boolean(formData.requiresAuth),
      isPopular: Boolean(formData.isPopular),
      isNew: Boolean(formData.isNew),
      isAi: Boolean(formData.isAi),
      ...(formData.isPremiumOnly !== undefined ? { isPremiumOnly: Boolean(formData.isPremiumOnly) } : {}),
      ...(formData.maintenanceMode !== undefined ? { maintenanceMode: Boolean(formData.maintenanceMode) } : {}),
      features: formData.features && formData.features.length > 0 ? formData.features : undefined,
      seo: {
        title: formData.seo?.title?.trim() || `${formData.name.trim()} – Free Online Tool | AetherPix Studio`,
        description:
          formData.seo?.description?.trim() ||
          formData.shortDescription ||
          `Use ${formData.name.trim()} online for free. Fast, private in-browser processing.`,
        keywords: keywordsList.length > 0 ? keywordsList : [formData.name.trim().toLowerCase(), 'free online tool', 'image tool'],
        canonicalSlug: cleanSlug
      }
    };

    setIsSubmitting(true);
    try {
      await onSave(finalTool);
      onClose();
    } catch (err) {
      console.error('Failed to submit tool', err);
      showToast('Error saving tool to Firestore', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
              {isEdit ? <Sliders className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {isEdit ? `Edit Tool: ${editingTool?.name}` : 'Register New Dynamic Tool'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEdit
                  ? 'Update tool parameters and save changes to Firestore collection'
                  : 'Add a new dynamic utility to the Firestore catalog'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Tab Navigation */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'basic'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Basic Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('processing')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'processing'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Engine & Formats
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('flags')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'flags'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Access & Flags
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'features'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Features & Highlights ({formData.features?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'seo'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            SEO & Search
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            {/* TAB 1: BASIC INFORMATION */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tool ID (Unique Key) *
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isEdit}
                      value={formData.id || ''}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      placeholder="e.g. crop-image"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-mono disabled:opacity-60"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {isEdit ? 'Tool ID cannot be changed once created.' : 'Lowercase letters, numbers, and dashes.'}
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Crop Image"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Route Path *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.route || ''}
                      onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                      placeholder="e.g. /crop-image"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g. crop-image"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Category *</label>
                    <button
                      type="button"
                      onClick={() => setUseCustomCategory(!useCustomCategory)}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                    >
                      {useCustomCategory ? 'Choose Preset Category' : 'Enter Custom Category'}
                    </button>
                  </div>

                  {useCustomCategory ? (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. watermark, batch, retouch"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
                    />
                  ) : (
                    <select
                      value={formData.category || 'resize'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white capitalize cursor-pointer"
                    >
                      {COMMON_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tool Icon (Lucide Icon)
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search icons (e.g. Sparkles, Crop, FileImage)..."
                          value={iconSearch}
                          onChange={(e) => setIconSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Icon Name"
                        value={formData.icon || 'Sparkles'}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="w-32 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-32 overflow-y-auto p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
                      {filteredIcons.map((item) => {
                        const IconComp = item.icon;
                        const isSelected = formData.icon === item.name;
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon: item.name })}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                                : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <IconComp className="h-4 w-4 mb-1" />
                            <span className="text-[9px] truncate max-w-full">{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Short & Full Description */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Short Description (Hero & Card Subtitle)
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription || ''}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Brief 1-sentence description..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Description (Tool Overview & CMS Lead)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.fullDescription || ''}
                    onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                    placeholder="Detailed explanation of tool capabilities..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white resize-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: PROCESSING & FORMATS */}
            {activeTab === 'processing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Processing Engine *
                    </label>
                    <select
                      value={formData.processingType || 'browser'}
                      onChange={(e) => setFormData({ ...formData, processingType: e.target.value as any })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="browser">In-Browser WASM / Canvas</option>
                      <option value="ai">Gemini AI Neural Engine</option>
                      <option value="server">Server-Side Pipeline</option>
                      <option value="hybrid">Hybrid Engine</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Credit Cost per Run
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.creditCost || 0}
                      onChange={(e) => setFormData({ ...formData, creditCost: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">0 = Free for all registered users</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Max File Size Limit (MB)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={formData.maxFileSizeMB || 50}
                      onChange={(e) => setFormData({ ...formData, maxFileSizeMB: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Supported MIME Types Picker */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Supported MIME File Formats
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {POPULAR_MIME_TYPES.map((mime) => {
                      const isSelected = formData.supportedFormats?.includes(mime);
                      return (
                        <button
                          key={mime}
                          type="button"
                          onClick={() => handleToggleFormat(mime)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {mime}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom MIME format */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add custom MIME (e.g. image/heic, audio/mp3)..."
                      value={customMimeText}
                      onChange={(e) => setCustomMimeText(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomFormat}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
                    >
                      Add MIME
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ACCESS & FLAGS */}
            {activeTab === 'flags' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pro Only Toggle */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Shield className="h-4 w-4 text-purple-500" />
                        <span>Pro Tier Exclusive</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Restrict execution to paid Pro subscribers</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean((formData as any).isPremiumOnly)}
                      onChange={(e) => setFormData({ ...formData, isPremiumOnly: e.target.checked } as any)}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Maintenance Mode Toggle */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                        <span>Maintenance Lock</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Temporarily disable tool with banner notice</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean((formData as any).maintenanceMode)}
                      onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked } as any)}
                      className="h-4 w-4 text-rose-600 rounded focus:ring-rose-500 cursor-pointer"
                    />
                  </div>

                  {/* AI Neural Toggle */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                        <span>AI Neural Engine</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Flags tool as AI-driven in badges and telemetry</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isAi)}
                      onChange={(e) => setFormData({ ...formData, isAi: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Popular Featured Toggle */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Flame className="h-4 w-4 text-amber-500" />
                        <span>Popular Highlight</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Highlight on homepage & quick access drawers</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isPopular)}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* New Badge Toggle */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Tag className="h-4 w-4 text-emerald-500" />
                        <span>New Release Badge</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Displays bright "NEW" badge on tool card</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isNew)}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Batch Queue Toggle */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-indigo-500" />
                        <span>Batch Processing Support</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Allow users to drop multiple files at once</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.supportsBatch)}
                      onChange={(e) => setFormData({ ...formData, supportsBatch: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FEATURES & BULLET POINTS */}
            {activeTab === 'features' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Key Features & Value Propositions
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Bullet points displayed on the tool hero section and summary metadata.
                  </p>

                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Add a key feature (e.g. 100% private in-browser canvas rendering)..."
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {formData.features?.length === 0 ? (
                      <p className="text-slate-400 text-center py-4 italic">No features listed yet.</p>
                    ) : (
                      formData.features?.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{feat}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(idx)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SEO & SEARCH */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Meta Title (Browser Tab & Google SERP)
                  </label>
                  <input
                    type="text"
                    value={formData.seo?.title || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, title: e.target.value } as any
                      })
                    }
                    placeholder="e.g. Free Image Resizer – Resize Photos Online in Seconds"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.seo?.description || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        seo: { ...formData.seo, description: e.target.value } as any
                      })
                    }
                    placeholder="Search snippet description under 160 characters..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Search Keywords (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={keywordsText}
                    onChange={(e) => setKeywordsText(e.target.value)}
                    placeholder="e.g. resize image, free photo resizer, shrink photo"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 shrink-0">
            <div className="text-[11px] text-slate-400">
              <span className="font-bold text-slate-600 dark:text-slate-300">Firestore Path:</span>{' '}
              <span className="font-mono">/tools/{formData.id || 'new'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving to Firestore...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isEdit ? 'Update Tool in Firestore' : 'Save Tool to Firestore'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
