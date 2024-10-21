import fs from 'fs/promises';
import { Image, Store, StoreSchema } from '@shared/types';
import { DEFAULT_TAGS } from './constants';
import { eventManager } from './eventManager';

type ImageInfo = {
  caption: string;
  tags: string[];
};

export class AIModel {
  private queue: Image[] = [];
  private isProcessing = false;

  constructor(private store: Store<StoreSchema>) {}

  async queueImageCaptionGeneration(image: Image): Promise<void> {
    const imageIndex = this.queue.findIndex((image) => image.id === image.id);
    if (imageIndex !== -1) {
      this.queue.splice(imageIndex, 1);
    }
    this.queue.unshift(image);
    void this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const image = this.queue.shift();
      if (image) {
        try {
          image.processing = true;
          eventManager.emit('update-image', image);

          const info = await this.generateImageInfo(image);
          console.log(`Generated caption for image ${image.id}: ${info.caption}, tags: ${info.tags}`);
          image.caption = info.caption;
          image.tags = info.tags;
          image.processing = false;

          eventManager.emit('update-image', image);
        } catch (error) {
          console.error(`Failed to generate caption for image ${image.id}:`, error);
        }
      }
    }

    this.isProcessing = false;
  }

  async generateImageInfo(image: Image): Promise<ImageInfo> {
    const settings = this.store.get('settings');

    if (!settings.openAIBaseURL || !settings.apiKey) {
      throw new Error('Model API settings not found');
    }

    const base64Image = await this.getBase64Image(image);
    const response = await fetch(`${settings.openAIBaseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that generates captions for images. ' +
              'Captions you generate are be not less than 32 characters long, not longer than 256 characters and is describing everything important present on the image. ' +
              'Use <caption> tag to wrap the caption. ' +
              'Additionally, assign one or more tags that fit the image. Wrap the tags into <tags> tag and use comma as separator. You can only pick from the following tags: ' +
              `\`${DEFAULT_TAGS.join('`, `')}\``,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: base64Image,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const caption = content.match(/<caption>(.*?)<\/caption>/)?.[1] || 'Unknown';
    const tags = content.match(/<tags>(.*?)<\/tags>/)?.[1].split(', ') || [];

    return {
      caption,
      tags,
    };
  }

  async getBase64Image(image: Image): Promise<string> {
    const imageBuffer = await fs.readFile(image.src.replace('file://', ''));
    return `data:image/${image.src.split('.').pop()};base64,${imageBuffer.toString('base64')}`;
  }
}
