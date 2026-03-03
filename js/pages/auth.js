import { el, toast, mountReveal } from "../ui/ui.js";
import * as api from "../data/api.js";

export function AuthPage(){
  const wrap = el("div", {});
  wrap.append(
    el("h1", {class:"h1 reveal"}, "Entrar"),
    el("p", {class:"sub reveal"}, "Acesse sua conta para agendar com poucos cliques.")
  );

  const tabs = el("div", {class:"tabs reveal"});
  const tLogin = el("button", {class:"tab is-active", type:"button"}, "ENTRAR");
  const tReg = el("button", {class:"tab", type:"button"}, "CADASTRAR");
  tabs.append(tLogin, tReg);
  wrap.append(tabs);

  const card = el("div", {class:"card reveal"});
  wrap.append(card);

  function renderLogin(){
    card.innerHTML = "";
    const email = el("input", {class:"input", type:"email", placeholder:"seu@email.com", autocomplete:"email"});
    const pass = el("input", {class:"input", type:"password", placeholder:"••••••", autocomplete:"current-password"});
    card.append(
      el("div", {class:"field"}, [el("div",{class:"label"},"E-mail"), email]),
      el("div", {class:"field"}, [el("div",{class:"label"},"Senha"), pass]),
      el("div", {class:"helper"}, "Dica: contas demo → cliente@bellator.com / 123456 • admin@bellator.com / 123456 • carlos@bellator.com / 123456"),
      el("div", {class:"hr"}),
      el("button", {class:"btn btn--primary", type:"button", onClick: async ()=>{
        try{
          await api.login(email.value, pass.value);
          location.hash = "#/home";
          toast("Bem-vindo 👊");
        }catch(e){
          toast(e.message || "Falha ao entrar.");
        }
      }}, "Entrar")
    );
  }

  function renderRegister(){
    card.innerHTML = "";
    const nome = el("input", {class:"input", type:"text", placeholder:"Seu nome completo", autocomplete:"name"});
    const email = el("input", {class:"input", type:"email", placeholder:"seu@email.com", autocomplete:"email"});
    const tel = el("input", {class:"input", type:"tel", placeholder:"(81) 9xxxx-xxxx", autocomplete:"tel"});
    const pass = el("input", {class:"input", type:"password", placeholder:"Crie uma senha", autocomplete:"new-password"});
    const terms = el("label", {class:"helper"}, [
      el("input", {type:"checkbox"}), " Ao se cadastrar, você concorda com nossos ",
      el("strong", {}, "Termos de uso"), " e ", el("strong", {}, "Política de privacidade"), "."
    ]);

    card.append(
      el("h2", {class:"h1", style:"font-size:18px;margin-top:0"}, "Criar conta"),
      el("p", {class:"sub", style:"margin-top:-2px"}, "Preencha seus dados para se cadastrar."),
      el("div", {class:"field"}, [el("div",{class:"label"},"Nome Completo"), nome]),
      el("div", {class:"field"}, [el("div",{class:"label"},"E-mail"), email]),
      el("div", {class:"field"}, [el("div",{class:"label"},"Telefone"), tel]),
      el("div", {class:"field"}, [el("div",{class:"label"},"Senha"), pass]),
      terms,
      el("div", {class:"hr"}),
      el("button", {class:"btn btn--primary", type:"button", onClick: async ()=>{
        const checked = terms.querySelector("input").checked;
        if(!checked) return toast("Aceite os termos para continuar.");
        if(pass.value.trim().length < 6) return toast("Sua senha deve ter pelo menos 6 caracteres.");
        try{
          await api.register({nome:nome.value, email:email.value, telefone:tel.value, senha:pass.value});
          location.hash = "#/home";
          toast("Conta criada com sucesso ✅");
        }catch(e){
          toast(e.message || "Falha ao cadastrar.");
        }
      }}, "Cadastrar")
    );
  }

  tLogin.addEventListener("click", ()=>{
    tLogin.classList.add("is-active"); tReg.classList.remove("is-active");
    renderLogin();
  });
  tReg.addEventListener("click", ()=>{
    tReg.classList.add("is-active"); tLogin.classList.remove("is-active");
    renderRegister();
  });

  renderLogin();
  mountReveal(wrap);
  return wrap;
}
