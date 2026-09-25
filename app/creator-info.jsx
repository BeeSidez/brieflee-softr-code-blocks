// =====================================================================
// /app/creator-info — How Brieflee works (creator help page)
//
// Static informational page for creators who land on a brief and want
// to understand how the review process works after they submit a video.
// Linked from the top nav of the public brief pages.
//
// No source binding required — pure content. Drop on a Softr page at
// /creator-info with public visibility.
// =====================================================================

import { Check, Flag, X, Clock, Mail, ListChecks, Lightbulb, HelpCircle } from "lucide-react";

// ─── Brand palette ────────────────────────────────────────────
const NAVY_DEEP   = "#001364";
const PERIWINKLE  = "#879CF7";
const PERIWINKLE_HOVER = "#294FF6";
const MUTED       = "#6B7A99";
const BORDER      = "rgba(217, 224, 255, 0.55)";
const TAG_BG      = "rgba(135, 156, 247, 0.10)";
const TINT_BG     = "rgba(135, 156, 247, 0.08)";
const SURFACE     = "#FAFBFF";

const BRIEFLEE_WORDMARK = "https://res.cloudinary.com/dchroynzv/image/upload/v1777623067/brieflee_logo_primary-logo-blue-vector_2025-03.svg";
const ICON_AI           = "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_review-eyes-glass-3d-clearer-periwinkle-transparent_2026-07.png";
const ICON_EMAIL        = "https://res.cloudinary.com/dchroynzv/image/upload/v1777998690/brieflee_help-icon_members-speech-bubble-profile-icon-with-count-one-transparent_2026-05.png";

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  return (
    <>
      <Style />
      <div className="bl-ci">
        <div className="bl-ci-inner container mx-auto px-4 w-full">

          {/* Hero */}
          <header className="bl-ci-hero">
            <span className="bl-ci-eyebrow">Creator info</span>
            <h1 className="bl-ci-title">How Brieflee works</h1>
            <p className="bl-ci-sub">
              When you submit content through Brieflee, it goes through an AI-powered review process
              that checks your video against the brief requirements and quality standards.
            </p>
          </header>

          {/* What happens after you submit */}
          <Section title="What happens after you submit" subtitle="Two automatic steps run as soon as you upload.">
            <div className="bl-ci-steps">
              <StepCard
                num={1}
                icon={ICON_AI}
                title="AI reviews your content"
                bullets={[
                  "Brieflee's AI analyzes your video within minutes",
                  "It checks product visibility, hook timing, audio quality, and brand guidelines",
                  "The AI compares your content against the specific requirements in the brief",
                ]}
              />
              <StepCard
                num={2}
                icon={ICON_EMAIL}
                title="You'll get an email"
                bullets={[
                  "You'll receive an email notification with the review results",
                  "The email will tell you if your content was approved, needs revisions, or was rejected",
                ]}
              />
            </div>
          </Section>

          {/* Three outcomes */}
          <Section title="Three possible outcomes" subtitle="Every submission lands in one of these buckets.">
            <div className="bl-ci-outcomes">
              <OutcomeCard
                tone="approved"
                icon={<Check size={20} strokeWidth={2.5} />}
                title="Approved"
                summary="Your content meets all requirements and you're good to go."
                nextSteps={[
                  "You'll receive an email confirming approval",
                  "Depending on how the brand has set things up, you may be cleared to post immediately or the brand team might do a final review first",
                ]}
              />
              <OutcomeCard
                tone="flagged"
                icon={<Flag size={20} strokeWidth={2.5} />}
                title="Flagged for review"
                subtitle="(Needs revisions)"
                summary="Your content has some issues that need fixing."
                nextSteps={[
                  "You'll receive an email with specific feedback on what needs to change",
                  'The feedback will point out exactly what\'s wrong (e.g. "Product only visible for 3 seconds, needs 5+ seconds")',
                  "Make the changes and resubmit your content",
                ]}
              />
              <OutcomeCard
                tone="rejected"
                icon={<X size={20} strokeWidth={2.5} />}
                title="Rejected"
                summary="Your content doesn't meet the requirements and needs significant changes."
                nextSteps={[
                  "You'll receive an email explaining why it was rejected",
                  "Review the feedback carefully",
                  "If you want to submit new content, address all the issues mentioned",
                ]}
              />
            </div>
          </Section>

          {/* Understanding the review process */}
          <Section title="Understanding the review process" subtitle="Timings, why you might get two emails, and what the AI looks for.">
            <div className="bl-ci-grid">
              <InfoCard
                icon={<Clock size={20} />}
                title="How long does it take?"
                bullets={[
                  "AI Review: usually completes within a few minutes of submission",
                  "Brand Review: if the brand team needs to review, this can take 1-3 business days",
                ]}
              />
              <InfoCard
                icon={<Mail size={20} />}
                title="Why two emails sometimes?"
                paragraph="Depending on how the brand has configured Brieflee, you might receive an initial email saying 'Your content is under review' with AI feedback, then a follow-up email from the brand with their final decision. This happens when the brand wants to review AI recommendations before making final decisions."
              />
              <InfoCard
                icon={<ListChecks size={20} />}
                title="What gets checked?"
                bullets={[
                  "Product visibility: how much screen time the product gets",
                  "Hook timing: does your video grab attention in the first 3 seconds?",
                  "Audio quality: is the sound clear and audible?",
                  "Brand mentions: are you saying the brand name correctly?",
                  "Visual quality: is the video properly lit and in focus?",
                  "Pacing: does the video maintain viewer engagement?",
                  "And other requirements specific to the brief",
                ]}
              />
            </div>
          </Section>

          {/* Tips */}
          <Section title="Tips for getting approved" subtitle="Five small habits that move every submission closer to a green tick.">
            <ol className="bl-ci-tips">
              <li><strong>Read the brief carefully</strong> before filming</li>
              <li><strong>Follow all the requirements</strong> listed in the brief</li>
              <li><strong>Check your video before submitting</strong> — watch it like a viewer would</li>
              <li><strong>If you get revision requests</strong>, address every point mentioned</li>
              <li><strong>Ask questions</strong> if anything in the brief is unclear before you film</li>
            </ol>
          </Section>

          {/* Need help */}
          <section className="bl-ci-help">
            <div className="bl-ci-help-icon"><HelpCircle size={24} /></div>
            <div className="bl-ci-help-text">
              <h3>Need help?</h3>
              <p>
                If you're confused about feedback or have questions about the brief requirements, reach
                out to the brand team directly. They can clarify what they're looking for and help you
                create content that gets approved.
              </p>
            </div>
          </section>

          {/* Closing note */}
          <p className="bl-ci-remember">
            <Lightbulb size={14} />
            <span>
              <strong>Remember:</strong> the review process is designed to help you create better content faster.
              The more specific the feedback, the easier it is to get your next submission approved.
            </span>
          </p>

          <footer className="bl-ci-footer">
            <span>Powered by</span>
            <img src={BRIEFLEE_WORDMARK} alt="Brieflee" />
          </footer>

        </div>
      </div>
    </>
  );
}

