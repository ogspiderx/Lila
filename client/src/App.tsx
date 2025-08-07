import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

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
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Video Loading Bar */}
      {videoLoading && (
        <div className="fixed top-0 left-0 w-full h-2 bg-gray-800 z-50">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${videoProgress}%` }}
          />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
            Loading video: {Math.round(videoProgress)}%
          </div>
        </div>
      )}
      
      <video 
        className="video-background"
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        preload="auto"
        onLoadStart={() => {
          console.log('Video loading started');
          setVideoLoading(true);
          setVideoProgress(10);
        }}
        onProgress={(e) => {
          const video = e.target as HTMLVideoElement;
          if (video.buffered.length > 0) {
            const buffered = video.buffered.end(0);
            const duration = video.duration;
            if (duration > 0) {
              const progress = (buffered / duration) * 100;
              setVideoProgress(Math.min(progress, 90));
            }
          }
        }}
        onLoadedData={() => {
          console.log('Video data loaded');
          setVideoProgress(100);
          setTimeout(() => setVideoLoading(false), 500);
        }}
        onCanPlayThrough={() => {
          console.log('Video can play through');
          setVideoProgress(100);
          setTimeout(() => setVideoLoading(false), 500);
        }}
        onError={(e) => {
          console.error('Video error:', e);
          setVideoLoading(false);
        }}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -10,
          opacity: 1
        }}
      >
        <source src="/attached_assets/totoro-watching-starry-night-sky-moewalls-com_1754542222272.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className="min-h-screen text-foreground relative z-10" style={{ background: 'transparent' }}>
        <Router />
      </div>
    </QueryClientProvider>
  );
}

export default App;
