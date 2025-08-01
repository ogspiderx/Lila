import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { LogIn, AlertCircle } from "lucide-react";

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen romantic-gradient flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm sm:max-w-md"
      >
        {/* App Branding */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold text-rose-500 glow-text-rose mb-3 sm:mb-5 tracking-wide">
            Rosé
          </h1>
          <p className="text-rose-400 text-lg sm:text-xl font-medium romantic-text">
            Where hearts connect intimately
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="glass-card shadow-2xl relative overflow-hidden">
            <CardContent className="p-8 sm:p-10 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div>
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-card-foreground mb-2 block"
                  >
                    Username
                  </Label>
                  <Select value={username} onValueChange={setUsername}>
                    <SelectTrigger className="w-full select-trigger rounded-xl smooth-transition h-12">
                      <SelectValue placeholder="Choose your identity" />
                    </SelectTrigger>
                    <SelectContent className="select-content">
                      <SelectItem value="Wale" className="select-item">
                        Wale
                      </SelectItem>
                      <SelectItem value="Xiu" className="select-item">
                        Xiu
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-card-foreground mb-2 block"
                  >
                    Password
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password..."
                    className="w-full input-field rounded-xl smooth-transition h-12"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !username || !password}
                  className="w-full btn-primary font-semibold py-3 sm:py-4 rounded-2xl glow-rose smooth-transition disabled:opacity-50 h-12 sm:h-14 text-lg"
                >
                  <LogIn className="mr-3 h-5 w-5" />
                  {isLoading ? "Entering..." : "Begin Conversation"}
                </Button>
              </form>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <Alert
                    variant="destructive"
                    className="bg-destructive/20 border-destructive/50 backdrop-blur-sm"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="mt-6 sm:mt-8 text-center text-muted-foreground text-xs sm:text-sm"
        >
          <p>Only Wale and Xiu can access this private space</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
