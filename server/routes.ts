import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import gtranslate from "@vitalets/google-translate-api";

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const translateSchema = z.object({
  text: z.string(),
  targetLang: z.string(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Add cookie parser middleware
  app.use(cookieParser());

  // Auth middleware to check if user is logged in
  const requireAuth = async (req: any, res: any, next: any) => {
    const userId = req.cookies.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid session" });
    }
    
    req.user = user;
    next();
  };

  // Check current auth status
  app.get("/api/auth/user", async (req, res) => {
    const userId = req.cookies.userId;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid session" });
    }
    
    res.json({ user: { id: user.id, username: user.username } });
  });

  // Authentication endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set cookie that expires in 30 days
      res.cookie('userId', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.json({ user: { id: user.id, username: user.username } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('userId');
    res.json({ message: "Logged out successfully" });
  });

  // Get chat messages
  app.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Translation endpoint
  app.post("/api/translate", requireAuth, async (req, res) => {
    try {
      const { text, targetLang } = translateSchema.parse(req.body);
      
      const result = await gtranslate(text, { to: targetLang });
      
      res.json({ 
        translatedText: result.text,
        originalText: text,
        targetLanguage: targetLang
      });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ message: "Translation failed" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data: Buffer) => {
      try {
        const messageData = JSON.parse(data.toString());
        
        if (messageData.type === 'message') {
          const { sender, content } = insertMessageSchema.parse(messageData);
          
          // Store message
          const message = await storage.createMessage({ sender, content });
          
          // Broadcast to all connected clients
          const broadcastData = JSON.stringify({
            type: 'message',
            data: message
          });
          
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(broadcastData);
            }
          });
        } else if (messageData.type === 'typing') {
          // Broadcast typing indicator to all connected clients
          const typingData = JSON.stringify({
            type: 'typing',
            data: {
              type: 'typing',
              sender: messageData.sender,
              isTyping: messageData.isTyping
            }
          });
          
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(typingData);
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
