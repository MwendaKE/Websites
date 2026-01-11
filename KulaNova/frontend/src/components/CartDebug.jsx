// CartDebug.jsx - For testing localStorage functionality
// Shows cart state and localStorage info

import { useCart } from '../contexts/CartContext.jsx';

export default function CartDebug() {
  const { getCartSummary, clearCart, cart } = useCart();
  
  // Only show in development
  if (process.env.NODE_ENV === 'production') return null;
  
  const summary = getCartSummary();
  
  return (
    <div className="fixed bottom-20 left-4 bg-gray-900 text-white p-4 rounded-lg text-xs max-w-xs z-40 opacity-70 hover:opacity-100 transition-opacity">
      <div className="font-bold mb-2">🛒 Cart Debug (LocalStorage)</div>
      
      <div className="space-y-1 mb-3">
        <div>Items in cart: {summary.itemCount}</div>
        <div>Total quantity: {summary.totalItems}</div>
        <div>Total price: ${summary.totalPrice}</div>
        <div>LocalStorage: {localStorage.getItem('kulanova_cart') ? '✅ Saved' : '❌ Empty'}</div>
      </div>
      
      <div className="space-y-2">
        {cart.map((item, index) => (
          <div key={index} className="flex justify-between border-t border-gray-700 pt-1">
            <span className="truncate">{item.name}</span>
            <span className="ml-2">×{item.quantity}</span>
          </div>
        ))}
      </div>
      
      <button
        onClick={clearCart}
        className="mt-3 text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
      >
        Clear Cart & Storage
      </button>
      
      <button
        onClick={() => {
          console.log('🛒 Cart Summary:', summary);
          console.log('💾 LocalStorage:', localStorage.getItem('kulanova_cart'));
        }}
        className="mt-2 ml-2 text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
      >
        Console Log
      </button>
    </div>
  );
}