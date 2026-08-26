// /set-up — Step 1 of onboarding (CREATE block only).
// =====================================================================
// Captures website (or description), up to 5 product/feature links and
// 1-3 formats, then:
//   1. CREATES the accounts row right here via useRecordCreate, with the
//      given fields mapped, blueprint_status = Pending and the page
//      links stored as JSON in `page_links`. Takes seconds. (The
//      accounts `status` field is never touched here.)
//   2. Redirects straight to /set-up/customize?accountId=<id>. THAT
//      block builds the blueprint itself (Firecrawl + OpenRouter through
//      its own sources, v6, 2026-08-19) while Steps 2-5 run, and writes
//      products rows, the first project and the notification. No
//      workflow is called any more.
// No narrated multi-minute wait, no poll: the only wait state is the
// couple of seconds the create takes, plus a failure card (create
// failed) offering a setup call in a modal and a retry.
//
// Back-button guard: submit stamps sessionStorage bl-setup-resume
// {accountId, ts}. Remounting within 10 minutes shows a resume banner
// (Continue set-up → customize) above the chat; the form stays usable
// underneath ("Start a new workspace" clears the banner) so testing
// repeat runs stays easy. localStorage bl-workspace-building carries
// the same stamp for the dashboard checklist's "still building" strip.
//
// SOFTR CONFIG REQUIRED:
//   1. Page: /set-up
//   2. Visibility tab: logged-in users who do NOT already have an
//      account (so existing users don't land here again).
//   3. Source tab → Database "brieflee beta" → table ACCOUNTS (the
//      block creates accounts rows; useRecordCreate binds to the
//      block's source table). Without this the Continue button reports
//      saving as unavailable.
// =====================================================================

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Globe, FileText, ToggleLeft, ListChecks, Sliders, Clock, Link2, X,
  Check, Image as ImageIcon, Play,
} from "lucide-react";
import { useCurrentUser } from "@/lib/user";
import { useRecordCreate, q } from "@/lib/datasource";
import { toast } from "sonner";

// ---- Constants ----------------------------------------------------
const LEE_AVATAR = "https://res.cloudinary.com/dspv9nm1n/image/upload/v1771427670/obl2odsrkhunneswor46.png";

// Up to this many product / feature page links. Each becomes a products
// row when the customize engine scrapes it.
const MAX_PAGE_LINKS = 5;

// Where to redirect after the account row exists. The accountId gets
// appended as a query param.
const CUSTOMIZE_PATH = "/set-up/customize";
const DEMO_PATH = "/book-a-demo";

// accounts table (TpAIptRey40yDj) — writable fields this block creates
// with. Keys are the aliases used in mutateAsync; every key here
// registers as an action so the map stays writable-only.
// NOTE: this block never touches the accounts `status` field — user
// groups key off it. Build progress lives in blueprint_status only
// (Pending here, Complete/Failed set by BL | New Workspace).
const createFields = q.select({
  name:             "aAKkT", // LONG_TEXT
  users:            "LNSSK", // LINKED_RECORD → users
  blueprintStatus:  "fElW1", // SELECT (Pending/Complete/Failed)
  web:              "eCF7h", // SELECT has-website
  website:          "RaK4B", // URL
  description:      "RQcNB", // LONG_TEXT
  preferredFormats: "V7fzw", // LONG_TEXT (joined format names)
  pageLinks:        "PlEfy", // LONG_TEXT JSON [{url, type, product_id}] read by customize
});

// Option ids pulled from the accounts schema 2026-07-29.
const BLUEPRINT_PENDING = { id: "e237ed0f-7454-41ba-926f-5b3601d3fac2", label: "Pending" };
const WEB_YES = { id: "e9f0cf36-2d96-4236-825d-26255dabd91d", label: "Yes, I have a website" };
const WEB_NO  = { id: "0289eb82-677c-498f-b65f-d6259c8599cd", label: "No website yet" };

// Back-button resume + dashboard "still building" stamps.
const RESUME_KEY = "bl-setup-resume";          // sessionStorage, this tab
const BUILDING_KEY = "bl-workspace-building";  // localStorage, read by /new checklist
const RESUME_WINDOW_MS = 10 * 60 * 1000;

