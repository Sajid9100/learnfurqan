import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, string> = {
  sm: "h-10 w-10 text-sm",
  md: "h-14 w-14 text-base",
  lg: "h-16 w-16 text-lg",
  xl: "h-20 w-20 text-2xl",
};

export function TeacherAvatar({
  name,
  gender,
  size = "md",
  className,
}: {
  name: string;
  gender: "male" | "female";
  size?: Size;
  className?: string;
}) {
  const initial = (name.replace(/^(Ustadh|Ustadha|Sister|Sheikh)\s+/i, "")[0] || name[0] || "?").toUpperCase();

  const palette =
    gender === "female"
      ? "bg-gradient-to-br from-primary to-primary-700 text-white"
      : "bg-gradient-to-br from-sky-500 to-sky-700 text-white";

  return (
    <div
      aria-hidden
      className={cn(
        "flex flex-none items-center justify-center rounded-full font-bold ring-4 ring-white shadow-soft",
        sizeMap[size],
        palette,
        className
      )}
    >
      {initial}
    </div>
  );
}
