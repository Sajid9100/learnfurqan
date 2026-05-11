import { BookingsClient } from "./BookingsClient";

export const dynamic = "force-dynamic";

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
          Bookings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm bookings, send Zoom links, and update status.
        </p>
      </div>
      <BookingsClient />
    </div>
  );
}
