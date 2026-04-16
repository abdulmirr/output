import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Output",
  description: "Privacy Policy for Output, a minimal productivity app for tracking focused work sessions.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "April 16, 2026";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <header className="mb-12">
          <h1 className="text-3xl font-medium tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">Last updated: {lastUpdated}</p>
        </header>

        <div className="space-y-10 text-[15px] leading-relaxed text-foreground/80">
          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">1. Introduction</h2>
            <p>
              Output (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the Output application
              (the &quot;Service&quot;). This Privacy Policy explains how we collect, use, and protect
              your personal information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-foreground">Account Information:</strong> When you sign in with Google, we receive your name,
                email address, and profile picture from your Google account.
              </li>
              <li>
                <strong className="text-foreground">Usage Data:</strong> We store the work sessions, tasks, and notes you create
                within the app to provide the Service.
              </li>
              <li>
                <strong className="text-foreground">Technical Data:</strong> We may collect basic analytics such as device type
                and browser information to improve the Service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">3. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide, maintain, and improve the Service.</li>
              <li>Authenticate your identity and manage your account.</li>
              <li>Store and sync your productivity data across sessions.</li>
              <li>Communicate with you about updates or changes to the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using Supabase, a trusted cloud database provider.
              We implement industry-standard security measures including encrypted connections (TLS)
              and row-level security policies to protect your data. However, no method of electronic
              storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">5. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share
              data only in the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>With service providers who assist in operating the Service (e.g., hosting, authentication).</li>
              <li>If required by law or to protect our legal rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">6. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access and download your personal data.</li>
              <li>Request deletion of your account and all associated data.</li>
              <li>Revoke Google sign-in access at any time through your Google Account settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">7. Cookies</h2>
            <p>
              We use essential cookies and local storage to manage your authentication session and
              theme preferences. We do not use third-party tracking cookies or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">8. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for children under the age of 13. We do not knowingly
              collect personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              significant changes by posting the new policy on this page and updating the
              &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-foreground mb-3">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
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
