// Umino Theme - Optimized JavaScript Bundle

// Utility functions
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const throttle = (func, limit) => {
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
};

// Mobile menu functionality
class MobileMenu {
  constructor() {
    this.mobileBtn = document.querySelector('.mobile-menu-icon');
    this.headerMenu = document.querySelector('.header-menu');
    this.closeBtn = document.querySelector('.close-btn');
    this.overlay = document.querySelector('.overlay');

    if (!this.mobileBtn || !this.headerMenu || !this.closeBtn || !this.overlay) return;

    this.init();
  }

  init() {
    this.mobileBtn.addEventListener('click', () => this.openMenu());
    this.closeBtn.addEventListener('click', () => this.closeMenu());
    this.overlay.addEventListener('click', () => this.closeMenu());

    this.initMenuItems();
    this.initSubmenus();
  }

  openMenu() {
    this.headerMenu.classList.add('active');
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeMenu() {
    this.headerMenu.classList.remove('active');
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';

    const activeSubmenus = document.querySelectorAll('.header-menu-sublist.active');
    const activeMenuItems = document.querySelectorAll('.header-menu-item.active');

    activeSubmenus.forEach(submenu => submenu.classList.remove('active'));
    activeMenuItems.forEach(item => item.classList.remove('active'));
  }

  initMenuItems() {
    const menuItems = document.querySelectorAll('.menu-items-list li a');
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeMenu();
      });
    });
  }

  initSubmenus() {
    const menuItemsWithSubmenu = document.querySelectorAll('.header-menu-item:has(.header-menu-sublist)');
    menuItemsWithSubmenu.forEach(menuItem => {
      menuItem.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const submenu = menuItem.querySelector('.header-menu-sublist');
        if (!submenu) return;

        this.closeOtherSubmenus(submenu, menuItem);
        submenu.classList.toggle('active');
        menuItem.classList.toggle('active');
      });
    });
  }

  closeOtherSubmenus(currentSubmenu, currentMenuItem) {
    const otherSubmenus = document.querySelectorAll('.header-menu-sublist.active');
    const otherMenuItems = document.querySelectorAll('.header-menu-item.active');

    otherSubmenus.forEach(submenu => {
      if (submenu !== currentSubmenu) {
        submenu.classList.remove('active');
      }
    });

    otherMenuItems.forEach(item => {
      if (item !== currentMenuItem) {
        item.classList.remove('active');
      }
    });
  }
}

// Hero slider functionality
class HeroSlider {
  constructor() {
    this.sliderWrapper = document.querySelector('.slider-wrapper');
    this.slides = document.querySelectorAll('.slide');
    this.prevBtn = document.querySelector('.slider-prev');
    this.nextBtn = document.querySelector('.slider-next');
    this.dots = document.querySelectorAll('.slider-dot');

    if (!this.sliderWrapper || this.slides.length <= 1) return;

    this.currentSlide = 0;
    this.autoplayInterval = null;
    this.autoplayDelay = 5000;
    this.startX = 0;
    this.startY = 0;
    this.isDragging = false;
    this.dragThreshold = 50;

    this.init();
    this.initThemeEditorListener();
  }

  init() {
    this.initButtons();
    this.initDots();
    this.initTouchEvents();
    this.initMouseEvents();
    this.goToSlide(0);
    this.startAutoplay();
    if (this.dots.length > 0) {
      this.dots[0].classList.add('active');
    }
    this.triggerFadeInForActiveSlide();
  }

  initThemeEditorListener() {
    if (typeof window.Shopify !== 'undefined' && window.Shopify.designMode) {
      document.addEventListener('shopify:block:select', (event) => {
        if (event.target.closest('.slider-section')) {
          this.stopAutoplay();
        }
      });

      document.addEventListener('shopify:block:deselect', (event) => {
        if (event.target.closest('.slider-section')) {
          this.startAutoplay();
        }
      });
    }
  }

  destroy() {
    this.stopAutoplay();
    if (this.prevBtn) {
      this.prevBtn.removeEventListener('click', this.prevSlideHandler);
    }
    if (this.nextBtn) {
      this.nextBtn.removeEventListener('click', this.nextSlideHandler);
    }
    this.dots.forEach(dot => {
      if (this.dotClickHandler) {
        dot.removeEventListener('click', this.dotClickHandler);
      }
    });
  }

