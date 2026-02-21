"use client";

import { useEffect, useState } from "react";
import { Search, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";

interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
}

interface Juz {
  number: number;
  startSurah: string;
  startAyah: number;
}

interface MetaJuz {
  number: number;
  surah: number;
  ayah: number;
}

export default function QuranPage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [juzs, setJuzs] = useState<Juz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Surah");
  const [lastRead, setLastRead] = useState<{ surah: string; ayah: number } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lastRead");
    if (saved) {
      setLastRead(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    async function fetchData() {
      try {
        setLoading(true);
        console.log("Fetching Quran data...");
        
        const surahRes = await fetch("https://equran.id/api/v2/surat");
        if (!surahRes.ok) throw new Error("Surah API failed");
        const surahJson = await surahRes.json();
        const surahList = surahJson.data || [];
        
        const metaRes = await fetch("https://api.alquran.cloud/v1/meta");
        if (!metaRes.ok) throw new Error("Meta API failed");
        const metaJson = await metaRes.json();
        
        const juzReferences = metaJson.data?.juzs?.references || [];
        const juzList = juzReferences.map((ref: MetaJuz, i: number) => {
          const startSurah = surahList.find((s: Surah) => s.nomor === ref.surah);
          return {
            number: i + 1,
            startSurah: startSurah ? startSurah.namaLatin : `Surah ${ref.surah}`,
            startAyah: ref.ayah
          };
        });

        if (isMounted) {
          console.log("Data fetched successfully", { surahCount: surahList.length, juzCount: juzList.length });
          setSurahs(surahList);
          setJuzs(juzList);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const handleTabChange = (tab: string) => {
    console.log("Switching tab to:", tab);
    setActiveTab(tab);
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] px-6 pt-12 pb-24 max-w-lg mx-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-emerald-900 tracking-tight">Al-Qur&apos;an</h1>
        <button className="p-2 text-slate-500 hover:text-emerald-500 transition-colors">
          <Search size={24} />
        </button>
      </header>

      <section className="mb-10">
        <div className="relative overflow-hidden bg-linear-to-br from-emerald-500 to-emerald-600 rounded-[32px] p-7 text-white shadow-xl shadow-emerald-100 transition-all hover:shadow-2xl hover:shadow-emerald-200">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 opacity-90">
              <BookOpen size={18} fill="white" className="opacity-80" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase">Last Read</span>
            </div>
            
            <div className="mb-8">
              <h2 className="text-3xl font-black mb-1.5 tracking-tight">
                {lastRead ? lastRead.surah : "Surah Al-Fatihah"}
              </h2>
              <p className="text-emerald-50/90 font-medium text-sm">
                Ayah {lastRead ? lastRead.ayah : "1"}
              </p>
            </div>
            
            <div className="flex items-center justify-between gap-5">
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000"
                  style={{ width: lastRead ? '35%' : '10%' }}
                ></div>
              </div>
              <Link href={`/quran/surah/${lastRead ? (surahs.find(s => s.namaLatin === lastRead.surah)?.nomor || 1) : 1}`}>
                <button className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 transition-all rounded-2xl text-xs font-black backdrop-blur-md active:scale-95 cursor-pointer">
                  Continue <ChevronRight size={14} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
                <div className="flex border-b border-slate-100">
          {["Surah", "Juz"].map((tab) => (
            <button
              key={`tab-${tab}`}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 py-4 text-sm font-bold transition-all relative cursor-pointer z-20 ${
                activeTab === tab ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute -bottom-px left-0 w-full h-[3px] bg-emerald-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={`loading-${i}`} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-50 shadow-sm"></div>
            ))}
          </div>
        ) : activeTab === "Surah" ? (
          surahs.map((surah) => (
            <Link key={`surah-item-${surah.nomor}`} href={`/quran/surah/${surah.nomor}`} className="block">
              <div
                className="group flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg hover:shadow-emerald-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className="relative w-11 h-11 flex items-center justify-center">
                    <div className="absolute inset-0 bg-emerald-50 rounded-xl rotate-45 group-hover:bg-emerald-500 transition-all"></div>
                    <span className="relative text-sm font-black text-emerald-600 group-hover:text-white transition-colors z-10">{surah.nomor}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 mb-0.5">{surah.namaLatin}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>{surah.tempatTurun}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span>{surah.jumlahAyat} Verses</span>
                    </div>
                  </div>
                </div>
                <div className="text-xl font-serif text-emerald-700 tracking-wide">
                  {surah.nama}
                </div>
              </div>
            </Link>
          ))
        ) : (
          juzs.map((juz) => (
            <Link key={`juz-item-${juz.number}`} href={`/quran/juz/${juz.number}`} className="block">
              <div
                className="group flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg hover:shadow-emerald-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className="relative w-11 h-11 flex items-center justify-center">
                    <div className="absolute inset-0 bg-emerald-50 rounded-xl rotate-45 group-hover:bg-emerald-500 transition-all"></div>
                    <span className="relative text-sm font-black text-emerald-600 group-hover:text-white transition-colors z-10">{juz.number}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 mb-0.5">Juz {juz.number}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Starts at {juz.startSurah}: Ayah {juz.startAyah}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </div>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}