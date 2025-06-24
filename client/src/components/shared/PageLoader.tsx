import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface PageLoaderProps {
  text?: string;
}

/**
 * PageLoader is a full-page loading indicator used when loading
 * entire pages or during navigation transitions.
 */
export const PageLoader: React.FC<PageLoaderProps> = ({ text = "Loading..." }) => {
  return (
    <LoadingSpinner 
      variant="fullPage" 
      size="lg" 
      text={text}
    />
  );
};

export default PageLoader;
