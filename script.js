const PRODUCTS = [
  { id:1, title:'Wireless Earbuds', price:1499, img:'https://images.unsplash.com/photo-1585386959984-a4155222c9c1' },
  { id:2, title:'Headphones', price:2499, img:'https://images.pexels.com/photos/3394652/pexels-photo-3394652.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { id:3, title:'Smart Watch', price:3999, img:'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=900&q=80' },
  { id:4, title:'Laptop', price:49999, img:'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=900' }
];

const DB = {
  users: ()=> JSON.parse(localStorage.getItem('ec_users')||'[]'),
  saveUsers: u => localStorage.setItem('ec_users', JSON.stringify(u)),
  current: ()=> JSON.parse(localStorage.getItem('ec_current') || 'null'),
  setCurrent: u => localStorage.setItem('ec_current', JSON.stringify(u)),
  wishlist: ()=> JSON.parse(localStorage.getItem('ec_wishlist')||'[]'),
  setWishlist: v => localStorage.setItem('ec_wishlist', JSON.stringify(v)),
  orders: ()=> JSON.parse(localStorage.getItem('ec_orders')||'[]'),
  setOrders: v => localStorage.setItem('ec_orders', JSON.stringify(v)),
  reviews: ()=> JSON.parse(localStorage.getItem('ec_reviews')||'[]'),
  setReviews: v => localStorage.setItem('ec_reviews', JSON.stringify(v)),
  supports: ()=> JSON.parse(localStorage.getItem('ec_supports')||'[]'),
  setSupports: v => localStorage.setItem('ec_supports', JSON.stringify(v)),
};

function el(tag, cls, html){
  const e=document.createElement(tag);
  if(cls) e.className=cls;
  if(html) e.innerHTML=html;
  return e;
}

function initRegister(){
  const form = document.getElementById('registerForm');
  if(!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const pass = document.getElementById('regPass').value;
    const conf = document.getElementById('regConfirm').value;
    const errors = [];
    if(name.length < 3) errors.push('Name must be at least 3 characters');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid email');
    if(pass.length < 6) errors.push('Password min 6 chars');
    if(pass !== conf) errors.push("Passwords don't match");
    if(errors.length){ alert(errors.join('\n')); return; }
    const users = DB.users();
    if(users.find(u=>u.email===email)){ alert('Email already registered'); return; }
    users.push({name,email,password:pass});
    DB.saveUsers(users);
    DB.setCurrent({name,email});
    alert('Registration successful — logged in');
    location.href='index.html';
  });
}

function initLogin(){
  const form = document.getElementById('loginForm');
  if(!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const pass = document.getElementById('loginPass').value;
    const users = DB.users();
    const user = users.find(u=>u.email===email && u.password===pass);
    if(!user){ alert('Invalid credentials'); return; }
    DB.setCurrent({name:user.name,email:user.email});
    alert('Login successful');
    location.href='index.html';
  });
}

function renderProductsGrid(){
  const grid = document.getElementById('productsGrid');
  if(!grid) return;
  grid.innerHTML = '';
  PRODUCTS.forEach(p=>{
    const card = el('div','card');
    const img = el('img'); img.src=p.img; img.alt=p.title;
    const h = el('h3',null,p.title);
    const price = el('p','price','₹'+p.price.toLocaleString());
    const controls = el('div','controls');
    const wishBtn = el('button','btn-ghost','Wishlist'); wishBtn.onclick=()=>addToWishlist(p.id);
    const buyBtn = el('button','btn-primary','Buy Now'); buyBtn.onclick=()=>placeOrder(p.id);
    const reviewBtn = el('button','btn-ghost','Review'); reviewBtn.onclick=()=>promptReview(p.id);
    controls.appendChild(wishBtn); controls.appendChild(buyBtn); controls.appendChild(reviewBtn);
    card.appendChild(img); card.appendChild(h); card.appendChild(price); card.appendChild(controls);
    grid.appendChild(card);
  });
}

function addToWishlist(productId){
  const cur = DB.current();
  if(!cur){ if(confirm('Login required. Go to login?')) location.href='login.html'; return; }
  const p = PRODUCTS.find(x=>x.id===productId);
  const list = DB.wishlist();
  if(list.find(x=>x.id===productId)){ alert('Already in wishlist'); return; }
  list.push({...p, addedAt:new Date().toISOString()});
  DB.setWishlist(list);
  alert(p.title + ' added to wishlist');
  if(location.pathname.endsWith('wishlist.html')) showWishlist();
}

