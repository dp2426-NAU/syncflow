import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Column } from "@/components/board/Column";
import { ActivityFeed } from "@/components/board/ActivityFeed";
import { NewTaskDialog } from "@/components/board/NewTaskDialog";
import { boardApi, columnsApi, tasksApi } from "@/lib/api";
import type { Task } from "@shared/schema";
import generatedImage from '@assets/generated_images/subtle_abstract_dark_blue_data_flow_background_with_soft_glowing_lines.png';
import { toast } from "@/hooks/use-toast";

type ColumnWithTasks = {
  id: string;
  title: string;
  position: number;
  createdAt: Date;
  tasks: Task[];
};

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [showActivityFeed, setShowActivityFeed] = useState(true);

  // Fetch board data (columns with tasks)
  const { data: columns = [], isLoading } = useQuery<ColumnWithTasks[]>({
    queryKey: ["board"],
    queryFn: boardApi.getAll,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] });
      toast({ title: "Task created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create task", description: error.message, variant: "destructive" });
    },
  });

  // Create column mutation
  const createColumnMutation = useMutation({
    mutationFn: columnsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] });
      toast({ title: "Section created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create section", description: error.message, variant: "destructive" });
    },
  });

  const handleAddTask = (columnId: string) => {
    setActiveColumnId(columnId);
    setIsDialogOpen(true);
  };

  const handleNewTaskFromNavbar = () => {
    // Default to first column (Backlog) if exists
    const firstColumn = columns[0];
    if (firstColumn) {
      setActiveColumnId(firstColumn.id);
    }
    setIsDialogOpen(true);
  };

  const handleCreateTask = (taskData: { title: string; description: string; tag: string; priority: string }) => {
    if (!activeColumnId) {
      // If no column selected, use first column
      const firstColumn = columns[0];
      if (!firstColumn) {
        toast({ title: "No columns available", variant: "destructive" });
        return;
      }
      createTaskMutation.mutate({
        title: taskData.title,
        description: taskData.description,
        tag: taskData.tag,
        priority: taskData.priority,
        columnId: firstColumn.id,
        assignedTo: [],
        activeViewers: [],
        comments: 0,
      });
    } else {
      createTaskMutation.mutate({
        title: taskData.title,
        description: taskData.description,
        tag: taskData.tag,
        priority: taskData.priority,
        columnId: activeColumnId,
        assignedTo: [],
        activeViewers: [],
        comments: 0,
      });
    }
  };

  const handleAddColumn = () => {
    const maxPosition = Math.max(...columns.map(col => col.position), -1);
    createColumnMutation.mutate({
      title: "New Section",
      position: maxPosition + 1,
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
      {/* Dynamic Background Overlay */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        <img src={generatedImage} className="w-full h-full object-cover" alt="Background" />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
      </div>

      <Navbar onNewTask={handleNewTaskFromNavbar} />

      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Main Board Area */}
        <main className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6">
          <div className="h-full flex gap-4 md:gap-6">
            {columns.map(col => (
              <Column 
                key={col.id} 
                column={col} 
                onAddTask={handleAddTask}
              />
            ))}
            
            {/* Add Column Button */}
            <button 
              onClick={handleAddColumn}
              disabled={createColumnMutation.isPending}
              data-testid="button-add-section"
              className="w-64 md:w-80 min-w-[256px] md:min-w-[320px] h-[100px] shrink-0 rounded-xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
            >
              {createColumnMutation.isPending ? "Creating..." : "+ Add Section"}
            </button>
          </div>
        </main>

        {/* Right Sidebar - Activity Feed (collapsible on smaller screens) */}
        <div className={`${showActivityFeed ? 'w-72 md:w-80' : 'w-0'} transition-all duration-300 overflow-hidden shrink-0 border-l border-white/5`}>
          <ActivityFeed />
        </div>
        
        {/* Toggle Activity Feed Button */}
        <button
          onClick={() => setShowActivityFeed(!showActivityFeed)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 bg-card border border-white/10 rounded-l-lg hover:bg-white/10 transition-colors"
          title={showActivityFeed ? "Hide Activity" : "Show Activity"}
        >
          <svg className={`w-4 h-4 transition-transform ${showActivityFeed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <NewTaskDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        columnId={activeColumnId}
        onCreate={handleCreateTask}
      />
    </div>
  );
}
