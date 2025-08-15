// Theme Editor functionality
class ThemeEditor {
  constructor() {
    this.init();
  }

  init() {
    // Only run in theme editor mode
    if (typeof window.Shopify !== 'undefined' && window.Shopify.designMode) {
      this.setupThemeEditor();
    }
  }

  setupThemeEditor() {
    // Handle theme editor specific functionality
    document.addEventListener('shopify:section:load', (event) => {
      this.handleSectionLoad(event);
    });

    document.addEventListener('shopify:section:unload', (event) => {
      this.handleSectionUnload(event);
    });

    document.addEventListener('shopify:block:select', (event) => {
      this.handleBlockSelect(event);
    });

    document.addEventListener('shopify:block:deselect', (event) => {
      this.handleBlockDeselect(event);
    });
  }

  handleSectionLoad(event) {
    // Reinitialize components when section is loaded
    const section = event.target;
    this.reinitializeComponents(section);
  }

  handleSectionUnload(event) {
    // Cleanup when section is unloaded
    const section = event.target;
    this.cleanupComponents(section);
  }

  handleBlockSelect(event) {
    // Handle block selection in theme editor
    const block = event.target;
    if (block) {
      block.classList.add('shopify-editor-block-selected');
    }
  }

  handleBlockDeselect(event) {
    // Handle block deselection in theme editor
    const block = event.target;
    if (block) {
      block.classList.remove('shopify-editor-block-selected');
    }
  }

  reinitializeComponents(section) {
    // Reinitialize any components that need to be set up after section load
    // This can be extended based on specific section needs
  }

  cleanupComponents(section) {
    // Cleanup any components when section is unloaded
    // This can be extended based on specific section needs
  }
}

// Initialize theme editor when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ThemeEditor();
  });
} else {
  new ThemeEditor();
} 