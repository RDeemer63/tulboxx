import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/user-context";
import Header from "@/components/header";
import { Settings, Users, DollarSign, FileText, Shield } from "lucide-react";
import type { Employee, Permission, InsertPermission } from "@shared/schema";

interface PermissionCategory {
  title: string;
  icon: any;
  permissions: {
    key: keyof InsertPermission;
    label: string;
    description: string;
  }[];
}

const permissionCategories: PermissionCategory[] = [
  {
    title: "Financial Access",
    icon: DollarSign,
    permissions: [
      { key: "canViewRevenue", label: "View Revenue", description: "Access total revenue and income reports" },
      { key: "canViewProfitMargins", label: "View Profit Margins", description: "See profit calculations and margins" },
      { key: "canViewEmployeeWages", label: "View Employee Wages", description: "Access payroll and wage information" },
      { key: "canViewJobCosts", label: "View Job Costs", description: "See material and labor costs per job" },
      { key: "canEditPricing", label: "Edit Pricing", description: "Modify estimates and pricing structures" },
      { key: "canAccessFinancialReports", label: "Financial Reports", description: "Generate and view financial reports" },
    ]
  },
  {
    title: "Employee Management",
    icon: Users,
    permissions: [
      { key: "canViewAllEmployees", label: "View All Employees", description: "See all employee information" },
      { key: "canEditEmployeeInfo", label: "Edit Employee Info", description: "Modify employee details and records" },
      { key: "canManageSchedules", label: "Manage Schedules", description: "Create and modify work schedules" },
      { key: "canApproveTimeEntries", label: "Approve Time Entries", description: "Review and approve time tracking" },
      { key: "canViewPerformanceMetrics", label: "Performance Metrics", description: "Access employee performance data" },
    ]
  },
  {
    title: "Customer & Job Management",
    icon: FileText,
    permissions: [
      { key: "canViewAllCustomers", label: "View All Customers", description: "Access complete customer database" },
      { key: "canEditCustomerInfo", label: "Edit Customer Info", description: "Modify customer details and records" },
      { key: "canCreateAssignJobs", label: "Create & Assign Jobs", description: "Create new jobs and assign technicians" },
      { key: "canAccessPaymentHistory", label: "Payment History", description: "View customer payment records" },
      { key: "canManageEstimatesInvoices", label: "Estimates & Invoices", description: "Create and manage billing documents" },
    ]
  },
  {
    title: "System Administration",
    icon: Settings,
    permissions: [
      { key: "canManageUserRoles", label: "Manage User Roles", description: "Modify user permissions and roles" },
      { key: "canAccessSystemSettings", label: "System Settings", description: "Configure application settings" },
      { key: "canExportData", label: "Export Data", description: "Export system data and reports" },
      { key: "canManageIntegrations", label: "Manage Integrations", description: "Configure third-party integrations" },
    ]
  }
];

const roleTemplates = {
  admin: {
    name: "Administrator",
    description: "Full system access with all permissions",
    permissions: Object.fromEntries(
      permissionCategories.flatMap(cat => cat.permissions.map(p => [p.key, true]))
    )
  },
  manager: {
    name: "Manager", 
    description: "Operations management with limited financial access",
    permissions: {
      canViewRevenue: true,
      canViewJobCosts: true,
      canEditPricing: true,
      canViewAllEmployees: true,
      canEditEmployeeInfo: true,
      canManageSchedules: true,
      canApproveTimeEntries: true,
      canViewPerformanceMetrics: true,
      canViewAllCustomers: true,
      canEditCustomerInfo: true,
      canCreateAssignJobs: true,
      canAccessPaymentHistory: true,
      canManageEstimatesInvoices: true,
      canExportData: true,
    }
  },
  technician: {
    name: "Technician",
    description: "Field worker with job-focused permissions",
    permissions: {
      canViewAllCustomers: false,
      canCreateAssignJobs: false,
    }
  },
  helper: {
    name: "Helper",
    description: "Basic access for entry-level employees",
    permissions: {}
  }
};

