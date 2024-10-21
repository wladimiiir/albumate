import { Settings, Image, WindowState } from '@shared/types';

interface StoreSchema {
  windowState: WindowState;
  settings: Settings;
  images: Image[];
}

interface CustomStore<T> {
  get<K extends keyof T>(key: K): T[K];

  set<K extends keyof T>(key: K, value: T[K]): void;
}

export class Store {
  // @ts-expect-error expected to be initialized
  private store: CustomStore<StoreSchema>;

  async init(): Promise<void> {
    const ElectronStore = (await import('electron-store')).default;
    this.store = new ElectronStore<StoreSchema>() as unknown as CustomStore<StoreSchema>;
  }

  getImages(): Image[] {
    return this.store.get('images') || this.getDefaultImages();
  }

  private getDefaultImages(): Image[] {
    return [];
  }

  setImages(images: Image[]): void {
    this.store.set('images', images);
  }

  getSettings(): Settings {
    return this.store.get('settings') || this.getDefaultSettings();
  }

  private getDefaultSettings(): Settings {
    return {
      openAIBaseURL: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-4-turbo',
    };
  }

  setSettings(settings: Settings): void {
    this.store.set('settings', settings);
  }

  getWindowState(): StoreSchema['windowState'] {
    return this.store.get('windowState') || this.getDefaultWindowState();
  }

  private getDefaultWindowState(): WindowState {
    return {
      width: 900,
      height: 670,
      x: undefined,
      y: undefined,
      isMaximized: false,
    };
  }

  setWindowState(windowState: WindowState): void {
    this.store.set('windowState', windowState);
  }
}
