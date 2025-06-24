import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, DollarSign, TrendingUp, Users, Calendar, FileText } from "lucide-react";

export default function Reports() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Business Reports</h1>
        <p className="text-gray-600 mt-2">
          Analytics and insights to help grow your business
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Estimates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Financial Reports</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Track revenue, expenses, and profitability across all your jobs and services.
            </CardDescription>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Monthly Revenue Analysis</li>
              <li>• Profit Margin by Service Type</li>
              <li>• Payment Status Overview</li>
              <li>• Cost Analysis Reports</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Customer Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Understand your customer base and identify growth opportunities.
            </CardDescription>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Customer Acquisition Trends</li>
              <li>• Service Preferences</li>
              <li>• Geographic Distribution</li>
              <li>• Customer Lifetime Value</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Monitor business performance and operational efficiency.
            </CardDescription>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Job Completion Rates</li>
              <li>• Average Project Duration</li>
              <li>• Estimate Conversion Rates</li>
              <li>• Resource Utilization</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Advanced Reporting Features</span>
          </CardTitle>
          <CardDescription>
            Enhanced analytics and reporting capabilities coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Interactive Charts</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Revenue trends with drill-down capabilities</li>
                <li>• Seasonal business pattern analysis</li>
                <li>• Service-specific performance graphs</li>
                <li>• Customer growth visualization</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Export & Sharing</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• PDF report generation</li>
                <li>• Excel data export</li>
                <li>• Automated email reports</li>
                <li>• Custom report scheduling</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Reports</CardTitle>
          <CardDescription>
            Set up automatic report generation and delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Monthly Financial Summary</h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Active</span>
              </div>
              <p className="text-sm text-gray-600">Delivered every 1st of the month to your email</p>
            </div>
            
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Weekly Performance Report</h4>
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Coming Soon</span>
              </div>
              <p className="text-sm text-gray-600">Key metrics and KPIs delivered weekly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}