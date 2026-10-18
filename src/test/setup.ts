// Vitest test environment setup: In-memory localStorage shim for Zustand persist tests

const storageMap = new Map<string, string>();

const localStorageMock: Storage = {
  getItem: (key: string): string | null => {
    return storageMap.get(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    storageMap.set(key, String(value));
  },
  removeItem: (key: string): void => {
    storageMap.delete(key);
  },
  clear: (): void => {
    storageMap.clear();
  },
  key: (index: number): string | null => {
    return Array.from(storageMap.keys())[index] ?? null;
  },
  get length(): number {
    return storageMap.size;
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

if (typeof window === 'undefined') {
  (globalThis as any).window = globalThis;
}
