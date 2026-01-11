// Home.jsx - The Welcome Page of KulaNova Food Delivery
// Think of this like the front door of a magical food castle!
// When you arrive, you see all the amazing things we can do for you!

import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* 🎪 HERO SECTION - The BIG Welcome Banner (Like a circus tent entrance!) */}
      <section className="relative bg-gradient-to-r from-nova-orange to-nova-yellow text-white py-20 md:py-32 overflow-hidden">
        {/* 🎨 Background pattern - Like secret floating bubbles in the sky! */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full"></div>
        </div>
        
        {/* ✨ Hero Content - All centered like a bullseye target! */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* 🎯 Main Heading - The BIG message that says "HELLO!" */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Taste the <span className="text-nova-light">Nova</span> Difference
            </h1>
            
            {/* 📝 Tagline - A friendly explanation of what we do */}
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Fresh, delicious meals delivered to your door in minutes. 
              Experience restaurant-quality food from the comfort of your home.
            </p>
            
            {/* 🎮 Buttons - Like video game controllers: Press to play! */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* 🚀 Order Now Button - Like a rocket ship to delicious food! */}
              <Link 
                to="/shop" 
                className="bg-white text-nova-orange border-2 border-white font-bold text-lg px-8 py-4 rounded-full hover:bg-nova-light hover:border-nova-light transition-all duration-300 shadow-lg"
              >
                🚀 Order Now
              </Link>
              {/* 📞 Contact Us Button - Like a friendly telephone to call us! */}
              <Link 
                to="/contact" 
                className="bg-transparent text-white border-2 border-white font-bold text-lg px-8 py-4 rounded-full hover:bg-white hover:text-nova-orange transition-all duration-300"
              >
                📞 Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 📖 WEBSITE DESCRIPTION SECTION - The "About Us" story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-nova-gray mb-6">
              Welcome to KulaNova
            </h2>
            <div className="space-y-4 text-lg text-gray-600">
              {/* 🍕 Paragraph 1: What is KulaNova? */}
              <p>
                <span className="font-bold text-nova-orange">KulaNova</span> is your premier food delivery service, 
                bringing restaurant-quality meals directly to your doorstep. 
              </p>
              {/* 👨‍🍳 Paragraph 2: How we connect you with chefs */}
              <p>
                We connect food lovers with the best local chefs and restaurants, 
                making it easy to enjoy delicious, freshly-prepared meals without the hassle of cooking or dining out.
              </p>
              {/* 🎉 Paragraph 3: What you can get from us */}
              <p>
                Whether you're craving a quick lunch, family dinner, or special celebration meal, 
                we've got you covered with our wide selection of dishes and fast delivery service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ⭐ FEATURES SECTION - Our superpowers! (Why we're awesome) */}
      <section className="py-16 bg-nova-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-nova-gray mb-4">
              Why Choose KulaNova?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We're not just another food delivery service. Here's what makes us special:
            </p>
          </div>
          
          {/* 🎪 Features Grid - Like a collection of trading cards, each with a superpower! */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '⚡',  // Lightning bolt = SUPER FAST!
                title: 'Lightning Fast Delivery',
                desc: 'Average delivery time: 25 minutes. Hot and fresh every time!'
              },
              {
                icon: '🌱',  // Plant = FRESH ingredients!
                title: 'Fresh Ingredients',
                desc: 'Locally sourced ingredients, delivered daily to our kitchens.'
              },
              {
                icon: '💰',  // Money bag = GOOD VALUE!
                title: 'Best Value',
                desc: 'High quality at affordable prices. No hidden fees or surprises.'
              },
              {
                icon: '👨‍🍳',  // Chef hat = EXPERT COOKS!
                title: 'Expert Chefs',
                desc: 'Professional chefs with years of experience prepare every meal.'
              },
              {
                icon: '🛡️',  // Shield = SAFE & PROTECTED!
                title: '100% Safe & Secure',
                desc: 'Contactless delivery and strict hygiene protocols.'
              },
              {
                icon: '🎁',  // Gift box = REWARDS!
                title: 'Rewards Program',
                desc: 'Earn points with every order. Redeem for free meals!'
              }
            ].map((feature, index) => (
              // 🃏 Each feature card is like a magic card that tells you about our superpower
              <div key={index} className="card p-6 text-center hover-lift">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-nova-gray">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🍽️ COLLECTIONS SECTION - Different food groups (like in a cafeteria line!) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-nova-gray mb-4">
              Popular Collections
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Browse our most popular food categories
            </p>
          </div>
          
          {/* 🎨 Collections Grid - Like different colored bins for different foods */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Nova Meals',  // 🍽️ Dinner plate = Main meals
                description: 'Complete meals for lunch or dinner',
                count: '6 items',
                color: 'bg-nova-orange',  // Orange bin
                icon: '🍽️'
              },
              {
                title: 'Nova Snacks',  // 🍟 French fries = Snacks
                description: 'Quick bites and appetizers',
                count: '2 items',
                color: 'bg-nova-yellow',  // Yellow bin
                icon: '🍟'
              },
              {
                title: 'Nova Drinks',  // 🥤 Drinking cup = Beverages
                description: 'Refreshing beverages',
                count: '2 items',
                color: 'bg-blue-500',  // Blue bin
                icon: '🥤'
              },
              {
                title: 'Nova Desserts',  // 🍰 Cake = Sweet treats
                description: 'Sweet treats and desserts',
                count: '2 items',
                color: 'bg-pink-500',  // Pink bin
                icon: '🍰'
              }
            ].map((collection, index) => (
              // 🔗 Each collection card is clickable - like a door to that food section
              <Link 
                key={index}
                to="/shop" 
                className="card p-6 text-center group hover-lift"
              >
                {/* 🎪 The colored circle with food icon - like a circus ring! */}
                <div className={`${collection.color} text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {collection.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-nova-gray group-hover:text-nova-orange">
                  {collection.title}
                </h3>
                <p className="text-gray-600 mb-3">{collection.description}</p>
                {/* ➡️ Arrow that says "Click me to see more!" */}
                <div className="text-sm text-nova-orange font-medium">
                  {collection.count} → 
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 📣 CTA SECTION - Call To Action (Like a cheerleader saying "Let's go!") */}
      <section className="py-20 bg-gradient-to-r from-nova-orange to-nova-yellow">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience Food Delivery Done Right?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of happy customers enjoying restaurant-quality meals at home.
            </p>
            
            {/* 🎮 More action buttons - Last chance to play! */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/shop" 
                className="bg-white text-nova-orange font-bold text-lg px-8 py-4 rounded-full hover:bg-nova-light hover:scale-105 transition-all duration-300 shadow-lg"
              >
                🍕 Browse Full Menu
              </Link>
              <Link 
                to="/contact" 
                className="bg-transparent text-white border-2 border-white font-bold text-lg px-8 py-4 rounded-full hover:bg-white hover:text-nova-orange transition-all duration-300"
              >
                ❓ Have Questions?
              </Link>
            </div>
            
            {/* 📊 Stats - Like a scoreboard showing our achievements! */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/30">
              {[
                { number: '2,500+', label: 'Happy Customers' },  // 👥 People who love us
                { number: '25 min', label: 'Avg. Delivery' },    // ⏱️ How fast we are
                { number: '50+', label: 'Menu Items' },          // 🍔 How much food we have
                { number: '4.9★', label: 'Rating' }              // ⭐ How good we are
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold mb-1">{stat.number}</div>
                  <div className="text-sm opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 💬 TESTIMONIALS SECTION - What other people say about us (Like show-and-tell!) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-nova-gray mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Don't just take our word for it
            </p>
          </div>
          
          {/* 🗣️ Customer review cards - Like having three friends tell you how good we are! */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Food Blogger',  // 👩‍💻 Someone who knows food really well!
                text: 'The best food delivery service in town! Fresh, fast, and always delicious.',
                rating: '★★★★★'  // ⭐⭐⭐⭐⭐ Five stars = PERFECT!
              },
              {
                name: 'Mike Chen',
                role: 'Regular Customer',  // 🏠 Someone who orders from us a lot!
                text: 'I order 3 times a week. Consistent quality and amazing customer service.',
                rating: '★★★★★'
              },
              {
                name: 'Emma Wilson',
                role: 'Busy Professional',  // 💼 Someone who doesn't have time to cook!
                text: 'KulaNova saves me time without compromising on taste. Highly recommend!',
                rating: '★★★★★'
              }
            ].map((testimonial, index) => (
              // 📝 Each testimonial card is like a "report card" from a happy customer
              <div key={index} className="card p-6">
                <div className="text-yellow-400 text-xl mb-3">{testimonial.rating}</div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                {/* 👤 Customer photo and info - Like their nametag! */}
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-nova-orange rounded-full flex items-center justify-center text-white mr-3">
                    {testimonial.name.charAt(0)}  // First letter of their name
                  </div>
                  <div>
                    <div className="font-bold text-nova-gray">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}