// Static data for the onboarding flow.

const STEPS = [
  { id: "team",        label: "Team" },
  { id: "personalize", label: "Personalize" },
  { id: "pricing",     label: "Plan" },
  { id: "checkout",    label: "Checkout" },
];

const WORK_TYPE_OPTIONS = [
  { id: "agency",     label: "Agency" },
  { id: "brand",      label: "Brand" },
  { id: "app",        label: "App or Game" },
  { id: "software",   label: "Software" },
  { id: "freelancer", label: "Freelancer" },
  { id: "solo",       label: "Solo creator" },
  { id: "other",      label: "Other" },
];

const HEARD_FROM_OPTIONS = [
  { id: "twitter",   label: "X / Twitter" },
  { id: "linkedin",  label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok",    label: "TikTok" },
  { id: "google",    label: "Google Search" },
  { id: "youtube",   label: "YouTube" },
  { id: "newsletter",label: "Newsletter" },
  { id: "podcast",   label: "Podcast" },
  { id: "wom",       label: "Word of mouth" },
  { id: "friend",    label: "Friend / colleague" },
  { id: "client",    label: "From a client" },
  { id: "ad",        label: "An ad I saw" },
  { id: "other",     label: "Other" },
];

const FEATURES = [
  { key: "review",     label: "AI video review",       Icon: () => <Icons.Eye size={14} /> },
  { key: "briefs",     label: "Briefs & checklists",   Icon: () => <Icons.FileText size={14} /> },
  { key: "qa",         label: "26-item QA scoring",    Icon: () => <Icons.BadgeCheck size={14} /> },
  { key: "storyboard", label: "Storyboard view",       Icon: () => <Icons.LayoutGrid size={14} /> },
  { key: "remix",      label: "Remix & revisions",     Icon: () => <Icons.Shuffle size={14} /> },
];

const PLANS = [
  {
    id: "creator",
    tier: "Creator",
    monthly: 59,
    yearly: 588,
    desc: "For solo founders and freelancers reviewing their own UGC.",
    maxVideos: 30,
    maxWorkspaces: 1,
    maxUsers: 1,
    extras: ["Slack & email support"],
  },
  {
    id: "crew",
    tier: "Crew",
    monthly: 99,
    yearly: 1068,
    desc: "The winning ad workflow for growing brands and small teams.",
    maxVideos: 100,
    maxWorkspaces: 5,
    maxUsers: 5,
    extras: ["Priority support", "Shared brief library"],
    popular: true,
  },
  {
    id: "studio",
    tier: "Studio",
    monthly: 249,
    yearly: 2388,
    desc: "Scaled review for agencies running multiple brand accounts.",
    maxVideos: 500,
    maxWorkspaces: 10,
    maxUsers: 10,
    extras: ["Dedicated CSM", "API access", "SSO & audit log"],
  },
];

const TRIAL_FEATURES = [
  { sticker: "assets/rocket.png",          title: "7 days free", body: "Full access. Cancel anytime." },
  { sticker: "assets/eyes-blue.png",       title: "Money back",  body: "15-day refund guarantee." },
  { sticker: "assets/icon-sparkles.png",   title: "Stripe-secure", body: "We never store card details." },
  { sticker: "assets/fire.png",            title: "Instant setup", body: "Reviewing in under 5 minutes." },
];

const SOCIAL_LOGOS = ["VAYNERMEDIA", "ClickFunnels", "True Classic", "Hello Bello", "Canva", "Jellysmack"];

const yearlySavingsPct = (plan) => {
  const fullYear = plan.monthly * 12;
  return Math.round(((fullYear - plan.yearly) / fullYear) * 100);
};
const MAX_YEARLY_SAVINGS = Math.max(...PLANS.map(yearlySavingsPct));

window.Brieflee = {
  STEPS, WORK_TYPE_OPTIONS, HEARD_FROM_OPTIONS, FEATURES, PLANS,
  TRIAL_FEATURES, SOCIAL_LOGOS, yearlySavingsPct, MAX_YEARLY_SAVINGS,
};
