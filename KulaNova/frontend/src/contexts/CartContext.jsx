// CartContext.jsx - The "Smart Shopping Basket" Manager
// Think of this like a magic basket that remembers your shopping list forever!
// Even if you close your computer and come back tomorrow!

import { createContext, useState, useContext, useEffect } from 'react';

// Create a special "shopping basket" that everyone can share
// Like having one big basket that all your friends can put toys in
const CartContext = createContext();

// This is like a special rule: "If you want to play with the basket, you must follow basket rules"
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

// This is like writing your name on your lunchbox so you don't forget it
// "kulanova_cart" is our special name for where we save the shopping list
const CART_STORAGE_KEY = 'kulanova_cart';

// This is like looking in your toy box to see what toys you saved yesterday
// We check if there are any toys (cart items) saved in your computer's memory
const loadCartFromStorage = () => {
  try {
    // Ask the computer: "Hey, did I save any shopping items yesterday?"
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      console.log('🔄 Loading cart from localStorage...'); // Like saying "I found my saved toys!"
      // The toys were saved as a secret code (JSON), so we need to decode them
      return JSON.parse(savedCart);
    }
  } catch (error) {
    // Oops! Something went wrong. Like trying to open a toy box with the wrong key
    console.error('❌ Error loading cart from localStorage:', error);
  }
  return []; // If no toys were found, we start with an empty toy box
};

// This is like putting your toys back in the toy box before bedtime
// So you can find them again tomorrow!
const saveCartToStorage = (cart) => {
  try {
    // Turn our shopping list into a secret code that the computer can save
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    console.log('💾 Cart saved to localStorage:', cart.length, 'items'); // Like saying "I saved my toys!"
  } catch (error) {
    // Oops! The toy box is full or broken
    console.error('❌ Error saving cart to localStorage:', error);
  }
};

