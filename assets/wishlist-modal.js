class WishlistModal {
  constructor() {
    this.key = 'umino_wishlist';
    this.modal = document.getElementById('wishlist-modal');
    this.itemsWrap = this.modal?.querySelector('[data-wishlist-items]');
    this.emptyState = this.modal?.querySelector('[data-wishlist-empty]');
    this.init();
  }

  init() {
    if (!this.modal) return;

    // Open trigger
    document.querySelectorAll('[data-wishlist-trigger]').forEach(btn => {
      btn.addEventListener('click', () => this.open());
    });

    // Close actions
    this.modal.addEventListener('click', (e) => {
      if (e.target.matches('[data-close]')) this.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('is-open')) this.close();
    });

    // React to wishlist changes (from assets/wishlist.js)
    document.addEventListener('wishlist:updated', () => this.render());

    // Initial render
    this.render();
  }

  open() {
    this.render();
    this.modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  getItems() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  collectButtonsData() {
    // Gather metadata from buttons rendered on page
    const map = new Map();
    document.querySelectorAll('[data-wishlist-button]').forEach(btn => {
      const id = btn.dataset.productId;
      if (!id) return;
      map.set(id, {
        id,
        title: btn.dataset.productTitle || '',
        image: btn.dataset.productImage || '',
        url: btn.dataset.productUrl || '#'
      });
    });
    return map;
  }

  async addVariantToCart(productHandle) {
    // Fetch product JSON to get first available variant
    try {
      const res = await fetch(`/products/${productHandle}.js`);
      const product = await res.json();
      const variant = product.variants.find(v => v.available) || product.variants[0];
      if (!variant) return;

      const addRes = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: variant.id, quantity: 1 }] })
      });
      if (!addRes.ok) return;

      document.dispatchEvent(new CustomEvent('cart:updated'));
      window.cartDrawer?.open();
    } catch (e) {
      console.error('Wishlist add to cart failed', e);
    }
  }

  render() {
    if (!this.modal || !this.itemsWrap) return;

    const ids = this.getItems();
    const meta = this.collectButtonsData();

    if (ids.length === 0) {
      this.itemsWrap.innerHTML = '';
      this.emptyState.style.display = 'block';
      return;
    }

    this.emptyState.style.display = 'none';

    const html = ids.map(id => {
      const info = meta.get(String(id)) || { id, title: `#${id}`, image: '', url: `/products/${id}` };
      const imageTag = info.image ? `<img src="${info.image}" alt="${info.title}" class="wishlist-thumb" width="60" height="60">` : `<div class="wishlist-thumb"></div>`;
      return `
        <div class="wishlist-item" data-id="${id}">
          ${imageTag}
          <div class="wishlist-meta">
            <h4 class="wishlist-title"><a href="${info.url}">${info.title}</a></h4>
          </div>
          <div class="wishlist-actions">
            <button class="btn btn--secondary" data-action="remove" data-id="${id}">Remove</button>
            <button class="btn btn--primary" data-action="add" data-handle="${info.url.split('/products/')[1] || ''}">Add to cart</button>
          </div>
        </div>
      `;
    }).join('');

    this.itemsWrap.innerHTML = html;

    // Bind actions
    this.itemsWrap.querySelectorAll('[data-action="remove"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const list = this.getItems();
        const idx = list.indexOf(id) !== -1 ? list.indexOf(id) : list.indexOf(Number(id));
        if (idx > -1) {
          list.splice(idx, 1);
          localStorage.setItem(this.key, JSON.stringify(list));
          document.dispatchEvent(new Event('wishlist:updated'));
          this.render();
        }
      });
    });

    this.itemsWrap.querySelectorAll('[data-action="add"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const handle = btn.dataset.handle;
        if (handle) this.addVariantToCart(handle);
      });
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new WishlistModal());
} else {
  new WishlistModal();
} 