// Details modal functionality
class DetailsModal {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Modal open buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-details-modal-open]')) {
        this.openModal(event);
      }
    });

    // Modal close buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-details-modal-close]')) {
        this.closeModal(event);
      }
    });

    // Overlay clicks
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-details-modal-overlay]')) {
        this.closeModal(event);
      }
    });

    // Keyboard events
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  openModal(event) {
    event.preventDefault();
    const trigger = event.target;
    const modalId = trigger.dataset.detailsModalOpen;
    const modal = document.getElementById(modalId);
    
    if (!modal) return;
    
    // Set modal content if data attributes are provided
    if (trigger.dataset.modalTitle) {
      const titleElement = modal.querySelector('[data-modal-title]');
      if (titleElement) {
        titleElement.textContent = trigger.dataset.modalTitle;
      }
    }
    
    if (trigger.dataset.modalContent) {
      const contentElement = modal.querySelector('[data-modal-content]');
      if (contentElement) {
        contentElement.innerHTML = trigger.dataset.modalContent;
      }
    }
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus first focusable element
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('details-modal:opened', { 
      detail: { modal, trigger } 
    }));
  }

  closeModal(event) {
    event.preventDefault();
    const trigger = event.target;
    const modal = trigger.closest('[data-details-modal]') || document.querySelector('[data-details-modal].active');
    
    if (modal) {
      this.closeModalElement(modal);
    }
  }

  closeModalElement(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('details-modal:closed', { 
      detail: { modal } 
    }));
  }

  closeAllModals() {
    const modals = document.querySelectorAll('[data-details-modal].active');
    modals.forEach(modal => {
      this.closeModalElement(modal);
    });
  }

  // Utility method to programmatically open a modal
  openModalById(modalId, options = {}) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Set custom content if provided
    if (options.title) {
      const titleElement = modal.querySelector('[data-modal-title]');
      if (titleElement) {
        titleElement.textContent = options.title;
      }
    }
    
    if (options.content) {
      const contentElement = modal.querySelector('[data-modal-content]');
      if (contentElement) {
        contentElement.innerHTML = options.content;
      }
    }
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus first focusable element
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }
    
    return modal;
  }

  // Utility method to programmatically close a modal
  closeModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      this.closeModalElement(modal);
    }
  }
}

// Initialize details modal when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new DetailsModal();
  });
} else {
  new DetailsModal();
} 