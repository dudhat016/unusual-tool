import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { DynamicToolService } from './DynamicToolService';
import { BlogService } from './BlogService';
import { DynamicSeoService } from './DynamicSeoService';
import { ToolDefinition } from '../types';
import { BlogPostItem } from '../types/blog';
import {
  FirestoreAuditItem,
  FirestoreAuditSummary,
  AuditIssue,
  AuditMetaStatus,
  AuditSocialStatus,
  AuditContentStatus,
  AuditIssueSeverity,
} from '../types/seoAudit';

function stripHtml(html: string = ''): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(text: string = ''): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

function hasPlaceholder(text: string = ''): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes('lorem ipsum') ||
    lower.includes('sample text') ||
    lower.includes('test test') ||
    lower.includes('[object object]') ||
    lower.includes('todo: add') ||
    lower.includes('placeholder')
  );
}

function countHeadings(html: string = ''): number {
  if (!html) return 0;
  const matches = html.match(/<h[1-6][^>]*>/gi);
  return matches ? matches.length : 0;
}

export class SeoAuditService {
  private static lastSummary: FirestoreAuditSummary | null = null;

  /**
   * Scans 'tools' and 'blogs' collections in Firestore and calculates comprehensive SEO audits
   */
  public static async runFirestoreAudit(forceFreshFirestore: boolean = false): Promise<FirestoreAuditSummary> {
    let tools: ToolDefinition[] = [];
    let blogs: BlogPostItem[] = [];

    if (forceFreshFirestore) {
      try {
        const toolsSnap = await getDocs(collection(db, 'tools'));
        if (!toolsSnap.empty) {
          tools = toolsSnap.docs.map((d) => ({ ...(d.data() as ToolDefinition), id: d.id }));
        } else {
          tools = DynamicToolService.getAllTools();
        }
      } catch (err) {
        console.warn('Firestore tools fetch fallback to cache:', err);
        tools = DynamicToolService.getAllTools();
      }

      try {
        const blogsSnap = await getDocs(collection(db, 'blogs'));
        if (!blogsSnap.empty) {
          blogs = blogsSnap.docs.map((d) => ({ ...(d.data() as BlogPostItem), id: d.id }));
        } else {
          blogs = BlogService.getAllPosts();
        }
      } catch (err) {
        console.warn('Firestore blogs fetch fallback to cache:', err);
        blogs = BlogService.getAllPosts();
      }
    } else {
      tools = DynamicToolService.getAllTools();
      blogs = BlogService.getAllPosts();
    }

    const auditedItems: FirestoreAuditItem[] = [];

    // 1. Audit all Tools from Firestore collection
    for (const tool of tools) {
      if ((tool as any).isDeleted) continue;
      const auditedTool = this.auditTool(tool);
      auditedItems.push(auditedTool);
    }

    // 2. Audit all Blog Posts from Firestore collection
    for (const blog of blogs) {
      const auditedBlog = this.auditBlogPost(blog);
      auditedItems.push(auditedBlog);
    }

    // Calculate aggregations
    const totalScanned = auditedItems.length;
    const toolsCount = auditedItems.filter((i) => i.type === 'tool').length;
    const blogsCount = auditedItems.filter((i) => i.type === 'blog').length;

    let totalScore = 0;
    let criticalIssuesCount = 0;
    let warningsCount = 0;
    let optimizedCount = 0;
    let missingMetaDescCount = 0;
    let missingSocialTagsCount = 0;
    let thinContentCount = 0;
    let missingFaqsCount = 0;

    for (const item of auditedItems) {
      totalScore += item.overallScore;

      const hasCritical = item.issues.some((i) => i.severity === 'critical');
      const hasWarning = item.issues.some((i) => i.severity === 'warning');

      if (hasCritical) criticalIssuesCount++;
      else if (hasWarning) warningsCount++;
      else optimizedCount++;

      if (!item.metaStatus.hasMetaDescription || item.metaStatus.metaDescriptionStatus === 'missing') {
        missingMetaDescCount++;
      }
      if (!item.socialStatus.hasOgTitle || !item.socialStatus.hasOgDescription || !item.socialStatus.hasOgImage) {
        missingSocialTagsCount++;
      }
      if (item.contentStatus.isThinContent) {
        thinContentCount++;
      }
      if (item.contentStatus.faqCount === 0) {
        missingFaqsCount++;
      }
    }

    const overallHealthScore = totalScanned > 0 ? Math.round(totalScore / totalScanned) : 100;

    const summary: FirestoreAuditSummary = {
      scannedAt: new Date().toISOString(),
      totalScanned,
      toolsCount,
      blogsCount,
      overallHealthScore,
      criticalIssuesCount,
      warningsCount,
      optimizedCount,
      missingMetaDescCount,
      missingSocialTagsCount,
      thinContentCount,
      missingFaqsCount,
      items: auditedItems,
    };

    this.lastSummary = summary;
    return summary;
  }

