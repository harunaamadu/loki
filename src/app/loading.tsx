const LETTERS = ["L", "O", "K", "I"];

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4"
    >
      <div
        aria-hidden
        className="font-heading text-4xl font-semibold tracking-[0.22em] sm:text-5xl"
      >
        {LETTERS.map((letter, i) => (
          <span
            key={letter}
            className="loki-letter inline-block"
            style={{ animationDelay: `${i * 140}ms` }}
          >
            {letter}
          </span>
        ))}
      </div>

      <div
        aria-hidden
        className="relative h-px w-28 overflow-hidden bg-border sm:w-36"
      >
        <span className="loki-sweep absolute inset-y-0 left-0 w-1/2 bg-foreground" />
      </div>

      <span className="sr-only">Loading…</span>

      <style>{`
        @keyframes loki-fade {
          0%, 100% { opacity: 0.12; transform: translateY(4px); }
          40%, 60% { opacity: 1; transform: translateY(0); }
        }
        @keyframes loki-sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .loki-letter {
          opacity: 0.12;
          animation: loki-fade 1.8s ease-in-out infinite;
        }
        .loki-sweep {
          animation: loki-sweep 1.4s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .loki-letter { animation: none; opacity: 1; }
          .loki-sweep  { animation: none; transform: none; width: 100%; opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
