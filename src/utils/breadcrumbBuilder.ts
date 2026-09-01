import { SeoBreadcrumbItem } from '../types/seo';
import { routes } from '../config/routes';
import { DEFAULT_LANGUAGE } from '../i18n/config';

export interface BreadcrumbBuilderOptions {
  locale?: string;
  category?: { name: string; slug: string };
  tool?: { name: string; slug: string; categorySlug?: string };
  customTrail?: { name: string; slug: string }[];
}

/**
 * Builds unified breadcrumb trails for both UI navigation and JSON-LD schema generation.
 */
export function buildBreadcrumbs(options: BreadcrumbBuilderOptions = {}): SeoBreadcrumbItem[] {
  const locale = options.locale || DEFAULT_LANGUAGE;
  const items: SeoBreadcrumbItem[] = [
    { name: 'Home', url: routes.home(locale) }
  ];

  if (options.category) {
    items.push({
      name: options.category.name,
      url: routes.category(options.category.slug, locale),
    });
  }

  if (options.tool) {
    const catSlug = options.tool.categorySlug || (options.category ? options.category.slug : undefined);
    items.push({
      name: options.tool.name,
      url: routes.tool(options.tool.slug, catSlug, locale),
    });
  }

  if (options.customTrail) {
    options.customTrail.forEach((crumb) => {
      items.push({
        name: crumb.name,
        url: routes.category(crumb.slug, locale),
      });
    });
  }

  return items;
}
