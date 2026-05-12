// Marketing site — BOOK A DEMO hero (top of /book-a-demo).
//
// Just the hero header. The TidyCal calendar embed sits BELOW this
// block as a separate Custom Code block (so the script can load
// reliably as raw HTML rather than via React injection). The
// customer-logo social-proof strip sits below that as
// website/new/book-a-demo-social-proof.
//
// SOFTR CONFIG REQUIRED:
//   No data binding. Drop on /book-a-demo, then add a Custom Code
//   block beneath it containing:
//     <div class="tidycal-embed" data-path="bevbanahene/brieflee-demo"></div>
//     <script src="https://asset-tidycal.b-cdn.net/js/embed.js" async></script>
//   Then add the book-a-demo-social-proof block at the bottom.

const BL_DEEP       = "#001364";
const BL_PERIWINKLE = "#879CF7";
const BL_MUTED      = "#6B7A99";
const BL_BG         = "#FAFBFF";

export default function Block() {
  return (
    <>
      <Style />
      <div className="bl-demo-hero-wrap">
        <div className="bl-demo-hero">
          <div className="bl-demo-pill">
            <span className="bl-demo-pill-dot" />
            Book a Demo
          </div>
          <h1 className="bl-demo-title">See Brieflee in action</h1>
          <p className="bl-demo-sub">
            30 minutes with the Brieflee team. We'll walk through your
            content workflow, answer your questions, and help you pick
            the right plan.
          </p>
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
        .bl-demo-hero-wrap, .bl-demo-hero-wrap * { font-family: 'League Spartan', sans-serif; }

        .bl-demo-hero-wrap {
          background: ${BL_BG};
          padding: 72px 20px 32px;
        }
        .bl-demo-hero {
          max-width: 680px;
          margin: 0 auto;
          text-align: center;
        }
        .bl-demo-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(135, 156, 247, 0.10);
          border: 1px solid rgba(135, 156, 247, 0.25);
          border-radius: 999px;
          color: ${BL_PERIWINKLE};
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 20px;
        }
        .bl-demo-pill-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${BL_PERIWINKLE};
        }
        .bl-demo-title {
          font-size: 48px;
          font-weight: 700;
          color: ${BL_DEEP};
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin: 0 0 18px;
        }
        @media (max-width: 720px) {
          .bl-demo-hero-wrap { padding: 48px 16px 24px; }
          .bl-demo-title { font-size: 32px; }
        }
        .bl-demo-sub {
          font-size: 16px;
          color: ${BL_MUTED};
          line-height: 1.6;
          margin: 0 auto;
          max-width: 540px;
        }
      `}
    </style>
  );
}
