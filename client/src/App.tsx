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
  const { position, trail, isClicking, clickRipples } = useCursor();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
          {/* Background Particles */}
          <div className="fixed inset-0 pointer-events-none z-0">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-primary/20 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                }}
              />
            ))}
          </div>

          {/* Custom cursor trail */}
          {trail.map((point) => (
            <div
              key={point.id}
              className="fixed pointer-events-none z-[9998] w-2 h-2 rounded-full bg-primary/60 mix-blend-screen"
              style={{
                left: point.x - 4,
                top: point.y - 4,
                opacity: point.opacity,
                transform: `scale(${point.scale})`,
                transition: 'transform 0.1s ease-out',
              }}
            />
          ))}

          {/* Click ripples */}
          {clickRipples.map((ripple) => (
            <div
              key={ripple.id}
              className="fixed pointer-events-none z-[9997] border-2 border-accent/60 rounded-full"
              style={{
                left: ripple.x - ripple.scale,
                top: ripple.y - ripple.scale,
                width: ripple.scale * 2,
                height: ripple.scale * 2,
                opacity: ripple.opacity,
              }}
            />
          ))}

          {/* Main cursor */}
          <div
            className="fixed pointer-events-none z-[9999] w-4 h-4 rounded-full bg-gradient-to-br from-primary to-accent mix-blend-difference transition-transform duration-75 ease-out shadow-lg"
            style={{
              left: position.x - 8,
              top: position.y - 8,
              transform: isClicking ? 'scale(0.8)' : 'scale(1)',
              boxShadow: isClicking 
                ? '0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary))' 
                : '0 0 10px hsl(var(--primary))',
            }}
          />
          
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
