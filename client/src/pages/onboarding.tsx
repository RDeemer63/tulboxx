import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  useOnboarding,
  useOnboardingStatus,
  useOnboardingNudges,
  useIsOnboardingStepComplete,
  OnboardingStep,
} from "@/hooks/use-onboarding";
import { onboardingSteps } from "@/lib/onboarding/store";
import {
  insertBusinessProfileSchema,
  type BusinessProfile,
} from "@/shared/business-profile-schema";
import { apiRequestJson, queryKeys } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Blue Steel UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/ui/stat-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

// Icons
import { CheckCircle2, Building, Palette, ShieldCheck, Wand2, ArrowRight, Loader2, UploadCloud } from "lucide-react";

// --- Zod Schemas for each step ---
const companyInfoSchema = insertBusinessProfileSchema.pick({
  businessName: true,
  email: true,
  phone: true,
  address: true,
});

const brandingSchema = insertBusinessProfileSchema.pick({
  logoUrl: true,
  primaryColor: true,
});

const legalSchema = insertBusinessProfileSchema.pick({
  defaultEstimateTerms: true,
});

const aiPrefsSchema = insertBusinessProfileSchema.pick({
  brandVoice: true,
  aiEstimateGeneration: true,
});

type OnboardingFormValues = z.infer<typeof insertBusinessProfileSchema>;

