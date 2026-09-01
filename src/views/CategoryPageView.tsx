import React from 'react';
import { CategorySeoEntry } from '../types/seo';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { getBreadcrumbsForRoute } from '../config/seoRegistry';
import { DynamicToolService } from '../services/DynamicToolService';
import { useApp } from '../context/AppContext';
import { ToolCard } from '../components/common/ToolCard';
import { Sparkles, CheckCircle, HelpCircle, ChevronDown, Layers, ArrowRight, Share2, Scaling, FileText, ArrowUpRight } from 'lucide-react';
import { DynamicFaqAccordion } from '../components/common/DynamicFaqAccordion';
import { ExactTargetSizesGrid } from '../components/common/ExactTargetSizesGrid';
import { PopularConvertersGrid } from '../components/common/PopularConvertersGrid';
import { Link } from '../components/common/Link';
import { 
  SOCIAL_PRESETS_MAP, 
  SOCIAL_PRESETS_LIST, 
  PIXEL_DIMENSIONS_LIST, 
  FORMAT_RESIZE_LIST,
  EXACT_IMAGE_TARGET_SIZE_ITEMS,
  EXACT_PDF_TARGET_SIZE_ITEMS,
  createSocialPresetToolDefinition,
  createDimensionResizeToolDefinition,
  createTargetSizeToolDefinition,
  createPdfTargetSizeToolDefinition
} from '../config/targetSizeTools';
import { ToolDefinition } from '../types';

interface CategoryPageViewProps {
  category: CategorySeoEntry;
}

