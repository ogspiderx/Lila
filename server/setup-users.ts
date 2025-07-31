import bcrypt from "bcrypt";
import { storage } from "./storage";

const SALT_ROUNDS = 12;

export async function setupTestUsers() {
  try {
    // Check if users already exist
    const existingWale = await storage.getUserByUsername('wale');
    const existingXiu = await storage.getUserByUsername('xiu');

    if (!existingWale) {
      const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);
      await storage.createUser({
        username: 'wale',
        password: hashedPassword
      });
      console.log('Created test user: wale with password: password123');
    }

    if (!existingXiu) {
      const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);
      await storage.createUser({
        username: 'xiu',
        password: hashedPassword
      });
      console.log('Created test user: xiu with password: password123');
    }
  } catch (error) {
    console.error('Failed to setup test users:', error);
  }
}