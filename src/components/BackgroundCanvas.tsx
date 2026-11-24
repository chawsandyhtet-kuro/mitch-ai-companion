interface BackgroundCanvasProps {
  showLandingDecorations?: boolean;
}

export function BackgroundCanvas({ showLandingDecorations: _ }: BackgroundCanvasProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-white dark:bg-[#111F21] transition-colors duration-200"
    />
  );
}
