import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatPhoneNumber } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Lead } from './LeadCard'; // Re-using the Lead type from LeadCard
import { useLeadsApi } from '@/lib/api/leads'; // Assuming this hook exists for API calls
import { useQuery } from '@tanstack/react-query';
import { useEmployeesApi } from '@/lib/api/employees'; // Assuming this hook exists for employees

// Zod schema for form validation
const leadFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(7, 'Valid phone number is required').transform(formatPhoneNumber),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  serviceType: z.string().optional().or(z.literal('')),
  source: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  stage: z.enum(['new', 'contacted', 'estimate_sent', 'won', 'lost']).default('new'),
  followUpDate: z.date().optional().nullable(),
  assignedTo: z.string().uuid().optional().nullable(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

interface LeadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Lead | null; // For edit mode
  onSuccess?: () => void;
}

const serviceTypes = [
  'brush_cutting',
  'fencing',
  'septic',
  'landscaping',
  'tree_removal',
  'excavation',
  'plumbing',
  'electrical',
  'hvac',
  'roofing',
  'general_contracting',
];

const leadSources = [
  'Referral',
  'Facebook',
  'Google',
  'Truck Sign',
  'Website',
  'Yelp',
  'HomeAdvisor',
  'Thumbtack',
  'Existing Customer',
  'Other',
];

const leadStages = [
  'new',
  'contacted',
  'estimate_sent',
  'won',
  'lost',
];

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { createLead, updateLead, findPotentialDuplicates } = useLeadsApi();
  const { getEmployees } = useEmployeesApi(); // Assuming this hook exists

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<Lead[] | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      serviceType: '',
      source: '',
      notes: '',
      stage: 'new',
      followUpDate: null,
      assignedTo: null,
    },
  });

  // Fetch employees for assignment dropdown
  const { data: employees, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });

  // Watch phone and email for duplicate detection
  const watchedPhone = watch('phone');
  const watchedEmail = watch('email');

  useEffect(() => {
    if (initialData) {
      reset({
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        serviceType: initialData.serviceType || '',
        source: initialData.source || '',
        notes: initialData.notes || '',
        stage: initialData.stage || 'new',
        followUpDate: initialData.followUpDate ? new Date(initialData.followUpDate) : null,
        assignedTo: initialData.assignedTo || null,
      });
    } else {
      reset(); // Clear form for new lead
    }
    setDuplicateWarning(null); // Clear warnings on open/reset
  }, [isOpen, initialData, reset]);

  // Duplicate detection effect
  useEffect(() => {
    const checkDuplicates = async () => {
      if ((watchedPhone && watchedPhone.length >= 7) || (watchedEmail && watchedEmail.length > 0)) {
        try {
          const duplicates = await findPotentialDuplicates(watchedPhone, watchedEmail || undefined);
          const otherDuplicates = duplicates.filter(
            (d) => d.id !== initialData?.id // Exclude current lead in edit mode
          );
          setDuplicateWarning(otherDuplicates.length > 0 ? otherDuplicates : null);
        } catch (error) {
          console.error('Error checking duplicates:', error);
          setDuplicateWarning(null);
        }
      } else {
        setDuplicateWarning(null);
      }
    };

    const handler = setTimeout(() => {
      checkDuplicates();
    }, 500); // Debounce duplicate check

    return () => clearTimeout(handler);
  }, [watchedPhone, watchedEmail, initialData?.id, findPotentialDuplicates]);

  const onSubmit = async (values: LeadFormValues) => {
    setIsSubmitting(true);
    try {
      let result;
      if (initialData) {
        // Edit mode
        result = await updateLead(initialData.id, values);
        toast({
          title: 'Lead Updated',
          description: `Lead "${result.lead.fullName}" has been updated.`,
        });
      } else {
        // Create mode
        result = await createLead(values);
        toast({
          title: 'Lead Created',
          description: `Lead "${result.lead.fullName}" has been created.`,
        });
      }

      if (result.hasDuplicates) {
        toast({
          title: 'Duplicate Warning',
          description: `Potential duplicates found: ${result.duplicates?.map(d => d.fullName).join(', ')}.`,
          variant: 'destructive',
        });
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[90%] md:h-[80%] lg:h-[70%] xl:h-[60%]">
        <DrawerHeader>
          <DrawerTitle>{initialData ? 'Edit Lead' : 'Create New Lead'}</DrawerTitle>
          <DrawerDescription>
            {initialData
              ? 'Make changes to this lead here.'
              : 'Fill in the details to create a new lead.'}
          </DrawerDescription>
        </DrawerHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" {...register('fullName')} />
              {errors.fullName && (
                <p className="text-red-500 text-sm">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register('phone')} />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type</Label>
              <Select
                onValueChange={(value) => setValue('serviceType', value)}
                value={watch('serviceType') || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.serviceType && (
                <p className="text-red-500 text-sm">{errors.serviceType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Lead Source</Label>
              <Select
                onValueChange={(value) => setValue('source', value)}
                value={watch('source') || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a source" />
                </SelectTrigger>
                <SelectContent>
                  {leadSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.source && <p className="text-red-500 text-sm">{errors.source.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Select
                onValueChange={(value) => setValue('stage', value as 'new' | 'contacted' | 'estimate_sent' | 'won' | 'lost')}
                value={watch('stage')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {leadStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.stage && <p className="text-red-500 text-sm">{errors.stage.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Select
                onValueChange={(value) => setValue('assignedTo', value)}
                value={watch('assignedTo') || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign to employee" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingEmployees ? (
                    <SelectItem value="loading" disabled>
                      Loading employees...
                    </SelectItem>
                  ) : (
                    employees?.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))
                  )}
                  <SelectItem value={null as any}>Unassigned</SelectItem>
                </SelectContent>
              </Select>
              {errors.assignedTo && (
                <p className="text-red-500 text-sm">{errors.assignedTo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !watch('followUpDate') && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch('followUpDate') ? (
                      format(watch('followUpDate') as Date, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watch('followUpDate') || undefined}
                    onSelect={(date) => setValue('followUpDate', date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.followUpDate && (
                <p className="text-red-500 text-sm">{errors.followUpDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register('notes')} rows={4} />
            {errors.notes && <p className="text-red-500 text-sm">{errors.notes.message}</p>}
          </div>

          {duplicateWarning && duplicateWarning.length > 0 && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
              <p className="font-bold">Potential Duplicates Found!</p>
              <p>
                Leads with similar phone/email: {duplicateWarning.map((d) => d.fullName).join(', ')}.
                Please review before saving.
              </p>
            </div>
          )}

          <DrawerFooter className="flex-row justify-end p-0">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Update Lead' : 'Create Lead'}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default LeadDrawer;
