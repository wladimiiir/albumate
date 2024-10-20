import { Image, Settings } from '@shared/types';

export interface ElectronAPI {
  saveSettings: (settings: Settings) => Promise<void>;
  getSettings: () => Promise<Settings>;
  addFolder: () => Promise<{ success: boolean; message: string }>;
  getImages: () => Promise<Image[]>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
