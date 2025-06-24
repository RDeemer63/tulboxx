import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "./theme-provider";
import { 
  Monitor, 
  Moon, 
  Sun, 
  Palette, 
  Briefcase, 
  Zap, 
  Heart, 
  Sparkles, 
  Minimize2,
  Settings
} from "lucide-react";

const businessMoods = [
  {
    id: "professional",
    name: "Professional",
    description: "Clean and corporate styling for traditional businesses",
    icon: Briefcase,
    colors: ["#1e40af", "#6b7280", "#374151"]
  },
  {
    id: "modern",
    name: "Modern",
    description: "Sleek contemporary design with sharp edges",
    icon: Zap,
    colors: ["#06b6d4", "#8b5cf6", "#10b981"]
  },
  {
    id: "warm",
    name: "Warm",
    description: "Friendly and approachable with soft colors",
    icon: Heart,
    colors: ["#f59e0b", "#ef4444", "#f97316"]
  },
  {
    id: "vibrant",
    name: "Vibrant",
    description: "Bold and energetic for creative businesses",
    icon: Sparkles,
    colors: ["#ec4899", "#8b5cf6", "#06b6d4"]
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and focused for distraction-free work",
    icon: Minimize2,
    colors: ["#6b7280", "#374151", "#1f2937"]
  }
];

export default function ThemeSwitcher() {
  const { theme, businessMood, setTheme, setBusinessMood } = useTheme();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          Theme
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Adaptive Theme Settings
          </DialogTitle>
          <DialogDescription>
            Customize your workspace appearance to match your business style and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme Mode Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Theme Mode</Label>
            <RadioGroup 
              value={theme} 
              onValueChange={setTheme}
              className="grid grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="light" />
                <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                  <Sun className="h-4 w-4" />
                  Light
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="dark" />
                <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                  <Moon className="h-4 w-4" />
                  Dark
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="system" />
                <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                  <Monitor className="h-4 w-4" />
                  System
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Business Mood Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Business Mood</Label>
              <Badge variant="outline" className="text-xs">
                Current: {businessMoods.find(m => m.id === businessMood)?.name}
              </Badge>
            </div>
            <div className="grid gap-3">
              {businessMoods.map((mood) => {
                const Icon = mood.icon;
                const isSelected = businessMood === mood.id;
                
                return (
                  <Card 
                    key={mood.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''
                    }`}
                    onClick={() => setBusinessMood(mood.id as any)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{mood.name}</h4>
                            {isSelected && (
                              <Badge variant="default" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {mood.description}
                          </p>
                          <div className="flex items-center gap-1">
                            {mood.colors.map((color, index) => (
                              <div
                                key={index}
                                className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-700"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Preview</Label>
            <Card className="p-4 bg-gradient-to-r from-background to-muted">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">Tulboxx CRM</h4>
                    <p className="text-sm text-muted-foreground">
                      {businessMoods.find(m => m.id === businessMood)?.name} Theme
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="default">Primary Action</Button>
                  <Button size="sm" variant="outline">Secondary</Button>
                  <Button size="sm" variant="ghost">Tertiary</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}