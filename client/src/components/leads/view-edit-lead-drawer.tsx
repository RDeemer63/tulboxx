import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  Edit2,
  MessageSquare,
  CalendarClock,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Info,
  Star,
  Tag,
  History,
  PlusCircle,
  CheckCircle, // Added missing import
} from 'lucide-react';

import { type Contact, insertContactSchema as baseInsertContactSchema, type ContactActivity, type InsertContactActivity } from '@shared/schema';
import { apiRequestJson, invalidateQueries, queryKeys } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Schema for editing lead details
const editLeadFormSchema = baseInsertContactSchema.omit({
  // Fields that are being redefined in the .extend() part
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  secondaryPhone: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  leadScore: true,
  tags: true,
  propertyType: true,
  preferredContactMethod: true,
  leadSource: true,
  notes: true,
  
  // Fields not typically edited directly in this detail view or handled by API
  status: true,
  createdAt: true,
  convertedAt: true,
  lastContactDate: true,
  nextFollowUpDate: true,
}).extend({
  id: z.number(), // Required for editing
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  secondaryPhone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  state: z.string().optional().or(z.literal('')),
  zipCode: z.string().optional().or(z.literal('')),
  propertyType: z.enum(['residential', 'commercial']).default('residential'),
  preferredContactMethod: z.enum(['phone', 'email', 'text']).default('phone'),
  leadSource: z.enum(['website', 'referral', 'cold_call', 'advertisement', 'social_media', 'event', 'word_of_mouth', 'repeat_customer', 'other']).optional().nullable(),
  notes: z.string().optional().nullable(),
  leadScore: z.number().min(0).max(5).optional().nullable(),
  tags: z.string().optional().nullable(), // Assuming tags are stored as a comma-separated string for simplicity here
});

type EditLeadFormValues = z.infer<typeof editLeadFormSchema>;

// Schema for adding a new activity/note
const addActivityFormSchema = z.object({
  content: z.string().min(1, "Note content cannot be empty"),
  activityType: z.enum(["note", "call", "email", "meeting", "follow_up"]).default("note"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"), // Added missing priority field
});
type AddActivityFormValues = z.infer<typeof addActivityFormSchema>;


// Constants for select options (can be moved to a shared location)
const PROPERTY_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
];
const PREFERRED_CONTACT_METHODS = [
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'text', label: 'Text Message' },
];
const LEAD_SOURCES_OPTIONS = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'advertisement', label: 'Advertisement' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'event', label: 'Event/Trade Show' },
  { value: 'word_of_mouth', label: 'Word of Mouth' },
  { value: 'repeat_customer', label: 'Repeat Customer' },
  { value: 'other', label: 'Other' },
];
const LEAD_STATUS_OPTIONS = [ // For display, actual status change via "Convert"
  { value: 'lead', label: 'Lead' },
  { value: 'customer', label: 'Customer' },
  { value: 'past_customer', label: 'Past Customer' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'subcontractor', label: 'Subcontractor' },
];


interface ViewEditLeadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: number | null;
}

