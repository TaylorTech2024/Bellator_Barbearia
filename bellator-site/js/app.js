/* Bellator Barbearia - demo SPA (sem back-end)
   - auth fake (localStorage)
   - agendamentos em localStorage
*/
const WA_LINK = "https://wa.me/5581994328093?text=Ol%C3%A1%21%20Quero%20agendar%20um%20hor%C3%A1rio%20na%20Bellator%20Barbearia.";

const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  del(key) {
    localStorage.removeItem(key);
  }
};

const state = {
  tab: "login",
  draft: {
    service: null,
    price: null,
    barber: null,
    date: null,
    time: null
  }
};

function show(screen) {
  $$(".screen").forEach(s => s.classList.remove("is-active"));
  const el = document.querySelector(`.screen[data-screen="${screen}"]`);
  if (el) el.classList.add("is-active");

  $$(".bottomnav__item").forEach(b => b.classList.remove("is-active"));
  const map = { home: "home", appointments:"appointments", new:"new" };
  const active = map[screen];
  if (active) {
    const btn = document.querySelector(`.bottomnav__item[data-nav="${active}"]`);
    if (btn) btn.classList.add("is-active");
  }
}

function go(route) {
  switch(route) {
    case "home": show("home"); break;
    case "appointments": renderAppointments(); show("appointments"); break;
    case "new": resetDraft(); show("service"); break;
    case "screens": renderGallery(); show("screens"); break;
    default: show("home");
  }
}

function isAuthed() {
  return !!store.get("bellator_user", null);
}

function ensureAuthed() {
  if (!isAuthed()) show("auth");
  else go("home");
}

function setTab(tab) {
  state.tab = tab;
  $$(".tab").forEach(t => t.classList.toggle("is-active", t.dataset.tab === tab));
  document.querySelector(".tab[data-tab='login']").setAttribute("aria-selected", tab==="login");
  document.querySelector(".tab[data-tab='signup']").setAttribute("aria-selected", tab==="signup");
  $("#authHint").textContent = tab === "login" ? "Entre com suas credenciais" : "Crie sua conta (demo)";
  $("#authBtn").textContent = tab === "login" ? "ENTRAR" : "CADASTRAR";
}

function safeNameFromEmail(email) {
  if (!email) return "cliente";
  const u = email.split("@")[0] || "cliente";
  return u.replace(/[^a-z0-9._-]/gi, "").slice(0, 14) || "cliente";
}

function authAction() {
  const email = $("#email").value.trim();
  const password = $("#password").value.trim();
  if (!email || !password) {
    alert("Preencha e-mail e senha.");
    return;
  }
  const user = {
    email,
    name: safeNameFromEmail(email),
    createdAt: Date.now()
  };
  store.set("bellator_user", user);

  $("#userName").textContent = user.name;
  go("home");
}

function logout() {
  store.del("bellator_user");
  store.del("bellator_appointments");
  resetDraft();
  show("auth");
}

function resetDraft() {
  state.draft = { service:null, price:null, barber:null, date:null, time:null };
  $$(".choice__item").forEach(i => i.classList.remove("is-selected"));
  $$("#times .timebtn").forEach(i => i.classList.remove("is-selected"));
  $("#toBarberBtn").disabled = true;
  $("#toDateBtn").disabled = true;
  $("#confirmBtn").disabled = true;
  $("#dateInput").value = "";
}

function formatBRL(value) {
  const n = Number(value ?? 0);
  return n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
}

function formatDatePt(dateStr) {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" });
  } catch {
    return dateStr;
  }
}

function syncMini() {
  $("#miniService").textContent = state.draft.service
    ? `${state.draft.service} • ${formatBRL(state.draft.price)}`
    : "—";
}

function syncSummary() {
  $("#sumService").textContent = state.draft.service ? `${state.draft.service} (${formatBRL(state.draft.price)})` : "—";
  $("#sumBarber").textContent = state.draft.barber ?? "—";
}

