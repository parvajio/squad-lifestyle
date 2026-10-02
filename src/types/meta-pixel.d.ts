interface FbqFunction {
  (action: 'track', event: string, params?: Record<string, unknown>): void;
  (action: 'init', pixelId: string): void;
  (action: 'set', key: string, value: string | boolean, pixelId: string): void;
  push?: unknown;
  loaded?: boolean;
  version?: string;
  queue?: unknown[];
}

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
  }
}

export {};
