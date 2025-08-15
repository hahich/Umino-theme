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

  async trackCurrentProduct() {
    // Check if we're on a product page
    const productId = this.getCurrentProductId();
    if (productId) {
      const product = await this.getCurrentProductData();
      if (product) {
        this.addToRecentlyViewed(product);
      }
    }
  }

  getCurrentProductId() {
    // Try to get product ID/handle from various sources
    const productId = document.querySelector('[data-product-id]')?.dataset.productId ||
      document.querySelector('[data-product-id]')?.value ||
      window.location.pathname.match(/\/products\/([^\/\?]+)/)?.[1];

    return productId;
  }

  getHandleFromUrl(url) {
    try {
      const u = new URL(url, window.location.origin);
      const m = u.pathname.match(/\/products\/([^\/\?]+)/);
      return m ? m[1] : null;
    } catch {
      return null;
    }
  }

  normalizeCdnUrl(src) {
    if (!src) return '';
    if (src.startsWith('//')) return 'https:' + src;
    return src;
  }

  async fetchProductJsonByHandle(handle) {
    try {
      const res = await fetch(`/products/${handle}.js`);
      if (!res.ok) return null;
      const product = await res.json();
      return product;
    } catch {
      return null;
    }
  }

  async getCurrentProductData() {
    const productId = this.getCurrentProductId();
    if (!productId) return null;

    const title = document.querySelector('meta[property="og:title"]')?.content ||
      document.querySelector('h1')?.textContent ||
      'Product';

    let image = document.querySelector('meta[property="og:image"]')?.content ||
      document.querySelector('.product-image img')?.src ||
      '';

    const price = document.querySelector('[data-product-price]')?.textContent ||
      document.querySelector('.price')?.textContent ||
      '';

    const url = window.location.href;

    // If no image found on page, fetch product JSON to get a reliable image
    if (!image) {
      const handle = this.getHandleFromUrl(url);
      if (handle) {
        const product = await this.fetchProductJsonByHandle(handle);
        if (product) {
          image = product.images?.[0] || product.featured_image || '';
        }
      }
    }

    image = this.normalizeCdnUrl(image);

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

  async enrichMissingImages(modal) {
    const itemsNeedingImage = this.recentlyViewedItems
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => !item.image);

    for (const { item, index } of itemsNeedingImage) {
      const handle = this.getHandleFromUrl(item.url);
      if (!handle) continue;
      const product = await this.fetchProductJsonByHandle(handle);
      if (!product) continue;
      const img = this.normalizeCdnUrl(product.images?.[0] || product.featured_image || '');
      if (!img) continue;
      // Update in-memory and storage
      this.recentlyViewedItems[index].image = img;
      this.saveRecentlyViewed();
      // Update DOM if still open
      const imgEl = modal.querySelectorAll('.recently-viewed-item__image img')[index];
      if (imgEl) imgEl.src = img;
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
            ${this.recentlyViewedItems.map((item, idx) => `
              <div class="recently-viewed-item">
                <a href="${item.url}" class="recently-viewed-item__link">
                  <div class="recently-viewed-item__image">
                    ${item.image ? `<img src="${this.normalizeCdnUrl(item.image)}" alt="${item.title}" loading="lazy" width="300" height="300">` : `<div class=\"recently-viewed-item__placeholder\"></div>`}
                  </div>
                  <div class="recently-viewed-item__info">
                    <h4 class="recently-viewed-item__title">${item.title}</h4>
                    ${item.price ? `<p class="recently-viewed-item__price">${item.price}</p>` : ''}
                  </div>
                </a>
                <div class="recently-viewed-item__actions">
                  <button class="rv-btn rv-btn--ghost" data-rv-remove data-index="${idx}">Remove</button>
                  <button class="rv-btn rv-btn--primary" data-rv-add data-handle="${this.getHandleFromUrl(item.url) || ''}">Add to cart</button>
                </div>
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
        background: #f6f6f6;
        display:flex; align-items:center; justify-content:center;
      `;
      const el = img.querySelector('img');
      if (el) {
        el.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: cover;
        `;
      } else {
        // placeholder box
        const ph = document.createElement('div');
        ph.style.cssText = 'width:60px;height:60px;border-radius:6px;background:#eee;';
        img.appendChild(ph);
      }
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

    // Actions styles
    const actionEls = modal.querySelectorAll('.recently-viewed-item__actions');
    actionEls.forEach(el => {
      el.style.cssText = `
        display:flex; gap:8px; padding: 0 16px 16px; justify-content:flex-end;
      `;
    });
    const btns = modal.querySelectorAll('.rv-btn');
    btns.forEach(b => {
      b.style.cssText = `
        border:none; cursor:pointer; border-radius:8px; padding:10px 12px; font-weight:600; font-size:14px;
      `;
    });
    const primary = modal.querySelectorAll('.rv-btn--primary');
    primary.forEach(b => { b.style.background = '#2ed573'; b.style.color = '#fff'; });
    const ghost = modal.querySelectorAll('.rv-btn--ghost');
    ghost.forEach(b => { b.style.background = '#f5f5f5'; b.style.color = '#111'; });

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

    // Enrich items that have no image (fix broken thumbnails)
    this.enrichMissingImages(modal);

    // Wire actions
    modal.querySelectorAll('[data-rv-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index, 10);
        this.removeRecentlyViewed(index, modal);
      });
    });
    modal.querySelectorAll('[data-rv-add]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const handle = btn.dataset.handle;
        if (handle) await this.addToCartFromHandle(handle);
      });
    });

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

  // Helper: remove by index and update DOM
  removeRecentlyViewed(index, modal) {
    if (index < 0 || index >= this.recentlyViewedItems.length) return;
    this.recentlyViewedItems.splice(index, 1);
    this.saveRecentlyViewed();

    const itemEls = modal.querySelectorAll('.recently-viewed-item');
    const el = itemEls[index];
    if (el && el.parentNode) el.parentNode.removeChild(el);

    if (this.recentlyViewedItems.length === 0) {
      this.closeRecentlyViewedModal(modal);
      this.showNotification('Recently viewed is now empty', 'info');
    }
  }

  // Helper: add first available variant to cart by handle
  async addToCartFromHandle(handle) {
    try {
      const product = await this.fetchProductJsonByHandle(handle);
      if (!product) return;
      const variant = product.variants.find(v => v.available) || product.variants[0];
      if (!variant) return;

      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: variant.id, quantity: 1 }] })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Add to cart failed from Recently Viewed', err);
        return;
      }
      document.dispatchEvent(new CustomEvent('cart:updated'));
      if (window.cartDrawer) window.cartDrawer.open();
      this.showNotification('Added to cart', 'success');
    } catch (e) {
      console.error('Error adding to cart from Recently Viewed:', e);
    }
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