import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Instagram, Mail, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <main className="min-h-screen">
      <section className="py-16 px-4 sm:px-6 bg-muted/20 text-center">
        <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
          Say Hello
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground">
          Contact Us
        </h1>
        <p className="font-body text-muted-foreground mt-3 max-w-md mx-auto">
          We'd love to hear from you. Reach out anytime.
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div>
          <h2 className="font-display text-2xl font-medium text-foreground mb-8">
            Get In Touch
          </h2>
          <div className="space-y-6">
            <a
              href="mailto:thepearlfectstore@gmail.com"
              className="flex items-start gap-4 group"
              data-ocid="contact.link"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-body text-sm font-medium text-foreground">
                  Email
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  thepearlfectstore@gmail.com
                </p>
              </div>
            </a>
            <a
              href="https://instagram.com/the.pearlfect.store"
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-4 group"
              data-ocid="contact.link"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <Instagram className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-body text-sm font-medium text-foreground">
                  Instagram
                </p>
                <p className="font-body text-sm text-muted-foreground">
                  @the.pearlfect.store
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="font-display text-2xl font-medium text-foreground mb-8">
            Send a Message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label
                htmlFor="contact-name"
                className="font-body text-sm mb-1.5 block"
              >
                Name
              </Label>
              <Input
                id="contact-name"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Your name"
                className="rounded-xl font-body"
                data-ocid="contact.input"
              />
            </div>
            <div>
              <Label
                htmlFor="contact-email"
                className="font-body text-sm mb-1.5 block"
              >
                Email
              </Label>
              <Input
                id="contact-email"
                required
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="your@email.com"
                className="rounded-xl font-body"
                data-ocid="contact.input"
              />
            </div>
            <div>
              <Label
                htmlFor="contact-msg"
                className="font-body text-sm mb-1.5 block"
              >
                Message
              </Label>
              <Textarea
                id="contact-msg"
                required
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                placeholder="What would you like to say?"
                className="rounded-xl font-body min-h-[120px]"
                data-ocid="contact.textarea"
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-full font-body bg-foreground text-background hover:bg-foreground/90"
              disabled={sending}
              data-ocid="contact.submit_button"
            >
              {sending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Send Message
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
