import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { adrsApi, usersApi } from "@/lib/api";
import { FileText, Tag, Calendar, CheckCircle2, CircleDashed, XCircle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import generatedImage from '@assets/generated_images/subtle_abstract_dark_blue_data_flow_background_with_soft_glowing_lines.png';

export default function ADRPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");

  const { data: adrs = [], isLoading } = useQuery({
    queryKey: ["adrs"],
    queryFn: adrsApi.getAll,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
  });

  const createAdrMutation = useMutation({
    mutationFn: adrsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adrs"] });
      toast({ title: "ADR proposed successfully" });
      setIsDialogOpen(false);
      setTitle("");
      setSummary("");
      setTags("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create ADR", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;
    
    const firstUser = users[0];
    if (!firstUser) {
      toast({ title: "No users available", variant: "destructive" });
      return;
    }

    createAdrMutation.mutate({
      title: title.trim(),
      summary: summary.trim(),
      status: "Proposed",
      authorId: firstUser.id,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Accepted": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "Proposed": return <CircleDashed className="w-4 h-4 text-amber-500" />;
      case "Rejected": return <XCircle className="w-4 h-4 text-red-500" />;
      case "Deprecated": return <AlertCircle className="w-4 h-4 text-slate-500" />;
      default: return <CircleDashed className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "Proposed": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Rejected": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "Deprecated": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default: return "bg-slate-500/10";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-muted-foreground">Loading ADRs...</p>
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

      <main className="flex-1 container mx-auto px-6 py-8 relative z-10 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl mb-2">Architecture Decision Log</h1>
            <p className="text-muted-foreground">Track and version control architectural decisions.</p>
          </div>
          <button 
            onClick={() => setIsDialogOpen(true)}
            data-testid="button-propose-adr"
            className="h-10 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 text-sm font-medium shadow-lg shadow-primary/20"
          >
            <FileText className="w-4 h-4" />
            Propose New ADR
          </button>
        </div>

        <div className="grid gap-4">
          {adrs.map((adr) => {
            const author = users.find(u => u.id === adr.authorId);
            const formattedDate = new Date(adr.createdAt).toLocaleDateString();
            
            return (
              <div key={adr.id} data-testid={`card-adr-${adr.id}`} className="glass-card p-6 rounded-xl flex flex-col md:flex-row gap-6 items-start md:items-center group">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {adr.id.substring(0, 8)}
                    </span>
                    <div className={cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-medium", getStatusColor(adr.status))}>
                      {getStatusIcon(adr.status)}
                      {adr.status}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto md:ml-0">
                      <Calendar className="w-3 h-3" />
                      {formattedDate}
                    </span>
                  </div>
                  
                  <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors mb-2">
                    {adr.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {adr.summary}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {adr.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded-md hover:text-foreground transition-colors">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-0 md:pl-6 md:border-l border-white/5 min-w-[200px]">
                  <img src={author?.avatar || "https://i.pravatar.cc/150?u=default"} alt={author?.name} className="w-10 h-10 rounded-full border-2 border-card" />
                  <div>
                    <div className="text-sm font-medium">{author?.name}</div>
                    <div className="text-xs text-muted-foreground">{author?.role}</div>
                  </div>
                </div>
              </div>
            );
          })}

          {adrs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No ADRs yet. Create your first decision record!</p>
            </div>
          )}
        </div>
      </main>

      {/* New ADR Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDialogOpen(false)} />
          <div className="relative bg-card border border-white/10 rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl">Propose New ADR</h2>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ADR-XXX: Short descriptive title"
                  data-testid="input-adr-title"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Summary</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Describe the decision context, options considered, and rationale..."
                  data-testid="input-adr-summary"
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all resize-none placeholder:text-muted-foreground/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Frontend, Backend, Security"
                  data-testid="input-adr-tags"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAdrMutation.isPending || !title.trim() || !summary.trim()}
                  data-testid="button-submit-adr"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createAdrMutation.isPending ? "Creating..." : "Propose ADR"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
