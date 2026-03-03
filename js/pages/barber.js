import { el, toast, fmtDateTime, mountReveal } from "../ui/ui.js";
import * as api from "../data/api.js";

export function BarberPanelPage(ctx){
  const { user } = ctx;
  const wrap = el("div", {});
  wrap.append(
    el("h1",{class:"h1 reveal"},"Painel do Barbeiro"),
    el("p",{class:"sub reveal"},"Visualize os agendamentos e marque como concluído.")
  );

  const db = api.ensureDB();
  const services = Object.fromEntries(db.services.map(s=>[s.id,s]));
  const clients = Object.fromEntries(db.users.filter(u=>u.role==="cliente").map(u=>[u.id,u]));

  const list = el("div",{class:"section"});
  wrap.append(list);

  function render(){
    list.innerHTML = "";
    const appts = api.listAppointmentsForUser(user).filter(a=>a.status!=="Cancelado");
    const today = new Date();
    today.setHours(0,0,0,0);

    const todays = appts.filter(a=>{
      const d = new Date(a.dataHora);
      const dd = new Date(d); dd.setHours(0,0,0,0);
      return dd.getTime() === today.getTime();
    });

    if(todays.length === 0){
      list.append(el("div",{class:"card reveal"}, [
        el("div",{class:"card__title"},"Sem horários hoje."),
        el("div",{class:"card__desc"},"Quando um cliente agendar, aparece aqui.")
      ]));
      mountReveal(wrap);
      return;
    }

    for(const a of todays){
      const s = services[a.servicoId];
      const c = clients[a.clienteId];
      const card = el("div",{class:"card reveal"});
      card.append(
        el("div",{class:"card__row"}, [
          el("div",{}, [
            el("div",{class:"card__title"}, `${s?.nome || "Serviço"} • ${fmtDateTime(a.dataHora)}`),
            el("div",{class:"card__desc"}, `Cliente: ${c?.nome || "—"} • Status: ${a.status}`)
          ]),
          el("span",{class:"badge"}, a.status)
        ]),
        el("div",{style:"margin-top:12px; display:flex; gap:10px; flex-wrap:wrap"}, [
          a.status==="Agendado"
            ? el("button",{class:"btn btn--primary", type:"button", onClick: ()=>{
                api.completeAppointment(a.id, user.id);
                toast("Concluído ✅");
                render();
              }}, "Concluir")
            : el("button",{class:"btn", type:"button", disabled:true}, "Concluído")
        ])
      );
      list.append(card);
    }
    mountReveal(wrap);
  }

  render();
  mountReveal(wrap);
  return wrap;
}
