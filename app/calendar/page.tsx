"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Star, Compass, Info } from "lucide-react";
import { DateTime } from "luxon";

interface HijriDate {
  date: string;
  format: string;
  day: string;
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
}

interface CalendarDay {
  gregorian: {
    date: string;
    day: string;
    month: { number: number; en: string };
    year: string;
  };
  hijri: HijriDate;
  holidays: string[];
}

interface RawHolidayItem {
  hijri: {
    date: string;
    holidays: string[];
  };
  gregorian: {
    date: string;
  };
}

interface Holiday {
  date: string;
  names: string[];
}

const HOLIDAY_MAP: Record<string, string> = {
  "Islamic New Year": "Tahun Baru Islam",
  "Ashura": "Hari Asyura",
  "Mawlid al-Nabi": "Maulid Nabi Muhammad SAW",
  "Isra' and Mi'raj": "Isra' Mi'raj",
  "Laylat al-Bara'at": "Malam Nisfu Sya'ban",
  "Lailat-ul-Bara'at": "Malam Nisfu Sya'ban",
  "Ramadan": "Awal Ramadhan",
  "1st Day of Ramadan": "Hari Pertama Ramadhan",
  "Laylat al-Qadr": "Lailatul Qadar",
  "Eid-ul-Fitr": "Hari Raya Idul Fitri",
  "Eid-ul-Adha": "Hari Raya Idul Adha",
  "Hajj": "Musim Haji",
  "First time Adhan was called in 622 AD": "Adzan Pertama (622 M)",
};

const translateHoliday = (name: string): string => {
  if (HOLIDAY_MAP[name]) return HOLIDAY_MAP[name];
  
  for (const [key, value] of Object.entries(HOLIDAY_MAP)) {
    if (name.includes(key)) return value;
  }

  if (name.startsWith("Urs of")) {
    return name.replace("Urs of", "Haul");
  }

  return name;
};

