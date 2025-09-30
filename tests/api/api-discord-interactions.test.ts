import { describe, it, beforeAll, expect } from "bun:test";
import { getTestEnvironment } from "./helpers/environment";

describe("API: /api/discord-interactions", () => {
  let apiEndpoint: string;

  beforeAll(async () => {
    const {
      TEST_API_ENDPOINT
    } = getTestEnvironment();

    apiEndpoint = TEST_API_ENDPOINT + '/api/discord-interactions';
  });

  it("should return 401 with missing signature header", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "X-Signature-Timestamp": Date.now().toString(),
      },
      body: JSON.stringify({
        type: 1, // PING
        data: {}
      }),
    });

    expect(response.status).toBe(401);
  });

  it("should return 401 with missing timestamp header", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "X-Signature-Ed25519": "test-signature",
      },
      body: JSON.stringify({
        type: 1, // PING
        data: {}
      }),
    });

    expect(response.status).toBe(401);
  });

  it("should return 401 with invalid signature", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "X-Signature-Ed25519": "invalid-signature",
        "X-Signature-Timestamp": Date.now().toString(),
      },
      body: JSON.stringify({
        type: 1, // PING
        data: {}
      }),
    });

    expect(response.status).toBe(401);
  });

});