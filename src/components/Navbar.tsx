import { useState } from "react";
import { Home, MessageSquare, ShieldCheck, Info, Menu, X, Sun, Moon } from "lucide-react";
import { MascotImage } from "./MascotImage";
import type { NavTab } from "../types";

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

const NAV_ITEMS: Array<{ id: NavTab; label: string; shortLabel: string; icon: typeof Home }> = [
  { id: "home", label: "Home", shortLabel: "Home", icon: Home },
  { id: "chat", label: "Chat with Mitch", shortLabel: "Chat", icon: MessageSquare },
  { id: "why", label: "Why Mitch", shortLabel: "Why Mitch", icon: ShieldCheck },
  { id: "about", label: "About Me", shortLabel: "About", icon: Info },
];

export function Navbar({ activeTab, onSelectTab, theme, onToggleTheme }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = theme === "dark";

  const handleNavigate = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-16 md:h-20 bg-white/85 dark:bg-[#111F21]/85 backdrop-blur-md transition-colors duration-200">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-8">
          {/* Zone 1: Mitch Teal Chat-Bubble Logo + Wordmark */}
          <button
            type="button"
            onClick={() => handleNavigate("home")}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B8B] rounded-lg px-1"
          >
            <MascotImage
              variant="logo"
              alt="Mitch robot logo"
              className="h-9 w-9 sm:h-10 sm:w-10"
            />
            <span className="font-display text-2xl font-extrabold tracking-tight text-[#111F21] dark:text-[#D9E1E2]">
              Mitch
            </span>
          </button>

          {/* Zone 2: 4 Clean Single-Line Nav Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-8 lg:gap-12"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`relative py-2 text-[15px] font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B8B] rounded-md px-1 ${
                    isActive
                      ? "text-[#0D8B8B] dark:text-[#2DD4BF] font-semibold"
                      : "text-slate-700 hover:text-[#0D8B8B] dark:text-slate-200 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-1 bottom-0.5 h-0.5 rounded-full bg-[#0D8B8B] dark:bg-[#2DD4BF]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Tactile Light/Dark Toggle Switch + Mobile Menu */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              onClick={onToggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Dark mode on — click for light mode" : "Light mode on — click for dark mode"}
              className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border p-1 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B8B] focus-visible:ring-offset-2 ${
                isDark
                  ? "border-teal-600/60 bg-[#1B3336]"
                  : "border-slate-300 bg-slate-200/80"
              }`}
            >
              <Sun
                aria-hidden="true"
                className={`absolute left-1.5 h-3.5 w-3.5 transition-opacity duration-150 ${
                  isDark ? "opacity-40 text-slate-400" : "opacity-0"
                }`}
              />
              <Moon
                aria-hidden="true"
                className={`absolute right-1.5 h-3.5 w-3.5 transition-opacity duration-150 ${
                  isDark ? "opacity-0" : "opacity-50 text-slate-600"
                }`}
              />
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full shadow-xs transition-transform duration-200 ${
                  isDark
                    ? "translate-x-6 bg-[#0D8B8B] text-white"
                    : "translate-x-0 bg-white text-amber-500"
                }`}
              >
                {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-[#1B2F32] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D8B8B]"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-[#142528]/95 backdrop-blur-md px-4 py-3 shadow-sm">
            <nav aria-label="Mobile menu" className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer min-h-[44px] ${
                      isActive
                        ? "bg-teal-50 text-[#0D8B8B] dark:bg-teal-900/40 dark:text-teal-300"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile quick tabs"
        className="fixed inset-x-0 bottom-0 z-40 flex h-[52px] items-center justify-around border-t border-slate-200/80 bg-white/95 dark:border-slate-800 dark:bg-[#111F21]/95 backdrop-blur-md px-2 md:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigate(item.id)}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium transition-colors cursor-pointer min-h-[44px] ${
                isActive
                  ? "text-[#0D8B8B] dark:text-teal-300"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
