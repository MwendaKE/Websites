// api.js - The Telephone Operator Between Frontend and Backend!
// Think of this like a friendly operator who makes phone calls to the kitchen for you!

// api.js - The Telephone Operator - UPDATED!
// Now with better error messages and actual order saving!

// 🚀 No need for full URL because of our magic translator (proxy)!
const API_BASE = '/api';  // Vite will send this to Flask kitchen!

export const api = {
  // 📞 1. Call kitchen: "What food do you have today?"
  getProducts: async () => {
    console.log("📞 Calling backend for products...");
    const response = await fetch(`${API_BASE}/products`);
    if (!response.ok) {
      throw new Error(`Kitchen error: ${response.status}`);
    }
    const data = await response.json();
    console.log("✅ Got products:", data.length);
    return data;
  },

  // 🔍 2. Call kitchen: "Tell me about THIS specific food!"
  getProduct: async (id) => {
    const response = await fetch(`${API_BASE}/products/${id}`);
    if (!response.ok) throw new Error('Food not found in kitchen!');
    return await response.json();
  },

  // 📂 3. Call kitchen: "What food categories do you have?"
  getCategories: async () => {
    const response = await fetch(`${API_BASE}/categories`);
    if (!response.ok) throw new Error('Cannot get food groups from kitchen!');
    return await response.json();
  },

  // 📨 4. Send a message to restaurant
  submitContact: async (data) => {
    console.log("📨 Sending contact form...", data);
    const response = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Message failed: ${errorText}`);
    }
    const result = await response.json();
    console.log("✅ Contact form sent:", result);
    return result;
  },

  // 🛒 5. IMPORTANT FIX: Place a REAL food order that saves to database!
  createOrder: async (orderData) => {
    console.log("🛒 Creating REAL order in database:", orderData);
    
    try {
      // 📞 Call the kitchen's order department
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',  // "POST means 'Send this to kitchen!'"
        headers: {
          'Content-Type': 'application/json',  // "Write in kitchen code"
        },
        body: JSON.stringify(orderData)  // "Put order in envelope"
      });
      
      // 😟 Check if kitchen had trouble
      if (!response.ok) {
        // Try to read what the kitchen said went wrong
        let errorMessage = 'Kitchen cannot process order!';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If kitchen response isn't JSON, use status text
          errorMessage = `Kitchen error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // ✅ Kitchen processed order successfully!
      const result = await response.json();
      console.log("✅ Order saved to database:", result);
      
      // 📝 Log order details for debugging
      console.log(`🎉 Order #${result.order_id} created!`);
      console.log(`💰 Total: $${result.total}`);
      console.log(`📦 Items: ${orderData.items.length}`);
      
      return result;
      
    } catch (error) {
      // 🚨 Something went wrong with the phone call itself
      console.error("❌ API call failed:", error);
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot reach kitchen! Is Flask backend running on port 5000?');
      }
      throw error; // Re-throw the original error
    }
  }
};

/*

🎪 What Kids Will Understand:

Think of a Restaurant Telephone System:

👨‍🍳 The Kitchen (Backend/Flask)

· Where food is cooked
· Where orders are prepared
· Where information is stored

📱 The Phone (Our api.js)

· Makes calls to the kitchen
· Asks questions
· Sends messages
· Gets replies

👨‍💼 The Customer (Frontend/React)

· Wants to know menu
· Wants to order food
· Wants to send messages

Each Function is a Different Phone Call:

1. getProducts() = "What's on the menu today?"

```javascript
// Customer: "Hello kitchen, what food do you have?"
// Kitchen: "Here's our delicious menu with 12 items!"
```

2. getProduct(id) = "Tell me about the cheeseburger!"

```javascript
// Customer: "Can you tell me all about food #5?"
// Kitchen: "That's our special cheeseburger! Here are the details..."
```

3. getCategories() = "What types of food do you serve?"

```javascript
// Customer: "Do you have meals, snacks, and drinks?"
// Kitchen: "Yes! We have 4 categories: meals, snacks, drinks, desserts!"
```

4. submitContact(data) = "I have a question for the manager!"

```javascript
// Customer: "Dear restaurant, I have a suggestion..."
// Restaurant: "Thanks for your message! We'll read it soon!"
```

5. createOrder(orderData) = "I want to order this food!"

```javascript
// Customer: "I want 2 burgers and 1 soda please!"
// Kitchen: "Order received! We're cooking it now!"
```

The Magic Translator (Proxy):

```javascript
const API_BASE = '/api';
```

"Vite (our magic friend) says: When you call /api, I'll connect you to the kitchen at http://localhost:5000/api!"

HTTP Methods Explained for Kids:

GET = Asking a question

```javascript
method: 'GET'  // "Just asking, not changing anything"
```

Like asking: "What's the weather today?"

POST = Sending something

```javascript
method: 'POST'  // "Sending information to the server"
```

Like mailing: "Here's a letter for you!"

JSON Explained Simply:

```javascript
JSON.stringify(data)  // "Turn JavaScript into secret code"
JSON.parse(response)  // "Turn secret code back into JavaScript"
```

Think of it like:

· Before sending: {name: "John"} → "{\"name\":\"John\"}" (Secret code)
· After receiving: "{\"name\":\"John\"}" → {name: "John"} (Normal text)

Error Handling (The "Oops!" Parts):

```javascript
if (!response.ok) throw new Error('Something went wrong!');
```

"If the kitchen says 'No' or 'Error', tell the customer: 'Oops! Something went wrong!'"

Console Logs (The "Talking to Ourselves" Parts):

```javascript
console.log("📞 Calling backend for products...");
```

"We whisper to ourselves what we're doing, so programmers can debug!"

Real-World Analogies:

1. Making a Pizza Order:

```
Frontend: "I want a pizza!" (Customer speaking)
api.js: "Hello pizza shop, customer wants a pizza!" (Phone call)
Backend: "Got it! Making pizza now!" (Kitchen working)
api.js: "Pizza shop says they're making it!" (Phone reply)
Frontend: "Yay! Pizza is coming!" (Customer happy)
```

2. Checking Movie Times:

```
Frontend: "What movies are playing?"
api.js: "Hello cinema, what movies today?"
Backend: "Here's the movie list!"
api.js: "Cinema sent the movie times!"
Frontend: "Great! Now I know what to watch!"
```

Why We Need api.js:

Without api.js:

· Frontend: "Hey kitchen, give me food!"
· Kitchen: ❌ (No phone to call with)
· Frontend: 😟 "I can't talk to the kitchen!"

With api.js:

· Frontend: "api.js, ask kitchen for food!"
· api.js: 📞 "Hello kitchen? Food please!"
· Kitchen: 🍕 "Here's the food!"
· api.js: "Frontend, here's the food!"
· Frontend: 🎉 "Yay! Got food!"

Now kids understand that api.js is the telephone operator that connects our website (frontend) with our kitchen (backend), making sure messages go back and forth perfectly! 📞🍔🚀

*/