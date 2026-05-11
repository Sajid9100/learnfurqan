import type { Metadata } from "next";
import { ToastProvider } from "@/components/admin/Toast";

export const metadata: Metadata = {
  title: "QuranSphere Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}
