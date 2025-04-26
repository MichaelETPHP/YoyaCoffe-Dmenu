// Helper function to get random coffee image URLs
function getRandomCoffeeImage() {
  const coffeeImages = [
    "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80",
    "https://images.unsplash.com/photo-1501747315-124a0eaca060?w=500&q=80",
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80",
    "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&q=80",
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80",
    "https://images.unsplash.com/photo-1596951096923-7069c2c09d77?w=500&q=80",
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80"
  ];
  return coffeeImages[Math.floor(Math.random() * coffeeImages.length)];
}

// Helper function to generate a random rating between 4.0 and 5.0
function getRandomRating() {
  return (4 + Math.random()).toFixed(1);
}

export const menuData = {
  categories: [
    {
      id: "hot-drinks",
      name: "Hot Drinks",
      items: [
        {
          id: "espresso",
          name: "Espresso",
          description: "Our signature blend with rich, bold flavor. Perfect for coffee enthusiasts.",
          price: 120,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
        },
        {
          id: "americano",
          name: "Americano",
          description: "Espresso diluted with hot water. A smooth and satisfying classic.",
          price: 130,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
        },
        {
          id: "cappuccino",
          name: "Cappuccino",
          description: "Equal parts espresso, steamed milk, and milk foam. Italian coffee tradition.",
          price: 150,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
        },
        {
          id: "latte",
          name: "Latte",
          description: "Espresso with steamed milk and a light layer of foam. Creamy and balanced.",
          price: 160,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
        },
        {
          id: "mocha",
          name: "Mocha",
          description: "Espresso with chocolate and steamed milk. Perfect treat for chocolate lovers.",
          price: 170,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
        },
        {
          id: "hot-chocolate",
          name: "Hot Chocolate",
          description: "Rich chocolate with steamed milk and whipped cream. Comforting and indulgent.",
          price: 140,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
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
          description: "Our signature blend served cold over ice. Refreshing on any hot day.",
          price: 135,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
        },
        {
          id: "cold-brew",
          name: "Cold Brew",
          description: "Slow-steeped for 12 hours, smooth and refreshing. Less acidic than regular coffee.",
          price: 160,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
        },
        {
          id: "iced-latte",
          name: "Iced Latte",
          description: "Espresso with cold milk and ice. Cool, creamy, and energizing.",
          price: 165,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
        },
        {
          id: "iced-mocha",
          name: "Iced Mocha",
          description: "Espresso, chocolate, cold milk, and ice. A refreshing chocolate delight.",
          price: 175,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
        },
        {
          id: "frappe",
          name: "Frappe",
          description: "Blended coffee with ice, milk, and whipped cream. The ultimate frozen treat.",
          price: 185,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
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
          description: "Vanilla-flavored espresso with caramel drizzle. Sweet and sophisticated.",
          price: 175,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
        },
        {
          id: "vanilla-latte",
          name: "Vanilla Latte",
          description: "Espresso with steamed milk and vanilla syrup. Simple yet delightful.",
          price: 170,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
        },
        {
          id: "chai-latte",
          name: "Chai Latte",
          description: "Spiced tea concentrate with steamed milk. Aromatic and warming.",
          price: 160,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
        },
        {
          id: "matcha-latte",
          name: "Matcha Latte",
          description: "Japanese green tea powder with steamed milk. Earthy and energizing.",
          price: 170,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
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
          description: "Flaky, buttery pastry, baked fresh daily. The perfect breakfast companion.",
          price: 120,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
        },
        {
          id: "chocolate-croissant",
          name: "Chocolate Croissant",
          description: "Butter croissant with rich chocolate filling. Indulgent and satisfying.",
          price: 135,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
        },
        {
          id: "muffin",
          name: "Blueberry Muffin",
          description: "Moist muffin packed with fresh blueberries. A fruity breakfast treat.",
          price: 125,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
        },
        {
          id: "cinnamon-roll",
          name: "Cinnamon Roll",
          description: "Soft roll with cinnamon swirl and cream cheese frosting. Aromatic and sweet.",
          price: 145,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
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
          description: "Whole grain toast topped with avocado, sea salt, and pepper. Healthy and filling.",
          price: 250,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
        },
        {
          id: "egg-sandwich",
          name: "Egg Sandwich",
          description: "Fried egg with cheddar on a toasted English muffin. Classic breakfast option.",
          price: 225,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
        },
        {
          id: "turkey-sandwich",
          name: "Turkey & Swiss",
          description: "Smoked turkey with Swiss cheese, lettuce, and tomato. Protein-packed lunch.",
          price: 280,
          image: getRandomCoffeeImage(),
          rating: getRandomRating()
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
