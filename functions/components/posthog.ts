import { getLogger } from './pino-logger.ts';

const logger = getLogger();

export async function capturePosthogEvent({
  distinctId,
  event,
  env,
}: {
  distinctId: string;
  event: string;
  env?: any;
}) {
  try {
    const res = await fetch('https://e.sonacove.com/capture/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({  
        api_key: env.POSTHOG_API_KEY,
        event,
        distinct_id: distinctId,
      }),
    });
    console.log(res);
    if (!res.ok) {
      const body = await res.text();
      logger.error(`PostHog capture failed: ${res.status} ${body}`);
    }
  } catch (error) {
    logger.error('PostHog capture error:', error);
    console.log(error);
  }
}
