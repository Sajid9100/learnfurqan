import {
  BookOpen,
  Book,
  Mic,
  Star,
  Languages,
  Search,
  Moon,
  Smile,
  HeartHandshake,
  Type,
  UserCheck,
  Compass,
  Music,
  Users,
  Sunset,
  User,
  Users2,
  School,
  type LucideIcon,
} from "lucide-react";

export type Category = {
  id: string;
  name: string;
  Icon: LucideIcon;
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
  { id: "noorani-qaida", name: "Noorani Qaida", Icon: BookOpen, tag: "Quran", tagline: "Arabic alphabet & Quran reading foundation", teachers: 142, color: "#0a2e1e" },
  { id: "quran-reading", name: "Quran Reading", Icon: Book, tag: "Quran", tagline: "Recitation practice from beginner to advanced", teachers: 389, color: "#0a2e1e" },
  { id: "tajweed", name: "Tajweed", Icon: Mic, tag: "Quran", tagline: "Makharij, rules & beautiful recitation", teachers: 276, color: "#0a2e1e" },
  { id: "hifz-program", name: "Hifz Program", Icon: Star, tag: "Memorization", tagline: "Structured Quran memorization with mentorship", teachers: 198, color: "#0a2e1e" },
  { id: "quran-translation", name: "Quran Translation", Icon: Languages, tag: "Quran", tagline: "Word-by-word meaning & understanding", teachers: 163, color: "#0a2e1e" },
  { id: "tafseer", name: "Tafseer Studies", Icon: Search, tag: "Islamic Studies", tagline: "Deep Quran explanation & Islamic teachings", teachers: 87, color: "#0a2e1e" },
  { id: "islamic-studies", name: "Islamic Studies", Icon: Moon, tag: "Islamic Studies", tagline: "Aqeedah, manners & Islamic lifestyle", teachers: 211, color: "#0a2e1e" },
  { id: "kids-program", name: "Kids Islamic Program", Icon: Smile, tag: "Kids", tagline: "Fun interactive Islamic learning for children", teachers: 324, color: "#0a2e1e" },
  { id: "duas-namaz", name: "Daily Duas & Namaz", Icon: HeartHandshake, tag: "Islamic Studies", tagline: "Prayer, wudu & essential duas", teachers: 178, color: "#0a2e1e" },
  { id: "arabic-language", name: "Arabic Language", Icon: Type, tag: "Arabic", tagline: "Quranic Arabic, grammar & vocabulary", teachers: 256, color: "#0a2e1e" },
  { id: "female-teachers", name: "Female Quran Teachers", Icon: UserCheck, tag: "Special Programs", tagline: "Sisters-only classes in a safe environment", teachers: 143, color: "#0a2e1e" },
  { id: "revert-muslims", name: "Revert Muslim Program", Icon: Compass, tag: "Special Programs", tagline: "Beginner Islam guidance & one-on-one support", teachers: 67, color: "#0a2e1e" },
  { id: "advanced-qiraat", name: "Advanced Qira'at", Icon: Music, tag: "Quran", tagline: "Professional recitation styles & specialization", teachers: 34, color: "#0a2e1e" },
  { id: "islamic-parenting", name: "Islamic Parenting", Icon: Users, tag: "Special Programs", tagline: "Raising Muslim children & family guidance", teachers: 52, color: "#0a2e1e" },
  { id: "ramadan-programs", name: "Ramadan Programs", Icon: Sunset, tag: "Special Programs", tagline: "Ramadan preparation & daily Quran goals", teachers: 89, color: "#0a2e1e" },
  { id: "private-classes", name: "Private Classes", Icon: User, tag: "Special Programs", tagline: "Personalized 1-on-1 live sessions", teachers: 412, color: "#0a2e1e" },
  { id: "group-classes", name: "Group Classes", Icon: Users2, tag: "Special Programs", tagline: "Affordable community-based learning", teachers: 167, color: "#0a2e1e" },
  { id: "weekend-school", name: "Weekend Islamic School", Icon: School, tag: "Kids", tagline: "Quran + Islamic studies weekend curriculum", teachers: 78, color: "#0a2e1e" },
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
