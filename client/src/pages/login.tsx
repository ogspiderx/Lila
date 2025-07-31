import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        username,
        password,
      });

      const data = await response.json();
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      setLocation("/chat");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-gradient min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* App Branding */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-7xl font-bold text-primary glow-text-green mb-4 animate-glow tracking-wide">
            Lila
          </h1>
          <p className="text-muted-foreground text-lg font-light">
            Private chat for two
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="glow-green ultra-smooth bg-card border-border">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="username" className="text-sm font-medium text-card-foreground mb-2 block">
                    Username
                  </Label>
                  <Select value={username} onValueChange={setUsername}>
                    <SelectTrigger className="w-full bg-input border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 smooth-transition">
                      <SelectValue placeholder="Select your identity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wale">Wale</SelectItem>
                      <SelectItem value="Xiu">Xiu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-card-foreground mb-2 block">
                    Password
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your secret key"
                    className="w-full bg-input border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 smooth-transition"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !username || !password}
                  className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl glow-green hover:bg-primary/90 smooth-transition transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
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
                  <Alert variant="destructive" className="bg-destructive/20 border-destructive/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
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
          className="mt-8 text-center text-muted-foreground text-sm"
        >
          <p>Only Wale and Xiu can access this private space</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