  /**
   * Evaluates a Tool document against SEO rules
   */
  public static auditTool(tool: ToolDefinition): FirestoreAuditItem {
    const issues: AuditIssue[] = [];
    const route = tool.route || `/${tool.slug || tool.id}`;
    const dynamicSeo = DynamicSeoService.getSeoForRoute(route);

    // Meta Title
    const metaTitle =
      tool.seo?.title ||
      dynamicSeo?.title ||
      tool.name ||
      '';
    const titleLength = metaTitle.length;
    let titleScore = 100;

    if (!metaTitle) {
      titleScore = 0;
      issues.push({
        id: `tool_${tool.id}_missing_title`,
        severity: 'critical',
        category: 'title',
        field: 'title',
        message: 'Missing SEO Title Tag',
        recommendation: 'Add a distinct title tag containing primary keyword and brand suffix.',
        impact: 'high',
      });
    } else if (titleLength < 30) {
      titleScore = 60;
      issues.push({
        id: `tool_${tool.id}_short_title`,
        severity: 'warning',
        category: 'title',
        field: 'title',
        message: `SEO Title is too short (${titleLength} chars)`,
        recommendation: 'Target 50–60 characters to maximize search snippet real estate.',
        impact: 'medium',
      });
    } else if (titleLength > 68) {
      titleScore = 75;
      issues.push({
        id: `tool_${tool.id}_long_title`,
        severity: 'warning',
        category: 'title',
        field: 'title',
        message: `SEO Title may be truncated (${titleLength} chars)`,
        recommendation: 'Keep title under 65 characters to prevent Google desktop truncation.',
        impact: 'medium',
      });
    }

    // Meta Description
    const metaDesc =
      tool.seo?.description ||
      tool.shortDescription ||
      dynamicSeo?.metaDescription ||
      '';
    const metaDescriptionLength = metaDesc.length;
    let metaDescStatus: 'missing' | 'too_short' | 'too_long' | 'optimal' = 'optimal';
    let metaScore = 100;

    if (!metaDesc || metaDesc.trim() === '') {
      metaDescStatus = 'missing';
      metaScore = 0;
      issues.push({
        id: `tool_${tool.id}_missing_meta_desc`,
        severity: 'critical',
        category: 'meta_description',
        field: 'metaDescription',
        message: 'Missing Meta Description',
        recommendation: 'Add a compelling meta description (140–160 chars) highlighting benefits.',
        impact: 'high',
      });
    } else if (metaDescriptionLength < 60) {
      metaDescStatus = 'too_short';
      metaScore = 50;
      issues.push({
        id: `tool_${tool.id}_short_meta_desc`,
        severity: 'warning',
        category: 'meta_description',
        field: 'metaDescription',
        message: `Meta description is too short (${metaDescriptionLength} chars)`,
        recommendation: 'Expand to 130–160 characters with clear call-to-action.',
        impact: 'medium',
      });
    } else if (metaDescriptionLength > 165) {
      metaDescStatus = 'too_long';
      metaScore = 70;
      issues.push({
        id: `tool_${tool.id}_long_meta_desc`,
        severity: 'warning',
        category: 'meta_description',
        field: 'metaDescription',
        message: `Meta description exceeds optimal length (${metaDescriptionLength} chars)`,
        recommendation: 'Shorten to under 160 characters to avoid SERP ellipsis truncation.',
        impact: 'low',
      });
    }

    // Canonical & Primary Keyword
    const canonicalUrl = tool.seo?.canonicalSlug
      ? `https://aetherpix.studio/${tool.seo.canonicalSlug.replace(/^\/+/, '')}`
      : `https://aetherpix.studio${route}`;
    const primaryKeyword = tool.seo?.keywords?.[0] || dynamicSeo?.primaryKeyword || tool.name;

    const metaStatus: AuditMetaStatus = {
      metaTitle,
      titleLength,
      metaDescription: metaDesc,
      metaDescriptionLength,
      hasMetaDescription: Boolean(metaDesc && metaDesc.trim() !== ''),
      metaDescriptionStatus: metaDescStatus,
      canonicalUrl,
      hasCanonical: Boolean(canonicalUrl),
      primaryKeyword,
      hasKeyword: Boolean(primaryKeyword),
      score: Math.round((titleScore + metaScore) / 2),
    };

    // Social Tags (OpenGraph / Twitter)
    const ogTitle = metaTitle;
    const ogDescription = metaDesc;
    const ogImage = dynamicSeo?.ogImage || '/og-image.png';
    const hasOgTitle = Boolean(ogTitle);
    const hasOgDescription = Boolean(ogDescription);
    const hasOgImage = Boolean(ogImage);
    const hasTwitterCard = true;

    let socialScore = 100;
    if (!hasOgTitle) {
      socialScore -= 30;
      issues.push({
        id: `tool_${tool.id}_missing_og_title`,
        severity: 'warning',
        category: 'social_tags',
        field: 'ogTitle',
        message: 'Missing OpenGraph Title (og:title)',
        recommendation: 'Define high-impact social title for Facebook/Twitter cards.',
        impact: 'medium',
      });
    }
    if (!hasOgDescription) {
      socialScore -= 30;
      issues.push({
        id: `tool_${tool.id}_missing_og_desc`,
        severity: 'warning',
        category: 'social_tags',
        field: 'ogDescription',
        message: 'Missing OpenGraph Description (og:description)',
        recommendation: 'Add clear summary for social link sharing previews.',
        impact: 'medium',
      });
    }
    if (!hasOgImage) {
      socialScore -= 40;
      issues.push({
        id: `tool_${tool.id}_missing_og_image`,
        severity: 'critical',
        category: 'social_tags',
        field: 'ogImage',
        message: 'Missing Social Share Image (og:image)',
        recommendation: 'Provide high-res 1200x630px thumbnail preview image.',
        impact: 'high',
      });
    }
    socialScore = Math.max(0, socialScore);

    const socialStatus: AuditSocialStatus = {
      ogTitle,
      ogDescription,
      ogImage,
      twitterCard: 'summary_large_image',
      hasOgTitle,
      hasOgDescription,
      hasOgImage,
      hasTwitterCard,
      score: socialScore,
    };

    // Content Quality
    const rawContent = `${tool.fullDescription || ''} ${(tool.features || []).join(' ')} ${(tool.howToSteps || []).map((s) => `${s.title} ${s.description}`).join(' ')}`;
    const wordCount = countWords(stripHtml(rawContent)) + countWords(tool.shortDescription);
    const isThinContent = wordCount < 100;
    const faqCount = (tool.faqs || dynamicSeo?.faq || []).length;
    const hasHowToSteps = Boolean(tool.howToSteps && tool.howToSteps.length > 0);
    const stepCount = tool.howToSteps ? tool.howToSteps.length : 0;
    const hasFeatures = Boolean(tool.features && tool.features.length > 0);
    const hasPlaceholderText = hasPlaceholder(rawContent) || hasPlaceholder(metaDesc);

    let contentScore = 100;
    if (isThinContent) {
      contentScore -= 40;
      issues.push({
        id: `tool_${tool.id}_thin_content`,
        severity: 'critical',
        category: 'content_quality',
        field: 'fullDescription',
        message: `Thin Content: Only ${wordCount} words total`,
        recommendation: 'Expand tool description and feature documentation to at least 150+ words.',
        impact: 'high',
      });
    }
    if (faqCount === 0) {
      contentScore -= 20;
      issues.push({
        id: `tool_${tool.id}_no_faqs`,
        severity: 'warning',
        category: 'faq',
        field: 'faqs',
        message: 'No FAQ Items Defined',
        recommendation: 'Add 3+ Frequently Asked Questions to qualify for FAQPage rich snippet in SERPs.',
        impact: 'medium',
      });
    }
    if (!hasHowToSteps) {
      contentScore -= 15;
      issues.push({
        id: `tool_${tool.id}_no_steps`,
        severity: 'info',
        category: 'content_quality',
        field: 'howToSteps',
        message: 'Missing Step-by-Step Usage Guide',
        recommendation: 'Add How-To steps to enable HowTo structured data schema.',
        impact: 'low',
      });
    }
    if (hasPlaceholderText) {
      contentScore -= 30;
      issues.push({
        id: `tool_${tool.id}_placeholder_detected`,
        severity: 'critical',
        category: 'content_quality',
        field: 'content',
        message: 'Placeholder / Lorem Ipsum text detected',
        recommendation: 'Replace placeholder copy with genuine user-facing instructions.',
        impact: 'high',
      });
    }
    contentScore = Math.max(0, contentScore);

    const contentStatus: AuditContentStatus = {
      wordCount,
      isThinContent,
      readingTimeMinutes: Math.max(1, Math.round(wordCount / 200)),
      headingCount: countHeadings(tool.fullDescription || '') + (hasHowToSteps ? 2 : 0),
      faqCount,
      hasHowToSteps,
      stepCount,
      hasFeatures,
      hasPlaceholderText,
      contentScore,
    };

    // Overall Score (Weighted: Meta 40%, Social 25%, Content 35%)
    const overallScore = Math.round(
      metaStatus.score * 0.4 + socialStatus.score * 0.25 + contentStatus.contentScore * 0.35
    );

    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
    if (overallScore < 50) grade = 'F';
    else if (overallScore < 65) grade = 'D';
    else if (overallScore < 75) grade = 'C';
    else if (overallScore < 88) grade = 'B';

    return {
      id: tool.id,
      type: 'tool',
      collection: 'tools',
      name: tool.name,
      slug: tool.slug || tool.id,
      route,
      status: tool.maintenanceMode ? 'draft' : 'published',
      overallScore,
      grade,
      metaStatus,
      socialStatus,
      contentStatus,
      issues,
      rawDoc: tool,
    };
  }

