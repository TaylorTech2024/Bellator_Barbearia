import { el, setActiveNav, toast, mountReveal } from "../ui/ui.js";
import * as api from "../data/api.js";

export function ProfilePage(ctx){
  setActiveNav("profile");
  const { user } = ctx;
  const wrap = el("div", {});
  wrap.append(
    el("h1",{class:"h1 reveal"},"Meu Perfil"),
    el("p",{class:"sub reveal"},"Dados básicos e preferências.")
  );

  const card = el("div",{class:"card reveal"});
  card.append(
    el("div",{class:"kv"}, [
      el("i",{"data-lucide":"user"}),
      el("div",{}, [el("strong",{}, user.nome), el("br"), el("small",{}, user.email)]),
      el("div",{class:"right"}, user.role.toUpperCase())
    ]),
    el("div",{class:"hr"}),
    el("div",{class:"kv"}, [
      el("i",{"data-lucide":"map-pin"}),
      el("div",{}, [el("strong",{},"Bellator Barbearia"), el("br"), el("small",{}, "R. Aristóteles Paes de Azevedo, 145 - Pau Amarelo, Paulista - PE")]),
      el("div",{class:"right"},"")
    ]),
    el("div",{class:"hr"}),
    el("button",{class:"btn", type:"button", onClick: ()=>{
      toast("Limpando dados demo…");
      localStorage.removeItem("bellator_db_v1");
      api.logout();
      location.hash = "#/auth";
    }}, "Resetar dados (demo)"),
    el("div",{style:"height:10px"}),
    el("button",{class:"btn btn--danger", type:"button", onClick: ()=>{
      api.logout();
      location.hash = "#/auth";
      toast("Você saiu.");
    }}, "Sair")
  );

  wrap.append(card);
  mountReveal(wrap);
  return wrap;
}
