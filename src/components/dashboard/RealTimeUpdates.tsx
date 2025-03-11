
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

interface RealTimeUpdatesProps {
  refetch: () => void;
}

export function RealTimeUpdates({ refetch }: RealTimeUpdatesProps) {
  useEffect(() => {
    const channel = supabase
      .channel('global_meditation_updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'meditation_sessions' 
      }, (payload) => {
        console.log("New meditation session detected:", payload);
        // Immediately refetch data when a new session is inserted
        refetch();
        toast({
          title: "New meditation session completed",
          description: "Global stats have been updated!",
        });
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'meditation_sessions',
        filter: "status=eq.completed"
      }, (payload) => {
        console.log("Meditation session completed:", payload);
        // Immediately refetch data when a session status changes to completed
        refetch();
        toast({
          title: "Meditation session completed",
          description: "Global stats have been updated!",
        });
      })
      .subscribe((status) => {
        console.log("Subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to global meditation updates");
        } else if (status === 'CHANNEL_ERROR') {
          console.error("Error subscribing to global meditation updates");
          toast({
            title: "Connection Error",
            description: "Failed to subscribe to real-time updates. Data may not be current.",
            variant: "destructive",
          });
        }
      });

    return () => {
      console.log("Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return null; // This is a non-visual component
}