// =====================================================================
// Subcomponents
// =====================================================================
function Section({ title, subtitle, children }) {
  return (
    <section className="bl-ci-section">
      <header className="bl-ci-section-head">
        <h2 className="bl-ci-section-title">{title}</h2>
        {subtitle && <p className="bl-ci-section-sub">{subtitle}</p>}
      </header>
      <div className="bl-ci-section-body">{children}</div>
    </section>
  );
}

function StepCard({ num, icon, title, bullets }) {
  return (
    <div className="bl-ci-step">
      <div className="bl-ci-step-num">{num}</div>
      <img src={icon} alt="" className="bl-ci-step-icon" draggable={false} />
      <h3 className="bl-ci-step-title">{title}</h3>
      <ul className="bl-ci-bullets">
        {bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
    </div>
  );
}

function OutcomeCard({ tone, icon, title, subtitle, summary, nextSteps }) {
  return (
    <div className={`bl-ci-outcome bl-ci-outcome-${tone}`}>
      <div className="bl-ci-outcome-head">
        <span className="bl-ci-outcome-badge">{icon}</span>
        <div className="bl-ci-outcome-title-wrap">
          <h3 className="bl-ci-outcome-title">{title}</h3>
          {subtitle && <span className="bl-ci-outcome-subtitle">{subtitle}</span>}
        </div>
      </div>
      <p className="bl-ci-outcome-summary"><strong>What it means:</strong> {summary}</p>
      <div className="bl-ci-outcome-next">
        <span className="bl-ci-outcome-next-title">What happens next:</span>
        <ul className="bl-ci-bullets">
          {nextSteps.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, paragraph, bullets }) {
  return (
    <div className="bl-ci-info">
      <div className="bl-ci-info-icon">{icon}</div>
      <h3 className="bl-ci-info-title">{title}</h3>
      {paragraph && <p className="bl-ci-info-text">{paragraph}</p>}
      {bullets && (
        <ul className="bl-ci-bullets">
          {bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}
    </div>
  );
}

// =====================================================================
// Style
// =====================================================================
function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700&display=swap');
      .bl-ci, .bl-ci * { font-family: 'League Spartan', sans-serif; box-sizing: border-box; }
      .bl-ci { background: ${SURFACE}; min-height: 100vh; padding: 32px 0 64px; }
      .bl-ci-inner {
        max-width: 880px; margin: 0 auto; width: 100%;
        display: flex; flex-direction: column; gap: 28px;
      }

      /* Hero */
      .bl-ci-hero {
        background: #FFFFFF;
        border: 1px solid ${BORDER};
        border-radius: 24px;
        padding: 36px;
        display: flex; flex-direction: column; gap: 12px;
        text-align: center;
        align-items: center;
      }
      .bl-ci-eyebrow {
        padding: 4px 12px;
        background: ${TAG_BG};
        color: ${PERIWINKLE_HOVER};
        border-radius: 999px;
        font-size: 11px; font-weight: 500;
        letter-spacing: 0.06em; text-transform: uppercase;
      }
      .bl-ci-title {
        font-size: 36px; font-weight: 600; color: ${NAVY_DEEP};
        letter-spacing: -0.02em; line-height: 1.15; margin: 0;
      }
      .bl-ci-sub {
        font-size: 15px; line-height: 1.55; color: ${MUTED};
        margin: 0; max-width: 600px;
      }

      /* Section wrapper */
      .bl-ci-section {
        display: flex; flex-direction: column; gap: 14px;
      }
      .bl-ci-section-head { display: flex; flex-direction: column; gap: 4px; padding: 0 4px; }
      .bl-ci-section-title {
        font-size: 22px; font-weight: 600; color: ${NAVY_DEEP};
        margin: 0; letter-spacing: -0.01em;
      }
      .bl-ci-section-sub {
        font-size: 13px; color: ${MUTED}; margin: 0; line-height: 1.45;
      }

      /* Steps */
      .bl-ci-steps {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .bl-ci-step {
        background: #FFFFFF;
        border: 1px solid ${BORDER};
        border-radius: 16px;
        padding: 20px;
        display: flex; flex-direction: column; gap: 10px;
        position: relative;
      }
      .bl-ci-step-num {
        position: absolute; top: 16px; right: 16px;
        width: 28px; height: 28px;
        background: ${PERIWINKLE}; color: #FFFFFF;
        border-radius: 999px;
        font-size: 13px; font-weight: 600;
        display: inline-flex; align-items: center; justify-content: center;
      }
      .bl-ci-step-icon { width: 48px; height: 48px; object-fit: contain; }
      .bl-ci-step-title {
        font-size: 17px; font-weight: 600; color: ${NAVY_DEEP};
        margin: 0; letter-spacing: -0.005em;
      }

      /* Outcomes */
      .bl-ci-outcomes {
        display: grid;
        grid-template-columns: 1fr;
        gap: 14px;
      }
      .bl-ci-outcome {
        background: #FFFFFF;
        border: 1px solid ${BORDER};
        border-radius: 16px;
        padding: 20px 24px;
        position: relative;
        display: flex; flex-direction: column; gap: 12px;
      }
      .bl-ci-outcome-approved { border-left: 6px solid #2DAA63; }
      .bl-ci-outcome-flagged  { border-left: 6px solid #E07A2F; }
      .bl-ci-outcome-rejected { border-left: 6px solid #d92626; }
      .bl-ci-outcome-head {
        display: flex; align-items: center; gap: 12px;
      }
      .bl-ci-outcome-badge {
        width: 40px; height: 40px;
        border-radius: 12px;
        display: inline-flex; align-items: center; justify-content: center;
        color: #FFFFFF;
      }
      .bl-ci-outcome-approved .bl-ci-outcome-badge { background: #2DAA63; }
      .bl-ci-outcome-flagged  .bl-ci-outcome-badge { background: #E07A2F; }
      .bl-ci-outcome-rejected .bl-ci-outcome-badge { background: #d92626; }
      .bl-ci-outcome-title-wrap {
        display: flex; flex-direction: column; gap: 2px;
      }
      .bl-ci-outcome-title {
        font-size: 18px; font-weight: 600; color: ${NAVY_DEEP};
        margin: 0;
      }
      .bl-ci-outcome-subtitle {
        font-size: 12px; color: ${MUTED};
      }
      .bl-ci-outcome-summary {
        font-size: 13px; line-height: 1.5; color: ${NAVY_DEEP};
        margin: 0;
      }
      .bl-ci-outcome-summary strong { color: ${NAVY_DEEP}; }
      .bl-ci-outcome-next {
        background: ${TINT_BG};
        border-radius: 12px;
        padding: 12px 16px;
      }
      .bl-ci-outcome-next-title {
        display: block;
        font-size: 11px; font-weight: 600; color: ${MUTED};
        text-transform: uppercase; letter-spacing: 0.05em;
        margin-bottom: 6px;
      }

      /* Info grid (3 cards: timing / two-emails / what-gets-checked) */
      .bl-ci-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .bl-ci-info {
        background: #FFFFFF;
        border: 1px solid ${BORDER};
        border-radius: 16px;
        padding: 20px;
        display: flex; flex-direction: column; gap: 8px;
      }
      .bl-ci-info:last-child {
        grid-column: 1 / -1;
      }
      .bl-ci-info-icon {
        width: 36px; height: 36px;
        background: ${TAG_BG};
        color: ${PERIWINKLE_HOVER};
        border-radius: 10px;
        display: inline-flex; align-items: center; justify-content: center;
        margin-bottom: 2px;
      }
      .bl-ci-info-title {
        font-size: 15px; font-weight: 600; color: ${NAVY_DEEP};
        margin: 0; letter-spacing: -0.005em;
      }
      .bl-ci-info-text {
        font-size: 13px; line-height: 1.55; color: ${MUTED};
        margin: 0;
      }

      /* Bulleted lists (shared) */
      .bl-ci-bullets {
        margin: 0; padding-left: 18px;
        display: flex; flex-direction: column; gap: 6px;
        font-size: 13px; line-height: 1.5; color: ${NAVY_DEEP};
      }
      .bl-ci-bullets li::marker { color: ${PERIWINKLE}; }

      /* Tips (ordered list with periwinkle numbers) */
      .bl-ci-tips {
        background: #FFFFFF;
        border: 1px solid ${BORDER};
        border-radius: 16px;
        padding: 20px 28px;
        display: flex; flex-direction: column; gap: 10px;
        margin: 0; counter-reset: tip;
      }
      .bl-ci-tips li {
        list-style: none; counter-increment: tip;
        position: relative; padding-left: 36px;
        font-size: 14px; line-height: 1.5; color: ${NAVY_DEEP};
      }
      .bl-ci-tips li:before {
        content: counter(tip);
        position: absolute; left: 0; top: 0;
        width: 24px; height: 24px;
        background: ${PERIWINKLE}; color: #FFFFFF;
        border-radius: 999px;
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 600;
      }

      /* Need help card */
      .bl-ci-help {
        background: linear-gradient(135deg, ${PERIWINKLE}, ${PERIWINKLE_HOVER});
        color: #FFFFFF;
        border-radius: 20px;
        padding: 24px 28px;
        display: flex; align-items: flex-start; gap: 16px;
      }
      .bl-ci-help-icon {
        flex: 0 0 44px;
        width: 44px; height: 44px;
        background: rgba(255,255,255,0.18);
        border-radius: 12px;
        display: inline-flex; align-items: center; justify-content: center;
      }
      .bl-ci-help-text h3 {
        font-size: 20px; font-weight: 600; margin: 0 0 6px;
        letter-spacing: -0.01em;
      }
      .bl-ci-help-text p {
        font-size: 13px; line-height: 1.55;
        color: rgba(255,255,255,0.9);
        margin: 0;
      }

      /* Remember note */
      .bl-ci-remember {
        display: flex; align-items: flex-start; gap: 10px;
        padding: 14px 18px;
        background: ${TINT_BG};
        border-radius: 12px;
        font-size: 13px; line-height: 1.55; color: ${NAVY_DEEP};
        margin: 0;
      }
      .bl-ci-remember svg {
        flex: 0 0 14px;
        margin-top: 3px;
        color: ${PERIWINKLE_HOVER};
      }
      .bl-ci-remember strong { color: ${NAVY_DEEP}; }

      /* Footer */
      .bl-ci-footer {
        display: inline-flex; align-items: center; gap: 6px;
        margin: 12px auto 0;
        font-size: 11px; color: ${MUTED};
      }
      .bl-ci-footer img { height: 18px; width: auto; }

      /* Responsive */
      @media (max-width: 720px) {
        .bl-ci-title { font-size: 28px; }
        .bl-ci-steps { grid-template-columns: 1fr; }
        .bl-ci-grid { grid-template-columns: 1fr; }
        .bl-ci-info:last-child { grid-column: 1; }
        .bl-ci-hero { padding: 28px 20px; }
        .bl-ci-section-title { font-size: 18px; }
      }
    `}</style>
  );
}
