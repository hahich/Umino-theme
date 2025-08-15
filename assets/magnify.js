// Magnify functionality
class Magnify {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Image hover events
    document.addEventListener('mouseenter', (event) => {
      if (event.target.matches('[data-magnify]')) {
        this.handleImageHover(event);
      }
    }, true);

    document.addEventListener('mouseleave', (event) => {
      if (event.target.matches('[data-magnify]')) {
        this.handleImageLeave(event);
      }
    }, true);

    document.addEventListener('mousemove', (event) => {
      if (event.target.matches('[data-magnify]')) {
        this.handleImageMove(event);
      }
    }, true);
  }

  handleImageHover(event) {
    const image = event.target;
    const magnifyContainer = image.closest('[data-magnify-container]');
    
    if (!magnifyContainer) return;
    
    const magnifyLens = magnifyContainer.querySelector('[data-magnify-lens]');
    if (magnifyLens) {
      magnifyLens.style.display = 'block';
    }
  }

  handleImageLeave(event) {
    const image = event.target;
    const magnifyContainer = image.closest('[data-magnify-container]');
    
    if (!magnifyContainer) return;
    
    const magnifyLens = magnifyContainer.querySelector('[data-magnify-lens]');
    if (magnifyLens) {
      magnifyLens.style.display = 'none';
    }
  }

  handleImageMove(event) {
    const image = event.target;
    const magnifyContainer = image.closest('[data-magnify-container]');
    
    if (!magnifyContainer) return;
    
    const magnifyLens = magnifyContainer.querySelector('[data-magnify-lens]');
    if (!magnifyLens) return;
    
    const rect = image.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const lensSize = 100; // Size of the magnifying lens
    const zoomLevel = 2; // Zoom level
    
    // Calculate lens position
    const lensX = x - lensSize / 2;
    const lensY = y - lensSize / 2;
    
    // Update lens position
    magnifyLens.style.left = lensX + 'px';
    magnifyLens.style.top = lensY + 'px';
    
    // Update lens background position
    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;
    magnifyLens.style.backgroundPosition = `${bgX}% ${bgY}%`;
  }
}

// Initialize magnify when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new Magnify();
  });
} else {
  new Magnify();
} 