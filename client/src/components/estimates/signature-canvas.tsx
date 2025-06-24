import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignatureCanvasProps {
  width?: number;
  height?: number;
  penColor?: string;
  penWidth?: number;
  backgroundColor?: string;
  onSignatureEnd?: (dataUrl: string | null) => void; // Callback when a stroke is finished
  onSignatureChange?: (isEmpty: boolean, dataUrl: string | null) => void; // Callback on any change (draw, clear)
  initialDataURL?: string | null;
  className?: string;
  disabled?: boolean;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  width = 500, // Default width
  height = 200, // Default height
  penColor = '#333333', // Dark grey
  penWidth = 2,
  backgroundColor = '#FFFFFF', // White background
  onSignatureEnd,
  onSignatureChange,
  initialDataURL,
  className,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDataUrl, setCurrentDataUrl] = useState<string | null>(null);

  const getContext = useCallback((): CanvasRenderingContext2D | null => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext('2d') : null;
  }, []);

  const clearCanvas = useCallback(() => {
    const ctx = getContext();
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setIsEmpty(true);
      setCurrentDataUrl(null);
      if (onSignatureChange) {
        onSignatureChange(true, null);
      }
    }
  }, [getContext, backgroundColor, onSignatureChange]);
  
  const loadSignatureFromDataURL = useCallback((dataURL: string) => {
    const ctx = getContext();
    const canvas = canvasRef.current;
    if (ctx && canvas) {
      const image = new Image();
      image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear before drawing
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        setIsEmpty(false);
        setCurrentDataUrl(dataURL);
         if (onSignatureChange) {
          onSignatureChange(false, dataURL);
        }
      };
      image.onerror = () => {
        console.error("Failed to load initial signature image.");
        setError("Failed to load existing signature.");
        clearCanvas(); // Clear if image load fails
      };
      image.src = dataURL;
    }
  }, [getContext, clearCanvas, onSignatureChange]);


  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (canvas && ctx) {
      // Set canvas dimensions (important for high-DPI screens)
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Set drawing styles
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Initial clear / load
      if (initialDataURL) {
        loadSignatureFromDataURL(initialDataURL);
      } else {
        clearCanvas();
      }
    }
  }, [width, height, penColor, penWidth, backgroundColor, getContext, clearCanvas, initialDataURL, loadSignatureFromDataURL]);


  const getCoordinates = (event: MouseEvent | TouchEvent): { x: number; y: number } | null => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    let x, y;
    if (event instanceof MouseEvent) {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    } else if (event.touches && event.touches.length > 0) {
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    } else {
      return null;
    }
    return { x, y };
  };

  const startDrawing = useCallback((event: MouseEvent | TouchEvent) => {
    if (disabled) return;
    event.preventDefault(); // Prevent scrolling on touch
    const coords = getCoordinates(event);
    const ctx = getContext();
    if (coords && ctx) {
      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  }, [getContext, disabled]);

  const draw = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDrawing || disabled) return;
    event.preventDefault();
    const coords = getCoordinates(event);
    const ctx = getContext();
    if (coords && ctx) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      if (isEmpty) {
        setIsEmpty(false);
        // Initial change from empty to not empty
        if (onSignatureChange) {
           // We don't have the data URL yet, will be generated on endDrawing
          onSignatureChange(false, null);
        }
      }
    }
  }, [isDrawing, getContext, isEmpty, onSignatureChange, disabled]);

  const endDrawing = useCallback(() => {
    if (!isDrawing || disabled) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setCurrentDataUrl(dataUrl);
      if (onSignatureEnd) {
        onSignatureEnd(dataUrl);
      }
      if (onSignatureChange) {
        // Final update with the data URL
        onSignatureChange(isEmpty, dataUrl); // isEmpty might have changed during drawing
      }
    }
  }, [isDrawing, onSignatureEnd, onSignatureChange, isEmpty, disabled]);

  // Event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || disabled) return;

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDrawing);
    canvas.addEventListener('mouseleave', endDrawing); // Stop drawing if mouse leaves canvas

    // Touch events
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', endDrawing);
    canvas.addEventListener('touchcancel', endDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', endDrawing);
      canvas.removeEventListener('mouseleave', endDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', endDrawing);
      canvas.removeEventListener('touchcancel', endDrawing);
    };
  }, [startDrawing, draw, endDrawing, disabled]);

  const handleClear = () => {
    if (disabled) return;
    clearCanvas();
    setError(null); // Clear any previous errors
  };

  // Public method to get signature data (can be called via ref if needed by parent)
  // Or rely on onSignatureEnd / onSignatureChange callbacks
  const getSignatureDataUrl = (): string | null => {
    if (isEmpty || !canvasRef.current) {
      return null;
    }
    return currentDataUrl || canvasRef.current.toDataURL('image/png');
  };
  
  // Expose methods via ref if needed, e.g., parent.current.getSignatureDataUrl()
  // React.useImperativeHandle(ref, () => ({ getSignatureDataUrl, clearCanvas }));

  return (
    <div className={cn("flex flex-col items-center w-full", className)}>
      {error && (
        <div className="mb-2 text-sm text-red-600 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-1" /> {error}
        </div>
      )}
      <div className="relative w-full" style={{ maxWidth: `${width}px` }}>
        <canvas
          ref={canvasRef}
          className={cn(
            "border border-slate-300 dark:border-slate-700 rounded-md touch-none bg-white",
            disabled && "cursor-not-allowed opacity-70 bg-slate-100 dark:bg-slate-800"
          )}
          style={{ width: `${width}px`, height: `${height}px` }}
          aria-label="Signature Pad"
        />
        {!isEmpty && !disabled && (
           <div 
            className="absolute bottom-2 right-2 text-xs text-slate-400 dark:text-slate-500 pointer-events-none"
            style={{ transform: 'translateY(100%)', marginTop: '0.25rem' }} // Position below canvas
           >
            Sign above
          </div>
        )}
         {isEmpty && !disabled && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="w-[80%] h-px bg-slate-300 dark:bg-slate-600 mb-1"></div>
            <p className="text-sm text-slate-400 dark:text-slate-500">Please sign above</p>
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClear}
        className="mt-3"
        disabled={disabled || isEmpty}
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Clear Signature
      </Button>
    </div>
  );
};

