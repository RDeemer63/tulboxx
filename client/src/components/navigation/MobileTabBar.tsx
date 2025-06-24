import React, { useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Target,
  Briefcase,
  PlusCircle,
  MoreHorizontal,
  FileText,
  DollarSign,
  BarChart2,
  Settings,
  LogOut,
  User,
  Users,
  Wrench,
  Calendar,
  Truck,
} from 'lucide-react';
import { Drawer } from 'vaul';

import { useAuth, Permission, Role } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// --- Type Definitions ---
interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  requiredPermission?: Permission;
  requiredRole?: Role[];
}

// --- Navigation Data ---
// The 4 most critical items for the main tab bar
const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Leads', href: '/pipeline', icon: Target, requiredPermission: 'view_leads' },
  { label: 'Jobs', href: '/jobs', icon: Briefcase, requiredPermission: 'view_jobs' },
];

// All other navigation items for the "More" menu
const moreNavItems: NavItem[] = [
  { label: 'Estimates', href: '/estimates', icon: FileText, requiredPermission: 'view_estimates' },
  { label: 'Billing', href: '/invoices', icon: DollarSign, requiredPermission: 'view_invoices' },
  { label: 'Schedule', href: '/schedule', icon: Calendar, requiredPermission: 'manage_schedules' },
  { label: 'Work Orders', href: '/work-orders', icon: Wrench, requiredPermission: 'view_jobs' },
  { label: 'Insights', href: '/reports', icon: BarChart2, requiredPermission: 'view_insights' },
  { label: 'Customers', href: '/customers', icon: Users, requiredPermission: 'view_leads' },
  { label: 'Team', href: '/employees', icon: User, requiredPermission: 'manage_users' },
  { label: 'Equipment', href: '/equipment', icon: Truck, requiredPermission: 'manage_settings' },
];

// --- Sub-Components ---

const MobileNavItem: React.FC<{ item: NavItem; isActive: boolean }> = React.memo(({ item, isActive }) => (
  <Link href={item.href}>
    <a
      className={cn(
        'flex flex-col items-center justify-center space-y-1 p-2 flex-1 rounded-md transition-colors',
        isActive
          ? 'text-primary'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <item.icon className="h-6 w-6" />
      <span className="text-xs font-medium">{item.label}</span>
    </a>
  </Link>
));
MobileNavItem.displayName = 'MobileNavItem';

const MoreMenuItem: React.FC<{ item: NavItem }> = React.memo(({ item }) => (
  <Drawer.Close asChild>
    <Link href={item.href}>
      <a className="flex items-center p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
        <item.icon className="h-5 w-5 mr-4 text-slate-500 dark:text-slate-400" />
        <span className="text-base font-medium text-slate-800 dark:text-slate-200">{item.label}</span>
      </a>
    </Link>
  </Drawer.Close>
));
MoreMenuItem.displayName = 'MoreMenuItem';

// --- Main Mobile Tab Bar Component ---

const MobileTabBar: React.FC = () => {
  const { user, logout, hasPermission, hasRole } = useAuth();
  const [location] = useLocation();

  // Filter navigation items based on user permissions
  const visibleMainNavItems = useMemo(
    () => mainNavItems.filter(item => 
      item.requiredPermission ? hasPermission(item.requiredPermission) : true
    ),
    [hasPermission]
  );

  const visibleMoreNavItems = useMemo(
    () => moreNavItems.filter(item => 
      item.requiredPermission ? hasPermission(item.requiredPermission) : true
    ),
    [hasPermission]
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-around h-16 px-2">
        {visibleMainNavItems.map(item => (
          <MobileNavItem key={item.href} item={item} isActive={location === item.href} />
        ))}

        {/* Quick Add Button */}
        <Link href="/jobs/new">
          <a className="flex flex-col items-center justify-center p-2 flex-1 text-primary">
            <PlusCircle className="h-8 w-8" strokeWidth={1.5} />
            <span className="text-xs font-medium mt-0.5">Add Job</span>
          </a>
        </Link>

        {/* More Menu Drawer */}
        <Drawer.Root>
          <Drawer.Trigger asChild>
            <button className="flex flex-col items-center justify-center space-y-1 p-2 flex-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <MoreHorizontal className="h-6 w-6" />
              <span className="text-xs font-medium">More</span>
            </button>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40" />
            <Drawer.Content className="bg-slate-50 dark:bg-slate-800 flex flex-col rounded-t-[10px] h-[90%] mt-24 fixed bottom-0 left-0 right-0">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-t-[10px] flex-1">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-300 dark:bg-slate-600 mb-4" />
                
                {/* User Profile Section */}
                <div className="flex items-center p-3 mb-4">
                   <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
                    <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
                  </div>
                </div>

                {/* Navigation List */}
                <div className="space-y-1">
                  {visibleMoreNavItems.map(item => (
                    <MoreMenuItem key={item.href} item={item} />
                  ))}
                  <MoreMenuItem item={{ label: 'Settings', href: '/settings', icon: Settings, requiredPermission: 'manage_settings' }} />
                </div>
                
                {/* Logout Button */}
                <div className="mt-6">
                  <Drawer.Close asChild>
                    <button onClick={logout} className="w-full flex items-center justify-center p-3 rounded-lg bg-slate-200 dark:bg-slate-700/50 text-red-600 dark:text-red-400 font-semibold transition-colors hover:bg-red-100 dark:hover:bg-red-900/50">
                      <LogOut className="mr-3 h-5 w-5" />
                      Log Out
                    </button>
                  </Drawer.Close>
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </nav>
  );
};

export default MobileTabBar;
