// src/utils/sendForm.js
const API = import.meta.env?.VITE_API_URL || "/api";

export default async function sendForm(data, source="") {
  const res = await fetch(`${API}/send-form`, 
    { method:"POST", headers:{ "Content-Type":"application/json"}, 
    body: JSON.stringify({ ...data, source }) });
  return await res.json();
}
