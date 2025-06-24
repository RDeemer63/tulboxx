import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, DollarSign, Calendar, Target, ChevronRight, MoreVertical, Edit2, Trash2, User, FileText, X, Search, Filter, ArrowUpDown, CheckSquare } from "lucide-react";
import Header from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import type { LeadPipelineStage, LeadPipelineEntry, Customer, LeadNote } from "@shared/schema";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter, PointerSensor, useSensor, useSensors, rectIntersection, getFirstCollision, pointerWithin } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableLeadCard } from "@/components/SortableLeadCard";
import { DroppableStage } from "@/components/DroppableStage";

const stageFormSchema = z.object({
  name: z.string().min(1, "Stage name is required"),
  description: z.string().optional(),
  color: z.string().default("#3B82F6"),
  businessProfileId: z.number().default(4),
  sortOrder: z.number(),
});

const entryFormSchema = z.object({
  contactId: z.number(),
  stageId: z.number(),
  probability: z.number().min(0).max(100).default(25),
  estimatedValue: z.string().optional(),
  expectedCloseDate: z.string().optional(),
  notes: z.string().optional(),
});

const noteFormSchema = z.object({
  noteType: z.string().default("general"),
  content: z.string().min(1, "Note content is required"),
  isPrivate: z.boolean().default(false),
});

type StageFormData = z.infer<typeof stageFormSchema>;
type EntryFormData = z.infer<typeof entryFormSchema>;
type NoteFormData = z.infer<typeof noteFormSchema>;

