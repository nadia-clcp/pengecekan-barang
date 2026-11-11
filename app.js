const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "stokku_inventory_v1";
const HISTORY_KEY = "stokku_history_v1";
let items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
let toastTimer;

const today = () => new Date().toISOString().slice(0,10);
const dateTime = (v = new Date()) => new Intl.DateTimeFormat("id-ID",{dateStyle:"medium",timeStyle:"short"}).format(new Date(v));
const esc = (s="") => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const save = () => { localStorage.setItem(STORAGE_KEY,JSON.stringify(items)); localStorage.setItem(HISTORY_KEY,JSON.stringify(history)); };
const notify = (msg) => { $("toast").textContent=msg; $("toast").classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2600); };
const log = (type, message, detail="") => { history.unshift({id:crypto.randomUUID(),type,message,detail,at:new Date().toISOString()}); history=history.slice(0,300); save(); };
const stockState = item => Number(item.stock)===0?"empty":Number(item.stock)<=Number(item.min)?"low":"safe";
const stateLabel = s => ({safe:"Stok aman",low:"Stok menipis",empty:"Stok habis"}[s]);
const fmtDate = d => d ? new Intl.DateTimeFormat("id-ID",{dateStyle:"medium"}).format(new Date(d+"T00:00:00")) : "Belum pernah";
const iconFor = name => (name||"B").trim().charAt(0).toUpperCase();

