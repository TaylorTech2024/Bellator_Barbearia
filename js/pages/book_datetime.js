import { el, toast, mountReveal, fmtDate, fmtTime } from "../ui/ui.js";
import { Calendar } from "../ui/calendar.js";
import * as api from "../data/api.js";

export function BookDateTimePage(ctx){
  const wrap = el("div", {});
  const db = api.ensureDB();
  const services = Object.fromEntries(db.services.map(s=>[s.id,s]));
  const barbers = Object.fromEntries(db.barbers.map(b=>[b.id,b]));

  const service = services[ctx.wizard.serviceId];
  const barber = barbers[ctx.wizard.barberId];

  wrap.append(
    summary(service, barber),
    el("h1",{class:"h1 reveal"},"Escolha a Data e Horário"),
    el("p",{class:"sub reveal"},"Selecione um dia e um horário disponível")
  );

  const calWrap = el("div",{class:"section"});
  const timesWrap = el("div",{class:"section"});
  wrap.append(calWrap, timesWrap);

  const minDate = new Date(); // today+
  let selectedDate = null;
  let selectedTime = null;

  function disabledDates(){
    // demo: no disabled dates besides past
    return [];
  }

  const cal = Calendar({
    value: null,
    minDate,
    disabledDates: disabledDates(),
    onChange: (d)=>{
      selectedDate = d;
      selectedTime = null;
      renderTimes();
    }
  });
  calWrap.append(cal);

  function timeSlotsFor(date){
    const start = barber?.horarios?.start || "09:00";
    const end = barber?.horarios?.end || "18:00";
    const step = barber?.horarios?.stepMin || 30;
    const dur = service?.duracaoMin || 30;

    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const day = new Date(date);
    day.setHours(0,0,0,0);

    const slots = [];
    const d0 = new Date(day);
    d0.setHours(sh, sm, 0, 0);
    const dend = new Date(day);
    dend.setHours(eh, em, 0, 0);

    const appts = api.ensureDB().appointments
      .filter(a => a.barbeiroId === barber.id && a.status !== "Cancelado")
      .map(a => ({
        start: new Date(a.dataHora),
        end: addMinutes(new Date(a.dataHora), services[ a.servicoId ]?.duracaoMin || 30)
      }));

    for(let t = new Date(d0); addMinutes(t, dur) <= dend; t = addMinutes(t, step)){
      const startT = new Date(t);
      const endT = addMinutes(new Date(t), dur);
      const overlap = appts.some(a => (startT < a.end) && (endT > a.start));
      slots.push({ start: startT, end: endT, disabled: overlap || isPast(startT) });
    }
    return slots;
  }

  function renderTimes(){
    timesWrap.innerHTML = "";
    if(!selectedDate){
      timesWrap.append(el("div",{class:"card reveal"}, [
        el("div",{class:"card__title"},"Escolha uma data no calendário."),
        el("div",{class:"card__desc"},"Depois selecione um horário disponível.")
      ]));
      mountReveal(wrap);
      return;
    }

    const slots = timeSlotsFor(selectedDate);

    timesWrap.append(
      el("div",{class:"card card--tight reveal"}, [
        el("div",{class:"card__title"}, fmtDate(selectedDate.toISOString())),
        el("div",{class:"card__desc"}, "Horários disponíveis")
      ])
    );

    const chips = el("div",{class:"chips", style:"margin-top:12px"});
    for(const s of slots){
      const label = new Intl.DateTimeFormat("pt-BR",{ timeStyle:"short" }).format(s.start);
      const chip = el("button",{class:`chip ${selectedTime && sameMinute(s.start, selectedTime) ? "is-selected":""} ${s.disabled?"is-disabled":""}`, type:"button"}, label);
      if(s.disabled) chip.disabled = true;
      chip.addEventListener("click", ()=>{
        selectedTime = s.start;
        [...chips.querySelectorAll(".chip")].forEach(x=>x.classList.remove("is-selected"));
        chip.classList.add("is-selected");
      });
      chips.append(chip);
    }
    timesWrap.append(chips);

    mountReveal(wrap);
  }

  const cta = el("button",{class:"btn btn--primary reveal", type:"button", onClick: ()=>{
    if(!selectedDate) return toast("Escolha uma data.");
    if(!selectedTime) return toast("Escolha um horário.");
    const iso = selectedTime.toISOString();
    ctx.wizard.datetimeISO = iso;
    location.hash = "#/book/confirm";
  }}, "Confirmar horário");

  wrap.append(cta);

  renderTimes();
  mountReveal(wrap);
  return wrap;
}

function addMinutes(d, m){ return new Date(d.getTime() + m*60000); }
function isPast(d){ return d.getTime() < Date.now() + 1*60000; } // allow 1 min buffer
function sameMinute(a,b){
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate()
    && a.getHours()===b.getHours() && a.getMinutes()===b.getMinutes();
}

function summary(service, barber){
  return el("div",{class:"card card--tight reveal", style:"margin-top:6px"}, [
    row("scissors", "Serviço", service?.nome || "-", service ? money(service.preco) : ""),
    el("div",{class:"hr"}),
    row("user", "Barbeiro", barber?.nome || "-", barber?.especialidade || "")
  ]);

  function row(icon, label, left, right){
    return el("div",{class:"kv", style:"grid-template-columns:20px 1fr auto"}, [
      el("i",{"data-lucide": mapIcon(icon)}),
      el("div",{}, [el("small",{}, label), el("br"), el("strong",{}, left)]),
      el("div",{class:"right"}, right)
    ]);
  }
  function money(v){
    try{ return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v); }
    catch{ return "R$ "+Number(v).toFixed(2).replace(".",","); }
  }
}

function mapIcon(name){
  const m = {scissors:"scissors",user:"user",calendar:"calendar",clock:"clock",star:"star",pin:"map-pin"};
  return m[name] || name || "circle";
}
