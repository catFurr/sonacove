import { PostHog } from 'posthog-node'

const posthog = new PostHog(
    'phx_T4IeAADzAHr2A4iHpQrmM6PDW1E08b09Kp70PADEpeWbXSkq',
    { host: 'https://e.sonacove.com' }
)

export { posthog }