  goToSlide(index) {
    if (index === this.currentSlide) return;

    this.slides[this.currentSlide].style.opacity = '0';
    this.slides[this.currentSlide].style.transition = 'opacity 0.5s ease';
    this.slides[this.currentSlide].style.zIndex = '1';

    this.currentSlide = index;

    this.slides[this.currentSlide].style.opacity = '1';
    this.slides[this.currentSlide].style.transition = 'opacity 0.5s ease';
    this.slides[this.currentSlide].style.zIndex = '2';

    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentSlide);
    });
    this.triggerFadeInForActiveSlide();
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.updateSlide();
    this.triggerFadeInForActiveSlide();
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.updateSlide();
    this.triggerFadeInForActiveSlide();
  }

  updateSlide() {
    this.slides.forEach((slide, index) => {
      if (index === this.currentSlide) {
        slide.style.opacity = '1';
        slide.style.zIndex = '2';
      } else {
        slide.style.opacity = '0';
        slide.style.zIndex = '1';
      }
    });

    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentSlide);
    });
  }

  startAutoplay() {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoplayDelay);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  resetAutoplay() {
    this.startAutoplay();
  }

  initButtons() {
    if (this.prevBtn) {
      this.prevSlideHandler = () => {
        this.prevSlide();
        this.resetAutoplay();
      };
      this.prevBtn.addEventListener('click', this.prevSlideHandler);
    }
    if (this.nextBtn) {
      this.nextSlideHandler = () => {
        this.nextSlide();
        this.resetAutoplay();
      };
      this.nextBtn.addEventListener('click', this.nextSlideHandler);
    }
  }

  initDots() {
    this.dots.forEach((dot, index) => {
      this.dotClickHandler = () => {
        if (index !== this.currentSlide) {
          this.goToSlide(index);
          this.resetAutoplay();
        }
      };
      dot.addEventListener('click', this.dotClickHandler);
    });
  }

  initTouchEvents() {
    this.sliderWrapper.addEventListener('touchstart', (e) => {
      if (window.innerWidth > 768) return;
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
      this.isDragging = true;
    });

    this.sliderWrapper.addEventListener('touchmove', (e) => {
      if (!this.isDragging || window.innerWidth > 768) return;
      const diffX = e.touches[0].clientX - this.startX;
      const diffY = e.touches[0].clientY - this.startY;
      if (Math.abs(diffY) > Math.abs(diffX)) this.isDragging = false;
    });

    this.sliderWrapper.addEventListener('touchend', (e) => {
      if (!this.isDragging || window.innerWidth > 768) return;
      const endX = e.changedTouches[0].clientX;
      const diff = endX - this.startX;
      if (diff > this.dragThreshold) {
        this.prevSlide();
        this.resetAutoplay();
      } else if (diff < -this.dragThreshold) {
        this.nextSlide();
        this.resetAutoplay();
      }
      this.isDragging = false;
    });
  }

  initMouseEvents() {
    this.sliderWrapper.addEventListener('mouseenter', () => this.stopAutoplay());
    this.sliderWrapper.addEventListener('mouseleave', () => this.startAutoplay());
  }

  triggerFadeInForActiveSlide() {
    const allContents = document.querySelectorAll('.slide-content');
    allContents.forEach(content => content.classList.remove('fade-in-active'));

    const activeSlide = this.slides[this.currentSlide];
    if (activeSlide) {
      const content = activeSlide.querySelector('.slide-content');
      if (content) {
        setTimeout(() => {
          content.classList.add('fade-in-active');
        }, 10);
      }
    }
  }
}

// Footer accordion for mobile
class FooterAccordion {
  constructor() {
    this.collapsibles = document.querySelectorAll('.footer-category-wrapper');
    this.contents = document.querySelectorAll('.footer-content');
    this.isMobile = () => window.matchMedia('(max-width: 768px)').matches;
    
    if (this.collapsibles.length > 0) {
      this.init();
    }
  }

  init() {
    this.collapsibles.forEach(collapsible => {
      collapsible.addEventListener('click', (e) => {
        if (!this.isMobile()) return;
        e.stopPropagation();

        const content = collapsible.closest('.footer-category-wrapper').nextElementSibling;
        if (!content || !content.classList.contains('footer-content')) return;

        const isOpen = collapsible.classList.contains('active');
        this.closeAll();

        if (!isOpen) {
          collapsible.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
          this.updateIcon(collapsible, true);
        }
      });
    });

    this.contents.forEach(content => {
      content.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });

    document.addEventListener('click', () => {
      if (!this.isMobile()) return;
      this.closeAll();
    });

    window.addEventListener('resize', debounce(() => {
      if (!this.isMobile()) {
        this.contents.forEach(content => {
          content.style.maxHeight = null;
        });
        this.collapsibles.forEach(collapsible => {
          collapsible.classList.remove('active');
          this.updateIcon(collapsible, false);
        });
      }
    }, 250));
  }

  closeAll() {
    this.collapsibles.forEach(collapsible => {
      collapsible.classList.remove('active');
      this.updateIcon(collapsible, false);
    });
    this.contents.forEach(content => content.style.maxHeight = null);
  }

