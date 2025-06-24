import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Printer, Download, Mail } from "lucide-react";
import type { Estimate, Customer, BusinessProfile } from "@shared/schema";

interface PrintEstimateProps {
  estimate: Estimate & { customer: Customer };
  businessProfile?: BusinessProfile;
  onPrint?: () => void;
  onDownload?: () => void;
  onEmail?: () => void;
}

export default function PrintEstimate({ 
  estimate, 
  businessProfile, 
  onPrint, 
  onDownload, 
  onEmail 
}: PrintEstimateProps) {
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parseItems = (itemsString: string | null) => {
    if (!itemsString) return [];
    try {
      return JSON.parse(itemsString);
    } catch {
      return [];
    }
  };

  const items = parseItems(estimate.items);
  const subtotal = items.reduce((sum: number, item: any) => {
    return sum + (parseFloat(item.amount) || 0);
  }, 0);

  const handlePrint = () => {
    window.print();
    onPrint?.();
  };

  const handleDownload = () => {
    // Convert to PDF functionality would go here
    onDownload?.();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Action Buttons - Hidden when printing */}
      <div className="flex justify-end gap-2 mb-6 print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline" onClick={onEmail}>
          <Mail className="h-4 w-4 mr-2" />
          Email Customer
        </Button>
      </div>

      {/* Estimate Document */}
      <Card className="print:shadow-none print:border-none">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {businessProfile?.businessName || "Tulboxx"}
              </h1>
              {businessProfile && (
                <div className="text-gray-600 space-y-1">
                  {businessProfile.address && <p>{businessProfile.address}</p>}
                  {businessProfile.phone && <p>Phone: {businessProfile.phone}</p>}
                  {businessProfile.email && <p>Email: {businessProfile.email}</p>}
                </div>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">ESTIMATE</h2>
              <div className="text-gray-600">
                <p>Estimate #: {estimate.estimateNumber || `EST-${estimate.id}`}</p>
                <p>Date: {formatDate(estimate.createdAt)}</p>
                <p>Status: <span className="capitalize">{estimate.status}</span></p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="text-gray-700">
                <p className="font-medium">
                  {estimate.customer.firstName} {estimate.customer.lastName}
                </p>
                {estimate.customer.address && <p>{estimate.customer.address}</p>}
                {estimate.customer.city && estimate.customer.state && (
                  <p>{estimate.customer.city}, {estimate.customer.state} {estimate.customer.zipCode}</p>
                )}
                {estimate.customer.phone && <p>Phone: {estimate.customer.phone}</p>}
                {estimate.customer.email && <p>Email: {estimate.customer.email}</p>}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Details:</h3>
              <div className="text-gray-700">
                <p className="font-medium">{estimate.title}</p>
                {estimate.description && <p className="mt-2">{estimate.description}</p>}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Line Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & Materials</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Description</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900 w-20">Qty</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-900 w-24">Rate</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-900 w-24">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? items.map((item: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-2 text-gray-700">{item.description}</td>
                      <td className="py-3 px-2 text-center text-gray-700">{item.quantity || 1}</td>
                      <td className="py-3 px-2 text-right text-gray-700">
                        {item.rate ? formatCurrency(item.rate) : '-'}
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-gray-900">
                        {formatCurrency(item.amount || 0)}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-500">
                        No line items specified
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2 text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(estimate.totalAmount || subtotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Notes */}
          {(businessProfile?.terms || estimate.notes) && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                {businessProfile?.terms && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{businessProfile.terms}</p>
                  </div>
                )}
                {estimate.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{estimate.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>Thank you for choosing {businessProfile?.businessName || "Tulboxx"}!</p>
            <p className="mt-1">This estimate is valid for 30 days from the date issued.</p>
          </div>
        </CardContent>
      </Card>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body { margin: 0; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
        }
      `}</style>
    </div>
  );
}