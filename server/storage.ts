import { users, messages, type User, type InsertUser, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(): Promise<Message[]>;
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
}

export const storage = new DatabaseStorage();
