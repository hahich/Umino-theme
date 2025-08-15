class ProductIconsController {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-quick-view]');
      if (link) {
        e.preventDefault();
        this.openQuickView(link);
        return;
      }

      const addBtn = e.target.closest('[data-add-to-cart]');
      if (addBtn) {
        e.preventDefault();
        const variantId = addBtn.getAttribute('data-product-id');
        if (variantId) this.addToCart(variantId, addBtn);
        return;
      }
    });
  }

  openQuickView(trigger) {
    const title = trigger.getAttribute('data-product-title') || '';
    const image = trigger.getAttribute('data-product-image') || '';
    const handle = trigger.getAttribute('data-product-handle');

    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.innerHTML = `
      <div class="quick-view-modal__content">
        <button type="button" class="quick-view-modal__close" aria-label="Close">×</button>
        <div class="quick-view-modal__body">
          <div class="quick-view-modal__image">
            <img src="${image}" alt="${title}" loading="lazy" />
          </div>
          <div class="quick-view-modal__info">
            <h3 class="quick-view-modal__title">${title}</h3>
            <a href="/products/${handle}" class="quick-view-modal__link">View details</a>
          </div>
        </div>
      </div>
    `;

    // styles
    Object.assign(modal.style, {
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex',
      alignItems: 'center', justifyContent: 'center', opacity: '0',
      transition: 'opacity .25s ease'
    });
    const content = modal.querySelector('.quick-view-modal__content');
    Object.assign(content.style, {
      background: '#fff', borderRadius: '10px', padding: '16px',
      width: '90%', maxWidth: '720px', transform: 'translateY(-16px)',
      transition: 'transform .25s ease', boxShadow: '0 10px 30px rgba(0,0,0,.15)'
    });
    const body = modal.querySelector('.quick-view-modal__body');
    Object.assign(body.style, { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' });
    const imgWrap = modal.querySelector('.quick-view-modal__image');
    Object.assign(imgWrap.style, { overflow: 'hidden', borderRadius: '8px' });
    const img = imgWrap.querySelector('img');
    Object.assign(img.style, { width: '100%', height: '100%', objectFit: 'cover' });
    const titleEl = modal.querySelector('.quick-view-modal__title');
    Object.assign(titleEl.style, { margin: '0 0 12px', fontSize: '18px' });
    const linkEl = modal.querySelector('.quick-view-modal__link');
    Object.assign(linkEl.style, { display: 'inline-block', marginTop: '8px', color: '#111' });
    const closeBtn = modal.querySelector('.quick-view-modal__close');
    Object.assign(closeBtn.style, { position: 'absolute', top: '8px', right: '12px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' });

    document.body.appendChild(modal);
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
      content.style.transform = 'translateY(0)';
    });

    const close = () => {
      modal.style.opacity = '0';
      content.style.transform = 'translateY(-16px)';
      setTimeout(() => modal.remove(), 250);
    };

    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); }, { once: true });
  }

  async addToCart(variantId, button) {
    // Validate variant ID
    if (!variantId || isNaN(Number(variantId))) {
      console.error('Invalid variant ID:', variantId);
      return;
    }

    console.log('Adding to cart - Variant ID:', variantId, 'Button:', button);

    // optimistic UI: increment header count immediately
    const badge = document.querySelector('[data-cart-count]');
    let prev = parseInt(badge?.textContent || '0', 10);
    if (badge) {
      badge.textContent = String(prev + 1);
      badge.style.display = 'flex';
    }

    try {
      const requestBody = { items: [{ id: Number(variantId), quantity: 1 }] };
      console.log('Cart request body:', requestBody);
      
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Add to cart failed:', res.status, errorData);
        throw new Error(`Add to cart failed: ${res.status} - ${errorData.description || 'Unknown error'}`);
      }

      const result = await res.json();
      console.log('Add to cart success:', result);

      // dispatch event for any listeners
      document.dispatchEvent(new CustomEvent('cart:updated'));
    } catch (err) {
      // revert optimistic update on error
      if (badge) {
        badge.textContent = String(Math.max(0, prev));
        if (prev === 0) badge.style.display = 'none';
      }
      console.error('Add to cart error:', err);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ProductIconsController());
} else {
  new ProductIconsController();
} 