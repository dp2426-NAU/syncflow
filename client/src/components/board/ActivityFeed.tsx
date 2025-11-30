import { useQuery } from "@tanstack/react-query";
import { activitiesApi, usersApi } from "@/lib/api";
import { Zap, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ActivityFeed() {
  const { data: activities = [] } = useQuery({
    queryKey: ["activities"],
    queryFn: () => activitiesApi.getRecent(20),
    refetchInterval: 5000, // Refresh every 5 seconds for "real-time" feel
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
  });

  return (
    <div className="w-80 border-l border-white/5 bg-card/20 backdrop-blur-md h-full flex flex-col">
      <div className="p-4 border-b border-white/5 flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-sm">Live Activity</h3>
        <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-medium text-green-400">Live</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No recent activity
          </div>
        ) : (
          activities.map((activity, index) => {
            const user = users.find(u => u.id === activity.userId);
            const timeAgo = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });
            
            return (
              <div key={activity.id} className="relative flex gap-3 group">
                {index !== activities.length - 1 && (
                  <div className="absolute left-[15px] top-8 bottom-[-24px] w-[1px] bg-white/5 group-hover:bg-primary/20 transition-colors" />
                )}
                
                <img 
                  src={user?.avatar || "https://i.pravatar.cc/150?u=default"} 
                  alt={user?.name}
                  className="w-8 h-8 rounded-full border border-white/10 bg-background shrink-0 z-10" 
                />
                
                <div className="flex flex-col pt-0.5">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground hover:underline cursor-pointer">{user?.name}</span> {activity.action}
                  </div>
                  <div className="text-xs font-medium text-primary/80 mt-0.5">{activity.target}</div>
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground/70">
                    <Clock className="w-3 h-3" />
                    {timeAgo}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