  /**
   * Evaluates a BlogPost document against SEO rules
   */
  public static auditBlogPost(blog: BlogPostItem): FirestoreAuditItem {
    const issues: AuditIssue[] = [];
    const route = `/blog/${blog.slug}`;

    // Meta Title
    const metaTitle = blog.seo?.seoTitle || blog.title || '';
    const titleLength = metaTitle.length;
    let titleScore = 100;

    if (!metaTitle) {
      titleScore = 0;
      issues.push({
        id: `blog_${blog.id}_missing_title`,
        severity: 'critical',
        category: 'title',
        field: 'title',
        message: 'Missing Blog SEO Title',
        recommendation: 'Add target keyword in article headline & title tag.',
        impact: 'high',
      });
    } else if (titleLength < 30) {
      titleScore = 60;
      issues.push({
        id: `blog_${blog.id}_short_title`,
        severity: 'warning',
        category: 'title',
        field: 'title',
        message: `Article title is short (${titleLength} chars)`,
        recommendation: 'Optimize title to 50–60 characters for CTR.',
        impact: 'medium',
      });
    } else if (titleLength > 70) {
      titleScore = 75;
      issues.push({
        id: `blog_${blog.id}_long_title`,
        severity: 'warning',
        category: 'title',
        field: 'title',
        message: `Article title is long (${titleLength} chars)`,
        recommendation: 'Shorten title to prevent Google snippet truncation.',
        impact: 'medium',
      });
    }

    // Meta Description
    const metaDesc = blog.seo?.metaDescription || blog.excerpt || '';
    const metaDescriptionLength = metaDesc.length;
    let metaDescStatus: 'missing' | 'too_short' | 'too_long' | 'optimal' = 'optimal';
    let metaScore = 100;

    if (!metaDesc || metaDesc.trim() === '') {
      metaDescStatus = 'missing';
      metaScore = 0;
      issues.push({
        id: `blog_${blog.id}_missing_meta_desc`,
        severity: 'critical',
        category: 'meta_description',
        field: 'metaDescription',
        message: 'Missing Blog Meta Description / Excerpt',
        recommendation: 'Add a 140–160 character summary that entices searchers to read the guide.',
        impact: 'high',
      });
    } else if (metaDescriptionLength < 70) {
      metaDescStatus = 'too_short';
      metaScore = 55;
      issues.push({
        id: `blog_${blog.id}_short_meta_desc`,
        severity: 'warning',
        category: 'meta_description',
        field: 'metaDescription',
        message: `Blog excerpt/meta description is short (${metaDescriptionLength} chars)`,
        recommendation: 'Expand description to 130–160 characters.',
        impact: 'medium',
      });
    } else if (metaDescriptionLength > 170) {
      metaDescStatus = 'too_long';
      metaScore = 75;
      issues.push({
        id: `blog_${blog.id}_long_meta_desc`,
        severity: 'warning',
        category: 'meta_description',
        field: 'metaDescription',
        message: `Meta description is over 170 characters (${metaDescriptionLength} chars)`,
        recommendation: 'Trim down to under 160 characters.',
        impact: 'low',
      });
    }

    const canonicalUrl = blog.seo?.canonicalUrl || `https://aetherpix.studio/blog/${blog.slug}`;
    const primaryKeyword = blog.tags?.[0] || blog.category || '';

    const metaStatus: AuditMetaStatus = {
      metaTitle,
      titleLength,
      metaDescription: metaDesc,
      metaDescriptionLength,
      hasMetaDescription: Boolean(metaDesc && metaDesc.trim() !== ''),
      metaDescriptionStatus: metaDescStatus,
      canonicalUrl,
      hasCanonical: Boolean(canonicalUrl),
      primaryKeyword,
      hasKeyword: Boolean(primaryKeyword),
      score: Math.round((titleScore + metaScore) / 2),
    };

    // Social Tags
    const ogTitle = metaTitle;
    const ogDescription = metaDesc;
    const ogImage = blog.coverImage || '';
    const hasOgTitle = Boolean(ogTitle);
    const hasOgDescription = Boolean(ogDescription);
    const hasOgImage = Boolean(ogImage && ogImage.trim() !== '');

    let socialScore = 100;
    if (!hasOgTitle) socialScore -= 30;
    if (!hasOgDescription) socialScore -= 30;
    if (!hasOgImage) {
      socialScore -= 40;
      issues.push({
        id: `blog_${blog.id}_missing_cover_image`,
        severity: 'critical',
        category: 'social_tags',
        field: 'coverImage',
        message: 'Missing Featured Cover / OG Image',
        recommendation: 'Upload a 16:9 featured cover image for social previews & rich cards.',
        impact: 'high',
      });
    }
    socialScore = Math.max(0, socialScore);

    const socialStatus: AuditSocialStatus = {
      ogTitle,
      ogDescription,
      ogImage,
      twitterCard: 'summary_large_image',
      hasOgTitle,
      hasOgDescription,
      hasOgImage,
      hasTwitterCard: true,
      score: socialScore,
    };

    // Content Quality (Articles require more depth: 300+ words)
    const cleanText = stripHtml(blog.contentHtml || '');
    const wordCount = countWords(cleanText) + countWords(blog.excerpt);
    const isThinContent = wordCount < 200;
    const headingCount = countHeadings(blog.contentHtml || '');
    const faqCount = (blog.faqs || []).length;
    const hasPlaceholderText = hasPlaceholder(cleanText) || hasPlaceholder(blog.excerpt);

    let contentScore = 100;
    if (isThinContent) {
      contentScore -= 45;
      issues.push({
        id: `blog_${blog.id}_thin_article`,
        severity: 'critical',
        category: 'content_quality',
        field: 'contentHtml',
        message: `Low Article Word Count (${wordCount} words)`,
        recommendation: 'Educational guides should contain at least 300–600+ words for ranking authority.',
        impact: 'high',
      });
    }
    if (headingCount < 2) {
      contentScore -= 20;
      issues.push({
        id: `blog_${blog.id}_missing_headings`,
        severity: 'warning',
        category: 'headings',
        field: 'contentHtml',
        message: 'Fewer than 2 Subheadings (H2/H3)',
        recommendation: 'Break content into readable sections with H2 and H3 tags.',
        impact: 'medium',
      });
    }
    if (hasPlaceholderText) {
      contentScore -= 30;
      issues.push({
        id: `blog_${blog.id}_placeholder_detected`,
        severity: 'critical',
        category: 'content_quality',
        field: 'contentHtml',
        message: 'Draft / Placeholder text detected in article body',
        recommendation: 'Replace placeholder sections with finalized editorial content.',
        impact: 'high',
      });
    }
    contentScore = Math.max(0, contentScore);

    const contentStatus: AuditContentStatus = {
      wordCount,
      isThinContent,
      readingTimeMinutes: Math.max(1, Math.round(wordCount / 200)),
      headingCount,
      faqCount,
      hasHowToSteps: false,
      stepCount: 0,
      hasFeatures: false,
      hasPlaceholderText,
      contentScore,
    };

    const overallScore = Math.round(
      metaStatus.score * 0.35 + socialStatus.score * 0.3 + contentStatus.contentScore * 0.35
    );

    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
    if (overallScore < 50) grade = 'F';
    else if (overallScore < 65) grade = 'D';
    else if (overallScore < 75) grade = 'C';
    else if (overallScore < 88) grade = 'B';

    return {
      id: blog.id,
      type: 'blog',
      collection: 'blogs',
      name: blog.title,
      slug: blog.slug,
      route,
      status: blog.status,
      overallScore,
      grade,
      metaStatus,
      socialStatus,
      contentStatus,
      issues,
      rawDoc: blog,
    };
  }

