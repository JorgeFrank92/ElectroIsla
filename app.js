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
const currencySymbols={USD:"$",CUP:"$",EUR:"€"};
const money=(n,currency="USD")=>(currencySymbols[currency]||"")+Number(n).toFixed(2)+" "+currency;
const effectivePrice=p=>Number.isFinite(Number(p.discountPrice))&&Number(p.discountPrice)>=0&&Number(p.discountPrice)<Number(p.price)?Number(p.discountPrice):Number(p.price);
function priceMarkup(p){
 const cur=p.currency||"USD", sym=currencySymbols[cur]||"";
 const discounted=effectivePrice(p)<Number(p.price);
 return discounted?`<span class="old-price">${sym}${Number(p.price).toFixed(2)} ${cur}</span> <span class="discount-price">${sym}${effectivePrice(p).toFixed(2)} ${cur}</span>`:`${sym}${Number(p.price).toFixed(2)} ${cur}`;
}
function save(){localStorage.setItem("electroisla_products",JSON.stringify(products));localStorage.setItem("electroisla_cart",JSON.stringify(cart))}
function render(filter="Todos"){
 const box=document.getElementById("products"); if(!box)return;
 const list=products.filter(p=>p.available&&(filter==="Todos"||p.category===filter));
 box.innerHTML=list.map(p=>`<article class="product">
 <div class="product-img">${p.image?`<img src="${p.image}" alt="">`:(p.category==="Alimentos"?"🥩":"🏠")}</div>
 <div class="product-body"><span class="tag">${esc(p.category)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description||"")}</p><div class="price">${priceMarkup(p)} <small>${esc(p.unit||"")}</small></div><button class="btn primary add" onclick="add('${p.id}')">🛒 Agregar</button></div></article>`).join("")||"<p>No hay productos disponibles en esta categoría.</p>";
}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function add(id){const x=cart.find(i=>i.id===id);x?x.qty++:cart.push({id,qty:1});save();renderCart();openCart()}
function change(id,d){const x=cart.find(i=>i.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)cart=cart.filter(i=>i.id!==id);save();renderCart()}
function renderCart(){
 const box=document.getElementById("cartItems"), count=cart.reduce((s,i)=>s+i.qty,0);
 document.getElementById("cartCount").textContent=count;
 const totals={};box.innerHTML=cart.length?cart.map(i=>{const p=products.find(x=>x.id===i.id);if(!p)return"";const cur=p.currency||"USD", unitPrice=effectivePrice(p);totals[cur]=(totals[cur]||0)+unitPrice*i.qty;return `<div class="cart-row"><div><strong>${esc(p.name)}</strong><br><small>${money(unitPrice,cur)} × ${i.qty}</small></div><div class="qty"><button onclick="change('${p.id}',-1)">−</button><b>${i.qty}</b><button onclick="change('${p.id}',1)">+</button></div></div>`}).join(""):"<p>Tu carrito está vacío.</p>";
 document.getElementById("cartTotal").innerHTML=Object.entries(totals).map(([cur,total])=>`${money(total,cur)}`).join("<br>")||money(0,"USD");
}
function openCart(){document.getElementById("cart").classList.add("open");document.getElementById("cartOverlay").classList.remove("hidden")}
function closeCart(){document.getElementById("cart").classList.remove("open");document.getElementById("cartOverlay").classList.add("hidden")}
function openCheckout(){if(!cart.length){alert("Agrega al menos un producto.");return}document.getElementById("checkoutModal").classList.remove("hidden")}
document.querySelectorAll(".filter,.store-card").forEach(b=>b.addEventListener("click",()=>{const f=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter===f));render(f);document.getElementById("ofertas").scrollIntoView({behavior:"smooth"})}));
document.getElementById("cartBtn").onclick=openCart;document.getElementById("closeCart").onclick=closeCart;document.getElementById("cartOverlay").onclick=closeCart;document.getElementById("checkoutBtn").onclick=openCheckout;
document.getElementById("closeModal").onclick=()=>document.getElementById("checkoutModal").classList.add("hidden");
document.getElementById("orderForm").addEventListener("submit",e=>{
 e.preventDefault();const totals={};const lines=cart.map(i=>{const p=products.find(x=>x.id===i.id);const cur=p.currency||"USD", unitPrice=effectivePrice(p), lineTotal=unitPrice*i.qty;totals[cur]=(totals[cur]||0)+lineTotal;return `• ${p.name} — ${i.qty} ${p.unit||"unidad"} — ${money(lineTotal,cur)}`}).join("\n");
 const name=document.getElementById("customerName").value.trim(),phone=document.getElementById("customerPhone").value.trim(),mun=document.getElementById("municipality").value,del=document.getElementById("delivery").value,note=document.getElementById("note").value.trim();
 const totalText=Object.entries(totals).map(([cur,total])=>money(total,cur)).join(" + ");
 const msg=`🛒 NUEVO PEDIDO\n\n👤 Cliente: ${name}\n📱 Teléfono: ${phone}\n\n🛍️ PRODUCTOS:\n${lines}\n\n💰 Total: ${totalText}\n📍 Municipio: ${mun}\n🚚 Entrega: ${del}${note?`\n📝 Nota: ${note}`:""}`;
 window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`,"_blank");
});
render();renderCart();
