import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Link
        href="/"
        className="mb-6 font-heading text-2xl font-bold text-primary"
      >
        QuranSphere
      </Link>
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "rounded-3xl border border-border shadow-card",
            headerTitle: "font-heading text-2xl",
            formButtonPrimary:
              "bg-primary hover:bg-primary-700 rounded-full normal-case",
            footerActionLink: "text-primary hover:text-primary-700",
          },
        }}
      />
    </div>
  );
}
