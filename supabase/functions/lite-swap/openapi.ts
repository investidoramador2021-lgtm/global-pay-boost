/**
 * OpenAPI 3.1 contract for the Public Lite Swap API.
 *
 * Served at:
 *   GET /functions/v1/lite-swap?action=openapi
 *
 * Used by:
 *   - external clients to generate SDKs
 *   - supabase/functions/lite-swap/contract_test.ts to validate live responses
 */

export const LITE_API_OPENAPI = {
  openapi: "3.1.0",
  info: {
    title: "MRC Global Pay — Lite Swap API",
    version: "1.0.0",
    description:
      "Public, non-custodial swap API for small-amount trading bots. " +
      "Hard cap of $1,000 USD per swap. No registration required.",
    contact: {
      name: "MRC Global Pay Developers",
      url: "https://mrcglobalpay.com/developers#lite-api",
    },
  },
  servers: [
    {
      url: "https://tjikwxkmsfmyjkssvyoh.supabase.co/functions/v1",
      description: "Production",
    },
  ],
  paths: {
    "/lite-swap": {
      get: {
        summary: "Rates / status / openapi (action-routed)",
        parameters: [
          {
            name: "action",
            in: "query",
            required: true,
            schema: { type: "string", enum: ["rates", "status", "openapi"] },
          },
          { name: "from", in: "query", schema: { type: "string" } },
          { name: "to", in: "query", schema: { type: "string" } },
          { name: "amount", in: "query", schema: { type: "string" } },
          { name: "id", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Success envelope",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/RatesResponse" },
                    { $ref: "#/components/schemas/StatusResponse" },
                  ],
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/Error" },
          "404": { $ref: "#/components/responses/Error" },
          "502": { $ref: "#/components/responses/Error" },
        },
      },
      post: {
        summary: "Estimate or create a swap (action in body)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  { $ref: "#/components/schemas/EstimateRequest" },
                  { $ref: "#/components/schemas/CreateRequest" },
                ],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Success envelope",
            content: {
              "application/json": {
                schema: {
                  oneOf: [
                    { $ref: "#/components/schemas/EstimateResponse" },
                    { $ref: "#/components/schemas/CreateResponse" },
                  ],
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/Error" },
          "403": { $ref: "#/components/responses/Error" },
          "413": { $ref: "#/components/responses/Error" },
          "429": { $ref: "#/components/responses/Error" },
          "451": { $ref: "#/components/responses/Error" },
          "502": { $ref: "#/components/responses/Error" },
        },
      },
    },
  },
  components: {
    responses: {
      Error: {
        description: "Error envelope",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        required: ["status", "error"],
        properties: {
          status: { type: "string", enum: ["error"] },
          error: { type: "string" },
          max_usd: { type: "number" },
          estimated_usd: { type: ["number", "null"] },
          retry_after_seconds: { type: "integer" },
        },
        additionalProperties: true,
      },
      RatesResponse: {
        type: "object",
        required: ["status", "from", "to", "amount", "provider"],
        properties: {
          status: { type: "string", enum: ["success"] },
          from: { type: "string" },
          to: { type: "string" },
          amount: { type: "number" },
          estimated_amount: { type: ["number", "null"] },
          rate: { type: ["number", "null"] },
          warning: { type: ["string", "null"] },
          provider: { type: "string" },
          documentation: { type: "string" },
        },
        additionalProperties: false,
      },
      EstimateRequest: {
        type: "object",
        required: ["action", "from", "to", "amount"],
        properties: {
          action: { type: "string", enum: ["estimate"] },
          from: { type: "string" },
          to: { type: "string" },
          amount: { type: "number", exclusiveMinimum: 0 },
        },
      },
      EstimateResponse: {
        type: "object",
        required: ["status", "from", "to", "amount"],
        properties: {
          status: { type: "string", enum: ["success"] },
          from: { type: "string" },
          to: { type: "string" },
          amount: { type: "number" },
          estimated_amount: { type: ["number", "null"] },
          estimated_usd: { type: ["number", "null"] },
          warning: { type: ["string", "null"] },
        },
        additionalProperties: false,
      },
      CreateRequest: {
        type: "object",
        required: ["action", "from", "to", "amount", "address"],
        properties: {
          action: { type: "string", enum: ["create"] },
          from: { type: "string" },
          to: { type: "string" },
          amount: { type: "number", exclusiveMinimum: 0 },
          address: { type: "string", minLength: 8, maxLength: 128 },
          refundAddress: { type: "string", minLength: 8, maxLength: 128 },
          webhook_url: {
            type: "string",
            pattern: "^https://",
            maxLength: 512,
          },
          webhook_secret: {
            type: "string",
            minLength: 8,
            maxLength: 128,
            pattern: "^[a-zA-Z0-9._-]+$",
          },
        },
      },
      CreateResponse: {
        type: "object",
        required: [
          "status",
          "order_id",
          "provider_order_id",
          "deposit_address",
          "from",
          "to",
          "expires_at",
          "status_url",
          "custody",
        ],
        properties: {
          status: { type: "string", enum: ["success"] },
          order_id: { type: "string", pattern: "^MRC-" },
          provider_order_id: { type: "string" },
          deposit_address: { type: "string" },
          deposit_extra_id: { type: ["string", "null"] },
          payout_address: { type: "string" },
          payout_extra_id: { type: ["string", "null"] },
          from: { type: "string" },
          to: { type: "string" },
          from_amount: { type: ["number", "string"] },
          estimated_to_amount: { type: ["number", "string", "null"] },
          estimated_usd: { type: ["number", "null"] },
          expires_at: { type: "string", format: "date-time" },
          status_url: { type: "string", format: "uri" },
          custody: { type: "string", enum: ["non-custodial"] },
          webhook: {
            type: "object",
            properties: {
              url: { type: "string" },
              initial_event: { type: "string" },
              idempotency_key: { type: "string" },
              delivered: { type: "boolean" },
              response_status: { type: ["integer", "null"] },
              error: { type: "string" },
            },
          },
          documentation: { type: "string" },
        },
        additionalProperties: false,
      },
      StatusResponse: {
        type: "object",
        required: ["status", "order_id", "state"],
        properties: {
          status: { type: "string", enum: ["success"] },
          order_id: { type: "string" },
          state: { type: "string" },
          from: { type: ["string", "null"] },
          to: { type: ["string", "null"] },
          amount_in: { type: ["number", "string", "null"] },
          amount_out: { type: ["number", "string", "null"] },
          deposit_address: { type: ["string", "null"] },
          payout_address: { type: ["string", "null"] },
          payout_hash: { type: ["string", "null"] },
          updated_at: { type: ["string", "null"] },
          webhook: {
            type: "object",
            properties: {
              event: { type: "string" },
              idempotency_key: { type: "string" },
              delivered: { type: "boolean" },
              response_status: { type: ["integer", "null"] },
              error: { type: "string" },
            },
          },
        },
        additionalProperties: false,
      },
    },
  },
} as const;
