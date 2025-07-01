// WhatsApp number for orders (change as needed)
const WHATSAPP_NUMBER = '250793261747'; // Example: 2507932617474 (no + or spaces)

const products = window.PRODUCTS;
let currentCategory = 'All';
let cart = [];
let searchTerm = '';
let sortOption = 'default';

const productsDiv = document.getElementById('products');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsDiv = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const categoryBtns = document.querySelectorAll('.category-btn');
const checkoutForm = document.getElementById('checkout-form');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

function renderProducts() {
  productsDiv.innerHTML = '';
  let filtered = products;
  if (currentCategory !== 'All') {
    filtered = filtered.filter(p => p.category === currentCategory);
  }
  if (searchTerm) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
  }
  // Sort logic
  if (sortOption === 'price-asc') {
    filtered = filtered.slice().sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-desc') {
    filtered = filtered.slice().sort((a, b) => b.price - a.price);
  } else if (sortOption === 'az') {
    filtered = filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === 'za') {
    filtered = filtered.slice().sort((a, b) => b.name.localeCompare(a.name));
  }
  if (filtered.length === 0) {
    productsDiv.innerHTML = '<div class="col-span-full text-center text-gray-500 text-lg">No products found. Try another search.</div>';
    return;
  }
  filtered.forEach(product => {
    const card = document.createElement('div');
    // Main image and thumbnails logic
    const mainImgId = `main-img-${product.id}`;
    let thumbnailsHTML = '';
    if (product.images && product.images.length > 1) {
      thumbnailsHTML = `<div class="product-thumbnails">` +
        product.images.map((img, idx) =>
          `<img src="${img}" class="product-thumbnail${idx === 0 ? ' selected' : ''}" data-idx="${idx}" data-main="${mainImgId}">`
        ).join('') +
        `</div>`;
    }
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" id="${mainImgId}">
      ${thumbnailsHTML}
      <div class="product-info">
        <div class="product-title">${product.name}</div>
        <div class="product-price">RWF ${product.price.toLocaleString()}</div>
        <button class="add-to-basket" data-id="${product.id}">Add to Basket</button>
      </div>
    `;
    // Add thumbnail hover/click logic
    card.addEventListener('mouseover', function(e) {
      if (e.target.classList.contains('product-thumbnail')) {
        const idx = +e.target.dataset.idx;
        const mainImg = card.querySelector(`#${mainImgId}`);
        mainImg.src = product.images[idx];
        card.querySelectorAll('.product-thumbnail').forEach((thumb, i) => {
          thumb.classList.toggle('selected', i === idx);
        });
      }
    });
    card.addEventListener('click', function(e) {
      if (e.target.classList.contains('product-thumbnail')) {
        const idx = +e.target.dataset.idx;
        const mainImg = card.querySelector(`#${mainImgId}`);
        mainImg.src = product.images[idx];
        card.querySelectorAll('.product-thumbnail').forEach((thumb, i) => {
          thumb.classList.toggle('selected', i === idx);
        });
      }
    });
    productsDiv.appendChild(card);
  });
}

function updateCartCount() {
  cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

function showCart() {
  renderCartItems();
  cartModal.classList.remove('hidden');
}

function hideCart() {
  cartModal.classList.add('hidden');
}

function renderCartItems() {
  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<div class="text-gray-400 text-center text-lg">Your basket is empty.</div>';
    return;
  }
  cartItemsDiv.innerHTML = '';
  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    const div = document.createElement('div');
    div.className = 'flex items-center justify-between mb-2 bg-white rounded p-2 shadow-sm border border-gray-300';
    div.innerHTML = `
      <div class="flex items-center gap-2">
        <img src="${product.image}" alt="${product.name}" class="w-10 h-10 object-cover rounded border border-gray-300">
        <div>
          <div class="font-semibold text-black">${product.name}</div>
          <div class="text-xs text-blue-700">RWF ${product.price.toLocaleString()} x ${item.qty}</div>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <button class="decrease px-2 py-0.5 bg-gray-200 text-black rounded-full font-bold text-lg" data-id="${item.id}">-</button>
        <span class="px-2 font-bold text-black">${item.qty}</span>
        <button class="increase px-2 py-0.5 bg-blue-100 text-black rounded-full font-bold text-lg" data-id="${item.id}">+</button>
        <button class="remove text-red-400 ml-2 text-xl" data-id="${item.id}">&times;</button>
      </div>
    `;
    cartItemsDiv.appendChild(div);
  });
}

productsDiv.addEventListener('click', e => {
  if (e.target.classList.contains('add-to-basket')) {
    const id = +e.target.dataset.id;
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id, qty: 1 });
    }
    updateCartCount();
  }
});

cartBtn.addEventListener('click', showCart);
closeCartBtn.addEventListener('click', hideCart);
cartModal.addEventListener('click', e => { if (e.target === cartModal) hideCart(); });

cartItemsDiv.addEventListener('click', e => {
  const id = +e.target.dataset.id;
  if (e.target.classList.contains('increase')) {
    const item = cart.find(i => i.id === id);
    item.qty++;
  } else if (e.target.classList.contains('decrease')) {
    const item = cart.find(i => i.id === id);
    if (item.qty > 1) item.qty--;
  } else if (e.target.classList.contains('remove')) {
    cart = cart.filter(i => i.id !== id);
  }
  renderCartItems();
  updateCartCount();
});

categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentCategory = btn.dataset.category;
    categoryBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProducts();
  });
});

checkoutForm.addEventListener('submit', function(e) {
  e.preventDefault();
  if (cart.length === 0) {
    alert('Your basket is empty!');
    return;
  }
  const data = new FormData(checkoutForm);
  const name = data.get('name');
  const phone = data.get('phone');
  const location = data.get('location');
  const notes = data.get('notes');
  let message = `Order from Light Online Store%0A`;
  message += `Name: ${name}%0APhone: ${phone}%0ALocation: ${location}%0A`;
  if (notes) message += `Notes: ${notes}%0A`;
  message += `%0AItems:%0A`;
  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    message += `- ${product.name} x${item.qty} (RWF ${product.price.toLocaleString()})%0A`;
  });
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(url, '_blank');
});

if (searchInput) {
  searchInput.addEventListener('input', function() {
    searchTerm = this.value.trim().toLowerCase();
    renderProducts();
  });
}

if (sortSelect) {
  sortSelect.addEventListener('change', function() {
    sortOption = this.value;
    renderProducts();
  });
}

// Initial render
renderProducts();
updateCartCount(); 