  updateIcon(collapsible, isOpen) {
    const wrapper = collapsible.closest('.footer-category-wrapper');
    if (!wrapper) return;

    const openIcon = wrapper.querySelector('.footer-icon-open');
    const closeIcon = wrapper.querySelector('.footer-icon-close');

    if (window.innerWidth <= 768) {
      if (openIcon && closeIcon) {
        if (isOpen) {
          openIcon.style.display = 'none';
          openIcon.style.rotate = '90deg';
          openIcon.style.opacity = '0';
          openIcon.style.transition = `all ${getComputedStyle(document.documentElement).getPropertyValue('--bs-transition-base')}`;
          closeIcon.style.display = 'flex';
          closeIcon.style.transition = `all ${getComputedStyle(document.documentElement).getPropertyValue('--bs-transition-base')}`;
          closeIcon.style.opacity = '1';
        } else {
          openIcon.style.display = 'flex';
          closeIcon.style.display = 'none';
          closeIcon.style.rotate = '0deg';
          closeIcon.style.transition = `all ${getComputedStyle(document.documentElement).getPropertyValue('--bs-transition-base')}`;
          closeIcon.style.opacity = '0';
          openIcon.style.rotate = '90deg';
          openIcon.style.transition = `all ${getComputedStyle(document.documentElement).getPropertyValue('--bs-transition-base')}`;
          openIcon.style.opacity = '1';
        }
      }
    } else {
      openIcon.style.display = 'none';
      closeIcon.style.display = 'none';
    }
  }
}

// New Arrivals carousel
class NewArrivals {
  constructor() {
    this.slider = document.querySelector('.new-arrivals-slider');
    this.items = document.querySelectorAll('.new-arrivals-item');
    this.prevBtn = document.querySelector('.carousel-prev');
    this.nextBtn = document.querySelector('.carousel-next');

    if (!this.slider || this.items.length === 0) return;

    this.currentIndex = 0;
    this.itemsPerView = this.getItemsPerView();
    this.autoplayInterval = null;
    this.autoplayTimeout = null;
    this.AUTOPLAY_DELAY = 3000;
    this.AUTOPLAY_RESUME_DELAY = 4000;

    this.init();
  }

  getItemsPerView() {
    if (window.innerWidth <= 767) return 2;
    if (window.innerWidth <= 992) return 3;
    return this.items.length;
  }

  getMaxIndex() {
    let maxIndex = this.items.length - this.itemsPerView;
    if (maxIndex < 0) maxIndex = 0;
    return maxIndex;
  }

  updateSlider() {
    this.itemsPerView = this.getItemsPerView();
    const itemWidth = this.items[0].offsetWidth;
    this.currentIndex = Math.min(this.currentIndex, this.getMaxIndex());
    let translateX = this.currentIndex * itemWidth;

    if (this.currentIndex === this.getMaxIndex() && this.items.length > this.itemsPerView) {
      const totalItemsWidth = this.items.length * itemWidth;
      const sliderWidth = this.slider.offsetWidth;
      translateX = totalItemsWidth - sliderWidth;
      if (translateX < 0) translateX = 0;
    }
    this.slider.style.transform = `translateX(-${translateX}px)`;
  }

  showNext() {
    this.currentIndex = Math.min(this.currentIndex + 1, this.getMaxIndex());
    this.updateSlider();
  }

  showPrev() {
    this.currentIndex = Math.max(this.currentIndex - 1, 0);
    this.updateSlider();
  }

  initButtons() {
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.showNext();
        this.pauseAutoplay();
      });
    }
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.showPrev();
        this.pauseAutoplay();
      });
    }
  }

  initTouchEvents() {
    let startX = 0;
    let isDragging = false;

    this.slider.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].pageX;
      this.pauseAutoplay();
    });

    this.slider.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const x = e.touches[0].pageX;
      const walk = x - startX;
      if (Math.abs(walk) > 50) {
        if (walk < 0) this.showNext();
        else this.showPrev();
        isDragging = false;
      }
    });

    this.slider.addEventListener('touchend', () => {
      isDragging = false;
      this.resumeAutoplayWithDelay();
    });
  }

  autoplay() {
    if (window.innerWidth > 992) return;
    this.autoplayInterval = setInterval(() => {
      if (this.currentIndex < this.getMaxIndex()) {
        this.currentIndex++;
      } else {
        this.currentIndex = 0;
      }
      this.updateSlider();
    }, this.AUTOPLAY_DELAY);
  }

  pauseAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
    if (this.autoplayTimeout) {
      clearTimeout(this.autoplayTimeout);
      this.autoplayTimeout = null;
    }
  }

  resumeAutoplayWithDelay() {
    this.pauseAutoplay();
    this.autoplayTimeout = setTimeout(() => {
      this.autoplay();
    }, this.AUTOPLAY_RESUME_DELAY);
  }

  initMouseEvents() {
    this.slider.addEventListener('mouseenter', () => this.pauseAutoplay());
    this.slider.addEventListener('mouseleave', () => this.resumeAutoplayWithDelay());
  }

  initResizeHandler() {
    window.addEventListener('resize', debounce(() => {
      this.currentIndex = 0;
      this.updateSlider();
    }, 250));
  }

  init() {
    this.initButtons();
    this.initTouchEvents();
    this.initMouseEvents();
    this.initResizeHandler();
    this.updateSlider();

    if (window.innerWidth <= 992) {
      this.autoplay();
    }
  }
}

