import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, ExternalLink, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface CalendarIntegrationProps {
  onClose?: () => void;
}

export default function CalendarIntegration({ onClose }: CalendarIntegrationProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("");
  const { toast } = useToast();

  // Get authorization URL
  const getAuthUrlMutation = useMutation({
    mutationFn: () => apiRequest("GET", "/api/calendar/auth-url"),
    onSuccess: (response: any) => {
      window.open(response.authUrl, "_blank", "width=600,height=600");
      toast({
        title: "Authorization Required",
        description: "Please complete the authorization in the popup window, then click 'Complete Authorization' below.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get authorization URL",
        variant: "destructive",
      });
    },
  });

  // Complete OAuth callback (user will provide auth code)
  const completeAuthMutation = useMutation({
    mutationFn: (code: string) => apiRequest("POST", "/api/calendar/oauth-callback", { code }),
    onSuccess: () => {
      setIsAuthorized(true);
      toast({
        title: "Calendar Connected",
        description: "Google Calendar integration is now active",
      });
    },
    onError: () => {
      toast({
        title: "Authorization Failed",
        description: "Failed to complete calendar authorization",
        variant: "destructive",
      });
    },
  });

  // Sync all jobs to calendar
  const syncAllMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/calendar/sync-all", {}),
    onSuccess: (response: any) => {
      setSyncStatus(`Synced ${response.syncedCount} of ${response.totalJobs} scheduled jobs`);
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${response.syncedCount} jobs to Google Calendar`,
      });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync jobs to calendar",
        variant: "destructive",
      });
    },
  });

  const handleCompleteAuth = () => {
    const authCode = prompt("Please paste the authorization code from Google:");
    if (authCode) {
      completeAuthMutation.mutate(authCode.trim());
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Connection Status</p>
              <p className="text-sm text-gray-600">
                Sync your scheduled jobs with Google Calendar
              </p>
            </div>
            <Badge variant={isAuthorized ? "default" : "secondary"}>
              {isAuthorized ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Not Connected
                </>
              )}
            </Badge>
          </div>

          {!isAuthorized ? (
            <div className="space-y-3">
              <Button
                onClick={() => getAuthUrlMutation.mutate()}
                disabled={getAuthUrlMutation.isPending}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {getAuthUrlMutation.isPending ? "Getting Authorization..." : "Connect Google Calendar"}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleCompleteAuth}
                disabled={completeAuthMutation.isPending}
                className="w-full"
              >
                {completeAuthMutation.isPending ? "Completing..." : "Complete Authorization"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={() => syncAllMutation.mutate()}
                disabled={syncAllMutation.isPending}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncAllMutation.isPending ? "animate-spin" : ""}`} />
                {syncAllMutation.isPending ? "Syncing Jobs..." : "Sync All Scheduled Jobs"}
              </Button>
              
              {syncStatus && (
                <div className="text-sm text-gray-600 text-center">
                  {syncStatus}
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>What gets synced:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Scheduled and in-progress jobs</li>
              <li>Customer names and addresses</li>
              <li>Job descriptions and notes</li>
              <li>Color-coded by job status</li>
            </ul>
          </div>

          {onClose && (
            <Button variant="outline" onClick={onClose} className="w-full">
              Close
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}