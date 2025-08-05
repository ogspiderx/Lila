import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs-extra";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, "Username must contain only letters, numbers, and underscores"),
  password: z.string().min(8).max(128),
});

const messageSchema = z.object({
  content: z.string().min(1).max(1000).trim(),
});

// JWT secret key - use a fixed secret for development to prevent token invalidation on restart
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-for-replit-environment-do-not-use-in-production';
const SALT_ROUNDS = 12;

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  await fs.ensureDir(uploadsDir);

  // Configure multer for file uploads with security
  const upload = multer({
    dest: uploadsDir,
    limits: {
      fileSize: 300 * 1024 * 1024, // 300MB limit
      files: 1, // Only one file at a time
    },
    fileFilter: (req, file, cb) => {
      // Block dangerous file types
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.jar'];
      const fileExt = path.extname(file.originalname).toLowerCase();

      if (dangerousExtensions.includes(fileExt)) {
        return cb(new Error('File type not allowed for security reasons'));
      }

      cb(null, true);
    },
  });

  // Add cookie parser middleware
  app.use(cookieParser());

  // Add caching middleware for auth endpoints
  const authCache = new Map<string, { user: any, timestamp: number }>();
  const AUTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes - longer auth cache

  // Secure auth middleware using JWT
  const requireAuth = async (req: any, res: any, next: any) => {
    try {
      const token = req.cookies.authToken;
      if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, iat: number };
      const user = await storage.getUser(decoded.userId);

      if (!user) {
        res.clearCookie('authToken', {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
        return res.status(401).json({ message: "Invalid session" });
      }

      req.user = user;
      next();
    } catch (error) {
      res.clearCookie('authToken');
      return res.status(401).json({ message: "Invalid token" });
    }
  };

  // Check current auth status with secure JWT validation
  app.get("/api/auth/user", async (req, res) => {
    try {
      const token = req.cookies.authToken;
      if (!token) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, iat: number };

      // Check cache first
      const cached = authCache.get(decoded.userId);
      if (cached && (Date.now() - cached.timestamp) < AUTH_CACHE_TTL) {
        return res.json(cached.user);
      }

      const user = await storage.getUser(decoded.userId);
      if (!user) {
        authCache.delete(decoded.userId);
        res.clearCookie('authToken', {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
        return res.status(401).json({ message: "Invalid session" });
      }

      const userResponse = { user: { id: user.id, username: user.username } };
      authCache.set(decoded.userId, { user: userResponse, timestamp: Date.now() });

      // Secure cache headers
      res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.json(userResponse);
    } catch (error) {
      res.clearCookie('authToken', {
        httpOnly: false,
        secure: false,
        sameSite: 'none',
        path: '/',
      });
      return res.status(401).json({ message: "Invalid token" });
    }
  });

  // Secure authentication endpoint with validation
  app.post("/api/auth/login", [
    body('username').isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/),
    body('password').isLength({ min: 8, max: 128 }),
  ], async (req: any, res: any) => {
    try {
      // Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Invalid input format" });
      }

      const { username, password } = loginSchema.parse(req.body);

      const user = await storage.getUserByUsername(username.toLowerCase());
      if (!user) {
        // Timing attack protection - hash a dummy password
        await bcrypt.compare(password, '$2b$12$dummy.hash.to.prevent.timing.attacks');
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: '7d' } // 7 days
      );

      // Set cookie optimized for Replit environment
      res.cookie('authToken', token, {
        httpOnly: false, // Allow JavaScript access for WebSocket authentication
        secure: false, // Set to false for development (Replit serves over HTTP internally)
        sameSite: 'none', // Allow cross-site cookies for Replit
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      res.json({ user: { id: user.id, username: user.username } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Secure logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('authToken', {
      httpOnly: false,
      secure: false,
      sameSite: 'none',
      path: '/',
    });
    res.json({ message: "Logged out successfully" });
  });

  // Get chat messages with secure caching
  app.get("/api/messages", requireAuth, async (req, res) => {
    try {
      const messages = await storage.getMessages();

      // Sanitize messages before sending
      const sanitizedMessages = messages.map(message => ({
        id: message.id,
        sender: message.sender,
        content: message.content.substring(0, 1000), // Limit content length
        timestamp: message.timestamp,
        edited: message.edited || false,
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        fileSize: message.fileSize,
        fileType: message.fileType,
      }));

      // Secure cache headers
      res.set('Cache-Control', 'private, max-age=60'); // 1 minute cache only
      res.set('X-Content-Type-Options', 'nosniff');
      res.json(sanitizedMessages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Secure file upload endpoint
  app.post("/api/upload", requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const file = req.file;
      const fileExt = path.extname(file.originalname);
      const safeName = `${crypto.randomUUID()}${fileExt}`;
      const newPath = path.join(uploadsDir, safeName);

      // Move file to secure location with safe name
      await fs.move(file.path, newPath);

      // Generate secure file URL
      const fileUrl = `/api/files/${safeName}`;

      res.json({
        fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype || 'application/octet-stream',
      });
    } catch (error) {
      console.error("File upload error:", error);

      // Clean up file if it exists
      if (req.file?.path) {
        try {
          await fs.remove(req.file.path);
        } catch (cleanupError) {
          console.error("Failed to clean up file:", cleanupError);
        }
      }

      res.status(500).json({ message: "File upload failed" });
    }
  });

  // Delete message endpoint
  app.delete("/api/messages/:messageId", requireAuth, async (req: any, res) => {
    try {
      const messageId = req.params.messageId;
      const userId = req.user.username;

      const deleted = await storage.deleteMessage(messageId, userId);
      
      if (deleted) {
        res.json({ success: true, message: "Message deleted successfully" });
      } else {
        res.status(403).json({ message: "You can only delete your own messages" });
      }
    } catch (error) {
      console.error("Delete message error:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Edit message endpoint
  app.patch("/api/messages/:messageId", requireAuth, async (req: any, res) => {
    try {
      const messageId = req.params.messageId;
      const userId = req.user.username;
      const { content } = req.body;

      // Validate content
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ message: "Content is required" });
      }

      if (content.trim().length > 2000) {
        return res.status(400).json({ message: "Content is too long" });
      }

      const editedMessage = await storage.editMessage(messageId, userId, content.trim());

      if (!editedMessage) {
        return res.status(403).json({ message: "You can only edit your own messages" });
      }

      res.json({ success: true, message: editedMessage });
    } catch (error) {
      console.error("Edit message error:", error);
      res.status(500).json({ message: "Failed to edit message" });
    }
  });

  // Serve uploaded files securely
  app.get("/api/files/:filename", requireAuth, async (req, res) => {
    try {
      const filename = req.params.filename;

      // Validate filename format (UUID + extension)
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-zA-Z0-9]+$/i.test(filename)) {
        return res.status(400).json({ message: "Invalid filename" });
      }

      const filePath = path.join(uploadsDir, filename);

      // Check if file exists
      const exists = await fs.pathExists(filePath);
      if (!exists) {
        return res.status(404).json({ message: "File not found" });
      }

      // Serve file with security headers
      res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'private, max-age=3600',
      });

      res.sendFile(filePath);
    } catch (error) {
      console.error("File serve error:", error);
      res.status(500).json({ message: "Failed to serve file" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Secure WebSocket handling with authentication
  const authenticatedSockets = new Map<WebSocket, { userId: string, username: string }>();

  wss.on('connection', (ws: WebSocket, req) => {
    let isAuthenticated = false;
    let userInfo: { userId: string, username: string } | null = null;

    // Set connection timeout
    const authTimeout = setTimeout(() => {
      if (!isAuthenticated) {
        ws.close(4001, 'Authentication timeout');
      }
    }, 10000); // 10 seconds to authenticate

    ws.on('message', async (data: Buffer) => {
      try {
        // Limit message size
        if (data.length > 10000) { // 10KB limit
          ws.close(4002, 'Message too large');
          return;
        }

        const messageData = JSON.parse(data.toString());

        // Handle authentication
        if (messageData.type === 'auth' && !isAuthenticated) {
          try {
            const token = messageData.token;
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
            const user = await storage.getUser(decoded.userId);

            if (user) {
              isAuthenticated = true;
              userInfo = { userId: user.id, username: user.username };
              authenticatedSockets.set(ws, userInfo);
              clearTimeout(authTimeout);
              ws.send(JSON.stringify({ type: 'auth', success: true }));
            } else {
              ws.close(4003, 'Invalid user');
            }
          } catch (error) {
            ws.close(4004, 'Invalid token');
          }
          return;
        }

        // Require authentication for all other messages
        if (!isAuthenticated || !userInfo) {
          ws.close(4005, 'Not authenticated');
          return;
        }

        if (messageData.type === 'message') {
          // Validate message content and file data
          const messageInput = {
            content: messageData.content || "",
            fileUrl: messageData.fileUrl,
            fileName: messageData.fileName,
            fileSize: messageData.fileSize,
            fileType: messageData.fileType,
            replyToId: messageData.replyToId,
            replyToMessage: messageData.replyToMessage,
            replyToSender: messageData.replyToSender,
          };

          const validatedData = insertMessageSchema.parse({
            sender: userInfo.username,
            ...messageInput
          });

          // Create message in storage
          const message = await storage.createMessage(validatedData);

          // Mark message as delivered when broadcasting to other users
          setTimeout(async () => {
            await storage.markMessageAsDelivered(message.id);
            
            // Send delivery status update to sender
            const deliveryUpdate = JSON.stringify({
              type: 'message_status',
              messageId: message.id,
              status: 'delivered'
            });
            
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(deliveryUpdate);
            }
          }, 100);

          // Broadcast to authenticated clients only
          const broadcastData = JSON.stringify({
            type: 'message',
            data: {
              id: message.id,
              sender: message.sender,
              content: message.content,
              timestamp: message.timestamp,
              fileUrl: message.fileUrl,
              fileName: message.fileName,
              fileSize: message.fileSize,
              fileType: message.fileType,
              replyToId: message.replyToId,
              replyToMessage: message.replyToMessage,
              replyToSender: message.replyToSender,
            }
          });

          Array.from(authenticatedSockets.entries()).forEach(([client, clientInfo]) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(broadcastData);
            }
          });
        }

        // Handle typing indicators
        else if (messageData.type === 'typing') {
          const typingData = JSON.stringify({
            type: 'typing',
            sender: userInfo.username,
            isTyping: messageData.isTyping
          });

          // Broadcast to all other authenticated clients (not sender)
          Array.from(authenticatedSockets.entries()).forEach(([client, clientInfo]) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(typingData);
            }
          });
        }

        // Handle message seen status
        else if (messageData.type === 'message_seen') {
          const messageId = messageData.messageId;
          if (messageId) {
            await storage.markMessageAsSeen(messageId, userInfo.userId);
            
            // Broadcast seen status to all other clients
            const seenUpdate = JSON.stringify({
              type: 'message_status',
              messageId: messageId,
              status: 'seen',
              userId: userInfo.userId
            });
            
            Array.from(authenticatedSockets.entries()).forEach(([client, clientInfo]) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(seenUpdate);
              }
            });
          }
        }

        // Handle message deletion
        else if (messageData.type === 'delete_message') {
          const messageId = messageData.messageId;
          if (messageId) {
            const deleted = await storage.deleteMessage(messageId, userInfo.username);
            
            if (deleted) {
              // Broadcast deletion to all clients
              const deleteUpdate = JSON.stringify({
                type: 'message_deleted',
                messageId: messageId,
                deletedBy: userInfo.username
              });
              
              Array.from(authenticatedSockets.entries()).forEach(([client, clientInfo]) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(deleteUpdate);
                }
              });
            } else {
              // Send error back to sender
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to delete message. You can only delete your own messages.'
              }));
            }
          }
        }

        // Handle message editing
        else if (messageData.type === 'edit_message') {
          const { messageId, content } = messageData;
          if (messageId && content && typeof content === 'string' && content.trim().length > 0) {
            const editedMessage = await storage.editMessage(messageId, userInfo.username, content.trim());
            
            if (editedMessage) {
              // Broadcast edit to all clients
              const editUpdate = JSON.stringify({
                type: 'message_edited',
                data: {
                  id: editedMessage.id,
                  sender: editedMessage.sender,
                  content: editedMessage.content,
                  timestamp: editedMessage.timestamp,
                  edited: editedMessage.edited,
                  editedAt: editedMessage.editedAt,
                  fileUrl: editedMessage.fileUrl,
                  fileName: editedMessage.fileName,
                  fileSize: editedMessage.fileSize,
                  fileType: editedMessage.fileType,
                  replyToId: editedMessage.replyToId,
                  replyToMessage: editedMessage.replyToMessage,
                  replyToSender: editedMessage.replyToSender,
                }
              });
              
              Array.from(authenticatedSockets.entries()).forEach(([client, clientInfo]) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(editUpdate);
                }
              });
            } else {
              // Send error back to sender
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to edit message. You can only edit your own messages.'
              }));
            }
          }
        }




      } catch (error) {
        console.error('WebSocket message error:', error);
        if (error instanceof z.ZodError) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format', details: error.errors }));
        } else {
          ws.close(4006, 'Invalid message format');
        }
      }
    });

    ws.on('close', () => {
      authenticatedSockets.delete(ws);
      clearTimeout(authTimeout);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      authenticatedSockets.delete(ws);
      clearTimeout(authTimeout);
    });
  });

  return httpServer;
}