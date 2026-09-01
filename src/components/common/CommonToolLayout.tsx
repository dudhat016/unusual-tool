import React, { useEffect, useState, useMemo } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { ContentRenderer } from './ContentRenderer';
import { DynamicFaqAccordion } from './DynamicFaqAccordion';
import { RelatedTools } from './RelatedTools';
import { RecentlyUsedTools, recordRecentlyUsedTool } from './RecentlyUsedTools';
import { SeoStructuredData } from './SeoStructuredData';
import { TableOfContents } from './TableOfContents';
import { ToolHeaderSEO } from './ToolHeaderSEO';
import { getBreadcrumbsForRoute } from '../../config/seoRegistry';
import { ToolContentService } from '../../services/ToolContentService';
import { ToolDefinition } from '../../types';
import { ToolDetailContent } from '../../types/toolCms';

export interface CommonToolLayoutProps {
  tool: ToolDefinition;
  children: React.ReactNode;
  content?: ToolDetailContent | null;
  customBreadcrumbs?: Array<{ label: string; href?: string }>;
  className?: string;
  hideToc?: boolean;
  hideContent?: boolean;
  hideFaqs?: boolean;
  hideRelated?: boolean;
  hideRecentlyUsed?: boolean;
}

export const CommonToolLayout: React.FC<CommonToolLayoutProps> = ({
  tool,
  children,
  content: propContent,
  customBreadcrumbs,
  className = '',
  hideToc = false,
  hideContent = false,
  hideFaqs = false,
  hideRelated = false,
  hideRecentlyUsed = false,
}) => {
  const currentLanguage = 'en';
  const [cmsContent, setCmsContent] = useState<ToolDetailContent | null>(propContent || null);

  // Subscribe to real-time CMS content if not provided as prop
  useEffect(() => {
    if (propContent) {
      setCmsContent(propContent);
      return;
    }
    let isMounted = true;
    const unsub = ToolContentService.subscribeToToolContent(tool.id, currentLanguage || 'en', (data) => {
      if (isMounted) setCmsContent(data);
    });
    return () => {
      isMounted = false;
      unsub();
    };
  }, [tool.id, propContent, currentLanguage]);

  // Record tool in recently used tracker
  useEffect(() => {
    if (tool.id) {
      recordRecentlyUsedTool(tool.id);
    }
  }, [tool.id]);

  const defaultContent = useMemo(() => {
    return ToolContentService.getDefaultContent(tool.id, currentLanguage);
  }, [tool.id, currentLanguage]);

  const effectiveContent = (cmsContent && cmsContent.status === 'published') ? cmsContent : defaultContent;

  const rawPath = typeof window !== 'undefined' ? window.location.pathname : (tool.route || `/${tool.slug}`);
  const routePath = rawPath.replace(/^\/(?:en|es|de|fr|hi|ja|zh|pt|it|ar)(?=\/|$)/i, '') || tool.route || `/${tool.slug}`;
  const breadcrumbs = customBreadcrumbs || getBreadcrumbsForRoute(routePath);

  return (
    <div className={`space-y-8 py-6 max-w-6xl mx-auto px-4 sm:px-6 ${className}`}>
      {/* Dynamic JSON-LD Structured Data Schema */}
      <SeoStructuredData tool={tool} content={effectiveContent} />

      {/* 1. Breadcrumb Navigation */}
      <Breadcrumbs items={breadcrumbs} />

      {/* 2. Title & 3. Description Header */}
      <ToolHeaderSEO tool={tool} content={effectiveContent} />

      {/* 4. Tool Feature Workspace (Dropzone, Canvas, or Controls) */}
      <div className="w-full">
        {children}
      </div>

      {/* 5. Table of Contents & 6. Editor Content & 7. FAQs */}
      {(!hideToc || !hideContent || !hideFaqs) && (
        <div className="pt-6 space-y-8">
          {/* 5. Table of Contents */}
          {!hideToc && effectiveContent.tocEnabled && effectiveContent.contentHtml && (
            <div className="w-full">
              <TableOfContents html={effectiveContent.contentHtml} />
            </div>
          )}

          {/* 6. Editor / CMS Content Body */}
          {!hideContent && effectiveContent.contentHtml && (
            <div className="w-full">
              <ContentRenderer html={effectiveContent.contentHtml} />
            </div>
          )}

          {/* 7. FAQs */}
          {!hideFaqs && effectiveContent.faqs && effectiveContent.faqs.length > 0 && (
            <DynamicFaqAccordion faqs={effectiveContent.faqs} toolName={tool.name} />
          )}
        </div>
      )}

      {/* 8. Related Tools */}
      {!hideRelated && (
        <RelatedTools currentToolId={tool.id} category={tool.category} />
      )}

      {/* 9. Recently Used Tools */}
      {!hideRecentlyUsed && (
        <RecentlyUsedTools currentToolId={tool.id} />
      )}
    </div>
  );
};
