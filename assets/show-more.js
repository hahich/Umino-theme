// Show more functionality
class ShowMore {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Show more/less buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-show-more-button]')) {
        this.handleShowMoreClick(event);
      }
    });
  }

  handleShowMoreClick(event) {
    event.preventDefault();
    const button = event.target;
    const container = button.closest('[data-show-more-container]');
    const content = container.querySelector('[data-show-more-content]');
    
    if (!container || !content) return;
    
    const isExpanded = container.classList.contains('show-more--expanded');
    
    if (isExpanded) {
      this.collapse(container, content, button);
    } else {
      this.expand(container, content, button);
    }
  }

  expand(container, content, button) {
    container.classList.add('show-more--expanded');
    content.style.maxHeight = content.scrollHeight + 'px';
    
    const showLessText = button.dataset.showLessText || 'Show less';
    button.textContent = showLessText;
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('show-more:expanded', {
      detail: { container, content, button }
    }));
  }

  collapse(container, content, button) {
    container.classList.remove('show-more--expanded');
    content.style.maxHeight = '0';
    
    const showMoreText = button.dataset.showMoreText || 'Show more';
    button.textContent = showMoreText;
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('show-more:collapsed', {
      detail: { container, content, button }
    }));
  }
}

// Initialize show more when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ShowMore();
  });
} else {
  new ShowMore();
} 