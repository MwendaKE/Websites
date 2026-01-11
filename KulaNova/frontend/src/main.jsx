// main.jsx - The Stage Manager of Our Whole Website!
// This is where the magic show BEGINS! It sets up the stage and starts the performance!

import React from 'react'  // ⚛️ The magic React wand that makes everything work!
import ReactDOM from 'react-dom/client'  // 🎪 The tool that builds our stage
import App from './App.jsx'  // 🎭 Our main play (the whole show!)
import './index.css'  // 🎨 IMPORTANT: The paint and costumes for our show!

// 🎯 STEP 1: Find the "stage" in the HTML (look for a place called "root")
// document.getElementById('root') is like saying: "Find the theater stage!"
ReactDOM.createRoot(document.getElementById('root')).render(
  // 🛡️ STEP 2: Wrap everything in React.StrictMode (our safety supervisor)
  // This is like having a teacher watch over us to make sure we do everything right!
  <React.StrictMode>
    {/* 🎭 STEP 3: Put our main App (the whole show) on the stage! */}
    <App />
  </React.StrictMode>,
)