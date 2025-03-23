import { Env } from "../api/paddle-webhook.js";

// Simple mock of KV for testing
const mockKV = {
  store: new Map<string, { value: string; metadata?: any }>(),

  async get(key: string) {
    return this.store.has(key) ? this.store.get(key)?.value || null : null;
  },

  async put(key: string, value: string, options?: { metadata?: any }) {
    this.store.set(key, { value, metadata: options?.metadata });
    return Promise.resolve();
  },

  async getWithMetadata(key: string) {
    const item = this.store.get(key);
    return {
      value: item?.value || null,
      metadata: item?.metadata || null,
      cacheStatus: "MISS",
    };
  },

  async delete(key: string) {
    this.store.delete(key);
    return Promise.resolve();
  },

  async list() {
    const keys = Array.from(this.store.entries()).map(
      ([name, { metadata }]) => ({
        name,
        metadata,
      })
    );

    return {
      keys,
      list_complete: true,
      cacheStatus: "MISS",
    };
  },
};

// Use Bun.env first, then fallback to process.env if not set
export const testEnv: Env = {
  PADDLE_WEBHOOK_SECRET:
    Bun.env.PADDLE_WEBHOOK_SECRET || process.env.PADDLE_WEBHOOK_SECRET,
  KEYCLOAK_CLIENT_ID:
    Bun.env.KEYCLOAK_CLIENT_ID || process.env.KEYCLOAK_CLIENT_ID,
  KEYCLOAK_CLIENT_SECRET:
    Bun.env.KEYCLOAK_CLIENT_SECRET || process.env.KEYCLOAK_CLIENT_SECRET,
  PADDLE_API_KEY: Bun.env.PADDLE_API_KEY || process.env.PADDLE_API_KEY,
  // Use type assertion to satisfy the interface
  KV: mockKV as any,
};
