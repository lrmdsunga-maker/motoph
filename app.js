
// ----- Catalog -----
const PRODUCTS = [
  {id:'katana', name:'Suzuki Katana', price:166900, cc:999, brake:'ABS + TC', images:['Suzuki-7.jpg'], desc:'Aggressive naked sport with 999cc inline-four power and suite of rider aids.'},
  {id:'gsx8tt', name:'Suzuki GSX-8TT', price:125900, cc:776, brake:'ABS + TC', images:['suzuki-gsx-8tt-97184.avif'], desc:'Adventure-ready twin with long-travel suspension and modern electronics.'},
  {id:'rocket3', name:'Triumph Rocket III', price:149900, cc:2294, brake:'ABS', images:['Triumph-Rocket-III-motorcycle-2005.webp'], desc:'Legendary cruiser torque with premium finishing and comfort.'},
  {id:'city160', name:'City Commuter 160', price:131900, cc:160, brake:'ABS/CBS', images:['U7NE4JOSA757H7EYU44LJEESSA.avif'], desc:'Refined everyday riding with comfort and efficiency.'}
];

const peso = v => new Intl.NumberFormat('en-PH', {style:'currency',currency:'PHP'}).format(v);
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const CART_KEY = 'motorph_cart_v9';
const DISC_KEY = 'motorph_disc_v1';

function getCart(){ try{return JSON.parse(localStorage.getItem(CART_KEY)||'[]')}catch(e){return []}}
function setCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCartBubble(); }
function addToCart(id,qty=1){ const cart=getCart(); const i=cart.findIndex(x=>x.id===id); if(i>-1){ cart[i].qty+=qty; } else { cart.push({id,qty}); } setCart(cart); }
function removeFromCart(id){ const cart=getCart().filter(x=>x.id!==id); setCart(cart); }
function updateQty(id,delta){ const cart=getCart(); const i=cart.findIndex(x=>x.id===id); if(i>-1){ cart[i].qty += delta; if(cart[i].qty<=0) cart.splice(i,1);} setCart(cart); }
function findProduct(id){ return PRODUCTS.find(p=>p.id===id); }
function cartTotals(){
  const cart=getCart();
  const subtotal = cart.reduce((s,{id,qty})=> s + findProduct(id).price*qty, 0);
  const disc = JSON.parse(localStorage.getItem(DISC_KEY)||'{"code":null,"amount":0}');
  const discount = disc.amount || 0;
  const total = Math.max(0, subtotal - discount);
  return {subtotal, discount, total, code:disc.code};
}
function updateCartBubble(){
  const count = getCart().reduce((s,i)=>s+i.qty,0);
  $$('#cartCount').forEach(el=>{
    el.style.display = count>0 ? 'inline-block' : 'none';
    el.textContent = count;
  });
}
function initHeader(){
  // open cart drawer if exists
  const drawer = $('#drawer');
  if(!drawer) return;
  const open = $('#openCart');
  const closeOverlay = $('#closeCart');
  const closeBtn = $('#closeCartBtn');
  const body = $('#cartBody');
  const subtotalEl=$('#subtotal'), totalEl=$('#total'), discountEl=$('#discount'), discLabel=$('#discLabel');
  const codeInput=$('#code'), applyBtn=$('#applyCode'), clearBtn=$('#clearCart');
  function renderCart(){
    const cart=getCart();
    if(!cart.length){ body.innerHTML='<p class="muted">Your cart is empty.</p>'; subtotalEl.textContent=peso(0); totalEl.textContent=peso(0); discountEl.textContent='− ₱0.00'; discLabel.textContent='None'; return; }
    body.innerHTML = cart.map(({id,qty})=>{
      const p=findProduct(id); const line=p.price*qty;
      return `<div class="line"><img src="${p.images[0]}" alt="${p.name} thumbnail"><div style="flex:1"><div style="display:flex;justify-content:space-between;gap:8px"><strong>${p.name}</strong><strong>${peso(line)}</strong></div><div class="muted">${p.cc}cc • ${p.brake}</div><div style="display:flex;gap:.5rem;align-items:center;margin-top:.25rem"><div class="qty"><button data-minus="${id}">−</button><span>${qty}</span><button data-plus="${id}">+</button></div><button class="btn small secondary" data-remove="${id}">Remove</button></div></div></div>`;
    }).join('');
    $$('#cartBody [data-minus]').forEach(b=> b.onclick=()=>{updateQty(b.dataset.minus,-1); renderCart();});
    $$('#cartBody [data-plus]').forEach(b=> b.onclick=()=>{updateQty(b.dataset.plus,1); renderCart();});
    $$('#cartBody [data-remove]').forEach(b=> b.onclick=()=>{removeFromCart(b.dataset.remove); renderCart();});
    const t = cartTotals();
    subtotalEl.textContent=peso(t.subtotal);
    discountEl.textContent='− '+peso(t.discount);
    totalEl.textContent=peso(t.total);
    discLabel.textContent = t.code ? t.code : 'None';
  }
  function openDrawer(e){ if(e) e.preventDefault(); renderCart(); drawer.classList.add('open'); }
  function closeDrawer(){ drawer.classList.remove('open'); }
  if(open) open.onclick=openDrawer;
  if(closeOverlay) closeOverlay.onclick=closeDrawer;
  if(closeBtn) closeBtn.onclick=closeDrawer;
  if(clearBtn) clearBtn.onclick=()=>{ localStorage.removeItem(CART_KEY); localStorage.removeItem(DISC_KEY); renderCart(); updateCartBubble(); };
  if(applyBtn) applyBtn.onclick=()=>{
    const cart=getCart();
    if(!cart.length){ alert('Add items to cart first.'); return; }
    const c=(codeInput.value||'').trim().toUpperCase();
    if(c==='MOTORPH10'){
      const subtotal = cart.reduce((s,{id,qty})=> s+findProduct(id).price*qty,0);
      localStorage.setItem(DISC_KEY, JSON.stringify({code:c, amount: Math.round(subtotal*0.10)}));
      renderCart();
    } else alert('Invalid code. Try MOTORPH10');
  };
  renderCart();
}