  /**
   * Generates AI-optimized SEO metadata and social tags for a tool or blog post
   */
  public static generateOptimizedSeoData(item: FirestoreAuditItem): {
    title: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    keywords: string[];
  } {
    const isTool = item.type === 'tool';
    const name = item.name.replace(/\b(generator|tool|maker|creator)\b/gi, '').trim();

    if (isTool) {
      const toolName = item.name;
      const title = `${toolName} Online – Fast, Free & 100% Private`;
      const metaDescription = `Use our free online ${toolName} for instant, high-quality results. 100% browser-based with zero server uploads, unlimited exports, and maximum privacy.`;
      const ogTitle = `${toolName} | AetherPix Studio`;
      const ogDescription = `Fast, browser-side ${toolName}. Private, free, and works without installation.`;
      const ogImage = item.socialStatus.ogImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=630&q=80';
      const keywords = [
        item.name.toLowerCase(),
        `${item.name.toLowerCase()} online`,
        `free ${item.name.toLowerCase()}`,
        'browser image tool',
        'aetherpix studio',
      ];

      return { title, metaDescription, ogTitle, ogDescription, ogImage, keywords };
    } else {
      const blogTitle = item.name;
      const title = `${blogTitle} | AetherPix Guide`;
      const metaDescription = `Complete guide to ${blogTitle}. Learn step-by-step techniques, best practices, and expert tips for fast digital media workflows.`;
      const ogTitle = blogTitle;
      const ogDescription = metaDescription;
      const ogImage = item.socialStatus.ogImage || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&h=630&q=80';
      const keywords = [
        blogTitle.toLowerCase(),
        'image editing guide',
        'social media mockup tutorial',
        'aetherpix blog',
      ];

      return { title, metaDescription, ogTitle, ogDescription, ogImage, keywords };
    }
  }

