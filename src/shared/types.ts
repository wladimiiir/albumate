export interface Settings {
  openAIBaseURL: string;
  apiKey: string;
  model: string;
}

export interface Config {
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

export interface StoreSchema {
  windowState: WindowState;
  settings: Config;
  images: Image[];
}

export interface Store<T> {
  get<K extends keyof T>(key: K): T[K];
  set<K extends keyof T>(key: K, value: T[K]): void;
}
