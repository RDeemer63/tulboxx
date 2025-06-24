import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MoreHorizontal, Phone, Mail, Calendar, Edit, CheckCircle, XCircle } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatPhoneNumber } from '@/lib/utils';

// Stage colors for the "Blue Steel" design system
const stageColors: Record<string, { bg: string, text: string }> = {
  new: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  contacted: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  estimate_sent: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
  won: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  lost: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400' },
};

// Service type icons/colors
const serviceTypeColors: Record<string, string> = {
  brush_cutting: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400',
  fencing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  septic: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
};

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  serviceType?: string;
  source?: string;
  notes?: string;
  stage: string;
  followUpDate?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  assignedTo?: string;
}

export interface LeadCardProps {
  lead: Lead;
  onClick?: (lead: Lead) => void;
  onCallClick?: (lead: Lead) => void;
  onStageChange?: (lead: Lead, newStage: string) => void;
  onEditClick?: (lead: Lead) => void;
  onWinClick?: (lead: Lead) => void;
  onLoseClick?: (lead: Lead) => void;
  isDraggable?: boolean;
  dragHandleProps?: any;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onClick,
  onCallClick,
  onStageChange,
  onEditClick,
  onWinClick,
  onLoseClick,
  isDraggable = false,
  dragHandleProps,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format follow-up date if exists
  const followUpDateFormatted = lead.followUpDate 
    ? new Date(lead.followUpDate).toLocaleDateString() 
    : null;
  
  // Get appropriate stage colors
  const stageColor = stageColors[lead.stage] || stageColors.new;
  
  // Get service type color
  const serviceColor = lead.serviceType && serviceTypeColors[lead.serviceType] 
    ? serviceTypeColors[lead.serviceType] 
    : serviceTypeColors.default;
  
  // Handle card click
  const handleClick = () => {
    if (onClick) onClick(lead);
  };
  
  // Handle call button click
  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onCallClick) onCallClick(lead);
  };
  
  // Handle edit button click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onEditClick) onEditClick(lead);
  };
  
  // Handle stage change
  const handleStageChange = (newStage: string) => {
    if (onStageChange) onStageChange(lead, newStage);
  };
  
  // Handle win/lose clicks
  const handleWinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWinClick) onWinClick(lead);
  };
  
  const handleLoseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLoseClick) onLoseClick(lead);
  };
  
  return (
    <Card 
      className={`mb-3 border-l-4 ${
        lead.stage === 'won' 
          ? 'border-l-green-500' 
          : lead.stage === 'lost' 
            ? 'border-l-gray-400' 
            : 'border-l-primary'
      } hover:shadow-md transition-shadow duration-200`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      {...(isDraggable ? { ...dragHandleProps } : {})}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          {/* Lead Name and Badge */}
          <div className="flex-1">
            <div className="font-medium text-lg text-gray-900 dark:text-gray-100 mb-1">
              {lead.fullName}
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              {/* Stage Badge */}
              <Badge 
                className={`${stageColor.bg} ${stageColor.text} font-medium`}
                variant="outline"
              >
                {lead.stage.replace('_', ' ')}
              </Badge>
              
              {/* Service Type Badge (if available) */}
              {lead.serviceType && (
                <Badge 
                  className={`${serviceColor} text-xs font-medium`}
                  variant="outline"
                >
                  {lead.serviceType.replace('_', ' ')}
                </Badge>
              )}
            </div>
            
            {/* Phone Number */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Phone className="h-3 w-3 mr-1" />
              {formatPhoneNumber(lead.phone)}
            </div>
            
            {/* Follow-up Date (if set) */}
            {followUpDateFormatted && (
              <div className="flex items-center text-xs text-amber-600 dark:text-amber-400 mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                Follow-up: {followUpDateFormatted}
              </div>
            )}
          </div>
          
          {/* Action Buttons (visible on hover) */}
          <div className={`flex gap-1 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            {/* Call Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8" 
                    onClick={handleCallClick}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Call {lead.fullName}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Edit Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8" 
                    onClick={handleEditClick}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Lead</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* More Options Dropdown */}
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>More Options</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <DropdownMenuContent align="end">
                {/* Stage Change Options */}
                {lead.stage !== 'new' && (
                  <DropdownMenuItem onClick={() => handleStageChange('new')}>
                    Move to New
                  </DropdownMenuItem>
                )}
                {lead.stage !== 'contacted' && (
                  <DropdownMenuItem onClick={() => handleStageChange('contacted')}>
                    Move to Contacted
                  </DropdownMenuItem>
                )}
                {lead.stage !== 'estimate_sent' && (
                  <DropdownMenuItem onClick={() => handleStageChange('estimate_sent')}>
                    Move to Estimate Sent
                  </DropdownMenuItem>
                )}
                {lead.stage !== 'won' && (
                  <DropdownMenuItem onClick={handleWinClick}>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Mark as Won
                  </DropdownMenuItem>
                )}
                {lead.stage !== 'lost' && (
                  <DropdownMenuItem onClick={handleLoseClick}>
                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    Mark as Lost
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Additional Info Tooltip */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 cursor-help">
                {lead.notes || (lead.email && <Mail className="inline h-3 w-3 mr-1" />) || 'No additional info'}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              {lead.email && (
                <div className="mb-1">
                  <span className="font-medium">Email:</span> {lead.email}
                </div>
              )}
              {lead.source && (
                <div className="mb-1">
                  <span className="font-medium">Source:</span> {lead.source}
                </div>
              )}
              {lead.notes && (
                <div>
                  <span className="font-medium">Notes:</span> {lead.notes}
                </div>
              )}
              {followUpDateFormatted && (
                <div className="mt-1 text-amber-600">
                  <span className="font-medium">Follow-up:</span> {followUpDateFormatted}
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default LeadCard;
