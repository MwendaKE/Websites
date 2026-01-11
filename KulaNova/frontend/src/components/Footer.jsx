// Footer.jsx - Perfectly responsive on ALL screens
// Subscribe button always below input field

export default function Footer() {
  return (
    <footer className="bg-nova-gray text-white mt-20">
      <div className="container mx-auto px-4 py-10">
        
        {/* Footer Grid - Beautiful on all screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start items-center space-x-2 mb-4">
              <div className="bg-nova-orange text-white w-10 h-10 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">K</span>
              </div>
              <span className="text-2xl font-bold">
                Kula<span className="text-nova-orange">Nova</span>
              </span>
            </div>
            <p className="text-gray-300 mb-6 max-w-xs mx-auto md:mx-0">
              Fresh meals delivered to your door. Fast, hot, and delicious!
            </p>
            
            {/* Social Media Icons */}
            <div className="flex justify-center md:justify-start space-x-4">
              {['📘', '📷', '🐦', '📺'].map((icon, i) => (
                <button 
                  key={i}
                  className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-nova-orange transition-colors duration-200 hover:scale-110"
                  aria-label={`Social media button ${i+1}`}
                >
                  <span className="text-lg">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'Shop', 'Contact', 'Privacy Policy', 'Terms of Service'].map((link) => (
                <li key={link}>
                  <a 
                    href={link === 'Home' ? '/' : link === 'Shop' ? '/shop' : link === 'Contact' ? '/contact' : '#'}
                    className="text-gray-300 hover:text-nova-orange transition-colors duration-200 inline-block py-1"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex justify-center md:justify-start items-center space-x-3">
                <span className="text-xl">📞</span>
                <span className="text-gray-300">(555) 123-4567</span>
              </div>
              <div className="flex justify-center md:justify-start items-center space-x-3">
                <span className="text-xl">✉️</span>
                <span className="text-gray-300">hello@kulanova.com</span>
              </div>
              <div className="flex justify-center md:justify-start items-center space-x-3">
                <span className="text-xl">📍</span>
                <span className="text-gray-300">123 Food Street</span>
              </div>
            </div>
          </div>

          {/* Newsletter - FIXED! Button always below input */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
            <p className="text-gray-300 mb-4">
              Get updates on new meals and special offers!
            </p>
            
            {/* Newsletter Form - Button BELOW input on ALL screens */}
            <div className="max-w-sm mx-auto md:mx-0">
              {/* Email input - Full width */}
              <input 
                type="email" 
                placeholder="Your email address"
                className="w-full px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-nova-orange mb-2"
              />
              
              {/* Subscribe button - Full width, below input */}
              <button 
                className="w-full bg-nova-orange text-white py-3 rounded-lg hover:bg-nova-red transition-colors duration-200 font-medium"
              >
                Subscribe Now
              </button>
              
              <p className="text-sm text-gray-400 mt-2">
                No spam, just delicious updates!
              </p>
            </div>
            
            {/* Payment Methods */}
            <div className="mt-6">
              <p className="text-gray-300 mb-2 text-sm">We Accept:</p>
              <div className="flex justify-center md:justify-start space-x-2">
                {['💳', '🏦', '💰', '💲'].map((method, i) => (
                  <span key={i} className="bg-gray-700 p-2 rounded-lg">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright - Always centered */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} KulaNova Food Delivery. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Made with ❤️ and 🍕
          </p>
        </div>
      </div>
    </footer>
  )
}