import { type User, type InsertUser, type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(): Promise<Message[]>;
  updateMessageStatus(messageId: string, status: 'delivered' | 'seen', userId: string): Promise<void>;
  markMessageAsDelivered(messageId: string): Promise<void>;
  markMessageAsSeen(messageId: string, userId: string): Promise<void>;
  deleteMessage(messageId: string, userId: string): Promise<boolean>;
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
      deliveryStatus: 'sent',
      seenBy: [],
      replyToId: insertMessage.replyToId || null,
      replyToMessage: insertMessage.replyToMessage || null,
      replyToSender: insertMessage.replyToSender || null,
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

  async updateMessageStatus(messageId: string, status: 'delivered' | 'seen', userId: string): Promise<void> {
    const message = this.messages.find(msg => msg.id === messageId);
    if (!message) return;

    if (status === 'delivered') {
      message.deliveryStatus = 'delivered';
    } else if (status === 'seen') {
      message.deliveryStatus = 'seen';
      if (!message.seenBy.includes(userId)) {
        message.seenBy.push(userId);
      }
    }
  }

  async markMessageAsDelivered(messageId: string): Promise<void> {
    const message = this.messages.find(msg => msg.id === messageId);
    if (message && message.deliveryStatus === 'sent') {
      message.deliveryStatus = 'delivered';
    }
  }

  async markMessageAsSeen(messageId: string, userId: string): Promise<void> {
    const message = this.messages.find(msg => msg.id === messageId);
    if (!message) return;

    message.deliveryStatus = 'seen';
    if (!message.seenBy.includes(userId)) {
      message.seenBy.push(userId);
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    const messageIndex = this.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return false;

    const message = this.messages[messageIndex];
    // Only allow message deletion by the sender
    if (message.sender !== userId) return false;

    this.messages.splice(messageIndex, 1);
    return true;
  }
}

// Use in-memory storage - everything resets when server restarts
export const storage = new MemStorage();