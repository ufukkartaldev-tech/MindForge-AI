"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Bot, 
  CalendarDays, 
  HelpCircle, 
  GraduationCap, 
  TrendingUp, 
  Settings, 
  Sparkles,
  Menu,
  X,
  Flame,
  Zap
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Derslerim", icon: BookOpen },
  { href: "/tutor", label: "AI Öğretmen", icon: Bot },
  { href: "/planner", label: "Çalışma Planım", icon: CalendarDays },
  { href: "/quiz", label: "Quiz Merkezi", icon: HelpCircle },
  { href: "/exam", label: "Vize Simülasyonu", icon: GraduationCap },
  { href: "/progress", label: "İlerlemem", icon: TrendingUp },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-card border border-border text-foreground shadow-sm"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Logo */}
          <div className="h-16 px-6 flex items-center gap-2.5 border-b border-sidebar-border">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-foreground block">
                MindForge <span className="text-primary font-black">AI</span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                University Learning
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User / Quick Widget */}
        <div className="p-4 m-3 rounded-xl border border-border bg-card/60 backdrop-blur">
          <div className="flex items-center justify-between text-xs font-medium text-foreground mb-2">
            <span className="flex items-center gap-1 text-amber-500 font-bold">
              <Flame className="w-3.5 h-3.5 fill-current" /> 7 Gün Streak
            </span>
            <span className="text-[11px] font-mono text-primary font-bold">
              Seviye 4
            </span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full w-[65%]" />
          </div>
          <span className="text-[10px] text-muted-foreground mt-1.5 block text-center">
            Günün hedefine %65 kaldı
          </span>
        </div>
      </aside>
    </>
  );
}
