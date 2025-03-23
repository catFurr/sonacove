import { describe, test, expect, beforeAll, beforeEach, mock } from "bun:test";
import { PaddleClient } from "../functions/components/paddle.js";
import { BrevoClient } from "../functions/components/brevo.js";

// Mock handlers
const originalPaddleCreateCustomer = PaddleClient.createCustomer;
const originalBrevoGetContact = BrevoClient.getContact;
const originalBrevoUpdateContact = BrevoClient.updateContact;
const originalBrevoCreateContact = BrevoClient.createContact;

describe("Registration Flow API", () => {
  // Import the request handler
  let handler: any;

  beforeAll(async () => {
    const module = await import("../functions/api/registration-flow.js");
    handler = module.onRequest;
  });

  beforeEach(() => {
    // Reset mocks before each test
    PaddleClient.createCustomer = originalPaddleCreateCustomer;
    BrevoClient.getContact = originalBrevoGetContact;
    BrevoClient.updateContact = originalBrevoUpdateContact;
    BrevoClient.createContact = originalBrevoCreateContact;
  });

  const mockEnv = {
    PADDLE_API_KEY: "test-paddle-key",
    BREVO_API_KEY: "test-brevo-key",
  };

  const mockContext = (body: any, method = "POST") => ({
    request: {
      method,
      json: () => Promise.resolve(body),
    },
    env: mockEnv,
    waitUntil: (promise: Promise<any>) => promise,
  });

  test("Should return 405 for non-POST requests", async () => {
    const context = mockContext({}, "GET");

    const response = await handler(context);
    expect(response.status).toBe(405);
  });

  test("Should return 400 if required fields are missing", async () => {
    const context = mockContext({
      firstname: "John",
      // Missing lastname and email
    });

    const response = await handler(context);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody.error).toContain("Missing required fields");
  });

  test("Should create a Paddle customer and Brevo contact when contact doesn't exist", async () => {
    // Mock Paddle createCustomer
    PaddleClient.createCustomer = mock(async () => ({
      id: "cus_123",
      email: "test@example.com",
      name: "John Doe",
      status: "active",
      marketing_consent: false,
      locale: "en",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      custom_data: null,
      import_meta: null,
    }));

    // Mock Brevo getContact to throw error for both email and CID
    BrevoClient.getContact = mock(async (identifier, apiKey, useExtId) => {
      throw new Error("Contact not found");
    });

    // Mock Brevo createContact
    BrevoClient.createContact = mock(async () => ({
      id: 456,
    }));

    const requestBody = {
      firstname: "John",
      lastname: "Doe",
      email: "test@example.com",
      email_verified: true,
    };

    const context = mockContext(requestBody);
    const response = await handler(context);

    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toEqual({ paddle_customer_id: "cus_123" });

    // Verify Paddle customer creation was called
    expect(PaddleClient.createCustomer).toHaveBeenCalled();

    // Verify Brevo contact creation was called
    expect(BrevoClient.createContact).toHaveBeenCalled();
  });

  test("Should update Brevo contact when found by email", async () => {
    // Mock Paddle createCustomer
    PaddleClient.createCustomer = mock(async () => ({
      id: "cus_456",
      email: "existing@example.com",
      name: "Jane Smith",
      status: "active",
      marketing_consent: false,
      locale: "en",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      custom_data: null,
      import_meta: null,
    }));

    // Mock Brevo getContact to return an existing contact when searched by email
    BrevoClient.getContact = mock(async (identifier, apiKey, useExtId) => {
      if (!useExtId && identifier === "existing@example.com") {
        return {
          id: 789,
          email: "existing@example.com",
          attributes: {
            FIRSTNAME: "Old",
            LASTNAME: "Name",
          },
        };
      }
      throw new Error("Contact not found");
    });

    // Mock Brevo updateContact
    BrevoClient.updateContact = mock(async () => {});

    const requestBody = {
      firstname: "Jane",
      lastname: "Smith",
      email: "existing@example.com",
      email_verified: false,
    };

    const context = mockContext(requestBody);
    const response = await handler(context);

    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toEqual({ paddle_customer_id: "cus_456" });

    // Verify Brevo contact update was called
    expect(BrevoClient.updateContact).toHaveBeenCalled();
  });

  test("Should update Brevo contact when found by CID but not email", async () => {
    // Mock Paddle createCustomer
    const customerId = "cus_789";
    PaddleClient.createCustomer = mock(async () => ({
      id: customerId,
      email: "cid_test@example.com",
      name: "CID Test",
      status: "active",
      marketing_consent: false,
      locale: "en",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      custom_data: null,
      import_meta: null,
    }));

    // Mock Brevo getContact to fail for email but succeed for CID
    BrevoClient.getContact = mock(async (identifier, apiKey, useExtId) => {
      if (useExtId && identifier === customerId) {
        return {
          id: 999,
          email: "different@example.com", // Different email in Brevo
          attributes: {
            FIRSTNAME: "Different",
            LASTNAME: "Name",
            EXT_ID: customerId,
          },
        };
      }
      throw new Error("Contact not found");
    });

    // Mock Brevo updateContact
    BrevoClient.updateContact = mock(async () => {});

    const requestBody = {
      firstname: "CID",
      lastname: "Test",
      email: "cid_test@example.com",
      email_verified: true,
    };

    const context = mockContext(requestBody);
    const response = await handler(context);

    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody).toEqual({ paddle_customer_id: customerId });

    // Verify Brevo contact update was called
    expect(BrevoClient.updateContact).toHaveBeenCalled();
  });

  test("Should return error if Paddle customer creation fails", async () => {
    // Mock Paddle createCustomer to fail
    PaddleClient.createCustomer = mock(async () => null);

    const context = mockContext({
      firstname: "Error",
      lastname: "Test",
      email: "error@example.com",
      email_verified: true,
    });

    const response = await handler(context);
    expect(response.status).toBe(500);

    const responseBody = await response.json();
    expect(responseBody.error).toContain("Failed to create Paddle customer");
  });
});
