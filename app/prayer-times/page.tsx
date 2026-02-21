"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Share2, MapPin, ChevronDown, ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import { DateTime } from "luxon";

interface PrayerTime {
  date: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export default function PrayerTimesPage() {
  const [schedule, setSchedule] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<{ id: string; lokasi: string }[]>([]);
  const [currentCity, setCurrentCity] = useState({ id: "1301", lokasi: "KOTA JAKARTA" });
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hijriDate, setHijriDate] = useState("");
  
  const today = DateTime.local().setZone("Asia/Jakarta");
  const year = today.year;
  const month = today.month;
  const day = today.day;

  useEffect(() => {
    const savedCity = localStorage.getItem("selectedCity");
    if (savedCity) {
      setCurrentCity(JSON.parse(savedCity));
    }

    async function fetchCities() {
      try {
        const res = await fetch("https://api.myquran.com/v1/sholat/kota/semua");
        const json = await res.json();
        if (json.status) setCities(json.data);
      } catch (e) {
        console.error("Failed to fetch cities", e);
      }
    }
    fetchCities();
  }, []);

  const handleCitySelect = (city: { id: string; lokasi: string }) => {
    setCurrentCity(city);
    localStorage.setItem("selectedCity", JSON.stringify(city));
    setShowSearch(false);
    setSearchQuery("");
  };

  const filteredCities = cities.filter(c => 
    c.lokasi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    async function fetchSchedule() {
      try {
        setLoading(true);
        const res = await fetch(`https://api.myquran.com/v1/sholat/jadwal/${currentCity.id}/${year}/${month}`);
        const json = await res.json();
        if (json.status) {
          setSchedule(json.data.jadwal);
          setHijriDate("Ramadan 1446 H"); 
        }
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
  }, [currentCity, year, month]);

  return (
    <main className="min-h-screen bg-[#f8fafc] max-w-lg mx-auto pb-24">
      <header className="flex items-center justify-between px-6 py-8">
        <Link href="/" className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-50 text-slate-600 hover:text-emerald-500 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Jadwal Sholat</h1>
        <button className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-50 text-emerald-500 hover:bg-emerald-50 transition-colors">
          <Share2 size={20} />
        </button>
      </header>

      <section className="px-6 mb-8">
        <div 
          onClick={() => setShowSearch(true)}
          className="flex items-center justify-between p-5 bg-white rounded-[28px] border border-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.02)] cursor-pointer hover:border-emerald-200 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-emerald-50 text-emerald-500 rounded-2xl">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Lokasi Anda</p>
              <h3 className="text-base font-bold text-slate-800">{currentCity.lokasi}</h3>
            </div>
          </div>
          <ChevronDown size={20} className="text-slate-300" />
        </div>
      </section>

      {showSearch && (
        <div className="fixed inset-0 z-100 bg-white max-w-lg mx-auto overflow-hidden flex flex-col pt-12 text-slate-800">
          <div className="px-6 flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-800">Cari Kota</h2>
            <button onClick={() => setShowSearch(false)} className="p-2 text-slate-400 hover:text-rose-500">
              <X size={24} />
            </button>
          </div>
          
          <div className="px-6 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Mau cari kota apa? (Contoh: Surabaya)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                autoFocus
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-2">
            {filteredCities.map(city => (
              <button
                key={city.id}
                onClick={() => handleCitySelect(city)}
                className="w-full flex items-center justify-between p-4 bg-white border border-slate-50 rounded-2xl hover:bg-emerald-50 hover:border-emerald-100 transition-all text-left group"
              >
                <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">{city.lokasi}</span>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
              </button>
            ))}
            {searchQuery && filteredCities.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm font-bold">Yah, kotanya nggak ketemu... 😅</p>
              </div>
            )}
          </div>
        </div>
      )}

      <section className="px-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <button className="p-2 text-slate-300 hover:text-emerald-500 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="text-center text-slate-800">
            <h2 className="text-xl font-black mb-1">{hijriDate}</h2>
            <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
              {today.toFormat("MMMM yyyy")}
            </p>
          </div>
          <button className="p-2 text-slate-300 hover:text-emerald-500 transition-colors">
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      <div className="px-6 sticky top-0 z-30 bg-[#f8fafc]/90 backdrop-blur-lg">
        <div className="flex items-center py-4 bg-slate-50/80 rounded-2xl px-2 mb-4">
          {["TGL", "IMSAK", "SUBUH", "DZU", "ASHR", "MAGH", "ISYA"].map((h) => (
            <span key={h} className="flex-1 text-center text-[10px] font-black text-slate-400 tracking-wider">
              {h}
            </span>
          ))}
        </div>
      </div>

      <section className="px-5 space-y-3">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-16 bg-white rounded-3xl animate-pulse border border-slate-50"></div>
            ))}
          </div>
        ) : (
          schedule.map((item, idx) => {
            const isToday = idx + 1 === day;
            return (
              <div
                key={item.date}
                className={`flex items-center p-4 rounded-3xl transition-all ${
                  isToday 
                    ? "bg-emerald-50/50 border-2 border-emerald-100 shadow-[0_8px_30px_rgba(16,185,129,0.08)] scale-[1.02]" 
                    : "bg-white border border-slate-50 shadow-sm"
                }`}
              >
                <div className="flex-1 flex flex-col items-center justify-center">
                   <div className={`w-9 h-9 flex items-center justify-center rounded-2xl transition-all shadow-sm ${
                     isToday ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-slate-50 text-slate-800"
                   }`}>
                     <span className="text-xs font-black">{idx + 1}</span>
                   </div>
                   {isToday && <span className="text-[7px] font-black text-emerald-600 mt-2 uppercase tracking-widest">HARI INI</span>}
                </div>
                {[item.imsak, item.subuh, item.dzuhur, item.ashar, item.maghrib, item.isya].map((time, tIdx) => {
                  return (
                    <span 
                      key={tIdx} 
                      className={`flex-1 text-center text-[13px] font-bold ${
                        isToday ? "text-emerald-700 font-black" : "text-slate-500"
                      }`}
                    >
                      {time}
                    </span>
                  );
                })}
              </div>
            );
          })
        )}
      </section>
    </main>
  );
}
