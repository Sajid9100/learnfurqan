import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | LearnFurqan",
  description:
    "How LearnFurqan collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
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
              Privacy Policy
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
              At LearnFurqan, your trust is an amanah. This policy explains
              what information we collect, how we use it, and the choices you
              have. By using LearnFurqan, you agree to the practices described
              below.
            </p>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                1. Information We Collect
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                We collect information you provide directly and information
                generated through your use of the platform:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-base leading-relaxed text-gray-600">
                <li>Account details — name, email address, password</li>
                <li>
                  Payment information — billing name, card or wallet details
                  (processed by our payment partners, not stored on our
                  servers)
                </li>
                <li>
                  Lesson history — bookings, messages, recordings (when you
                  enable them), reviews, and progress notes
                </li>
                <li>
                  Profile details — for teachers, this includes credentials,
                  intro video, and bio
                </li>
                <li>
                  Technical data — IP address, device, browser, and basic
                  usage logs
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                2. How We Use Your Information
              </h2>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-base leading-relaxed text-gray-600">
                <li>Match students with suitable teachers</li>
                <li>Process payments and issue payouts</li>
                <li>
                  Send essential service messages (booking confirmations,
                  reminders, receipts)
                </li>
                <li>Improve platform features, safety, and reliability</li>
                <li>Detect fraud, abuse, or violations of our terms</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                3. Data Sharing
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                We do not sell your personal information. We share it only
                with:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-base leading-relaxed text-gray-600">
                <li>
                  Payment processors required to complete a transaction
                </li>
                <li>
                  Service providers that help us run the platform (hosting,
                  email, analytics) under strict confidentiality
                </li>
                <li>
                  Authorities, when required by law or to protect users from
                  harm
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                4. Cookies
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                We use cookies and similar technologies for session management,
                preferences, and understanding how the platform is used. You
                can control cookies through your browser settings. For details,
                see our{" "}
                <a
                  href="/cookie-policy"
                  className="font-semibold text-[#0a2e1e] underline-offset-4 hover:text-[#c9a84c] hover:underline"
                >
                  Cookie Policy
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                5. Children&apos;s Privacy
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                Children under 13 may only use LearnFurqan with verifiable
                parental consent. Parents manage their child&apos;s profile,
                bookings, and data from a parent dashboard. If you believe a
                child has provided personal information without consent,
                contact us and we will remove it promptly.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                6. Data Security
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                Data is encrypted in transit (TLS) and at rest. Payments are
                handled by PCI-compliant providers. We follow industry best
                practices to protect your information, but no online service
                can guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                7. Your Rights
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                You may, at any time:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-base leading-relaxed text-gray-600">
                <li>Access the information we hold about you</li>
                <li>Correct or update your account details</li>
                <li>Request deletion of your account and personal data</li>
                <li>Opt out of marketing emails</li>
              </ul>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                To exercise any of these rights, email us at the address below.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                8. Contact
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                Questions about this policy? Reach our privacy team at{" "}
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
