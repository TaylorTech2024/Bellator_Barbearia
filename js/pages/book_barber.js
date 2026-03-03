import { el, toast, mountReveal } from "../ui/ui.js";
import * as api from "../data/api.js";

export function BookBarberPage(ctx){
  const wrap = el("div", {});
  const db = api.ensureDB();
  const services = Object.fromEntries(db.services.map(s=>[s.id,s]));
  const chosen = services[ctx.wizard.serviceId];

  wrap.append(
    summaryBar(chosen),
    el("h1",{class:"h1 reveal"},"Escolha o Barbeiro"),
    el("p",{class:"sub reveal"},"Selecione o profissional")
  );

  const barbers = api.listBarbers();
  const list = el("div",{class:"section"});
  wrap.append(list);

  let selected = null;

  function render(){
    list.innerHTML = "";
    for(const b of barbers){
      const card = el("button",{class:`card reveal ${selected?.id===b.id ? "card--selected":""}`, type:"button", style:"text-align:left; width:100%; cursor:pointer"});
      card.append(
        el("div",{class:"card__row"}, [
          el("div",{}, [
            el("div",{class:"card__title"}, b.nome),
            el("div",{class:"card__desc"}, `${b.especialidade || "Barbeiro"} • ⭐ ${b.avaliacao || "4.8"}`)
          ]),
          el("span",{class:"badge"}, "Disponível")
        ])
      );
      card.addEventListener("click", ()=>{ selected = b; render(); });
      list.append(card);
    }
  }

  const cta = el("button",{class:"btn btn--primary reveal", type:"button", onClick: ()=>{
    if(!selected) return toast("Escolha um barbeiro para continuar.");
    ctx.wizard.barberId = selected.id;
    location.hash = "#/book/datetime";
  }}, "Continuar");

  wrap.append(cta);
  render();
  mountReveal(wrap);
  return wrap;
}

function summaryBar(service){
  if(!service) return el("div",{});
  return el("div",{class:"card card--tight reveal", style:"margin-top:6px"}, [
    el("div",{class:"card__row"}, [
      el("div",{}, [
        el("div",{class:"helper"},"Serviço"),
        el("div",{style:"font-weight:700"}, service.nome),
        el("div",{class:"helper"}, `${service.duracaoMin} min • ${money(service.preco)}`)
      ]),
      el("i",{"data-lucide":"scissors"})
    ])
  ]);

  function money(v){
    try{ return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v); }
    catch{ return "R$ "+Number(v).toFixed(2).replace(".",","); }
  }
}
