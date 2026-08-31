import { CategorySeoEntry } from '../types/seo';
import { DynamicCategoryService } from '../services/DynamicCategoryService';

// All category data lives in Firestore (via DynamicCategoryService).
export const CATEGORIES_REGISTRY: CategorySeoEntry[] = [];

export function getCategoryBySlug(slug: string): CategorySeoEntry | undefined {
  return DynamicCategoryService.getCategoryBySlug(slug);
}
