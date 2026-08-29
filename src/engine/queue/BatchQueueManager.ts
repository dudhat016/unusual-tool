import JSZip from 'jszip';
import { BatchQueueItem, QueueItemStatus, UniversalProcessResult } from '../../types';
import { engine } from '../ImageProcessingEngine';
import { detectImageFormat } from '../formatDetector';

export interface BatchQueueConfig {
  maxConcurrent?: number;
  autoGenerateZip?: boolean;
}

export type QueueEventListener = (items: BatchQueueItem[]) => void;

export class BatchQueueManager {
  private items: BatchQueueItem[] = [];
  private maxConcurrent: number = 2;
  private autoGenerateZip: boolean = false;
  private isProcessing: boolean = false;
  private listeners: Set<QueueEventListener> = new Set();
  private cancelFlags: Set<string> = new Set();

  constructor(config?: BatchQueueConfig) {
    if (config?.maxConcurrent) this.maxConcurrent = config.maxConcurrent;
    if (config?.autoGenerateZip !== undefined) this.autoGenerateZip = config.autoGenerateZip;
  }

  public subscribe(listener: QueueEventListener): () => void {
    this.listeners.add(listener);
    listener(this.getItems());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const snapshot = this.getItems();
    this.listeners.forEach((fn) => fn(snapshot));
  }

  public getItems(): BatchQueueItem[] {
    return [...this.items];
  }

  /**
   * Add files to queue
   */
  public async addFiles(files: File[]): Promise<void> {
    for (const file of files) {
      const detected = await detectImageFormat(file);
      const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      
      const item: BatchQueueItem = {
        id,
        file,
        status: detected.isSupported ? 'queued' : 'failed',
        progress: 0,
        originalWidth: 0,
        originalHeight: 0,
        originalSize: file.size,
        error: detected.isSupported ? undefined : detected.validationError,
        createdAt: Date.now(),
      };

      this.items.push(item);
    }
    this.notify();
  }

  public removeItem(id: string) {
    this.items = this.items.filter((item) => item.id !== id);
    this.cancelFlags.add(id);
    this.notify();
  }

  public clear() {
    this.items.forEach((item) => this.cancelFlags.add(item.id));
    this.items = [];
    this.notify();
  }

  public cancelItem(id: string) {
    this.cancelFlags.add(id);
    const item = this.items.find((i) => i.id === id);
    if (item && item.status === 'processing') {
      item.status = 'cancelled';
      item.progress = 0;
      this.notify();
    }
  }

  public cancelAll() {
    this.items.forEach((item) => {
      if (item.status === 'queued' || item.status === 'processing') {
        item.status = 'cancelled';
        this.cancelFlags.add(item.id);
      }
    });
    this.notify();
  }

  public retryFailed() {
    this.items.forEach((item) => {
      if (item.status === 'failed' || item.status === 'cancelled') {
        item.status = 'queued';
        item.error = undefined;
        item.progress = 0;
        this.cancelFlags.delete(item.id);
      }
    });
    this.notify();
    this.processQueue();
  }

  public retryItem(id: string) {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.status = 'queued';
      item.error = undefined;
      item.progress = 0;
      this.cancelFlags.delete(id);
      this.notify();
      this.processQueue();
    }
  }

  /**
   * Process all queued items with configured tool and options
   */
  public async processQueue(toolId: string = 'compress-image', options: any = {}): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const runWorker = async () => {
      while (true) {
        const nextItem = this.items.find((i) => i.status === 'queued');
        if (!nextItem) break;

        if (this.cancelFlags.has(nextItem.id)) {
          nextItem.status = 'cancelled';
          this.notify();
          continue;
        }

        nextItem.status = 'processing';
        nextItem.startedAt = Date.now();
        nextItem.progress = 10;
        this.notify();

        try {
          const result = await engine.execute(
            nextItem.file,
            toolId,
            options,
            (progress) => {
              if (!this.cancelFlags.has(nextItem.id)) {
                nextItem.progress = progress;
                this.notify();
              }
            }
          );

          if (this.cancelFlags.has(nextItem.id)) {
            nextItem.status = 'cancelled';
          } else if (result.status === 'failed') {
            nextItem.status = 'failed';
            nextItem.error = result.errorMessage || 'Processing failed';
          } else {
            nextItem.status = 'completed';
            nextItem.result = result;
            nextItem.originalWidth = result.originalWidth;
            nextItem.originalHeight = result.originalHeight;
            nextItem.progress = 100;
            nextItem.completedAt = Date.now();
          }
        } catch (err: any) {
          nextItem.status = 'failed';
          nextItem.error = err?.message || 'Error occurred';
        }
        this.notify();
      }
    };

    const workers = Array.from({ length: this.maxConcurrent }, () => runWorker());
    await Promise.all(workers);

    this.isProcessing = false;
    this.notify();

    // Auto ZIP if multiple items completed and option is enabled
    const completedItems = this.items.filter((i) => i.status === 'completed' && i.result);
    if (this.autoGenerateZip && completedItems.length > 1) {
      await this.downloadZip('batch_processed_images.zip');
    }
  }

  /**
   * Generates and triggers ZIP download of all completed results
   */
  public async downloadZip(zipFilename: string = 'aetherpix_batch.zip'): Promise<Blob | null> {
    const completed = this.items.filter((i) => i.status === 'completed' && i.result?.blob);
    if (completed.length === 0) return null;

    const zip = new JSZip();
    completed.forEach((item, index) => {
      if (item.result?.blob) {
        const name = item.result.name || `image_${index + 1}.png`;
        zip.file(name, item.result.blob);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    return content;
  }

  /**
   * Download all completed items individually
   */
  public downloadAllSeparate(): void {
    const completed = this.items.filter((i) => i.status === 'completed' && i.result?.downloadUrl);
    completed.forEach((item, idx) => {
      setTimeout(() => {
        if (item.result) {
          const a = document.createElement('a');
          a.href = item.result.downloadUrl;
          a.download = item.result.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }, idx * 250);
    });
  }
}
