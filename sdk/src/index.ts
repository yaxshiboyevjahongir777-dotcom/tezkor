export * from "./types";
export * from "./api";
export * from "./socket";
export * from "./storage";

// Qulay bitta init funksiyasi
import { configure, setToken } from "./api";
import { configureSocket } from "./socket";
import { storage, STORAGE_KEYS } from "./storage";

export async function initTezgo(config: {
  apiUrl: string;
  socketUrl?: string;
}) {
  configure(config.apiUrl);
  configureSocket(config.socketUrl || config.apiUrl.replace("/api", ""));

  // Saqlangan tokenni tiklash
  const savedToken = await storage.get(STORAGE_KEYS.TOKEN);
  if (savedToken) {
    setToken(savedToken);
  }

  return { hasToken: !!savedToken };
}
