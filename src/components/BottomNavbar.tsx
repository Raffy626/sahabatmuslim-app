"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, BookOpen, Users } from "lucide-react";

export default function BottomNavbar() {
  const pathname = usePathname();

  const menus = [
    { name: "Home", href: "/", icon: Home },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Center", href: "/pray", isCenter: true },
    { name: "Quran", href: "/quran", icon: BookOpen },
    { name: "Community", href: "/community", icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto relative">
        {menus.map((menu) => {
          if (menu.isCenter) {
            return (
              <div key={menu.name} className="relative w-14 h-14 -top-6">
                <Link
                  href={menu.href}
                  className="absolute left-1/2 -translate-x-1/2 bg-[#10b981] p-3 rounded-full border-[6px] border-white shadow-[0_8px_15px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform duration-200"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 10v10" />
                    <path d="M4 10l1-2 1 2" />
                    <path d="M20 10v10" />
                    <path d="M20 10l-1-2-1 2" />
                    <path d="M7 20h10v-6a5 5 0 0 0-10 0v6z" />
                    <path d="M10 20v-3a2 2 0 0 1 4 0v3" />
                    <path d="M12 9v-2" />
                  </svg>
                </Link>
              </div>
            );
          }

          const Icon = menu.icon!;
          const isActive = pathname === menu.href;

          return (
            <Link
              key={menu.name}
              href={menu.href}
              className="flex flex-col items-center justify-center flex-1 transition-colors duration-200"
            >
              <Icon
                size={22}
                className={isActive ? "text-[#10b981]" : "text-gray-400"}
              />
              <span
                className={`text-[10px] mt-1 font-medium ${
                  isActive ? "text-[#10b981]" : "text-gray-400"
                }`}
              >
                {menu.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}