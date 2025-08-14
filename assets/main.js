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
    // Listen for theme editor changes
    if (typeof Shopify !== 'undefined' && Shopify.designMode) {
      // Listen for block changes
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
    // Remove event listeners
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

    // Hide current slide
    this.slides[this.currentSlide].style.opacity = '0';
    this.slides[this.currentSlide].style.transition = 'opacity 0.5s ease';
    this.slides[this.currentSlide].style.zIndex = '1';

    this.currentSlide = index;

    // Show new slide
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
    // Hide all slides first
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

// Footer collapsible for mobile (accordion behavior)
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

    window.addEventListener('resize', () => {
      if (!this.isMobile()) {
        this.contents.forEach(content => {
          content.style.maxHeight = null;
        });
        this.collapsibles.forEach(collapsible => {
          collapsible.classList.remove('active');
          this.updateIcon(collapsible, false);
        });
      }
    });
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

// New Arrivals functionality
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
    window.addEventListener('resize', () => {
      this.currentIndex = 0;
      this.updateSlider();
    });
  }

  init() {
    this.initButtons();
    this.initTouchEvents();
    this.initMouseEvents();
    this.initResizeHandler();
    this.updateSlider();

    // Start autoplay on load if mobile/tablet
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

    // Update visual state
    this.updateSelectedState(productItem, wrapper);

    // Update product image
    this.updateProductImage(wrapper, productItem);
  }

  updateSelectedState(productItem, selectedWrapper) {
    // Remove selected class from all swatches in this product
    const allSwatchesInProduct = productItem.querySelectorAll('.color-swatch-wrapper');
    allSwatchesInProduct.forEach(swatch => swatch.classList.remove('selected'));

    // Add selected class to clicked swatch
    selectedWrapper.classList.add('selected');
  }

  updateProductImage(wrapper, productItem) {
    const colorSwatch = wrapper.querySelector('.color-swatch');
    const productImage = productItem.querySelector('.product-image');

    if (!colorSwatch || !productImage) return;

    const newImageUrl = colorSwatch.getAttribute('data-image');
    if (!newImageUrl) return;

    // Update the image source
    productImage.src = newImageUrl;

    // Update all data attributes to maintain consistency
    const dataAttributes = ['data-black', 'data-red', 'data-white'];
    dataAttributes.forEach(attr => {
      productImage.setAttribute(attr, newImageUrl);
    });
  }
}

// Initialize components
document.addEventListener('DOMContentLoaded', () => {
  new MobileMenu();
  heroSliderInstance = new HeroSlider();
  new NewArrivals();
  new FooterAccordion();
  new ColorSwatch();
});

// fadein when load page or scroll
document.addEventListener('DOMContentLoaded', function () {
  const fadeEls = document.querySelectorAll('.fade-in-left');

  function revealOnScroll() {
    for (const el of fadeEls) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 40) {
        el.classList.add('visible');
      }
    }
  }

  // fadein when load page or scroll
  setTimeout(() => {
    document.body.classList.add('visible');
    revealOnScroll();
  }, 100);

  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();
});
