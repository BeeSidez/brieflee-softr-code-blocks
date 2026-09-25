// /payment-success — the single redirect target for every Stripe checkout.
//
//   logged out → they bought before they had an account.
//                Send them to /sign-up?session_id=… to make their login.
//   logged in  → they upgraded from inside the app. Book onboarding here.
//
// This is a POST-PAYMENT page. The money is already taken and a 30-day
// unconditional refund window is open, so it uses none of the pressure
// tactics that suit a page trying to win a sale. Scarcity here is real or
// absent: the calendar genuinely only opens 5 days ahead.
//
// Three moves carry it:
//   1. The calendar is open on arrival. Every click before it costs bookings.
//   2. Step one is already done, because they paid. Endowed progress.
//   3. Once booked, one button: Continue setup. Setup asks for the product,
//      so nothing is asked twice.
//
// No call length and no agenda anywhere, per Bev 31 Aug. What the call
// PRODUCES is stated, which is not the same thing as how it runs.
//
// IMPORTANT — Google Ads conversion tag:
//   The Google Tag lives in Softr's Page Settings → Custom Code → Header for
//   /payment-success, not in this block. Nothing here touches it.
//
// SOFTR UI SETUP:
//   Source tab → Database: brieflee beta → Table: users.
//   Still to add: the EmailIt REST source, so booking can add them to
//   BL | Onboarding and skipping can leave them on the +3d / +7d chasers.

import { useCallback, useEffect, useRef, useState } from "react";
import { datasource, useRecord, useRecordUpdate, useProxyFetch, q } from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowDown, Check } from "lucide-react";

// Two sources now, so every hook has to name the one it targets. A block with
// a single source may omit `from`; the moment a second is attached, every hook
// without it throws at runtime while still compiling clean.
const ds = datasource.define({
  users: "e0073c96-053c-423d-8852-a785e58b74d1",
  emailit: "a8c1dc01-bcef-4040-bc4b-90cf79bb1f9f",
});

const userFields = q.select({
  checkoutSessionId: "8Tl1R",
  onboardingBookedAt: "MJ5fW",
});

// UPDATE select — writable fields only. A read-only field (lookup/formula) in
// an update hook's map stops Softr's analyzer registering ANY action, which
// disables the write for everyone.
const writeFields = q.select({
  checkoutSessionId: "8Tl1R",
  onboardingBookedAt: "MJ5fW",
});

const ONBOARDING_CAL = "https://tidycal.com/bevbanahene/brieflee-onboarding";
const TIDYCAL_ORIGIN = "https://tidycal.com";
const SETUP_PATH = "/set-up";
const SIGN_UP_PATH = "/sign-up";
// Joining this is what takes them off the +3d / +7d not-booked chasers.
const ONBOARDING_AUDIENCE =
  "https://api.emailit.com/v2/audiences/aud_4D1p0CkELqJe0jjrJ4aOuVywgP6/subscribers";

const IDENTITY_GRACE_MS = 1500;
// Friction belongs on the exit, not the entrance. The skip appears once they
// have had a moment with the calendar.
const SKIP_REVEAL_MS = 6000;

const SMILE_LOGO =
  "https://res.cloudinary.com/dchroynzv/image/upload/v1777622985/brieflee_logo_primary-logo-blue-wordmark-smiley-mark_2025-03.png";

const BL_NAVY       = "#001364";
const BL_DEEP       = "#000F4D";
const BL_PERIWINKLE = "#879CF7";
const BL_MUTED      = "#6B7A99";
const BL_BORDER     = "#D6DEFC";

