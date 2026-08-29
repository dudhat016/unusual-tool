import JSZip from 'jszip';
import { UniversalProcessResult } from '../../types';
import { detectImageFormat } from '../formatDetector';
import { loadFileAsImage, formatFileSize } from '../imageEngine';

export type BatchJobStatus =
  | 'waiting'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'cancelled';

export interface UniversalBatchJob<TOptions = any, TResult = UniversalProcessResult> {
  id: string;
  file: File;
  name: string;
  size: number;
  format: string;
  mimeType: string;
  width: number;
  height: number;
  aspectRatio: number;
  thumbnailUrl: string;
  status: BatchJobStatus;
  progress: number; // 0 to 100
  result?: TResult;
  error?: string;
  selected: boolean;
  startedAt?: number;
  completedAt?: number;
  executionTimeMs?: number;
  customOptions?: Partial<TOptions>;
  customOutputName?: string;
}

export interface UniversalBatchStats {
  total: number;
  waiting: number;
  processing: number;
  completed: number;
  failed: number;
  skipped: number;
  totalOriginalBytes: number;
  totalResultBytes: number;
  savedBytes: number;
  reductionPercentage: number;
  averageExecutionTimeMs: number;
  totalExecutionTimeMs: number;
}

export type BatchProcessorFn<TOptions = any, TResult = UniversalProcessResult> = (
  file: File,
  options: TOptions,
  job: UniversalBatchJob<TOptions, TResult>,
  signal?: AbortSignal
) => Promise<TResult>;

export type BatchQueueListener<TOptions = any, TResult = any> = (
  jobs: UniversalBatchJob<TOptions, TResult>[]
) => void;

export type BatchStateListener = (state: {
  isProcessing: boolean;
  isPaused: boolean;
  activeWorkers: number;
  progressPercentage: number;
}) => void;

export class UniversalBatchEngine<TOptions = any, TResult = UniversalProcessResult> {
  private jobs: UniversalBatchJob<TOptions, TResult>[] = [];
  private concurrency: number = 4;
  private isProcessing: boolean = false;
  private isPaused: boolean = false;
  private activeWorkers: number = 0;
  private cancelFlags: Set<string> = new Set();
  private abortController: AbortController | null = null;
  private queueListeners: Set<BatchQueueListener<TOptions, TResult>> = new Set();
  private stateListeners: Set<BatchStateListener> = new Set();
  private allocatedUrls: Set<string> = new Set();
  private processorFn: BatchProcessorFn<TOptions, TResult> | null = null;
  private defaultOptions: TOptions | null = null;

  constructor(options?: {
    concurrency?: number;
    processor?: BatchProcessorFn<TOptions, TResult>;
    defaultOptions?: TOptions;
  }) {
    if (options?.concurrency) {
      this.concurrency = Math.max(1, Math.min(8, options.concurrency));
    }
    if (options?.processor) {
      this.processorFn = options.processor;
    }
    if (options?.defaultOptions) {
      this.defaultOptions = options.defaultOptions;
    }
  }

  public setProcessor(
    processor: BatchProcessorFn<TOptions, TResult>,
    defaultOptions?: TOptions
  ) {
    this.processorFn = processor;
    if (defaultOptions !== undefined) {
      this.defaultOptions = defaultOptions;
    }
  }

  public setDefaultOptions(options: TOptions) {
    this.defaultOptions = options;
  }

  public setConcurrency(concurrency: number) {
    this.concurrency = Math.max(1, Math.min(8, concurrency));
  }

  public getConcurrency(): number {
    return this.concurrency;
  }

  public getJobs(): UniversalBatchJob<TOptions, TResult>[] {
    return [...this.jobs];
  }

  public getState() {
    const total = this.jobs.length;
    const completedOrFailed = this.jobs.filter(
      (j) => j.status === 'completed' || j.status === 'failed' || j.status === 'skipped'
    ).length;
    const progressPercentage = total > 0 ? Math.round((completedOrFailed / total) * 100) : 0;

    return {
      isProcessing: this.isProcessing,
      isPaused: this.isPaused,
      activeWorkers: this.activeWorkers,
      progressPercentage,
    };
  }

  public subscribeQueue(listener: BatchQueueListener<TOptions, TResult>): () => void {
    this.queueListeners.add(listener);
    listener(this.getJobs());
    return () => {
      this.queueListeners.delete(listener);
    };
  }

  public subscribeState(listener: BatchStateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.getState());
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  private notifyQueue() {
    const snapshot = this.getJobs();
    this.queueListeners.forEach((fn) => fn(snapshot));
  }

  private notifyState() {
    const state = this.getState();
    this.stateListeners.forEach((fn) => fn(state));
  }

