import { playSound } from '../../utils/audio.js';

export function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    playSound('click');
    const name = document.getElementById('contactName')?.value || 'Client';
    const email = document.getElementById('contactEmail')?.value || '';
    const message = document.getElementById('contactMessage')?.value || '';

    const subject = encodeURIComponent(`Project Inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nProject details:\n${message}`);
    window.location.href = `mailto:naveenkumar.dev@outlook.com?subject=${subject}&body=${body}`;

    const status = document.getElementById('contactStatus');
    if (status) {
      status.textContent = 'Opening email client...';
      status.style.display = 'block';
    }
  });
}

