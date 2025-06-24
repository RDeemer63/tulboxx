import React, { useState, useEffect } from 'react';
import { Link, useLocation, useRouter } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type BusinessProfile } from '@shared/schema'; // Assuming this path is correct
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth hook

// Lucide Icons for V2 Navigation
import {
  Users, // Leads & Customers
  Calculator, // Estimates
  Briefcase, // Jobs & Scheduling
  ClipboardCheck, // Work Session
  CreditCard, // Billing
  BarChart3, // Insights
  Settings as SettingsIcon, // Settings Dashboard
  Building2, // Business Profile
  UsersRound, // Employees (distinct from primary Users)
  SlidersHorizontal, // Application Settings
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  MoreHorizontal,
  Wrench, // Fallback for logo
  ToggleLeft,
  ToggleRight,
  Sun,
  Moon,
  ShieldCheck, // Icon for Admin section
} from 'lucide-react';

// V1 Sidebar (for fallback when V2 flag is off)
import V1Sidebar, { MobileNav as V1MobileNav } from '../sidebar'; // Assuming correct path to old sidebar

// --- Feature Flag Utility ---\n// (This is a local V2 Nav toggle, not the main Feature Flag system we built)
const V2_NAVIGATION_FLAG_KEY = 'tulboxx_nav_v2_enabled';
const V2_NAVIGATION_QUERY_PARAM = 'nav_v2';

export const getIsV2NavigationEnabled = (): boolean => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.has(V2_NAVIGATION_QUERY_PARAM)) {
      const paramValue = params.get(V2_NAVIGATION_QUERY_PARAM);
      // Store the query param setting in localStorage for persistence across reloads without param
      if (paramValue === 'true') {
        localStorage.setItem(V2_NAVIGATION_FLAG_KEY, 'true');
        return true;
      } else if (paramValue === 'false') {
        localStorage.setItem(V2_NAVIGATION_FLAG_KEY, 'false');
        return false;
      }
    }
    return localStorage.getItem(V2_NAVIGATION_FLAG_KEY) === 'true';
  }
  return false; // Default to V1 navigation if window is not defined
};

export const setIsV2NavigationEnabled = (enabled: boolean): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(V2_NAVIGATION_FLAG_KEY, enabled ? 'true' : 'false');
    // Remove query param to avoid conflict after manual toggle
    const params = new URLSearchParams(window.location.search);
    params.delete(V2_NAVIGATION_QUERY_PARAM);
    const newSearch = params.toString();
    window.location.search = newSearch ? `?${newSearch}` : ''; // Reload to apply change
  }
};

// --- V2 Navigation Definitions ---\n
interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  matchPaths?: string[]; // For more complex active state matching
}

const v2PrimaryNavigation: NavItem[] = [
  { name: 'Leads', href: '/modern-leads', icon: Users, matchPaths: ['/', '/modern-leads'] }, // Default to Leads
  { name: 'Estimates', href: '/modern-estimates', icon: Calculator },
  { name: 'Jobs', href: '/modern-jobs', icon: Briefcase },
  { name: 'Work', href: '/modern-work', icon: ClipboardCheck },
  { name: 'Billing', href: '/modern-billing', icon: CreditCard },
  { name: 'Insights', href: '/modern-insights', icon: BarChart3 },
];

const v2SecondaryNavigation: NavItem[] = [
  { name: 'Business Profile', href: '/modern-settings/profile', icon: Building2 },
  { name: 'Employees', href: '/modern-settings/employees', icon: UsersRound },
  { name: 'App Settings', href: '/modern-settings/application', icon: SlidersHorizontal },
];

const v2AdminNavigation: NavItem[] = [
  { name: 'Feature Flags', href: '/admin/feature-flags', icon: ShieldCheck },
  // Add other admin links here in the future, e.g., User Management, System Logs
];

