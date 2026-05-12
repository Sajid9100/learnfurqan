import { cn } from "@/lib/utils";

export function CrescentIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-6", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="crescent-gradient" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#0F766E" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#crescent-gradient)" />
      <path
        d="M22 9.5a9 9 0 1 0 0 13 7 7 0 1 1 0-13Z"
        fill="#F8FAF9"
      />
      <circle cx="24.5" cy="11.5" r="1.5" fill="#D4A017" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <CrescentIcon className="h-8 w-8" />
      <span className="font-heading text-xl font-bold tracking-tight text-foreground">
        Learn<span className="text-primary">Furqan</span>
      </span>
    </div>
  );
}