export default function PermissionsPage() {
  const { currentUser, canViewAllEmployees } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: permissions = [] } = useQuery<Permission[]>({
    queryKey: ["/api/permissions"],
    enabled: canViewAllEmployees,
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ employeeId, permissionData }: { employeeId: number, permissionData: Partial<InsertPermission> }) => {
      const existingPermission = permissions.find(p => p.employeeId === employeeId);
      
      if (existingPermission) {
        const response = await fetch(`/api/permissions/${employeeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...permissionData, employeeId }),
        });
        if (!response.ok) throw new Error('Failed to update permissions');
        return response.json();
      } else {
        const response = await fetch('/api/permissions', {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...permissionData, employeeId }),
        });
        if (!response.ok) throw new Error('Failed to create permissions');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      toast({ title: "Permissions updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update permissions", variant: "destructive" });
    },
  });

  const applyTemplateMutation = useMutation({
    mutationFn: async ({ employeeId, template }: { employeeId: number, template: string }) => {
      const templateData = roleTemplates[template as keyof typeof roleTemplates];
      return updatePermissionsMutation.mutateAsync({ 
        employeeId, 
        permissionData: templateData.permissions 
      });
    },
  });

  if (!canViewAllEmployees) {
    return (
      <div className="space-y-6">
        <Header title="Permissions" subtitle="Access denied" />
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-500">You don't have permission to manage user roles and permissions.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedEmployeePermissions = selectedEmployee 
    ? permissions.find(p => p.employeeId === selectedEmployee.id)
    : null;

  const updatePermission = (permissionKey: keyof InsertPermission, value: boolean) => {
    if (!selectedEmployee) return;
    
    const currentPermissions = selectedEmployeePermissions || {};
    updatePermissionsMutation.mutate({
      employeeId: selectedEmployee.id,
      permissionData: {
        ...currentPermissions,
        [permissionKey]: value,
      }
    });
  };

  return (
    <div className="space-y-6">
      <Header 
        title="Permissions Management" 
        subtitle="Configure granular access controls for each employee"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Employee List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Select Employee</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {employees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => setSelectedEmployee(employee)}
                  className={`w-full text-left p-3 hover:bg-gray-50 border-l-4 transition-colors ${
                    selectedEmployee?.id === employee.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-transparent'
                  }`}
                >
                  <div className="font-medium text-sm">
                    {employee.firstName} {employee.lastName}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {employee.role}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Editor */}
        <div className="lg:col-span-3">
          {selectedEmployee ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </CardTitle>
                  <p className="text-sm text-gray-500 capitalize">
                    {selectedEmployee.role} • Configure specific permissions
                  </p>
                </div>
                <div className="flex gap-2">
                  {Object.entries(roleTemplates).map(([key, template]) => (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplateMutation.mutate({ 
                        employeeId: selectedEmployee.id, 
                        template: key 
                      })}
                      disabled={applyTemplateMutation.isPending}
                    >
                      Apply {template.name}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="financial" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    {permissionCategories.map((category, index) => {
                      const Icon = category.icon;
                      return (
                        <TabsTrigger
                          key={index}
                          value={category.title.toLowerCase().replace(/\s+/g, '')}
                          className="flex items-center gap-2"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="hidden sm:inline">{category.title}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  
                  {permissionCategories.map((category, index) => (
                    <TabsContent
                      key={index}
                      value={category.title.toLowerCase().replace(/\s+/g, '')}
                      className="space-y-4"
                    >
                      <div className="grid gap-4">
                        {category.permissions.map((permission) => {
                          const isEnabled = selectedEmployeePermissions?.[permission.key] || false;
                          return (
                            <div
                              key={permission.key}
                              className="flex items-center justify-between p-4 border rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <h4 className="font-medium">{permission.label}</h4>
                                  <Badge variant={isEnabled ? "default" : "secondary"}>
                                    {isEnabled ? "Enabled" : "Disabled"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  {permission.description}
                                </p>
                              </div>
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={(checked) => 
                                  updatePermission(permission.key, checked)
                                }
                                disabled={updatePermissionsMutation.isPending}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Employee</h3>
                <p className="text-gray-500">Choose an employee from the list to configure their permissions.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}