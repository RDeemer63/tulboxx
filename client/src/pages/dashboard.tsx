import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/theme-context";
import { 
  Calendar,
  UserPlus,
  FileText,
  Bot,
  Users,
  FileInput,
  Wrench,
  DollarSign,
  TrendingUp,
  Clock,
  Activity,
  ChevronRight,
  ArrowRight,
  Sun,
  Moon
} from "lucide-react";
import { Link } from "wouter";
import type { Job, Customer, Estimate, Invoice, Employee } from "@shared/schema";

interface DashboardStats {
  totalRevenue: number;
  activeJobs: number;
  totalCustomers: number;
  pendingEstimates: number;
  overdueInvoices: number;
}

interface PipelineData {
  leads: { count: number; value: number };
  quotes: { count: number; value: number };
  activeJobs: { count: number; value: number };
  invoiced: { count: number; value: number };
}

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats-optimized"],
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<(Job & { customer: Customer })[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: recentJobs = [], isLoading: recentLoading } = useQuery<(Job & { customer: Customer })[]>({
    queryKey: ["/api/dashboard/recent-jobs"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: estimates = [] } = useQuery<Estimate[]>({
    queryKey: ["/api/estimates"],
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: todaySchedule = [] } = useQuery<any[]>({
    queryKey: ["/api/dashboard/today-schedule"],
  });

  const pipelineData: PipelineData = {
    leads: { 
      count: customers.filter(c => c.status === 'lead').length, 
      value: estimates.filter(e => e.status === 'draft').reduce((sum, e) => sum + Number(e.totalAmount || 0), 0)
    },
    quotes: { 
      count: estimates.filter(e => e.status === 'sent').length, 
      value: estimates.filter(e => e.status === 'sent').reduce((sum, e) => sum + Number(e.totalAmount || 0), 0)
    },
    activeJobs: { 
      count: jobs.filter(j => j.status === 'in_progress').length, 
      value: jobs.filter(j => j.status === 'in_progress').reduce((sum, j) => sum + Number(j.estimatedValue || 0), 0)
    },
    invoiced: { 
      count: invoices.filter(i => i.status === 'sent' || i.status === 'paid').length, 
      value: invoices.filter(i => i.status === 'sent' || i.status === 'paid').reduce((sum, i) => sum + Number(i.totalAmount || 0), 0)
    }
  };

  const revenueData = [
    { name: 'Jan', revenue: 12000, jobs: 8 },
    { name: 'Feb', revenue: 15000, jobs: 10 },
    { name: 'Mar', revenue: 18000, jobs: 12 },
    { name: 'Apr', revenue: 22000, jobs: 15 },
    { name: 'May', revenue: 25000, jobs: 18 },
    { name: 'Jun', revenue: 28000, jobs: 20 },
  ];

  // Calculate metrics based on real data
  const totalRevenue = invoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0);
  const activeJobsCount = jobs.filter(job => job.status === 'in_progress').length;
  const pendingEstimatesCount = estimates.filter(estimate => estimate.status === 'sent').length;
  const overdueInvoicesCount = invoices.filter(invoice => invoice.status === 'overdue').length;

  const outstandingReceivables = {
    current: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + Number(i.totalAmount || 0), 0),
    thirtyDays: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + Number(i.totalAmount || 0), 0) * 0.7,
    sixtyDays: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + Number(i.totalAmount || 0), 0) * 0.3,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'scheduled': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Show loading state
  if (statsLoading || jobsLoading || recentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b-2 border-gray-200 dark:border-slate-700 sticky top-0 z-100 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-extrabold text-orange-500">TULBOXX</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="w-10 h-10 p-0 border-gray-300 dark:border-slate-600 hover:border-orange-500"
            >
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-sm font-bold">
                JD
              </div>
              <span className="text-sm font-medium">John Doe</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 rounded-xl p-6 border border-blue-500 dark:border-blue-700">
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
          <p className="text-blue-100 text-lg">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-300">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats?.totalRevenue || totalRevenue)}</div>
              <p className="text-xs text-gray-500 dark:text-slate-400">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-300">Active Jobs</CardTitle>
              <Wrench className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activeJobs || activeJobsCount}</div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Currently in progress</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-300">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalCustomers || customers.length}</div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Growing customer base</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-300">Pending Estimates</CardTitle>
              <FileText className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pendingEstimates || pendingEstimatesCount}</div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-300">Overdue Invoices</CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.overdueInvoices || overdueInvoicesCount}</div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Pipeline */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Sales Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pipelineData.leads.count}</div>
                <div className="text-sm text-gray-500 dark:text-slate-400 mb-2">Leads</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(pipelineData.leads.value)}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pipelineData.quotes.count}</div>
                <div className="text-sm text-gray-500 dark:text-slate-400 mb-2">Quotes</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(pipelineData.quotes.value)}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pipelineData.activeJobs.count}</div>
                <div className="text-sm text-gray-500 dark:text-slate-400 mb-2">Active Jobs</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(pipelineData.activeJobs.value)}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{pipelineData.invoiced.count}</div>
                <div className="text-sm text-gray-500 dark:text-slate-400 mb-2">Invoiced</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(pipelineData.invoiced.value)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center justify-between">
                Recent Jobs
                <Link href="/jobs">
                  <Button variant="outline" size="sm" className="text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{job.title}</div>
                      <div className="text-sm text-gray-500 dark:text-slate-400">{job.customer?.firstName} {job.customer?.lastName}</div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(job.status)} text-white`}>
                        {job.status}
                      </Badge>
                      <div className="text-sm text-gray-500 dark:text-slate-400 mt-1">{formatCurrency(Number(job.estimatedValue || 0))}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-orange-500" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaySchedule.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaySchedule.map((item, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{item?.title || 'Scheduled Item'}</div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">{item?.time || 'Time TBD'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/customers/new">
                <Button className="w-full h-20 bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center space-y-2">
                  <UserPlus className="h-6 w-6" />
                  <span className="text-sm">Add Customer</span>
                </Button>
              </Link>
              <Link href="/estimates/new">
                <Button className="w-full h-20 bg-green-600 hover:bg-green-700 flex flex-col items-center justify-center space-y-2">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Create Estimate</span>
                </Button>
              </Link>
              <Link href="/jobs/new">
                <Button className="w-full h-20 bg-purple-600 hover:bg-purple-700 flex flex-col items-center justify-center space-y-2">
                  <Wrench className="h-6 w-6" />
                  <span className="text-sm">New Job</span>
                </Button>
              </Link>
              <Link href="/ai-estimates">
                <Button className="w-full h-20 bg-orange-600 hover:bg-orange-700 flex flex-col items-center justify-center space-y-2">
                  <Bot className="h-6 w-6" />
                  <span className="text-sm">AI Estimate</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}