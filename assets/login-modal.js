class LoginModal {
  constructor() {
    this.modal = document.getElementById('login-modal');
    this.init();
  }

  init() {
    if (!this.modal) return;

    document.querySelectorAll('[data-login-trigger]').forEach(btn => {
      btn.addEventListener('click', () => this.open());
    });

    this.modal.addEventListener('click', (e) => { if (e.target.matches('[data-close]')) this.close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.modal.classList.contains('is-open')) this.close(); });
  }

  open() {
    this.modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new LoginModal());
} else {
  new LoginModal();
} 