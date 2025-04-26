import express from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../db.js';
import { menuItems, categories } from '../models/schema.js';
import { isAdminOrStaff } from '../middleware/auth.js';

const router = express.Router();

// Get all menu items (with optional category filter)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = db.select({
      id: menuItems.id,
      name: menuItems.name,
      description: menuItems.description,
      price: menuItems.price,
      image: menuItems.image,
      categoryId: menuItems.categoryId,
      likes: menuItems.likes,
      dislikes: menuItems.dislikes,
      featured: menuItems.featured,
      categoryName: categories.name
    })
    .from(menuItems)
    .leftJoin(categories, eq(menuItems.categoryId, categories.id));
    
    // Apply category filter if provided
    if (category) {
      query = query.where(eq(menuItems.categoryId, parseInt(category)));
    }
    
    const items = await query;
    
    // Format price for display (convert from cents to dollars)
    const formattedItems = items.map(item => ({
      ...item,
      formattedPrice: (item.price / 100).toFixed(2)
    }));
    
    res.status(200).json(formattedItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get featured menu items
router.get('/featured', async (req, res) => {
  try {
    const featuredItems = await db.select({
      id: menuItems.id,
      name: menuItems.name,
      description: menuItems.description,
      price: menuItems.price,
      image: menuItems.image,
      categoryId: menuItems.categoryId,
      likes: menuItems.likes,
      dislikes: menuItems.dislikes,
      featured: menuItems.featured,
      categoryName: categories.name
    })
    .from(menuItems)
    .leftJoin(categories, eq(menuItems.categoryId, categories.id))
    .where(eq(menuItems.featured, true));
    
    // Format price for display
    const formattedItems = featuredItems.map(item => ({
      ...item,
      formattedPrice: (item.price / 100).toFixed(2)
    }));
    
    res.status(200).json(formattedItems);
  } catch (error) {
    console.error('Error fetching featured items:', error);
    res.status(500).json({ error: 'Failed to fetch featured items' });
  }
});

// Get single menu item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await db.select({
      id: menuItems.id,
      name: menuItems.name,
      description: menuItems.description,
      price: menuItems.price,
      image: menuItems.image,
      categoryId: menuItems.categoryId,
      likes: menuItems.likes,
      dislikes: menuItems.dislikes,
      featured: menuItems.featured,
      categoryName: categories.name
    })
    .from(menuItems)
    .leftJoin(categories, eq(menuItems.categoryId, categories.id))
    .where(eq(menuItems.id, parseInt(id)));
    
    if (item.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    // Format price for display
    const formattedItem = {
      ...item[0],
      formattedPrice: (item[0].price / 100).toFixed(2)
    };
    
    res.status(200).json(formattedItem);
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// Create new menu item (admin/staff only)
router.post('/', isAdminOrStaff, async (req, res) => {
  try {
    const { name, description, price, image, categoryId, featured } = req.body;
    
    // Validate required fields
    if (!name || price === undefined || !categoryId) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }
    
    // Validate price is numeric
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: 'Price must be a valid number' });
    }
    
    // Validate category exists
    const categoryExists = await db.select().from(categories).where(eq(categories.id, parseInt(categoryId)));
    if (categoryExists.length === 0) {
      return res.status(400).json({ error: 'Selected category does not exist' });
    }
    
    // Convert price to cents for storage
    const priceInCents = Math.round(numericPrice * 100);
    
    // Create new menu item
    const newItem = await db.insert(menuItems).values({
      name,
      description,
      price: priceInCents,
      image,
      categoryId: parseInt(categoryId),
      featured: featured || false,
      updatedAt: new Date()
    }).returning();
    
    // Format price for response
    const formattedItem = {
      ...newItem[0],
      formattedPrice: (newItem[0].price / 100).toFixed(2)
    };
    
    res.status(201).json(formattedItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item (admin/staff only)
router.put('/:id', isAdminOrStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, categoryId, featured } = req.body;
    
    // Validate required fields
    if (!name || price === undefined || !categoryId) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }
    
    // Validate price is numeric
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: 'Price must be a valid number' });
    }
    
    // Validate category exists
    const categoryExists = await db.select().from(categories).where(eq(categories.id, parseInt(categoryId)));
    if (categoryExists.length === 0) {
      return res.status(400).json({ error: 'Selected category does not exist' });
    }
    
    // Check if menu item exists
    const existingItem = await db.select().from(menuItems).where(eq(menuItems.id, parseInt(id)));
    if (existingItem.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    // Convert price to cents for storage
    const priceInCents = Math.round(numericPrice * 100);
    
    // Update menu item
    const updatedItem = await db.update(menuItems)
      .set({
        name,
        description,
        price: priceInCents,
        image,
        categoryId: parseInt(categoryId),
        featured: featured !== undefined ? featured : existingItem[0].featured,
        updatedAt: new Date()
      })
      .where(eq(menuItems.id, parseInt(id)))
      .returning();
    
    // Format price for response
    const formattedItem = {
      ...updatedItem[0],
      formattedPrice: (updatedItem[0].price / 100).toFixed(2)
    };
    
    res.status(200).json(formattedItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item (admin/staff only)
router.delete('/:id', isAdminOrStaff, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if menu item exists
    const existingItem = await db.select().from(menuItems).where(eq(menuItems.id, parseInt(id)));
    if (existingItem.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    // Delete menu item
    await db.delete(menuItems).where(eq(menuItems.id, parseInt(id)));
    
    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Toggle featured status (admin/staff only)
router.patch('/:id/featured', isAdminOrStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;
    
    if (featured === undefined) {
      return res.status(400).json({ error: 'Featured status is required' });
    }
    
    // Check if menu item exists
    const existingItem = await db.select().from(menuItems).where(eq(menuItems.id, parseInt(id)));
    if (existingItem.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    // Update featured status
    const updatedItem = await db.update(menuItems)
      .set({
        featured: !!featured,
        updatedAt: new Date()
      })
      .where(eq(menuItems.id, parseInt(id)))
      .returning();
    
    res.status(200).json(updatedItem[0]);
  } catch (error) {
    console.error('Error updating featured status:', error);
    res.status(500).json({ error: 'Failed to update featured status' });
  }
});

// Handle likes/dislikes
router.post('/:id/reaction', async (req, res) => {
  try {
    const { id } = req.params;
    const { reaction } = req.body;
    
    if (!reaction || !['like', 'dislike'].includes(reaction)) {
      return res.status(400).json({ error: 'Valid reaction (like/dislike) is required' });
    }
    
    // Check if menu item exists
    const existingItem = await db.select().from(menuItems).where(eq(menuItems.id, parseInt(id)));
    if (existingItem.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    // Update reaction count
    let updatedItem;
    if (reaction === 'like') {
      updatedItem = await db.update(menuItems)
        .set({
          likes: sql`${menuItems.likes} + 1`,
          updatedAt: new Date()
        })
        .where(eq(menuItems.id, parseInt(id)))
        .returning();
    } else {
      updatedItem = await db.update(menuItems)
        .set({
          dislikes: sql`${menuItems.dislikes} + 1`,
          updatedAt: new Date()
        })
        .where(eq(menuItems.id, parseInt(id)))
        .returning();
    }
    
    res.status(200).json({
      id: updatedItem[0].id,
      likes: updatedItem[0].likes,
      dislikes: updatedItem[0].dislikes,
      message: `${reaction === 'like' ? 'Like' : 'Dislike'} recorded successfully`
    });
  } catch (error) {
    console.error('Error recording reaction:', error);
    res.status(500).json({ error: 'Failed to record reaction' });
  }
});

// Get popular menu items (most liked)
router.get('/popular/top', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const popularItems = await db.select({
      id: menuItems.id,
      name: menuItems.name,
      price: menuItems.price,
      image: menuItems.image, 
      likes: menuItems.likes,
      dislikes: menuItems.dislikes,
      categoryName: categories.name
    })
    .from(menuItems)
    .leftJoin(categories, eq(menuItems.categoryId, categories.id))
    .orderBy(desc(menuItems.likes))
    .limit(parseInt(limit));
    
    // Format price for display
    const formattedItems = popularItems.map(item => ({
      ...item,
      formattedPrice: (item.price / 100).toFixed(2)
    }));
    
    res.status(200).json(formattedItems);
  } catch (error) {
    console.error('Error fetching popular items:', error);
    res.status(500).json({ error: 'Failed to fetch popular items' });
  }
});

// Get dashboard statistics
router.get('/stats/dashboard', isAdminOrStaff, async (req, res) => {
  try {
    // Get total menu items
    const menuCount = await db.select({ count: sql`count(*)` }).from(menuItems);
    
    // Get total categories
    const categoryCount = await db.select({ count: sql`count(*)` }).from(categories);
    
    // Get total likes
    const likesCount = await db.select({
      total: sql`sum(likes)`
    }).from(menuItems);
    
    // Get most liked item
    const mostLiked = await db.select({
      id: menuItems.id,
      name: menuItems.name,
      likes: menuItems.likes
    })
    .from(menuItems)
    .orderBy(desc(menuItems.likes))
    .limit(1);
    
    res.status(200).json({
      totalMenuItems: parseInt(menuCount[0].count),
      totalCategories: parseInt(categoryCount[0].count),
      totalLikes: parseInt(likesCount[0].total) || 0,
      mostLikedItem: mostLiked.length > 0 ? mostLiked[0] : null
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

export default router;