// /settings · Plans and Billing tab
//
// Lifts the design Bev had on the existing native column-container
// block: "You are currently on: <tier> plan" heading, "Credits Renew
// on: <date>" subhead, then a 4-column grid of progress-bar stat cards
// (Videos / Team / Workspaces) with an actions card on the right
// (Manage billing + Change plan).
//
// Data source: the usage table (brieflee beta DB, id dw2IeLOtYJLulR).
// Usage joins to accounts + subscriptions + billing + pricing,
// exposing tier / max-* / total-* / *_remaining values as LOOKUP and
// FORMULA fields on one row.
//
// Billing is PER USER (not per workspace) — a user with multiple
// workspaces still only has ONE usage row that holds their plan tier,
// max videos, etc. So we list-and-take-first from the usage table
// rather than trying to fetch by URL workspace id (the URL passes an
// account id, not a usage id).
//
// SOFTR CONFIG REQUIRED:
//   Source tab: bind to USAGE. The Source filter should restrict to
//   the logged-in user (e.g. `user includes exactly current user id`)
//   so this list returns the user's one usage row in preview/live mode.

import { useRecords, q } from "@/lib/datasource";
import { Video, Users, Layers } from "lucide-react";

const CHANGE_PLAN_PATH = "/plan";
// In-app billing page: invoices, payment history, payment method.
const MANAGE_BILLING_PATH = "/billing";
// Stripe Customer Portal login, used for CANCELLATION only. External
// site: always opens in a new tab, never a modal.
const STRIPE_PORTAL_URL = "https://billing.stripe.com/p/login/5kQeVe3eTcHmfIp9OFcAo00";
const MODAL_SIZE = "xl"; // 'sm' | 'md' | 'lg' | 'xl'

// ─── Brand palette ────────────────────────────────────────────
const BL_NAVY = "#000F4D";
const BL_DEEP = "#001364";
const BL_PERIWINKLE = "#879CF7";
const BL_BORDER = "rgba(217, 224, 255, 0.55)";
const BL_TRACK = "rgba(217, 224, 255, 0.6)";
const BL_MUTED = "#6B7A99";

// usage table field aliases — names kept identical to the prior accounts
// binding so the rendering layer doesn't need to change. Field IDs swap
// to the usage equivalents (LOOKUP / FORMULA fields on usage that resolve
// through its linked accounts / subscription / billing / pricing rows).
//
// `paymentStatus` (LOOKUP from billing) is the source of truth for
// whether the user is on a paid plan. Anything else puts the block into
// the FREE PLAN state: stat cards collapse to 0 / 0, heading becomes
// "Free plan", primary CTA becomes "Upgrade plan".
//
// Billing is annual with a 30-day 100% money-back guarantee. There is no
// trial, so no copy here counts one down. The legacy "trial" values are
// still accepted as paying statuses and still render their own badge,
// because a handful of older billing rows carry them.
const select = q.select({
  // Primary field of the usage table — useRecord requires it.
  id:                         "coEny",
  paymentStatus:              "myX6T", // payment_status (LOOKUP via billing)
  subscriptionTier:           "Uhc4j", // subscription_tier (LOOKUP)
  trialEnd:                   "FXA2x", // trial_end (LOOKUP via users)
  cycleEnd:                   "uxb26", // cycle_end (LOOKUP — next payment date)
  subscriptionProductName:    "eA3R2", // plan (FORMULA)
  subscriptionInterval:       "11KIV", // interval (LOOKUP via billing/pricing)
  subscriptionMaxVideos:      "rXOcE", // max_videos (LOOKUP)
  subscriptionMaxWorkspaces:  "Kejms", // max_workspaces (FORMULA)
  subscriptionMaxMembers:     "UnMPU", // max_members (FORMULA)
  videosRemaining:            "1Ghgt", // videos_remaining (FORMULA)
  workspacesRemaining:        "TMIgG", // workspaces_remaining (FORMULA)
  membersRemaining:           "yYgqq", // members_remaining (FORMULA)
  totalVideos:                "LEsiQ", // total_videos (LOOKUP)
  totalWorkspaces:            "XeuO9", // total_workspaces (LOOKUP)
  totalUsers:                 "6J1sE", // total_members (LOOKUP)
});

