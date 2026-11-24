import { useEffect, useRef, useState } from "react";
import { AboutMitch } from "./components/AboutMitch";
import { BackgroundCanvas } from "./components/BackgroundCanvas";
import { ChatWorkspace } from "./components/ChatWorkspace";
import { FloatingMusicPlayer } from "./components/FloatingMusicPlayer";
import { HomeHero } from "./components/HomeHero";
import { Navbar } from "./components/Navbar";
import { PlayWorkspace } from "./components/PlayWorkspace";
import { WhyChooseMitch } from "./components/WhyChooseMitch";
import type { NavTab } from "./types";
import {
  ambientMusic,
  CHILL_GAME_TRACK_INDEX,
} from "./utils/ambientMusic";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [queuedPrompt, setQueuedPrompt] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "light";
  });

  // Ambient music state + draggable floating mini player
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const homeTrackIndexRef = useRef(0);
  const userPausedMusicRef = useRef(false);
  const prevTabRef = useRef<NavTab>("home");

  useEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("mitch-theme", theme);
    } catch {
      // Ignore storage restrictions
    }
  }, [theme]);

  // Auto music behavior:
  // - Home tab: soft ambient track after user interaction
  // - Play with Mitch tab: automatically opens simple chill game song
  // - Other tabs (Chat, Why Mitch, About Me): automatically pauses/fades out
  useEffect(() => {
    const previousTab = prevTabRef.current;
    prevTabRef.current = activeTab;

    const isMusicTab = activeTab === "home" || activeTab === "play";

    if (!isMusicTab) {
      if (previousTab === "home" || previousTab === "play") {
        ambientMusic.stop(0.45);
        setIsMusicPlaying(false);
      }
      return;
    }

    const targetTrack =
      activeTab === "play"
        ? CHILL_GAME_TRACK_INDEX >= 0
          ? CHILL_GAME_TRACK_INDEX
          : 0
        : homeTrackIndexRef.current;

    if (activeTab === "play" && previousTab !== "play") {
      // Entering Play with Mitch automatically opens the chill game song
      userPausedMusicRef.current = false;
      setTrackIndex(targetTrack);
      const started = ambientMusic.start(targetTrack);
      if (started) setIsMusicPlaying(true);
    } else if (activeTab === "home" && previousTab !== "home") {
      setTrackIndex(targetTrack);
      if (!userPausedMusicRef.current && ambientMusic.isAudioUnlocked()) {
        const started = ambientMusic.start(targetTrack);
        if (started) setIsMusicPlaying(true);
      }
    } else if (!userPausedMusicRef.current && ambientMusic.isAudioUnlocked()) {
      const started = ambientMusic.start(targetTrack);
      if (started) setIsMusicPlaying(true);
    }

    // Fallback interaction unlock if browser suspended AudioContext before user gesture
    const handleFirstTabInteraction = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[aria-label='Ambient background music mini player']")) {
        return;
      }
      if (userPausedMusicRef.current || ambientMusic.getIsPlaying()) {
        return;
      }
      const started = ambientMusic.start(targetTrack);
      if (started) {
        setIsMusicPlaying(true);
      }
    };

    window.addEventListener("pointerdown", handleFirstTabInteraction, {
      capture: true,
    });
    window.addEventListener("keydown", handleFirstTabInteraction, {
      capture: true,
    });

    return () => {
      window.removeEventListener("pointerdown", handleFirstTabInteraction, {
        capture: true,
      });
      window.removeEventListener("keydown", handleFirstTabInteraction, {
        capture: true,
      });
    };
  }, [activeTab]);

  // Cleanup audio on app unmount
  useEffect(() => {
    return () => {
      ambientMusic.stop(0.1);
    };
  }, []);

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

  const handleToggleMusicPlay = () => {
    if (isMusicPlaying) {
      userPausedMusicRef.current = true;
      ambientMusic.stop(0.35);
      setIsMusicPlaying(false);
    } else {
      userPausedMusicRef.current = false;
      const started = ambientMusic.start(trackIndex);
      if (started) {
        setIsMusicPlaying(true);
      }
    }
  };

  const handlePrevTrack = () => {
    const nextIdx = ambientMusic.prevTrack();
    setTrackIndex(nextIdx);
    if (activeTab === "home") {
      homeTrackIndexRef.current = nextIdx;
    }
  };

  const handleNextTrack = () => {
    const nextIdx = ambientMusic.nextTrack();
    setTrackIndex(nextIdx);
    if (activeTab === "home") {
      homeTrackIndexRef.current = nextIdx;
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-[#111F21] selection:bg-teal-100 selection:text-[#0A6E6E] dark:bg-[#111F21] dark:text-slate-100 dark:selection:bg-teal-500/30 dark:selection:text-teal-200 transition-colors duration-200">
      <BackgroundCanvas showLandingDecorations={activeTab === "home"} />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        <main className="flex-1">
          {activeTab === "home" && (
            <HomeHero
              onStartChatting={handleStartChatting}
              onExploreWhy={() => handleSelectTab("why")}
            />
          )}

          <div className={activeTab === "chat" ? "block" : "hidden"}>
            <ChatWorkspace
              isActive={activeTab === "chat"}
              queuedPrompt={queuedPrompt}
              onConsumeQueuedPrompt={() => setQueuedPrompt(null)}
              onGoToPlay={() => handleSelectTab("play")}
            />
          </div>

          <div className={activeTab === "play" ? "block" : "hidden"}>
            <PlayWorkspace
              isActive={activeTab === "play"}
              onGoHome={() => handleSelectTab("home")}
              onGoToChat={() => handleSelectTab("chat")}
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

      <FloatingMusicPlayer
        isPlaying={isMusicPlaying}
        trackIndex={trackIndex}
        onTogglePlay={handleToggleMusicPlay}
        onPrevTrack={handlePrevTrack}
        onNextTrack={handleNextTrack}
      />
    </div>
  );
}
