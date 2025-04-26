// This is the entry point for the admin panel
// It doesn't use Svelte for now, just vanilla JavaScript
console.log('Admin panel is loading...');

// Export our admin app
const adminApp = {
  init() {
    console.log('Admin panel initialized');
    
    // We'll use the JavaScript from public/admin/admin.js which is already created
    // This file just serves as an entry point if we want to build the admin panel with Rollup later
  }
};

export default adminApp;