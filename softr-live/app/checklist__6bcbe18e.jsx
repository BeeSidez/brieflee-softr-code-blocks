// /checklist · Getting-started checklist (v2)
// =====================================================================
// Six setup steps, each marked complete when the matching link/lookup on
// the logged-in USER's row is non-empty. Reads through the standard Vibe
// data layer (useCurrentUser + useRecord). Mural's checklist pattern:
// persistent, drives one-week retention.
//
// While the workspace blueprint is still building, the card shows a
// live "still building" strip and re-checks every few seconds. The
// signal: /set-up stamps localStorage bl-workspace-building {accountId,
// ts} when it fires the build; the strip shows while that stamp is
// fresh AND the stamped account's blueprint_status is still Pending
// (BL | New Workspace sets Complete/Failed when it finishes). The
// accounts `status` field is never read — user groups own it.
//
// SOFTR CONFIG REQUIRED:
//   1. Page: /checklist (its own page; the navbar item opens it in a
//      Softr modal at whatever native size the nav action is set to —
//      the card fills the container width, so every size works).
//   2. Source tab → Database: brieflee beta → Table: users, and ADD
//      the ACCOUNTS table as a second source (the blueprint_status
//      read fetches the stamped account row by id).
//   3. Visibility: the "new user" user group (no self-dismiss in the
//      block; the modal's own close button does that job).
//
// Brand mandate: no emojis in UI.

import { useEffect } from "react";
import { useRecord, q } from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { Check } from "lucide-react";

// users table (brpbVf8sL2xqxV) — link/lookup fields per the schema pull
// 2026-07-27. Link/lookup fields: non-empty array = done.
const select = q.select({
  accounts:     "Nz6VX", // LINKED_RECORD → accounts
  qaChecklist:  "gH54M", // LOOKUP qa_checklist (accounts)
  projects:     "47mpT", // LINKED_RECORD → projects
  briefs:       "3Ww0J", // LINKED_RECORD → briefs
  submissions:  "MjoNq", // LINKED_RECORD → submissions
  members:      "RDGCd", // LINKED_RECORD → members
});

// accounts table (TpAIptRey40yDj) — read via the second source. `name`
// is the primary field (useRecord requires it in the select).
const accountSelect = q.select({
  name:            "aAKkT",
  blueprintStatus: "fElW1", // SELECT Pending/Complete/Failed
});

const ITEMS = [
  { key: "accounts",    label: "Create your workspace",  href: "/get-started" },
  { key: "qaChecklist", label: "Set your quality bar",   href: "/settings" },
  { key: "projects",    label: "Create a project",       href: "/project" },
  { key: "briefs",      label: "Create a brief",         href: "/project" },
  { key: "submissions", label: "Run your first review",  href: "/review" },
  { key: "members",     label: "Invite a teammate",      href: "/settings#tab3" },
];

// Stamped by /set-up when it creates the account; cleared here once the
// workflow flips status building → active.
const BUILDING_KEY = "bl-workspace-building";
// 24h: a closed tab mid-build must still find its way back.
const BUILDING_FRESH_MS = 24 * 60 * 60 * 1000;
const RECHECK_MS = 5000;

const BL_DEEP  = "#000F4D";
const BL_PERI  = "#7A93FF";
const BL_MUTED = "#6B7A99";

function isFilled(v) {
  if (Array.isArray(v)) return v.length > 0;
  if (v && typeof v === "object") return true;
  return Boolean(v);
}

// {accountId, ts} stamped by /set-up when a build starts, or null.
function readBuildingStamp() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BUILDING_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    return p?.accountId && p?.ts ? p : null;
  } catch { return null; }
}
function clearBuildingStamp() {
  try { window.localStorage.removeItem(BUILDING_KEY); } catch { /* ignore */ }
}

