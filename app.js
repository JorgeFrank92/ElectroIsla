const WHATSAPP="5352017110";
const defaultProducts=[
{id:"a1",name:"Carne de cerdo",category:"Alimentos",price:12.5,currency:"USD",discountPrice:null,unit:"kg",image:"",description:"Carne de cerdo.",available:true},
{id:"a2",name:"Aceite",category:"Alimentos",price:8,currency:"USD",discountPrice:null,unit:"botella",image:"",description:"Aceite para cocina.",available:true},
{id:"a3",name:"Pescado",category:"Alimentos",price:10,currency:"USD",discountPrice:null,unit:"kg",image:"",description:"Pescado.",available:true},
{id:"a4",name:"Combo de alimentos",category:"Alimentos",price:35,currency:"USD",discountPrice:null,unit:"combo",image:"",description:"Combo promocional.",available:true},
{id:"e1",name:"Split",category:"Electrodomésticos",price:270,currency:"USD",discountPrice:null,unit:"unidad",image:"",description:"Aire acondicionado Split.",available:true},
{id:"e2",name:"Ventilador recargable",category:"Electrodomésticos",price:65,currency:"USD",discountPrice:null,unit:"unidad",image:"",description:"Ventilador recargable.",available:true},
{id:"e3",name:"Lavadora",category:"Electrodomésticos",price:320,currency:"USD",discountPrice:null,unit:"unidad",image:"",description:"Lavadora.",available:true},
{id:"e4",name:"Cocina",category:"Electrodomésticos",price:180,currency:"USD",discountPrice:null,unit:"unidad",image:"",description:"Cocina doméstica.",available:true}
];
let products=JSON.parse(localStorage.getItem("electroisla_products")||"null")||defaultProducts;
let cart=JSON.parse(localStorage.getItem("electroisla_cart")||"[]");
let storeSettings={usd_to_cup:700,transfer_markup_percent:0};
const currencySymbols={USD:"$",CUP:"$",EUR:"€"};
const money=(n,currency="USD")=>(currencySymbols[currency]||"")+Number(n).toFixed(2)+" "+currency;
const effectivePrice=p=>Number.isFinite(Number(p.discountPrice))&&Number(p.discountPrice)>0&&Number(p.discountPrice)<Number(p.price)?Number(p.discountPrice):Number(p.price);
const cashCup=p=>{const base=effectivePrice(p);if((p.currency||"USD")==="USD")return base*Number(storeSettings.usd_to_cup||0);if((p.currency||"USD")==="CUP")return base;return null};
const transferCup=p=>{const cash=cashCup(p);return cash===null?null:cash*(1+Number(storeSettings.transfer_markup_percent||0)/100)};
const DELIVERY_FEES={
 "Nueva Gerona":0,
 "Micro 70":0,
 "Micro 2":0,
 "Abel Santa María":0,
 "Pueblo Nuevo":0,
 "Francoi":0,
 "Sierra Caballos":0,
 "Nazareno":0,
 "Chacón":5,
 "Patria":5,
 "Los Colonos":5,
 "Los Bejeranos":5,
 "La Fe":10,
 "Demajagua":10,
 "La Victoria":10,
 "Atanagildo":10,
 "Mella":10,
 "Ciro Redondo":10,
 "Otro":10
};
function getDeliveryZone(){
 const zone=document.getElementById("municipality")?.value||"";
 const other=document.getElementById("otherZone")?.value.trim()||"";
 return zone==="Otro"?(other?`Otro: ${other}`:"Otro"):zone;
}
function getDeliveryFeeUSD(){
 const delivery=document.getElementById("delivery")?.value||"Sí";
 const zone=document.getElementById("municipality")?.value||"";
 if(delivery!=="Sí"||!zone)return 0;
 return Number(DELIVERY_FEES[zone]||0);
}
function updateDeliveryFields(){
 const zone=document.getElementById("municipality")?.value||"";
 const wrap=document.getElementById("otherZoneWrap");
 const input=document.getElementById("otherZone");
 if(wrap)wrap.classList.toggle("hidden",zone!=="Otro");
 if(input){
  input.required=zone==="Otro";
  if(zone!=="Otro")input.value="";
 }
 updatePaymentSummary();
}

