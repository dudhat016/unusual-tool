import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ALL_TOOLS } from '../config/tools';
import { getSeoForRoute } from '../config/seoRegistry';
import { ToolDetailContent, ToolFaqItem, ToolSeoHealthWarning } from '../types/toolCms';

const LOCAL_STORAGE_KEY = 'aetherpix_tool_contents_v1';

export class ToolContentService {
  /**
   * Generates default baseline CMS content for any tool if custom admin content has not been created yet.
   */
  public static getDefaultContent(toolId: string, locale: string = 'en'): ToolDetailContent {
    const tool = ALL_TOOLS.find((t) => t.id === toolId || t.slug === toolId);
    const route = tool?.route || `/${toolId}`;
    const seoData = getSeoForRoute(route);

    const toolName = tool?.name || toolId;
    const category = tool?.category || 'Image Processing';

    const defaultFaqs: ToolFaqItem[] = (tool?.faqs || seoData?.faq || [
      {
        question: `Is ${toolName} free to use?`,
        answer: `Yes, ${toolName} is 100% free with no registration or hidden subscriptions required.`,
      },
      {
        question: `Are my files uploaded to a remote server?`,
        answer: `No. ${toolName} operates 100% client-side inside your web browser. Your files never leave your device.`,
      },
      {
        question: `What formats are supported by ${toolName}?`,
        answer: `Supports major standard formats including JPG, PNG, WebP, GIF, SVG, and PDF.`,
      },
    ]).map((f, index) => ({
      id: `faq_${index + 1}`,
      question: f.question,
      answerHtml: `<p>${f.answer}</p>`,
      order: index + 1,
      enabled: true,
    }));

    const defaultContentHtml = `
<h2>What Is ${toolName}?</h2>
<p>${tool?.fullDescription || seoData?.longDescription || `${toolName} is a high-performance web application designed for fast, browser-based media workflows.`}</p>

<h2>How to Use ${toolName}</h2>
<ol>
  <li><strong>Upload File:</strong> Select or drag & drop your media into the secure processing area.</li>
  <li><strong>Configure Settings:</strong> Adjust parameters like size, compression quality, or target format.</li>
  <li><strong>Export Result:</strong> Click process and instantly download your converted file to your device.</li>
</ol>

<h2>Key Features & Technical Advantages</h2>
<ul>
  <li><strong>100% Client-Side Privacy:</strong> Zero server uploads—processing runs locally in WebAssembly.</li>
  <li><strong>Instant Latency:</strong> No network delays or file download queues.</li>
  <li><strong>Cross-Platform:</strong> Works seamlessly across Desktop, Mac, iPhone, Android, and Tablets.</li>
</ul>

<h2>Frequently Asked Questions</h2>
<p>Find instant answers to common questions about using ${toolName} below.</p>
`.trim();

    return {
      id: `${toolId}_${locale}`,
      toolId: tool?.id || toolId,
      locale,
      status: 'published',
      seo: {
        h1Title: tool?.name || toolName,
        headerDescription: tool?.fullDescription || tool?.shortDescription || `Use ${toolName} online for free.`,
        seoTitle: seoData?.title || tool?.seo?.title || `${toolName} – Free Online Browser Tool`,
        metaDescription: seoData?.metaDescription || tool?.seo?.description || tool?.shortDescription || `Use ${toolName} online for free. Fast, private, and 100% browser-based.`,
        slug: tool?.slug || toolId,
        canonicalUrl: seoData?.canonicalUrl || `https://aetherpix.com/${tool?.slug || toolId}`,
        robotsIndex: true,
        robotsFollow: true,
        ogTitle: seoData?.ogTitle || `${toolName} Online`,
        ogDescription: seoData?.ogDescription || tool?.shortDescription,
        twitterCard: 'summary_large_image',
      },
      introHtml: `<p class="lead">${tool?.shortDescription || `Fast, browser-based ${toolName} tool with zero server uploads.`}</p>`,
      contentHtml: defaultContentHtml,
      tags: [category, 'online tool', 'free converter'],
      relatedToolIds: ALL_TOOLS.filter((t) => t.category === category && t.id !== toolId).slice(0, 6).map((t) => t.id),
      tocEnabled: true,
      faqs: defaultFaqs,
      metrics: this.calculateMetrics(defaultContentHtml, defaultFaqs),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      publishedAt: Date.now(),
    };
  }

