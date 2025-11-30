import { TaskCard } from "./TaskCard";
import { MoreVertical, Plus } from "lucide-react";

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

interface ColumnData {
  id: string;
  title: string;
  position: number;
  createdAt: Date;
  tasks: TaskData[];
}

interface ColumnProps {
  column: ColumnData;
  onAddTask: (columnId: string) => void;
}

export function Column({ column, onAddTask }: ColumnProps) {
  return (
    <div className="flex flex-col w-64 md:w-80 min-w-[256px] md:min-w-[320px] shrink-0 h-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h2 className="font-display font-semibold text-sm text-foreground">{column.title}</h2>
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5 text-[10px] font-medium text-muted-foreground">
            {column.tasks.length}
          </span>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => onAddTask(column.id)}
            data-testid={`button-add-task-${column.id}`}
            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-white/5 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-white/5 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto pb-4 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {column.tasks.map((task: TaskData) => (
          <TaskCard key={task.id} task={task as any} />
        ))}
        
        <button 
          onClick={() => onAddTask(column.id)}
          data-testid={`button-add-task-bottom-${column.id}`}
          className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/10 text-sm text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all group"
        >
           <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
           <span>Add Task</span>
        </button>
      </div>
    </div>
  );
}
