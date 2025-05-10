import { getLogger } from "./pino-logger.ts";
import type { Env } from "./types.ts";
const logger = getLogger();


export interface PaddleWebhookEvent {
  event_id: string;
  event_type: string;
  occurred_at: string;
  notification_id: string;
  data: {
    id: string;
    status?: string;
    customer_id?: string;
    collection_mode?: string;
    scheduled_change?: any;
    subscription_id?: string;
    items?: Array<{
      price: {
        id: string;
        product_id: string;
      };
      quantity: number;
      status?: string;
    }>;
    // Other fields we don't need to extract
  };
}

export interface BaseTxSxData<T> {
  id: string;
  status: string;
  customer_id: string;
  occurred_at: string;
  items: T[];
  collection_mode?: string;
  scheduled_change?: any;
  subscription_id?: string;
}

export interface PaddleWebhookData {
  event_type: string;
  occurred_at: string;
  subscription?: BaseTxSxData<{
    price_id: string;
    product_id: string;
    quantity: number;
  }>;
  transaction?: BaseTxSxData<{
    price_id: string;
    product_id: string;
  }>;
}

export interface PaddleCustomer {
  id: string;
  status: string;
  name: string | null;
  email: string;
  marketing_consent: boolean;
  locale: string;
  created_at: string;
  updated_at: string;
  custom_data: any | null;
  import_meta: any | null;
}

interface CustomerResponse {
  data: PaddleCustomer;
  meta: {
    request_id: string;
  };
}

interface CustomerSearchResponse {
  data: PaddleCustomer[];
  meta: {
    pagination: {
      per_page: number;
      next: string | null;
      has_more: boolean;
      estimated_total: number;
    };
    request_id: string;
  };
}

export interface PaddleCustomerInput {
  email: string;
  name?: string;
  locale?: string;
  custom_data?: Record<string, any>;
  marketing_consent?: boolean;
}

const getPaddleBaseUrl = (env: Env) => {
  return env.PUBLIC_PADDLE_ENVIRONMENT === "sandbox"
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com";
};

async function processWebhook(
  context: EventContext<Env, string, Record<string, unknown>>,
  next: (event: PaddleWebhookEvent) => Promise<void>
): Promise<Response> {
  const { request, env } = context;

  // Only handle POST requests
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Get the raw body as text for verification
    const rawBody = await request.text();

    // Get the Paddle-Signature header
    const signatureHeader = request.headers.get("Paddle-Signature");

    if (!signatureHeader) {
      logger.error("Missing Paddle-Signature header");
      return new Response("Missing signature header", { status: 401 });
    }

    // Respond with 200 immediately to acknowledge receipt
    // This follows Paddle's best practice to respond within 5 seconds
    // We'll process the webhook asynchronously
    const responsePromise = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    // Process the webhook asynchronously
    const callbackFn = async () => {
      const isVerified = await validateWebhook(rawBody, signatureHeader, env);
      if (!isVerified) {
        logger.error("Invalid Paddle webhook signature");
        return;
      }

      // Parse the body as JSON
      const event = JSON.parse(rawBody) as PaddleWebhookEvent;
      await next(event);
    };
    context.waitUntil(callbackFn());

    return responsePromise;
  } catch (error) {
    logger.error("Error handling Paddle webhook:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

async function validateWebhook(
  rawBody: string,
  signatureHeader: string,
  env: Env
): Promise<boolean> {
  try {
    // 1. Parse the signature header
    // Format: ts=timestamp;h1=signature
    const parts = signatureHeader.split(";");
    const timestamp = parts[0].split("=")[1];
    const signature = parts[1].split("=")[1];

    // Optional: Check if the timestamp is recent (within 5 seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - parseInt(timestamp)) > 5) {
      logger.warn("Webhook timestamp is too old, possible replay attack");
      return false;
    }

    // 2. Build the signed payload
    // The signed payload is the timestamp + ':' + rawBody (not '.' as we had before)
    const signedPayload = `${timestamp}:${rawBody}`;

    // 3. Hash the signed payload with HMAC-SHA256
    const encoder = new TextEncoder();
    const data = encoder.encode(signedPayload);
    const keyData = encoder.encode(env.PADDLE_WEBHOOK_SECRET);

    // Import the secret key for HMAC
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    // 4. Generate the signature
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, data);

    // Convert to hex string for comparison
    const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // 5. Compare signatures
    return signature === generatedSignature;
  } catch (error) {
    logger.error("Error verifying Paddle webhook:", error);
    return false;
  }
}

