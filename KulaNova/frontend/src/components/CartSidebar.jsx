// CartSidebar.jsx - The sliding cart panel on the right
// Like opening your shopping basket to see what's inside

// CartSidebar.jsx - Updated to ACTUALLY save orders to database!
// Now when you checkout, your order goes to the kitchen's permanent memory!

import { useState } from 'react';
import { useCart } from '../contexts/CartContext.jsx';
import { Link } from 'react-router-dom';
import { api } from '../api.js'; // 📞 The telephone to call the kitchen!

export default function CartSidebar() {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    clearCart
  } = useCart();

  // 🎪 State for checkout loading (like "Processing...")
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // 📝 NEW: State for checkout form (like an order form!)
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // 🖊️ Handle form input changes (when you type in the form)
  const handleInputChange = (e) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    });
  };

  // 🛒 Handle checkout - Now with TWO steps!
  const handleCheckout = () => {
    // Step 1: Show the order form (like getting an order pad!)
    setShowCheckoutForm(true);
  };

  // 📤 NEW: Actually send order to kitchen database!
  const submitOrderToKitchen = async () => {
    // 🔍 Check if we have important info (name and phone)
    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
      alert("👋 Please tell us your name and phone number so we can contact you!");
      return;
    }
    
    setIsCheckingOut(true); // Show "Processing..." spinner
    
    try {
      console.log("📦 Preparing order for kitchen...");
      
      // 🍽️ Prepare the order data (like writing on an order ticket!)
      const orderData = {
        customer_name: customerInfo.name, // 👤 Your name
        phone: customerInfo.phone, // 📞 Your phone number
        items: cart.map(item => ({
          product_id: item.id, // 🏷️ Which food item
          quantity: item.quantity, // 🔢 How many
          price: item.price, // 💰 Price each
          name: item.name // 🍔 Food name (just for reference)
        }))
      };
      
      console.log("📞 Calling kitchen to save order...", orderData);
      
      // 📞 IMPORTANT: Call the kitchen API to SAVE order to database!
      const result = await api.createOrder(orderData);
      
      console.log("✅ Order saved to database:", result);
      
      // 🎉 SUCCESS! Show order confirmation
      alert(`🎉 Order #${result.order_id} Successful!\n\n` +
            `👤 Customer: ${customerInfo.name}\n` +
            `📞 Phone: ${customerInfo.phone}\n` +
            `🍽️ Items: ${getTotalItems()}\n` +
            `💰 Total: $${getTotalPrice().toFixed(2)}\n\n` +
            `Thank you for your order! We'll prepare your food immediately.`);
      
      // 🧹 Clean up after successful order
      clearCart(); // Empty the shopping basket
      closeCart(); // Close the cart sidebar
      setShowCheckoutForm(false); // Hide the form
      setCustomerInfo({ name: '', phone: '', email: '' }); // Reset form
      
    } catch (error) {
      // 😟 Oops! Something went wrong!
      console.error("❌ Checkout failed:", error);
      alert(`❌ Order Failed: ${error.message}\n\n` +
            `Please try again or contact our support.`);
    } finally {
      setIsCheckingOut(false); // Hide spinner
    }
  };

  // If cart is not open, don't show anything
  if (!isCartOpen) return null;

  return (
    <>
      {/* 🎭 Overlay - Dark background when cart is open */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeCart}
      ></div>

      {/* 🛒 Cart Sidebar - The shopping basket panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
        
        {/* 🎪 Cart Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="bg-nova-orange text-white w-8 h-8 rounded-full flex items-center justify-center">
              🛒
            </div>
            <h2 className="text-xl font-bold text-nova-gray">
              Your Cart ({getTotalItems()})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="text-gray-500 hover:text-nova-orange text-2xl"
          >
            ✕
          </button>
        </div>

        {/* 📦 Cart Items Area - Scrollable */}
        <div className="flex-grow overflow-y-auto p-4">
          {cart.length === 0 ? (
            // 🎪 Empty cart message
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6">
                Add some delicious items from our menu!
              </p>
              <button
                onClick={closeCart}
                className="btn-primary"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            // 🍽️ Cart items list
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  {/* 🖼️ Product Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden mr-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 📝 Product Info */}
                  <div className="flex-grow">
                    <h4 className="font-bold text-nova-gray">{item.name}</h4>
                    <p className="text-nova-orange font-bold">${item.price}</p>
                    
                    {/* 🔢 Quantity Controls */}
                    <div className="flex items-center space-x-3 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        −
                      </button>
                      <span className="font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* ❌ Remove button and total */}
                  <div className="text-right">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 mb-2"
                    >
                      ✕
                    </button>
                    <p className="font-bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🎯 Cart Footer - Only show if cart has items */}
        {cart.length > 0 && (
          <div className="border-t p-6">
            {/* 📊 NEW: Checkout Form or Order Summary */}
            {showCheckoutForm ? (
              // 📝 CHECKOUT FORM (Step 2)
              <div className="animate-fadeIn">
                <h3 className="text-lg font-bold mb-4">📝 Your Information</h3>
                
                {/* 👤 Name Field */}
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="John Doe"
                    disabled={isCheckingOut}
                  />
                </div>
                
                {/* 📞 Phone Field */}
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="555-123-4567"
                    disabled={isCheckingOut}
                  />
                </div>
                
                {/* 📧 Email Field (Optional) */}
                <div className="mb-6">
                  <label className="block text-gray-700 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg"
                    placeholder="john@example.com"
                    disabled={isCheckingOut}
                  />
                </div>
              </div>
            ) : (
              // 📊 ORDER SUMMARY (Step 1)
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-bold">${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-bold">$2.99</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-nova-orange">
                    ${(getTotalPrice() + 2.99).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* 🎮 Action Buttons */}
            <div className="space-y-3">
              {showCheckoutForm ? (
                // 📤 SUBMIT ORDER Button (Step 2)
                <button
                  onClick={submitOrderToKitchen}
                  disabled={isCheckingOut}
                  className={`w-full py-3 rounded-lg font-bold transition-all ${
                    isCheckingOut
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  {isCheckingOut ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
                      Saving Order...
                    </span>
                  ) : (
                    '✅ Place Order Now'
                  )}
                </button>
              ) : (
                // 🛒 PROCEED TO CHECKOUT Button (Step 1)
                <button
                  onClick={handleCheckout}
                  className="w-full btn-primary py-3"
                >
                  🛒 Proceed to Checkout
                </button>
              )}

              {/* 🔄 Action Buttons Row */}
              <div className="flex space-x-3">
                <button
                  onClick={clearCart}
                  className="flex-1 border border-red-500 text-red-500 py-3 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Clear Cart
                </button>
                <button
                  onClick={closeCart}
                  className="flex-1 border border-nova-gray text-nova-gray py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            {/* 🔒 Secure Checkout Note */}
            <p className="text-center text-sm text-gray-500 mt-4">
              🔒 Order saved to permanent database · Demo only
            </p>
          </div>
        )}

        {/* 🔙 Continue Shopping Link for empty cart */}
        {cart.length === 0 && (
          <div className="p-6 border-t">
            <Link
              to="/shop"
              onClick={closeCart}
              className="block text-center text-nova-orange hover:text-nova-red font-medium"
            >
              ← Continue shopping
            </Link>
          </div>
        )}
      </div>
    </>
  );
}