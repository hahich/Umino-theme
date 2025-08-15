class SearchModal {
  constructor() {
    this.modal = document.getElementById('SearchModal');
    this.trigger = document.querySelector('[data-search-trigger]');
    this.closeButton = this.modal?.querySelector('.search-modal__close');
    this.searchInput = this.modal?.querySelector('#Search-In-Modal');
    
    this.init();
  }

  init() {
    if (!this.modal || !this.trigger) return;

    // Event listeners
    this.trigger.addEventListener('click', () => this.openModal());
    this.closeButton?.addEventListener('click', () => this.closeModal());
    
    // Close on backdrop click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.hasAttribute('open')) {
        this.closeModal();
      }
      
      // Focus search input when modal opens
      if (e.key === '/' && !this.modal.hasAttribute('open')) {
        e.preventDefault();
        this.openModal();
      }
    });

    // Focus management
    this.modal.addEventListener('transitionend', () => {
      if (this.modal.hasAttribute('open')) {
        this.searchInput?.focus();
      }
    });
  }

  openModal() {
    this.modal.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    
    // Announce to screen readers
    this.announceToScreenReader('Search modal opened');
  }

  closeModal() {
    this.modal.removeAttribute('open');
    document.body.style.overflow = '';
    
    // Return focus to trigger
    this.trigger?.focus();
    
    // Announce to screen readers
    this.announceToScreenReader('Search modal closed');
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SearchModal());
} else {
  new SearchModal();
} 