// Anything in this set keeps the user on the paid/trial layout.
// Anything else (null, "incomplete", "past_due", "canceled", "unpaid",
// "free", etc.) flips the block into FREE PLAN state.
const PAYING_STATUSES = new Set(["paid", "trial", "trialing", "active"]);

export default function Block() {
  // List the user's usage rows (Softr Source filter restricts to the
  // logged-in user). Take the first — billing is per-user, the user
  // only ever has one usage row even with multiple workspaces.
  const { data, status } = useRecords({ select, count: 1 });
  const record =
    data?.pages?.[0]?.items?.[0] ??
    (Array.isArray(data) ? data[0] : null);

  if (status === "pending") {
    return <Shell><Loading /></Shell>;
  }
  if (status === "error" || !record || !record.fields) {
    return <Shell><Loading message="Couldn't load billing." error /></Shell>;
  }

  const f = record.fields;
  const tier            = unwrap(f.subscriptionTier);
  const productName     = unwrap(f.subscriptionProductName) || tier;
  const interval        = unwrap(f.subscriptionInterval);
  const paymentStatus   = unwrap(f.paymentStatus).toLowerCase();
  // The renewal date. cycle_end is the real one; trial_end only exists on
  // older rows and is kept purely as a fallback when cycle_end is blank.
  const trialEnd        = unwrap(f.trialEnd);
  const cycleEnd        = unwrap(f.cycleEnd);

  // Single source of truth: are they on a paying plan?
  // Anything else collapses to the Free Plan layout.
  const isOnPaidPlan = PAYING_STATUSES.has(paymentStatus);

  // StatusBadge prefers the literal payment_status so it can show
  // "Trial" vs "Active" vs "Past due" accurately.
  const statusLabel = paymentStatus;

  const videosUsed = isOnPaidPlan ? num(f.totalVideos)     : 0;
  const videosMax  = isOnPaidPlan ? num(f.subscriptionMaxVideos)     : 0;
  const teamUsed   = isOnPaidPlan ? num(f.totalUsers)      : 0;
  const teamMax    = isOnPaidPlan ? num(f.subscriptionMaxMembers)    : 0;
  const wsUsed     = isOnPaidPlan ? num(f.totalWorkspaces) : 0;
  const wsMax      = isOnPaidPlan ? num(f.subscriptionMaxWorkspaces) : 0;

  const openModalPath = (path) => {
    if (typeof window === "undefined") return;
    if (typeof window.openSwModal === "function") {
      window.openSwModal(path, MODAL_SIZE);
    } else {
      window.location.href = path;
    }
  };

  const handleChangePlan = () => openModalPath(CHANGE_PLAN_PATH);
  const handleManageBilling = () => {
    if (typeof window === "undefined") return;
    window.location.href = MANAGE_BILLING_PATH;
  };

  return (
    <Shell>
      {/* ── Heading row ── */}
      <header className="pb-heading">
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-3"
          style={{
            backgroundColor: "rgba(135, 156, 247, 0.10)",
            color: BL_PERIWINKLE,
            border: `1px solid ${BL_PERIWINKLE}40`,
          }}
        >
          <span
            className="rounded-full"
            style={{ width: 6, height: 6, backgroundColor: BL_PERIWINKLE }}
          />
          Plans and Billing
        </div>
        <h2 className="pb-heading-title">
          {isOnPaidPlan ? (
            <>
              You are currently on:{" "}
              <span className="pb-heading-tier">{productName || tier}</span>{" "}
              {interval && <span className="pb-heading-interval">({interval})</span>}{" "}
              plan
            </>
          ) : (
            <>Free plan</>
          )}
          {isOnPaidPlan && <StatusBadge status={statusLabel} />}
        </h2>
        {isOnPaidPlan ? (
          (cycleEnd || trialEnd) && (
            <p className="pb-heading-sub">
              Renews on {formatDate(cycleEnd || trialEnd)}
            </p>
          )
        ) : (
          <p className="pb-heading-sub">
            Pick a plan to start checking creator videos against your own brief.
            Billed annually, with 30 days at 100% back.
          </p>
        )}
      </header>

      {/* ── 4-column grid ── */}
      <div className="pb-grid">
        <StatCard
          icon={Video}
          label="Video reviews"
          used={videosUsed}
          max={videosMax}
          isOnPaidPlan={isOnPaidPlan}
        />
        <StatCard
          icon={Users}
          label="Seats"
          used={teamUsed}
          max={teamMax}
          isOnPaidPlan={isOnPaidPlan}
        />
        <StatCard
          icon={Layers}
          label="Brand profiles"
          used={wsUsed}
          max={wsMax}
          isOnPaidPlan={isOnPaidPlan}
        />
        <ActionsCard
          isOnPaidPlan={isOnPaidPlan}
          onChangePlan={handleChangePlan}
          onManageBilling={handleManageBilling}
        />
      </div>
    </Shell>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function Shell({ children }) {
  return (
    <div
      className="flex flex-col"
      style={{
        background: "#FAFBFF",
        borderRadius: "16px",
        padding: "12px 0 48px",
      }}
    >
      <Style />
      <div className="settings-pb container mx-auto px-4 w-full" style={{ maxWidth: 1140 }}>
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, used, max, isOnPaidPlan }) {
  const safeMax = Number.isFinite(max) ? Math.max(0, max) : 0;
  const safeUsed = Number.isFinite(used) ? Math.max(0, used) : 0;
  const pct = safeMax > 0 ? Math.min(100, Math.round((safeUsed / safeMax) * 100)) : 0;
  const over = isOnPaidPlan && safeMax > 0 && safeUsed > safeMax;

  return (
    <div className="pb-card">
      <div className="pb-card-head">
        <Icon className="pb-card-icon" size={16} />
        <span className="pb-card-label">{label}</span>
      </div>
      <div className="pb-progress-track">
        <div
          className="pb-progress-fill"
          style={{
            width: `${isOnPaidPlan && safeMax > 0 ? pct : 0}%`,
            background: over
              ? "linear-gradient(90deg, #DC2626, #B91C1C)"
              : "linear-gradient(90deg, #879CF7, #294FF6)",
          }}
        />
      </div>
      <div className="pb-card-numbers">
        {`${formatCount(safeUsed)} / ${formatCount(safeMax)}`}
      </div>
    </div>
  );
}

function ActionsCard({ isOnPaidPlan, onChangePlan, onManageBilling }) {
  // Both buttons always render so the actions card sits at a consistent
  // height alongside the three stat cards. Primary CTA label flips to
  // "Upgrade plan" on the free state. Manage billing goes to the in-app
  // /billing page; only Cancel subscription opens the Stripe Customer
  // Portal (new tab), so the sign-in note sits with it.
  return (
    <div className="pb-actions">
      <button
        type="button"
        onClick={onChangePlan}
        className="pb-btn-primary"
      >
        {isOnPaidPlan ? "Change plan" : "Upgrade plan"}
      </button>
      <button
        type="button"
        onClick={onManageBilling}
        className="pb-btn-secondary"
      >
        Manage billing
      </button>
      <a
        href={STRIPE_PORTAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="pb-cancel-link"
      >
        Cancel subscription
      </a>
      <p className="pb-billing-note">
        Within 30 days of paying? Ask us for a full refund instead.
        Cancelling opens Stripe, so use the email you paid with to sign in.
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active:    { fg: "#22A06B", bg: "rgba(34, 160, 107, 0.12)", border: "rgba(34, 160, 107, 0.30)", label: "Active" },
    trial:     { fg: "#879CF7", bg: "rgba(135, 156, 247, 0.12)", border: "rgba(135, 156, 247, 0.30)", label: "Trial" },
    trialing:  { fg: "#879CF7", bg: "rgba(135, 156, 247, 0.12)", border: "rgba(135, 156, 247, 0.30)", label: "Trial" },
    past_due:  { fg: "#C97D3F", bg: "rgba(232, 155, 92, 0.12)", border: "rgba(232, 155, 92, 0.40)", label: "Past due" },
    canceled:  { fg: "#DC2626", bg: "rgba(220, 38, 38, 0.10)",  border: "rgba(220, 38, 38, 0.35)", label: "Canceled" },
    cancelled: { fg: "#DC2626", bg: "rgba(220, 38, 38, 0.10)",  border: "rgba(220, 38, 38, 0.35)", label: "Canceled" },
  };
  // An unrecognised status on a row that got this far is a paying one,
  // so fall back to Active rather than to Trial, which is no longer sold.
  const v = map[String(status || "").toLowerCase()] || map.active;
  return (
    <span className="pb-status-badge" style={{ color: v.fg, background: v.bg, border: `1px solid ${v.border}` }}>
      <span className="pb-status-dot" style={{ background: v.fg }} />
      {v.label}
    </span>
  );
}

function Loading({ message, error }) {
  return (
    <div
      className="text-center"
      style={{ padding: "60px 20px", color: error ? "#D14343" : BL_MUTED }}
    >
      <p className="text-sm">{message || "Loading…"}</p>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function unwrap(raw) {
  if (raw == null) return "";
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    const f = raw[0];
    if (typeof f === "string") return f;
    return f?.label ?? String(f ?? "");
  }
  if (typeof raw === "object") return raw.label ?? "";
  return String(raw);
}
function num(raw) {
  if (raw == null) return null;
  if (Array.isArray(raw)) {
    if (raw.length === 0) return null;
    return Number(raw[0]);
  }
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") return parseFloat(raw);
  return null;
}
function formatCount(n) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-GB");
}
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function Style() {
  return (
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700;800&display=swap');
        .settings-pb * { font-family: 'League Spartan', sans-serif; }

        .pb-heading-title {
          font-size: 24px;
          font-weight: 700;
          color: ${BL_NAVY};
          letter-spacing: -0.012em;
          margin: 0 0 6px;
          line-height: 1.25;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pb-heading-tier {
          color: ${BL_PERIWINKLE};
          font-weight: 700;
        }
        .pb-heading-interval {
          color: ${BL_PERIWINKLE};
          font-weight: 500;
          font-size: 0.85em;
        }
        .pb-heading-sub {
          font-size: 14px;
          color: ${BL_MUTED};
          margin: 0;
          font-weight: 400;
        }

        .pb-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 999px;
        }
        .pb-status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .pb-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        @media (max-width: 900px) {
          .pb-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 520px) {
          .pb-grid { grid-template-columns: 1fr; }
        }

        .pb-card {
          background: #FFFFFF;
          border: 1px solid ${BL_BORDER};
          border-radius: 16px;
          padding: 18px 18px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 1px 3px rgba(0, 15, 77, 0.04);
        }
        .pb-card-head {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pb-card-icon {
          color: ${BL_PERIWINKLE};
          flex-shrink: 0;
        }
        .pb-card-label {
          font-size: 14px;
          font-weight: 600;
          color: ${BL_DEEP};
        }
        .pb-progress-track {
          height: 8px;
          background: ${BL_TRACK};
          border-radius: 999px;
          overflow: hidden;
        }
        .pb-progress-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.5s ease;
        }
        .pb-card-numbers {
          font-size: 14px;
          font-weight: 600;
          color: ${BL_DEEP};
          font-variant-numeric: tabular-nums;
        }

        .pb-actions {
          background: #FFFFFF;
          border: 1px solid ${BL_BORDER};
          border-radius: 16px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
        }
        .pb-btn-primary {
          padding: 8px 16px;
          background: ${BL_PERIWINKLE};
          color: #FFFFFF;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .pb-btn-primary:hover {
          background: #294FF6;
        }
        .pb-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 14px;
          background: transparent;
          color: ${BL_PERIWINKLE};
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          border: 1px solid rgba(135, 156, 247, 0.40);
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .pb-btn-secondary:hover {
          background: rgba(135, 156, 247, 0.10);
          color: #294FF6;
          border-color: rgba(41, 79, 246, 0.55);
        }

        .pb-billing-note {
          font-size: 12px;
          color: ${BL_MUTED};
          line-height: 1.4;
          margin: 0;
          text-align: center;
        }
        .pb-cancel-link {
          font-size: 12px;
          font-weight: 600;
          color: ${BL_MUTED};
          text-align: center;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s ease;
        }
        .pb-cancel-link:hover {
          color: #DC2626;
        }
      `}
    </style>
  );
}
