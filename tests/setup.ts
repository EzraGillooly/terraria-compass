import '@testing-library/jest-dom';

const storageState = new Map<string, string>();

const storageMock = {
  getItem(key: string) {
    return storageState.has(key) ? storageState.get(key)! : null;
  },
  setItem(key: string, value: string) {
    storageState.set(key, value);
  },
  removeItem(key: string) {
    storageState.delete(key);
  },
  clear() {
    storageState.clear();
  },
};

Object.defineProperty(window, 'localStorage', {
  value: storageMock,
  configurable: true,
});

Object.defineProperty(globalThis, 'localStorage', {
  value: storageMock,
  configurable: true,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

beforeEach(() => {
  storageMock.clear();
  document.documentElement.removeAttribute('data-theme');
});
