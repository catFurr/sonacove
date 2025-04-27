// Helper for validating Keycloak JWTs using JWKS
import { jwtVerify, createRemoteJWKSet } from "jose";

const JWKS_URL =
  "https://auth.sonacove.com/realms/jitsi/protocol/openid-connect/certs";
const ISSUER = "https://auth.sonacove.com/realms/jitsi";
const AUDIENCE = "jitsi-web";

let jwks;

export async function validateKeycloakJWT(token) {
  try {
    if (!jwks) {
      jwks = createRemoteJWKSet(new URL(JWKS_URL));
    }
    const { payload } = await jwtVerify(token, jwks, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    // Optionally check exp, email_verified, etc. here
    return true;
  } catch (e) {
    console.error("JWT validation failed:", e);
    return false;
  }
}

export function getEmailFromJWT(token) {
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
    console.error("Error extracting email from JWT:", e);
    return null;
  }
}
