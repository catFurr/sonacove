// Script authenticator for Registration API call
AuthenticationFlowError = Java.type(
  "org.keycloak.authentication.AuthenticationFlowError"
);

/**
 * Called during the authentication flow
 */
function authenticate(context) {
  LOG.info("Executing Registration API Validator for user: " + user.username);

  // Check if this is a new registration by looking at the attribute we'll set
  // This prevents the script from running during the first login after registration
  if (user.getFirstAttribute("paddle_customer_id")) {
    LOG.info(
      "User already has paddle_customer_id attribute, skipping API call"
    );
    context.success();
    return;
  }

  // Create HTTP client
  var httpClientProvider = session.getProvider(
    org.keycloak.connections.httpclient.HttpClientProvider.class
  );
  var httpClient = httpClientProvider.getHttpClient();
  var httpPost = new org.apache.http.client.methods.HttpPost(
    "https://sonacove.com/api/registration-flow"
  );

  try {
    // Prepare user data according to the expected format in registration-flow.ts
    var userData = {
      firstname: user.firstName,
      lastname: user.lastName,
      email: user.username,
      email_verified: user.isEmailVerified(),
    };

    // Convert to JSON
    var jsonData = JSON.stringify(userData);

    // Set request headers and body
    httpPost.setHeader("Content-Type", "application/json");

    // Add authorization header with the webhook secret
    // TODO: store this in a realm attribute or server property
    // and access it securely.
    var secretToken = "VblFBfRUUy3edszNWqgOZuvVPgL320";
    httpPost.setHeader("Authorization", "Bearer " + secretToken);

    var stringEntity = new org.apache.http.entity.StringEntity(jsonData);
    httpPost.setEntity(stringEntity);

    // Execute request
    var response = httpClient.execute(httpPost);
    var statusCode = response.getStatusLine().getStatusCode();

    // Read response body
    var responseEntity = response.getEntity();
    var responseString = "";
    if (responseEntity != null) {
      var inputStream = responseEntity.getContent();
      var reader = new java.io.BufferedReader(
        new java.io.InputStreamReader(inputStream)
      );
      var line;
      var buffer = new java.lang.StringBuilder();
      while ((line = reader.readLine()) != null) {
        buffer.append(line);
      }
      responseString = buffer.toString();
    }

    // Check if the call was successful
    if (statusCode == 200) {
      // Parse the response
      var responseData = JSON.parse(responseString);

      // Store the Paddle customer ID as a user attribute
      if (responseData.paddle_customer_id) {
        user.setAttribute("paddle_customer_id", [
          responseData.paddle_customer_id,
        ]);
        LOG.info(
          "Successfully set paddle_customer_id attribute to: " +
            responseData.paddle_customer_id
        );
      } else {
        LOG.error(
          "API response doesn't contain expected 'paddle_customer_id' field: " +
            responseString
        );
      }
    } else {
      LOG.error(
        "API call failed with status: " + statusCode + " - " + responseString
      );
    }

    // Give the user a trial
    const paddle_last_update = new Date().toISOString();
    user.setAttribute("paddle_subscription_status", ["trialing"]);
    LOG.info("Successfully set paddle_subscription_status attribute to: trialing");
    user.setAttribute("paddle_last_update", [paddle_last_update]);
    LOG.info("Successfully set paddle_last_update attribute to: " + paddle_last_update);
    context.success();
  } catch (e) {
    LOG.error("Exception during API call: " + e.message);
    context.success(); // Don't fail the registration
  }
}

/**
 * Called when action is required
 */
function action(context) {
  // We don't need any action handling, so just continue
  context.success();
}
