import { users, messages, messageReads, type User, type InsertUser, type Message, type InsertMessage, type MessageWithReads, type InsertMessageRead, type MessageRead } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(): Promise<Message[]>;
  getMessagesWithReads(): Promise<MessageWithReads[]>;
  markMessageAsRead(messageId: string, userId: string): Promise<void>;
  getMessageReads(messageId: string): Promise<MessageRead[]>;
}

export class DatabaseStorage implements IStorage {
  private userCache = new Map<string, { user: User | null, timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getUser(id: string): Promise<User | undefined> {
    // Check cache first
    const cached = this.userCache.get(id);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.user || undefined;
    }

    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    
    // Update cache
    this.userCache.set(id, { user: user || null, timestamp: Date.now() });
    
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Check cache by username
    const cacheEntries = Array.from(this.userCache.entries());
    for (const [id, cached] of cacheEntries) {
      if (cached.user?.username === username && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
        return cached.user || undefined;
      }
    }

    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    
    // Update cache
    if (user) {
      this.userCache.set(user.id, { user, timestamp: Date.now() });
    }
    
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    
    // Invalidate messages cache when new message is created
    this.messagesCache = null;
    
    return message;
  }

  private messagesCache: { messages: Message[], timestamp: number } | null = null;
  private readonly MESSAGES_CACHE_TTL = 10 * 1000; // 10 seconds

  async getMessages(): Promise<Message[]> {
    // Check cache first for messages
    if (this.messagesCache && (Date.now() - this.messagesCache.timestamp) < this.MESSAGES_CACHE_TTL) {
      return this.messagesCache.messages;
    }

    const messagesList = await db.select().from(messages).orderBy(desc(messages.timestamp)).limit(50);
    
    // Update cache
    this.messagesCache = { messages: messagesList, timestamp: Date.now() };
    
    return messagesList;
  }

  async getMessagesWithReads(): Promise<MessageWithReads[]> {
    const messagesList = await db.select().from(messages).orderBy(desc(messages.timestamp)).limit(50);
    
    // Get read receipts for all messages
    const messagesWithReads: MessageWithReads[] = [];
    
    for (const message of messagesList) {
      const reads = await db.select().from(messageReads).where(eq(messageReads.messageId, message.id));
      messagesWithReads.push({
        ...message,
        readBy: reads
      });
    }
    
    return messagesWithReads;
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    // Check if already read to avoid duplicates
    const existingRead = await db.select()
      .from(messageReads)
      .where(and(
        eq(messageReads.messageId, messageId),
        eq(messageReads.userId, userId)
      ))
      .limit(1);
    
    if (existingRead.length === 0) {
      await db.insert(messageReads).values({
        messageId,
        userId
      });
    }
  }

  async getMessageReads(messageId: string): Promise<MessageRead[]> {
    return await db.select().from(messageReads).where(eq(messageReads.messageId, messageId));
  }
}

export const storage = new DatabaseStorage();
