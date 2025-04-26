const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, '../public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

// Data for the API endpoints
const MENU_ITEMS = [
  {
    id: 1,
    name: 'Espresso',
    description: 'Strong black coffee made by forcing steam through ground coffee beans',
    price: 350,
    formattedPrice: '3.50',
    image: 'https://images.unsplash.com/photo-1520031607889-97ba0c7190ff?q=80&w=1974&auto=format&fit=crop',
    categoryId: 1,
    categoryName: 'Hot Coffee',
    likes: 25,
    dislikes: 3,
    featured: true
  },
  {
    id: 2,
    name: 'Cappuccino',
    description: 'Espresso coffee topped with steamed milk foam',
    price: 450,
    formattedPrice: '4.50',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=2070&auto=format&fit=crop',
    categoryId: 1,
    categoryName: 'Hot Coffee',
    likes: 42,
    dislikes: 1,
    featured: true
  },
  {
    id: 3,
    name: 'Iced Coffee',
    description: 'Chilled coffee served with ice cubes',
    price: 400,
    formattedPrice: '4.00',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=1974&auto=format&fit=crop',
    categoryId: 2,
    categoryName: 'Cold Coffee',
    likes: 18,
    dislikes: 2,
    featured: false
  }
];

const CATEGORIES = [
  { id: 1, name: 'Hot Coffee', description: 'Warm coffee beverages', item_count: 2 },
  { id: 2, name: 'Cold Coffee', description: 'Chilled coffee beverages', item_count: 1 },
  { id: 3, name: 'Specialty Drinks', description: 'Signature coffee creations', item_count: 0 }
];

// Simple session store
let sessions = {};

