import { el, toast, money, mountReveal } from "../ui/ui.js";
import * as api from "../data/api.js";

export function AdminPage(ctx){
  const wrap = el("div", {});
  wrap.append(
    el("h1",{class:"h1 reveal"},"Painel do Administrador"),
    el("p",{class:"sub reveal"},"Relatórios e cadastros (demo).")
  );

  const report = api.adminReport();
  const card = el("div",{class:"card reveal"});
  card.append(
    el("div",{class:"kv"}, [
      el("i",{"data-lucide":"calendar"}),
      el("div",{}, [el("small",{},"Atendimentos concluídos"), el("br"), el("strong",{}, String(report.doneCount))]),
      el("div",{class:"right"},"")
    ]),
    el("div",{class:"hr"}),
    el("div",{class:"kv"}, [
      el("i",{"data-lucide":"star"}),
      el("div",{}, [el("small",{},"Faturamento (concluídos)"), el("br"), el("strong",{}, money(report.total))]),
      el("div",{class:"right"},"")
    ])
  );

  const by = el("div",{class:"section reveal"});
  by.append(el("div",{class:"sub", style:"margin-bottom:10px"}, "Concluídos por serviço"));
  const table = el("div",{style:"display:grid; gap:10px"});
  for(const [k,v] of Object.entries(report.byService)){
    table.append(el("div",{class:"kv"}, [
      el("i",{"data-lucide":"scissors"}),
      el("div",{}, [el("strong",{}, k), el("br"), el("small",{}, "Quantidade")]),
      el("div",{class:"right"}, String(v))
    ]));
  }
  if(Object.keys(report.byService).length===0){
    table.append(el("div",{class:"card card--ghost"}, [
      el("div",{class:"card__title"},"Sem atendimentos concluídos ainda."),
      el("div",{class:"card__desc"},"Marque um atendimento como concluído no painel do barbeiro.")
    ]));
  }
  by.append(table);

  const manage = el("div",{class:"section"}, [
    el("div",{class:"sub reveal", style:"margin-bottom:10px"},"Cadastros (RF06 / RF04)"),
    el("div",{class:"card reveal"}, [
      el("div",{class:"card__title"},"Serviços e barbeiros"),
      el("div",{class:"card__desc"},"No projeto final com back-end, aqui você cadastraria/editaría serviços, barbeiros e horários de trabalho."),
      el("div",{class:"hr"}),
      el("button",{class:"btn", type:"button", onClick: ()=> toast("Demo front-end: cadastros ficam no seed.js.")}, "Abrir cadastros")
    ])
  ]);

  wrap.append(card, by, manage);
  mountReveal(wrap);
  return wrap;
}
