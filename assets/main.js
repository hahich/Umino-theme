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
  }

  goToSlide(index) {
    this.currentSlide = index;
    this.sliderWrapper.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentSlide);
    });
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(this.currentSlide);
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(this.currentSlide);
  }

  startAutoplay() {
    this.autoplayInterval = setInterval(() => this.nextSlide(), 5000);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  resetAutoplay() {
    this.stopAutoplay();
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
        this.goToSlide(index);
        this.resetAutoplay();
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

      if (Math.abs(diffY) > Math.abs(diffX)) {
        this.isDragging = false;
      }
    });

    this.sliderWrapper.addEventListener('touchend', (e) => {
      if (!this.isDragging || window.innerWidth > 768) return;

      const endX = e.changedTouches[0].clientX;
      const diff = endX - this.startX;

      if (diff > this.dragThreshold) {
        this.prevSlide();
      } else if (diff < -this.dragThreshold) {
        this.nextSlide();
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
});

// New Arrivals functionality

document.addEventListener('DOMContentLoaded', function () {
  // Color swatch logic (dynamic)
  document.querySelectorAll('.new-arrivals-item').forEach(function (item) {
    const img = item.querySelector('.product-image');
    const swatchWrappers = item.querySelectorAll('.color-swatch-wrapper');
    item.querySelectorAll('.color-swatch').forEach(function (swatch) {
      swatch.addEventListener('click', function () {
        swatchWrappers.forEach(wrapper => wrapper.classList.remove('selected'));
        swatch.closest('.color-swatch-wrapper').classList.add('selected');
        const newImage = swatch.getAttribute('data-image');
        if (newImage) img.src = newImage;
      });
    });
  });

  // Slider logic for mobile with drag/swipe support
  const slider = document.querySelector('.new-arrivals-slider');
  const items = slider ? slider.querySelectorAll('.new-arrivals-item') : [];
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  let currentIndex = 0;
  const totalItems = items.length;

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function getItemsPerSlide() {
    return isMobile() ? 2 : totalItems;
  }

  let itemsPerSlide = getItemsPerSlide();

  function updateSlider() {
    itemsPerSlide = getItemsPerSlide();
    if (!isMobile()) {
      slider && (slider.style.transform = '');
      return;
    }
    const slideWidth = items[0]?.offsetWidth || 0;
    slider && (slider.style.transform = `translateX(-${currentIndex * slideWidth}px)`);
  }

  function showPrev() {
    if (currentIndex > 0) {
      currentIndex--;
      updateSlider();
    }
  }

  function showNext() {
    if (currentIndex < totalItems - itemsPerSlide) {
      currentIndex++;
      updateSlider();
    }
  }

  // Debounce utility
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  if (prevBtn && nextBtn && slider) {
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);
    window.addEventListener('resize', debounce(updateSlider, 100));
    updateSlider();
  }

  // Drag/swipe support
  let startX = 0;
  let isDragging = false;
  let moved = false;

  if (slider) {
    slider.addEventListener('touchstart', function (e) {
      if (!isMobile()) return;
      isDragging = true;
      moved = false;
      startX = e.touches[0].clientX;
    });
    slider.addEventListener('touchmove', function (e) {
      if (!isDragging) return;
      moved = true;
    });
    slider.addEventListener('touchend', function (e) {
      if (!isDragging) return;
      isDragging = false;
      if (!moved) return;
      const endX = e.changedTouches[0].clientX;
      const diff = endX - startX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? showPrev() : showNext();
      }
    });
  }
});