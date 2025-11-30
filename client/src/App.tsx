import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChatBot } from "@/components/ChatBot";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import ADRPage from "@/pages/ADRPage";
import PRPage from "@/pages/PRPage";
import TeamPage from "@/pages/TeamPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/adrs" component={ADRPage} />
      <Route path="/prs" component={PRPage} />
      <Route path="/team" component={TeamPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <ChatBot />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