function extractWebhookData(event: PaddleWebhookEvent): PaddleWebhookData {
  const { event_type, occurred_at, data } = event;

  // Extract common fields
  const extractedData: PaddleWebhookData = {
    event_type,
    occurred_at,
  };

  // Extract subscription or transaction data
  if (data) {
    // For subscription events
    if (event_type.startsWith("subscription.")) {
      extractedData.subscription = {
        id: data.id,
        status: data.status,
        collection_mode: data.collection_mode,
        scheduled_change: data.scheduled_change,
        customer_id: data.customer_id,
        occurred_at: occurred_at,
        items:
          data.items?.map((item) => ({
            price_id: item.price.id,
            product_id: item.price.product_id,
            quantity: item.quantity,
            status: item.status,
          })) || [],
      };
    }

    // For transaction events
    else if (event_type.startsWith("transaction.")) {
      extractedData.transaction = {
        id: data.id,
        status: data.status,
        customer_id: data.customer_id,
        subscription_id: data.subscription_id,
        occurred_at: occurred_at,
        items:
          data.items?.map((item) => ({
            price_id: item.price.id,
            product_id: item.price.product_id,
            quantity: item.quantity,
          })) || [],
      };
    }
  }

  return extractedData;
}

/**
 * Fetches a Paddle customer by their ID or email.
 * Gives preference to customerId if provided. Falls back to email if customerId is not provided
 * or if the customer is not found using the customerId.
 * Searches for both 'active' and 'archived' customers.
 *
 * @param customerId The Paddle customer ID (e.g., ctm_...). Optional.
 * @param email The customer's email address. Optional.
 * @param env Environment variables containing API keys.
 * @returns The PaddleCustomer object if found, or null otherwise.
 */
async function fetchCustomer(
  identifier: string | { customerId?: string; email?: string },
  env: Env
): Promise<PaddleCustomer | null> {
  let customerId: string | undefined;
  let email: string | undefined;

  if (typeof identifier === "string") {
    customerId = identifier;
  } else {
    customerId = identifier.customerId;
    email = identifier.email;
  }

  // Validate that at least one identifier is provided
  if (!customerId && !email) {
    logger.error("fetchCustomer error: customerId or email must be provided.");
    return null;
  }

  const baseUrl = getPaddleBaseUrl(env);

  // Attempt to fetch by customerId if provided
  if (customerId) {
    try {
      const customerByIdEndpoint = `${baseUrl}/customers/${customerId}?status=active,archived`;
      const response = await fetch(customerByIdEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.PADDLE_API_KEY}`,
        },
      });

      if (response.ok) {
        const customerResponse = (await response.json()) as CustomerResponse;
        return customerResponse.data; // Customer found by ID
      } else {
        const errorText = await response.text();
        // Log non-critical "not found" errors, but proceed to email fallback if available
        logger.warn(
          `Failed to fetch customer by ID '${customerId}': ${response.status} ${errorText}.` +
            (email
              ? " Attempting fallback to email."
              : " No email fallback provided.")
        );
        if (!email) {
          return null; // No email to fall back to, so ID fetch failure is final
        }
      }
    } catch (error) {
      // Catch errors specific to fetching by ID (e.g., network issues)
      logger.error(
        `Error during fetch customer by ID '${customerId}': ${error}.` +
          (email
            ? " Attempting fallback to email."
            : " No email fallback provided.")
      );
      if (!email) {
        return null; // No email to fall back to, so ID fetch error is final
      }
    }
  }

  // Attempt to fetch by email if provided (either as primary or as fallback)
  if (email) {
    try {
      const customerByEmailEndpoint = `${baseUrl}/customers?email=${encodeURIComponent(
        email
      )}&status=active,archived`;
      const response = await fetch(customerByEmailEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.PADDLE_API_KEY}`,
        },
      });

      if (response.ok) {
        const searchResponse =
          (await response.json()) as CustomerSearchResponse;
        if (searchResponse.data && searchResponse.data.length > 0) {
          return searchResponse.data[0]; // Customer found by email (return first match)
        } else {
          logger.warn(
            `Customer with email '${email}' not found via Paddle API search.`
          );
          return null; // Search successful, but no customer matches the email
        }
      } else {
        const errorText = await response.text();
        logger.error(
          `Paddle API error when searching for customer by email '${email}': ${response.status} ${errorText}`
        );
        return null; // API error during email search
      }
    } catch (error) {
      logger.error(
        `Error during fetch customer by email '${email}': ${error}`
      );
      return null; // Catch errors specific to fetching by email
    }
  }

  // Should be reached if customerId was provided, failed, and no email was provided,
  // or if only email was provided and it failed.
  return null;
}

