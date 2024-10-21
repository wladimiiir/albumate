export interface Settings {
  openAIBaseURL: string;
  apiKey: string;
  model: string;
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
