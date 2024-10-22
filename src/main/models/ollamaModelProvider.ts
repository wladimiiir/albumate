import { ModelProvider } from './modelProvider';
import { ImageInfo } from '../modelManager';
import { Image, Settings, ModelProviderConfig, OllamaProviderConfig } from '@shared/types';
import { DEFAULT_TAGS } from '../constants';
import fs from 'fs/promises';

const SYSTEM_PROMPT =
  'You are a helpful assistant that generates captions for images. ' +
  'Captions you generate are be not less than 32 characters long, not longer than 256 characters and is describing everything important present on the image. ' +
  'Use <caption></caption> to wrap the caption. ' +
  'Additionally, assign one or more tags that fit the image. Always wrap the tags inside <tags></tags> and use comma as separator. You can only pick from the following tags: ' +
  `\`${DEFAULT_TAGS.join('`, `')}\`\n\n` +
  'Examples of correct answer:\n\n`<caption>A beautiful sunset over the ocean</caption><tags>ocean, sunset, beach, mountain</tags>`\n\n`<caption>A close-up of a cat</caption><tags>cat, animal, pet, pets, animals</tags>`';

export class OllamaModelProvider implements ModelProvider {
  async generateImageInfo(settings: Settings, image: Image): Promise<ImageInfo> {
    const config = this.asOllamaProviderConfig(settings.modelProviderConfig);

    if (!config.model) {
      throw new Error('Ollama model not specified');
    }

    const base64Image = await this.getBase64Image(image);

    const response = await fetch(`${config.ollamaBaseURL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: 'Describe the image',
            images: [base64Image],
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate caption for image ${image.id}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.message.content;
    const caption = content.match(/<caption>(.*?)<\/caption>/)?.[1] || 'Unknown';
    const tags =
      content
        .match(/<tags?>(.+)(<\/tags?>)?/g)
        ?.map((tag) =>
          tag
            .replace(/<[^>]+>/g, '')
            .split(',')
            .map((tag) => tag.trim()),
        )
        .flat() || [];

    return {
      caption,
      tags,
      cost: 0, // Ollama is free to use, so we set the cost to 0
    };
  }

  async isInitialized(settings: Settings): Promise<boolean> {
    const config = this.asOllamaProviderConfig(settings.modelProviderConfig);
    return !!config.ollamaBaseURL && !!config.model;
  }

  async getModels(settings: Settings): Promise<string[]> {
    const config = this.asOllamaProviderConfig(settings.modelProviderConfig);
    try {
      const response = await fetch(`${config.ollamaBaseURL}/api/tags`);
      const data = await response.json();
      return data.models.map((model) => model.name);
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      return [];
    }
  }

  private async getBase64Image(image: Image): Promise<string> {
    const imageBuffer = await fs.readFile(image.src.replace('file://', ''));
    return imageBuffer.toString('base64');
  }

  private asOllamaProviderConfig(config: ModelProviderConfig): OllamaProviderConfig {
    return config as OllamaProviderConfig;
  }
}
