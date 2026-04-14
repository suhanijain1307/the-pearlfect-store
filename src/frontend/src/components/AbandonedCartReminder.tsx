import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartContext";

const IDLE_MS = 3 * 60 * 1000; // 3 minutes

export function AbandonedCartReminder() {
  const { items } = useCart();
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownRef = useRef(false);
  const itemsLengthRef = useRef(items.length);

  // keep ref in sync so reset closure is stable
  itemsLengthRef.current = items.length;

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (shownRef.current || itemsLengthRef.current === 0) return;
    timerRef.current = setTimeout(() => {
      if (!shownRef.current && itemsLengthRef.current > 0) {
        shownRef.current = true;
        setShow(true);
      }
    }, IDLE_MS);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("cart_reminder_shown")) {
      shownRef.current = true;
      return;
    }
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    for (const e of events) {
      window.addEventListener(e, reset, { passive: true });
    }
    reset();
    return () => {
      for (const e of events) {
        window.removeEventListener(e, reset);
      }
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reset]);

  const handleDismiss = () => {
    sessionStorage.setItem("cart_reminder_shown", "1");
    setShow(false);
  };

  if (items.length === 0) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="fixed bottom-6 right-4 z-[100] max-w-xs"
          data-ocid="cart_reminder.toast"
        >
          <div className="bg-card border border-border shadow-xl rounded-2xl p-5">
            <p className="font-display text-base font-medium text-foreground mb-1">
              You left something behind! 🛍️
            </p>
            <p className="font-body text-sm text-muted-foreground mb-4">
              Complete your order before it sells out.
            </p>
            <div className="flex gap-2">
              <Link to="/checkout" onClick={handleDismiss}>
                <Button
                  size="sm"
                  className="rounded-xl font-body bg-foreground text-background hover:bg-foreground/90 text-xs"
                  data-ocid="cart_reminder.primary_button"
                >
                  Go to Cart
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="rounded-xl font-body text-xs"
                data-ocid="cart_reminder.close_button"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
