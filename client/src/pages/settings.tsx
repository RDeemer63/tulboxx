import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon,
  FileText,
  Calculator,
  Receipt,
  User,
  Building,
  CreditCard,
  Mail
} from "lucide-react";

const settingsCategories = [
  {
    id: 'business',
    name: 'Business Profile',
    icon: Building,
    description: 'Company information and branding'
  },
  {
    id: 'estimates',
    name: 'Estimates',
    icon: Calculator,
    description: 'Default terms and templates'
  },
  {
    id: 'invoices',
    name: 'Invoices',
    icon: Receipt,
    description: 'Payment terms and templates'
  },
  {
    id: 'communications',
    name: 'Communications',
    icon: Mail,
    description: 'Email templates and messaging'
  },
  {
    id: 'account',
    name: 'Account',
    icon: User,
    description: 'User preferences and security'
  }
];

export default function Settings() {
  const [activeCategory, setActiveCategory] = useState('business');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: businessProfile, isLoading } = useQuery({
    queryKey: ["/api/business-profile"],
    queryFn: async () => {
      const response = await fetch('/api/business-profile');
      if (!response.ok) return null;
      return response.json();
    }
  });

  const [profileData, setProfileData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: '',
    defaultEstimateTerms: '',
    defaultInvoiceTerms: '',
    defaultEmailSignature: '',
    ...businessProfile
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/business-profile', {
        method: businessProfile ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-profile"] });
      toast({
        title: "Settings Updated",
        description: "Your business settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const renderBusinessSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              value={profileData.businessName}
              onChange={(e) => setProfileData((prev: any) => ({ ...prev, businessName: e.target.value }))}
              placeholder="Your Company Name"
            />
          </div>
          <div>
            <Label htmlFor="ownerName">Owner/Manager Name</Label>
            <Input
              id="ownerName"
              value={profileData.ownerName}
              onChange={(e) => setProfileData((prev: any) => ({ ...prev, ownerName: e.target.value }))}
              placeholder="Your Name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData((prev: any) => ({ ...prev, email: e.target.value }))}
              placeholder="business@example.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={profileData.address}
              onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Main Street"
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={profileData.city}
              onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="City"
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={profileData.state}
              onChange={(e) => setProfileData(prev => ({ ...prev, state: e.target.value }))}
              placeholder="State"
            />
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={profileData.zipCode}
              onChange={(e) => setProfileData(prev => ({ ...prev, zipCode: e.target.value }))}
              placeholder="12345"
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={profileData.website}
              onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="www.yourcompany.com"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderEstimateSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Estimate Terms</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="defaultEstimateTerms">Terms and Conditions</Label>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                These terms will automatically appear in new estimates
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // Add AI polish for estimate terms
                }}
                className="px-2"
                title="Polish with AI"
              >
                ✨
              </Button>
            </div>
            <Textarea
              id="defaultEstimateTerms"
              value={profileData.defaultEstimateTerms}
              onChange={(e) => setProfileData(prev => ({ ...prev, defaultEstimateTerms: e.target.value }))}
              rows={5}
              placeholder="Estimate valid for 30 days. Work to begin upon signed approval and 50% deposit. Materials subject to availability and current pricing..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvoiceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Invoice Terms</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="defaultInvoiceTerms">Payment Terms and Notes</Label>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                These terms will automatically appear in new invoices
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // Add AI polish for invoice terms
                }}
                className="px-2"
                title="Polish with AI"
              >
                ✨
              </Button>
            </div>
            <Textarea
              id="defaultInvoiceTerms"
              value={profileData.defaultInvoiceTerms}
              onChange={(e) => setProfileData(prev => ({ ...prev, defaultInvoiceTerms: e.target.value }))}
              rows={5}
              placeholder="Payment due within 30 days. Late fees may apply after 30 days. Please remit payment to address above or contact us for payment options..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommunicationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Email Templates</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="defaultEmailSignature">Default Email Signature</Label>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                This signature will be added to all emails
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // Add AI polish for email signature
                }}
                className="px-2"
                title="Polish with AI"
              >
                ✨
              </Button>
            </div>
            <Textarea
              id="defaultEmailSignature"
              value={profileData.defaultEmailSignature}
              onChange={(e) => setProfileData(prev => ({ ...prev, defaultEmailSignature: e.target.value }))}
              rows={4}
              placeholder="Best regards,&#10;[Your Name]&#10;[Company Name]&#10;[Phone] | [Email]&#10;[Website]"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Account Preferences</h3>
        <div className="space-y-4">
          <p className="text-gray-600">
            Additional account settings and preferences will be available here.
          </p>
        </div>
      </div>
    </div>
  );

  const renderActiveContent = () => {
    switch (activeCategory) {
      case 'business':
        return renderBusinessSettings();
      case 'estimates':
        return renderEstimateSettings();
      case 'invoices':
        return renderInvoiceSettings();
      case 'communications':
        return renderCommunicationSettings();
      case 'account':
        return renderAccountSettings();
      default:
        return renderBusinessSettings();
    }
  };

  return (
    <>
      <Header 
        title="Settings" 
        subtitle="Configure your business preferences and defaults"
      />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5" />
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {settingsCategories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setActiveCategory(category.id)}
                          className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                            activeCategory === category.id
                              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                              : 'text-gray-700'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-xs text-gray-500">{category.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {settingsCategories.find(cat => cat.id === activeCategory)?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderActiveContent()}
                  
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSave}
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Settings"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}