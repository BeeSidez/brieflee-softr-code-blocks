// =====================================================================
// Vibe Coding block: Signup gate — variant 1 (full original design)
// =====================================================================
// Mirrors the existing Brieflee sign-up card design: Continue-with-
// Google button, Full Name + Work Email inputs, Terms link, "Already
// have an account?" footer. Centered on the analysing-dashboard GIF.
//
// Acts as a work-email filter in front of the real signup at /signup1:
//   - Google button: redirects straight to /signup1?provider=google
//     (OAuth flow validates the email server-side)
//   - Email form: validates work email, writes a lead row, then
//     redirects to /signup1?email=...&name=...
//
// SOFTR UI SETUP:
//   1. Source tab → Database: brieflee leads → Table: Leads
//   2. Actions tab → enable "Add Record" (aliases auto-populate from
//      leadsCreateFields below: email / source / pageUrl / submittedAtIso)
//   3. Visibility tab → public.
// =====================================================================

import { useState } from "react";
import { useRecordCreate, q } from "@/lib/datasource";

// ─── Brand tokens ────────────────────────────────────────────
const NAVY = "#001364";
const NAVY_DEEP = "#000F4D";
const PERIWINKLE = "#879CF7";
const PERIWINKLE_HOVER = "#6B82E8";
const MUTED = "#6B7A99";
const BORDER = "rgba(217, 224, 255, 0.55)";
const ERROR_RED = "#d92626";

const LOGO_URL = "https://res.cloudinary.com/dchroynzv/image/upload/v1777623022/brieflee_logo_logo-mixed-blue-variations-set_2025-06.png";
const BG_IMAGE_URL = "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/6c6511c6-f721-499d-b74a-ebb281d16cb4.gif";

const REAL_SIGNUP_URL = "/signup1";
const GOOGLE_SIGNUP_URL = "/signup1?provider=google";
const LOGIN_URL = "/log-in";
const TERMS_URL = "/terms-and-conditions";
const PRIVACY_URL = "/privacy-policy";

// ─── Leads table (brieflee leads · mEEeNCnnfbMPtB) ──────────
const leadsCreateFields = q.select({
  email:          "hKZCA",  // EMAIL (primary)
  source:         "lXGkS",  // SELECT (allowToAddNewChoice = true)
  pageUrl:        "QDXvh",  // URL
  submittedAtIso: "IfrhS",  // SINGLE_LINE_TEXT (ISO timestamp)
});

const GATE_SOURCE_LABEL = "signup-gate-1";

// ─── Canonical free-email block list (copied from
// website/lead-magnets/tiktok-video-analyser/hero.jsx).
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

function isEmailShape(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());
}