const stepMetadata: Record<OnboardingStep, { label: string; icon: React.ElementType }> = {
  companyInfo: { label: "Company Info", icon: Building },
  branding: { label: "Branding", icon: Palette },
  legal: { label: "Legal & Terms", icon: ShieldCheck },
  aiPreferences: { label: "AI Preferences", icon: Wand2 },
};

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { progress, isComplete, nextIncompleteStep } = useOnboardingStatus();
  const { activeStep, setActiveStep, setStepComplete, initializeOnboarding } = useOnboarding();
  const [nudge] = useOnboardingNudges(1);

  // --- Data Fetching & Mutations ---
  const { data: profile, isLoading: isLoadingProfile } = useQuery<BusinessProfile>({
    queryKey: ["business-profile", "me"],
    queryFn: () => apiRequestJson("/api/business-profile/me"),
    retry: false, // Don't retry on 404
  });

  const saveProfileMutation = useMutation({
    mutationFn: (data: Partial<OnboardingFormValues>) => {
      if (profile?.id) {
        return apiRequestJson<BusinessProfile>("PUT", "/api/business-profile", data);
      }
      // Create a full object for the initial POST
      const createData = { ...form.getValues(), ...data };
      return apiRequestJson<BusinessProfile>("POST", "/api/business-profile", createData);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["business-profile", "me"], data);
      toast.success({ title: "Profile updated successfully!" });
    },
    onError: (error) => {
      toast.error({ title: "Update failed", description: error.message });
    },
  });

  const logoUploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("logo", file);
      return apiRequestJson<{ logoUrl: string }>("POST", "/api/business-profile/logo-upload", formData, true);
    },
    onSuccess: (data) => {
      form.setValue("logoUrl", data.logoUrl, { shouldDirty: true });
      toast.success({ title: "Logo uploaded successfully!" });
    },
    onError: (error) => {
      toast.error({ title: "Logo upload failed", description: error.message });
    },
  });

  // --- Form Setup ---
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(insertBusinessProfileSchema),
    defaultValues: {
      businessName: "",
      email: "",
      phone: "",
      address: "",
      logoUrl: "",
      primaryColor: "#0070D2",
      defaultEstimateTerms: "",
      brandVoice: "friendly",
      aiEstimateGeneration: true,
    },
  });

  // --- Effects ---
  useEffect(() => {
    if (profile) {
      form.reset(profile);
      initializeOnboarding({
        companyInfo: !!(profile.businessName && profile.email),
        branding: !!profile.logoUrl,
        legal: !!profile.defaultEstimateTerms,
        aiPreferences: !!profile.brandVoice,
      });
    }
  }, [profile, form, initializeOnboarding]);

  // --- Handlers ---
  const handleStepCompletion = async (step: OnboardingStep) => {
    let schema;
    switch (step) {
      case "companyInfo": schema = companyInfoSchema; break;
      case "branding": schema = brandingSchema; break;
      case "legal": schema = legalSchema; break;
      case "aiPreferences": schema = aiPrefsSchema; break;
    }
    
    const result = await form.trigger(Object.keys(schema.shape) as (keyof OnboardingFormValues)[]);
    if (!result) {
      toast.error({ title: "Validation Error", description: "Please fix the errors before continuing." });
      return;
    }

    await saveProfileMutation.mutateAsync(form.getValues());
    setStepComplete(step, true);

    if (nextIncompleteStep) {
      setActiveStep(nextIncompleteStep);
    } else if (isComplete) {
      navigate("/dashboard");
    }
  };

  const handleFinish = () => {
    if (isComplete) {
      navigate("/dashboard");
    } else {
      toast.info({ title: "Almost there!", description: "Please complete all steps to continue." });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      logoUploadMutation.mutate(file);
    }
  };

  if (isLoadingProfile) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <FormProvider {...form}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Welcome to Tulboxx!</h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Let's get your business set up to start winning jobs.</p>
          </header>

          <div className="mb-8">
            <StatCard
              label="Setup Progress"
              value={`${progress}%`}
              subValue={nudge ? nudge.message : "You're almost there!"}
              icon={<CheckCircle2 />}
              size="lg"
              className="bg-white dark:bg-slate-800/50"
            />
          </div>

          <Card className="overflow-hidden shadow-lg">
            <Tabs
              value={activeStep || ""}
              onValueChange={(value) => setActiveStep(value as OnboardingStep)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 rounded-none border-b bg-slate-100 dark:bg-slate-800">
                {onboardingSteps.map((step) => <OnboardingTabTrigger key={step} step={step} />)}
              </TabsList>

              <TabsContent value="companyInfo" className="p-6">
                <OnboardingStepContent
                  title="Company Information"
                  description="This info will appear on your estimates, invoices, and other documents."
                  onContinue={() => handleStepCompletion("companyInfo")}
                  isLoading={saveProfileMutation.isPending}
                >
                  <div className="space-y-4">
                    <FormField name="businessName" render={({ field }) => (
                      <FormItem><FormLabel>Business Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Deemer's Excavation LLC" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField name="email" render={({ field }) => (
                        <FormItem><FormLabel>Public Email</FormLabel><FormControl><Input {...field} type="email" placeholder="contact@yourbusiness.com" /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField name="phone" render={({ field }) => (
                        <FormItem><FormLabel>Public Phone</FormLabel><FormControl><Input {...field} type="tel" placeholder="(555) 123-4567" /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField name="address" render={({ field }) => (
                      <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea {...field} placeholder="123 Main St, Anytown, USA 12345" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </OnboardingStepContent>
              </TabsContent>

              <TabsContent value="branding" className="p-6">
                <OnboardingStepContent
                  title="Business Branding"
                  description="Upload your logo and choose your brand colors to personalize your documents."
                  onContinue={() => handleStepCompletion("branding")}
                  isLoading={saveProfileMutation.isPending || logoUploadMutation.isPending}
                >
                  <div className="space-y-4">
                    <FormField name="logoUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Logo</FormLabel>
                        <FormControl>
                          <div className="mt-1 flex items-center gap-4">
                            {field.value ? (
                              <img src={field.value} alt="Logo preview" className="h-16 w-16 rounded-md object-cover border" />
                            ) : (
                              <div className="h-16 w-16 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                <Building className="h-8 w-8 text-slate-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <Input id="logo-upload" type="file" accept="image/png, image/jpeg" onChange={handleFileChange} className="hidden" />
                              <Button type="button" variant="outline" onClick={() => document.getElementById('logo-upload')?.click()} disabled={logoUploadMutation.isPending}>
                                {logoUploadMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                Upload Logo
                              </Button>
                              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB.</p>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="primaryColor" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Color</FormLabel>
                        <div className="flex items-center gap-2 mt-1">
                          <Input type="color" {...field} className="w-12 h-12 p-1" />
                          <FormControl><Input {...field} placeholder="#0070D2" /></FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </OnboardingStepContent>
              </TabsContent>

              <TabsContent value="legal" className="p-6">
                <OnboardingStepContent
                  title="Legal & Default Terms"
                  description="Set your default terms and conditions that will appear on estimates and invoices."
                  onContinue={() => handleStepCompletion("legal")}
                  isLoading={saveProfileMutation.isPending}
                >
                  <FormField name="defaultEstimateTerms" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Terms & Conditions</FormLabel>
                      <FormControl><Textarea {...field} placeholder="e.g., Payment is due upon receipt. A 50% deposit is required to schedule work..." rows={8} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </OnboardingStepContent>
              </TabsContent>

              <TabsContent value="aiPreferences" className="p-6">
                <OnboardingStepContent
                  title="AI Assistant Preferences"
                  description="Help our AI understand your business to generate better content for you."
                  onContinue={() => handleStepCompletion("aiPreferences")}
                  isFinalStep={!nextIncompleteStep}
                  onFinish={handleFinish}
                  isLoading={saveProfileMutation.isPending}
                >
                  <div className="space-y-4">
                    <FormField name="brandVoice" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Communication Tone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="professional">Professional & Formal</SelectItem>
                            <SelectItem value="friendly">Friendly & Approachable</SelectItem>
                            <SelectItem value="technical">Technical & Detailed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="aiEstimateGeneration" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Enable AI for estimate descriptions</FormLabel>
                          <p className="text-sm text-muted-foreground">Allow AI to help write and polish line items.</p>
                        </div>
                      </FormItem>
                    )} />
                  </div>
                </OnboardingStepContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </FormProvider>
  );
}

const OnboardingTabTrigger: React.FC<{ step: OnboardingStep }> = ({ step }) => {
  const isComplete = useIsOnboardingStepComplete(step);
  const { label, icon: Icon } = stepMetadata[step];
  return (
    <TabsTrigger value={step} className="flex flex-col sm:flex-row items-center gap-2 h-auto p-3 sm:p-4 text-xs sm:text-sm">
      <div className="flex items-center">
        <Icon className="h-5 w-5 mr-2" />
        <span>{label}</span>
      </div>
      {isComplete && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />}
    </TabsTrigger>
  );
};

const OnboardingStepContent: React.FC<{
  title: string;
  description: string;
  onContinue: () => void;
  isLoading: boolean;
  isFinalStep?: boolean;
  onFinish?: () => void;
  children: React.ReactNode;
}> = ({ title, description, onContinue, isLoading, isFinalStep = false, onFinish, children }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-0 py-6">{children}</CardContent>
      <div className="flex justify-end mt-6">
        {isFinalStep ? (
          <Button size="lg" onClick={onFinish} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Finish & Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button size="lg" onClick={onContinue} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save & Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
