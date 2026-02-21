"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Sun, BookOpen, Shield, Home, Moon, Coffee, LogOut, Star, Headphones } from "lucide-react";

export default function DoaPage() {
  const router = useRouter();

  const categories = [
    { id: "morning", name: "Pagi", sub: "Dzikir Pagi", icon: Sun, color: "bg-amber-50", iconColor: "text-amber-500" },
    { id: "quranic", name: "Al-Qur'an", sub: "Doa Pilihan", icon: BookOpen, color: "bg-emerald-50", iconColor: "text-emerald-500" },
    { id: "protection", name: "Perlindungan", sub: "Keamanan & Ketenangan", icon: Shield, color: "bg-blue-50", iconColor: "text-blue-500" },
    { id: "daily", name: "Keseharian", sub: "Aktivitas Harian", icon: Home, color: "bg-rose-50", iconColor: "text-rose-500" },
  ];

  const routines = [
    { name: "Sebelum Tidur", sub: "Baca Ayat Kursi & 3 Qul", icon: Moon, color: "bg-indigo-50", iconColor: "text-indigo-500" },
    { name: "Selesai Makan", sub: "Alhamdulillahilladzi at'amana...", icon: Coffee, color: "bg-orange-50", iconColor: "text-orange-500" },
    { name: "Keluar Rumah", sub: "Bismillahi tawakkaltu 'alallah", icon: LogOut, color: "bg-emerald-50", iconColor: "text-emerald-500" },
  ];

  return (
    <main className="min-h-screen bg-white pb-24 max-w-lg mx-auto overflow-x-hidden">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-slate-800">Doa & Dzikir</h1>
        <div className="w-12"></div>
      </header>

      <section className="px-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Pilihan Hari Ini</h2>
          <span className="px-3 py-1 bg-blue-50 text-[10px] font-black text-blue-500 rounded-full uppercase">Menjelang Maghrib</span>
        </div>
        
        <div className="relative overflow-hidden bg-emerald-50/50 rounded-[40px] p-8 border border-emerald-100">
           <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <svg width="180" height="150" viewBox="0 0 100 100" fill="currentColor" className="text-emerald-600">
                 <path d="M0 100h100V60C100 30 80 10 50 10S0 30 0 60v40z" />
              </svg>
           </div>

           <div className="relative z-10 text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Moon className="text-emerald-600" size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-1">Doa Buka Puasa</h3>
              <p className="text-xs font-bold text-slate-400 mb-6">Berbuka puasa</p>
              
              <div className="space-y-4 mb-8">
                 <p className="text-2xl font-black text-slate-800 leading-relaxed font-arabic px-4" dir="rtl">
                    اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ
                 </p>
                 <p className="text-[11px] font-bold text-slate-400 italic leading-relaxed px-6">
                    Ya Allah, untuk-Mu aku berpuasa, kepada-Mu aku beriman, dengan rezeki-Mu aku berbuka, dengan rahmat-Mu wahai Yang Maha Pengasih.
                 </p>
              </div>
           </div>
        </div>
      </section>

      <section className="px-6 mt-8">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-5">Kategori</h2>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((cat) => (
            <button 
              key={cat.id}
              className={`${cat.color} p-6 rounded-[32px] text-left border border-white hover:scale-[1.02] active:scale-95 transition-all group shadow-sm`}
            >
              <div className={`w-10 h-10 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                <cat.icon size={18} className={cat.iconColor} />
              </div>
              <h3 className="text-sm font-black text-slate-800 mb-0.5">{cat.name}</h3>
              <p className="text-[10px] font-bold text-slate-400">{cat.sub}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 mt-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Rutinitas Harian</h2>
          <button className="text-[10px] font-black text-emerald-600 px-3 py-1 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors">Lihat Semua</button>
        </div>
        
        <div className="space-y-4">
          {routines.map((item, i) => (
            <div 
              key={i}
              className="group flex items-center p-4 bg-white rounded-[32px] border border-slate-50 shadow-sm hover:border-emerald-100 transition-all cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mr-5 group-hover:scale-105 transition-transform`}>
                <item.icon size={20} className={item.iconColor} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black text-slate-800 mb-0.5">{item.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 line-clamp-1">{item.sub}</p>
              </div>
              <button className="p-3 text-slate-200 hover:text-rose-500 transition-colors">
                <Star size={20} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
