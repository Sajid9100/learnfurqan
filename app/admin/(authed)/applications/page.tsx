import { ApplicationsClient } from "./ApplicationsClient";

export const dynamic = "force-dynamic";

export default function ApplicationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Teacher applications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and respond to incoming teacher applications.
        </p>
      </div>
      <ApplicationsClient />
    </div>
  );
}
