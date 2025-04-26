export const menuData = {
  categories: [
    {
      id: "hot-drinks",
      name: "Hot Drinks",
      items: [
        {
          id: "espresso",
          name: "Espresso",
          description: "Our signature blend with rich, bold flavor",
          price: 3.50,
          image: "coffee-espresso"
        },
        {
          id: "americano",
          name: "Americano",
          description: "Espresso diluted with hot water",
          price: 4.00,
          image: "coffee-americano"
        },
        {
          id: "cappuccino",
          name: "Cappuccino",
          description: "Equal parts espresso, steamed milk, and milk foam",
          price: 4.50,
          image: "coffee-cappuccino"
        },
        {
          id: "latte",
          name: "Latte",
          description: "Espresso with steamed milk and a light layer of foam",
          price: 4.75,
          image: "coffee-latte"
        },
        {
          id: "mocha",
          name: "Mocha",
          description: "Espresso with chocolate and steamed milk",
          price: 5.00,
          image: "coffee-mocha"
        },
        {
          id: "hot-chocolate",
          name: "Hot Chocolate",
          description: "Rich chocolate with steamed milk and whipped cream",
          price: 4.25,
          image: "hot-chocolate"
        }
      ]
    },
    {
      id: "cold-drinks",
      name: "Cold Drinks",
      items: [
        {
          id: "iced-coffee",
          name: "Iced Coffee",
          description: "Our signature blend served cold over ice",
          price: 4.00,
          image: "iced-coffee"
        },
        {
          id: "cold-brew",
          name: "Cold Brew",
          description: "Slow-steeped for 12 hours, smooth and refreshing",
          price: 4.75,
          image: "cold-brew"
        },
        {
          id: "iced-latte",
          name: "Iced Latte",
          description: "Espresso with cold milk and ice",
          price: 5.00,
          image: "iced-latte"
        },
        {
          id: "iced-mocha",
          name: "Iced Mocha",
          description: "Espresso, chocolate, cold milk, and ice",
          price: 5.25,
          image: "iced-mocha"
        },
        {
          id: "frappe",
          name: "Frappe",
          description: "Blended coffee with ice, milk, and whipped cream",
          price: 5.50,
          image: "frappe"
        }
      ]
    },
    {
      id: "specialty-drinks",
      name: "Specialty Drinks",
      items: [
        {
          id: "caramel-macchiato",
          name: "Caramel Macchiato",
          description: "Vanilla-flavored espresso with caramel drizzle",
          price: 5.25,
          image: "caramel-macchiato"
        },
        {
          id: "vanilla-latte",
          name: "Vanilla Latte",
          description: "Espresso with steamed milk and vanilla syrup",
          price: 5.00,
          image: "vanilla-latte"
        },
        {
          id: "chai-latte",
          name: "Chai Latte",
          description: "Spiced tea concentrate with steamed milk",
          price: 4.75,
          image: "chai-latte"
        },
        {
          id: "matcha-latte",
          name: "Matcha Latte",
          description: "Japanese green tea powder with steamed milk",
          price: 5.00,
          image: "matcha-latte"
        }
      ]
    },
    {
      id: "pastries",
      name: "Pastries",
      items: [
        {
          id: "croissant",
          name: "Butter Croissant",
          description: "Flaky, buttery pastry, baked fresh daily",
          price: 3.50,
          image: "croissant"
        },
        {
          id: "chocolate-croissant",
          name: "Chocolate Croissant",
          description: "Butter croissant with rich chocolate filling",
          price: 4.00,
          image: "chocolate-croissant"
        },
        {
          id: "muffin",
          name: "Blueberry Muffin",
          description: "Moist muffin packed with fresh blueberries",
          price: 3.75,
          image: "blueberry-muffin"
        },
        {
          id: "cinnamon-roll",
          name: "Cinnamon Roll",
          description: "Soft roll with cinnamon swirl and cream cheese frosting",
          price: 4.25,
          image: "cinnamon-roll"
        }
      ]
    },
    {
      id: "sandwiches",
      name: "Sandwiches",
      items: [
        {
          id: "avocado-toast",
          name: "Avocado Toast",
          description: "Whole grain toast topped with avocado, sea salt, and pepper",
          price: 7.50,
          image: "avocado-toast"
        },
        {
          id: "egg-sandwich",
          name: "Egg Sandwich",
          description: "Fried egg with cheddar on a toasted English muffin",
          price: 6.75,
          image: "egg-sandwich"
        },
        {
          id: "turkey-sandwich",
          name: "Turkey & Swiss",
          description: "Smoked turkey with Swiss cheese, lettuce, and tomato",
          price: 8.50,
          image: "turkey-sandwich"
        }
      ]
    }
  ]
};

// Function to get all items flattened for search
export function getAllItems() {
  let allItems = [];
  menuData.categories.forEach(category => {
    category.items.forEach(item => {
      allItems.push({
        ...item,
        category: category.id
      });
    });
  });
  return allItems;
}

// Helper function for searching items
export function searchItems(query) {
  if (!query) return [];
  
  const searchTerm = query.toLowerCase();
  return getAllItems().filter(item => 
    item.name.toLowerCase().includes(searchTerm) || 
    item.description.toLowerCase().includes(searchTerm)
  );
}
