// Marketing site — FAQ block for the pricing page.
//
// Replaces the native Softr FAQ block, whose questions were written for the
// 7-day trial and monthly billing. Both are gone, so four of the seven old
// questions no longer have a true answer.
//
// Anonymous block. No datasource, no useRecords, no useCurrentUser. Design
// tokens match marketing-v2.jsx so the two sit together on the same page.

import { useState } from "react";
import { NavigationAction } from "@/components/navigation-action";
import { useNavigationSetting } from "@/lib/editable-settings";

const GUARANTEE_DAYS = 30;
const CREDITS_PER_BRIEF = 5;
const CONTACT_URL = "/contact";

const FAQS = [
  {
    q: "What counts as a video credit?",
    a: (
      <>
        <p>
          One credit reviews one video against your brief. Every Review Agent you have
          switched on runs in that single pass, so checking hook speed, brand mentions,
          captions and everything else still costs one credit.
        </p>
        <p>
          Re-reviews work the same way. When a creator fixes something and resubmits, that
          check uses one more credit. There is no cap on how many times a video can come
          back round.
        </p>
      </>
    ),
  },
  {
    q: "What is a brief credit?",
    a: (
      <>
        <p>
          Brief credits cover writing briefs with AI. A brief written with the AI brief
          builder costs {CREDITS_PER_BRIEF} credits, so Creator covers four a month, Crew
          twelve and Studio thirty-six.
        </p>
        <p>
          Writing a brief yourself is free and always will be. Credits are only spent when
          the AI writes for you, and you can mix the two: write the sections you have a view
          on, let it draft the rest.
        </p>
      </>
    ),
  },
  {
    q: "What happens when I run out of credits?",
    a: (
      <>
        <p>
          You can top up without changing plan. Extra video credits come in packs from 50 to
          5,000 a month, and you keep them for as long as you want them.
        </p>
        <p>
          If you are topping up every month it is usually cheaper to move up a plan, and the
          per-video price drops as you go: $0.33 on Creator, $0.25 on Crew, $0.20 on Studio.
          We will tell you when that is the case rather than letting you overpay.
        </p>
      </>
    ),
  },
  {
    q: "Why is there no monthly plan?",
    a: (
      <>
        <p>
          Annual billing is what keeps the per-video price where it is. Rather than charge
          more for the flexibility, the {GUARANTEE_DAYS} day guarantee covers the risk: if it
          is not saving your team time, you get all of it back, no conditions.
        </p>
        <p>
          Programmes that need something different can talk to us. Above 2,000 reviews a month
          everything is priced to the programme anyway.
        </p>
      </>
    ),
  },
  {
    q: `How does the ${GUARANTEE_DAYS} day guarantee work?`,
    a: (
      <p>
        Use it properly for {GUARANTEE_DAYS} days. If it has not saved your team time, email us
        and you get a full refund. Not a prorated one, not credit against next year. You do not
        need to justify it and there is nothing to cancel first.
      </p>
    ),
  },
  {
    q: "Do I need a card to get started?",
    a: (
      <p>
        Yes. You pay for the year up front, which is what the guarantee is there to protect. You
        are never billed for something you have not agreed to, and card details are held by
        Stripe rather than by us.
      </p>
    ),
  },
  {
    q: "Can I add more users or brand profiles?",
    a: (
      <>
        <p>
          Yes, on any plan. Extra users are $12 a month each and extra brand profiles are $49 a
          month each. Both are billed monthly, so you can add one for a launch and drop it
          afterwards.
        </p>
        <p>
          Creators never need a user. They submit work and read feedback as guests, on every
          plan, with no limit on how many.
        </p>
      </>
    ),
  },
  {
    q: "Can I change plans or cancel any time?",
    a: (
      <p>
        Yes. Moving up takes effect straight away and you only pay the difference. If you cancel,
        you keep everything until the end of the period you have paid for rather than losing
        access the moment you click.
      </p>
    ),
  },
  {
    q: "What if we run more than 2,000 reviews a month?",
    a: (
      <p>
        That is a conversation rather than a checkout. Programmes at that volume get priced to
        the programme, and the per-review price keeps falling as it grows. Book a call and we
        will size it with you.
      </p>
    ),
  },
  {
    q: "What support do I get?",
    a: (
      <p>
        A 1-on-1 onboarding call on every plan, including Creator. We set up your first brand
        profile and your first brief with you, so the first review you run is on real work rather
        than a test.
      </p>
    ),
  },
];

