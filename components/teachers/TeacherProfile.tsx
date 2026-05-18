"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  Check,
  Languages,
  MessageSquare,
  GraduationCap,
  Users,
  PlayCircle,
  Quote,
} from "lucide-react";
import { TeacherAvatar } from "./TeacherAvatar";
import { Button } from "@/components/ui/button";
import { Flag } from "@/components/ui/Flag";
import type { Review, Teacher } from "@/lib/types";

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function TeacherProfile({
  teacher,
  reviews,
}: {
  teacher: Teacher;
  reviews: Review[];
}) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const languages = teacher.language.split(",").map((l) => l.trim());
  const studentEstimate = Math.max(40, teacher.review_count * 2);
  const hasReviews = teacher.review_count > 0;

  const handleBookTrial = () => {
    if (!isSignedIn) {
      router.push(
        "/sign-in?redirect_url=" + encodeURIComponent(window.location.pathname)
      );
      return;
    }
    router.push(`/book/${teacher.slug}`);
  };

  return (
    <div className="container py-10 md:py-16">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <motion.aside
          {...fade}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-4"
        >
          <div className="lg:sticky lg:top-28">
            <div className="rounded-3xl border border-border bg-white p-7 shadow-card">
              <div className="flex flex-col items-center text-center">
                <TeacherAvatar
                  name={teacher.name}
                  gender={teacher.gender}
                  size="xl"
                />
                <h1 className="mt-5 inline-flex items-center gap-2 font-heading text-2xl font-bold tracking-tight text-foreground">
                  {teacher.name}
                  <Flag
                    code={teacher.country_flag}
                    size="md"
                    label={teacher.country}
                  />
                </h1>
                <span className="mt-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {teacher.subject}
                </span>

                <div className="mt-4 flex items-center gap-1.5 text-sm">
                  {hasReviews ? (
                    <>
                      <div className="flex items-center gap-0.5 text-accent">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <span className="font-semibold text-foreground">
                        {teacher.rating.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        ({teacher.review_count} review
                        {teacher.review_count === 1 ? "" : "s"})
                      </span>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      New teacher
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-pattern-islamic-soft p-5 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Per class
                </p>
                <p className="mt-1 font-heading text-4xl font-bold text-foreground">
                  ${teacher.price_per_class}
                </p>
                <p className="mt-1 text-xs text-primary">
                  First trial class is free
                </p>
              </div>

              <div className="mt-5 space-y-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full shadow-glow"
                  onClick={handleBookTrial}
                >
                  Book Free Trial
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </Button>
              </div>

              <div className="mt-7">
                <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Availability
                </h3>
                <ul className="mt-3 space-y-2">
                  {teacher.available_slots.map((slot) => (
                    <li
                      key={slot}
                      className="flex items-center gap-3 rounded-xl border border-border/70 bg-white px-4 py-2.5 text-sm text-foreground/85"
                    >
                      <Clock className="h-4 w-4 flex-none text-primary" />
                      {slot}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.aside>

        <motion.div
          {...fade}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-10 lg:col-span-8"
        >
          <Section title="About">
            <p className="text-base leading-relaxed text-foreground/85">
              {teacher.bio}
            </p>
          </Section>

          <Section title="Teaching style">
            <p className="text-base leading-relaxed text-foreground/85">
              {teacher.teaching_style}
            </p>
          </Section>

          <Section title="Certifications">
            <ul className="space-y-3">
              {teacher.certifications
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean)
                .map((cert) => (
                  <li key={cert} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="text-foreground/85">{cert}</span>
                  </li>
                ))}
            </ul>
          </Section>

          <Section title="Languages spoken">
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-sm font-medium text-primary"
                >
                  <Languages className="h-3.5 w-3.5" />
                  {lang}
                </span>
              ))}
            </div>
          </Section>

          <div className="grid gap-4 sm:grid-cols-2">
            <Highlight
              icon={Clock}
              value={`${teacher.experience_years}+ years`}
              label="Teaching experience"
            />
            <Highlight
              icon={Users}
              value={`${studentEstimate}+ students`}
              label="Helped to date"
            />
          </div>

          <Section title="Video introduction">
            <VideoIntro url={teacher.intro_video_url} />
          </Section>

          <Section title="Student reviews">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No reviews yet. Be the first to take a class with{" "}
                {teacher.name.split(" ").slice(-1)[0]} and share how it went.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            )}
          </Section>
        </motion.div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="relative flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-soft">
      <Quote
        className="absolute right-5 top-5 h-7 w-7 text-primary/10"
        aria-hidden
      />
      <div className="flex items-center gap-1 text-accent">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={
              "h-3.5 w-3.5 " +
              (i < review.rating ? "fill-current" : "text-muted-foreground/30")
            }
          />
        ))}
      </div>
      {review.comment ? (
        <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/85">
          “{review.comment}”
        </p>
      ) : (
        <p className="mt-3 flex-1 text-sm italic text-muted-foreground">
          (No comment)
        </p>
      )}
      <div className="mt-4 flex items-center gap-3 border-t border-border/70 pt-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {initials(review.student_name)}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {firstNameLastInitial(review.student_name)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatReviewDate(review.created_at)}
          </p>
        </div>
      </div>
    </article>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function firstNameLastInitial(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Anonymous";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function formatReviewDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-white p-7 shadow-soft">
      <h2 className="font-heading text-xl font-semibold text-foreground">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Highlight({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof GraduationCap;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-white p-5">
      <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-primary text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-heading text-xl font-bold text-foreground">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function getYouTubeId(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1) || null;
    }
    if (u.searchParams.get("v")) {
      return u.searchParams.get("v");
    }
    const parts = u.pathname.split("/");
    const i = parts.indexOf("embed");
    if (i >= 0) return parts[i + 1] ?? null;
  } catch {
    return null;
  }
  return null;
}

function VideoIntro({ url }: { url: string }) {
  const id = getYouTubeId(url);
  if (id) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title="Teacher introduction"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-pattern-islamic-soft text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
        <PlayCircle className="h-7 w-7" />
      </div>
      <p className="mt-3 font-heading text-base font-semibold text-foreground">
        Video introduction coming soon
      </p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        This teacher hasn’t uploaded a video introduction yet. Book a free
        trial to meet them live.
      </p>
    </div>
  );
}
