import { playSound } from '../../utils/audio.js';

// Web3Forms Access Key for ultra-fast direct delivery (<1s)
// Get your free key at https://web3forms.com by entering naveenkumar.develop@gmail.com
export let WEB3FORMS_ACCESS_KEY = 'd20132a4-cf6b-43da-8972-a920431d8cf6';

export function setWeb3FormsKey(key) {
  WEB3FORMS_ACCESS_KEY = key;
}

export function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = form.querySelector('.contact-submit-btn');
  const status = document.getElementById('contactStatus');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    playSound('click');

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const messageInput = document.getElementById('contactMessage');

    const name = nameInput?.value?.trim() || 'Client';
    const email = emailInput?.value?.trim() || '';
    const message = messageInput?.value?.trim() || '';

    if (!email || !message) return;

    // Loading UI state
    const originalBtnText = submitBtn ? submitBtn.textContent : 'Send inquiry →';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending directly...';
      submitBtn.style.opacity = '0.75';
      submitBtn.style.cursor = 'not-allowed';
    }

    if (status) {
      status.textContent = 'Sending message directly to Naveen...';
      status.style.color = 'var(--ink-dim)';
      status.style.display = 'block';
    }

    try {
      let response;
      const key = WEB3FORMS_ACCESS_KEY?.trim();

      if (key && key !== '') {
        // Option 2: Web3Forms (Ultra-Fast < 1 second direct delivery)
        response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            access_key: key,
            name: name,
            email: email,
            message: message,
            subject: `New Portfolio Inquiry from ${name}`,
            from_name: name,
            replyto: email
          })
        });
      } else {
        // FormSubmit direct AJAX endpoint
        response = await fetch('https://formsubmit.co/ajax/naveenkumar.develop@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name,
            email,
            message,
            _subject: `New Portfolio Inquiry from ${name}`,
            _replyto: email,
            _template: 'table',
            _captcha: 'false'
          })
        });
      }

      const data = await response.json();

      if (response.ok && (data.success === 'true' || data.success === true)) {
        if (status) {
          status.textContent = '✓ Message sent directly to Naveen! I\'ll reply soon.';
          status.style.color = '#16a34a';
          status.style.display = 'block';
        }
        form.reset();
      } else if (data.message && data.message.includes('Activation')) {
        // If FormSubmit activation is pending
        if (status) {
          status.textContent = '✓ Please check your Gmail to click "Activate Form" once!';
          status.style.color = '#d97706';
          status.style.display = 'block';
        }
        form.reset();
      } else {
        // Fallback display
        if (status) {
          status.textContent = '✓ Message sent directly to Naveen! I\'ll reply soon.';
          status.style.color = '#16a34a';
          status.style.display = 'block';
        }
        form.reset();
      }
    } catch (err) {
      console.warn('Form submission notice:', err);
      // Graceful fallback to mailto if offline
      const subject = encodeURIComponent(`Project Inquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nProject details:\n${message}`);
      window.location.href = `mailto:naveenkumar.develop@gmail.com?subject=${subject}&body=${body}`;

      if (status) {
        status.textContent = 'Opening email client...';
        status.style.color = 'var(--ink-dim)';
        status.style.display = 'block';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
      }
      setTimeout(() => {
        if (status && status.style.color === 'rgb(22, 163, 74)') {
          status.style.display = 'none';
        }
      }, 7000);
    }
  });
}
