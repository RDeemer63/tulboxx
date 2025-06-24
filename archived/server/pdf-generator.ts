/**
 * ---------------------------------------------------------------------------
 *  LEGACY PDF GENERATOR (server/pdf-generator.ts)
 * ---------------------------------------------------------------------------
 *  This file is retained **only** for backward-compatibility with any routes
 *  or utilities that might still import `generateEstimatePDF` directly.
 *
 *  All new development MUST use the centralized PDF service located at
 *  `server/services/pdf-service.ts`.
 *
 *  Once all legacy references are removed this file can be safely deleted.
 * ---------------------------------------------------------------------------
 */

import { Request, Response } from 'express';
import { storage } from './storage';
import { pdfService } from './services/pdf-service'; // Centralised PDF generator

export async function generateEstimatePDF(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const estimateId = parseInt(id);
    
    // Get estimate data from storage
    const estimate = await storage.getEstimate(estimateId);
    if (!estimate) {
      return res.status(404).json({ error: 'Estimate not found' });
    }
    
    const customer = await storage.getCustomer(estimate.customerId);
    const businessProfile = await storage.getBusinessProfile();
    
    // Generate PDF using the centralized PDF service
    const pdfBuffer = await pdfService.generateEstimatePDF(
      estimate,
      customer,
      businessProfile,
    );
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="estimate-${estimateId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * -------------------------------------------------------------------------
 *  Legacy internal HTML helpers are kept below in case other legacy modules
 *  create HTML outside of the new pdfService. They are **unused** by the
 *  handler above which now defers to the centralised service.
 * -------------------------------------------------------------------------
 */

async function generateEstimatePDF_Internal(/* legacy params */): Promise<Buffer> {
  throw new Error(
    'generateEstimatePDF_Internal is deprecated. Use pdfService.generateEstimatePDF()',
  );
}

function generateEstimateHTML(estimate: any, customer: any, businessProfile: any): string {
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount: any) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Parse line items from JSON string
  let lineItems: any[] = [];

  /* ------------------------------------------------------------------
   *  Support BOTH legacy (items JSON string) and modern (lineItems array)
   * ------------------------------------------------------------------ */
  if (Array.isArray(estimate?.lineItems) && estimate.lineItems.length > 0) {
    lineItems = estimate.lineItems;
  } else if (estimate?.items) {
    try {
      lineItems = JSON.parse(estimate.items);
    } catch (e) {
      console.warn('Could not parse estimate.items JSON:', e);
    }
  }

  /* Normalise numbers in lineItems so we can safely format later */
  lineItems = lineItems.map((li: any) => ({
    description: li.description || li.title || '',
    quantity: parseFloat(li.quantity ?? 1),
    rate: parseFloat(li.rate ?? li.unitPrice ?? 0),
    amount: parseFloat(li.amount ?? li.total ?? 0),
  }));

  /* ------------------------------------------------------------------
   *  Totals – prefer fields on estimate, otherwise derive.
   * ------------------------------------------------------------------ */
  const subtotalValue =
    estimate.subtotal ??
    lineItems.reduce((sum, li) => sum + (li.amount || 0), 0);
  const taxRateValue = estimate.taxRate ?? 0;
  const taxAmountValue =
    estimate.taxAmount ?? subtotalValue * parseFloat(taxRateValue || 0);
  const grandTotalValue =
    estimate.totalAmount ??
    subtotalValue + parseFloat(taxAmountValue || 0);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Estimate ${estimate.estimateNumber || `EST-${estimate.id}`}</title>
      <style>
        body {
          font-family: 'Helvetica', Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          line-height: 1.4;
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          border-bottom: 2px solid #0066cc;
          padding-bottom: 20px;
        }
        .company-info {
          flex: 1;
        }
        .logo {
          max-height: 60px;
          margin-bottom: 6px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 10px;
        }
        .company-details {
          font-size: 12px;
          color: #666;
        }
        .estimate-info {
          text-align: right;
          flex: 1;
        }
        .estimate-title {
          font-size: 24px;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 20px;
        }
        .prepared-for {
          font-size: 10px;
          font-weight: bold;
          color: #666;
          margin-bottom: 5px;
        }
        .customer-name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .customer-details {
          font-size: 12px;
          color: #666;
        }
        .estimate-details {
          font-size: 11px;
          color: #666;
          margin-top: 15px;
        }
        .description-section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 15px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .description-text {
          font-size: 12px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th {
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          padding: 12px 8px;
          text-align: left;
          font-size: 12px;
          font-weight: bold;
          color: #333;
        }
        .items-table td {
          border: 1px solid #ddd;
          padding: 10px 8px;
          font-size: 11px;
        }
        .items-table tbody tr:nth-child(even){
          background:#fafafa;
        }
        .items-table .amount-col {
          text-align: right;
        }
        .totals-section {
          float: right;
          width: 300px;
          margin-top: 20px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .total-row.final {
          font-weight: bold;
          font-size: 16px;
          border-bottom: 3px double #0066cc;
          color: #0066cc;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 10px;
          color: #666;
          text-align: center;
        }
        .terms {
          margin-top: 40px;
          font-size: 10px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          ${
            businessProfile?.logoUrl
              ? `<img src="${businessProfile.logoUrl}" class="logo" />`
              : ''
          }
          <div class="company-name">${businessProfile?.businessName || 'Dunlap Excavating & Landscaping'}</div>
          <div class="company-details">
            ${businessProfile?.phone || '(309) 555-0123'} | ${businessProfile?.email || 'mike@dunlapexcavating.com'}<br>
            ${businessProfile?.address || '11222 N Tuscany Ridge Ct'}<br>
            ${businessProfile?.city || 'Dunlap'}, ${businessProfile?.state || 'IL'} ${businessProfile?.zipCode || '61525'}
          </div>
        </div>
        <div class="estimate-info">
          <div class="estimate-title">ESTIMATE</div>
          <div class="prepared-for">PREPARED FOR:</div>
          <div class="customer-name">${customer?.firstName || ''} ${customer?.lastName || ''}</div>
          <div class="customer-details">
            ${customer?.email ? `${customer.email}<br>` : ''}
            ${customer?.phone ? `${customer.phone}<br>` : ''}
            ${customer?.address ? `${customer.address}<br>` : ''}
            ${customer?.city && customer?.state ? `${customer.city}, ${customer.state} ${customer?.zipCode || ''}` : ''}
          </div>
          <div class="estimate-details">
            Estimate #${estimate.estimateNumber || `EST-${estimate.id}`}<br>
            Date: ${formatDate(estimate.createdAt)}<br>
            Valid Until: ${formatDate(estimate.validUntil) || 'Jun 05, 2025'}
          </div>
        </div>
      </div>

      ${estimate.description ? `
        <div class="description-section">
          <div class="section-title">Project Description</div>
          <div class="description-text">${estimate.description}</div>
        </div>
      ` : ''}

      ${lineItems.length > 0 ? `
        <div class="section-title">Items & Services</div>
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 50%;">Description</th>
              <th style="width: 15%; text-align: center;">Qty</th>
              <th style="width: 17.5%; text-align: right;">Rate</th>
              <th style="width: 17.5%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems.map((item: any) => `
              <tr>
                <td>${item.description || ''}</td>
                <td style="text-align: center;">${item.quantity || 1}</td>
                <td class="amount-col">${formatCurrency(item.rate || 0)}</td>
                <td class="amount-col">${formatCurrency(item.amount || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      <div class="totals-section">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>${formatCurrency(subtotalValue)}</span>
        </div>
        ${
          parseFloat(taxAmountValue || 0) > 0
            ? `<div class="total-row">
                <span>Tax:</span>
                <span>${formatCurrency(taxAmountValue)}</span>
              </div>`
            : ''
        }
        <div class="total-row final">
          <span>Total Amount:</span>
          <span>${formatCurrency(grandTotalValue)}</span>
        </div>
      </div>

      <div style="clear: both;"></div>

      <div class="terms">
        <strong>Terms & Conditions:</strong><br>
        This estimate is valid for 30 days from the date above. Work will commence upon signed approval and required deposit. 
        All work will be performed in accordance with local building codes and industry standards. 
        Additional charges may apply for work beyond the scope outlined in this estimate.
      </div>

      <div class="footer">
        Thank you for choosing ${businessProfile?.businessName || 'Dunlap Excavating & Landscaping'} for your project needs.
      </div>
    </body>
    </html>
  `;
}