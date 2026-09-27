const DEFAULT_KEY="E*dc2028";
const defaultProducts=[
{id:"a1",name:"Carne de cerdo",category:"Alimentos",price:12.5,unit:"kg",image:"",description:"Carne de cerdo.",available:true},
{id:"a2",name:"Aceite",category:"Alimentos",price:8,unit:"botella",image:"",description:"Aceite para cocina.",available:true},
{id:"a3",name:"Pescado",category:"Alimentos",price:10,unit:"kg",image:"",description:"Pescado.",available:true},
{id:"a4",name:"Combo de alimentos",category:"Alimentos",price:35,unit:"combo",image:"",description:"Combo promocional.",available:true},
{id:"e1",name:"Split",category:"Electrodomésticos",price:270,unit:"unidad",image:"",description:"Aire acondicionado Split.",available:true},
{id:"e2",name:"Ventilador recargable",category:"Electrodomésticos",price:65,unit:"unidad",image:"",description:"Ventilador recargable.",available:true},
{id:"e3",name:"Lavadora",category:"Electrodomésticos",price:320,unit:"unidad",image:"",description:"Lavadora.",available:true},
{id:"e4",name:"Cocina",category:"Electrodomésticos",price:180,unit:"unidad",image:"",description:"Cocina doméstica.",available:true}
];
let products=JSON.parse(localStorage.getItem("electroisla_products")||"null")||defaultProducts;
const save=()=>localStorage.setItem("electroisla_products",JSON.stringify(products));
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function login(){if(document.getElementById("adminPass").value!==DEFAULT_KEY){alert("Clave incorrecta.");return}localStorage.setItem("electroisla_admin","1");show()}
function show(){document.getElementById("loginBox").classList.add("hidden");document.getElementById("dashboard").classList.remove("hidden");render()}
function render(){
 const box=document.getElementById("adminProducts");
 box.innerHTML=products.length?products.map(p=>`<div class="admin-product ${p.available?"":"disabled"}"><div>${p.image?`<img src="${esc(p.image)}" alt="">`:"📦"}</div><div><h4>${esc(p.name)}</h4><small>${esc(p.category)} · $${Number(p.price).toFixed(2)} · ${esc(p.unit||"")} · ${p.available?"Disponible":"Oculto"}</small></div><div class="admin-actions"><button onclick="edit('${p.id}')">✏️</button><button onclick="toggle('${p.id}')">👁️</button><button onclick="removeP('${p.id}')">🗑️</button></div></div>`).join(""):"<p>No hay productos. Agrega el primero.</p>"
}
function edit(id){
 const p=products.find(x=>x.id===id);if(!p)return;
 document.getElementById("editId").value=p.id;document.getElementById("pName").value=p.name;
 document.getElementById("pCategory").value=p.category;document.getElementById("pPrice").value=p.price;
 document.getElementById("pUnit").value=p.unit||"";document.getElementById("pImage").value=p.image||"";
 document.getElementById("pDescription").value=p.description||"";document.getElementById("pAvailable").checked=p.available!==false;
 document.getElementById("formTitle").textContent="✏️ Editar producto";showPreview(p.image||"");scrollTo(0,0)
}
function toggle(id){const p=products.find(x=>x.id===id);if(p){p.available=!p.available;save();render()}}
function removeP(id){if(confirm("¿Eliminar este producto?")){products=products.filter(x=>x.id!==id);save();render()}}
function showPreview(src){
 const box=document.getElementById("imagePreview"),status=document.getElementById("photoStatus");
 box.innerHTML=src?`<img src="${esc(src)}" alt="Vista previa">`:"";
 if(status)status.textContent=src?"Foto seleccionada correctamente.":"Toca el botón y selecciona una imagen de tu Android.";
}
function compressImage(file){
 return new Promise((resolve,reject)=>{
   if(!file || !file.type.startsWith("image/")){reject(new Error("El archivo seleccionado no es una imagen compatible."));return}
   const url=URL.createObjectURL(file);
   const finish=(img)=>{
     try{
       const max=1000,scale=Math.min(1,max/Math.max(img.width,img.height));
       const c=document.createElement("canvas");
       c.width=Math.max(1,Math.round(img.width*scale));
       c.height=Math.max(1,Math.round(img.height*scale));
       const ctx=c.getContext("2d");
       ctx.drawImage(img,0,0,c.width,c.height);
       // JPEG keeps the stored image small and is broadly supported on Android.
       const data=c.toDataURL("image/jpeg",.82);
       URL.revokeObjectURL(url);
       if(!data || data.length<100){reject(new Error("No se pudo convertir la foto."));return}
       resolve(data);
     }catch(err){URL.revokeObjectURL(url);reject(err)}
   };
   if("createImageBitmap" in window){
     createImageBitmap(file).then(finish).catch(()=>{
       const img=new Image(); img.onload=()=>finish(img); img.onerror=()=>reject(new Error("Tu navegador no puede leer esta imagen. Prueba con JPG o PNG.")); img.src=url;
     });
   }else{
     const img=new Image(); img.onload=()=>finish(img); img.onerror=()=>reject(new Error("Tu navegador no puede leer esta imagen. Prueba con JPG o PNG.")); img.src=url;
   }
 });
}
const picker=document.getElementById("pImageFile");
picker.addEventListener("change",async e=>{
 const file=e.target.files&&e.target.files[0];
 if(!file)return;
 const status=document.getElementById("photoStatus");
 status.textContent="Leyendo la foto…";
 try{
   const data=await compressImage(file);
   document.getElementById("pImage").value=data;
   showPreview(data);
   status.textContent="✅ Foto cargada. Ahora pulsa «Guardar producto».";
 }catch(err){
   document.getElementById("pImage").value="";
   document.getElementById("imagePreview").innerHTML="";
   status.textContent="❌ No se pudo cargar la foto.";
   alert(err.message||"No se pudo cargar la foto.");
 }finally{
   // Allows selecting the same photo again on Android.
   picker.value="";
 }
});

document.getElementById("productForm").addEventListener("submit",e=>{
 e.preventDefault();
 const p={id:document.getElementById("editId").value||Date.now().toString(),name:document.getElementById("pName").value.trim(),category:document.getElementById("pCategory").value,price:Number(document.getElementById("pPrice").value),unit:document.getElementById("pUnit").value.trim(),image:document.getElementById("pImage").value,description:document.getElementById("pDescription").value.trim(),available:document.getElementById("pAvailable").checked};
 const id=document.getElementById("editId").value;if(id)products=products.map(x=>x.id===id?p:x);else products.push(p);
 try{save(); const saved=products.find(x=>x.id===p.id); if(saved?.image!==p.image){throw new Error("La foto no se guardó.")}}catch(err){alert("No se pudo guardar la foto. Prueba otra imagen JPG/PNG más pequeña.");return}
 reset();render()
});
function reset(){document.getElementById("productForm").reset();document.getElementById("editId").value="";document.getElementById("pImage").value="";document.getElementById("formTitle").textContent="➕ Agregar producto";document.getElementById("pAvailable").checked=true;showPreview("")}
document.getElementById("cancelEdit").onclick=reset;document.getElementById("loginBtn").onclick=login;
document.getElementById("logoutBtn").onclick=()=>{localStorage.removeItem("electroisla_admin");location.reload()};
if(localStorage.getItem("electroisla_admin")==="1")show();
