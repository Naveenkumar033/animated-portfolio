// Bag drawer: add, change quantity, subtotal, checkout.
import { cart, thumbs } from '../../app/state.js';
import { toast } from '../../components/toast.js';
import { PRODUCTS } from '../../data/products.js';
import { $ } from '../../utils/dom.js';
import { inr } from '../../utils/format.js';

function renderCart(){
  const list = $('#dList'); let total = 0, count = 0;
  if (!cart.size){ list.innerHTML = '<p class="d-empty">Your bag is empty. Add a product to get started.</p>'; }
  else list.innerHTML = [...cart].map(([id, q]) => { const p = PRODUCTS.find(x => x.id === id); total += p.price*q; count += q;
    return `<div class="d-item">${thumbs[id] ? `<img src="${thumbs[id]}" alt="">` : '<div></div>'}<div><b>${p.name}</b><small>${inr(p.price)}</small></div><div class="qty"><button data-id="${id}" data-d="-1" aria-label="Remove one">−</button>${q}<button data-id="${id}" data-d="1" aria-label="Add one">+</button></div></div>`; }).join('');
  $('#dTotal').textContent = inr(total);
  const c = $('#bagCount'); c.textContent = count; c.classList.toggle('has', count > 0);
}

function addToCart(id, btn){
  cart.set(id, (cart.get(id) || 0) + 1); renderCart();
  const bag = $('#bagBtn'); bag.classList.remove('bump'); void bag.offsetWidth; bag.classList.add('bump');
  const p = PRODUCTS.find(x => x.id === id); toast(`${p.name} added to your bag`);
  if (btn && btn.classList.contains('add')){ const o = btn.textContent; btn.classList.add('ok'); btn.textContent = 'Added ✓'; setTimeout(() => { btn.classList.remove('ok'); btn.textContent = o; }, 1400); }
}

function openBag(open){ $('#drawer').classList.toggle('open', open); $('#scrim').classList.toggle('open', open); $('#drawer').setAttribute('aria-hidden', !open); }

// wires the bag drawer, quantity buttons and checkout
function initCart(){
  document.addEventListener('click', e => {
    const a = e.target.closest('.add, .mini-add'); if (a && a.dataset.id) addToCart(a.dataset.id, a);
    const q = e.target.closest('.qty button');
    if (q){ const id = q.dataset.id, n = (cart.get(id) || 0) + +q.dataset.d; if (n <= 0) cart.delete(id); else cart.set(id, n); renderCart(); }
  });
  $('#bagBtn').addEventListener('click', () => openBag(true));
  $('#closeBag').addEventListener('click', () => openBag(false));
  $('#scrim').addEventListener('click', () => openBag(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') openBag(false); });
  $('#checkout').addEventListener('click', () => {
    if (!cart.size) return toast('Your bag is empty');
    // hand the bag to a hosted checkout when one is configured (see .env.example)
    const url = import.meta.env.VITE_CHECKOUT_URL;
    if (url){ const items = [...cart].map(([id, q]) => `${id}:${q}`).join(','); window.location.href = `${url}${url.includes('?') ? '&' : '?'}items=${encodeURIComponent(items)}`; return; }
    toast('Checkout connects to your payment gateway at launch');
  });
}

export { renderCart, initCart };
