import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { signEstimate, SignatureValidationError } from "@/services/api/signatureService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// =================================================================
// Signature Canvas Component (Embedded)
// TODO: Extract to components/common/SignatureCanvas.tsx when file creation is stable
// =================================================================

interface SignatureCanvasProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  className?: string;
}

export interface SignatureCanvasHandle {
  clear: () => void;
  toDataURL: () => string; // returns base-64 PNG
  isEmpty: () => boolean;
}

export const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(
  ({ width = 400, height = 180, strokeColor = "#111827", className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    // init 2d context
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Adjust for device pixel ratio for sharper lines on high-res displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 2;
        ctx.strokeStyle = strokeColor;
        ctxRef.current = ctx;
      }
    }, [width, height, strokeColor]);

    const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      setIsDrawing(true);
      setHasDrawn(true);
      const pos = getPos(e);
      ctxRef.current?.beginPath();
      ctxRef.current?.moveTo(pos.x, pos.y);
    };

    const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      ctxRef.current?.lineTo(pos.x, pos.y);
      ctxRef.current?.stroke();
    };

    const end = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      e.preventDefault();
      setIsDrawing(false);
      ctxRef.current?.closePath();
    };

    // expose helpers
    useImperativeHandle(ref, () => ({
      clear() {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        setHasDrawn(false);
      },
      toDataURL() {
        return canvasRef.current?.toDataURL("image/png") ?? "";
      },
      isEmpty() {
        return !hasDrawn;
      }
    }));

    return (
      <canvas
        ref={canvasRef}
        className={`touch-none border rounded-md bg-white dark:bg-slate-200 ${className}`}
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={end}
        onPointerLeave={end}
      />
    );
  }
);
SignatureCanvas.displayName = "SignatureCanvas";


// =================================================================
// Signature Modal Component
// =================================================================

interface SignatureModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  estimateId: string;
  onSignatureSaved: () => void; // Callback to trigger query invalidation
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ open, onOpenChange, estimateId, onSignatureSaved }) => {
  const canvasRef = useRef<SignatureCanvasHandle>(null);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (canvasRef.current?.isEmpty()) {
        toast({
            title: "Signature Required",
            description: "Please provide a signature before saving.",
            variant: "destructive"
        });
        return;
    }

    try {
      setIsSaving(true);
      const dataURL = canvasRef.current?.toDataURL() ?? "";
      
      await signEstimate({
        estimateId,
        signerName: "Authorized Client", // Placeholder; could be an input field
        signatureData: dataURL,
        signedAt: new Date().toISOString(),
      });
      
      toast({
        title: "Estimate Approved!",
        description: "The signature has been saved successfully.",
      });

      onSignatureSaved(); // Trigger parent component to refetch data
      onOpenChange(false); // Close the modal

    } catch (err: any) {
      if (err instanceof SignatureValidationError) {
        toast({ title: "Invalid Signature", description: err.message, variant: "destructive" });
      } else {
        toast({ title: "Error Saving Signature", description: err.message, variant: "destructive" });
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleClear = () => {
    canvasRef.current?.clear();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] w-[95vw]">
        <DialogHeader>
          <DialogTitle>Approve & Sign Estimate</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <p className="text-sm text-muted-foreground text-center">
                Please sign below to approve this estimate.
            </p>
          <SignatureCanvas ref={canvasRef} className="w-full" />
          <Button variant="outline" size="sm" onClick={handleClear} className="self-start">
            Clear Signature
          </Button>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button disabled={isSaving} onClick={handleSave}>
            {isSaving ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                </>
            ) : "Approve and Save Signature"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