const Svg = ({ size = 16, children, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>{children}</svg>
);
const I = {
  Chevron: (p) => <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>,
  Star:    (p) => <Svg {...p}><path d="M11.5 3.2a.6.6 0 0 1 1 0l2.3 4.7 5.1.7a.6.6 0 0 1 .3 1l-3.7 3.6.9 5.1a.6.6 0 0 1-.9.6L12 16.6l-4.6 2.4a.6.6 0 0 1-.9-.6l.9-5.1L3.7 9.7a.6.6 0 0 1 .3-1l5.1-.7z" /></Svg>,
  ArrowRight: (p) => <Svg {...p}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></Svg>,
};

export default function Block() {
  // Single-open accordion. null means everything is closed.
  const [openIndex, setOpenIndex] = useState(null);

  // Same setting as the plan block's Book a call: /book-call as a modal
  // over the pricing page.
  const enquiryLink = useNavigationSetting({
    name: "enquiry-link",
    label: "Book a call link",
    initialValue: {
      action: "OPEN_PAGE",
      destination: "/book-call",
      openIn: "MODAL",
      modalSize: "MD",
      modalType: "POPUP",
    },
  });

  return (
    <div className="faq-root">
      <Style />
      <div className="faq-page">
        <div className="faq-head">
          <span className="faq-eyebrow"><I.Star size={12} /> FAQ</span>
          <h2 className="faq-headline">Questions? We have answers.</h2>
          <p className="faq-sub">
            The things people ask before they buy. If yours is not here, ask us and we will answer it properly.
          </p>
        </div>

        <div className="faq-list">
          {FAQS.map((item, i) => {
            const open = openIndex === i;
            const panelId = "faq-panel-" + i;
            const btnId = "faq-btn-" + i;
            return (
              <div className={"faq-item" + (open ? " open" : "")} key={item.q}>
                <button
                  id={btnId}
                  className="faq-q"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(open ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="faq-chev" aria-hidden="true"><I.Chevron size={18} /></span>
                </button>
                <div className={"faq-a-wrap" + (open ? " open" : "")} id={panelId} role="region" aria-labelledby={btnId}>
                  <div className="faq-a">{item.a}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="faq-foot">
          <div>
            <strong>Still deciding?</strong>
            <span>Ask anything, or have us size it against the volume you actually run.</span>
          </div>
          <div className="faq-foot-actions">
            <a className="bl-btn bl-btn-secondary" href={CONTACT_URL}>Ask a question</a>
            <NavigationAction navigation={enquiryLink} className="bl-btn bl-btn-primary">Book a call <I.ArrowRight size={14} /></NavigationAction>
          </div>
        </div>
      </div>
    </div>
  );
}

function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

      .faq-root {
        --bl-blue:        #294ff6;
        --bl-blue-4:      #7a93ff;
        --bl-blue-5:      #879cf7;
        --bl-fg:          #001364;
        --bl-fg-body:     #333;
        --bl-fg-muted:    #555;
        --bl-page:        #fafbff;
        --bl-card:        #fff;
        --bl-light-1:     #f8fbff;
        --bl-light-2:     #eef4fd;
        --bl-border:      #d6defc;
        --bl-radius:      10px;
        --bl-radius-lg:   16px;
        --bl-radius-pill: 999px;
        --bl-shadow:      0 4px 14px -2px rgba(41,79,246,0.10), 0 2px 6px -2px rgba(0,19,100,0.06);
        --bl-ease:        cubic-bezier(0.32, 0.72, 0, 1);
        --bl-dur:         220ms;
        --faq-font:       'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        font-family: var(--faq-font);
        color: var(--bl-fg-body);
        background: var(--bl-page);
      }
      .faq-root *, .faq-root *::before, .faq-root *::after { box-sizing: border-box; }
      .faq-root, .faq-root * { font-family: var(--faq-font); }

      .faq-page { max-width: 800px; margin: 0 auto; padding: 64px 24px 72px; }
      .faq-head { text-align: center; margin-bottom: 36px; }

      .faq-eyebrow {
        display: inline-flex; align-items: center; gap: 6px;
        background: var(--bl-light-2); color: var(--bl-blue);
        font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
        padding: 6px 14px; border-radius: var(--bl-radius-pill);
        margin-bottom: 18px;
      }
      .faq-headline {
        font-size: 30px; line-height: 1.15; letter-spacing: -0.02em;
        font-weight: 800; color: var(--bl-fg); margin: 0 0 10px;
      }
      .faq-sub {
        color: var(--bl-fg-muted); font-size: 15.5px; line-height: 1.55;
        margin: 0 auto; max-width: 520px;
      }

      .faq-list {
        background: var(--bl-card);
        border: 1px solid var(--bl-border);
        border-radius: var(--bl-radius-lg);
        overflow: hidden;
      }
      .faq-item + .faq-item { border-top: 1px solid var(--bl-border); }
      .faq-item.open { background: var(--bl-light-1); }

      .faq-q {
        width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px;
        background: none; border: none; cursor: pointer; text-align: left;
        font: inherit; font-size: 16px; font-weight: 600; color: var(--bl-fg);
        padding: 20px 22px; line-height: 1.4;
        transition: color var(--bl-dur) var(--bl-ease);
      }
      .faq-q:hover { color: var(--bl-blue); }
      .faq-q:focus-visible { outline: 2px solid var(--bl-blue-5); outline-offset: -3px; border-radius: var(--bl-radius); }

      .faq-chev {
        flex-shrink: 0; display: flex; align-items: center; justify-content: center;
        width: 26px; height: 26px; border-radius: 50%;
        background: var(--bl-light-2); color: var(--bl-blue);
        transition: transform var(--bl-dur) var(--bl-ease), background var(--bl-dur) var(--bl-ease);
      }
      .faq-item.open .faq-chev { transform: rotate(180deg); background: var(--bl-blue); color: #fff; }

      /* grid-template-rows animates cleanly without measuring content height */
      .faq-a-wrap {
        display: grid; grid-template-rows: 0fr;
        transition: grid-template-rows var(--bl-dur) var(--bl-ease);
      }
      .faq-a-wrap.open { grid-template-rows: 1fr; }
      .faq-a-wrap > .faq-a { overflow: hidden; }
      .faq-a { padding: 0 22px; }
      .faq-a-wrap.open > .faq-a { padding-bottom: 22px; }
      .faq-a p {
        margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: var(--bl-fg-body);
      }
      .faq-a p:last-child { margin-bottom: 0; }

      .faq-foot {
        margin-top: 28px; padding: 22px 24px;
        background: var(--bl-light-1); border: 1px solid var(--bl-border);
        border-radius: var(--bl-radius-lg);
        display: flex; align-items: center; justify-content: space-between; gap: 20px;
      }
      .faq-foot strong { display: block; color: var(--bl-fg); font-size: 15.5px; margin-bottom: 3px; }
      .faq-foot span { font-size: 14px; color: var(--bl-fg-muted); line-height: 1.45; }
      .faq-foot-actions { display: flex; gap: 10px; flex-shrink: 0; }
      @media (max-width: 700px) {
        .faq-foot { flex-direction: column; align-items: stretch; }
        .faq-foot-actions { flex-direction: column; }
      }

      .bl-btn {
        display: inline-flex; align-items: center; justify-content: center;
        gap: 8px; font: inherit; font-weight: 600; font-size: 14.5px;
        padding: 12px 20px; border-radius: var(--bl-radius);
        border: none; cursor: pointer; text-decoration: none; white-space: nowrap;
        transition: transform var(--bl-dur) var(--bl-ease), box-shadow var(--bl-dur) var(--bl-ease), background var(--bl-dur) var(--bl-ease);
      }
      .bl-btn-primary {
        background: var(--bl-blue-5); color: #fff;
        box-shadow: 0 1px 0 0 rgba(255,255,255,0.4) inset, 0 4px 14px -2px rgba(135,156,247,0.45);
      }
      .bl-btn-primary:hover { background: var(--bl-blue-4); transform: translateY(-1px); }
      .bl-btn-secondary { background: var(--bl-card); color: var(--bl-fg); border: 1.5px solid var(--bl-border); }
      .bl-btn-secondary:hover { border-color: var(--bl-blue-5); }

      @media (prefers-reduced-motion: reduce) {
        .faq-root *, .faq-root *::before, .faq-root *::after { animation: none !important; transition: none !important; }
      }
    `}</style>
  );
}
