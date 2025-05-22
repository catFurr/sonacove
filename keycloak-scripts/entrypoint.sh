#!/bin/sh
set -e

# Ensure the vault directory exists within the container
VAULT_DIR="/opt/keycloak/vault"
mkdir -p "${VAULT_DIR}"

# Populate vault files from environment variables
# This assumes your .env file has KC_REGISTRATION_API_URL and KC_WEBHOOK_SECRET defined

REALM_NAME="${KC_REALM_NAME:-jitsi}"

REGISTRATION_API_URL_FILE="${VAULT_DIR}/${REALM_NAME}_KC_REGISTRATION_API_URL"
WEBHOOK_SECRET_FILE="${VAULT_DIR}/${REALM_NAME}_KC_WEBHOOK_SECRET"

# Check if environment variables are set
if [ -z "${KC_REGISTRATION_API_URL}" ]; then
  echo "Warning: KC_REGISTRATION_API_URL is not set. The vault file will be empty or have its placeholder." >&2
else
  echo "Populating ${REGISTRATION_API_URL_FILE} with KC_REGISTRATION_API_URL"
  echo "${KC_REGISTRATION_API_URL}" > "${REGISTRATION_API_URL_FILE}"
fi

if [ -z "${KC_WEBHOOK_SECRET}" ]; then
  echo "Warning: KC_WEBHOOK_SECRET is not set. The vault file will be empty or have its placeholder." >&2
else
  echo "Populating ${WEBHOOK_SECRET_FILE} with KC_WEBHOOK_SECRET"
  echo "${KC_WEBHOOK_SECRET}" > "${WEBHOOK_SECRET_FILE}"
fi

# Original Keycloak command (from Docker image or previous compose command)
# The Dockerfile for Keycloak sets ENTRYPOINT ["/opt/keycloak/bin/kc.sh"].
# The original command in compose was: ["start", "--optimized", "--import-realm", "--spi-events-listener-ext-event-webhook-store-webhook-events=true"]
# We pass these as arguments to kc.sh

exec /opt/keycloak/bin/kc.sh "$@" 