"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  { label: "Home", href: "/#home" },
  { label: "Courses", href: "/#features" },
  { label: "Teachers", href: "/teachers" },
  { label: "About", href: "/#about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-primary/10 hover:text-primary lg:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/60 bg-background/95 glass-blur lg:hidden"
          >
            <div className="container flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}

              <MobileAuthedActions onNavigate={() => setMobileOpen(false)} />
              <SignedOut>
                <div className="mt-3 grid grid-cols-2 gap-2 px-1">
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
                      Free Trial
                    </Button>
                  </Link>
                </div>
              </SignedOut>
            </div>
          </motion.div>
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
