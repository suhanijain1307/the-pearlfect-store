import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen">
      <section className="py-12 px-4 sm:px-6 bg-muted/20 text-center">
        <h1 className="font-display text-4xl font-medium text-foreground">
          Privacy Policy
        </h1>
      </section>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="space-y-8 font-body leading-relaxed">
          <p className="text-muted-foreground">
            We respect your privacy and are committed to protecting your
            personal information.
          </p>

          <Section title="Information We Collect">
            <p>
              When you use our website, we may collect the following
              information:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Shipping and billing address</li>
              <li>
                Payment details (processed securely through payment providers)
              </li>
            </ul>
          </Section>

          <Section title="How We Use Your Information">
            <p>Your information may be used to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Process and fulfill your orders</li>
              <li>Provide customer support</li>
              <li>Improve our website and services</li>
              <li>Send order updates and notifications</li>
            </ul>
          </Section>

          <Section title="Data Security">
            We implement appropriate security measures to protect your personal
            information from unauthorized access, alteration, or disclosure.
          </Section>

          <Section title="Third-Party Services">
            Payments and shipping may be processed through trusted third-party
            providers. These providers only receive the information necessary to
            complete their services.
          </Section>

          <Section title="Cookies">
            Our website may use cookies to improve browsing experience and
            analyze website traffic.
          </Section>

          <Section title="Your Consent">
            By using our website, you consent to the collection and use of your
            information as outlined in this policy.
          </Section>

          <p className="text-muted-foreground">
            If you have questions about this Privacy Policy, please{" "}
            <a
              href="mailto:thepearlfectstore@gmail.com"
              className="text-foreground underline"
            >
              contact us
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-foreground mb-3">
        {title}
      </h2>
      <div className="text-muted-foreground space-y-2">{children}</div>
    </div>
  );
}
