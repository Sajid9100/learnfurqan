import { cn } from "@/lib/utils";

type FlagProps = {
  // ISO 3166-1 alpha-2 country code, e.g. "eg", "pk", "gb".
  code: string;
  className?: string;
  // Visual size — defaults to inline-with-text.
  size?: "sm" | "md" | "lg";
  // Accessible label. Falls back to the uppercased ISO code.
  label?: string;
};

const SIZE_MAP: Record<NonNullable<FlagProps["size"]>, string> = {
  sm: "h-3 w-[18px]",
  md: "h-3.5 w-[22px]",
  lg: "h-4 w-6",
};

export function Flag({ code, className, size = "md", label }: FlagProps) {
  const safe = code?.trim().toLowerCase();
  if (!safe) return null;
  return (
    <span
      role="img"
      aria-label={label ?? safe.toUpperCase()}
      className={cn(
        "fi inline-block rounded-sm align-middle bg-cover bg-center ring-1 ring-black/5",
        `fi-${safe}`,
        SIZE_MAP[size],
        className
      )}
    />
  );
}
