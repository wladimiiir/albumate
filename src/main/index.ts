import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs/promises'
import path from 'path'

interface Config {
  openAIBaseURL: string
  apiKey: string
  model: string
}

interface Image {
  id: string
  src: string
  caption: string
  tags: string[]
}

interface StoreSchema {
  settings: Config
  images: Image[]
}

interface Store<T> {
  get<K extends keyof T>(key: K): T[K]
  set<K extends keyof T>(key: K, value: T[K]): void
}

let store: Store<StoreSchema>
const initStore = async (): Promise<void> => {
  const ElectronStore = (await import('electron-store')).default
  store = new ElectronStore<StoreSchema>() as unknown as Store<StoreSchema>
}

const createWindow = async (): Promise<void> => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  await initStore()

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    await mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    await mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC handlers
  ipcMain.handle('save-settings', (_event, settings: Config) => {
    store.set('settings', settings)
  })

  ipcMain.handle('get-settings', () => {
    return store.get('settings')
  })

  ipcMain.handle('add-folder', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    if (!result.canceled) {
      const folderPath = result.filePaths[0]
      await scanFolder(folderPath)
      return { success: true, message: 'Folder added successfully' }
    }
    return { success: false, message: 'Folder selection cancelled' }
  })

  ipcMain.handle('get-images', () => {
    return store.get('images')
  })

  void createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow()
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

async function scanFolder(folderPath: string): Promise<void> {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  const images: Image[] = []

  async function scanRecursively(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await scanRecursively(fullPath)
      } else if (entry.isFile() && imageExtensions.includes(path.extname(entry.name).toLowerCase())) {
        images.push({
          id: fullPath,
          src: `file://${fullPath}`,
          caption: 'Image caption placeholder', // This would be replaced with AI-generated caption
          tags: ['tag1', 'tag2'] // This would be replaced with AI-generated tags
        })
      }
    }
  }

  await scanRecursively(folderPath)
  const existingImages = store.get('images')
  store.set('images', [...existingImages, ...images])
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
