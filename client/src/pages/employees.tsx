import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Edit, Clock, MapPin, Phone, Mail, DollarSign, Shield, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertEmployeeSchema, insertEmployeePermissionsSchema, type InsertEmployee, type Employee, type EmployeePermissions, type InsertEmployeePermissions } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  searchInputStyles, 
  selectStyles, 
  cardStyles, 
  getStatusBadgeClass, 
  getIconClass,
  tableStyles,
  formStyles
} from "@/lib/theme-utils";

export default function Employees() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [customPermissions, setCustomPermissions] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  // Fetch employee permissions
  const { data: employeePermissions } = useQuery<EmployeePermissions>({
    queryKey: ['/api/employee-permissions', selectedEmployee?.id],
    enabled: !!selectedEmployee?.id,
  });

  // Create employee mutation
  const createEmployee = useMutation({
    mutationFn: async (employee: InsertEmployee) => {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      });
      if (!response.ok) throw new Error('Failed to create employee');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      setIsCreateOpen(false);
      toast({ title: "Success", description: "Employee created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create employee", variant: "destructive" });
    },
  });

  // Update employee mutation
  const updateEmployee = useMutation({
    mutationFn: async ({ id, employee }: { id: number; employee: Partial<InsertEmployee> }) => {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      });
      if (!response.ok) throw new Error('Failed to update employee');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      setIsEditOpen(false);
      setSelectedEmployee(null);
      toast({ title: "Success", description: "Employee updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update employee", variant: "destructive" });
    },
  });

  // Save employee permissions mutation
  const savePermissions = useMutation({
    mutationFn: async (permissions: InsertEmployeePermissions) => {
      const response = await fetch('/api/employee-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissions),
      });
      if (!response.ok) throw new Error('Failed to save permissions');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employee-permissions', selectedEmployee?.id] });
      toast({ title: "Success", description: "Permissions saved successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save permissions", variant: "destructive" });
    }
  });

  // Update employee permissions mutation
  const updatePermissions = useMutation({
    mutationFn: async ({ employeeId, permissions }: { employeeId: number, permissions: Partial<InsertEmployeePermissions> }) => {
      const response = await fetch(`/api/employee-permissions/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissions),
      });
      if (!response.ok) throw new Error('Failed to update permissions');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employee-permissions', selectedEmployee?.id] });
      toast({ title: "Success", description: "Permissions updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update permissions", variant: "destructive" });
    }
  });

  // Create form
  const createForm = useForm<InsertEmployee>({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "technician",
      hourlyRate: "",
      overtimeRate: "",
      isActive: true,
      notes: "",
    },
  });

  // Edit form
  const editForm = useForm<InsertEmployee>({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: selectedEmployee ? {
      firstName: selectedEmployee.firstName,
      lastName: selectedEmployee.lastName,
      email: selectedEmployee.email || "",
      phone: selectedEmployee.phone || "",
      role: selectedEmployee.role,
      hourlyRate: selectedEmployee.hourlyRate || "",
      overtimeRate: selectedEmployee.overtimeRate || "",
      isActive: selectedEmployee.isActive ?? true,
      notes: selectedEmployee.notes || "",
    } : {},
  });

  const onCreateSubmit = (data: InsertEmployee) => {
    createEmployee.mutate(data);
  };

  const onEditSubmit = (data: InsertEmployee) => {
    if (selectedEmployee) {
      updateEmployee.mutate({ id: selectedEmployee.id, employee: data });
    }
  };

  const openEditDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    editForm.reset({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email || "",
      phone: employee.phone || "",
      role: employee.role,
      hourlyRate: employee.hourlyRate || "",
      overtimeRate: employee.overtimeRate || "",
      isActive: employee.isActive ?? true,
      notes: employee.notes || "",
    });
    setShowPermissions(false); // Reset permissions section
    setCustomPermissions({}); // This will be populated with saved permissions when needed
    setIsEditOpen(true);
  };

  // Complete permission structure with all 16 permissions
  const permissionCategories = [
    {
      title: "Financial",
      permissions: [
        { key: "canViewRevenue", label: "View Revenue", desc: "Access revenue reports and financial summaries" },
        { key: "canViewJobCosts", label: "View Job Costs", desc: "See cost breakdowns and expense details" },
        { key: "canEditPricing", label: "Edit Pricing", desc: "Modify service rates and pricing structures" },
        { key: "canExportData", label: "Export Data", desc: "Download financial reports and data exports" }
      ]
    },
    {
      title: "Team",
      permissions: [
        { key: "canViewAllEmployees", label: "View All Employees", desc: "Access complete employee directory" },
        { key: "canEditEmployeeInfo", label: "Edit Employee Info", desc: "Modify employee profiles and details" },
        { key: "canManageSchedules", label: "Manage Schedules", desc: "Create and modify work schedules" },
        { key: "canApproveTimeEntries", label: "Approve Time Entries", desc: "Review and approve timesheets" }
      ]
    },
    {
      title: "Customer",
      permissions: [
        { key: "canViewAllCustomers", label: "View All Customers", desc: "Access complete customer database" },
        { key: "canEditCustomerInfo", label: "Edit Customer Info", desc: "Modify customer profiles and details" },
        { key: "canCreateAssignJobs", label: "Create & Assign Jobs", desc: "Schedule new work and assign technicians" },
        { key: "canAccessPaymentHistory", label: "Access Payment History", desc: "View customer payment records" }
      ]
    },
    {
      title: "Operations",
      permissions: [
        { key: "canManageEstimatesInvoices", label: "Manage Estimates & Invoices", desc: "Create and send estimates and invoices" },
        { key: "canViewPerformanceMetrics", label: "View Performance Metrics", desc: "Access productivity and performance data" },
        { key: "canManageInventory", label: "Manage Inventory", desc: "Track and manage equipment and supplies" },
        { key: "canConfigureSettings", label: "Configure Settings", desc: "Modify system preferences and configurations" }
      ]
    }
  ];

  // Helper function to get role-based permissions
  const getRolePermissions = (role: string) => {
    const roleDefaults = {
      admin: Object.fromEntries(
        permissionCategories.flatMap(cat => cat.permissions.map(p => [p.key, true]))
      ),
      manager: {
        canViewRevenue: true,
        canViewJobCosts: true,
        canEditPricing: true,
        canExportData: true,
        canViewAllEmployees: true,
        canEditEmployeeInfo: true,
        canManageSchedules: true,
        canApproveTimeEntries: true,
        canViewAllCustomers: true,
        canEditCustomerInfo: true,
        canCreateAssignJobs: true,
        canAccessPaymentHistory: true,
        canManageEstimatesInvoices: true,
        canViewPerformanceMetrics: true,
        canManageInventory: false,
        canConfigureSettings: false
      },
      technician: {
        canViewRevenue: false,
        canViewJobCosts: false,
        canEditPricing: false,
        canExportData: false,
        canViewAllEmployees: false,
        canEditEmployeeInfo: false,
        canManageSchedules: false,
        canApproveTimeEntries: false,
        canViewAllCustomers: true,
        canEditCustomerInfo: false,
        canCreateAssignJobs: false,
        canAccessPaymentHistory: false,
        canManageEstimatesInvoices: false,
        canViewPerformanceMetrics: false,
        canManageInventory: false,
        canConfigureSettings: false
      },
      assistant: Object.fromEntries(
        permissionCategories.flatMap(cat => cat.permissions.map(p => [p.key, false]))
      )
    };
    return roleDefaults[role as keyof typeof roleDefaults] || {};
  };

  // Load saved permissions when employee permissions data is available
  useEffect(() => {
    if (selectedEmployee && employeePermissions && Object.keys(customPermissions).length === 0) {
      // Load saved permissions into local state
      const savedPermissions = {} as any;
      permissionCategories.flatMap(cat => cat.permissions).forEach(perm => {
        if (employeePermissions.hasOwnProperty(perm.key)) {
          savedPermissions[perm.key] = (employeePermissions as any)[perm.key];
        }
      });
      if (Object.keys(savedPermissions).length > 0) {
        setCustomPermissions(savedPermissions);
      }
    }
  }, [selectedEmployee, employeePermissions, customPermissions]);

  // Get permission value (from database or role default)
  const getPermissionValue = (permissionKey: string) => {
    // First check custom permissions (local state) for immediate UI updates
    if (customPermissions.hasOwnProperty(permissionKey)) {
      return customPermissions[permissionKey];
    }
    
    // Then check if we have actual permissions from the database
    if (employeePermissions && employeePermissions.hasOwnProperty(permissionKey)) {
      return (employeePermissions as any)[permissionKey];
    }
    
    // Finally fall back to role defaults
    const currentRole = editForm.watch('role') || selectedEmployee?.role || 'assistant';
    const rolePerms = getRolePermissions(currentRole);
    return rolePerms[permissionKey as keyof typeof rolePerms] || false;
  };

  // Handle permission changes and save to database
  const handlePermissionChange = (permissionKey: string, value: boolean) => {
    if (!selectedEmployee) return;
    
    // Update local state immediately for responsive UI
    setCustomPermissions(prev => ({
      ...prev,
      [permissionKey]: value
    }));

    // Get all current permissions to maintain the complete record
    const allPermissions = permissionCategories.flatMap(cat => cat.permissions).reduce((acc, perm) => {
      // Use the new value for the changed permission, otherwise use current value
      if (perm.key === permissionKey) {
        acc[perm.key] = value;
      } else {
        acc[perm.key] = getPermissionValue(perm.key);
      }
      return acc;
    }, {} as any);

    // Save to database
    if (employeePermissions && employeePermissions.id) {
      // Update existing permissions record with complete permission set
      updatePermissions.mutate({
        employeeId: selectedEmployee.id,
        permissions: allPermissions
      });
    } else {
      // Create new permissions record with complete permission set
      const newPermissionData = {
        employeeId: selectedEmployee.id,
        ...allPermissions
      };
      
      savePermissions.mutate(newPermissionData as InsertEmployeePermissions);
    }
  };



  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300';
      case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300';
      case 'technician': return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300';
      case 'helper': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-800/50 dark:text-slate-300';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6" />
            Employee Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your field technicians and staff</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Create a new employee profile for field work assignments.
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="technician">Technician</SelectItem>
                          <SelectItem value="helper">Helper</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="hourlyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate</FormLabel>
                        <FormControl>
                          <Input placeholder="25.00" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="overtimeRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overtime Rate</FormLabel>
                        <FormControl>
                          <Input placeholder="37.50" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes about the employee..."
                          className="min-h-[80px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createEmployee.isPending}>
                    {createEmployee.isPending ? "Creating..." : "Create Employee"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{employees?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{employees?.filter(e => e.isActive).length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Technicians</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{employees?.filter(e => e.role === 'technician').length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Managers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{employees?.filter(e => e.role === 'manager').length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employees Table */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Employee Directory</CardTitle>
          <CardDescription className="text-gray-500 dark:text-slate-400">
            Manage your team members and their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employees && employees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                        <div className="text-sm text-gray-500">
                          {employee.hireDate ? `Hired ${format(new Date(employee.hireDate), 'MMM dd, yyyy')}` : 'No hire date'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {employee.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {employee.email}
                          </div>
                        )}
                        {employee.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {employee.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(employee.role)}>
                        {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {employee.hourlyRate && (
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ${employee.hourlyRate}/hr
                          </div>
                        )}
                        {employee.overtimeRate && (
                          <div className="text-xs text-gray-500">
                            OT: ${employee.overtimeRate}/hr
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={employee.isActive ? "default" : "secondary"}>
                        {employee.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(employee)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees yet</h3>
              <p className="text-gray-600">Get started by adding your first team member.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 p-1">
                <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="technician">Technician</SelectItem>
                        <SelectItem value="helper">Helper</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="overtimeRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overtime Rate</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Employee can be assigned to work orders
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes about the employee..."
                        className="min-h-[80px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Permissions Section */}
              <div className="border-t pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPermissions(!showPermissions)}
                  className="w-full justify-between p-4 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Manage Permissions</span>
                  </div>
                  {showPermissions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                
                {showPermissions && selectedEmployee && (
                  <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Configure what {selectedEmployee.firstName} can access in the system. Default settings are based on their role.
                    </p>
                    
                    {/* Quick Role Templates */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Quick Setup</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { role: 'admin', label: 'Administrator', desc: 'Full access' },
                          { role: 'manager', label: 'Manager', desc: 'Business management' },
                          { role: 'technician', label: 'Technician', desc: 'Field work focused' },
                          { role: 'assistant', label: 'Assistant', desc: 'Basic support' }
                        ].map((template) => (
                          <Button
                            key={template.role}
                            type="button"
                            variant={editForm.watch('role') === template.role ? "default" : "outline"}
                            size="sm"
                            className="justify-start h-auto p-3"
                            onClick={() => {
                              editForm.setValue('role', template.role);
                              setSelectedEmployee(prev => prev ? { ...prev, role: template.role } : null);
                            }}
                          >
                            <div className="text-left">
                              <div className="font-medium text-xs">{template.label}</div>
                              <div className="text-xs opacity-70">{template.desc}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* All Permissions by Category */}
                    <div className="space-y-4">
                      {permissionCategories.map((category) => (
                        <div key={category.title}>
                          <h4 className="text-sm font-medium mb-2 text-gray-900">{category.title} Permissions</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {category.permissions.map((permission) => (
                              <div key={permission.key} className="flex items-center justify-between p-2 bg-white rounded border">
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{permission.label}</div>
                                  <div className="text-xs text-gray-500">{permission.desc}</div>
                                </div>
                                <Switch
                                  checked={getPermissionValue(permission.key)}
                                  onCheckedChange={(checked) => handlePermissionChange(permission.key, checked)}
                                  disabled={false}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Permissions are automatically set based on employee role. Contact your administrator for custom permission changes.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateEmployee.isPending}>
                  {updateEmployee.isPending ? "Updating..." : "Update Employee"}
                </Button>
              </div>
            </form>
          </Form>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}

