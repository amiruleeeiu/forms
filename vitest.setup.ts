import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock window.matchMedia (not available in jsdom)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver — must be a class so `new ResizeObserver()` works (@floating-ui requirement)
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver =
  ResizeObserverMock as unknown as typeof ResizeObserver;

// Mock IntersectionObserver (used by some shadcn/ui components)
class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.IntersectionObserver =
  IntersectionObserverMock as unknown as typeof IntersectionObserver;

// Mock scrollIntoView (not available in jsdom)
Element.prototype.scrollIntoView = vi.fn();
