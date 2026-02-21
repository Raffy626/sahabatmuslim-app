"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Shield, Info, Check, Save } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [calculationMethod, setCalculationMethod] = useState("MoonsightingCommittee");
  const [isSaved, setIsSaved] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setHasMounted(true);
      const savedName = localStorage.getItem("userName");
      const savedMethod = localStorage.getItem("calculationMethod");
      if (savedName) setName(savedName);
      if (savedMethod) setCalculationMethod(savedMethod);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  const handleSave = () => {
    localStorage.setItem("userName", name);
    localStorage.setItem("calculationMethod", calculationMethod);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (!hasMounted) return null;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 max-w-lg mx-auto overflow-x-hidden">
      <header className="bg-white px-6 pt-8 pb-6 rounded-b-[40px] shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-2xl transition-all active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-black tracking-tight text-slate-800">Pengaturan</h1>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em]">Profil & Aplikasi</p>
          </div>
          <div className="w-12"></div>
        </div>
      </header>

      <div className="px-6 py-8 space-y-8">
        <section>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Profil Pengguna</h2>
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nama Kamu</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama..."
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all outline-hidden"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Preferensi Ibadah</h2>
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Metode Hitung Waktu Sholat</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: "MoonsightingCommittee", name: "Moonsighting Committee" },
                  { id: "MuslimWorldLeague", name: "Muslim World League" },
                  { id: "Egyptian", name: "Egyptian General Authority" },
                  { id: "Karachi", name: "University of Islamic Sciences, Karachi" },
                  { id: "Singapore", name: "MUIS Singapore" },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setCalculationMethod(method.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                      calculationMethod === method.id 
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" 
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {method.name}
                    {calculationMethod === method.id && <Check size={16} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Tentang Aplikasi</h2>
          <div className="bg-white rounded-[32px] p-2 shadow-sm border border-slate-100 overflow-hidden text-slate-600">
            <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-all">
              <Info size={18} className="text-slate-400" />
              <span className="text-sm font-bold flex-1 text-left">Versi Aplikasi</span>
              <span className="text-[10px] font-black text-slate-300">v1.2.0</span>
            </button>
            <div className="h-px bg-slate-50 mx-6"></div>
            <button className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-all">
              <Shield size={18} className="text-slate-400" />
              <span className="text-sm font-bold flex-1 text-left">Kebijakan Privasi</span>
            </button>
          </div>
        </section>

        <div className="pt-4">
          <button 
            onClick={handleSave}
            className={`w-full flex items-center justify-center gap-3 p-5 rounded-[28px] font-black text-sm transition-all active:scale-95 shadow-2xl ${
              isSaved 
                ? "bg-emerald-100 text-emerald-600 shadow-none" 
                : "bg-emerald-600 text-white shadow-emerald-900/40 hover:bg-emerald-700"
            }`}
          >
            {isSaved ? (
              <>
                <Check size={20} />
                Berhasil Disimpan!
              </>
            ) : (
              <>
                <Save size={20} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
