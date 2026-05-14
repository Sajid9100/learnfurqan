import { getAuthedTeacher } from "@/lib/teacher-auth";
import { AvailabilityEditor } from "@/components/teacher/AvailabilityEditor";

export const dynamic = "force-dynamic";

export default async function TeacherAvailabilityPage() {
  const teacher = (await getAuthedTeacher())!;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Availability
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set the windows when students can book a {teacher.class_duration_minutes ?? 30}
          -minute class with you.
        </p>
      </div>
      <AvailabilityEditor
        classDurationMinutes={teacher.class_duration_minutes ?? 30}
      />
    </div>
  );
}
