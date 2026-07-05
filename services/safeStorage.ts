// Safe Storage wrapper to prevent Safari/iOS Private Mode or cookie-blocking crashes
const memoryStorage: Record<string, string> = {};

const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

const hasLocalStorage = isLocalStorageAvailable();

export const safeStorage = {
  getItem: (key: string): string | null => {
    if (hasLocalStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        console.warn('Storage read blocked, using memory cache:', e);
      }
    }
    return memoryStorage[key] !== undefined ? memoryStorage[key] : null;
  },

  setItem: (key: string, value: string): void => {
    if (hasLocalStorage) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch (e) {
        console.warn('Storage write blocked, saving to memory cache:', e);
      }
    }
    memoryStorage[key] = String(value);
  },

  removeItem: (key: string): void => {
    if (hasLocalStorage) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch (e) {
        console.warn('Storage delete blocked, clearing from memory cache:', e);
      }
    }
    delete memoryStorage[key];
  }
};
