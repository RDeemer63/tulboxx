import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Share2, Loader2, Facebook, Instagram, Linkedin } from "lucide-react";

interface AISocialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AISocialModal({ open, onOpenChange }: AISocialModalProps) {
  const [formData, setFormData] = useState({
    businessType: "",
    contentTheme: "",
    platforms: [] as string[],
  });
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const { toast } = useToast();

  const generateContentMutation = useMutation({
    mutationFn: api.ai.generateSocialContent,
    onSuccess: (data) => {
      setGeneratedContent(data);
      toast({
        title: "Content Generated",
        description: "AI has successfully generated your social media content.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!formData.businessType || !formData.contentTheme || formData.platforms.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select at least one platform.",
        variant: "destructive",
      });
      return;
    }

    generateContentMutation.mutate(formData);
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      platforms: checked 
        ? [...prev.platforms, platform]
        : prev.platforms.filter(p => p !== platform)
    }));
  };

  const handleClose = () => {
    setFormData({
      businessType: "",
      contentTheme: "",
      platforms: [],
    });
    setGeneratedContent(null);
    onOpenChange(false);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      default:
        return <Share2 className="h-4 w-4" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "facebook":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "instagram":
        return "text-pink-600 bg-pink-50 border-pink-200";
      case "linkedin":
        return "text-blue-800 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-500" />
            AI Social Media Generator
          </DialogTitle>
          <DialogDescription>
            Create engaging social media content for your service business using AI.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 mb-3">Content Settings</h4>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Generate Content For:
              </Label>
              <div className="space-y-3">
                {[
                  { id: "facebook", label: "Facebook Posts" },
                  { id: "instagram", label: "Instagram Captions" },
                  { id: "linkedin", label: "LinkedIn Updates" },
                ].map((platform) => (
                  <div key={platform.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform.id}
                      checked={formData.platforms.includes(platform.id)}
                      onCheckedChange={(checked) => 
                        handlePlatformChange(platform.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={platform.id} className="text-sm text-gray-700">
                      {platform.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="businessType">Business Type *</Label>
              <Select value={formData.businessType} onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lawn_care">Lawn Care & Landscaping</SelectItem>
                  <SelectItem value="plumbing">Plumbing Services</SelectItem>
                  <SelectItem value="electrical">Electrical Services</SelectItem>
                  <SelectItem value="excavating">Excavating & Construction</SelectItem>
                  <SelectItem value="hvac">HVAC Services</SelectItem>
                  <SelectItem value="cleaning">Cleaning Services</SelectItem>
                  <SelectItem value="roofing">Roofing Services</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contentTheme">Content Theme *</Label>
              <Select value={formData.contentTheme} onValueChange={(value) => setFormData(prev => ({ ...prev, contentTheme: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seasonal_services">Seasonal Services</SelectItem>
                  <SelectItem value="customer_testimonials">Customer Testimonials</SelectItem>
                  <SelectItem value="before_after">Before/After Showcases</SelectItem>
                  <SelectItem value="tips_maintenance">Tips & Maintenance</SelectItem>
                  <SelectItem value="community_involvement">Community Involvement</SelectItem>
                  <SelectItem value="promotional">Promotional Content</SelectItem>
                  <SelectItem value="educational">Educational Content</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={generateContentMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {generateContentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Content...
                </>
              ) : (
                "Generate Content"
              )}
            </Button>
          </div>

          {/* Generated Content */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Generated Content Preview</h4>
            <div className="bg-gray-50 rounded-lg p-4 min-h-[400px] max-h-[500px] overflow-y-auto">
              {generateContentMutation.isPending ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : generatedContent ? (
                <div className="space-y-4">
                  {generatedContent.content?.map((item: any, index: number) => (
                    <div key={index} className={`bg-white rounded-lg p-4 border-2 ${getPlatformColor(item.platform)}`}>
                      <div className="flex items-center mb-3">
                        {getPlatformIcon(item.platform)}
                        <span className="ml-2 text-sm font-medium capitalize">
                          {item.platform} Post
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {item.content}
                      </p>
                      {item.hashtags && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            Suggested hashtags: {item.hashtags.join(" ")}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex space-x-3 mt-6">
                    <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                      Copy All Content
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Regenerate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Share2 className="h-12 w-12 mb-4" />
                  <p className="text-center">
                    Select your business type, content theme, and platforms to generate engaging social media content.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
