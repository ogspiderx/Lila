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

  // Check if user is already authenticated with faster timeout
  useEffect(() => {
    const controller = new AbortController();
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include",
          signal: controller.signal,
          // Add cache control for faster subsequent requests
          headers: {
            'Cache-Control': 'max-age=60'
          }
        });
        if (response.ok) {
          setLocation("/welcome");
          return;
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        // User not authenticated, continue with login
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm sm:max-w-md"
      >
        {/* App Branding */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary glow-text-green animate-glow tracking-wide mb-2 sm:mb-4">
            Lila
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg font-light">
            Private chat for two
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="gradient-border shadow-2xl relative">
            <CardContent className="p-6 sm:p-8 relative z-10">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div>
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-card-foreground mb-2 block"
                  >
                    Username
                  </Label>
                  <Select value={username} onValueChange={setUsername}>
                    <SelectTrigger className="w-full select-trigger rounded-lg smooth-transition h-11">
                      <SelectValue placeholder="Select your identity" />
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
                    className="w-full input-field rounded-lg smooth-transition h-11"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !username || !password}
                  className="w-full bg-primary text-primary-foreground font-semibold py-2.5 sm:py-3 rounded-lg glow-green hover:bg-primary/90 smooth-transition disabled:opacity-50 h-11 sm:h-12"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {isLoading ? "Entering..." : "Enter Chat"}
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
