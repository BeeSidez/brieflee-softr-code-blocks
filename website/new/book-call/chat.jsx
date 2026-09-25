import { useState, useRef, useEffect, useCallback } from "react";
import { datasource, useRecordCreate, useProxyFetch, q } from "@/lib/datasource";
import { toast } from "sonner";

/* ------------------------------------------------------------------ *
 * Book Call — brieflee.co/book-call
 *
 * The plain-form twin of the /book-a-demo chat. SAME eleven questions,
 * SAME options, SAME order, SAME routing, SAME CRM writes. Only the
 * interface differs, which is the whole point: it is an A/B on the
 * interface, not on the qualification.
 *
 * Anonymous visitors cannot update records in Softr, so this is
 * CREATE-ONLY, exactly like the chat:
 *   - one lead_event as soon as step 1 validates  -> catches drop-offs
 *   - one sales_pipeline row at the outcome       -> all eleven answers
 *
 * entry_point = "form" here, "chat" on /book-a-demo. That field is how
 * you count the test.
 *
 * This block had to be created fresh rather than reusing the old demo
 * hero on this page: a block Softr typed "dynamic" gates on a legacy
 * primary datasource that the API cannot complete, so any useRecord*
 * call throws "this block does not have a datasource configured" at
 * runtime no matter how the Source is wired.
 * ------------------------------------------------------------------ */

/* The dataSourceIds have to be the UUIDs Softr's renderer knows. Same
   two ids the /book-a-demo chat block uses. */
const ds = datasource.define({
  pipeline: "6170548f-955f-405e-b86d-d236de99d2ed",
  leadEvents: "cadd708d-2da8-4e22-b92f-cbb88635f148",
  emailit: "496dfc8e-8ac2-4892-9e29-1c6d670dba4d",
});

const pipelineFields = q.select({
  name: "RbQ6L",
  email: "ZwKcm",
  website: "3Fqfo",
  productUrl: "avY1t",
  businessModel: "TgI3c",
  makesContentForOthers: "05NWG",
  videosPerMonth: "2MnO2",
  whoFilms: "ieqNx",
  whoFilmsDetail: "1Uaac",
  revenueBand: "Wnljs",
  adSpendBand: "AN0Zx",
  decisionMakers: "4gvzX",
  timeline: "Dtszy",
  offBriefToday: "HJTGL",
  route: "oXCLD",
  stage: "WS67r",
  entryPoint: "Qp7lM",
  lastStepReached: "M9Ohl",
  createdAt: "DFH9L",
});

const eventFields = q.select({
  email: "KfXCh",
  source: "0tbOR",
  channel: "Stu4F",
  name: "wNiuC",
  pageUrl: "5GODb",
  landingPage: "CO6OA",
  utmSource: "enDXw",
  utmMedium: "DSAXX",
  utmCampaign: "o6blp",
  utmContent: "mDzib",
  payload: "hvB7E",
  submittedAt: "8ZeJj",
});

const SOURCE_BOOK_A_DEMO = "5af79932-3bf0-4191-81cf-8b4b192253b6";
const CHANNEL_PAID = "c82e4b4d-d516-46d0-9925-b05f6687964c";
const CHANNEL_DIRECT = "193ebada-395c-431a-938f-1826e38f9bf3";
const ENTRY_FORM = "fa97afba-db90-4c83-9ec3-4a16dacd0d39";

const STAGE = {
  Qualified: "f47893dc-ceee-47f4-bd34-cf05ec24f729",
  Nurture: "4a7713d9-761f-46a9-a882-a11c81a9eb92",
};

const ROUTE_ID: Record<string, string> = {
  A: "8de7ce20-eb33-4c7a-ab6e-a89de3d9e9c3",
  B: "ca3e7b56-79a5-4b07-97f9-a60d3c0fa319",
  C: "0fd1b480-e696-4e5e-95f9-b1f2bdeb3184",
  D: "2f2d9f40-0121-455a-bbb8-a696698ade62",
};

const ROUTE_STAGE: Record<string, string> = {
  A: STAGE.Qualified,
  B: STAGE.Qualified,
  C: STAGE.Qualified,
  D: STAGE.Nurture,
};

/* Answer label -> SELECT option id, per question. The visitor-facing
   wording and the CRM's choice labels differ in a few places, so the
   ids are the contract, never the text. Identical to the chat block. */
