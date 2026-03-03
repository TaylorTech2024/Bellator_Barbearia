import * as api from "./data/api.js";
import { routes } from "./router.js";
import { toast } from "./ui/ui.js";

const view = document.getElementById("view");
const backBtn = document.getElementById("backBtn");
const menuBtn = document.getElementById("menuBtn");
const bottomNav = document.getElementById("bottomNav");
const whatsBtn = document.getElementById("whatsBtn");

// WhatsApp (pedido do usuário)
const WHATS_NUMBER = "5581994328093"; // (81) 99432-8093
const defaultMsg = encodeURIComponent("Olá! Quero agendar um horário na Bellator Barbearia. 👊");
whatsBtn.href = `https://wa.me/${WHATS_NUMBER}?text=${defaultMsg}`;

api.ensureDB();

const ctx = {
  wizard: { serviceId:null, barberId:null, datetimeISO:null, __created:false }
};

function getPath(){
  const raw = location.hash.replace(/^#/, "");
  return raw || "/auth";
}

function setTopbar({showBack, showMenu, title}){
  backBtn.style.visibility = showBack ? "visible" : "hidden";
  menuBtn.style.visibility = showMenu ? "visible" : "hidden";
  // keep brand always, title is optional (not used now)
}

function guard(path){
  const route = routes[path];
  if(!route) return { redirect:"/home" };

  const me = api.me();
  const isAuthed = !!me;

  if(route.public) return { ok:true, me };
  if(!isAuthed) return { redirect:"/auth" };

  if(route.role && me.user.role !== route.role) return { redirect:"/home" };
  return { ok:true, me };
}

function resetWizardIfLeavingBook(path){
  if(!path.startsWith("/book/")){
    ctx.wizard = { serviceId:null, barberId:null, datetimeISO:null, __created:false };
  }
}

async function render(){
  const path = getPath();
  const route = routes[path];

  if(!route){
    location.hash = "#/home";
    return;
  }

  const g = guard(path);
  if(g.redirect){
    location.hash = "#" + g.redirect;
    return;
  }

  const me = g.me || api.me();
  const navOn = !!route.nav && !!me;

  bottomNav.style.display = navOn ? "flex" : "none";
  whatsBtn.style.display = me ? "grid" : "none";

  setTopbar({
    showBack: !route.nav && path !== "/auth" && path !== "/home",
    showMenu: me && route.nav,
  });

  // smooth view swap
  view.innerHTML = "";
  const pageNode = route.page({ ...ctx, ...(me||{}) });
  view.appendChild(pageNode);

  // highlight nav
  if(route.nav){
    const key = path.replace("/",""); // home/appointments/profile
    for(const a of bottomNav.querySelectorAll("[data-route]")){
      a.classList.toggle("is-active", a.getAttribute("data-route") === key);
    }
  }

  resetWizardIfLeavingBook(path);
}

window.addEventListener("hashchange", render);
window.addEventListener("load", ()=>{
  // start route
  const me = api.me();
  if(!location.hash){
    location.hash = me ? "#/home" : "#/auth";
  }else{
    // if already has hash, keep it
    render();
  }
});

backBtn.addEventListener("click", ()=>{
  history.length > 1 ? history.back() : (location.hash = "#/home");
});

menuBtn.addEventListener("click", ()=>{
  const me = api.me();
  if(!me) return;
  toast(me.user.role === "admin" ? "Você está como ADMIN" : (me.user.role==="barbeiro" ? "Você está como BARBEIRO" : "Você está como CLIENTE"));
});
