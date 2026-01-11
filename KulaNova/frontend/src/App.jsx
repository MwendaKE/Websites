// App.jsx - The Director of Our Whole Website!
// Think of this like the conductor of an orchestra - it tells everyone what to do!

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'  // 🧭 Map and road signs
import { CartProvider } from './contexts/CartContext.jsx'  // 🛒 Our magic shopping basket manager
import Header from './components/Header.jsx'  // 👑 The top hat of our website
import Footer from './components/Footer.jsx'  // 👞 The shoes of our website  
import CartSidebar from './components/CartSidebar.jsx'  // 🎪 The sliding shopping basket panel
import CartDebug from './components/CartDebug.jsx'  // 🐛 Debug helper (only for programmers!)
import Home from './pages/Home.jsx'  // 🏠 The welcome page
import Shop from './pages/Shop.jsx'  // 🛍️ The food store page
import Contact from './pages/Contact.jsx'  // 📞 The "talk to us" page
import './App.css'  // 🎨 The paint and colors for our website

function App() {
  return (
    // 🛒 Step 1: Wrap everything in CartProvider (the shopping basket manager)
    // This is like saying: "Everyone in this house can use the magic shopping basket!"
    <CartProvider>
      {/* 🧭 Step 2: Set up the Router (our website's GPS system) */}
      <Router>
        {/* 📦 Step 3: Create the main website container (like a big toy box) */}
        <div className="flex flex-col min-h-screen">
          
          {/* 👑 Step 4: Add the Header (always at the top, like a hat) */}
          <Header />
          
          {/* 🎪 Step 5: Add the Cart Sidebar (slides in when you click the cart) */}
          <CartSidebar />
          
          {/* 🐛 Step 6: Add CartDebug ONLY when we're building/testing */}
          {/* process.env.NODE_ENV === 'development' means "only show during practice" */}
          {process.env.NODE_ENV === 'development' && <CartDebug />}
          
          {/* 🎭 Step 7: The Main Content Area (changes based on which page we're on) */}
          <main className="flex-grow">
            {/* 🗺️ Step 8: Set up the different pages/routes (like different rooms in a house) */}
            <Routes>
              {/* 🏠 Route 1: The Home page (when URL is just "/") */}
              <Route path="/" element={<Home />} />
              
              {/* 🛍️ Route 2: The Shop page (when URL is "/shop") */}
              <Route path="/shop" element={<Shop />} />
              
              {/* 📞 Route 3: The Contact page (when URL is "/contact") */}
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
          
          {/* 👞 Step 9: Add the Footer (always at the bottom, like shoes) */}
          <Footer />
          
        </div>
      </Router>
    </CartProvider>
  )
}

export default App