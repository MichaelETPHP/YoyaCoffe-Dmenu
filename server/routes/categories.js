import express from 'express';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db.js';
import { categories, menuItems } from '../models/schema.js';
import { isAdminOrStaff } from '../middleware/auth.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const allCategories = await db.select().from(categories);
    res.status(200).json(allCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await db.select().from(categories).where(eq(categories.id, parseInt(id)));
    
    if (category.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.status(200).json(category[0]);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create new category (admin/staff only)
router.post('/', isAdminOrStaff, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    // Check if category already exists
    const existingCategory = await db.select().from(categories).where(eq(categories.name, name));
    if (existingCategory.length > 0) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    
    // Create new category
    const newCategory = await db.insert(categories).values({
      name,
      description,
      updatedAt: new Date()
    }).returning();
    
    res.status(201).json(newCategory[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category (admin/staff only)
router.put('/:id', isAdminOrStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    // Check if category exists
    const existingCategory = await db.select().from(categories).where(eq(categories.id, parseInt(id)));
    if (existingCategory.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Check if name is already used by another category
    if (name !== existingCategory[0].name) {
      const nameExists = await db.select().from(categories).where(eq(categories.name, name));
      if (nameExists.length > 0) {
        return res.status(400).json({ error: 'Category name already exists' });
      }
    }
    
    // Update category
    const updatedCategory = await db.update(categories)
      .set({
        name,
        description,
        updatedAt: new Date()
      })
      .where(eq(categories.id, parseInt(id)))
      .returning();
    
    res.status(200).json(updatedCategory[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category (admin/staff only)
router.delete('/:id', isAdminOrStaff, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const existingCategory = await db.select().from(categories).where(eq(categories.id, parseInt(id)));
    if (existingCategory.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Check if category is being used by menu items
    const categoryInUse = await db.select().from(menuItems).where(eq(menuItems.categoryId, parseInt(id)));
    if (categoryInUse.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category. It is still being used by one or more menu items.' 
      });
    }
    
    // Delete category
    await db.delete(categories).where(eq(categories.id, parseInt(id)));
    
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Get category with menu item count
router.get('/stats/counts', isAdminOrStaff, async (req, res) => {
  try {
    const categoryCounts = await db.execute(sql`
      SELECT c.id, c.name, c.description, COUNT(m.id) as item_count
      FROM categories c
      LEFT JOIN menu_items m ON c.id = m.category_id
      GROUP BY c.id, c.name, c.description
      ORDER BY c.name
    `);
    
    res.status(200).json(categoryCounts);
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({ error: 'Failed to fetch category statistics' });
  }
});

export default router;