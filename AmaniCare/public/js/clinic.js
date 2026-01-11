class ClinicServices {
    constructor() {
        this.categories = [];
        this.services = [];
        this.currentCategory = 'all';
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadServices();
        this.setupEventListeners();
        this.setupCategoryCards();
    }

    async loadCategories() {
        try {
            // Enhanced clinic categories
            this.categories = [
                { id: 10, name: 'Vaccination', description: 'Immunization services', icon: '💉' },
                { id: 11, name: 'Lab Tests', description: 'Basic diagnostic services', icon: '🔬' },
                { id: 12, name: 'Wound Care', description: 'First aid and wound care management', icon: '🩹' }
            ];
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showError('Failed to load service categories');
        }
    }

    async loadServices() {
        try {
            // Enhanced clinic services data
            this.services = [
                {
                    id: 1,
                    category_id: 10,
                    name: 'COVID-19 Vaccination',
                    description: 'Complete COVID-19 vaccination series including latest boosters. Professional administration with medical supervision and post-vaccination monitoring.',
                    price: 0.00,
                    requirements: 'Government ID, Previous vaccination card if applicable, Medical history form',
                    duration: '30 minutes',
                    preparation: 'No special preparation required'
                },
                {
                    id: 2,
                    category_id: 10,
                    name: 'Seasonal Flu Vaccination',
                    description: 'Annual influenza vaccination for comprehensive protection against seasonal flu strains. Recommended for all age groups.',
                    price: 15.00,
                    requirements: 'None',
                    duration: '15 minutes',
                    preparation: 'None required'
                },
                {
                    id: 3,
                    category_id: 10,
                    name: 'Travel Vaccinations',
                    description: 'Comprehensive travel immunization package including yellow fever, typhoid, hepatitis A&B, and other required travel vaccines.',
                    price: 45.00,
                    requirements: 'Travel itinerary, Previous vaccination records, Destination information',
                    duration: '45 minutes',
                    preparation: 'Consultation required before administration'
                },
                {
                    id: 4,
                    category_id: 11,
                    name: 'Comprehensive Blood Test',
                    description: 'Complete blood count, lipid profile, liver function tests, kidney function tests, and blood glucose levels for overall health assessment.',
                    price: 35.00,
                    requirements: 'Fasting for 8-12 hours, Hydration recommended',
                    duration: '20 minutes',
                    preparation: 'Fasting required for accurate results'
                },
                {
                    id: 5,
                    category_id: 11,
                    name: 'Malaria Rapid Test',
                    description: 'Quick and accurate malaria diagnostic test with results available within 15 minutes. Professional blood sample collection.',
                    price: 12.00,
                    requirements: 'None',
                    duration: '20 minutes',
                    preparation: 'None required'
                },
                {
                    id: 6,
                    category_id: 11,
                    name: 'Urine Analysis & Culture',
                    description: 'Complete urinalysis including physical, chemical, and microscopic examination. Culture test for bacterial infection detection.',
                    price: 25.00,
                    requirements: 'First morning urine sample preferred',
                    duration: '15 minutes',
                    preparation: 'Clean catch urine sample'
                },
                {
                    id: 7,
                    category_id: 12,
                    name: 'Wound Dressing & Care',
                    description: 'Professional wound cleaning, disinfection, and dressing with modern sterile techniques. Infection prevention and proper healing guidance.',
                    price: 20.00,
                    requirements: 'None',
                    duration: '30 minutes',
                    preparation: 'None required'
                },
                {
                    id: 8,
                    category_id: 12,
                    name: 'Minor Injury Treatment',
                    description: 'Comprehensive treatment for cuts, burns, sprains, and minor fractures. Includes pain management and follow-up care instructions.',
                    price: 35.00,
                    requirements: 'None',
                    duration: '45 minutes',
                    preparation: 'None required'
                },
                {
                    id: 9,
                    category_id: 12,
                    name: 'Stitch Removal',
                    description: 'Professional removal of surgical stitches or staples with proper wound assessment and aftercare instructions.',
                    price: 15.00,
                    requirements: 'Medical record of stitch placement',
                    duration: '20 minutes',
                    preparation: 'Clean wound area'
                }
            ];

            this.renderServices();
            this.updateServicesCount();
        } catch (error) {
            console.error('Error loading services:', error);
            this.showError('Failed to load clinic services');
        }
    }

    setupCategoryCards() {
        // Add active state handling for category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                // Remove active class from all cards
                document.querySelectorAll('.category-card').forEach(c => {
                    c.style.borderColor = '';
                    c.style.boxShadow = '';
                });
                
                // Add active state to clicked card
                card.style.borderColor = 'var(--pine-green)';
                card.style.boxShadow = '0 10px 30px rgba(1, 121, 111, 0.2)';
            });
        });
    }

    renderServices() {
        const grid = document.getElementById('servicesGrid');
        const filteredServices = this.getFilteredServices();
        
        if (filteredServices.length === 0) {
            document.getElementById('noServices').style.display = 'block';
            grid.innerHTML = '';
        } else {
            document.getElementById('noServices').style.display = 'none';
            grid.innerHTML = filteredServices.map(service => {
                const category = this.categories.find(cat => cat.id === service.category_id);
                return `
                <div class="service-card">
                    <h4>${service.name}</h4>
                    <p class="service-description">${service.description}</p>
                    
                    <div class="service-details">
                        <div class="service-detail">
                            <strong>Category</strong>
                            <span>${category?.name || 'General'}</span>
                        </div>
                        <div class="service-detail">
                            <strong>Duration</strong>
                            <span>${service.duration}</span>
                        </div>
                        ${service.preparation ? `
                        <div class="service-detail">
                            <strong>Preparation</strong>
                            <span>${service.preparation}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${service.requirements ? `
                        <div class="service-requirements">
                            <strong>Requirements:</strong> ${service.requirements}
                        </div>
                    ` : ''}
                    
                    <div class="service-price">
                        ${service.price === 0 ? 'Free Service' : `$${service.price.toFixed(2)}`}
                    </div>
                    
                    <div class="service-actions">
                        <button class="btn btn--primary btn--small" 
                                onclick="clinicServices.viewServiceDetails(${service.id})">
                            View Details
                        </button>
                        <button class="btn btn--outline btn--small" 
                                onclick="clinicBooker.prepareBooking(${service.id})">
                            Book Now
                        </button>
                    </div>
                </div>
            `}).join('');
        }

        this.updateServicesCount();
    }

    getFilteredServices() {
        if (this.currentCategory === 'all') {
            return this.services;
        }
        return this.services.filter(service => service.category_id == this.currentCategory);
    }

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.renderServices();
        
        // Update current category title
        const categoryTitle = document.getElementById('currentCategory');
        if (categoryId === 'all') {
            categoryTitle.textContent = 'All Clinic Services';
        } else {
            const category = this.categories.find(cat => cat.id == categoryId);
            categoryTitle.textContent = `${category.name} Services`;
        }

        // Update active state of category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.style.borderColor = '';
            card.style.boxShadow = '';
        });
    }

    viewServiceDetails(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        const modal = document.getElementById('serviceModal');
        const content = document.getElementById('serviceModalContent');
        const category = this.categories.find(cat => cat.id === service.category_id);

        content.innerHTML = `
            <h2>${service.name}</h2>
            <div class="service-modal-details">
                <p><strong>Service Category:</strong> ${category?.name || 'General Clinic Services'}</p>
                <p><strong>Description:</strong> ${service.description}</p>
                <p><strong>Estimated Duration:</strong> ${service.duration}</p>
                ${service.preparation ? `<p><strong>Preparation Required:</strong> ${service.preparation}</p>` : ''}
                ${service.requirements ? `<p><strong>Requirements:</strong> ${service.requirements}</p>` : ''}
                <p><strong>Service Fee:</strong> ${service.price === 0 ? 'Complimentary' : `$${service.price.toFixed(2)}`}</p>
            </div>
            <div class="modal-actions">
                <button class="btn btn--primary" onclick="clinicBooker.prepareBooking(${service.id})">
                    Book This Service
                </button>
                <button class="btn btn--outline" onclick="clinicServices.closeModal()">
                    Close Details
                </button>
            </div>
        `;

        modal.style.display = 'block';
    }

    updateServicesCount() {
        const count = this.getFilteredServices().length;
        document.getElementById('servicesCount').textContent = count;
    }

    closeModal() {
        document.getElementById('serviceModal').style.display = 'none';
    }

    setupEventListeners() {
        // Modal close events
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('serviceModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    showError(message) {
        FormHandler.showMessage(message, 'error');
    }
}

class ClinicBooker {
    constructor() {
        this.services = [];
    }

    setServices(services) {
        this.services = services;
    }

    prepareBooking(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        // Close service modal if open
        this.closeModals();

        // Populate service select
        const serviceSelect = document.getElementById('clinicService');
        serviceSelect.innerHTML = '<option value="">Select Service</option>' +
            this.services.map(s => 
                `<option value="${s.id}" ${s.id === serviceId ? 'selected' : ''}>${s.name} - ${s.price === 0 ? 'Free' : '$' + s.price.toFixed(2)}</option>`
            ).join('');

        this.showBookingForm();
    }

    showBookingForm() {
        const modal = document.getElementById('bookingModal');
        
        // Set minimum date to today
        const dateInput = document.getElementById('clinicDate');
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];

        modal.style.display = 'block';
    }

    hideBookingForm() {
        document.getElementById('bookingModal').style.display = 'none';
    }

    closeModals() {
        document.getElementById('serviceModal').style.display = 'none';
        document.getElementById('bookingModal').style.display = 'none';
    }

    setupEventListeners() {
        // Booking modal close
        document.querySelector('.close-booking-modal').addEventListener('click', () => {
            this.hideBookingForm();
        });

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('bookingModal');
            if (e.target === modal) {
                this.hideBookingForm();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideBookingForm();
            }
        });

        // Booking form submission
        const form = document.getElementById('clinicBookingForm');
        form.addEventListener('submit', (e) => this.handleBookingSubmit(e));

        // Form validation
        this.setupFormValidation();
    }

    setupFormValidation() {
        const phoneInput = document.getElementById('clinicPhone');
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
        });

        const dateInput = document.getElementById('clinicDate');
        dateInput.addEventListener('change', (e) => {
            const selectedDate = new Date(e.target.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                this.showFieldError(dateInput, 'Please select a future date');
                dateInput.value = '';
            }
        });
    }

    showFieldError(field, message) {
        field.style.borderColor = '#dc3545';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color: #dc3545; font-size: 0.875rem; margin-top: 0.25rem;';
        
        field.parentNode.appendChild(errorDiv);
    }

    async handleBookingSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const serviceId = formData.get('service_id');
        
        if (!serviceId) {
            FormHandler.showMessage('Please select a clinic service', 'error');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = FormHandler.showLoading(submitButton);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const selectedService = this.services.find(s => s.id == serviceId);
            
            // Prepare booking data
            const bookingData = {
                service_type: 'clinic',
                service_id: serviceId,
                service_name: selectedService.name,
                patient_name: formData.get('patient_name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                preferred_date: formData.get('preferred_date'),
                preferred_time: formData.get('preferred_time'),
                urgency: formData.get('urgency'),
                notes: formData.get('notes'),
                booked_at: new Date().toISOString()
            };

            // In real app: await fetch('/api/appointments', { method: 'POST', body: JSON.stringify(bookingData) })
            console.log('Clinic appointment booked:', bookingData);
            
            FormHandler.showMessage('Clinic appointment booked successfully! We will contact you within 24 hours to confirm.', 'success');
            form.reset();
            this.hideBookingForm();
            
        } catch (error) {
            console.error('Error booking clinic appointment:', error);
            FormHandler.showMessage('Failed to book appointment. Please try again or contact our clinic directly.', 'error');
        } finally {
            FormHandler.hideLoading(submitButton, originalText);
        }
    }
}

// Initialize clinic services and booker
let clinicServices;
let clinicBooker;

document.addEventListener('DOMContentLoaded', () => {
    clinicServices = new ClinicServices();
    clinicBooker = new ClinicBooker();
    
    // Set services for booker once loaded
    setTimeout(() => {
        clinicBooker.setServices(clinicServices.services);
        clinicBooker.setupEventListeners();
    }, 1000);
});

// Make available globally for onclick handlers
window.clinicServices = clinicServices;
window.clinicBooker = clinicBooker;