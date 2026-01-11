// Contact Page - Talk to us with FAQs
// Like a suggestion box in a restaurant with helpful info

import { useState } from 'react'
import { api } from '../api.js'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  
  // State for FAQ accordion
  const [openFAQ, setOpenFAQ] = useState(null)

  // Update form when typing
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Submit form to backend
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      console.log("📤 Sending contact form...", formData)
      await api.submitContact(formData)
      
      setSuccess(true)
      setFormData({ name: '', email: '', message: '' })
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
      
    } catch (err) {
      console.error("❌ Contact form error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Toggle FAQ answer
  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  // FAQ data
  const faqs = [
    {
      question: "What are your delivery hours?",
      answer: "We deliver 24/7! Our kitchen operates from 8 AM to 11 PM daily, but you can place orders anytime through our website or app for scheduled deliveries."
    },
    {
      question: "How long does delivery take?",
      answer: "Average delivery time is 25-35 minutes. During peak hours (6-9 PM), it may take up to 45 minutes. You can track your order in real-time once it's dispatched."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept credit/debit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and cash on delivery. All online payments are secured with SSL encryption."
    },
    {
      question: "Can I modify or cancel my order?",
      answer: "Yes, you can modify or cancel your order within 10 minutes of placing it. After that, please call our hotline immediately. Once food preparation has started, changes may not be possible."
    },
    {
      question: "Do you offer discounts for large orders?",
      answer: "Absolutely! Orders above $50 get 10% off automatically. For corporate orders or events (above $200), please contact us directly for special rates and menu planning."
    },
    {
      question: "Are there any delivery fees?",
      answer: "Delivery fee is $2.99 for all orders. However, orders above $30 get FREE delivery! We also offer monthly subscription plans for unlimited free deliveries."
    },
    {
      question: "How do I track my order?",
      answer: "Once your order is confirmed and dispatched, you'll receive a tracking link via SMS and email. You can also track it in your account dashboard on our website."
    }
  ]

  return (
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-nova-gray mb-4">
            Contact Us
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Questions, feedback, or just want to say hi? We're here to help!
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Information Side */}
            <div>
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-nova-gray mb-6">
                  Get in Touch
                </h2>
                
                <div className="space-y-8">
                  {/* Phone */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-nova-orange text-white p-3 rounded-full">
                      <span className="text-xl">📞</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Call Us</h3>
                      <p className="text-gray-600">(555) 123-4567</p>
                      <p className="text-sm text-gray-500">Mon-Fri: 8AM-10PM</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-nova-orange text-white p-3 rounded-full">
                      <span className="text-xl">✉️</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Email Us</h3>
                      <p className="text-gray-600">hello@kulanova.com</p>
                      <p className="text-sm text-gray-500">Response within 24 hours</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-nova-orange text-white p-3 rounded-full">
                      <span className="text-xl">📍</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Visit Us</h3>
                      <p className="text-gray-600">123 Food Street</p>
                      <p className="text-gray-600">City, State 12345</p>
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="mt-12 pt-8 border-t">
                  <h3 className="text-xl font-bold text-nova-gray mb-4">
                    Business Hours
                  </h3>
                  <div className="space-y-2">
                    {[
                      { day: "Monday - Friday", hours: "8:00 AM - 10:00 PM" },
                      { day: "Saturday", hours: "9:00 AM - 11:00 PM" },
                      { day: "Sunday", hours: "9:00 AM - 10:00 PM" },
                      { day: "Delivery Service", hours: "24/7 Available" }
                    ].map((schedule, i) => (
                      <div key={i} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="font-medium">{schedule.day}</span>
                        <span className="text-gray-600">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Side */}
            <div>
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-nova-gray mb-6">
                  Send a Message
                </h2>

                {/* Success Message */}
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        ✅
                      </div>
                      <div>
                        <h4 className="font-bold text-green-800">Message Sent!</h4>
                        <p className="text-green-600">We'll get back to you within 24 hours.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
                    <div className="flex items-center">
                      <div className="bg-red-100 p-2 rounded-full mr-3">
                        ❌
                      </div>
                      <div>
                        <h4 className="font-bold text-red-800">Oops!</h4>
                        <p className="text-red-600">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nova-orange focus:border-transparent transition-all"
                      placeholder="Enter your name"
                      disabled={loading}
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nova-orange focus:border-transparent transition-all"
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                  </div>

                  {/* Message Field */}
                  <div>
                    <label className="block text-gray-700 mb-2 font-medium">
                      Your Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nova-orange focus:border-transparent transition-all resize-none"
                      placeholder="How can we help you today?"
                      disabled={loading}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'btn-primary hover:scale-[1.02]'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
                        Sending Message...
                      </span>
                    ) : (
                      'Send Message'
                    )}
                  </button>

                  {/* Note */}
                  <p className="text-sm text-gray-500 text-center">
                    * Required fields. We promise not to spam your inbox.
                  </p>
                </form>
              </div>

              {/* Map Placeholder */}
              <div className="mt-8 card p-6">
                <h3 className="text-xl font-bold text-nova-gray mb-4">
                  Find Our Restaurant
                </h3>
                <div className="bg-gray-100 rounded-xl h-64 flex flex-col items-center justify-center">
                  <div className="text-4xl mb-4">🗺️</div>
                  <p className="text-gray-500">Interactive map would go here</p>
                  <p className="text-sm text-gray-400 mt-2">123 Food Street, City</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: FAQs Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-nova-gray mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Quick answers to common questions about KulaNova
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="card overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-bold text-nova-gray pr-4">
                      {faq.question}
                    </h3>
                    <span className={`text-nova-orange text-xl transition-transform duration-300 ${
                      openFAQ === index ? 'rotate-180' : ''
                    }`}>
                      ▼
                    </span>
                  </button>
                  
                  {openFAQ === index && (
                    <div className="px-6 pb-6 animate-fadeIn">
                      <p className="text-gray-600 border-l-4 border-nova-orange pl-4 py-2">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Still have questions? */}
            <div className="mt-12 text-center">
              <div className="bg-nova-light p-8 rounded-2xl">
                <div className="text-4xl mb-4">❓</div>
                <h3 className="text-2xl font-bold text-nova-gray mb-4">
                  Still have questions?
                </h3>
                <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                  Can't find the answer you're looking for? Please chat with our friendly team.
                </p>
                <button
                  onClick={() => {
                    document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
                    document.querySelector('input[name="name"]')?.focus();
                  }}
                  className="btn-primary px-8 py-3"
                >
                  Contact Our Support Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}