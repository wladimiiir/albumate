import { dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { ipcMain } from 'electron';
import { StoreSchema, Store, Config, Image } from '@shared/types';
import { AIModel } from './aiModel';
import { eventManager } from './eventManager';

export const setupIpcHandlers = (webContents: Electron.WebContents, store: Store<StoreSchema>, aiModel: AIModel) => {
  ipcMain.handle('save-settings', (_event, settings: Config) => {
    store.set('settings', settings);
  });

  ipcMain.handle('get-settings', () => {
    return store.get('settings');
  });

  ipcMain.handle('add-folder', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (!result.canceled) {
      const folderPath = result.filePaths[0];
      await scanFolder(store, folderPath, aiModel);
      return { success: true, message: 'Folder added successfully' };
    }
    return { success: false, message: 'Folder selection cancelled' };
  });

  ipcMain.handle('get-images', () => {
    return store.get('images');
  });

  ipcMain.handle('generate-image-caption', async (_event, image: Image) => {
    await aiModel.queueImageCaptionGeneration(image);
  });

  eventManager.on('update-image', async (image: Image) => {
    console.log('update-image', image);

    const images = store.get('images');
    const imageIndex = images.findIndex((img) => img.id === image.id);
    if (imageIndex !== -1) {
      images[imageIndex] = image;
      store.set('images', images);
      webContents.send('image-updated', image);
    }
  });
};

async function scanFolder(store: Store<StoreSchema>, folderPath: string, aiModel: AIModel) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const images: Image[] = store.get('images') || [];

  const scanRecursively = async (dir: string) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await scanRecursively(fullPath);
      } else if (entry.isFile() && imageExtensions.includes(path.extname(entry.name).toLowerCase())) {
        let image = images.find((image) => image.id === fullPath);
        if (image) {
          image.processing = true;
        } else {
          image = {
            id: fullPath,
            src: `file://${fullPath}`,
            caption: '',
            tags: [],
            processing: true,
          };
          images.push(image);
        }

        await aiModel.queueImageCaptionGeneration(image);
      }
    }
  };

  await scanRecursively(folderPath);
  store.set('images', images);
}
