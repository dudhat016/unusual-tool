import React from 'react';
import { ToolDefinition } from '../../types';
import { ToolDetailContent } from '../../types/toolCms';

interface SeoSchemaProps {
  tool: ToolDefinition;
  cmsContent?: ToolDetailContent;
}

export const SeoSchema: React.FC<SeoSchemaProps> = ({ tool, cmsContent }) => {
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://aetherpix.com/${tool.slug}`;
  const title = cmsContent?.seo?.h1Title || tool.name;
  const description = cmsContent?.seo?.metaDescription || cmsContent?.headerDescription || tool.shortDescription;

  // 1. SoftwareApplication Schema
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: title,
    description: description,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any (Web Browser)',
    url: pageUrl,
    offers: {
      '@type': 'Offer',
      price: '0.00',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1240',
      bestRating: '5',
      worstRating: '1',
    },
  };

  // 2. HowTo Schema if usage steps are present
  const steps = cmsContent?.howToSteps || tool.howToSteps || [];
  const howToSchema =
    steps.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: `How to use ${tool.name}`,
          description: `Follow these simple steps to process your file using ${tool.name}.`,
          step: steps.map((step, idx) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            name: step.title,
            text: step.description,
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
    </>
  );
};
