import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import { MessageSquare, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskData {
  id: string;
  title: string;
  description: string;
  tag: string;
  priority: string;
  columnId: string;
  assignedTo: string[];
  activeViewers: string[];
  comments: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskCardProps {
  task: TaskData;
}

export function TaskCard({ task }: TaskCardProps) {
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
  });

  const activeViewers = users.filter(u => task.activeViewers.includes(u.id));
  const isBeingViewed = activeViewers.length > 0;
  
  const tagColors: Record<string, string> = {
    Design: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    Engineering: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Product: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Bug: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const priorityColors: Record<string, string> = {
    High: "bg-red-500",
    Medium: "bg-amber-500",
    Low: "bg-green-500",
  };

  return (
    <motion.div
      layoutId={task.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      data-testid={`card-task-${task.id}`}
      className={cn(
        "glass-card p-4 rounded-xl group cursor-pointer relative overflow-hidden",
        isBeingViewed && "ring-1 ring-primary/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
      )}
    >
      {/* Live Presence Indicator */}
      {isBeingViewed && (
        <div className="absolute top-0 right-0 p-1.5 flex -space-x-1 bg-background/80 backdrop-blur-sm rounded-bl-xl border-l border-b border-white/5 z-10">
          {activeViewers.map(viewer => (
            <div key={viewer.id} className="relative" title={`${viewer.name} is viewing`}>
               <img src={viewer.avatar || "https://i.pravatar.cc/150?u=default"} className="w-5 h-5 rounded-full border border-background" />
               <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border uppercase tracking-wider", tagColors[task.tag] || "bg-slate-500/10 text-slate-400 border-slate-500/20")}>
          {task.tag}
        </span>
        <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <h3 className="font-medium text-sm text-foreground mb-1 leading-tight group-hover:text-primary transition-colors">
        {task.title}
      </h3>
      
      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
        {task.description}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex -space-x-2">
          {task.assignedTo.map(userId => {
             const user = users.find(u => u.id === userId);
             if (!user) return null;
             return (
               <img 
                 key={user.id} 
                 src={user.avatar || "https://i.pravatar.cc/150?u=default"} 
                 alt={user.name}
                 className="w-6 h-6 rounded-full border-2 border-card bg-card" 
               />
             );
          })}
        </div>

        <div className="flex items-center gap-3 text-muted-foreground text-xs">
          {task.comments > 0 && (
            <div className="flex items-center gap-1 hover:text-foreground transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{task.comments}</span>
            </div>
          )}
          <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority] || "bg-slate-500"}`} title={`Priority: ${task.priority}`} />
        </div>
      </div>
      
      {/* Subtle Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
}
