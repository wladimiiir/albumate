import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

interface Settings {
  openAIBaseURL: string
  apiKey: string
  model: string
}

// Custom APIs for renderer
const api = {
  saveSettings: (settings: Settings): Promise<void> => ipcRenderer.invoke('save-settings', settings),
  getSettings: (): Promise<Settings> => ipcRenderer.invoke('get-settings'),
  addFolder: (): Promise<{ success: boolean; message: string }> => ipcRenderer.invoke('add-folder'),
  getImages: (): Promise<Array<{ id: string; src: string; caption: string; tags: string[] }>> => ipcRenderer.invoke('get-images')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
