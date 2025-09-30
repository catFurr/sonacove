
import { getLogger } from "./pino-logger";

const logger = getLogger();

export function getEmailFromJWT(token: string) {
  try {
    const [, payloadB64] = token.split(".");
    // Replace characters for base64url to base64 standard
    const base64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );
    // Decode using atob (available in Cloudflare Workers) instead of Buffer
    const decodedPayload = atob(paddedBase64);
    const payload = JSON.parse(decodedPayload);
    return payload.email;
  } catch (e) {
    logger.error(e, "Error extracting email from JWT:");
    return null;
  }
}

/**
 * Verifies the HMAC-SHA256 signature of a webhook request
 * @param rawBody The raw request body as string
 * @param signature The signature from the webhook header
 * @param secret The webhook secret key
 * @returns Whether the signature is valid
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) {
    logger.error("Missing webhook signature header");
    return false;
  }

  // Calculate expected signature
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const message = encoder.encode(rawBody);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, message);

  const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (signature !== expectedSignature) {
    logger.error("Invalid webhook signature");
    return false;
  }

  return true;
}