export default function Pipeline() {
  const queryClient = useQueryClient();
  const [selectedStage, setSelectedStage] = useState<LeadPipelineStage | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<LeadPipelineEntry | null>(null);
  const [isStageDialogOpen, setIsStageDialogOpen] = useState(false);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isNewContact, setIsNewContact] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadPipelineEntry | null>(null);
  const [isLeadDetailOpen, setIsLeadDetailOpen] = useState(false);
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [editedLead, setEditedLead] = useState<Partial<LeadPipelineEntry>>({});
  const [isQuickNoteMode, setIsQuickNoteMode] = useState(false);
  const [quickNote, setQuickNote] = useState('');
  
  // Notes system state
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteType, setNewNoteType] = useState('general');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  
  // Drag and drop state
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  
  // Search and filtering state
  const [searchTerm, setSearchTerm] = useState("");
  const [probabilityFilter, setProbabilityFilter] = useState("all");
  const [valueFilter, setValueFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");
  const [contactMethodFilter, setContactMethodFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [stageLimit, setStageLimit] = useState(10); // Limit cards per stage
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Custom collision detection that prioritizes stage containers
  const customCollisionDetection = (args: any) => {
    // First, get all collisions using pointer detection
    const pointerCollisions = pointerWithin(args);
    
    // Filter for stage containers (those with "stage-" prefix)
    const stageCollisions = pointerCollisions.filter((collision: any) => 
      collision.id.toString().startsWith('stage-')
    );
    
    // If we have stage collisions, return the first one
    if (stageCollisions.length > 0) {
      return [stageCollisions[0]];
    }
    
    // Otherwise, fall back to closest center detection
    return closestCenter(args);
  };


  // Data queries
  const { data: stages = [], isLoading: stagesLoading } = useQuery<LeadPipelineStage[]>({
    queryKey: ["/api/lead-pipeline/stages"],
  });

  const { data: entries = [], isLoading: entriesLoading } = useQuery<LeadPipelineEntry[]>({
    queryKey: ["/api/lead-pipeline/entries"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Lead notes query
  const { data: leadNotes = [] } = useQuery<LeadNote[]>({
    queryKey: [`/api/lead-pipeline/entries/${selectedLead?.id}/notes`],
    enabled: !!selectedLead?.id,
  });

  // Query to get notes counts for all leads to show note icons
  const { data: notesData = {} } = useQuery<Record<number, number>>({
    queryKey: ["/api/lead-pipeline/notes-count"],
  });

  // Forms
  const stageForm = useForm<StageFormData>({
    resolver: zodResolver(stageFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
      businessProfileId: 4,
      sortOrder: (stages.length || 0) + 1,
    },
  });

  const entryForm = useForm<EntryFormData>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      contactId: 0,
      stageId: 0,
      probability: 25,
      estimatedValue: "",
      expectedCloseDate: "",
      notes: "",
    },
  });

  const newContactForm = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      status: "lead",
      preferredContactMethod: "phone",
      propertyType: "residential",
      notes: "",
    },
  });

  // Mutations
  const createStageMutation = useMutation({
    mutationFn: async (data: StageFormData) => {
      const response = await fetch("/api/lead-pipeline/stages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create stage");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-pipeline/stages"] });
      setIsStageDialogOpen(false);
      stageForm.reset();
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<LeadPipelineEntry> }) => {
      const response = await fetch(`/api/lead-pipeline/entries/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data.updates),
      });
      if (!response.ok) {
        throw new Error("Failed to update lead");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-pipeline/entries"] });
      setIsEditingLead(false);
      setEditedLead({});
    },
  });

  const quickNoteMutation = useMutation({
    mutationFn: async (data: { id: number; note: string }) => {
      const currentNotes = selectedLead?.notes || '';
      const timestamp = new Date().toLocaleString();
      const newNote = `${currentNotes ? currentNotes + '\n\n' : ''}[${timestamp}] ${data.note}`;
      
      const response = await fetch(`/api/lead-pipeline/entries/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: newNote }),
      });
      if (!response.ok) {
        throw new Error("Failed to add note");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-pipeline/entries"] });
      setIsQuickNoteMode(false);
      setQuickNote('');
    },
  });

  // Notes system mutations
  const createNoteMutation = useMutation({
    mutationFn: async (data: { leadId: number; noteType: string; content: string }) => {
      const response = await fetch(`/api/lead-pipeline/entries/${data.leadId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteType: data.noteType,
          content: data.content,
          authorName: "User"
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create note");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/lead-pipeline/entries/${selectedLead?.id}/notes`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/lead-pipeline/notes-count"] 
      });
      setIsAddingNote(false);
      setNewNoteContent('');
      setNewNoteType('general');
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (data: { id: number; content: string }) => {
      const response = await fetch(`/api/lead-notes/${data.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: data.content }),
      });
      if (!response.ok) {
        throw new Error("Failed to update note");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/lead-pipeline/entries/${selectedLead?.id}/notes`] 
      });
      setEditingNoteId(null);
      setEditingNoteContent('');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      const response = await fetch(`/api/lead-notes/${noteId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete note");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/lead-pipeline/entries/${selectedLead?.id}/notes`] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/lead-pipeline/notes-count"] 
      });
    },
  });

  const updateLeadStageMutation = useMutation({
    mutationFn: async ({ leadId, stageId }: { leadId: number; stageId: number }) => {
      const response = await fetch(`/api/lead-pipeline/entries/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stageId }),
      });
      if (!response.ok) {
        throw new Error("Failed to update lead stage");
      }
      return response.json();
    },
    onMutate: async ({ leadId, stageId }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["/api/lead-pipeline/entries"] });

      // Snapshot the previous value
      const previousEntries = queryClient.getQueryData(["/api/lead-pipeline/entries"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["/api/lead-pipeline/entries"], (old: any) => {
        if (!old) return old;
        return old.map((entry: any) => 
          entry.id === leadId 
            ? { ...entry, stageId, enteredStageAt: new Date().toISOString() }
            : entry
        );
      });

      // Return a context object with the snapshotted value
      return { previousEntries };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousEntries) {
        queryClient.setQueryData(["/api/lead-pipeline/entries"], context.previousEntries);
      }
    },
    onSuccess: () => {
      // Always refetch after a successful mutation to ensure we have the latest data
      queryClient.invalidateQueries({ 
        queryKey: ["/api/lead-pipeline/entries"] 
      });
    },
  });

  const deleteStageMutation = useMutation({
    mutationFn: async (stageId: number) => {
      const response = await fetch(`/api/lead-pipeline/stages/${stageId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete stage");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/lead-pipeline/stages"] 
      });
    },
  });

  const createContactMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create contact");
      }
      return response.json();
    },
  });

  // Bulk operations mutations
  const bulkUpdateStageMutation = useMutation({
    mutationFn: async ({ leadIds, stageId }: { leadIds: number[], stageId: number }) => {
      const response = await fetch(`/api/lead-pipeline/entries/bulk-update-stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds, stageId }),
      });
      if (!response.ok) throw new Error("Failed to update leads");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-pipeline/entries"] });
      setSelectedLeads([]);
      setBulkActionOpen(false);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (leadIds: number[]) => {
      const response = await fetch(`/api/lead-pipeline/entries/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds }),
      });
      if (!response.ok) throw new Error("Failed to delete leads");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-pipeline/entries"] });
      setSelectedLeads([]);
      setBulkActionOpen(false);
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: EntryFormData & { newContact?: any }) => {
      let contactId = data.contactId;
      
      // If creating a new contact, create it first
      if (data.newContact) {
        const newContact = await createContactMutation.mutateAsync(data.newContact);
        contactId = newContact.id;
      }
      
      const entryData = {
        contactId,
        stageId: data.stageId,
        probability: data.probability,
        estimatedValue: data.estimatedValue,
        expectedCloseDate: data.expectedCloseDate,
        notes: data.notes,
      };
      
      const response = await fetch("/api/lead-pipeline/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entryData),
      });
      if (!response.ok) {
        throw new Error("Failed to create entry");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-pipeline/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsEntryDialogOpen(false);
      setIsNewContact(false);
      entryForm.reset();
      newContactForm.reset();
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<EntryFormData> }) => {
      const response = await fetch(`/api/lead-pipeline/entries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update entry");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lead-pipeline/entries"] });
    },
  });

  // Helper functions
  const getFilteredEntries = () => {
    let filtered = entries.filter((entry: any) => {
      // Search by customer name, email, phone, or notes
      if (searchTerm) {
        const customer = customers.find((c: Customer) => c.id === entry.contactId);
        const customerName = customer ? `${customer.firstName} ${customer.lastName}`.toLowerCase() : "";
        const customerEmail = customer?.email?.toLowerCase() || "";
        const customerPhone = customer?.phone?.toLowerCase() || "";
        const entryNotes = entry.notes?.toLowerCase() || "";
        
        const searchLower = searchTerm.toLowerCase();
        if (!customerName.includes(searchLower) && 
            !customerEmail.includes(searchLower) && 
            !customerPhone.includes(searchLower) && 
            !entryNotes.includes(searchLower)) {
          return false;
        }
      }
      
      // Filter by probability
      if (probabilityFilter !== "all") {
        if (probabilityFilter === "high" && entry.probability < 75) return false;
        if (probabilityFilter === "medium" && (entry.probability < 25 || entry.probability >= 75)) return false;
        if (probabilityFilter === "low" && entry.probability >= 25) return false;
      }
      
      // Filter by value
      if (valueFilter !== "all") {
        const value = parseFloat(entry.estimatedValue || "0");
        if (valueFilter === "high" && value < 20000) return false;
        if (valueFilter === "medium" && (value < 5000 || value >= 20000)) return false;
        if (valueFilter === "low" && value >= 5000) return false;
      }
      
      // Filter by expected close date
      if (dateFilter !== "all") {
        const closeDate = new Date(entry.expectedCloseDate);
        const now = new Date();
        const diffTime = closeDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (dateFilter === "overdue" && diffDays >= 0) return false;
        if (dateFilter === "this_week" && (diffDays < 0 || diffDays > 7)) return false;
        if (dateFilter === "this_month" && (diffDays < 0 || diffDays > 30)) return false;
        if (dateFilter === "next_quarter" && (diffDays < 30 || diffDays > 90)) return false;
      }
      
      // Filter by property type
      if (propertyTypeFilter !== "all") {
        const customer = customers.find((c: Customer) => c.id === entry.contactId);
        if (customer?.propertyType !== propertyTypeFilter) return false;
      }
      
      // Filter by contact method
      if (contactMethodFilter !== "all") {
        const customer = customers.find((c: Customer) => c.id === entry.contactId);
        if (customer?.preferredContactMethod !== contactMethodFilter) return false;
      }
      
      return true;
    });
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;
      
      switch (sortBy) {
        case "probability":
          aValue = a.probability || 0;
          bValue = b.probability || 0;
          break;
        case "value":
          aValue = parseFloat(a.estimatedValue || "0");
          bValue = parseFloat(b.estimatedValue || "0");
          break;
        case "close_date":
          aValue = a.expectedCloseDate ? new Date(a.expectedCloseDate).getTime() : 0;
          bValue = b.expectedCloseDate ? new Date(b.expectedCloseDate).getTime() : 0;
          break;
        case "customer_name":
          const customerA = customers.find((c: Customer) => c.id === a.contactId);
          const customerB = customers.find((c: Customer) => c.id === b.contactId);
          aValue = customerA ? `${customerA.firstName} ${customerA.lastName}` : "";
          bValue = customerB ? `${customerB.firstName} ${customerB.lastName}` : "";
          break;
        default: // created
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }
      
      if (typeof aValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue as string) : (bValue as string).localeCompare(aValue);
      }
      
      const numA = aValue as number;
      const numB = bValue as number;
      
      if (sortOrder === "asc") {
        return numA - numB;
      } else {
        return numB - numA;
      }
    });
    
    return filtered;
  };

  const getAllEntriesByStage = (stageId: number) => {
    const filtered = getFilteredEntries();
    return filtered.filter((entry: any) => entry.stageId === stageId);
  };

  const getEntriesByStage = (stageId: number) => {
    const allStageEntries = getAllEntriesByStage(stageId);
    
    // Apply stage limit for performance
    return allStageEntries.slice(0, stageLimit);
  };
  
  const getHiddenCount = (stageId: number) => {
    const allStageEntries = getAllEntriesByStage(stageId);
    return Math.max(0, allStageEntries.length - stageLimit);
  };

  const getTotalValue = (stageEntries: any[]) => {
    return stageEntries.reduce((sum, entry) => {
      const value = parseFloat(entry.estimatedValue || "0");
      return sum + (value * (entry.probability / 100));
    }, 0);
  };

  const moveEntry = (entryId: number, newStageId: number) => {
    const entry = entries.find((e: any) => e.id === entryId);
    if (entry) {
      updateEntryMutation.mutate({
        id: entryId,
        data: { stageId: newStageId },
      });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) {
      console.log("No drop target detected");
      return;
    }

    const leadId = parseInt(active.id as string);
    
    // Extract stage ID from prefixed format (stage-1, stage-2, etc.)
    const dropTargetId = over.id as string;
    if (!dropTargetId.startsWith('stage-')) {
      console.warn(`Invalid drop target format: ${dropTargetId}. Expected format: stage-X`);
      return;
    }
    
    const targetStageId = parseInt(dropTargetId.replace('stage-', ''));
    
    console.log(`Drag end: lead ${leadId} to target ${dropTargetId} (parsed: ${targetStageId})`);
    console.log("Available stages:", stages.map(s => s.id));
    
    // Only allow drops on valid stage IDs
    const validStageIds = stages.map(s => s.id);
    if (!validStageIds.includes(targetStageId) || isNaN(targetStageId)) {
      console.warn(`Invalid stage ID: ${targetStageId}. Valid stages:`, validStageIds);
      return;
    }
    
    const lead = entries.find(e => e.id === leadId);
    if (!lead) {
      console.error(`Lead ${leadId} not found`);
      return;
    }
    
    if (lead.stageId === targetStageId) {
      console.log("Lead already in target stage");
      return;
    }

    console.log(`Moving lead ${leadId} from stage ${lead.stageId} to stage ${targetStageId}`);
    updateLeadStageMutation.mutate({ leadId, stageId: targetStageId });
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c: Customer) => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : "Unknown Contact";
  };

  // Selection handlers for bulk operations
  const handleLeadSelection = (leadId: number, selected: boolean) => {
    setSelectedLeads(prev => {
      if (selected) {
        return [...prev, leadId];
      } else {
        return prev.filter(id => id !== leadId);
      }
    });
  };

  const handleSelectAll = () => {
    const allVisibleLeads = getFilteredEntries().map((entry: any) => entry.id);
    setSelectedLeads(allVisibleLeads);
  };

  const handleDeselectAll = () => {
    setSelectedLeads([]);
  };

  const handleBulkStageChange = async (targetStageId: number) => {
    if (selectedLeads.length === 0) return;
    
    try {
      for (const leadId of selectedLeads) {
        await updateLeadStageMutation.mutateAsync({ leadId, stageId: targetStageId });
      }
      setSelectedLeads([]);
      setBulkActionOpen(false);
    } catch (error) {
      console.error('Bulk stage change failed:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    
    try {
      for (const leadId of selectedLeads) {
        const response = await fetch(`/api/lead-pipeline/entries/${leadId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`Failed to delete lead ${leadId}`);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["/api/lead-pipeline/entries"] });
      setSelectedLeads([]);
      setBulkActionOpen(false);
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  if (stagesLoading || entriesLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading pipeline...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header 
        title="Lead Pipeline" 
        subtitle="Track leads through your sales process and manage conversion opportunities"
      />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 mb-6">
            {/* Clean Top Bar */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-lg">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Secondary Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      More
                      {(probabilityFilter !== "all" || valueFilter !== "all" || dateFilter !== "all" || 
                        propertyTypeFilter !== "all" || contactMethodFilter !== "all") && (
                        <Badge variant="secondary" className="ml-1">
                          Filtered
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuItem onClick={() => setShowFilters(!showFilters)}>
                      <Filter className="h-4 w-4 mr-2" />
                      Advanced Filters
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Sort Options
                    </DropdownMenuItem>
                    {selectedLeads.length > 0 && (
                      <DropdownMenuItem onClick={() => setBulkActionOpen(true)}>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Bulk Actions ({selectedLeads.length})
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Primary Action Buttons - Right Side */}
              <div className="flex items-center gap-2">
                <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lead
                    </Button>
                  </DialogTrigger>
                </Dialog>
                
                <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stage
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Probability</label>
                    <Select value={probabilityFilter} onValueChange={setProbabilityFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Probabilities</SelectItem>
                        <SelectItem value="high">High (75%+)</SelectItem>
                        <SelectItem value="medium">Medium (25-74%)</SelectItem>
                        <SelectItem value="low">Low (0-24%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Value Range</label>
                    <Select value={valueFilter} onValueChange={setValueFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Values</SelectItem>
                        <SelectItem value="high">High ($20K+)</SelectItem>
                        <SelectItem value="medium">Medium ($5K-$20K)</SelectItem>
                        <SelectItem value="low">Low (Under $5K)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Close Date</label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="this_week">This Week</SelectItem>
                        <SelectItem value="this_month">This Month</SelectItem>
                        <SelectItem value="next_quarter">Next Quarter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Property Type</label>
                    <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Contact Method</label>
                    <Select value={contactMethodFilter} onValueChange={setContactMethodFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {(() => {
                      const totalFiltered = getFilteredEntries().length;
                      const totalEntries = entries.length;
                      return `Showing ${totalFiltered} of ${totalEntries} leads`;
                    })()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setProbabilityFilter("all");
                      setValueFilter("all");
                      setDateFilter("all");
                      setPropertyTypeFilter("all");
                      setContactMethodFilter("all");
                      setSearchTerm("");
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              </Card>
            )}
          </div>
            
          {/* Add Lead Dialog Content */}
          <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Lead to Pipeline</DialogTitle>
                <DialogDescription>
                  Add a new lead to your sales pipeline and track their progress.
                </DialogDescription>
              </DialogHeader>
              <Form {...entryForm}>
                <form
                  onSubmit={entryForm.handleSubmit((data) => {
                    const submissionData = {
                      ...data,
                      newContact: isNewContact ? newContactForm.getValues() : undefined,
                    };
                    createEntryMutation.mutate(submissionData);
                  })}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="existing-contact"
                        name="contact-type"
                        checked={!isNewContact}
                        onChange={() => setIsNewContact(false)}
                        className="h-4 w-4"
                      />
                      <label htmlFor="existing-contact" className="text-sm font-medium">
                        Select existing contact
                      </label>
                      <input
                        type="radio"
                        id="new-contact"
                        name="contact-type"
                        checked={isNewContact}
                        onChange={() => setIsNewContact(true)}
                        className="h-4 w-4 ml-4"
                      />
                      <label htmlFor="new-contact" className="text-sm font-medium">
                        Create new contact
                      </label>
                    </div>

                    {!isNewContact ? (
                      <FormField
                        control={entryForm.control}
                        name="contactId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a contact" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {customers
                                  .filter((c: Customer) => c.status === "lead")
                                  .map((customer: Customer) => (
                                    <SelectItem key={customer.id} value={customer.id.toString()}>
                                      {customer.firstName} {customer.lastName}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium text-sm">New Contact Information</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={newContactForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={newContactForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Smith" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={newContactForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="john@example.com" type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={newContactForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="(555) 123-4567" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={newContactForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input placeholder="ABC Corporation" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                  
                  <FormField
                    control={entryForm.control}
                    name="stageId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Stage</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a stage" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stages.map((stage: LeadPipelineStage) => (
                              <SelectItem key={stage.id} value={stage.id.toString()}>
                                {stage.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={entryForm.control}
                      name="probability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Probability (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={entryForm.control}
                      name="estimatedValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Value</FormLabel>
                          <FormControl>
                            <Input placeholder="5000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={entryForm.control}
                    name="expectedCloseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Close Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={entryForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Initial contact details, requirements, etc."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={createEntryMutation.isPending}>
                    {createEntryMutation.isPending ? "Adding..." : "Add Lead"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Add Stage Dialog Content */}
          <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Pipeline Stage</DialogTitle>
                <DialogDescription>
                  Add a new stage to your lead pipeline process.
                </DialogDescription>
              </DialogHeader>
              <Form {...stageForm}>
                <form
                  onSubmit={stageForm.handleSubmit((data) => createStageMutation.mutate(data))}
                  className="space-y-4"
                >
                  <FormField
                    control={stageForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stage Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Qualified Lead" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={stageForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What happens in this stage?"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={stageForm.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <Input type="color" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={createStageMutation.isPending}>
                    {createStageMutation.isPending ? "Creating..." : "Create Stage"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Pipeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Leads</p>
                <p className="text-2xl font-bold">{entries.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pipeline Value</p>
                <p className="text-2xl font-bold">
                  ${entries.reduce((sum: number, entry: any) => 
                    sum + parseFloat(entry.estimatedValue || "0"), 0
                  ).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Weighted Value</p>
                <p className="text-2xl font-bold">
                  ${stages.reduce((sum: number, stage: LeadPipelineStage) => 
                    sum + getTotalValue(getEntriesByStage(stage.id)), 0
                  ).toLocaleString()}
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Stages</p>
                <p className="text-2xl font-bold">{stages.length}</p>
              </div>
              <ChevronRight className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Kanban Board */}
      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 pb-6" style={{ minWidth: `${stages.length * 320}px` }}>
            {stages.map((stage: LeadPipelineStage) => {
              const allStageEntries = getAllEntriesByStage(stage.id);
              const stageEntries = getEntriesByStage(stage.id);
              const stageValue = getTotalValue(allStageEntries); // Use all entries for value calculation

              return (
                <DroppableStage
                  key={stage.id}
                  stage={stage}
                  entries={stageEntries}
                  allEntries={allStageEntries}
                  maxVisible={5}
                  stageValue={stageValue}
                  onViewDetails={(entry) => {
                    setSelectedLead(entry);
                    setEditedLead(entry);
                    setIsLeadDetailOpen(true);
                  }}
                  onEditStage={(stage) => setSelectedStage(stage)}
                  onDeleteStage={(id) => deleteStageMutation.mutate(id)}
                  selectedLeads={selectedLeads}
                  onSelectChange={handleLeadSelection}
                />
              );
            })}
          </div>
          
          <DragOverlay dropAnimation={null}>
            {activeDragId ? (
              <div className="transform rotate-6 opacity-90 pointer-events-none">
                {(() => {
                  const draggedEntry = entries.find(e => e.id.toString() === activeDragId);
                  if (draggedEntry) {
                    return <SortableLeadCard entry={draggedEntry} onViewDetails={() => {}} />;
                  }
                  return null;
                })()}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Lead Detail Modal */}
      <Dialog open={isLeadDetailOpen} onOpenChange={setIsLeadDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Lead Details: {selectedLead && getCustomerName(selectedLead.contactId)}
            </DialogTitle>
            <DialogDescription>
              Comprehensive lead information and pipeline tracking
            </DialogDescription>
          </DialogHeader>
          
          {selectedLead && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const contact = customers.find((c: Customer) => c.id === selectedLead.contactId);
                    if (!contact) return <p className="text-gray-500">Contact not found</p>;
                    
                    return (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Name</label>
                            <p className="text-sm">{contact.firstName} {contact.lastName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Status</label>
                            <Badge variant={contact.status === 'lead' ? 'default' : 'secondary'}>
                              {contact.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Email</label>
                            <p className="text-sm">{contact.email || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Phone</label>
                            <p className="text-sm">{contact.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-600">Address</label>
                          <p className="text-sm">
                            {contact.address ? 
                              `${contact.address}${contact.city ? `, ${contact.city}` : ''}${contact.state ? `, ${contact.state}` : ''}${contact.zipCode ? ` ${contact.zipCode}` : ''}` 
                              : 'Not provided'
                            }
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Property Type</label>
                            <p className="text-sm capitalize">{contact.propertyType || 'Not specified'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Preferred Contact</label>
                            <p className="text-sm capitalize">{contact.preferredContactMethod || 'Not specified'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Pipeline Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Pipeline Information
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsEditingLead(!isEditingLead)}
                      className="ml-auto"
                    >
                      {isEditingLead ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                      {isEditingLead ? 'Cancel' : 'Edit'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Current Stage</label>
                      {isEditingLead ? (
                        <Select 
                          value={editedLead.stageId?.toString() || selectedLead.stageId.toString()}
                          onValueChange={(value) => setEditedLead({...editedLead, stageId: parseInt(value)})}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {stages.map((stage: LeadPipelineStage) => (
                              <SelectItem key={stage.id} value={stage.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: stage.color }}
                                  />
                                  {stage.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ 
                              backgroundColor: stages.find((s: LeadPipelineStage) => s.id === selectedLead.stageId)?.color || '#3B82F6'
                            }}
                          />
                          <p className="text-sm">
                            {stages.find((s: LeadPipelineStage) => s.id === selectedLead.stageId)?.name || 'Unknown Stage'}
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Probability</label>
                      {isEditingLead ? (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Probability %"
                            value={editedLead.probability || selectedLead.probability || 0}
                            onChange={(e) => setEditedLead({...editedLead, probability: parseInt(e.target.value) || 0})}
                          />
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${editedLead.probability || selectedLead.probability || 0}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-sm">{selectedLead.probability || 0}%</p>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${selectedLead.probability || 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Estimated Value</label>
                      {isEditingLead ? (
                        <Input
                          type="number"
                          min="0"
                          placeholder="Estimated Value"
                          value={editedLead.estimatedValue || selectedLead.estimatedValue || ''}
                          onChange={(e) => setEditedLead({...editedLead, estimatedValue: e.target.value})}
                        />
                      ) : (
                        <p className="text-lg font-semibold text-green-600">
                          ${selectedLead.estimatedValue ? parseFloat(selectedLead.estimatedValue).toLocaleString() : '0'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Weighted Value</label>
                      <p className="text-lg font-semibold text-orange-600">
                        ${(() => {
                          const value = editedLead.estimatedValue || selectedLead.estimatedValue || '0';
                          const prob = editedLead.probability || selectedLead.probability || 0;
                          return (parseFloat(value) * (prob / 100)).toLocaleString();
                        })()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Expected Close Date</label>
                      <p className="text-sm">
                        {selectedLead.expectedCloseDate ? 
                          new Date(selectedLead.expectedCloseDate).toLocaleDateString() : 
                          'Not set'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Days in Stage</label>
                      <p className="text-sm">
                        {selectedLead.enteredStageAt ? 
                          Math.floor((new Date().getTime() - new Date(selectedLead.enteredStageAt).getTime()) / (1000 * 60 * 60 * 24))
                          : 0} days
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="text-sm">
                      {selectedLead.createdAt ? 
                        new Date(selectedLead.createdAt).toLocaleDateString() : 
                        'Unknown'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Structured Notes Timeline */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes Timeline
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setIsAddingNote(!isAddingNote)}
                      className="ml-auto"
                    >
                      <Plus className="h-4 w-4" />
                      Add Note
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add Note Form */}
                  {isAddingNote && (
                    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200 mb-4">
                      <Select value={newNoteType} onValueChange={setNewNoteType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select note type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Note</SelectItem>
                          <SelectItem value="phone_call">Phone Call</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="follow_up">Follow Up</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea
                        placeholder="Add note content..."
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => {
                            if (newNoteContent.trim() && selectedLead) {
                              createNoteMutation.mutate({
                                leadId: selectedLead.id,
                                noteType: newNoteType,
                                content: newNoteContent.trim()
                              });
                            }
                          }}
                          disabled={!newNoteContent.trim() || createNoteMutation.isPending}
                        >
                          {createNoteMutation.isPending ? 'Adding...' : 'Add Note'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setIsAddingNote(false);
                            setNewNoteContent('');
                            setNewNoteType('general');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Notes Timeline */}
                  <div className="space-y-4">
                    {leadNotes && leadNotes.length > 0 ? (
                      leadNotes.map((note: LeadNote) => (
                        <div key={note.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {note.noteType ? note.noteType.replace('_', ' ') : 'Note'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(note.createdAt).toLocaleString()}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto">
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {
                                    setEditingNoteId(note.id);
                                    setEditingNoteContent(note.content);
                                  }}>
                                    <Edit2 className="h-3 w-3 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => deleteNoteMutation.mutate(note.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            {editingNoteId === note.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editingNoteContent}
                                  onChange={(e) => setEditingNoteContent(e.target.value)}
                                  rows={2}
                                  className="resize-none"
                                />
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm"
                                    onClick={() => {
                                      updateNoteMutation.mutate({
                                        id: note.id,
                                        content: editingNoteContent
                                      });
                                    }}
                                    disabled={updateNoteMutation.isPending}
                                  >
                                    {updateNoteMutation.isPending ? 'Saving...' : 'Save'}
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setEditingNoteId(null);
                                      setEditingNoteContent('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-8">No notes available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsLeadDetailOpen(false)}>
              Close
            </Button>
            {isEditingLead ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditingLead(false);
                    setEditedLead(selectedLead || {});
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedLead) {
                      updateLeadMutation.mutate({
                        id: selectedLead.id,
                        updates: editedLead
                      });
                    }
                  }}
                  disabled={updateLeadMutation.isPending}
                >
                  {updateLeadMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}