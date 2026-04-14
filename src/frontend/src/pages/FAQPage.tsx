import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Mail } from "lucide-react";

const FAQ_SECTIONS = [
  {
    title: "Ordering",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse our Shop, add items to your cart, and proceed to Checkout. Fill in your delivery details, choose a payment method, and place your order. It's that simple!",
      },
      {
        q: "Can I modify my order after placing it?",
        a: "Once an order is placed, we begin processing it quickly. To request a modification, please contact us via email at thepearlfectstore@gmail.com as soon as possible. We'll do our best to help, but cannot guarantee changes once the order is in production.",
      },
      {
        q: "Do I need an account to order?",
        a: "No account needed! You can shop and checkout as a guest. Just provide your contact details at checkout.",
      },
    ],
  },
  {
    title: "Shipping",
    items: [
      {
        q: "How long does delivery take?",
        a: "Estimated delivery is 4–6 business days after order processing. Orders are processed within 1–3 business days after payment confirmation.",
      },
      {
        q: "How can I track my order?",
        a: "Once your order ships, we'll send a tracking number to your email. You can also visit our Track Order page and enter your phone number to view your order status.",
      },
      {
        q: "Do you ship internationally?",
        a: "Currently we ship within India only. We hope to expand internationally in the future!",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns only if the product is damaged during shipping. You must submit your return request within 48 hours of receiving the product, with clear photo or video evidence of the damage.",
      },
      {
        q: "How do I request a return?",
        a: "Email us at thepearlfectstore@gmail.com with your order number, photo/video of the damaged item, and contact details. Our team will review and guide you through the process.",
      },
      {
        q: "How long does a refund take?",
        a: "Once your return is approved, refunds are processed within 5–10 business days to your original payment method.",
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept UPI (scan QR code), Debit/Credit Cards, Razorpay (supports UPI, Cards, Net Banking, Wallets), and Cash on Delivery.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. Card payments are handled via secure payment gateways. We never store your full card details — only the last 4 digits are saved for reference.",
      },
    ],
  },
  {
    title: "Custom Orders",
    items: [
      {
        q: "Can I request a custom piece?",
        a: "Absolutely! Visit our Custom Orders page and describe your dream piece. We handcraft custom necklaces, bracelets, phone charms, and anklets.",
      },
      {
        q: "How long does a custom order take?",
        a: "Custom orders typically take 5–10 business days to craft, plus delivery time. We'll keep you updated throughout the process.",
      },
    ],
  },
];

export function FAQPage() {
  return (
    <main className="min-h-screen">
      <section className="py-14 px-4 sm:px-6 bg-muted/20 text-center">
        <HelpCircle className="h-10 w-10 mx-auto text-primary mb-3" />
        <h1 className="font-display text-4xl font-medium text-foreground">
          Frequently Asked Questions
        </h1>
        <p className="font-body text-muted-foreground mt-2 max-w-xl mx-auto">
          Everything you need to know about ordering, shipping, and our
          jewellery.
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        {FAQ_SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="font-display text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border">
              {section.title}
            </h2>
            <Accordion type="single" collapsible className="space-y-2">
              {section.items.map((item) => (
                <AccordionItem
                  key={item.q}
                  value={item.q}
                  className="bg-card rounded-xl border border-border/40 px-5"
                  data-ocid="faq.item.1"
                >
                  <AccordionTrigger className="font-body text-sm font-medium text-foreground py-4 text-left hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="font-body text-sm text-muted-foreground leading-relaxed pb-4">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}

        {/* Help Center */}
        <div className="bg-card rounded-2xl border border-border/40 p-8 text-center shadow-soft">
          <Mail className="h-8 w-8 mx-auto text-primary mb-3" />
          <h3 className="font-display text-xl font-medium text-foreground mb-2">
            Still have questions?
          </h3>
          <p className="font-body text-muted-foreground mb-4">
            Our support team is happy to help you.
          </p>
          <a
            href="mailto:suhanij130713@gmail.com"
            className="inline-flex items-center gap-2 font-body text-sm font-medium text-foreground hover:text-primary transition-colors"
            data-ocid="faq.link"
          >
            <Mail className="h-4 w-4" />
            suhanij130713@gmail.com
          </a>
        </div>
      </div>
    </main>
  );
}
