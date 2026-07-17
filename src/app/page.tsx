"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [days, setDays] = useState<number>(30);

  const fetchLicenses = async () => {
    const res = await fetch("/api/admin/licenses", {
      headers: { Authorization: password }
    });
    if (res.ok) {
      const data = await res.json();
      setLicenses(data);
      setLoggedIn(true);
    } else {
      if (loggedIn) alert("Nieautoryzowany dostęp");
      setLoggedIn(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLicenses();
  };

  const generateKey = async () => {
    const res = await fetch("/api/admin/generate", {
      method: "POST",
      headers: { 
        Authorization: password,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ days: Number(days) })
    });
    if (res.ok) {
      fetchLicenses();
    }
  };

  const deleteKey = async (key: string) => {
    if (!confirm("Na pewno usunąć ten klucz?")) return;
    const res = await fetch(`/api/admin/licenses/${key}`, {
      method: "DELETE",
      headers: { Authorization: password }
    });
    if (res.ok) fetchLicenses();
  };

  const resetHWID = async (key: string) => {
    if (!confirm("Na pewno zresetować HWID?")) return;
    const res = await fetch(`/api/admin/licenses/${key}`, {
      method: "PATCH",
      headers: { Authorization: password }
    });
    if (res.ok) fetchLicenses();
  };

  const formatDate = (ts: number) => {
    if (ts === -1) return "Zawsze (Perm)";
    return new Date(ts).toLocaleString();
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-6 text-center tracking-tight">AutoChat <span className="text-blue-500">License</span></h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="Hasło admina..." 
              className="bg-black/50 border border-white/10 text-white rounded-xl p-3 outline-none focus:border-blue-500 transition-colors"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              Zaloguj
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center pb-6 border-b border-white/10">
          <h1 className="text-3xl font-bold tracking-tight">Panel <span className="text-blue-500">Licencji</span></h1>
          <button onClick={() => setLoggedIn(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm font-medium">
            Wyloguj
          </button>
        </header>

        <section className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-end shadow-xl">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-400 mb-2">Ważność (dni): <span className="text-white">{days === -1 ? "Perm" : days}</span></label>
            <input 
              type="range" 
              min="-1" 
              max="365" 
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              className="w-full accent-blue-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <button onClick={generateKey} className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Generuj Klucz
          </button>
        </section>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/40 text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Klucz</th>
                <th className="px-6 py-4 font-medium">HWID</th>
                <th className="px-6 py-4 font-medium">Wygasa</th>
                <th className="px-6 py-4 font-medium text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {licenses.map(lic => (
                <tr key={lic.key} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-blue-400">{lic.key}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500 truncate max-w-[150px]">{lic.hwid || "Brak (Nieaktywowany)"}</td>
                  <td className="px-6 py-4 text-gray-300">
                    {formatDate(lic.expiry_date)}
                    {lic.expiry_date !== -1 && lic.expiry_date < Date.now() && <span className="ml-2 text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded-full">WYGASŁA</span>}
                  </td>
                  <td className="px-6 py-4 flex gap-3 justify-end opacity-50 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => resetHWID(lic.key)} className="text-yellow-500 hover:text-yellow-400 transition-colors" title="Resetuj HWID">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    </button>
                    <button onClick={() => deleteKey(lic.key)} className="text-red-500 hover:text-red-400 transition-colors" title="Usuń Klucz">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
              {licenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Brak licencji w bazie.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