export default function Block() {
  const user = useCurrentUser();
  const { data, refetch } = useRecord({ recordId: user?.id, select, enabled: !!user?.id });

  // Blueprint progress on the account /set-up just created: only
  // consulted while the stamp is fresh, so old accounts that predate
  // blueprint_status never trigger the strip.
  const stamp = readBuildingStamp();
  const stampFresh = !!stamp && Date.now() - stamp.ts < BUILDING_FRESH_MS;
  const bp = useRecord({
    recordId: stamp?.accountId,
    select: accountSelect,
    enabled: stampFresh,
  });
  const bpLabel = bp.data?.fields?.blueprintStatus?.label || "";
  // Complete clears the strip. Pending keeps it; Failed keeps it too,
  // with the Finish building link (the customize page re-runs the build).
  const bpFinished = bpLabel === "Complete";
  const building = stampFresh && !bpFinished;
  const bpFailed = bpLabel === "Failed";
  const finishHref = stamp?.accountId ? `/set-up/customize?accountId=${encodeURIComponent(stamp.accountId)}` : "/set-up/customize";

  const fields = data?.fields;

  // While building, re-check every few seconds; once the blueprint
  // finishes (or the stamp ages out) clear it so the strip never
  // reappears.
  useEffect(() => {
    if (!building) {
      if (stamp && (bpFinished || !stampFresh)) clearBuildingStamp();
      return;
    }
    const t = setInterval(() => {
      bp.refetch?.();
      refetch?.();
    }, RECHECK_MS);
    return () => clearInterval(t);
  }, [building, bpFinished, stampFresh]);

  if (!fields) return null; // nothing to show until the row loads

  const doneCount = ITEMS.filter(
    (i) => isFilled(fields[i.key]) && !(i.key === "accounts" && building)
  ).length;
  const allDone = doneCount === ITEMS.length;
  const pct = Math.round((doneCount / ITEMS.length) * 100);

  return (
    <div className="w-full flex justify-center px-5 pt-8 pb-6">
      <style>{`
        @keyframes blChkPulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
        .bl-chk-pulse { width: 8px; height: 8px; border-radius: 50%; background: #294FF6; animation: blChkPulse 1.4s ease-in-out infinite; }
      `}</style>
      <div
        className="w-full"
        style={{
          maxWidth: "100%", background: "#fff", borderRadius: 14,
          border: "1px solid rgba(217, 224, 255, 0.6)",
          boxShadow: "0 1px 3px rgba(0, 19, 100, 0.05)", padding: "18px 20px",
        }}
      >
        <div style={{ marginBottom: allDone ? 0 : 12 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: BL_DEEP }}>
            {allDone ? "You're all set" : "Getting started"}
          </div>
          <div style={{ fontSize: 12, color: BL_MUTED, marginTop: 1 }}>
            {allDone
              ? "Every setup step is done. Enjoy the reviews."
              : `${doneCount} of ${ITEMS.length} steps done`}
          </div>
        </div>

        {building && (
          <div
            className="flex items-center gap-2.5"
            style={{
              background: "rgba(122, 147, 255, 0.08)",
              border: "1px solid rgba(122, 147, 255, 0.25)",
              borderRadius: 10, padding: "10px 12px", marginBottom: 12,
            }}
          >
            <span className="bl-chk-pulse" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: BL_DEEP, flex: 1 }}>
              {bpFailed
                ? "Your workspace blueprint didn't finish. Open it to try again."
                : "Your workspace blueprint builds while you set things up. Open it to watch, or carry on here."}
            </span>
            <a href={finishHref} style={{ fontSize: 12.5, fontWeight: 600, color: "#294FF6", textDecoration: "none", whiteSpace: "nowrap" }}>
              Finish building
            </a>
          </div>
        )}

        {!allDone && (
          <>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(135, 156, 247, 0.15)", marginBottom: 12, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%", width: `${pct}%`, borderRadius: 3,
                  background: `linear-gradient(90deg, ${BL_PERI}, #294FF6)`,
                  transition: "width 0.6s ease",
                }}
              />
            </div>

            <div>
              {ITEMS.map((item) => {
                const buildingRow = item.key === "accounts" && building;
                const complete = isFilled(fields[item.key]) && !buildingRow;
                return (
                  <a
                    key={item.key}
                    href={complete || buildingRow ? undefined : item.href}
                    className="flex items-center gap-2.5"
                    style={{
                      padding: "7px 6px", borderRadius: 8, textDecoration: "none",
                      cursor: complete || buildingRow ? "default" : "pointer",
                      pointerEvents: complete || buildingRow ? "none" : "auto",
                    }}
                  >
                    <span
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 20, height: 20, borderRadius: "50%",
                        background: complete ? "#294FF6" : "rgba(135, 156, 247, 0.15)",
                        border: complete ? "none" : "1.5px solid rgba(135, 156, 247, 0.5)",
                      }}
                    >
                      {complete && <Check size={12} className="text-white" />}
                      {buildingRow && <span className="bl-chk-pulse" aria-hidden="true" />}
                    </span>
                    <span
                      style={{
                        fontSize: 13.5,
                        color: complete ? BL_MUTED : BL_DEEP,
                        fontWeight: complete ? 400 : 500,
                        textDecoration: complete ? "line-through" : "none",
                      }}
                    >
                      {buildingRow ? "Building your workspace..." : item.label}
                    </span>
                    {!complete && !buildingRow && (
                      <span style={{ marginLeft: "auto", fontSize: 12, color: BL_PERI, fontWeight: 500 }}>
                        Go
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
