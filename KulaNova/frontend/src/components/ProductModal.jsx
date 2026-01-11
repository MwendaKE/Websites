// ProductModal.jsx - Shows detailed product info

import { useEffect } from 'react';

export default function ProductModal({ product, isOpen, onClose, onAddToCart }) {
  // Close modal when pressing Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 z-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-nova-gray">{product.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-nova-orange text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Modal Content */}
          <div className="overflow-y-auto max-h-[70vh]">
            {/* Product Image */}
            <div className="h-64 bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/800x400/FF6B35/FFFFFF?text=${encodeURIComponent(product.name)}`;
                }}
              />
            </div>

            {/* Product Details */}
            <div className="p-6">
              {/* Price and Info */}
              <div className="flex justify-between items-center mb-4">
                <div className="text-3xl font-bold text-nova-orange">
                  ${product.price}
                </div>
                <div className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  🚚 25-35 min delivery
                </div>
              </div>

              {/* Short Description */}
              <p className="text-gray-700 text-lg mb-4 font-medium">
                {product.short_desc}
              </p>

              {/* Long Description */}
              <div className="mb-6">
                <h4 className="text-xl font-bold text-nova-gray mb-3">About this meal</h4>
                <p className="text-gray-600 whitespace-pre-line">
                  {product.long_desc}
                </p>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-nova-light p-4 rounded-lg">
                  <div className="font-bold text-nova-gray mb-1">Ingredients</div>
                  <div className="text-gray-600 text-sm">Fresh, locally sourced ingredients</div>
                </div>
                <div className="bg-nova-light p-4 rounded-lg">
                  <div className="font-bold text-nova-gray mb-1">Preparation</div>
                  <div className="text-gray-600 text-sm">Made fresh when ordered</div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex-1 btn-primary flex items-center justify-center space-x-2 py-4 text-lg"
              >
                <span>🛒</span>
                <span>Add to Cart - ${product.price}</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 border-2 border-nova-gray text-nova-gray font-bold py-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}