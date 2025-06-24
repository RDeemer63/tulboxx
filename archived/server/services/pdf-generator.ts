import puppeteer, { type PDFOptions } from 'puppeteer';
import { type Estimate, type BusinessProfile, type LineItemFormValues } from '@shared/schema'; // Assuming LineItemFormValues is the structure of parsed items
import { format } from 'date-fns';

// Helper function to safely parse JSON strings, especially for items
function tryParseJSON<T>(jsonString: string | null | undefined, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error('Failed to parse JSON string:', e, jsonString);
    return defaultValue;
  }
}

function getFormattedDate(dateInput?: Date | string | null): string {
  if (!dateInput) return 'N/A';
  try {
    return format(new Date(dateInput), 'MMMM dd, yyyy');
  } catch {
    return 'Invalid Date';
  }
}

function formatCurrency(amount?: number | string | null): string {
  if (amount === null || amount === undefined || amount === '') return '$0.00';
  const num = parseFloat(String(amount));
  if (isNaN(num)) return '$0.00';
  return `$${num.toFixed(2)}`;
}

function generateHtmlForPdf(
  estimate: Estimate,
  businessProfile: BusinessProfile,
  parsedLineItems: LineItemFormValues[],
  customerFullName: string,
  customerAddress: string,
): string {
  const companyLogoHtml = businessProfile.logoUrl
    ? `<img src="${businessProfile.logoUrl}" alt="${businessProfile.businessName} Logo" style="max-height: 80px; max-width: 200px; margin-bottom: 20px;" />`
    : `<h1 style="font-size: 28px; color: #333; margin-bottom: 10px;">${businessProfile.businessName}</h1>`;

  const businessAddress = `${businessProfile.address || ''}<br />
    ${businessProfile.city || ''}, ${businessProfile.state || ''} ${businessProfile.zipCode || ''}`.trim();

  // Calculate pricing details (mirroring frontend logic if not stored on estimate directly)
  // For this PDF, we'll assume these values are passed in or calculated correctly on the estimate object.
  // If not, they would need to be recalculated here based on items, discount, tax.
  // For simplicity, let's assume estimate object has these fields correctly populated from CreateEditEstimateDrawer logic.
  const subtotal = parsedLineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const discountAmount = parseFloat(String(estimate.discountAmount || 0));
  const taxAmount = parseFloat(String(estimate.taxAmount || 0));
  const totalAmount = parseFloat(String(estimate.totalAmount || 0));
  const depositAmount = parseFloat(String(estimate.depositAmount || 0));


  let credentialsHtml = '';
  if (estimate.includeLicense && businessProfile.licenseNumbers) {
    credentialsHtml += `<p style="font-size: 9px; margin-top: 3px;">License(s): ${businessProfile.licenseNumbers}</p>`;
  }
  if (estimate.includeInsurance && businessProfile.insuranceInfo) {
    credentialsHtml += `<p style="font-size: 9px; margin-top: 3px;">Insurance: ${businessProfile.insuranceInfo}</p>`;
  }
  if (estimate.includeCerts && businessProfile.certifications) {
    credentialsHtml += `<p style="font-size: 9px; margin-top: 3px;">Certifications: ${businessProfile.certifications}</p>`;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Estimate ${estimate.estimateNumber || estimate.id}</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; color: #333; font-size: 11px; line-height: 1.5; }
            .container { padding: 40px; }
            .header, .footer { text-align: center; }
            .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; font-size: 9px; color: #777; }
            .company-details p, .customer-details p { margin: 0 0 3px 0; }
            .estimate-info { text-align: right; }
            .estimate-info h2 { font-size: 24px; color: #FB923C; margin: 0 0 5px 0; text-transform: uppercase; }
            .estimate-info p { margin: 0 0 3px 0; }
            .grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .section-title { font-size: 16px; font-weight: bold; color: #FB923C; margin-top: 30px; margin-bottom: 10px; border-bottom: 1px solid #FB923C; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f9f9f9; font-weight: bold; }
            .line-items td.description { width: 50%; }
            .line-items td.number { text-align: right; width: 12%; }
            .pricing-summary { margin-top: 30px; width: 50%; margin-left: auto; }
            .pricing-summary td { border: none; padding: 5px 0; }
            .pricing-summary td.label { font-weight: bold; }
            .pricing-summary td.value { text-align: right; }
            .pricing-summary tr.total td { font-size: 14px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
            .terms, .notes { margin-top: 30px; font-size: 10px; white-space: pre-wrap; }
            .signature-section { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
            .signature-box { border-top: 1px solid #333; padding-top: 10px; }
            .signature-box p { margin: 0; font-size: 10px; }
            .signature-box .date { margin-top: 30px; }
            .logo-container { text-align: left; }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 72px;
              color: rgba(0, 0, 0, 0.08);
              font-weight: bold;
              z-index: -1;
              pointer-events: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            ${estimate.status === 'draft' ? '<div class="watermark">DRAFT</div>' : ''}
            ${estimate.status === 'rejected' ? '<div class="watermark">REJECTED</div>' : ''}
            ${estimate.status === 'expired' ? '<div class="watermark">EXPIRED</div>' : ''}

            <div class="grid-container">
                <div class="company-details logo-container">
                    ${companyLogoHtml}
                    <p><strong>${businessProfile.businessName}</strong></p>
                    <p>${businessAddress.replace('<br />', '<br>')}</p>
                    <p>Phone: ${businessProfile.phone || 'N/A'}</p>
                    <p>Email: ${businessProfile.email || 'N/A'}</p>
                    ${businessProfile.website ? `<p>Website: ${businessProfile.website}</p>` : ''}
                </div>
                <div class="estimate-info">
                    <h2>Estimate</h2>
                    <p><strong>Estimate #:</strong> ${estimate.estimateNumber || `EST-${estimate.id}`}</p>
                    <p><strong>Date Prepared:</strong> ${getFormattedDate(estimate.createdAt)}</p>
                    ${estimate.validUntil ? `<p><strong>Valid Until:</strong> ${getFormattedDate(estimate.validUntil)}</p>` : ''}
                </div>
            </div>

            <div class="section-title">Customer Information</div>
            <div class="customer-details">
                <p><strong>To:</strong> ${customerFullName}</p>
                <p>${customerAddress.replace('<br />', '<br>')}</p>
            </div>

            <div class="section-title">Project Details</div>
            <p><strong>${estimate.title || 'Project Estimate'}</strong></p>
            ${estimate.description ? `<p style="font-size: 10px; white-space: pre-wrap;">${estimate.description}</p>` : ''}

            <div class="section-title">Line Items</div>
            <table class="line-items">
                <thead>
                    <tr>
                        <th class="description">Description</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th class="number">Rate</th>
                        <th class="number">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${parsedLineItems.map(item => `
                        <tr>
                            <td class="description">${item.description}</td>
                            <td>${item.quantity}</td>
                            <td>${item.unit}</td>
                            <td class="number">${formatCurrency(item.rate)}</td>
                            <td class="number">${formatCurrency(item.amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <table class="pricing-summary">
                <tbody>
                    <tr>
                        <td class="label">Subtotal:</td>
                        <td class="value">${formatCurrency(subtotal)}</td>
                    </tr>
                    ${discountAmount > 0 ? `
                        <tr>
                            <td class="label">Discount:</td>
                            <td class="value">-${formatCurrency(discountAmount)}</td>
                        </tr>` : ''}
                    ${taxAmount > 0 ? `
                        <tr>
                            <td class="label">Tax (${(estimate.taxRate || 0).toFixed(2)}%):</td>
                            <td class="value">${formatCurrency(taxAmount)}</td>
                        </tr>` : ''}
                    <tr class="total">
                        <td class="label">Total:</td>
                        <td class="value">${formatCurrency(totalAmount)}</td>
                    </tr>
                    ${depositAmount > 0 ? `
                        <tr>
                            <td class="label" style="font-size: 12px;">Deposit Due:</td>
                            <td class="value" style="font-size: 12px;">${formatCurrency(depositAmount)}</td>
                        </tr>` : ''}
                </tbody>
            </table>
            
            ${estimate.notesForCustomer ? `
                <div class="section-title notes">Notes for Customer</div>
                <p class="notes">${estimate.notesForCustomer}</p>
            ` : ''}

            ${estimate.termsAndConditions ? `
                <div class="section-title terms">Terms & Conditions</div>
                <p class="terms">${estimate.termsAndConditions}</p>
            ` : ''}

            <div class="signature-section">
                <div class="signature-box">
                    <p>Customer Signature:</p>
                    <div style="height: 60px; border-bottom: 1px solid #ccc; margin-bottom: 5px;">
                        ${estimate.customerSignatureUrl ? `<img src="${estimate.customerSignatureUrl}" alt="Customer Signature" style="max-height: 50px; display: block; margin-top: 5px;" />` : ''}
                    </div>
                    <p class="date">Date:</p>
                </div>
                <div class="signature-box">
                    <p>${businessProfile.businessName} Representative:</p>
                     <div style="height: 60px; border-bottom: 1px solid #ccc; margin-bottom: 5px;">
                        ${estimate.companySignatureUrl ? `<img src="${estimate.companySignatureUrl}" alt="Company Signature" style="max-height: 50px; display: block; margin-top: 5px;" />` : ''}
                    </div>
                    <p class="date">Date:</p>
                </div>
            </div>

            <div class="footer">
                <p>Thank you for your business!</p>
                ${credentialsHtml}
                <p>${businessProfile.businessName} | ${businessAddress.replace('<br />', ' ')} | Phone: ${businessProfile.phone} | Email: ${businessProfile.email}</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

export async function generateEstimatePdf(
  estimateData: Estimate,
  businessProfileData: BusinessProfile,
  customerData: { fullName: string; addressLine1: string; cityStateZip: string; } // Simplified customer data for PDF
): Promise<Buffer> {
  if (!process.env.CHROME_PATH && process.env.NODE_ENV === 'production') {
      console.warn("CHROME_PATH environment variable is not set. PDF generation might fail in production.");
  }

  let browser;
  try {
    const parsedLineItems: LineItemFormValues[] = tryParseJSON<LineItemFormValues[]>(estimateData.items, []);
    
    const customerFullName = customerData.fullName || 'Valued Customer';
    const customerAddress = `${customerData.addressLine1 || ''}<br />${customerData.cityStateZip || ''}`.trim();

    const htmlContent = generateHtmlForPdf(estimateData, businessProfileData, parsedLineItems, customerFullName, customerAddress);

    const launchOptions: Parameters<typeof puppeteer.launch>[0] = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    };
    if (process.env.CHROME_PATH) {
        launchOptions.executablePath = process.env.CHROME_PATH;
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    
    // Emulate screen media type for better print layout consistency with screen display
    await page.emulateMediaType('screen');

    // Wait for network idle can be useful if there are external resources like images, fonts
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfOptions: PDFOptions = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    };
    const pdfBuffer = await page.pdf(pdfOptions);

    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`PDF generation failed: ${(error as Error).message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Example usage (for testing, ensure estimate, business profile, and customer data are available)
/*
async function testPdfGeneration() {
  const mockEstimate: Estimate = {
    id: 1,
    customerId: 1,
    estimateNumber: 'EST-2024-001',
    title: 'Backyard Landscaping Project',
    description: 'Complete overhaul of backyard including new patio, plants, and irrigation system.',
    totalAmount: '12500.00',
    status: 'sent',
    items: JSON.stringify([
      { id: '1', description: 'Install new paver patio (200 sq ft)', quantity: 1, unit: 'job', rate: 5000, amount: 5000 },
      { id: '2', description: 'Plant assorted shrubs and flowers', quantity: 20, unit: 'plant', rate: 50, amount: 1000 },
      { id: '3', description: 'Install drip irrigation system', quantity: 1, unit: 'system', rate: 2500, amount: 2500 },
      { id: '4', description: 'Labor and project management', quantity: 40, unit: 'hours', rate: 100, amount: 4000 },
    ]),
    createdAt: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    termsAndConditions: "Payment due in 30 days. 50% deposit required to start.",
    notesForCustomer: "We are excited to work with you on this project!",
    includeLicense: true,
    includeInsurance: true,
    // ... other Estimate fields
  };

  const mockBusinessProfile: BusinessProfile = {
    id: 1,
    businessName: "GreenScape Solutions",
    ownerName: "John Green",
    email: "contact@greenscape.com",
    phone: "555-123-4567",
    address: "123 Garden Lane",
    city: "Springfield",
    state: "IL",
    zipCode: "62704",
    logoUrl: "https://example.com/logo.png", // Replace with a real or placeholder image URL for testing
    licenseNumbers: "LIC-12345, REG-67890",
    insuranceInfo: "Covered by Example Insurance Co. Policy #XYZ123",
    certifications: "Certified Landscaper, Master Gardener",
    defaultEstimateTerms: "Standard terms apply.",
    // ... other BusinessProfile fields
  };
  
  const mockCustomer = {
    fullName: "Alice Wonderland",
    addressLine1: "456 Rabbit Hole Ave",
    cityStateZip: "Curiosity Creek, CA 90210"
  };

  try {
    console.log('Generating PDF...');
    const pdfBuffer = await generateEstimatePdf(mockEstimate, mockBusinessProfile, mockCustomer);
    const fs = require('fs');
    fs.writeFileSync('test_estimate.pdf', pdfBuffer);
    console.log('PDF generated successfully: test_estimate.pdf');
  } catch (error) {
    console.error('PDF generation test failed:', error);
  }
}

// testPdfGeneration(); // Uncomment to run test locally (requires puppeteer setup and CHROME_PATH if needed)
*/
