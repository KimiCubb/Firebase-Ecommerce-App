import "whatwg-fetch";
import "@testing-library/jest-dom";

/**
 * Mock sessionStorage and localStorage for test environment
 */
class MockStorage implements Storage {
  private store: Record<string, string> = {};

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] ?? null;
  }

  get length(): number {
    return Object.keys(this.store).length;
  }
}

// Setup global mocks
Object.defineProperty(window, "sessionStorage", {
  value: new MockStorage(),
  writable: true,
});

Object.defineProperty(window, "localStorage", {
  value: new MockStorage(),
  writable: true,
});
