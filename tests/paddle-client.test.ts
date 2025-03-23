import { describe, expect, test, afterAll } from "bun:test";
import { PaddleClient } from "../functions/components/paddle.js";

// Define test environment variables
const env = {
  PUBLIC_PADDLE_ENVIRONMENT: "sandbox",
  PADDLE_API_KEY: process.env.PADDLE_API_KEY || "",
  PADDLE_WEBHOOK_SECRET: process.env.PADDLE_WEBHOOK_SECRET || "",
};

// Generate a unique email for tests
const generateTestEmail = () => `test-${Date.now()}@example.com`;

describe("PaddleClient", () => {
  let createdCustomerId: string;
  const testEmail = generateTestEmail();

  // Add customer IDs to this array for cleanup
  const customersToCleanup: string[] = [];

  // Clean up after all tests
  afterAll(async () => {
    // Skip cleanup if no API key
    if (!env.PADDLE_API_KEY) {
      return;
    }

    // Clean up all created customers
    for (const customerId of customersToCleanup) {
      console.log(`Cleaning up test customer: ${customerId}`);
      await PaddleClient.deleteCustomer(customerId, env);
    }
  });

  test("createCustomer - creates a new Paddle customer", async () => {
    // Skip if API key is missing
    if (!env.PADDLE_API_KEY) {
      console.warn("Skipping test: PADDLE_API_KEY not set");
      return;
    }

    const customerData = {
      email: testEmail,
      name: "Test User",
      locale: "en",
      marketing_consent: false,
    };

    const customer = await PaddleClient.createCustomer(customerData, env);

    expect(customer).not.toBeNull();
    expect(customer?.email).toBe(testEmail);
    expect(customer?.name).toBe("Test User");
    expect(customer?.locale).toBe("en");

    // Save for update test
    createdCustomerId = customer?.id || "";

    // Add to cleanup list
    if (createdCustomerId) {
      customersToCleanup.push(createdCustomerId);
    }
  });

  test("fetchCustomer - retrieves a Paddle customer by ID", async () => {
    // Skip if API key is missing or customer wasn't created
    if (!env.PADDLE_API_KEY || !createdCustomerId) {
      console.warn(
        "Skipping test: PADDLE_API_KEY not set or customer not created"
      );
      return;
    }

    const customer = await PaddleClient.fetchCustomer(createdCustomerId, env);

    expect(customer).not.toBeNull();
    expect(customer?.id).toBe(createdCustomerId);
    expect(customer?.email).toBe(testEmail);
  });

  test("updateCustomer - updates an existing customer by ID", async () => {
    // Skip if API key is missing or customer wasn't created
    if (!env.PADDLE_API_KEY || !createdCustomerId) {
      console.warn(
        "Skipping test: PADDLE_API_KEY not set or customer not created"
      );
      return;
    }

    const updatedData = {
      name: "Updated Test User",
    };

    const customer = await PaddleClient.updateCustomer(
      createdCustomerId,
      updatedData,
      env
    );

    expect(customer).not.toBeNull();
    expect(customer?.id).toBe(createdCustomerId);
    expect(customer?.name).toBe("Updated Test User");
    expect(customer?.email).toBe(testEmail);
  });

  test("updateCustomer - updates an existing customer by email", async () => {
    // Skip if API key is missing
    if (!env.PADDLE_API_KEY) {
      console.warn("Skipping test: PADDLE_API_KEY not set");
      return;
    }

    const updatedData = {
      name: "Email Updated User",
    };

    const customer = await PaddleClient.updateCustomer(
      testEmail,
      updatedData,
      env
    );

    expect(customer).not.toBeNull();
    expect(customer?.id).toBe(createdCustomerId);
    expect(customer?.name).toBe("Email Updated User");
    expect(customer?.email).toBe(testEmail);
  });

  test("extractWebhookData - correctly extracts subscription data", () => {
    const mockEvent = {
      event_id: "evt_123",
      event_type: "subscription.created",
      occurred_at: "2023-01-01T00:00:00Z",
      notification_id: "ntf_123",
      data: {
        id: "sub_123",
        status: "active",
        customer_id: "ctm_123",
        collection_mode: "automatic",
        scheduled_change: { action: "cancel" },
        items: [
          {
            price: {
              id: "pri_123",
              product_id: "pro_123",
            },
            quantity: 1,
            status: "active",
          },
        ],
      },
    };

    const extractedData = PaddleClient.extractWebhookData(mockEvent);

    expect(extractedData.event_type).toBe("subscription.created");
    expect(extractedData.occurred_at).toBe("2023-01-01T00:00:00Z");
    expect(extractedData.subscription?.id).toBe("sub_123");
    expect(extractedData.subscription?.status).toBe("active");
    expect(extractedData.subscription?.collection_mode).toBe("automatic");
    expect(extractedData.subscription?.scheduled_change).toEqual({
      action: "cancel",
    });
    expect(extractedData.subscription?.customer_id).toBe("ctm_123");
    expect(extractedData.subscription?.items[0].price_id).toBe("pri_123");
    expect(extractedData.subscription?.items[0].product_id).toBe("pro_123");
    expect(extractedData.subscription?.items[0].quantity).toBe(1);
  });

  test("extractWebhookData - correctly extracts transaction data", () => {
    const mockEvent = {
      event_id: "evt_456",
      event_type: "transaction.created",
      occurred_at: "2023-01-02T00:00:00Z",
      notification_id: "ntf_456",
      data: {
        id: "txn_123",
        status: "completed",
        customer_id: "ctm_123",
        subscription_id: "sub_123",
        items: [
          {
            price: {
              id: "pri_456",
              product_id: "pro_456",
            },
            quantity: 2,
          },
        ],
      },
    };

    const extractedData = PaddleClient.extractWebhookData(mockEvent);

    expect(extractedData.event_type).toBe("transaction.created");
    expect(extractedData.occurred_at).toBe("2023-01-02T00:00:00Z");
    expect(extractedData.transaction?.id).toBe("txn_123");
    expect(extractedData.transaction?.status).toBe("completed");
    expect(extractedData.transaction?.customer_id).toBe("ctm_123");
    expect(extractedData.transaction?.subscription_id).toBe("sub_123");
    expect(extractedData.transaction?.items[0].price_id).toBe("pri_456");
    expect(extractedData.transaction?.items[0].product_id).toBe("pro_456");
  });
});
