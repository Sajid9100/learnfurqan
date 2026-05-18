import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Cookie Policy | LearnFurqan",
  description:
    "How LearnFurqan uses cookies and similar technologies, and how you can control them.",
};

export default function CookiePolicyPage() {
  return (
    <main className="relative bg-white">
      <Navbar />

      {/* HERO */}
      <section className="bg-pattern-islamic pb-10 pt-16 md:pb-14 md:pt-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-[#c9a84c]/40 bg-[#c9a84c]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6f2a]">
              Legal
            </span>
            <h1 className="mt-6 font-heading text-4xl font-bold leading-tight tracking-tight text-[#0a2e1e] sm:text-5xl md:text-6xl">
              Cookie Policy
            </h1>
            <p className="mt-4 text-sm font-medium text-gray-500">
              Last updated: January 1, 2026
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="bg-pattern-islamic pb-24">
        <div className="container">
          <div className="mx-auto max-w-4xl space-y-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm sm:p-12">
            <p className="text-base leading-relaxed text-gray-600">
              This Cookie Policy explains what cookies are, which ones we use,
              and how you can manage them when using LearnFurqan.
            </p>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                1. What Are Cookies
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                Cookies are small text files stored on your device by your
                browser when you visit a website. They help the site remember
                you between pages and visits — for example, to keep you signed
                in or remember your language preference.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                2. Types of Cookies We Use
              </h2>
              <ul className="mt-3 list-inside list-disc space-y-2 text-base leading-relaxed text-gray-600">
                <li>
                  <span className="font-semibold text-[#0a2e1e]">
                    Essential cookies
                  </span>{" "}
                  — required to sign you in, keep your session secure, and
                  process bookings. The platform cannot function without
                  these.
                </li>
                <li>
                  <span className="font-semibold text-[#0a2e1e]">
                    Analytics cookies
                  </span>{" "}
                  — help us understand how students and teachers use the
                  platform so we can improve it. Data is aggregated and does
                  not identify individuals.
                </li>
                <li>
                  <span className="font-semibold text-[#0a2e1e]">
                    Preference cookies
                  </span>{" "}
                  — remember your settings such as language, time zone, and
                  display options.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                3. Third-Party Cookies
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                Some cookies are set by trusted third parties whose services
                we use on LearnFurqan:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-base leading-relaxed text-gray-600">
                <li>
                  <span className="font-semibold text-[#0a2e1e]">
                    Google Analytics
                  </span>{" "}
                  — to measure usage and improve the product
                </li>
                <li>
                  <span className="font-semibold text-[#0a2e1e]">Stripe</span>{" "}
                  — to securely process payments and prevent fraud
                </li>
              </ul>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                These providers have their own privacy and cookie policies.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                4. Managing Cookies
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                You can accept, block, or delete cookies through your
                browser&apos;s settings. Disabling essential cookies may
                prevent parts of the platform from working — for example, you
                may not be able to stay signed in or complete a booking. Most
                browsers also offer a &ldquo;Do Not Track&rdquo; signal which
                we respect for non-essential cookies.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                5. Contact
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                Questions about cookies or this policy? Email us at{" "}
                <a
                  href="mailto:privacy@learnfurqan.com"
                  className="font-semibold text-[#0a2e1e] underline-offset-4 hover:text-[#c9a84c] hover:underline"
                >
                  privacy@learnfurqan.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
