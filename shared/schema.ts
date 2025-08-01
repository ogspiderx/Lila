import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
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
}).extend({
  content: z.string().min(1).max(2000).trim(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type WebSocketMessage = Omit<Message, 'timestamp'> & { timestamp: number };

// Typing indicator message type
export type TypingMessage = {
  type: 'typing';
  sender: string;
  isTyping: boolean;
};

// Combined WebSocket message types
export type WebSocketChatMessage = WebSocketMessage | TypingMessage;
