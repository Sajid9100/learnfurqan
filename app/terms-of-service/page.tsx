import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Terms of Service | LearnFurqan",
  description:
    "The terms that govern your use of LearnFurqan and the lessons booked through the platform.",
};

export default function TermsOfServicePage() {
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
              Terms of Service
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
              These Terms govern your use of LearnFurqan. Please read them
              carefully. By creating an account or booking a lesson, you agree
              to these Terms.
            </p>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                1. Acceptance of Terms
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                By accessing or using LearnFurqan, you confirm that you have
                read, understood, and accepted these Terms. If you do not
                agree, please do not use the platform.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                2. Platform Description
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                LearnFurqan is an online marketplace that connects students
                with independent Quran and Islamic studies teachers. We
                facilitate scheduling, video lessons, communication, and
                payments. Teachers are not employees of LearnFurqan.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                3. User Accounts
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                You must provide accurate, current, and complete information
                during registration and keep it up to date. You are
                responsible for safeguarding your password and for all activity
                under your account.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                4. Teacher Obligations
              </h2>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-base leading-relaxed text-gray-600">
                <li>
                  Provide truthful credentials, qualifications, and teaching
                  experience
                </li>
                <li>Deliver lessons on time and as scheduled</li>
                <li>
                  Conduct lessons in accordance with Islamic etiquette and
                  professional teaching standards
                </li>
                <li>Treat every student with respect and patience</li>
                <li>Maintain confidentiality of student information</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                5. Student Obligations
              </h2>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-base leading-relaxed text-gray-600">
                <li>Treat teachers with respect and Islamic adab</li>
                <li>
                  Attend booked lessons on time, or cancel with reasonable
                  notice
                </li>
                <li>Pay for booked lessons on time</li>
                <li>Provide honest reviews and feedback</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                6. Trial Lessons
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                Each student is entitled to one free 30-minute trial lesson
                per teacher. Trial lessons are intended to help you assess fit.
                Repeated trial bookings to avoid payment may result in account
                restrictions.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                7. Payments &amp; Refunds
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                Lessons are billed on a pay-per-lesson basis, or via packages
                purchased upfront. Prices are set by each teacher and shown
                before you book. If a paid lesson is not delivered, request a
                refund within 24 hours of the scheduled time and we will issue
                a full refund or credit. Completed lessons are non-refundable
                except in cases of clearly inadequate service, reviewed
                case-by-case.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                8. Prohibited Conduct
              </h2>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-base leading-relaxed text-gray-600">
                <li>Harassment, abuse, or discriminatory behavior</li>
                <li>
                  Sharing personal contact details to take lessons off the
                  platform and bypass fees
                </li>
                <li>Fraud, chargebacks, or misuse of payment systems</li>
                <li>
                  Posting content that violates Islamic values, applicable
                  laws, or third-party rights
                </li>
                <li>
                  Recording or distributing lessons without the other
                  party&apos;s consent
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                9. Intellectual Property
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                The LearnFurqan brand, website, and platform features are
                owned by LearnFurqan. Teaching materials remain the property
                of the teacher who created them. By posting content on the
                platform, you grant LearnFurqan a non-exclusive license to
                display it as needed to operate the service.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                10. Termination
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                You may close your account at any time. We may suspend or
                terminate accounts that violate these Terms or harm other
                users, with notice where reasonably possible.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                11. Limitation of Liability
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                LearnFurqan facilitates connections between students and
                teachers but is not responsible for the conduct of any user.
                To the maximum extent permitted by law, our liability for any
                claim arising out of the service is limited to the amounts
                you paid in the three months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                12. Governing Law
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                These Terms are governed by the laws of the Islamic Republic of
                Pakistan. Any disputes will be resolved in the courts of
                Pakistan, unless local law requires otherwise for your
                jurisdiction.
              </p>
            </section>

            <section id="code-of-conduct" className="scroll-mt-24">
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                13. Code of Conduct (Teachers &amp; Students)
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                Everyone on LearnFurqan is expected to uphold the following
                standards:
              </p>
              <ul className="mt-3 list-inside list-disc space-y-1.5 text-base leading-relaxed text-gray-600">
                <li>
                  Treat every student, parent, and teacher with the respect,
                  patience, and adab the Quran calls us to.
                </li>
                <li>
                  Show up on time, prepared, and dressed appropriately for live
                  video classes.
                </li>
                <li>
                  Never share, record, or distribute lessons without all
                  participants&apos; written consent.
                </li>
                <li>
                  Keep all communication on LearnFurqan&apos;s messaging — do
                  not solicit payments, contact details, or off-platform
                  bookings.
                </li>
                <li>
                  Zero tolerance for harassment, discrimination, sectarian
                  attacks, or inappropriate content with minors. Violations
                  lead to immediate removal.
                </li>
                <li>
                  Teachers are responsible for the accuracy of credentials they
                  submit and for teaching only subjects they are qualified for.
                </li>
              </ul>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                Report concerns to{" "}
                <a
                  href="mailto:safety@learnfurqan.com"
                  className="font-semibold text-[#0a2e1e] underline-offset-4 hover:text-[#c9a84c] hover:underline"
                >
                  safety@learnfurqan.com
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-semibold text-[#0a2e1e] sm:text-2xl">
                14. Contact
              </h2>
              <p className="mt-3 text-base leading-relaxed text-gray-600">
                For legal questions, write to{" "}
                <a
                  href="mailto:legal@learnfurqan.com"
                  className="font-semibold text-[#0a2e1e] underline-offset-4 hover:text-[#c9a84c] hover:underline"
                >
                  legal@learnfurqan.com
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
