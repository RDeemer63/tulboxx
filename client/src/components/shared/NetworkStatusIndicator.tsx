import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface NetworkStatusIndicatorProps {
  className?: string;
  showOfflineOnly?: boolean;
  variant?: 'subtle' | 'prominent' | 'badge';
}

/**
 * A component that shows the current network status (online/offline)
 * and can optionally display the connection quality.
 *
 * @param props NetworkStatusIndicatorProps
 * @returns React component
 */
export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  className,
  showOfflineOnly = false,
  variant = 'subtle',
}) => {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [lastOnlineTime, setLastOnlineTime] = useState<number | null>(isOnline ? Date.now() : null);

  // Periodically ping a reliable endpoint to verify actual connectivity
  // (navigator.onLine can be incorrect in some cases)
  const { isError: pingFailed } = useQuery({
    queryKey: ['networkStatus', 'ping'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/healthcheck', {
          method: 'HEAD',
          cache: 'no-cache',
          headers: { 'Cache-Control': 'no-cache' },
        });
        return response.ok;
      } catch (err) {
        throw new Error('Network ping failed');
      }
    },
    retry: 1,
    retryDelay: 1000,
    refetchInterval: isOnline ? 30000 : 5000, // Check more frequently when offline
    refetchIntervalInBackground: false,
  });

  // We consider the app offline if either the browser reports offline
  // OR our ping test fails
  const actuallyOffline = !isOnline || pingFailed;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnlineTime(Date.now());
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Only render if we're actually showing something
  if (showOfflineOnly && !actuallyOffline) {
    return null;
  }

  // Calculate how long we've been offline
  const offlineDurationMinutes = lastOnlineTime 
    ? Math.floor((Date.now() - lastOnlineTime) / 60000) 
    : null;
  
  // Display message based on offline duration
  const getOfflineMessage = () => {
    if (offlineDurationMinutes === null) return 'Offline';
    if (offlineDurationMinutes < 1) return 'Offline';
    if (offlineDurationMinutes < 60) return `Offline (${offlineDurationMinutes}m)`;
    const hours = Math.floor(offlineDurationMinutes / 60);
    return `Offline (${hours}h${offlineDurationMinutes % 60}m)`;
  };

  // Badge variant (small, icon only)
  if (variant === 'badge') {
    return (
      <div 
        className={cn(
          "rounded-full w-2 h-2", 
          actuallyOffline ? "bg-red-600" : "bg-green-600",
          className
        )}
        title={actuallyOffline ? getOfflineMessage() : "Online"}
      />
    );
  }
  
  // Subtle variant (text only)
  if (variant === 'subtle') {
    return (
      <div 
        className={cn(
          "text-xs font-medium",
          actuallyOffline 
            ? "text-red-600 dark:text-red-400" 
            : "text-green-600 dark:text-green-400",
          className
        )}
      >
        {actuallyOffline ? getOfflineMessage() : "Online"}
      </div>
    );
  }
  
  // Prominent variant (with background)
  return (
    <div 
      className={cn(
        "px-2 py-1 rounded text-xs font-semibold text-white",
        actuallyOffline 
          ? "bg-red-600 dark:bg-red-700" 
          : "bg-green-600 dark:bg-green-700",
        className
      )}
    >
      {actuallyOffline ? getOfflineMessage() : "Online"}
    </div>
  );
};

export default NetworkStatusIndicator;
