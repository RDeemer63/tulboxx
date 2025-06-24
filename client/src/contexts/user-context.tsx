import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

interface UserContextType {
  currentUser: Employee | null;
  selectedEmployeeId: number | null;
  setSelectedEmployeeId: (id: number | null) => void;
  canViewAllEmployees: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isTechnician: boolean;
  switchToUser: (userId: number) => void;
  availableUsers: Employee[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // For demo purposes, we'll simulate the current logged-in user
  // In a real app, this would come from authentication
  const [currentUserId, setCurrentUserId] = useState(1); // Simulating John Smith (admin)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  const currentUser = employees.find(emp => emp.id === currentUserId) || null;

  // Set default selected employee to current user if not set
  useEffect(() => {
    if (currentUser && selectedEmployeeId === null) {
      setSelectedEmployeeId(currentUser.id);
    }
  }, [currentUser, selectedEmployeeId]);

  const canViewAllEmployees = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';
  const isTechnician = currentUser?.role === 'technician';

  const switchToUser = (userId: number) => {
    setCurrentUserId(userId);
    setSelectedEmployeeId(null); // Reset selection when switching users
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      selectedEmployeeId,
      setSelectedEmployeeId,
      canViewAllEmployees,
      isAdmin,
      isManager,
      isTechnician,
      switchToUser,
      availableUsers: employees,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}