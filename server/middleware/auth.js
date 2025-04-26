// Authentication middleware

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  
  return res.status(401).json({ 
    error: 'Access denied. Please log in first.' 
  });
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Access denied. Admin privileges required.' 
  });
};

// For routes that can be accessed by either admin or staff
const isAdminOrStaff = (req, res, next) => {
  if (req.session && req.session.user && 
      (req.session.user.role === 'admin' || req.session.user.role === 'staff')) {
    return next();
  }
  
  return res.status(403).json({ 
    error: 'Access denied. Staff privileges required.' 
  });
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isAdminOrStaff
};