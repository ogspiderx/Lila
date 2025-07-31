import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
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
  replyToId: varchar("reply_to_id"),
  replyToSender: text("reply_to_sender"),
  replyToContent: text("reply_to_content"),
});

export const messageReads = pgTable("message_reads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull(),
  userId: varchar("user_id").notNull(),
  readAt: timestamp("read_at", { mode: 'date' }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  sender: true,
  content: true,
  replyToId: true,
  replyToSender: true,
  replyToContent: true,
});

export const insertMessageReadSchema = createInsertSchema(messageReads).pick({
  messageId: true,
  userId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessageRead = z.infer<typeof insertMessageReadSchema>;
export type MessageRead = typeof messageReads.$inferSelect;
export type WebSocketMessage = Omit<Message, 'timestamp'> & { timestamp: number };

// Enhanced message type with read receipts and replies
export type MessageWithReads = Message & {
  readBy: MessageRead[];
};

// Typing indicator message type
export type TypingMessage = {
  type: 'typing';
  sender: string;
  isTyping: boolean;
};

// Combined WebSocket message types
export type WebSocketChatMessage = WebSocketMessage | TypingMessage;
