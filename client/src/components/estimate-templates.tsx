import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import excavatingLogo from "@/assets/excavating-logo.svg";

interface TemplateProps {
  estimate: any;
  customer: any;
  businessProfile: any;
  editedItems: any[];
  calculateSubtotal: () => number;
  formatCurrency: (amount: number) => string;
}

// Professional Template - Clean and business-focused
export function ProfessionalTemplate({ 
  estimate, 
  customer, 
  businessProfile, 
  editedItems, 
  calculateSubtotal, 
  formatCurrency 
}: TemplateProps) {
  return (
    <div className="bg-white">
      {/* Header with clean layout */}
      <div className="border-b-2 border-gray-900 pb-6 mb-8">
        <div className="flex justify-between items-start">
          {/* Business Info */}
          <div className="flex items-start space-x-4">
            <img src={excavatingLogo} alt="Company Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {businessProfile?.businessName || "Dunlap Excavating"}
              </h1>
              <div className="text-gray-600 mt-1 space-y-0.5">
                <p>{businessProfile?.phone || "(309) 555-0123"}</p>
                <p>{businessProfile?.email || "mike@dunlapexcavating.com"}</p>
                <p>{businessProfile?.address || "11222 N Tuscany Ridge Ct"}</p>
              </div>
            </div>
          </div>
          
          {/* Estimate Badge */}
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">ESTIMATE</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>#{estimate.estimateNumber || `EST-${estimate.id}`}</p>
              <p>{format(new Date(estimate.createdAt), 'MMM dd, yyyy')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">PREPARED FOR:</h3>
        <div className="text-gray-900">
          <p className="font-semibold text-lg">{customer.firstName} {customer.lastName}</p>
          <p>{customer.email}</p>
          <p>{customer.phone}</p>
          {customer.address && <p>{customer.address}</p>}
        </div>
      </div>

      {/* Content sections with professional spacing */}
      <div className="space-y-8">
        {estimate.title && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{estimate.title}</h2>
          </div>
        )}
        
        {estimate.description && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Description</h3>
            <p className="text-gray-700 leading-relaxed">{estimate.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Modern Template - Contemporary with visual hierarchy
export function ModernTemplate({ 
  estimate, 
  customer, 
  businessProfile, 
  editedItems, 
  calculateSubtotal, 
  formatCurrency 
}: TemplateProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-white">
      {/* Modern header with accent colors */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-2 rounded-lg">
              <img src={excavatingLogo} alt="Company Logo" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {businessProfile?.businessName || "Dunlap Excavating"}
              </h1>
              <div className="text-blue-100 mt-1">
                <p>{businessProfile?.phone || "(309) 555-0123"}</p>
                <p>{businessProfile?.email || "mike@dunlapexcavating.com"}</p>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-3xl font-bold mb-1">ESTIMATE</h2>
            <div className="text-blue-100 text-sm">
              <p>#{estimate.estimateNumber || `EST-${estimate.id}`}</p>
              <p>{format(new Date(estimate.createdAt), 'MMM dd, yyyy')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Customer info with modern styling */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border-l-4 border-blue-600">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">PREPARED FOR:</h3>
          <div className="text-gray-900">
            <p className="font-semibold text-lg">{customer.firstName} {customer.lastName}</p>
            <p className="text-blue-600">{customer.email}</p>
            <p>{customer.phone}</p>
            {customer.address && <p>{customer.address}</p>}
          </div>
        </div>

        {/* Content with modern cards */}
        <div className="space-y-6">
          {estimate.title && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">{estimate.title}</h2>
            </div>
          )}
          
          {estimate.description && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-blue-600 mb-3">Project Description</h3>
              <p className="text-gray-700 leading-relaxed">{estimate.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Classic Template - Traditional invoice style
export function ClassicTemplate({ 
  estimate, 
  customer, 
  businessProfile, 
  editedItems, 
  calculateSubtotal, 
  formatCurrency 
}: TemplateProps) {
  return (
    <div className="bg-white border-2 border-gray-300">
      {/* Classic header */}
      <div className="border-b border-gray-300 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {businessProfile?.businessName || "Dunlap Excavating"}
          </h1>
          <div className="text-gray-600 text-sm">
            <p>{businessProfile?.address || "11222 N Tuscany Ridge Ct"}</p>
            <p>{businessProfile?.phone || "(309) 555-0123"} • {businessProfile?.email || "mike@dunlapexcavating.com"}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Traditional estimate header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ESTIMATE</h2>
          <div className="text-gray-600">
            <p>Estimate #: {estimate.estimateNumber || `EST-${estimate.id}`}</p>
            <p>Date: {format(new Date(estimate.createdAt), 'MMMM dd, yyyy')}</p>
          </div>
        </div>

        {/* Customer info in traditional format */}
        <div className="mb-6">
          <div className="border border-gray-300 p-3">
            <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
            <div className="text-gray-900">
              <p>{customer.firstName} {customer.lastName}</p>
              <p>{customer.email}</p>
              <p>{customer.phone}</p>
              {customer.address && <p>{customer.address}</p>}
            </div>
          </div>
        </div>

        {/* Content in traditional layout */}
        <div className="space-y-4">
          {estimate.title && (
            <div>
              <h3 className="font-semibold text-gray-900 underline">{estimate.title}</h3>
            </div>
          )}
          
          {estimate.description && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Description of Work:</h4>
              <p className="text-gray-700">{estimate.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Detailed Template - Comprehensive layout
export function DetailedTemplate({ 
  estimate, 
  customer, 
  businessProfile, 
  editedItems, 
  calculateSubtotal, 
  formatCurrency 
}: TemplateProps) {
  return (
    <div className="bg-white">
      {/* Detailed header with extensive info */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Company details */}
          <div>
            <div className="flex items-start space-x-3 mb-4">
              <img src={excavatingLogo} alt="Company Logo" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {businessProfile?.businessName || "Dunlap Excavating"}
                </h1>
                <p className="text-sm text-gray-600">Professional Excavation Services</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Address:</strong> {businessProfile?.address || "11222 N Tuscany Ridge Ct"}</p>
              <p><strong>Phone:</strong> {businessProfile?.phone || "(309) 555-0123"}</p>
              <p><strong>Email:</strong> {businessProfile?.email || "mike@dunlapexcavating.com"}</p>
              <p><strong>License:</strong> #EX-2024-001</p>
            </div>
          </div>
          
          {/* Estimate details */}
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">DETAILED ESTIMATE</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Estimate #:</strong> {estimate.estimateNumber || `EST-${estimate.id}`}</p>
              <p><strong>Date Prepared:</strong> {format(new Date(estimate.createdAt), 'MMMM dd, yyyy')}</p>
              <p><strong>Valid Until:</strong> {estimate.validUntil ? format(new Date(estimate.validUntil), 'MMMM dd, yyyy') : 'June 05, 2025'}</p>
              <p><strong>Project Type:</strong> Excavation Services</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed customer information */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 bg-gray-100 p-2 mb-2">CLIENT INFORMATION</h3>
          <div className="text-sm text-gray-900 space-y-1">
            <p><strong>Name:</strong> {customer.firstName} {customer.lastName}</p>
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Phone:</strong> {customer.phone}</p>
            {customer.address && <p><strong>Address:</strong> {customer.address}</p>}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-gray-800 bg-gray-100 p-2 mb-2">PROJECT DETAILS</h3>
          <div className="text-sm text-gray-900 space-y-1">
            <p><strong>Project Title:</strong> {estimate.title || "Excavation Project"}</p>
            <p><strong>Estimated Duration:</strong> 3-5 Business Days</p>
            <p><strong>Weather Dependent:</strong> Yes</p>
            <p><strong>Permit Required:</strong> To be determined</p>
          </div>
        </div>
      </div>

      {/* Detailed content sections */}
      <div className="space-y-6">
        {estimate.description && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 bg-gray-100 p-2 mb-3">SCOPE OF WORK</h3>
            <p className="text-gray-700 leading-relaxed text-sm pl-2">{estimate.description}</p>
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 bg-gray-100 p-2 mb-3">TERMS & CONDITIONS</h3>
          <div className="text-xs text-gray-600 space-y-1 pl-2">
            <p>• Payment due within 30 days of project completion</p>
            <p>• Weather delays may affect project timeline</p>
            <p>• Client responsible for marking utilities</p>
            <p>• Additional charges may apply for unforeseen conditions</p>
          </div>
        </div>
      </div>
    </div>
  );
}