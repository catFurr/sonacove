import { PagesFunction } from "@cloudflare/workers-types";

export interface Env {
  PADDLE_API_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const authHeader = context.request.headers.get('Authorization');

  if (!authHeader) {
    return new Response('Missing Authorization header', { status: 401 });
  }

  const jwt = authHeader.split('Bearer ')[1];

  // TODO: Replace this with your real logic to validate JWT and extract the customer ID
  const customerId = extractCustomerId(jwt); // Implement this logic

  if (!customerId) {
    return new Response('Unauthorized', { status: 403 });
  }

  // Call Paddle API to generate customer portal link
  const res = await fetch(
    'https://api.paddle.com/customers/' + customerId + '/portal-link',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${context.env.PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const json = await res.json();

  if (!res.ok) {
    return new Response(JSON.stringify(json), { status: res.status });
  }

  return new Response(JSON.stringify({ url: json.data.url }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

// Placeholder function – you will need to write this.
function extractCustomerId(jwt: string): string | null {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return payload?.context?.user?.customer_id || null;
  } catch (e) {
    console.error('Invalid JWT', e);
    return null;
  }
}