import { $ } from '../../utils/dom.js';

// validates the contact form; posts it to VITE_CONTACT_ENDPOINT when one is configured
function initContactForm(){
  $('#form').addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, ok = $('#formOk');
    const name = $('#f-name').value.trim(), email = $('#f-email').value.trim();
    const say = (msg, warn) => { ok.hidden = false; ok.style.color = warn ? 'var(--gold)' : ''; ok.textContent = msg; };
    if (!name) return say('Please add your name.', true);
    if (!/^\S+@\S+\.\S+$/.test(email)) return say('Please enter a valid email address, like you@company.com.', true);
    const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT;
    if (!endpoint){ say(`Thanks, ${name}. Your message is ready for the TranzLife team. Connect this form to your inbox or CRM at launch.`); f.reset(); return; }
    try {
      const res = await fetch(endpoint, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(Object.fromEntries(new FormData(f))) });
      if (!res.ok) throw new Error(res.status);
      say(`Thanks, ${name}. The TranzLife team will reply within two working days.`); f.reset();
    } catch(err){ say('Sorry, the message could not be sent. Please try again in a moment.', true); }
  });
}

export { initContactForm };
