import type {
  Fetcher,
  KVNamespace,
  EventContext,
  PagesFunction,
  Request as CFRequest,
  Response as CFResponse,
  ExecutionContext,
} from "@cloudflare/workers-types";

export interface Env {
    // Bindings
    ASSETS: Fetcher; // For serving static assets
    KV: KVNamespace;

    KC_CLIENT_ID: string;
    KC_CLIENT_SECRET: string;
    KC_WEBHOOK_SECRET: string;
    KC_HOSTNAME: string;

    BREVO_API_KEY: string;
    DISCORD_PUBLIC_KEY: string;
    DISCORD_BOT_TOKEN: string;

    PADDLE_WEBHOOK_SECRET: string;
    PADDLE_API_KEY: string;
    PUBLIC_PADDLE_ENVIRONMENT?: "production" | "sandbox";

    GRAFANA_USERNAME: string;
    GRAFANA_API_KEY: string;

    POSTHOG_API_KEY: string;
}

export type WorkerContext = EventContext<Env, any, Record<string, unknown>>

export type WorkerFunction = PagesFunction<Env>

// Helper type for the default export function signature we expect from API modules
export type ApiModuleDefaultHandler = (
  request: CFRequest,
  env: Env,
  ctx: ExecutionContext
) => Promise<CFResponse> | CFResponse;

// Helper type for modules exporting an onRequest (Pages-style)
export type ApiModuleOnRequestHandler = (context: {
  request: CFRequest;
  env: Env;
  waitUntil: (promise: Promise<any>) => void;
  params: Record<string, string | string[]>; // Allow string[] for multi-value params
  data: Record<string, unknown>;
  next: (input?: CFRequest | string, init?: RequestInit) => Promise<CFResponse>;
}) => Promise<CFResponse> | CFResponse;
