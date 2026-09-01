import { ToolDefinition } from '../types';
import { parseTargetSizeRoute } from './targetSizeTools';
import { parseConverterRoute } from './converterTools';

// Category metadata — used by Header.tsx and ToolGrid.tsx for filter tabs
export const TOOL_CATEGORIES = [
  { id: 'all', name: 'All Tools', icon: 'Grid' },
  { id: 'ai', name: 'AI Super Tools', icon: 'Sparkles', badge: 'Popular' },
  { id: 'resize', name: 'Resize & Scale', icon: 'Scaling' },
  { id: 'compress', name: 'Compression', icon: 'Minimize2' },
  { id: 'crop', name: 'Crop & Cut', icon: 'Crop' },
  { id: 'convert', name: 'Format Converter', icon: 'RefreshCw' },
  { id: 'passport', name: 'Passport & ID', icon: 'UserSquare2' },
  { id: 'social', name: 'Social Media', icon: 'Share2' },
  { id: 'effects', name: 'Effects & Filters', icon: 'Wand2' },
  { id: 'edit', name: 'Borders & Watermark', icon: 'Stamp' },
  { id: 'ocr', name: 'OCR / Text', icon: 'FileText' },
  { id: 'metadata', name: 'Metadata & EXIF', icon: 'Info' },
  { id: 'developer', name: 'Developer Tools', icon: 'Code', badge: 'New' },
  { id: 'youtube', name: 'YouTube Tools', icon: 'Video', badge: 'New' },
  { id: 'pdf', name: 'PDF Tools', icon: 'FileText', badge: 'Hot' }
];

export const CATEGORIES_METADATA = TOOL_CATEGORIES;

/**
 * All tool data lives in Firestore (via DynamicToolService).
 * These utility functions are kept for route-parsing only.
 * Do NOT import TOOLS_REGISTRY / ALL_TOOLS — use DynamicToolService instead.
 */

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  try {
    const { DynamicToolService } = require('../services/DynamicToolService');
    if (DynamicToolService) return DynamicToolService.getToolBySlug(slug);
  } catch {}
  const cleanSlug = slug.replace(/^\/+|\/+$/g, '');
  const lastSegment = cleanSlug.split('/').pop() || cleanSlug;
  return parseTargetSizeRoute(cleanSlug) || parseTargetSizeRoute(lastSegment) || parseConverterRoute(cleanSlug) || parseConverterRoute(lastSegment);
}

export function getToolByRoute(route: string): ToolDefinition | undefined {
  return getToolBySlug(route);
}

export function getToolsByCategory(_category: string): ToolDefinition[] {
  // Delegate to DynamicToolService — this stub exists for legacy import compatibility
  return [];
}

// Kept for any legacy imports — both are now empty (Firestore is source of truth)
export const TOOLS_REGISTRY: ToolDefinition[] = [];
export const ALL_TOOLS: ToolDefinition[] = [];
