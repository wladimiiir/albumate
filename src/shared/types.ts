export enum ModelProviderName {
  OpenAI = 'openai',
  Ollama = 'ollama',
}

export interface ModelProviderConfig {
  name: ModelProviderName;
  model: string;
}

export interface OpenAIProviderConfig extends ModelProviderConfig {
  name: ModelProviderName.OpenAI;
  openAIBaseURL: string;
  openAIApiKey: string;
  model: string;
}

export interface OllamaProviderConfig extends ModelProviderConfig {
  name: ModelProviderName.Ollama;
}

export interface OllamaProviderConfig extends ModelProviderConfig {
  name: ModelProviderName.Ollama;
  ollamaBaseURL: string;
}

export interface Settings {
  modelProviderConfig: ModelProviderConfig;
}

export interface WindowState {
  width: number;
  height: number;
  x: number | undefined;
  y: number | undefined;
  isMaximized: boolean;
}

export interface Image {
  id: string;
  src: string;
  caption: string;
  tags: string[];
  processing: boolean;
}