// --- V2 Desktop Sidebar Component ---\n
const V2DesktopSidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [location] = useLocation();
  const { data: profile } = useQuery<BusinessProfile>({
    queryKey: ['/api/business-profile'],
  });
  const { user } = useAuth(); 
  const isAdmin = user?.role === 'admin'; 

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some(path => location === path || (path !== '/' && location.startsWith(path)));
    }
    return location === item.href || (item.href !== '/' && location.startsWith(item.href));
  };
  
  const handleLogout = () => {
    // Add actual logout logic here (e.g., clear token, call API)
    localStorage.clear(); // Example: clear all local storage
    window.location.href = '/login'; // Redirect to login
  };

  return (
    <div
      className={cn(
        'hidden md:flex md:flex-col bg-slate-900 text-slate-100 shadow-lg transition-all duration-300 relative border-r border-slate-700',
        isCollapsed ? 'md:w-20' : 'md:w-64'
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-16 bg-slate-800 border border-slate-700 rounded-full p-1.5 shadow-md hover:bg-slate-700 transition-colors z-10 text-slate-400 hover:text-slate-100"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Logo Header */}
      <div className="flex items-center h-16 px-4 shrink-0">
        <div className={cn("flex items-center space-x-3", isCollapsed && "justify-center w-full")}>
          <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-primary-hover rounded-lg flex items-center justify-center shadow-md shrink-0">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-brand-primary tracking-tight">TULBOXX</span>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {v2PrimaryNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  'flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out group',
                  active
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-brand-primary',
                  isCollapsed && 'justify-center'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={cn('h-5 w-5 shrink-0', isCollapsed ? 'mx-auto' : 'mr-3')} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </a>
            </Link>
          );
        })}

        {!isCollapsed && (
          <>
            <div className="pt-4 mt-4 border-t border-slate-700">
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Settings
              </h3>
              {v2SecondaryNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={cn(
                        'flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out group',
                        active
                          ? 'bg-slate-700 text-slate-100'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
                      )}
                    >
                      <Icon className="h-5 w-5 mr-3 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </a>
                  </Link>
                );
              })}
            </div>

            {isAdmin && (
              <div className="pt-4 mt-4 border-t border-slate-700">
                <h3 className="px-3 text-xs font-semibold text-red-400 uppercase tracking-wider mb-2"> {/* Distinct color for Admin heading */}
                  Admin Tools 
                </h3>
                {v2AdminNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  return (
                    <Link key={item.name} href={item.href}>
                      <a
                        className={cn(
                          'flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out group',
                          active
                            ? 'bg-red-600 text-white' // Distinct active state for admin links
                            : 'text-slate-400 hover:bg-slate-800 hover:text-red-400',
                        )}
                      >
                        <Icon className="h-5 w-5 mr-3 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </a>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </nav>
      
      {/* Profile & Logout Section */}
      <div className="p-3 border-t border-slate-700 shrink-0">
         <V2FeatureFlagToggle isCollapsed={isCollapsed} />
        <div className={cn("flex items-center mt-2", isCollapsed && "justify-center")}>
          <Avatar className={cn("h-9 w-9 shrink-0", isCollapsed && "h-10 w-10")}>
            <AvatarImage src={profile?.logoUrl || undefined} alt={profile?.ownerName || 'User'} />
            <AvatarFallback className="bg-brand-primary text-white">
              {profile?.ownerName?.substring(0,1) || 'U'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-100 truncate">
                {profile?.ownerName || 'Business Owner'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {profile?.businessName || 'Service Pro'}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="ml-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- V2 Mobile Bottom Navigation Component ---\n
const V2MobileBottomNav: React.FC = () => {
  const [location] = useLocation();
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const { data: profile } = useQuery<BusinessProfile>({
    queryKey: ['/api/business-profile'],
  });
  const { user } = useAuth(); 
  const isAdmin = user?.role === 'admin'; 

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some(path => location === path || (path !== '/' && location.startsWith(path)));
    }
    return location === item.href || (item.href !== '/' && location.startsWith(item.href));
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  // Display only the first 4 primary items, \"More\" for the rest + secondary + admin
  const mainMobileNavItems = v2PrimaryNavigation.slice(0, 4);
  const moreSheetNavItems = [
    ...v2PrimaryNavigation.slice(4),
    ...v2SecondaryNavigation,
    // Admin items will be added conditionally below
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 shadow-top-lg z-50">
        <nav className="flex justify-around items-center h-16">
          {mainMobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    'flex flex-col items-center justify-center flex-1 p-2 rounded-md transition-colors duration-150 ease-in-out',
                    active ? 'text-brand-primary' : 'text-slate-400 hover:text-brand-primary-hover'
                  )}
                >
                  <Icon className="h-6 w-6 mb-0.5" />
                  <span className="text-xs font-medium truncate">{item.name}</span>
                </a>
              </Link>
            );
          })}
          <button
            onClick={() => setIsMoreSheetOpen(true)}
            className="flex flex-col items-center justify-center flex-1 p-2 text-slate-400 hover:text-brand-primary-hover"
            aria-label="More options"
          >
            <MoreHorizontal className="h-6 w-6 mb-0.5" />
            <span className="text-xs font-medium">More</span>
          </button>
        </nav>
      </div>

      <Sheet open={isMoreSheetOpen} onOpenChange={setIsMoreSheetOpen}>
        <SheetContent side="bottom" className="h-[75vh] flex flex-col bg-slate-900 text-slate-100 p-0 border-t border-slate-700">
          <SheetHeader className="p-4 border-b border-slate-700">
            <SheetTitle className="text-brand-primary">More Options</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-1"> {/* Changed space-y-2 to space-y-1 for tighter packing */}
            {moreSheetNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link key={item.name} href={item.href} onClick={() => setIsMoreSheetOpen(false)}>
                  <a
                    className={cn(
                      'flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out group',
                      active ? 'bg-brand-primary text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                    )}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              );
            })}
            {isAdmin && (
              <div className="pt-3 mt-3 border-t border-slate-700"> {/* Reduced pt and mt */}
                <h3 className="px-3 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
                  Admin Tools
                </h3>
                {v2AdminNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setIsMoreSheetOpen(false)}>
                      <a
                        className={cn(
                          'flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out group',
                          active ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-red-400'
                        )}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <span>{item.name}</span>
                      </a>
                    </Link>
                  );
                })}
              </div>
            )}
             <div className="pt-3 mt-3 border-t border-slate-700"> {/* Reduced pt and mt */}
                <V2FeatureFlagToggle isCollapsed={false} isMobileContext={true} />
            </div>
          </div>
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center mb-3">\n              <Avatar className="h-10 w-10">\n                <AvatarImage src={profile?.logoUrl || undefined} alt={profile?.ownerName || 'User'} />\n                <AvatarFallback className="bg-brand-primary text-white">{profile?.ownerName?.substring(0,1) || 'U'}</AvatarFallback>\n              </Avatar>\n              <div className="ml-3">\n                <p className="text-sm font-medium text-slate-100">{profile?.ownerName || 'Business Owner'}</p>\n                <p className="text-xs text-slate-400">{profile?.businessName || 'Service Pro'}</p>\n              </div>\n            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-slate-100"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

