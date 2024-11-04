import { ModelProvider } from './modelProvider';
import { ImageInfo } from '../modelManager';
import { Image, Settings, ModelProviderConfig, OpenAIProviderConfig } from '@shared/types';
import { DEFAULT_TAGS } from '../constants';
import fs from 'fs/promises';

const SYSTEM_PROPMT =
  'You are a helpful assistant that generates captions for images. ' +
  'Captions you generate are be not less than 32 characters long, not longer than 256 characters and is describing everything important present on the image. ' +
  'Use <caption> tag to wrap the caption. ' +
  'Additionally, assign one or more tags that fit the image. Wrap the tags into <tags> tag and use comma as separator. You can only pick from the following tags: ' +
  `\`${DEFAULT_TAGS.join('`, `')}\``;

export class OpenAIModelProvider implements ModelProvider {
  async generateImageInfo(settings: Settings, image: Image): Promise<ImageInfo> {
    const config = this.asOpenAIProviderConfig(settings.modelProviderConfig);

    if (!config.openAIBaseURL || !config.openAIApiKey || !config.model) {
      throw new Error('OpenAI model not specified');
    }

    const base64Image = await this.getBase64Image(image);
    const response = await fetch(`${config.openAIBaseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.openAIApiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROPMT,
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

    return {
      caption,
      tags,
      cost: this.getPromptCost(config.model, data.usage.prompt_tokens, data.usage.completion_tokens),
    };
  }

  async isInitialized(settings: Settings): Promise<boolean> {
    const config = this.asOpenAIProviderConfig(settings.modelProviderConfig);
    return !!config.openAIBaseURL && !!config.openAIApiKey && !!config.model;
  }

  async getModels(): Promise<string[]> {
    return ['gpt-4o', 'gpt-4-turbo'];
  }

  private asOpenAIProviderConfig(config: ModelProviderConfig): OpenAIProviderConfig {
    return config as OpenAIProviderConfig;
  }

  private async getBase64Image(image: Image): Promise<string> {
    const imageBuffer = await fs.readFile(image.path);
    return `data:image/${image.path.split('.').pop()};base64,${imageBuffer.toString('base64')}`;
  }

  private getPromptCost(model: string, promptTokens: number, completionTokens: number) {
    const pricing = {
      'gpt-4o': [0.0025, 0.01],
      'gpt-4-turbo': [0.01, 0.03],
    };
    const costPer1000InputTokens = pricing[model][0];
    const costPer1000OutputTokens = pricing[model][1];

    return (promptTokens * costPer1000InputTokens + completionTokens * costPer1000OutputTokens) / 1000;
  }
}