function catalogGrid(targetSel){
  const wrap = $(targetSel);
  if(!wrap) return;
  const search = $('#search'); const sortSel=$('#sort');
  function render(){
    let items = PRODUCTS.slice();
    const term=(search?.value||'').toLowerCase().trim();
    if(term) items = items.filter(p=> p.name.toLowerCase().includes(term));
    if(sortSel?.value==='low') items.sort((a,b)=>a.price-b.price);
    if(sortSel?.value==='high') items.sort((a,b)=>b.price-a.price);
    wrap.innerHTML = items.map(p=>`
      <article class="card">
        <a href="product.html?id=${p.id}" title="View ${p.name}">
          <img src="${p.images[0]}" alt="${p.name} photo"/>
        </a>
        <div class="content">
          <h3 style="margin:0"><a href="product.html?id=${p.id}" style="text-decoration:none">${p.name}</a></h3>
          <div class="muted">${p.cc}cc • ${p.brake}</div>
          <div class="price">${peso(p.price)}</div>
          <div style="display:flex;gap:.5rem;margin-top:auto;flex-wrap:wrap">
            <button class="btn small" data-add="${p.id}">Add to Cart</button>
            <a class="btn small secondary" href="checkout.html" data-buy="${p.id}">Buy Now</a>
            <button class="btn small secondary" data-compare="${p.id}">Compare</button>
          </div>
        </div>
      </article>
    `).join('');
    $$('#grid [data-add]').forEach(el=> el.onclick=()=>{ addToCart(el.dataset.add); updateCartBubble(); });
    $$('#grid [data-buy]').forEach(el=> el.onclick=()=>{ addToCart(el.dataset.buy); updateCartBubble(); });
    $$('#grid [data-compare]').forEach(el=> el.onclick=()=> toggleCompare(el.dataset.compare));
  }
  render(); search?.addEventListener('input',render); sortSel?.addEventListener('change',render);
}