const ViewEditLeadDrawer: React.FC<ViewEditLeadDrawerProps> = ({ isOpen, onClose, leadId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("details");
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const { data: lead, isLoading: isLoadingLead, error: leadError } = useQuery<Contact, Error>({
    queryKey: ['contacts', leadId],
    queryFn: () => apiRequestJson<Contact>('GET', `/api/contacts/${leadId}`),
    enabled: !!leadId && isOpen, // Only fetch if leadId is present and drawer is open
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: activities, isLoading: isLoadingActivities } = useQuery<ContactActivity[], Error>({
    queryKey: ['contactActivities', leadId],
    queryFn: () => apiRequestJson<ContactActivity[]>('GET', `/api/contacts/${leadId}/activities`),
    enabled: !!leadId && isOpen,
  });
  
  const editLeadForm = useForm<EditLeadFormValues>({
    resolver: zodResolver(editLeadFormSchema),
  });

  const addActivityForm = useForm<AddActivityFormValues>({
    resolver: zodResolver(addActivityFormSchema),
    defaultValues: { content: "", activityType: "note", priority: "medium" }, // Added default priority
  });

  useEffect(() => {
    if (lead && isOpen) {
      editLeadForm.reset({
        id: lead.id,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email || '',
        phone: lead.phone || '',
        secondaryPhone: lead.secondaryPhone || '',
        address: lead.address || '',
        city: lead.city || '',
        state: lead.state || '',
        zipCode: lead.zipCode || '',
        propertyType: lead.propertyType || 'residential',
        preferredContactMethod: lead.preferredContactMethod || 'phone',
        leadSource: lead.leadSource || undefined,
        notes: lead.notes || '', // General notes for the lead
        leadScore: lead.leadScore || null,
        tags: lead.tags || null, // Assuming tags are string for now
      });
      setIsEditingDetails(false); // Reset editing state when lead data changes
    }
  }, [lead, isOpen, editLeadForm]);

  const updateLeadMutation = useMutation({
    mutationFn: async (data: EditLeadFormValues) =>
      apiRequestJson<Contact>('PATCH', `/api/contacts/${data.id}`, data),
    onSuccess: (updatedLead) => {
      toast({ title: 'Success', description: 'Lead details updated.' });
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts }); // Invalidate all contacts
      queryClient.invalidateQueries({ queryKey: ['contacts', updatedLead.id] }); // Invalidate specific contact
      queryClient.invalidateQueries({ queryKey: queryKeys.leads }); // Invalidate leads list
      setIsEditingDetails(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to update lead: ${error.message}`, variant: 'destructive' });
    },
  });

  const addActivityMutation = useMutation({
    mutationFn: async (data: InsertContactActivity) =>
      apiRequestJson<ContactActivity>('POST', `/api/contacts/${leadId}/activities`, data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Activity logged.' });
      queryClient.invalidateQueries({ queryKey: ['contactActivities', leadId] });
      addActivityForm.reset();
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to log activity: ${error.message}`, variant: 'destructive' });
    },
  });

  const handleDetailsSubmit = (values: EditLeadFormValues) => {
    updateLeadMutation.mutate(values);
  };

  const handleAddActivitySubmit = (values: AddActivityFormValues) => {
    if (!leadId) return;
    const payload: InsertContactActivity = {
      contactId: leadId,
      content: values.content,
      activityType: values.activityType,
      priority: values.priority, // Added missing priority field
      // createdBy would be set by backend based on logged-in user
    };
    addActivityMutation.mutate(payload);
  };

  const handleClose = () => {
    editLeadForm.reset();
    addActivityForm.reset();
    setIsEditingDetails(false);
    onClose();
  };

  if (!isOpen || !leadId) return null;

  if (isLoadingLead) {
    return (
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full p-0">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (leadError) {
    return (
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full">
          <SheetHeader>
            <SheetTitle>Error</SheetTitle>
          </SheetHeader>
          <div className="p-6 text-red-600">
            Failed to load lead details: {leadError.message}
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  
  if (!lead) {
     return ( // Should not happen if leadId is present and no error, but good fallback
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full">
          <SheetHeader><SheetTitle>Lead Not Found</SheetTitle></SheetHeader>
          <div className="p-6">The requested lead could not be found.</div>
        </SheetContent>
      </Sheet>
    );
  }

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'N/A';
  };
  
  const leadStatusDisplay = LEAD_STATUS_OPTIONS.find(opt => opt.value === lead.status)?.label || lead.status;

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full p-0 flex flex-col">
        <SheetHeader className="p-6 border-b dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              {/* <AvatarImage src={lead.profileImageUrl || undefined} alt={`${lead.firstName} ${lead.lastName}`} /> */}
              <AvatarFallback className="text-2xl bg-orange-500 text-white">
                {getInitials(lead.firstName, lead.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-2xl">{lead.firstName} {lead.lastName}</SheetTitle>
              <SheetDescription className="flex items-center space-x-2">
                <Badge 
                  variant="default"
                  className={cn(
                    lead.status === 'customer' 
                      ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                  )}
                >
                  {leadStatusDisplay}
                </Badge>
                <span>ID: {lead.id}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 sticky top-0 bg-white dark:bg-slate-900 z-10 px-6 pt-4 border-b dark:border-slate-700">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activity">Activity & Notes</TabsTrigger>
            {/* <TabsTrigger value="history">Contact History</TabsTrigger> */}
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="details" className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Lead Information</h3>
                {!isEditingDetails && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingDetails(true)}>
                    <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                  </Button>
                )}
              </div>
              {isEditingDetails ? (
                <Form {...editLeadForm}>
                  <form onSubmit={editLeadForm.handleSubmit(handleDetailsSubmit)} className="space-y-4">
                    {/* Form fields for editing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={editLeadForm.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={editLeadForm.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={editLeadForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={editLeadForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Primary Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={editLeadForm.control} name="secondaryPhone" render={({ field }) => (<FormItem><FormLabel>Secondary Phone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={editLeadForm.control} name="address" render={({ field }) => (<FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField control={editLeadForm.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={editLeadForm.control} name="state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={editLeadForm.control} name="zipCode" render={({ field }) => (<FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={editLeadForm.control} name="propertyType" render={({ field }) => (<FormItem><FormLabel>Property Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{PROPERTY_TYPES.map(pt=><SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={editLeadForm.control} name="preferredContactMethod" render={({ field }) => (<FormItem><FormLabel>Preferred Contact</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{PREFERRED_CONTACT_METHODS.map(pcm=><SelectItem key={pcm.value} value={pcm.value}>{pcm.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={editLeadForm.control} name="leadSource" render={({ field }) => (<FormItem><FormLabel>Lead Source</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value || ""}><FormControl><SelectTrigger><SelectValue placeholder="Select lead source" /></SelectTrigger></FormControl><SelectContent><SelectItem value=""><em>None</em></SelectItem>{LEAD_SOURCES_OPTIONS.map(ls=><SelectItem key={ls.value} value={ls.value}>{ls.label}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={editLeadForm.control} name="leadScore" render={({ field }) => (<FormItem><FormLabel>Lead Score (1-5)</FormLabel><FormControl><Input type="number" min="0" max="5" {...field} onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={editLeadForm.control} name="notes" render={({ field }) => (<FormItem><FormLabel>General Notes</FormLabel><FormControl><Textarea {...field} rows={3}/></FormControl><FormMessage /></FormItem>)} />
                    {/* Tags could be a more complex component later */}
                    <FormField control={editLeadForm.control} name="tags" render={({ field }) => (<FormItem><FormLabel>Tags (comma-separated)</FormLabel><FormControl><Input {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>)} />

                    <div className="flex justify-end space-x-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditingDetails(false)} disabled={updateLeadMutation.isPending}>Cancel</Button>
                      <Button type="submit" disabled={updateLeadMutation.isPending} className="bg-orange-500 hover:bg-orange-600">
                        {updateLeadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-3 text-sm">
                  <InfoItem icon={Mail} label="Email" value={lead.email} />
                  <InfoItem icon={Phone} label="Primary Phone" value={lead.phone} />
                  {lead.secondaryPhone && <InfoItem icon={Phone} label="Secondary Phone" value={lead.secondaryPhone} />}
                  <Separator className="my-3 dark:bg-slate-700" />
                  <InfoItem icon={MapPin} label="Address" value={`${lead.address || ''} ${lead.city || ''} ${lead.state || ''} ${lead.zipCode || ''}`.trim() || 'N/A'} />
                  <InfoItem icon={Building} label="Property Type" value={PROPERTY_TYPES.find(pt=>pt.value === lead.propertyType)?.label || lead.propertyType} />
                  <InfoItem icon={User} label="Preferred Contact" value={PREFERRED_CONTACT_METHODS.find(pcm=>pcm.value === lead.preferredContactMethod)?.label || lead.preferredContactMethod} />
                  <Separator className="my-3 dark:bg-slate-700" />
                  <InfoItem icon={Info} label="Lead Source" value={LEAD_SOURCES_OPTIONS.find(ls=>ls.value === lead.leadSource)?.label || lead.leadSource || 'N/A'} />
                  <InfoItem icon={Star} label="Lead Score" value={lead.leadScore !== null ? `${lead.leadScore}/5` : 'N/A'} />
                  <InfoItem icon={Tag} label="Tags" value={lead.tags || 'N/A'} />
                  <Separator className="my-3 dark:bg-slate-700" />
                  <InfoItem icon={MessageSquare} label="General Notes" value={lead.notes} isLongText />
                  <InfoItem icon={History} label="Created At" value={new Date(lead.createdAt).toLocaleString()} />
                  {lead.convertedAt && <InfoItem icon={CheckCircle} label="Converted At" value={new Date(lead.convertedAt).toLocaleString()} />}
                  {lead.lastContactDate && <InfoItem icon={CalendarClock} label="Last Contact" value={new Date(lead.lastContactDate).toLocaleString()} />}
                  {lead.nextFollowUpDate && <InfoItem icon={CalendarClock} label="Next Follow-up" value={new Date(lead.nextFollowUpDate).toLocaleString()} />}
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="p-6">
              <h3 className="text-lg font-semibold mb-4">Log Activity / Notes</h3>
              <Form {...addActivityForm}>
                <form onSubmit={addActivityForm.handleSubmit(handleAddActivitySubmit)} className="space-y-4 mb-6">
                  <FormField control={addActivityForm.control} name="content" render={({ field }) => (<FormItem><FormLabel>New Note / Activity Log</FormLabel><FormControl><Textarea placeholder="Log a call, email, meeting, or add a note..." {...field} rows={3}/></FormControl><FormMessage /></FormItem>)} />
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2 items-center">
                      <FormField control={addActivityForm.control} name="activityType" render={({ field }) => (
                        <FormItem className="w-40">
                          <FormLabel className="text-xs">Activity Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="note">Note</SelectItem>
                              <SelectItem value="call">Call Log</SelectItem>
                              <SelectItem value="email">Email Log</SelectItem>
                              <SelectItem value="meeting">Meeting Log</SelectItem>
                              <SelectItem value="follow_up">Follow-up Task</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={addActivityForm.control} name="priority" render={({ field }) => (
                        <FormItem className="w-40">
                          <FormLabel className="text-xs">Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <Button type="submit" disabled={addActivityMutation.isPending} className="bg-orange-500 hover:bg-orange-600">
                      {addActivityMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Log Activity
                    </Button>
                  </div>
                </form>
              </Form>
              <Separator className="my-6 dark:bg-slate-700" />
              <h3 className="text-lg font-semibold mb-4">Activity Feed</h3>
              {isLoadingActivities && <Loader2 className="h-6 w-6 animate-spin text-orange-500" />}
              {!isLoadingActivities && (!activities || activities.length === 0) && <p className="text-sm text-slate-500 dark:text-slate-400">No activities logged yet.</p>}
              <div className="space-y-4">
                {activities?.map(activity => (
                  <div key={activity.id} className="p-3 border dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase">{activity.activityType.replace('_', ' ')}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(activity.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{activity.content}</p>
                    {activity.scheduledAt && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Scheduled: {new Date(activity.scheduledAt).toLocaleString()}</p>}
                    {activity.completedAt && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Completed: {new Date(activity.completedAt).toLocaleString()}</p>}
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <SheetFooter className="p-6 border-t dark:border-slate-700">
          <SheetClose asChild>
            <Button variant="outline" onClick={handleClose}>Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// Helper component for displaying info items
const InfoItem: React.FC<{ icon: React.ElementType; label: string; value?: string | number | null; isLongText?: boolean }> = ({ icon: Icon, label, value, isLongText }) => {
  if (!value && value !== 0) return null; // Don't render if value is null, undefined, or empty string (except for 0)
  return (
    <div className="flex items-start">
      <Icon className="h-4 w-4 text-orange-500 mr-3 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        {isLongText ? (
          <p className="text-slate-800 dark:text-slate-100 whitespace-pre-wrap">{value}</p>
        ) : (
          <p className="text-slate-800 dark:text-slate-100">{value}</p>
        )}
      </div>
    </div>
  );
};

export default ViewEditLeadDrawer;
