import * as FileSystem from 'expo-file-system';

export const initializeCache = async () => {
    return new ExpoFileSystemCache();
};

class ExpoFileSystemCache {
  constructor() {
    this.cacheDir = `${FileSystem.documentDirectory}leipzig-giess-cache/`;
  }

  async init() {
    try {
      const info = await FileSystem.getInfoAsync(this.cacheDir);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(this.cacheDir, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to initialize cache directory:', error);
    }
  }

  async setItem(key, value) {
    try {
      const filePath = `${this.cacheDir}${key}.json`;
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set cache item ${key}:`, error);
    }
  }

  async getItem(key) {
    try {
      const filePath = `${this.cacheDir}${key}.json`;
      const content = await FileSystem.readAsStringAsync(filePath);
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  async removeItem(key) {
    try {
      const filePath = `${this.cacheDir}${key}.json`;
      await FileSystem.deleteAsync(filePath);
    } catch (error) {
      console.error(`Failed to remove cache item ${key}:`, error);
    }
  }

  async clear() {
    try {
      await FileSystem.deleteAsync(this.cacheDir);
      await this.init();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}