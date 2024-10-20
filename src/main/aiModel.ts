import fs from 'fs/promises';
import { Image, Store, StoreSchema } from '@shared/types';
import { DEFAULT_TAGS } from './constants';

export class AIModel {
  private queue: Image[] = [];
  private isProcessing = false;

  constructor(private store: Store<StoreSchema>) {}

  async queueImageCaptionGeneration(image: Image): Promise<void> {
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
          const caption = await this.generateImageCaption(image);
          console.log(`Generated caption for image ${image.id}: ${caption}`);
        } catch (error) {
          console.error(`Failed to generate caption for image ${image.id}:`, error);
        }
      }
    }

    this.isProcessing = false;
  }

  async generateImageCaption(image: Image): Promise<string> {
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
    console.log(data.choices[0].message);
    return data.choices[0].message.content;
  }

  async getBase64Image(image: Image): Promise<string> {
    const imageBuffer = await fs.readFile(image.src.replace('file://', ''));
    return `data:image/${image.src.split('.').pop()};base64,${imageBuffer.toString('base64')}`;
  }
}
