import { type User, type InsertUser, type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(): Promise<Message[]>;
}

// In-memory storage implementation - resets when server restarts
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

    console.log('Created test users: wale and xiu with password: password123');
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

// Use in-memory storage - everything resets when server restarts
export const storage = new MemStorage();