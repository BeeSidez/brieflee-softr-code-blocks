/* global React */
// ============================================================
// Brieflee Welcome Emails — 4 design options
// Each email renders inside a faux desktop mail-client chrome
// (Gmail-like) so the user can read them as inbox messages.
// Email body is a fixed 600px column — the email industry standard.
// ============================================================

const NAVY = "#001364";
const NAVY_DARKER = "#000f4d";
const PERI = "#879CF7";
const PERI_LIGHT = "#ECF0FF";
const PERI_FAINT = "#F4F6FF";
const BLUE = "#294ff6";
const BORDER = "#D6DEFC";
const BG_PAGE = "#FAFBFF";
const FG_BODY = "#333333";
const FG_MUTED = "#555555";
const FG_QUIET = "#9aa3b8";

// Outer artboard size (display-only). Each artboard auto-scales to fit
// its DCArtboard host. Total width gives some left/right gutter so the
// email column reads like it's in a real client window.
const ARTBOARD_W = 760;
const ARTBOARD_H = 1100;
const EMAIL_W = 600;

// ─── Email-client chrome ─────────────────────────────────
// A simplified mail-client header that frames every email so they
// look like real inbox messages, not bare HTML files.
function MailClientFrame({ subject, fromName, fromEmail, preheader, time, children }) {
  return (
    <div style={{
      width: ARTBOARD_W,
      minHeight: ARTBOARD_H,
      background: "#f1f3f6",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* mac-style window bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "12px 16px",
        background: "#e9ecf1",
        borderBottom: "1px solid #dde0e6",
      }}>
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
        <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        <div style={{
          marginLeft: 16, fontSize: 13, fontWeight: 600,
          color: "#5a6072", letterSpacing: "-0.005em",
        }}>
          Inbox · 1 new message
        </div>
      </div>

      {/* email subject + meta */}
      <div style={{
        padding: "20px 32px 16px",
        background: "#fff",
        borderBottom: "1px solid #ebedf2",
      }}>
        <div style={{
          fontSize: 22, fontWeight: 700, color: "#1f2330",
          letterSpacing: "-0.015em", marginBottom: 12,
        }}>
          {subject}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: PERI, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 14, letterSpacing: "0.02em",
          }}>
            B
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1f2330" }}>
              {fromName} <span style={{ fontWeight: 400, color: "#717687" }}>&lt;{fromEmail}&gt;</span>
            </div>
            <div style={{ fontSize: 13, color: "#8a8f9e", marginTop: 2 }}>
              to you · {time}
            </div>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 600, color: "#717687",
            padding: "4px 10px", border: "1px solid #e1e3eb",
            borderRadius: 999,
          }}>
            Inbox
          </span>
        </div>
        {preheader && (
          <div style={{
            marginTop: 14, fontSize: 12, color: "#8a8f9e",
            fontStyle: "italic",
          }}>
            Preview: {preheader}
          </div>
        )}
      </div>

      {/* email body — fixed 600px column on a soft grey */}
      <div style={{
        flex: 1,
        background: "#f1f3f6",
        padding: "32px 0 48px",
        display: "flex", justifyContent: "center",
      }}>
        <div style={{
          width: EMAIL_W,
          background: "#ffffff",
          boxShadow: "0 1px 2px 0 rgba(0,19,100,0.04)",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Tiny atoms reused across emails ─────────────────────
function Eyebrow({ children, color = PERI }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
      textTransform: "uppercase", color,
    }}>
      {children}
    </div>
  );
}

function PrimaryButton({ children, fullWidth = false }) {
  return (
    <a style={{
      display: fullWidth ? "block" : "inline-block",
      padding: "16px 28px",
      background: PERI,
      color: "#fff",
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: "-0.005em",
      borderRadius: 10,
      textAlign: "center",
      textDecoration: "none",
      boxShadow: "0 4px 14px -2px rgba(41,79,246,0.25)",
    }}>
      {children}
    </a>
  );
}

function SecondaryLink({ children }) {
  return (
    <a style={{
      fontSize: 14, fontWeight: 600, color: BLUE,
      textDecoration: "none",
    }}>
      {children} →
    </a>
  );
}

