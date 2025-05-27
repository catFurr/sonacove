import { PostHog } from 'posthog-node'

const posthog = new PostHog(
  'phx_9VVtWZHAHgFpVZ0MDkCJm4DUClreOIbuXGcGmDL9QZWvykk',
  { host: 'https://eu.posthog.com' },
);

export { posthog }