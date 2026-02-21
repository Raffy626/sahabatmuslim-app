"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Compass, MapPin, Info, RefreshCw, AlertCircle } from "lucide-react";

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

interface DeviceOrientationEventConstructor {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

export default function QiblaPage() {
  const router = useRouter();
  const [heading, setHeading] = useState<number>(0);
  const [qiblaDir, setQiblaDir] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  const headingRef = useRef<number>(0);

  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;

  const calculateQibla = useCallback((lat: number, lng: number) => {
    const phi = (lat * Math.PI) / 180;
    const lambda = (lng * Math.PI) / 180;
    const phiK = (KAABA_LAT * Math.PI) / 180;
    const lambdaK = (KAABA_LNG * Math.PI) / 180;

    const deltaLambda = lambdaK - lambda;
    const x = Math.sin(deltaLambda);
    const y = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaLambda);
    
    let qibla = (Math.atan2(x, y) * 180) / Math.PI;
    qibla = (qibla + 360) % 360;
    setQiblaDir(qibla);
  }, []);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setHasMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;

    const orient = window.DeviceOrientationEvent as unknown as DeviceOrientationEventConstructor;
    if (orient && typeof orient.requestPermission === "function") {
      requestAnimationFrame(() => setIsIOS(true));
    } else {
      requestAnimationFrame(() => setPermissionGranted(true));
    }