// --- Feature Flag Toggle Component (for development/testing) ---\n
const V2FeatureFlagToggle: React.FC<{ isCollapsed?: boolean, isMobileContext?: boolean }> = ({ isCollapsed, isMobileContext }) => {
  const [isV2, setIsV2] = useState(getIsV2NavigationEnabled());

  const toggleFeatureFlag = () => {
    const newV2State = !isV2;
    setIsV2(newV2State);
    setIsV2NavigationEnabled(newV2State); // This will reload the page
  };

  if (isMobileContext) {
    return (
         <button
            onClick={toggleFeatureFlag}
            className={cn(
                'flex items-center w-full px-3 py-3 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out group text-slate-300 hover:bg-slate-800 hover:text-slate-100'
            )}
            title={isV2 ? "Switch to V1 Nav" : "Switch to V2 Nav"}
        >
            {isV2 ? <ToggleRight className="h-5 w-5 mr-3 text-green-500" /> : <ToggleLeft className="h-5 w-5 mr-3 text-slate-500" />}
            <span>{isV2 ? "V2 Nav (Active)" : "V1 Nav (Active)"}</span>
        </button>
    )
  }

  return (
    <button
      onClick={toggleFeatureFlag}
      className={cn(
        'flex items-center w-full px-3 py-2 text-xs font-medium rounded-md transition-colors duration-150 ease-in-out group mb-2',
        isV2 ? 'bg-green-800 hover:bg-green-700 text-green-100' : 'bg-slate-700 hover:bg-slate-600 text-slate-300',
        isCollapsed && 'justify-center py-3'
      )}
      title={isV2 ? "Switch to V1 Navigation" : "Switch to V2 Navigation"}
    >\n      {isV2 ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}\n      {!isCollapsed && <span className="ml-2 truncate">{isV2 ? "V2 Nav On" : "V1 Nav On"}</span>}
    </button>
  );
};