const HIJRI_MONTH_MAP: Record<string, string> = {
  "Muharram": "Muharram",
  "Safar": "Safar",
  "Rabi' al-awwal": "Rabiul Awal",
  "Rabi' al-thani": "Rabiul Akhir",
  "Jumada al-ula": "Jumadal Ula",
  "Jumada al-akhira": "Jumadal Akhirah",
  "Rajab": "Rajab",
  "Sha'ban": "Sya'ban",
  "Ramadan": "Ramadhan",
  "Shawwal": "Syawal",
  "Dhu al-Qi'dah": "Dzulqa'dah",
  "Dhu al-Hijjah": "Dzulhijjah"
};

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(DateTime.now());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [rawHolidays, setRawHolidays] = useState<RawHolidayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const fetchCalendar = useCallback(async (date: DateTime) => {
    setLoading(true);
    setError(null);
    try {
      const gMonth = date.month;
      const gYear = date.year;
      
      const res = await fetch(`https://api.aladhan.com/v1/gToHCalendar/${gMonth}/${gYear}`);
      const data = await res.json();
      
      if (data.code === 200) {
        setCalendarData(data.data);
        
        if (data.data.length > 0) {
          const hYear = data.data[0].hijri.year;
          const holidayRes = await fetch(`https://api.aladhan.com/v1/islamicHolidaysByHijriYear/${hYear}`);
          const holidayData = await holidayRes.json();
          if (holidayData.code === 200) {
            setRawHolidays(holidayData.data);
          }
        }
      } else {
        setError("Gagal mengambil data kalender.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasMounted) {
      fetchCalendar(currentDate);
    }
  }, [currentDate, fetchCalendar, hasMounted]);

  const holidaysInMonth = useMemo(() => {
    const list: Holiday[] = [];
    rawHolidays.forEach(item => {
      if (item.hijri.holidays && item.hijri.holidays.length > 0) {
        const itemDate = DateTime.fromFormat(item.gregorian.date, "dd-MM-yyyy");
        if (itemDate.month === currentDate.month && itemDate.year === currentDate.year) {
          list.push({
            date: item.gregorian.date,
            names: item.hijri.holidays.map(name => translateHoliday(name))
          });
        }
      }
    });

    const unique: Holiday[] = [];
    const seen = new Set();
    list.forEach(h => {
      if (!seen.has(h.date)) {
        unique.push(h);
        seen.add(h.date);
      }
    });

    return unique.sort((a, b) => {
      const da = DateTime.fromFormat(a.date, "dd-MM-yyyy");
      const db = DateTime.fromFormat(b.date, "dd-MM-yyyy");
      return da.toMillis() - db.toMillis();
    });
  }, [rawHolidays, currentDate]);

  const nextMonth = () => setCurrentDate(currentDate.plus({ months: 1 }));
  const prevMonth = () => setCurrentDate(currentDate.minus({ months: 1 }));

  const daysOfWeek = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  if (!hasMounted) return null;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 max-w-lg mx-auto overflow-x-hidden">
      <header className="bg-white px-6 pt-8 pb-6 rounded-b-[40px] shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-2xl transition-all active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-black tracking-tight text-slate-800">Kalender Islam</h1>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em]">Penanggalan Hijriah</p>
          </div>
          <div className="w-12"></div>
        </div>

        <div className="flex items-center justify-between bg-emerald-50/50 px-4 py-3 rounded-2xl">
          <button onClick={prevMonth} className="p-2 text-emerald-600 hover:bg-white rounded-xl transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-sm font-black text-slate-800 uppercase tracking-widest">
              {currentDate.setLocale('id').toFormat("MMMM yyyy")}
            </p>
            {calendarData.length > 0 && (
              <p className="text-[9px] font-bold text-emerald-600/60 uppercase">
                {HIJRI_MONTH_MAP[calendarData[0].hijri.month.en] || calendarData[0].hijri.month.en} {calendarData[0].hijri.year}H
              </p>
            )}
          </div>
          <button onClick={nextMonth} className="p-2 text-emerald-600 hover:bg-white rounded-xl transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <section className="px-5 mt-6">
        <div className="bg-white p-5 rounded-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.02)] border border-gray-50">
          <div className="grid grid-cols-7 gap-1">
            {daysOfWeek.map(d => (
              <div key={d} className="text-center py-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                {d}
              </div>
            ))}
            
            {loading ? (
              Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square bg-slate-50 animate-pulse rounded-xl"></div>
              ))
            ) : (
              <>
                {(() => {
                  const firstDay = DateTime.fromFormat(calendarData[0]?.gregorian.date || "01-01-2000", "dd-MM-yyyy");
                  const startPadding = firstDay.weekday % 7;
                  return Array.from({ length: startPadding }).map((_, i) => (
                    <div key={`pad-${i}`} className="aspect-square"></div>
                  ));
                })()}

                {calendarData.map((day, idx) => {
                  const isToday = DateTime.now().toFormat("dd-MM-yyyy") === day.gregorian.date;
                  const hasHoliday = day.holidays && day.holidays.length > 0;
                  
                  return (
                    <div 
                      key={idx} 
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-xl transition-all group ${
                        isToday ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "hover:bg-emerald-50"
                      }`}
                    >
                      <div className="flex items-center">
                        <span className={`text-[9px] font-bold mr-0.5 ${isToday ? "text-emerald-100" : "text-slate-300"}`}>
                          M
                        </span>
                        <span className={`text-sm font-black ${isToday ? "text-white" : "text-slate-800"}`}>
                          {day.gregorian.day}
                        </span>
                      </div>
                      <div className="flex items-center mt-0.5">
                        <span className={`text-[9px] font-bold mr-0.5 ${isToday ? "text-emerald-100" : "text-slate-300"}`}>
                           H
                        </span>
                        <span className={`text-[8px] font-black ${isToday ? "text-emerald-50" : "text-emerald-500"}`}>
                          {day.hijri.day}
                        </span>
                      </div>
                      
                      {hasHoliday && (
                        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white"></div>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </section>
      <section className="px-6 mt-6 flex justify-between items-center bg-white/50 py-3 mx-6 rounded-2xl border border-white text-[10px] font-bold text-slate-400">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span>M = Masehi</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-200"></div>
            <span>H = Hijriah</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            <span>Hari Besar</span>
         </div>
      </section>
      <section className="px-6 mt-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-black text-slate-800">Hari Besar Islam</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentDate.setLocale('id').toFormat("MMMM")}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
            <Star className="text-amber-500" size={18} fill="currentColor" />
          </div>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-[32px]"></div>
            ))
          ) : holidaysInMonth.length > 0 ? (
            holidaysInMonth.map((h, i) => {
              const hDate = DateTime.fromFormat(h.date, "dd-MM-yyyy");
              const isPassed = hDate < DateTime.now().startOf('day');
              
              return (
                <div 
                  key={i} 
                  className={`flex items-center p-5 rounded-[32px] border transition-all ${
                    isPassed ? "bg-slate-50/50 grayscale opacity-60 border-slate-100" : "bg-white border-emerald-50 shadow-[0_10px_30px_rgba(16,185,129,0.03)] hover:border-emerald-200"
                  }`}
                >
                  <div className={`w-14 h-14 rounded-3xl flex flex-col items-center justify-center mr-5 shrink-0 ${
                    isPassed ? "bg-slate-200 text-slate-500" : "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                  }`}>
                    <span className="text-sm font-black">{hDate.day}</span>
                    <span className="text-[9px] font-bold uppercase">{hDate.setLocale('id').toFormat("MMM")}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-black leading-tight mb-1 ${isPassed ? "text-slate-500" : "text-slate-800"}`}>
                      {h.names.join(", ")}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400">
                      {hDate.setLocale('id').toFormat("cccc, dd MMMM yyyy")}
                    </p>
                  </div>
                  {!isPassed && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>}
                </div>
              );
            })
          ) : (
            <div className="bg-white/50 p-10 rounded-[40px] text-center border-2 border-dashed border-slate-100">
              <Info className="mx-auto text-slate-200 mb-3" size={32} />
              <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Tidak ada hari besar di bulan ini</p>
            </div>
          )}
        </div>
      </section>
      <div className="mt-16 mb-8 px-12 text-center">
         <div className="flex items-center justify-center gap-4 opacity-10">
            <div className="h-px bg-slate-400 flex-1"></div>
            <Compass size={16} />
            <div className="h-px bg-slate-400 flex-1"></div>
         </div>
         <p className="text-[9px] font-black text-slate-300 uppercase mt-4 tracking-[0.3em]">SahabatMuslim Calendar</p>
      </div>
    </main>
  );
}
