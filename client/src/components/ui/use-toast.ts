/**
 * Legacy Re-export  ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
 *
 * Several V1 components still import the toast hook from
 * `@/components/ui/use-toast`.  The canonical implementation was moved to
 * `@/hooks/use-toast.ts` during the UI library consolidation.  To avoid
 * sweeping refactors (and accidental circular deps) we keep this thin
 * re-export.  Remove only when all legacy references are cleaned up.
 */
export { useToast } from '@/hooks/use-toast';