function buildTimes() {
  const times = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"];
  const root = $("#times");
  root.innerHTML = "";
  times.forEach(t => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "timebtn";
    b.textContent = t;
    b.addEventListener("click", () => {
      $$("#times .timebtn").forEach(x => x.classList.remove("is-selected"));
      b.classList.add("is-selected");
      state.draft.time = t;
      updateConfirmEnabled();
    });
    root.appendChild(b);
  });
}

function updateConfirmEnabled() {
  $("#confirmBtn").disabled = !(state.draft.date && state.draft.time);
}

function addAppointment(appt) {
  const list = store.get("bellator_appointments", []);
  list.unshift(appt);
  store.set("bellator_appointments", list);
}

function removeAppointment(id) {
  const list = store.get("bellator_appointments", []);
  const next = list.filter(a => a.id !== id);
  store.set("bellator_appointments", next);
}

function renderAppointments() {
  const root = $("#appointmentsList");
  const list = store.get("bellator_appointments", []);
  if (!list.length) {
    root.innerHTML = `
      <div class="appointment">
        <div class="appointment__title">Nenhum agendamento ainda</div>
        <div class="appointment__meta">
          <div class="metaRow"><i>ℹ️</i> Crie um novo agendamento para aparecer aqui.</div>
        </div>
      </div>
    `;
    return;
  }

  root.innerHTML = "";
  list.forEach(a => {
    const el = document.createElement("div");
    el.className = "appointment";

    el.innerHTML = `
      <div class="appointment__top">
        <div>
          <div class="appointment__title">${a.service}</div>
          <div class="badge">Próximo</div>
        </div>
        <div style="font-weight:900">${formatBRL(a.price)}</div>
      </div>

      <div class="appointment__meta">
        <div class="metaRow"><i>👤</i> ${a.barber}</div>
        <div class="metaRow"><i>📅</i> ${formatDatePt(a.date)}</div>
        <div class="metaRow"><i>🕒</i> ${a.time}</div>
        <div class="metaRow"><i>📍</i> Bellator Barbearia</div>
      </div>

      <button class="btn danger" data-cancel="${a.id}">✖ CANCELAR AGENDAMENTO</button>
      <a class="btn" target="_blank" rel="noopener"
        href="${WA_LINK}&text=${encodeURIComponent(`Olá! Quero confirmar/ajustar meu agendamento: ${a.service} com ${a.barber} em ${formatDatePt(a.date)} às ${a.time}.`)}"
      >CHAMAR NO WHATSAPP</a>
    `;

    el.querySelector("[data-cancel]").addEventListener("click", () => {
      if (confirm("Deseja cancelar este agendamento?")) {
        removeAppointment(a.id);
        renderAppointments();
      }
    });

    root.appendChild(el);
  });
}

function renderConfirmed(appt) {
  const box = $("#confirmCard");
  box.innerHTML = `
    <div class="appointment__meta" style="margin:0">
      <div class="metaRow"><i>✂️</i> <strong>Serviço</strong> <span style="margin-left:auto">${appt.service} • ${formatBRL(appt.price)}</span></div>
      <div class="metaRow"><i>👤</i> <strong>Barbeiro</strong> <span style="margin-left:auto">${appt.barber}</span></div>
      <div class="metaRow"><i>📅</i> <strong>Data</strong> <span style="margin-left:auto">${formatDatePt(appt.date)}</span></div>
      <div class="metaRow"><i>🕒</i> <strong>Horário</strong> <span style="margin-left:auto">${appt.time}</span></div>
      <div class="metaRow"><i>📍</i> <strong>Local</strong> <span style="margin-left:auto">Bellator Barbearia</span></div>
    </div>
  `;
}

