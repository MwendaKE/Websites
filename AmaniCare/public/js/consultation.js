class Consultation {
    constructor() {
        this.consultationTypes = [];
        this.staffMembers = [];
        this.init();
    }

    async init() {
        await this.loadConsultationTypes();
        await this.loadStaffMembers();
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupDateRestrictions();
    }

    async loadConsultationTypes() {
        try {
            // Enhanced consultation types data
            this.consultationTypes = [
                {
                    id: 1,
                    category_id: 7,
                    name: 'General Health Consultation',
                    description: 'Comprehensive health assessment and general medical advice for common health concerns, preventive care, and routine check-ups.',
                    duration_minutes: 30,
                    price: 50.00,
                    icon: '👨‍⚕️'
                },
                {
                    id: 2,
                    category_id: 7,
                    name: 'Follow-up Consultation',
                    description: 'Routine follow-up for ongoing medical conditions, medication reviews, and treatment progress monitoring.',
                    duration_minutes: 20,
                    price: 35.00,
                    icon: '📋'
                },
                {
                    id: 3,
                    category_id: 8,
                    name: 'Mental Health Assessment',
                    description: 'Professional mental health evaluation and counseling for anxiety, depression, stress management, and emotional well-being.',
                    duration_minutes: 60,
                    price: 80.00,
                    icon: '🧠'
                },
                {
                    id: 4,
                    category_id: 9,
                    name: 'Reproductive Health Consultation',
                    description: 'Specialized consultation for reproductive health issues, family planning, and women\'s health concerns.',
                    duration_minutes: 45,
                    price: 65.00,
                    icon: '❤️'
                },
                {
                    id: 5,
                    category_id: 7,
                    name: 'Pediatric Consultation',
                    description: 'Specialized medical care for children and adolescents, including growth monitoring and childhood illnesses.',
                    duration_minutes: 40,
                    price: 55.00,
                    icon: '👶'
                },
                {
                    id: 6,
                    category_id: 7,
                    name: 'Chronic Disease Management',
                    description: 'Comprehensive care plan for chronic conditions like diabetes, hypertension, and heart disease management.',
                    duration_minutes: 45,
                    price: 70.00,
                    icon: '🫀'
                }
            ];

            this.renderConsultationTypes();
            this.populateServiceTypes();
        } catch (error) {
            console.error('Error loading consultation types:', error);
            this.showError('Failed to load consultation services. Please try again.');
        }
    }

    async loadStaffMembers() {
        try {
            // Enhanced staff data
            this.staffMembers = [
                {
                    id: 1,
                    full_name: 'Dr. Sarah Johnson',
                    role: 'General Practitioner',
                    specialization: 'Primary Care, Family Medicine, Preventive Health',
                    phone: '+255 123 456 789',
                    email: 's.johnson@amanicare.co.tz',
                    bio: 'Experienced general practitioner with over 12 years in primary healthcare. Specializes in preventive medicine and chronic disease management.',
                    experience: '12 years',
                    qualifications: 'MD, MBBS, Diploma in Family Medicine'
                },
                {
                    id: 2,
                    full_name: 'Dr. Michael Chen',
                    role: 'Psychiatrist',
                    specialization: 'Mental Health, Anxiety Disorders, Depression',
                    phone: '+255 123 456 790',
                    email: 'm.chen@amanicare.co.tz',
                    bio: 'Board-certified psychiatrist with 8 years of experience. Specializes in cognitive behavioral therapy and medication management.',
                    experience: '8 years',
                    qualifications: 'MD, Psychiatry Board Certified'
                },
                {
                    id: 3,
                    full_name: 'Dr. Amina Bello',
                    role: 'Gynecologist',
                    specialization: 'Reproductive Health, Women\'s Health, Family Planning',
                    phone: '+255 123 456 791',
                    email: 'a.bello@amanicare.co.tz',
                    bio: 'Specialist in women\'s health and reproductive medicine with 10 years of clinical experience.',
                    experience: '10 years',
                    qualifications: 'MD, OB-GYN Specialist'
                },
                {
                    id: 4,
                    full_name: 'Dr. James Wilson',
                    role: 'Pediatrician',
                    specialization: 'Child Health, Adolescent Medicine, Vaccinations',
                    phone: '+255 123 456 792',
                    email: 'j.wilson@amanicare.co.tz',
                    bio: 'Pediatric specialist focused on child development, preventive care, and childhood illness management.',
                    experience: '6 years',
                    qualifications: 'MD, Pediatrics Board Certified'
                },
                {
                    id: 5,
                    full_name: 'Nurse Maria Rodriguez',
                    role: 'Registered Nurse',
                    specialization: 'Primary Care, Patient Education, Emergency Response',
                    phone: '+255 123 456 793',
                    email: 'm.rodriguez@amanicare.co.tz',
                    bio: 'Registered nurse with extensive experience in patient care, health education, and emergency medical response.',
                    experience: '7 years',
                    qualifications: 'RN, BSN, Emergency Nursing Certified'
                },
                {
                    id: 6,
                    full_name: 'Dr. Robert Kim',
                    role: 'Internal Medicine Specialist',
                    specialization: 'Chronic Diseases, Diabetes, Hypertension',
                    phone: '+255 123 456 794',
                    email: 'r.kim@amanicare.co.tz',
                    bio: 'Internal medicine specialist focusing on comprehensive care for adults with complex medical conditions.',
                    experience: '9 years',
                    qualifications: 'MD, Internal Medicine Board Certified'
                }
            ];

            this.renderStaffMembers();
            this.populateDoctors();
        } catch (error) {
            console.error('Error loading staff members:', error);
            this.showError('Failed to load medical staff information. Please try again.');
        }
    }

    renderConsultationTypes() {
        const grid = document.getElementById('typesGrid');
        
        grid.innerHTML = this.consultationTypes.map(type => `
            <div class="type-card">
                <div class="type-icon">${type.icon}</div>
                <h3>${type.name}</h3>
                <p>${type.description}</p>
                <div class="type-duration">${type.duration_minutes} minutes</div>
                <div class="type-price">$${type.price.toFixed(2)}</div>
                <button class="btn btn--primary" onclick="consultation.selectService(${type.id})">
                    Book This Service
                </button>
            </div>
        `).join('');
    }

    renderStaffMembers() {
        const grid = document.getElementById('staffGrid');
        
        grid.innerHTML = this.staffMembers.map(staff => {
            const initials = staff.full_name.split(' ').map(n => n[0]).join('');
            return `
            <div class="staff-card">
                <div class="staff-photo">${initials}</div>
                <h3>${staff.full_name}</h3>
                <div class="staff-role">${staff.role}</div>
                <div class="staff-specialization">${staff.specialization}</div>
                <p class="staff-bio">${staff.bio}</p>
                <div class="staff-contact">
                    <strong>Contact Information</strong>
                    📞 ${staff.phone}<br>
                    ✉️ ${staff.email}
                </div>
            </div>
        `}).join('');
    }

    populateServiceTypes() {
        const select = document.getElementById('serviceType');
        select.innerHTML = '<option value="">Select Consultation Service</option>' +
            this.consultationTypes.map(type => 
                `<option value="${type.id}" data-price="${type.price}">${type.name} - $${type.price.toFixed(2)}</option>`
            ).join('');
    }

    populateDoctors() {
        const select = document.getElementById('preferredDoctor');
        const doctors = this.staffMembers.filter(staff => staff.role.includes('Dr.') || staff.role.includes('Doctor'));
        
        select.innerHTML = '<option value="">Any Available Doctor</option>' +
            doctors.map(doctor => 
                `<option value="${doctor.id}">${doctor.full_name} - ${doctor.specialization.split(',')[0]}</option>`
            ).join('');
    }

    selectService(serviceId) {
        const select = document.getElementById('serviceType');
        select.value = serviceId;
        
        // Highlight the selected service
        document.querySelectorAll('.type-card').forEach(card => {
            card.style.borderColor = '';
        });
        
        const selectedCard = document.querySelector(`.type-card button[onclick="consultation.selectService(${serviceId})"]`).closest('.type-card');
        selectedCard.style.borderColor = 'var(--pine-green)';
        selectedCard.style.boxShadow = '0 10px 30px rgba(1, 121, 111, 0.2)';
        
        // Scroll to booking form with smooth animation
        document.querySelector('.booking-section').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        FormHandler.showMessage('Service selected! Please complete the booking form below.', 'success');
    }

    setupEventListeners() {
        const form = document.getElementById('appointmentForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Real-time form validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Service type change event
        document.getElementById('serviceType').addEventListener('change', (e) => {
            this.updateSelectedService(e.target.value);
        });
    }

    setupFormValidation() {
        // Add custom validation patterns
        const phoneInput = document.getElementById('phone');
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
        });
    }

    setupDateRestrictions() {
        const dateInput = document.getElementById('preferredDate');
        const today = new Date();
        const maxDate = new Date();
        maxDate.setMonth(today.getMonth() + 3); // 3 months in advance
        
        dateInput.min = today.toISOString().split('T')[0];
        dateInput.max = maxDate.toISOString().split('T')[0];
        
        // Disable weekends
        dateInput.addEventListener('change', (e) => {
            const selectedDate = new Date(e.target.value);
            const day = selectedDate.getDay();
            
            if (day === 0 || day === 6) { // Sunday or Saturday
                this.showFieldError(dateInput, 'Please select a weekday (Monday-Friday)');
                dateInput.value = '';
            }
        });
    }

    updateSelectedService(serviceId) {
        // Update visual selection
        document.querySelectorAll('.type-card').forEach(card => {
            card.style.borderColor = '';
            card.style.boxShadow = '';
        });
        
        if (serviceId) {
            const selectedCard = document.querySelector(`.type-card button[onclick="consultation.selectService(${serviceId})"]`)?.closest('.type-card');
            if (selectedCard) {
                selectedCard.style.borderColor = 'var(--pine-green)';
                selectedCard.style.boxShadow = '0 10px 30px rgba(1, 121, 111, 0.2)';
            }
        }
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

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(field, 'Please enter a valid email address');
                return false;
            }
        }

        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                this.showFieldError(field, 'Please enter a valid phone number');
                return false;
            }
        }

        return true;
    }

    showFieldError(field, message) {
        field.style.borderColor = '#dc3545';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        
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

        if (!isValid) {
            FormHandler.showMessage('Please fix the errors in the form before submitting.', 'error');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        FormHandler.showLoading(submitButton);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Prepare appointment data
            const appointmentData = {
                service_type: formData.get('service_type'),
                preferred_doctor: formData.get('preferred_doctor'),
                patient_name: formData.get('patient_name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                preferred_date: formData.get('preferred_date'),
                preferred_time: formData.get('preferred_time'),
                urgency: formData.get('urgency'),
                notes: formData.get('notes'),
                booked_at: new Date().toISOString()
            };

            // In real app: await fetch('/api/appointments', { method: 'POST', body: JSON.stringify(appointmentData) })
            console.log('Appointment booked:', appointmentData);
            
            FormHandler.showMessage('Appointment booked successfully! We will contact you within 24 hours to confirm.', 'success');
            form.reset();
            
            // Reset visual selections
            document.querySelectorAll('.type-card').forEach(card => {
                card.style.borderColor = '';
                card.style.boxShadow = '';
            });
            
        } catch (error) {
            console.error('Error booking appointment:', error);
            FormHandler.showMessage('Failed to book appointment. Please try again or contact us directly.', 'error');
        } finally {
            FormHandler.hideLoading(submitButton);
        }
    }

    showError(message) {
        FormHandler.showMessage(message, 'error');
    }
}

// Initialize consultation when page loads
let consultation;
document.addEventListener('DOMContentLoaded', () => {
    consultation = new Consultation();
});

// Make consultation available globally for onclick handlers
window.consultation = consultation;