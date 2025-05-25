

export interface Env {
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
    PUBLIC_PADDLE_ENVIRONMENT?: string;

    GRAFANA_USERNAME: string;
    GRAFANA_API_KEY: string;
}

export type WorkerContext = EventContext<Env, any, Record<string, unknown>>

export type WorkerFunction = PagesFunction<Env>