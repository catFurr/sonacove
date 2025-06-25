import { getLogger } from "./pino-logger.ts";

const logger = getLogger();

export async function capturePosthogEvent({
  distinctId,
  event,
  properties = {},
}: {
  distinctId: string;
  event: string;
  properties?: Record<string, any>;
}) {
  try {
    const res = await fetch('https://e.sonacove.com/capture/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: 'phc_6DQmHYaWUYWvs6rLBWQooIrmPadIgT3fK61s8DAfIH0',
        event,
        distinct_id: distinctId
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