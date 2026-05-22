// =====================================================================
// Vibe Coding block: UGC Video Examples — Email gate (Block 1 of 3)
// =====================================================================
// First block on /ugc-video-examples. Hides the curated-formats row +
// grid below it until the visitor submits a work email + brand website.
//
// On submit:
//   1. Fires the shared lead-capture webhook (source: ugc-video-examples)
//   2. Sets localStorage flag `brieflee_ugc_unlocked = "1"`
//   3. Dispatches a `brieflee-ugc-unlocked` custom event so the two
//      sibling blocks below reveal themselves without a page refresh
//
// SOFTR UI SETUP:
//   1. Place ABOVE curated-formats and grid blocks on /ugc-video-examples
//   2. Source tab → (none — pure form, no data dependency)
//   3. Visibility tab → public
// =====================================================================

import { useEffect, useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";
const UNLOCK_KEY = "brieflee_ugc_unlocked";

const EMAIL_WORKFLOW_URL = "https://workflows-api.softr.io/v1/workflows/1e28685f-1a24-4042-80ac-cadfedef7336/executions/22b90d5d-a73b-43b5-ac1b-f24843b781bd";

// Personal / throwaway email domains — blocked across every Brieflee
// lead-magnet form to keep lead quality high.
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com",
  "yahoo.com", "yahoo.co.uk", "yahoo.fr", "yahoo.de", "ymail.com",
  "hotmail.com", "hotmail.co.uk", "hotmail.fr", "live.com", "live.co.uk",
  "msn.com", "outlook.com", "outlook.co.uk",
  "aol.com",
  "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com", "pm.me",
  "mail.com", "gmx.com", "gmx.de", "gmx.net",
  "yandex.com", "yandex.ru",
  "zoho.com", "hey.com",
  "fastmail.com", "fastmail.fm",
  "tutanota.com", "tutanota.de",
  "mailinator.com", "guerrillamail.com", "10minutemail.com",
  "tempmail.com", "trashmail.com", "throwawaymail.com", "yopmail.com",
]);

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || "").trim());
}

function isWorkEmail(value) {
  const v = (value || "").trim().toLowerCase();
  if (!v) return false;
  const at = v.lastIndexOf("@");
  if (at === -1) return false;
  return !FREE_EMAIL_DOMAINS.has(v.slice(at + 1));
}

export default function Block() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | sent
  const [error, setError] = useState("");
  const [alreadyUnlocked, setAlreadyUnlocked] = useState(false);

  // Return visitor: skip the gate UI entirely.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(UNLOCK_KEY) === "1") {
      setAlreadyUnlocked(true);
    }
  }, []);

  const isUnlocked = status === "sent" || alreadyUnlocked;
  const showFreeEmailHint = isValidEmail(email) && !isWorkEmail(email);

  async function handleSubmit() {
    setError("");
    if (!email.trim() || !website.trim()) {
      setError("Fill in both fields.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Enter a valid work email.");
      return;
    }
    if (!isWorkEmail(email)) {
      setError("Use your company email instead. Personal @gmail.com, @yahoo.com, etc. aren't supported.");
      return;
    }

    setStatus("submitting");
    try {
      await fetch(EMAIL_WORKFLOW_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          website: website.trim(),
          source: "ugc-video-examples",
          page_url: typeof window !== "undefined" ? window.location.href : "",
          submitted_at_iso: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error("Lead capture failed (continuing anyway):", e);
    }

    // Mark unlocked + signal sibling blocks to reveal themselves.
    if (typeof window !== "undefined") {
      window.localStorage.setItem(UNLOCK_KEY, "1");
      window.dispatchEvent(new Event("brieflee-ugc-unlocked"));
    }
    setStatus("sent");
  }

  // Once unlocked, this block collapses to nothing so the page flows
  // straight into the curated formats + grid.
  if (isUnlocked) return null;

  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/[0.03] to-primary/[0.07]" />
      </div>

      <div className="container py-14 md:py-20 lg:py-24">
        <div className="content max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center mb-6 mx-auto"
            style={{
              gap: 10,
              padding: "10px 18px",
              background: "rgba(135,156,247,0.16)",
              color: NAVY,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              borderRadius: 999,
              width: "fit-content",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: PERIWINKLE,
                boxShadow: `0 0 0 3px ${PERIWINKLE}33`,
              }}
            />
            UGC Video Examples
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05]" style={{ color: NAVY }}>
            600+ UGC video examples from top-performing brands.
          </h1>

          <p className="text-base md:text-lg text-muted-foreground mt-5 leading-relaxed">
            Drop your work email and brand website to unlock the full library. Filter by format, brand, and industry. Click any video to see what makes it work.
          </p>

          <style>{`
            @keyframes briefleeHeroChipFloat {
              0%   { transform: translateY(0); }
              100% { transform: translateY(-6px); }
            }
          `}</style>
          <div className="flex justify-center mt-8 md:mt-10">
            <div className="relative w-full max-w-xl">
              <img
                src="https://res.cloudinary.com/dchroynzv/image/upload/v1779273194/brieflee_lead-magnet_ugc-format-examples-basket-icon_2026-05.png"
                alt="UGC Video Examples basket icon"
                className="w-full rounded-3xl shadow-[0_20px_60px_-25px_rgba(0,19,100,0.30)]"
                draggable={false}
              />
              {/* Floating chip — pulse pill */}
              <div
                className="absolute top-[6%] left-[55%] z-30 flex items-center gap-2 rounded-full bg-card border border-border shadow-md px-3 py-1.5 text-xs font-semibold"
                style={{ animation: "briefleeHeroChipFloat 6s ease-in-out 0.4s infinite alternate", color: NAVY }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Live library
              </div>
              {/* Floating chip — number stat */}
              <div
                className="absolute bottom-[6%] right-[55%] z-30 flex items-center gap-2 rounded-2xl bg-card border border-border shadow-lg px-4 py-2.5 text-left"
                style={{ animation: "briefleeHeroChipFloat 6s ease-in-out 1.0s infinite alternate-reverse" }}
              >
                <div className="text-2xl font-bold text-primary leading-none">600+</div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Examples</div>
                  <div className="text-xs text-foreground font-medium">Format · Brand · Industry</div>
                </div>
              </div>
            </div>
          </div>

          {/* Gate form */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mt-8 max-w-2xl mx-auto text-left shadow-[0_10px_40px_-15px_hsl(var(--primary)/0.25)]">
            <div className="flex items-center gap-3 mb-5">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <h2 className="text-base font-bold text-foreground" style={{ color: NAVY }}>Unlock the library</h2>
                <p className="text-xs text-muted-foreground">Two fields, then you're in.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Work email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@brand.com"
                    className="w-full h-11 px-3 rounded-xl border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                  {showFreeEmailHint && (
                    <p className="text-xs text-destructive mt-1.5">
                      Use your company email instead. Personal @gmail.com, @yahoo.com, etc. aren't supported.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Brand website</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="brand.com"
                    className="w-full h-11 px-3 rounded-xl border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={status === "submitting"}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {status === "submitting" ? "Unlocking…" : (<>Unlock the library <ArrowRight className="w-5 h-5" /></>)}
              </button>

              <p className="text-xs text-muted-foreground text-center">
                Free. One-click unsubscribe from the follow-up emails.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground mt-6">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> 600+ videos</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> 42 formats</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary" /> Filter by brand + industry</span>
          </div>
        </div>
      </div>
    </div>
  );
}