const OPTION_ID = {
  model: {
    "Content or UGC creator": "3b5ee15d-f4db-45b2-a821-bd33d8b2d3aa",
    Agency: "f5fa0a20-4da9-4b11-8d82-f331c2bdb4cc",
    "Info, training or consulting": "1762ec28-d3f2-45c5-9866-d3cf7f2248f2",
    "E-commerce": "f0ba51d6-fc8f-45be-bd33-c7fcda4a1c03",
    "SaaS B2B": "23d41704-a317-410e-ae66-fb7211830718",
    "SaaS B2C": "e2034ffa-4a04-4d0e-8e49-8db4fb8ac88e",
    Mixed: "dcbf67da-998c-4525-8231-6b3236022f57",
  },
  clients: {
    "Other brands": "61492f81-2d31-47be-ac6a-0e1e18295360",
    "Only my own": "dc4eaf6e-f95f-46ec-a325-b3dcc76d00b7",
    Both: "dd0789d0-5468-4584-a75c-90176022c889",
  },
  volume: {
    "Under 30": "2136df4b-3c27-4325-b92c-9397b7b73942",
    "30 to 100": "cb58e9f5-8b57-40e1-b2d2-0732a9c72f56",
    "100 to 750": "85c79381-b949-4a18-9bbf-e2558353b357",
    "750 to 2,000": "8a48cc92-9fa7-41a2-8991-024c79c5e3c9",
    "More than 2,000": "e80c2f2b-d3e3-43f6-a13f-5354d01454fb",
  },
  films: {
    "Affiliates who find you": "a89f5020-9ea8-4dc2-82c4-ccef92b731be",
    "Creators you brief": "f9aad79c-68d8-4c79-8f5d-dd8acb27c9c2",
    "Your own team": "1f0b54ef-f4c3-446a-8f77-e4c894bb9a97",
    "A mix": "9c23dbb5-7e48-4f22-b1a4-8865ad1dc9a2",
  },
  revenue: {
    "Under £5k": "4a61717d-b6b9-48bb-a69c-7f40abb8a253",
    "£5k to £25k": "c4e949d9-4c5d-413c-aefb-a2b4d189225b",
    "£25k to £100k": "8ce5ba56-6120-4d66-ba98-15c692e7de81",
    "£100k to £500k": "4b2d6dc1-8074-4b59-963a-a92b6a52becc",
    "More than £500k": "d1cd31e4-84d0-4406-85bf-7b9e82b06b71",
  },
  spend: {
    "Nothing yet": "65918fd5-1137-4c85-a7e1-6df38efd43ad",
    "Under £2k": "3fae433e-8392-416a-b169-46765d768f87",
    "£2k to £10k": "20660564-c9cb-4464-b616-0944156c5224",
    "£10k to £50k": "9376f003-aed9-4cdd-8436-1675eaa217e3",
    "More than £50k": "ed9c5985-49cf-4e87-8cb0-e89fc1abde69",
  },
  authority: {
    "Just me": "6652a3a2-9a4d-4dbc-86bf-b4754ab7516f",
    "Me and one other": "fc2f37e4-0836-42af-9f3a-9c9aaeb4f173",
    "A team or client signs off": "a20f6cf2-1679-4cc1-8c4e-5d5ef702e362",
  },
  timeline: {
    "Starting today": "5f7c7e55-d590-439c-9e26-fbec95304e94",
    "Within 30 days": "76874104-38c7-498c-bf7f-c14638627850",
    "30 days or more": "b4716fd3-83a0-4377-b96b-f68767baeb76",
    "Next quarter or later": "14df1451-bbec-42e8-87e2-37c9bd85c63d",
  },
};

/* Softr marks a block's Source "complete" only when a human picks the
   table in Studio's Source tab. The API can attach the tables but not
   set that flag, so until someone opens that tab useRecordCreate
   throws during render and takes the whole page down with it.
   Catching it lets the form render and simply not save; the moment the
   Source is wired, the same code starts writing with no edit. Hook
   order stays stable, since within one mount it either always throws
   or never does. */
const NO_WRITER: any = { enabled: false, mutateAsync: async () => undefined };

/* "Who films them?" is the /claim form's version: seven creator types,
   multi-select. The CRM keeps both. who_films_detail stores everything
   they picked; who_films keeps the single four-way value, because the
   routing below and the `qualified` formula on the table both read it. */
const FILMS_OPTIONS = [
  "TikTok Affiliates",
  "Affiliates (Other)",
  "UGC Creators",
  "Influencer",
  "Customers",
  "Employees",
  "Content creators",
];

const FILMS_DETAIL_ID: Record<string, string> = {
  "TikTok Affiliates": "20bf5cb7-22bb-4a53-a9b2-418628b8f42f",
  "Affiliates (Other)": "82bd2e99-4763-4e34-9f18-3631b3de289a",
  "UGC Creators": "b2d00abb-0cba-44f9-b8b5-3dea9e273b61",
  Influencer: "fbee947d-0283-4cc3-a4e5-117611d1d710",
  Customers: "87e16b15-30a5-4ac5-b566-0f6e89df6d67",
  Employees: "3ced454e-84d2-41e2-806b-ab8c1876a7e4",
  "Content creators": "f9fa1fea-4104-43ed-ae81-922db8dacd15",
};

/* Which bucket each of the seven falls into. Pick from more than one
   bucket and it resolves to "A mix". */
const FILMS_BUCKET: Record<string, string> = {
  "TikTok Affiliates": "Affiliates who find you",
  "Affiliates (Other)": "Affiliates who find you",
  "UGC Creators": "Creators you brief",
  Influencer: "Creators you brief",
  Customers: "Creators you brief",
  "Content creators": "Creators you brief",
  Employees: "Your own team",
};

function filmsBucket(picked: any): string {
  const list = Array.isArray(picked) ? picked : [];
  const buckets: string[] = [];
  list.forEach((p: string) => {
    const b = FILMS_BUCKET[p];
    if (b && buckets.indexOf(b) < 0) buckets.push(b);
  });
  if (!buckets.length) return "";
  return buckets.length > 1 ? "A mix" : buckets[0];
}

// ONE call for everyone, 45 minutes. There used to be two booking types here,
// a 30-minute demo and a 45-minute enterprise call, and the qualifier decided
// which one you were offered (or, on route D, whether you were offered one at
// all). The qualifier still runs and still routes the lead in the CRM, so lead
// quality is recorded exactly as before — it just no longer decides who is
// allowed to book.
//
// The 45 minutes is a property of this booking type in TidyCal, not of this
// code. If that booking is still set to 45 minutes, people get 30.
const TIDYCAL_CALL = "https://tidycal.com/bevbanahene/brieflee-demo";
const BRIEF_GENERATOR = "https://www.brieflee.co/free-tool-ai-brief-generator";

/* ---- EmailIt ------------------------------------------------------
 * Wired and ready, sending nothing. Flip EMAIL_ON to true and fill in
 * the three constants below and every completed form sends its own
 * confirmation, once, right after the pipeline row is written.
 * `from` must be a verified sender and must never be left blank.
 * ------------------------------------------------------------------ */