// ─── Google G mark — inline SVG so we don't pull a logo asset ───
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M17.64 9.2045c0-.6382-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2582h2.9073c1.7018-1.5668 2.685-3.8741 2.685-6.6151z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9073-2.2582c-.8059.54-1.8373.8591-3.0491.8591-2.3441 0-4.3282-1.5832-5.0359-3.7105H.9641v2.3318C2.4441 15.9832 5.4818 18 9 18z" fill="#34A853"/>
      <path d="M3.9641 10.71c-.18-.54-.2823-1.1164-.2823-1.71 0-.5936.1023-1.17.2823-1.71V4.9582H.9641C.3491 6.1732 0 7.5477 0 9c0 1.4523.3491 2.8268.9641 4.0418L3.9641 10.71z" fill="#FBBC05"/>
      <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.3459l2.5813-2.5814C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4441 2.0168.9641 4.9582l3 2.3318C4.6718 5.1627 6.6559 3.5795 9 3.5795z" fill="#EA4335"/>
    </svg>
  );
}

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const createRecord = useRecordCreate({ fields: leadsCreateFields });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) { setError("Full name is required."); return; }
    if (!trimmedEmail) { setError("Email is required."); return; }
    if (!isEmailShape(trimmedEmail)) {
      setError("That doesn't look like a valid email.");
      return;
    }
    if (!isWorkEmail(trimmedEmail)) {
      setError("Use your company email instead. Personal @gmail.com, @yahoo.com, etc. aren't supported.");
      return;
    }

    setSubmitting(true);

    // Best-effort lead capture. If the write fails we still redirect
    // so the user reaches the real signup; we'd rather lose a lead
    // row than lose a conversion.
    try {
      if (createRecord.enabled !== false) {
        await createRecord.mutateAsync({
          email: trimmedEmail,
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

    const params = new URLSearchParams({ email: trimmedEmail, name: trimmedName });
    if (typeof window !== "undefined") {
      window.location.href = `${REAL_SIGNUP_URL}?${params.toString()}`;
    }
  };

  const emailBorder = error ? ERROR_RED : emailFocused ? PERIWINKLE : BORDER;
  const nameBorder = nameFocused ? PERIWINKLE : BORDER;

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center px-4 py-10"
      style={{
        background: `#FAFBFF url("${BG_IMAGE_URL}") center / cover no-repeat`,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(250, 251, 255, 0.55)" }}
        aria-hidden
      />

      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-xl p-8"
        style={{ border: `1px solid ${BORDER}` }}
      >
        <div className="flex justify-center mb-5">
          <img src={LOGO_URL} alt="Brieflee" className="h-9 w-auto" draggable={false} />
        </div>

        <h1 className="text-2xl font-bold text-center mb-1" style={{ color: NAVY }}>
          Create an account
        </h1>
        <p className="text-sm text-center mb-5" style={{ color: MUTED }}>
          Welcome to Brieflee!
        </p>

        {/* Continue with Google */}
        <a
          href={GOOGLE_SIGNUP_URL}
          className="flex items-center justify-center gap-2 w-full font-semibold transition-colors"
          style={{
            height: 42,
            fontSize: 14,
            background: "#FFFFFF",
            border: `1px solid ${BORDER}`,
            borderRadius: 10,
            color: NAVY_DEEP,
            textDecoration: "none",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#F8FAFF"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; }}
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </a>

        {/* Divider */}
        <div className="flex items-center my-5">
          <div className="flex-1 h-px" style={{ background: BORDER }} />
          <span className="px-3 text-xs" style={{ color: MUTED }}>or</span>
          <div className="flex-1 h-px" style={{ background: BORDER }} />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="signup-gate1-name"
            className="block text-sm font-semibold mb-1.5"
            style={{ color: NAVY }}
          >
            Full name <span style={{ color: ERROR_RED }}>*</span>
          </label>
          <input
            id="signup-gate1-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); if (error) setError(""); }}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            placeholder="Your name"
            autoComplete="name"
            className="w-full outline-none transition-colors mb-3"
            style={{
              height: 42,
              padding: "0 12px",
              fontSize: 14,
              background: "#FFFFFF",
              border: `1px solid ${nameBorder}`,
              borderRadius: 10,
              color: NAVY_DEEP,
            }}
          />

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
            onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            placeholder="name@yourcompany.com"
            autoComplete="email"
            className="w-full outline-none transition-colors"
            style={{
              height: 42,
              padding: "0 12px",
              fontSize: 14,
              background: "#FFFFFF",
              border: `1px solid ${emailBorder}`,
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
            onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = PERIWINKLE_HOVER; }}
            onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = PERIWINKLE; }}
          >
            {submitting ? "Continuing…" : "Continue"}
          </button>
        </form>

        <p className="text-xs text-center mt-5 leading-relaxed" style={{ color: MUTED }}>
          By signing up, you agree to our{" "}
          <a
            href={TERMS_URL}
            className="font-semibold hover:underline"
            style={{ color: PERIWINKLE }}
          >
            Terms and Conditions
          </a>{" "}
          &{" "}
          <a
            href={PRIVACY_URL}
            className="font-semibold hover:underline"
            style={{ color: PERIWINKLE }}
          >
            Privacy Policy
          </a>
        </p>
        <p className="text-xs text-center mt-3 leading-relaxed" style={{ color: MUTED }}>
          Already have an account?{" "}
          <a
            href={LOGIN_URL}
            className="font-semibold hover:underline"
            style={{ color: PERIWINKLE }}
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
