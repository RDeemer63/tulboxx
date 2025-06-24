import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronDown,
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Calendar,
  DollarSign,
  BarChart2,
  Settings,
  LogOut,
  Target,
  Wrench,
  Truck,
  User,
  Sun,
  Moon,
  Building,
} from 'lucide-react';

import { useAuth, Permission, Role } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
import { apiRequestJson } from '@/lib/queryClient';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// --- Type Definitions ---

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  requiredPermission?: Permission;
  requiredRole?: Role[];
  breadcrumb: string; // For use by a separate Breadcrumbs component
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface BusinessStats {
  activeLeads: number;
  estimatesPending: number;
  jobsInProgress: number;
  invoicesOverdue: number;
}

// --- Navigation Data Structure ---

const navGroups: NavGroup[] = [
  {
    title: 'Sales',
    items: [
      { label: 'Leads', href: '/pipeline', icon: Target, requiredPermission: 'view_leads', breadcrumb: 'Leads Pipeline' },
      { label: 'Estimates', href: '/estimates', icon: FileText, requiredPermission: 'view_estimates', breadcrumb: 'Estimates' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Jobs', href: '/jobs', icon: Briefcase, requiredPermission: 'view_jobs', breadcrumb: 'Jobs' },
      { label: 'Schedule', href: '/schedule', icon: Calendar, requiredPermission: 'manage_schedules', breadcrumb: 'Schedule' },
      { label: 'Work Orders', href: '/work-orders', icon: Wrench, requiredPermission: 'view_jobs', breadcrumb: 'Work Orders' },
    ],
  },
  {
    title: 'Financials',
    items: [
      { label: 'Billing', href: '/invoices', icon: DollarSign, requiredPermission: 'view_invoices', breadcrumb: 'Billing & Invoices' },
      { label: 'Insights', href: '/reports', icon: BarChart2, requiredPermission: 'view_insights', breadcrumb: 'Reports & Insights' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Customers', href: '/customers', icon: Users, requiredPermission: 'view_leads', breadcrumb: 'Customers' },
      { label: 'Team', href: '/employees', icon: User, requiredPermission: 'manage_users', breadcrumb: 'Team Management' },
      { label: 'Equipment', href: '/equipment', icon: Truck, requiredPermission: 'manage_settings', breadcrumb: 'Equipment' },
    ],
  },
];

// --- Sub-Components ---

const MetricCard: React.FC<{ label: string; value: number | string; isLoading: boolean }> = ({ label, value, isLoading }) => (
  <div className="flex-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50">
    {isLoading ? (
      <>
        <Skeleton className="h-6 w-10 mb-1" />
        <Skeleton className="h-4 w-full" />
      </>
    ) : (
      <>
        <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </>
    )}
  </div>
);

const NavigationItem: React.FC<{ item: NavItem }> = React.memo(({ item }) => {
  const [location] = useLocation();
  const isActive = location === item.href;

  return (
    <Link href={item.href}>
      <a
        className={cn(
          'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
          isActive
            ? 'bg-primary text-white'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
        )}
      >
        <item.icon className={cn('mr-3 h-5 w-5', isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
        <span>{item.label}</span>
      </a>
    </Link>
  );
});
NavigationItem.displayName = 'NavigationItem';


// --- Main Navigation Drawer Component ---

const NavigationDrawer: React.FC = () => {
  const { user, hasPermission, hasRole, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Sales: true,
    Operations: true,
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery<BusinessStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => apiRequestJson('/api/dashboard/stats-optimized'),
    // Provide placeholder data to avoid layout shifts and show structure
    placeholderData: { activeLeads: 0, estimatesPending: 0, jobsInProgress: 0, invoicesOverdue: 0 },
  });

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const filteredNavGroups = useMemo(() => {
    return navGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item => {
          const hasPerm = item.requiredPermission ? hasPermission(item.requiredPermission) : true;
          const hasReqRole = item.requiredRole ? hasRole(item.requiredRole) : true;
          return hasPerm && hasReqRole;
        }),
      }))
      .filter(group => group.items.length > 0);
  }, [hasPermission, hasRole]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-center p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <Building className="h-8 w-8 text-primary" />
        <h1 className="ml-2 text-xl font-bold text-slate-900 dark:text-slate-50">TULBOXX</h1>
      </div>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Dashboard Link */}
        <NavigationItem item={{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, breadcrumb: 'Dashboard' }} />

        {/* Business Metrics */}
        <div className="space-y-2">
          <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Overview</h3>
          <div className="flex gap-2">
            <MetricCard label="Active Leads" value={stats?.activeLeads ?? 0} isLoading={isLoadingStats} />
            <MetricCard label="Jobs Active" value={stats?.jobsInProgress ?? 0} isLoading={isLoadingStats} />
            <MetricCard label="Overdue" value={stats?.invoicesOverdue ?? 0} isLoading={isLoadingStats} />
          </div>
        </div>

        {/* Navigation Groups */}
        {filteredNavGroups.map(group => (
          <Collapsible
            key={group.title}
            open={openSections[group.title]}
            onOpenChange={() => toggleSection(group.title)}
            className="space-y-1"
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex justify-between items-center px-3 py-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{group.title}</h3>
                <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', openSections[group.title] && 'rotate-180')} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pl-3 border-l-2 border-slate-200 dark:border-slate-700 ml-3">
              {group.items.map(item => (
                <NavigationItem key={item.href} item={item} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center w-full p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
              <Avatar className="h-9 w-9 mr-3">
                <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mb-2" align="end" side="top">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <a className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </a>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <a className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </a>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/50 focus:text-red-700 dark:focus:text-red-300">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default NavigationDrawer;