// Module scope on purpose. Declared inside Block() it would be a new component
// type on every render, remounting the iframe and killing a half-done booking.
function Calendar({ src, fallback, onComplete }: any) {
  useEffect(() => {
    const handle = (e: any) => {
      if (e.origin !== TIDYCAL_ORIGIN) return;
      const payload = e.data;
      const name = typeof payload === "string" ? payload : payload && payload.event;
      if (name === "bookingComplete") onComplete();
    };
    // TidyCal posts to window.top, not window.parent, so listen on both.
    const targets: any[] = [window];
    try {
      if (window.top && window.top !== window) targets.push(window.top);
    } catch (err) {
      /* a cross-origin top window cannot be listened to, and does not need to be */
    }
    targets.forEach((t) => t.addEventListener("message", handle));
    return () => {
      targets.forEach((t) => {
        try {
          t.removeEventListener("message", handle);
        } catch (err) {
          /* window went away */
        }
      });
    };
  }, [onComplete]);

  return (
    <div className="bl-ps-cal">
      <iframe src={src} title="Book your onboarding call" className="bl-ps-calframe" />
      <p className="bl-ps-fine">
        Calendar not loading?{" "}
        <a href={fallback} target="_blank" rel="noopener noreferrer" className="bl-ps-link">
          Open it in a new tab
        </a>
      </p>
    </div>
  );
}

