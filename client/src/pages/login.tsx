import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, AlertCircle, Heart, Sparkles, Lock, User } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Check if user is already authenticated
  useEffect(() => {
    const controller = new AbortController();
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include",
          signal: controller.signal,
        });
        if (response.ok) {
          setLocation("/welcome");
          return;
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        // Silently continue - user just needs to login
      }
      setIsLoading(false);
    };

    checkAuth();
    
    return () => controller.abort();
  }, [setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setLocation("/welcome");
      } else {
        const data = await response.json();
        setError(data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900/20 flex items-center justify-center relative overflow-hidden">
        {/* Loading animation background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--emerald-500)_0%,_transparent_70%)] opacity-10"></div>
        </div>
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.6 }}
          className="relative z-10"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 w-12 h-12 border border-emerald-400/50 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Romantic animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--emerald-500)_0%,_transparent_50%)] opacity-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--emerald-600)_0%,_transparent_50%)] opacity-8"></div>
      </div>
      
      {/* Floating hearts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, Math.random() * 20 - 10, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          >
            <Heart className="w-2 h-2 text-emerald-400/30" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Romantic App Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Sparkles className="w-8 h-8 text-emerald-400 mr-3" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent tracking-wide">
              Lila
            </h1>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-6 h-6 text-emerald-400 fill-current ml-3" />
            </motion.div>
          </div>
          <motion.p 
            className="text-emerald-200/70 text-lg font-light"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Your enchanted conversation space ✨
          </motion.p>
        </motion.div>

        {/* Romantic Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="glass-card rounded-3xl p-8 border border-emerald-500/30 relative overflow-hidden">
            {/* Romantic gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-400/5" />
            
            <div className="relative z-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Label className="text-emerald-200 text-sm font-medium mb-3 block flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Choose Your Identity
                  </Label>
                  <Select value={username} onValueChange={setUsername}>
                    <SelectTrigger className="glass-card border border-emerald-500/30 rounded-xl h-12 text-white bg-slate-800/50 hover:border-emerald-400 transition-all duration-300">
                      <SelectValue placeholder="Select your magical identity..." />
                    </SelectTrigger>
                    <SelectContent className="glass-card border border-emerald-500/30 bg-slate-800">
                      <SelectItem value="Wale" className="text-white hover:bg-emerald-500/20 focus:bg-emerald-500/20">
                        Wale ✨
                      </SelectItem>
                      <SelectItem value="Xiu" className="text-white hover:bg-emerald-500/20 focus:bg-emerald-500/20">
                        Xiu 💫
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Label className="text-emerald-200 text-sm font-medium mb-3 block flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Secret Passphrase
                  </Label>
                  <div className="relative">
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your secret words..."
                      className="glass-card border border-emerald-500/30 rounded-xl h-12 text-white bg-slate-800/50 placeholder-emerald-200/50 focus:border-emerald-400 focus:shadow-lg focus:shadow-emerald-500/20 transition-all duration-300 pr-12"
                    />
                    <AnimatePresence>
                      {password && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <motion.button
                    type="submit"
                    disabled={isLoading || !username || !password}
                    className="w-full btn-romantic h-14 rounded-2xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 group relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={username && password ? { boxShadow: ["0 0 0 0 rgba(52, 211, 153, 0.7)", "0 0 0 20px rgba(52, 211, 153, 0)"] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    <span>{isLoading ? "Opening the portal..." : "Enter the Enchanted Space"}</span>
                    
                    {/* Romantic shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.button>
                </motion.div>
              </form>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6"
                  >
                    <Alert
                      variant="destructive"
                      className="glass-card border-red-500/30 bg-red-900/20 backdrop-blur-sm"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm text-red-200">
                        {error}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Romantic hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-8 text-center"
        >
          <motion.p 
            className="text-emerald-200/50 text-sm font-light"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            ✨ Made with love for Wale & Xiu ✨
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
