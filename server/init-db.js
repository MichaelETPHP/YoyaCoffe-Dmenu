import { db } from './db.js';
import { users, categories, menuItems } from './models/schema.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function initDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Check if any users exist
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length === 0) {
      console.log('No users found, creating default admin...');
      
      // Create default admin user
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      
      await db.insert(users).values({
        username: 'admin',
        email: 'admin@yoyacoffee.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log('Default admin user created successfully!');
      console.log('Username: admin');
      console.log('Password: admin123');
    } else {
      console.log(`Found ${existingUsers.length} existing users, skipping admin creation.`);
    }
    
    // Check if any categories exist
    const existingCategories = await db.select().from(categories);
    
    if (existingCategories.length === 0) {
      console.log('No categories found, creating default categories...');
      
      const defaultCategories = [
        { name: 'Hot Coffee', description: 'Warm coffee beverages to brighten your day' },
        { name: 'Cold Coffee', description: 'Refreshing cold coffee drinks' },
        { name: 'Espresso', description: 'Strong espresso-based beverages' },
        { name: 'Non-Coffee', description: 'Tea, hot chocolate, and other non-coffee options' },
        { name: 'Pastries', description: 'Fresh baked goods to pair with your coffee' }
      ];
      
      for (const category of defaultCategories) {
        await db.insert(categories).values(category);
      }
      
      console.log(`Created ${defaultCategories.length} default categories.`);
    } else {
      console.log(`Found ${existingCategories.length} existing categories, skipping category creation.`);
    }
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    process.exit(0);
  }
}

// Run the initialization
initDatabase();