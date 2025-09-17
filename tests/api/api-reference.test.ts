import { describe, it, beforeAll, expect } from "bun:test";
import { getTestEnvironment } from "./helpers/environment";

describe("API: /api/reference", () => {
  let cfToken: string;
  let apiEndpoint: string;

  beforeAll(async () => {
    const {
      CF_WEBHOOK_SECRET,
      TEST_API_ENDPOINT
    } = getTestEnvironment();

    cfToken = CF_WEBHOOK_SECRET;
    apiEndpoint = TEST_API_ENDPOINT + '/api/reference';
  });

  it("should return 404 as expected for reference endpoint", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfToken}`,
      },
      body: JSON.stringify({
        hello: "world"
      }),
    });

    expect(response.status).toBe(404);
  });

});