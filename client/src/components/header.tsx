import { Bell, Menu, X, Clock, AlertTriangle, CheckCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export default function Header({ 
  title = "Dashboard", 
  subtitle = "Welcome back! Here's what's happening with your business." 
}: HeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { data: businessProfile } = useQuery({
    queryKey: ["/api/business-profile"],
    queryFn: () => fetch("/api/business-profile", { credentials: "include" }).then(res => res.json()),
  });

  // Extract user display information from business profile
  const ownerName = businessProfile?.ownerName || "Business Owner";
  const businessName = businessProfile?.businessName || "Service Pro";
  const initials = ownerName.split(' ').map((n: string) => n[0]).join('').toUpperCase() || "BO";

  // Fetch data for notifications
  const { data: estimates = [] } = useQuery({
    queryKey: ["/api/estimates"],
    queryFn: () => fetch("/api/estimates", { credentials: "include" }).then(res => res.json()),
    select: (data) => Array.isArray(data) ? data : [],
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["/api/jobs"],
    queryFn: () => fetch("/api/jobs", { credentials: "include" }).then(res => res.json()),
    select: (data) => Array.isArray(data) ? data : [],
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["/api/invoices"],
    queryFn: () => fetch("/api/invoices", { credentials: "include" }).then(res => {
      if (!res.ok) return [];
      return res.json();
    }),
  });

  // Track read notifications in localStorage
  const [readNotifications, setReadNotifications] = useState<string[]>(() => {
    const stored = localStorage.getItem('readNotifications');
    return stored ? JSON.parse(stored) : [];
  });

  // Generate notifications from real business data
  const allNotifications = [];
  
  // Overdue estimates (older than 7 days)
  const overdueEstimates = (estimates || []).filter((est: any) => {
    const estimateDate = new Date(est.createdAt);
    const daysDiff = (Date.now() - estimateDate.getTime()) / (1000 * 60 * 60 * 24);
    return est.status === 'pending' && daysDiff > 7;
  });
  
  if (overdueEstimates.length > 0) {
    allNotifications.push({
      id: 'overdue-estimates',
      type: 'warning',
      title: `${overdueEstimates.length} Overdue Estimate${overdueEstimates.length > 1 ? 's' : ''}`,
      message: 'Follow up with customers who haven\'t responded',
      icon: AlertTriangle,
      time: 'Pending',
      actionUrl: '/estimates',
      isRead: readNotifications.includes('overdue-estimates'),
    });
  }

  // Jobs starting today
  const todayJobs = (jobs || []).filter((job: any) => {
    if (!job.scheduledDate) return false;
    const jobDate = new Date(job.scheduledDate).toDateString();
    const today = new Date().toDateString();
    return jobDate === today && job.status !== 'completed';
  });
  
  if (todayJobs.length > 0) {
    allNotifications.push({
      id: 'today-jobs',
      type: 'info',
      title: `${todayJobs.length} Job${todayJobs.length > 1 ? 's' : ''} Today`,
      message: 'Scheduled work requires attention',
      icon: Clock,
      time: 'Today',
      actionUrl: '/jobs',
      isRead: readNotifications.includes('today-jobs'),
    });
  }

  // Unpaid invoices (older than 30 days)
  const overdueInvoices = (invoices || []).filter((inv: any) => {
    const invoiceDate = new Date(inv.createdAt);
    const daysDiff = (Date.now() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24);
    return inv.status === 'sent' && daysDiff > 30;
  });
  
  if (overdueInvoices.length > 0) {
    allNotifications.push({
      id: 'overdue-invoices',
      type: 'urgent',
      title: `${overdueInvoices.length} Overdue Invoice${overdueInvoices.length > 1 ? 's' : ''}`,
      message: 'Payment collection required',
      icon: DollarSign,
      time: 'Overdue',
      actionUrl: '/invoices',
      isRead: readNotifications.includes('overdue-invoices'),
    });
  }

  // Recent completed jobs (last 3 days)
  const recentCompletions = (jobs || []).filter((job: any) => {
    if (job.status !== 'completed' || !job.completedDate) return false;
    const completedDate = new Date(job.completedDate);
    const daysDiff = (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 3;
  });
  
  if (recentCompletions.length > 0) {
    allNotifications.push({
      id: 'recent-completions',
      type: 'success',
      title: `${recentCompletions.length} Job${recentCompletions.length > 1 ? 's' : ''} Completed`,
      message: 'Ready for invoicing',
      icon: CheckCircle,
      time: 'Recent',
      actionUrl: '/invoices',
      isRead: readNotifications.includes('recent-completions'),
    });
  }

  // All notifications for display
  const notifications = allNotifications;
  
  // Unread count for red dot
  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  // Handle notification click
  const handleNotificationClick = (notification: any) => {
    // Mark as read
    if (!notification.isRead) {
      const updatedReadNotifications = [...readNotifications, notification.id];
      setReadNotifications(updatedReadNotifications);
      localStorage.setItem('readNotifications', JSON.stringify(updatedReadNotifications));
    }
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    
    // Close notification popover
    setIsNotificationsOpen(false);
  };

  // Mark all as read
  const markAllAsRead = () => {
    const allNotificationIds = notifications.map(notif => notif.id);
    setReadNotifications(allNotificationIds);
    localStorage.setItem('readNotifications', JSON.stringify(allNotificationIds));
  };



  return (
    <header className="page-header px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2 hover:bg-slate-100 rounded-full"
              >
                <Bell className="h-4 w-4 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsNotificationsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-slate-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">No notifications</p>
                    <p className="text-xs text-slate-400">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification: any) => {
                      const IconComponent = notification.icon;
                      return (
                        <div 
                          key={notification.id} 
                          className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${
                              notification.type === 'urgent' ? 'bg-red-100' :
                              notification.type === 'warning' ? 'bg-yellow-100' :
                              notification.type === 'success' ? 'bg-green-100' :
                              'bg-blue-100'
                            }`}>
                              <IconComponent className={`h-4 w-4 ${
                                notification.type === 'urgent' ? 'text-red-600' :
                                notification.type === 'warning' ? 'text-yellow-600' :
                                notification.type === 'success' ? 'text-green-600' :
                                'text-blue-600'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                  {notification.title}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <Badge 
                                    variant="secondary" 
                                    className={`text-xs ${
                                      notification.type === 'urgent' ? 'bg-red-100 text-red-700' :
                                      notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                      notification.type === 'success' ? 'bg-green-100 text-green-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}
                                  >
                                    {notification.time}
                                  </Badge>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t bg-slate-50 flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-xs text-slate-600 hover:text-slate-900"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                  >
                    Mark all read
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 text-xs text-slate-600 hover:text-slate-900"
                  >
                    View all
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          
          <div className="flex items-center space-x-3 pl-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{ownerName}</p>
              <p className="text-xs text-slate-500">{businessName}</p>
            </div>
            <Avatar className="h-9 w-9 border border-slate-200 shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
