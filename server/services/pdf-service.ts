import puppeteer from 'puppeteer';
import {
  ModernEstimate,
  EstimateLineItem,
  Invoice,
  Contact,
  BusinessProfile,
  // users, // Not directly used in PDF content but good to have in schema
} from '@shared/schema'; // Assuming shared types

// --- Helper Functions ---
const formatDate = (dateStr: string | Date | null | undefined, includeTime: boolean = false): string => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid Date'; // Check if date is valid
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return date.toLocaleDateString('en-US', options);
  } catch (e) {
    console.warn(`Error formatting date "${dateStr}":`, e);
    return 'Invalid Date';
  }
};

const formatCurrency = (amountStr: string | number | null | undefined): string => {
  const amount = parseFloat(String(amountStr ?? '0'));
  if (isNaN(amount)) {
    // Fallback for non-numeric strings that parseFloat converts to NaN
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(0);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

interface PdfLineItem {
  description: string;
  quantity: number;
  unit?: string | null;
  unitPrice: number;
  total: number;
}

// --- HTML Generation ---

function generateEstimateHTML(
  estimate: ModernEstimate & { lineItems?: EstimateLineItem[] }, // Ensure lineItems is potentially part of ModernEstimate type here
  customer: Contact | undefined,
  businessProfile: BusinessProfile | undefined
): string {
  // Normalize line items from estimate.lineItems (modern) or estimate.items (legacy JSON)
  let pdfLineItems: PdfLineItem[] = [];
  if (Array.isArray(estimate.lineItems) && estimate.lineItems.length > 0) {
    pdfLineItems = estimate.lineItems.map(li => ({
      description: li.title || li.description || '', // Prefer title if available
      quantity: parseFloat(li.quantity?.toString() || '1'),
      unit: li.unit,
      unitPrice: parseFloat(li.unitPrice?.toString() || '0'),
      total: parseFloat(li.total?.toString() || '0'),
    }));
  } else if ((estimate as any).items && typeof (estimate as any).items === 'string') { // Handling legacy 'items' field
    try {
      const legacyItems = JSON.parse((estimate as any).items);
      if (Array.isArray(legacyItems)) {
        pdfLineItems = legacyItems.map(li => ({
          description: li.description || li.title || '',
          quantity: parseFloat(li.quantity?.toString() || '1'),
          unit: li.unit,
          unitPrice: parseFloat(li.rate?.toString() || li.unitPrice?.toString() || '0'),
          total: parseFloat(li.amount?.toString() || li.total?.toString() || '0'),
        }));
      }
    } catch (e) {
      console.warn('Could not parse legacy estimate.items JSON:', e);
    }
  }


  const subtotal = parseFloat(estimate.subtotal?.toString() || '0') || pdfLineItems.reduce((sum, li) => sum + li.total, 0);
  const taxRate = parseFloat(estimate.taxRate?.toString() || '0');
  const taxAmount = parseFloat(estimate.total?.toString() || '0') > 0 && parseFloat(estimate.subtotal?.toString() || '0') > 0 && parseFloat(estimate.taxRate?.toString() || '0') >= 0
    ? (parseFloat(estimate.total.toString()) - parseFloat(estimate.subtotal.toString())) // Prefer explicit tax amount from total-subtotal
    : subtotal * taxRate; // Fallback calculation
  const total = parseFloat(estimate.total?.toString() || '0') || (subtotal + taxAmount);


  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Estimate ${estimate.estimateNumber || `EST-${estimate.id}`}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 20px; color: #333; font-size: 12px; line-height: 1.6; background-color: #fff; }
        .container { max-width: 800px; margin: auto; background: white; padding: 30px; border-radius: 8px; /* box-shadow: 0 0 15px rgba(0,0,0,0.05); */ }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #0070D2; }
        .company-info .logo { max-height: 70px; margin-bottom: 10px; }
        .company-info .company-name { font-size: 26px; font-weight: bold; color: #0070D2; margin-bottom: 8px; }
        .company-info .company-details { font-size: 11px; color: #555; line-height: 1.4; }
        .document-info { text-align: right; }
        .document-info .document-title { font-size: 28px; font-weight: bold; color: #0070D2; margin-bottom: 8px; text-transform: uppercase; }
        .document-info .document-meta { font-size: 11px; color: #555; line-height: 1.4; }
        .addresses { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .address-block { width: 48%; font-size: 11px; line-height: 1.4; }
        .address-block h3 { font-size: 13px; margin-bottom: 8px; color: #0070D2; border-bottom: 1px solid #eee; padding-bottom: 4px;}
        .address-block p { margin: 3px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px 8px; text-align: left; font-size: 11px; }
        .items-table th { background-color: #f0f8ff; color: #0070D2; font-weight: bold; }
        .items-table tbody tr:nth-child(even) { background-color: #f9f9f9; }
        .items-table .text-right { text-align: right; }
        .items-table .text-center { text-align: center; }
        .items-table .description-cell { width: 50%; }
        .items-table .qty-cell, .items-table .unit-cell { width: 10%; text-align: center; }
        .items-table .price-cell, .items-table .total-cell { width: 15%; text-align: right; }
        .totals-section { display: flex; justify-content: flex-end; margin-top: 20px; }
        .totals-table { width: 45%; font-size: 12px; }
        .totals-table td { padding: 8px 10px; }
        .totals-table .label { font-weight: bold; color: #555; text-align: right; padding-right: 15px;}
        .totals-table .value { text-align: right; }
        .totals-table .final-total .label, .totals-table .final-total .value { font-weight: bold; font-size: 14px; color: #0070D2; border-top: 2px solid #0070D2; padding-top:10px; }
        .notes-terms { margin-top: 30px; font-size: 10px; color: #444; }
        .notes-terms h4 { font-size: 12px; color: #0070D2; margin-bottom: 5px; }
        .notes-terms p { white-space: pre-wrap; } /* Preserve line breaks from textarea */
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 10px; color: #777; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-info">
            ${businessProfile?.logoUrl ? `<img src="${businessProfile.logoUrl}" alt="${businessProfile?.businessName || 'Company Logo'}" class="logo">` : ''}
            <div class="company-name">${businessProfile?.businessName || 'Your Company LLC'}</div>
            <div class="company-details">
              ${businessProfile?.address || '123 Main St'}<br>
              ${businessProfile?.city || 'Anytown'}, ${businessProfile?.state || 'CA'} ${businessProfile?.zipCode || '90210'}<br>
              Phone: ${businessProfile?.phone || '(555) 123-4567'}<br>
              Email: ${businessProfile?.email || 'contact@example.com'}<br>
              ${businessProfile?.website ? `Website: ${businessProfile.website}<br>` : ''}
            </div>
          </div>
          <div class="document-info">
            <div class="document-title">Estimate</div>
            <div class="document-meta">
              <strong>Estimate #:</strong> ${estimate.estimateNumber || `EST-${estimate.id}`}<br>
              <strong>Date of Issue:</strong> ${formatDate(estimate.createdAt)}<br>
              <strong>Valid Until:</strong> ${formatDate(estimate.validUntil)}
            </div>
          </div>
        </div>

        <div class="addresses">
          <div class="address-block">
            <h3>Prepared For:</h3>
            <p><strong>${customer?.firstName || ''} ${customer?.lastName || ''}</strong></p>
            <p>${customer?.address || 'N/A'}</p>
            <p>${customer?.city || ''}${customer?.city && customer?.state ? ', ' : ''}${customer?.state || ''} ${customer?.zipCode || ''}</p>
            <p>Email: ${customer?.email || 'N/A'}</p>
            <p>Phone: ${customer?.phone || 'N/A'}</p>
          </div>
          ${businessProfile?.address ? `
          <div class="address-block" style="text-align: right;">
            <h3>Prepared By:</h3>
            <p><strong>${businessProfile.businessName}</strong></p>
            <p>${businessProfile.address}</p>
            <p>${businessProfile.city}, ${businessProfile.state} ${businessProfile.zipCode}</p>
            <p>Email: ${businessProfile.email}</p>
            <p>Phone: ${businessProfile.phone}</p>
          </div>
          ` : ''}
        </div>

        ${estimate.title && estimate.title !== 'New Estimate' ? `<h2 style="font-size: 16px; color: #333; margin-bottom: 15px; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">${estimate.title}</h2>` : ''}
        
        ${estimate.notes && estimate.estimateType === 'simple' ? `
        <div class="notes-terms">
          <h4>Project Overview:</h4>
          <p>${estimate.notes}</p>
        </div>
        ` : ''}

        ${pdfLineItems.length > 0 ? `
          <table class="items-table">
            <thead>
              <tr>
                <th class="description-cell">Description</th>
                <th class="qty-cell">Quantity</th>
                ${pdfLineItems.some(li => li.unit) ? '<th class="unit-cell">Unit</th>' : ''}
                <th class="price-cell">Unit Price</th>
                <th class="total-cell">Total</th>
              </tr>
            </thead>
            <tbody>
              ${pdfLineItems.map(item => `
                <tr>
                  <td class="description-cell">${item.description}</td>
                  <td class="qty-cell">${item.quantity.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</td>
                  ${pdfLineItems.some(li => li.unit) ? `<td class="unit-cell">${item.unit || ''}</td>` : ''}
                  <td class="price-cell">${formatCurrency(item.unitPrice)}</td>
                  <td class="total-cell">${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : (estimate.estimateType !== 'simple' ? '<p style="text-align:center; color:#777; margin: 20px 0;">No line items detailed for this estimate.</p>' : '')}

        <div class="totals-section">
          <table class="totals-table">
            <tr>
              <td class="label">Subtotal:</td>
              <td class="value">${formatCurrency(subtotal)}</td>
            </tr>
            ${taxAmount > 0 || taxRate > 0 ? `
            <tr>
              <td class="label">Tax (${(taxRate * 100).toFixed(2)}%):</td>
              <td class="value">${formatCurrency(taxAmount)}</td>
            </tr>
            ` : ''}
            <tr class="final-total">
              <td class="label">Total:</td>
              <td class="value">${formatCurrency(total)}</td>
            </tr>
          </table>
        </div>
        <div style="clear: both;"></div>

        ${estimate.notes && estimate.estimateType !== 'simple' && pdfLineItems.length > 0 ? `
        <div class="notes-terms">
          <h4>Notes:</h4>
          <p>${estimate.notes}</p>
        </div>
        ` : ''}

        ${estimate.termsAndConditions || businessProfile?.defaultEstimateTerms ? `
        <div class="notes-terms">
          <h4>Terms & Conditions:</h4>
          <p>${(estimate.termsAndConditions || businessProfile?.defaultEstimateTerms || '').replace(/\r\n|\r|\n/g, '<br>')}</p>
        </div>
        ` : ''}

        <div class="footer">
          Thank you for your consideration!
          ${businessProfile?.legalFooterText ? `<br>${businessProfile.legalFooterText}` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateInvoiceHTML(
  invoice: Invoice,
  customer: Contact | undefined,
  businessProfile: BusinessProfile | undefined
): string {
  let pdfLineItems: PdfLineItem[] = [];
  if (invoice.items && typeof invoice.items === 'string') {
    try {
      const parsedItems = JSON.parse(invoice.items);
      if (Array.isArray(parsedItems)) {
        pdfLineItems = parsedItems.map(item => ({
          description: item.description || item.title || '',
          quantity: parseFloat(String(item.quantity || '1')),
          unit: item.unit,
          unitPrice: parseFloat(String(item.unitPrice || item.rate || '0')),
          total: parseFloat(String(item.total || item.amount || '0')),
        }));
      }
    } catch (e) {
      console.warn('Could not parse invoice.items JSON:', e);
    }
  }

  const subtotal = parseFloat(invoice.subtotal?.toString() || '0') || pdfLineItems.reduce((sum, li) => sum + li.total, 0);
  const taxRateNum = parseFloat(invoice.taxRate?.toString() || '0');
  const taxAmount = parseFloat(invoice.taxAmount?.toString() || '0') || (subtotal * taxRateNum);
  const totalAmount = parseFloat(invoice.totalAmount?.toString() || '0') || (subtotal + taxAmount);
  const paidAmount = parseFloat(invoice.paidAmount?.toString() || '0');
  const balanceDue = parseFloat(invoice.balanceDue?.toString() || '0') || (totalAmount - paidAmount);
  const taxRateDisplay = (taxRateNum * 100).toFixed(2);


  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoice.invoiceNumber || `INV-${invoice.id}`}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 20px; color: #333; font-size: 12px; line-height: 1.6; background-color: #fff; }
        .container { max-width: 800px; margin: auto; background: white; padding: 30px; border-radius: 8px; /* box-shadow: 0 0 15px rgba(0,0,0,0.05); */ }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #0070D2; }
        .company-info .logo { max-height: 70px; margin-bottom: 10px; }
        .company-info .company-name { font-size: 26px; font-weight: bold; color: #0070D2; margin-bottom: 8px; }
        .company-info .company-details { font-size: 11px; color: #555; line-height: 1.4; }
        .document-info { text-align: right; }
        .document-info .document-title { font-size: 28px; font-weight: bold; color: #0070D2; margin-bottom: 8px; text-transform: uppercase; }
        .document-info .document-meta { font-size: 11px; color: #555; line-height: 1.4; }
        .addresses { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .address-block { width: 48%; font-size: 11px; line-height: 1.4; }
        .address-block h3 { font-size: 13px; margin-bottom: 8px; color: #0070D2; border-bottom: 1px solid #eee; padding-bottom: 4px;}
        .address-block p { margin: 3px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px 8px; text-align: left; font-size: 11px; }
        .items-table th { background-color: #f0f8ff; color: #0070D2; font-weight: bold; }
        .items-table tbody tr:nth-child(even) { background-color: #f9f9f9; }
        .items-table .text-right { text-align: right; }
        .items-table .text-center { text-align: center; }
        .items-table .description-cell { width: 50%; }
        .items-table .qty-cell, .items-table .unit-cell { width: 10%; text-align: center; }
        .items-table .price-cell, .items-table .total-cell { width: 15%; text-align: right; }
        .totals-section { display: flex; justify-content: flex-end; margin-top: 20px; }
        .totals-table { width: 45%; font-size: 12px; }
        .totals-table td { padding: 8px 10px; }
        .totals-table .label { font-weight: bold; color: #555; text-align: right; padding-right: 15px;}
        .totals-table .value { text-align: right; }
        .totals-table .balance-due .label, .totals-table .balance-due .value { font-weight: bold; color: #D92D20; } /* Red for balance due */
        .totals-table .final-total .label, .totals-table .final-total .value { font-weight: bold; font-size: 14px; color: #0070D2; }
        .totals-table .grand-total-row { border-top: 2px solid #0070D2; padding-top:10px; margin-top: 5px; }
        .notes-terms { margin-top: 30px; font-size: 10px; color: #444; }
        .notes-terms h4 { font-size: 12px; color: #0070D2; margin-bottom: 5px; }
        .notes-terms p { white-space: pre-wrap; } /* Preserve line breaks from textarea */
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 10px; color: #777; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-info">
            ${businessProfile?.logoUrl ? `<img src="${businessProfile.logoUrl}" alt="${businessProfile?.businessName || 'Company Logo'}" class="logo">` : ''}
            <div class="company-name">${businessProfile?.businessName || 'Your Company LLC'}</div>
            <div class="company-details">
              ${businessProfile?.address || '123 Main St'}<br>
              ${businessProfile?.city || 'Anytown'}, ${businessProfile?.state || 'CA'} ${businessProfile?.zipCode || '90210'}<br>
              Phone: ${businessProfile?.phone || '(555) 123-4567'}<br>
              Email: ${businessProfile?.email || 'contact@example.com'}<br>
              ${businessProfile?.website ? `Website: ${businessProfile.website}<br>` : ''}
            </div>
          </div>
          <div class="document-info">
            <div class="document-title">Invoice</div>
            <div class="document-meta">
              <strong>Invoice #:</strong> ${invoice.invoiceNumber || `INV-${invoice.id}`}<br>
              <strong>Date of Issue:</strong> ${formatDate(invoice.createdAt)}<br>
              <strong>Due Date:</strong> ${formatDate(invoice.dueDate)}
            </div>
          </div>
        </div>

        <div class="addresses">
          <div class="address-block">
            <h3>Bill To:</h3>
            <p><strong>${customer?.firstName || ''} ${customer?.lastName || ''}</strong></p>
            <p>${customer?.address || 'N/A'}</p>
            <p>${customer?.city || ''}${customer?.city && customer?.state ? ', ' : ''}${customer?.state || ''} ${customer?.zipCode || ''}</p>
            <p>Email: ${customer?.email || 'N/A'}</p>
            <p>Phone: ${customer?.phone || 'N/A'}</p>
          </div>
          <div class="address-block" style="text-align: right;">
            <h3>Payment Terms:</h3>
            <p>${invoice.paymentTerms || businessProfile?.defaultInvoiceTerms || 'Due upon receipt'}</p>
          </div>
        </div>

        ${invoice.title ? `<h2 style="font-size: 16px; color: #333; margin-bottom: 15px; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">${invoice.title}</h2>` : ''}
        ${invoice.description ? `<div class="notes-terms" style="margin-top:0; margin-bottom: 20px;"><p>${invoice.description.replace(/\r\n|\r|\n/g, '<br>')}</p></div>` : ''}

        ${pdfLineItems.length > 0 ? `
          <table class="items-table">
            <thead>
              <tr>
                <th class="description-cell">Description</th>
                <th class="qty-cell">Quantity</th>
                ${pdfLineItems.some(li => li.unit) ? '<th class="unit-cell">Unit</th>' : ''}
                <th class="price-cell">Unit Price</th>
                <th class="total-cell">Total</th>
              </tr>
            </thead>
            <tbody>
              ${pdfLineItems.map(item => `
                <tr>
                  <td class="description-cell">${item.description}</td>
                  <td class="qty-cell">${item.quantity.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</td>
                  ${pdfLineItems.some(li => li.unit) ? `<td class="unit-cell">${item.unit || ''}</td>` : ''}
                  <td class="price-cell">${formatCurrency(item.unitPrice)}</td>
                  <td class="total-cell">${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p style="text-align:center; color:#777; margin: 20px 0;">No line items detailed for this invoice.</p>'}

        <div class="totals-section">
          <table class="totals-table">
            <tr>
              <td class="label">Subtotal:</td>
              <td class="value">${formatCurrency(subtotal)}</td>
            </tr>
            ${taxAmount > 0 || taxRateNum > 0 ? `
            <tr>
              <td class="label">Tax (${taxRateDisplay}%):</td>
              <td class="value">${formatCurrency(taxAmount)}</td>
            </tr>
            ` : ''}
            <tr class="final-total grand-total-row">
              <td class="label">Total Amount:</td>
              <td class="value">${formatCurrency(totalAmount)}</td>
            </tr>
            ${paidAmount > 0 ? `
            <tr>
              <td class="label">Amount Paid:</td>
              <td class="value">${formatCurrency(paidAmount)}</td>
            </tr>
            ` : ''}
            <tr class="balance-due final-total" style="${balanceDue <= 0 ? 'color: green;' : ''}">
              <td class="label" style="${balanceDue <= 0 ? 'color: green;' : ''}">Balance Due:</td>
              <td class="value" style="${balanceDue <= 0 ? 'color: green;' : ''}">${formatCurrency(balanceDue)}</td>
            </tr>
          </table>
        </div>
        <div style="clear: both;"></div>

        ${invoice.notes ? `
        <div class="notes-terms">
          <h4>Notes:</h4>
          <p>${invoice.notes.replace(/\r\n|\r|\n/g, '<br>')}</p>
        </div>
        ` : ''}

        ${(invoice.paymentTerms && invoice.paymentTerms !== businessProfile?.defaultInvoiceTerms) || (!invoice.paymentTerms && businessProfile?.defaultInvoiceTerms) ? `
        <div class="notes-terms">
          <h4>Terms & Conditions:</h4>
          <p>${(invoice.paymentTerms && invoice.paymentTerms !== businessProfile?.defaultInvoiceTerms ? invoice.paymentTerms : businessProfile?.defaultInvoiceTerms || '').replace(/\r\n|\r|\n/g, '<br>')}</p>
        </div>
        ` : ''}


        <div class="footer">
          Thank you for your business!
          ${businessProfile?.legalFooterText ? `<br>${businessProfile.legalFooterText}` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

// --- Core PDF Generation Service ---
export class PDFService {
  private browser: puppeteer.Browser | null = null;
  private isBrowserLaunching: boolean = false;
  private browserLaunchPromise: Promise<puppeteer.Browser> | null = null;

  private async getBrowser(): Promise<puppeteer.Browser> {
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }
    if (this.isBrowserLaunching && this.browserLaunchPromise) {
      return this.browserLaunchPromise;
    }

    this.isBrowserLaunching = true;
    this.browserLaunchPromise = puppeteer.launch({
      headless: true, // 'new' is default & recommended. Use true for older versions or specific needs.
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Common fix for issues in Docker/CI environments
        '--font-render-hinting=none', // May improve font rendering on some systems
        '--disable-gpu', // Often helpful in headless environments
        '--single-process', // May reduce resource usage for simple tasks
      ],
      // Consider adding executablePath if running in an environment where Puppeteer can't find Chrome/Chromium
      // executablePath: '/usr/bin/google-chrome-stable', // Example for Linux
    });

    try {
      this.browser = await this.browserLaunchPromise;
      console.info('Puppeteer browser launched successfully.');
      this.browser.once('disconnected', () => {
        console.warn('Puppeteer browser disconnected.');
        this.browser = null;
        this.browserLaunchPromise = null;
      });
    } catch (error) {
      console.error('Failed to launch Puppeteer browser:', error);
      this.browserLaunchPromise = null; // Reset promise on failure
      throw error; // Re-throw to calling function
    } finally {
      this.isBrowserLaunching = false;
    }
    return this.browser;
  }


  private async generatePDFBuffer(htmlContent: string): Promise<Buffer> {
    let page: puppeteer.Page | undefined;
    try {
      const browserInstance = await this.getBrowser();
      page = await browserInstance.newPage();
      
      // Emulate screen media type for better print layout consistency with screen styles
      await page.emulateMediaType('screen');

      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0.6in', right: '0.4in', bottom: '0.6in', left: '0.4in' }, // Slightly reduced margins
        // preferCSSPageSize: true, // If your HTML/CSS defines @page size
      });
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF with Puppeteer:', error);
      throw new Error(`Puppeteer PDF generation failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      if (page) {
        await page.close();
      }
      // Keep the browser instance open for reuse, don't close it here.
      // It will be closed on application shutdown or if explicitly managed.
    }
  }

  public async generateEstimatePDF(
    estimate: ModernEstimate & { lineItems?: EstimateLineItem[] },
    customer: Contact | undefined,
    businessProfile: BusinessProfile | undefined
  ): Promise<Buffer> {
    if (!estimate) throw new Error('Estimate data is required.');
    const htmlContent = generateEstimateHTML(estimate, customer, businessProfile);
    return this.generatePDFBuffer(htmlContent);
  }

  public async generateInvoicePDF(
    invoice: Invoice,
    customer: Contact | undefined,
    businessProfile: BusinessProfile | undefined
  ): Promise<Buffer> {
    if (!invoice) throw new Error('Invoice data is required.');
    const htmlContent = generateInvoiceHTML(invoice, customer, businessProfile);
    return this.generatePDFBuffer(htmlContent);
  }

  // Call this method on application shutdown to gracefully close the browser
  public async closeBrowser(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        console.info('Puppeteer browser closed successfully.');
      } catch (error) {
        console.error('Error closing Puppeteer browser:', error);
      } finally {
        this.browser = null;
        this.browserLaunchPromise = null;
      }
    }
  }
}

// Export a singleton instance
export const pdfService = new PDFService();

// Graceful shutdown for the browser instance
// This is a basic example; integrate with your application's specific shutdown mechanism
const cleanup = async () => {
  console.log('Closing PDF service browser...');
  await pdfService.closeBrowser();
  process.exit(0);
};

process.on('SIGINT', cleanup); // Ctrl+C
process.on('SIGTERM', cleanup); // Termination signal
process.on('exit', () => { // Ensure cleanup on normal exit as well, though SIGINT/SIGTERM are more common for graceful shutdown
  if (pdfService['browser']) { // Check if browser instance still exists
     console.log('Process exiting, ensuring PDF service browser is closed.');
     // pdfService.closeBrowser(); // This might not complete in a synchronous exit event
  }
});
