import { Image } from '@shared/types';
import { eventManager } from './eventManager';
import { Store } from './store';
import { MODEL_PROVIDERS } from './models/modelProvider';

const MAX_RETRY_COUNT = 3;

interface ImageWithRetryCount {
  image: Image;
  retryCount: number;
}

export interface ImageInfo {
  caption: string;
  tags: string[];
  cost: number;
}

export class ModelManager {
  private queue: ImageWithRetryCount[] = [];
  private isProcessing = false;
  private totalCost = 0;

  constructor(private store: Store) {}

  async queueImageCaptionGeneration(image: Image, silent = false): Promise<void> {
    image.processing = true;
    if (!silent) {
      eventManager.emit('update-image', image);
    }

    this.queue = this.queue.filter((item) => item.image.id !== image.id);
    this.queue.unshift({ image, retryCount: 0 });
    void this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const imageWithRetryCount = this.queue.shift();
      const { image, retryCount } = imageWithRetryCount!;

      if (image) {
        try {
          console.log(`Generating caption for image ${image.id}`);
          const info = await this.generateImageInfo(image);
          console.log(`Generated caption for image ${image.id}: ${info.caption}, tags: ${info.tags}, total cost: $${this.totalCost.toFixed(4)}`);
          image.caption = info.caption;
          image.tags = info.tags;
          image.processing = false;
          eventManager.emit('update-image', image);

          this.totalCost += info.cost;
        } catch (error) {
          console.error(`Failed to generate caption for image ${image.id}:`, error);
          // add again to the queue as the last one
          if (retryCount < MAX_RETRY_COUNT) {
            this.queue.push({ image, retryCount: retryCount + 1 });
          } else {
            console.error(`Failed to generate caption for image ${image.id} after ${MAX_RETRY_COUNT} retries.`);
            image.caption = 'Unknown';
            image.tags = [];
            image.processing = false;
            eventManager.emit('update-image', image);
          }
        }
      }
    }

    this.isProcessing = false;
  }

  async generateImageInfo(image: Image): Promise<ImageInfo> {
    const settings = this.store.getSettings();
    const modelProvider = MODEL_PROVIDERS[settings.modelProviderConfig.name];

    return modelProvider.generateImageInfo(settings, image);
  }

  removeQueuedImages(imagesToRemove: Image[]): void {
    const imageIds = new Set(imagesToRemove.map((img) => img.id));
    this.queue = this.queue.filter((item) => !imageIds.has(item.image.id));
  }
}
