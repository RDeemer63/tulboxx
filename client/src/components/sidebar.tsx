import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/contexts/theme-context";
import { type BusinessProfile } from "@shared/schema";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calculator, 
  FileText, 
  Calendar,
  Wrench,
  Bot,
  Share2,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Camera,
  Clock,
  Target,
  Wand2
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Contacts", href: "/customers", icon: Users },
  { name: "Pipeline", href: "/pipeline", icon: Target },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Work Orders", href: "/work-orders", icon: Wrench },
  { name: "Time Tracking", href: "/time-tracking", icon: Clock },
  { name: "Estimates", href: "/estimates", icon: Calculator },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Photos", href: "/photos", icon: Camera },
  { name: "Documents", href: "/documents", icon: FolderOpen },
];

const aiNavigation = [
  { name: "Social Media", href: "/social-media", icon: Share2, badge: "New" },
];

const secondaryNavigation = [
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Business Profile", href: "/profile", icon: Settings },
  { name: "Settings", href: "/settings", icon: Settings },
];

// Mobile sidebar content that closes after navigation
function MobileSidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const [location] = useLocation();

  const handleNavigate = (href: string) => {
    // Close mobile menu when navigating
    onNavigate();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
            <Wrench className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-extrabold text-orange-500 tracking-tight">TULBOXX</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Main Navigation */}
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href} onClick={() => handleNavigate(item.href)}>
              <div className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out cursor-pointer",
                isActive 
                  ? "bg-orange-500 text-white border border-orange-400" 
                  : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
              )}>
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </div>
            </Link>
          );
        })}

        {/* AI Features Section */}
        <div className="pt-6 mt-6 border-t border-gray-200 dark:border-slate-700">
          <div className="px-4 mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"></div>
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                AI POWERED
              </p>
            </div>
          </div>
          {aiNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href} onClick={() => handleNavigate(item.href)}>
                <div className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out cursor-pointer group",
                  isActive 
                    ? "bg-orange-500 text-white border border-orange-400" 
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                )}>
                  <Icon className="h-5 w-5 mr-3 text-orange-500 group-hover:text-orange-400 transition-colors" />
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto bg-orange-100 text-orange-800 text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="pt-6 mt-6 border-t border-gray-200 dark:border-slate-700">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href} onClick={() => handleNavigate(item.href)}>
                <div className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out cursor-pointer",
                  isActive 
                    ? "bg-orange-500 text-white border border-orange-400" 
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                )}>
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// Desktop sidebar content with expandable/collapsible design
function SidebarContent({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const [location] = useLocation();
  
  // Fetch business profile for user display
  const { data: profile } = useQuery<BusinessProfile>({
    queryKey: ["/api/business-profile"],
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Logo Header */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
            <Wrench className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-extrabold text-orange-500 tracking-tight">TULBOXX</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {/* Main Navigation */}
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer group",
                isActive 
                  ? "bg-orange-500 text-white shadow-lg" 
                  : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
              )}>
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-3 truncate">{item.name}</span>
                )}
              </div>
            </Link>
          );
        })}

        {/* AI Features Section */}
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-slate-700">
          {aiNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-orange-500 text-white shadow-lg" 
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                )}>
                  <Icon className="h-5 w-5 flex-shrink-0 text-orange-400" />
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 truncate">{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="pt-4 mt-4 border-t border-gray-200 dark:border-slate-700">
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-orange-500 text-white shadow-lg" 
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                )}>
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="ml-3 truncate">{item.name}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile at Bottom - Fixed Position */}
      <div className="p-2 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center px-3 py-2 rounded-lg bg-blue-600 dark:bg-blue-700">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">TB</span>
          </div>
          {!isCollapsed && (
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {profile?.ownerName || "Business Owner"}
              </p>
              <p className="text-xs text-blue-200 truncate">
                {profile?.businessName || "Service Pro"}
              </p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="ml-2 p-1 rounded hover:bg-blue-600 transition-colors"
              title="Logout"
            >
              <svg className="h-4 w-4 text-blue-200 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Mobile Navigation Component
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 w-[280px]">
        <MobileSidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

// Desktop Sidebar Component with expand/collapse functionality
export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "hidden md:flex md:flex-col bg-blue-600 shadow-lg transition-all duration-300 relative",
      isCollapsed ? "md:w-16" : "md:w-64"
    )}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>

      <SidebarContent isCollapsed={isCollapsed} />
    </div>
  );
}
