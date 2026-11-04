import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const STORAGE_PREFIX = "ocean-diary.auth.v1";
const MAX_CHUNK_UTF8_BYTES = 900;
const MAX_CHUNKS = 256;

type StorageManifest = {
  version: 1;
  generation: string;
  chunkCount: number;
};

function safeStorageKey(key: string): string {
  const safeKey = key.replace(/[^A-Za-z0-9_-]/g, (character) =>
    `_u${character.codePointAt(0)?.toString(16) ?? "0"}_`,
  );
  if (!safeKey || safeKey.length > 160) {
    throw new Error("Supabase auth storage key is not supported.");
  }
  return `${STORAGE_PREFIX}.${safeKey}`;
}

function manifestKey(namespace: string): string {
  return `${namespace}.meta`;
}

function chunkKey(namespace: string, generation: string, index: number): string {
  return `${namespace}.${generation}.${index}`;
}

function utf8ByteLength(character: string): number {
  const codePoint = character.codePointAt(0) ?? 0;
  if (codePoint <= 0x7f) return 1;
  if (codePoint <= 0x7ff) return 2;
  if (codePoint <= 0xffff) return 3;
  return 4;
}

function splitUtf8Chunks(value: string): string[] {
  const chunks: string[] = [];
  let currentChunk = "";
  let currentBytes = 0;

  for (const character of value) {
    const characterBytes = utf8ByteLength(character);
    if (currentChunk && currentBytes + characterBytes > MAX_CHUNK_UTF8_BYTES) {
      chunks.push(currentChunk);
      currentChunk = "";
      currentBytes = 0;
    }
    currentChunk += character;
    currentBytes += characterBytes;
  }

  if (currentChunk || chunks.length === 0) chunks.push(currentChunk);
  if (chunks.length > MAX_CHUNKS) {
    throw new Error("Supabase auth session is too large for secure device storage.");
  }
  return chunks;
}

function parseManifest(raw: string | null): StorageManifest | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<StorageManifest>;
    if (
      value.version === 1
      && typeof value.generation === "string"
      && /^[a-z0-9]+$/.test(value.generation)
      && Number.isInteger(value.chunkCount)
      && (value.chunkCount ?? 0) > 0
      && (value.chunkCount ?? MAX_CHUNKS + 1) <= MAX_CHUNKS
    ) {
      return value as StorageManifest;
    }
  } catch {
    return null;
  }
  return null;
}

async function writeSecureValue(key: string, value: string): Promise<void> {
  const namespace = safeStorageKey(key);
  const storageManifestKey = manifestKey(namespace);
  const previousManifest = parseManifest(await SecureStore.getItemAsync(storageManifestKey));
  const generation = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  const chunks = splitUtf8Chunks(value);
  let writtenChunks = 0;

  try {
    for (let index = 0; index < chunks.length; index += 1) {
      await SecureStore.setItemAsync(chunkKey(namespace, generation, index), chunks[index]);
      writtenChunks += 1;
    }
    const nextManifest: StorageManifest = {
      version: 1,
      generation,
      chunkCount: chunks.length,
    };
    await SecureStore.setItemAsync(storageManifestKey, JSON.stringify(nextManifest));
  } catch (error) {
    await Promise.allSettled(
      Array.from({ length: writtenChunks }, (_, index) =>
        SecureStore.deleteItemAsync(chunkKey(namespace, generation, index)),
      ),
    );
    throw error;
  }

  if (previousManifest && previousManifest.generation !== generation) {
    await Promise.allSettled(
      Array.from({ length: previousManifest.chunkCount }, (_, index) =>
        SecureStore.deleteItemAsync(chunkKey(namespace, previousManifest.generation, index)),
      ),
    );
  }
}

/** Supabase session storage backed by encrypted platform storage, chunked to
 * stay below SecureStore's per-value limits on older iOS releases. */
export const supabaseSecureStorage = {
  async getItem(key: string): Promise<string | null> {
    const namespace = safeStorageKey(key);
    const storedManifest = await SecureStore.getItemAsync(manifestKey(namespace));
    const manifest = parseManifest(storedManifest);
    if (storedManifest && !manifest) {
      await SecureStore.deleteItemAsync(manifestKey(namespace));
    }

    if (manifest) {
      const chunks = await Promise.all(
        Array.from({ length: manifest.chunkCount }, (_, index) =>
          SecureStore.getItemAsync(chunkKey(namespace, manifest.generation, index)),
        ),
      );
      if (chunks.every((chunk) => chunk !== null)) {
        const secureValue = (chunks as string[]).join("");
        // Finish cleanup if the app was stopped after secure write but before
        // the one-time AsyncStorage migration removed its old copy.
        await AsyncStorage.removeItem(key);
        return secureValue;
      }
    }

    // One-time migration from the previous AsyncStorage-backed Supabase session.
    const legacyValue = await AsyncStorage.getItem(key);
    if (legacyValue === null) return null;
    await writeSecureValue(key, legacyValue);
    await AsyncStorage.removeItem(key);
    return legacyValue;
  },

  async setItem(key: string, value: string): Promise<void> {
    await writeSecureValue(key, value);
  },

  async removeItem(key: string): Promise<void> {
    const namespace = safeStorageKey(key);
    const storageManifestKey = manifestKey(namespace);
    const manifest = parseManifest(await SecureStore.getItemAsync(storageManifestKey));
    await SecureStore.deleteItemAsync(storageManifestKey);
    if (manifest) {
      await Promise.all(
        Array.from({ length: manifest.chunkCount }, (_, index) =>
          SecureStore.deleteItemAsync(chunkKey(namespace, manifest.generation, index)),
        ),
      );
    }
    await AsyncStorage.removeItem(key);
  },
};
