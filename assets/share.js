// Share functionality
class Share {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Share buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-share-button]')) {
        this.handleShareClick(event);
      }
    });
  }

  handleShareClick(event) {
    event.preventDefault();
    const button = event.target;
    const platform = button.dataset.sharePlatform;
    const url = button.dataset.shareUrl || window.location.href;
    const title = button.dataset.shareTitle || document.title;
    const text = button.dataset.shareText || '';
    
    if (!platform) return;
    
    this.share(platform, { url, title, text });
  }

  share(platform, { url, title, text }) {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedText = encodeURIComponent(text);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'native':
        this.shareNative({ url, title, text });
        return;
      default:
        console.warn(`Unknown share platform: ${platform}`);
        return;
    }
    
    if (shareUrl) {
      this.openShareWindow(shareUrl, platform);
    }
  }

  shareNative({ url, title, text }) {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: url
      }).catch(error => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback to copying to clipboard
      this.copyToClipboard(url);
    }
  }

  openShareWindow(url, platform) {
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    const shareWindow = window.open(
      url,
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
    
    if (shareWindow) {
      shareWindow.focus();
    }
  }

  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showMessage('Link copied to clipboard!', 'success');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      this.showMessage('Error copying to clipboard', 'error');
    }
  }

  showMessage(message, type = 'info') {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `share-message share-message--${type}`;
    messageElement.textContent = message;
    
    // Add styles
    messageElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    
    if (type === 'success') {
      messageElement.style.backgroundColor = '#28a745';
    } else if (type === 'error') {
      messageElement.style.backgroundColor = '#dc3545';
    } else {
      messageElement.style.backgroundColor = '#17a2b8';
    }
    
    // Add to page
    document.body.appendChild(messageElement);
    
    // Remove after 3 seconds
    setTimeout(() => {
      messageElement.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.parentNode.removeChild(messageElement);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize share when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new Share();
  });
} else {
  new Share();
} 