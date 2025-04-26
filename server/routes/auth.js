import express from 'express';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../db.js';
import { users } from '../models/schema.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Register a new user (admin only can create new users)
router.post('/register', isAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.username, username));
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const existingEmail = await db.select().from(users).where(eq(users.email, email));
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create new user
    const newUser = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      role: role || 'staff'
    }).returning();
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser[0];
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Find user
    const user = await db.select().from(users).where(eq(users.username, username));
    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Compare password
    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create session
    const { password: _, ...userWithoutPassword } = user[0];
    req.session.user = userWithoutPassword;
    
    res.status(200).json({ message: 'Login successful', user: userWithoutPassword });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logout successful' });
  });
});

// Get current user
router.get('/me', isAuthenticated, (req, res) => {
  res.status(200).json(req.session.user);
});

// Initialize default admin account if no users exist
router.post('/init', async (req, res) => {
  try {
    // Check if any users exist
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Users already exist. Initialization not needed.' });
    }
    
    // Create default admin
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);
    
    const newAdmin = await db.insert(users).values({
      username: 'admin',
      email: 'admin@yoyacoffee.com',
      password: hashedPassword,
      role: 'admin'
    }).returning();
    
    const { password: _, ...adminWithoutPassword } = newAdmin[0];
    res.status(201).json({ 
      message: 'Default admin created successfully',
      user: adminWithoutPassword 
    });
  } catch (error) {
    console.error('Error initializing admin:', error);
    res.status(500).json({ error: 'Failed to initialize admin account' });
  }
});

export default router;