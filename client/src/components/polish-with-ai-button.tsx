import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PolishWithAIButtonProps {
  text: string;
  onPolished: (polishedText: string) => void;
  fieldType: string;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "outline" | "ghost" | "secondary";
}

export default function PolishWithAIButton({
  text,
  onPolished,
  fieldType,
  disabled = false,
  size = "sm",
  variant = "outline"
}: PolishWithAIButtonProps) {
  const [isPolishing, setIsPolishing] = useState(false);
  const { toast } = useToast();

  const handlePolish = async () => {
    if (!text.trim()) {
      toast({
        title: "No text to polish",
        description: "Please enter some text first.",
        variant: "destructive"
      });
      return;
    }

    setIsPolishing(true);
    try {
      const response = await fetch('/api/ai/polish-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          fieldType,
          businessType: 'service business',
          businessName: 'Your Business'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to polish text');
      }

      const result = await response.json();
      onPolished(result.polishedText);
      
      toast({
        title: "Text polished successfully",
        description: "Your text has been improved with AI.",
      });
    } catch (error) {
      console.error('Polish error:', error);
      toast({
        title: "Polish failed",
        description: "Unable to polish text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPolishing(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handlePolish}
      disabled={disabled || isPolishing || !text.trim()}
      className="gap-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-all duration-200"
    >
      {isPolishing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4 text-blue-500 dark:text-blue-400" />
      )}
      {isPolishing ? "Polishing..." : "Polish with AI"}
    </Button>
  );
}