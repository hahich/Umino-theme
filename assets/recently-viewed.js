class RecentlyViewedManager {
  constructor() {
    this.recentlyViewedKey = 'umino_recently_viewed';
    this.maxItems = 10;
    this.recentlyViewedItems = this.loadRecentlyViewed();
    this.init();
  }

  init() {
    // Track current product if on product page
    this.trackCurrentProduct();
    
    // Initialize recently viewed trigger
    this.initRecentlyViewedTrigger();
  }

  loadRecentlyViewed() {
    try {
      const stored = localStorage.getItem(this.recentlyViewedKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading recently viewed:', error);
      return [];
    }
  }

  saveRecentlyViewed() {
    try {
      localStorage.setItem(this.recentlyViewedKey, JSON.stringify(this.recentlyViewedItems));
    } catch (error) {
      console.error('Error saving recently viewed:', error);
    }
  }

  addToRecentlyViewed(product) {
    // Remove if already exists
    this.recentlyViewedItems = this.recentlyViewedItems.filter(item => item.id !== product.id);
    
    // Add to beginning
    this.recentlyViewedItems.unshift(product);
    
    // Keep only max items
    if (this.recentlyViewedItems.length > this.maxItems) {
      this.recentlyViewedItems = this.recentlyViewedItems.slice(0, this.maxItems);
    }
    
    this.saveRecentlyViewed();
  }

  trackCurrentProduct() {
    // Check if we're on a product page
    const productId = this.getCurrentProductId();
    if (productId) {
      const product = this.getCurrentProductData();
      if (product) {
        this.addToRecentlyViewed(product);
      }
    }
  }

  getCurrentProductId() {
    // Try to get product ID from various sources
    const productId = document.querySelector('[data-product-id]')?.dataset.productId ||
                     document.querySelector('[data-product-id]')?.value ||
                     window.location.pathname.match(/\/products\/([^\/\?]+)/)?.[1];
    
    return productId;
  }

  getCurrentProductData() {
    const productId = this.getCurrentProductId();
    if (!productId) return null;

    // Try to get product data from meta tags or other sources
    const title = document.querySelector('meta[property="og:title"]')?.content ||
                  document.querySelector('h1')?.textContent ||
                  'Product';
    
    const image = document.querySelector('meta[property="og:image"]')?.content ||
                  document.querySelector('.product-image img')?.src ||
                  '';
    
    const price = document.querySelector('[data-product-price]')?.textContent ||
                  document.querySelector('.price')?.textContent ||
                  '';
    
    const url = window.location.href;

    return {
      id: productId,
      title: title.trim(),
      image: image,
      price: price.trim(),
      url: url
    };
  }

  initRecentlyViewedTrigger() {
    const trigger = document.querySelector('[data-recently-viewed-trigger]');
    if (trigger) {
      trigger.addEventListener('click', () => {
        this.showRecentlyViewedModal();
      });
    }
  }

  showRecentlyViewedModal() {
    if (this.recentlyViewedItems.length === 0) {
      this.showNotification('No recently viewed products', 'info');
      return;
    }

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'recently-viewed-modal';
    modal.innerHTML = `
      <div class="recently-viewed-modal__content">
        <div class="recently-viewed-modal__header">
          <h3>Recently Viewed Products</h3>
          <button type="button" class="recently-viewed-modal__close" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="recently-viewed-modal__body">
          <div class="recently-viewed-grid">
            ${this.recentlyViewedItems.map(item => `
              <div class="recently-viewed-item">
                <a href="${item.url}" class="recently-viewed-item__link">
                  <div class="recently-viewed-item__image">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                  </div>
                  <div class="recently-viewed-item__info">
                    <h4 class="recently-viewed-item__title">${item.title}</h4>
                    ${item.price ? `<p class="recently-viewed-item__price">${item.price}</p>` : ''}
                  </div>
                </a>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Add styles
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // Add content styles
    const content = modal.querySelector('.recently-viewed-modal__content');
    content.style.cssText = `
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
      transform: translateY(-20px);
      transition: transform 0.3s ease;
    `;

    // Add header styles
    const header = modal.querySelector('.recently-viewed-modal__header');
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e5e5;
    `;

    // Add close button styles
    const closeBtn = modal.querySelector('.recently-viewed-modal__close');
    closeBtn.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      color: #666;
      transition: all 0.2s ease;
    `;

    // Add body styles
    const body = modal.querySelector('.recently-viewed-modal__body');
    body.style.cssText = `
      padding: 24px;
    `;

    // Add grid styles
    const grid = modal.querySelector('.recently-viewed-grid');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    `;

    // Add item styles
    const items = modal.querySelectorAll('.recently-viewed-item');
    items.forEach(item => {
      item.style.cssText = `
        border: 1px solid #e5e5e5;
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.2s ease;
      `;
    });

    // Add link styles
    const links = modal.querySelectorAll('.recently-viewed-item__link');
    links.forEach(link => {
      link.style.cssText = `
        display: block;
        text-decoration: none;
        color: inherit;
      `;
    });

    // Add image styles
    const images = modal.querySelectorAll('.recently-viewed-item__image');
    images.forEach(img => {
      img.style.cssText = `
        width: 100%;
        height: 150px;
        overflow: hidden;
      `;
      img.querySelector('img').style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
      `;
    });

    // Add info styles
    const infos = modal.querySelectorAll('.recently-viewed-item__info');
    infos.forEach(info => {
      info.style.cssText = `
        padding: 16px;
      `;
    });

    // Add title styles
    const titles = modal.querySelectorAll('.recently-viewed-item__title');
    titles.forEach(title => {
      title.style.cssText = `
        margin: 0 0 8px 0;
        font-size: 14px;
        font-weight: 600;
        color: #333;
        line-height: 1.3;
      `;
    });

    // Add price styles
    const prices = modal.querySelectorAll('.recently-viewed-item__price');
    prices.forEach(price => {
      price.style.cssText = `
        margin: 0;
        font-size: 14px;
        color: #666;
        font-weight: 500;
      `;
    });

    // Add event listeners
    closeBtn.addEventListener('click', () => {
      this.closeRecentlyViewedModal(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeRecentlyViewedModal(modal);
      }
    });

    // Add to DOM and animate
    document.body.appendChild(modal);
    
    setTimeout(() => {
      modal.style.opacity = '1';
      content.style.transform = 'translateY(0)';
    }, 100);

    // Store modal reference
    this.currentModal = modal;
  }

  closeRecentlyViewedModal(modal) {
    if (!modal) return;
    
    modal.style.opacity = '0';
    const content = modal.querySelector('.recently-viewed-modal__content');
    content.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
      this.currentModal = null;
    }, 300);
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#2ed573' : '#ff6b7a'};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  getRecentlyViewedItems() {
    return [...this.recentlyViewedItems];
  }

  clearRecentlyViewed() {
    this.recentlyViewedItems = [];
    this.saveRecentlyViewed();
    this.showNotification('Recently viewed cleared', 'info');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.recentlyViewedManager = new RecentlyViewedManager();
  });
} else {
  window.recentlyViewedManager = new RecentlyViewedManager();
} 