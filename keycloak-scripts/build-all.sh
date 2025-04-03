#!/bin/bash

# Make sure we're running from /opt/keycloak/keycloak-scripts
if [ "$(pwd)" != "/opt/keycloak/keycloak-scripts" ]; then
    echo "Please run this script from /opt/keycloak/keycloak-scripts"
    exit 1
fi

# Make sure we are not running as root
if [ "$EUID" -eq 0 ]; then
    echo "Please do not run this script as root"
    exit 1
fi

# if custom-scripts.jar exists here or in /opt/keycloak/providers/, warn the user
if [ -f custom-scripts.jar ] || [ -f /opt/keycloak/providers/custom-scripts.jar ]; then
    echo "Warning: custom-scripts.jar will be overwritten"
    echo "Please save a copy if needed"
fi

# Build the jar
echo "Building 2 custom scripts"
jar cf custom-scripts.jar \
    META-INF/ \
    registration-api-validator.js \
    token-map-fullname.js

# Copy the jar to the providers directory
cp custom-scripts.jar /opt/keycloak/providers/
echo "Copied custom-scripts.jar to /opt/keycloak/providers/"

# Restart Keycloak
sudo systemctl restart keycloak
echo "Restarted Keycloak"
