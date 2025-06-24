/**
 * @file Email Service
 * @description Handles all email-related API communications, particularly for sending estimates.
 * Follows the "Stub API First" principle with a toggle for mock and real implementations.
 */

import { apiRequestJson } from "@/lib/queryClient";

// =================================================================
// Configuration
// =================================================================

/**
 * @constant {boolean} IS_MOCKED
 * A flag to toggle between the mock and real API implementations.
 * Set to `true` to use the mock service, `false` for the real API.
 */
const IS_MOCKED = true;
const MOCK_DELAY = 1000; // 1 second delay to simulate network latency

// =================================================================
// Type Definitions
// =================================================================

/**
 * @interface SendEmailPayload
 * Defines the structure of the data required to send an estimate email.
 */
export interface SendEmailPayload {
  estimateId: string;
  to: string;
  subject: string;
  message: string;
  /**
   * If true, attaches the estimate as a PDF.
   * If false, includes a secure link to the online version.
   */
  attachPdf: boolean;
}

/**
 * @interface SendEmailResponse
 * Defines the expected successful response from the email sending endpoint.
 */
export interface SendEmailResponse {
  success: boolean;
  messageId: string;
  status: string;
}

// =================================================================
// Mock Implementation
// =================================================================

/**
 * Simulates sending an email.
 * @param {SendEmailPayload} payload - The email data.
 * @returns {Promise<SendEmailResponse>} A promise that resolves with a mock success response or rejects with an error.
 */
const sendEmailMock = (payload: SendEmailPayload): Promise<SendEmailResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(" MOCK: Sending Email... ", {
        ...payload,
        deliveryMethod: payload.attachPdf ? "PDF Attachment" : "Secure Link",
      });

      // Simulate a failure case for testing UI error states
      if (payload.to.includes("fail")) {
        console.error(" MOCK: Simulated email failure. ");
        reject(new Error("Failed to send: The recipient's email provider rejected the message."));
        return;
      }

      const response: SendEmailResponse = {
        success: true,
        messageId: `mock_${new Date().getTime()}`,
        status: "sent",
      };

      console.log(" MOCK: Email Sent Successfully ", response);
      resolve(response);
    }, MOCK_DELAY);
  });
};

// =================================================================
// Real API Implementation
// =================================================================

/**
 * Sends an email by making a real API request.
 * @param {SendEmailPayload} payload - The email data.
 * @returns {Promise<SendEmailResponse>} The response from the server.
 */
const sendEmailReal = (payload: SendEmailPayload): Promise<SendEmailResponse> => {
  const { estimateId, ...body } = payload;
  const url = `/api/estimates/${estimateId}/send-email`;
  
  console.log(` REAL API: POST ${url} `, body);

  // Uses the centralized, typed API request helper from queryClient.ts
  return apiRequestJson<SendEmailResponse>("POST", url, body);
};

// =================================================================
// Exported Service Function
// =================================================================

/**
 * Sends an estimate email.
 * This function acts as a router, calling either the mock or the real implementation
 * based on the `IS_MOCKED` flag.
 *
 * @param {SendEmailPayload} payload - The complete payload for sending the email.
 * @returns {Promise<SendEmailResponse>}
 */
export const sendEmail = (payload: SendEmailPayload): Promise<SendEmailResponse> => {
  if (IS_MOCKED) {
    return sendEmailMock(payload);
  }
  return sendEmailReal(payload);
};
