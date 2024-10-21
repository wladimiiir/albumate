import { dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { ipcMain } from 'electron';
import { Image, Settings } from '@shared/types';
import { AIModel } from './aiModel';
import { eventManager } from './eventManager';
import { Store } from './store';

const scanFolder = async (store: Store, folderPath: string, aiModel: AIModel) => {
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

        await aiModel.queueImageCaptionGeneration(image);
      }
    }
  };

  await scanRecursively(folderPath);
  store.setImages(images);
};

export const setupIpcHandlers = (webContents: Electron.WebContents, store: Store, aiModel: AIModel) => {
  ipcMain.handle('save-settings', (_event, settings: Settings) => {
    store.setSettings(settings);
  });

  ipcMain.handle('get-settings', () => {
    return store.getSettings();
  });

  ipcMain.handle('add-folder', async () => {
    const settings = store.getSettings();
    if (settings.openAIBaseURL === '' || settings.apiKey === '') {
      return { success: false, message: 'OpenAI API settings not found. Go to Settings and enter your API key and base URL.' };
    }

    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (!result.canceled) {
      const folderPath = result.filePaths[0];
      await scanFolder(store, folderPath, aiModel);
      return { success: true, message: 'Folder added successfully' };
    }
    return { success: false };
  });

  ipcMain.handle('get-images', () => {
    return store.getImages();
  });

  ipcMain.handle('generate-image-caption', async (_event, image: Image) => {
    await aiModel.queueImageCaptionGeneration(image);
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
};
