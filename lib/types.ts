export type Teacher = {
  id: string;
  name: string;
  gender: "male" | "female";
  subject: string;
  language: string;
  country: string;
  country_flag: string;
  experience_years: number;
  price_per_class: number;
  rating: number;
  review_count: number;
  bio: string;
  teaching_style: string;
  certifications: string;
  intro_video_url: string;
  available_slots: string[];
  is_featured: boolean;
  slug: string;
};

export type AgeGroup = "child" | "teen" | "adult";
export type StudentLevel = "beginner" | "can-read" | "intermediate";

export type Booking = {
  id: string;
  teacher_id: string | null;
  teacher_name: string;
  teacher_slug: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  student_country: string;
  age_group: AgeGroup;
  current_level: StudentLevel;
  selected_slot: string;
  message: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  stripe_session_id: string;
  payment_status: "free_trial" | "pending" | "paid" | "refunded";
  zoom_link: string;
  created_at: string;
};

export type BookingInsert = Omit<
  Booking,
  "id" | "created_at" | "status" | "stripe_session_id" | "payment_status" | "zoom_link"
> & {
  status?: Booking["status"];
  stripe_session_id?: string;
  payment_status?: Booking["payment_status"];
  zoom_link?: string;
};

export type SubscriptionPlan = "basic" | "premium";

export type Subscription = {
  id: string;
  student_email: string;
  student_name: string;
  plan: SubscriptionPlan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: "active" | "cancelled" | "past_due";
  current_period_end: string | null;
  created_at: string;
};

export type TeacherApplication = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  subject: string;
  experience_years: number;
  certifications: string;
  demo_video_url: string;
  languages: string;
  availability: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export type TeacherApplicationInsert = Omit<
  TeacherApplication,
  "id" | "created_at" | "status"
> & { status?: TeacherApplication["status"] };

export type TeacherFilters = {
  gender?: "male" | "female";
  is_featured?: boolean;
  language?: string;
};

export type StudentProfile = {
  email: string;
  name: string;
  phone: string;
  country: string;
  age_group: "" | AgeGroup;
  updated_at: string;
};

export type LearningGoal =
  | "Quran Reading"
  | "Tajweed"
  | "Hifz"
  | "Islamic Studies";

export type ChildLevel = "Beginner" | "Can read Arabic" | "Intermediate";

export type ParentChild = {
  id: string;
  parent_email: string;
  child_name: string;
  child_age: number;
  learning_goal: LearningGoal;
  current_level: ChildLevel;
  linked_booking_email: string;
  created_at: string;
};

export type ParentChildInsert = Omit<ParentChild, "id" | "created_at">;

export type ParentPreferences = {
  email: string;
  notify_confirmed: boolean;
  notify_zoom: boolean;
  notify_reminder: boolean;
  notify_notes: boolean;
  updated_at: string;
};

export const LEARNING_GOALS: LearningGoal[] = [
  "Quran Reading",
  "Tajweed",
  "Hifz",
  "Islamic Studies",
];

export const CHILD_LEVELS: ChildLevel[] = [
  "Beginner",
  "Can read Arabic",
  "Intermediate",
];

export const CLASSES_GOAL = 20;
