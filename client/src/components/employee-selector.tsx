import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Users } from "lucide-react";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

interface EmployeeSelectorProps {
  currentUser: Employee | null;
  selectedEmployeeId: number | null;
  onEmployeeChange: (employeeId: number | null) => void;
  showAllOption?: boolean;
}

export function EmployeeSelector({ 
  currentUser, 
  selectedEmployeeId, 
  onEmployeeChange,
  showAllOption = false 
}: EmployeeSelectorProps) {
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  // Filter employees based on current user's role
  const canViewAllEmployees = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const availableEmployees = canViewAllEmployees 
    ? employees.filter(emp => emp.isActive)
    : employees.filter(emp => emp.id === currentUser?.id && emp.isActive);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'manager': return 'bg-blue-100 text-blue-700';
      case 'technician': return 'bg-green-100 text-green-700';
      case 'helper': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!canViewAllEmployees && currentUser) {
    // Technicians/helpers can only see their own data
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
        <User className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium">
          {currentUser.firstName} {currentUser.lastName}
        </span>
        <Badge className={getRoleBadgeColor(currentUser.role)}>
          {currentUser.role}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-gray-600" />
      <Select 
        value={selectedEmployeeId?.toString() || "all"} 
        onValueChange={(value) => onEmployeeChange(value === "all" ? null : parseInt(value))}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select employee" />
        </SelectTrigger>
        <SelectContent>
          {showAllOption && (
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>All Employees</span>
              </div>
            </SelectItem>
          )}
          {availableEmployees.map(employee => (
            <SelectItem key={employee.id} value={employee.id.toString()}>
              <div className="flex items-center gap-2 w-full">
                <User className="h-4 w-4" />
                <span>{employee.firstName} {employee.lastName}</span>
                <Badge className={getRoleBadgeColor(employee.role)}>
                  {employee.role}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}