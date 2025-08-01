import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sender: text("sender").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp", { mode: 'date' }).notNull().defaultNow(),
  edited: text("edited").$type<boolean>().default(false),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  deliveryStatus: text("delivery_status").$type<'sent' | 'delivered' | 'seen'>().default('sent'),
  seenBy: text("seen_by").array().default(sql`'{}'::text[]`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
}).extend({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, "Username must contain only letters, numbers, and underscores"),
  password: z.string().min(8).max(128),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  sender: true,
  content: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  fileType: true,
}).extend({
  content: z.string().max(2000).trim().optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().max(255).optional(),
  fileSize: z.number().max(300 * 1024 * 1024).optional(), // 300MB max
  fileType: z.string().max(100).optional(),
}).refine(
  (data) => (data.content && data.content.trim().length > 0) || data.fileUrl,
  { message: "Either content or file must be provided" }
);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type WebSocketMessage = Omit<Message, 'timestamp'> & { timestamp: number };

// Add message seen tracking type
export type MessageSeenUpdate = {
  type: 'message_seen';
  messageId: string;
  seenBy: string;
};

// Typing indicator message type
export type TypingMessage = {
  type: 'typing';
  sender: string;
  isTyping: boolean;
};

// Combined WebSocket message types
export type WebSocketChatMessage = WebSocketMessage | TypingMessage | MessageSeenUpdate;
