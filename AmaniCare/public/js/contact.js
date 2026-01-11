class ContactForm {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupLiveChat();
    }

    setupEventListeners() {
        const form = document.getElementById('contactForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Real-time form validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Phone number formatting
        const phoneInput = document.getElementById('contactPhone');
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
        });
    }

    setupFormValidation() {
        // Add custom validation patterns
        const emailInput = document.getElementById('contactEmail');
        emailInput.addEventListener('blur', (e) => {
            this.validateEmail(e.target);
        });

        const phoneInput = document.getElementById('contactPhone');
        phoneInput.addEventListener('blur', (e) => {
            this.validatePhone(e.target);
        });
    }

    setupLiveChat() {
        // In a real implementation, this would integrate with a live chat service
        console.log('Live chat system initialized');
    }

    validateField(field) {
        const value = field.value.trim();
        
        // Clear any existing error
        this.clearFieldError(field);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        return true;
    }

    validateEmail(field) {
        const value = field.value.trim();
        if (!value) return true;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }

        return true;
    }

    validatePhone(field) {
        const value = field.value.trim();
        if (!value) return true;

        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
            this.showFieldError(field, 'Please enter a valid phone number');
            return false;
        }

        return true;
    }

    showFieldError(field, message) {
        field.style.borderColor = '#dc3545';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color: #dc3545; font-size: 0.875rem; margin-top: 0.25rem;';
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        // Validate all required fields
        let isValid = true;
        const requiredInputs = form.querySelectorAll('[required]');
        requiredInputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        // Validate email if provided
        const emailInput = document.getElementById('contactEmail');
        if (emailInput.value && !this.validateEmail(emailInput)) {
            isValid = false;
        }

        // Validate phone if provided
        const phoneInput = document.getElementById('contactPhone');
        if (phoneInput.value && !this.validatePhone(phoneInput)) {
            isValid = false;
        }

        if (!isValid) {
            FormHandler.showMessage('Please fix the errors in the form before submitting.', 'error');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        FormHandler.showLoading(submitButton);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Prepare contact data
            const contactData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                service_choice: formData.get('service_choice'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                newsletter: formData.get('newsletter') === 'on',
                submitted_at: new Date().toISOString()
            };

            // In real app: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(contactData) })
            console.log('Contact form submitted:', contactData);
            
            FormHandler.showMessage('Thank you for your message! We will get back to you within 24 hours.', 'success');
            form.reset();
            
        } catch (error) {
            console.error('Error submitting contact form:', error);
            FormHandler.showMessage('Failed to send message. Please try again or contact us directly.', 'error');
        } finally {
            FormHandler.hideLoading(submitButton);
        }
    }

    startLiveChat() {
        // In a real implementation, this would open a live chat widget
        FormHandler.showMessage('Live chat feature coming soon! For now, please use our phone or email support.', 'info');
        
        // Simulate chat opening
        setTimeout(() => {
            const chatWindow = document.createElement('div');
            chatWindow.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 1000;
                display: flex;
                flex-direction: column;
            `;
            chatWindow.innerHTML = `
                <div style="background: var(--pine-green); color: white; padding: 15px; border-radius: 10px 10px 0 0;">
                    <strong>AmaniCare Support</strong>
                    <button onclick="this.parentElement.parentElement.remove()" style="float: right; background: none; border: none; color: white; cursor: pointer;">×</button>
                </div>
                <div style="flex: 1; padding: 20px; overflow-y: auto;">
                    <div style="background: #f0f0f0; padding: 10px; border-radius: 10px; margin-bottom: 10px;">
                        Hello! How can we help you today?
                    </div>
                    <div style="text-align: center; color: #666; font-style: italic;">
                        Live chat feature under development...
                    </div>
                </div>
            `;
            document.body.appendChild(chatWindow);
        }, 1000);
    }

    showDirections() {
        // In a real implementation, this would open maps
        const address = "123 Healthcare Street, Dar es Salaam, Tanzania";
        FormHandler.showMessage(`Directions to: ${address}`, 'info');
        
        // Simulate opening maps
        setTimeout(() => {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
        }, 500);
    }
}

// Initialize contact form when page loads
let contact;
document.addEventListener('DOMContentLoaded', () => {
    contact = new ContactForm();
});

// Make contact available globally for onclick handlers
window.contact = contact;