import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Users,
  Briefcase,
  Calculator,
  FileText,
  CalendarDays,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  MessageSquare,
  Settings,
  BarChartHorizontalBig,
  ListChecks,
  Palette,
  Bot,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequestJson, queryKeys } from '@/lib/queryClient';
import {
  type Job,
  type ModernEstimate,
  type Invoice,
  type Contact,
} from '@shared/schema';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '@/contexts/theme-context'; // Import useTheme

// Removed AIEstimateModal import as the component was deleted
// import AIEstimateModal from "@/components/ai-estimate-modal"; 
import AISocialModal from "@/components/ai-social-modal";


interface DashboardStats {
  activeLeads: number;
  estimatesPending: number;
  jobsInProgress: number;
  invoicesOverdue: number;
  totalRevenueMonth: number;
  conversionRate: number;
  upcomingAppointments: number;
  tasksDueToday: number;
}

interface RecentActivity {
  id: string;
  type: 'lead' | 'estimate' | 'job' | 'invoice' | 'payment';
  description: string;
  timestamp: string;
  link?: string;
}

const mockStats: DashboardStats = {
  activeLeads: 23,
  estimatesPending: 12,
  jobsInProgress: 8,
  invoicesOverdue: 3,
  totalRevenueMonth: 12500,
  conversionRate: 65, // percentage
  upcomingAppointments: 5,
  tasksDueToday: 2,
};

const mockRecentActivity: RecentActivity[] = [
  { id: '1', type: 'lead', description: 'New lead: John Smith for landscaping', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), link: '/pipeline' },
  { id: '2', type: 'estimate', description: 'Estimate #EST-0012 sent to Jane Doe', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), link: '/estimates' },
  { id: '3', type: 'job', description: 'Job #JOB-0008 started: Kitchen Remodel', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), link: '/jobs' },
  { id: '4', type: 'payment', description: 'Payment received for Invoice #INV-0005', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), link: '/invoices' },
  { id: '5', type: 'invoice', description: 'Invoice #INV-0007 created for Bob Williams', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), link: '/invoices' },
];

const mockUpcomingJobs: Job[] = [
  { id: 1, customerId: 1, title: 'Residential Plumbing Repair', serviceType: 'Plumbing', status: 'scheduled', scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), createdAt: new Date() },
  { id: 2, customerId: 2, title: 'Garden Maintenance', serviceType: 'Landscaping', status: 'scheduled', scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), createdAt: new Date() },
  { id: 3, customerId: 3, title: 'HVAC Checkup', serviceType: 'HVAC', status: 'scheduled', scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), createdAt: new Date() },
] as Job[]; // Cast as Job[] to satisfy type, mock data might be partial

const mockRevenueData = [
  { month: 'Jan', revenue: 8500 }, { month: 'Feb', revenue: 9200 }, { month: 'Mar', revenue: 11000 },
  { month: 'Apr', revenue: 10500 }, { month: 'May', revenue: 12500 }, { month: 'Jun', revenue: 14000 }
];

const mockLeadSourceData = [
  { name: 'Website', value: 400, fill: 'var(--color-website)' },
  { name: 'Referral', value: 300, fill: 'var(--color-referral)' },
  { name: 'Social Media', value: 200, fill: 'var(--color-social)' },
  { name: 'Ads', value: 100, fill: 'var(--color-ads)' },
];

