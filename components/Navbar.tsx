"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  GraduationCap,
} from "lucide-react";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { Logo } from "./ui/Logo";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Teachers", href: "/teachers" },
  { label: "Become a Teacher", href: "/become-a-teacher" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/";
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/75 glass-blur shadow-soft"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="flex items-center" aria-label="LearnFurqan home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-primary/10 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <DesktopAuthedActions />
          <SignedOut>
            <Link href="/sign-in" className="contents">
              <Button variant="ghost" size="md">
                Login
              </Button>
            </Link>
            <Link href="/teachers" className="contents">
              <Button variant="primary" size="md">
                Start Free Trial
              </Button>
            </Link>
          </SignedOut>
        </div>

        <button
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#0a2e1e] transition hover:bg-[#0a2e1e]/5 lg:hidden"
        >
          <Menu className="h-6 w-6" strokeWidth={2} />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              aria-hidden="true"
            />
            <motion.aside
              key="mobile-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="fixed right-0 top-0 z-50 flex h-full w-[280px] flex-col overflow-y-auto bg-white p-6 shadow-2xl lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
            >
              <button
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>

              <nav className="mt-12 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "py-2 text-lg font-medium transition-colors",
                      isActive(link.href)
                        ? "text-[#c9a84c]"
                        : "text-[#0a2e1e] hover:text-[#c9a84c]"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="my-5 border-t border-gray-200" />

              <MobileAuthedActions onNavigate={() => setMobileOpen(false)} />
              <SignedOut>
                <div className="mt-3 flex flex-col gap-2">
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileOpen(false)}
                    className="contents"
                  >
                    <Button variant="outline" size="md" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link
                    href="/teachers"
                    onClick={() => setMobileOpen(false)}
                    className="contents"
                  >
                    <Button variant="primary" size="md" className="w-full">
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              </SignedOut>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function useIsTeacher(): boolean {
  const [isTeacher, setIsTeacher] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/teacher/me")
      .then((r) => (r.ok ? r.json() : { teacher: null }))
      .then((data) => {
        if (!cancelled) setIsTeacher(Boolean(data?.teacher));
      })
      .catch(() => {
        if (!cancelled) setIsTeacher(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return isTeacher;
}

function DesktopAuthedActions() {
  const { isSignedIn, user } = useUser();
  const isTeacher = useIsTeacher();
  const greeting = user?.firstName || user?.username || "Account";
  const studentHref = isSignedIn
    ? "/dashboard"
    : "/sign-in?redirect_url=/dashboard";
  const parentHref = isSignedIn
    ? "/parent"
    : "/sign-in?redirect_url=/parent";
  return (
    <>
      {isTeacher && (
        <Link href="/teacher" className="contents">
          <Button variant="ghost" size="md">
            <GraduationCap className="h-4 w-4" />
            Teacher
          </Button>
        </Link>
      )}
      <Link href={studentHref} className="contents">
        <Button variant="ghost" size="md">
          <LayoutDashboard className="h-4 w-4" />
          Student
        </Button>
      </Link>
      <Link href={parentHref} className="contents">
        <Button variant="ghost" size="md">
          <Users className="h-4 w-4" />
          Parent
        </Button>
      </Link>
      <SignedIn>
        <span className="hidden text-sm font-medium text-muted-foreground xl:inline">
          Hi, {greeting}
        </span>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </>
  );
}

function MobileAuthedActions({ onNavigate }: { onNavigate: () => void }) {
  const { isSignedIn, user } = useUser();
  const isTeacher = useIsTeacher();
  const greeting = user?.firstName || user?.username || "your account";
  const studentHref = isSignedIn
    ? "/dashboard"
    : "/sign-in?redirect_url=/dashboard";
  const parentHref = isSignedIn
    ? "/parent"
    : "/sign-in?redirect_url=/parent";
  return (
    <div className="mt-3 flex flex-col gap-2 px-1">
      <SignedIn>
        <div className="px-1 text-sm text-muted-foreground">Hi, {greeting}</div>
      </SignedIn>
      {isTeacher && (
        <Link href="/teacher" onClick={onNavigate} className="contents">
          <Button variant="primary" size="md" className="w-full">
            <GraduationCap className="h-4 w-4" />
            Teacher Dashboard
          </Button>
        </Link>
      )}
      <Link href={studentHref} onClick={onNavigate} className="contents">
        <Button
          variant={isTeacher ? "outline" : "primary"}
          size="md"
          className="w-full"
        >
          <LayoutDashboard className="h-4 w-4" />
          Student Dashboard
        </Button>
      </Link>
      <Link href={parentHref} onClick={onNavigate} className="contents">
        <Button variant="outline" size="md" className="w-full">
          <Users className="h-4 w-4" />
          Parent Dashboard
        </Button>
      </Link>
      <SignedIn>
        <div className="flex items-center justify-between rounded-xl border border-border bg-white px-3 py-2">
          <span className="text-sm text-muted-foreground">Account</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>
    </div>
  );
}
