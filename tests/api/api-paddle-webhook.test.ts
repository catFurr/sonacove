import { describe, it, beforeAll, expect } from "bun:test";
import { getTestEnvironment } from "./helpers/environment";

describe("API: /api/paddle-webhook", () => {
  let apiEndpoint: string;

  beforeAll(async () => {
    const {
      TEST_API_ENDPOINT
    } = getTestEnvironment();

    apiEndpoint = TEST_API_ENDPOINT + '/api/paddle-webhook';
  });

  it("should return 401 with missing Paddle-Signature header", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify({
        event_type: "transaction.created",
        data: {
          id: "test-transaction-id",
          customer_id: "test-customer-id"
        }
      }),
    });

    expect(response.status).toBe(401);
  });

  it("should return 401 with invalid signature", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Paddle-Signature": "invalid-signature",
      },
      body: JSON.stringify({
        event_type: "transaction.created",
        data: {
          id: "test-transaction-id",
          customer_id: "test-customer-id"
        }
      }),
    });

    expect(response.status).toBe(401);
  });

});