// This is the "Basket Manager" - it takes care of everything!
// Think of it like a friendly robot that helps you with your shopping
export const CartProvider = ({ children }) => {
  // When the website wakes up, first thing we do is check for saved toys
  // useState is like saying: "Start with these toys, unless we find saved ones"
  const [cart, setCart] = useState(() => loadCartFromStorage());
  
  // This is like a curtain for our shopping basket
  // isCartOpen = curtain open (you can see the basket)
  // isCartOpen = false means curtain closed (you can't see the basket)
  const [isCartOpen, setIsCartOpen] = useState(false);

  // This is like a watchdog that watches your shopping basket
  // Every time you add or remove something, it says: "I'll save that for you!"
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]); // The [cart] means "Watch the cart and save it whenever it changes"

  // This is like putting a toy in your basket
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      // First, check if this toy is already in the basket
      // Like looking for a red car to see if you already have one
      const existingItem = prevCart.find(item => item.id === product.id);
      
      let newCart;
      if (existingItem) {
        // If you already have this toy, just get more of the same
        // Like saying: "I already have 2 red cars, now I'll have 3!"
        newCart = prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // If this is a new toy, add it to the basket with a "birth certificate"
        // The "addedAt" is like writing today's date on your new toy
        newCart = [...prevCart, {
          ...product,
          quantity,
          addedAt: new Date().toISOString()
        }];
      }
      
      console.log('➕ Added to cart:', product.name, 'New total:', newCart.length, 'items');
      return newCart;
    });
  };

  // This is like taking a toy out of your basket and putting it back on the shelf
  const removeFromCart = (productId) => {
    setCart(prevCart => {
      // Filter means: "Keep all toys EXCEPT the one with this ID"
      // Like saying: "I want all my toys except the blue truck"
      const newCart = prevCart.filter(item => item.id !== productId);
      console.log('➖ Removed from cart. New total:', newCart.length, 'items');
      return newCart;
    });
  };

  // This is like changing your mind about how many cookies you want
  // "I thought I wanted 3 cookies, but actually I want 5!"
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      // If you say "I want 0 or less cookies", that means "No cookies at all!"
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => {
      // Map means: "Look at each toy. If it's the one we want to change, update it"
      const newCart = prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity } // Change the quantity
          : item // Leave all other toys alone
      );
      console.log('📝 Updated quantity. New total items:', getTotalItemsFromCart(newCart));
      return newCart;
    });
  };

  // This is a helper function - like a calculator that counts all your toys
  const getTotalItemsFromCart = (cartArray) => {
    // Reduce is like counting: "1 toy + 1 toy + 1 toy = 3 toys total!"
    return cartArray.reduce((total, item) => total + item.quantity, 0);
  };

  // This is like emptying your entire toy box and starting fresh
  const clearCart = () => {
    setCart([]); // [] means "empty basket"
    localStorage.removeItem(CART_STORAGE_KEY); // Also erase the saved list
    console.log('🗑️ Cart cleared completely'); // Like saying "All clean!"
  };

  // This is like adding up all your toy prices with a calculator
  // $5 toy + $3 toy + $2 toy = $10 total
  const getTotalPrice = () => {
    const total = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    return parseFloat(total.toFixed(2)); // Make sure it looks nice: 10.00 instead of 10.0000000
  };

  // This counts how many items TOTAL (if you have 2 cookies and 3 apples, that's 5 items)
  const getTotalItems = () => {
    return getTotalItemsFromCart(cart);
  };

  // This is like opening and closing the curtain on your shopping basket
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen); // If open, close it. If closed, open it!
  };

  // "Please open the curtain so I can see my basket!"
  const openCart = () => {
    setIsCartOpen(true);
  };

  // "Please close the curtain, I'm done looking at my basket"
  const closeCart = () => {
    setIsCartOpen(false);
  };

  // This checks if a specific toy is already in your basket
  // Like asking: "Do I already have a blue truck in here?"
  const isInCart = (productId) => {
    return cart.some(item => item.id === productId); // "some" means "is there at least one?"
  };

  // This finds a specific toy in your basket
  // Like saying: "Find me the blue truck in all these toys"
  const getCartItem = (productId) => {
    return cart.find(item => item.id === productId);
  };

  // This is like making a report card of your shopping basket
  // It tells you everything about what's inside
  const getCartSummary = () => {
    return {
      itemCount: cart.length, // How many different types of toys
      totalItems: getTotalItems(), // How many toys total (counting duplicates)
      totalPrice: getTotalPrice(), // How much everything costs
      items: cart.map(item => ({
        name: item.name, // Toy name
        quantity: item.quantity, // How many of this toy
        price: item.price // Price of this toy
      }))
    };
  };

  // This is like packing a lunchbox with all the basket tools
  // We're putting ALL our basket functions in one box to share with everyone
  const cartValue = {
    cart, // The actual basket with toys
    isCartOpen, // Is the curtain open or closed?
    addToCart, // Function to add toys
    removeFromCart, // Function to remove toys
    updateQuantity, // Function to change how many of a toy
    clearCart, // Function to empty the basket
    getTotalPrice, // Function to calculate total price
    getTotalItems, // Function to count total items
    toggleCart, // Function to open/close curtain
    openCart, // Function to open curtain
    closeCart, // Function to close curtain
    isInCart, // Function to check if toy is in basket
    getCartItem, // Function to find specific toy
    getCartSummary // Function to make a report
  };

  // This is like saying: "Hey everyone! Here's our magic basket!
  // All the children (components) can use these basket tools!"
  return (
    <CartContext.Provider value={cartValue}>
      {children}
    </CartContext.Provider>
  );
};


/*

🎮 How Kids Can Understand This Code:

Think of it Like a Video Game:

· localStorage = Your game's save file
· cart = Your inventory in the game
· useEffect = Autosave feature (saves automatically)
· addToCart = Picking up an item in the game
· removeFromCart = Dropping an item
· getTotalPrice = Checking how much gold you have

Real-Life Examples for Kids:

1. localStorage = Like writing your Christmas list on paper so you don't forget it
2. cart = Your shopping basket at the grocery store
3. addToCart = Putting cookies in your basket
4. removeFromCart = Taking cookies out because mom said no
5. updateQuantity = Changing from 2 cookies to 5 cookies
6. clearCart = Emptying your basket at checkout
7. getTotalPrice = The cashier adding up your bill

The Magic Part:

When you close your computer and come back tomorrow, your shopping list is STILL THERE! That's because we saved it in the computer's memory, just like you save your game progress.

Simple Rules:

1. Add toy → Goes in basket AND gets saved
2. Remove toy → Comes out of basket AND gets saved
3. Close computer → Toys are safe in computer memory
4. Open computer tomorrow → Toys are still there!

Now the shopping basket is like a magic toy box that never forgets what you put inside! 🧙‍♂️🎮

*/