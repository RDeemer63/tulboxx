import { format } from "date-fns";
import type { Contact, BusinessProfile, Estimate } from "@shared/schema";

interface EstimateTemplateProps {
  estimate: Estimate;
  customer: Contact;
  businessProfile?: BusinessProfile;
  showPrintStyles?: boolean;
}

export default function EstimateTemplate({ 
  estimate, 
  customer, 
  businessProfile,
  showPrintStyles = false 
}: EstimateTemplateProps) {
  const estimateItems = estimate.items ? JSON.parse(estimate.items) : [];

  return (
    <div className={`bg-white ${showPrintStyles ? 'print:shadow-none' : 'shadow-lg'} max-w-4xl mx-auto`}>
      {/* Header */}
      <div className="border-b-2 border-gray-200 p-8">
        <div className="flex justify-between items-start">
          {/* Business Info */}
          <div className="flex items-start space-x-4">
            {businessProfile?.logoUrl && (
              <img 
                src={businessProfile.logoUrl} 
                alt={`${businessProfile.businessName} Logo`}
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {businessProfile?.businessName || "Your Business Name"}
              </h1>
              <p className="text-sm text-gray-600">
                {businessProfile?.ownerName || "Business Owner"}
              </p>
              <div className="mt-2 text-sm text-gray-600">
                <p>{businessProfile?.address || "123 Business St"}</p>
                <p>{businessProfile?.city || "City"}, {businessProfile?.state || "ST"} {businessProfile?.zipCode || "12345"}</p>
                <p>Phone: {businessProfile?.phone || "(555) 123-4567"}</p>
                <p>Email: {businessProfile?.email || "contact@business.com"}</p>
              </div>
            </div>
          </div>

          {/* Estimate Info */}
          <div className="text-right">
            <h2 className="text-xl font-semibold text-gray-900">ESTIMATE</h2>
            <div className="mt-2 text-sm text-gray-600">
              <p>Estimate #: {estimate.id.toString().padStart(4, '0')}</p>
              <p>Date: {format(new Date(estimate.createdAt), 'MM/dd/yyyy')}</p>
              {estimate.validUntil && (
                <p>Valid Until: {format(new Date(estimate.validUntil), 'MM/dd/yyyy')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="p-8 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prepared For:</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-medium text-gray-900">
            {`${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
              "Valued Customer"}
          </p>
          <p className="text-gray-600">{customer.email}</p>
          <p className="text-gray-600">{customer.phone}</p>
          {customer.address && (
            <p className="text-gray-600">{customer.address}</p>
          )}
        </div>
      </div>

      {/* Estimate Content */}
      <div className="p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{estimate.title}</h3>
        
        {estimate.description && (
          <div className="mb-6">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {estimate.description}
            </p>
          </div>
        )}

        {/* Line Items */}
        {estimateItems.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Services Included:</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {estimateItems.map((item: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">${item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Total */}
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold text-gray-900">Total Estimate:</span>
            <span className="text-2xl font-bold text-green-600">${estimate.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Terms and Footer */}
      <div className="bg-gray-50 p-8 border-t border-gray-200">
        {businessProfile?.estimateTerms && (
          <div className="mb-6">
            <h4 className="text-md font-semibold text-gray-900 mb-2">Terms & Conditions:</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {businessProfile.estimateTerms}
            </p>
          </div>
        )}

        {businessProfile?.licenseNumber && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              License #: {businessProfile.licenseNumber}
            </p>
          </div>
        )}

        {businessProfile?.insuranceInfo && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {businessProfile.insuranceInfo}
            </p>
          </div>
        )}

        {/* Contact Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-300">
          <div className="text-sm text-gray-600">
            <p className="font-medium">Questions? Contact us:</p>
            <p>{businessProfile?.phone || "(555) 123-4567"} • {businessProfile?.email || "contact@business.com"}</p>
          </div>
          
          {/* Social Links */}
          <div className="flex space-x-4 text-sm text-gray-600">
            {businessProfile?.website && (
              <a href={businessProfile.website} className="hover:text-blue-600">
                Website
              </a>
            )}
            {businessProfile?.socialFacebook && (
              <a href={businessProfile.socialFacebook} className="hover:text-blue-600">
                Facebook
              </a>
            )}
            {businessProfile?.socialInstagram && (
              <a href={businessProfile.socialInstagram} className="hover:text-blue-600">
                Instagram
              </a>
            )}
            {businessProfile?.socialLinkedin && (
              <a href={businessProfile.socialLinkedin} className="hover:text-blue-600">
                LinkedIn
              </a>
            )}
          </div>
        </div>

        <div className="text-center mt-6 pt-4 border-t border-gray-300">
          <p className="text-xs text-gray-500">
            Thank you for considering {businessProfile?.businessName || "our services"}. We look forward to working with you!
          </p>
        </div>
      </div>
    </div>
  );
}