import { useState } from "react";
import { Bot } from "lucide-react";

interface MascotImageProps {
  variant: "sitting" | "waving" | "chat-happy" | "about-sitting" | "logo";
  alt: string;
  className?: string;
}

const MASCOT_SRCS: Record<MascotImageProps["variant"], string> = {
  sitting: "/assets/mitch-home-sitting.png",
  waving: "/assets/mitch-home-waving.png",
  "chat-happy": "/assets/mitch-chat-happy.png",
  "about-sitting": "/assets/mitch-about-sitting.png",
  logo: "/assets/mitch-logo-icon.png",
};

export function MascotImage({ variant, alt, className = "" }: MascotImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center rounded-3xl border border-teal-200 bg-teal-50 p-4 text-teal-900 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-200 ${className}`}
      >
        <Bot className="h-8 w-8 text-[#0D8B8B]" />
      </div>
    );
  }

  return (
    <img
      src={MASCOT_SRCS[variant]}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`select-none object-contain ${className}`}
    />
  );
}