  /**
   * Helper to load all stored tool contents from localStorage (with Firestore sync).
   */
  private static getStoredContents(): Record<string, ToolDetailContent> {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  private static saveStoredContents(data: Record<string, ToolDetailContent>) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save tool contents to localStorage', e);
    }
  }

  /**
   * Fetch tool content by toolId and locale.
   */
  public static async getToolContent(toolId: string, locale: string = 'en'): Promise<ToolDetailContent> {
    const key = `${toolId}_${locale}`;

    // 1. LocalStorage Check
    const stored = this.getStoredContents();
    if (stored[key]) {
      return stored[key];
    }

    // 2. Firestore Check
    try {
      const docRef = doc(db, 'toolContents', key);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const firestoreData = snap.data() as ToolDetailContent;
        stored[key] = firestoreData;
        this.saveStoredContents(stored);
        return firestoreData;
      }
    } catch (e) {
      console.warn(`Firestore read failed for ${key}, falling back to default content.`, e);
    }

    // 3. Fallback to Default generated content
    return this.getDefaultContent(toolId, locale);
  }

  /**
   * Save draft or published content record.
   */
  public static async saveToolContent(content: ToolDetailContent): Promise<void> {
    content.updatedAt = Date.now();
    content.metrics = this.calculateMetrics(content.contentHtml, content.faqs);

    const key = `${content.toolId}_${content.locale}`;

    // Update LocalStorage
    const stored = this.getStoredContents();
    stored[key] = content;
    this.saveStoredContents(stored);

    // Sync to Firestore if online/configured
    try {
      const docRef = doc(db, 'toolContents', key);
      await setDoc(docRef, content, { merge: true });
    } catch (e) {
      console.warn('Firestore write warning:', e);
    }
  }

  /**
   * Calculates metrics for editorial quality check.
   */
  public static calculateMetrics(html: string, faqs: ToolFaqItem[]) {
    const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = textContent ? textContent.split(' ').filter(Boolean) : [];
    const headings = (html.match(/<h[2-4]/gi) || []).length;
    const internalLinks = (html.match(/href=["']\/[^"']*/gi) || []).length;

    return {
      wordCount: words.length,
      characterCount: textContent.length,
      headingCount: headings,
      faqCount: faqs.filter((f) => f.enabled).length,
      internalLinkCount: internalLinks,
    };
  }

  /**
   * Performs an automated SEO / Editorial Health audit.
   */
  public static runHealthCheck(content: ToolDetailContent): ToolSeoHealthWarning[] {
    const warnings: ToolSeoHealthWarning[] = [];

    // Title Check
    if (!content.seo.seoTitle) {
      warnings.push({
        id: 'title_missing',
        type: 'error',
        message: 'Missing SEO Title',
        recommendation: 'Add a clear SEO Title containing primary keyword and brand name.',
      });
    } else if (content.seo.seoTitle.length < 30 || content.seo.seoTitle.length > 70) {
      warnings.push({
        id: 'title_length',
        type: 'warning',
        message: `SEO Title length is ${content.seo.seoTitle.length} characters (Optimal: 50–60 chars)`,
        recommendation: 'Adjust SEO Title length to prevent truncation in search result snippets.',
      });
    }

    // Meta Description Check
    if (!content.seo.metaDescription) {
      warnings.push({
        id: 'meta_missing',
        type: 'error',
        message: 'Missing Meta Description',
        recommendation: 'Add a high-converting meta description explaining tool benefits.',
      });
    } else if (content.seo.metaDescription.length < 70 || content.seo.metaDescription.length > 170) {
      warnings.push({
        id: 'meta_length',
        type: 'warning',
        message: `Meta Description length is ${content.seo.metaDescription.length} characters (Optimal: 150–160 chars)`,
        recommendation: 'Optimize meta description for target 150–160 character range.',
      });
    }

    // Content Depth Check
    if (content.metrics.wordCount < 150) {
      warnings.push({
        id: 'thin_content',
        type: 'warning',
        message: `Thin Content: Only ${content.metrics.wordCount} words`,
        recommendation: 'Expand explaining sections to provide rich user value and search intent coverage.',
      });
    }

    // Heading Structure Check
    if (content.metrics.headingCount < 2) {
      warnings.push({
        id: 'missing_h2',
        type: 'warning',
        message: 'Fewer than 2 Subheadings (H2/H3)',
        recommendation: 'Use structured H2 and H3 headings to populate Table of Contents automatically.',
      });
    }

    // FAQ Check
    if (content.faqs.filter((f) => f.enabled).length === 0) {
      warnings.push({
        id: 'no_faqs',
        type: 'info',
        message: 'No FAQs Enabled',
        recommendation: 'Add at least 3 relevant FAQs to enable FAQPage JSON-LD structured data.',
      });
    }

    return warnings;
  }
}
