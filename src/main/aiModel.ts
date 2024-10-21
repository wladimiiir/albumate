import fs from 'fs/promises';
import { Image } from '@shared/types';
import { DEFAULT_TAGS } from './constants';
import { eventManager } from './eventManager';
import { Store } from './store';

type ImageInfo = {
  caption: string;
  tags: string[];
};

export class AIModel {
  private queue: Image[] = [];
  private isProcessing = false;
  private totalCost = 0;

  constructor(private store: Store) {}

  async queueImageCaptionGeneration(image: Image, silent = false): Promise<void> {
    image.processing = true;
    if (!silent) {
      eventManager.emit('update-image', image);
    }

    this.queue = this.queue.filter((img) => img.id !== image.id);
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
          console.log(`Generating caption for image ${image.id}`);
          const info = await this.generateImageInfo(image);
          console.log(`Generated caption for image ${image.id}: ${info.caption}, tags: ${info.tags}, total cost: $${this.totalCost.toFixed(4)}`);
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
    const settings = this.store.getSettings();

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
        model: 'gpt-4o',
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
        stream: false,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const caption = content.match(/<caption>(.*?)<\/caption>/)?.[1] || 'Unknown';
    const tags = content.match(/<tags>(.*?)<\/tags>/)?.[1].split(', ') || [];

    this.updateTotalCost(data.usage.prompt_tokens, data.usage.completion_tokens);

    return {
      caption,
      tags,
    };
  }

  private updateTotalCost(promptTokens: number, completionTokens: number): void {
    const costPer1000InputTokens = 0.0025;
    const costPer1000OutputTokens = 0.01;

    this.totalCost += (promptTokens * costPer1000InputTokens + completionTokens * costPer1000OutputTokens) / 1000;
  }

  async getBase64Image(image: Image): Promise<string> {
    const imageBuffer = await fs.readFile(image.src.replace('file://', ''));
    return `data:image/${image.src.split('.').pop()};base64,${imageBuffer.toString('base64')}`;
  }
}
