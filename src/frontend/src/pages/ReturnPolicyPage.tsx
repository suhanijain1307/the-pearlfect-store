import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function ReturnPolicyPage() {
  return (
    <main className="min-h-screen">
      <section className="py-12 px-4 sm:px-6 bg-muted/20 text-center">
        <h1 className="font-display text-4xl font-medium text-foreground">
          Return Policy
        </h1>
      </section>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="prose-custom space-y-8 font-body text-foreground/80 leading-relaxed">
          <p className="text-muted-foreground">
            We take great care in packaging and shipping our jewelry to ensure
            it reaches you in perfect condition. However, if your item arrives
            damaged during shipping, we will be happy to assist you with a
            return or replacement.
          </p>

          <Section title="Eligibility for Returns">
            Returns are only accepted if the product is damaged during shipping.
          </Section>

          <Section title="Proof of Damage">
            <p>
              To process your return request, you must provide clear proof of
              the damage. Customers are required to upload:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
              <li>
                A clear <strong>photo or video of the damaged item</strong>
              </li>
              <li>
                The <strong>original packaging</strong>
              </li>
              <li>
                The <strong>shipping label (if visible)</strong>
              </li>
            </ul>
            <p className="mt-2">
              This helps us verify the issue and improve our shipping process.
            </p>
          </Section>

          <Section title="Return Request Timeframe">
            You must submit your return request within{" "}
            <strong>48 hours of receiving the product</strong>. Requests
            submitted after this period may not be eligible for return or
            replacement.
          </Section>

          <Section title="How to Request a Return">
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Contact our support team through the{" "}
                <strong>Contact page or email</strong>.
              </li>
              <li>
                Attach the <strong>photo or video evidence</strong> of the
                damaged product.
              </li>
              <li>
                Include your <strong>order number and contact details</strong>.
              </li>
            </ol>
            <p className="mt-2">
              After reviewing your request, our team will confirm the return and
              provide further instructions.
            </p>
          </Section>

          <Section title="Resolution Options">
            <p>
              If the damage is verified, we will offer one of the following:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                <strong>Replacement of the same product</strong>, or
              </li>
              <li>
                <strong>Full refund</strong>
              </li>
            </ul>
          </Section>

          <Section title="Important Notes">
            <ul className="list-disc list-inside space-y-1">
              <li>
                Returns are{" "}
                <strong>
                  not accepted for reasons other than shipping damage
                </strong>
                .
              </li>
              <li>
                Items damaged due to misuse, wear, or improper handling after
                delivery are not eligible for return.
              </li>
              <li>
                The product must be returned in the{" "}
                <strong>original packaging if requested</strong>.
              </li>
            </ul>
            <p className="mt-3">
              If you have any questions, please{" "}
              <a
                href="mailto:thepearlfectstore@gmail.com"
                className="text-foreground underline"
              >
                contact our support team
              </a>{" "}
              and we will be happy to assist you.
            </p>
          </Section>
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
