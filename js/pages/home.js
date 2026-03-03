import { el, setActiveNav, mountReveal } from "../ui/ui.js";
import * as api from "../data/api.js";

export function HomePage(ctx){
  setActiveNav("home");
  const { user } = ctx;

  const wrap = el("div", {});
  wrap.append(
    el("h1", {class:"h1 reveal"}, `Olá, ${firstName(user.nome)} 👋`),
    el("p", {class:"sub reveal"}, "Bem-vindo à Bellator Barbearia. Seu agendamento em poucos cliques.")
  );

  // quick stats from figma
  const stats = el("div", {class:"grid3"});
  stats.append(
    stat("star", "4.9", "Avaliação"),
    stat("clock", "30 min", "Média"),
    stat("pin", "2.0 km", "Distância")
  );
  wrap.append(stats);

  wrap.append(
    el("div", {class:"section reveal"}, [
      el("button", {class:"btn btn--primary", type:"button", onClick: ()=> location.hash="#/book/service"}, [
        el("i",{"data-lucide":"scissors"}), "Agendar Agora"
      ]),
      el("div",{style:"height:10px"}),
      el("button", {class:"btn", type:"button", onClick: ()=> location.hash="#/appointments"}, "Ver meus agendamentos")
    ])
  );

  wrap.append(el("div",{class:"section"}, [
    el("div",{class:"sub reveal", style:"margin-bottom:8px"}, "Por que escolher a Bellator?"),
    feature("shield", "Profissionais de Elite", "Barbeiros experientes e certificados"),
    feature("clock", "Agendamento Simples", "Reserve seu horário em poucos cliques"),
    feature("scissors", "Tradição e Excelência", "Experiência premium desde 2020"),
  ]));

  if(user.role !== "cliente"){
    wrap.append(el("div",{class:"section"}, [
      el("div",{class:"sub reveal", style:"margin-bottom:8px"}, "Área do profissional"),
      el("div",{class:"card reveal"}, [
        el("div",{class:"card__row"}, [
          el("div",{}, [
            el("div",{class:"card__title"}, user.role==="admin" ? "Painel do Administrador" : "Painel do Barbeiro"),
            el("div",{class:"card__desc"}, "Acesse sua visão de agenda, relatórios e controles.")
          ]),
          el("span",{class:"badge"}, user.role.toUpperCase())
        ]),
        el("div",{class:"hr"}),
        el("button",{class:"btn btn--primary", type:"button", onClick: ()=> location.hash = user.role==="admin" ? "#/admin" : "#/barber"}, "Abrir painel")
      ])
    ]));
  }

  mountReveal(wrap);
  return wrap;
}

function firstName(n){ return (n||"").trim().split(/\s+/)[0] || "você"; }

function stat(icon, value, label){
  return el("div",{class:"stat reveal"}, [
    el("i",{"data-lucide": mapIcon(icon)}),
    el("div",{class:"stat__v"}, value),
    el("div",{class:"stat__k"}, label),
  ]);
}

function feature(icon, title, desc){
  return el("div",{class:"card card--tight reveal"}, [
    el("div",{class:"card__row"}, [
      el("i",{"data-lucide": mapIcon(icon)}),
      el("div",{}, [
        el("div",{class:"card__title"}, title),
        el("div",{class:"card__desc"}, desc),
      ])
    ])
  ]);
}

function mapIcon(name){
  const m = {star:"star",clock:"clock",pin:"map-pin",scissors:"scissors",shield:"shield",user:"user",calendar:"calendar",home:"home"};
  return m[name] || name || "circle";
}
