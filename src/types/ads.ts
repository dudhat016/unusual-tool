export type AdSlotPlacement =
  | 'ad_top'
  | 'ad_below_tool'
  | 'ad_sidebar'
  | 'ad_between_sections'
  | 'ad_before_results'
  | 'ad_below_results'
  | 'ad_footer';

export interface AdSlotConfig {
  id: string;
  name: string;
  placement: AdSlotPlacement;
  enabled: boolean;
  device: 'all' | 'desktop' | 'mobile';
  targetCategories?: string[]; // empty means all categories
  targetToolIds?: string[]; // empty means all tools
  format: 'banner' | 'leaderboard' | 'rectangle' | 'responsive';
  estimatedCpm?: number;
  customCodeSnippet?: string;
  suppressForPlans?: string[]; // e.g. ['pro', 'business']
}

export interface AdImpressionRecord {
  slotId: string;
  placement: AdSlotPlacement;
  toolId?: string;
  timestamp: number;
  device: 'desktop' | 'mobile';
}
