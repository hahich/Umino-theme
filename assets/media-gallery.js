// Media gallery functionality
class MediaGallery {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Media gallery navigation
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-media-gallery-prev]')) {
        this.previousSlide(event);
      }
      
      if (event.target.matches('[data-media-gallery-next]')) {
        this.nextSlide(event);
      }
      
      if (event.target.matches('[data-media-gallery-thumbnail]')) {
        this.goToSlide(event);
      }
    });

    // Media gallery keyboard navigation
    document.addEventListener('keydown', (event) => {
      const gallery = event.target.closest('[data-media-gallery]');
      if (!gallery) return;
      
      if (event.key === 'ArrowLeft') {
        this.previousSlide({ target: gallery.querySelector('[data-media-gallery-prev]') });
      } else if (event.key === 'ArrowRight') {
        this.nextSlide({ target: gallery.querySelector('[data-media-gallery-next]') });
      }
    });

    // Media gallery touch/swipe support
    this.initTouchSupport();
  }

  previousSlide(event) {
    event.preventDefault();
    const button = event.target;
    const gallery = button.closest('[data-media-gallery]');
    
    if (!gallery) return;
    
    const currentSlide = parseInt(gallery.dataset.currentSlide) || 0;
    const totalSlides = gallery.querySelectorAll('[data-media-slide]').length;
    
    const newSlide = currentSlide > 0 ? currentSlide - 1 : totalSlides - 1;
    this.goToSlideIndex(gallery, newSlide);
  }

  nextSlide(event) {
    event.preventDefault();
    const button = event.target;
    const gallery = button.closest('[data-media-gallery]');
    
    if (!gallery) return;
    
    const currentSlide = parseInt(gallery.dataset.currentSlide) || 0;
    const totalSlides = gallery.querySelectorAll('[data-media-slide]').length;
    
    const newSlide = currentSlide < totalSlides - 1 ? currentSlide + 1 : 0;
    this.goToSlideIndex(gallery, newSlide);
  }

  goToSlide(event) {
    event.preventDefault();
    const thumbnail = event.target;
    const slideIndex = parseInt(thumbnail.dataset.slideIndex);
    const gallery = thumbnail.closest('[data-media-gallery]');
    
    if (!gallery || isNaN(slideIndex)) return;
    
    this.goToSlideIndex(gallery, slideIndex);
  }

  goToSlideIndex(gallery, index) {
    const slides = gallery.querySelectorAll('[data-media-slide]');
    const thumbnails = gallery.querySelectorAll('[data-media-gallery-thumbnail]');
    const prevButton = gallery.querySelector('[data-media-gallery-prev]');
    const nextButton = gallery.querySelector('[data-media-gallery-next]');
    
    if (index < 0 || index >= slides.length) return;
    
    // Update current slide
    gallery.dataset.currentSlide = index;
    
    // Hide all slides
    slides.forEach((slide, i) => {
      slide.style.display = i === index ? 'block' : 'none';
      slide.classList.toggle('active', i === index);
    });
    
    // Update thumbnails
    thumbnails.forEach((thumbnail, i) => {
      thumbnail.classList.toggle('active', i === index);
    });
    
    // Update navigation buttons
    if (prevButton) {
      prevButton.disabled = index === 0;
    }
    
    if (nextButton) {
      nextButton.disabled = index === slides.length - 1;
    }
    
    // Update slide counter if present
    const counter = gallery.querySelector('[data-media-counter]');
    if (counter) {
      counter.textContent = `${index + 1} / ${slides.length}`;
    }
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('media-gallery:slide-changed', {
      detail: { gallery, index, slide: slides[index] }
    }));
  }

  initTouchSupport() {
    const galleries = document.querySelectorAll('[data-media-gallery]');
    
    galleries.forEach(gallery => {
      let startX = 0;
      let startY = 0;
      let isDragging = false;
      
      gallery.addEventListener('touchstart', (event) => {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        isDragging = false;
      });
      
      gallery.addEventListener('touchmove', (event) => {
        if (!startX || !startY) return;
        
        const currentX = event.touches[0].clientX;
        const currentY = event.touches[0].clientY;
        const diffX = startX - currentX;
        const diffY = startY - currentY;
        
        // Check if horizontal swipe is more significant than vertical
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
          isDragging = true;
          event.preventDefault();
        }
      });
      
      gallery.addEventListener('touchend', (event) => {
        if (!isDragging) return;
        
        const currentX = event.changedTouches[0].clientX;
        const diffX = startX - currentX;
        
        if (Math.abs(diffX) > 50) {
          if (diffX > 0) {
            // Swipe left - next slide
            this.nextSlide({ target: gallery.querySelector('[data-media-gallery-next]') });
          } else {
            // Swipe right - previous slide
            this.previousSlide({ target: gallery.querySelector('[data-media-gallery-prev]') });
          }
        }
        
        startX = 0;
        startY = 0;
        isDragging = false;
      });
    });
  }

  // Utility method to initialize a gallery
  initGallery(galleryElement) {
    if (!galleryElement) return;
    
    const slides = galleryElement.querySelectorAll('[data-media-slide]');
    const thumbnails = galleryElement.querySelectorAll('[data-media-gallery-thumbnail]');
    
    if (slides.length === 0) return;
    
    // Set up thumbnails
    thumbnails.forEach((thumbnail, index) => {
      thumbnail.dataset.slideIndex = index;
    });
    
    // Show first slide
    this.goToSlideIndex(galleryElement, 0);
  }

  // Utility method to add a slide to the gallery
  addSlide(galleryElement, mediaData) {
    if (!galleryElement || !mediaData) return;
    
    const slidesContainer = galleryElement.querySelector('[data-media-slides]');
    const thumbnailsContainer = galleryElement.querySelector('[data-media-thumbnails]');
    
    if (!slidesContainer || !thumbnailsContainer) return;
    
    const slideIndex = slidesContainer.children.length;
    
    // Create slide element
    const slide = document.createElement('div');
    slide.className = 'media-slide';
    slide.dataset.mediaSlide = '';
    slide.dataset.slideIndex = slideIndex;
    
    // Create media element based on type
    if (mediaData.type === 'image') {
      const img = document.createElement('img');
      img.src = mediaData.src;
      img.alt = mediaData.alt || '';
      img.loading = 'lazy';
      slide.appendChild(img);
    } else if (mediaData.type === 'video') {
      const video = document.createElement('video');
      video.src = mediaData.src;
      video.controls = true;
      video.preload = 'metadata';
      slide.appendChild(video);
    } else if (mediaData.type === 'model') {
      const modelViewer = document.createElement('model-viewer');
      modelViewer.src = mediaData.src;
      modelViewer.alt = mediaData.alt || '';
      modelViewer.cameraControls = true;
      modelViewer.autoRotate = true;
      slide.appendChild(modelViewer);
    }
    
    // Create thumbnail
    const thumbnail = document.createElement('button');
    thumbnail.className = 'media-thumbnail';
    thumbnail.dataset.mediaGalleryThumbnail = '';
    thumbnail.dataset.slideIndex = slideIndex;
    
    if (mediaData.thumbnail) {
      const thumbnailImg = document.createElement('img');
      thumbnailImg.src = mediaData.thumbnail;
      thumbnailImg.alt = mediaData.alt || '';
      thumbnail.appendChild(thumbnailImg);
    }
    
    // Add to containers
    slidesContainer.appendChild(slide);
    thumbnailsContainer.appendChild(thumbnail);
    
    // Update gallery
    this.initGallery(galleryElement);
  }

  // Utility method to remove a slide from the gallery
  removeSlide(galleryElement, slideIndex) {
    if (!galleryElement) return;
    
    const slides = galleryElement.querySelectorAll('[data-media-slide]');
    const thumbnails = galleryElement.querySelectorAll('[data-media-gallery-thumbnail]');
    
    if (slideIndex < 0 || slideIndex >= slides.length) return;
    
    // Remove slide and thumbnail
    slides[slideIndex].remove();
    thumbnails[slideIndex].remove();
    
    // Update remaining slide indices
    const remainingSlides = galleryElement.querySelectorAll('[data-media-slide]');
    const remainingThumbnails = galleryElement.querySelectorAll('[data-media-gallery-thumbnail]');
    
    remainingSlides.forEach((slide, index) => {
      slide.dataset.slideIndex = index;
    });
    
    remainingThumbnails.forEach((thumbnail, index) => {
      thumbnail.dataset.slideIndex = index;
    });
    
    // Update gallery
    this.initGallery(galleryElement);
  }
}

// Initialize media gallery when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MediaGallery();
  });
} else {
  new MediaGallery();
} 