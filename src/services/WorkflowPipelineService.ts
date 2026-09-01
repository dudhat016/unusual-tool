export interface PipelineStep {
  id: string;
  toolId: string;
  name: string;
  params: Record<string, any>;
}

export interface WorkflowPipeline {
  id: string;
  name: string;
  steps: PipelineStep[];
}

/**
 * Service to manage and execute multi-stage image processing pipelines.
 * (e.g. Resize -> Compress to KB -> Convert format -> Watermark)
 */
export class WorkflowPipelineService {
  private static PRESET_WORKFLOWS: WorkflowPipeline[] = [
    {
      id: 'web-optimizer',
      name: 'Web Graphics Optimization Pipeline',
      steps: [
        { id: 'step-1', toolId: 'resize-image', name: 'Resize to Web Dimensions', params: { width: 1920, height: 1080 } },
        { id: 'step-2', toolId: 'convert-image', name: 'Convert to Next-Gen WebP', params: { format: 'image/webp' } },
        { id: 'step-3', toolId: 'compress-image', name: 'Compress File Size', params: { targetSizeKb: 100 } },
      ],
    },
    {
      id: 'social-media-ready',
      name: 'Social Media Graphic Pipeline',
      steps: [
        { id: 'step-1', toolId: 'social-resizer', name: 'Resize for Instagram Square', params: { width: 1080, height: 1080 } },
        { id: 'step-2', toolId: 'image-watermark', name: 'Add Brand Watermark', params: { text: '© AetherPix' } },
      ],
    },
  ];

  /**
   * Retrieves all preset workflow pipelines.
   */
  public static getPresetWorkflows(): WorkflowPipeline[] {
    return this.PRESET_WORKFLOWS;
  }

  /**
   * Creates a custom pipeline definition.
   */
  public static createPipeline(name: string, steps: PipelineStep[]): WorkflowPipeline {
    return {
      id: `pipeline_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      steps,
    };
  }
}