    if (!window.DeviceOrientationEvent) {
      requestAnimationFrame(() => setIsSupported(false));
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          requestAnimationFrame(() => {
            setUserLocation({ lat, lng });
            calculateQibla(lat, lng);
          });
        },
        () => {
          requestAnimationFrame(() => setError("Aktifkan lokasi untuk menentukan arah kiblat yang akurat."));
        },
        { enableHighAccuracy: true }
      );
    } else {
      requestAnimationFrame(() => setError("Browser kamu tidak mendukung geolokasi."));
    }
  }, [hasMounted, calculateQibla]);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let rawHeading = 0;
    const eventiOS = event as DeviceOrientationEventiOS;
    
    if (eventiOS.webkitCompassHeading !== undefined && eventiOS.webkitCompassHeading !== null) {
      rawHeading = eventiOS.webkitCompassHeading;
    } else if (event.alpha !== null) {
      rawHeading = (360 - event.alpha) % 360;
    } else {
      return;
    }

    const alpha = 0.1;
    let diff = rawHeading - headingRef.current;
    
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    headingRef.current = (headingRef.current + alpha * diff + 360) % 360;
    setHeading(headingRef.current);
  }, []);

  useEffect(() => {
    if (permissionGranted) {
      const eventName = isIOS ? "deviceorientation" : "deviceorientationabsolute";
      window.addEventListener(eventName, handleOrientation, true);
      return () => window.removeEventListener(eventName, handleOrientation, true);
    }
  }, [permissionGranted, isIOS, handleOrientation]);

  const requestPermission = async () => {
    if (isIOS) {
      try {
        const deviceOrientationEvent = window.DeviceOrientationEvent as unknown as DeviceOrientationEventConstructor;
        if (deviceOrientationEvent.requestPermission) {
          const response = await deviceOrientationEvent.requestPermission();
          if (response === "granted") {
            setPermissionGranted(true);
            setError(null);
          }
        }
      } catch (err) {
        console.error("Permission error:", err);
        setError("Izin sensor ditolak. Mohon aktifkan di pengaturan browser.");
      }
    }
  };

  if (!hasMounted) return null;

  const currentDiff = qiblaDir !== null ? (qiblaDir - heading + 360) % 360 : null;
  const isAligned = currentDiff !== null && (currentDiff < 5 || currentDiff > 355);

  return (
    <main className="min-h-screen bg-slate-950 text-white pb-24 max-w-lg mx-auto overflow-hidden flex flex-col">
      <header className="px-6 py-8 flex items-center justify-between z-50">
        <button 
          onClick={() => router.back()}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all backdrop-blur-md active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-black tracking-tight text-white mb-1">Arah Kiblat</h1>
          <div className="flex items-center justify-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isAligned ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-red-500 animate-pulse"}`}></div>
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isAligned ? "text-emerald-500" : "text-slate-500"}`}>
              {isAligned ? "Terarah Ke Ka'bah" : "Mencari Arah..."}
            </p>
          </div>
        </div>
        <div className="w-12"></div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[60%] rounded-full blur-[120px] transition-all duration-1000 ${isAligned ? "bg-emerald-600/20" : "bg-indigo-600/10"}`}></div>

        <section className="relative w-full aspect-square max-w-[340px] flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 rounded-full border border-white/5"></div>
          <div className="absolute inset-8 rounded-full border border-white/10"></div>
          
          <div 
            className="relative w-full h-full p-4 transition-transform duration-75 ease-linear"
            style={{ transform: `rotate(${-heading}deg)` }}
          >
            <div className="absolute inset-0 flex flex-col justify-between py-2 text-sm font-black text-slate-600 uppercase tracking-widest">
              <span className="text-center text-red-500">N</span>
              <span className="text-center">S</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-between px-2 text-sm font-black text-slate-600 uppercase tracking-widest">
              <span>W</span>
              <span>E</span>
            </div>

            <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/5"></div>
            
            {[0, 90, 180, 270].map((deg) => (
              <div 
                key={deg} 
                className="absolute inset-0 flex flex-col items-center pt-8 pointer-events-none"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div className="w-px h-2 bg-white/20"></div>
              </div>
            ))}

            {qiblaDir !== null && (
              <div 
                className="absolute inset-0 flex flex-col items-center"
                style={{ transform: `rotate(${qiblaDir}deg)` }}
              >
                <div className="relative -top-2 flex flex-col items-center z-20">
                  <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center shadow-2xl transition-all duration-500 ${isAligned ? "bg-emerald-500 shadow-emerald-500/50 scale-110" : "bg-white text-slate-900"}`}>
                    <Compass size={28} className={isAligned ? "animate-pulse" : ""} />
                  </div>
                  <div className={`w-4 h-4 rotate-45 -mt-2 shadow-lg transition-all ${isAligned ? "bg-emerald-400" : "bg-white"}`}></div>
                  
                  <div className={`w-1 h-32 bg-linear-to-b from-emerald-500 to-transparent transition-opacity duration-700 ${isAligned ? "opacity-40" : "opacity-0"}`}></div>
                </div>
              </div>
            )}
          </div>

          <div className="absolute w-16 h-16 bg-slate-900 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 flex items-center justify-center z-30">
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isAligned ? "bg-emerald-500 shadow-[0_0_15px_#10b981]" : "bg-slate-700"}`}></div>
            <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20"></div>
          </div>
        </section>

        <div className="mt-12 text-center max-w-[280px]">
          <h2 className="text-2xl font-black mb-3 tracking-tight">
            {isAligned ? "Arah Sudah Pas!" : "Putar Perangkatmu"}
          </h2>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            {isAligned 
              ? "Kamu sudah menghadap kiblat. Silakan lanjut berdoa." 
              : "Indicator Ka'bah menunjukkan arah kiblat yang tepat."}
          </p>
        </div>
      </div>

      <div className="px-6 pb-12 pt-8 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/5 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Mekkah</p>
            <p className="text-xl font-black text-white">{qiblaDir ? `${Math.round(qiblaDir)}°` : "--"}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/5 text-center">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Posisi Kamu</p>
            <p className="text-xl font-black text-white">{Math.round(heading)}°</p>
          </div>
        </div>

        {isIOS && !permissionGranted && (
          <button 
            onClick={requestPermission}
            className="w-full bg-emerald-600 text-white p-5 rounded-[28px] font-black text-sm shadow-2xl shadow-emerald-900/40 hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 ripple"
          >
            <RefreshCw size={20} />
            Kalibrasi Sensor Sekarang
          </button>
        )}

        {error && (
          <div className="p-5 bg-red-500/10 rounded-[28px] border border-red-500/20 flex items-start gap-4">
            <AlertCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs font-bold text-red-100 leading-relaxed">{error}</p>
          </div>
        )}

        {!isSupported && (
          <div className="p-5 bg-amber-500/10 rounded-[28px] border border-amber-500/20 flex items-start gap-4 text-center justify-center">
            <p className="text-xs font-bold text-amber-100">Sensor tidak ditemukan. Gunakan perangkat mobile untuk fitur ini.</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-2 opacity-30">
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-white" />
              <p className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Coordinates Active</p>
            </div>
            <p className="text-[10px] font-bold text-slate-400">
              {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : "Mencari lokasi..."}
            </p>
        </div>
      </div>
    </main>
  );
}
