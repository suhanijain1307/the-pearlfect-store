import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function ShippingPolicyPage() {
  return (
    <main className="min-h-screen">
      <section className="py-12 px-4 sm:px-6 bg-muted/20 text-center">
        <h1 className="font-display text-4xl font-medium text-foreground">
          Shipping Policy
        </h1>
      </section>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="space-y-8 font-body text-foreground/80 leading-relaxed">
          <p className="text-muted-foreground">
            Thank you for shopping with us. We strive to ensure that your
            jewelry reaches you safely and on time.
          </p>

          <Section title="Order Processing">
            All orders are processed within <strong>1–3 business days</strong>{" "}
            after payment confirmation. Orders are not processed on weekends or
            public holidays.
          </Section>

          <Section title="Shipping Time">
            Estimated delivery time is <strong>4–6 business days</strong> after
            processing. Actual delivery times may vary depending on your
            location.
          </Section>

          <Section title="Shipping Charges">
            Shipping costs will be calculated and displayed at checkout before
            completing your order. Orders above ₹499 qualify for free delivery.
          </Section>

          <Section title="Order Tracking">
            Once your order has been shipped, you will receive a{" "}
            <strong>tracking number</strong> via email so you can monitor your
            shipment. You can also use our{" "}
            <a href="/track-order" className="text-foreground underline">
              Track Order
            </a>{" "}
            page.
          </Section>

          <Section title="Shipping Address">
            Please ensure that the shipping address provided during checkout is
            accurate and complete. We are not responsible for delays caused by
            incorrect addresses.
          </Section>

          <Section title="Shipping Damage">
            If your product arrives damaged during shipping, please contact us
            within <strong>48 hours of delivery</strong> and provide photo or
            video evidence of the damage so we can assist you according to our
            Return Policy.
          </Section>

          <p className="text-muted-foreground">
            If you have any questions regarding shipping, please{" "}
            <a
              href="mailto:thepearlfectstore@gmail.com"
              className="text-foreground underline"
            >
              contact our support team
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
      <div className="text-muted-foreground">{children}</div>
    </div>
  );
}
