/**
 * Universal storage — React Native va Web uchun
 *
 * React Native: @react-native-async-storage/async-storage ishlatadi
 * Web: localStorage ishlatadi
 *
 * Foydalanish:
 *   storage.setup(AsyncStorage)  // React Native'da — App.tsx da bir marta
 *   storage.setup()              // Web'da — hech narsa kerak emas
 */

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

// Web uchun localStorage wrapper (Promise-based)
const webAdapter: StorageAdapter = {
  getItem: async (key) => localStorage.getItem(key),
  setItem: async (key, value) => localStorage.setItem(key, value),
  removeItem: async (key) => localStorage.removeItem(key),
};

let adapter: StorageAdapter = webAdapter;

export const storage = {
  /** React Native'da AsyncStorage ni ulash uchun */
  setup: (asyncStorage?: StorageAdapter) => {
    if (asyncStorage) adapter = asyncStorage;
  },

  get: (key: string) => adapter.getItem(key),
  set: (key: string, value: string) => adapter.setItem(key, value),
  remove: (key: string) => adapter.removeItem(key),

  // JSON helpers
  getJson: async <T>(key: string): Promise<T | null> => {
    const val = await adapter.getItem(key);
    if (!val) return null;
    try { return JSON.parse(val) as T; } catch { return null; }
  },
  setJson: async (key: string, value: unknown) =>
    adapter.setItem(key, JSON.stringify(value)),
};

export const STORAGE_KEYS = {
  TOKEN: "tezgo_token",
  USER: "tezgo_user",
};
