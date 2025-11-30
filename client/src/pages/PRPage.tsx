import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { prReviewsApi, usersApi } from "@/lib/api";
import { GitPullRequest, AlertTriangle, Shield, Zap, Check, Loader2, Link as LinkIcon, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import generatedImage from '@assets/generated_images/subtle_abstract_dark_blue_data_flow_background_with_soft_glowing_lines.png';

export default function PRPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputType, setInputType] = useState<"url" | "diff">("diff");
  const [prUrl, setPrUrl] = useState("");
  const [diffContent, setDiffContent] = useState("");
  const [prTitle, setPrTitle] = useState("");
  const [selectedPr, setSelectedPr] = useState<string | null>(null);

  const { data: prs = [], isLoading } = useQuery({
    queryKey: ["pr-reviews"],
    queryFn: prReviewsApi.getAll,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
  });

  // Use first user as current user for demo
  const currentUser = users[0];

  const analyzeMutation = useMutation({
    mutationFn: prReviewsApi.analyze,
    onSuccess: (pr) => {
      queryClient.invalidateQueries({ queryKey: ["pr-reviews"] });
      toast({ title: "PR Analysis Complete", description: `Risk level: ${pr.riskLevel}` });
      setIsDialogOpen(false);
      setPrUrl("");
      setDiffContent("");
      setPrTitle("");
      setSelectedPr(pr.id);
    },
    onError: (error: Error) => {
      toast({ title: "Analysis Failed", description: error.message, variant: "destructive" });
    },
  });

  const handleAnalyze = () => {
    if (!currentUser) {
      toast({ title: "Error", description: "No user found", variant: "destructive" });
      return;
    }
    
    if (inputType === "url" && !prUrl) {
      toast({ title: "Error", description: "Please enter a PR URL", variant: "destructive" });
      return;
    }
    if (inputType === "diff" && !diffContent) {
      toast({ title: "Error", description: "Please paste the code diff", variant: "destructive" });
      return;
    }

    analyzeMutation.mutate({
      prUrl: inputType === "url" ? prUrl : undefined,
      diffContent: inputType === "diff" ? diffContent : undefined,
      title: prTitle || undefined,
      authorId: currentUser.id,
    });
  };

  const activePr = selectedPr ? prs.find(pr => pr.id === selectedPr) : prs[0];

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-muted-foreground">Loading PR reviews...</p>
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
            <h1 className="font-display font-bold text-3xl mb-2">PR Review Helper</h1>
            <p className="text-muted-foreground">AI-assisted pull request analysis and risk assessment.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div 
              className="glass-panel p-6 rounded-xl border-dashed border-2 border-white/10 bg-white/5 flex flex-col items-center justify-center text-center min-h-[200px] cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setIsDialogOpen(true)}
              data-testid="button-analyze-pr-trigger"
            >
              <GitPullRequest className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-2">Paste Diff or PR URL</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-4">
                Paste a git diff or a GitHub PR link to generate a summary and review checklist.
              </p>
              <button 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
                data-testid="button-analyze-pr"
              >
                Analyze PR
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg">Recent Analyses</h3>
              {prs.map(pr => {
                const author = users.find(u => u.id === pr.authorId);
                const isSelected = pr.id === activePr?.id;
                return (
                  <div 
                    key={pr.id} 
                    className={cn(
                      "glass-card p-5 rounded-xl group cursor-pointer transition-all",
                      isSelected && "ring-2 ring-primary/50"
                    )}
                    onClick={() => setSelectedPr(pr.id)}
                    data-testid={`card-pr-${pr.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">#{pr.id.substring(0, 8)}</span>
                        <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{pr.title}</h4>
                      </div>
                      <div className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1",
                        pr.riskLevel === 'High' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        pr.riskLevel === 'Medium' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-green-500/10 text-green-500 border-green-500/20"
                      )}>
                        <AlertTriangle className="w-3 h-3" />
                        {pr.riskLevel} Risk
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{pr.summary}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <img src={author?.avatar || "https://i.pravatar.cc/150?u=default"} className="w-5 h-5 rounded-full" alt={author?.name} />
                      <span>Analyzed by {author?.name}</span>
                    </div>
                  </div>
                );
              })}

              {prs.length === 0 && (
                <div className="text-center py-8">
                  <GitPullRequest className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No PR reviews yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Analyze PR" to get started</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl h-fit sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl">Review Checklist</h2>
              <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">Auto-generated</span>
            </div>

            {activePr ? (
              <>
                <div className="mb-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-sm font-medium">{activePr.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activePr.summary}</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-amber-400 text-sm font-medium">
                      <Shield className="w-4 h-4" />
                      Review Items
                    </div>
                    <div className="space-y-2 pl-2 border-l border-white/10">
                      {(activePr.checklist as Array<{ id: string; text: string; checked: boolean }>)?.map((item) => (
                        <label key={item.id} className="flex items-start gap-3 p-2 hover:bg-white/5 rounded cursor-pointer transition-colors">
                          <div className={cn(
                            "mt-0.5 relative flex items-center justify-center w-4 h-4 rounded border",
                            item.checked 
                              ? "border-primary bg-primary" 
                              : "border-white/20"
                          )}>
                            {item.checked && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                          <span className={cn(
                            "text-sm text-muted-foreground",
                            item.checked && "line-through opacity-50"
                          )}>{item.text}</span>
                        </label>
                      ))}
                      {(!activePr.checklist || (activePr.checklist as any[]).length === 0) && (
                        <p className="text-sm text-muted-foreground">No checklist items</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-end gap-3">
                  <button className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">Request Changes</button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-green-500/20 hover:bg-green-500 transition-colors">Approve PR</button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <GitPullRequest className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a PR to view its checklist</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Analyze PR Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10 text-foreground sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Analyze Pull Request</DialogTitle>
            <DialogDescription>
              Paste a code diff or PR URL to get AI-powered analysis and review suggestions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="pr-title">Title (optional)</Label>
              <Input 
                id="pr-title"
                value={prTitle}
                onChange={(e) => setPrTitle(e.target.value)}
                placeholder="e.g., feat: Add user authentication"
                className="bg-white/5 border-white/10 focus:border-primary/50"
              />
            </div>

            <Tabs value={inputType} onValueChange={(v) => setInputType(v as "url" | "diff")}>
              <TabsList className="w-full bg-white/5">
                <TabsTrigger value="diff" className="flex-1 gap-2">
                  <Code className="w-4 h-4" />
                  Paste Diff
                </TabsTrigger>
                <TabsTrigger value="url" className="flex-1 gap-2">
                  <LinkIcon className="w-4 h-4" />
                  PR URL
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="diff" className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="diff-content">Code Diff</Label>
                  <Textarea 
                    id="diff-content"
                    value={diffContent}
                    onChange={(e) => setDiffContent(e.target.value)}
                    placeholder={`Paste your git diff here...\n\n+ added line\n- removed line`}
                    className="bg-white/5 border-white/10 focus:border-primary/50 font-mono text-xs min-h-[200px] resize-none"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="url" className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="pr-url">GitHub PR URL</Label>
                  <Input 
                    id="pr-url"
                    value={prUrl}
                    onChange={(e) => setPrUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo/pull/123"
                    className="bg-white/5 border-white/10 focus:border-primary/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Note: URL analysis provides a high-level summary. For detailed analysis, paste the actual diff.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending || (!prUrl && !diffContent)}
              className="bg-primary text-primary-foreground hover:opacity-90"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
