import { TeachersClient } from "./TeachersClient";

export const dynamic = "force-dynamic";

export default function TeachersAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Teachers
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add, edit, and activate teachers visible on the site.
        </p>
      </div>
      <TeachersClient />
    </div>
  );
}
