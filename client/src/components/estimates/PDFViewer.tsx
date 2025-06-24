"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

// --- PDF.js Worker Configuration ---
// This is a crucial step to ensure the PDF worker is loaded correctly.
// It points to the worker file provided by the pdfjs-dist package.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// --- Component Props ---
export interface PDFViewerProps {
  /**
   * The source of the PDF file. Can be a URL string or a Blob.
   */
  src: string | File | Blob | null;
  /**
   * Optional CSS class name for the container.
   */
  className?: string;
  /**
   * Optional callback function when the download button is clicked.
   * If not provided, a default download behavior is used.
   */
  onDownload?: () => void;
  /**
   * Initial zoom level (e.g., 1.0 for 100%).
   * @default 1.0
   */
  initialScale?: number;
}

/**
 * A responsive and feature-rich PDF viewer component.
 * It handles loading and rendering of PDF documents with controls for pagination,
 * zoom, and downloading. It is optimized for both desktop and mobile viewing.
 */
export const PDFViewer: React.FC<PDFViewerProps> = ({
  src,
  className,
  onDownload,
  initialScale = 1.0,
}) => {
  // --- State Management ---
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(initialScale);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const isMobile = containerWidth > 0 && containerWidth < 768;

  // --- Effects ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Reset page number when a new PDF source is provided
  useEffect(() => {
    setPageNumber(1);
    setIsLoading(true);
    setError(null);
  }, [src]);

  // --- Event Handlers ---
  const onDocumentLoadSuccess = useCallback(
    ({ numPages: nextNumPages }: { numPages: number }) => {
      setNumPages(nextNumPages);
      setIsLoading(false);
      setError(null);
    },
    []
  );

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error("Failed to load PDF:", error);
    setError(error.message || "Failed to load PDF file.");
    setIsLoading(false);
  }, []);

  const goToPrevPage = () =>
    setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1));

  const goToNextPage = () =>
    setPageNumber((prevPageNumber) =>
      Math.min(prevPageNumber + 1, numPages || 1)
    );

  const zoomIn = () => setScale((prevScale) => Math.min(prevScale + 0.2, 3));
  const zoomOut = () => setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (typeof src === "string") {
      const link = document.createElement("a");
      link.href = src;
      link.download = "document.pdf"; // Generic filename
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // --- Render Logic ---
  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Loading PDF...</p>
      <Skeleton className="w-full h-4/5 mt-4" />
    </div>
  );

  const renderErrorState = () => (
    <div className="flex items-center justify-center h-full p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Document</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );

  return (
    <div
      className={cn(
        "relative flex flex-col w-full h-full bg-slate-100 dark:bg-slate-900/50 border rounded-lg overflow-hidden",
        className
      )}
    >
      {/* Control Bar */}
      <div className="flex items-center justify-center gap-1 p-1 sm:gap-2 sm:p-2 bg-background border-b sticky top-0 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Previous Page</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <span className="text-sm font-medium text-muted-foreground px-2">
          Page {pageNumber} of {numPages || "..."}
        </span>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextPage}
                disabled={pageNumber >= (numPages || 1)}
                aria-label="Next Page"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Next Page</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {!isMobile && <Separator orientation="vertical" className="h-6 mx-2" />}

        {/* Zoom controls hidden on mobile for simplicity */}
        {!isMobile && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={zoomOut}
                    disabled={scale <= 0.5}
                    aria-label="Zoom Out"
                  >
                    <ZoomOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom Out</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <span className="text-sm font-medium text-muted-foreground w-16 text-center">
              {Math.round(scale * 100)}%
            </span>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={zoomIn}
                    disabled={scale >= 3}
                    aria-label="Zoom In"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom In</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}

        <div className="flex-grow" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                disabled={!src}
                aria-label="Download PDF"
              >
                <Download className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download PDF</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* PDF Content Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-1 sm:p-2 md:p-4"
      >
        {isLoading && renderLoadingState()}
        {error && renderErrorState()}
        {!isLoading && !error && src && (
          <Document
            file={src}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null} // We handle loading state outside
            error={null} // We handle error state outside
            className="flex justify-center"
          >
            <Page
              pageNumber={pageNumber}
              // On mobile, fit the page to the container width. On desktop, use manual scale.
              width={isMobile ? containerWidth : undefined}
              scale={!isMobile ? scale : undefined}
              renderAnnotationLayer={true}
              renderTextLayer={true}
              className="shadow-lg bg-white"
            />
          </Document>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