// Compare (catalog)
const compare = new Set();
function toggleCompare(id){ if(compare.has(id)) compare.delete(id); else if(compare.size<3) compare.add(id); renderCompare(); }
function renderCompare(){
  const tray = $('#compareTray'); const table=$('#compareTable'); const count=$('#compareCount');
  if(!tray || !table) return;
  count.textContent = compare.size;
  if(compare.size===0){ tray.style.display='none'; table.innerHTML=''; return; }
  tray.style.display='block';
  const items = PRODUCTS.filter(p=> compare.has(p.id));
  const head = '<tr><th>Spec</th>'+items.map(p=>`<th>${p.name}</th>`).join('')+'</tr>';
  const rows = [
    ['Price', ...items.map(p=> peso(p.price))],
    ['Displacement', ...items.map(p=> p.cc+'cc')],
    ['Brakes', ...items.map(p=> p.brake)],
    ['Summary', ...items.map(p=> p.desc)],
  ].map(r=> '<tr>'+ r.map((c,i)=> i?`<td>${c}</td>`:`<th>${c}</th>`).join('') + '</tr>').join('');
  table.innerHTML = head + rows;
}
function clearCompare(){ compare.clear(); renderCompare(); }

// Product page
function param(name){ return new URLSearchParams(location.search).get(name); }
function initProduct(){
  const id = param('id');
  const p = findProduct(id);
  if(!p){ $('#productArea').innerHTML='<p class="notice">Product not found.</p>'; return; }
  $('#pName').textContent=p.name;
  $('#pPrice').textContent=peso(p.price);
  $('#pDesc').textContent=p.desc;
  $('#pSpec').textContent=`${p.cc}cc • ${p.brake}`;
  const hero = $('#pHero');
  hero.src=p.images[0]; hero.alt=p.name;
  const thumbs = $('#pThumbs');
  thumbs.innerHTML = p.images.map((src,i)=>`<img src="${src}" alt="${p.name} photo ${i+1}" data-idx="${i}" class="${i===0?'active':''}">`).join('');
  $$('#pThumbs img').forEach(t=> t.onclick=()=>{ $$('#pThumbs img').forEach(x=>x.classList.remove('active')); t.classList.add('active'); $('#pHero').src=p.images[+t.dataset.idx]; });
  $('#addOne').onclick=()=>{ addToCart(p.id,1); updateCartBubble(); };
  $('#buyNow').onclick=()=>{ addToCart(p.id,1); updateCartBubble(); location.href='checkout.html'; };
}

// Checkout page
function initCheckout(){
  const empty=$('#emptyCheckout'); const wrap=$('#checkoutWrap');
  function renderSummary(){
    const cart=getCart(); const sum=$('#summary'); const totalEl=$('#summaryTotal');
    if(!cart.length){ empty.style.display='block'; wrap.style.display='none'; return; }
    empty.style.display='none'; wrap.style.display='grid';
    sum.innerHTML = cart.map(({id,qty})=>{ const p=findProduct(id); return `<div style="display:flex;justify-content:space-between;margin:.25rem 0"><span>${qty}× ${p.name}</span><span>${peso(p.price*qty)}</span></div>`; }).join('');
    totalEl.textContent = peso(cartTotals().total);
  }
  renderSummary();
  $('#checkoutForm').addEventListener('submit',(e)=>{
    e.preventDefault();
    if(!getCart().length){ alert('Your cart is empty.'); return; }
    const orderNo='MPH-'+Math.random().toString(36).slice(2,8).toUpperCase();
    $('#orderOk').style.display='block';
    $('#orderOk').textContent=`✅ Order ${orderNo} placed! We emailed a confirmation to ${$('#email').value}.`;
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(DISC_KEY);
    updateCartBubble();
    renderSummary();
    window.scrollTo({top:0,behavior:'smooth'});
  });

  // handle discount on checkout page (same code in cart drawer)
  $('#applyCodeChk')?.addEventListener('click',()=>{
    const code = ($('#codeChk').value||'').trim().toUpperCase();
    if(!getCart().length){ alert('Add items to cart first.'); return; }
    if(code==='MOTORPH10'){
      const subtotal = getCart().reduce((s,{id,qty})=> s + findProduct(id).price*qty, 0);
      localStorage.setItem(DISC_KEY, JSON.stringify({code, amount: Math.round(subtotal*0.10)}));
      $('#discInfo').textContent='Applied MOTORPH10 (10%)';
      $('#summaryTotal').textContent=peso(cartTotals().total);
    } else alert('Invalid code. Try MOTORPH10');
  });
}

// Contact page
function initContact(){
  $('#contactForm')?.addEventListener('submit',(e)=>{
    e.preventDefault();
    $('#contactOk').style.display='block';
    e.target.reset();
  });
}

// Initialize header every page
document.addEventListener('DOMContentLoaded',()=>{
  updateCartBubble();
  initHeader();
});