function renderGallery() {
  const root = $("#screensGallery");
  if (root.dataset.ready === "1") return;

  const imgs = ["Captura de tela 2026-03-03 105316.png", "Captura de tela 2026-03-03 105325.png", "Captura de tela 2026-03-03 105335.png", "Captura de tela 2026-03-03 105339.png", "Captura de tela 2026-03-03 105342.png", "Captura de tela 2026-03-03 105353.png", "Captura de tela 2026-03-03 105359.png", "Captura de tela 2026-03-03 105404.png", "Captura de tela 2026-03-03 105409.png", "Captura de tela 2026-03-03 105413.png", "Captura de tela 2026-03-03 105417.png", "Captura de tela 2026-03-03 105422.png", "Captura de tela 2026-03-03 105425.png", "Captura de tela 2026-03-03 105428.png", "Captura de tela 2026-03-03 105430.png", "Captura de tela 2026-03-03 105433.png", "Captura de tela 2026-03-03 105435.png", "Captura de tela 2026-03-03 105438.png", "Captura de tela 2026-03-03 105440.png", "Captura de tela 2026-03-03 105458.png", "Captura de tela 2026-03-03 105503.png"];
  root.innerHTML = imgs.map(fn => {
    const src = `assets/screens/${encodeURIComponent(fn)}`;
    return `<a href="${src}" target="_blank" rel="noopener"><img loading="lazy" src="${src}" alt="${fn}"></a>`;
  }).join("");

  root.dataset.ready = "1";
}

function wire() {
  $$(".tab").forEach(t => t.addEventListener("click", () => setTab(t.dataset.tab)));

  $("#authBtn").addEventListener("click", authAction);
  $("#forgotBtn").addEventListener("click", () => alert("Demo: recupere sua senha pelo WhatsApp da barbearia."));
  $("#password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") authAction();
  });

  document.addEventListener("click", (e) => {
    const goTo = e.target.closest("[data-go]")?.dataset.go;
    if (goTo) {
      e.preventDefault();
      if (goTo === "new") go("new");
      else go(goTo);
    }

    const nav = e.target.closest("[data-nav]")?.dataset.nav;
    if (nav) {
      e.preventDefault();
      if (nav === "new") go("new");
      else go(nav);
    }

    if (e.target.closest("[data-back]")) {
      e.preventDefault();
      const current = document.querySelector(".screen.is-active")?.dataset.screen;
      if (current === "appointments") go("home");
      else if (current === "service") go("home");
      else if (current === "barber") show("service");
      else if (current === "datetime") show("barber");
      else if (current === "screens") go("home");
      else go("home");
    }

    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "logout") {
      e.preventDefault();
      logout();
    }
  });

  // service selection
  $$(".choice__item[data-service]").forEach(btn => btn.addEventListener("click", () => {
    $$(".choice__item[data-service]").forEach(i => i.classList.remove("is-selected"));
    btn.classList.add("is-selected");
    state.draft.service = btn.dataset.service;
    state.draft.price = Number(btn.dataset.price);
    $("#toBarberBtn").disabled = false;
  }));

  $("#toBarberBtn").addEventListener("click", () => {
    syncMini();
    show("barber");
  });

  // barber selection
  $$(".choice__item[data-barber]").forEach(btn => btn.addEventListener("click", () => {
    $$(".choice__item[data-barber]").forEach(i => i.classList.remove("is-selected"));
    btn.classList.add("is-selected");
    state.draft.barber = btn.dataset.barber;
    $("#toDateBtn").disabled = false;
  }));

  $("#toDateBtn").addEventListener("click", () => {
    syncSummary();
    show("datetime");
  });

  buildTimes();

  $("#dateInput").addEventListener("change", () => {
    state.draft.date = $("#dateInput").value || null;
    updateConfirmEnabled();
  });

  $("#confirmBtn").addEventListener("click", () => {
    const user = store.get("bellator_user", null) || {name:"cliente"};
    const appt = {
      id: "a_" + Math.random().toString(16).slice(2),
      user: user.email ?? "",
      service: state.draft.service,
      price: state.draft.price,
      barber: state.draft.barber,
      date: state.draft.date,
      time: state.draft.time,
      createdAt: Date.now()
    };
    addAppointment(appt);
    renderConfirmed(appt);
    show("confirmed");
  });

  $("#resetDemo").addEventListener("click", () => {
    if (!confirm("Resetar a demonstração? Isso apaga usuário e agendamentos salvos.")) return;
    localStorage.removeItem("bellator_user");
    localStorage.removeItem("bellator_appointments");
    resetDraft();
    show("auth");
  });
}

(function init(){
  wire();
  const user = store.get("bellator_user", null);
  if (user) $("#userName").textContent = user.name || "cliente";
  ensureAuthed();
})();
