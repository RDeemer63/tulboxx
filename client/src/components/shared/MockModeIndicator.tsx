import React, { useState, useEffect } from 'react';
import { isMockApiEnabled, setApiMode } from '@/lib/api-config';
import { useToast } from '@/components/ui/use-toast';

/**
 * A visual indicator that shows when mock API mode is enabled.
 * Only shown in development mode.
 */
export const MockModeIndicator: React.FC = () => {
  const [isMockMode, setIsMockMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check initial mock mode status
    setIsMockMode(isMockApiEnabled());
  }, []);

  const toggleMockMode = () => {
    const newMode = !isMockMode;
    setApiMode(newMode ? 'mock' : 'live');
    setIsMockMode(newMode);

    toast({
      title: newMode ? 'Mock Mode Enabled' : 'Live API Mode Enabled',
      description: newMode 
        ? 'Using mocked data instead of live API' 
        : 'Using real API endpoints',
      variant: newMode ? 'default' : 'success',
      duration: 2000,
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md border border-slate-200 bg-white/90 p-2 shadow-md backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-center gap-1">
        <div 
          className={`h-3 w-3 rounded-full ${isMockMode ? 'bg-orange-500' : 'bg-green-500'}`}
        ></div>
        <span className="text-xs font-medium">
          {isMockMode ? 'Mock' : 'Live'}
        </span>
      </div>
      <button
        onClick={toggleMockMode}
        className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        Toggle
      </button>
    </div>
  );
};

export default MockModeIndicator;
