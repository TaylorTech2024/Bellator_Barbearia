import { loadDB, saveDB, uid, nowISO } from "./storage.js";
import { sha256 } from "./crypto.js";
import { makeSeed } from "./seed.js";

export function ensureDB(){
  let db = loadDB();
  if(!db){
    db = makeSeed();
    // set password hashes
    const patchPasswords = async ()=>{
      for(const u of db.users){
        u.senhaHash = await sha256("123456");
      }
      saveDB(db);
    };
    // fire and forget (hashing)
    patchPasswords();
    saveDB(db);
  }
  return db;
}

export function getSession(){
  try { return JSON.parse(localStorage.getItem("bellator_session_v1") || "null"); }
  catch { return null; }
}
export function setSession(sess){
  localStorage.setItem("bellator_session_v1", JSON.stringify(sess));
}
export function clearSession(){
  localStorage.removeItem("bellator_session_v1");
}

export async function login(email, senha){
  const db = ensureDB();
  const pass = await sha256(senha);
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.senhaHash === pass);
  if(!user) throw new Error("E-mail ou senha inválidos.");
  const sess = { userId: user.id, role: user.role, at: nowISO() };
  setSession(sess);
  return { user, sess };
}

export async function register({nome, email, telefone, senha}){
  const db = ensureDB();
  const exists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if(exists) throw new Error("Esse e-mail já está cadastrado.");
  const user = {
    id: uid("cli"),
    role: "cliente",
    nome: nome.trim(),
    email: email.trim(),
    telefone: telefone.trim(),
    senhaHash: await sha256(senha),
    createdAt: nowISO()
  };
  db.users.push(user);
  saveDB(db);
  const sess = { userId: user.id, role: user.role, at: nowISO() };
  setSession(sess);
  return { user, sess };
}

export function me(){
  const db = ensureDB();
  const sess = getSession();
  if(!sess) return null;
  const user = db.users.find(u => u.id === sess.userId);
  if(!user) return null;
  return { user, sess };
}

export function logout(){ clearSession(); }

export function listServices(){ return ensureDB().services; }
export function listBarbers(){ return ensureDB().barbers; }

export function listAppointmentsForUser(user){
  const db = ensureDB();
  if(user.role === "cliente"){
    return db.appointments.filter(a => a.clienteId === user.id).sort((a,b)=> b.dataHora.localeCompare(a.dataHora));
  }
  if(user.role === "barbeiro"){
    const barberId = user.barberId;
    return db.appointments.filter(a => a.barbeiroId === barberId).sort((a,b)=> a.dataHora.localeCompare(b.dataHora));
  }
  // admin: all
  return db.appointments.slice().sort((a,b)=> b.dataHora.localeCompare(a.dataHora));
}

export function getAppointment(id){
  const db = ensureDB();
  return db.appointments.find(a => a.id === id);
}

export function cancelAppointment(id, byUserId){
  const db = ensureDB();
  const ap = db.appointments.find(a => a.id === id);
  if(!ap) throw new Error("Agendamento não encontrado.");
  ap.status = "Cancelado";
  ap.canceledAt = nowISO();
  ap.canceledBy = byUserId;
  saveDB(db);
  return ap;
}

export function completeAppointment(id, byUserId){
  const db = ensureDB();
  const ap = db.appointments.find(a => a.id === id);
  if(!ap) throw new Error("Agendamento não encontrado.");
  ap.status = "Concluído";
  ap.completedAt = nowISO();
  ap.completedBy = byUserId;
  saveDB(db);
  return ap;
}

export function createAppointment({clienteId, barbeiroId, servicoId, dataHoraISO}){
  const db = ensureDB();
  // enforce unique barber+datetime (similar to uq_barbeiro_horario)
  const clash = db.appointments.some(a => a.barbeiroId === barbeiroId && a.dataHora === dataHoraISO && a.status !== "Cancelado");
  if(clash) throw new Error("Esse horário acabou de ser ocupado. Escolha outro.");
  const ap = {
    id: uid("ag"),
    clienteId, barbeiroId, servicoId,
    dataHora: dataHoraISO,
    status: "Agendado",
    createdAt: nowISO()
  };
  db.appointments.push(ap);
  saveDB(db);
  return ap;
}

export function addReview({clienteId, agendamentoId, nota, comentario}){
  const db = ensureDB();
  db.reviews.push({ id: uid("rev"), clienteId, agendamentoId, nota, comentario, createdAt: nowISO() });
  saveDB(db);
}

export function adminReport(){
  const db = ensureDB();
  // faturamento: soma de atendimentos concluídos
  const mapService = Object.fromEntries(db.services.map(s=>[s.id,s]));
  const done = db.appointments.filter(a=>a.status==="Concluído");
  const total = done.reduce((sum,a)=> sum + (mapService[a.servicoId]?.preco || 0), 0);
  const byService = {};
  for(const a of done){
    const s = mapService[a.servicoId];
    if(!s) continue;
    byService[s.nome] = (byService[s.nome]||0) + 1;
  }
  return { total, doneCount: done.length, byService };
}
