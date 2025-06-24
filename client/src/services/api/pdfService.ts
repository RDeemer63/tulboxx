/**
 * @file PDF Service
 * @description Handles all PDF-related API communications, including generation and downloading.
 * Follows the "Stub API First" principle with a toggle for mock and real implementations.
 */

// =================================================================
// Configuration
// =================================================================

/**
 * @constant {boolean} IS_MOCKED
 * A flag to toggle between the mock and real API implementations.
 * Set to `true` to use the mock service, `false` for the real API.
 */
const IS_MOCKED = true;
const MOCK_DELAY = 800; // Simulate network latency for PDF generation

// =================================================================
// Type Definitions
// =================================================================

/**
 * @interface GeneratePdfPayload
 * Defines the structure of the data required for generating a PDF.
 */
export interface GeneratePdfPayload {
  estimateId: string;
  /** Optional template name for branded PDFs */
  templateName?: string;
}

// =================================================================
// Mock Implementation
// =================================================================

/**
 * Simulates the generation of a PDF file and returns it as a Blob.
 * @param {GeneratePdfPayload} payload - The data for PDF generation.
 * @returns {Promise<Blob>} A promise that resolves with a mock PDF Blob.
 */
const generatePdfBlobMock = (payload: GeneratePdfPayload): Promise<Blob> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(" MOCK: Generating PDF Blob... ", payload);

      const mockPdfContent = `
        This is a mock PDF document for Estimate ID: ${payload.estimateId}.
        
        Generated on: ${new Date().toISOString()}
        
        This file is for testing purposes only. The real PDF will contain
        the full estimate details, line items, and terms.
      `;

      const blob = new Blob([mockPdfContent], { type: "application/pdf" });
      console.log(" MOCK: PDF Blob created successfully. ");
      resolve(blob);
    }, MOCK_DELAY);
  });
};

// =================================================================
// Real API Implementation
// =================================================================

/**
 * Fetches the actual PDF file from the server as a Blob.
 * @param {GeneratePdfPayload} payload - The data for PDF generation.
 * @returns {Promise<Blob>} The PDF file as a Blob.
 */
const generatePdfBlobReal = async (payload: GeneratePdfPayload): Promise<Blob> => {
  const url = `/api/estimates/${payload.estimateId}/pdf`;
  console.log(` REAL API: GET ${url} `);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        // Add auth headers if necessary
      },
    });

    if (!response.ok) {
      // Try to parse error from JSON, otherwise use status text
      const errorBody = await response.json().catch(() => null);
      const errorMessage = errorBody?.message || response.statusText;
      throw new Error(`Failed to fetch PDF: ${response.status} ${errorMessage}`);
    }

    return await response.blob();
  } catch (error) {
    console.error("Error fetching real PDF blob:", error);
    throw error;
  }
};

// =================================================================
// Exported Service Functions
// =================================================================

/**
 * Generates and returns an estimate PDF as a Blob.
 * This function acts as a router, calling either the mock or the real implementation
 * based on the `IS_MOCKED` flag.
 *
 * @param {GeneratePdfPayload} payload - The payload for PDF generation.
 * @returns {Promise<Blob>}
 */
export const generatePdfBlob = (payload: GeneratePdfPayload): Promise<Blob> => {
  if (IS_MOCKED) {
    return generatePdfBlobMock(payload);
  }
  return generatePdfBlobReal(payload);
};

/**
 * Constructs the direct URL for an estimate's PDF.
 * This is useful for embedding the PDF in viewers that accept a URL source.
 *
 * @param {string} estimateId - The ID of the estimate.
 * @returns {string} The direct URL to the PDF resource.
 */
export const getPdfUrl = (estimateId: string): string => {
  // Appending a timestamp query parameter to prevent browser caching issues
  return `/api/estimates/${estimateId}/pdf?timestamp=${new Date().getTime()}`;
};

/**
 * A client-side utility to trigger the download of a Blob.
 *
 * @param {Blob} blob - The file content as a Blob.
 * @param {string} filename - The desired name for the downloaded file.
 */
export const downloadPdf = (blob: Blob, filename: string): void => {
  // Create a URL for the blob
  const url = window.URL.createObjectURL(blob);

  // Create a temporary anchor element and set its properties
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;

  // Append the anchor to the body, trigger the click, and then remove it
  document.body.appendChild(a);
  a.click();

  // Clean up by revoking the object URL
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  console.log(`Download triggered for: ${filename}`);
};
