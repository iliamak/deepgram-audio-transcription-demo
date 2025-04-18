/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_DEEPGRAM_API_KEY: string;
    // ... другие env переменные
  };
}
