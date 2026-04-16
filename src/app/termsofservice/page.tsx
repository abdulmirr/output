import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Output",
  description: "Terms of Service for Output, a minimal productivity app for tracking focused work sessions.",
};

export default function TermsOfServicePage() {
  const lastUpdated = "April 16, 2026";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <header className="mb-12">
          <h1 className="text-3xl font-medium tracking-tight mb-2">Terms of Service</h1>
          <p className="text-muted-foreground text-sm">Last updated: {lastUpdated}</p>
        </header>

        <div className="space-y-10 text-[15px] leading-relaxed text-foreground/80">
          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Output (the &quot;Service&quot;), you agree to be bound by these
              Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not
              use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">2. Description of Service</h2>
            <p>
              Output is a productivity application that allows users to track focused work sessions,
              manage tasks, and reflect on daily output. The Service is provided on an &quot;as is&quot;
              and &quot;as available&quot; basis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">3. User Accounts</h2>
            <p className="mb-3">When you create an account with us, you agree to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide accurate and complete information during registration.</li>
              <li>Maintain the security of your account credentials.</li>
              <li>Accept responsibility for all activities that occur under your account.</li>
              <li>Notify us immediately of any unauthorized use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
              <li>Attempt to gain unauthorized access to the Service or its related systems.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
              <li>Upload or transmit any malicious code, viruses, or harmful data.</li>
              <li>Use the Service to harass, abuse, or harm others.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">5. Intellectual Property</h2>
            <p>
              The Service, including its original content, features, and functionality, is owned by
              Output and is protected by copyright, trademark, and other intellectual property laws.
              You retain ownership of any content you create within the Service (e.g., work sessions,
              tasks, and notes).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">6. User Content</h2>
            <p>
              You are solely responsible for the content you create, store, and manage within the
              Service. By using the Service, you grant us a limited license to store and process your
              content solely for the purpose of providing the Service to you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">7. Service Availability</h2>
            <p>
              We strive to keep the Service available at all times, but we do not guarantee
              uninterrupted access. The Service may be temporarily unavailable due to maintenance,
              updates, or circumstances beyond our control. We reserve the right to modify, suspend,
              or discontinue the Service at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Output and its creators shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages, including
              but not limited to loss of data, profits, or goodwill, arising from your use of or
              inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">9. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties
              of any kind, whether express or implied, including but not limited to implied warranties
              of merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">10. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account and access to the Service
              at our sole discretion, without notice, for conduct that we believe violates these
              Terms or is harmful to other users, us, or third parties. You may also delete your
              account at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">11. Changes to These Terms</h2>
            <p>
              We may revise these Terms from time to time. The most current version will always be
              available on this page. By continuing to use the Service after changes become effective,
              you agree to be bound by the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">13. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at{" "}
              <a href="mailto:builtbyabdul@gmail.com" className="underline underline-offset-2 hover:text-foreground transition-colors">
                builtbyabdul@gmail.com
              </a>.
            </p>
          </section>
        </div>

        <footer className="mt-16 pt-8 border-t border-border">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Output
          </a>
        </footer>
      </div>
    </main>
  );
}
