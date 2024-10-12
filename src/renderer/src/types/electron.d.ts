export interface ElectronAPI {
  saveSettings: (settings: Settings) => Promise<void>;
  getSettings: () => Promise<Settings>;
  addFolder: () => Promise<{ success: boolean; message: string }>;
  getImages: () => Promise<Array<{ id: string; src: string; caption: string; tags: string[] }>>;
}

export interface Settings {
  openAIBaseURL: string;
  apiKey: string;
  model: string;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
