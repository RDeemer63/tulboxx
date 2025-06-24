import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Send, Loader2, Paperclip, Link as LinkIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { sendEmail } from "@/services/api/emailService";

// =================================================================
// Schema and Types
// =================================================================

const emailEstimateSchema = z.object({
  to: z.string().email("Please enter a valid email address."),
  subject: z.string().min(1, "Subject is required."),
  message: z.string().min(1, "A message is required."),
  attachPdf: z.boolean().default(true),
});

type EmailEstimateFormValues = z.infer<typeof emailEstimateSchema>;

// =================================================================
// Component Props
// =================================================================

interface EmailEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimateId: string;
  estimateNumber: string;
  customerEmail?: string | null;
  businessName?: string;
}

// =================================================================
// Main Component
// =================================================================

export const EmailEstimateModal: React.FC<EmailEstimateModalProps> = ({
  isOpen,
  onClose,
  estimateId,
  estimateNumber,
  customerEmail,
  businessName,
}) => {
  const { toast } = useToast();

  const form = useForm<EmailEstimateFormValues>({
    resolver: zodResolver(emailEstimateSchema),
    defaultValues: {
      to: customerEmail || "",
      subject: `Estimate #${estimateNumber} from ${businessName || "Your Company"}`,
      message: `Hi,\n\nPlease find your estimate attached.\n\nLet us know if you have any questions.\n\nThanks,\n${businessName || ""}`,
      attachPdf: true,
    },
  });

  // --- API Mutation ---
  const sendEmailMutation = useMutation({
    mutationFn: (data: EmailEstimateFormValues) =>
      sendEmail({ ...data, estimateId }), // use central service
    onSuccess: () => {
      toast.success({
        title: "Estimate Sent!",
        description: `Estimate #${estimateNumber} has been successfully emailed.`,
      });
      onClose(); // Close the modal on success
    },
    onError: (error) => {
      const message =
        (error as Error)?.message ||
        "We couldn’t send the email. Please try again or check your connection.";
      toast.error({
        title: "Send Failed",
        description: message,
      });
    },
  });

  // --- Event Handlers ---
  const onSubmit = (values: EmailEstimateFormValues) => {
    sendEmailMutation.mutate(values);
  };

  // Reset form when the modal is opened with new data
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        to: customerEmail || "",
        subject: `Estimate #${estimateNumber} from ${businessName || "Your Company"}`,
        message: `Hi,\n\nPlease find your estimate attached.\n\nLet us know if you have any questions.\n\nThanks,\n${businessName || ""}`,
        attachPdf: true,
      });
    }
  }, [isOpen, customerEmail, estimateNumber, businessName, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* 95vw ensures comfortable padding on very small screens */}
      <DialogContent className="w-[95vw] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Estimate #{estimateNumber}</DialogTitle>
          <DialogDescription>
            Compose and send the estimate to your client via email.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Email</FormLabel>
                  <FormControl>
                    <Input placeholder="client@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Your message to the client..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attachPdf"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Delivery Method</FormLabel>
                    <FormDescription>
                      {field.value
                        ? "Attach the estimate as a PDF file."
                        : "Include a secure link to view the estimate online."}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={sendEmailMutation.isPending}>
                {sendEmailMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Email
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailEstimateModal;
