import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { usersApi } from "@/lib/api";
import { MapPin, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import generatedImage from '@assets/generated_images/subtle_abstract_dark_blue_data_flow_background_with_soft_glowing_lines.png';

export default function TeamPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
  });

  // Helper to calculate local time for a user
  const getLocalTime = (utcOffset: number) => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const newDate = new Date(utc + (3600000 * utcOffset));
    return newDate;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const isBusinessHours = (date: Date) => {
    const hours = date.getHours();
    return hours >= 9 && hours < 17;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-muted-foreground">Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <img src={generatedImage} className="w-full h-full object-cover" alt="Background" />
        <div className="absolute inset-0 bg-background/90 backdrop-blur-[2px]" />
      </div>

      <Navbar />

      <main className="flex-1 container mx-auto px-6 py-8 relative z-10 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl mb-2">Time Zone Planner</h1>
            <p className="text-muted-foreground">Coordinate across distributed teams effectively.</p>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Best Meeting Time: <strong>2:00 PM UTC</strong></span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {users.map((user) => {
            const localTime = getLocalTime(user.utcOffset);
            const active = isBusinessHours(localTime);
            
            return (
              <div key={user.id} className="glass-card p-6 rounded-xl flex flex-col items-center text-center relative overflow-hidden group">
                <div className={cn(
                  "absolute inset-0 opacity-10 transition-colors duration-500",
                  active ? "bg-gradient-to-b from-amber-500/20 to-transparent" : "bg-gradient-to-b from-indigo-900/20 to-transparent"
                )} />
                
                <div className="relative mb-4">
                  <img src={user.avatar || "https://i.pravatar.cc/150?u=default"} alt={user.name} className="w-20 h-20 rounded-full border-4 border-card shadow-xl" />
                  <div className={cn(
                    "absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-card flex items-center justify-center bg-background",
                    user.status === 'online' ? "text-green-500" : "text-slate-500"
                  )}>
                    <div className={cn("w-2.5 h-2.5 rounded-full", user.status === 'online' ? "bg-green-500" : "bg-slate-500")} />
                  </div>
                </div>
                
                <h3 className="font-display font-bold text-lg mb-1">{user.name}</h3>
                <p className="text-xs font-medium text-primary mb-4 uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">{user.role}</p>
                
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
                  <MapPin className="w-3 h-3" />
                  {user.timezone.replace('_', ' ')}
                </div>
                
                <div className="w-full mt-auto pt-6 border-t border-white/5">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {active ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                    <span className="text-2xl font-mono font-light">{formatTime(localTime)}</span>
                  </div>
                  <span className={cn("text-xs font-medium", active ? "text-green-400" : "text-indigo-300/70")}>
                    {active ? "Currently Working" : "Outside Business Hours"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="glass-panel p-8 rounded-xl">
          <h3 className="font-display font-semibold text-lg mb-6">Team Availability Overlap (UTC)</h3>
          <div className="relative h-32">
            <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
              {[...Array(25)].map((_, i) => (
                <span key={i} className={i % 4 === 0 ? "opacity-100" : "opacity-0 md:opacity-30"}>{i}:00</span>
              ))}
            </div>
            
            <div className="absolute top-8 left-0 right-0 bottom-0 flex flex-col justify-between gap-2">
              {users.map((user) => {
                const startPercent = ((9 - user.utcOffset + 24) % 24) / 24 * 100;
                const widthPercent = (8 / 24) * 100;
                
                return (
                  <div key={user.id} className="h-3 bg-white/5 rounded-full relative overflow-hidden w-full">
                    <div 
                      className="absolute top-0 bottom-0 bg-primary/30 rounded-full"
                      style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>
            
            <div className="absolute top-6 bottom-0 w-px bg-red-500 z-10 left-1/2">
              <div className="absolute -top-1 -translate-x-1/2 bg-red-500 text-white text-[10px] px-1 rounded">NOW</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
