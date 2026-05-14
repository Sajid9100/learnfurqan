import { getAuthedTeacher } from "@/lib/teacher-auth";
import { getBookingsForTeacher } from "@/lib/supabase";
import { formatBookingSlot } from "@/lib/utils";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

type StudentRow = {
  email: string;
  name: string;
  totalClasses: number;
  completedClasses: number;
  upcomingClasses: number;
  lastSlot: string | null;
};

export default async function TeacherStudentsPage() {
  const teacher = (await getAuthedTeacher())!;
  const bookings = await getBookingsForTeacher(teacher.id);
  const students = aggregate(bookings);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Students
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone who has booked a class with you.
        </p>
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center text-sm text-muted-foreground shadow-soft">
          No students yet. Once someone books a class with you, they'll show up
          here.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Completed</th>
                  <th className="px-4 py-3">Upcoming</th>
                  <th className="px-4 py-3">Last class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s) => (
                  <tr key={s.email}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{s.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {s.totalClasses}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {s.completedClasses}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {s.upcomingClasses}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {s.lastSlot ? formatBookingSlot(s.lastSlot) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function aggregate(bookings: Booking[]): StudentRow[] {
  const byEmail = new Map<string, StudentRow>();
  for (const b of bookings) {
    const email = b.student_email.toLowerCase();
    const existing = byEmail.get(email) ?? {
      email,
      name: b.student_name,
      totalClasses: 0,
      completedClasses: 0,
      upcomingClasses: 0,
      lastSlot: null as string | null,
    };
    existing.totalClasses += 1;
    if (b.status === "completed") existing.completedClasses += 1;
    if (b.status === "pending" || b.status === "confirmed") {
      existing.upcomingClasses += 1;
    }
    if (
      !existing.lastSlot ||
      new Date(b.selected_slot).getTime() >
        new Date(existing.lastSlot).getTime()
    ) {
      existing.lastSlot = b.selected_slot;
    }
    byEmail.set(email, existing);
  }
  return Array.from(byEmail.values()).sort((a, b) => {
    const at = a.lastSlot ? new Date(a.lastSlot).getTime() : 0;
    const bt = b.lastSlot ? new Date(b.lastSlot).getTime() : 0;
    return bt - at;
  });
}
