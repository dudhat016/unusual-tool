import React from 'react';
import { ToolDetailContent } from '../../types/toolCms';
import { ToolDefinition } from '../../types';

interface SeoStructuredDataProps {
  tool: ToolDefinition;
  content: ToolDetailContent;
}

export const SeoStructuredData: React.FC<SeoStructuredDataProps> = ({ tool, content }) => {
  const visibleFaqs = (content.faqs || []).filter((f) => f.enabled);

  // 1. WebApplication Schema
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: content.seo.seoTitle || tool.name,
    description: content.seo.metaDescription || tool.shortDescription,
    url: content.seo.canonicalUrl || `https://aetherpix.com${tool.route}`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
  };

  // 2. FAQPage Schema (Only for visible, published FAQs)
  const faqSchema = visibleFaqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: visibleFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answerHtml.replace(/<[^>]*>/g, '').trim(),
      },
    })),
  } : null;

  // 3. BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://aetherpix.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: tool.category.toUpperCase(),
        item: `https://aetherpix.com/category/${tool.category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.name,
        item: content.seo.canonicalUrl || `https://aetherpix.com${tool.route}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
};
