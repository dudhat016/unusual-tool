import { UniversalProcessResult, ProcessorType } from '../../types';

export interface ProcessorContext {
  toolId: string;
  action?: string;
  options?: any;
  onProgress?: (progressPercent: number, stageMessage?: string) => void;
}

export interface IImageProcessor {
  readonly name: string;
  readonly type: ProcessorType;

  /**
   * Returns true if this processor is capable of executing the requested tool
   */
  canHandle(toolId: string, options?: any): boolean;

  /**
   * Executes the image processing operation
   */
  process(file: File, context: ProcessorContext): Promise<UniversalProcessResult>;
}
