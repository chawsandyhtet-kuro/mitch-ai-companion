import { useEffect, useState } from "react";
import { AboutMitch } from "./components/AboutMitch";
import { BackgroundCanvas } from "./components/BackgroundCanvas";
import { ChatWorkspace } from "./components/ChatWorkspace";
import { HomeHero } from "./components/HomeHero";
import { Navbar } from "./components/Navbar";
import { WhyChooseMitch } from "./components/WhyChooseMitch";
import type { NavTab } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [queuedPrompt, setQueuedPrompt] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("mitch-theme", theme);
    } catch {
      // Ignore storage restrictions
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartChatting = (initialPrompt?: string) => {
    if (initialPrompt) {
      setQueuedPrompt(initialPrompt);
    }
    handleSelectTab("chat");
  };

  return (
    <div className="relative min-h-screen bg-white text-[#111F21] selection:bg-teal-100 selection:text-[#0A6E6E] dark:bg-[#111F21] dark:text-slate-100 dark:selection:bg-teal-500/30 dark:selection:text-teal-200 transition-colors duration-200">
      <BackgroundCanvas />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        <main className="flex-1">
          {activeTab === "home" && (
            <HomeHero onStartChatting={handleStartChatting} />
          )}

          <div className={activeTab === "chat" ? "block" : "hidden"}>
            <ChatWorkspace
              isActive={activeTab === "chat"}
              queuedPrompt={queuedPrompt}
              onConsumeQueuedPrompt={() => setQueuedPrompt(null)}
            />
          </div>

          {activeTab === "why" && (
            <WhyChooseMitch onStartChatting={() => handleStartChatting()} />
          )}

          {activeTab === "about" && (
            <AboutMitch onStartChatting={() => handleStartChatting()} />
          )}
        </main>
      </div>
    </div>
  );
}
