#!/bin/bash

# Make sure cwd folder name is keycloak-scripts
if [ "$(basename "$PWD")" != "keycloak-scripts" ]; then
    echo "Please run this script from the keycloak-scripts folder"
    exit 1
fi

# Make sure we are not running as root
if [ "$EUID" -eq 0 ]; then
    echo "Please do not run this script as root"
    exit 1
fi

# if /opt/keycloak/providers/custom-scripts.jar exists, warn the user
if [ -f /opt/keycloak/providers/custom-scripts.jar ]; then
    echo "Warning: /opt/keycloak/providers/custom-scripts.jar will be overwritten"
    echo "Please save a copy if needed"
fi

# Remove existing jar if it exists
rm -f custom-scripts.jar

# Build the jar
echo "Building 2 custom scripts"
jar cf custom-scripts.jar \
    META-INF/ \
    registration-api-validator.js \
    token-map-fullname.js

# If the jar was not built, show an error and exit
if [ ! -f custom-scripts.jar ]; then
    echo "Error: custom-scripts.jar was not built"
    exit 1
fi

# Copy the jar to the providers directory
cp custom-scripts.jar /opt/keycloak/providers/
echo "Copied custom-scripts.jar to /opt/keycloak/providers/"

# Restart Keycloak
sudo systemctl restart keycloak
echo "Restarted Keycloak"
