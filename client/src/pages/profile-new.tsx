import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertBusinessProfileSchema, type BusinessProfile } from "@shared/schema";
import Header from "@/components/header";
import { Building2, Mail, Phone, MapPin, FileText, Settings, Shield, Award, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Fetch business profile
  const { data: profile, isLoading } = useQuery<BusinessProfile>({
    queryKey: ["/api/business-profile"],
  });

  // Form setup
  const form = useForm({
    resolver: zodResolver(insertBusinessProfileSchema),
    defaultValues: {
      businessName: profile?.businessName || "",
      ownerName: profile?.ownerName || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      city: profile?.city || "",
      state: profile?.state || "",
      zipCode: profile?.zipCode || "",
      website: profile?.website || "",
      businessType: profile?.businessType || "",
      licenseNumbers: profile?.licenseNumbers || "",
      bondedInsured: profile?.bondedInsured || false,
      bondedInsuredDescription: profile?.bondedInsuredDescription || "",
      certifications: profile?.certifications || "",
      yearFounded: profile?.yearFounded || undefined,
      businessStructure: profile?.businessStructure || "",
      preferredEstimateStyle: profile?.preferredEstimateStyle || "flat_project_price",
      serviceArea: profile?.serviceArea || "",
      companyTagline: profile?.companyTagline || "",
      companyBio: profile?.companyBio || "",
      legalFooterText: profile?.legalFooterText || "",
      termsConditions: profile?.termsConditions || "",
      defaultSignatureName: profile?.defaultSignatureName || "",
      licenseNumber: profile?.licenseNumber || "",
      insuranceInfo: profile?.insuranceInfo || "",
      description: profile?.description || "",
      terms: profile?.terms || "",
    },
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      if (profile?.id) {
        return apiRequest("PUT", `/api/business-profile`, data);
      } else {
        return apiRequest("POST", "/api/business-profile", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-profile"] });
      setIsEditing(false);
      toast({ 
        title: "Success", 
        description: profile ? "Business profile updated successfully" : "Business profile created successfully" 
      });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to save business profile", 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: any) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    updateMutation.mutate(data);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Reset form when profile data loads
  useState(() => {
    if (profile) {
      form.reset({
        businessName: profile.businessName || "",
        ownerName: profile.ownerName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        zipCode: profile.zipCode || "",
        website: profile.website || "",
        businessType: profile.businessType || "",
        licenseNumbers: profile.licenseNumbers || "",
        bondedInsured: profile.bondedInsured || false,
        bondedInsuredDescription: profile.bondedInsuredDescription || "",
        certifications: profile.certifications || "",
        yearFounded: profile.yearFounded || undefined,
        businessStructure: profile.businessStructure || "",
        preferredEstimateStyle: profile.preferredEstimateStyle || "flat_project_price",
        serviceArea: profile.serviceArea || "",
        companyTagline: profile.companyTagline || "",
        companyBio: profile.companyBio || "",
        legalFooterText: profile.legalFooterText || "",
        termsConditions: profile.termsConditions || "",
        defaultSignatureName: profile.defaultSignatureName || "",
        licenseNumber: profile.licenseNumber || "",
        insuranceInfo: profile.insuranceInfo || "",
        description: profile.description || "",
        terms: profile.terms || "",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Header title="Business Profile" subtitle="Manage your business information for professional estimates and invoices" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header 
        title="Business Profile" 
        subtitle="Manage your business information for professional estimates and invoices" 
      />

      {/* Profile Header with Key Info and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile?.businessName || "Your Business"}
                </h2>
                <p className="text-gray-600">{profile?.ownerName || "Business Owner"}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  {profile?.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile?.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{formatPhoneNumber(profile.phone)}</span>
                    </div>
                  )}
                  {profile?.city && profile?.state && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.city}, {profile.state}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {profile && (
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    Profile Complete
                  </div>
                  <div className="text-xs text-gray-500">Ready for estimates & invoices</div>
                </div>
              )}
              <Button 
                onClick={() => setIsEditing(true)}
                variant={profile ? "outline" : "default"}
                size="lg"
              >
                <Settings className="h-4 w-4 mr-2" />
                {profile ? "Edit Profile" : "Setup Profile"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <div>
        {isEditing && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="credentials">Trust & Credentials</TabsTrigger>
                  <TabsTrigger value="ai">AI Settings</TabsTrigger>
                  <TabsTrigger value="legal">Legal & Defaults</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Basic Company Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Business Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ownerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Owner/Manager Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Business Owner Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="business@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address *</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main Street" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City *</FormLabel>
                              <FormControl>
                                <Input placeholder="City" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State *</FormLabel>
                              <FormControl>
                                <Input placeholder="ST" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code *</FormLabel>
                              <FormControl>
                                <Input placeholder="12345" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://www.yourbusiness.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="businessType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Type</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Excavating, Landscaping, Construction" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="credentials" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Trust & Credentials
                      </CardTitle>
                      <p className="text-sm text-gray-600">Build customer trust with your professional credentials</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="licenseNumbers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Numbers</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., IL123456, EPA789012" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center space-x-2">
                        <FormField
                          control={form.control}
                          name="bondedInsured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Bonded & Insured
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="bondedInsuredDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Details</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your insurance coverage..."
                                rows={2}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="certifications"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Certifications</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., EPA Certified, ISA Arborist, OSHA 30" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="yearFounded"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year Founded</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g., 1995" 
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="businessStructure"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Structure</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select structure" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                                  <SelectItem value="llc">LLC</SelectItem>
                                  <SelectItem value="corporation">Corporation</SelectItem>
                                  <SelectItem value="partnership">Partnership</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ai" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        AI Personalization Settings
                      </CardTitle>
                      <p className="text-sm text-gray-600">Help our AI understand your business to generate better estimates and content</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="preferredEstimateStyle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Estimate Style</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select estimate style" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="flat_project_price">Flat Project Price</SelectItem>
                                <SelectItem value="line_items">Detailed Line Items</SelectItem>
                                <SelectItem value="grouped_by_category">Grouped by Category</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="serviceArea"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Area</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Greater Chicago Area, within 50 miles of Peoria, IL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="companyTagline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Tagline</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Quality work, fair prices, on time delivery" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="companyBio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about your business, experience, and what makes you unique..."
                                rows={4}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="legal" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Legal & Default Settings
                      </CardTitle>
                      <p className="text-sm text-gray-600">Default text used across estimates, invoices, and contracts</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="legalFooterText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Legal Footer Text</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Standard legal disclaimer that appears on estimates and invoices..."
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="termsConditions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Terms & Conditions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Your standard terms and conditions for projects..."
                                rows={4}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="defaultSignatureName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Signature Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Name for digital signatures on estimates" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {!isEditing && profile && (
          <div className="space-y-6">
            {/* Basic Information Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Basic Information
                  </span>
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Name</label>
                    <p className="text-gray-900">{profile.businessName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Owner/Manager</label>
                    <p className="text-gray-900">{profile.ownerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{formatPhoneNumber(profile.phone)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">
                      {profile.address}<br />
                      {profile.city}, {profile.state} {profile.zipCode}
                    </p>
                  </div>
                  {profile.website && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Website</label>
                      <p className="text-gray-900">{profile.website}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Type</label>
                    <p className="text-gray-900 capitalize">{profile.businessType || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust & Credentials Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Trust & Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.licenseNumbers && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">License Numbers</label>
                      <p className="text-gray-900">{profile.licenseNumbers}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bonded & Insured</label>
                    <p className="text-gray-900">{profile.bondedInsured ? 'Yes' : 'No'}</p>
                  </div>
                  {profile.certifications && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Certifications</label>
                      <p className="text-gray-900">{profile.certifications}</p>
                    </div>
                  )}
                  {profile.yearFounded && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Year Founded</label>
                      <p className="text-gray-900">{profile.yearFounded}</p>
                    </div>
                  )}
                  {profile.businessStructure && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Business Structure</label>
                      <p className="text-gray-900 capitalize">{profile.businessStructure.replace('_', ' ')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Personalization Display */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  AI Personalization Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Preferred Estimate Style</label>
                    <p className="text-gray-900 capitalize">{profile.preferredEstimateStyle?.replace('_', ' ') || 'Flat Project Price'}</p>
                  </div>
                  {profile.serviceArea && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Service Area</label>
                      <p className="text-gray-900">{profile.serviceArea}</p>
                    </div>
                  )}
                  {profile.companyTagline && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Company Tagline</label>
                      <p className="text-gray-900">{profile.companyTagline}</p>
                    </div>
                  )}
                  {profile.companyBio && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Company Bio</label>
                      <p className="text-gray-900">{profile.companyBio}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Legal & Defaults Display */}
            {(profile.legalFooterText || profile.termsConditions || profile.defaultSignatureName) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Legal & Default Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.defaultSignatureName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Default Signature Name</label>
                      <p className="text-gray-900">{profile.defaultSignatureName}</p>
                    </div>
                  )}
                  {profile.legalFooterText && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Legal Footer Text</label>
                      <p className="text-gray-900 text-sm">{profile.legalFooterText}</p>
                    </div>
                  )}
                  {profile.termsConditions && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Terms & Conditions</label>
                      <p className="text-gray-900 text-sm">{profile.termsConditions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}