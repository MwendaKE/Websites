class HeroCarousel {
    constructor() {
        this.carousel = document.querySelector('.hero-carousel');
        if (!this.carousel) return;

        this.track = this.carousel.querySelector('.carousel-track');
        this.slides = this.carousel.querySelectorAll('.carousel-slide');
        this.dots = this.carousel.querySelectorAll('.carousel-dot');
        this.prevBtn = this.carousel.querySelector('.carousel-arrow--prev');
        this.nextBtn = this.carousel.querySelector('.carousel-arrow--next');
        this.progressBar = this.carousel.querySelector('.carousel-progress-bar');
        
        this.currentIndex = 0;
        this.slideCount = this.slides.length;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 6000; // 6 seconds
        this.isTransitioning = false;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        this.init();
    }

    init() {
        // Initialize first slide
        this.updateSlidePosition();
        this.updateNavigation();
        
        // Event listeners for navigation
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }
        
        // Dot navigation
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });

        // Touch/swipe support
        this.setupTouchEvents();

        // Progress bar animation
        this.setupProgressBar();

        // Start autoplay
        this.startAutoPlay();

        // Pause autoplay on hover
        this.carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.carousel.addEventListener('mouseleave', () => this.startAutoPlay());

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoPlay();
            } else {
                this.startAutoPlay();
            }
        });
    }

    goToSlide(index) {
        if (this.isTransitioning || index === this.currentIndex) return;
        
        this.isTransitioning = true;
        this.currentIndex = index;
        
        this.updateSlidePosition();
        this.updateNavigation();
        this.resetAutoPlay();
        
        // Reset transitioning flag after animation
        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }

    nextSlide() {
        if (this.isTransitioning) return;
        this.goToSlide((this.currentIndex + 1) % this.slideCount);
    }

    prevSlide() {
        if (this.isTransitioning) return;
        this.goToSlide((this.currentIndex - 1 + this.slideCount) % this.slideCount);
    }

    updateSlidePosition() {
        if (this.track) {
            this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        }
    }

    updateNavigation() {
        // Update dots
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });

        // Update ARIA labels for accessibility
        this.slides.forEach((slide, index) => {
            slide.setAttribute('aria-hidden', index !== this.currentIndex);
            slide.setAttribute('tabindex', index === this.currentIndex ? '0' : '-1');
        });

        // Update buttons aria-labels
        if (this.prevBtn) {
            this.prevBtn.setAttribute('aria-label', `Previous slide ${this.currentIndex + 1} of ${this.slideCount}`);
        }
        if (this.nextBtn) {
            this.nextBtn.setAttribute('aria-label', `Next slide ${this.currentIndex + 1} of ${this.slideCount}`);
        }
    }

    setupTouchEvents() {
        this.carousel.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.stopAutoPlay();
        });

        this.carousel.addEventListener('touchmove', (e) => {
            this.touchEndX = e.touches[0].clientX;
        });

        this.carousel.addEventListener('touchend', () => {
            const diff = this.touchStartX - this.touchEndX;
            const swipeThreshold = 50;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
            this.startAutoPlay();
        });
    }

    setupProgressBar() {
        if (!this.progressBar) return;
        
        this.progressBar.style.width = '0%';
        
        // Reset progress bar on slide change
        this.carousel.addEventListener('slideChange', () => {
            this.progressBar.style.width = '0%';
            this.progressBar.style.transition = 'width 0.1s linear';
        });
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
        
        // Start progress bar animation
        if (this.progressBar) {
            setTimeout(() => {
                this.progressBar.style.width = '100%';
                this.progressBar.style.transition = `width ${this.autoPlayDelay}ms linear`;
            }, 100);
        }
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        
        // Reset progress bar
        if (this.progressBar) {
            this.progressBar.style.width = '0%';
            this.progressBar.style.transition = 'width 0.1s linear';
        }
    }

    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
        
        // Dispatch custom event for slide change
        const event = new CustomEvent('slideChange', { 
            detail: { currentIndex: this.currentIndex }
        });
        this.carousel.dispatchEvent(event);
    }

    // Public methods
    destroy() {
        this.stopAutoPlay();
        
        // Remove event listeners
        if (this.prevBtn) this.prevBtn.removeEventListener('click', () => this.prevSlide());
        if (this.nextBtn) this.nextBtn.removeEventListener('click', () => this.nextSlide());
        
        this.dots.forEach(dot => {
            dot.removeEventListener('click', () => {});
        });
        
        document.removeEventListener('keydown', () => {});
        document.removeEventListener('visibilitychange', () => {});
    }

    // Go to specific slide
    goTo(index) {
        if (index >= 0 && index < this.slideCount) {
            this.goToSlide(index);
        }
    }

    // Get current slide index
    getCurrentSlide() {
        return this.currentIndex;
    }

    // Get total slides count
    getSlideCount() {
        return this.slideCount;
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.heroCarousel = new HeroCarousel();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeroCarousel;
}