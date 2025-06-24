import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export function useDeviceDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent;
      
      // Check for mobile devices
      const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const widthCheck = width <= 768;
      
      setIsMobile(mobileCheck || widthCheck);
      setIsTablet(width > 768 && width <= 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return { isMobile, isTablet };
}

interface SmartRedirectProps {
  children: React.ReactNode;
}

export function SmartMobileRedirect({ children }: SmartRedirectProps) {
  const { isMobile } = useDeviceDetection();
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    // Auto-redirect to mobile views for field technicians on mobile devices
    if (isMobile && !location.startsWith('/mobile') && !location.startsWith('/login') && !location.startsWith('/register')) {
      // Map desktop routes to mobile equivalents
      if (location === '/jobs') {
        setLocation('/mobile/jobs');
      } else if (location === '/time-tracking') {
        setLocation('/mobile/time');
      } else if (location === '/dashboard' || location === '/') {
        setLocation('/mobile');
      }
    }
  }, [isMobile, location, setLocation]);

  return <>{children}</>;
}