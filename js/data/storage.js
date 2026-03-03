// Simple storage helpers (localStorage)
const KEY = "bellator_db_v1";

export function loadDB(){
  const raw = localStorage.getItem(KEY);
  if(!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
export function saveDB(db){
  localStorage.setItem(KEY, JSON.stringify(db));
}
export function resetDB(){
  localStorage.removeItem(KEY);
}
export function nowISO(){
  return new Date().toISOString();
}
export function uid(prefix="id"){
  return prefix + "_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}
