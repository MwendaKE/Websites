// Home page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('AmaniCare Homepage loaded');
    
    // Animate statistics when they come into view
    const animateStats = () => {
        const stats = document.querySelectorAll('.stat__number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const stat = entry.target;
                    const finalValue = stat.textContent;
                    const isPercentage = finalValue.includes('%');
                    const numericValue = parseInt(finalValue.replace(/[^0-9]/g, ''));
                    const duration = 2000;
                    const steps = 60;
                    const stepValue = numericValue / steps;
                    let currentStep = 0;
                    
                    stat.textContent = '0' + (isPercentage ? '%' : '');
                    
                    const timer = setInterval(() => {
                        currentStep++;
                        const currentValue = Math.min(Math.floor(stepValue * currentStep), numericValue);
                        stat.textContent = currentValue + (finalValue.includes('+') ? '+' : '') + (isPercentage ? '%' : '');
                        
                        if (currentStep >= steps) {
                            clearInterval(timer);
                            stat.textContent = finalValue;
                        }
                    }, duration / steps);
                    
                    observer.unobserve(stat);
                }
            });
        }, { 
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        });
        
        stats.forEach(stat => observer.observe(stat));
    };

    // Initialize animations
    animateStats();

    // Add intersection observer for fade-in animations
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    // Apply fade-in to service cards and feature items
    document.querySelectorAll('.service__card, .feature__item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        fadeInObserver.observe(el);
    });

    // Add smooth scroll to CTA buttons
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // Add hover effects to service cards
    const serviceCards = document.querySelectorAll('.service__card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });

    // Emergency button pulse animation
    const emergencyBtn = document.querySelector('.emergency__btn');
    if (emergencyBtn) {
        emergencyBtn.addEventListener('mouseenter', () => {
            emergencyBtn.style.animation = 'pulse 0.5s infinite';
        });
        
        emergencyBtn.addEventListener('mouseleave', () => {
            emergencyBtn.style.animation = 'pulse 2s infinite';
        });
    }

    // Add loading states to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.href && !this.href.startsWith('tel:') && !this.href.startsWith('mailto:')) {
                const originalText = this.textContent;
                this.innerHTML = '<div class="loading-spinner"></div> Loading...';
                
                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            }
        });
    });

    // Add scroll to top functionality
    const scrollToTop = document.createElement('button');
    scrollToTop.innerHTML = '↑';
    scrollToTop.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--pine-green);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 1.5rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        transition: all 0.3s ease;
        z-index: 1000;
        opacity: 0;
        transform: translateY(20px);
    `;
    
    document.body.appendChild(scrollToTop);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTop.style.opacity = '1';
            scrollToTop.style.transform = 'translateY(0)';
        } else {
            scrollToTop.style.opacity = '0';
            scrollToTop.style.transform = 'translateY(20px)';
        }
    });
    
    scrollToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// Export home page specific functions
window.homePage = {
    animateStats: () => {
        // Re-export the function if needed
    }
};

// Add loading spinner styles
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid #ffffff;
        border-radius: 50%;
        border-top-color: transparent;
        animation: spin 1s ease-in-out infinite;
        margin-right: 8px;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    /* Smooth transitions for all interactive elements */
    .service__card,
    .feature__item,
    .stat-item,
    .btn {
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
`;
document.head.appendChild(additionalStyles);