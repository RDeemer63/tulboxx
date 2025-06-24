import React, { useState } from 'react';
import { useParams, useLocation, useRoute } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, isToday, isYesterday, isSameWeek, parseISO, differenceInDays } from 'date-fns';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  MessageSquare,
  AlertTriangle,
  Edit,
  User,
  Tag,
  MapPin,
  Info,
  Loader2,
  Plus,
  Send,
  MoreHorizontal,
  CalendarPlus,
  FileSignature,
} from 'lucide-react';
import { useLeadsApi } from '@/lib/api/leads';
import { useToast } from '@/components/ui/use-toast';
import FeatureFlagGuard from '@/components/shared/FeatureFlagGuard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn, formatPhoneNumber } from '@/lib/utils';
import { Lead } from '@/components/leads/LeadCard';
import { LeadDrawer } from '@/components/leads/LeadDrawer';

// Stage colors for badges - matching the ones in LeadCard
const stageColors: Record<string, { bg: string, text: string }> = {
  new: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  contacted: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  estimate_sent: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  won: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  lost: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400' },
};

// Event type icons for timeline
const eventTypeIcons: Record<string, React.ReactNode> = {
  created: <Plus className="h-4 w-4" />,
  note: <MessageSquare className="h-4 w-4" />,
  call: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  text: <MessageSquare className="h-4 w-4" />,
  meeting: <Calendar className="h-4 w-4" />,
  estimate_sent: <FileText className="h-4 w-4" />,
  estimate_viewed: <FileText className="h-4 w-4" />,
  follow_up_set: <CalendarPlus className="h-4 w-4" />,
  follow_up_completed: <CheckCircle className="h-4 w-4" />,
  stage_change: <ArrowLeft className="h-4 w-4" />,
  status_change: <Info className="h-4 w-4" />,
  assigned: <User className="h-4 w-4" />,
  custom: <Info className="h-4 w-4" />,
};

// Helper function to format dates for the timeline
const formatEventDate = (dateString: string) => {
  const date = parseISO(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isSameWeek(date, new Date())) return format(date, 'EEEE'); // e.g., "Monday"
  return format(date, 'MMM d, yyyy'); // e.g., "Jan 1, 2025"
};