function FooterUnsub() {
  return (
    <div style={{
      padding: "28px 40px 32px",
      background: "#fafbff",
      borderTop: `1px solid ${BORDER}`,
      textAlign: "center",
    }}>
      <img src="assets/brieflee-wordmark.png" alt="Brieflee"
        style={{ height: 18, opacity: 0.7, marginBottom: 14 }} />
      <div style={{ fontSize: 11, color: FG_QUIET, lineHeight: 1.6 }}>
        Brieflee Inc. · 2261 Market St · San Francisco, CA 94114<br />
        You're receiving this because you signed up for a Brieflee trial.<br />
        <a style={{ color: FG_QUIET, textDecoration: "underline" }}>Unsubscribe</a>
        {" · "}
        <a style={{ color: FG_QUIET, textDecoration: "underline" }}>Manage preferences</a>
        {" · "}
        <a style={{ color: FG_QUIET, textDecoration: "underline" }}>View in browser</a>
      </div>
    </div>
  );
}

// ============================================================
// E1 · EDITORIAL ENGRAVING
// Premium magazine feel. Engraving illustration in the hero,
// minimal copy, single CTA. For a brand-led "first impression."
// ============================================================
function E1Editorial() {
  return (
    <MailClientFrame
      subject="Welcome to Brieflee"
      fromName="Brieflee"
      fromEmail="hello@brieflee.co"
      time="9:42 AM"
      preheader="Your trial is live. Here's how to score your first video in under a minute."
    >
      {/* Periwinkle hero strip — slimmer, matched to E3's height */}
      <div style={{
        background: "linear-gradient(180deg, #ECF0FF 0%, #DCE3FF 100%)",
        padding: "28px 40px 24px",
        textAlign: "center",
        position: "relative",
      }}>
        <img src="assets/brieflee-wordmark.png" alt="Brieflee"
          style={{ height: 20, marginBottom: 20 }} />

        {/* Engraving disc — smaller */}
        <div style={{
          width: 160, height: 160, margin: "0 auto",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: `radial-gradient(circle at 50% 40%, rgba(135,156,247,0.45) 0%, rgba(135,156,247,0) 65%)`,
          }} />
          <img src="assets/engraving-clapboard.png" alt=""
            style={{
              position: "absolute", inset: 0, margin: "auto",
              width: 140, height: 140, objectFit: "contain",
              transform: "rotate(-6deg)",
              filter: "drop-shadow(0 10px 18px rgba(0,19,100,0.18))",
            }} />
        </div>

        {/* small caption — pulled from the product, not made-up editorial chrome */}
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
          textTransform: "uppercase", color: NAVY, opacity: 0.55,
          marginTop: 16,
        }}>
          Spell check for video
        </div>
      </div>

      {/* Editorial body */}
      <div style={{ padding: "48px 56px 40px", color: NAVY }}>
        <Eyebrow color={BLUE}>A short note from the team</Eyebrow>
        <h1 style={{
          fontSize: 38, fontWeight: 800, letterSpacing: "-0.025em",
          lineHeight: 1.05, margin: "16px 0 20px", color: NAVY,
          textWrap: "balance",
        }}>
          Welcome to Brieflee, Sarah.
        </h1>
        <p style={{
          fontSize: 16, lineHeight: 1.65, color: FG_BODY,
          margin: "0 0 16px",
        }}>
          Reviewing creator content shouldn't take afternoons. Brieflee scores
          every UGC, influencer, and customer video against the brief you set,
          in seconds — so you can spend your day on the work that actually
          needs your eyes on it.
        </p>
        <p style={{
          fontSize: 16, lineHeight: 1.65, color: FG_BODY,
          margin: "0 0 32px",
        }}>
          Your 14-day trial is live. The fastest way to feel the magic is to
          run one of your own videos through the system. It takes about a
          minute.
        </p>

        <div style={{ marginBottom: 32 }}>
          <PrimaryButton>Score your first video</PrimaryButton>
        </div>

        <div style={{
          paddingTop: 28, borderTop: `1px solid ${BORDER}`,
          fontSize: 14, lineHeight: 1.6, color: FG_MUTED,
        }}>
          Reply to this email any time. A real person on our team reads every
          reply. We'd love to hear what you're trying to solve.
        </div>
        <div style={{ marginTop: 20, fontSize: 14, color: NAVY, fontWeight: 600 }}>
          — Anna<br />
          <span style={{ fontWeight: 400, color: FG_MUTED }}>Co-founder, Brieflee</span>
        </div>
      </div>

      <FooterUnsub />
    </MailClientFrame>
  );
}

