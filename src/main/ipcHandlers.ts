import { ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { StoreSchema, Store, Config, Image } from '@shared/types';

export const setupIpcHandlers = (store: Store<StoreSchema>): void => {
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
      await scanFolder(store, folderPath);
      return { success: true, message: 'Folder added successfully' };
    }
    return { success: false, message: 'Folder selection cancelled' };
  });

  ipcMain.handle('get-images', () => {
    return store.get('images');
  });
};

async function scanFolder(store: Store<StoreSchema>, folderPath: string): Promise<void> {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const images: Image[] = store.get('images') || [];

  async function scanRecursively(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await scanRecursively(fullPath);
      } else if (entry.isFile() && imageExtensions.includes(path.extname(entry.name).toLowerCase())) {
        images.push({
          id: fullPath,
          src: `file://${fullPath}`,
          caption: 'Image caption placeholder', // This would be replaced with AI-generated caption
          tags: ['tag1', 'tag2'], // This would be replaced with AI-generated tags
          processing: true,
        });
      }
    }
  }

  await scanRecursively(folderPath);
  store.set('images', images);
}
