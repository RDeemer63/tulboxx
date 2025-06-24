import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Sparkles, Image, Calendar, TrendingUp } from "lucide-react";
import AISocialModal from "@/components/ai-social-modal";

export default function SocialMedia() {
  const [showAIModal, setShowAIModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Social Media</h1>
          <p className="text-gray-600 mt-2">
            Generate engaging social media content to grow your business
          </p>
        </div>
        <Button 
          onClick={() => setShowAIModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Create Content
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Smart Content</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              AI generates engaging posts tailored to your business, including captions, hashtags, and content suggestions.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Image className="h-5 w-5 text-pink-600" />
              <CardTitle className="text-lg">Visual Ideas</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get suggestions for photos, graphics, and visual content that will engage your audience and showcase your work.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Content Calendar</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Plan your posting schedule with AI-suggested optimal times and content themes for maximum engagement.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Content Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Content Types We Can Generate</span>
          </CardTitle>
          <CardDescription>
            Choose from various content formats to engage your audience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Share2 className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">Project Showcases</h4>
              <p className="text-sm text-gray-600">Before/after photos with compelling captions</p>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Sparkles className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="font-medium mb-2">Tips & Advice</h4>
              <p className="text-sm text-gray-600">Educational content to establish expertise</p>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="font-medium mb-2">Seasonal Posts</h4>
              <p className="text-sm text-gray-600">Timely content for holidays and seasons</p>
            </div>
            
            <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <h4 className="font-medium mb-2">Promotions</h4>
              <p className="text-sm text-gray-600">Special offers and service announcements</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Best Practices</CardTitle>
          <CardDescription>Tips to maximize your social media impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-green-700">Do's</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Post consistently with a regular schedule</li>
                <li>• Use high-quality, well-lit photos of your work</li>
                <li>• Engage with comments and messages promptly</li>
                <li>• Share behind-the-scenes content</li>
                <li>• Use relevant local hashtags</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-red-700">Don'ts</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Don't post blurry or poorly lit photos</li>
                <li>• Avoid overly promotional content</li>
                <li>• Don't ignore negative feedback</li>
                <li>• Avoid posting too frequently in short periods</li>
                <li>• Don't use irrelevant hashtags</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <AISocialModal 
        open={showAIModal} 
        onOpenChange={setShowAIModal}
      />
    </div>
  );
}