import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSubscribeNewsletter } from "../hooks/useQueries";

export function NewsletterPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const subscribe = useSubscribeNewsletter();

  useEffect(() => {
    if (sessionStorage.getItem("newsletter_shown")) return;
    const id = setTimeout(() => setShow(true), 10000);
    return () => clearTimeout(id);
  }, []);

  const handleClose = () => {
    sessionStorage.setItem("newsletter_shown", "1");
    setShow(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await subscribe.mutateAsync(email.trim());
      setDone(true);
      toast.success("You're subscribed! ✨");
      sessionStorage.setItem("newsletter_shown", "1");
      setTimeout(() => setShow(false), 2000);
    } catch {
      toast.error("Could not subscribe. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={handleClose}
          data-ocid="newsletter.modal"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Decorative top */}
            <div className="h-2 bg-gradient-to-r from-[oklch(0.75_0.10_355)] via-[oklch(0.82_0.08_80)] to-[oklch(0.75_0.10_355)]" />
            <div className="p-8">
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors text-xl leading-none"
                aria-label="Close"
                data-ocid="newsletter.close_button"
              >
                ×
              </button>
              <div className="text-center mb-6">
                <span className="text-4xl mb-3 block">💌</span>
                <h2 className="font-display text-2xl font-medium text-foreground mb-2">
                  Stay in the loop
                </h2>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  Be the first to hear about new collections, exclusive offers,
                  and behind-the-scenes stories from The Pearlfect Store.
                </p>
              </div>
              {done ? (
                <div
                  className="text-center py-4"
                  data-ocid="newsletter.success_state"
                >
                  <p className="font-display text-lg text-foreground">
                    Thank you! 🌸
                  </p>
                  <p className="font-body text-sm text-muted-foreground mt-1">
                    You'll hear from us soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl font-body"
                    data-ocid="newsletter.input"
                  />
                  <Button
                    type="submit"
                    disabled={subscribe.isPending}
                    className="w-full rounded-xl font-body bg-foreground text-background hover:bg-foreground/90"
                    data-ocid="newsletter.submit_button"
                  >
                    {subscribe.isPending ? "Subscribing..." : "Subscribe"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground font-body">
                    No spam, ever. Unsubscribe anytime.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