  /**
   * Add new files to the batch queue with low-memory thumbnails
   */
  public async addFiles(files: File[]): Promise<UniversalBatchJob<TOptions, TResult>[]> {
    const newJobs: UniversalBatchJob<TOptions, TResult>[] = [];

    for (const file of files) {
      const detected = await detectImageFormat(file);
      let width = 0;
      let height = 0;
      let aspectRatio = 1;
      let thumbnailUrl = '';

      try {
        const loaded = await loadFileAsImage(file);
        width = loaded.width;
        height = loaded.height;
        aspectRatio = loaded.aspectRatio;

        // Downsampled canvas thumbnail (max 140px) to prevent memory exhaustion with 100+ items
        const thumbCanvas = document.createElement('canvas');
        const maxThumbDim = 140;
        const scale = Math.min(1, maxThumbDim / Math.max(width || 1, height || 1));
        thumbCanvas.width = Math.max(1, Math.round((width || 100) * scale));
        thumbCanvas.height = Math.max(1, Math.round((height || 100) * scale));
        const ctx = thumbCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(loaded.img, 0, 0, thumbCanvas.width, thumbCanvas.height);
          thumbnailUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);
        }
      } catch {
        try {
          thumbnailUrl = URL.createObjectURL(file);
          this.allocatedUrls.add(thumbnailUrl);
        } catch {}
      }