  /**
   * Applies auto-generated or edited SEO fixes directly into Firestore
   */
  public static async applyFixToFirestore(
    item: FirestoreAuditItem,
    fixes: {
      title?: string;
      metaDescription?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogImage?: string;
      keywords?: string[];
    }
  ): Promise<boolean> {
    try {
      if (item.type === 'tool') {
        const rawTool = item.rawDoc as ToolDefinition;
        const updatedTool: ToolDefinition = {
          ...rawTool,
          seo: {
            title: fixes.title || rawTool.seo?.title || rawTool.name,
            description: fixes.metaDescription || rawTool.seo?.description || rawTool.shortDescription,
            keywords: fixes.keywords || rawTool.seo?.keywords || [rawTool.name.toLowerCase()],
            canonicalSlug: rawTool.slug || rawTool.id,
          },
          shortDescription: fixes.metaDescription || rawTool.shortDescription,
        };

        await DynamicToolService.saveTool(updatedTool);

        // Also save to dynamic SEO cache/Firestore
        await DynamicSeoService.saveSeoEntry(item.id, {
          id: item.id,
          slug: item.slug,
          title: fixes.title || updatedTool.seo.title,
          metaDescription: fixes.metaDescription || updatedTool.seo.description,
          ogTitle: fixes.ogTitle || fixes.title || updatedTool.seo.title,
          ogDescription: fixes.ogDescription || fixes.metaDescription || updatedTool.seo.description,
          ogImage: fixes.ogImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=630&q=80',
          canonicalUrl: item.route,
        });

        return true;
      } else {
        const rawBlog = item.rawDoc as BlogPostItem;
        const updatedBlog: BlogPostItem = {
          ...rawBlog,
          excerpt: fixes.metaDescription || rawBlog.excerpt,
          coverImage: fixes.ogImage || rawBlog.coverImage || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&h=630&q=80',
          seo: {
            ...rawBlog.seo,
            seoTitle: fixes.title || rawBlog.seo?.seoTitle || rawBlog.title,
            metaDescription: fixes.metaDescription || rawBlog.seo?.metaDescription || rawBlog.excerpt,
            canonicalUrl: item.metaStatus.canonicalUrl,
          },
        };

        await BlogService.savePost(updatedBlog);
        return true;
      }
    } catch (err) {
      console.error('Failed to apply SEO fix to Firestore:', err);
      return false;
    }
  }

