import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Check, Copy, KeyRound, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useUserAuth } from "../context/UserAuthContext";

export function LoginPage() {
  const {
    isLoggedIn,
    login,
    getOrCreateCode,
    getStoredCode,
    verifyCode,
    hasCode,
  } = useUserAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [step, setStep] = useState<
    "phone" | "new-code" | "enter-code" | "forgot"
  >("phone");

  // New user
  const [newCode, setNewCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);

  // Returning user
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");

  // Forgot
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotResult, setForgotResult] = useState<string | null>(null);
  const [forgotPhone2, setForgotPhone2] = useState("");

  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoggedIn) navigate({ to: "/my-orders" });
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (step === "enter-code") setTimeout(() => codeRef.current?.focus(), 100);
  }, [step]);

  function validatePhone(value: string): boolean {
    if (!/^\d{10}$/.test(value)) {
      setPhoneError("Please enter a valid 10-digit phone number.");
      return false;
    }
    setPhoneError("");
    return true;
  }

  function handlePhoneSubmit() {
    if (!validatePhone(phone)) return;
    if (hasCode(phone)) {
      setStep("enter-code");
    } else {
      const code = getOrCreateCode(phone);
      setNewCode(code);
      setStep("new-code");
    }
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
    toast("Code copied!", { style: { background: "#fce4ec", color: "#000" } });
  }

  function handleNewCodeConfirm() {
    login(phone);
    toast("Logged in successfully! 🎉", {
      style: { background: "#fce4ec", color: "#000" },
    });
    navigate({ to: "/my-orders" });
  }

  function handleVerifyCode() {
    if (!codeInput.trim()) {
      setCodeError("Please enter your login code.");
      return;
    }
    if (!verifyCode(phone, codeInput.trim())) {
      setCodeError(
        'Incorrect code. Use "Forgot your code?" below to retrieve it.',
      );
      return;
    }
    login(phone);
    toast("Logged in successfully! 🎉", {
      style: { background: "#fce4ec", color: "#000" },
    });
    navigate({ to: "/my-orders" });
  }

  function handleForgotLookup() {
    const p = forgotPhone2.replace(/\D/g, "");
    if (p.length !== 10) {
      setForgotError("Please enter a valid 10-digit phone number.");
      return;
    }
    setForgotError("");
    const code = getStoredCode(p);
    if (code) {
      setForgotResult(code);
      setForgotPhone(p);
    } else {
      setForgotResult(null);
      setForgotError(
        "No account found for this number. Please log in with your phone number to get started.",
      );
    }
  }

  const cardStyle = {
    background: "oklch(96 0.025 15)",
    borderColor: "oklch(88 0.04 70)",
  };

  const CodeBox = ({ code }: { code: string }) => (
    <div
      className="rounded-xl p-4 border flex items-center justify-between gap-3"
      style={{
        background: "oklch(97.5 0.01 85)",
        borderColor: "oklch(75 0.12 80)",
      }}
    >
      <p
        className="font-mono font-bold tracking-[0.25em] text-xl"
        style={{ color: "#b8975a" }}
      >
        {code}
      </p>
      <button
        type="button"
        onClick={() => handleCopy(code)}
        aria-label="Copy code"
        className="flex items-center gap-1 text-xs font-body px-3 py-1.5 rounded-lg border transition-colors"
        style={{
          borderColor: "oklch(75 0.12 80)",
          background: codeCopied ? "oklch(75 0.12 80)" : "transparent",
          color: "#000",
        }}
      >
        {codeCopied ? <Check size={14} /> : <Copy size={14} />}
        {codeCopied ? "Copied!" : "Copy"}
      </button>
    </div>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "oklch(97.5 0.01 85)" }}
    >
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <p
            className="text-xs font-body tracking-widest uppercase mb-2"
            style={{ color: "#b8975a" }}
          >
            The Pearlfect Store
          </p>
          <h1 className="font-display text-3xl font-semibold mb-2">
            Welcome Back
          </h1>
          <p className="font-body text-sm" style={{ color: "#555" }}>
            Sign in with your phone number to access your orders & wishlist.
          </p>
        </div>

        <div className="rounded-2xl shadow-md p-8 border" style={cardStyle}>
          {/* ── PHONE STEP ── */}
          {step === "phone" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="phone-input"
                  className="font-body font-medium text-sm"
                >
                  Phone Number
                </Label>
                <div className="flex gap-2 items-center">
                  <span
                    className="px-3 py-2 rounded-lg border text-sm font-body"
                    style={{
                      background: "oklch(97.5 0.01 85)",
                      borderColor: "oklch(85 0.02 78)",
                    }}
                  >
                    +91
                  </span>
                  <Input
                    id="phone-input"
                    data-ocid="login-phone-input"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter 10-digit number"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ""));
                      if (phoneError)
                        validatePhone(e.target.value.replace(/\D/g, ""));
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handlePhoneSubmit()}
                    className="flex-1 font-body"
                  />
                </div>
                {phoneError && (
                  <p className="text-xs text-red-600 font-body">{phoneError}</p>
                )}
              </div>
              <Button
                data-ocid="send-otp-btn"
                onClick={handlePhoneSubmit}
                className="w-full font-body font-medium py-5 rounded-xl text-sm"
                style={{ background: "oklch(75 0.12 80)", color: "#000" }}
              >
                Continue
              </Button>
              <p
                className="text-center text-xs font-body"
                style={{ color: "#888" }}
              >
                No account needed — your phone number is your identity.
              </p>
            </div>
          )}

          {/* ── NEW USER: show generated code ── */}
          {step === "new-code" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <KeyRound size={18} style={{ color: "#b8975a" }} />
                <p className="font-body font-semibold text-sm">
                  Your unique login code
                </p>
              </div>
              <CodeBox code={newCode} />
              <div
                className="rounded-xl px-4 py-3 text-sm font-body"
                style={{ background: "oklch(94 0.03 15)", color: "#555" }}
              >
                <span className="font-semibold text-black">
                  Remember this code!
                </span>{" "}
                You'll need it to log in next time and to track your orders.
                Please save it somewhere safe.
              </div>
              <Button
                data-ocid="confirm-code-btn"
                onClick={handleNewCodeConfirm}
                className="w-full font-body font-medium py-5 rounded-xl text-sm"
                style={{ background: "oklch(75 0.12 80)", color: "#000" }}
              >
                I've saved my code — Continue
              </Button>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setPhoneError("");
                  }}
                  className="underline underline-offset-2 text-xs font-body"
                  style={{ color: "#888" }}
                >
                  Change phone number
                </button>
              </div>
            </div>
          )}

          {/* ── RETURNING USER: enter code ── */}
          {step === "enter-code" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="code-input"
                  className="font-body font-medium text-sm"
                >
                  Login Code
                </Label>
                <Input
                  id="code-input"
                  ref={codeRef}
                  data-ocid="code-input"
                  type="text"
                  placeholder="e.g. PRL4K9M2"
                  maxLength={8}
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(
                      e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                    );
                    if (codeError) setCodeError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                  className="font-mono text-center text-xl tracking-[0.3em] font-body"
                />
                {codeError && (
                  <p className="text-xs text-red-600 font-body">{codeError}</p>
                )}
              </div>
              <Button
                data-ocid="verify-code-btn"
                onClick={handleVerifyCode}
                className="w-full font-body font-medium py-5 rounded-xl text-sm"
                style={{ background: "oklch(75 0.12 80)", color: "#000" }}
              >
                Login
              </Button>
              <div className="flex items-center justify-between text-xs font-body">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setCodeInput("");
                    setCodeError("");
                  }}
                  className="underline underline-offset-2"
                  style={{ color: "#888" }}
                >
                  Change phone number
                </button>
                <button
                  type="button"
                  data-ocid="forgot-code-btn"
                  onClick={() => {
                    setStep("forgot");
                    setForgotPhone2("");
                    setForgotError("");
                    setForgotResult(null);
                  }}
                  className="font-medium underline underline-offset-2"
                  style={{ color: "#b8975a" }}
                >
                  Forgot your code?
                </button>
              </div>
            </div>
          )}

          {/* ── FORGOT CODE ── */}
          {step === "forgot" && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <p className="font-body font-semibold text-sm">
                  Retrieve Your Code
                </p>
                <p className="text-xs font-body mt-1" style={{ color: "#888" }}>
                  Enter your registered phone number and we'll show you your
                  code.
                </p>
              </div>

              {forgotResult ? (
                <div className="space-y-3">
                  <p className="font-body text-sm text-center">
                    The code for{" "}
                    <span className="font-semibold">{forgotPhone}</span> is:
                  </p>
                  <CodeBox code={forgotResult} />
                  <div
                    className="rounded-xl px-4 py-3 text-sm font-body"
                    style={{ background: "oklch(94 0.03 15)", color: "#555" }}
                  >
                    <span className="font-semibold text-black">
                      Remember this code!
                    </span>{" "}
                    You'll need it every time you log in.
                  </div>
                  <Button
                    onClick={() => {
                      setStep("enter-code");
                      setPhone(forgotPhone);
                      setCodeInput("");
                      setCodeError("");
                    }}
                    className="w-full font-body font-medium py-5 rounded-xl text-sm"
                    style={{ background: "oklch(75 0.12 80)", color: "#000" }}
                  >
                    Back to Login
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="forgot-phone"
                      className="font-body font-medium text-sm"
                    >
                      Registered Phone Number
                    </Label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                        style={{ color: "rgba(0,0,0,0.40)" }}
                      />
                      <Input
                        id="forgot-phone"
                        type="tel"
                        inputMode="numeric"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        value={forgotPhone2}
                        onChange={(e) => {
                          setForgotPhone2(e.target.value.replace(/\D/g, ""));
                          setForgotError("");
                        }}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleForgotLookup()
                        }
                        className="pl-10 font-body"
                        autoFocus
                      />
                    </div>
                    {forgotError && (
                      <p className="text-xs text-red-600 font-body">
                        {forgotError}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleForgotLookup}
                    className="w-full font-body font-medium py-5 rounded-xl text-sm"
                    style={{ background: "oklch(75 0.12 80)", color: "#000" }}
                  >
                    Get My Code
                  </Button>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setStep("phone")}
                      className="underline underline-offset-2 text-xs font-body"
                      style={{ color: "#888" }}
                    >
                      Back to Login
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <p
          className="text-center text-xs font-body mt-6"
          style={{ color: "#aaa" }}
        >
          By continuing, you agree to our{" "}
          <a href="/privacy-policy" className="underline underline-offset-2">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
