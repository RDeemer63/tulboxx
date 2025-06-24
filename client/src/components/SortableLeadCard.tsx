import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, DollarSign, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { LeadPipelineEntry, Customer } from "@shared/schema";

interface SortableLeadCardProps {
  entry: LeadPipelineEntry;
  onViewDetails: (entry: LeadPipelineEntry) => void;
  isSelected?: boolean;
  onSelectChange?: (leadId: number, selected: boolean) => void;
}

export function SortableLeadCard({ entry, onViewDetails, isSelected, onSelectChange }: SortableLeadCardProps) {
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: notesData = {} } = useQuery<Record<number, number>>({
    queryKey: ["/api/lead-pipeline/notes-count"],
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 250ms ease-in-out',
    opacity: isDragging ? 0.1 : 1,
  };

  const getCustomerName = (contactId: number): string => {
    const customer = customers.find(c => c.id === contactId);
    if (!customer) return "Unknown Contact";
    return `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || "Unknown Contact";
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`mb-3 hover:shadow-md transition-all duration-200 ease-in-out border-2 ${
        isDragging ? 'shadow-lg opacity-50' : ''
      } ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3 mb-2">
          {/* Selection Checkbox */}
          <div 
            className="mt-0.5 z-10"
            onClick={(e) => {
              e.stopPropagation();
              onSelectChange?.(entry.id, !isSelected);
            }}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-200 ${
              isSelected 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400'
            }`}>
              {isSelected && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div 
            className="flex-1 cursor-grab active:cursor-grabbing"
            {...attributes} 
            {...listeners}
            onClick={() => onViewDetails(entry)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">
                  {getCustomerName(entry.contactId)}
                </h4>
                {((entry.notes && entry.notes.trim().length > 0) || (notesData[entry.id] && notesData[entry.id] > 0)) && (
                  <FileText className="h-3 w-3 text-gray-400" />
                )}
              </div>
              <Badge variant="secondary" className="text-xs">
                {entry.probability}%
              </Badge>
            </div>
            
            {entry.estimatedValue && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <DollarSign className="h-3 w-3 mr-1" />
                ${parseFloat(entry.estimatedValue).toLocaleString()}
              </div>
            )}
            
            {entry.expectedCloseDate && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(entry.expectedCloseDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}