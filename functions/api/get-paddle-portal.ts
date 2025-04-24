export interface Env {
  PADDLE_API_KEY: string;
}

function extractCustomerId(jwt: string): string | null {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return payload?.context?.user?.customer_id || null;
  } catch (e) {
    console.error('Invalid JWT', e);
    return null;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return new Response('Missing Authorization header', { status: 401 });
    }

    const jwt = authHeader.split('Bearer ')[1];
    const customerId = extractCustomerId(jwt);

    if (!customerId) {
      return new Response('Unauthorized', { status: 403 });
    }

    const paddleRes = await fetch(
      `https://api.paddle.com/customers/${customerId}/portal-link`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.PADDLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const json = await paddleRes.json();

    if (!paddleRes.ok) {
      return new Response(JSON.stringify(json), { status: paddleRes.status });
    }

    return new Response(JSON.stringify({ url: json.data.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
