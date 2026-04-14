import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, KeyRound, Phone } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export interface LoginPopupProps {
  onSuccess: () => void;
  getOrCreateCode: (phone: string) => string;
  getStoredCode: (phone: string) => string | null;
  verifyCode: (phone: string, code: string) => boolean;
  hasCode: (phone: string) => boolean;
  login: (phone: string) => void;
}

// Sage green palette — DO NOT change
const sg = {
  bg: "#e8f5e9",
  iconBg: "#c8e6c9",
  iconColor: "#388e3c",
  border: "#a5d6a7",
  btnBg: "#81c784",
  btnHover: "#66bb6a",
  mutedText: "rgba(0,0,0,0.50)",
  dimText: "rgba(0,0,0,0.55)",
  codeBoxBg: "#ffffff",
} as const;

type Step = "phone" | "new-code" | "returning-code" | "forgot";

export function LoginPopup({
  onSuccess,
  getOrCreateCode,
  getStoredCode,
  verifyCode,
  hasCode,
  login,
}: LoginPopupProps) {
  const [step, setStep] = useState<Step>("phone");

  // Phone step
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // New user — the freshly generated code to display
  const [newCode, setNewCode] = useState("");

  // Returning user — code they type
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");

  // Forgot flow
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotPhone2, setForgotPhone2] = useState(""); // phone entered inside forgot form
  const [forgotError, setForgotError] = useState("");
  const [forgotResult, setForgotResult] = useState<string | null>(null);

  // Button hover states
  const [btn1Hover, setBtn1Hover] = useState(false);
  const [btn2Hover, setBtn2Hover] = useState(false);
  const [btn3Hover, setBtn3Hover] = useState(false);

  // Clipboard copy feedback
  const [copied, setCopied] = useState(false);

  const codeInputRef = useRef<HTMLInputElement>(null);

  /* ─── Helpers ─────────────────────────────────────────── */

  const cleanPhone = (raw: string) => raw.replace(/\D/g, "");

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Code copied!");
  };

  /* ─── Step 1: Phone submit ────────────────────────────── */

  const handlePhoneSubmit = () => {
    const phone = cleanPhone(phoneInput);
    if (phone.length !== 10) {
      setPhoneError("Please enter a valid 10-digit phone number.");
      return;
    }
    setPhoneError("");

    if (hasCode(phone)) {
      // Returning user — ask for their code
      setStep("returning-code");
      setTimeout(() => codeInputRef.current?.focus(), 100);
    } else {
      // First-time user — generate + show code
      const code = getOrCreateCode(phone);
      setNewCode(code);
      setStep("new-code");
    }
  };

  /* ─── Step 2a: New user — confirm they've saved the code ─ */

  const handleNewCodeConfirm = () => {
    const phone = cleanPhone(phoneInput);
    login(phone);
    onSuccess();
  };

  /* ─── Step 2b: Returning user — verify code ─────────────  */

  const handleVerifyCode = () => {
    const phone = cleanPhone(phoneInput);
    if (!codeInput.trim()) {
      setCodeError("Please enter your login code.");
      return;
    }
    const valid = verifyCode(phone, codeInput.trim());
    if (!valid) {
      setCodeError(
        'Incorrect code. Forgot your code? Click "Forgot your code?" below.',
      );
      return;
    }
    login(phone);
    onSuccess();
  };

  /* ─── Forgot flow ────────────────────────────────────────  */

  const handleForgotLookup = () => {
    const phone = cleanPhone(forgotPhone2);
    if (phone.length !== 10) {
      setForgotError("Please enter a valid 10-digit phone number.");
      return;
    }
    setForgotError("");
    const code = getStoredCode(phone);
    if (code) {
      setForgotResult(code);
      setForgotPhone(phone);
    } else {
      setForgotResult(null);
      setForgotError(
        "No account found for this number. Please log in with your phone number to get started.",
      );
    }
  };

  const goBackToPhone = () => {
    setStep("phone");
    setPhoneInput("");
    setPhoneError("");
    setCodeInput("");
    setCodeError("");
    setNewCode("");
    setCopied(false);
  };

  /* ─── Shared UI: phone step ──────────────────────────────  */

  const renderPhoneStep = () => (
    <div className="space-y-4">
      <div>
        <Label
          htmlFor="popup-phone"
          className="font-body text-sm text-black mb-1.5 block"
        >
          Phone Number
        </Label>
        <div className="relative">
          <Phone
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
            style={{ color: "rgba(0,0,0,0.40)" }}
          />
          <Input
            id="popup-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={phoneInput}
            onChange={(e) => {
              setPhoneInput(e.target.value.replace(/\D/g, ""));
              setPhoneError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handlePhoneSubmit()}
            placeholder="10-digit mobile number"
            className="pl-10 rounded-xl font-body text-black placeholder:text-black/30"
            style={{ backgroundColor: "#ffffff", borderColor: sg.border }}
            data-ocid="checkout.login_phone_input"
            autoFocus
          />
        </div>
        {phoneError && (
          <p className="font-body text-xs text-red-600 mt-1">{phoneError}</p>
        )}
      </div>
      <button
        type="button"
        className="w-full rounded-full font-body py-2.5 text-sm font-semibold transition-colors cursor-pointer"
        style={{
          backgroundColor: btn1Hover ? sg.btnHover : sg.btnBg,
          color: "#000000",
        }}
        onMouseEnter={() => setBtn1Hover(true)}
        onMouseLeave={() => setBtn1Hover(false)}
        onClick={handlePhoneSubmit}
        data-ocid="checkout.login_send_code"
      >
        Continue
      </button>
    </div>
  );

  /* ─── Shared UI: code display box ───────────────────────  */

  const CodeDisplay = ({ code }: { code: string }) => (
    <div
      className="flex items-center justify-between rounded-xl px-4 py-3 mt-1"
      style={{
        backgroundColor: sg.codeBoxBg,
        border: `1.5px solid ${sg.border}`,
      }}
    >
      <span className="font-mono font-bold tracking-[0.25em] text-xl text-black">
        {code}
      </span>
      <button
        type="button"
        onClick={() => copyCode(code)}
        className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors"
        style={{ backgroundColor: sg.iconBg, color: sg.iconColor }}
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );

  /* ─── Render ─────────────────────────────────────────────  */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      data-ocid="checkout.login_popup"
    >
      <div
        className="w-full max-w-sm rounded-3xl shadow-2xl p-8"
        style={{ backgroundColor: sg.bg }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center w-14 h-14 rounded-full mx-auto mb-4 shadow-sm"
          style={{ backgroundColor: sg.iconBg }}
        >
          <KeyRound className="h-6 w-6" style={{ color: sg.iconColor }} />
        </div>

        {/* ── PHONE STEP ── */}
        {step === "phone" && (
          <>
            <h2 className="font-display text-2xl font-semibold text-black text-center mb-1">
              Login to Continue
            </h2>
            <p
              className="font-body text-sm text-center mb-6"
              style={{ color: sg.dimText }}
            >
              Login to save your address and order history
            </p>
            {renderPhoneStep()}
          </>
        )}

        {/* ── NEW USER: show their generated code ── */}
        {step === "new-code" && (
          <>
            <h2 className="font-display text-xl font-semibold text-black text-center mb-1">
              Your Login Code
            </h2>
            <p
              className="font-body text-sm text-center mb-4"
              style={{ color: sg.dimText }}
            >
              Welcome! Your unique code has been created.
            </p>

            <CodeDisplay code={newCode} />

            <div
              className="mt-3 rounded-xl px-4 py-3 text-sm font-body text-black"
              style={{
                backgroundColor: sg.iconBg,
                border: `1px solid ${sg.border}`,
              }}
            >
              <span className="font-semibold">Remember this code!</span> You'll
              need it to log in next time and to track your orders. Please save
              it somewhere safe.
            </div>

            <button
              type="button"
              className="w-full rounded-full font-body py-2.5 text-sm font-semibold transition-colors cursor-pointer mt-5"
              style={{
                backgroundColor: btn2Hover ? sg.btnHover : sg.btnBg,
                color: "#000000",
              }}
              onMouseEnter={() => setBtn2Hover(true)}
              onMouseLeave={() => setBtn2Hover(false)}
              onClick={handleNewCodeConfirm}
              data-ocid="checkout.login_confirm_code"
            >
              I've saved my code — Continue
            </button>

            <div className="flex justify-center mt-3">
              <button
                type="button"
                onClick={goBackToPhone}
                className="font-body text-xs underline underline-offset-2 transition-colors hover:text-black"
                style={{ color: sg.mutedText }}
              >
                Change number
              </button>
            </div>
          </>
        )}

        {/* ── RETURNING USER: enter their code ── */}
        {step === "returning-code" && (
          <>
            <h2 className="font-display text-xl font-semibold text-black text-center mb-1">
              Enter Your Code
            </h2>
            <p
              className="font-body text-sm text-center mb-5"
              style={{ color: sg.dimText }}
            >
              Enter the unique code assigned to{" "}
              <span className="font-semibold text-black">
                {cleanPhone(phoneInput)}
              </span>
            </p>

            <div>
              <Label
                htmlFor="popup-code"
                className="font-body text-sm text-black mb-1.5 block"
              >
                Login Code
              </Label>
              <Input
                id="popup-code"
                ref={codeInputRef}
                type="text"
                maxLength={8}
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(
                    e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                  );
                  setCodeError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                placeholder="e.g. PRL4K9M2"
                className="rounded-xl font-mono text-black placeholder:text-black/30 text-center tracking-widest text-lg"
                style={{ backgroundColor: "#ffffff", borderColor: sg.border }}
                data-ocid="checkout.login_code_input"
              />
              {codeError && (
                <p className="font-body text-xs text-red-600 mt-1">
                  {codeError}
                </p>
              )}
            </div>

            <button
              type="button"
              className="w-full rounded-full font-body py-2.5 text-sm font-semibold transition-colors cursor-pointer mt-4"
              style={{
                backgroundColor: btn2Hover ? sg.btnHover : sg.btnBg,
                color: "#000000",
              }}
              onMouseEnter={() => setBtn2Hover(true)}
              onMouseLeave={() => setBtn2Hover(false)}
              onClick={handleVerifyCode}
              data-ocid="checkout.login_verify_code"
            >
              Login
            </button>

            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={goBackToPhone}
                className="font-body text-xs underline underline-offset-2 transition-colors hover:text-black"
                style={{ color: sg.mutedText }}
              >
                Change number
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("forgot");
                  setForgotPhone2("");
                  setForgotError("");
                  setForgotResult(null);
                }}
                className="font-body text-xs underline underline-offset-2 transition-colors hover:text-black"
                style={{ color: sg.mutedText }}
                data-ocid="checkout.login_forgot_code"
              >
                Forgot your code?
              </button>
            </div>
          </>
        )}

        {/* ── FORGOT CODE FLOW ── */}
        {step === "forgot" && (
          <>
            <h2 className="font-display text-xl font-semibold text-black text-center mb-1">
              Retrieve Your Code
            </h2>
            <p
              className="font-body text-sm text-center mb-5"
              style={{ color: sg.dimText }}
            >
              Enter your registered phone number and we'll show you your code.
            </p>

            {forgotResult ? (
              /* Found — show the code */
              <div className="space-y-3">
                <p className="font-body text-sm text-black text-center">
                  The code for{" "}
                  <span className="font-semibold">{forgotPhone}</span> is:
                </p>
                <CodeDisplay code={forgotResult} />
                <div
                  className="rounded-xl px-4 py-3 text-sm font-body text-black"
                  style={{
                    backgroundColor: sg.iconBg,
                    border: `1px solid ${sg.border}`,
                  }}
                >
                  <span className="font-semibold">Remember this code!</span>{" "}
                  You'll need it to log in next time and to track your orders.
                </div>
                <button
                  type="button"
                  className="w-full rounded-full font-body py-2.5 text-sm font-semibold transition-colors cursor-pointer mt-1"
                  style={{
                    backgroundColor: btn3Hover ? sg.btnHover : sg.btnBg,
                    color: "#000000",
                  }}
                  onMouseEnter={() => setBtn3Hover(true)}
                  onMouseLeave={() => setBtn3Hover(false)}
                  onClick={() => {
                    setStep("returning-code");
                    setPhoneInput(forgotPhone);
                    setCodeInput("");
                    setCodeError("");
                  }}
                  data-ocid="checkout.forgot_back_to_login"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              /* Input form */
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="forgot-phone"
                    className="font-body text-sm text-black mb-1.5 block"
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
                      maxLength={10}
                      value={forgotPhone2}
                      onChange={(e) => {
                        setForgotPhone2(e.target.value.replace(/\D/g, ""));
                        setForgotError("");
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleForgotLookup()
                      }
                      placeholder="10-digit mobile number"
                      className="pl-10 rounded-xl font-body text-black placeholder:text-black/30"
                      style={{
                        backgroundColor: "#ffffff",
                        borderColor: sg.border,
                      }}
                      data-ocid="checkout.forgot_phone_input"
                      autoFocus
                    />
                  </div>
                  {forgotError && (
                    <p className="font-body text-xs text-red-600 mt-1">
                      {forgotError}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="w-full rounded-full font-body py-2.5 text-sm font-semibold transition-colors cursor-pointer"
                  style={{
                    backgroundColor: btn3Hover ? sg.btnHover : sg.btnBg,
                    color: "#000000",
                  }}
                  onMouseEnter={() => setBtn3Hover(true)}
                  onMouseLeave={() => setBtn3Hover(false)}
                  onClick={handleForgotLookup}
                  data-ocid="checkout.forgot_get_code"
                >
                  Get My Code
                </button>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="font-body text-xs underline underline-offset-2 transition-colors hover:text-black"
                    style={{ color: sg.mutedText }}
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
