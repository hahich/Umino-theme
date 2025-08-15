// Product model functionality
class ProductModel {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Model viewer interactions
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-model-viewer]')) {
        this.handleModelViewerClick(event);
      }
    });

    // Model viewer loading
    document.addEventListener('model-viewer-load', (event) => {
      this.handleModelLoad(event);
    });

    // Model viewer errors
    document.addEventListener('model-viewer-error', (event) => {
      this.handleModelError(event);
    });
  }

  handleModelViewerClick(event) {
    const modelViewer = event.target;
    
    // Toggle camera controls
    if (modelViewer.cameraControls) {
      modelViewer.cameraControls = false;
      setTimeout(() => {
        modelViewer.cameraControls = true;
      }, 100);
    }
  }

  handleModelLoad(event) {
    const modelViewer = event.target;
    const container = modelViewer.closest('[data-model-container]');
    
    if (container) {
      // Show model viewer
      modelViewer.style.display = 'block';
      
      // Hide loading indicator
      const loadingIndicator = container.querySelector('[data-model-loading]');
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }
      
      // Show model controls
      const controls = container.querySelector('[data-model-controls]');
      if (controls) {
        controls.style.display = 'block';
      }
    }
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('product-model:loaded', {
      detail: { modelViewer, container }
    }));
  }

  handleModelError(event) {
    const modelViewer = event.target;
    const container = modelViewer.closest('[data-model-container]');
    
    if (container) {
      // Hide model viewer
      modelViewer.style.display = 'none';
      
      // Hide loading indicator
      const loadingIndicator = container.querySelector('[data-model-loading]');
      if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
      }
      
      // Show error message
      const errorMessage = container.querySelector('[data-model-error]');
      if (errorMessage) {
        errorMessage.style.display = 'block';
      }
    }
    
    console.error('Model viewer error:', event.detail);
  }

  // Utility method to initialize a model viewer
  initModelViewer(modelViewerElement, options = {}) {
    if (!modelViewerElement) return;
    
    // Set default options
    const defaultOptions = {
      cameraControls: true,
      autoRotate: false,
      autoRotateDelay: 0,
      rotationPerSecond: '30deg',
      interactionPrompt: 'auto',
      interactionPromptStyle: 'basic',
      ar: false,
      arScale: 'auto',
      arPlacement: 'floor',
      loading: 'eager',
      reveal: 'auto',
      shadowIntensity: 0,
      shadowSoftness: 0,
      environmentImage: 'neutral',
      exposure: 1,
      minCameraOrbit: 'auto auto auto',
      maxCameraOrbit: 'auto auto auto',
      minFieldOfView: 'auto',
      maxFieldOfView: 'auto',
      interpolationDecay: 30,
      touchAction: 'pan-y',
      disableZoom: false,
      cameraOrbit: '0deg 75deg 105%',
      fieldOfView: '30deg',
      ...options
    };
    
    // Apply options to model viewer
    Object.keys(defaultOptions).forEach(key => {
      if (defaultOptions[key] !== undefined) {
        modelViewerElement.setAttribute(key, defaultOptions[key]);
      }
    });
    
    // Set up event listeners
    modelViewerElement.addEventListener('load', () => {
      this.handleModelLoad({ target: modelViewerElement });
    });
    
    modelViewerElement.addEventListener('error', (error) => {
      this.handleModelError({ target: modelViewerElement, detail: error });
    });
    
    return modelViewerElement;
  }

  // Utility method to load a model
  loadModel(modelViewerElement, modelUrl, options = {}) {
    if (!modelViewerElement || !modelUrl) return;
    
    // Show loading indicator
    const container = modelViewerElement.closest('[data-model-container]');
    if (container) {
      const loadingIndicator = container.querySelector('[data-model-loading]');
      if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
      }
      
      // Hide error message
      const errorMessage = container.querySelector('[data-model-error]');
      if (errorMessage) {
        errorMessage.style.display = 'none';
      }
    }
    
    // Set model source
    modelViewerElement.src = modelUrl;
    
    // Apply additional options
    if (options.alt) {
      modelViewerElement.alt = options.alt;
    }
    
    if (options.poster) {
      modelViewerElement.poster = options.poster;
    }
    
    // Initialize with options
    this.initModelViewer(modelViewerElement, options);
  }

  // Utility method to reset model viewer
  resetModelViewer(modelViewerElement) {
    if (!modelViewerElement) return;
    
    // Reset camera
    modelViewerElement.cameraOrbit = '0deg 75deg 105%';
    modelViewerElement.fieldOfView = '30deg';
    
    // Reset animation
    if (modelViewerElement.autoRotate) {
      modelViewerElement.autoRotate = false;
      setTimeout(() => {
        modelViewerElement.autoRotate = true;
      }, 100);
    }
  }

  // Utility method to take a screenshot
  async takeScreenshot(modelViewerElement, options = {}) {
    if (!modelViewerElement) return null;
    
    try {
      const canvas = await modelViewerElement.toCanvas(options);
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error taking screenshot:', error);
      return null;
    }
  }

  // Utility method to export model
  exportModel(modelViewerElement, format = 'glb') {
    if (!modelViewerElement) return;
    
    try {
      const modelUrl = modelViewerElement.src;
      if (modelUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = modelUrl;
        link.download = `model.${format}`;
        link.click();
      }
    } catch (error) {
      console.error('Error exporting model:', error);
    }
  }

  // Utility method to enable AR
  enableAR(modelViewerElement, options = {}) {
    if (!modelViewerElement) return;
    
    const arOptions = {
      ar: true,
      arScale: options.scale || 'auto',
      arPlacement: options.placement || 'floor',
      ...options
    };
    
    Object.keys(arOptions).forEach(key => {
      if (arOptions[key] !== undefined) {
        modelViewerElement.setAttribute(key, arOptions[key]);
      }
    });
  }

  // Utility method to disable AR
  disableAR(modelViewerElement) {
    if (!modelViewerElement) return;
    
    modelViewerElement.setAttribute('ar', false);
  }

  // Utility method to set environment
  setEnvironment(modelViewerElement, environment) {
    if (!modelViewerElement) return;
    
    modelViewerElement.setAttribute('environment-image', environment);
  }

  // Utility method to set exposure
  setExposure(modelViewerElement, exposure) {
    if (!modelViewerElement) return;
    
    modelViewerElement.setAttribute('exposure', exposure);
  }

  // Utility method to set shadow intensity
  setShadowIntensity(modelViewerElement, intensity) {
    if (!modelViewerElement) return;
    
    modelViewerElement.setAttribute('shadow-intensity', intensity);
  }

  // Utility method to set shadow softness
  setShadowSoftness(modelViewerElement, softness) {
    if (!modelViewerElement) return;
    
    modelViewerElement.setAttribute('shadow-softness', softness);
  }
}

// Initialize product model when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ProductModel();
  });
} else {
  new ProductModel();
} 