// --- Main Navigation Wrapper ---\n
// This component will decide whether to render V1 or V2 navigation based on the flag.\n
const V2NavigationWrapper: React.FC = () => {
  const [isV2Enabled, setIsV2Enabled] = useState(getIsV2NavigationEnabled());
  const router = useRouter(); // For listening to route changes to re-evaluate flag
  const [location] = useLocation(); // Added to satisfy useEffect dependency array

  useEffect(() => {
    // This effect ensures that if the flag is changed via query param,
    // the component re-renders with the correct navigation.
    const checkFlag = () => {
      const currentFlagState = getIsV2NavigationEnabled();
      if (currentFlagState !== isV2Enabled) {
        setIsV2Enabled(currentFlagState);
      }
    };
    checkFlag(); // Initial check
    
    // Re-check on route changes if needed, though localStorage change should trigger reload
    // For wouter, direct listening to route changes for this purpose is less straightforward
    // than with React Router context. The reload on setIsV2NavigationEnabled handles this.
  }, [location, isV2Enabled, router]);


  if (isV2Enabled) {
    return (
      <>
        <V2DesktopSidebar />
        <V2MobileBottomNav />
        {/* The main content area will be rendered by the V2Router in App.tsx */}
      </>
    );
  } else {
    // Render V1 Sidebar and MobileNav
    // V1Sidebar is the default export from '../sidebar'
    // V1MobileNav is a named export from '../sidebar'
    // The V1Router (or existing router in App.tsx) will handle content.
    // This component only provides the navigation chrome.
    return (
      <>
        <V1Sidebar />
        {/* V1 mobile header is typically part of the main layout in App.tsx, 
           but if it's part of V1Sidebar component, it's handled.
           If V1MobileNav from sidebar.tsx is a separate top bar, include it here.
           Based on App.tsx, MobileNav is rendered inside the main layout.
           So, V2NavigationWrapper, when rendering V1, might only need to render V1Sidebar.
           The App.tsx would then conditionally render V1MobileNav or a V2 mobile header.
           For simplicity here, assuming V1Sidebar handles its own mobile trigger or App.tsx handles V1 mobile header.
        */}
      </>
    );
  }
};

export default V2NavigationWrapper;

// Helper component for the mobile header in App.tsx if V2 is enabled\n
export const V2MobileHeader: React.FC = () => {
  // You can add a V2 specific mobile header here if needed, distinct from V1's.
  // For now, let's assume the V2MobileBottomNav is sufficient and App.tsx might not need a V2-specific top header.
  // Or, it could be a simple logo bar.
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user } = useAuth(); 
  const isAdmin = user?.role === 'admin'; 
  const [location] = useLocation(); // To determine active state for links in sheet

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some(path => location === path || (path !== '/' && location.startsWith(path)));
    }
    return location === item.href || (item.href !== '/' && location.startsWith(item.href));
  };

  return (
    <div className="md:hidden bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between h-16">
       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="text-slate-300 hover:text-brand-primary-hover">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] bg-slate-900 text-slate-100 p-0 border-r border-slate-700">
            <SheetHeader className="p-4 border-b border-slate-700">
                <SheetTitle className="text-brand-primary">Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto"> {/* Changed space-y-2 to space-y-1 */}
                {v2PrimaryNavigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item);
                    return (
                        <Link key={item.name} href={item.href} onClick={() => setIsSheetOpen(false)}>
                            <a className={cn(
                                'flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out group',
                                active ? 'bg-brand-primary text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                            )}>
                                <Icon className="h-5 w-5 mr-3" />
                                <span>{item.name}</span>
                            </a>
                        </Link>
                    );
                })}
                <div className="pt-3 mt-3 border-t border-slate-700"> {/* Reduced pt and mt */}
                    <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Settings
                    </h3>
                    {v2SecondaryNavigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item);
                        return (
                            <Link key={item.name} href={item.href} onClick={() => setIsSheetOpen(false)}>
                                <a className={cn(
                                    'flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out group',
                                    active ? 'bg-slate-700 text-slate-100' : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                                )}>
                                    <Icon className="h-5 w-5 mr-3" />
                                    <span>{item.name}</span>
                                </a>
                            </Link>
                        );
                    })}
                </div>
                {isAdmin && (
                  <div className="pt-3 mt-3 border-t border-slate-700"> {/* Reduced pt and mt */}
                      <h3 className="px-3 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
                          Admin Tools
                      </h3>
                      {v2AdminNavigation.map((item) => {
                          const Icon = item.icon;
                          const active = isActive(item);
                          return (
                              <Link key={item.name} href={item.href} onClick={() => setIsSheetOpen(false)}>
                                  <a className={cn(
                                      'flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out group',
                                      active ? 'bg-red-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-red-400'
                                  )}>
                                      <Icon className="h-5 w-5 mr-3" />
                                      <span>{item.name}</span>
                                  </a>
                              </Link>
                          );
                      })}
                  </div>
                )}
                 <div className="pt-3 mt-3 border-t border-slate-700"> {/* Reduced pt and mt */}
                    <V2FeatureFlagToggle isCollapsed={false} isMobileContext={true} />
                </div>
            </nav>
        </SheetContent>
      </Sheet>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-primary-hover rounded-lg flex items-center justify-center shadow-sm">
          <Wrench className="h-4 w-4 text-white" />
        </div>
        <span className="text-xl font-bold text-brand-primary tracking-tight">TULBOXX</span>
      </div>
      {/* Placeholder for potential right-side icons like notifications or user avatar */}
      <div className="w-10\"></div> 
    </div>
  );
};