// Helper function to group events by date
const groupEventsByDate = (events: any[]) => {
  return events.reduce((groups: Record<string, any[]>, event) => {
    const date = event.createdAt.split('T')[0]; // Get YYYY-MM-DD part
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {});
};

const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useRoute('/leads/:id');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    getLead,
    updateLead,
    addNote,
    logCall,
    logEmail,
    logText,
    logMeeting,
    setFollowUp,
    clearFollowUp,
    moveToStage,
    markAsWon,
    markAsLost,
  } = useLeadsApi();

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isFollowUpDialogOpen, setIsFollowUpDialogOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [callOutcome, setCallOutcome] = useState('');
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('timeline');

  // Fetch lead data with events
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => getLead(id),
    enabled: !!id,
  });

  const lead = data?.data?.lead;
  const events = data?.data?.events || [];

  // Group events by date
  const groupedEvents = groupEventsByDate(events);
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => b.localeCompare(a)); // Sort dates in descending order

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: () => addNote({ id, note: noteText, userId: 'current_user_id' }), // Placeholder userId
    onSuccess: () => {
      toast({ title: 'Note Added', description: 'Your note has been added to the lead.' });
      setNoteText('');
      setIsNoteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add note.',
        variant: 'destructive',
      });
    },
  });

  // Log call mutation
  const logCallMutation = useMutation({
    mutationFn: () => logCall({ id, notes: callNotes, userId: 'current_user_id', outcome: callOutcome }), // Placeholder userId
    onSuccess: () => {
      toast({ title: 'Call Logged', description: 'Your call has been logged.' });
      setCallNotes('');
      setCallOutcome('');
      setIsCallDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to log call.',
        variant: 'destructive',
      });
    },
  });

  // Set follow-up mutation
  const setFollowUpMutation = useMutation({
    mutationFn: () => setFollowUp({ id, followUpDate: followUpDate!, userId: 'current_user_id' }), // Placeholder userId
    onSuccess: () => {
      toast({ title: 'Follow-up Scheduled', description: `Follow-up set for ${format(followUpDate!, 'PPP')}.` });
      setFollowUpDate(undefined);
      setIsFollowUpDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to set follow-up.',
        variant: 'destructive',
      });
    },
  });

  // Clear follow-up mutation
  const clearFollowUpMutation = useMutation({
    mutationFn: () => clearFollowUp(id, 'current_user_id'), // Placeholder userId
    onSuccess: () => {
      toast({ title: 'Follow-up Cleared', description: 'Follow-up has been removed.' });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to clear follow-up.',
        variant: 'destructive',
      });
    },
  });

  // Mark as won mutation
  const markAsWonMutation = useMutation({
    mutationFn: () => markAsWon({ id, userId: 'current_user_id', convertToJob: true }), // Placeholder userId
    onSuccess: (data) => {
      toast({
        title: 'Lead Won',
        description: data.convertedToJob
          ? `Lead has been marked as won and converted to job #${data.jobId}.`
          : 'Lead has been marked as won.',
      });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark lead as won.',
        variant: 'destructive',
      });
    },
  });

  // Mark as lost mutation
  const markAsLostMutation = useMutation({
    mutationFn: () => markAsLost({ id, userId: 'current_user_id' }), // Placeholder userId
    onSuccess: () => {
      toast({ title: 'Lead Lost', description: 'Lead has been marked as lost.' });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark lead as lost.',
        variant: 'destructive',
      });
    },
  });

  // Move to stage mutation
  const moveToStageMutation = useMutation({
    mutationFn: ({ stage, notes }: { stage: string; notes?: string }) =>
      moveToStage({ id, stage, userId: 'current_user_id', notes }), // Placeholder userId
    onSuccess: () => {
      toast({ title: 'Stage Updated', description: 'Lead stage has been updated.' });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update stage.',
        variant: 'destructive',
      });
    },
  });

  // Handle adding a note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteText.trim()) {
      addNoteMutation.mutate();
    }
  };

  // Handle logging a call
  const handleLogCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (callNotes.trim()) {
      logCallMutation.mutate();
    }
  };

  // Handle setting a follow-up
  const handleSetFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (followUpDate) {
      setFollowUpMutation.mutate();
    }
  };

  // Handle clearing a follow-up
  const handleClearFollowUp = () => {
    clearFollowUpMutation.mutate();
  };

  // Handle marking as won
  const handleMarkAsWon = () => {
    markAsWonMutation.mutate();
  };

  // Handle marking as lost
  const handleMarkAsLost = () => {
    markAsLostMutation.mutate();
  };

  // Handle stage change
  const handleStageChange = (stage: string) => {
    moveToStageMutation.mutate({ stage });
  };

  // Handle edit lead
  const handleEditLead = () => {
    setIsEditDrawerOpen(true);
  };

  // Handle back to leads
  const handleBackToLeads = () => {
    navigate('/leads');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Loading lead details...</p>
      </div>
    );
  }

  // Error state
  if (isError || !lead) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <h2 className="text-lg font-semibold mb-1">Error Loading Lead</h2>
        <p className="text-muted-foreground">{(error as Error)?.message || 'Lead not found'}</p>
        <Button variant="outline" className="mt-4" onClick={handleBackToLeads}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Leads
        </Button>
      </div>
    );
  }

  // Check if follow-up is needed
  const needsFollowUp = lead.stage !== 'won' && lead.stage !== 'lost' && !lead.followUpDate;
  
  // Check if follow-up is overdue
  const isFollowUpOverdue = lead.followUpDate && differenceInDays(new Date(), new Date(lead.followUpDate)) > 0;

  return (
    <div className="flex flex-col h-full p-4 md:p-6 max-w-6xl mx-auto">
      {/* Back to leads button */}
      <Button
        variant="ghost"
        className="w-fit mb-4 -ml-2"
        onClick={handleBackToLeads}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Leads
      </Button>

      {/* Warning banner for leads without follow-up */}
      {needsFollowUp && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 p-4 mb-6 rounded-r" role="alert">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800 dark:text-yellow-400">No follow-up scheduled</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                This lead doesn't have a follow-up date set. Schedule a follow-up to stay on track.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 bg-yellow-200 dark:bg-yellow-800 border-yellow-300 dark:border-yellow-700 hover:bg-yellow-300 dark:hover:bg-yellow-700"
                onClick={() => setIsFollowUpDialogOpen(true)}
              >
                <CalendarPlus className="h-4 w-4 mr-2" /> Schedule Follow-up
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up overdue warning */}
      {isFollowUpOverdue && (
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded-r" role="alert">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-400">Follow-up overdue</p>
              <p className="text-sm text-red-700 dark:text-red-300">
                The follow-up scheduled for {format(new Date(lead.followUpDate!), 'PPP')} is overdue.
              </p>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-200 dark:bg-red-800 border-red-300 dark:border-red-700 hover:bg-red-300 dark:hover:bg-red-700"
                  onClick={() => setIsFollowUpDialogOpen(true)}
                >
                  <CalendarPlus className="h-4 w-4 mr-2" /> Reschedule
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-200 dark:bg-red-800 border-red-300 dark:border-red-700 hover:bg-red-300 dark:hover:bg-red-700"
                  onClick={handleClearFollowUp}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Clear Follow-up
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{lead.fullName}</h1>
          <div className="flex items-center mt-2 text-muted-foreground">
            <Phone className="h-4 w-4 mr-2" />
            <span className="mr-4">{formatPhoneNumber(lead.phone)}</span>
            {lead.email && (
              <>
                <Mail className="h-4 w-4 mr-2" />
                <span>{lead.email}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={`${stageColors[lead.stage]?.bg || ''} ${stageColors[lead.stage]?.text || ''} font-medium`}
            variant="outline"
          >
            {lead.stage.replace('_', ' ')}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Change Stage <MoreHorizontal className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStageChange('new')}>
                New
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStageChange('contacted')}>
                Contacted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStageChange('estimate_sent')}>
                Estimate Sent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStageChange('won')}>
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Won
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStageChange('lost')}>
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                Lost
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" onClick={handleEditLead}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
        </div>
      </div>

      {/* Details and actions section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Details card */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Lead Details</CardTitle>
            <CardDescription>Contact information and lead details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Service Type</h3>
                <p className="text-base">{lead.serviceType || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Source</h3>
                <p className="text-base">{lead.source || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                <p className="text-base">{format(new Date(lead.createdAt), 'PPP')}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Follow-up Date</h3>
                <p className="text-base">
                  {lead.followUpDate ? format(new Date(lead.followUpDate), 'PPP') : 'Not scheduled'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Assigned To</h3>
                <p className="text-base">{lead.assignedTo || 'Unassigned'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                <p className="text-base">{format(new Date(lead.updatedAt), 'PPP')}</p>
              </div>
            </div>
            {lead.notes && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
                <p className="text-base whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions card */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Take action on this lead</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              className="w-full justify-start"
              onClick={() => setIsCallDialogOpen(true)}
            >
              <Phone className="h-4 w-4 mr-2" /> Log Call
            </Button>
            <Button
              className="w-full justify-start"
              onClick={() => setIsNoteDialogOpen(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" /> Add Note
            </Button>
            <Button
              className="w-full justify-start"
              onClick={() => setIsFollowUpDialogOpen(true)}
            >
              <CalendarPlus className="h-4 w-4 mr-2" /> Schedule Follow-up
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
            >
              <FileSignature className="h-4 w-4 mr-2" /> Create Estimate
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={handleMarkAsWon}
            >
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Mark as Won
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={handleMarkAsLost}
            >
              <XCircle className="h-4 w-4 mr-2 text-red-500" /> Mark as Lost
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Tabs section */}
      <Tabs defaultValue="timeline" className="flex-1" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="files" disabled>Files</TabsTrigger>
          <TabsTrigger value="estimates" disabled>Estimates</TabsTrigger>
          <TabsTrigger value="history" disabled>History</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="mt-4 overflow-auto">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>History of interactions with this lead</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No activity recorded yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setIsNoteDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add First Note
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedDates.map(date => (
                    <div key={date} className="relative">
                      <div className="flex items-center mb-4">
                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
                        <span className="px-3 text-sm font-medium text-muted-foreground bg-white dark:bg-slate-900">
                          {formatEventDate(date)}
                        </span>
                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                      <div className="space-y-4">
                        {groupedEvents[date]
                          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((event: any) => (
                            <div key={event.id} className="flex gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                {eventTypeIcons[event.type] || <Info className="h-4 w-4" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">{event.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(event.createdAt), 'h:mm a')}
                                  {event.createdBy && ` • ${event.createdBy}`}
                                </p>
                                {event.meta && Object.keys(event.meta).length > 0 && (
                                  <div className="mt-2 text-xs text-muted-foreground bg-gray-50 dark:bg-slate-800 p-2 rounded">
                                    {Object.entries(event.meta).map(([key, value]) => (
                                      <div key={key} className="flex items-start gap-1">
                                        <span className="font-medium">{key}:</span>
                                        <span>{String(value)}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Files</CardTitle>
              <CardDescription>Documents and files related to this lead</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No files uploaded yet</p>
                <Button variant="outline" size="sm" className="mt-2" disabled>
                  <Plus className="h-4 w-4 mr-2" /> Upload File
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="estimates">
          <Card>
            <CardHeader>
              <CardTitle>Estimates</CardTitle>
              <CardDescription>Estimates created for this lead</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No estimates created yet</p>
                <Button variant="outline" size="sm" className="mt-2" disabled>
                  <Plus className="h-4 w-4 mr-2" /> Create Estimate
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>Changes and updates to this lead</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No history available</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a note to this lead's timeline.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddNote}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  placeholder="Enter your note here..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!noteText.trim() || addNoteMutation.isPending}>
                {addNoteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Note
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Log Call Dialog */}
      <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Call</DialogTitle>
            <DialogDescription>
              Record details about your call with {lead.fullName}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogCall}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="callNotes">Call Notes</Label>
                <Textarea
                  id="callNotes"
                  placeholder="What was discussed in the call?"
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="callOutcome">Outcome</Label>
                <Input
                  id="callOutcome"
                  placeholder="e.g., Left voicemail, Scheduled meeting, etc."
                  value={callOutcome}
                  onChange={(e) => setCallOutcome(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsCallDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!callNotes.trim() || logCallMutation.isPending}>
                {logCallMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Log Call
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Follow-up Dialog */}
      <Dialog open={isFollowUpDialogOpen} onOpenChange={setIsFollowUpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Follow-up</DialogTitle>
            <DialogDescription>
              Set a date to follow up with this lead.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSetFollowUp}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="followUpDate">Follow-up Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !followUpDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      {followUpDate ? format(followUpDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={followUpDate}
                      onSelect={setFollowUpDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsFollowUpDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!followUpDate || setFollowUpMutation.isPending}>
                {setFollowUpMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Schedule Follow-up
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Drawer */}
      <LeadDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => setIsEditDrawerOpen(false)}
        initialData={lead}
        onSuccess={() => {
          setIsEditDrawerOpen(false);
          queryClient.invalidateQueries({ queryKey: ['lead', id] });
        }}
      />
    </div>
  );
};

export default LeadDetailPage;