// ============================================================
// E2 · FRIENDLY STICKER
// Brighter, warmer feel. Sticker rocket illustration, 3-step
// "Get started" cards. Good for a self-serve audience.
// ============================================================
function E2Sticker() {
  const steps = [
    { n: "01", title: "Set your brief", body: "Spell out hook timing, length, brand mentions, and 26 other QA checks. Save it as a template you reuse." },
    { n: "02", title: "Drop in your videos", body: "Bulk upload up to 500 assets at once via CSV or drag-and-drop. We scan in seconds." },
    { n: "03", title: "Approve, reject, or revise", body: "Send revision notes straight from the score card. Creators get clear feedback, you save hours." },
  ];
  return (
    <MailClientFrame
      subject="🎉 You're in. Let's score your first video"
      fromName="Anna at Brieflee"
      fromEmail="anna@brieflee.co"
      time="9:42 AM"
      preheader="3 steps and you'll see your first score. No credit card, no setup call."
    >
      {/* Hero with rocket sticker — slimmer, matched to E3's height */}
      <div style={{
        background: "linear-gradient(180deg, #ECF0FF 0%, #C9D4FF 100%)",
        padding: "28px 40px 28px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <img src="assets/brieflee-wordmark.png" alt="Brieflee"
          style={{ height: 20, marginBottom: 16 }} />

        <div style={{
          position: "relative", height: 120,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <img src="assets/rocket.png" alt=""
            style={{
              width: 120, height: 120, objectFit: "contain",
              transform: "rotate(-8deg)",
              filter: "drop-shadow(0 12px 18px rgba(0,19,100,0.18))",
            }} />
          <img src="assets/ai-sparkles.png" alt=""
            style={{
              position: "absolute", top: 0, right: 130,
              width: 50, height: 50, transform: "rotate(12deg)",
            }} />
        </div>

        <h1 style={{
          fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em",
          lineHeight: 1.1, margin: "14px 0 6px", color: NAVY,
          textWrap: "balance",
        }}>
          You're in, Sarah.
        </h1>
        <p style={{
          fontSize: 15, lineHeight: 1.5, color: NAVY, opacity: 0.7,
          margin: "0 auto", maxWidth: 420, fontWeight: 500,
        }}>
          Your 14-day trial just started. Three quick steps and you'll see
          your first score.
        </p>
      </div>

      {/* Steps */}
      <div style={{ padding: "36px 40px 8px" }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            display: "flex", gap: 18,
            padding: "20px 0",
            borderBottom: i < steps.length - 1 ? `1px solid ${BORDER}` : "none",
          }}>
            <div style={{
              flexShrink: 0,
              width: 40, height: 40, borderRadius: 10,
              background: PERI_LIGHT, color: NAVY,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 800, letterSpacing: "0.02em",
            }}>
              {s.n}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 17, fontWeight: 700, color: NAVY,
                marginBottom: 6, letterSpacing: "-0.01em",
              }}>
                {s.title}
              </div>
              <div style={{
                fontSize: 14, lineHeight: 1.55, color: FG_BODY,
              }}>
                {s.body}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: "24px 40px 40px", textAlign: "center" }}>
        <PrimaryButton fullWidth>Open Brieflee &nbsp;→</PrimaryButton>
        <div style={{ marginTop: 16, fontSize: 13, color: FG_MUTED }}>
          Stuck? Hit reply or <a style={{ color: BLUE, fontWeight: 600 }}>book a 15-min onboarding</a>.
        </div>
      </div>

      <FooterUnsub />
    </MailClientFrame>
  );
}