// ---------------------------------------------------------------------
// Brand-website validation
// ---------------------------------------------------------------------
const SOCIAL_VIDEO_HOSTS = new Set([
  "youtube.com", "m.youtube.com", "youtube-nocookie.com", "youtu.be",
  "tiktok.com", "m.tiktok.com", "vm.tiktok.com", "vt.tiktok.com",
  "instagram.com", "instagr.am",
  "facebook.com", "m.facebook.com", "fb.com", "fb.watch",
  "twitter.com", "x.com", "t.co",
  "threads.net",
  "linkedin.com", "lnkd.in",
  "pinterest.com", "pin.it",
  "snapchat.com",
  "reddit.com", "redd.it",
  "vimeo.com",
  "twitch.tv",
]);
function getWebsiteHost(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  try {
    const u = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}
function getWebsiteError(value) {
  const v = (value || "").trim();
  if (!v) return "";
  const host = getWebsiteHost(v);
  if (!host || !host.includes(".") || host.length < 4) {
    return "That doesn't look like a website. Try yourbrand.com.";
  }
  if (SOCIAL_VIDEO_HOSTS.has(host)) {
    return "Enter your brand's own website, not a social or video link.";
  }
  return "";
}
function isValidBrandWebsite(value) {
  return !!(value || "").trim() && !getWebsiteError(value);
}

// ---------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------
// Placeholder workspace name from the website host ("acme.com" → "Acme");
// the workflow's enrichment overwrites it with the real brand name.
function placeholderName(websiteValue) {
  const host = getWebsiteHost(websiteValue);
  const label = host.split(".")[0] || "";
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : "My workspace";
}

// Book-a-demo opens in a Softr modal so the page underneath stays alive.
function openBookACall() {
  if (typeof window.openSwModal === "function") window.openSwModal(DEMO_PATH, "lg");
  else window.location.href = DEMO_PATH;
}

// =====================================================================
// Block
// =====================================================================
export default function Block() {
  const user = useCurrentUser();

  const [currentStep, setCurrentStep] = useState(0);
  const refWelcome = useRef(null);
  const ref1 = useRef(null);

  // Step 1 state
  const [hasWebsite, setHasWebsite] = useState(true);
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Top pages the brand wants Brieflee to read. Fed to the scrape-first
  // workflow (BL | New Workspace v2) as page_links + page_type so the
  // blueprint is built from real page copy, not just a name/URL guess.
  const [pageType, setPageType] = useState("products");
  const [links, setLinks] = useState([""]);

  // Formats the brand wants creators to make (1-3 picks from the
  // formats gallery). Sent flat in the webhook body so the workflow
  // can drop each format's guidance into the AI prompt with no
  // lookups, plus the record ids for the accounts.formats link.
  const [pickedFormats, setPickedFormats] = useState([]);

  // The create hook binds to the block's source table (ACCOUNTS).
  const createRecord = useRecordCreate({ fields: createFields });
  const inFlightRef = useRef(false);

  // Wait state: null (idle) | "creating" (a few seconds) | "failed".
  const [waitPhase, setWaitPhase] = useState(null);

  // Back-button resume: a recent submit in this tab shows a banner
  // offering to continue to customize instead of re-creating. Lazy
  // initialiser only (analyzer requirement with useRecordCreate).
  const [resume, setResume] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem(RESUME_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw);
      return p?.accountId && Date.now() - (p.ts || 0) < RESUME_WINDOW_MS ? p : null;
    } catch { return null; }
  });
  const dismissResume = () => {
    setResume(null);
    try { window.sessionStorage.removeItem(RESUME_KEY); } catch { /* ignore */ }
  };

  const scrollTo = (step) => {
    const el = (step === 0 ? refWelcome : ref1)?.current;
    if (!el) return;
    setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };
  const advance = (toStep) => { setCurrentStep(toStep); scrollTo(toStep); };

  // ─── Submit handler — create here, build on customize ───────────
  // The block creates the accounts row itself (blueprint_status =
  // Pending, page links as JSON) and redirects to customize with the
  // new id in seconds. customize's engine does the scrape + writing.
  const handleSubmit = async () => {
    if (inFlightRef.current) return; // guard against double-fire
    if (pickedFormats.length === 0) {
      toast.error("Pick at least one format");
      return;
    }
    if (!user?.id) {
      toast.error("Please log in to continue");
      return;
    }
    if (!createRecord.enabled) {
      toast.error("Saving is unavailable right now. Refresh and try again.");
      return;
    }

    inFlightRef.current = true;
    setSubmitting(true);
    setWaitPhase("creating");

    // Up to 5 product/feature page URLs. Stored on the row as JSON so
    // the customize engine (and any retry, on any device) can read them.
    // `type` tells the writer which blueprint side to build for that
    // page (products for physical brands, features for SaaS).
    const cleanLinks = links.map((l) => l.trim()).filter(Boolean).slice(0, MAX_PAGE_LINKS);
    const pageLinksJson = JSON.stringify(
      cleanLinks.map((url) => ({ url, type: pageType === "features" ? "Feature" : "Product", product_id: "" })),
    );
    const workspaceName = hasWebsite ? placeholderName(website) : "My workspace";

    // (1) Create the accounts row with the fields the user gave.
    let accountId = "";
    try {
      const created = await createRecord.mutateAsync({
        name: workspaceName,
        users: [{ id: user.id }],
        blueprintStatus: BLUEPRINT_PENDING,
        web: hasWebsite ? WEB_YES : WEB_NO,
        website: hasWebsite ? website.trim() : "",
        description: !hasWebsite ? description.trim() : "",
        preferredFormats: pickedFormats.map((f) => f.name).join(", "),
        pageLinks: pageLinksJson,
      });
      accountId = created?.id || created?.recordId || "";
      if (!accountId) throw new Error("Create returned no record id");
    } catch (e) {
      console.error("[set-up] account create failed:", e);
      setWaitPhase("failed");
      setSubmitting(false);
      inFlightRef.current = false;
      return;
    }

    // Stamp resume (this tab) + still-building (dashboard checklist).
    const stamp = JSON.stringify({ accountId, ts: Date.now() });
    try { window.sessionStorage.setItem(RESUME_KEY, stamp); } catch { /* ignore */ }
    try { window.localStorage.setItem(BUILDING_KEY, stamp); } catch { /* ignore */ }

    // (2) Straight into customize — a short beat so the "creating"
    // card doesn't flash. customize starts the build on mount.
    const params = new URLSearchParams({ accountId });
    setTimeout(() => {
      window.location.href = `${CUSTOMIZE_PATH}?${params.toString()}`;
    }, 600);
  };

  // Retry from the failed state: clear the wait UI so the form's
  // Continue button comes back enabled.
  const resetWait = () => {
    setWaitPhase(null);
  };

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(to bottom, rgba(217, 224, 255, 0.15), rgba(255, 255, 255, 1))" }}>
      <Style />

      {/* Header row: centered progress dots with the exit button pinned
          to its left edge. In normal flow (not fixed) because Softr's
          block container doesn't reliably honour position: fixed. */}
      <div style={{ position: "relative" }}>
        <ProgressDots currentStep={currentStep} />
        <button
          type="button"
          onClick={() => { window.location.href = "/new"; }}
          aria-label="Exit setup"
          className="flex items-center gap-1.5"
          style={{
            position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)",
            background: "#fff", border: "1px solid rgba(217, 224, 255, 0.8)",
            borderRadius: 999, padding: "6px 14px", cursor: "pointer",
            fontSize: 12.5, fontWeight: 500, color: "#6B7A99",
            boxShadow: "0 1px 3px rgba(0, 19, 100, 0.06)",
          }}
        >
          <X size={13} />
          Exit setup
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {resume && (
            <div className="bl-card mb-6" style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#000F4D" }}>
                You created a workspace a few minutes ago
              </div>
              <div style={{ fontSize: 12.5, color: "#6B7A99", marginTop: 2, marginBottom: 12 }}>
                It's still being set up. Pick up where you left off instead of starting again.
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => {
                    const params = new URLSearchParams({ accountId: resume.accountId });
                    window.location.href = `${CUSTOMIZE_PATH}?${params.toString()}`;
                  }}
                  className="text-sm py-2 px-5"
                  style={{ backgroundColor: "#7A93FF", color: "#fff", borderRadius: 8, fontWeight: 500 }}
                >
                  Continue set-up →
                </Button>
                <button
                  onClick={dismissResume}
                  style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 12, color: "#6B7A99", textDecoration: "underline" }}
                >
                  Start a new workspace
                </button>
              </div>
            </div>
          )}

          <section ref={refWelcome}>
            <Welcome user={user} active={currentStep === 0} done={currentStep > 0} onStart={() => advance(1)} />
          </section>

          {currentStep >= 1 && (
            <section ref={ref1}>
              <Step1
                active={currentStep === 1}
                hasWebsite={hasWebsite} setHasWebsite={setHasWebsite}
                website={website} setWebsite={setWebsite}
                description={description} setDescription={setDescription}
                pageType={pageType} setPageType={setPageType}
                links={links} setLinks={setLinks}
                pickedFormats={pickedFormats} setPickedFormats={setPickedFormats}
                onSubmit={handleSubmit}
                submitting={submitting}
                waitPhase={waitPhase}
                onRetry={resetWait}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// Welcome
// =====================================================================
function Welcome({ user, active, done, onStart }) {
  const [showTyping1, setShowTyping1] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTyping2, setShowTyping2] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showTyping3, setShowTyping3] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!active) return;
    const t = [];
    t.push(setTimeout(() => setShowTyping1(true), 300));
    t.push(setTimeout(() => { setShowTyping1(false); setShowWelcome(true); }, 2500));
    t.push(setTimeout(() => setShowTyping2(true), 3000));
    t.push(setTimeout(() => { setShowTyping2(false); setShowChecklist(true); }, 4500));
    t.push(setTimeout(() => setShowTyping3(true), 5000));
    t.push(setTimeout(() => { setShowTyping3(false); setShowButton(true); }, 5800));
    return () => t.forEach(clearTimeout);
  }, [active]);

  if (done) return null;
  const firstName = user?.fullName?.split(" ")[0] || "there";

  return (
    <div>
      {showTyping1 && <TypingWithAvatar />}
      {showWelcome && (
        <BubbleWithAvatar>
          <span style={{ fontWeight: 500 }}>Welcome to Brieflee, {firstName}!</span>
          <br /><br />
          I'm Lee, your AI review assistant. Nice to meet you.
          <br /><br />
          Let's get you set up so you can see Brieflee in action. It's quick and easy. Ready to get started?
        </BubbleWithAvatar>
      )}

      {showTyping2 && <TypingNoAvatar />}

      {showChecklist && (
        <div className="mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="flex gap-2.5 items-start">
            <div className="w-8 h-8 flex-shrink-0" />
            <Card className="shadow-sm border max-w-lg" style={{ borderRadius: 10, borderColor: "rgba(217, 224, 255, 0.5)" }}>
              <CardHeader className="pb-2 pt-3 px-3">
                <h3 className="text-sm" style={{ color: "#000F4D", fontWeight: 800 }}>A few steps to get started</h3>
              </CardHeader>
              <CardContent className="space-y-3 px-3 pb-3">
                <ChecklistRow Icon={Globe}      label="Set up your brand"     time="1 min" body="Tell us about your brand so Brieflee knows what to look for." last={false} />
                <ChecklistRow Icon={ToggleLeft} label="Choose your review mode" time="1 min" body="How involved do you want to be when content comes in?" last={false} />
                <ChecklistRow Icon={ListChecks} label="Pick your default checks" time="1 min" body="Which checks should always run on quick reviews." last={false} />
                <ChecklistRow Icon={Sliders}    label="Set your standards"    time="2 min" body="How strict each check should be." last={false} />
                <ChecklistRow Icon={FileText}   label="Review your content blueprint" time="2 min" body="I've pulled together a content blueprint from your website." last={true} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {showTyping3 && <TypingWithAvatar />}

      {showButton && (
        <div className="mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="flex gap-2.5 items-start">
            <div className="w-8 h-8 flex-shrink-0" />
            <Button
              className="text-sm py-2 px-5 shadow-sm hover:shadow-md transition-all duration-300"
              style={{ backgroundColor: "#7A93FF", color: "#fff", borderRadius: 8, fontWeight: 500 }}
              onClick={onStart}
            >
              Get started →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChecklistRow({ Icon, label, time, body, last }) {
  return (
    <div className="flex gap-2.5">
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#294FF6" }}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        {!last && <div className="w-0.5 h-full mt-1" style={{ backgroundColor: "#D9E0FF" }} />}
      </div>
      <div className="flex-1 pb-2">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h4 className="text-xs" style={{ color: "#000F4D", fontWeight: 500 }}>{label}</h4>
          <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: "#D9E0FF", color: "#294FF6", fontWeight: 500 }}>
            <Clock className="w-2.5 h-2.5" />
            {time}
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "#001364", fontWeight: 300 }}>{body}</p>
      </div>
    </div>
  );
}

// =====================================================================
// Step 1 — website / description + use cases → Submit fires webhook
// =====================================================================
function Step1({
  active,
  hasWebsite, setHasWebsite, website, setWebsite, description, setDescription,
  pageType, setPageType, links, setLinks,
  pickedFormats, setPickedFormats,
  onSubmit, submitting,
  waitPhase, onRetry,
}) {
  const [showTyping1, setShowTyping1] = useState(false);
  const [showMessage1, setShowMessage1] = useState(false);
  const [showVideo, setShowVideo] = useState(false); // explainer video is opt-in
  const [showTyping2, setShowTyping2] = useState(false);
  const [showInputArea, setShowInputArea] = useState(false);
  const [websiteSubmitted, setWebsiteSubmitted] = useState(false);
  // Links stage (top product / feature pages)
  const [showTypingLinks, setShowTypingLinks] = useState(false);
  const [showLinksMessage, setShowLinksMessage] = useState(false);
  const [showLinksInput, setShowLinksInput] = useState(false);
  const [linksSubmitted, setLinksSubmitted] = useState(false);
  // Formats stage
  const [showTyping3, setShowTyping3] = useState(false);
  const [showMessage2, setShowMessage2] = useState(false);
  const [showTyping4, setShowTyping4] = useState(false);
  const [showFormats, setShowFormats] = useState(false);

  useEffect(() => {
    if (!active) return;
    const t = [];
    t.push(setTimeout(() => setShowTyping1(true), 300));
    t.push(setTimeout(() => { setShowTyping1(false); setShowMessage1(true); }, 1800));
    t.push(setTimeout(() => setShowTyping2(true), 2300));
    t.push(setTimeout(() => { setShowTyping2(false); setShowInputArea(true); }, 3800));
    return () => t.forEach(clearTimeout);
  }, [active]);

  const strengthColor = description.length < 100 ? "#d92626" : "#20956f";
  const strengthLabel = description.length < 100 ? "Too short" : "Strong";
  const websiteError = getWebsiteError(website);

  // Website submit now hands off to the links step, then use cases.
  const handleWebsiteSubmit = () => {
    if (hasWebsite && !website.trim()) { toast.error("Please enter your website"); return; }
    if (hasWebsite && websiteError) { toast.error(websiteError); return; }
    if (!hasWebsite && description.length < 100) { toast.error("Please write at least 100 characters about your brand"); return; }
    setWebsiteSubmitted(true);
    setShowTypingLinks(true);
    setTimeout(() => { setShowTypingLinks(false); setShowLinksMessage(true); setShowLinksInput(true); }, 1500);
  };

  const revealFormats = () => {
    setShowTyping3(true);
    setTimeout(() => { setShowTyping3(false); setShowMessage2(true); }, 1200);
    setTimeout(() => setShowTyping4(true), 1700);
    setTimeout(() => { setShowTyping4(false); setShowFormats(true); }, 3000);
  };

  const handleLinksContinue = () => {
    setLinksSubmitted(true);
    revealFormats();
  };

  const setLinkAt = (i, val) => setLinks((cur) => cur.map((l, idx) => (idx === i ? val : l)));
  const addLink = () => setLinks((cur) => (cur.length >= 3 ? cur : [...cur, ""]));
  const removeLink = (i) => setLinks((cur) => (cur.length <= 1 ? cur : cur.filter((_, idx) => idx !== i)));
  const hasAnyLink = links.some((l) => l.trim());

  const toggleFormat = (f) => {
    setPickedFormats((cur) => {
      if (cur.find((x) => x.id === f.id)) return cur.filter((x) => x.id !== f.id);
      if (cur.length >= 3) return cur;
      return [...cur, f];
    });
  };

  return (
    <div>
      {showTyping1 && <TypingWithAvatar />}

      {showMessage1 && (
        <div className="mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
          {/* Why-we-ask explainer (1:27), opt-in: a compact invite card sits
              above the brand questions; the video only mounts (and starts
              playing) once the user chooses to watch. */}
          <div className="ml-10 mb-4">
            <div className="max-w-lg">
              {!showVideo ? (
                <button type="button" className="bl-video-invite" onClick={() => setShowVideo(true)}>
                  <span className="bl-video-play"><Play size={14} fill="currentColor" /></span>
                  <span style={{ textAlign: "left" }}>
                    <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "#000F4D" }}>
                      Why we ask for your brand info
                    </span>
                    <span style={{ display: "block", fontSize: 12, color: "#6B7A99", marginTop: 1 }}>
                      Watch the 1:27 video · Optional
                    </span>
                  </span>
                </button>
              ) : (
                <>
                  <div className="bl-video-shell">
                    <video
                      src="https://res.cloudinary.com/dchroynzv/video/upload/v1785271179/Brand_Info_-_Onboarding_oxx7sr.mp4"
                      poster="https://res.cloudinary.com/dchroynzv/video/upload/so_0/v1785271179/Brand_Info_-_Onboarding_oxx7sr.jpg"
                      title="Why we ask for your brand info"
                      controls
                      autoPlay
                      playsInline
                      preload="metadata"
                    />
                  </div>
                  <button type="button" className="bl-video-hide" onClick={() => setShowVideo(false)}>
                    Hide video
                  </button>
                </>
              )}
            </div>
          </div>

          <BubbleWithAvatar>
            Great! First I need to gather some information about your brand. Could you please provide me the URL of your company's website? I'll use this to build your content blueprint. No website? One sentence about what you do is enough.
          </BubbleWithAvatar>
          <div className="ml-10 mt-2">
            <button
              onClick={() => setHasWebsite(!hasWebsite)}
              className="text-xs"
              style={{ color: "#7A93FF", fontWeight: 500, background: "transparent", border: "none", cursor: "pointer" }}
            >
              {hasWebsite ? "Don't have a website?" : "Have a website? Enter URL instead"}
            </button>
          </div>
        </div>
      )}

      {showTyping2 && <TypingNoAvatar />}

      {showInputArea && !websiteSubmitted && (
        <div className="mb-4 ml-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="max-w-lg">
            {hasWebsite ? (
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Globe className="w-4 h-4" style={{ color: "#7A93FF" }} />
                  </div>
                  <input
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="yourbrand.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white outline-none transition-all duration-200"
                    style={{
                      border: `1px solid ${website.trim() && websiteError ? "#d92626" : "rgba(217, 224, 255, 0.4)"}`,
                      color: "#000F4D",
                      fontWeight: 300,
                    }}
                    onFocus={(e) => { if (!(website.trim() && websiteError)) e.target.style.borderColor = "#7A93FF"; }}
                    onBlur={(e) => { if (!(website.trim() && websiteError)) e.target.style.borderColor = "rgba(217, 224, 255, 0.4)"; }}
                  />
                </div>
                {website.trim() && websiteError && (
                  <p className="text-xs" style={{ color: "#d92626", marginTop: -4 }}>{websiteError}</p>
                )}
                <Button
                  onClick={handleWebsiteSubmit}
                  disabled={!isValidBrandWebsite(website)}
                  className="text-sm py-2 px-5 shadow-sm hover:shadow-md transition-all duration-300"
                  style={{
                    backgroundColor: !isValidBrandWebsite(website) ? "#D9E0FF" : "#7A93FF",
                    color: "#fff", borderRadius: 8, fontWeight: 500,
                    cursor: !isValidBrandWebsite(website) ? "not-allowed" : "pointer",
                  }}
                >
                  Submit →
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Type a few sentences on your business. Brieflee will use this information to create a custom content blueprint for you. The more details you can provide, the better."
                  rows={5}
                  className="w-full text-sm rounded-xl p-3 outline-none resize-none transition-all duration-200"
                  style={{ border: "1px solid rgba(217, 224, 255, 0.4)", color: "#000F4D", fontWeight: 300, backgroundColor: "#fff" }}
                  onFocus={(e) => (e.target.style.borderColor = "#7A93FF")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(217, 224, 255, 0.4)")}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full transition-all duration-300" style={{ width: `${Math.min((description.length / 100) * 100, 100)}%`, backgroundColor: strengthColor }} />
                    </div>
                    <span className="text-xs" style={{ color: strengthColor, fontWeight: 500 }}>{strengthLabel}</span>
                  </div>
                  <span className="text-xs" style={{ color: "#001364", fontWeight: 300 }}>{description.length}/100</span>
                </div>
                <Button
                  onClick={handleWebsiteSubmit}
                  disabled={description.length < 100}
                  className="text-sm py-2 px-5 shadow-sm hover:shadow-md transition-all duration-300"
                  style={{
                    backgroundColor: description.length < 100 ? "#D9E0FF" : "#7A93FF",
                    color: "#fff", borderRadius: 8, fontWeight: 500,
                    cursor: description.length < 100 ? "not-allowed" : "pointer",
                  }}
                >
                  Submit →
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Top pages (products / features) ─────────────────────── */}
      {showTypingLinks && <TypingWithAvatar />}

      {showLinksMessage && (
        <BubbleWithAvatar>
          Do you have product or feature pages on your site? Drop up to 5 links and I'll read them so your blueprint is spot on. No pages to share? Just skip.
        </BubbleWithAvatar>
      )}

      {showLinksInput && !linksSubmitted && (
        <div className="mb-4 ml-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="max-w-lg space-y-3">
            <div className="flex gap-2">
              {[{ id: "products", label: "Products" }, { id: "features", label: "Features" }].map((opt) => {
                const on = pageType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setPageType(opt.id)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all duration-200"
                    style={{
                      border: on ? "1px solid #7A93FF" : "1px solid rgba(217, 224, 255, 0.5)",
                      backgroundColor: on ? "rgba(122, 147, 255, 0.08)" : "#fff",
                      color: on ? "#294FF6" : "#001364", fontWeight: 500, cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {links.map((val, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Link2 className="w-4 h-4" style={{ color: "#7A93FF" }} />
                  </div>
                  <input
                    type="text"
                    inputMode="url"
                    value={val}
                    onChange={(e) => setLinkAt(i, e.target.value)}
                    placeholder={pageType === "features" ? "yourbrand.com/features/…" : "yourbrand.com/products/…"}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-white outline-none transition-all duration-200"
                    style={{ border: "1px solid rgba(217, 224, 255, 0.4)", color: "#000F4D", fontWeight: 300 }}
                    onFocus={(e) => (e.target.style.borderColor = "#7A93FF")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(217, 224, 255, 0.4)")}
                  />
                </div>
                {links.length > 1 && (
                  <button
                    onClick={() => removeLink(i)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg"
                    style={{ color: "#7A93FF", background: "transparent", border: "none", cursor: "pointer" }}
                    aria-label="Remove link"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            {links.length < MAX_PAGE_LINKS && (
              <button
                onClick={addLink}
                className="text-xs"
                style={{ color: "#7A93FF", fontWeight: 500, background: "transparent", border: "none", cursor: "pointer" }}
              >
                + Add another link
              </button>
            )}

            <div className="flex items-center gap-4 pt-1">
              <Button
                onClick={handleLinksContinue}
                className="text-sm py-2 px-5 shadow-sm hover:shadow-md transition-all duration-300"
                style={{ backgroundColor: "#7A93FF", color: "#fff", borderRadius: 8, fontWeight: 500 }}
              >
                Continue →
              </Button>
              <button
                onClick={handleLinksContinue}
                className="text-xs"
                style={{ color: "#001364", fontWeight: 300, background: "transparent", border: "none", cursor: "pointer" }}
              >
                {hasAnyLink ? "Skip the rest" : "Skip for now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Formats (pick 1-3) ──────────────────────────────────── */}
      {showTyping3 && <TypingWithAvatar />}

      {showMessage2 && (
        <BubbleWithAvatar>
          Last one. Which video formats do you want creators to make? Pick one, or up to three.
        </BubbleWithAvatar>
      )}

      {showTyping4 && <TypingNoAvatar />}

      {showFormats && (
        <>
          <div className="mb-4 ml-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="max-w-lg">
              <FormatGrid formats={FORMATS} picked={pickedFormats} onToggle={toggleFormat} />
            </div>
          </div>

          <div className="mb-4 ml-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {!waitPhase && (
              <Button
                onClick={onSubmit}
                disabled={submitting || pickedFormats.length === 0}
                className="text-sm py-2 px-5 shadow-sm hover:shadow-md transition-all duration-300"
                style={{
                  backgroundColor: (submitting || pickedFormats.length === 0) ? "#D9E0FF" : "#7A93FF",
                  color: "#fff", borderRadius: 8, fontWeight: 500,
                  cursor: (submitting || pickedFormats.length === 0) ? "not-allowed" : "pointer",
                }}
              >
                Continue →
              </Button>
            )}

            {waitPhase && (
              <BuildWait phase={waitPhase} onRetry={onRetry} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// =====================================================================
// BuildWait — the brief create moment, or the failure card. "creating"
// lasts the couple of seconds the row create + redirect take. "failed"
// only shows when the create itself errored: the setup call opens in a
// modal so nothing on this page is lost.
// =====================================================================
function BuildWait({ phase, onRetry }) {
  if (phase === "failed") {
    return (
      <div className="bl-card animate-in fade-in duration-500" style={{ padding: 24, maxWidth: 480 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#000F4D", marginBottom: 8 }}>
          We couldn't create your workspace
        </div>
        <div style={{ fontSize: 13, color: "#6B7A99", lineHeight: 1.6, marginBottom: 16 }}>
          Something went wrong on our side. Try again, or grab a quick call and
          we will set it up with you. Nothing you entered is lost. Questions
          any time:{" "}
          <a href="mailto:support@brieflee.co" style={{ color: "#7A93FF", fontWeight: 600 }}>support@brieflee.co</a>.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button
            onClick={onRetry}
            className="text-sm py-2 px-5"
            style={{ backgroundColor: "#7A93FF", color: "#fff", borderRadius: 8, fontWeight: 500 }}
          >
            Try again
          </Button>
          <Button
            onClick={openBookACall}
            className="text-sm py-2 px-5"
            style={{ backgroundColor: "#fff", color: "#000F4D", border: "1px solid #D9E0FF", borderRadius: 8, fontWeight: 500 }}
          >
            Book a 15-min setup call
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bl-card animate-in fade-in duration-500 flex items-center gap-3" style={{ padding: "18px 22px", maxWidth: 480 }}>
      <span
        className="flex items-center justify-center flex-shrink-0"
        style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(135, 156, 247, 0.15)", border: "2px solid #7A93FF" }}
      >
        <span className="bl-build-pulse" aria-hidden="true" />
      </span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#000F4D" }}>Creating your workspace</div>
        <div style={{ fontSize: 12, color: "#6B7A99" }}>Just a moment...</div>
      </div>
    </div>
  );
}

// =====================================================================
// Shared chat primitives
// =====================================================================
function BubbleWithAvatar({ children }) {
  return (
    <div className="mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex gap-2.5 items-start">
        <img src={LEE_AVATAR} alt="Lee" className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm max-w-lg" style={{ border: "1px solid rgba(217, 224, 255, 0.4)" }}>
          <p className="text-sm leading-relaxed" style={{ color: "#000F4D", fontWeight: 300 }}>{children}</p>
        </div>
      </div>
    </div>
  );
}

function TypingWithAvatar() {
  return (
    <div className="mb-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex gap-2.5 items-start">
        <img src={LEE_AVATAR} alt="Lee" className="w-8 h-8 rounded-full flex-shrink-0" />
        <TypingDots />
      </div>
    </div>
  );
}

function TypingNoAvatar() {
  return (
    <div className="mb-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex gap-2.5 items-start">
        <div className="w-8 h-8 flex-shrink-0" />
        <TypingDots />
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="bg-white rounded-2xl rounded-tl-sm p-3 px-5 shadow-sm" style={{ border: "1px solid rgba(217, 224, 255, 0.4)" }}>
      <div className="flex gap-1.5">
        <div className="w-2 h-2 rounded-full typing-dot" style={{ backgroundColor: "#7A93FF" }} />
        <div className="w-2 h-2 rounded-full typing-dot" style={{ backgroundColor: "#7A93FF" }} />
        <div className="w-2 h-2 rounded-full typing-dot" style={{ backgroundColor: "#7A93FF" }} />
      </div>
    </div>
  );
}

function ProgressDots({ currentStep }) {
  // 5 dots total across BOTH onboarding pages, split visually:
  //   dot 1 → /set-up Step 1 (this page — website / use cases)
  //   dot 2 → /customize Step 2 (AI mode)
  //   dot 3 → /customize Step 4 (QA checklist)
  //   dot 4 → /customize Step 5 (Thresholds)
  //   dot 5 → /customize Step 6 (Blueprint review)
  // On Welcome (currentStep 0) no dots are filled yet. On Step 1
  // (currentStep 1) the first dot fills.
  const filled = currentStep >= 1 ? 1 : 0;
  return (
    <div className="flex justify-center gap-2 py-6">
      {[1, 2, 3, 4, 5].map((i) => {
        const reached = i <= filled;
        return (
          <div
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: reached ? "#7A93FF" : "#D9E0FF", opacity: reached ? 1 : 0.5 }}
          />
        );
      })}
    </div>
  );
}

function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;500;800&display=swap');
      * { font-family: 'League Spartan', sans-serif; }
      @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }
      .typing-dot { animation: bounce 1.4s infinite; }
      .typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      .bl-card { background: #fff; border: 1px solid rgba(217, 224, 255, 0.6); border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 19, 100, 0.05); }
      @keyframes blBuildPulse { 0%, 100% { transform: scale(0.6); opacity: 0.5; } 50% { transform: scale(1); opacity: 1; } }
      .bl-build-pulse { display: block; width: 8px; height: 8px; border-radius: 50%; background: #7A93FF; animation: blBuildPulse 1.2s ease-in-out infinite; }
      .bl-video-shell { position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; border: 1px solid rgba(217, 224, 255, 0.6); background: #000F4D; }
      .bl-video-shell video { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; object-fit: cover; }
      .bl-video-invite { display: inline-flex; align-items: center; gap: 12px; padding: 10px 16px 10px 12px; border-radius: 12px; border: 1px solid rgba(217, 224, 255, 0.8); background: rgba(122, 147, 255, 0.06); cursor: pointer; transition: background 0.15s ease, border-color 0.15s ease; }
      .bl-video-invite:hover { background: rgba(122, 147, 255, 0.12); border-color: rgba(122, 147, 255, 0.5); }
      .bl-video-play { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: #294FF6; color: #fff; flex-shrink: 0; }
      .bl-video-hide { display: block; margin-top: 6px; padding: 0; border: none; background: transparent; cursor: pointer; font-size: 12px; color: #6B7A99; text-decoration: underline; }
    `}</style>
  );
}

// =====================================================================
// Format gallery — same cards as /app/briefs/create-brief (looping MP4
// thumbs). Data constants live BELOW the components on purpose: Softr's
// Vibe Code analyzer has a byte budget and needs to see the component
// code first.
// =====================================================================
function FormatGrid({ formats, picked, onToggle }) {
  return (
    <div className="grid grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1">
      {formats.map((f) => {
        const on = picked.some((x) => x.id === f.id);
        return (
          <button
            key={f.id}
            onClick={() => onToggle(f)}
            className="text-left rounded-lg overflow-hidden bg-white transition-all"
            style={{ border: on ? "2px solid #7A93FF" : "1px solid rgba(217, 224, 255, 0.6)" }}
          >
            <div className="relative aspect-square overflow-hidden" style={{ background: "rgba(135, 156, 247, 0.06)" }}>
              {f.thumb ? (
                <video src={f.thumb} muted playsInline loop autoPlay preload="metadata" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ImageIcon size={24} style={{ color: "#7A93FF" }} /></div>
              )}
              {f.popular && !on && (
                <div
                  className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wide"
                  style={{ background: "rgba(41, 79, 246, 0.92)", color: "#fff" }}
                >
                  Popular
                </div>
              )}
              {on && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#294FF6" }}>
                  <Check size={12} className="text-white" />
                </div>
              )}
            </div>
            <div className="px-2 py-1.5">
              <div className="text-xs" style={{ color: "#000F4D", fontWeight: on ? 600 : 500 }}>{f.name}</div>
              {f.desc && <div className="text-[10px] leading-snug mt-0.5" style={{ color: "#7A93FF", fontWeight: 300, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{f.desc}</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// 42 formats — name + 1 looping thumb URL + record ID in beta formats table.
//
// Each `thumb` is the URL of the currently-FEATURED video for that
// format in the videos table (videos.Feature = true). Refresh when
// Bev features new videos: re-run the MCP `list_records` query against
// the videos table, filter to Feature=true, group by format, and
// regenerate this constant. (Curl: see docs/refresh-format-thumbs.md
// once that's written.) Last refresh: 2026-05-27.
//
// 4 formats don't have a featured video yet — their `thumb` falls back
// to the original Motion swipe-file CDN URL: Pattern Interrupt,
// Time Lapse, Transformation, Whiteboard Explainer.
//
// Record IDs come from formats table (3yQSKToyjBWLSX) for the linked write.
const FORMATS = [
  // ── Most-used formats first; flagged `popular` for the badge ──
  { name: "Yapper", id: "5l0IKGeuF1TcQH", desc: "Creator talking straight to camera", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/4309351589318819/6a4f66ef69c9b9098480aa4f/04038f95-a782-44ac-8e8b-66de63276662.mp4" , popular: true },
  { name: "Try-On", id: "Q0N2XHJLH8zpvx", desc: "Trying the product on, on camera", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1348381250732594/6a57726269c9b90984a9d6dd/e8da914d-0cb9-4289-96c9-da3aa580fdf4.mp4" , popular: true },
  { name: "POV", id: "znK1otYqVFeHdP", desc: "Shot from the viewer's perspective", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1037561295884526/6a47f74c708e10d2425216af/ea09844a-bb5a-401e-971f-3e7b1fd48d6e.mp4" , popular: true },
  { name: "Listicle", id: "qnWiPWtmyXCenq", desc: "Numbered, snappy, easy to follow", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1336407554569071/6a42c4ef3d28426734964252/3bc9b13a-2cf9-468e-8272-7d12f770fc2d.mp4" , popular: true },
  { name: "Skit", id: "F5fq0pXlaKH3rv", desc: "A mini-story with characters", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1728432004991669/69f6e752280f6afea179e59a/3092237e-5be7-4a01-a68c-79821a2c985d.mp4" , popular: true },
  { name: "Testimonial", id: "B02EKdR9dlAx6z", desc: "A real customer, on camera", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1892633181430601/69fcf01d9f9320f2b1a2f9e6/d3538384-9946-4041-8d85-67e82024df03.mp4" , popular: true },
  { name: "Demo", id: "rCVlZyOAiJjeBk", desc: "Show it working", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1880827992620177/69e8ace0bdb47646c4818a06/5dd897d0-764f-4cc2-a905-e5094e646bdf.mp4" , popular: true },
  { name: "Before and After", id: "lXE0ppCy9bxtwT", desc: "One frame of the before", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/988627827004012/69fefaf908c1a6eaf90e2ad6/1b271108-d78b-4354-8885-5fc970bade08.mp4" , popular: true },
  // ── Everything else, alphabetical ──
  { name: "AI Generated", id: "43v5kKjNH6eRYR", desc: "Imagery your camera couldn't capture", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2882199948802308/6a60f695e279571c539b745f/e5a95652-2a23-4ea6-8fdd-d2f0440a18b3.mp4"  },
  { name: "ASMR", id: "ZvD1XsBsOHXrc7", desc: "Show your product through sound", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/26273338205702663/69fefc4d08c1a6eaf90e35cc/f1b99388-a6cb-4ee2-9a3a-3bb593b33cc5.mp4" },
  { name: "Behind The Scenes", id: "j1mq5E7J76Uh6v", desc: "What the audience never sees", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2074472573134109/69fd76f99f9320f2b1a8b16e/4b4f80c2-e4e6-49b2-adbb-f199ad55a58a.mp4" },
  { name: "Celebrity", id: "2tidTBu1s9sYe0", desc: "A face your audience already trusts", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1751062799192327/69e655fec58c09bbcefb076b/11e557d6-ed5e-4dc8-a806-3ad02fdbf8a4.mp4" },
  { name: "Cinematic B-Roll", id: "iJ0B7DHvXSa6S7", desc: "Brand-led, beautifully shot moments", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/969391685995536/69fccea79f9320f2b1a10f9e/33c8c440-25fd-41c1-9d49-0e7294a7b263.mp4" },
  { name: "Comment Response", id: "mNzF4jrNxdWkh9", desc: "Frame the ad as a reply", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1636968607555545/69f25ae0bdb47646c4aeac1e/2d483aa6-d836-4f26-8877-a5699a8d86b2.mp4" },
  { name: "Duet", id: "F5dPTsMJW0ZyRq", desc: "Splitscreen with another video", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2511326736005461/69fccd2d9f9320f2b1a0f96d/ee956cc7-d4fa-4c00-b5b9-f2914f28602f.mp4" },
  { name: "Educational", id: "GzrEECgnGSDV9V", desc: "Teach something they didn't know", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/914024708218014/69a366a6627a9fffb77b4c30/dc9ece02-b98a-4f69-bb18-e47060c3de44.mp4" },
  { name: "Expert Explainer", id: "AbqxjhPiSSk2X5", desc: "An authority explains the product", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1021384357007346/69fbf2659f9320f2b19d8f1f/1f654e37-23fe-4e1e-ac08-cf6e383b61e0.mp4" },
  { name: "Founder", id: "yWvyuTwfxjdI8V", desc: "You, on camera", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2489169831480140/69b66c3ec32a3e3756ff0204/a10e6435-8974-41ab-b455-a2b31c2f3f6e.mp4" },
  { name: "Greenscreen", id: "k5DItljtn7egIc", desc: "You, with a screen behind you", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2669537510087032/69e49e54c58c09bbceee4610/f70d3887-2ba3-4757-bd4d-83a1b96c2392.mp4" },
  { name: "Grid Swap", id: "fB13Uwrof2LR2x", desc: "Same frame, one element swaps in", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/825894647240915/69ff7cf808c1a6eaf911b72f/a449cf81-08a9-40ff-a7f5-6ee3e3454f79.mp4" },
  { name: "How To", id: "6wAgppyTNeGk7E", desc: "Step one, step two, result", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/970964365671431/69fccf6d9f9320f2b1a11d45/484b8e6a-34be-40b7-a37b-869fbaf12d23.mp4" },
  { name: "Humour", id: "Tlw7jXIw8dQU8m", desc: "Lead with the laugh, land the product", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/3223664521167031/69ff042f08c1a6eaf90e80ee/f775c866-c16e-4c0d-8829-385847056c65.mp4" },
  { name: "Influencer Endorsement", id: "JOEyLgxuqYS8PM", desc: "A creator they already follow", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1271436081862800/69f968c746012bac5d8142c4/9c91629f-e452-4832-94a0-5243d5ceab51.mp4" },
  { name: "Meme", id: "X4rmYeRWHlwFF6", desc: "A current meme, used right", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/851513724015406/69d24c434dbfa8a40b3a74d5/e36b9f35-ab6e-4105-84e4-7acc1ac70c0b.mp4" },
  { name: "Montage", id: "TvjJUVblQ4U0NM", desc: "Many shots, cut fast", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/713982688473485/69ff317008c1a6eaf9101da8/42159ae1-bb28-4214-b77f-aad745aa268a.mp4" },
  { name: "Pattern Interrupt", id: "gebQfaqFGK8JR0", desc: "Opening with no obvious link", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/927361589680033/69fd2d6c9f9320f2b1a5c8e9/8eeb4b60-5f6a-422d-aa3c-057a6bc55795.mp4" },
  { name: "Podcast", id: "FKeW5AssNPsamF", desc: "Two people, mics, jump cuts", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1688264695516114/69e4e2a0c58c09bbcef03451/d23eb6fe-3e5b-4c41-a179-79ac9218b420.mp4" },
  { name: "Postit", id: "6y60WsVQSvSPrx", desc: "Sticky notes around the product", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/25938599792440098/698f81038d2d4d38e641669e/e670ddd2-b6d9-4756-b54b-1b5b3e55d3ea.mp4" },
  { name: "Press", id: "JBvDhmX83IXzVt", desc: "Logos, headlines, article screenshots", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/958677503186249/69e89e82bdb47646c4812083/11f2be5d-6dd4-490b-b0a8-754abda85883.mp4" },
  { name: "Problem Agitation", id: "9HNmgZxQifJP0m", desc: "Show the problem at its worst", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1688175742215548/69ff9e8d08c1a6eaf9125217/2ed207c4-7158-4183-9feb-e20e9c970392.mp4" },
  { name: "Reaction Video", id: "IUMTcnn4yHmdse", desc: "Someone reacting in real time", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1491285256026991/69fd113d9f9320f2b1a48d73/c6f4d264-30df-4330-ae29-5e730a3df744.mp4" },
  { name: "Review", id: "Twlhm409ycfr0y", desc: "A real review, read or shown", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2279677339507921/69fefb6808c1a6eaf90e2ea6/5682c1a2-0237-4b41-bb49-768d66ef682a.mp4" },
  { name: "Screen Recording", id: "dJ7bOZvx1KCtUY", desc: "Phone or computer screen, straight", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1122214257641545/69ff277208c1a6eaf90fe0d1/228c591f-ecb8-4f6d-9c48-fe83e065d887.mp4" },
  { name: "Social Proof Mashup", id: "JtHL5zDz7mee39", desc: "Many pieces of proof, cut fast", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1518474793119276/69ff091808c1a6eaf90ecc72/8a017948-79b6-4dec-ac1a-a3721a64379f.mp4" },
  { name: "Stitch", id: "Wh1EFfauvrcBtT", desc: "Start with their video, cut to your reply", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2062149124576879/69bd6f523ea14393201d2b09/8df11f86-2a09-4802-b268-ddbba7048c42.mp4" },
  { name: "Stop Motion", id: "Ff8KG7xPuKvQqB", desc: "Frame-by-frame animation", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1464761611995002/69cfa69e4dbfa8a40ba7dd1f/b07a9e36-c6c7-4cc6-8871-a11822781240.mp4" },
  { name: "Street Interview", id: "FPGeZ7LBgpc6ob", desc: "Man-on-the-street style", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1494670028833663/69fcf9149f9320f2b1a37296/ce84b33c-606a-4ec2-b072-680b028db10c.mp4" },
  { name: "Time Lapse", id: "O18lIcshH8Locj", desc: "Sped-up footage of a change", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1599755551687991/69ffcf3508c1a6eaf91338f8/edf04e7e-643e-45f0-80b4-3abef613c224.mp4" },
  { name: "Transformation", id: "RPiqUMprAeQDRS", desc: "The change, in one tight cut", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1701051874670072/69ff213208c1a6eaf90fb4cc/9ffedfd1-3295-4f2e-81c9-3499b5ac5097.mp4" },
  { name: "Trend", id: "2wbMtE3V2KPJ85", desc: "A current trend, used right", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2187963178620533/69fa179746012bac5d838913/f541cffa-9511-4d82-b173-fa35dd8f6f02.mp4" },
  { name: "Unboxing", id: "82alellAfOUPLv", desc: "Opening the box on camera", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1495050481989422/69ff123e08c1a6eaf90f40c3/0da0dbd7-27f1-40bb-9cd1-433e11f3f150.mp4" },
  { name: "Whiteboard Explainer", id: "qe6tHLeuc7eghe", desc: "A whiteboard, a marker, an explanation", thumb: "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/9385028881518631/67a39cd00a70ccc0c5991b54/f904cb0a-4e77-4ce9-ac79-2ec0c0a362b4.mp4" },
];

// Per-format guidance — Description + Why It Works + Hook Tactic from
// the Softr Formats table (`p69Bcs6TjD5kiM`). Pulled 2026-05-19. Refresh
// from there when guidance changes. Used as `format_guidance` in the
// payload — when multiple formats are picked, the AI route concatenates
// them as "Demo: ... | Before and After: ... | Review: ...".
const FORMAT_GUIDANCE = {
  "AI Generated": "Imagery your camera couldn't capture. Surreal scenes, impossible visuals, characters that don't exist in real life — generated to land a hook your audience hasn't seen before. Why it works: AI-generated visuals signal 'you haven't seen this before' the second they hit the feed. That novelty buys the first second of attention. Voiceover or caption then has the easier job of connecting the image back to the product. Hook tactic: Pattern Interrupt, Curiosity Gap, Revelation / Secret",
  "ASMR": "Show your product through sound. Tapping the lid, the crinkle of packaging, the pour, the squeeze. Audiences slow down for tactile detail — and your product becomes the texture, not the pitch. Why it works: ASMR cuts through the scroll because it whispers instead of shouts. No voiceover, no hard sell — just sensory closeness. Viewers stick around for the satisfaction, and the product becomes a feeling instead of a feature list. Hook tactic: Pattern Interrupt, Relatability, Curiosity Gap",
  "Before and After": "One frame of the before. One frame of the after. The space between is your product. Skin, body, home, dashboard, bank balance — whatever your audience is trying to change, show them the gap closing. Why it works: Before and After does the convincing without selling. Viewers see themselves in the 'before' and project themselves into the 'after' — your product becomes the only missing piece. The proof is the image, not the script. Hook tactic: Before / After, Desired Outcome, Curiosity Gap",
  "Behind The Scenes": "Show the part of the brand the audience never sees — how the product is made, who's making it, what the team looks like off-camera. Less pitch, more peek behind the curtain. Why it works: People buy from brands they trust, and trust comes from feeling like they know you. BTS quietly answers 'who is behind this?' and builds the credibility polished ads can't. Especially powerful for founder-led and craft brands. Hook tactic: Revelation / Secret, Story Setup, Confession / Vulnerability",
  "Celebrity": "A face your audience already trusts. Borrowed authority — your product gets a few seconds in the hands of someone the algorithm already knows, and your reach jumps before they say a word. Why it works: Celebrity stops the scroll on recognition alone. The credibility transfer is immediate — viewers don't have to be convinced the product is worth their time, the face has done that work. Best deployed lower in the funnel where the audience already knows the brand exists. Hook tactic: Social Proof, Authority / Credibility, Pattern Interrupt",
  "Cinematic B-Roll": "Brand-led, beautifully shot moments of your product in use. No talking heads, no overlays — just imagery your audience would screenshot. Best when you've earned the right to be visual without explanation. Why it works: Cinematic B-roll signals 'this brand has its act together' in the first second. The polish is the credibility — and when the visuals are this strong, the brand can afford to whisper instead of shout. Pair with a caption that earns the look. Hook tactic: Desired Outcome, Pattern Interrupt, Story Setup",
  "Comment Response": "Frame the ad as a reply. A real comment lives on screen — 'does this actually work?', 'but what about X?' — and the creator answers, on camera or with a demo. Feels native, feels honest, feels not like an ad. Why it works: Comment Response disguises the ad as a conversation. The viewer doesn't feel pitched — they feel like they walked in on someone genuinely answering a question, and the answer happens to involve your product. Perfect for handling objections without sounding defensive. Hook tactic: Direct Question, Confession / Vulnerability, Revelation / Secret",
  "Demo": "Show it working. Hands using the product, the result happening in real time. No explanation needed if the demo is clear — viewers learn what your product does by watching it do it. Why it works: Demos answer 'what does it actually do?' before the viewer has to wonder. The clarity of seeing the product perform replaces a paragraph of features — and when the result on screen is satisfying, that satisfaction is what gets remembered. Hook tactic: Desired Outcome, Curiosity Gap, Pattern Interrupt",
  "Duet": "Splitscreen with another video — usually a viral clip, a customer review, or a reaction. The format puts your brand right next to something the algorithm is already pushing. Why it works: Duet is a piggyback. The original clip earns the attention; your reaction earns the conversion. Especially powerful when the source clip is already trending — viewers stay because they're invested in that video, not your ad. Hook tactic: Pattern Interrupt, Social Proof, Contrarian",
  "Educational": "Teach the viewer something they didn't know. The problem, the science, the why behind the product. Not 'buy this' — 'here's what's happening, and here's how to fix it.' Why it works: Educational content earns trust before it earns the sale. Viewers stay because they're learning, not being pitched — and the brand that does the educating gets credited as the expert. Especially strong for unaware audiences who don't even know the product category exists yet. Hook tactic: Revelation / Secret, Authority / Credibility, Statistics / Numbers",
  "Expert Explainer": "An authority explains the product or the problem — doctor, coach, engineer, dermatologist, dentist. The credibility lives in who's saying it, not what's being said. Let the expertise carry the script. Why it works: Expert Explainer pre-empts the 'but is this real?' doubt by leading with a credentialed person. Viewers don't have to evaluate the claim — the title or qualification has done that work. Pairs especially well with categories where the buyer feels out of their depth. Hook tactic: Authority / Credibility, Revelation / Secret, Contrarian",
  "Founder": "You, on camera. Why you built this, what was broken about every other option, what you'd want a friend to know before they bought. Most powerful when it sounds like you'd say the same thing at a dinner party. Why it works: Founder content carries weight because it's the only person in the brand who has nothing to gain from lying about the product. Viewers can tell the difference between a paid talking head and a person whose name is on the company — and the bias is in your favour. Hook tactic: Confession / Vulnerability, Story Setup, Contrarian",
  "Greenscreen": "You on camera, with a screenshot, article, tweet, or review sitting behind you. Point at it, react to it, walk through it. The visual reference does half the storytelling so you don't have to. Why it works: Greenscreen gives the viewer two things at once — a face to trust and a visual to read. The eye stays moving between speaker and background, which keeps watch time high. Ideal for reacting to press, reviews, comments, or competitor claims. Hook tactic: Revelation / Secret, Social Proof, Contrarian",
  "Grid Swap": "Frame stays the same; one element swaps in and out. A drink, a product, an outfit, a tool. The repetition trains the eye, and the swap lands the point — your product is the one that fits. Why it works: Grid Swap works because the brain notices change. The static frame builds rhythm, the swap breaks it — and your product is the disruption. Ideal for category comparisons or 'this not that' framing without ever needing to badmouth a competitor. Hook tactic: Pattern Interrupt, Before / After, Desired Outcome",
  "How To": "Walk the viewer through it — step one, step two, result. The product is a tool inside the lesson, not the lesson itself. Best when the steps are simple enough that the viewer feels they could do it tonight. Why it works: How-To earns the watch because the viewer is getting something useful out of it. The product slots in as the helper, not the hero — which makes the ad feel like content. Especially strong when the audience is mid-funnel and asking 'how do I actually do this?' Hook tactic: Direct Question, Desired Outcome, Curiosity Gap",
  "Humour": "Lead with the laugh, land the product on the punchline. Skits, awkward characters, dry one-liners. Humour disarms the viewer before they realise it's an ad. Why it works: Humour is the cheapest distance between you and someone who didn't know they needed your product. Laughter lowers the guard, and on the back of the joke, the product feels like a friend's recommendation — not a sales pitch. The best ones get remembered and shared, which is its own scale lever. Hook tactic: Pattern Interrupt, Relatability, Confession / Vulnerability",
  "Influencer Endorsement": "A creator your audience already follows, with your product in their hands. Less polished than celebrity, more credible than a brand ad — viewers trust it because they trust the person, not the spend. Why it works: Influencer Endorsement borrows trust the brand hasn't earned yet. The creator's voice carries weight their followers have already validated — so the product gets the credibility before the brand has to prove anything. Strongest when the creator-brand fit feels obvious to the viewer. Hook tactic: Social Proof, Confession / Vulnerability, Relatability",
  "Listicle": "Numbered, snappy, easy to follow. '3 reasons I switched', '5 things I wish I knew', 'Top 4 features I actually use.' The structure does the watch-time work — viewers stay because they want to know what number five is. Why it works: Listicle gives the viewer a finish line — '5 things' sets a clear endpoint, and the brain wants to get there. The format also makes the content feel like advice instead of an ad, especially when the list is genuinely useful. Hook tactic: Statistics / Numbers, Curiosity Gap, Desired Outcome",
  "Meme": "A current meme, used the way it's actually used. Same template, same timing, same beat — your product just shows up where the punchline normally lands. Done right, viewers double-tap before they clock it's an ad. Why it works: Meme works because the format is already familiar. Viewers recognise the template, the brain auto-completes the joke, and your product gets credited as part of the in-group. Risk is staleness — meme ads age in days, not months, so speed of execution matters as much as the idea. Hook tactic: Pattern Interrupt, Relatability, Contrarian",
  "Montage": "Many shots, cut fast. Product in use, customers smiling, results stacking — montage gives you breadth without making any single moment carry the whole load. Best when each cut is interesting enough on its own. Why it works: Montage telegraphs scale — 'look how many people, how many uses, how many results' — without ever saying it out loud. The pace also makes it hard to look away; the next cut is faster than the viewer's instinct to scroll. Hook tactic: Pattern Interrupt, Social Proof, Desired Outcome",
  "POV": "Shot from the viewer's perspective. Camera angle mimics what they'd see if it were their hands, their morning, their day. Pairs naturally with 'POV: you finally fixed X' framing. Why it works: POV collapses the distance between the viewer and the product. Instead of watching someone else use it, they're watching themselves use it — and the imagined ownership does most of the conversion work for you. Hook tactic: Relatability, Story Setup, Desired Outcome",
  "Pattern Interrupt": "An opening that has nothing obvious to do with the product. A loud sound, an odd object, a sentence that doesn't make sense yet. The job is one thing: stop the thumb. Connection to the brand earns its way in after. Why it works: Most scrollers decide in under a second. Pattern Interrupt wins that second by refusing to look like an ad — confusion buys curiosity, and curiosity buys the next three seconds where you actually get to land a message. Hook tactic: Pattern Interrupt, Curiosity Gap, Contrarian",
  "Podcast": "Two people, mics, jump cuts, subtitle bar. Looks like a podcast clip the algorithm pulled in from a longer episode — and your product gets mentioned the way friends mention things they've tried, not the way ads sell them. Why it works: The podcast clip is one of the most-consumed formats on every platform right now. Viewers expect to learn something or hear an opinion — so the bar to keep them watching is lower, and the trust is higher than a polished ad would earn. Hook tactic: Story Setup, Revelation / Secret, Confession / Vulnerability",
  "Postit": "Sticky notes around the product. Each one calls out a benefit, a use case, a stat. Scrappy, low-fi, handwritten — feels like internal notes the viewer wasn't meant to see. Why it works: Post-It earns attention by looking nothing like an ad. The handwritten format reads as honest — like a friend's notes rather than a brand's claims. Especially strong when each note answers a real objection. Hook tactic: Curiosity Gap, Revelation / Secret, Statistics / Numbers",
  "Press": "Logos, headlines, article screenshots. 'As seen in Vogue, Forbes, GQ.' You don't have to explain why the product is credible — the publication does it for you. Why it works: Press collapses the trust-building stage. Viewers already trust the publication; the brand inherits that trust in one frame. Best deployed when the buyer is already considering the product and just needs a final reason to commit. Hook tactic: Authority / Credibility, Social Proof, Statistics / Numbers",
  "Problem Agitation": "Show the problem at its worst. The frustration moment, the messy bathroom, the failed attempt, the third product that didn't work. Make the viewer feel the pain before you offer the way out. Why it works: Problem Agitation works because viewers don't act until the pain feels current. Watching the problem on screen makes yesterday's annoyance feel like today's emergency — and your product becomes the obvious response. Hook tactic: Pain / Problem, Relatability, Confession / Vulnerability",
  "Reaction Video": "Someone reacting in real time — to a clip, a comment, a first-try of your product. Face up, expressions big, the reaction is the content. The viewer comes for the face, stays for the context. Why it works: Reaction Video borrows two viewer instincts at once — the desire to watch someone's face mid-emotion, and the desire to know what they're reacting to. Both keep the thumb still long enough for the brand to land its point. Hook tactic: Pattern Interrupt, Curiosity Gap, Relatability",
  "Review": "A real review — read aloud, screenshotted, or shown over product footage. Five stars, specific words, the bits customers wrote unprompted. The review carries the script; the product just shows up alongside it. Why it works: Review works because the words aren't yours. Viewers discount what the brand says about itself but trust what a stranger with no skin in the game wrote at 11pm after using the product. The credibility is in the third-party voice. Hook tactic: Social Proof, Confession / Vulnerability, Direct Question",
  "Screen Recording": "Phone or computer screen, recorded straight. App walkthroughs, scrolling through reviews, side-by-side comparisons in the browser. No actor needed — just the screen and a clear point. Why it works: Screen Recording feels native to how viewers already use their phones. There's no 'production' to disbelieve — the screen is the screen. Especially powerful when the recording shows real numbers, real reviews, or a real-time comparison. Hook tactic: Revelation / Secret, Curiosity Gap, Direct Question",
  "Skit": "A mini-story with characters. 'Old me vs new me', the friend explaining the product to the sceptic, the awkward moment before the product saves the day. Comedy as the wrapper, product as the punchline. Why it works: Skit lowers the viewer's guard by being entertainment first. The brain doesn't categorise it as an ad until it's already watched. And because the product solves a dramatised problem, the value lands without needing a pitch. Hook tactic: Relatability, Pattern Interrupt, Story Setup",
  "Social Proof Mashup": "Many pieces of proof, cut together fast. UGC, screenshots of reviews, star ratings, press logos, before & afters — all stacked into one asset that tells the viewer one thing: a lot of people already trust this. Why it works: Social Proof Mashup works lower in the funnel because the buyer is already weighing the decision. Stacking proof at speed crowds out the doubt — they don't need to evaluate any one piece, just the weight of all of it together. Hook tactic: Social Proof, Statistics / Numbers, Authority / Credibility",
  "Stitch": "TikTok stitch — the first few seconds of someone else's video, then a cut to your reply. The original sets up the tension; your half resolves it with your product, your take, or your evidence. Why it works: Stitch piggybacks on the original creator's audience and framing. Viewers already invested in the source clip stick around for the reply — and the brand gets a moment of borrowed momentum it would have had to earn from scratch. Hook tactic: Contrarian, Revelation / Secret, Direct Question",
  "Stop Motion": "Frame-by-frame animation. Products that build themselves, ingredients that float into place, characters made of objects. The craft of the motion is the hook — viewers stay to see how it was made. Why it works: Stop Motion is rare in the feed, which is its biggest advantage. The thumb hovers because the motion looks intentional in a way most ads don't — and intentional feels like effort, which feels like quality. Hook tactic: Pattern Interrupt, Curiosity Gap, Desired Outcome",
  "Street Interview": "Man-on-the-street style. A creator with a mic, real people, real answers. 'What's your biggest issue with X?' 'Rate this 1 to 10.' The spontaneity does the credibility work. Why it works: Street Interview can't be faked easily. Real reactions from real strangers carry weight that scripted UGC can't. The format also creates surprise — viewers don't know what the next person will say, so they keep watching to find out. Hook tactic: Direct Question, Pattern Interrupt, Social Proof",
  "Testimonial": "A real customer, on camera, telling their story. The pain before, what they tried, what changed when the product showed up. The script is theirs; the brand just gives them the floor. Why it works: Testimonial works because the buyer can see themselves in the customer. The story isn't 'this product is great' — it's 'here's someone like me whose problem went away.' The imagined transfer is the whole pitch. Hook tactic: Social Proof, Confession / Vulnerability, Before / After",
  "Time Lapse": "Sped-up footage of a transformation — skin clearing, the room being tidied, the plant growing, the dashboard filling up. The fast-forward makes the change feel inevitable. Why it works: Time Lapse compresses the proof. What would take weeks of use is shown in seconds — the viewer's brain accepts the transformation as 'fast and easy' even when the real-world timeline is longer. Pair with on-screen timestamps for honesty. Hook tactic: Before / After, Desired Outcome, Statistics / Numbers",
  "Transformation": "The change, on camera, in one continuous take or tight cut. Skin clearing, hair styled, room reset, body changed. Differs from Before and After by showing the journey instead of the two endpoints. Why it works: Transformation works because the viewer watches the proof unfold. There's no faith required — the change is happening in front of them. Especially powerful when the moment of change feels physical or emotional, not just visual. Hook tactic: Before / After, Desired Outcome, Curiosity Gap",
  "Trend": "A current TikTok / Reels trend, used the way the platform is using it. Same sound, same template, same beat — your product slots in where the joke or pattern normally goes. Why it works: Trend rides momentum the brand didn't build. The viewer's already primed for the format and the sound; your product gets carried by the wave. Speed of execution beats polish — by the time you perfect a trend ad, the trend is over. Hook tactic: Pattern Interrupt, Relatability, Social Proof",
  "Try-On": "Trying the product on, on camera. Outfit changes, makeup swatches, accessories, glasses. The viewer sees the product in real proportion on a real person — and starts imagining it on themselves. Why it works: Try-On answers the silent question every wearable-product buyer has: 'will this look right on me?' Seeing it on someone close to their proportions or skin tone is worth more than any product photo could deliver. Hook tactic: Desired Outcome, Relatability, Social Proof",
  "Unboxing": "Opening the box on camera. Packaging, paper, the product in its first moment. The viewer is curious about the same things the buyer would be — how it feels, what's inside, whether it lives up to the brand's image. Why it works: Unboxing taps the buyer's anticipation moment. Even people who haven't ordered yet feel the small thrill of opening a package — and the brand gets to control how that first impression looks, before the buyer ever sees it in real life. Hook tactic: Curiosity Gap, Desired Outcome, Pattern Interrupt",
  "Whiteboard Explainer": "A whiteboard, a marker, and an explanation. Concept drawn out as you talk through it — the visuals build with the argument, so the viewer learns at the same speed you teach. Why it works: Whiteboard works because the act of drawing slows the viewer down to the speed of understanding. Each stroke is a small reveal — and the brand earns expert positioning just by walking through the why. Hook tactic: Authority / Credibility, Revelation / Secret, Statistics / Numbers",
  "Yapper": "Creator talking straight to camera. No props, no setup, no cuts — just face, words, and energy. The opener does all the heavy lifting because that's all there is to lift. Why it works: Yapper is the most native format on TikTok and Reels — it looks like the content the viewer already follows. The lack of production reads as honest, and the energy of the creator carries the watch when the message alone wouldn't. Hook tactic: Confession / Vulnerability, Call Out, Relatability",
};

// Hook type per format — from formats table `Hook type` (SiwIX). Pulled 2026-07-09.
const FORMAT_HOOK_TYPES = {
  "AI Generated": "Visual Action, Caption",
  "ASMR": "Visual Action, Caption",
  "Before and After": "Visual Action, Caption",
  "Behind The Scenes": "Visual Action, Voiceover",
  "Celebrity": "Visual Action, Caption",
  "Cinematic B-Roll": "Visual Action, Caption",
  "Comment Response": "Caption, Voiceover",
  "Demo": "Visual Action, Voiceover",
  "Duet": "Visual Action, Caption",
  "Educational": "Voiceover, Caption",
  "Expert Explainer": "Voiceover, Visual Action",
  "Founder": "Voiceover, Visual Action",
  "Greenscreen": "Visual Action, Voiceover",
  "Grid Swap": "Visual Action, Caption",
  "How To": "Voiceover, Visual Action",
  "Humour": "Visual Action, Voiceover",
  "Influencer Endorsement": "Voiceover, Visual Action",
  "Listicle": "Caption, Voiceover",
  "Meme": "Caption, Visual Action",
  "Montage": "Visual Action, Caption",
  "POV": "Visual Action, Caption",
  "Pattern Interrupt": "Visual Action, Voiceover",
  "Podcast": "Voiceover, Caption",
  "Postit": "Caption, Visual Action",
  "Press": "Caption, Visual Action",
  "Problem Agitation": "Visual Action, Voiceover",
  "Reaction Video": "Visual Action, Voiceover",
  "Review": "Caption, Voiceover",
  "Screen Recording": "Visual Action, Voiceover",
  "Skit": "Visual Action, Voiceover",
  "Social Proof Mashup": "Visual Action, Caption",
  "Stitch": "Visual Action, Voiceover",
  "Stop Motion": "Visual Action, Caption",
  "Street Interview": "Voiceover, Visual Action",
  "Testimonial": "Voiceover, Visual Action",
  "Time Lapse": "Visual Action, Caption",
  "Transformation": "Visual Action, Voiceover",
  "Trend": "Visual Action, Caption",
  "Try-On": "Visual Action, Voiceover",
  "Unboxing": "Visual Action, Voiceover",
  "Whiteboard Explainer": "Voiceover, Visual Action",
  "Yapper": "Voiceover, Visual Action",
};