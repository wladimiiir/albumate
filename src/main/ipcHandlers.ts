import { dialog, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { Image, Settings } from '@shared/types';
import { ModelManager } from './modelManager';
import { eventManager } from './eventManager';
import { Store } from './store';
import { MODEL_PROVIDERS } from './models/modelProvider';

const scanFolder = async (store: Store, folderPath: string, modelManager: ModelManager) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const images: Image[] = store.getImages() || [];

  const scanRecursively = async (dir: string) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const imagePath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await scanRecursively(imagePath);
      } else if (entry.isFile() && imageExtensions.includes(path.extname(entry.name).toLowerCase())) {
        let image = images.find((image) => image.id === imagePath);
        if (image) {
          image.processing = true;
        } else {
          image = {
            id: imagePath,
            src: `file://${imagePath}`,
            caption: '',
            tags: [],
            processing: true,
          };
          images.push(image);
        }

        await modelManager.queueImageCaptionGeneration(image);
      }
    }
  };

  await scanRecursively(folderPath);
  store.setImages(images);
};

export const setupIpcHandlers = (webContents: Electron.WebContents, store: Store, modelManager: ModelManager) => {
  ipcMain.handle('save-settings', (_event, settings: Settings) => {
    store.setSettings(settings);
  });

  ipcMain.handle('get-settings', () => {
    return store.getSettings();
  });

  ipcMain.handle('add-folder', async () => {
    const settings = store.getSettings();

    if (!MODEL_PROVIDERS[settings.modelProviderConfig.name].isInitialized(settings)) {
      return { success: false, message: 'Model provider not initialized. Go to Settings and enter your the information for the model provider.' };
    }

    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (!result.canceled) {
      const folderPath = result.filePaths[0];
      await scanFolder(store, folderPath, modelManager);
      return { success: true, message: 'Folder added successfully' };
    }
    return { success: false };
  });

  ipcMain.handle('get-images', () => {
    return store.getImages();
  });

  ipcMain.handle('generate-image-caption', async (_event, image: Image) => {
    await modelManager.queueImageCaptionGeneration(image);
  });

  eventManager.on('update-image', async (image: Image) => {
    const images = store.getImages();
    const imageIndex = images.findIndex((img) => img.id === image.id);
    if (imageIndex !== -1) {
      images[imageIndex] = image;
      store.setImages(images);
      webContents.send('image-updated', image);
    }
  });

  ipcMain.handle('get-models', async (_event, settings: Settings) => {
    const provider = MODEL_PROVIDERS[settings.modelProviderConfig.name];
    if (provider) {
      return await provider.getModels(settings);
    }
    throw new Error('Model provider not initialized or not found');
  });
};