export const CategoryPageView: React.FC<CategoryPageViewProps> = ({ category }) => {
  const { tools } = useApp();
  const allTools = tools && tools.length > 0 ? tools : DynamicToolService.getAllTools();
  const breadcrumbs = getBreadcrumbsForRoute(`/${category.slug}`);

  // Synthesize virtual tools (social presets, target sizes, etc.) for this category
  const categoryVirtualTools: ToolDefinition[] = React.useMemo(() => {
    const virtuals: ToolDefinition[] = [];

    if (category.id === 'image-resizer-tools' || category.slug === 'image-resizer-tools') {
      for (const key of Object.keys(SOCIAL_PRESETS_MAP)) {
        const slug = `resize-image-for-${key}`;
        virtuals.push(createSocialPresetToolDefinition(slug, key));
      }
      for (const dim of PIXEL_DIMENSIONS_LIST) {
        const match = dim.slug.match(/(\d+)x(\d+)/);
        if (match) {
          virtuals.push(createDimensionResizeToolDefinition(dim.slug, parseInt(match[1], 10), parseInt(match[2], 10)));
        }
      }
    }

    if (category.id === 'image-compressor-tools' || category.slug === 'image-compressor-tools') {
      for (const item of EXACT_IMAGE_TARGET_SIZE_ITEMS) {
        const imgFormat = item.format === 'image/png' || item.format === 'image/webp' ? item.format : 'image/jpeg';
        virtuals.push(createTargetSizeToolDefinition(item.slug, item.targetSizeKb, imgFormat, item.type));
      }
    }

    if (category.id === 'pdf-tools' || category.slug === 'pdf-tools') {
      for (const item of EXACT_PDF_TARGET_SIZE_ITEMS) {
        virtuals.push(createPdfTargetSizeToolDefinition(item.slug, item.targetSizeKb));
      }
    }

    return virtuals;
  }, [category.id, category.slug]);

  // Match tools belonging to this category + include synthesized virtual tools
  const matchingTools = React.useMemo(() => {
    const toolMap = new Map<string, ToolDefinition>();

    // Dynamic category stems for fuzzy matching (e.g., 'pdf-tools' -> 'pdf', 'developer-tools' -> 'developer')
    const catIdLower = (category.id || '').toLowerCase();
    const catSlugLower = (category.slug || '').toLowerCase();
    const categoryTags = (category.matchingCategories || [category.id, category.slug]).map((c) => c.toLowerCase());

    const cleanCatId = catIdLower.replace(/^(image-|pdf-)/, '').replace(/-tools$/, '');
    const cleanCatSlug = catSlugLower.replace(/^(image-|pdf-)/, '').replace(/-tools$/, '');

    // 1. Base tools from catalog (using dynamic category tags from Firebase)
    allTools.forEach((tool) => {
      if (tool.id === category.id || tool.slug === category.slug) return;
      
      const rawToolCat = (tool.category || '').toLowerCase();
      const cleanToolCat = rawToolCat.replace(/^(image-|pdf-)/, '').replace(/-tools$/, '');

      const belongs =
        catIdLower === 'image-tools' ||
        catIdLower === 'tools' ||
        catIdLower === 'all' ||
        rawToolCat === catIdLower ||
        rawToolCat === catSlugLower ||
        categoryTags.includes(rawToolCat) ||
        cleanToolCat === cleanCatId ||
        cleanToolCat === cleanCatSlug ||
        (cleanCatId === 'resizer' && (cleanToolCat === 'resize' || cleanToolCat === 'crop')) ||
        (cleanCatId === 'compressor' && cleanToolCat === 'compress') ||
        (cleanCatId === 'converter' && cleanToolCat === 'convert') ||
        (cleanCatId === 'editing' && (cleanToolCat === 'edit' || cleanToolCat === 'crop' || cleanToolCat === 'effects' || cleanToolCat === 'passport')) ||
        (cleanCatId === 'developer' && (cleanToolCat === 'ocr' || cleanToolCat === 'metadata' || cleanToolCat === 'dev')) ||
        (catIdLower === 'ai-image-tools' && (tool.isAi || cleanToolCat === 'ai')) ||
        (catIdLower === 'youtube-tools' && (tool.id.includes('youtube') || tool.slug?.includes('youtube') || cleanToolCat === 'youtube')) ||
        (catIdLower === 'pdf-tools' && (tool.id.includes('pdf') || tool.slug?.includes('pdf') || cleanToolCat === 'pdf'));

      if (belongs) {
        toolMap.set(tool.slug || tool.id, tool);
      }
    });

    // 2. Synthesized category tools
    categoryVirtualTools.forEach((vTool) => {
      if (!toolMap.has(vTool.slug || vTool.id)) {
        toolMap.set(vTool.slug || vTool.id, vTool);
      }
    });

    return Array.from(toolMap.values());
  }, [allTools, category.id, category.slug, category.matchingCategories, categoryVirtualTools]);

  const categorySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.h1,
    description: category.description,
    url: `https://aetherpix.studio/${category.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: matchingTools.map((t, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: t.name,
        url: `https://aetherpix.studio${t.route}`,
      })),
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((b, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: b.name,
      item: b.url.startsWith('http') ? b.url : `https://aetherpix.studio${b.url}`,
    })),
  };

  return (
    <div className="space-y-10 py-6 max-w-6xl mx-auto">
      {/* Dynamic JSON-LD Structured Data Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Category Hero Header */}
      <div className="space-y-4 border-b border-slate-200/80 pb-8 dark:border-slate-800">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
          <Layers className="h-3.5 w-3.5" />
          <span>Curated Utility Hub • {matchingTools.length} Tools Available</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {category.h1}
        </h1>

        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300 max-w-4xl">
          {category.description}
        </p>
      </div>

      {/* Tools Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Available Utilities in this Hub
          </h2>
          <span className="text-xs text-slate-500">{matchingTools.length} Utilities</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {matchingTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>

      {/* Category-Specific Target Presets & Social Media Hubs */}
      {category.id === 'image-resizer-tools' && (
        <div className="space-y-10 pt-6 border-t border-slate-200/80 dark:border-slate-800">
          {/* Social Media Aspect Ratio Presets */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                <span>Social Media Aspect Ratio Presets</span>
              </h2>
              <p className="text-xs text-slate-500">
                Official width & height dimensions for Instagram, YouTube, LinkedIn, Twitter, Facebook, and TikTok
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {SOCIAL_PRESETS_LIST.map((preset) => {
                const targetRoute = DynamicToolService.getToolBySlug(preset.slug)?.route || `/${preset.slug}`;
                return (
                  <Link
                    key={preset.slug}
                    href={targetRoute}
                    className="group flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-primary hover:shadow-md dark:border-slate-800 dark:bg-slate-900 transition-all cursor-pointer"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10">
                        {preset.platform}
                      </span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {preset.name}
                      </p>
                      <p className="text-xs font-semibold text-slate-500">
                        {preset.dimensions}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Popular Pixel Dimension Benchmarks */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scaling className="h-5 w-5 text-emerald-500" />
                <span>Exact Pixel Dimension Presets</span>
              </h2>
              <p className="text-xs text-slate-500">
                Instantly scale JPEG, PNG, or WebP images to exact resolution benchmarks
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {PIXEL_DIMENSIONS_LIST.map((item) => {
                const targetRoute = DynamicToolService.getToolBySlug(item.slug)?.route || `/${item.slug}`;
                return (
                  <Link
                    key={item.slug}
                    href={targetRoute}
                    className="group p-3 rounded-xl border border-slate-200/80 bg-white hover:border-emerald-500 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900 text-center transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      {item.desc}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Target KB & Format-Specific Resizers */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <span>Format-Specific & Target KB Size Resizers</span>
              </h2>
              <p className="text-xs text-slate-500">
                Pre-configured target byte size ceilings and format specifications
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {FORMAT_RESIZE_LIST.map((item) => {
                const targetRoute = DynamicToolService.getToolBySlug(item.slug)?.route || `/${item.slug}`;
                return (
                  <Link
                    key={item.slug}
                    href={targetRoute}
                    className="group p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-blue-500 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {item.format}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors mt-1">
                        {item.label}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-transform shrink-0" />
                  </Link>
                );
              })}
            </div>

            <ExactTargetSizesGrid
              title="Target File Size Limits (KB & MB)"
              defaultFilter="image"
            />
          </section>
        </div>
      )}

      {(category.id === 'image-compressor-tools' || category.id === 'pdf-tools') && (
        <section className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <ExactTargetSizesGrid
            title={category.id === 'pdf-tools' ? 'Target PDF File Sizes' : 'Popular Target File & Dimension Presets'}
            defaultFilter={category.id === 'pdf-tools' ? 'pdf' : 'all'}
          />
        </section>
      )}

      {category.id === 'image-converter-tools' && (
        <section className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Popular Instant Format Converters
          </h2>
          <PopularConvertersGrid />
        </section>
      )}

      {/* Key Workflows Checklist */}
      {category.keyWorkflows && category.keyWorkflows.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recommended Workflows & Capabilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {category.keyWorkflows.map((workflow, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-medium text-slate-800 dark:text-slate-200">{workflow}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQs Section */}
      {category.faq && category.faq.length > 0 && (
        <DynamicFaqAccordion faqs={category.faq} toolName={category.name} />
      )}
    </div>
  );
};
