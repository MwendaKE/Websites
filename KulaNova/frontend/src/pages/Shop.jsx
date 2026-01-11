// Shop.jsx - The online food store
// Think of this like walking into a candy store where you can see ALL the treats!
// With a magic basket that remembers what you picked yesterday!

import { useState, useEffect } from 'react'
import { useCart } from '../contexts/CartContext.jsx'  // Our magic basket manager
import { api } from '../api.js'  // The phone that calls the kitchen for food info
import ProductModal from '../components/ProductModal.jsx'  // The magnifying glass for food details

export default function Shop() {
  // These are like empty shopping bags waiting to be filled
  const [products, setProducts] = useState([])  // All the food in the store
  const [categories, setCategories] = useState([])  // Different food sections (like "Fruits" or "Snacks")
  const [loading, setLoading] = useState(true)  // "Please wait, we're getting the food ready!"
  const [error, setError] = useState(null)  // "Oops, something went wrong!"
  const [selectedCategory, setSelectedCategory] = useState('all')  // Which food section we're looking at
  
  // These are for the magnifying glass that shows food details
  const [selectedProduct, setSelectedProduct] = useState(null)  // Which food we're zooming in on
  const [isModalOpen, setIsModalOpen] = useState(false)  // Is the magnifying glass turned on or off?

  // Get our magic shopping basket and its superpowers
  const { addToCart, getTotalItems, openCart, cart } = useCart()

  // 🎯 NEW: Show a happy message when your saved shopping list comes back!
  useEffect(() => {
    // This is like when you open your lunchbox and find yesterday's cookies still there!
    if (cart.length > 0) {
      const timer = setTimeout(() => {
        // Create a little floating message bubble
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fadeIn';
        toast.innerHTML = `
          <div class="flex items-center">
            <span class="mr-2">🔄</span>
            <span>Cart restored! ${getTotalItems()} items loaded from memory</span>
          </div>
        `;
        document.body.appendChild(toast);  // Put the message bubble on the screen
        
        // Make the message bubble disappear after 3 seconds (like magic!)
        setTimeout(() => {
          toast.style.opacity = '0';  // Start fading out
          toast.style.transition = 'opacity 0.5s';  // Make it fade slowly
          setTimeout(() => toast.remove(), 500);  // Remove it completely
        }, 3000);
      }, 1000);  // Wait 1 second before showing the message
      
      // Cleanup: If you leave the page, cancel the message
      return () => clearTimeout(timer);
    }
  }, [cart.length, getTotalItems]);  // Watch for changes in the cart

  // When the Shop page wakes up, it needs to get all the food information
  useEffect(() => {
    // This is like asking the kitchen: "What food do you have today?"
    async function loadData() {
      try {
        setLoading(true)  // Show the "Loading..." sign
        console.log("🔄 Loading shop data...")  // Tell the computer we're working
        
        // Ask for TWO things at once: all foods AND all food categories
        // Promise.all is like saying "Get me both of these, I'll wait!"
        const [productsData, categoriesData] = await Promise.all([
          api.getProducts(),  // "Give me all the foods!"
          api.getCategories() // "Give me all the food sections!"
        ])
        
        // Put the foods in our shopping bag
        setProducts(productsData)
        // Put the food sections in our other bag
        setCategories(categoriesData)
        console.log(`✅ Loaded ${productsData.length} products and ${categoriesData.length} categories`)
        // That's like saying "Yay! We got 12 foods and 4 food sections!"
        
      } catch (err) {
        // Oops! The kitchen door might be locked or the phone isn't working
        console.error("❌ Error loading shop:", err)
        setError(err.message)  // Show the error message
      } finally {
        setLoading(false)  // Take down the "Loading..." sign
      }
    }
    
    loadData()  // Start getting the food info!
  }, [])  // The [] means "Do this only once when the page loads"

  // This is what happens when you click "Add to Cart"
  const handleAddToCart = (product) => {
    addToCart(product);  // Put the food in our magic basket
    
    // Make the button do a little happy dance!
    const button = document.activeElement;
    if (button) {
      button.classList.add('scale-90');  // Shrink the button a tiny bit
      setTimeout(() => button.classList.remove('scale-90'), 200);  // Then grow it back
    }
    
    // Show a little floating "Yay!" message
    showToast(`Added ${product.name} to cart! 🛒`);
  };

  // This creates a floating "Yay!" message
  const showToast = (message) => {
    // First, clean up any old "Yay!" messages that might still be there
    const existingToasts = document.querySelectorAll('.custom-toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create a new "Yay!" message bubble
    const toast = document.createElement('div');
    toast.className = 'custom-toast fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-xl z-50 animate-bounce';
    toast.textContent = message;  // Put our message inside
    document.body.appendChild(toast);  // Show it on screen!
    
    // Make it disappear after 2 seconds (like soap bubbles!)
    setTimeout(() => {
      toast.style.opacity = '0';  // Start fading
      toast.style.transition = 'opacity 0.3s';  // Fade slowly
      setTimeout(() => toast.remove(), 300);  // Then vanish completely
    }, 2000);
  };

  // This opens the magnifying glass to see food details
  const openProductModal = (product) => {
    setSelectedProduct(product);  // Choose which food to look at
    setIsModalOpen(true);  // Turn ON the magnifying glass
  };

  // This closes the magnifying glass
  const closeProductModal = () => {
    setIsModalOpen(false);  // Turn OFF the magnifying glass
    setTimeout(() => setSelectedProduct(null), 300);  // Forget which food we were looking at
  };

  // This filters foods by category
  // Like saying "Show me only the snacks" or "Show me everything!"
  const filteredProducts = selectedCategory === 'all' 
    ? products  // Show ALL foods
    : products.filter(p =>  // Show only foods from chosen category
        categories.find(c => c.id === p.category_id)?.name === selectedCategory
      );

  return (
    <div className="min-h-screen py-8">
      {/* The whole shop is inside this big box */}
      <div className="container mx-auto px-4">
        
        {/* Shop Sign - The big welcome sign at the top */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-nova-gray mb-4">
            Our Delicious Menu
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Freshly prepared meals, ready for delivery. Click "Add to Cart" to order!
          </p>
          
          {/* Magic Basket Button - Shows your shopping progress */}
          <div className="mt-6 flex justify-center">
            <button 
              onClick={openCart}
              className="bg-nova-orange text-white px-6 py-3 rounded-full font-bold hover:bg-nova-red transition-colors flex items-center space-x-2 shadow-lg hover:scale-105"
            >
              <span>🛒</span>
              <span>View Cart ({getTotalItems()} items)</span>
            </button>
          </div>
        </div>

        {/* Food Section Buttons - Like tabs in a recipe book */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-4">
            {/* The "All Foods" button */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-nova-orange text-white shadow-md'  // Orange when selected
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'  // Gray when not
              }`}
            >
              All Items ({products.length})
            </button>
            
            {/* All the different food section buttons */}
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category.name
                    ? 'bg-nova-orange text-white shadow-md'  // Orange when selected
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'  // Gray when not
                }`}
              >
                {category.name} ({products.filter(p => p.category_id === category.id).length})
              </button>
            ))}
          </div>
        </div>

        {/* 🍳 Loading State - When the kitchen is still cooking */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nova-orange"></div>
            <p className="mt-4 text-gray-600">Loading delicious meals from kitchen...</p>
          </div>
        )}

        {/* 😟 Error State - When something goes wrong */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">😟</div>
            <h3 className="text-xl font-bold text-red-700 mb-2">Oops! Kitchen Closed</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Make sure your Flask backend is running on port 5000
            </p>
          </div>
        )}

        {/* 🍕 Food Display Area - Where all the yummy food cards are! */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="card overflow-hidden group hover-lift">
                  {/* Food Picture Window */}
                  <div className="h-48 overflow-hidden bg-gray-100 relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        // If the picture is broken, show a nice orange placeholder
                        e.target.src = `https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=${encodeURIComponent(product.name)}`
                      }}
                    />
                    {/* Food Type Badge - Like a name tag */}
                    <div className="absolute top-4 left-4 bg-nova-orange text-white px-3 py-1 rounded-full text-sm">
                      {categories.find(c => c.id === product.category_id)?.name || 'Meal'}
                    </div>
                    {/* Price Badge - Shows how much it costs */}
                    <div className="absolute bottom-4 right-4 bg-white text-nova-orange font-bold px-3 py-1 rounded-full shadow-lg">
                      ${product.price}
                    </div>
                  </div>

                  {/* Food Information Card */}
                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-nova-gray group-hover:text-nova-orange transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                        {product.short_desc}
                      </p>
                    </div>
                    
                    {/* Action Buttons - Like "Buy me!" and "Tell me more!" */}
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <span>🛒</span>
                        <span>Add to Cart</span>
                      </button>
                      <button 
                        onClick={() => openProductModal(product)}
                        className="text-nova-orange hover:text-nova-red font-medium flex items-center space-x-1"
                      >
                        <span>Details</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 🍽️ Empty State - When no food matches our search */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No Meals Found</h3>
                <p className="text-gray-600">Try selecting a different category</p>
              </div>
            )}
          </>
        )}

        {/* 🛒 Floating Cart Button - Like a little reminder bubble */}
        {getTotalItems() > 0 && (
          <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-30">
            <button
              onClick={openCart}
              className="bg-nova-orange text-white px-6 py-3 rounded-full shadow-xl hover:scale-105 transition-all flex items-center space-x-2 animate-pulse"
            >
              <span className="text-xl">🛒</span>
              <div>
                <div className="font-bold">{getTotalItems()} items</div>
                <div className="text-sm">Ready to checkout</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 🔍 Product Magnifying Glass - The popup that shows food details */}
      <ProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeProductModal}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}

/*

🎯 What We Added (Kid-Friendly Version):

The Magic Memory Message:

When you come back to the shop and your shopping basket has food from yesterday, a blue message bubble pops up and says:

"🔄 Cart restored! X items loaded from memory"

Think of it like:

· You save your video game progress
· Tomorrow when you play again, it says "Welcome back! Your game is loaded!"
· Your shopping basket remembers everything you picked!

How It Works (Simple Version):

1. Computer checks: "Does this kid have a saved shopping list?"
2. If YES: "Great! Let me show a happy message about it!"
3. Creates message: Makes a blue bubble that floats on screen
4. Shows message: "Yay! Your X items are back!"
5. Message disappears: After 3 seconds, it fades away like magic

What Kids Will Notice:

1. They add cookies → Cookies go in basket
2. They close computer → Goes to sleep
3. Tomorrow they open computer → Blue message says "Your cookies are still here!"
4. They check basket → Cookies are still there!

The Cool Part:

The message waits 1 second before showing up (so it doesn't surprise you), stays for 3 seconds (long enough to read), then fades away slowly (not too fast, not too slow).

Now kids understand that their shopping is saved like their favorite game saves! 🎮💾

*/