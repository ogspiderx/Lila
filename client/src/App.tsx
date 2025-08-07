import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

import totoroVideo from "@assets/totoro-watching-starry-night-sky-moewalls-com_1754542222272.mp4";
import Login from "@/pages/login-optimized";
import Chat from "@/pages/chat-optimized";
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
  return (
    <QueryClientProvider client={queryClient}>
      <video 
        className="video-background"
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
      >
        <source src={totoroVideo} type="video/mp4" />
      </video>
      <div className="min-h-screen bg-background text-foreground">
        <Router />
      </div>
    </QueryClientProvider>
  );
}

export default App;
