import {
  createActorWithConfig,
  useActor,
} from "@caffeineai/core-infrastructure";
import { useEffect, useState } from "react";
import { createActor } from "../backend";

const PROMO_BANNER_KEY = "pearlfect_promo_banner";

interface PromoBannerData {
  text: string;
  subText: string;
  endDate: bigint;
  bgColor: string;
}

interface StoredBanner {
  text: string;
  subText: string;
  endDateNs: string; // bigint serialized as string
  bgColor: string;
}

function readBannerFromStorage(): PromoBannerData | null {
  try {
    const raw = localStorage.getItem(PROMO_BANNER_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredBanner;
    if (!stored.text || !stored.endDateNs) return null;
    return {
      text: stored.text,
      subText: stored.subText ?? "",
      endDate: BigInt(stored.endDateNs),
      bgColor: stored.bgColor ?? "gold",
    };
  } catch {
    return null;
  }
}

function writeBannerToStorage(data: PromoBannerData): void {
  try {
    const stored: StoredBanner = {
      text: data.text,
      subText: data.subText,
      endDateNs: data.endDate.toString(),
      bgColor: data.bgColor,
    };
    localStorage.setItem(PROMO_BANNER_KEY, JSON.stringify(stored));
  } catch {
    // Storage write failed — non-fatal
  }
}

function useCountdown(endMs: number) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, endMs - Date.now()),
  );
  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining(Math.max(0, endMs - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [endMs, remaining]);
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  return { days, hours, mins, secs, expired: remaining <= 0 };
}

export function PromoBanner() {
  const { actor, isFetching } = useActor(createActor);
  // Initialise immediately from localStorage so banner shows without waiting for backend
  const [banner, setBanner] = useState<PromoBannerData | null>(() =>
    readBannerFromStorage(),
  );
  const [dismissed, setDismissed] = useState(false);

  // Poll backend every 5 s so any update from admin appears quickly on the site
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const activeActor =
          actor ??
          (isFetching
            ? null
            : await createActorWithConfig(createActor).catch(() => null));
        if (!activeActor) return;
        const b = await activeActor.getPromoBanner();
        if (b) {
          const data = b as PromoBannerData;
          setBanner(data);
          // Keep localStorage in sync so the next page load is instant
          writeBannerToStorage(data);
        }
      } catch {
        // Network error — localStorage fallback stays active
      }
    };

    fetchBanner(); // immediate fetch on mount
    const id = setInterval(fetchBanner, 5000);
    return () => clearInterval(id);
  }, [actor, isFetching]);

  const endMs = banner ? Number(banner.endDate) / 1_000_000 : 0;
  const { days, hours, mins, secs, expired } = useCountdown(endMs);

  if (!banner || dismissed || expired) return null;

  const bgMap: Record<string, string> = {
    gold: "bg-amber-500 text-white",
    pink: "bg-pink-400 text-white",
    rose: "bg-rose-500 text-white",
    green: "bg-emerald-600 text-white",
    blue: "bg-blue-600 text-white",
    dark: "bg-gray-900 text-white",
  };
  const bgCls = bgMap[banner.bgColor] ?? "bg-amber-500 text-white";

  return (
    <div
      className={`${bgCls} py-2 px-4 text-center text-sm font-body relative z-50`}
      data-ocid="promo.banner"
    >
      <span className="font-semibold">{banner.text}</span>
      {banner.subText && (
        <span className="ml-2 opacity-90">{banner.subText}</span>
      )}
      <span className="ml-3 inline-flex gap-1 text-xs font-mono opacity-90">
        {days > 0 && <span>{days}d</span>}
        <span>{String(hours).padStart(2, "0")}h</span>
        <span>{String(mins).padStart(2, "0")}m</span>
        <span>{String(secs).padStart(2, "0")}s</span>
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 text-lg leading-none"
        aria-label="Dismiss banner"
        data-ocid="promo.close_button"
      >
        ×
      </button>
    </div>
  );
}
