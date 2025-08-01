import { users, messages, type User, type InsertUser, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(): Promise<Message[]>;
  editMessage(messageId: string, newContent: string, userId: string): Promise<Message | null>;
  deleteMessage(messageId: string, userId: string): Promise<Message | null>;
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

    const [message] = await db
      .insert(messages)
      .values(insertMessage)
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

    const messagesList = await db.select().from(messages).orderBy(desc(messages.timestamp)).limit(50);
    
    // Update cache
    this.messagesCache = { messages: messagesList, timestamp: Date.now() };
    
    return messagesList;
  }

  async editMessage(messageId: string, newContent: string, userId: string): Promise<Message | null> {
    if (!db) {
      throw new Error("Database not initialized");
    }

    // First verify the user owns this message
    const [existingMessage] = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
    if (!existingMessage) return null;
    
    // Check if user owns the message by comparing sender username with user
    const user = await this.getUser(userId);
    if (!user || existingMessage.sender !== user.username) {
      return null;
    }

    const [updatedMessage] = await db
      .update(messages)
      .set({ content: newContent.trim().substring(0, 2000) })
      .where(eq(messages.id, messageId))
      .returning();

    // Invalidate cache
    this.messagesCache = null;
    
    return updatedMessage || null;
  }

  async deleteMessage(messageId: string, userId: string): Promise<Message | null> {
    if (!db) {  
      throw new Error("Database not initialized");
    }

    // First verify the user owns this message
    const [existingMessage] = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
    if (!existingMessage) return null;
    
    // Check if user owns the message
    const user = await this.getUser(userId);
    if (!user || existingMessage.sender !== user.username) {
      return null;
    }

    // Mark as deleted instead of actually deleting
    const [updatedMessage] = await db
      .update(messages)
      .set({ content: "[This message was deleted]" })
      .where(eq(messages.id, messageId))
      .returning();

    // Invalidate cache
    this.messagesCache = null;
    
    return updatedMessage || null;
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

    // Add some sample messages
    const sampleMessages = [
      { sender: 'wale', content: 'Welcome to our chat application!' },
      { sender: 'xiu', content: 'Hello! This is a test message to get started.' },
      { sender: 'wale', content: 'The real-time messaging is working perfectly.' }
    ];

    for (const msgData of sampleMessages) {
      const message: Message = {
        id: `msg-${this.messageIdCounter++}`,
        sender: msgData.sender,
        content: msgData.content,
        timestamp: new Date(),
        edited: false
      };
      this.messages.push(message);
    }
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
      content: insertMessage.content,
      timestamp: new Date(),
      edited: false
    };
    this.messages.push(message);
    return message;
  }

  async getMessages(): Promise<Message[]> {
    // Return the last 50 messages, sorted by timestamp (newest first)
    return this.messages
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);
  }

  async editMessage(messageId: string, newContent: string, userId: string): Promise<Message | null> {
    const messageIndex = this.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return null;

    // Verify user owns the message by checking sender vs username
    const user = await this.getUser(userId);
    if (!user || this.messages[messageIndex].sender !== user.username) {
      return null;
    }

    // Update the message
    this.messages[messageIndex].content = newContent.trim().substring(0, 2000);
    this.messages[messageIndex].edited = true;
    return this.messages[messageIndex];
  }

  async deleteMessage(messageId: string, userId: string): Promise<Message | null> {
    const messageIndex = this.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return null;

    // Verify user owns the message
    const user = await this.getUser(userId);
    if (!user || this.messages[messageIndex].sender !== user.username) {
      return null;
    }

    // Mark as deleted instead of removing
    this.messages[messageIndex].content = "[This message was deleted]";
    this.messages[messageIndex].edited = true;
    return this.messages[messageIndex];
  }
}

// Use in-memory storage for development when DATABASE_URL is not available
export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();
