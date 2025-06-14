class WaitlistWidget {
  constructor(formId) {
    this.formId = formId;
    this.widget = document.getElementById('waitlist-widget');
    this.apiBaseUrl = this.getApiBaseUrl();
    this.init();
  }

  getApiBaseUrl() {
    // Try to get the base URL from the script tag
    const script = document.querySelector('script[src*="waitlist.js"]');
    if (script) {
      const src = script.getAttribute('src');
      return src.substring(0, src.lastIndexOf('/'));
    }
    // Fallback to current origin
    return window.location.origin;
  }

  async init() {
    try {
      // Fetch waitlist data
      const response = await fetch(`${this.apiBaseUrl}/api/waitlists/${this.formId}/embed`);
      const data = await response.json();
      const waitlist = data.data.waitlist;

      if (!response.ok) {
        this.showError(data.message || 'Failed to load waitlist data');
        return;
      }


     

      if (!waitlist) {
        this.showError('Waitlist not found');
        return;
      }

      if (!waitlist.isActive) {
        this.showInactiveMessage();
        return;
      }


      // Create widget HTML
      this.widget.innerHTML = this.createWidgetHTML(waitlist);
      
      this.addEventListeners();
    } catch (error) {
      console.error('Error initializing waitlist widget:', error);
      this.showError('Failed to load waitlist form');
    }
  }

  createWidgetHTML(waitlist) {
    return `
      <div class="waitlist-widget">
        ${waitlist.showLogo ? `
          <div class="waitlist-widget__logo">
            <img src="${this.apiBaseUrl}/logo.png" alt="Logo" />
          </div>
        ` : ''}
        
        <h2 class="waitlist-widget__title">${waitlist.title}</h2>
        ${waitlist.description ? `
          <p class="waitlist-widget__description">${waitlist.description}</p>
        ` : ''}
        
        <form class="waitlist-widget__form">
          <input 
            type="email" 
            class="waitlist-widget__input" 
            placeholder="${waitlist.placeholderText}"
            required
          />
          <button type="submit" class="waitlist-widget__button">
            ${waitlist.buttonText}
          </button>
        </form>

        ${waitlist.showSocialProof ? `
          <div class="waitlist-widget__social-proof">
            <div class="waitlist-widget__avatars">
              ${this.generateAvatars(waitlist.submissionCount)}
            </div>
            <p class="waitlist-widget__count">
              ⚡ Be the first to join
            </p>
          </div>
        ` : ''}

        <div class="waitlist-widget__success">
          ${waitlist.successMessage}
        </div>
        
        <div class="waitlist-widget__error"></div>
      </div>
    `;
  }

  generateAvatars(count) {
    const avatars = [];
    const displayCount = Math.min(count, 4);
    
    for (let i = 0; i < displayCount; i++) {
      avatars.push(`
        <div class="waitlist-widget__avatar">
          ${i + 1}
        </div>
      `);
    }
    
    return avatars.join('');
  }

  addEventListeners() {
    const form = this.widget.querySelector('form');
    const input = this.widget.querySelector('input');
    const successMessage = this.widget.querySelector('.waitlist-widget__success');
    const errorMessage = this.widget.querySelector('.waitlist-widget__error');
    const button = this.widget.querySelector('button');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = input.value.trim();
      if (!email) return;

      button.disabled = true;
      errorMessage.style.display = 'none';
      successMessage.style.display = 'none';

      try {
        const response = await fetch(`${this.apiBaseUrl}/api/public/waitlists/${this.formId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          input.value = '';
          successMessage.style.display = 'block';
          this.updateSocialProof();
        } else {
          throw new Error(data.message || 'Failed to join waitlist');
        }
      } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
      } finally {
        button.disabled = false;
      }
    });
  }

  async updateSocialProof() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/waitlists/${this.formId}/embed`);
      const data = await response.json();
      
      const avatarsContainer = this.widget.querySelector('.waitlist-widget__avatars');
      if (avatarsContainer) {
        avatarsContainer.innerHTML = this.generateAvatars(data.waitlist.submissionCount);
      }
    } catch (error) {
      console.error('Error updating social proof:', error);
    }
  }

  showError(message) {
    this.widget.innerHTML = `
      <div class="waitlist-widget">
        <div class="waitlist-widget__error">
          ${message}
        </div>
      </div>
    `;
  }

  showInactiveMessage() {
    this.widget.innerHTML = `
      <div class="waitlist-widget">
        <div class="waitlist-widget__inactive">
          This waitlist is currently inactive
        </div>
      </div>
    `;
  }
}

// Initialize all waitlist widgets on the page
document.addEventListener('DOMContentLoaded', () => {
  const widgets = document.querySelectorAll('[data-form-id]');
  widgets.forEach(widget => {
    new WaitlistWidget(widget.dataset.formId);
  });
}); 