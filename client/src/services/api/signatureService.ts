/**
 * @file Signature Service
 * @description Handles API communications for capturing and saving e-signatures on estimates.
 * Follows the "Stub API First" principle with a toggle for mock and real implementations.
 */

import { apiRequestJson } from "@/lib/queryClient";
import { ModernEstimate } from "@/shared/estimates-schema"; // Assuming this type is available

// =================================================================
// Configuration
// =================================================================

/**
 * @constant {boolean} IS_MOCKED
 * A flag to toggle between the mock and real API implementations.
 * Set to `true` to use the mock service, `false` for the real API.
 */
const IS_MOCKED = true;
const MOCK_DELAY = 1200; // Simulate network latency

// =================================================================
// Type Definitions
// =================================================================

/**
 * Custom error thrown when the signature payload fails validation.
 */
export class SignatureValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SignatureValidationError";
  }
}

/**
 * Generic wrapper for API‐level failures so callers can differentiate
 * transport / server errors from validation issues.
 */
export class SignatureApiError extends Error {
  public readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "SignatureApiError";
    this.status = status;
  }
}

/**
 * @interface SignEstimatePayload
 * Defines the structure of the data required to save a signature for an estimate.
 */
export interface SignEstimatePayload {
  estimateId: string;
  /**
   * The base64-encoded image data of the signature from the canvas.
   */
  signatureData: string;
  /**
   * The full name of the person signing the estimate.
   */
  signerName: string;
  /**
   * The ISO string representation of the date and time of signing.
   */
  signedAt: string;
}

/**
 * @interface SignEstimateResponse
 * Defines the expected successful response, which includes the updated estimate.
 */
export interface SignEstimateResponse {
  success: boolean;
  estimate: ModernEstimate;
}

/**
 * One entry in the signature history ledger.
 */
export interface SignatureHistoryEntry {
  signerName: string;
  signedAt: string; // ISO timestamp
  signatureUrl: string;
}

export type SignatureHistoryResponse = SignatureHistoryEntry[];

// =================================================================
// Mock Implementation
// =================================================================

/**
 * Simulates saving a signature for an estimate.
 * @param {SignEstimatePayload} payload - The signature data.
 * @returns {Promise<SignEstimateResponse>} A promise that resolves with a mock success response or rejects with an error.
 */
const signEstimateMock = (payload: SignEstimatePayload): Promise<SignEstimateResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(" MOCK: Saving Signature... ", payload);

      // Simulate a failure case for testing UI error states
      if (payload.signerName.toLowerCase().includes("fail")) {
        console.error(" MOCK: Simulated signature save failure. ");
        reject(new Error("Signature could not be verified. Please try again."));
        return;
      }

      // Create a mock updated estimate
      const updatedEstimate: ModernEstimate = {
        id: payload.estimateId,
        status: "approved",
        signedAt: payload.signedAt,
        signatureUrl: `data:image/png;base64,${payload.signatureData.substring(0, 50)}...`, // Mock URL
        // --- other estimate fields would be here ---
        estimateNumber: "EST-2025-001",
        title: "Mocked Signed Estimate",
        total: "5000.00",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        leadId: "lead-123",
        customerId: "cust-456",
        // etc.
      } as ModernEstimate;

      const response: SignEstimateResponse = {
        success: true,
        estimate: updatedEstimate,
      };

      console.log(" MOCK: Signature Saved Successfully ", response);
      resolve(response);
    }, MOCK_DELAY);
  });
};

// =================================================================
// Real API Implementation
// =================================================================

/**
 * Validates payload fields before contacting the API.
 * Throws {@link SignatureValidationError} on failure.
 */
export function validateSignaturePayload(payload: SignEstimatePayload): void {
  if (!payload.estimateId) {
    throw new SignatureValidationError("estimateId is required.");
  }
  if (!payload.signerName?.trim()) {
    throw new SignatureValidationError("signerName is required.");
  }
  if (!payload.signatureData?.startsWith("data:image")) {
    throw new SignatureValidationError(
      "signatureData must be a base64‐encoded image data URL."
    );
  }
  // Additional length check (~1k base64 chars minimum) to avoid empty scribbles
  if (payload.signatureData.length < 1000) {
    throw new SignatureValidationError("Signature image is too small.");
  }
}

/**
 * Saves a signature by making a real API request.
 * @param {SignEstimatePayload} payload - The signature data.
 * @returns {Promise<SignEstimateResponse>} The response from the server.
 */
const signEstimateReal = (payload: SignEstimatePayload): Promise<SignEstimateResponse> => {
  const { estimateId, ...body } = payload;
  const url = `/api/estimates/${estimateId}/sign`;
  
  console.log(` REAL API: POST ${url} `, body);

  // Uses the centralized, typed API request helper
  return apiRequestJson<SignEstimateResponse>("POST", url, body).catch((err: any) => {
    // apiRequestJson already throws on !ok – wrap to provide typed error class
    throw new SignatureApiError(err.message ?? "Failed to save signature", err?.status);
  });
};

/**
 * Retrieves signature history for an estimate.
 * Provided for audit trail display.
 */
const getSignatureHistoryReal = (
  estimateId: string
): Promise<SignatureHistoryResponse> => {
  const url = `/api/estimates/${estimateId}/signatures`;
  return apiRequestJson<SignatureHistoryResponse>("GET", url).catch((err: any) => {
    throw new SignatureApiError(err.message ?? "Failed to fetch signature history", err?.status);
  });
};

// =================================================================
// Exported Service Function
// =================================================================

/**
 * Saves an e-signature for an estimate.
 * This function acts as a router, calling either the mock or the real implementation
 * based on the `IS_MOCKED` flag.
 *
 * @param {SignEstimatePayload} payload - The complete payload for saving the signature.
 * @returns {Promise<SignEstimateResponse>}
 */
export const signEstimate = (payload: SignEstimatePayload): Promise<SignEstimateResponse> => {
  // Validate first – thrown error will reject promise for consumer hooks
  validateSignaturePayload(payload);

  if (IS_MOCKED) {
    return signEstimateMock(payload);
  }
  return signEstimateReal(payload);
};

/**
 * Fetches signature history (mock or real).
 */
export const getSignatureHistory = (
  estimateId: string
): Promise<SignatureHistoryResponse> => {
  if (IS_MOCKED) {
    // Simple mock: return current time entry only
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve([
            {
              signerName: "Mock User",
              signedAt: new Date().toISOString(),
              signatureUrl:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA",
            },
          ]),
        MOCK_DELAY / 2
      )
    );
  }
  return getSignatureHistoryReal(estimateId);
};

// =================================================================
//  E-Signature Flow Documentation
// =================================================================

/**
 * COMPLETE E-SIGNATURE FLOW
 * ---------------------------------------------------------------
 * 1.  Front-end captures signature via canvas and converts to base64
 * 2.  Call {@link validateSignaturePayload} to ensure integrity
 * 3.  Invoke {@link signEstimate} which routes to mock or real API
 *     • POST /api/estimates/:id/sign
 * 4.  On success UI refreshes estimate state to `approved`
 * 5.  Optional: Call {@link getSignatureHistory} to display audit trail
 *     • GET  /api/estimates/:id/signatures
 * ---------------------------------------------------------------
 * Toggle `IS_MOCKED` to `false` once backend endpoints are live.
 */
