import { el } from "./ui.js";

const DOW = ["D","S","T","Q","Q","S","S"]; // dom..sab

export function Calendar({value, onChange, minDate=new Date(), disabledDates=[]}){
  const state = {
    month: value ? new Date(value) : new Date(),
    selected: value ? new Date(value) : null
  };
  state.month.setDate(1);

  const root = el("div", {class:"calendar reveal"});
  const head = el("div", {class:"cal-head"});
  const prev = el("button", {class:"icon-btn", ariaLabel:"Mês anterior", title:"Mês anterior"});
  prev.innerHTML = "<i data-lucide='arrow-left'></i>";
  const next = el("button", {class:"icon-btn", ariaLabel:"Próximo mês", title:"Próximo mês"});
  next.innerHTML = "<i data-lucide='arrow-right'></i>";
  const title = el("div", {class:"cal-title"});
  head.append(prev, title, next);
  root.append(head);

  const grid = el("div", {class:"cal-grid"});
  root.append(grid);

  function sameDay(a,b){
    return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  }
  function inDisabled(d){
    return disabledDates.some(x => sameDay(new Date(x), d));
  }
  function isBeforeMin(d){
    const md = new Date(minDate);
    md.setHours(0,0,0,0);
    const dd = new Date(d);
    dd.setHours(0,0,0,0);
    return dd < md;
  }

  function render(){
    grid.innerHTML = "";
    const m = new Date(state.month);
    const monthName = new Intl.DateTimeFormat("pt-BR", { month:"long", year:"numeric" }).format(m);
    title.textContent = monthName[0].toUpperCase() + monthName.slice(1);

    // dow row
    for(const d of DOW){
      grid.appendChild(el("div", {class:"cal-dow"}, d));
    }

    const firstDow = m.getDay();
    const daysInMonth = new Date(m.getFullYear(), m.getMonth()+1, 0).getDate();

    // leading blanks
    for(let i=0;i<firstDow;i++){
      const blank = el("div", {class:"cal-day is-muted"}, "");
      blank.style.visibility = "hidden";
      grid.appendChild(blank);
    }

    for(let day=1; day<=daysInMonth; day++){
      const d = new Date(m.getFullYear(), m.getMonth(), day);
      const btn = el("button", {class:"cal-day", type:"button"}, String(day));
      const disabled = isBeforeMin(d) || inDisabled(d);
      if(disabled){
        btn.classList.add("is-disabled");
        btn.disabled = true;
      }
      if(state.selected && sameDay(state.selected, d)){
        btn.classList.add("is-selected");
      }
      btn.addEventListener("click", ()=>{
        state.selected = d;
        onChange?.(new Date(d));
        render();
      });
      grid.appendChild(btn);
    }
  }

  prev.addEventListener("click", ()=>{
    state.month = new Date(state.month.getFullYear(), state.month.getMonth()-1, 1);
    render();
  });
  next.addEventListener("click", ()=>{
    state.month = new Date(state.month.getFullYear(), state.month.getMonth()+1, 1);
    render();
  });

  render();
  return root;
}