// Simple file server
const server = http.createServer((req, res) => {
  // Add CORS headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }
  
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;
  
  // Handle API requests
  if (pathname.startsWith('/api/')) {
    // Handle auth endpoints
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      // Handle login process by reading the posted data
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const credentials = JSON.parse(body);
          console.log('Login attempt:', credentials.username);
          
          // Check credentials against the default admin
          if (credentials.username === 'admin' && credentials.password === 'admin123') {
            const sessionId = Date.now().toString();
            const user = {
              id: 1,
              username: 'admin',
              email: 'admin@yoyacoffee.com',
              role: 'admin'
            };
            
            // Store session
            sessions[sessionId] = { userId: 1, user };
            
            // Set cookie
            res.setHeader('Set-Cookie', `sessionId=${sessionId}; Path=/; HttpOnly`);
            
            console.log('Login successful for admin');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(user));
          } else {
            console.log('Login failed: invalid credentials');
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid credentials' }));
          }
        } catch (e) {
          console.error('Login error:', e);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid request format' }));
        }
      });
      
      return;
    }
    
    else if (pathname === '/api/auth/me') {
      // Parse cookies to check for session
      const cookies = parseCookies(req);
      const sessionId = cookies.sessionId;
      
      if (sessionId && sessions[sessionId]) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(sessions[sessionId].user));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Not authenticated' }));
      }
    }
    
    else if (pathname === '/api/auth/logout' && req.method === 'POST') {
      const cookies = parseCookies(req);
      const sessionId = cookies.sessionId;
      
      if (sessionId) {
        delete sessions[sessionId];
      }
      
      res.setHeader('Set-Cookie', 'sessionId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Logout successful' }));
    }
    
    // Handle menu item endpoints
    else if (pathname === '/api/menu') {
      // GET - fetch all menu items
      if (req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(MENU_ITEMS));
      }
      // POST - create a new menu item
      else if (req.method === 'POST') {
        // Check authentication
        const cookies = parseCookies(req);
        const sessionId = cookies.sessionId;
        
        if (!sessionId || !sessions[sessionId]) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }
        
        // Read request data
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const menuItem = JSON.parse(body);
            
            // Validate required fields
            if (!menuItem.name || !menuItem.price || !menuItem.categoryId || !menuItem.description || !menuItem.image) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Missing required fields' }));
            }
            
            // Check if category exists
            const category = CATEGORIES.find(cat => cat.id === menuItem.categoryId);
            if (!category) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Category not found' }));
            }
            
            // Generate an ID
            const newId = MENU_ITEMS.length > 0 ? Math.max(...MENU_ITEMS.map(item => item.id)) + 1 : 1;
            
            // Create new menu item
            const newMenuItem = {
              id: newId,
              name: menuItem.name,
              description: menuItem.description,
              price: parseInt(menuItem.price),
              formattedPrice: (parseInt(menuItem.price) / 100).toFixed(2),
              image: menuItem.image,
              categoryId: parseInt(menuItem.categoryId),
              categoryName: category.name,
              likes: 0,
              dislikes: 0,
              featured: menuItem.featured || false
            };
            
            // Add to array
            MENU_ITEMS.push(newMenuItem);
            
            // Update category count
            const categoryIndex = CATEGORIES.findIndex(cat => cat.id === newMenuItem.categoryId);
            if (categoryIndex !== -1) {
              CATEGORIES[categoryIndex].item_count++;
            }
            
            res.writeHead(201, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(newMenuItem));
          } catch (e) {
            console.error('Error creating menu item:', e);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid request format' }));
          }
        });
        
        return;
      }
    }
    
    // Handle menu item by ID endpoint
    else if (pathname.startsWith('/api/menu/') && pathname !== '/api/menu/stats/dashboard') {
      const parts = pathname.split('/');
      if (parts.length !== 4) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Invalid menu item endpoint' }));
      }
      
      const id = parseInt(parts[3]);
      const itemIndex = MENU_ITEMS.findIndex(item => item.id === id);
      
      // GET - fetch a specific menu item
      if (req.method === 'GET') {
        if (itemIndex === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Menu item not found' }));
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(MENU_ITEMS[itemIndex]));
      }
      // PUT - update a menu item
      else if (req.method === 'PUT') {
        // Check authentication
        const cookies = parseCookies(req);
        const sessionId = cookies.sessionId;
        
        if (!sessionId || !sessions[sessionId]) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }
        
        if (itemIndex === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Menu item not found' }));
        }
        
        // Read request data
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const menuItem = JSON.parse(body);
            
            // Validate required fields
            if (!menuItem.name || !menuItem.price || !menuItem.categoryId || !menuItem.description || !menuItem.image) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Missing required fields' }));
            }
            
            // Check if category exists
            const category = CATEGORIES.find(cat => cat.id === menuItem.categoryId);
            if (!category) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Category not found' }));
            }
            
            // Check if category changed
            const oldCategoryId = MENU_ITEMS[itemIndex].categoryId;
            if (oldCategoryId !== menuItem.categoryId) {
              // Decrement old category count
              const oldCategoryIndex = CATEGORIES.findIndex(cat => cat.id === oldCategoryId);
              if (oldCategoryIndex !== -1) {
                CATEGORIES[oldCategoryIndex].item_count--;
              }
              
              // Increment new category count
              const newCategoryIndex = CATEGORIES.findIndex(cat => cat.id === menuItem.categoryId);
              if (newCategoryIndex !== -1) {
                CATEGORIES[newCategoryIndex].item_count++;
              }
            }
            
            // Update menu item
            const updatedMenuItem = {
              ...MENU_ITEMS[itemIndex],
              name: menuItem.name,
              description: menuItem.description,
              price: parseInt(menuItem.price),
              formattedPrice: (parseInt(menuItem.price) / 100).toFixed(2),
              image: menuItem.image,
              categoryId: parseInt(menuItem.categoryId),
              categoryName: category.name,
              featured: menuItem.featured || false
            };
            
            // Replace in array
            MENU_ITEMS[itemIndex] = updatedMenuItem;
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(updatedMenuItem));
          } catch (e) {
            console.error('Error updating menu item:', e);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid request format' }));
          }
        });
        
        return;
      }
      // DELETE - delete a menu item
      else if (req.method === 'DELETE') {
        // Check authentication
        const cookies = parseCookies(req);
        const sessionId = cookies.sessionId;
        
        if (!sessionId || !sessions[sessionId]) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }
        
        if (itemIndex === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Menu item not found' }));
        }
        
        // Get category ID before removing
        const categoryId = MENU_ITEMS[itemIndex].categoryId;
        
        // Remove item
        const deletedItem = MENU_ITEMS.splice(itemIndex, 1)[0];
        
        // Update category count
        const categoryIndex = CATEGORIES.findIndex(cat => cat.id === categoryId);
        if (categoryIndex !== -1) {
          CATEGORIES[categoryIndex].item_count--;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Menu item deleted', item: deletedItem }));
      }
      
      // Handle reactions (likes/dislikes)
      else if (req.method === 'POST' && pathname.endsWith('/like')) {
        if (itemIndex === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Menu item not found' }));
        }
        
        MENU_ITEMS[itemIndex].likes++;
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ 
          message: 'Like recorded',
          likes: MENU_ITEMS[itemIndex].likes,
          dislikes: MENU_ITEMS[itemIndex].dislikes
        }));
      }
      else if (req.method === 'POST' && pathname.endsWith('/dislike')) {
        if (itemIndex === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Menu item not found' }));
        }
        
        MENU_ITEMS[itemIndex].dislikes++;
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ 
          message: 'Dislike recorded',
          likes: MENU_ITEMS[itemIndex].likes,
          dislikes: MENU_ITEMS[itemIndex].dislikes
        }));
      }
    }
    
    // Handle categories endpoints
    else if (pathname === '/api/categories') {
      // GET - fetch all categories
      if (req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(CATEGORIES));
      }
      // POST - create a new category
      else if (req.method === 'POST') {
        // Check authentication
        const cookies = parseCookies(req);
        const sessionId = cookies.sessionId;
        
        if (!sessionId || !sessions[sessionId]) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }
        
        // Read request data
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const category = JSON.parse(body);
            
            // Validate required fields
            if (!category.name || !category.description) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Missing required fields' }));
            }
            
            // Check if category name is unique
            const existingCategory = CATEGORIES.find(cat => cat.name.toLowerCase() === category.name.toLowerCase());
            if (existingCategory) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Category name must be unique' }));
            }
            
            // Generate an ID
            const newId = CATEGORIES.length > 0 ? Math.max(...CATEGORIES.map(cat => cat.id)) + 1 : 1;
            
            // Create new category
            const newCategory = {
              id: newId,
              name: category.name,
              description: category.description,
              item_count: 0
            };
            
            // Add to array
            CATEGORIES.push(newCategory);
            
            res.writeHead(201, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(newCategory));
          } catch (e) {
            console.error('Error creating category:', e);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid request format' }));
          }
        });
        
        return;
      }
    }
    
    // Handle category by ID endpoint
    else if (pathname.startsWith('/api/categories/') && pathname !== '/api/categories/stats/counts') {
      const parts = pathname.split('/');
      if (parts.length !== 4) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Invalid category endpoint' }));
      }
      
      const id = parseInt(parts[3]);
      const categoryIndex = CATEGORIES.findIndex(cat => cat.id === id);
      
      // GET - fetch a specific category
      if (req.method === 'GET') {
        if (categoryIndex === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Category not found' }));
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(CATEGORIES[categoryIndex]));
      }
      // PUT - update a category
      else if (req.method === 'PUT') {
        // Check authentication
        const cookies = parseCookies(req);
        const sessionId = cookies.sessionId;
        
        if (!sessionId || !sessions[sessionId]) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }
        
        if (categoryIndex === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Category not found' }));
        }
        
        // Read request data
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const category = JSON.parse(body);
            
            // Validate required fields
            if (!category.name || !category.description) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify({ error: 'Missing required fields' }));
            }
            
            // Check if category name is unique (if changed)
            if (category.name.toLowerCase() !== CATEGORIES[categoryIndex].name.toLowerCase()) {
              const existingCategory = CATEGORIES.find(cat => 
                cat.id !== id && cat.name.toLowerCase() === category.name.toLowerCase()
              );
              
              if (existingCategory) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Category name must be unique' }));
              }
            }
            
            // Update category
            const updatedCategory = {
              ...CATEGORIES[categoryIndex],
              name: category.name,
              description: category.description
            };
            
            // Update all menu items with this category
            const oldCategoryName = CATEGORIES[categoryIndex].name;
            if (oldCategoryName !== category.name) {
              MENU_ITEMS.forEach(item => {
                if (item.categoryId === id) {
                  item.categoryName = category.name;
                }
              });
            }
            
            // Replace in array
            CATEGORIES[categoryIndex] = updatedCategory;
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(updatedCategory));
          } catch (e) {
            console.error('Error updating category:', e);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid request format' }));
          }
        });
        
        return;
      }
      // DELETE - delete a category
      else if (req.method === 'DELETE') {
        // Check authentication
        const cookies = parseCookies(req);
        const sessionId = cookies.sessionId;
        
        if (!sessionId || !sessions[sessionId]) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }
        
        if (categoryIndex === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Category not found' }));
        }
        
        // Check if category has items
        if (CATEGORIES[categoryIndex].item_count > 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ 
            error: 'Cannot delete category with items. Remove all items first.' 
          }));
        }
        
        // Remove category
        const deletedCategory = CATEGORIES.splice(categoryIndex, 1)[0];
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ 
          message: 'Category deleted', 
          category: deletedCategory 
        }));
      }
    }
    
    // Handle categories stats
    else if (pathname === '/api/categories/stats/counts') {
      // Always recalculate current counts
      const categoriesWithCounts = CATEGORIES.map(category => {
        const itemCount = MENU_ITEMS.filter(item => item.categoryId === category.id).length;
        // Update stored count
        category.item_count = itemCount;
        return { ...category, item_count: itemCount };
      });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(categoriesWithCounts));
    }
    
    // Handle menu dashboard stats
    else if (pathname === '/api/menu/stats/dashboard') {
      const totalLikes = MENU_ITEMS.reduce((sum, item) => sum + item.likes, 0);
      const totalDislikes = MENU_ITEMS.reduce((sum, item) => sum + item.dislikes, 0);
      
      // Find most liked item
      let mostLikedItem = null;
      if (MENU_ITEMS.length > 0) {
        mostLikedItem = MENU_ITEMS.reduce((prev, current) => 
          (prev.likes > current.likes) ? prev : current
        );
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        totalMenuItems: MENU_ITEMS.length,
        totalCategories: CATEGORIES.length,
        totalLikes,
        totalDislikes,
        mostLikedItem: mostLikedItem ? {
          id: mostLikedItem.id,
          name: mostLikedItem.name,
          likes: mostLikedItem.likes
        } : null
      }));
    }
    
    // Handle users endpoint
    else if (pathname === '/api/users') {
      // Check authorization
      const cookies = parseCookies(req);
      const sessionId = cookies.sessionId;
      
      if (!sessionId || !sessions[sessionId]) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Unauthorized' }));
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify([
        {
          id: 1,
          username: 'admin',
          email: 'admin@yoyacoffee.com',
          role: 'admin',
          createdAt: '2023-04-01T12:00:00Z'
        }
      ]));
    }
    
    // Default response for other API endpoints
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'API endpoint not found' }));
  }
  
  // Normalize path and handle root or admin requests
  if (pathname === '/') {
    pathname = '/index.html';
  } else if (pathname === '/admin') {
    pathname = '/admin.html';
  }
  
  // Construct the file path
  let filePath = path.join(PUBLIC_DIR, pathname);
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If no file found, serve index.html for client-side routing
      filePath = path.join(PUBLIC_DIR, '/index.html');
    }
    
    // Determine content type
    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error: ' + err.code);
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    });
  });
});

// Helper function to parse cookies
function parseCookies(req) {
  const cookies = {};
  const cookieHeader = req.headers.cookie;
  
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      const name = parts[0].trim();
      const value = parts[1] || '';
      cookies[name] = value.trim();
    });
  }
  
  return cookies;
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Yoya Coffee server running at http://0.0.0.0:${PORT}/`);
});