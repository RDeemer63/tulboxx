import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";

interface MobileAwareLayoutProps {
  children: React.ReactNode;
}

export default function MobileAwareLayout({ children }: MobileAwareLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Navigation items for mobile
  const navigationItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/mobile", label: "Field View", icon: "📱" },
    { href: "/jobs", label: "Jobs", icon: "🔧" },
    { href: "/customers", label: "Customers", icon: "👥" },
    { href: "/schedule", label: "Schedule", icon: "📅" },
    { href: "/time-tracking", label: "Time", icon: "⏰" },
    { href: "/invoices", label: "Invoices", icon: "💰" },
  ];

  return (
    <div className={`${isMobile ? 'mobile-layout' : 'desktop-layout'}`}>
      {isMobile ? (
        <>
          {/* Mobile Header */}
          <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">T</span>
                      </div>
                      <span className="text-xl font-bold text-slate-900">Tulboxx</span>
                    </div>
                  </div>
                  
                  <nav className="flex-1 p-4">
                    <div className="space-y-2">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            location === item.href 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                            <span className="text-lg">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-lg font-bold text-slate-900">Tulboxx</span>
            </div>

            <div className="w-10"></div>
          </div>

          {/* Mobile Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </>
      ) : (
        children
      )}
    </div>
  );
}