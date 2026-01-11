// vite.config.js - The Magical Configuration File!
// Think of this like a magical translator that helps React talk to Flask!

import { defineConfig } from 'vite'  // 🛠️ The magic tool that builds our website FAST!
import react from '@vitejs/plugin-react'  // 🎨 The special paintbrush for React components

// 🎯 This is where we tell Vite (our website builder) how to do magic tricks!
export default defineConfig({
  // 🎪 PLUGINS: The magical tools we use (like a wizard's toolkit!)
  plugins: [react()],  // "Use the React magic paintbrush to make our components come alive!"
  
  // 🚀 SERVER: How our development server should work (like setting up a magic portal!)
  server: {
    // 🔄 PROXY: The most important magic trick - translation between frontend and backend!
    proxy: {
      // 📞 When our React frontend says "/api", Vite will secretly translate it!
      '/api': {
        target: 'http://localhost:5000',  // 🏰 "Send all /api calls to the Flask castle!"
        changeOrigin: true,  // 🎭 "Wear a disguise so Flask thinks we're friends!"
        secure: false,  // 🔓 "Don't worry about security certificates (it's just practice!)"
      }
    }
  }
})



/*

🎪 What Kids Will Understand:

Think of a Magical Two-Way Translator:

🏠 Frontend (React House)

· Speaks: JavaScript/React language
· Lives at: http://localhost:5173
· Job: Shows pretty buttons and menus

🏰 Backend (Flask Castle)

· Speaks: Python/Flask language
· Lives at: http://localhost:5000
· Job: Stores food data and processes orders

🔮 Vite Proxy (The Magic Translator)

· Listens for: "/api" calls from React House
· Translates them to: Flask Castle language
· Makes them seem like: They're coming from inside the castle!

The Magic Translation Process:

Without the Proxy:

```
React: "Hey Flask, give me /api/products!" 
Flask: ❌ "Who are you? I don't know you!"
Error: CORS error (like a locked door!)
```

With the Proxy:

```
React: "Hey Vite, I need /api/products!"
Vite: 🧙 "I'll translate this for you!"
Vite (to Flask): "Hey Flask friend, can we have /api/products?"
Flask: ✅ "Sure friend! Here are the products!"
Vite: 🎉 "Here you go React, the products!"
React: "Yay! Got the food list!"
```

Each Part Explained Simply:

1. import { defineConfig } from 'vite'

"Bring in the magic wand that lets us configure Vite!"

2. import react from '@vitejs/plugin-react'

"Bring in the special React paint that makes components colorful!"

3. plugins: [react()]

"Tell Vite: Use the React magic when building our website!"

4. target: 'http://localhost:5000'

"When you see '/api', send it to the Flask kitchen at address 5000!"

5. changeOrigin: true

"Wear a disguise so Flask thinks we're part of its own team!"

6. secure: false

"Don't worry about security locks during practice mode!"

Real-World Analogies:

🍕 Pizza Delivery Example:

```
Customer (React): "I want pizza!" (at localhost:5173)
Translator (Vite): "Let me call the pizzeria for you!"
Pizzeria (Flask): "Hello! Who's calling?" (at localhost:5000)
Translator: "It's me, your friend from next door!" (changeOrigin: true)
Pizzeria: "Oh hi friend! Here's your pizza!" (sends data back)
Translator: "Here's your pizza, customer!" (delivers to React)
```

🌉 Bridge Between Two Islands:

```
Island A (React Island): Speaks React language
Island B (Flask Island): Speaks Python language  
Bridge (Vite Proxy): Translates between the two islands!
```

Why We Need This Configuration:

Problem 1: Different Ports

· React lives at: port 5173
· Flask lives at: port 5000
· Solution: Proxy connects them like a bridge!

Problem 2: CORS (The Security Guard)

· Browser says: "React can't talk to Flask directly!"
· Solution: Proxy acts as a friendly messenger!

Problem 3: Development vs Production

· Development: Need proxy for testing
· Production: Different setup (not in this file)
· Solution: This config only for development!

What "localhost:5000" Means:

```
localhost = "This computer"
:5000 = "Door number 5000"
http://localhost:5000 = "Go to this computer, knock on door 5000"
```

What the Proxy Actually Does:

Before (Broken):

```
Frontend: fetch('/api/products') → Goes to http://localhost:5173/api/products ❌
Result: "404 Not Found" (No API at React's house!)
```

After (Working):

```
Frontend: fetch('/api/products') → Vite intercepts it! 🎯
Vite: Changes to http://localhost:5000/api/products ✅
Flask: "Here are the products!" 🍔
Vite: Delivers to Frontend 🎁
Frontend: "Got the products!" 🎉
```

Development vs Production:

Development (What this file does):

· Uses proxy to connect React and Flask
· Both run on same computer
· For testing and building

Production (Real website):

· React and Flask might be together
· Or on different servers
· Different configuration needed

The Secret Superpower of Vite:

⚡ FAST Building:

Vite builds our website super fast because:

1. Smart caching (remembers what it built)
2. Instant updates (sees changes immediately)
3. Magic imports (loads only what's needed)

🎨 Hot Module Replacement:

When you change code:

1. Old way: Refresh whole page (slow!)
2. Vite way: Just update changed part (instant!)

Why Kids Will Love This:

1. It's like magic! React and Flask can talk even though they speak different languages!
2. It's like a bridge! Connects two different places (ports 5173 and 5000)
3. It's like a translator! Understands both JavaScript and Python
4. It's like a secret tunnel! Lets messages pass through secretly

Now kids understand that vite.config.js is the magical bridge builder that connects our React frontend house with our Flask backend castle, making sure they can talk to each other perfectly! 🌉🏠🏰

*/