const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5001;
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

// Simple file server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;
  
  // Handle API requests with a simple response
  if (pathname.startsWith('/api/')) {
    // Handle auth endpoints specially
    if (pathname === '/api/auth/init') {
      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ 
        message: 'Default admin created successfully',
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@yoyacoffee.com',
          role: 'admin'
        }
      }));
    } 
    
    else if (pathname === '/api/auth/login' && req.method === 'POST') {
      // Handle login process by reading the posted data
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const credentials = JSON.parse(body);
          
          // Check if credentials match the default admin
          if (credentials.username === 'admin' && credentials.password === 'admin123') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              id: 1,
              username: 'admin',
              email: 'admin@yoyacoffee.com',
              role: 'admin'
            }));
          } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid credentials' }));
          }
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid request format' }));
        }
      });
      
      return;
    }
    
    else if (pathname === '/api/auth/me') {
      // Normally this would check session data, but for simplicity just return the admin user
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        id: 1,
        username: 'admin',
        email: 'admin@yoyacoffee.com',
        role: 'admin'
      }));
    }
    
    else if (pathname === '/api/auth/logout') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Logout successful' }));
    }
    
    // Handle menu item endpoints
    else if (pathname === '/api/menu') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify([
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
      ]));
    }
    
    // Handle categories endpoints
    else if (pathname === '/api/categories') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify([
        { id: 1, name: 'Hot Coffee', description: 'Warm coffee beverages' },
        { id: 2, name: 'Cold Coffee', description: 'Chilled coffee beverages' },
        { id: 3, name: 'Specialty Drinks', description: 'Signature coffee creations' }
      ]));
    }
    
    // Handle categories stats
    else if (pathname === '/api/categories/stats/counts') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify([
        { id: 1, name: 'Hot Coffee', description: 'Warm coffee beverages', item_count: 2 },
        { id: 2, name: 'Cold Coffee', description: 'Chilled coffee beverages', item_count: 1 },
        { id: 3, name: 'Specialty Drinks', description: 'Signature coffee creations', item_count: 0 }
      ]));
    }
    
    // Handle menu dashboard stats
    else if (pathname === '/api/menu/stats/dashboard') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        totalItems: 3,
        totalLikes: 85,
        totalDislikes: 6,
        mostLiked: {
          id: 2,
          name: 'Cappuccino',
          likes: 42
        }
      }));
    }
    
    // Handle users endpoint
    else if (pathname === '/api/users') {
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
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'API endpoint - not fully implemented' }));
  }
  
  // Normalize path and handle root or admin requests
  if (pathname === '/' || pathname === '/admin' || pathname.startsWith('/admin/')) {
    pathname = pathname === '/' ? '/index.html' : '/admin.html';
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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running at http://0.0.0.0:${PORT}/`);
});