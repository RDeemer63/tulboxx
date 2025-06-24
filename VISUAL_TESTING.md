# FOUNDATION LAYER: VISUAL TESTING GUIDE 🎨

This document outlines how to visually test the new foundation layer components implemented in the Tulboxx CRM application.

## 1. Error Boundary Testing

The Error Boundary component can be tested by intentionally causing errors in components:

```tsx
// Example component that will trigger an error
const BuggyComponent: React.FC = () => {
  const [shouldError, setShouldError] = useState(false);
  
  if (shouldError) {
    throw new Error("Test error triggered");
  }
  
  return (
    <div className="p-4 border rounded">
      <h3 className="mb-4">Error Boundary Test</h3>
      <button 
        className="px-4 py-2 bg-red-500 text-white rounded" 
        onClick={() => setShouldError(true)}
      >
        Trigger Error
      </button>
    </div>
  );
};

// Wrap with ErrorBoundary to see it in action
<ErrorBoundary>
  <BuggyComponent />
</ErrorBoundary>
```

Visual Result:
- When the error is triggered, you should see a styled error card with:
  - Error icon in red circle
  - "Something went wrong" title
  - Error message details
  - "Try Again" button that resets the boundary

## 2. Loading Spinner Variants

The LoadingSpinner component supports multiple variants and sizes:

```tsx
// Inline variant (default)
<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />

// With text
<LoadingSpinner text="Loading data..." />

// Overlay variant (absolute positioned inside parent)
<div className="relative h-64 border rounded">
  <LoadingSpinner variant="overlay" text="Processing..." />
</div>

// Full page variant
<LoadingSpinner variant="fullPage" size="lg" text="Initializing application..." />
```

Visual Results:
- Inline: Blue spinner with optional text next to it
- Overlay: Semi-transparent background with centered spinner
- Full Page: Fixed position with backdrop and centered spinner

## 3. Mock Mode Indicator

The MockModeIndicator appears in development mode:

```tsx
{import.meta.env.DEV && <MockModeIndicator />}
```

Visual Result:
- Pill in bottom-right corner showing:
  - Orange circle when mock mode is active
  - Green circle when using live API
  - "Toggle" button to switch between modes
  - Toast notification when toggled

## 4. Feature Flag Guard

The FeatureFlagGuard component conditionally renders UI based on feature flags:

```tsx
<FeatureFlagGuard 
  feature="enableNewToastSystem" 
  fallback={<LegacyToaster />}
>
  <Toaster />
</FeatureFlagGuard>
```

Testing Strategy:
1. Toggle the feature flag using the developer console:
   ```js
   import { toggleFeature } from "@/shared/featureFlags";
   toggleFeature("enableNewToastSystem");
   ```
2. Observe the UI update in real-time between the new component and fallback

## 5. App Initializer

The AppInitializer component shows loading state during initialization and handles errors:

```tsx
<AppInitializer>
  <YourApplication />
</AppInitializer>
```

To test error handling:
1. Modify `AppInitializer.tsx` to simulate an initialization error
   ```tsx
   useEffect(() => {
     const initializeApp = async () => {
       try {
         // Simulate error
         throw new Error("Test initialization failure");
         
         // Rest of initialization code...
       } catch (error) {
         setInitError(error as Error);
       }
     };
     
     initializeApp();
   }, []);
   ```
2. Observe the error UI with reload button

## 6. Toast System

Test the toast notification system:

```tsx
import { useToast } from "@/components/ui/use-toast";

const { toast } = useToast();

// Different toast variants
toast({
  title: "Success!",
  description: "Operation completed successfully",
  variant: "success",
  duration: 3000,
});

toast({
  title: "Error!",
  description: "Something went wrong",
  variant: "destructive",
  duration: 5000,
});

toast({
  title: "Info",
  description: "New updates available",
  variant: "default",
  duration: 3000,
});
```

Visual Results:
- Each toast should slide in from the top-right
- Proper styling based on variant (green for success, red for error)
- Auto-dismiss after duration
- Manual dismiss with "X" button

## 7. Blue Steel Design System Verification

Look for consistent use of design system colors:
- Primary blue (#0070D2)
- Accent orange (#FF8C00)
- Proper dark mode support with color adjustments
- 4px spacing increments
- Proper shadow system for overlays and cards
- Inter font family consistency

## Next Steps

After confirming these foundation components work correctly, proceed to:
1. Implement missing context providers (if needed)
2. Integrate navigation shell enhancements
3. Begin work on individual feature modules using these foundation components
