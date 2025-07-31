import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Clock, Users, ArrowRight, Coffee, Star } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
}

export default function Welcome() {
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load current user
  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const user = (userData as any)?.user as User | undefined;

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getPersonalizedMessage = () => {
    const messages = {
      wale: [
        "Ready to connect with your team?",
        "Your workspace is waiting for you.",
        "Time to share some great ideas!"
      ],
      xiu: [
        "Welcome back to your collaborative space!",
        "Ready to continue the conversation?",
        "Your creative hub awaits!"
      ]
    };
    
    const userMessages = messages[user.username.toLowerCase() as keyof typeof messages] || [
      "Ready to start chatting?",
      "Your conversation space is ready!",
      "Time to connect with others!"
    ];
    
    return userMessages[Math.floor(Math.random() * userMessages.length)];
  };

  const stats = [
    { icon: MessageCircle, label: "Messages", value: "Ready to chat" },
    { icon: Users, label: "Team", value: "Online" },
    { icon: Star, label: "Status", value: "Active" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Main Welcome Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Card className="bg-slate-800/90 border-slate-700 shadow-2xl backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-col items-center space-y-4"
              >
                <Avatar className="h-20 w-20 bg-gradient-to-br from-emerald-400 to-emerald-600 border-4 border-emerald-400/30">
                  <AvatarFallback className="text-2xl font-bold text-white bg-transparent">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-3xl font-bold text-white"
                  >
                    {getGreeting()}, {user.username}!
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="text-slate-300 text-lg"
                  >
                    {getPersonalizedMessage()}
                  </motion.p>
                </div>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Time Display */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center justify-center space-x-2 text-slate-400 bg-slate-700/50 rounded-lg p-3"
              >
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {currentTime.toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="grid grid-cols-3 gap-4"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                    className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600/30"
                  >
                    <stat.icon className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                    <p className="text-sm font-semibold text-white">{stat.value}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Quick Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Coffee className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-emerald-300">Quick Tip</h3>
                </div>
                <p className="text-sm text-slate-300">
                  Use real-time messaging to collaborate instantly with your team. 
                  Your messages are synchronized across all devices!
                </p>
              </motion.div>

              {/* Enter Chat Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                className="pt-4"
              >
                <Button
                  onClick={() => setLocation("/chat")}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 group"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Enter Chat Room
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-slate-500 text-sm">
            Secure • Real-time • Collaborative
          </p>
        </motion.div>
      </div>
    </div>
  );
}