function Steps({ step }: any) {
  const items = ["Paid", "Book onboarding", "Get set up"];
  return (
    <div className="bl-ps-steps">
      {items.map((text, i) => {
        const state = i < step ? "done" : i === step ? "now" : "todo";
        return (
          <div key={text} className={"bl-ps-step bl-ps-step--" + state}>
            <span className="bl-ps-stepdot">
              {state === "done" ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span className="bl-ps-steplabel">{text}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Block() {
  const user = useCurrentUser();

  // Lazy initialiser. Parsing window.location at module or render scope stops
  // Softr's analyzer registering the update action, silently killing the write.
  const [sessionId] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return new URLSearchParams(window.location.search).get("session_id") || "";
    } catch (e) {
      return "";
    }
  });

  const [identityResolved, setIdentityResolved] = useState(false);
  const [booked, setBooked] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  const { data, status } = useRecord({ from: ds.users, recordId: user?.id, select: userFields });
  const updateRecord = useRecordUpdate({ from: ds.users, fields: writeFields });
  const sendMail = useProxyFetch(ds.emailit);
  const hasWrittenRef = useRef(false);
  const hydratedRef = useRef(false);
  const bookedWriteRef = useRef(false);
  const calRef = useRef<any>(null);

  // ----- Identity -----
  useEffect(() => {
    if (user?.id) {
      setIdentityResolved(true);
      return;
    }
    const timer = setTimeout(() => setIdentityResolved(true), IDENTITY_GRACE_MS);
    return () => clearTimeout(timer);
  }, [user?.id]);

  const loggedOut = identityResolved && !user?.id;

  useEffect(() => {
    if (!loggedOut) return;
    if (typeof window === "undefined") return;
    const target = sessionId
      ? SIGN_UP_PATH + "?session_id=" + encodeURIComponent(sessionId)
      : SIGN_UP_PATH;
    window.location.replace(target);
  }, [loggedOut, sessionId]);

  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), SKIP_REVEAL_MS);
    return () => clearTimeout(t);
  }, []);

  const storedSession =
    (data as any)?.checkoutSessionId ??
    (data as any)?.fields?.checkoutSessionId ??
    (data as any)?.fields?.["8Tl1R"] ??
    "";

  // ----- Someone who already booked should not be pitched again -----
  // They may have closed the tab and come back. Drop them into the state they
  // left in rather than showing the calendar a second time.
  useEffect(() => {
    if (status !== "success") return;
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const f: any = data || {};
    const bookedAt =
      f.onboardingBookedAt ?? f.fields?.onboardingBookedAt ?? f.fields?.["MJ5fW"];
    if (!bookedAt) return;
    setBooked(true);
    bookedWriteRef.current = true;
  }, [status, data]);

  // ----- Stamp the checkout session on the user row, once -----
  useEffect(() => {
    if (!user?.id) return;
    if (!sessionId) return;
    if (status !== "success") return;
    if (hasWrittenRef.current) return;
    if (storedSession === sessionId) return;
    hasWrittenRef.current = true;
    updateRecord
      .mutateAsync({ recordId: user.id, fields: { checkoutSessionId: sessionId } })
      .catch((err: any) => console.error("Failed to record checkout session:", err));
  }, [user?.id, sessionId, status, storedSession, updateRecord]);

  // ----- Booking confirmed by TidyCal -----
  // The stamp is what the +3d / +7d not-booked chasers read. Without it they
  // would chase people who already booked.
  const onBookingComplete = useCallback(() => {
    setBooked(true);
    if (!user?.id) return;
    if (bookedWriteRef.current) return;
    bookedWriteRef.current = true;
    updateRecord
      .mutateAsync({
        recordId: user.id,
        fields: { onboardingBookedAt: new Date().toISOString() },
      })
      .catch((err: any) => console.error("Failed to stamp onboarding booking:", err));

    // Joining the onboarding audience is what stops the not-booked chasers.
    // A 409 means they are already on it, which is a success, not an error.
    const email = String(user?.email || "").trim();
    if (!email) return;
    const first =
      String(user?.firstName || user?.fullName || "").trim().split(/\s+/)[0] || "";
    sendMail(ONBOARDING_AUDIENCE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, first_name: first }),
    }).catch((err: any) => console.error("Failed to join onboarding audience:", err));
  }, [user?.id, user?.email, user?.firstName, user?.fullName, updateRecord, sendMail]);

  const calendarUrl = (base: string) => {
    const parts: string[] = [];
    const nm = String(user?.fullName || "").trim();
    const em = String(user?.email || "").trim();
    if (nm) parts.push("name=" + encodeURIComponent(nm));
    if (em) parts.push("email=" + encodeURIComponent(em));
    return parts.length ? base + "?" + parts.join("&") : base;
  };

  // ?embed=1 is what TidyCal's own embed script sends, and what puts the
  // booking page into its in-frame layout.
  const calendarEmbedUrl = (base: string) => {
    const url = calendarUrl(base);
    return url.includes("?") ? url + "&embed=1" : url + "?embed=1";
  };

  // Two attempts on purpose. The block lives in a shadow root inside Softr's
  // shell, and depending on the page either the window scrolls or an ancestor
  // container does. Whichever one is real, the other is a harmless no-op
  // because both aim at the same position.
  const scrollToCal = () => {
    const el = calRef.current;
    if (!el) return;
    try {
      const top = window.scrollY + el.getBoundingClientRect().top - 24;
      window.scrollTo({ top, behavior: "smooth" });
    } catch (e) {
      /* no window scroll available */
    }
    try {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      try {
        el.scrollIntoView();
      } catch (e2) {
        /* nothing more to try */
      }
    }
  };

  const goToSetup = () => {
    window.location.href = SETUP_PATH;
  };

  if (!identityResolved || loggedOut) {
    return (
      <>
        <Style />
        <div className="bl-ps">
          <div className="bl-ps-inner">
            <img src={SMILE_LOGO} alt="Brieflee" className="bl-ps-logo" />
            <p className="bl-ps-body">One moment.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Style />
      <div className="bl-ps">
        <div className="bl-ps-inner">
          <img src={SMILE_LOGO} alt="Brieflee" className="bl-ps-logo" />

          <Steps step={booked ? 2 : 1} />

          {/* ─── Booked ─────────────────────────────────────────────── */}
          {booked ? (
            <>
              <h1 className="bl-ps-title">You are booked in</h1>
              <p className="bl-ps-lede">
                The invite is in your calendar. Next, set up your workspace so it is
                ready before we talk.
              </p>
              <Button
                onClick={goToSetup}
                className="bl-ps-cta font-semibold gap-2"
                style={{ backgroundColor: BL_PERIWINKLE, color: "#fff" }}
              >
                Continue setup
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            /* ─── Not booked yet ───────────────────────────────────── */
            <>
              <h1 className="bl-ps-title">Payment received</h1>
              <p className="bl-ps-lede">
                Your plan is active, billed annually. If Brieflee has not saved you time
                in thirty days you get all of it back.
              </p>

              {/* The 5-minute orientation video goes here once it is refilmed. */}

              <div className="bl-ps-gift">
                <span className="bl-ps-giftnum">500</span>
                <span className="bl-ps-giftlabel">free video reviews</span>
                <p className="bl-ps-giftbody">
                  Send us a creator video and we check it against your brief, then tell
                  you what is off and exactly where. You get{" "}
                  <span className="bl-ps-num">500</span> of those free, on top of
                  everything your plan already includes.
                </p>
              </div>

              <div className="bl-ps-card">
                <p className="bl-ps-cardtitle">Your onboarding call</p>
                <p className="bl-ps-cardbody">
                  We set the whole thing up together: your workspace, your first brief,
                  your first creator invited, and one real video checked so you can see
                  how it reads.
                </p>
                <p className="bl-ps-cardnote">
                  <span className="bl-ps-chip">
                    Book in the next 7 days to keep all <strong>500</strong>
                  </span>
                </p>
              </div>

              <Button
                onClick={scrollToCal}
                className="bl-ps-cta font-semibold gap-2"
                style={{ backgroundColor: BL_PERIWINKLE, color: "#fff" }}
              >
                Book your call and claim 500 reviews
                <ArrowDown className="h-4 w-4" />
              </Button>

              <div ref={calRef} className="bl-ps-calanchor">
                <Calendar
                  src={calendarEmbedUrl(ONBOARDING_CAL)}
                  fallback={calendarUrl(ONBOARDING_CAL)}
                  onComplete={onBookingComplete}
                />
              </div>

              {showSkip && (
                <button type="button" onClick={goToSetup} className="bl-ps-secondary bl-ps-fadein">
                  Skip for now
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </>
          )}

          <p className="bl-ps-fine">A receipt is on its way to your inbox from Stripe.</p>
        </div>
      </div>
    </>
  );
}

function Style() {
  return (
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700&display=swap');

        .bl-ps, .bl-ps * { font-family: 'League Spartan', sans-serif; }

        .bl-ps {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          box-sizing: border-box;
        }

        .bl-ps-inner {
          width: 100%;
          max-width: 520px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .bl-ps-logo {
          width: 72px; height: 72px; object-fit: contain;
          margin-bottom: 20px; display: block;
        }

        .bl-ps-steps {
          display: flex; align-items: center; gap: 18px;
          margin: 0 0 24px; flex-wrap: wrap; justify-content: center;
        }
        .bl-ps-step { display: flex; align-items: center; gap: 7px; }
        .bl-ps-stepdot {
          width: 20px; height: 20px; border-radius: 999px;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 600;
          border: 1px solid ${BL_BORDER}; color: ${BL_MUTED}; background: #fff;
        }
        .bl-ps-steplabel { font-size: 12px; font-weight: 500; color: ${BL_MUTED}; }
        .bl-ps-step--done .bl-ps-stepdot {
          background: ${BL_PERIWINKLE}; border-color: ${BL_PERIWINKLE}; color: #fff;
        }
        .bl-ps-step--done .bl-ps-steplabel { color: ${BL_NAVY}; }
        .bl-ps-step--now .bl-ps-stepdot {
          border-color: ${BL_PERIWINKLE}; color: ${BL_DEEP};
        }
        .bl-ps-step--now .bl-ps-steplabel { color: ${BL_DEEP}; font-weight: 600; }

        .bl-ps-title {
          font-size: 32px; font-weight: 700; color: ${BL_DEEP};
          letter-spacing: -0.015em; line-height: 1.15; margin: 0 0 14px;
        }

        .bl-ps-lede {
          font-size: 16px; color: ${BL_NAVY}; line-height: 1.55;
          margin: 0 0 24px; max-width: 440px;
        }

        .bl-ps-card {
          width: 100%; box-sizing: border-box; text-align: left;
          border: 1px solid ${BL_BORDER}; border-radius: 16px;
          padding: 20px 22px; margin: 0 0 20px;
          box-shadow: 0 4px 14px -2px rgba(41,79,246,0.10);
        }

        .bl-ps-gift {
          width: 100%; box-sizing: border-box; text-align: center;
          border: 1px solid #C9D4FB;
          background: linear-gradient(180deg, #F3F6FF 0%, #FFFFFF 100%);
          border-radius: 18px;
          padding: 28px 24px 24px;
          margin: 0 0 18px;
        }
        .bl-ps-giftnum {
          display: block;
          font-size: 60px; font-weight: 700; color: ${BL_PERIWINKLE};
          line-height: 1; letter-spacing: -0.03em;
        }
        .bl-ps-giftlabel {
          display: block; margin-top: 8px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.10em;
          text-transform: uppercase; color: ${BL_NAVY};
        }
        .bl-ps-giftbody {
          font-size: 14px; color: ${BL_MUTED}; line-height: 1.6;
          margin: 16px auto 0; max-width: 400px;
        }

        .bl-ps-cardtitle {
          font-size: 15px; font-weight: 600; color: ${BL_DEEP}; margin: 0 0 8px;
        }
        .bl-ps-cardnote {
          margin: 14px 0 0; padding-top: 14px;
          border-top: 1px solid ${BL_BORDER};
        }
        .bl-ps-chip {
          display: inline-block;
          background: #F3F6FF; border: 1px solid #C9D4FB;
          border-radius: 999px; padding: 5px 12px;
          font-size: 12px; font-weight: 500; color: ${BL_NAVY};
        }
        .bl-ps-chip strong { font-weight: 700; color: ${BL_PERIWINKLE}; }
        .bl-ps-num { font-weight: 700; color: ${BL_PERIWINKLE}; }
        .bl-ps-calanchor { width: 100%; scroll-margin-top: 24px; }

        .bl-ps-cardbody {
          font-size: 14px; color: ${BL_MUTED}; line-height: 1.6; margin: 0 0 10px;
        }
        .bl-ps-cardbody:last-child { margin-bottom: 0; }

        .bl-ps-body {
          font-size: 14px; color: ${BL_MUTED}; line-height: 1.6; margin: 0; max-width: 440px;
        }

        .bl-ps-label {
          display: block; font-size: 13px; font-weight: 600;
          color: ${BL_DEEP}; margin: 0 0 8px;
        }
        .bl-ps-label--spaced { margin-top: 18px; }

        .bl-ps-input {
          width: 100%; box-sizing: border-box;
          border: 1px solid ${BL_BORDER}; border-radius: 8px;
          padding: 9px 12px; font-size: 14px; color: ${BL_DEEP};
          background: #fff; outline: none;
        }
        .bl-ps-input:focus { border-color: ${BL_PERIWINKLE}; }

        .bl-ps-pills { display: flex; flex-wrap: wrap; gap: 8px; }
        .bl-ps-pill {
          border: 1px solid ${BL_BORDER}; background: #fff;
          border-radius: 999px; padding: 7px 14px;
          font-size: 13px; font-weight: 500; color: ${BL_MUTED};
          cursor: pointer;
          transition: all 160ms cubic-bezier(0.32, 0.72, 0, 1);
        }
        .bl-ps-pill:hover { border-color: ${BL_PERIWINKLE}; color: ${BL_NAVY}; }
        .bl-ps-pill--on {
          background: ${BL_PERIWINKLE}; border-color: ${BL_PERIWINKLE}; color: #fff;
        }

        .bl-ps-cal { width: 100%; margin: 0 0 14px; }
        .bl-ps-calframe {
          width: 100%; height: 640px;
          border: 1px solid ${BL_BORDER}; border-radius: 16px;
          background: #fff; display: block; margin-bottom: 10px;
        }

        .bl-ps-cta {
          font-size: 14px; padding: 10px 20px; height: 40px;
          border-radius: 8px; margin-bottom: 14px;
        }
        .bl-ps-cta:hover:not(:disabled) { background-color: #294FF6 !important; }

        .bl-ps-secondary {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: none; padding: 4px 8px; cursor: pointer;
          font-size: 14px; font-weight: 500; color: ${BL_MUTED};
          margin-bottom: 20px;
          transition: color 160ms cubic-bezier(0.32, 0.72, 0, 1);
        }
        .bl-ps-secondary:hover { color: ${BL_NAVY}; }

        .bl-ps-fadein { animation: blPsFade 400ms cubic-bezier(0.32, 0.72, 0, 1); }
        @keyframes blPsFade { from { opacity: 0; } to { opacity: 1; } }

        .bl-ps-link { color: ${BL_NAVY}; text-decoration: underline; }

        .bl-ps-fine {
          font-size: 12px; color: ${BL_MUTED}; line-height: 1.5;
          margin: 0; max-width: 360px;
        }
      `}
    </style>
  );
}