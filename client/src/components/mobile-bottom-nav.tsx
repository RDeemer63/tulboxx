import { Link, useLocation } from "wouter";
import { 
  Home, 
  Briefcase, 
  Clock, 
  Calendar,
  User 
} from "lucide-react";

export default function MobileBottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/mobile", label: "Home", icon: Home },
    { href: "/mobile/jobs", label: "Jobs", icon: Briefcase },
    { href: "/mobile/time", label: "Time", icon: Clock },
    { href: "/schedule", label: "Schedule", icon: Calendar },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50 lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <div className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${
              location === href
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}>
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}