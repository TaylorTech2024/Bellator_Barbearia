import { uid, nowISO } from "./storage.js";

export function makeSeed(){
  // Serviços (RF04, tabela servico)
  const services = [
    { id: "srv_corte", nome:"Corte Tradicional", descricao:"Corte clássico com máquina e tesoura", duracaoMin:25, preco:25.00, tag:"Popular", icon:"scissors" },
    { id: "srv_corte_barba", nome:"Corte + Barba", descricao:"Corte completo + Barba alinhada", duracaoMin:35, preco:35.00, tag:"Popular", icon:"scissors" },
    { id: "srv_barba", nome:"Barba Completa", descricao:"Aparar, alinhar e finalizar a barba", duracaoMin:15, preco:20.00, tag:"", icon:"scissors" },
    { id: "srv_acab", nome:"Acabamento", descricao:"Refino nos detalhes", duracaoMin:10, preco:7.00, tag:"", icon:"scissors" },
  ];

  // Barbeiros (RF06)
  const barbers = [
    { id:"barb_carlos", nome:"Carlos", especialidade:"Cortes e Barba", avaliacao:4.9, telefone:"", horarios:{ start:"09:00", end:"18:00", stepMin:30 } },
    { id:"barb_pablo", nome:"Pablo Yan", especialidade:"Barba e acabamento", avaliacao:4.8, telefone:"", horarios:{ start:"09:00", end:"18:00", stepMin:30 } },
    { id:"barb_joao", nome:"João", especialidade:"Cortes degradê", avaliacao:4.7, telefone:"", horarios:{ start:"10:00", end:"19:00", stepMin:30 } },
  ];

  // Usuários (cliente/barbeiro/admin). Para demo, senha = 123456
  const users = [
    { id:"adm_1", role:"admin", nome:"Administrador", email:"admin@bellator.com", telefone:"", senhaHash:"8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", createdAt: nowISO() },
    { id:"cli_demo", role:"cliente", nome:"Cliente Demo", email:"cliente@bellator.com", telefone:"81999990000", senhaHash:"8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", createdAt: nowISO() },
    { id:"barb_user_carlos", role:"barbeiro", nome:"Carlos", email:"carlos@bellator.com", telefone:"", senhaHash:"8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", barberId:"barb_carlos", createdAt: nowISO() },
  ];

  // Agendamentos (RF03/RF07)
  const appts = [
    { id: uid("ag"), clienteId:"cli_demo", barbeiroId:"barb_pablo", servicoId:"srv_corte_barba", dataHora:"2025-10-23T08:00:00.000Z", status:"Agendado", createdAt: nowISO() },
  ];

  return {
    meta: { createdAt: nowISO(), version:"1.0" },
    services,
    barbers,
    users,
    appointments: appts,
    reviews: [],
    payments: []
  };
}