const EMAIL_ON: boolean = false;
const EMAIL_FROM = "Brieflee <support@brieflee.co>";
const EMAIL_SUBJECT = "Your Brieflee demo";
const emailHtml = (name: string) =>
  `<p>Hi ${name || "there"},</p><p>Your answers are in. Pick a time here: <a href="${TIDYCAL_CALL}">${TIDYCAL_CALL}</a></p>`;

/* The customer-logo strip is its own block further down this page
   (hrid ai2). Nothing here duplicates it. */

const VOLUME = ["Under 30", "30 to 100", "100 to 750", "750 to 2,000", "More than 2,000"];
const REVENUE = ["Under £5k", "£5k to £25k", "£25k to £100k", "£100k to £500k", "More than £500k"];
const SPEND = ["Nothing yet", "Under £2k", "£2k to £10k", "£10k to £50k", "More than £50k"];
const TIMELINE = ["Starting today", "Within 30 days", "30 days or more", "Next quarter or later"];

const OFFBRIEF_CHIPS = [
  "We re-shoot it",
  "We let it run anyway",
  "We fix it in the edit",
  "We send notes and hope",
  "Something else",
];

function hostOf(raw: string): string {
  const s = String(raw || "").trim().toLowerCase();
  if (!s) return "";
  const host = s.replace(/^[a-z][a-z0-9+.-]*:\/\//, "").replace(/^www\./, "").split(/[/?#]/)[0];
  return host && host.includes(".") ? host : "";
}

function buildQuestions(brand: string): any[] {
  const them = brand || "the business";
  return [
    {
      id: "contact",
      kind: "fields",
      text: "What's your name and work email?",
      fields: [
        { key: "name", label: "Full name", ph: "Your name", type: "text" },
        { key: "email", label: "Work email", ph: "you@yourbrand.com", type: "email" },
      ],
    },
    {
      id: "urls",
      kind: "fields",
      text: "What's your website and one product page?",
      hint: "We'll build the demo brief on it.",
      fields: [
        { key: "website", label: "Website", ph: "yourbrand.com", type: "text" },
        { key: "product", label: "One product or feature URL", ph: "yourbrand.com/products/…", type: "text" },
      ],
    },
    {
      id: "model",
      kind: "options",
      text: "Which is closest to your business?",
      options: [
        "Content or UGC creator",
        "Agency",
        "Info, training or consulting",
        "E-commerce",
        "SaaS B2B",
        "SaaS B2C",
        "Mixed",
      ],
    },
    {
      id: "clients",
      kind: "options",
      text: "Do you make content for other brands, or only your own?",
      options: ["Other brands", "Only my own", "Both"],
    },
    {
      id: "volume",
      kind: "options",
      text: brand
        ? `How many creator videos a month for ${brand}?`
        : "How many creator videos a month?",
      options: VOLUME,
    },
    {
      id: "films",
      kind: "squares",
      text: "Who films them?",
      hint: "Pick every one you work with.",
      options: FILMS_OPTIONS,
    },
    {
      id: "revenue",
      kind: "options",
      text: `What does ${them} turn over a month?`,
      hint: "A ballpark is fine.",
      options: REVENUE,
    },
    {
      id: "spend",
      kind: "options",
      text: brand ? `What does ${brand} spend on ads a month?` : "What do you spend on ads a month?",
      options: SPEND,
    },
    {
      id: "authority",
      kind: "options",
      text: "Who else is involved in this decision?",
      options: ["Just me", "Me and one other", "A team or client signs off"],
    },
    {
      id: "timeline",
      kind: "options",
      text: "When will you be briefing creators?",
      options: TIMELINE,
    },
    {
      id: "offbrief",
      kind: "text",
      text: "What happens when a video comes back off-brief?",
      hint: "Pick one and edit it, or write your own.",
      optional: true,
    },
  ];
}

function routeFor(a: any): string {
  const vol = VOLUME.indexOf(a.volume);
  const rev = REVENUE.indexOf(a.revenue);
  const spend = SPEND.indexOf(a.spend);
  const time = TIMELINE.indexOf(a.timeline);
  const agencyWide = a.model === "Agency" && (a.clients === "Other brands" || a.clients === "Both");

  if (vol === 4 || (agencyWide && vol >= 3)) return "B";
  const need = vol >= 1 && filmsBucket(a.films) !== "Your own team";
  const budget = rev >= 1 || spend >= 2;
  const authority = a.authority === "Just me" || a.authority === "Me and one other";
  const timeline = time === 0 || time === 1;
  if (need && budget && authority && timeline) return "A";
  if (time === 3 || (rev <= 0 && spend <= 0)) return "D";
  return "C";
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function Check({ size = 13, weight = 3.4 }: { size?: number; weight?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function Block() {
  const [answers, setAnswers] = useState<any>({});
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState("fwd");
  const [view, setView] = useState("form");
  const [route, setRoute] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [booked, setBooked] = useState(false);

  /* Read the URL once, inside a lazy initialiser. Reading
     window.location anywhere else in a block that also creates records
     stops Softr's analyzer registering the create. */
  const [ctx] = useState(() => {
    const blank = {
      utmSource: "", utmMedium: "", utmCampaign: "", utmContent: "", utmTerm: "",
      gclid: "", fbclid: "", ttclid: "", referrer: "", landingPage: "", pageUrl: "",
      modal: false,
    };
    if (typeof window === "undefined") return blank;
    try {
      const p = new URLSearchParams(window.location.search);
      const get = (k: string) => (p.get(k) || "").slice(0, 200);
      return {
        utmSource: get("utm_source"),
        utmMedium: get("utm_medium"),
        utmCampaign: get("utm_campaign"),
        utmContent: get("utm_content"),
        utmTerm: get("utm_term"),
        gclid: get("gclid"),
        fbclid: get("fbclid"),
        ttclid: get("ttclid"),
        referrer: (document.referrer || "").slice(0, 300),
        landingPage: (window.location.pathname + window.location.search).slice(0, 300),
        pageUrl: window.location.href.slice(0, 300),
        /* Modal mode drops the page header and the full-height frame so
           the card sits inside Softr's overlay. Driven by the query
           param alone: an "am I in an iframe" check also fires inside
           Studio's own preview, which is not a modal. */
        modal: p.get("modal") === "1",
      };
    } catch (e) {
      return blank;
    }
  });

  let createEvent: any = NO_WRITER;
  try {
    createEvent = useRecordCreate({ from: ds.leadEvents, fields: eventFields });
  } catch (e) {
    createEvent = NO_WRITER;
  }
  let sendMail: any = null;
  try {
    sendMail = useProxyFetch(ds.emailit);
  } catch (e) {
    sendMail = null;
  }

  let createRow: any = NO_WRITER;
  try {
    createRow = useRecordCreate({
      from: ds.pipeline,
      fields: pipelineFields,
      onError: () =>
        toast.error("We couldn't save your answers. Email support@brieflee.co and we'll pick it up."),
    });
  } catch (e) {
    createRow = NO_WRITER;
  }

  /* The mutation objects are new on every render, so hold them in refs. */
  const createEventRef = useRef(createEvent);
  createEventRef.current = createEvent;
  const createRowRef = useRef(createRow);
  createRowRef.current = createRow;

  const sendMailRef = useRef(sendMail);
  sendMailRef.current = sendMail;

  const eventSent = useRef(false);
  const rowSaved = useRef(false);
  const mailSent = useRef(false);
  const live = useRef<any>({});

  const brand = hostOf((answers.urls || {}).website);
  const questions = buildQuestions(brand);
  const total = questions.length;
  const q0 = questions[Math.min(step, total - 1)];
  const answer = answers[q0.id];

  live.current = { answers, route };

  const valid = () => {
    if (q0.kind === "options") return !!answer;
    if (q0.kind === "squares") return Array.isArray(answer) && answer.length > 0;
    if (q0.kind === "text") return true;
    if (q0.id === "contact") {
      const v = answer || {};
      return String(v.name || "").trim().length > 1 && /.+@.+\..+/.test(String(v.email || "").trim());
    }
    if (q0.id === "urls") return String((answer || {}).website || "").trim().length > 3;
    return true;
  };

  /* One thin lead_event the moment we have a name and an email, so a
     visitor who leaves at question 7 is still a lead with attribution. */
  const sendEvent = useCallback(
    (contact: any) => {
      const writer = createEventRef.current;
      if (eventSent.current || !writer.enabled) return;
      eventSent.current = true;
      const paid =
        !!ctx.gclid || !!ctx.fbclid || !!ctx.ttclid || /cpc|paid|ppc/i.test(ctx.utmMedium);
      const body: any = {
        email: String(contact.email || "").trim(),
        source: SOURCE_BOOK_A_DEMO,
        channel: paid ? CHANNEL_PAID : CHANNEL_DIRECT,
        name: String(contact.name || "").trim(),
        pageUrl: ctx.pageUrl,
        landingPage: ctx.landingPage,
        submittedAt: new Date().toISOString(),
        payload: JSON.stringify({
          flow: "book-call-form",
          utm_term: ctx.utmTerm,
          gclid: ctx.gclid,
          fbclid: ctx.fbclid,
          ttclid: ctx.ttclid,
          referrer: ctx.referrer,
        }),
      };
      if (ctx.utmSource) body.utmSource = ctx.utmSource;
      if (ctx.utmMedium) body.utmMedium = ctx.utmMedium;
      if (ctx.utmCampaign) body.utmCampaign = ctx.utmCampaign;
      if (ctx.utmContent) body.utmContent = ctx.utmContent;

      writer.mutateAsync(body).catch(() => {
        eventSent.current = false;
      });
    },
    [ctx]
  );

  /* One sales_pipeline row, written once, at the outcome. */
  const savePipeline = useCallback(() => {
    const writer = createRowRef.current;
    if (rowSaved.current || !writer.enabled) return;
    const s = live.current;
    if (!s.route) return;
    const a = s.answers || {};
    const contact = a.contact || {};
    const urls = a.urls || {};
    if (!String(contact.email || "").trim()) return;

    rowSaved.current = true;

    const body: any = {
      name: String(contact.name || "").trim(),
      email: String(contact.email || "").trim(),
      route: ROUTE_ID[s.route],
      stage: ROUTE_STAGE[s.route],
      entryPoint: ENTRY_FORM,
      lastStepReached: 11,
      createdAt: new Date().toISOString(),
    };
    const put = (key: string, value: any) => {
      if (value) body[key] = value;
    };
    put("website", String(urls.website || "").trim());
    put("productUrl", String(urls.product || "").trim());
    put("businessModel", OPTION_ID.model[a.model]);
    put("makesContentForOthers", OPTION_ID.clients[a.clients]);
    put("videosPerMonth", OPTION_ID.volume[a.volume]);
    put("whoFilms", OPTION_ID.films[filmsBucket(a.films)]);
    const detail = (Array.isArray(a.films) ? a.films : [])
      .map((f: string) => FILMS_DETAIL_ID[f])
      .filter(Boolean);
    if (detail.length) body.whoFilmsDetail = detail;
    put("revenueBand", OPTION_ID.revenue[a.revenue]);
    put("adSpendBand", OPTION_ID.spend[a.spend]);
    put("decisionMakers", OPTION_ID.authority[a.authority]);
    put("timeline", OPTION_ID.timeline[a.timeline]);
    put("offBriefToday", String(a.offbrief || "").trim());

    writer.mutateAsync(body).catch(() => {
      rowSaved.current = false;
    });
  }, []);

  /* One confirmation email, once, after the answers are safely stored. */
  const sendConfirmation = useCallback(() => {
    if (!EMAIL_ON || mailSent.current) return;
    const send = sendMailRef.current;
    if (!send) return;
    const c = (live.current.answers || {}).contact || {};
    const to = String(c.email || "").trim();
    if (!to) return;
    mailSent.current = true;
    send("https://api.emailit.com/v2/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to,
        subject: EMAIL_SUBJECT,
        html: emailHtml(String(c.name || "").trim()),
      }),
    }).catch(() => {
      mailSent.current = false;
    });
  }, []);

  useEffect(() => {
    if (view !== "outcome" || !route) return;
    savePipeline();
    sendConfirmation();
  }, [view, route, savePipeline, sendConfirmation]);

  useEffect(() => {
    if (ctx.modal) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view, ctx.modal]);

  const setField = (qid: string, key: string, value: string) =>
    setAnswers((prev: any) => ({ ...prev, [qid]: { ...(prev[qid] || {}), [key]: value } }));

  const setAnswer = (qid: string, value: string) =>
    setAnswers((prev: any) => ({ ...prev, [qid]: value }));

  const finish = (a: any) => {
    const r = routeFor(a);
    live.current = { answers: a, route: r };
    setRoute(r);
    setView("outcome");
  };

  const goNext = () => {
    if (!valid()) {
      setTouched(true);
      return;
    }
    if (step === 0) sendEvent(answers.contact || {});
    if (step >= total - 1) {
      finish(answers);
      return;
    }
    setTouched(false);
    setDir("fwd");
    setStep(step + 1);
  };

  const goBack = () => {
    if (step === 0) return;
    setTouched(false);
    setDir("back");
    setStep(step - 1);
  };

  /* Selecting an option answers and moves on. Pointer only: keyboard
     selection should not yank the screen out from under you. */
  const pick = (qid: string, value: string, viaPointer: boolean) => {
    const next = { ...answers, [qid]: value };
    setAnswers(next);
    if (!viaPointer) return;
    window.setTimeout(() => {
      if (step >= total - 1) {
        finish(next);
        return;
      }
      setDir("fwd");
      setStep((s) => s + 1);
    }, 240);
  };

  /* Squares are multi-select, so they toggle and never auto-advance. */
  const toggle = (qid: string, value: string) => {
    setAnswers((prev: any) => {
      const cur = Array.isArray(prev[qid]) ? prev[qid] : [];
      const next = cur.indexOf(value) > -1 ? cur.filter((x: string) => x !== value) : cur.concat([value]);
      return { ...prev, [qid]: next };
    });
  };

  const restart = () => {
    eventSent.current = false;
    rowSaved.current = false;
    mailSent.current = false;
    setAnswers({});
    setRoute(null);
    setBooked(false);
    setTouched(false);
    setStep(0);
    setDir("back");
    setView("form");
  };

  const onKey = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goNext();
    }
  };

  const contact = answers.contact || {};
  const calendarUrl = (base: string) => {
    const nm = String(contact.name || "").trim();
    const em = String(contact.email || "").trim();
    const parts: string[] = [];
    if (nm) parts.push(`name=${encodeURIComponent(nm)}`);
    if (em) parts.push(`email=${encodeURIComponent(em)}`);
    return parts.length ? `${base}?${parts.join("&")}` : base;
  };

  const brandLabel = brand || "your product";
  const ok = valid();
  const emailShaped = /.+@.+\..+/.test(String(contact.email || "").trim());

  const fieldStyle: any = {
    width: "100%", padding: "12px 14px", borderRadius: 11, border: 0, fontSize: 15, fontWeight: 600,
    fontFamily: "inherit", color: "#001364", background: "rgba(255,255,255,0.75)",
    boxShadow: "0 0 0 1px rgba(0,19,100,0.12) inset", outline: "none",
  };

  const shellStyle: any = ctx.modal
    ? { width: "100%", display: "flex", justifyContent: "center", background: "transparent", padding: "8px 12px 20px" }
    : {
        width: "100%", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(135,156,247,0.3) 0%, rgba(180,192,245,0.12) 45%, rgba(180,192,245,0) 78%), #FAFBFF",
        padding: "clamp(32px,5vw,72px) clamp(20px,4vw,40px)",
      };

  return (
    <div className="bkc" style={{ fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: "#001364", background: ctx.modal ? "transparent" : "#FAFBFF" }}>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700&display=swap');
@property --bkc-angle{syntax:'<angle>';initial-value:0deg;inherits:false}
@keyframes bkcRotate{to{--bkc-angle:360deg}}
@keyframes bkcRise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes bkcSlideFwd{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}
@keyframes bkcSlideBack{from{opacity:0;transform:translateX(-32px)}to{opacity:1;transform:translateX(0)}}
@keyframes bkcFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.bkc *,.bkc *::before,.bkc *::after{box-sizing:border-box}
.bkc a{text-decoration:none}
.bkc-balance{text-wrap:balance}
.bkc-glass{position:relative;border-radius:28px;background:linear-gradient(135deg,rgba(255,255,255,0.55) 0%,rgba(244,246,255,0.38) 55%,rgba(236,240,255,0.28) 100%);backdrop-filter:blur(24px) saturate(200%);-webkit-backdrop-filter:blur(24px) saturate(200%);box-shadow:0 1px 0 0 rgba(255,255,255,0.95) inset,1px 0 0 0 rgba(255,255,255,0.55) inset,0 -1px 0 0 rgba(0,19,100,0.08) inset,0 24px 48px -14px rgba(0,19,100,0.22)}
.bkc-glass::before{content:'';position:absolute;inset:0;border-radius:inherit;padding:2px;background:conic-gradient(from var(--bkc-angle,0deg),rgba(135,156,247,0.18) 0deg,rgba(135,156,247,0.18) 200deg,rgba(135,156,247,0.85) 250deg,#ffffff 280deg,rgba(135,156,247,0.85) 310deg,rgba(135,156,247,0.18) 360deg);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;animation:bkcRotate 3.5s linear infinite}
.bkc-cta{display:inline-flex;align-items:center;gap:10px;padding:13px 22px;border-radius:12px;cursor:pointer;border:0;background:linear-gradient(180deg,#4A6BF7 0%,#294FF6 100%);color:#fff !important;font-size:15px;font-weight:700;font-family:inherit;box-shadow:0 2px 0 rgba(0,19,100,0.18),0 16px 32px -12px rgba(41,79,246,0.58);transition:transform 250ms cubic-bezier(0.32,0.72,0,1)}
.bkc-cta:hover{transform:translateY(-2px);color:#fff}
.bkc-cta:disabled{cursor:not-allowed;background:rgba(0,19,100,0.1);color:rgba(0,19,100,0.4) !important;box-shadow:none}
.bkc-cta:disabled:hover{transform:none}
.bkc-dot{width:8px;height:8px;border-radius:50%;background:#879CF7;box-shadow:0 0 0 3px rgba(135,156,247,0.2)}
.bkc-eyebrow{display:inline-flex;align-items:center;gap:8px;padding:6px 12px;background:rgba(135,156,247,0.16);color:#001364;font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;border-radius:999px}
.bkc-tile{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-radius:11px;cursor:pointer;border:0;width:100%;text-align:left;font-family:inherit;font-size:14.5px;font-weight:700;letter-spacing:-0.01em;color:#001364;transition:all 220ms cubic-bezier(0.32,0.72,0,1)}
.bkc-tile:hover{transform:translateY(-1px)}
.bkc-tick{width:21px;height:21px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none;transition:all 220ms cubic-bezier(0.32,0.72,0,1)}
.bkc-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:20px}
.bkc-sq{position:relative;flex:0 0 calc(25% - 6px);height:44px;border-radius:11px;border:0;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:5px;text-align:center;padding:8px 7px;font-size:11.5px;font-weight:700;letter-spacing:-0.01em;line-height:1.2;color:#001364;transition:all 220ms cubic-bezier(0.32,0.72,0,1)}
.bkc-sq:hover{transform:translateY(-2px)}
.bkc-sq-tick{width:14px;height:14px;border-radius:4px;flex:none;display:flex;align-items:center;justify-content:center;transition:all 220ms cubic-bezier(0.32,0.72,0,1)}
@media (max-width:640px){.bkc-sq{flex:0 0 calc(50% - 4px);font-size:12.5px}}
.bkc-chip{padding:7px 12px;border-radius:999px;border:0;cursor:pointer;font-family:inherit;font-size:12.5px;font-weight:700;color:#001364;background:rgba(255,255,255,0.7);box-shadow:0 0 0 1px rgba(0,19,100,0.1) inset;transition:all 200ms cubic-bezier(0.32,0.72,0,1)}
.bkc-chip:hover{transform:translateY(-1px);background:#fff}
.bkc-step-fwd{animation:bkcSlideFwd 340ms cubic-bezier(0.32,0.72,0,1) both}
.bkc-step-back{animation:bkcSlideBack 340ms cubic-bezier(0.32,0.72,0,1) both}
.bkc-fadeup{animation:bkcFadeUp 320ms cubic-bezier(0.32,0.72,0,1) both}
.bkc-q{margin:0;font-size:22px;line-height:1.2;font-weight:700;letter-spacing:-0.02em;color:#001364;text-wrap:balance}
.bkc-qsub{margin:7px 0 0;font-size:13.5px;line-height:1.45;font-weight:500;color:#001364;opacity:0.65}
.bkc-qfoot{margin-top:auto;padding-top:20px}
.bkc-label{display:block;font-size:12px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;color:#001364;opacity:0.55;margin:0 0 7px 2px}
.bkc-field:focus{box-shadow:0 0 0 2px #879CF7 inset !important;background:#fff !important}
.bkc-row{display:flex;gap:10px;align-items:baseline}
@media (max-width:640px){.bkc-q{font-size:19px}}
      `}</style>

      <div style={shellStyle}>
        <div style={{ width: "100%", maxWidth: 640, animation: "bkcRise 380ms cubic-bezier(0.32,0.72,0,1) both" }}>

          {view === "form" && (
            <>
              {!ctx.modal && (
                <div style={{ textAlign: "center", marginBottom: 22 }}>
                  <div className="bkc-eyebrow"><span className="bkc-dot" />11 questions, about 90 seconds</div>
                  <h1 className="bkc-balance" style={{ margin: "16px 0 0", fontSize: "clamp(27px,3.2vw,38px)", lineHeight: 1.08, fontWeight: 800, letterSpacing: "-0.03em", color: "#001364" }}>
                    Book a demo with our team
                  </h1>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button type="button" onClick={goBack} disabled={step === 0} aria-label="Back" style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: step === 0 ? "default" : "pointer", border: 0, opacity: step === 0 ? 0.35 : 1, background: "rgba(255,255,255,0.8)", boxShadow: "0 0 0 1px rgba(0,19,100,0.12) inset" }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#001364" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>
                <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(0,19,100,0.09)", overflow: "hidden" }}>
                  <div style={{ width: ((step + 1) / total) * 100 + "%", height: "100%", borderRadius: 999, background: "#879CF7", transition: "width 380ms cubic-bezier(0.32,0.72,0,1)" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#001364", opacity: 0.6, whiteSpace: "nowrap" }}>{step + 1} of {total}</span>
              </div>

              <div className="bkc-glass" style={{ marginTop: 18, borderRadius: 22, padding: "clamp(22px,2.4vw,30px)", minHeight: 316, display: "flex", flexDirection: "column" }}>
                <div key={step} className={dir === "back" ? "bkc-step-back" : "bkc-step-fwd"} style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
                  <h2 className="bkc-q">{q0.text}</h2>
                  {q0.hint && <p className="bkc-qsub">{q0.hint}</p>}

                  {q0.kind === "fields" && (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 22 }}>
                        {q0.fields.map((f: any, i: number) => (
                          <div key={f.key}>
                            <label className="bkc-label" htmlFor={`bkc-${q0.id}-${f.key}`}>{f.label}</label>
                            <input
                              id={`bkc-${q0.id}-${f.key}`}
                              className="bkc-field"
                              style={fieldStyle}
                              type={f.type}
                              value={(answer || {})[f.key] || ""}
                              onChange={(e) => setField(q0.id, f.key, e.target.value)}
                              onKeyDown={onKey}
                              placeholder={f.ph}
                              autoFocus={i === 0}
                            />
                          </div>
                        ))}
                      </div>
                      {touched && !ok && (
                        <p style={{ margin: "12px 2px 0", fontSize: 13.5, fontWeight: 600, color: "#b31711" }}>
                          {q0.id === "contact"
                            ? emailShaped ? "We need your name too." : "We need a name and a work email."
                            : "We need your website."}
                        </p>
                      )}
                      <div className="bkc-qfoot">
                        <button type="button" className="bkc-cta" style={{ display: "flex", justifyContent: "center", width: "100%" }} disabled={!ok} onClick={goNext}>Continue<Arrow /></button>
                      </div>
                    </>
                  )}

                  {q0.kind === "options" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
                      {q0.options.map((label: string) => {
                        const on = answer === label;
                        return (
                          <button
                            key={label}
                            type="button"
                            className="bkc-tile"
                            onClick={(e) => pick(q0.id, label, e.detail > 0)}
                            style={on
                              ? { background: "#ffffff", boxShadow: "0 0 0 2px #879CF7 inset,0 12px 26px -12px rgba(135,156,247,0.45)" }
                              : { background: "rgba(255,255,255,0.62)", boxShadow: "0 0 0 1px rgba(0,19,100,0.12) inset" }}
                          >
                            <span>{label}</span>
                            <span className="bkc-tick" style={on ? { background: "#879CF7", color: "#fff" } : { background: "rgba(0,19,100,0.06)", color: "rgba(0,19,100,0)" }}>
                              <Check />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {q0.kind === "squares" && (
                    <>
                      <div className="bkc-grid">
                        {q0.options.map((label: string) => {
                          const on = Array.isArray(answer) && answer.indexOf(label) > -1;
                          return (
                            <button
                              key={label}
                              type="button"
                              className="bkc-sq"
                              onClick={() => toggle(q0.id, label)}
                              style={on
                                ? { background: "linear-gradient(180deg,#9BADFF 0%,#879CF7 100%)", color: "#ffffff", boxShadow: "0 8px 18px -8px rgba(135,156,247,0.6)" }
                                : { background: "rgba(255,255,255,0.62)", color: "#001364", boxShadow: "0 0 0 1px rgba(0,19,100,0.12) inset" }}
                            >
                              <span>{label}</span>
                              <span className="bkc-sq-tick" style={on ? { background: "rgba(255,255,255,0.3)", color: "#ffffff" } : { background: "rgba(0,19,100,0.07)", color: "rgba(0,19,100,0)" }}>
                                <Check size={9} weight={4.5} />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="bkc-qfoot">
                        <button type="button" className="bkc-cta" style={{ display: "flex", justifyContent: "center", width: "100%" }} disabled={!ok} onClick={goNext}>Continue<Arrow /></button>
                      </div>
                    </>
                  )}

                  {q0.kind === "text" && (
                    <>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 20 }}>
                        {OFFBRIEF_CHIPS.map((c) => (
                          <button key={c} type="button" className="bkc-chip" onClick={() => setAnswer(q0.id, c)}>{c}</button>
                        ))}
                      </div>
                      <textarea
                        className="bkc-field"
                        style={{ ...fieldStyle, marginTop: 14, minHeight: 92, resize: "vertical", fontWeight: 500, lineHeight: 1.5 }}
                        value={answer || ""}
                        onChange={(e) => setAnswer(q0.id, e.target.value)}
                        placeholder="However it actually goes."
                      />
                      <div className="bkc-qfoot">
                        <button type="button" className="bkc-cta" style={{ display: "flex", justifyContent: "center", width: "100%" }} onClick={goNext}>Book a demo<Arrow /></button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {view === "outcome" && (
            <div className="bkc-fadeup">
              {(route === "A" || route === "C") && (
                <div className="bkc-glass" style={{ borderRadius: 26, padding: "clamp(24px,2.8vw,36px)" }}>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div className="bkc-eyebrow"><span className="bkc-dot" style={{ width: 6, height: 6 }} />Your demo</div>
                    <h2 className="bkc-balance" style={{ margin: "16px 0 0", fontSize: "clamp(24px,2.8vw,34px)", lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.03em", color: "#001364" }}>
                      45 minutes, live, with our team
                    </h2>
                    <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.55, fontWeight: 500, color: "#001364", opacity: 0.74 }}>
                      Pick a time and we spend the 45 minutes on your brand. We build a brief for one of your products live, then run a real creator video through it while you watch.
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "22px 0" }}>
                      {[
                        ["5 min", "Confirming what you just told us"],
                        ["25 min", "A brief built live for your product, and a real video reviewed against it"],
                        ["15 min", "Your numbers, and what happens next"],
                      ].map((row) => (
                        <div key={row[0]} className="bkc-row">
                          <span style={{ fontSize: 12, fontWeight: 800, color: "#879CF7", minWidth: 46 }}>{row[0]}</span>
                          <span style={{ fontSize: 13.5, color: "#001364", lineHeight: 1.45, fontWeight: 500 }}>{row[1]}</span>
                        </div>
                      ))}
                    </div>
                    <a href={calendarUrl(TIDYCAL_CALL)} target="_blank" rel="noopener noreferrer" className="bkc-cta" style={{ display: "flex", justifyContent: "center" }} onClick={() => setBooked(true)}>
                      Pick a time<Arrow />
                    </a>
                    <p style={{ margin: "14px 0 0", fontSize: 12, lineHeight: 1.5, fontWeight: 600, color: "#001364", opacity: 0.55 }}>
                      Nothing on the calendar that works? Email <a style={{ color: "#294FF6" }} href="mailto:support@brieflee.co">support@brieflee.co</a> and we'll find one.
                    </p>
                    {booked && (
                      <div className="bkc-fadeup" style={{ marginTop: 20, padding: "18px 20px", borderRadius: 16, background: "rgba(255,255,255,0.62)", boxShadow: "0 0 0 1px rgba(0,19,100,0.08) inset" }}>
                        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, fontWeight: 600, color: "#001364" }}>Booked? Good. Nothing to prepare.</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 12 }}>
                          {[`A brief for ${brandLabel}, built live on the call rather than a sample account`, "A real creator video reviewed against it while you watch"].map((t) => (
                            <div key={t} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                              <span className="bkc-tick" style={{ background: "#879CF7", color: "#fff", width: 18, height: 18, marginTop: 1 }}><Check size={11} weight={4} /></span>
                              <span style={{ fontSize: 13, color: "#001364", lineHeight: 1.45, fontWeight: 500 }}>{t}</span>
                            </div>
                          ))}
                        </div>
                        <p style={{ margin: "12px 0 0", fontSize: 13, lineHeight: 1.5, fontWeight: 500, color: "#001364", opacity: 0.7 }}>Bring nothing. If the time stops working, the invite has a reschedule link.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {route === "B" && (
                <div className="bkc-glass" style={{ borderRadius: 26, padding: "clamp(24px,2.8vw,36px)" }}>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div className="bkc-eyebrow"><span className="bkc-dot" style={{ width: 6, height: 6 }} />Programme call</div>
                    <h2 className="bkc-balance" style={{ margin: "16px 0 0", fontSize: "clamp(24px,2.8vw,34px)", lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.03em", color: "#001364" }}>
                      45 minutes, priced to your volume
                    </h2>
                    <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.55, fontWeight: 500, color: "#001364", opacity: 0.74 }}>
                      At your volume the published plans stop making sense. We take 45 minutes instead, go through the whole programme, and price it to what you're actually running.
                    </p>
                    <p style={{ margin: "12px 0 22px", fontSize: 14, lineHeight: 1.55, fontWeight: 500, color: "#001364", opacity: 0.68 }}>
                      Multi-brand workspaces, seats for your team or clients, review volume set to your real throughput, and a rollout plan for the creators already filming for you.
                    </p>
                    <a href={calendarUrl(TIDYCAL_CALL)} target="_blank" rel="noopener noreferrer" className="bkc-cta" style={{ display: "flex", justifyContent: "center" }} onClick={() => setBooked(true)}>
                      Pick a time<Arrow />
                    </a>
                    {booked && (
                      <div className="bkc-fadeup" style={{ marginTop: 20, padding: "18px 20px", borderRadius: 16, background: "rgba(255,255,255,0.62)", boxShadow: "0 0 0 1px rgba(0,19,100,0.08) inset" }}>
                        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, fontWeight: 500, color: "#001364" }}>
                          Booked? Good. Nothing to prepare. We size the programme on the call, on your real numbers, and you leave knowing the shape and the price. If someone else signs off, they are welcome on the call too.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {route === "D" && (
                <div className="bkc-glass" style={{ borderRadius: 26, padding: "clamp(24px,2.8vw,36px)" }}>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div className="bkc-eyebrow"><span className="bkc-dot" style={{ width: 6, height: 6 }} />Your call</div>
                    <h2 className="bkc-balance" style={{ margin: "16px 0 0", fontSize: "clamp(24px,2.8vw,34px)", lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.03em", color: "#001364" }}>
                      45 minutes, live, with our team
                    </h2>
                    <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.55, fontWeight: 500, color: "#001364", opacity: 0.74 }}>
                      Sounds like the creators aren't filming in volume yet. Book the call anyway and we'll spend it on the part you need first: the brief.
                    </p>
                    <p style={{ margin: "12px 0 22px", fontSize: 14, lineHeight: 1.55, fontWeight: 500, color: "#001364", opacity: 0.68 }}>
                      You'll leave with one built for your product, and you'll know exactly what Brieflee checks against when the videos do start landing.
                    </p>
                    <a href={calendarUrl(TIDYCAL_CALL)} target="_blank" rel="noopener noreferrer" className="bkc-cta" style={{ display: "flex", justifyContent: "center" }} onClick={() => setBooked(true)}>
                      Pick a time<Arrow />
                    </a>
                    <p style={{ margin: "14px 0 0", fontSize: 12, lineHeight: 1.5, fontWeight: 600, color: "#001364", opacity: 0.55 }}>
                      Rather start on your own first? The <a style={{ color: "#294FF6" }} href={BRIEF_GENERATOR} target="_blank" rel="noopener noreferrer">AI brief generator</a> is free and writes the brief you'd hand a creator.
                    </p>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 22, textAlign: "center" }}>
                <button type="button" onClick={restart} style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "#001364", opacity: 0.55, background: "transparent", border: "none", padding: 0, cursor: "pointer", textDecoration: "underline" }}>
                  Start the questions again
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}