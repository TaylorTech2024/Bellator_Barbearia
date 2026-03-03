import { el, toast, mountReveal } from "../ui/ui.js";
import * as api from "../data/api.js";

export function BookServicePage(ctx){
  const wrap = el("div", {});
  wrap.append(
    el("h1",{class:"h1 reveal"},"Escolha o Serviço"),
    el("p",{class:"sub reveal"},"Selecione o que deseja fazer")
  );

  const services = api.listServices();
  const list = el("div",{class:"section"});
  wrap.append(list);

  let selected = null;

  function render(){
    list.innerHTML = "";
    for(const s of services){
      const card = el("button",{class:`card reveal ${selected?.id===s.id ? "card--selected":""}`, type:"button", style:"text-align:left; width:100%; cursor:pointer"});
      card.append(
        el("div",{class:"card__row"}, [
          el("div",{}, [
            el("div",{class:"card__title"}, [
              el("i",{"data-lucide": (s.icon || "scissors")}),
              s.nome
            ]),
            el("div",{class:"card__desc"}, s.descricao || "")
          ]),
          s.tag ? el("span",{class:"badge"}, s.tag) : el("span",{})
        ]),
        el("div",{style:"margin-top:10px; display:flex; justify-content:space-between; gap:10px"}, [
          el("div",{class:"helper"}, `${s.duracaoMin} min`),
          el("div",{style:"font-weight:700"}, fmtMoney(s.preco))
        ])
      );
      card.addEventListener("click", ()=>{ selected = s; render(); });
      list.append(card);
    }
  }

  const cta = el("button",{class:"btn btn--primary reveal", type:"button", onClick: ()=>{
    if(!selected) return toast("Escolha um serviço para continuar.");
    ctx.wizard.serviceId = selected.id;
    location.hash = "#/book/barber";
  }}, "Continuar");
  wrap.append(cta);

  render();
  mountReveal(wrap);
  return wrap;
}

function fmtMoney(v){
  try{ return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v); }
  catch{ return "R$ "+Number(v).toFixed(2).replace(".",","); }
}
