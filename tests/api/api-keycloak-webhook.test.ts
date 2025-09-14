import { describe, it, beforeAll, expect } from "bun:test";
import { getTestEnvironment } from "./helpers/environment";

describe("API: /api/keycloak-webhook", () => {
  let kcToken: string;
  let apiEndpoint: string;

  beforeAll(async () => {
    const {
      KC_WEBHOOK_SECRET,
      TEST_API_ENDPOINT
    } = getTestEnvironment();

    kcToken = KC_WEBHOOK_SECRET;
    apiEndpoint = TEST_API_ENDPOINT + '/api/keycloak-webhook';
  });

  it("should return 401 without x-keycloak-signature header", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify({
        id: "test-event-id",
        time: Date.now(),
        realmId: "test-realm",
        realmName: "test-realm",
        uid: "test-user-id",
        authDetails: {
          realmId: "test-realm",
          clientId: "test-client",
          userId: "test-user-id",
          ipAddress: "127.0.0.1",
          username: "test@example.com"
        },
        details: {
          context: "test-context"
        }
      }),
    });

    expect(response.status).toBe(401);
  });

  it("should return 401 with invalid signature", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "x-keycloak-signature": "invalid-signature",
      },
      body: JSON.stringify({
        id: "test-event-id",
        time: Date.now(),
        realmId: "test-realm",
        realmName: "test-realm",
        uid: "test-user-id",
        authDetails: {
          realmId: "test-realm",
          clientId: "test-client",
          userId: "test-user-id",
          ipAddress: "127.0.0.1",
          username: "test@example.com"
        },
        details: {
          context: "test-context"
        }
      }),
    });

    expect(response.status).toBe(401);
  });

  it("should return 400 for invalid JSON", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "invalid json",
    });

    expect(response.status).toBe(400);
  });

  it("should process valid webhook event", async () => {
    const webhookBody = JSON.stringify({
      id: `test-event-${Date.now()}`,
      time: Date.now(),
      realmId: "test-realm",
      realmName: "test-realm",
      uid: "test-user-id",
      authDetails: {
        realmId: "test-realm",
        clientId: "test-client",
        userId: "test-user-id",
        ipAddress: "127.0.0.1",
        username: "test@example.com"
      },
      details: {
        context: "test-context"
      }
    });

    // Generate a valid HMAC-SHA256 signature for the test
    const encoder = new TextEncoder();
    const key = encoder.encode(kcToken);
    const message = encoder.encode(webhookBody);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, message);
    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "x-keycloak-signature": signature,
      },
      body: webhookBody,
    });

    expect(response.status).toBe(200);
  });

});