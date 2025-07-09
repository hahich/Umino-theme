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
  }

  init() {
    this.initButtons();
    this.initDots();
    this.initTouchEvents();
    this.initMouseEvents();
    this.goToSlide(0);
    this.startAutoplay();
    // Ensure first dot is active on page load
    if (this.dots.length > 0) {
      this.dots[0].classList.add('active');
    }
  }

  goToSlide(index) {
    if (index === this.currentSlide) return;
    this.currentSlide = index;
    this.sliderWrapper.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentSlide);
    });
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.updateSlide();
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.updateSlide();
  }

  updateSlide() {
    this.sliderWrapper.style.transform = `translateX(-${this.currentSlide * 100}%)`;
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
      this.prevBtn.addEventListener('click', () => {
        this.prevSlide();
        this.resetAutoplay();
      });
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.nextSlide();
        this.resetAutoplay();
      });
    }
  }

  initDots() {
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        if (index !== this.currentSlide) {
          this.goToSlide(index);
          this.resetAutoplay();
        }
      });
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
}

// Initialize components
document.addEventListener('DOMContentLoaded', () => {
  new MobileMenu();
  new HeroSlider();
  new NewArrivals();
});

// New Arrivals functionality
class NewArrivals {
  constructor() {
    this.slider = document.querySelector('.new-arrivals-slider');
    this.items = this.slider ? this.slider.querySelectorAll('.new-arrivals-item') : [];
    this.prevBtn = document.querySelector('.carousel-prev');
    this.nextBtn = document.querySelector('.carousel-next');
    this.currentIndex = 0;
    this.totalItems = this.items.length;
    this.itemsPerSlide = this.getItemsPerSlide();
    this.startX = 0;
    this.isDragging = false;
    this.moved = false;
    this.init();
  }

  init() {
    this.initColorSwatch();
    this.initSlider();
    this.initDragSwipe();
    window.addEventListener('resize', this.debounce(() => this.updateSlider(), 100));
  }

  initColorSwatch() {
    document.querySelectorAll('.new-arrivals-item').forEach(item => {
      const img = item.querySelector('.product-image');
      const swatchWrappers = item.querySelectorAll('.color-swatch-wrapper');
      item.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
          swatchWrappers.forEach(wrapper => wrapper.classList.remove('selected'));
          swatch.closest('.color-swatch-wrapper').classList.add('selected');
          const newImage = swatch.getAttribute('data-image');
          if (newImage) img.src = newImage;
        });
      });
    });
  }

  isMobile() {
    return window.innerWidth <= 768;
  }

  getItemsPerSlide() {
    return this.isMobile() ? 2 : this.totalItems;
  }

  updateSlider() {
    this.itemsPerSlide = this.getItemsPerSlide();
    if (!this.isMobile()) {
      this.slider && (this.slider.style.transform = '');
      return;
    }
    const slideWidth = this.items[0]?.offsetWidth || 0;
    this.slider && (this.slider.style.transform = `translateX(-${this.currentIndex * slideWidth}px)`);
  }

  showPrev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateSlider();
    }
  }

  showNext() {
    if (this.currentIndex < this.totalItems - this.itemsPerSlide) {
      this.currentIndex++;
      this.updateSlider();
    }
  }

  debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  initSlider() {
    if (this.prevBtn && this.nextBtn && this.slider) {
      this.prevBtn.addEventListener('click', () => this.showPrev());
      this.nextBtn.addEventListener('click', () => this.showNext());
      this.updateSlider();
    }
  }

  initDragSwipe() {
    if (!this.slider) return;
    this.slider.addEventListener('touchstart', e => {
      if (!this.isMobile()) return;
      this.isDragging = true;
      this.moved = false;
      this.startX = e.touches[0].clientX;
    });
    this.slider.addEventListener('touchmove', () => {
      if (!this.isDragging) return;
      this.moved = true;
    });
    this.slider.addEventListener('touchend', e => {
      if (!this.isDragging) return;
      this.isDragging = false;
      if (!this.moved) return;
      const endX = e.changedTouches[0].clientX;
      const diff = endX - this.startX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? this.showPrev() : this.showNext();
      }
    });
  }
}