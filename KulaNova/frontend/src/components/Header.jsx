// Header.jsx - The Top Hat of Our Website!
// Think of this like the captain's hat on a ship - it sits at the very top and shows the way!

import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../contexts/CartContext.jsx'  // Our magic shopping basket!

export default function Header() {
  // 📍 Check where we are right now (which page are we on?)
  const location = useLocation()
  
  // 📱 Mobile menu state - Is the phone menu open or closed? (Like a secret drawer!)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // 🛒 Get our shopping basket's superpowers
  const { getTotalItems, openCart } = useCart()
  
  // 🔍 Check if we're on a certain page (like checking which room you're in)
  const isActive = (path) => location.pathname === path
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* 🎪 The whole header is like a little stage at the top */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          
          {/* 🏷️ LOGO - Our restaurant's name tag! */}
          <Link to="/" className="flex items-center space-x-2 hover:scale-105 transition-transform">
            {/* 🟠 Orange circle with "K" inside - Like a shiny button! */}
            <div className="bg-nova-orange text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md">
              <span className="text-2xl font-bold">K</span>
            </div>
            {/* ✨ Restaurant name in two colors - Kula (gray) + Nova (orange) */}
            <span className="text-2xl font-bold text-nova-gray">
              Kula<span className="text-nova-orange">Nova</span>
            </span>
          </Link>

          {/* 💻 DESKTOP NAVIGATION - Road signs for big computers */}
          <nav className="hidden md:flex space-x-8">
            {[
              { path: '/', label: 'HOME' },      // 🏠 Home button
              { path: '/shop', label: 'SHOP' },   // 🛍️ Shop button  
              { path: '/contact', label: 'CONTACT' } // 📞 Contact button
            ].map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  isActive(link.path) 
                    ? 'bg-nova-orange text-white shadow-md'  // 🌟 Orange when ON this page
                    : 'text-nova-gray hover:text-nova-orange hover:bg-nova-light'  // ⚪ Gray when NOT on this page
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 🛒 CART BUTTON + 📱 MOBILE MENU BUTTON */}
          <div className="flex items-center space-x-4">
            {/* 🛒 Shopping Basket Button - Shows how many items inside! */}
            <button 
              onClick={openCart}
              className="btn-primary flex items-center space-x-2 relative"
            >
              <span>🛒</span>  {/* Shopping cart emoji */}
              <span>Cart</span>  {/* Word "Cart" */}
              
              {/* 🎯 Cart Count Badge - Like a little red sticker showing "How many?" */}
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  {getTotalItems()}  {/* The number of items in cart! */}
                </span>
              )}
            </button>
            
            {/* 📱 Mobile Menu Button - Only shows on phones! (Hides on computers) */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-nova-gray p-2"
            >
              {/* This shows ☰ (hamburger) when closed, ✕ (X) when open */}
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* 📱 MOBILE MENU - The secret drawer that slides down! */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col space-y-2">
              {/* 🏠 Home Link for phones */}
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-medium ${
                  isActive('/') ? 'bg-nova-orange text-white' : 'text-nova-gray hover:bg-gray-100'
                }`}
              >
                HOME
              </Link>
              {/* 🛍️ Shop Link for phones */}
              <Link 
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-medium ${
                  isActive('/shop') ? 'bg-nova-orange text-white' : 'text-nova-gray hover:bg-gray-100'
                }`}
              >
                SHOP
              </Link>
              {/* 📞 Contact Link for phones */}
              <Link 
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-medium ${
                  isActive('/contact') ? 'bg-nova-orange text-white' : 'text-nova-gray hover:bg-gray-100'
                }`}
              >
                CONTACT
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}