export default SignatureCanvas;

// Example usage (would be in a parent component):
/*
const ParentComponent = () => {
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState(false);

  const handleSignatureEnd = (dataUrl: string | null) => {
    console.log("Signature ended:", dataUrl ? dataUrl.substring(0, 30) + "..." : "cleared");
    setSignatureDataUrl(dataUrl);
  };
  
  const handleSignatureChange = (isEmpty: boolean, dataUrl: string | null) => {
    setIsSigned(!isEmpty);
    // If you need the data URL on every change, not just at the end:
    // setSignatureDataUrl(dataUrl); 
  };

  const handleSubmit = () => {
    if (!isSigned || !signatureDataUrl) {
      alert("Please provide a signature.");
      return;
    }
    // Send signatureDataUrl to your backend
    console.log("Submitting signature:", signatureDataUrl.substring(0,50) + "...");
    // ... your submission logic
  };

  return (
    <div>
      <h3>Please Sign Below:</h3>
      <SignatureCanvas
        width={600}
        height={250}
        onSignatureEnd={handleSignatureEnd}
        onSignatureChange={handleSignatureChange}
        // initialDataURL={"some_saved_data_url_if_editing"}
      />
      <Button onClick={handleSubmit} disabled={!isSigned} className="mt-4">
        Accept & Sign
      </Button>
      {signatureDataUrl && (
        <div className="mt-4">
          <h4>Preview:</h4>
          <img src={signatureDataUrl} alt="Signature Preview" style={{ border: '1px solid #ccc', maxHeight: '100px' }} />
        </div>
      )}
    </div>
  );
};
*/