function priceMarkup(p){const cur=p.currency||"USD",sym=currencySymbols[cur]||"";const discounted=effectivePrice(p)<Number(p.price);const original=discounted?`<span class="old-price">${sym}${Number(p.price).toFixed(2)} ${cur}</span> `:"";const base=`${original}<span class="discount-price">${sym}${effectivePrice(p).toFixed(2)} ${cur}</span>`;const cash=cashCup(p),transfer=transferCup(p);if(cash===null)return `${base}<div class="cup-note">CUP: configura una tasa para ${cur}</div>`;return `${base}<div class="cup-price">💵 Efectivo: ${money(cash,"CUP")}</div><div class="cup-price">💳 Transferencia: ${money(transfer,"CUP")}</div>`;}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
async function loadStoreSettings(){const {data,error}=await supabaseClient.from("store_settings").select("usd_to_cup,transfer_markup_percent").eq("id",1).maybeSingle();if(error)throw error;if(data){storeSettings={usd_to_cup:Number(data.usd_to_cup)||0,transfer_markup_percent:Number(data.transfer_markup_percent)||0}}}
function save(){localStorage.setItem("electroisla_products",JSON.stringify(products));localStorage.setItem("electroisla_cart",JSON.stringify(cart))}
function fromRow(r){return{id:String(r.id),name:r.name||"",category:r.category||"Alimentos",price:Number(r.price)||0,currency:r.currency||"USD",discountPrice:r.discount_price===null||r.discount_price===undefined||Number(r.discount_price)<=0?null:Number(r.discount_price),unit:r.unit||"",image:r.image||"",description:r.description||"",available:r.available!==false}}
async function loadCloudProducts(){const {data,error}=await supabaseClient.from("products").select("*").order("created_at",{ascending:true});if(error)throw error;if(data&&data.length){products=data.map(fromRow);save();return true}return false}
async function startCloud(){try{await loadStoreSettings();await loadCloudProducts();render();renderCart()}catch(err){console.warn("Supabase no disponible; usando catálogo local.",err);render();renderCart()}}
function render(filter="Todos"){const box=document.getElementById("products");if(!box)return;const list=products.filter(p=>p.available&&(filter==="Todos"||p.category===filter));box.innerHTML=list.map(p=>`<article class="product"><div class="product-img">${p.image?`<img src="${p.image}" alt="">`:(p.category==="Alimentos"?"🥩":"🏠")}</div><div class="product-body"><span class="tag">${esc(p.category)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description||"")}</p><div class="price">${priceMarkup(p)} <small>${esc(p.unit||"")}</small></div><button class="btn primary add" onclick="add('${esc(p.id)}')">🛒 Agregar</button></div></article>`).join("")||"<p>No hay productos disponibles en esta categoría.</p>"}
function add(id){const x=cart.find(i=>i.id===id);x?x.qty++:cart.push({id,qty:1});save();renderCart();openCart()}
function change(id,d){const x=cart.find(i=>i.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)cart=cart.filter(i=>i.id!==id);save();renderCart()}
function getOrderTotals(){
 let usdTotal=0,cashTotal=0,transferTotal=0,usdAvailable=true,cupAvailable=true;
 cart.forEach(i=>{
  const p=products.find(x=>x.id===i.id); if(!p)return;
  const cur=p.currency||"USD", unitPrice=effectivePrice(p), qty=i.qty;
  if(cur==="USD") usdTotal+=unitPrice*qty; else usdAvailable=false;
  const cash=cashCup(p), transfer=transferCup(p);
  if(cash===null||transfer===null){cupAvailable=false;return}
  cashTotal+=cash*qty; transferTotal+=transfer*qty;
 });
 const deliveryFeeUSD=getDeliveryFeeUSD();
 const deliveryFeeCUP=deliveryFeeUSD*Number(storeSettings.usd_to_cup||0);
 const deliveryFeeTransfer=deliveryFeeCUP*(1+Number(storeSettings.transfer_markup_percent||0)/100);
 usdTotal+=deliveryFeeUSD;
 cashTotal+=deliveryFeeCUP;
 transferTotal+=deliveryFeeTransfer;
 return {usdTotal,cashTotal,transferTotal,deliveryFeeUSD,deliveryFeeCUP,deliveryFeeTransfer,usdAvailable,cupAvailable};
}
function updatePaymentSummary(){
 const box=document.getElementById("paymentSummary"); if(!box)return;
 const totals=getOrderTotals();
 const usdRadio=document.querySelector('input[name="paymentMethod"][value="USD"]');
 const cupRadio=document.querySelector('input[name="paymentMethod"][value="CUP"]');
 const transferRadio=document.querySelector('input[name="paymentMethod"][value="TRANSFERENCIA"]');
 if(usdRadio)usdRadio.disabled=!totals.usdAvailable;
 if(cupRadio)cupRadio.disabled=!totals.cupAvailable;
 if(transferRadio)transferRadio.disabled=!totals.cupAvailable;
 const selected=document.querySelector('input[name="paymentMethod"]:checked');
 if(selected&&selected.disabled){
  const fallback=document.querySelector('input[name="paymentMethod"]:not(:disabled)');
  if(fallback)fallback.checked=true;
 }
 const method=document.querySelector('input[name="paymentMethod"]:checked')?.value||"USD";
 const amount=method==="USD"?money(totals.usdTotal,"USD"):method==="CUP"?money(totals.cashTotal,"CUP"):money(totals.transferTotal,"CUP");
 const label=method==="USD"?"USD":method==="CUP"?"CUP (efectivo)":"Transferencia";
 const fee=totals.deliveryFeeUSD;
 const feeSelected=method==="USD"?money(totals.deliveryFeeUSD,"USD"):method==="CUP"?money(totals.deliveryFeeCUP,"CUP"):money(totals.deliveryFeeTransfer,"CUP");
 const feeText=fee>0?`Domicilio: ${feeSelected}`:"Domicilio: Gratis";
 const zoneName=getDeliveryZone();
 box.innerHTML=`<strong>Total a pagar: ${amount}</strong><span>${zoneName?`Zona: ${esc(zoneName)}`:"Selecciona una zona"}</span><span>${feeText}</span><span>Método seleccionado: ${label}</span>`;
}
function renderCart(){
 const box=document.getElementById("cartItems"),count=cart.reduce((s,i)=>s+i.qty,0);document.getElementById("cartCount").textContent=count;
 let cashTotal=0,transferTotal=0,usdTotal=0,hasCup=true,hasUsd=true;
 box.innerHTML=cart.length?cart.map(i=>{const p=products.find(x=>x.id===i.id);if(!p)return"";const cur=p.currency||"USD",unitPrice=effectivePrice(p),lineTotal=unitPrice*i.qty;const cash=cashCup(p),transfer=transferCup(p);if(cur==="USD")usdTotal+=lineTotal;else hasUsd=false;if(cash!==null){cashTotal+=cash*i.qty;transferTotal+=transfer*i.qty}else hasCup=false;return `<div class="cart-row"><div><strong>${esc(p.name)}</strong><br><small>${money(unitPrice,cur)} × ${i.qty}</small>${cash!==null?`<br><small>💵 ${money(cash,"CUP")} · 💳 ${money(transfer,"CUP")}</small>`:""}</div><div class="qty"><button onclick="change('${esc(p.id)}',-1)">−</button><b>${i.qty}</b><button onclick="change('${esc(p.id)}',1)">+</button></div></div>`}).join(""):"<p>Tu carrito está vacío.</p>";
 document.getElementById("cartTotal").innerHTML=cart.length?`<div><span>💵 USD</span><br><strong>${hasUsd?money(usdTotal,"USD"):"—"}</strong></div><div><span>🇨🇺 CUP</span><br><strong>${hasCup?money(cashTotal,"CUP"):"—"}</strong></div><div><span>💳 Transferencia</span><br><strong>${hasCup?money(transferTotal,"CUP"):"—"}</strong></div>`:`<div><span>Total</span><br><strong>$0.00 USD</strong></div>`;
 updatePaymentSummary();
}
function openCart(){document.getElementById("cart").classList.add("open");document.getElementById("cartOverlay").classList.remove("hidden")}function closeCart(){document.getElementById("cart").classList.remove("open");document.getElementById("cartOverlay").classList.add("hidden")}function openCheckout(){if(!cart.length){alert("Agrega al menos un producto.");return}updatePaymentSummary();document.getElementById("checkoutModal").classList.remove("hidden")}
document.querySelectorAll(".filter,.store-card").forEach(b=>b.addEventListener("click",()=>{const f=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter===f));render(f);document.getElementById("ofertas").scrollIntoView({behavior:"smooth"})}));
document.getElementById("cartBtn").onclick=openCart;document.getElementById("closeCart").onclick=closeCart;document.getElementById("cartOverlay").onclick=closeCart;document.getElementById("checkoutBtn").onclick=openCheckout;document.getElementById("closeModal").onclick=()=>document.getElementById("checkoutModal").classList.add("hidden");
document.getElementById("orderForm").addEventListener("submit",e=>{e.preventDefault();const totals=getOrderTotals();const method=document.querySelector('input[name="paymentMethod"]:checked')?.value;if(!method){alert("Selecciona un método de pago.");return}if(method==="USD"&&!totals.usdAvailable){alert("El pago en USD no está disponible para este pedido.");return}if((method==="CUP"||method==="TRANSFERENCIA")&&!totals.cupAvailable){alert("Los precios en CUP no están disponibles para todos los productos de este pedido.");return}const zone=document.getElementById("municipality").value,other=document.getElementById("otherZone").value.trim(),delivery=document.getElementById("delivery").value;if(!zone){alert("Selecciona la zona de entrega.");return}if(zone==="Otro"&&!other){alert("Escribe cuál es tu zona de entrega.");return}const lines=cart.map(i=>{const p=products.find(x=>x.id===i.id);if(!p)return"";const cur=p.currency||"USD",unitPrice=effectivePrice(p),lineTotal=unitPrice*i.qty,cash=cashCup(p),transfer=transferCup(p);let selectedLine="";if(method==="USD")selectedLine=money(lineTotal,"USD");else if(method==="CUP")selectedLine=money(cash*i.qty,"CUP");else selectedLine=money(transfer*i.qty,"CUP");return `• ${p.name} — ${i.qty} ${p.unit||"unidad"} — ${selectedLine}`}).join("\n");const name=document.getElementById("customerName").value.trim(),phone=document.getElementById("customerPhone").value.trim(),zoneName=zone==="Otro"?other:zone,note=document.getElementById("note").value.trim();const paymentLabel=method==="USD"?"USD":method==="CUP"?"CUP (efectivo)":"TRANSFERENCIA";const subtotalSelected=method==="USD"?money(totals.usdTotal-totals.deliveryFeeUSD,"USD"):method==="CUP"?money(totals.cashTotal-totals.deliveryFeeCUP,"CUP"):money(totals.transferTotal-totals.deliveryFeeTransfer,"CUP");const paymentTotal=method==="USD"?money(totals.usdTotal,"USD"):method==="CUP"?money(totals.cashTotal,"CUP"):money(totals.transferTotal,"CUP");const deliverySelected=method==="USD"?money(totals.deliveryFeeUSD,"USD"):method==="CUP"?money(totals.deliveryFeeCUP,"CUP"):money(totals.deliveryFeeTransfer,"CUP");const deliveryText=delivery==="Sí"?(totals.deliveryFeeUSD>0?deliverySelected:"Gratis"):"No requiere entrega";const msg=`🛒 NUEVO PEDIDO\n\n👤 Cliente: ${name}\n📱 Teléfono: ${phone}\n\n🛍️ PRODUCTOS:\n${lines}\n\n📍 Zona de entrega: ${zoneName}\n🚚 Entrega: ${delivery}\n💵 Domicilio: ${deliveryText}\n\n💳 MÉTODO DE PAGO: ${paymentLabel}\n🧾 Subtotal: ${subtotalSelected}\n🚚 Domicilio: ${deliveryText}\n💰 TOTAL A PAGAR: ${paymentTotal}${note?`\n📝 Nota: ${note}`:""}`;window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`,"_blank")});
document.querySelectorAll('input[name="paymentMethod"]').forEach(r=>r.addEventListener("change",updatePaymentSummary));
document.getElementById("municipality")?.addEventListener("change",updateDeliveryFields);
document.getElementById("delivery")?.addEventListener("change",updatePaymentSummary);
document.getElementById("otherZone")?.addEventListener("input",updatePaymentSummary);

render();renderCart();startCloud();
supabaseClient.channel("settings-store").on("postgres_changes",{event:"*",schema:"public",table:"store_settings"},async()=>{try{await loadStoreSettings();render();renderCart()}catch(e){console.warn(e)}}).subscribe();
supabaseClient.channel("products-store").on("postgres_changes",{event:"*",schema:"public",table:"products"},async()=>{try{await loadCloudProducts();render();renderCart()}catch(e){console.warn(e)}}).subscribe();
