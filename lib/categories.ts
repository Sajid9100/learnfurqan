export type Category = {
  id: string;
  name: string;
  emoji: string;
  tag: CategoryTag;
  tagline: string;
  teachers: number;
  color: string;
};

export type CategoryTag =
  | "Quran"
  | "Memorization"
  | "Islamic Studies"
  | "Arabic"
  | "Kids"
  | "Special Programs";

export const CATEGORY_TAGS: readonly ("All" | CategoryTag)[] = [
  "All",
  "Quran",
  "Memorization",
  "Islamic Studies",
  "Arabic",
  "Kids",
  "Special Programs",
] as const;

export const CATEGORIES: Category[] = [
  { id: "noorani-qaida", name: "Noorani Qaida", emoji: "📖", tag: "Quran", tagline: "Arabic alphabet & Quran reading foundation", teachers: 142, color: "#e8f5e9" },
  { id: "quran-reading", name: "Quran Reading", emoji: "🕌", tag: "Quran", tagline: "Recitation practice from beginner to advanced", teachers: 389, color: "#e3f2fd" },
  { id: "tajweed", name: "Tajweed", emoji: "🎙️", tag: "Quran", tagline: "Makharij, rules & beautiful recitation", teachers: 276, color: "#fce4ec" },
  { id: "hifz-program", name: "Hifz Program", emoji: "⭐", tag: "Memorization", tagline: "Structured Quran memorization with mentorship", teachers: 198, color: "#fff8e1" },
  { id: "quran-translation", name: "Quran Translation", emoji: "📝", tag: "Quran", tagline: "Word-by-word meaning & understanding", teachers: 163, color: "#f3e5f5" },
  { id: "tafseer", name: "Tafseer Studies", emoji: "🔍", tag: "Islamic Studies", tagline: "Deep Quran explanation & Islamic teachings", teachers: 87, color: "#e8eaf6" },
  { id: "islamic-studies", name: "Islamic Studies", emoji: "🌙", tag: "Islamic Studies", tagline: "Aqeedah, manners & Islamic lifestyle", teachers: 211, color: "#e0f7fa" },
  { id: "kids-program", name: "Kids Islamic Program", emoji: "🌟", tag: "Kids", tagline: "Fun interactive Islamic learning for children", teachers: 324, color: "#fff3e0" },
  { id: "duas-namaz", name: "Daily Duas & Namaz", emoji: "🤲", tag: "Islamic Studies", tagline: "Prayer, wudu & essential duas", teachers: 178, color: "#e8f5e9" },
  { id: "arabic-language", name: "Arabic Language", emoji: "🔤", tag: "Arabic", tagline: "Quranic Arabic, grammar & vocabulary", teachers: 256, color: "#fbe9e7" },
  { id: "female-teachers", name: "Female Quran Teachers", emoji: "👩", tag: "Special Programs", tagline: "Sisters-only classes in a safe environment", teachers: 143, color: "#fce4ec" },
  { id: "revert-muslims", name: "Revert Muslim Program", emoji: "🕊️", tag: "Special Programs", tagline: "Beginner Islam guidance & one-on-one support", teachers: 67, color: "#e8eaf6" },
  { id: "advanced-qiraat", name: "Advanced Qira'at", emoji: "🎵", tag: "Quran", tagline: "Professional recitation styles & specialization", teachers: 34, color: "#f3e5f5" },
  { id: "islamic-parenting", name: "Islamic Parenting", emoji: "👨‍👩‍👧", tag: "Special Programs", tagline: "Raising Muslim children & family guidance", teachers: 52, color: "#e0f7fa" },
  { id: "ramadan-programs", name: "Ramadan Programs", emoji: "🌙", tag: "Special Programs", tagline: "Ramadan preparation & daily Quran goals", teachers: 89, color: "#fff8e1" },
  { id: "private-classes", name: "Private Classes", emoji: "👤", tag: "Special Programs", tagline: "Personalized 1-on-1 live sessions", teachers: 412, color: "#e8f5e9" },
  { id: "group-classes", name: "Group Classes", emoji: "👥", tag: "Special Programs", tagline: "Affordable community-based learning", teachers: 167, color: "#e3f2fd" },
  { id: "weekend-school", name: "Weekend Islamic School", emoji: "🏫", tag: "Kids", tagline: "Quran + Islamic studies weekend curriculum", teachers: 78, color: "#fff3e0" },
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
