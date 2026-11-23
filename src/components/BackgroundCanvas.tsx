export function BackgroundCanvas() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-white dark:bg-[#111F21] transition-colors duration-200"
    >
      {/* Top-right geometric striped circle + semicircle accent */}
      <svg
        className="absolute -top-4 right-14 sm:right-28 h-20 w-24 text-[#0D8B8B] dark:text-[#0D8B8B]"
        viewBox="0 0 96 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="mitch-top-stripes"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="2" x2="6" y2="2" stroke="currentColor" strokeWidth="2" />
          </pattern>
        </defs>
        <circle cx="34" cy="24" r="24" fill="url(#mitch-top-stripes)" />
        <path
          d="M36 0 A22 22 0 1 1 36 44 Z"
          className="fill-[#111F21] dark:fill-[#071012]"
          transform="rotate(90 48 22)"
        />
      </svg>

      {/* Bottom-left circuit-board traces with terminal nodes (matches Light & Dark PNGs) */}
      <svg
        className="absolute bottom-0 left-0 h-[380px] w-[420px] sm:h-[460px] sm:w-[520px] text-[#0D8B8B]/18 dark:text-[#1F4A4C]/70"
        viewBox="0 0 520 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 170 H72 L135 233 H250 L292 191" />
          <path d="M0 218 H56 L112 274 H195" />
          <path d="M0 264 H44 L86 306 V365" />
          <path d="M168 460 V360 L212 316 V268" />
          <path d="M225 460 V388 L266 347 H345" />
          <path d="M286 460 V412 L322 376" />
        </g>
        <g fill="currentColor">
          <circle cx="292" cy="191" r="7" />
          <circle cx="195" cy="274" r="7" />
          <circle cx="212" cy="268" r="7" />
          <circle cx="345" cy="347" r="7" />
          <circle cx="322" cy="376" r="7" />
        </g>
      </svg>

      {/* Top-right / Right-edge circuit-board traces with terminal nodes (matches Light & Dark PNGs) */}
      <svg
        className="absolute top-12 right-0 h-[440px] w-[420px] sm:h-[540px] sm:w-[500px] text-[#0D8B8B]/18 dark:text-[#1F4A4C]/70"
        viewBox="0 0 500 540"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M500 84 H410 L358 32 H260" />
          <path d="M500 132 H392 L324 200 V310" />
          <path d="M500 182 H436 L376 242 V360 L418 402" />
          <path d="M500 248 H452 L408 292 V420" />
          <path d="M292 48 L292 142 L238 196 H165" />
          <path d="M250 112 L190 112 L138 164" />
        </g>
        <g fill="currentColor">
          <circle cx="260" cy="32" r="7" />
          <circle cx="292" cy="48" r="7" />
          <circle cx="165" cy="196" r="7" />
          <circle cx="138" cy="164" r="7" />
          <circle cx="324" cy="310" r="7" />
          <circle cx="418" cy="402" r="7" />
        </g>
      </svg>
    </div>
  );
}
