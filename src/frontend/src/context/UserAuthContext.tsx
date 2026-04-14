import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const USER_SESSION_KEY = "pearlfect_user_session";
const CODE_PREFIX = "pearlfect_code_";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1 (ambiguous)

function generateUniqueCode(): string {
  let code = "PRL";
  for (let i = 0; i < 5; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code; // e.g. PRL4K9M2 (8 chars)
}

interface UserSession {
  phone: string;
  loginAt: string;
}

interface UserAuthContextValue {
  isLoggedIn: boolean;
  userPhone: string | null;
  login: (phone: string) => void;
  logout: () => void;
  /** Returns existing code or generates+stores a new one for the phone */
  getOrCreateCode: (phone: string) => string;
  /** Returns stored code for phone, or null if not found */
  getStoredCode: (phone: string) => string | null;
  /** Returns true if the entered code matches the stored code for the phone */
  verifyCode: (phone: string, code: string) => boolean;
  /** True if this phone already has a stored code (returning user) */
  hasCode: (phone: string) => boolean;
}

const UserAuthContext = createContext<UserAuthContextValue | undefined>(
  undefined,
);

function readSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(() =>
    readSession(),
  );

  // Keep state in sync if another tab changes localStorage
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === USER_SESSION_KEY) {
        setSession(e.newValue ? (JSON.parse(e.newValue) as UserSession) : null);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const login = useCallback((phone: string) => {
    const newSession: UserSession = {
      phone,
      loginAt: new Date().toISOString(),
    };
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
    // Notify CartContext (same-tab and cross-tab) via BroadcastChannel
    try {
      const ch = new BroadcastChannel("pearlfect_auth");
      ch.postMessage({ type: "login", phone });
      ch.close();
    } catch {
      // BroadcastChannel not supported — cart merge will fall back to next page load
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_SESSION_KEY);
    setSession(null);
    // Notify CartContext via BroadcastChannel
    try {
      const ch = new BroadcastChannel("pearlfect_auth");
      ch.postMessage({ type: "logout" });
      ch.close();
    } catch {
      // silent
    }
    // Cart is NOT cleared on logout — persisted cart survives for next login
  }, []);

  const hasCode = useCallback((phone: string): boolean => {
    return !!localStorage.getItem(`${CODE_PREFIX}${phone}`);
  }, []);

  const getStoredCode = useCallback((phone: string): string | null => {
    return localStorage.getItem(`${CODE_PREFIX}${phone}`);
  }, []);

  const getOrCreateCode = useCallback((phone: string): string => {
    const existing = localStorage.getItem(`${CODE_PREFIX}${phone}`);
    if (existing) return existing;
    const code = generateUniqueCode();
    localStorage.setItem(`${CODE_PREFIX}${phone}`, code);
    return code;
  }, []);

  const verifyCode = useCallback((phone: string, code: string): boolean => {
    const stored = localStorage.getItem(`${CODE_PREFIX}${phone}`);
    if (!stored) return false;
    return stored === code.trim().toUpperCase();
  }, []);

  return (
    <UserAuthContext.Provider
      value={{
        isLoggedIn: !!session,
        userPhone: session?.phone ?? null,
        login,
        logout,
        getOrCreateCode,
        getStoredCode,
        verifyCode,
        hasCode,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used within UserAuthProvider");
  return ctx;
}
