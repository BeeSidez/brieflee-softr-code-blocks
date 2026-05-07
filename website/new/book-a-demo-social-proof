// Marketing site — Social proof / customer logos.
// Sits at the bottom of /book-a-demo (below the hero + the Custom
// Code TidyCal embed block). Same 6 customer logos used on the
// pricing table (plan-trial / plan-marketing). Grayscaled at rest;
// hover restores full colour.

const CLD = "https://res.cloudinary.com/dchroynzv/image/upload";

const CUSTOMER_LOGOS = [
  { name: "Shopify", url: `${CLD}/brieflee_customer-logo_shopify-wordmark-with-bag-icon-grey_2026-05.png` },
  { name: "Shark",   url: `${CLD}/brieflee_customer-logo_shark-wordmark-black_2026-05.png` },
  { name: "Halara",  url: `${CLD}/brieflee_customer-logo_halara-wordmark-black_2026-05.png` },
  { name: "Cosrx",   url: `${CLD}/brieflee_customer-logo_cosrx-wordmark-black_2026-05.png` },
  { name: "Indeed",  url: `${CLD}/brieflee_customer-logo_indeed-wordmark-grey_2026-05.png` },
  { name: "Grubhub", url: `${CLD}/brieflee_customer-logo_grubhub-wordmark-with-house-fork-grey_2026-05.png` },
];

const BL_BG    = "#FAFBFF";
const BL_MUTED = "#6B7A99";

export default function Block() {
  return (
    <>
      <Style />
      <div className="bl-demo-proof-wrap">
        <div className="bl-demo-proof">
          <div className="bl-demo-proof-label">
            Trusted by top D2C growth teams and agencies
          </div>
          <div className="bl-demo-proof-strip">
            {CUSTOMER_LOGOS.map((l) => (
              <img
                key={l.name}
                src={l.url}
                alt={l.name}
                className="bl-demo-proof-logo"
                draggable={false}
              />
            ))}
          </div>
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
        .bl-demo-proof-wrap, .bl-demo-proof-wrap * { font-family: 'League Spartan', sans-serif; }

        .bl-demo-proof-wrap {
          background: ${BL_BG};
          padding: 32px 20px 72px;
        }
        .bl-demo-proof {
          max-width: 1080px;
          margin: 0 auto;
          text-align: center;
        }
        .bl-demo-proof-label {
          font-size: 12px;
          font-weight: 700;
          color: ${BL_MUTED};
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .bl-demo-proof-strip {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 36px;
          margin-top: 22px;
        }
        .bl-demo-proof-logo {
          height: 22px;
          width: auto;
          opacity: 0.7;
          filter: grayscale(1);
          transition: opacity 0.2s ease;
          user-select: none;
          -webkit-user-drag: none;
        }
        .bl-demo-proof-logo:hover { opacity: 1; }

        @media (max-width: 640px) {
          .bl-demo-proof-strip { gap: 24px; }
          .bl-demo-proof-logo  { height: 18px; }
        }
      `}
    </style>
  );
}
