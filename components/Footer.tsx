"use client";

import { Instagram, Facebook, Youtube, Twitter } from "lucide-react";
import { Logo } from "./ui/Logo";

const COLUMNS: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: "Platform",
    links: [
      { label: "How it Works", href: "/how-it-works" },
      { label: "Courses", href: "/courses" },
      { label: "Browse Teachers", href: "/teachers" },
      { label: "Free Trial", href: "/teachers" },
    ],
  },
  {
    title: "For Teachers",
    links: [
      { label: "Become a Teacher", href: "/become-a-teacher" },
      { label: "Teacher Dashboard", href: "/teacher" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Community", href: "#" },
      { label: "Tajweed Guide", href: "/categories/tajweed" },
    ],
  },
  {
    title: "Contact",
    links: [{ label: "Support", href: "/support" }],
  },
];

const SOCIALS = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-white">
      <div className="container py-10 md:py-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Connecting students with Quran teachers worldwide.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="font-heading text-sm font-semibold text-foreground">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border/70 pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 LearnFurqan. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <a href="/privacy-policy" className="hover:text-primary">
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="hover:text-primary">
              Terms of Service
            </a>
            <a href="/cookie-policy" className="hover:text-primary">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