// ============================================================
// E3 · SCORE CARD DEMO
// Leads with a fully-rendered fake score card so the user
// sees the product output the moment they open the email.
// "Here's what you came for." Reads as utility, not marketing.
// ============================================================
function E3ScoreCard() {
  const checks = [
    { label: "Hook timing", v: "First 1.8s", pass: true },
    { label: "Audio quality", v: "92%", pass: true },
    { label: "Brand mention", v: "3×", pass: true },
    { label: "Product visible", v: "61% of runtime", pass: true },
    { label: "Aspect ratio", v: "9:16", pass: true },
    { label: "Caption match", v: "On-brief", pass: true },
  ];
  return (
    <MailClientFrame
      subject="Welcome — here's a sample Brieflee score"
      fromName="Brieflee"
      fromEmail="hello@brieflee.co"
      time="9:42 AM"
      preheader="A real sample output, plus a link to score one of your own."
    >
      {/* Compact periwinkle header */}
      <div style={{
        background: "linear-gradient(180deg, #ECF0FF 0%, #ECF0FF 100%)",
        padding: "32px 40px 28px",
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <img src="assets/brieflee-wordmark.png" alt="Brieflee"
          style={{ height: 20, marginBottom: 22 }} />
        <Eyebrow color={NAVY}>Welcome to your trial</Eyebrow>
        <h1 style={{
          fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em",
          lineHeight: 1.1, margin: "10px 0 8px", color: NAVY,
          textWrap: "balance",
        }}>
          This is what every video<br />will look like in Brieflee.
        </h1>
        <p style={{
          fontSize: 15, lineHeight: 1.55, color: NAVY, opacity: 0.7,
          margin: 0, fontWeight: 500,
        }}>
          Below is a real score on a sample submission. Yours arrives in about
          4 seconds per video.
        </p>
      </div>

      {/* The score card */}
      <div style={{ padding: "28px 32px 8px" }}>
        <div style={{
          background: "#fff",
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 14px -2px rgba(41,79,246,0.06)",
        }}>
          {/* video thumb row */}
          <div style={{
            display: "flex", gap: 14, padding: 16,
            borderBottom: `1px solid ${PERI_FAINT}`,
            background: PERI_FAINT,
          }}>
            <div style={{
              width: 60, height: 80, borderRadius: 8,
              background: `linear-gradient(135deg, ${PERI} 0%, ${BLUE} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
                <polygon points="6 4 20 12 6 20 6 4" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: NAVY, opacity: 0.6,
                letterSpacing: "0.06em", textTransform: "uppercase",
                marginBottom: 4,
              }}>
                Sample · gymshark-q3-027.mp4
              </div>
              <div style={{
                fontSize: 16, fontWeight: 700, color: NAVY,
                letterSpacing: "-0.01em", marginBottom: 8,
              }}>
                Reviewed in 4.2 seconds
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: "#166534",
                  background: "#dcfce7", padding: "4px 10px",
                  borderRadius: 999,
                }}>
                  PASS · 94 / 100
                </div>
                <div style={{ fontSize: 12, color: FG_MUTED, fontWeight: 500 }}>
                  6 of 6 checks
                </div>
              </div>
            </div>
          </div>

          {/* checks */}
          <div>
            {checks.map((c, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px",
                borderBottom: i < checks.length - 1 ? `1px solid ${PERI_FAINT}` : "none",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: PERI, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="3.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: NAVY, flex: 1 }}>
                  {c.label}
                </span>
                <span style={{ fontSize: 13, color: FG_MUTED, fontWeight: 500 }}>
                  {c.v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "24px 32px 40px" }}>
        <p style={{
          fontSize: 15, lineHeight: 1.6, color: FG_BODY,
          margin: "0 0 20px",
        }}>
          Ready to run your own? Upload one video, point Brieflee at your
          brief, and we'll have a score for you faster than your coffee
          cools off.
        </p>
        <PrimaryButton fullWidth>Score one of your videos</PrimaryButton>
        <div style={{
          marginTop: 16, textAlign: "center",
          fontSize: 13, color: FG_MUTED,
        }}>
          Want a guided tour first? <a style={{ color: BLUE, fontWeight: 600 }}>Watch the 90-second demo</a>.
        </div>
      </div>

      <FooterUnsub />
    </MailClientFrame>
  );
}

// ============================================================
// E4 · MINIMAL TYPE-FIRST
// No imagery in the body. All-type hero, single CTA, three
// quick links in the footer. Reads like Linear / Stripe email.
// ============================================================
function E4Minimal() {
  return (
    <MailClientFrame
      subject="Welcome to Brieflee"
      fromName="Brieflee"
      fromEmail="hello@brieflee.co"
      time="9:42 AM"
      preheader="Your trial is active. One link gets you to your first score."
    >
      {/* Tight wordmark header */}
      <div style={{
        padding: "28px 48px 0",
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <img src="assets/brieflee-wordmark.png" alt="Brieflee"
          style={{ height: 22, marginBottom: 24 }} />
      </div>

      {/* All-type hero */}
      <div style={{ padding: "48px 48px 40px" }}>
        <div style={{
          fontSize: 12, fontWeight: 700, letterSpacing: "0.14em",
          textTransform: "uppercase", color: PERI,
          marginBottom: 18,
        }}>
          Trial · 14 days · Active
        </div>

        <h1 style={{
          fontSize: 48, fontWeight: 800, letterSpacing: "-0.03em",
          lineHeight: 1, margin: "0 0 24px", color: NAVY,
          textWrap: "balance",
        }}>
          Spell check<br />
          <span style={{ color: PERI }}>for video.</span>
        </h1>

        <p style={{
          fontSize: 17, lineHeight: 1.6, color: FG_BODY,
          margin: "0 0 16px", maxWidth: 460,
        }}>
          Hi Sarah, welcome to Brieflee. You've got 14 days to
          run as many videos through the system as you'd like.
        </p>
        <p style={{
          fontSize: 17, lineHeight: 1.6, color: FG_BODY,
          margin: "0 0 36px", maxWidth: 460,
        }}>
          The single most useful thing you can do today: upload one
          video and watch it get scored. Everything else clicks into
          place after that.
        </p>

        <PrimaryButton>Open Brieflee</PrimaryButton>
      </div>

      {/* Three quick links — utility footer */}
      <div style={{
        borderTop: `1px solid ${BORDER}`,
        padding: "32px 48px",
        background: BG_PAGE,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: NAVY, opacity: 0.55,
          marginBottom: 16,
        }}>
          While you're here
        </div>

        {[
          { t: "Set up your first brief", d: "26-point QA checklist · ~3 minutes" },
          { t: "Bulk import videos from a CSV", d: "Up to 500 assets at once" },
          { t: "Invite your team", d: "Free seats during trial" },
        ].map((l, i) => (
          <a key={i} style={{
            display: "flex", alignItems: "center",
            padding: "14px 0",
            borderBottom: i < 2 ? `1px solid ${BORDER}` : "none",
            textDecoration: "none",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 2 }}>
                {l.t}
              </div>
              <div style={{ fontSize: 13, color: FG_MUTED }}>{l.d}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={BLUE} strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        ))}
      </div>

      <FooterUnsub />
    </MailClientFrame>
  );
}

// ============================================================
// Each variant gets wrapped in a fixed-size 1080×wide artboard
// that auto-scales to fill its DCArtboard.
// ============================================================
function ArtboardScaler({ children }) {
  const outerRef = React.useRef(null);
  const innerRef = React.useRef(null);

  React.useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    const apply = () => {
      const w = outer.clientWidth;
      const h = outer.clientHeight;
      if (!w || !h) return;
      const s = Math.min(w / ARTBOARD_W, h / ARTBOARD_H);
      inner.style.transform = `scale(${s})`;
      // Center horizontally if scaled-down width is less than outer width
      const scaledW = ARTBOARD_W * s;
      const scaledH = ARTBOARD_H * s;
      inner.style.left = `${(w - scaledW) / 2}px`;
      inner.style.top = `${(h - scaledH) / 2}px`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outerRef} style={{
      width: "100%", height: "100%",
      position: "relative", overflow: "hidden",
      background: "#e6e9ef",
    }}>
      <div ref={innerRef} style={{
        width: ARTBOARD_W, height: ARTBOARD_H,
        position: "absolute", top: 0, left: 0,
        transformOrigin: "top left",
      }}>
        {children}
      </div>
    </div>
  );
}

function E1() { return <ArtboardScaler><E1Editorial /></ArtboardScaler>; }
function E2() { return <ArtboardScaler><E2Sticker /></ArtboardScaler>; }
function E3() { return <ArtboardScaler><E3ScoreCard /></ArtboardScaler>; }
function E4() { return <ArtboardScaler><E4Minimal /></ArtboardScaler>; }

Object.assign(window, { E1, E2, E3, E4 });
