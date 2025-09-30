import { getLogger } from './pino-logger';
import { POSTHOG_API_KEY } from 'astro:env/server';

const logger = getLogger();


const PH_PROXY_ENDPOINT = 'https://e.sonacove.com/capture/';

export async function capturePosthogEvent({
  distinctId,
  event,
}: {
  distinctId: string;
  event: string;
}) {
  try {
    const res = await fetch(PH_PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({  
        api_key: POSTHOG_API_KEY,
        event,
        distinct_id: distinctId,
      }),
    });
    console.log(res);
    if (!res.ok) {
      const body = await res.text();
      logger.error(`PostHog capture failed: ${res.status} ${body}`);
    }
  } catch (e) {
    logger.error(e, 'PostHog capture error:');
    console.log(e);
  }
}
