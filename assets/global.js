// Global functionality
class Global {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupGlobalFeatures();
  }

  bindEvents() {
    // Global click events
    document.addEventListener('click', (event) => {
      // Handle modal close buttons
      if (event.target.matches('[data-modal-close]')) {
        this.closeModal(event.target);
      }
      
      // Handle overlay clicks to close modals
      if (event.target.matches('[data-modal-overlay]')) {
        this.closeModal(event.target);
      }
      
      // Handle dropdown toggles
      if (event.target.matches('[data-dropdown-toggle]')) {
        this.toggleDropdown(event.target);
      }
      
      // Handle tooltip toggles
      if (event.target.matches('[data-tooltip-toggle]')) {
        this.toggleTooltip(event.target);
      }
    });

    // Global keyboard events
    document.addEventListener('keydown', (event) => {
      // Close modals with Escape key
      if (event.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // Global scroll events
    window.addEventListener('scroll', () => {
      this.handleScroll();
    });

    // Global resize events
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  setupGlobalFeatures() {
    // Initialize tooltips
    this.initTooltips();
    
    // Initialize lazy loading
    this.initLazyLoading();
    
    // Initialize smooth scrolling
    this.initSmoothScrolling();
    
    // Initialize back to top button
    this.initBackToTop();
  }

  closeModal(trigger) {
    const modal = trigger.closest('[data-modal]') || document.querySelector('[data-modal].active');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  closeAllModals() {
    const modals = document.querySelectorAll('[data-modal].active');
    modals.forEach(modal => {
      modal.classList.remove('active');
    });
    document.body.style.overflow = '';
  }

  toggleDropdown(trigger) {
    const dropdown = trigger.nextElementSibling;
    if (dropdown && dropdown.matches('[data-dropdown]')) {
      dropdown.classList.toggle('active');
      
      // Close other dropdowns
      const otherDropdowns = document.querySelectorAll('[data-dropdown].active');
      otherDropdowns.forEach(other => {
        if (other !== dropdown) {
          other.classList.remove('active');
        }
      });
    }
  }

  toggleTooltip(trigger) {
    const tooltip = trigger.querySelector('[data-tooltip]');
    if (tooltip) {
      tooltip.classList.toggle('active');
    }
  }

  initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        element.classList.add('active');
      });
      
      element.addEventListener('mouseleave', () => {
        element.classList.remove('active');
      });
    });
  }

  initLazyLoading() {
    if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('[data-lazy]');
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }

  initSmoothScrolling() {
    const smoothScrollLinks = document.querySelectorAll('[data-smooth-scroll]');
    smoothScrollLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  initBackToTop() {
    const backToTopButton = document.querySelector('[data-back-to-top]');
    if (backToTopButton) {
      backToTopButton.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  handleScroll() {
    const backToTopButton = document.querySelector('[data-back-to-top]');
    if (backToTopButton) {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    }
    
    // Handle sticky headers
    const stickyHeader = document.querySelector('[data-sticky-header]');
    if (stickyHeader) {
      if (window.pageYOffset > 100) {
        stickyHeader.classList.add('sticky');
      } else {
        stickyHeader.classList.remove('sticky');
      }
    }
  }

  handleResize() {
    // Close dropdowns on mobile when screen size changes
    if (window.innerWidth > 768) {
      const mobileDropdowns = document.querySelectorAll('[data-dropdown].active');
      mobileDropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
      });
    }
  }

  showMessage(message, type = 'info', duration = 3000) {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `global-message global-message--${type}`;
    messageElement.textContent = message;
    
    // Add styles
    messageElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
      word-wrap: break-word;
    `;
    
    if (type === 'success') {
      messageElement.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
      messageElement.style.backgroundColor = '#dc3545';
    } else if (type === 'warning') {
      messageElement.style.backgroundColor = '#ffc107';
      messageElement.style.color = '#000';
    } else {
      messageElement.style.backgroundColor = '#17a2b8';
    }
    
    // Add to page
    document.body.appendChild(messageElement);
    
    // Remove after specified duration
    setTimeout(() => {
      messageElement.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.parentNode.removeChild(messageElement);
        }
      }, 300);
    }, duration);
  }

  // Utility function to format currency
  formatMoney(cents, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(cents / 100);
  }

  // Utility function to debounce
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Utility function to throttle
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Initialize global when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new Global();
  });
} else {
  new Global();
} 