import { describe, it, beforeAll, expect } from "bun:test";
import { getTestEnvironment } from "./helpers/environment";

describe("API: /api/prosody-webhook", () => {
  let cfToken: string;
  let apiEndpoint: string;

  beforeAll(async () => {
    const {
      CF_WEBHOOK_SECRET,
      TEST_API_ENDPOINT
    } = getTestEnvironment();

    cfToken = CF_WEBHOOK_SECRET;
    apiEndpoint = TEST_API_ENDPOINT + '/api/prosody-webhook';
  });

  it("should return 401 without authorization header", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify({
        type: "room_created",
        room: "test-room",
        email: "test@example.com"
      }),
    });

    expect(response.status).toBe(401);
  });

  it("should return 401 with invalid webhook secret", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: "Bearer invalid-secret",
      },
      body: JSON.stringify({
        type: "room_created",
        room: "test-room",
        email: "test@example.com"
      }),
    });

    expect(response.status).toBe(401);
  });

  it("should return 400 for invalid JSON", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfToken}`,
        "Content-Type": "application/json",
      },
      body: "invalid json",
    });

    expect(response.status).toBe(400);
  });

  it("should return 400 for missing required fields", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfToken}`,
      },
      body: JSON.stringify({
        type: "room_created",
        // Missing room and email
      }),
    });

    expect(response.status).toBe(400);
  });

  it("should handle all event types gracefully", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfToken}`,
      },
      body: JSON.stringify({
        type: "any_event",
        room: `test-room-${Date.now()}`,
        email: "test@example.com"
      }),
    });

    expect(response.status).toBe(200);
  });

});
