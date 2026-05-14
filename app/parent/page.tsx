import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Users, Calendar, GraduationCap } from "lucide-react";
import { getAuthedStudent } from "@/lib/student-auth";
import {
  getParentChildren,
  getBookingsForEmails,
  summarizeBookings,
} from "@/lib/parent-data";
import { getReviewableBookings } from "@/lib/supabase";
import { ReviewableBookings } from "@/components/parent/ReviewableBookings";
import { CLASSES_GOAL, type Booking, type ParentChild } from "@/lib/types";
import { formatBookingSlot } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ParentHomePage() {
  const parent = await getAuthedStudent();
  if (!parent) redirect("/sign-in");
  const children = await getParentChildren(parent.email);

  const emails = children.map((c) => c.linked_booking_email || parent.email);
  const [bookingsByEmail, reviewable] = await Promise.all([
    getBookingsForEmails(emails),
    getReviewableBookings([
      parent.email,
      ...children.map((c) => c.linked_booking_email).filter(Boolean),
    ]),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            Assalamu Alaikum, {parent.firstName || parent.fullName}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your children's Quran learning journey.
          </p>
        </div>
        <Link
          href="/parent/add-child"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add Child
        </Link>
      </div>

      <ReviewableBookings bookings={reviewable} />

      {children.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {children.map((child) => {
            const key = (child.linked_booking_email || parent.email).toLowerCase();
            const bookings = bookingsByEmail[key] ?? [];
            return (
              <ChildCard
                key={child.id}
                child={child}
                bookings={bookings}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChildCard({
  child,
  bookings,
}: {
  child: ParentChild;
  bookings: Booking[];
}) {
  const summary = summarizeBookings(bookings);
  const progress = Math.min(
    100,
    Math.round((summary.completed / CLASSES_GOAL) * 100)
  );

  return (
    <article className="flex flex-col rounded-3xl border border-border bg-white p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
          {initials(child.child_name)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-heading text-lg font-semibold text-foreground">
            {child.child_name}
          </h3>
          <p className="text-xs text-muted-foreground">
            Age {child.child_age} · {child.learning_goal}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2.5 text-sm">
        <div className="flex items-center gap-2 text-foreground/85">
          <GraduationCap className="h-4 w-4 flex-none text-primary" />
          <span className="truncate">
            {summary.teacher || "No teacher yet"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4 flex-none text-primary/70" />
          <span className="truncate">
            {summary.next ? formatBookingSlot(summary.next.selected_slot) : "No upcoming class"}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-medium text-foreground">
            {summary.completed} / {CLASSES_GOAL} classes
          </span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Link
        href={`/parent/child/${child.id}`}
        className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-primary/30 bg-white px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
      >
        View Details
      </Link>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-white p-12 text-center shadow-soft">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Users className="h-7 w-7" />
      </div>
      <h2 className="mt-4 font-heading text-lg font-semibold text-foreground">
        No children added yet
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Add your child to start tracking their classes, progress, and homework.
      </p>
      <Link
        href="/parent/add-child"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        <Plus className="h-4 w-4" />
        Add your first child
      </Link>
    </div>
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
