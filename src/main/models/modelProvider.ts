import { Image, Settings, ModelProviderName } from '@shared/types';
import { ImageInfo } from '../modelManager';
import { OpenAIModelProvider } from './openAIModelProvider';
import { OllamaModelProvider } from './ollamaModelProvider';

export interface ModelProvider {
  generateImageInfo(settings: Settings, image: Image): Promise<ImageInfo>;

  isInitialized(settings: Settings): Promise<boolean>;

  getModels(settings: Settings): Promise<string[]>;
}

export const MODEL_PROVIDERS: Record<ModelProviderName, ModelProvider> = {
  [ModelProviderName.OpenAI]: new OpenAIModelProvider(),
  [ModelProviderName.Ollama]: new OllamaModelProvider(),
};
