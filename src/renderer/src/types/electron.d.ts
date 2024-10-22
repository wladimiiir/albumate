import { Image, Settings } from '@shared/types';

export interface ElectronAPI {
  saveSettings: (settings: Settings) => Promise<void>;
  getSettings: () => Promise<Settings>;
  addFolder: () => Promise<{ success: boolean; message?: string }>;
  getImages: () => Promise<Image[]>;
  generateImageCaption: (image: Image) => Promise<string>;
  addImageUpdatedListener: (callback: (event: Electron.IpcRendererEvent, image: Image) => void) => string;
  removeImageUpdatedListener: (listenerId: string) => void;
  getModels: (settings: Settings) => Promise<string[]>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