/**
 * Creates a new Paddle customer
 * @param customerData Customer information including email, name, etc.
 * @param env Environment variables containing API keys
 * @returns The created customer or null if creation failed
 */
async function createCustomer(
  customerData: PaddleCustomerInput,
  env: Env
): Promise<PaddleCustomer | null> {
  try {
    const baseUrl = getPaddleBaseUrl(env);
    const customerEndpoint = `${baseUrl}/customers`;

    const response = await fetch(customerEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.PADDLE_API_KEY}`,
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create customer: ${response.status} ${errorText}`
      );
    }

    const customerResponse = (await response.json()) as CustomerResponse;
    return customerResponse.data;
  } catch (error) {
    logger.error(`Error creating customer in Paddle: ${error}`);
    return null;
  }
}

/**
 * Updates an existing Paddle customer
 * @param customerIdentifier Customer ID or email
 * @param customerData Data to update
 * @param env Environment variables containing API keys
 * @returns The updated customer or null if update failed
 */
async function updateCustomer(
  customerIdentifier: string,
  customerData: Partial<PaddleCustomerInput>,
  env: Env
): Promise<PaddleCustomer | null> {
  try {
    const baseUrl = getPaddleBaseUrl(env);

    // Determine if identifier is an email or a Paddle customer ID
    // Paddle IDs typically start with "ctm_" prefix
    const isEmail = !customerIdentifier.startsWith("ctm_");

    // If it's an email, we need to find the customer ID first
    let customerId = customerIdentifier;

    if (isEmail) {
      // Search for customer by email
      const searchEndpoint = `${baseUrl}/customers?email=${encodeURIComponent(
        customerIdentifier
      )}`;
      const searchResponse = await fetch(searchEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.PADDLE_API_KEY}`,
        },
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        throw new Error(
          `Failed to find customer by email: ${searchResponse.status} ${errorText}`
        );
      }

      const searchResults =
        (await searchResponse.json()) as CustomerSearchResponse;
      if (searchResults.data && searchResults.data.length > 0) {
        customerId = searchResults.data[0].id;
      } else {
        throw new Error(`Customer with email ${customerIdentifier} not found`);
      }
    }

    // Update the customer
    const updateEndpoint = `${baseUrl}/customers/${customerId}`;
    const response = await fetch(updateEndpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.PADDLE_API_KEY}`,
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to update customer: ${response.status} ${errorText}`
      );
    }

    const customerResponse = (await response.json()) as CustomerResponse;
    return customerResponse.data;
  } catch (error) {
    logger.error(`Error updating customer in Paddle: ${error}`);
    return null;
  }
}

/**
 * Deletes a Paddle customer by ID
 * @param customerId The ID of the customer to delete
 * @param env Environment variables containing API keys
 * @returns Whether the deletion was successful
 *
 * TODO: Will be implemented in the future when Paddle API supports customer deletion
 * or when we decide to implement a soft-delete strategy
 */
async function deleteCustomer(customerId: string, env: Env): Promise<boolean> {
  logger.info(
    `[NOT IMPLEMENTED] Would delete customer with ID: ${customerId}`
  );
  // Paddle API doesn't currently support customer deletion
  // This function is here as a placeholder for test cleanup
  return true;
}

export const PaddleClient = {
  fetchCustomer,
  processWebhook,
  extractWebhookData,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
