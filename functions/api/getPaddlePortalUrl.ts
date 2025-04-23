function extractCustomerId(jwt: string): string | null {
  try {
    const payloadB64 = jwt.split('.')[1];

    // Convert base64url to standard base64
    const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '=',
    );

    const jsonStr = atob(padded);
    const payload = JSON.parse(jsonStr);

    return payload.context?.user?.paddle_customer_id || null;
  } catch (e) {
    console.error('Failed to extract customer ID from JWT:', e);
    return null;
  }
}

export async function onRequest(context: ExecutionContext, env: Env) {
  const { request } = context;
  const jwt = request.headers.get('Authorization')?.split(' ')[1];

  // Accessing the environment variables
  const paddleApiKey = env.PADDLE_API_KEY; // Example of accessing the API key

  // Decode the JWT and get the customer ID (same as earlier)
  const customerId = extractCustomerId(jwt);

  try {
    const paddleRes = await fetch(
      `https://api.paddle.com/customers/${customerId}/portal-sessions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paddleApiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await paddleRes.json();
    return new Response(JSON.stringify({ url: data.data.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: 'Failed to create portal session' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