// Color Swatch functionality
class ColorSwatch {
  constructor() {
    this.colorSwatchWrappers = document.querySelectorAll('.color-swatch-wrapper');
    if (this.colorSwatchWrappers.length === 0) return;

    this.init();
  }

  init() {
    this.colorSwatchWrappers.forEach(wrapper => {
      const colorSwatch = wrapper.querySelector('.color-swatch');
      if (!colorSwatch) return;

      colorSwatch.addEventListener('click', (e) => this.handleColorClick(e, wrapper));
    });
  }

  handleColorClick(e, wrapper) {
    e.preventDefault();

    const productItem = wrapper.closest('.new-arrivals-item');
    if (!productItem) return;

    this.updateSelectedState(productItem, wrapper);
    this.updateProductImage(wrapper, productItem);
  }

  updateSelectedState(productItem, selectedWrapper) {
    const allSwatchesInProduct = productItem.querySelectorAll('.color-swatch-wrapper');
    allSwatchesInProduct.forEach(swatch => swatch.classList.remove('selected'));
    selectedWrapper.classList.add('selected');
  }

  updateProductImage(wrapper, productItem) {
    const colorSwatch = wrapper.querySelector('.color-swatch');
    const productImage = productItem.querySelector('.product-image');

    if (!colorSwatch || !productImage) return;

    const newImageUrl = colorSwatch.getAttribute('data-image');
    if (!newImageUrl) return;

    productImage.src = newImageUrl;

    const dataAttributes = ['data-black', 'data-red', 'data-white'];
    dataAttributes.forEach(attr => {
      productImage.setAttribute(attr, newImageUrl);
    });
  }
}

// Newsletter form functionality
class NewsletterForm {
  constructor() {
    this.init();
  }

  init() {
    const form = document.querySelector('.footer-newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit(form);
    });
  }

  async handleSubmit(form) {
    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (!emailInput || !submitBtn) return;

    const email = emailInput.value.trim();
    
    if (!email) {
      this.showMessage('Please enter a valid email address', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Subscribing...';

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.showMessage('Thank you for subscribing!', 'success');
      emailInput.value = '';
    } catch (error) {
      this.showMessage('Error subscribing. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Subscribe';
    }
  }

  showMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `newsletter-message newsletter-message--${type}`;
    messageElement.textContent = message;
    
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
    `;
    
    if (type === 'success') {
      messageElement.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
      messageElement.style.backgroundColor = '#dc3545';
    } else {
      messageElement.style.backgroundColor = '#17a2b8';
    }
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
      messageElement.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.parentNode.removeChild(messageElement);
        }
      }, 300);
    }, 3000);
  }
}

// Localization form functionality
class LocalizationForm {
  constructor() {
    this.init();
  }

  init() {
    const forms = document.querySelectorAll('.localization-form');
    
    forms.forEach(form => {
      const select = form.querySelector('select');
      if (select) {
        select.addEventListener('change', () => {
          form.submit();
        });
      }
    });
  }
}

// Scroll animations
class ScrollAnimations {
  constructor() {
    this.fadeEls = document.querySelectorAll('.fade-in-left');
    this.init();
  }

  init() {
    this.revealOnScroll();
    
    setTimeout(() => {
      document.body.classList.add('visible');
      this.revealOnScroll();
    }, 100);

    window.addEventListener('scroll', throttle(() => this.revealOnScroll(), 16));
  }

  revealOnScroll() {
    for (const el of this.fadeEls) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 40) {
        el.classList.add('visible');
      }
    }
  }
}

// Theme initialization
class ThemeManager {
  constructor() {
    this.components = [];
    this.init();
  }

  init() {
    // Initialize all components
    this.components.push(new MobileMenu());
    this.components.push(new HeroSlider());
    this.components.push(new FooterAccordion());
    this.components.push(new NewArrivals());
    this.components.push(new ColorSwatch());
    this.components.push(new NewsletterForm());
    this.components.push(new LocalizationForm());
    this.components.push(new ScrollAnimations());
  }

  destroy() {
    this.components.forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    this.components = [];
  }
}

// Initialize theme when DOM is ready
let themeManager;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
  });
} else {
  themeManager = new ThemeManager();
}

// Export for theme editor compatibility
window.UminoTheme = {
  themeManager,
  debounce,
  throttle
}; 