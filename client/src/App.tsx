import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useCursor } from "@/hooks/use-cursor";
import Login from "@/pages/login";
import Chat from "@/pages/chat";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/chat" component={Chat} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const cursorRef = useCursor();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div ref={cursorRef} className="custom-cursor" />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