function renderDashboard(){
  $("statItems").textContent=items.length;
  $("statUnits").textContent=items.reduce((n,x)=>n+Number(x.stock||0),0).toLocaleString("id-ID");
  $("statLow").textContent=items.filter(x=>stockState(x)!=="safe").length;
  $("statCheck").textContent=items.filter(x=>x.lastChecked!==today()).length;
  const low=items.filter(x=>stockState(x)!=="safe").slice(0,5);
  $("lowStockList").innerHTML=low.length?low.map(x=>`<div class="compact-row"><div class="row-main"><div class="item-avatar">${esc(iconFor(x.name))}</div><div><b>${esc(x.name)}</b><small>${esc(x.code)} · ${esc(x.category)}</small></div></div><div class="row-end"><b>${x.stock} unit</b><small>${stateLabel(stockState(x))}</small></div></div>`).join(""):`<div class="empty-message">Semua stok dalam kondisi aman. Bagus!</div>`;
  $("recentActivity").innerHTML=history.slice(0,4).map(h=>`<div class="compact-row"><div class="row-main"><div class="item-avatar">${h.type==="check"?"✓":"↻"}</div><div><b>${esc(h.message)}</b><small>${esc(h.detail)}</small></div></div><div class="row-end"><small>${dateTime(h.at)}</small></div></div>`).join("")||`<div class="empty-message">Belum ada aktivitas.</div>`;
}
function renderItems(){
  const q=$("itemSearch").value.toLowerCase(),cat=$("categoryFilter").value,filter=$("stockFilter").value;
  const cats=[...new Set(items.map(x=>x.category).filter(Boolean))].sort();
  $("categoryFilter").innerHTML='<option value="">Semua kategori</option>'+cats.map(c=>`<option ${c===cat?"selected":""} value="${esc(c)}">${esc(c)}</option>`).join("");
  const list=items.filter(x=>(`${x.name} ${x.code} ${x.category}`.toLowerCase().includes(q))&&(!cat||x.category===cat)&&(!filter||stockState(x)===filter));
  $("itemCount").textContent=`${list.length} dari ${items.length} barang`;
  $("itemsTable").innerHTML=list.map(x=>`<tr><td><div class="item-cell"><div class="item-avatar">${esc(iconFor(x.name))}</div><div><b>${esc(x.name)}</b><small>${esc(x.code)}${x.location?" · "+esc(x.location):""}</small></div></div></td><td>${esc(x.category)}</td><td><b>${Number(x.stock).toLocaleString("id-ID")}</b> unit</td><td>${x.min} unit</td><td><span class="status ${stockState(x)}">${stateLabel(stockState(x))}</span></td><td>${fmtDate(x.lastChecked)}</td><td><button class="action-btn" data-edit="${x.id}" title="Edit">✎</button><button class="action-btn delete" data-delete="${x.id}" title="Hapus">×</button></td></tr>`).join("");
  $("emptyItems").hidden=list.length!==0;
}
function renderChecks(){
  const select=$("checkItem"),old=select.value;
  select.innerHTML='<option value="">Pilih barang...</option>'+items.map(x=>`<option value="${x.id}">${esc(x.name)} (${x.stock} unit)</option>`).join("");
  if(items.some(x=>x.id===old))select.value=old;
  const checked=items.filter(x=>x.lastChecked===today());
  $("todayChecks").innerHTML=checked.map(x=>`<div class="compact-row"><div class="row-main"><div class="item-avatar">✓</div><div><b>${esc(x.name)}</b><small>${esc(x.condition||"Baik")}${x.checkNotes?" · "+esc(x.checkNotes):""}</small></div></div><div class="row-end"><b>${x.stock} unit</b><small>Sudah dicek</small></div></div>`).join("")||`<div class="empty-message">Belum ada barang yang dicek hari ini.</div>`;
  updatePreview();
}
function renderHistory(){
  const q=$("historySearch").value.toLowerCase();
  const list=history.filter(h=>(h.message+" "+h.detail).toLowerCase().includes(q));
  $("historyList").innerHTML=list.map(h=>`<div class="history-entry"><div class="history-dot">${h.type==="check"?"✓":h.type==="delete"?"×":"↻"}</div><div><b>${esc(h.message)}</b><p>${esc(h.detail)}</p><small>${dateTime(h.at)}</small></div></div>`).join("")||`<div class="empty-message">Belum ada riwayat aktivitas.</div>`;
}
function renderAll(){renderDashboard();renderItems();renderChecks();renderHistory();}
function openItem(item=null){
  $("itemForm").reset();$("editId").value=item?.id||"";
  $("dialogTitle").textContent=item?"Edit barang":"Tambah barang";
  $("itemName").value=item?.name||"";$("itemCode").value=item?.code||"";
  $("itemCategory").value=item?.category||"";$("itemLocation").value=item?.location||"";
  $("itemStock").value=item?.stock??0;$("itemMin").value=item?.min??5;$("itemNotes").value=item?.notes||"";
  $("itemDialog").showModal();
}
function updatePreview(){
  const x=items.find(i=>i.id===$("checkItem").value);
  if(!x){$("stockPreview").textContent="Pilih barang untuk melihat perbandingan stok.";return;}
  const actual=$("actualStock").value;
  const diff=actual===""?null:Number(actual)-Number(x.stock);
  $("stockPreview").innerHTML=`Stok sistem: <b>${x.stock} unit</b> · Stok minimum: <b>${x.min} unit</b>`+(diff===null?"":`<br>Selisih: <b style="color:${diff===0?"#15966a":diff>0?"#2463eb":"#dc4c4c"}">${diff>0?"+":""}${diff} unit</b> ${diff===0?"(Sesuai)":diff>0?"(Lebih)":"(Kurang)"}`);
}
function showView(view){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  $(view+"View").classList.add("active");
  document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  $("pageTitle").textContent=({dashboard:"Dashboard",items:"Data Barang",checks:"Pengecekan",history:"Riwayat Aktivitas"})[view];
  $("sidebar").classList.remove("open");
  renderAll();
}
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.goto)));
$("menuBtn").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
$("quickAdd").addEventListener("click",()=>openItem());
$("addItemBtn").addEventListener("click",()=>openItem());
$("emptyAdd").addEventListener("click",()=>openItem());
$("closeDialog").addEventListener("click",()=>$("itemDialog").close());
$("cancelDialog").addEventListener("click",()=>$("itemDialog").close());
$("itemForm").addEventListener("submit",e=>{
  e.preventDefault();
  const id=$("editId").value,old=items.find(x=>x.id===id);
  const name=$("itemName").value.trim(),category=$("itemCategory").value.trim();
  if(!name||!category)return;
  const code=$("itemCode").value.trim()||`BRG-${Date.now().toString().slice(-6)}`;
  if(items.some(x=>x.code.toLowerCase()===code.toLowerCase()&&x.id!==id)){notify("Kode barang sudah digunakan.");return;}
  const data={id:id||crypto.randomUUID(),name,code,category,location:$("itemLocation").value.trim(),stock:Number($("itemStock").value),min:Number($("itemMin").value),notes:$("itemNotes").value.trim(),lastChecked:old?.lastChecked||"",condition:old?.condition||"",checkNotes:old?.checkNotes||""};
  if(old){items=items.map(x=>x.id===id?data:x);log("update",`Barang ${name} diperbarui`,`Stok: ${data.stock} unit`);}
  else{items.unshift(data);log("add",`Barang ${name} ditambahkan`,`Stok awal: ${data.stock} unit`);}
  save();$("itemDialog").close();renderAll();notify("Data barang berhasil disimpan.");
});
$("itemsTable").addEventListener("click",e=>{
  const edit=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]");
  if(edit){const x=items.find(i=>i.id===edit.dataset.edit);if(x)openItem(x);}
  if(del){const x=items.find(i=>i.id===del.dataset.delete);if(x&&confirm(`Hapus barang "${x.name}"?`)){items=items.filter(i=>i.id!==x.id);log("delete",`Barang ${x.name} dihapus`,`Kode: ${x.code}`);save();renderAll();notify("Barang berhasil dihapus.");}}
});
["itemSearch","categoryFilter","stockFilter"].forEach(id=>$(id).addEventListener(id==="itemSearch"?"input":"change",renderItems));
$("checkItem").addEventListener("change",updatePreview);$("actualStock").addEventListener("input",updatePreview);
$("checkForm").addEventListener("submit",e=>{
  e.preventDefault();const x=items.find(i=>i.id===$("checkItem").value);if(!x)return;
  const old=x.stock,actual=Number($("actualStock").value),condition=$("condition").value,notes=$("checkNotes").value.trim();
  x.stock=actual;x.lastChecked=today();x.condition=condition;x.checkNotes=notes;
  log("check",`Pengecekan ${x.name} selesai`,`Stok ${old} → ${actual} unit · Kondisi: ${condition}${notes?" · "+notes:""}`);
  save();$("checkForm").reset();renderAll();notify("Hasil pengecekan berhasil disimpan.");
});
$("historySearch").addEventListener("input",renderHistory);
$("clearHistory").addEventListener("click",()=>{if(confirm("Hapus seluruh riwayat aktivitas? Data barang tidak akan terhapus.")){history=[];save();renderHistory();renderDashboard();notify("Riwayat berhasil dibersihkan.");}});
$("exportBtn").addEventListener("click",()=>{
  if(!items.length){notify("Belum ada data untuk diekspor.");return;}
  const cols=["Kode","Nama Barang","Kategori","Lokasi","Stok","Stok Minimum","Kondisi Stok","Kondisi Barang","Terakhir Dicek","Catatan"];
  const rows=items.map(x=>[x.code,x.name,x.category,x.location,x.stock,x.min,stateLabel(stockState(x)),x.condition,x.lastChecked,x.notes]);
  const csv=[cols,...rows].map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(";")).join("\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=`data-barang-${today()}.csv`;a.click();URL.revokeObjectURL(url);notify("File CSV berhasil diunduh.");
});
$("todayLabel").textContent=new Intl.DateTimeFormat("id-ID",{dateStyle:"full"}).format(new Date());
$("checkDate").textContent=new Intl.DateTimeFormat("id-ID",{dateStyle:"full"}).format(new Date());
function connection(){const online=navigator.onLine;$("connectionText").textContent=online?"Siap digunakan":"Mode offline aktif";}
window.addEventListener("online",connection);window.addEventListener("offline",connection);connection();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));
renderAll();
