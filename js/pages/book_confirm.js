import { el, toast, money, fmtDate, fmtTime, mountReveal } from "../ui/ui.js";
import * as api from "../data/api.js";

export function BookConfirmPage(ctx){
  const { user } = ctx;
  const wrap = el("div", {});

  const db = api.ensureDB();
  const services = Object.fromEntries(db.services.map(s=>[s.id,s]));
  const barbers = Object.fromEntries(db.barbers.map(b=>[b.id,b]));
  const service = services[ctx.wizard.serviceId];
  const barber = barbers[ctx.wizard.barberId];
  const dt = new Date(ctx.wizard.datetimeISO);

  wrap.append(
    el("div",{class:"section"}, [
      el("div",{class:"card reveal"}, [
        el("div",{style:"display:flex; align-items:center; justify-content:center; margin:8px 0 6px"}, [
          el("span",{class:"icon", "data-icon":"check", style:"width:42px;height:42px"})
        ]),
        el("h1",{class:"h1", style:"text-align:center;margin-top:0"}, "Agendamento Confirmado!"),
        el("p",{class:"sub", style:"text-align:center;margin-top:-6px"}, "Seu horário foi reservado com sucesso"),
        el("div",{style:"display:grid; gap:10px; margin-top:12px"}, [
          kv("scissors","Serviço", service?.nome || "-", money(service?.preco||0)),
          kv("user","Barbeiro", barber?.nome || "-", barber?.especialidade || ""),
          kv("calendar","Data", fmtDate(dt.toISOString()), ""),
          kv("clock","Horário", fmtTime(dt.toISOString()), "")
        ])
      ])
    ])
  );

  wrap.append(
    el("div",{class:"card reveal"}, [
      el("div",{class:"kv"}, [
        el("span",{class:"icon","data-icon":"pin"}),
        el("div",{}, [
          el("small",{},"Localização"),
          el("br"),
          el("strong",{},"Bellator Barbearia"),
          el("br"),
          el("small",{},"R. Aristóteles Paes de Azevedo, 145 - Pau Amarelo, Paulista - PE, 53431-145")
        ]),
        el("div",{class:"right"},"")
      ]),
      el("div",{class:"hr"}),
      el("div",{class:"card card--ghost", style:"border-radius:16px;padding:12px"}, [
        el("div",{style:"display:flex; gap:10px; align-items:flex-start"}, [
          el("span",{class:"icon","data-icon":"shield", style:"margin-top:2px"}),
          el("div",{}, [
            el("div",{style:"font-weight:700; font-size:12px"}, "Importante:"),
            el("div",{class:"helper"}, "Chegue com 5 minutos de antecedência. Cancelamentos devem ser feitos com pelo menos 2 horas de antecedência.")
          ])
        ])
      ])
    ])
  );

  wrap.append(
    el("div",{class:"section reveal"}, [
      el("button",{class:"btn btn--primary", type:"button", onClick: ()=> location.hash="#/appointments"}, "Ver meus agendamentos"),
      el("div",{style:"height:10px"}),
      el("button",{class:"btn btn--outline", type:"button", onClick: ()=> location.hash="#/home"}, "Voltar ao início")
    ])
  );

  // create the appointment exactly once per entry (idempotent by flag)
  if(!ctx.wizard.__created){
    try{
      api.createAppointment({ clienteId:user.id, barbeiroId:ctx.wizard.barberId, servicoId:ctx.wizard.serviceId, dataHoraISO: ctx.wizard.datetimeISO });
      ctx.wizard.__created = true;
    }catch(e){
      toast(e.message || "Não foi possível finalizar.");
    }
  }

  mountReveal(wrap);
  return wrap;
}

function kv(icon, label, left, right){
  return el("div",{class:"kv"}, [
    el("span",{class:"icon","data-icon":icon}),
    el("div",{}, [el("small",{}, label), el("br"), el("strong",{}, left)]),
    el("div",{class:"right"}, right||"")
  ]);
}
