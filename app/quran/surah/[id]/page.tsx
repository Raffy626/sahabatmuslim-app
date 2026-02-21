"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Share2, Play, Bookmark, ChevronLeft, BookOpen, Volume2 } from "lucide-react";
import { sanitizeArabic } from "@/src/utils/quran";
import Link from "next/link";

interface Ayah {
  nomorAyah: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: {
    "01": string;
  };
}

interface SurahDetail {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: {
    "01": string;
  };
  ayat: Ayah[];
}

export default function SurahDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSurah() {
      try {
        setLoading(true);
        const res = await fetch(`https://equran.id/api/v2/surat/${id}`);
        const json = await res.json();
        if (json.code === 200) {
          setSurah(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch surah detail:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchSurah();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 max-w-lg mx-auto">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-400 animate-pulse">Memuat Surah...</p>
        </div>
      </div>
    );
  }

  if (!surah) return null;

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-24 max-w-lg mx-auto">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="p-2.5 bg-slate-50 rounded-2xl text-slate-600 hover:text-emerald-500 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black text-slate-800 tracking-tight">{surah.namaLatin}</h1>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{surah.arti}</p>
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
            <h2 className="text-4xl font-serif mb-4 leading-relaxed">{surah.nama}</h2>
            <div className="w-16 h-1 bg-white/30 mx-auto rounded-full mb-6"></div>
            <div className="flex items-center justify-center gap-4 text-xs font-bold tracking-widest uppercase mb-6">
              <span>{surah.tempatTurun}</span>
              <span className="w-1.5 h-1.5 bg-white/50 rounded-full"></span>
              <span>{surah.jumlahAyat} Verses</span>
            </div>
            {surah.nomor !== 1 && surah.nomor !== 9 && (
              <div className="text-2xl font-arabic text-emerald-50 opacity-90" dir="rtl">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 space-y-12">
        {surah.ayat && surah.ayat.length > 0 ? (
          surah.ayat.map((ayah, index) => {
            const ayahNum = ayah.nomorAyah || index + 1;
            return (
              <div key={`${surah.nomor}-${ayahNum}`} className="group relative">
                <div className="flex items-center justify-between bg-slate-50/80 rounded-2xl px-5 py-4 mb-8 transition-all group-hover:bg-emerald-50">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xs font-black shadow-lg shadow-emerald-100">
                    {ayahNum}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2.5 text-slate-300 hover:text-emerald-500 transition-colors">
                      <Share2 size={20} />
                    </button>
                    <button className="p-2.5 text-slate-300 hover:text-emerald-500 transition-colors">
                      <Play size={20} fill="currentColor" />
                    </button>
                    <button className="p-2.5 text-slate-300 hover:text-emerald-500 transition-colors">
                      <Bookmark size={20} />
                    </button>
                  </div>
                </div>

                <div className="text-right mb-8" dir="rtl">
                  <p className="text-4xl font-arabic text-slate-800 leading-[2.8]">
                    {sanitizeArabic(ayah.teksArab)}
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-emerald-600 text-sm font-bold leading-relaxed italic opacity-90 transition-opacity group-hover:opacity-100">
                    {ayah.teksLatin}
                  </p>
                  <p className="text-slate-500 text-base font-medium leading-relaxed">
                    {ayah.teksIndonesia}
                  </p>
                </div>

                <div className="mt-12 flex items-center justify-center gap-4 opacity-10 group-hover:opacity-30 transition-opacity">
                  <div className="h-px flex-1 bg-slate-400"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  <div className="h-px flex-1 bg-slate-400"></div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 font-bold">Ayat tidak ditemukan...</p>
          </div>
        )}
      </section>

      <section className="px-6 py-12 flex gap-4">
        {surah.nomor > 1 && (
          <Link 
            href={`/quran/surah/${surah.nomor - 1}`}
            className="flex-1 bg-white border border-slate-100 p-4 rounded-3xl text-center text-sm font-bold text-slate-400 hover:text-emerald-500 hover:border-emerald-100 transition-all"
          >
            Surah Sebelumnya
          </Link>
        )}
        {surah.nomor < 114 && (
          <Link 
            href={`/quran/surah/${surah.nomor + 1}`}
            className="flex-1 bg-white border border-slate-100 p-4 rounded-3xl text-center text-sm font-bold text-slate-400 hover:text-emerald-500 hover:border-emerald-100 transition-all"
          >
            Surah Selanjutnya
          </Link>
        )}
      </section>
    </main>
  );
}
