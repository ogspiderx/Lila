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
    if (!db) {
      throw new Error("Database not initialized");
    }

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
    if (!db) {
      throw new Error("Database not initialized");
    }

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
    if (!db) {
      throw new Error("Database not initialized");
    }

    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    if (!db) {
      throw new Error("Database not initialized");
    }

    const messageData = {
      sender: insertMessage.sender,
      content: insertMessage.content || "",
      fileUrl: insertMessage.fileUrl || null,
      fileName: insertMessage.fileName || null,
      fileSize: insertMessage.fileSize || null,
      fileType: insertMessage.fileType || null,
      edited: false,
    };

    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    
    // Invalidate messages cache when new message is created
    this.messagesCache = null;
    
    return message;
  }

  private messagesCache: { messages: Message[], timestamp: number } | null = null;
  private readonly MESSAGES_CACHE_TTL = 10 * 60 * 1000; // 10 minutes - longer cache

  async getMessages(): Promise<Message[]> {
    if (!db) {
      throw new Error("Database not initialized");
    }

    // Check cache first for messages
    if (this.messagesCache && (Date.now() - this.messagesCache.timestamp) < this.MESSAGES_CACHE_TTL) {
      return this.messagesCache.messages;
    }

    const messagesList = await db.select().from(messages).orderBy(messages.timestamp).limit(50);
    
    // Update cache
    this.messagesCache = { messages: messagesList, timestamp: Date.now() };
    
    return messagesList;
  }


}

// In-memory storage implementation for development
export class MemStorage implements IStorage {
  private users: User[] = [];
  private messages: Message[] = [];
  private userIdCounter = 1;
  private messageIdCounter = 1;

  constructor() {
    // Pre-populate with test users
    this.createTestUsers();
  }

  private async createTestUsers() {
    const bcrypt = await import('bcrypt');
    
    // Create test users with hashed passwords
    const testUsers = [
      { username: 'wale', password: await bcrypt.hash('password123', 12) },
      { username: 'xiu', password: await bcrypt.hash('password123', 12) }
    ];

    for (const userData of testUsers) {
      const user: User = {
        id: `user-${this.userIdCounter++}`,
        username: userData.username,
        password: userData.password
      };
      this.users.push(user);
    }

    // No starter messages - let users create their own messages
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: `user-${this.userIdCounter++}`,
      username: insertUser.username,
      password: insertUser.password
    };
    this.users.push(user);
    return user;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      id: `msg-${this.messageIdCounter++}`,
      sender: insertMessage.sender,
      content: insertMessage.content || "",
      timestamp: new Date(),
      edited: false,
      fileUrl: insertMessage.fileUrl || null,
      fileName: insertMessage.fileName || null,
      fileSize: insertMessage.fileSize || null,
      fileType: insertMessage.fileType || null,
    };
    this.messages.push(message);
    return message;
  }

  async getMessages(): Promise<Message[]> {
    // Return the last 50 messages, sorted by timestamp (oldest first for proper display)
    return this.messages
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-50);
  }


}

// Always use database storage now that we have PostgreSQL configured
export const storage = new DatabaseStorage();
