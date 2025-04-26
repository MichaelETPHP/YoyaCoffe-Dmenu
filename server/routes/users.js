const express = require('express');
const bcrypt = require('bcrypt');
const { eq, sql } = require('drizzle-orm');
const { db } = require('../db.js');
const { users } = require('../models/schema.js');
const { isAdmin } = require('../middleware/auth.js');

const router = express.Router();

// Get all users (admin only)
router.get('/', isAdmin, async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt
    }).from(users);
    
    res.status(200).json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user by ID (admin only)
router.get('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt
    }).from(users).where(eq(users.id, parseInt(id)));
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json(user[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user (admin only)
router.post('/', isAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
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
    }).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt
    });
    
    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (admin only)
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, parseInt(id)));
    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Build update data
    const updateData = {
      updatedAt: new Date()
    };
    
    if (username) {
      // Check if username is already taken by another user
      if (username !== existingUser[0].username) {
        const usernameExists = await db.select().from(users).where(eq(users.username, username));
        if (usernameExists.length > 0) {
          return res.status(400).json({ error: 'Username already exists' });
        }
      }
      updateData.username = username;
    }
    
    if (email) {
      // Check if email is already taken by another user
      if (email !== existingUser[0].email) {
        const emailExists = await db.select().from(users).where(eq(users.email, email));
        if (emailExists.length > 0) {
          return res.status(400).json({ error: 'Email already exists' });
        }
      }
      updateData.email = email;
    }
    
    if (password) {
      // Hash new password
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }
    
    if (role) {
      updateData.role = role;
    }
    
    // Update user
    const updatedUser = await db.update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(id)))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      });
    
    res.status(200).json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, parseInt(id)));
    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent deleting the last admin
    if (existingUser[0].role === 'admin') {
      const adminCount = await db.select({ count: sql`count(*)` })
        .from(users)
        .where(eq(users.role, 'admin'));
      
      if (parseInt(adminCount[0].count) <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }
    
    // Delete user
    await db.delete(users).where(eq(users.id, parseInt(id)));
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;