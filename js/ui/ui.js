export function el(tag, attrs={}, children=[]){
  const node = document.createElement(tag);
  for(const [k,v] of Object.entries(attrs||{})){
    if(k === "class") node.className = v;
    else if(k === "html") node.innerHTML = v;
    else if(k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
    else if(v === true) node.setAttribute(k, "");
    else if(v !== false && v != null) node.setAttribute(k, String(v));
  }
  for(const ch of (Array.isArray(children) ? children : [children])){
    if(ch == null) continue;
    if(typeof ch === "string") node.appendChild(document.createTextNode(ch));
    else node.appendChild(ch);
  }
  return node;
}

export function money(v){
  try{
    return new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(v);
  }catch{
    return "R$ " + Number(v).toFixed(2).replace(".", ",");
  }
}

export function fmtDateTime(iso){
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", { dateStyle:"full", timeStyle:"short" }).format(d);
}

export function fmtDate(iso){
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", { dateStyle:"long" }).format(d);
}

export function fmtTime(iso){
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", { timeStyle:"short" }).format(d);
}

export function toast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("is-on");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=> t.classList.remove("is-on"), 2600);
}

export function setActiveNav(routeKey){
  const nav = document.getElementById("bottomNav");
  if(!nav) return;
  for(const a of nav.querySelectorAll(".bottom-nav__item")){
    a.classList.toggle("is-active", a.getAttribute("data-route") === routeKey);
  }
}

export function modal({title, body, actions=[]}){
  const root = document.getElementById("modalRoot");
  root.classList.add("is-on");
  root.setAttribute("aria-hidden","false");
  const close = ()=>{
    root.classList.remove("is-on");
    root.setAttribute("aria-hidden","true");
    root.innerHTML = "";
  };
  const m = document.createElement("div");
  m.className = "modal";
  m.appendChild(el("h3", {}, title));
  if(body) m.appendChild(el("p", {}, body));
  const row = el("div", {class:"btn-row"}, actions.map(a=>{
    const btn = el("button", {class:`btn ${a.variant||""}`, onClick: async ()=>{
      try{
        const r = await a.onClick?.(close);
        if(r !== false) close();
      }catch(e){
        console.error(e);
      }
    }}, a.label);
    return btn;
  }));
  m.appendChild(row);
  root.appendChild(m);
  root.addEventListener("click", (ev)=>{
    if(ev.target === root) close();
  }, { once:true });
  return { close };
}

export function mountReveal(container){
  const els = container.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.1 });
  els.forEach(x=>io.observe(x));
}