function showWishlist(){
  const grid = document.getElementById('wishlistGrid');
  if(!grid) return;
  const list = DB.wishlist();
  grid.innerHTML='';
  if(list.length===0){
    grid.innerHTML = '<p class="text-muted center">No items in wishlist yet.</p>';
    return;
  }
  list.forEach(item=>{
    const card = el('div','card');
    const img = el('img'); img.src=item.img; img.alt=item.title;
    const h = el('h3',null,item.title);
    const price = el('p','price','₹'+item.price.toLocaleString());
    const remove = el('button','btn-ghost','Remove'); remove.onclick=()=>{
      const remaining = DB.wishlist().filter(x=>x.id!==item.id);
      DB.setWishlist(remaining);
      showWishlist();
    };
    const buy = el('button','btn-primary','Buy Now'); buy.onclick=()=>placeOrder(item.id);
    const cont = el('div','controls'); cont.appendChild(remove); cont.appendChild(buy);
    card.appendChild(img); card.appendChild(h); card.appendChild(price); card.appendChild(cont);
    grid.appendChild(card);
  });
}

function placeOrder(productId){
  const cur = DB.current();
  if(!cur){ if(confirm('Login required. Go to login?')) location.href='login.html'; return; }
  const p = PRODUCTS.find(x=>x.id===productId);
  const orders = DB.orders();
  orders.push({...p, orderedAt:new Date().toISOString()});
  DB.setOrders(orders);
  alert('Order placed for ' + p.title);
  if(location.pathname.endsWith('orders.html')) showOrders();
}

function showOrders(){
  const grid = document.getElementById('ordersGrid');
  if(!grid) return;
  const list = DB.orders();
  grid.innerHTML='';
  if(list.length===0){
    grid.innerHTML='<p class="text-muted center">You have not placed any orders.</p>';
    return;
  }
  list.forEach(item=>{
    const card = el('div','card');
    const img = el('img'); img.src=item.img; img.alt=item.title;
    const h = el('h3',null,item.title);
    const price = el('p','price','₹'+item.price.toLocaleString());
    const ts = el('p','text-muted','Ordered: '+ new Date(item.orderedAt).toLocaleString());
    card.appendChild(img); card.appendChild(h); card.appendChild(price); card.appendChild(ts);
    grid.appendChild(card);
  });
}

function promptReview(productId){
  const cur = DB.current();
  if(!cur){ if(confirm('Login required to submit review. Go to login?')) location.href='login.html'; return; }
  const txt = prompt('Write review for product (short):');
  if(!txt) return;
  const rating = prompt('Rating 1-5 (enter number):','5');
  if(!rating) return;
  const reviews = DB.reviews();
  reviews.push({ productId, text: txt, rating: Number(rating), author: cur.name, date: new Date().toISOString() });
  DB.setReviews(reviews);
  alert('Thanks for your review!');
  if(location.pathname.endsWith('reporting.html')) renderReports();
}

function initSupport(){
  const form = document.getElementById('supportForm');
  if(!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const name = document.getElementById('supName').value.trim();
    const email = document.getElementById('supEmail').value.trim();
    const msg = document.getElementById('supMsg').value.trim();
    if(!name||!email||!msg){ alert('Fill all fields'); return; }
    const supports = DB.supports();
    supports.push({name,email,message:msg,date:new Date().toISOString()});
    DB.setSupports(supports);
    alert('Support ticket submitted. We will contact you shortly.');
    form.reset();
    renderSupportList();
  });
}

function renderSupportList(){
  const box = document.getElementById('supportList');
  if(!box) return;
  const supports = DB.supports();
  if(supports.length===0){
    box.innerHTML = '<p class="text-muted">No tickets yet.</p>';
    return;
  }
  box.innerHTML = '';
  supports.slice().reverse().forEach(s=>{
    const wrap = el('div','section');
    wrap.innerHTML = `<strong>${s.name}</strong> <span class="text-muted">(${new Date(s.date).toLocaleString()})</span><p class="text-muted">${s.message}</p>`;
    box.appendChild(wrap);
  });
}

function renderReports(){
  const revBox = document.getElementById('reportsReviews');
  const supBox = document.getElementById('reportsSupports');
  const reviews = DB.reviews();
  const supports = DB.supports();
  if(revBox){
    revBox.innerHTML = reviews.length ? reviews.slice().reverse().map(r=>`<div class="section"><strong>${r.author}</strong> rated <strong>${r.rating}/5</strong><p class="text-muted">${r.text}</p><small class="text-muted">${new Date(r.date).toLocaleString()}</small></div>`).join('') : '<p class="text-muted">No reviews yet.</p>';
  }
  if(supBox){
    supBox.innerHTML = supports.length ? supports.slice().reverse().map(s=>`<div class="section"><strong>${s.name}</strong> <small class="text-muted">(${new Date(s.date).toLocaleString()})</small><p class="text-muted">${s.message}</p></div>`).join('') : '<p class="text-muted">No tickets yet.</p>';
  }
}

function showUserInHeader(){
  const cur = DB.current();
  if(cur) console.info('Logged in as', cur.name);
}

document.addEventListener('DOMContentLoaded', ()=>{
  initRegister(); 
  initLogin(); 
  initSupport();
  renderProductsGrid(); 
  showWishlist(); 
  showOrders();
  renderSupportList(); 
  renderReports(); 
  showUserInHeader();
});
