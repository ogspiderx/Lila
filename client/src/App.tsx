import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

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
        preload="auto"
        onLoadStart={() => console.log('Video loading started')}
        onLoadedData={() => console.log('Video data loaded')}
        onError={(e) => console.error('Video error:', e)}
        style={{ zIndex: -2 }}
      >
        <source src="/attached_assets/totoro-watching-starry-night-sky-moewalls-com_1754542222272.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="min-h-screen text-foreground">
        <Router />
      </div>
    </QueryClientProvider>
  );
}

export default App;
