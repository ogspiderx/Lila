import { z } from "zod";

// Type definitions for in-memory storage (no database tables needed)
export type User = {
  id: string;
  username: string;
  password: string;
};

export type Message = {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  edited: boolean;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  fileType: string | null;
  deliveryStatus: 'sent' | 'delivered' | 'seen';
  seenBy: string[];
  replyToId: string | null;
  replyToMessage: string | null;
  replyToSender: string | null;
};

export const insertUserSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, "Username must contain only letters, numbers, and underscores"),
  password: z.string().min(8).max(128),
});

export const insertMessageSchema = z.object({
  sender: z.string(),
  content: z.string().max(2000).trim().optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().max(255).optional(),
  fileSize: z.number().max(300 * 1024 * 1024).optional(), // 300MB max
  fileType: z.string().max(100).optional(),
  replyToId: z.string().optional(),
  replyToMessage: z.string().max(500).optional(),
  replyToSender: z.string().optional(),
}).refine(
  (data) => (data.content && data.content.trim().length > 0) || data.fileUrl,
  { message: "Either content or file must be provided" }
);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export interface WebSocketMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  replyToId?: string;
  replyToMessage?: string;
  replyToSender?: string;
}

// Typing indicator message type
export type TypingMessage = {
  type: 'typing';
  sender: string;
  isTyping: boolean;
};

// Message delivery status update type
export type MessageStatusUpdate = {
  type: 'message_status';
  messageId: string;
  status: 'delivered' | 'seen';
  userId: string;
};

// Add message seen tracking type
export type MessageSeenUpdate = {
  type: 'message_seen';
  messageId: string;
  seenBy: string;
};

// Combined WebSocket message types
export type WebSocketChatMessage = WebSocketMessage | TypingMessage | MessageSeenUpdate | MessageStatusUpdate;