      const id = `batch_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const job: UniversalBatchJob<TOptions, TResult> = {
        id,
        file,
        name: file.name,
        size: file.size,
        format: (detected.extension || file.name.split('.').pop() || 'png').toUpperCase(),
        mimeType: detected.mimeType || file.type || 'image/jpeg',
        width,
        height,
        aspectRatio,
        thumbnailUrl: thumbnailUrl || '',
        status: detected.isSupported ? 'waiting' : 'failed',
        progress: 0,
        selected: true,
        error: detected.isSupported ? undefined : detected.validationError || 'Unsupported format',
      };

      this.jobs.push(job);
      newJobs.push(job);
    }

    this.notifyQueue();
    this.notifyState();
    return newJobs;
  }

  /**
   * Process all waiting or failed items in the queue
   */
  public async processAll(
    overrideOptions?: TOptions,
    customProcessor?: BatchProcessorFn<TOptions, TResult>
  ): Promise<void> {
    if (this.isProcessing && !this.isPaused) return;

    const processor = customProcessor || this.processorFn;
    if (!processor) {
      throw new Error('No batch processor function registered');
    }

    const options = overrideOptions || this.defaultOptions;
    if (!options) {
      throw new Error('No processing options provided');
    }

    this.isProcessing = true;
    this.isPaused = false;
    this.cancelFlags.clear();
    this.abortController = new AbortController();
    this.notifyState();

    // Reset waiting jobs
    this.jobs = this.jobs.map((job) => {
      if (job.status === 'failed' || job.status === 'cancelled' || job.status === 'waiting') {
        return {
          ...job,
          status: 'waiting',
          progress: 0,
          error: undefined,
        };
      }
      return job;
    });
    this.notifyQueue();

    try {
      await this.runWorkerPool(processor, options);
    } finally {
      this.isProcessing = false;
      this.isPaused = false;
      this.activeWorkers = 0;
      this.notifyState();
    }
  }

  private async runWorkerPool(
    processor: BatchProcessorFn<TOptions, TResult>,
    options: TOptions
  ): Promise<void> {
    const workerPromises: Promise<void>[] = [];

    const getNextJob = (): UniversalBatchJob<TOptions, TResult> | undefined => {
      if (this.isPaused || this.abortController?.signal.aborted) return undefined;
      return this.jobs.find((j) => j.status === 'waiting' && !this.cancelFlags.has(j.id));
    };

    const workerLoop = async (): Promise<void> => {
      while (true) {
        if (this.isPaused || this.abortController?.signal.aborted) {
          break;
        }

        const job = getNextJob();
        if (!job) {
          break;
        }

        // Mark as processing
        job.status = 'processing';
        job.startedAt = Date.now();
        job.progress = 15;
        this.activeWorkers++;
        this.notifyQueue();
        this.notifyState();

        try {
          // Merge global options with per-job custom options if any
          const jobOpts = {
            ...(options as any),
            ...(job.customOptions || {}),
          };

          const startTime = performance.now();
          const result = await processor(job.file, jobOpts, job, this.abortController?.signal);
          const executionTimeMs = Math.round(performance.now() - startTime);

          if (this.cancelFlags.has(job.id)) {
            job.status = 'cancelled';
          } else {
            job.status = 'completed';
            job.progress = 100;
            job.result = result;
            job.executionTimeMs = executionTimeMs;
            job.completedAt = Date.now();

            if ((result as any)?.downloadUrl) {
              this.allocatedUrls.add((result as any).downloadUrl);
            }
          }
        } catch (err: any) {
          if (this.cancelFlags.has(job.id)) {
            job.status = 'cancelled';
          } else {
            job.status = 'failed';
            job.progress = 0;
            job.error = err?.message || 'Processing failed';
          }
        } finally {
          this.activeWorkers = Math.max(0, this.activeWorkers - 1);
          this.notifyQueue();
          this.notifyState();
        }
      }
    };

    const count = Math.min(this.concurrency, Math.max(1, this.jobs.length));
    for (let i = 0; i < count; i++) {
      workerPromises.push(workerLoop());
    }

    await Promise.all(workerPromises);
  }

  /**
   * Pause processing (current jobs finish, waiting jobs stay queued)
   */
  public pause() {
    if (!this.isProcessing || this.isPaused) return;
    this.isPaused = true;
    this.notifyState();
  }

  /**
   * Resume paused queue
   */
  public async resume(overrideOptions?: TOptions): Promise<void> {
    if (!this.isProcessing || !this.isPaused) return;
    this.isPaused = false;
    this.notifyState();
    const processor = this.processorFn;
    const options = overrideOptions || this.defaultOptions;
    if (processor && options) {
      await this.runWorkerPool(processor, options);
    }
    this.isProcessing = false;
    this.notifyState();
  }

  /**
   * Cancel queued and running jobs
   */
  public cancel() {
    this.isProcessing = false;
    this.isPaused = false;
    this.abortController?.abort();
    this.jobs.forEach((j) => {
      if (j.status === 'waiting' || j.status === 'processing') {
        j.status = 'cancelled';
        this.cancelFlags.add(j.id);
      }
    });
    this.notifyQueue();
    this.notifyState();
  }

  /**
   * Retry single job
   */
  public async retryJob(id: string, options?: TOptions): Promise<void> {
    const job = this.jobs.find((j) => j.id === id);
    if (!job || !this.processorFn) return;

    job.status = 'processing';
    job.progress = 20;
    job.error = undefined;
    job.startedAt = Date.now();
    this.notifyQueue();

    const jobOpts = {
      ...((options || this.defaultOptions || {}) as any),
      ...(job.customOptions || {}),
    };

    try {
      const startTime = performance.now();
      const res = await this.processorFn(job.file, jobOpts, job);
      job.status = 'completed';
      job.progress = 100;
      job.result = res;
      job.executionTimeMs = Math.round(performance.now() - startTime);
      job.completedAt = Date.now();
    } catch (err: any) {
      job.status = 'failed';
      job.error = err?.message || 'Retry failed';
    } finally {
      this.notifyQueue();
      this.notifyState();
    }
  }

  /**
   * Retry only failed jobs
   */
  public async retryFailed(options?: TOptions): Promise<void> {
    const failedJobs = this.jobs.filter((j) => j.status === 'failed' || j.status === 'cancelled');
    failedJobs.forEach((j) => {
      j.status = 'waiting';
      j.progress = 0;
      j.error = undefined;
    });
    this.notifyQueue();
    await this.processAll(options);
  }

  /**
   * Queue manipulation helpers
   */
  public toggleSelect(id: string) {
    const job = this.jobs.find((j) => j.id === id);
    if (job) {
      job.selected = !job.selected;
      this.notifyQueue();
    }
  }

  public selectAll(selected: boolean = true) {
    this.jobs.forEach((j) => (j.selected = selected));
    this.notifyQueue();
  }

  public invertSelection() {
    this.jobs.forEach((j) => (j.selected = !j.selected));
    this.notifyQueue();
  }

  public removeJob(id: string) {
    this.cancelFlags.add(id);
    const job = this.jobs.find((j) => j.id === id);
    if (job) {
      if (job.thumbnailUrl && job.thumbnailUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(job.thumbnailUrl);
        } catch {}
      }
      if ((job.result as any)?.downloadUrl?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL((job.result as any).downloadUrl);
        } catch {}
      }
    }
    this.jobs = this.jobs.filter((j) => j.id !== id);
    this.notifyQueue();
    this.notifyState();
  }

  public removeCompleted() {
    this.jobs = this.jobs.filter((j) => j.status !== 'completed');
    this.notifyQueue();
    this.notifyState();
  }

  public removeFailed() {
    this.jobs = this.jobs.filter((j) => j.status !== 'failed');
    this.notifyQueue();
    this.notifyState();
  }

  public clearQueue() {
    this.cancel();
    this.jobs.forEach((j) => {
      if (j.thumbnailUrl && j.thumbnailUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(j.thumbnailUrl);
        } catch {}
      }
      const downloadUrl = (j.result as any)?.downloadUrl;
      if (downloadUrl && typeof downloadUrl === 'string' && downloadUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(downloadUrl);
        } catch {}
      }
    });
    this.allocatedUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch {}
    });
    this.allocatedUrls.clear();
    this.jobs = [];
    this.notifyQueue();
    this.notifyState();
  }

  /**
   * Alias for clearQueue()
   */
  public clear() {
    this.clearQueue();
  }

  /**
   * Set custom per-job options override
   */
  public setJobOptions(id: string, options: Partial<TOptions>) {
    const job = this.jobs.find((j) => j.id === id);
    if (job) {
      job.customOptions = options;
      this.notifyQueue();
    }
  }

  /**
   * Compute comprehensive batch analytics
   */
  public getStatistics(): UniversalBatchStats {
    let totalOriginalBytes = 0;
    let totalResultBytes = 0;
    let totalExecutionTimeMs = 0;
    let completed = 0;
    let failed = 0;
    let waiting = 0;
    let processing = 0;
    let skipped = 0;

    for (const job of this.jobs) {
      totalOriginalBytes += job.size || 0;
      if (job.status === 'completed') {
        completed++;
        const resSize = (job.result as any)?.resultSize ?? (job.result as any)?.size ?? job.size;
        totalResultBytes += resSize;
        totalExecutionTimeMs += job.executionTimeMs || 0;
      } else if (job.status === 'failed') {
        failed++;
      } else if (job.status === 'waiting') {
        waiting++;
      } else if (job.status === 'processing') {
        processing++;
      } else if (job.status === 'skipped') {
        skipped++;
      }
    }

    const savedBytes = Math.max(0, totalOriginalBytes - totalResultBytes);
    const reductionPercentage =
      totalOriginalBytes > 0 ? Math.round((savedBytes / totalOriginalBytes) * 100) : 0;
    const averageExecutionTimeMs = completed > 0 ? Math.round(totalExecutionTimeMs / completed) : 0;

    return {
      total: this.jobs.length,
      waiting,
      processing,
      completed,
      failed,
      skipped,
      totalOriginalBytes,
      totalResultBytes,
      savedBytes,
      reductionPercentage,
      averageExecutionTimeMs,
      totalExecutionTimeMs,
    };
  }

  /**
   * Generate a real ZIP archive of all completed items
   */
  public async generateZip(
    options?: {
      selectedOnly?: boolean;
      zipFileName?: string;
      onProgress?: (percent: number) => void;
    }
  ): Promise<{ blob: Blob; filename: string }> {
    const zip = new JSZip();
    const jobsToExport = this.jobs.filter((j) => {
      if (j.status !== 'completed' || !j.result) return false;
      if (options?.selectedOnly && !j.selected) return false;
      return true;
    });

    if (jobsToExport.length === 0) {
      throw new Error('No completed images available to package into ZIP.');
    }

    const usedNames = new Set<string>();

    for (const job of jobsToExport) {
      const result = job.result as any;
      let filename = job.customOutputName || result.name || job.name;

      // Handle duplicate filenames
      let finalName = filename;
      let counter = 1;
      const dotIndex = filename.lastIndexOf('.');
      const baseName = dotIndex !== -1 ? filename.substring(0, dotIndex) : filename;
      const ext = dotIndex !== -1 ? filename.substring(dotIndex) : '';

      while (usedNames.has(finalName)) {
        finalName = `${baseName}_${counter}${ext}`;
        counter++;
      }
      usedNames.add(finalName);

      if (result.blob) {
        zip.file(finalName, result.blob);
      } else if (result.dataUrl) {
        const base64Data = result.dataUrl.split(',')[1];
        if (base64Data) {
          zip.file(finalName, base64Data, { base64: true });
        }
      } else if (typeof result.extractedText === 'string') {
        zip.file(`${baseName}.txt`, result.extractedText);
      }
    }

    const zipBlob = await zip.generateAsync(
      {
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      },
      (metadata) => {
        if (options?.onProgress) {
          options.onProgress(Math.round(metadata.percent));
        }
      }
    );

    const filename = options?.zipFileName || `AetherPix_Batch_${Date.now()}.zip`;
    return { blob: zipBlob, filename };
  }

  /**
   * Destroy engine instance and release resources
   */
  public destroy() {
    this.clearQueue();
    this.queueListeners.clear();
    this.stateListeners.clear();
  }
}
