import { useState } from "react";
import { Bot } from "lucide-react";

interface MascotImageProps {
  variant: "sitting" | "waving" | "chat-happy" | "about-sitting" | "logo";
  alt: string;
  className?: string;
}

const SINGLE_SRCS: Record<
  Exclude<MascotImageProps["variant"], "sitting" | "waving" | "about-sitting">,
  string
> = {
  "chat-happy": "/assets/mitch-chat-happy.png",
  logo: "/assets/mitch-logo-icon.png",
};

const THEMED_SRCS: Record<
  Extract<MascotImageProps["variant"], "sitting" | "waving" | "about-sitting">,
  { light: string; dark: string }
> = {
  sitting: {
    light: "/assets/mitch-home-sitting-light.png",
    dark: "/assets/mitch-home-sitting-dark.png",
  },
  waving: {
    light: "/assets/mitch-home-waving-light.png",
    dark: "/assets/mitch-home-waving-dark.png",
  },
  "about-sitting": {
    light: "/assets/mitch-about-sitting.png",
    dark: "/assets/mitch-about-sitting-dark.png",
  },
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

  if (
    variant === "sitting" ||
    variant === "waving" ||
    variant === "about-sitting"
  ) {
    const pair = THEMED_SRCS[variant];
    return (
      <>
        <img
          src={pair.light}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className={`select-none object-contain dark:hidden ${className}`}
        />
        <img
          src={pair.dark}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className={`hidden select-none object-contain dark:block ${className}`}
        />
      </>
    );
  }

  return (
    <img
      src={SINGLE_SRCS[variant]}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`select-none object-contain ${className}`}
    />
  );
}
