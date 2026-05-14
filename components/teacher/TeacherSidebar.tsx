"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  MessageSquare,
  Wallet,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/teacher", label: "Today", icon: LayoutDashboard },
  { href: "/teacher/students", label: "Students", icon: Users },
  { href: "/teacher/messages", label: "Messages", icon: MessageSquare },
  { href: "/teacher/availability", label: "Availability", icon: CalendarClock },
  { href: "/teacher/earnings", label: "Earnings", icon: Wallet },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/teacher"
            ? pathname === "/teacher"
            : pathname === href || pathname?.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-white shadow-soft"
                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
      <Link
        href="/"
        onClick={() => setOpen(false)}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to main site
      </Link>
    </nav>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white px-4 py-3 lg:hidden">
        <Link
          href="/teacher"
          className="font-heading text-lg font-bold text-primary"
        >
          LearnFurqan · Teacher
        </Link>
        <div className="flex items-center gap-2">
          <UserButton afterSignOutUrl="/" />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-foreground hover:bg-muted"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <aside
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white p-4 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="font-heading text-lg font-bold text-primary">
                LearnFurqan
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-foreground hover:bg-muted"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {links}
            <SignOutButton redirectUrl="/">
              <button
                type="button"
                className="mt-4 rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium text-muted-foreground hover:border-red-200 hover:text-red-600"
              >
                Log out
              </button>
            </SignOutButton>
          </aside>
        </div>
      )}

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-white p-4 lg:flex">
        <Link
          href="/teacher"
          className="mb-1 font-heading text-xl font-bold text-primary"
        >
          LearnFurqan
        </Link>
        <span className="mb-6 text-xs uppercase tracking-wider text-muted-foreground">
          Teacher Dashboard
        </span>
        {links}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-4">
          <UserButton afterSignOutUrl="/" />
          <SignOutButton redirectUrl="/">
            <button
              type="button"
              className="rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground hover:border-red-200 hover:text-red-600"
            >
              Log out
            </button>
          </SignOutButton>
        </div>
      </aside>
    </>
  );
}
