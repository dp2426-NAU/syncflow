import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Plus, Layout, FileText, GitPullRequest, Users as UsersIcon, Check, X } from "lucide-react";
import { usersApi, notificationsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface NavbarProps {
  onNewTask?: () => void;
}

export function Navbar({ onNewTask }: NavbarProps) {
  const [location] = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
  });

  // Use first user as "current user" for demo purposes
  const currentUser = users[0];

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", currentUser?.id],
    queryFn: () => currentUser ? notificationsApi.getByUser(currentUser.id) : Promise.resolve([]),
    enabled: !!currentUser,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["notifications-unread", currentUser?.id],
    queryFn: () => currentUser ? notificationsApi.getUnreadCount(currentUser.id) : Promise.resolve({ count: 0 }),
    enabled: !!currentUser,
    refetchInterval: 10000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      if (currentUser) {
        queryClient.invalidateQueries({ queryKey: ["notifications", currentUser.id] });
        queryClient.invalidateQueries({ queryKey: ["notifications-unread", currentUser.id] });
      }
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => currentUser ? notificationsApi.markAllAsRead(currentUser.id) : Promise.resolve({ success: true }),
    onSuccess: () => {
      if (currentUser) {
        queryClient.invalidateQueries({ queryKey: ["notifications", currentUser.id] });
        queryClient.invalidateQueries({ queryKey: ["notifications-unread", currentUser.id] });
      }
    },
  });

  const navLinks = [
    { href: "/", label: "Board", icon: Layout },
    { href: "/adrs", label: "Decisions", icon: FileText },
    { href: "/prs", label: "PR Review", icon: GitPullRequest },
    { href: "/team", label: "Team", icon: UsersIcon },
  ];

  const isDashboard = location === "/";

  return (
    <nav className="h-16 border-b border-white/5 bg-card/30 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4 md:gap-8">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <div className="h-3 w-3 bg-white rounded-full" />
            </div>
            <span className="font-display font-bold text-lg md:text-xl tracking-tight hidden sm:block">SyncFlow</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-1">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <div className={cn(
                  "flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all cursor-pointer",
                  isActive 
                    ? "bg-white/10 text-primary shadow-[0_0_10px_rgba(6,182,212,0.1)]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}>
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden md:flex -space-x-2 mr-2">
          {users.slice(0, 4).map((user) => (
            <div key={user.id} className="relative group cursor-pointer">
              <img 
                src={user.avatar || "https://i.pravatar.cc/150?u=default"} 
                alt={user.name} 
                className="w-8 h-8 rounded-full border-2 border-background ring-2 ring-transparent group-hover:ring-primary/50 transition-all"
              />
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background ${user.status === 'online' ? 'bg-green-500' : user.status === 'idle' ? 'bg-amber-500' : 'bg-slate-500'}`} />
            </div>
          ))}
          {users.length > 4 && (
            <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-medium hover:bg-white/10 transition-colors">
              +{users.length - 4}
            </button>
          )}
        </div>

        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <button 
              className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
              data-testid="button-notifications"
            >
              <Bell className="w-5 h-5" />
              {(unreadCount?.count ?? 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary rounded-full text-[10px] font-bold flex items-center justify-center text-primary-foreground px-1">
                  {(unreadCount?.count ?? 0) > 9 ? "9+" : unreadCount?.count}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 bg-card/95 backdrop-blur-xl border-white/10" align="end">
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {notifications.length > 0 && (
                <button 
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-xs text-primary hover:underline"
                  disabled={markAllAsReadMutation.isPending}
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={cn(
                      "p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer",
                      !notification.read && "bg-primary/5"
                    )}
                    onClick={() => {
                      if (!notification.read) {
                        markAsReadMutation.mutate(notification.id);
                      }
                      if (notification.link) {
                        window.location.href = notification.link;
                      }
                      setNotificationsOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 shrink-0",
                        notification.read ? "bg-muted-foreground/30" : "bg-primary"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{notification.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsReadMutation.mutate(notification.id);
                          }}
                          className="p-1 hover:bg-white/10 rounded"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
        
        {isDashboard && onNewTask && (
          <button 
            onClick={onNewTask}
            data-testid="button-new-task-navbar"
            className="h-9 px-3 md:px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        )}
      </div>
    </nav>
  );
}
