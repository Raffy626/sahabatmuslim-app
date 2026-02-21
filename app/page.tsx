"use client";

import { sanitizeArabic } from "@/src/utils/quran";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Settings, Calendar as CalendarIcon, MapPin, ChevronRight, Play, Share2, Bookmark,  CheckCircle2,
  Sunset,
  Clock,
} from "lucide-react";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";
import { DateTime } from "luxon";

export default function Home() {
  const [locationName, setLocationName] = useState("Jakarta, ID");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(DateTime.now());
  const [userName, setUserName] = useState("Sahabat Muslim");
  const [calcMethodId, setCalcMethodId] = useState("MoonsightingCommittee");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(DateTime.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    const savedMethod = localStorage.getItem("calculationMethod");
    if (savedName) setUserName(savedName);
    if (savedMethod) setCalcMethodId(savedMethod);
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const city = data.city || data.locality || "Unknown";
          const country = data.countryCode || "ID";
          setLocationName(`${city}, ${country}`);
        } catch (error) {
          console.error("Error fetching location name:", error);
        }
      }, (error) => {
        console.error("Geolocation error:", error);
      });
    }
  }, []);

  const prayerData = useMemo(() => {
    const defaultCoords = new Coordinates(-6.2088, 106.8456); // Jakarta
    const userCoords = coords ? new Coordinates(coords.latitude, coords.longitude) : defaultCoords;
    const date = new Date();

    let params;
    switch(calcMethodId) {
      case "MuslimWorldLeague": params = CalculationMethod.MuslimWorldLeague(); break;
      case "Egyptian": params = CalculationMethod.Egyptian(); break;
      case "Karachi": params = CalculationMethod.Karachi(); break;
      case "Singapore": params = CalculationMethod.Singapore(); break;
      default: params = CalculationMethod.MoonsightingCommittee();
    }
    
    const prayerTimes = new PrayerTimes(userCoords, date, params);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const prayerTimesYesterday = new PrayerTimes(userCoords, yesterday, params);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const prayerTimesTomorrow = new PrayerTimes(userCoords, tomorrow, params);

    const times = [
      { name: "Fajr", time: prayerTimes.fajr },
      { name: "Sunrise", time: prayerTimes.sunrise },
      { name: "Dhuhr", time: prayerTimes.dhuhr },
      { name: "Asr", time: prayerTimes.asr },
      { name: "Maghrib", time: prayerTimes.maghrib },
      { name: "Isha", time: prayerTimes.isha },
    ];

    const nextPrayer = prayerTimes.nextPrayer();
    const currentPrayer = prayerTimes.currentPrayer();
    
    const nextPrayerName = nextPrayer !== "none" ? nextPrayer.charAt(0).toUpperCase() + nextPrayer.slice(1) : "Fajr";
    const nextPrayerTime = nextPrayer !== "none" ? prayerTimes.timeForPrayer(nextPrayer) : prayerTimesTomorrow.fajr;
    
    let start, end;
    if (currentPrayer === "none") {
      start = prayerTimesYesterday.isha;
      end = prayerTimes.fajr;
    } else if (nextPrayer === "none") {
      start = prayerTimes.isha;
      end = prayerTimesTomorrow.fajr;
    } else {
      start = prayerTimes.timeForPrayer(currentPrayer);
      end = prayerTimes.timeForPrayer(nextPrayer);
    }

    const startTime = DateTime.fromJSDate(start as Date);
    const endTime = DateTime.fromJSDate(end as Date);
    const totalDuration = endTime.diff(startTime).as("milliseconds");
    const elapsedDuration = currentTime.diff(startTime).as("milliseconds");
    const progress = Math.min(Math.max((elapsedDuration / totalDuration) * 100, 0), 100);

    const nextDateTime = DateTime.fromJSDate(nextPrayerTime as Date);
    const diff = nextDateTime.diff(currentTime, ["hours", "minutes", "seconds"]);
    const countdown = diff.toFormat("hh'h' mm'm' ss's'");

    return {
      times: times.map(t => ({
        name: t.name,
        time: DateTime.fromJSDate(t.time).toFormat("HH:mm"),
        raw: t.time,
        active: nextPrayer === t.name.toLowerCase(),
        done: t.time < new Date()
      })),
      next: {
        name: nextPrayerName,
        time: DateTime.fromJSDate(nextPrayerTime as Date).toFormat("HH:mm"),
        countdown: countdown,
        progress: progress
      }
    };
  }, [coords, currentTime, calcMethodId]);

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 pt-6 pb-24 max-w-lg mx-auto">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Assalamu Alaikum</p>
            <h1 className="text-xl font-bold text-slate-800">{userName}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/settings"
            className="p-2.5 rounded-full bg-white shadow-sm border border-slate-100 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <Settings size={20} />
          </Link>
        </div>
      </header>

      <section className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
          {DateTime.now().toLocaleString({ day: 'numeric', month: 'long' })}
        </h2>
        <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
          <div className="flex items-center gap-1.5">
            <CalendarIcon size={16} className="text-emerald-500" />
            <span>{DateTime.now().toFormat("cccc")}</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <div className="flex items-center gap-1.5">
            <MapPin size={16} className="text-emerald-500" />
            <span>{locationName}</span>
          </div>
        </div>
      </section>

      <section className="relative mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {prayerData.next.name === 'Maghrib' ? 'Iftar Time' : 'Next Prayer'}
            </div>
            
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Upcoming Prayer</p>
            <h3 className="text-4xl font-black text-slate-800 mb-2">{prayerData.next.name}</h3>
            <p className="text-2xl font-bold text-amber-500 mb-4">{prayerData.next.time} <span className="text-sm">PM</span></p>
            
            <div className="bg-emerald-50/50 py-2 px-4 rounded-xl inline-block mb-6">
              <p className="text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <Clock size={14} />
                Time remaining <span className="font-bold">{prayerData.next.countdown}</span>
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 relative flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="8"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={2 * Math.PI * 58 * (1 - prayerData.next.progress / 100)}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-slate-50">
                   <Sunset size={28} className="text-amber-500" />
                </div>
              </div>
            </div>

            <Link href="/prayer-times" className="block w-full">
              <button className="w-full bg-emerald-50 py-4 rounded-2xl text-emerald-700 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors cursor-pointer">
                View Full Schedule <ChevronRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Quick Access</h4>
        <div className="grid grid-cols-4 gap-4">
          {[
            { name: "Quran", icon: "📖", color: "bg-blue-50 text-blue-600 border-blue-100", href: "/quran" },
            { name: "Qibla", icon: "🧭", color: "bg-emerald-50 text-emerald-600 border-emerald-100", href: "/qibla" },
            { name: "Duas", icon: "🤲", color: "bg-rose-50 text-rose-600 border-rose-100", href: "/doa" },
            { name: "Calendar", icon: "📅", color: "bg-amber-50 text-amber-600 border-amber-100", href: "/calendar" },
          ].map((item) => (
            <Link key={item.name} href={item.href || "#"} className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border shadow-sm ${item.color} hover:scale-105 transition-transform cursor-pointer`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold text-slate-500">{item.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8 overflow-hidden">
        <div className="flex justify-between items-end mb-4 pr-1">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Todays Prayers</h4>
          <Link href="/prayer-times">
            <button className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest cursor-pointer">See All</button>
          </Link>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {prayerData.times.map((prayer) => (
            <div 
              key={prayer.name} 
              className={`shrink-0 w-24 rounded-2xl p-4 border transition-all duration-300 ${
                prayer.active 
                  ? "bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-200 text-white" 
                  : "bg-white border-slate-100 shadow-sm text-slate-800"
              }`}
            >
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${prayer.active ? "opacity-90" : "text-slate-400"}`}>{prayer.name}</p>
              <p className="text-lg font-black mb-3">{prayer.time}</p>
              {prayer.done ? (
                <CheckCircle2 size={16} className={prayer.active ? "text-emerald-200" : "text-emerald-500"} />
              ) : (
                <div className={`w-4 h-4 rounded-full border-2 ${prayer.active ? "border-emerald-200" : "border-slate-200"}`}></div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="flex justify-between items-end mb-4 pr-1">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Verse of the Day</h4>
          <button className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">View All</button>
        </div>
        
        <div className="bg-white rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50">
          <div className="flex justify-between items-center mb-6">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">Surah Al-Baqarah 2:183</span>
            <div className="flex gap-2">
              <button className="text-slate-300 hover:text-slate-500 transition-colors"><Share2 size={18} /></button>
              <button className="text-slate-300 hover:text-slate-500 transition-colors"><Bookmark size={18} /></button>
            </div>
          </div>
          
          <p className="text-2xl text-right font-arabic leading-relaxed text-slate-800 mb-6 tracking-wide" dir="rtl">
            {sanitizeArabic("يٰٓاَيُّهَا الَّذِيْنَ اٰمَنُوْا كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِيْنَ مِنْ قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُوْنَۙ")}
          </p>
          
          <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium italic">
            Wahai orang-orang yang beriman! Diwajibkan atas kamu berpuasa sebagaimana diwajibkan atas orang sebelum kamu agar kamu bertakwa
          </p>
        </div>
      </section>
    </main>
  );
}