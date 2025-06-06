// Helper for validating Keycloak JWTs using JWKS
import { jwtVerify, createRemoteJWKSet } from "jose";
import { getLogger } from "./pino-logger.ts";
import type { Env } from "./types.ts";
const logger = getLogger();

const JWKS_URL = "/realms/jitsi/protocol/openid-connect/certs";
const ISSUER = "/realms/jitsi";
const AUDIENCE = "jitsi-web";

let jwks: any;

export async function validateKeycloakJWT(token: string, env: Env) {
  try {
    if (!jwks) {
      jwks = createRemoteJWKSet(new URL("https://" + env.KC_HOSTNAME + JWKS_URL));
    }
    const { payload } = await jwtVerify(token, jwks, {
      issuer: "https://" + env.KC_HOSTNAME + ISSUER,
      audience: AUDIENCE,
    });
    // Optionally check exp, email_verified, etc. here
    return true;
  } catch (e) {
    logger.error("JWT validation failed:", e);
    return false;
  }
}

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
    logger.error("Error extracting email from JWT:", e);
    return null;
  }
}