const Dashboard: React.FC = () => {
  const { theme } = useTheme(); // Get current theme
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  // Removed state for AIEstimateModal as it's deleted
  // const [isAiEstimateModalOpen, setIsAiEstimateModalOpen] = useState(false);

  // For real data, you would use useQuery like this:
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useQuery<DashboardStats>({
    queryKey: queryKeys.dashboard.stats,
    queryFn: () => apiRequestJson<DashboardStats>('GET', '/api/dashboard/stats'),
    // Using mock data as placeholder
    initialData: mockStats,
  });

  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery<RecentActivity[]>({
    queryKey: ['dashboard', 'recentActivity'],
    queryFn: () => apiRequestJson<RecentActivity[]>('GET', '/api/dashboard/recent-activity'),
    initialData: mockRecentActivity,
  });
  
  const { data: upcomingJobs, isLoading: isLoadingJobs } = useQuery<Job[]>({
    queryKey: queryKeys.dashboard.todaySchedule, // or a more specific key for upcoming
    queryFn: () => apiRequestJson<Job[]>('GET', '/api/jobs?status=scheduled&limit=5&sortBy=scheduledDate&order=asc'),
    initialData: mockUpcomingJobs,
  });


  const kpiCards = useMemo(() => [
    { title: 'Active Leads', value: stats?.activeLeads || 0, icon: Users, link: '/pipeline', trend: '+5 this week' },
    { title: 'Estimates Pending', value: stats?.estimatesPending || 0, icon: Calculator, link: '/estimates', trend: '2 new today' },
    { title: 'Jobs In Progress', value: stats?.jobsInProgress || 0, icon: Briefcase, link: '/jobs', trend: '1 completed' },
    { title: 'Invoices Overdue', value: stats?.invoicesOverdue || 0, icon: AlertTriangle, link: '/invoices', color: 'text-red-500', trend: '+$1,200 overdue' },
    { title: 'Revenue This Month', value: `$${(stats?.totalRevenueMonth || 0).toLocaleString()}`, icon: DollarSign, link: '/reports', trend: '+15% vs last month' },
    { title: 'Lead Conversion Rate', value: `${stats?.conversionRate || 0}%`, icon: TrendingUp, link: '/reports', trend: '+2% this month' },
  ], [stats]);

  const chartConfig = {
    revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
    website: { label: 'Website', color: 'hsl(var(--chart-1))' },
    referral: { label: 'Referral', color: 'hsl(var(--chart-2))' },
    social: { label: 'Social Media', color: 'hsl(var(--chart-3))' },
    ads: { label: 'Ads', color: 'hsl(var(--chart-4))' },
  };
  
  // Determine chart colors based on theme
  const REVENUE_CHART_FILL = theme === 'dark' ? '#F97316' : '#EA580C'; // Orange shades
  const LEAD_SOURCE_COLORS = theme === 'dark' 
    ? ['#F97316', '#FB923C', '#FDBA74', '#FED7AA'] // Dark theme oranges
    : ['#EA580C', '#F97316', '#FB923C', '#FDBA74']; // Light theme oranges


  const renderActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'lead': return <Users className="h-4 w-4 text-blue-500" />;
      case 'estimate': return <Calculator className="h-4 w-4 text-yellow-500" />;
      case 'job': return <Briefcase className="h-4 w-4 text-green-500" />;
      case 'invoice': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'payment': return <DollarSign className="h-4 w-4 text-teal-500" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setIsSocialModalOpen(true)} className="dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800">
              <Sparkles className="mr-2 h-4 w-4 text-orange-500" />
              AI Social Post
            </Button>
            {/* Removed button that triggered AIEstimateModal */}
            {/* 
            <Button variant="outline" size="sm" onClick={() => setIsAiEstimateModalOpen(true)} className="dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800">
              <Bot className="mr-2 h-4 w-4 text-orange-500" />
              AI Estimate Helper
            </Button>
            */}
            <Button asChild size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
              <Link href="/jobs/new"> {/* Assuming a route for creating a new job */}
                <PlusCircle className="mr-2 h-4 w-4" />
                New Job
              </Link>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {kpiCards.map((kpi) => (
            <Card key={kpi.title} className="shadow-sm hover:shadow-md transition-shadow dark:bg-slate-800/50 dark:border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">{kpi.title}</CardTitle>
                <kpi.icon className={cn("h-5 w-5 text-slate-400 dark:text-slate-500", kpi.color)} />
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold text-slate-800 dark:text-slate-100", kpi.color)}>{kpi.value}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">{kpi.trend}</p>
              </CardContent>
              <CardFooter className="pt-0">
                 <Button variant="ghost" size="sm" className="text-xs text-orange-600 dark:text-orange-400 p-0 h-auto hover:underline" asChild>
                    <Link href={kpi.link}>View Details →</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Revenue Chart */}
          <Card className="lg:col-span-4 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-slate-100">Revenue Overview</CardTitle>
              <CardDescription className="dark:text-slate-400">Monthly revenue for the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockRevenueData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-700" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs text-slate-600 dark:text-slate-400" />
                    <YAxis tickLine={false} axisLine={false} className="text-xs text-slate-600 dark:text-slate-400" tickFormatter={(value) => `$${value/1000}k`} />
                    <ChartTooltip content={<ChartTooltipContent className="dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700" />} />
                    <Bar dataKey="revenue" fill={REVENUE_CHART_FILL} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Lead Sources Chart */}
          <Card className="lg:col-span-3 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-slate-100">Lead Sources</CardTitle>
              <CardDescription className="dark:text-slate-400">Breakdown of where your leads are coming from.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
               <ChartContainer config={chartConfig} className="h-[300px] w-full max-w-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent className="dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700" />} />
                        <Pie data={mockLeadSourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                                <text x={x} y={y} fill={theme === 'dark' ? '#fff' : '#333'} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">
                                    {`${mockLeadSourceData[index].name} (${(percent * 100).toFixed(0)}%)`}
                                </text>
                            );
                        }}>
                             {mockLeadSourceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={LEAD_SOURCE_COLORS[index % LEAD_SOURCE_COLORS.length]} />
                            ))}
                        </Pie>
                         <ChartLegend content={<ChartLegendContent nameKey="name" className="dark:text-slate-300" />} />
                    </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Appointments/Jobs */}
          <Card className="shadow-sm hover:shadow-md transition-shadow dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-slate-100">Upcoming Jobs</CardTitle>
              <CardDescription className="dark:text-slate-400">Your next few scheduled jobs.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingJobs && <p>Loading...</p>}
              {!isLoadingJobs && upcomingJobs && upcomingJobs.length > 0 ? (
                <ul className="space-y-3">
                  {upcomingJobs.slice(0, 5).map((job) => (
                    <li key={job.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                      <CalendarDays className="h-5 w-5 text-orange-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{job.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Unscheduled'}
                          {job.scheduledStartTime && ` at ${new Date(job.scheduledStartTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs text-orange-600 dark:text-orange-400 p-1 h-auto" asChild>
                        <Link href={`/jobs/${job.id}`}>View</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming jobs scheduled.</p>
              )}
            </CardContent>
             <CardFooter>
                <Button variant="outline" size="sm" asChild className="dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800">
                    <Link href="/calendar">View Full Calendar</Link>
                </Button>
            </CardFooter>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="shadow-sm hover:shadow-md transition-shadow dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-slate-100">Recent Activity</CardTitle>
              <CardDescription className="dark:text-slate-400">Latest updates and actions in your business.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingActivity && <p>Loading...</p>}
              {!isLoadingActivity && recentActivity && recentActivity.length > 0 ? (
                <ul className="space-y-3">
                  {recentActivity.slice(0, 5).map((activity) => (
                    <li key={activity.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                      <div className="mt-1">{renderActivityIcon(activity.type)}</div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-700 dark:text-slate-200">{activity.description}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(activity.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          {activity.link && (
                            <Link href={activity.link} className="ml-2 text-orange-500 hover:underline">
                              View
                            </Link>
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity.</p>
              )}
            </CardContent>
             <CardFooter>
                <Button variant="outline" size="sm" asChild className="dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800">
                    <Link href="/reports/activity-log">View Full Activity Log</Link>
                </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Quick Actions / Task List */}
        <Card className="shadow-sm hover:shadow-md transition-shadow dark:bg-slate-800/50 dark:border-slate-700/50">
            <CardHeader>
                <CardTitle className="text-slate-800 dark:text-slate-100">Quick Actions & Tasks</CardTitle>
                <CardDescription className="dark:text-slate-400">Focus on what needs your attention.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                    <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">Common Actions</h4>
                    <div className="space-y-2">
                        <Button variant="subtle" className="w-full justify-start dark:text-slate-300 dark:hover:bg-slate-700/70" asChild><Link href="/pipeline"><Target className="mr-2 h-4 w-4 text-orange-500" /> Add New Lead</Link></Button>
                        <Button variant="subtle" className="w-full justify-start dark:text-slate-300 dark:hover:bg-slate-700/70" asChild><Link href="/estimates/new"><Calculator className="mr-2 h-4 w-4 text-orange-500" /> Create Estimate</Link></Button>
                        <Button variant="subtle" className="w-full justify-start dark:text-slate-300 dark:hover:bg-slate-700/70" asChild><Link href="/jobs/new"><Briefcase className="mr-2 h-4 w-4 text-orange-500" /> Schedule Job</Link></Button>
                        <Button variant="subtle" className="w-full justify-start dark:text-slate-300 dark:hover:bg-slate-700/70" asChild><Link href="/invoices/new"><FileText className="mr-2 h-4 w-4 text-orange-500" /> Send Invoice</Link></Button>
                    </div>
                </div>
                 <div>
                    <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">Pending Tasks ({stats?.tasksDueToday || 0} due today)</h4>
                    <div className="space-y-2">
                        {/* Mock tasks - replace with real data */}
                        <div className="flex items-center p-2 rounded-md bg-slate-100 dark:bg-slate-800">
                            <ListChecks className="mr-2 h-4 w-4 text-blue-500"/>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Follow up with John Doe (Estimate #EST-0010)</span>
                        </div>
                         <div className="flex items-center p-2 rounded-md bg-slate-100 dark:bg-slate-800">
                            <Clock className="mr-2 h-4 w-4 text-red-500"/>
                            <span className="text-sm text-slate-700 dark:text-slate-300">Finalize schedule for "Oak Street Project"</span>
                        </div>
                         <Button variant="outline" size="sm" className="w-full mt-2 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800" asChild>
                            <Link href="/tasks">View All Tasks</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        {/* Removed AIEstimateModal usage as it was deleted */}
        {/* 
        <AIEstimateModal 
          isOpen={isAiEstimateModalOpen} 
          onClose={() => setIsAiEstimateModalOpen(false)} 
          onEstimateGenerated={(generatedEstimate) => {
            console.log("AI Estimate Generated:", generatedEstimate);
            // Here you would typically navigate to the estimate creation page
            // pre-filled with the generated data, or save it as a draft.
            setIsAiEstimateModalOpen(false);
            // Example: router.push('/estimates/new?aiDraft=' + encodeURIComponent(JSON.stringify(generatedEstimate)));
          }}
        />
        */}

        <AISocialModal 
          isOpen={isSocialModalOpen} 
          onClose={() => setIsSocialModalOpen(false)}
          onContentGenerated={(generatedContent) => {
            console.log("AI Social Content:", generatedContent);
            setIsSocialModalOpen(false);
            // Potentially copy to clipboard or open a share dialog
          }}
        />
      </div>
    </ScrollArea>
  );
};

export default Dashboard;
