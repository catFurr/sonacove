import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
  const openApiSpec = {
    "openapi": "3.0.3",
    "info": {
      "title": "Sonacove Meets API",
      "description": "API documentation for Sonacove Meets - a video conferencing platform built on Jitsi Meet",
      "version": "1.0.0",
      "contact": {
        "name": "Sonacove Team",
        "url": "https://sonacove.com"
      }
    },
    "servers": [
      {
        "url": "https://sonacove.com/api",
        "description": "Production server"
      },
      {
        "url": "http://localhost:4321/api",
        "description": "Development server"
      }
    ],
    "components": {
      "securitySchemes": {
        "BearerAuth": {
          "type": "http",
          "scheme": "bearer",
          "bearerFormat": "JWT",
          "description": "JWT token from Keycloak authentication"
        },
        "WebhookAuth": {
          "type": "http",
          "scheme": "bearer",
          "description": "Webhook secret token for internal service communication"
        }
      },
      "schemas": {
        "User": {
          "type": "object",
          "properties": {
            "id": { "type": "integer", "description": "User ID" },
            "email": { "type": "string", "format": "email", "description": "User email address" },
            "isActiveHost": { "type": "boolean", "description": "Whether user is currently hosting a meeting" },
            "maxBookings": { "type": "integer", "description": "Maximum number of rooms user can book" },
            "totalHostMinutes": { "type": "integer", "description": "Total minutes user has hosted meetings" },
            "createdAt": { "type": "string", "format": "date-time", "description": "User creation timestamp" },
            "updatedAt": { "type": "string", "format": "date-time", "description": "User last update timestamp" }
          }
        },
        "BookedRoom": {
          "type": "object",
          "properties": {
            "id": { "type": "integer", "description": "Booking ID" },
            "roomName": { "type": "string", "description": "Name of the booked room" },
            "userId": { "type": "integer", "description": "ID of user who booked the room" },
            "lobbyEnabled": { "type": "boolean", "description": "Whether lobby is enabled for this room" },
            "meetingPassword": { "type": "string", "nullable": true, "description": "Password for the meeting (if set)" },
            "maxOccupants": { "type": "integer", "description": "Maximum number of participants allowed" },
            "endDate": { "type": "string", "format": "date-time", "description": "When the booking expires" },
            "createdAt": { "type": "string", "format": "date-time", "description": "Booking creation timestamp" },
            "updatedAt": { "type": "string", "format": "date-time", "description": "Booking last update timestamp" }
          }
        },
        "Error": {
          "type": "object",
          "properties": {
            "error": { "type": "string", "description": "Error message" }
          }
        }
      }
    },
    "paths": {
      "/manage-booking": {
        "get": {
          "summary": "Check room booking eligibility",
          "description": "Checks if a user can host in a specific room. Used by Prosody to validate room access.",
          "security": [{ "WebhookAuth": [] }],
          "parameters": [
            {
              "name": "room",
              "in": "query",
              "required": true,
              "schema": { "type": "string" },
              "description": "Room name to check"
            },
            {
              "name": "email",
              "in": "query",
              "required": true,
              "schema": { "type": "string", "format": "email" },
              "description": "User email to check"
            }
          ],
          "responses": {
            "200": {
              "description": "Room access granted with meeting configuration",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "max_occupants": { "type": "integer", "description": "Maximum number of participants" },
                      "lobby": { "type": "boolean", "description": "Whether lobby is enabled" },
                      "password": { "type": "string", "description": "Meeting password (if any)" }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized - invalid or missing token",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            },
            "403": {
              "description": "Access denied - user already hosting or room booked by another user",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            },
            "404": {
              "description": "User not found",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            }
          }
        },
        "post": {
          "summary": "Create a new room booking",
          "description": "Creates a new room booking for the authenticated user",
          "security": [{ "BearerAuth": [] }],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["roomName"],
                  "properties": {
                    "roomName": { "type": "string", "description": "Name of the room to book" },
                    "password": { "type": "string", "description": "Optional meeting password" },
                    "lobby": { "type": "boolean", "default": false, "description": "Enable lobby for the meeting" },
                    "maxOccupants": { "type": "integer", "default": 100, "maximum": 100, "description": "Maximum number of participants" },
                    "endDate": { "type": "string", "format": "date-time", "description": "When the booking expires (defaults to 1 month from now)" }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Booking created successfully",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/BookedRoom" } } }
            },
            "400": {
              "description": "Bad request - missing or invalid parameters",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            },
            "401": {
              "description": "Unauthorized - invalid or missing token",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            },
            "403": {
              "description": "Forbidden - user has reached booking limit",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            },
            "409": {
              "description": "Conflict - room is already booked",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            }
          }
        },
        "delete": {
          "summary": "Delete a room booking",
          "description": "Deletes an existing room booking owned by the authenticated user",
          "security": [{ "BearerAuth": [] }],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["roomName"],
                  "properties": {
                    "roomName": { "type": "string", "description": "Name of the room to delete booking for" }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Booking deleted successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "message": { "type": "string" },
                      "roomName": { "type": "string" }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized - invalid or missing token",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            },
            "403": {
              "description": "Forbidden - user doesn't own this booking",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            },
            "404": {
              "description": "Booking not found",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            }
          }
        }
      },
      "/db-user": {
        "get": {
          "summary": "Get user data and bookings",
          "description": "Returns the authenticated user's profile and their booked rooms",
          "security": [{ "BearerAuth": [] }],
          "responses": {
            "200": {
              "description": "User data retrieved successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "user": { "$ref": "#/components/schemas/User" },
                      "bookedRooms": {
                        "type": "array",
                        "items": { "$ref": "#/components/schemas/BookedRoom" }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized - invalid or missing token",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            },
            "404": {
              "description": "User not found",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            }
          }
        }
      },
      "/room-availability": {
        "get": {
          "summary": "Check room availability",
          "description": "Checks if a room name is available for booking",
          "security": [{ "BearerAuth": [] }],
          "parameters": [
            {
              "name": "roomName",
              "in": "query",
              "required": true,
              "schema": { "type": "string" },
              "description": "Room name to check availability for"
            }
          ],
          "responses": {
            "200": {
              "description": "Room availability status",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "available": { "type": "boolean", "description": "Whether the room is available for booking" },
                      "roomName": { "type": "string", "description": "The room name that was checked" }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - missing or invalid room name",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            },
            "401": {
              "description": "Unauthorized - invalid or missing token",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            }
          }
        }
      },
      "/prosody-webhook": {
        "post": {
          "summary": "Receive events from Prosody service",
          "description": "Webhook endpoint for receiving host assignment and removal events from the Prosody XMPP server",
          "security": [{ "WebhookAuth": [] }],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["type", "room", "email"],
                  "properties": {
                    "type": { "type": "string", "enum": ["HOST_ASSIGNED", "HOST_LEFT"], "description": "Type of event" },
                    "room": { "type": "string", "description": "Room name where event occurred" },
                    "email": { "type": "string", "format": "email", "description": "Email of user involved in event" }
                  }
                }
              }
            }
          },
          "responses": {
            "200": { "description": "Event received and processed" },
            "400": {
              "description": "Bad request - missing required parameters",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            },
            "401": {
              "description": "Unauthorized - invalid webhook secret",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            }
          }
        }
      },
      "/registration-flow": {
        "post": {
          "summary": "Complete user registration flow",
          "description": "Creates user accounts across all systems (Paddle, database, Brevo) during registration",
          "security": [{ "WebhookAuth": [] }],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["firstname", "lastname", "email", "email_verified"],
                  "properties": {
                    "firstname": { "type": "string", "description": "User's first name" },
                    "lastname": { "type": "string", "description": "User's last name" },
                    "email": { "type": "string", "format": "email", "description": "User's email address" },
                    "email_verified": { "type": "boolean", "description": "Whether the email has been verified" }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Registration completed successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "paddle_customer_id": { "type": "string", "description": "Paddle customer ID for the user" }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "Bad request - missing required fields",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            },
            "401": {
              "description": "Unauthorized - invalid webhook secret",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            }
          }
        }
      },
      "/paddle-customer-portal": {
        "get": {
          "summary": "Get Paddle customer portal URL",
          "description": "Generates a URL for the authenticated user to access their Paddle customer portal",
          "security": [{ "BearerAuth": [] }],
          "responses": {
            "200": {
              "description": "Customer portal URL generated successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "url": { "type": "string", "format": "uri", "description": "URL to access Paddle customer portal" }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized - invalid or missing token",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            },
            "404": {
              "description": "User not found or no Paddle customer associated",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            }
          }
        }
      },
      "/paddle-webhook": {
        "post": {
          "summary": "Receive Paddle webhook events",
          "description": "Webhook endpoint for receiving subscription and transaction events from Paddle",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "event_type": {
                      "type": "string",
                      "enum": ["transaction.created", "subscription.created", "transaction.updated", "subscription.updated"],
                      "description": "Type of Paddle event"
                    },
                    "data": { "type": "object", "description": "Event data from Paddle" }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Webhook processed successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": { "success": { "type": "boolean" } }
                  }
                }
              }
            },
            "401": { "description": "Unauthorized - invalid Paddle signature" }
          }
        }
      },
      "/discord-interactions": {
        "post": {
          "summary": "Handle Discord bot interactions",
          "description": "Webhook endpoint for Discord bot interactions, handles early access approval buttons",
          "responses": {
            "200": {
              "description": "Interaction acknowledged (PONG response)",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": { "type": { "type": "integer", "description": "Discord response type (1 = PONG)" } }
                  }
                }
              }
            },
            "401": { "description": "Unauthorized - invalid Discord signature" }
          }
        }
      },
      "/keycloak-webhook": {
        "post": {
          "summary": "Handle Keycloak webhook events",
          "description": "Webhook endpoint for Keycloak events like profile updates, email verification, login, and registration",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["id", "type", "authDetails"],
                  "properties": {
                    "id": { "type": "string", "description": "Event ID" },
                    "type": {
                      "type": "string",
                      "enum": ["access.UPDATE_PROFILE", "access.VERIFY_EMAIL", "access.LOGIN", "access.REGISTER"],
                      "description": "Type of Keycloak event"
                    },
                    "authDetails": {
                      "type": "object",
                      "properties": {
                        "username": { "type": "string", "description": "Username (email) of the user" },
                        "userId": { "type": "string", "description": "Keycloak user ID" }
                      }
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Event processed successfully",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "success": { "type": "boolean" },
                      "message": { "type": "string" }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized - invalid HMAC signature",
              "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } }
            }
          }
        }
      }
    }
  };

  return new Response(JSON.stringify(openApiSpec, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
};