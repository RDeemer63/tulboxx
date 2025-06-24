import React from "react";
import { format, formatDistanceToNowStrict } from "date-fns";
import {
  FileText,
  Phone,
  Mail,
  Calendar,
  ArrowRightCircle,
  FileCheck,
  UploadCloud,
  User,
} from "lucide-react";

import { type LeadEvent, type LeadEventType } from "../../../shared/leads-schema";
import { cn } from "@/lib/utils";

// Import Blue Steel UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

// --- Configuration for Event Types ---

interface EventTypeConfig {
  icon: React.ElementType;
  color: string; // Tailwind CSS class for background color
  label: string;
}

const eventConfig: Record<LeadEventType, EventTypeConfig> = {
  note: {
    icon: FileText,
    color: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
    label: "Note Added",
  },
  call_log: {
    icon: Phone,
    color: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
    label: "Call Logged",
  },
  email_sent: {
    icon: Mail,
    color: "bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400",
    label: "Email Sent",
  },
  meeting_log: {
    icon: Calendar,
    color: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400",
    label: "Meeting Logged",
  },
  status_change: {
    icon: ArrowRightCircle,
    color: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
    label: "Status Changed",
  },
  estimate_created: {
    icon: FileCheck,
    color: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400",
    label: "Estimate Created",
  },
  file_upload: {
    icon: UploadCloud,
    color: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
    label: "File Uploaded",
  },
};

// --- Component Props ---

interface LeadTimelineEntryProps {
  event: LeadEvent;
  isFirst?: boolean; // To handle the top line of the timeline connector
}

// --- Main Component ---

export const LeadTimelineEntry: React.FC<LeadTimelineEntryProps> = ({
  event,
  isFirst = false,
}) => {
  const config = eventConfig[event.type] || eventConfig.note;
  const Icon = config.icon;

  const renderContent = () => {
    switch (event.type) {
      case "status_change":
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-slate-700 dark:text-slate-300">{event.content}</p>
            {event.meta?.fromStage && (
              <Badge variant="outline">{event.meta.fromStage}</Badge>
            )}
            <ArrowRightCircle className="h-4 w-4 text-slate-400" />
            {event.meta?.toStage && (
              <Badge variant="secondary">{event.meta.toStage}</Badge>
            )}
          </div>
        );
      case "file_upload":
        return (
          <p className="text-slate-700 dark:text-slate-300">
            {event.content}{" "}
            {event.meta?.fileName && (
              <Button variant="link" className="p-0 h-auto">
                {event.meta.fileName}
              </Button>
            )}
          </p>
        );
      default:
        return (
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {event.content}
          </p>
        );
    }
  };

  const handleAddToCalendar = () => {
    // Basic .ics file generation logic
    // In a real app, this would be more robust
    const formatIcsDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const eventDate = new Date(event.createdAt);
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `UID:${event.id}@tulboxx.com`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(eventDate)}`,
      `DTEND:${formatIcsDate(new Date(eventDate.getTime() + 60 * 60 * 1000))}`, // Assume 1 hour duration
      `SUMMARY:Follow-up for Lead: ${event.leadId}`,
      `DESCRIPTION:${event.content.replace(/\n/g, "\\n")}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lead_event.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <TooltipProvider>
      <div className="relative flex items-start gap-4 pl-10">
        {/* Timeline Connector Line */}
        <div
          className={cn(
            "absolute left-4 top-5 h-full w-0.5 bg-slate-200 dark:bg-slate-700",
            isFirst && "top-5"
          )}
        />

        {/* Icon */}
        <div
          className={cn(
            "absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full",
            config.color
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2 pb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                {/* Placeholder for user image */}
                <AvatarFallback>
                  {event.createdBy?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {event.createdBy || "System"}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                • {config.label}
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDistanceToNowStrict(new Date(event.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {format(new Date(event.createdAt), "PPP p")}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="rounded-md bg-white dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-700">
            {renderContent()}
            {event.type === "meeting_log" && (
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddToCalendar}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Calendar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default LeadTimelineEntry;
