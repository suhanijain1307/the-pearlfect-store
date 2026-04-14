import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function RefundPolicyPage() {
  return (
    <main className="min-h-screen">
      <section className="py-12 px-4 sm:px-6 bg-muted/20 text-center">
        <h1 className="font-display text-4xl font-medium text-foreground">
          Refund Policy
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
            We aim to ensure customer satisfaction with every purchase.
          </p>

          <Section title="Refund Eligibility">
            Refunds are only issued if the product is{" "}
            <strong>damaged during shipping</strong> and the damage has been
            verified after reviewing the photo or video evidence provided by the
            customer.
          </Section>

          <Section title="Refund Process">
            <p>Once your return request is reviewed and approved:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>The damaged product may need to be returned if requested.</li>
              <li>
                After confirmation, the refund will be processed to your{" "}
                <strong>original payment method</strong>.
              </li>
            </ul>
          </Section>

          <Section title="Refund Processing Time">
            Approved refunds will typically be processed within{" "}
            <strong>5–10 business days</strong>, depending on your payment
            provider.
          </Section>

          <Section title="Non-Refundable Situations">
            <p>Refunds will not be issued for:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Change of mind</li>
              <li>Incorrect size selection</li>
              <li>Normal wear and tear</li>
              <li>Damage caused after delivery</li>
              <li>Improper handling or misuse</li>
            </ul>
          </Section>

          <p className="text-muted-foreground">
            If you have questions about your refund request, please contact our
            support team.
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