  /**
   * Bulk auto-fixes missing meta descriptions across all flagged items
   */
  public static async bulkAutoFixMissingMeta(items: FirestoreAuditItem[]): Promise<{
    fixedCount: number;
    failedCount: number;
  }> {
    let fixedCount = 0;
    let failedCount = 0;

    const targets = items.filter(
      (i) => !i.metaStatus.hasMetaDescription || i.metaStatus.metaDescriptionStatus === 'missing' || i.metaStatus.metaDescriptionLength < 60
    );

    for (const item of targets) {
      const generated = this.generateOptimizedSeoData(item);
      const success = await this.applyFixToFirestore(item, {
        metaDescription: generated.metaDescription,
        title: item.metaStatus.metaTitle || generated.title,
        ogTitle: generated.ogTitle,
        ogDescription: generated.ogDescription,
        ogImage: generated.ogImage,
      });

      if (success) fixedCount++;
      else failedCount++;
    }

    return { fixedCount, failedCount };
  }

  /**
   * Exports the entire audit report as a CSV file
   */
  public static exportReportAsCsv(summary: FirestoreAuditSummary): void {
    const headers = [
      'Type',
      'Name',
      'Collection',
      'Slug/Route',
      'Score',
      'Grade',
      'Meta Title',
      'Meta Description',
      'Meta Length',
      'OG Image Set',
      'Word Count',
      'FAQ Count',
      'Critical Issues Count',
      'Warnings Count',
      'All Issues Summary',
    ];

    const rows = summary.items.map((item) => {
      const issuesText = item.issues.map((i) => `[${i.severity.toUpperCase()}] ${i.message}`).join('; ');
      return [
        `"${item.type}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.collection}"`,
        `"${item.route}"`,
        item.overallScore,
        `"${item.grade}"`,
        `"${item.metaStatus.metaTitle.replace(/"/g, '""')}"`,
        `"${item.metaStatus.metaDescription.replace(/"/g, '""')}"`,
        item.metaStatus.metaDescriptionLength,
        item.socialStatus.hasOgImage ? 'Yes' : 'No',
        item.contentStatus.wordCount,
        item.contentStatus.faqCount,
        item.issues.filter((i) => i.severity === 'critical').length,
        item.issues.filter((i) => i.severity === 'warning').length,
        `"${issuesText.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `seo-audit-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Exports the full audit report as JSON
   */
  public static exportReportAsJson(summary: FirestoreAuditSummary): void {
    const jsonStr = JSON.stringify(summary, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `seo-audit-report-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
