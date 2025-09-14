
export interface TestEnvironment {
    TEST_API_ENDPOINT: string;
    TEST_USER_1_EMAIL: string;
    TEST_USER_1_PASS: string | undefined;
    TEST_AUTH_TOKEN: string;

    CF_WEBHOOK_SECRET: string;
    KC_WEBHOOK_SECRET: string;

}

/**
 * Gets and validates the environment variables
 * and creates a new database instance
 * @throws Error if required values cannot be found
 */
export function getTestEnvironment(): TestEnvironment {
    // validate env vars, or throw exception
    if (!process.env.TEST_API_ENDPOINT) throw new Error("TEST_API_ENDPOINT must be set.");
    if (!process.env.TEST_USER_1_EMAIL) throw new Error("TEST_USER_1_EMAIL must be set.");
    if (!process.env.TEST_AUTH_TOKEN) throw new Error("TEST_AUTH_TOKEN must be set.");
    if (!process.env.CF_WEBHOOK_SECRET) throw new Error("CF_WEBHOOK_SECRET must be set.");

    // TODO warn if token expiration time is less than 1 hour from now

    return {
        TEST_API_ENDPOINT: process.env.TEST_API_ENDPOINT,
        TEST_USER_1_EMAIL: process.env.TEST_USER_1_EMAIL,
        TEST_USER_1_PASS: process.env.TEST_USER_1_PASS,
        TEST_AUTH_TOKEN: process.env.TEST_AUTH_TOKEN,
        CF_WEBHOOK_SECRET: process.env.CF_WEBHOOK_SECRET,
        KC_WEBHOOK_SECRET: process.env.KC_WEBHOOK_SECRET,
    }
}
