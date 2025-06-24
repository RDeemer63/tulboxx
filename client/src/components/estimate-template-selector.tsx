import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

export interface EstimateTemplate {
  id: string;
  name: string;
  description: string;
  category: 'professional' | 'modern' | 'classic' | 'detailed';
  preview: string;
  features: string[];
}

const templates: EstimateTemplate[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, business-focused layout with emphasis on trust and credibility',
    category: 'professional',
    preview: '/api/templates/professional/preview',
    features: ['Company logo prominent', 'Clean typography', 'Professional colors', 'Trust indicators']
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary design with visual hierarchy and modern styling',
    category: 'modern',
    preview: '/api/templates/modern/preview',
    features: ['Bold headers', 'Color accents', 'Modern layout', 'Visual appeal']
  },
  {
    id: 'detailed',
    name: 'Detailed',
    description: 'Comprehensive layout with extensive project information and terms',
    category: 'detailed',
    preview: '/api/templates/detailed/preview',
    features: ['Detailed breakdown', 'Terms & conditions', 'Project timeline', 'Specifications']
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional invoice-style layout familiar to most customers',
    category: 'classic',
    preview: '/api/templates/classic/preview',
    features: ['Traditional format', 'Simple layout', 'Easy to read', 'Widely recognized']
  }
];

interface EstimateTemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  onClose: () => void;
}

export default function EstimateTemplateSelector({ 
  selectedTemplate, 
  onTemplateSelect, 
  onClose 
}: EstimateTemplateSelectorProps) {
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Choose Estimate Template</h2>
              <p className="text-gray-600 mt-1">Select a professional template that matches your business style</p>
            </div>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => onTemplateSelect(template.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {template.name}
                        {selectedTemplate === template.id && (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {template.category}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Template Preview Area */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 min-h-[200px] flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-200 rounded mx-auto mb-2"></div>
                      <p className="text-sm">Template Preview</p>
                      <p className="text-xs">{template.name} Layout</p>
                    </div>
                  </div>

                  {/* Features List */}
                  <div>
                    <p className="font-medium text-sm mb-2">Features:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {template.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <Button 
                      variant={selectedTemplate === template.id ? "default" : "outline"}
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTemplateSelect(template.id);
                      }}
                    >
                      {selectedTemplate === template.id ? 'Selected' : 'Select Template'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button onClick={onClose} size="lg">
              Apply Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}