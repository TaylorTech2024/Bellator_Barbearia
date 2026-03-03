import { el, setActiveNav, fmtDateTime, toast, modal, mountReveal } from "../ui/ui.js";
import * as api from "../data/api.js";

export function AppointmentsPage(ctx){
  setActiveNav("appointments");
  const { user } = ctx;

  const wrap = el("div", {});
  wrap.append(
    el("h1",{class:"h1 reveal"}, user.role==="cliente" ? "Meus Agendamentos" : (user.role==="admin" ? "Agendamentos (Admin)" : "Agenda do Dia")),
    el("p",{class:"sub reveal"}, user.role==="cliente"
      ? "Acompanhe seus horários e cancele quando necessário."
      : "Visualize, conclua e gerencie agendamentos.")
  );

  const list = el("div", {class:"section"});
  wrap.append(list);

  const btnNew = user.role==="cliente"
    ? el("button", {class:"btn btn--primary reveal", type:"button", onClick: ()=> location.hash="#/book/service"}, "Novo Agendamento")
    : null;

  if(btnNew) wrap.append(btnNew);

  function render(){
    list.innerHTML = "";
    const db = api.ensureDB();
    const services = Object.fromEntries(db.services.map(s=>[s.id,s]));
    const barbers = Object.fromEntries(db.barbers.map(b=>[b.id,b]));
    const appts = api.listAppointmentsForUser(user);

    if(appts.length === 0){
      list.append(el("div",{class:"card reveal"}, [
        el("div",{class:"card__title"},"Nenhum agendamento por aqui."),
        el("div",{class:"card__desc"},"Toque em “Novo Agendamento” para reservar seu horário.")
      ]));
      mountReveal(wrap);
      return;
    }

    for(const a of appts){
      const s = services[a.servicoId];
      const b = barbers[a.barbeiroId];
      const status = a.status;
      const isCanceled = status==="Cancelado";
      const isDone = status==="Concluído";

      const c = el("div",{class:`card reveal ${isCanceled ? "card--ghost":""}`});
      c.append(
        el("div",{class:"card__row"}, [
          el("div",{}, [
            el("div",{class:"card__title"}, s?.nome || "Serviço"),
            el("div",{class:"card__desc"}, `${b?.nome || "Barbeiro"} • ${fmtDateTime(a.dataHora)}`)
          ]),
          el("span",{class:"badge"}, status)
        ])
      );

      const actions = el("div",{style:"margin-top:12px;display:flex;gap:10px;flex-wrap:wrap"});
      if(user.role==="cliente" && status==="Agendado"){
        actions.append(el("button",{class:"btn btn--danger", type:"button", onClick: ()=> confirmCancel(a.id)}, "Cancelar"));
      }
      if(user.role==="barbeiro" && status==="Agendado"){
        actions.append(el("button",{class:"btn btn--primary", type:"button", onClick: ()=>{
          api.completeAppointment(a.id, user.id);
          toast("Atendimento marcado como concluído ✅");
          render();
        }}, "Concluir"));
      }
      if(user.role==="admin"){
        actions.append(el("button",{class:"btn", type:"button", onClick: ()=> toast("Dica: no painel admin você vê relatórios.")}, "Info"));
      }
      if(actions.children.length) c.append(actions);

      list.append(c);
    }
    mountReveal(wrap);
  }

  function confirmCancel(id){
    modal({
      title:"Cancelar agendamento?",
      body:"Você tem certeza que deseja cancelar? Cancelamentos devem ser feitos com pelo menos 2 horas de antecedência.",
      actions:[
        { label:"Voltar", variant:"btn--outline", onClick: ()=>{} },
        { label:"Cancelar Agendamento", variant:"btn--danger", onClick: ()=>{
            try{
              api.cancelAppointment(id, user.id);
              toast("Agendamento cancelado.");
              render();
            }catch(e){
              toast(e.message || "Não foi possível cancelar.");
            }
          }
        }
      ]
    });
  }

  render();
  mountReveal(wrap);
  return wrap;
}
