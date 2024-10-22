import { contextBridge, ipcRenderer } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import { electronAPI } from '@electron-toolkit/preload';
import { Image, Settings } from '@shared/types';

const imageUpdatedListeners: Record<string, (event: Electron.IpcRendererEvent, image: Image) => void> = {};

// Custom APIs for renderer
const api = {
  saveSettings: (settings: Settings): Promise<void> => ipcRenderer.invoke('save-settings', settings),
  getSettings: (): Promise<Settings> => ipcRenderer.invoke('get-settings'),
  addFolder: (): Promise<{ success: boolean; message: string }> => ipcRenderer.invoke('add-folder'),
  getImages: (): Promise<Image[]> => ipcRenderer.invoke('get-images'),
  generateImageCaption: (image: Image): Promise<string> => ipcRenderer.invoke('generate-image-caption', image),
  addImageUpdatedListener: (callback: (event: Electron.IpcRendererEvent, image: Image) => void): string => {
    const listenerId = uuidv4();
    imageUpdatedListeners[listenerId] = callback;

    ipcRenderer.on('image-updated', callback);
    return listenerId;
  },
  removeImageUpdatedListener: (listenerId: number): void => {
    const callback = imageUpdatedListeners[listenerId];
    if (callback) {
      ipcRenderer.removeListener('image-updated', callback);
    }
  },
  getModels: (settings: Settings): Promise<string[]> => ipcRenderer.invoke('get-models', settings),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
