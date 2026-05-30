// =====================================================================
// Vibe Coding block: Signup gate — variant 1 (flat background)
// =====================================================================
// Thin pre-signup screen that blocks free-email signups before the
// user reaches the real signup form. Card has just the Brieflee
// logo + a work-email field + Continue button — sitting on a flat
// #FAFBFF background (no GIF; the GIF variant is gate-2.jsx).
//
// Flow:
//   user types email → click Continue → isWorkEmail() check
//   → if free domain → inline error, stays on this page
//   → if work domain → writes a row to the brieflee leads → Leads
//     table, then redirects to REAL_SIGNUP_URL with the email
//     pre-filled in the ?email= query string
//
// SOFTR UI SETUP:
//   1. Source tab → Database: brieflee leads → Table: Leads
//   2. Actions tab → enable "Add Record" (aliases auto-populate from
//      leadsCreateFields below: email / source / pageUrl / submittedAtIso)
//   3. Visibility tab → public.
// =====================================================================

import { useState } from "react";
import { useRecordCreate, q } from "@/lib/datasource";

const LOGO_URL = "https://res.cloudinary.com/dchroynzv/image/upload/v1777623022/brieflee_logo_logo-mixed-blue-variations-set_2025-06.png";

const NAVY = "#001364";
const NAVY_DEEP = "#000F4D";
const PERIWINKLE = "#879CF7";
const PERIWINKLE_HOVER = "#6B82E8";
const MUTED = "#6B7A99";
const BORDER = "rgba(217, 224, 255, 0.55)";
const ERROR_RED = "#d92626";

const REAL_SIGNUP_URL = "/sign-up1";

// ─── Leads table (brieflee leads · mEEeNCnnfbMPtB) ──────────
const leadsCreateFields = q.select({
  email:          "hKZCA",  // EMAIL (primary)
  source:         "lXGkS",  // SELECT (allowToAddNewChoice = true)
  pageUrl:        "QDXvh",  // URL
  submittedAtIso: "IfrhS",  // SINGLE_LINE_TEXT (ISO timestamp)
});

const GATE_SOURCE_LABEL = "signup-gate-1";

// ─── Canonical free-email block list (copied from
// website/lead-magnets/tiktok-video-analyser/hero.jsx — same set we
// gate every lead-magnet form with). Keep in sync if that list grows.
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

function isWorkEmail(value) {
  const v = (value || "").trim().toLowerCase();
  if (!v) return false;
  const at = v.lastIndexOf("@");
  if (at === -1) return false;
  return !FREE_EMAIL_DOMAINS.has(v.slice(at + 1));
}

// Basic email shape check — catches the obvious typos before we
// even bother with the domain block list.
function isEmailShape(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());
}

export default function Block() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);

  const createRecord = useRecordCreate({ fields: leadsCreateFields });

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Email is required.");
      return;
    }
    if (!isEmailShape(trimmed)) {
      setError("That doesn't look like a valid email.");
      return;
    }
    if (!isWorkEmail(trimmed)) {
      setError(
        "Use your company email instead. Personal @gmail.com, @yahoo.com, etc. aren't supported."
      );
      return;
    }
    setSubmitting(true);

    // Best-effort lead capture. If the write fails we still redirect
    // so the user reaches the real signup; we'd rather lose a lead
    // row than lose a conversion.
    try {
      if (createRecord.enabled !== false) {
        await createRecord.mutateAsync({
          email: trimmed,
          source: { label: GATE_SOURCE_LABEL },
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
          submittedAtIso: new Date().toISOString(),
        });
      } else {
        console.warn("[signup-gate-1] useRecordCreate not enabled — skipping lead write");
      }
    } catch (err) {
      console.error("[signup-gate-1] lead capture failed (continuing to redirect):", err);
    }

    if (typeof window !== "undefined") {
      window.location.href = `${REAL_SIGNUP_URL}?email=${encodeURIComponent(trimmed)}`;
    }
  };

  const borderColor = error ? ERROR_RED : focused ? PERIWINKLE : BORDER;

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-10"
      style={{ background: "#FAFBFF" }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-lg p-8"
        style={{ border: `1px solid ${BORDER}` }}
      >
        <div className="flex justify-center mb-6">
          <img
            src={LOGO_URL}
            alt="Brieflee"
            className="h-9 w-auto"
            draggable={false}
          />
        </div>

        <h1
          className="text-2xl font-bold text-center mb-1"
          style={{ color: NAVY }}
        >
          Create an account
        </h1>
        <p className="text-sm text-center mb-6" style={{ color: MUTED }}>
          Welcome to Brieflee!
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="signup-gate1-email"
            className="block text-sm font-semibold mb-1.5"
            style={{ color: NAVY }}
          >
            Work Email <span style={{ color: ERROR_RED }}>*</span>
          </label>
          <input
            id="signup-gate1-email"
            type="email"
            value={email}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="name@yourcompany.com"
            autoComplete="email"
            autoFocus
            className="w-full outline-none transition-colors"
            style={{
              height: 42,
              padding: "0 12px",
              fontSize: 14,
              background: "#FFFFFF",
              border: `1px solid ${borderColor}`,
              borderRadius: 10,
              color: NAVY_DEEP,
            }}
          />
          <div
            className="text-xs leading-relaxed mt-2 mb-4"
            style={{ color: ERROR_RED, minHeight: 32 }}
          >
            {error}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-white font-semibold transition-colors"
            style={{
              height: 42,
              fontSize: 14,
              background: PERIWINKLE,
              border: "none",
              borderRadius: 10,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!submitting) e.currentTarget.style.background = PERIWINKLE_HOVER;
            }}
            onMouseLeave={(e) => {
              if (!submitting) e.currentTarget.style.background = PERIWINKLE;
            }}
          >
            {submitting ? "Continuing…" : "Continue"}
          </button>
        </form>

        <p
          className="text-xs text-center mt-5 leading-relaxed"
          style={{ color: MUTED }}
        >
          Already have an account?{" "}
          <a
            href="/log-in"
            className="hover:underline font-semibold"
            style={{ color: PERIWINKLE }}
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
