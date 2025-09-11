
import { envField } from "astro/config";

type EnvSchema = Record<string, 
        ReturnType<typeof envField.string>
        | ReturnType<typeof envField.number>
        | ReturnType<typeof envField.boolean>
        | ReturnType<typeof envField.enum>
    >

const publicString = envField.string({
    context: "client",
    access: "public",
});

const privateString = envField.string({
    context: "server",
    access: "secret",
});

const schema: EnvSchema = {
    // Client-side environment variables (PUBLIC_*)
    PUBLIC_BREVO_WEBHOOK_URL: publicString,
    PUBLIC_PADDLE_CLIENT_TOKEN: publicString,
    PUBLIC_PADDLE_PRICE_ID: publicString,
    PUBLIC_PADDLE_PREMIUM_PRICE_ID: publicString,
    PUBLIC_PADDLE_ORGANIZATION_PRICE_ID: publicString,
    PUBLIC_KC_HOSTNAME: publicString,
    PUBLIC_CF_ENV: envField.enum({
        context: 'client',
        access: "public",
        values: ['staging', 'production']
    }),

    // Server-side secret environment variables
    KC_CLIENT_ID: privateString,
    KC_CLIENT_SECRET: privateString,
    KC_WEBHOOK_SECRET: privateString,
    BREVO_API_KEY: privateString,
    DISCORD_PUBLIC_KEY: privateString,
    DISCORD_BOT_TOKEN: privateString,
    PADDLE_WEBHOOK_SECRET: privateString,
    PADDLE_API_KEY: privateString,
    GRAFANA_USERNAME: privateString,
    GRAFANA_API_KEY: privateString,
    POSTHOG_API_KEY: privateString,
    CF_WEBHOOK_SECRET: privateString,
    DB_HOST: privateString,
    DB_PORT: envField.number({
        context: "server",
        access: "secret",
        default: 5432,
    }),
    DB_USER: privateString,
    DB_PASSWORD: privateString,
    DB_NAME: privateString,
}

export default schema;