import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  Phone,
  MessageSquareText,
  FileText,
  MapPin,
  User,
  Tag,
  Calendar,
  Clock,
  Plus,
  X,
  Edit,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { useLeads } from "@/contexts/leads-context";
import {
  type Lead,
  type LeadEvent,
  insertLeadEventSchema,
  leadStageEnum,
} from "../../../shared/leads-schema";
import { cn, formatCurrency } from "@/lib/utils";
import { LeadTimelineEntry } from "./timeline/lead-timeline-entry";

// Import Blue Steel UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// --- Form Schema for Timeline Entry ---
const timelineEntrySchema = insertLeadEventSchema.omit({ leadId: true });
type TimelineEntryFormValues = z.infer<typeof timelineEntrySchema>;

// --- Main Component ---

export const LeadDetailView: React.FC = () => {
  const {
    selectedLead,
    isLoading,
    isError,
    selectLead,
    // TODO: Add mutation for adding events
  } = useLeads();

  const handleClose = () => {
    selectLead(null);
  };

  // --- Render States ---

  if (isLoading) {
    return <LeadDetailSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Could not load lead details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!selectedLead) {
    return (
      <div className="hidden h-full flex-col items-center justify-center p-4 text-center md:flex">
        <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600" />
        <h3 className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">
          Select a Lead
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Choose a lead from the pipeline to see its details.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col bg-white dark:bg-slate-900">
        <LeadDetailHeader lead={selectedLead} onClose={handleClose} />
        <Separator />
        <div className="flex-1 overflow-hidden">
          <div className="grid h-full grid-cols-1 lg:grid-cols-3">
            {/* Left Column: Details */}
            <ScrollArea className="lg:col-span-1 lg:border-r lg:dark:border-slate-700">
              <div className="space-y-4 p-4">
                <LeadInfoCard lead={selectedLead} />
                <LeadContactCard lead={selectedLead} />
                {selectedLead.address && <LeadLocationCard lead={selectedLead} />}
              </div>
            </ScrollArea>

            {/* Right Column: Timeline */}
            <ScrollArea className="lg:col-span-2">
              <div className="p-4">
                <TimelineAddEntry leadId={selectedLead.id} />
                <div className="mt-6">
                  {selectedLead.events?.length > 0 ? (
                    selectedLead.events.map((event, index) => (
                      <LeadTimelineEntry
                        key={event.id}
                        event={event}
                        isFirst={index === 0}
                      />
                    ))
                  ) : (
                    <div className="text-center text-sm text-slate-500 py-8">
                      No activity yet.
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

// --- Sub-Components ---

const LeadDetailHeader: React.FC<{ lead: Lead; onClose: () => void }> = ({
  lead,
  onClose,
}) => {
  const [, navigate] = useLocation();

  const handleCreateEstimate = () => {
    // Pass lead data to estimate creation route
    navigate("/estimates/new", {
      state: {
        leadId: lead.id,
        leadName: lead.leadName,
        contactInfo: { phone: lead.phone, email: lead.email },
        serviceType: lead.serviceType,
        source: lead.source,
        notes: lead.notes,
        businessProfileId: lead.businessProfileId,
      },
    });
  };

  return (
    <header className="flex-shrink-0 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">{lead.leadName}</h2>
          <Badge variant="secondary">{lead.stage}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => (window.location.href = `tel:${lead.phone}`)}>
          <Phone className="mr-2 h-4 w-4" /> Call
        </Button>
        <Button size="sm" variant="outline" onClick={() => (window.location.href = `sms:${lead.phone}`)}>
          <MessageSquareText className="mr-2 h-4 w-4" /> Text
        </Button>
        <Button size="sm" variant="outline" onClick={handleCreateEstimate}>
          <FileText className="mr-2 h-4 w-4" /> Create Estimate
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
            </DialogHeader>
            {/* TODO: Implement Edit Lead Form */}
            <p>Edit lead form will go here.</p>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};

const LeadInfoCard: React.FC<{ lead: Lead }> = ({ lead }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Lead Details</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-slate-500">Stage</span>
        <span className="font-medium">{lead.stage}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-500">Source</span>
        <span className="font-medium">{lead.source}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-500">Service Type</span>
        <span className="font-medium">{lead.serviceType || "N/A"}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-500">Assigned To</span>
        <span className="font-medium">{lead.assignedTo || "Unassigned"}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-500">Last Updated</span>
        <span className="font-medium">
          {formatDistanceToNowStrict(new Date(lead.updatedAt), {
            addSuffix: true,
          })}
        </span>
      </div>
    </CardContent>
  </Card>
);

const LeadContactCard: React.FC<{ lead: Lead }> = ({ lead }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Contact Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 text-sm">
      <div className="flex items-center">
        <Phone className="mr-3 h-4 w-4 text-slate-400" />
        <span className="font-medium">{lead.phone || "No phone number"}</span>
      </div>
      <div className="flex items-center">
        <MessageSquareText className="mr-3 h-4 w-4 text-slate-400" />
        <span className="font-medium">{lead.email || "No email"}</span>
      </div>
    </CardContent>
  </Card>
);

const LeadLocationCard: React.FC<{ lead: Lead }> = ({ lead }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Location</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm mb-2">{lead.address}</p>
      {/* Placeholder for static map image */}
      <div className="aspect-video w-full rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
        <MapPin className="h-8 w-8 text-slate-400" />
        <span className="ml-2 text-slate-500">Map Preview</span>
      </div>
    </CardContent>
  </Card>
);

const TimelineAddEntry: React.FC<{ leadId: string }> = ({ leadId }) => {
  const form = useForm<TimelineEntryFormValues>({
    resolver: zodResolver(timelineEntrySchema),
    defaultValues: {
      type: "note",
      content: "",
      meta: {},
    },
  });

  const handleSubmit = (data: TimelineEntryFormValues) => {
    console.log("Submitting timeline entry:", data);
    // TODO: Call mutation from useLeads context
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Tabs defaultValue="note" className="w-full">
          <TabsList>
            <TabsTrigger value="note">Note</TabsTrigger>
            <TabsTrigger value="call_log">Call</TabsTrigger>
            <TabsTrigger value="meeting_log">Meeting</TabsTrigger>
          </TabsList>
          <TabsContent value="note" className="mt-0">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Add a note about this lead..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          {/* Add content for other tabs if needed */}
        </Tabs>
        <div className="mt-2 flex justify-end">
          <Button type="submit" size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add to Timeline
          </Button>
        </div>
      </form>
    </Form>
  );
};

const LeadDetailSkeleton: React.FC = () => (
  <div className="p-4 space-y-4">
    <Skeleton className="h-10 w-3/4" />
    <Skeleton className="h-8 w-1/2" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  </div>
);

export default LeadDetailView;
