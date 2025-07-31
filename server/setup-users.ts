import bcrypt from "bcrypt";
import { storage } from "./storage";

const SALT_ROUNDS = 12;

export async function setupTestUsers() {
  try {
    // Check if users already exist
    const existingWale = await storage.getUserByUsername('wale');
    const existingXiu = await storage.getUserByUsername('xiu');

    if (!existingWale) {
      const hashedPassword = await bcrypt.hash('password', SALT_ROUNDS);
      await storage.createUser({
        username: 'wale',
        password: hashedPassword
      });
      console.log('Created test user: wale');
    }

    if (!existingXiu) {
      const hashedPassword = await bcrypt.hash('password', SALT_ROUNDS);
      await storage.createUser({
        username: 'xiu',
        password: hashedPassword
      });
      console.log('Created test user: xiu');
    }
  } catch (error) {
    console.error('Failed to setup test users:', error);
  }
}