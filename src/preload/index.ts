import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { Config, Image } from '@shared/types';

// Custom APIs for renderer
const api = {
  saveSettings: (settings: Config): Promise<void> => ipcRenderer.invoke('save-settings', settings),
  getSettings: (): Promise<Config> => ipcRenderer.invoke('get-settings'),
  addFolder: (): Promise<{ success: boolean; message: string }> => ipcRenderer.invoke('add-folder'),
  getImages: (): Promise<Image[]> => ipcRenderer.invoke('get-images'),
  generateImageCaption: (image: Image): Promise<string> => ipcRenderer.invoke('generate-image-caption', image),
  onImageUpdated: (callback: (event: Electron.IpcRendererEvent, image: Image) => void): void => {
    ipcRenderer.on('image-updated', callback);
  },
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
