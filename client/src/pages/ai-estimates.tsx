import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Sparkles, FileText, Plus } from "lucide-react";

export default function AIEstimates() {
  const [showAIModal, setShowAIModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI-Powered Estimates</h1>
          <p className="text-gray-600 mt-2">
            Generate professional estimates instantly using artificial intelligence
          </p>
        </div>
        <Button
          /* Navigate straight to the V2 Estimates module */
          onClick={() => (window.location.href = "/v2/estimates")}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <Bot className="h-4 w-4 mr-2" />
          Generate AI Estimate
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Smart Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              AI analyzes your project description and automatically suggests accurate pricing based on industry standards and your business data.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Professional Format</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Generates beautifully formatted estimates with detailed line items, terms, and your business branding automatically applied.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Continuous Learning</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              The AI learns from your accepted estimates and pricing patterns to provide increasingly accurate suggestions over time.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Getting Started with AI Estimates</span>
          </CardTitle>
          <CardDescription>
            Follow these simple steps to create your first AI-powered estimate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div>
                <h4 className="font-medium">Describe Your Project</h4>
                <p className="text-sm text-gray-600">
                  Provide details about the job, materials needed, and scope of work
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div>
                <h4 className="font-medium">AI Analysis</h4>
                <p className="text-sm text-gray-600">
                  Our AI analyzes your input and generates accurate pricing estimates
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <h4 className="font-medium">Review & Send</h4>
                <p className="text-sm text-gray-600">
                  Review the generated estimate, make adjustments, and send to your client
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal removed. Navigation now takes the user directly to the Estimates workflow. */}
    </div>
  );
}