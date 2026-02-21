"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Share2, Bookmark, ChevronLeft, Volume2 } from "lucide-react";
import { sanitizeArabic } from "@/src/utils/quran";
import Link from "next/link";

interface JuzAyah {
  number: number;
  text: string;
  translation: string;
  transliteration: string;
  numberInSurah: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
  };
}

interface JuzDetail {
  number: number;
  ayahs: JuzAyah[];
}

export default function JuzDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [juz, setJuz] = useState<JuzDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJuz() {
      try {
        setLoading(true);
        const [arRes, trRes, ltRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/juz/${id}/quran-uthmani`),
          fetch(`https://api.alquran.cloud/v1/juz/${id}/id.indonesian`),
          fetch(`https://api.alquran.cloud/v1/juz/${id}/en.transliteration`)
        ]);

        const [arJson, trJson, ltJson] = await Promise.all([
          arRes.json(),
          trRes.json(),
          ltRes.json()
        ]);

        if (arJson.code === 200 && trJson.code === 200 && ltJson.code === 200) {
          const mergedAyahs = arJson.data.ayahs.map((ayah: { number: number; text: string; numberInSurah: number; surah: { number: number; englishName: string } }, index: number) => ({
            ...ayah,
            translation: trJson.data.ayahs[index].text,
            transliteration: ltJson.data.ayahs[index].text
          }));

          setJuz({
            number: arJson.data.number,
            ayahs: mergedAyahs
          });
        }
      } catch (error) {
        console.error("Failed to fetch juz detail:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchJuz();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 max-w-lg mx-auto">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-400 animate-pulse">Memuat Juz {id}...</p>
        </div>
      </div>
    );
  }

  if (!juz) return null;

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-24 max-w-lg mx-auto">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="p-2.5 bg-slate-50 rounded-2xl text-slate-600 hover:text-emerald-500 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black text-slate-800 tracking-tight">Juz {juz.number}</h1>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Al-Qur&apos;an Detail</p>
        </div>
        <button className="p-2.5 bg-slate-50 rounded-2xl text-slate-400 hover:text-emerald-500 transition-colors">
          <Volume2 size={20} />
        </button>
      </header>

      <section className="px-6 py-8">
        <div className="relative overflow-hidden bg-linear-to-br from-emerald-500 to-emerald-600 rounded-[40px] p-8 text-white shadow-xl shadow-emerald-100 text-center">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-4 tracking-tight">Juz {juz.number}</h2>
            <div className="w-16 h-1 bg-white/30 mx-auto rounded-full mb-6"></div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase opacity-80">
              Starts at {juz.ayahs[0].surah.englishName}
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 space-y-8">
        {juz.ayahs.map((ayah, index) => {
          const showSurahHeader = index === 0 || ayah.surah.number !== juz.ayahs[index - 1].surah.number;
          
          return (
            <div key={`juz-${juz.number}-${ayah.number}`} className="space-y-6">
              {showSurahHeader && (
                <div className="flex items-center gap-4 py-8">
                  <div className="h-px flex-1 bg-slate-100"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Surah {ayah.surah.englishName}
                  </span>
                  <div className="h-px flex-1 bg-slate-100"></div>
                </div>
              )}
              
              <div className="group relative">
                <div className="flex items-center justify-between bg-slate-50/50 rounded-2xl px-4 py-3 mb-6 transition-all group-hover:bg-emerald-50">
                  <div className="w-9 h-9 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-emerald-100">
                    {ayah.numberInSurah}
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2.5 text-slate-300 hover:text-emerald-500 transition-colors">
                      <Share2 size={18} />
                    </button>
                    <button className="p-2.5 text-slate-300 hover:text-emerald-500 transition-colors">
                      <Bookmark size={18} />
                    </button>
                  </div>
                </div>

                <div className="text-right mb-6" dir="rtl">
                  <p className="text-3xl font-arabic text-slate-800 leading-[2.5]">
                    {sanitizeArabic(ayah.text)}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-emerald-600 text-xs font-bold leading-relaxed italic opacity-80">
                    {ayah.transliteration}
                  </p>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    {ayah.translation}
                  </p>
                </div>
                
                <div className="mt-8 border-b border-slate-100 opacity-50"></div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="px-6 py-12 flex gap-4">
        {juz.number > 1 && (
          <Link 
            href={`/quran/juz/${juz.number - 1}`}
            className="flex-1 bg-white border border-slate-100 p-4 rounded-3xl text-center text-sm font-bold text-slate-400 hover:text-emerald-500 hover:border-emerald-100 transition-all shadow-sm"
          >
            Juz Sebelumnya
          </Link>
        )}
        {juz.number < 30 && (
          <Link 
            href={`/quran/juz/${juz.number + 1}`}
            className="flex-1 bg-white border border-slate-100 p-4 rounded-3xl text-center text-sm font-bold text-slate-400 hover:text-emerald-500 hover:border-emerald-100 transition-all shadow-sm"
          >
            Juz Selanjutnya
          </Link>
        )}
      </section>
    </main>
  );
}
