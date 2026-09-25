// =====================================================================
// Vibe Coding block: Videos index (/videos, block 9abc10bb) v4
// =====================================================================
// The videos page in the Discover grid's style:
//   • Heading + ONE New video button (opens /review as a right side panel).
//   • Count chips: All / Waiting on you / Approved / Flagged / Rejected /
//     Pending / Archived. "Waiting on you" = the AI has reviewed, the mode
//     leaves the call with the brand (Hybrid or Manual) and no decision is
//     recorded yet (reviews.human_decision still Pending).
//   • Search, Status / Type / Brief / Creator / Sort pills, Workspace when > 1.
//   • Grid or List. Both carry the AI decision, your decision, the review
//     mode, the revision and how long a video has waited. Default order:
//     waiting on you first, then newest.
//   • Every card and row has a three-dot menu (the briefs index pattern):
//     Approve, Request changes, Reject, Archive or Restore, Delete. Approve
//     and Reject confirm in a small modal; Request changes takes a note the
//     creator reads; every decision offers Undo for a few seconds.
//   • Delete is a soft delete: submissions.deleted = true hides the video
//     from every view and keeps the credit used (the row is the credit).
//   • Decisions write reviews.human_decision (+ request_message,
//     human_decided_at, human_decided_by) on the review linked to the video.
// Datasources: submissions, reviews, users, accounts, briefs (aliases).
// =====================================================================

import { useEffect, useMemo, useState } from "react";
import { datasource, useRecord, useRecords, useRecordUpdate, q } from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { Search, X, Plus, Archive, ArchiveRestore, Loader2, Download, LayoutGrid, List, MoreHorizontal, Check, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ds = datasource.define({
  submissions: "submissions",
  reviews:     "reviews",
  users:       "users",
  accounts:    "accounts",
  briefs:      "briefs",
});

// ─── submissions (YdF2bMFS5LkUR1) ─────────────────────────────
const listFields = q.select({
  name:           "XebTQ",
  createdAt:      "ywb3H",
  status:         "4flIO",
  type:           "b82bF",
  platformLogo:   "Q0JaD",
  platformName:   "5Quiw",
  thumbnail:      "HKHil",  // lookup → reviews.thumbnail
  overallStatus:  "n6vL1",  // lookup → reviews.overall_status (the AI decision)
  requestChanges: "gewdX",  // lookup → reviews.request_changes (what the AI would fix)
  displayUrl:     "yLEEw",  // lookup → reviews.display_url
  humanDecision:  "B34Uf",  // lookup → reviews.human_decision (Approve / Reject / Changes Requested / Pending)
  aiMode:         "laVjU",  // lookup → reviews.ai_mode (Autonomous / Hybrid / Manual)
  batchId:        "BqqJ6",  // one bulk run; the batch summary email links here
  creatorName:    "9ZryL",
  creatorEmail:   "INZs6",
  briefName:      "Au4N7",
  briefs:         "fqtit",
  accounts:       "v94f0",
  archive:        "F2SdY",
  deleted:        "5BWby",
  revisionNumber: "jHVKv",
  reviews:        "kdfMm",  // link → the review the decision is written on
  videoFile:      "PP7rO",
  videoUrl:       "XrARi",
});
const flagFields = q.select({ archive: "F2SdY", deleted: "5BWby" });

// ─── reviews (jRIJ8k8SOkaicy): the decision ───────────────────
const decisionFields = q.select({
  humanDecision:  "ULvsM",
  requestMessage: "JF1tu",
  decidedAt:      "mSvJ8",
  decidedBy:      "HpXw5",
});
const HUMAN = {
  Approve: { id: "e5f429c2-c986-4204-aa59-41c45f3c2de9", label: "Approve" },
  Reject: { id: "01bc0d1b-908a-4f00-b851-a47dda8647ea", label: "Reject" },
  Changes: { id: "75d07c29-52ae-4fd7-beed-de422029cfb7", label: "Changes Requested" },
  Pending: { id: "4bf114f6-eb39-40cd-964f-6cd9bb26c8f8", label: "Pending" },
};

// ─── users (brpbVf8sL2xqxV) ───────────────────────────────────
const meFields = q.select({ accounts: "Nz6VX" });

// ─── Design tokens (from the Discover grid) ──────────────────
const BL_BORDER = "rgba(217, 224, 255, 0.55)";
const BL_NAVY_DEEP = "#000F4D";
const BL_PERIWINKLE = "#879CF7";
const SELECT_CHEVRON =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7A99' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>\")";
const pillStyle = { height: 38, paddingLeft: 12, paddingRight: 32, fontSize: 13, background: `#FFFFFF ${SELECT_CHEVRON} no-repeat right 10px center / 14px`, border: `1px solid ${BL_BORDER}`, borderRadius: 10, color: BL_NAVY_DEEP };
const btnPrimary = { height: 32, padding: "6px 12px", borderRadius: 8, background: BL_PERIWINKLE, color: "#fff", fontSize: 13, lineHeight: "20px", fontWeight: 600, border: 0, cursor: "pointer" };
const btnNeutral = { height: 32, padding: "6px 12px", borderRadius: 8, background: "#fff", color: BL_NAVY_DEEP, fontSize: 13, lineHeight: "20px", fontWeight: 600, border: `1px solid ${BL_BORDER}`, cursor: "pointer" };
const btnDanger = { ...btnPrimary, background: "#D9534F" };

const TYPE_LABEL = { "Content Review": "Review", "Brief": "Review", "Analyse": "Analyse", "Example/Swipe File": "Remix", "Revision": "Revision" };
// Solid chips: readable on top of a thumbnail.
const STATUS_STYLE = {
  APPROVED: { bg: "#D7F2E3", fg: "#136C3C", label: "Approved" },
  FLAGGED:  { bg: "#FFE9B8", fg: "#7A5200", label: "Flagged" },
  REVIEW:   { bg: "#FFE9B8", fg: "#7A5200", label: "Needs review" },
  REJECTED: { bg: "#FFD9D5", fg: "#A32E26", label: "Rejected" },
  PASS:     { bg: "#D7F2E3", fg: "#136C3C", label: "Approved" },
  FAIL:     { bg: "#FFD9D5", fg: "#A32E26", label: "Rejected" },
  PENDING:  { bg: "#E4E8F7", fg: "#334283", label: "Pending" },
};
const DECISION_STYLE = {
  "Approve": { bg: "#D7F2E3", fg: "#136C3C", label: "Approved" },
  "Reject": { bg: "#FFD9D5", fg: "#A32E26", label: "Rejected" },
  "Changes Requested": { bg: "#FFE9B8", fg: "#7A5200", label: "Changes requested" },
};
const COUNT_ORDER = ["Approved", "Flagged", "Rejected", "Pending"];

// ─── Field helpers ───────────────────────────────────────────
function first(raw) { return Array.isArray(raw) ? raw[0] : raw; }
function label(raw) { const v = first(raw); return v && typeof v === "object" ? String(v.label || v.name || "") : String(v ?? ""); }
function linkIds(raw) { return (Array.isArray(raw) ? raw : raw ? [raw] : []).map((x) => (x && typeof x === "object" ? x.id : x)).filter(Boolean); }
function attachmentUrl(raw) { const v = first(raw); return v && typeof v === "object" ? String(v.url || "") : String(v || ""); }
function isTrue(raw) { const v = first(raw); return v === true || v === "true" || v === 1; }
function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso); if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
// "12m", "5h", "3d": how long since a moment.
function ageOf(iso) {
  const t = new Date(iso).getTime(); if (!iso || Number.isNaN(t)) return "";
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60); if (h < 48) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}
function plain(s) { return String(s || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim(); }
function param(name) { try { return new URLSearchParams(window.location.search).get(name) || ""; } catch { return ""; } }
function statusOf(f) { return STATUS_STYLE[(label(f.overallStatus) || "").toUpperCase()] || STATUS_STYLE.PENDING; }
function typeOf(f) { return TYPE_LABEL[label(f.type)] || label(f.type) || ""; }
function needsCall(f) {
  const mode = label(f.aiMode);
  if (mode !== "Hybrid" && mode !== "Manual") return false;
  if (!label(f.overallStatus)) return false;
  const t = label(f.type);
  return !(t === "Example/Swipe File" || t === "Analyse");
}
function detailsHref(id) { return `/submissions/details?recordId=${encodeURIComponent(id)}`; }
function openDetails(e, href) {
  if (e.target.closest && e.target.closest("[data-card-action]")) { e.preventDefault(); return; }
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
  if (typeof window.openSwModal === "function") { e.preventDefault(); window.openSwModal(href, "xl"); }
}

// Open /review as the right-hand side panel (the newer page dialog),
// then the URL params a native link writes, then the centred modal.
function openNewVideo() {
  const src = "/review";
  try {
    const r = window.SoftrPageRenderer;
    if (r && typeof r.setOpenPageModal === "function") { r.setOpenPageModal({ src, size: "M", placement: "end" }); return; }
  } catch { /* fall through */ }
  try {
    const u = new URL(window.location.href);
    u.searchParams.set("modal", src); u.searchParams.set("modalSize", "M"); u.searchParams.set("modalPlacement", "end");
    window.location.href = u.toString(); return;
  } catch { /* fall through */ }
  if (typeof window.openSwModal === "function") { window.openSwModal(src, "md"); return; }
  window.location.href = src;
}

// CSV of the rows on screen. Excel-friendly (BOM, CRLF, quoted cells).
function exportCsv(rows, decisionOf, filename) {
  const cols = ["Name", "Type", "AI decision", "Review mode", "Your decision", "Creator", "Creator email", "Brief", "Platform", "Revision", "Submitted", "Changes requested", "Video", "Review link"];
  const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const origin = (typeof window !== "undefined" && window.location.origin) || "";
  const lines = rows.map((r) => {
    const f = r.fields || {};
    const d = decisionOf(r);
    return [
      label(f.name), typeOf(f), statusOf(f).label, label(f.aiMode), d.waiting ? "Waiting on you" : d.label, label(f.creatorName), label(f.creatorEmail), label(f.briefName), label(f.platformName),
      label(f.revisionNumber), fmtDate(first(f.createdAt)), plain(label(f.requestChanges)), String(first(f.displayUrl) || first(f.videoUrl) || attachmentUrl(f.videoFile) || ""), origin + detailsHref(r.id),
    ].map(cell).join(",");
  });
  const csv = "﻿" + [cols.map(cell).join(","), ...lines].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ─── Pieces ──────────────────────────────────────────────────
function FilterPill({ label: lbl, options, value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={lbl} className="appearance-none cursor-pointer outline-none transition-colors" style={pillStyle}
      onFocus={(e) => { e.currentTarget.style.borderColor = BL_PERIWINKLE; }} onBlur={(e) => { e.currentTarget.style.borderColor = BL_BORDER; }}>
      <option value="">{lbl}</option>
      {options.map((o) => <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>{typeof o === "string" ? o : o.label}</option>)}
    </select>
  );
}
const chipCls = (small) => `inline-flex items-center rounded-full font-semibold whitespace-nowrap ${small ? "px-2 py-0.5 text-[11px]" : "px-2 py-1 text-[10px]"}`;
function StatusChip({ f, small }) {
  const st = statusOf(f);
  return <span className={chipCls(small)} style={{ background: st.bg, color: st.fg }} title="The AI decision">AI: {st.label}</span>;
}
function DecisionChip({ d, small }) {
  if (d.waiting) return <span className={chipCls(small)} style={{ background: BL_NAVY_DEEP, color: "#fff" }} title="The AI has reviewed this video. The decision is yours.">Waiting on you{d.age ? ` · ${d.age}` : ""}</span>;
  if (!d.label) return null;
  const st = DECISION_STYLE[d.human] || STATUS_STYLE.PENDING;
  return <span className={chipCls(small)} style={{ background: st.bg, color: st.fg, border: "1px solid rgba(0,15,77,.12)" }} title={d.at ? `Decided ${fmtDate(d.at)}` : "Your decision"}>{d.label}</span>;
}

// The three-dot menu on a card or a row (the briefs index pattern).
function CardMenu({ rec, archived, open, onOpen, onPick, round, canDecide }) {
  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };
  const item = (key, Icon, text, danger) => (
    <button type="button" key={key} onMouseDown={stop} onClick={(e) => { stop(e); onPick(key, rec); }}
      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted" style={{ color: danger ? "#A32E26" : BL_NAVY_DEEP }}>
      <Icon size={14} />{text}
    </button>
  );
  return (
    <span data-card-action="menu" className={round ? "absolute bottom-2 right-2" : "relative inline-block"} onMouseDown={stop} onClick={stop}>
      <button type="button" onClick={(e) => { stop(e); onOpen(open ? null : rec.id); }} aria-label="More" aria-expanded={open}
        className={round ? "inline-flex items-center justify-center w-8 h-8 rounded-full bg-card/95 shadow-sm text-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" : "inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"}
        style={open ? { opacity: 1 } : undefined}>
        <MoreHorizontal size={16} />
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-48 rounded-xl border border-border bg-card shadow-lg py-1 overflow-hidden" style={{ bottom: round ? 36 : "auto", top: round ? "auto" : 34 }}>
          {canDecide ? item("approve", Check, "Approve") : null}
          {canDecide ? item("changes", Pencil, "Request changes") : null}
          {canDecide ? item("reject", X, "Reject") : null}
          {archived ? item("restore", ArchiveRestore, "Restore") : item("archive", Archive, "Archive")}
          {item("delete", Trash2, "Delete", true)}
        </div>
      ) : null}
    </span>
  );
}

function VideoCard({ rec, d, archived, menuOpen, onMenu, onPick }) {
  const f = rec.fields || {};
  const name = label(f.name) || "Untitled video";
  const type = typeOf(f);
  const thumbUrl = String(first(f.thumbnail) || "");
  const fileUrl = attachmentUrl(f.videoFile);
  const logo = String(first(f.platformLogo) || "");
  const rev = label(f.revisionNumber);
  const meta = [label(f.creatorName), label(f.briefName), fmtDate(first(f.createdAt)), rev && rev !== "0" ? `Rev ${rev}` : ""].filter(Boolean).join(" · ");
  const href = detailsHref(rec.id);
  return (
    <a href={href} onClick={(e) => openDetails(e, href)} className={`group block w-full text-left bg-card rounded-2xl border border-border hover:border-primary/40 transition-colors shadow-sm hover:shadow-md ${menuOpen ? "relative z-10" : ""}`}>
      <div className="relative rounded-t-2xl overflow-hidden" style={{ background: "#EEF1FB", aspectRatio: "9 / 12" }}>
        {thumbUrl ? <img src={thumbUrl} alt="" className="w-full h-full object-cover" draggable={false} /> : fileUrl ? <video src={fileUrl} muted playsInline preload="metadata" className="w-full h-full object-cover" /> : null}
        {type ? <span className="absolute top-2 left-2 inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider" style={{ background: "#fff", color: BL_NAVY_DEEP }}>{type}</span> : null}
        <span className="absolute top-2 right-2 flex flex-col items-end gap-1"><StatusChip f={f} /><DecisionChip d={d} /></span>
      </div>
      <div className="relative px-3 py-2.5 min-w-0">
        <div className="flex items-center gap-2 min-w-0 pr-8">
          {logo ? <img src={logo} alt="" className="w-5 h-5 rounded-md object-contain shrink-0" draggable={false} /> : null}
          <span className="font-semibold text-foreground text-sm truncate">{name}</span>
        </div>
        {meta ? <div className="text-xs text-muted-foreground truncate mt-0.5 pr-8">{meta}</div> : null}
        <CardMenu rec={rec} archived={archived} open={menuOpen} onOpen={onMenu} onPick={onPick} canDecide={needsCall(f)} round />
      </div>
    </a>
  );
}

function VideoRow({ rec, d, archived, menuOpen, onMenu, onPick }) {
  const f = rec.fields || {};
  const href = detailsHref(rec.id);
  const thumbUrl = String(first(f.thumbnail) || "");
  const rev = label(f.revisionNumber);
  return (
    <tr className={`border-t border-border hover:bg-muted/40 cursor-pointer ${d.waiting ? "bg-[#F7F8FF]" : ""}`} onClick={(e) => openDetails(e, href)}>
      <td className="py-2 pl-3 pr-2 w-14">
        <div className="w-9 h-12 rounded-md overflow-hidden" style={{ background: "#EEF1FB" }}>{thumbUrl ? <img src={thumbUrl} alt="" className="w-full h-full object-cover" draggable={false} /> : null}</div>
      </td>
      <td className="py-2 pr-3 min-w-0"><a href={href} onClick={(e) => openDetails(e, href)} className="font-semibold text-sm text-foreground hover:underline">{label(f.name) || "Untitled video"}</a><div className="text-xs text-muted-foreground truncate">{label(f.creatorName)}{typeOf(f) ? ` · ${typeOf(f)}` : ""}</div></td>
      <td className="py-2 pr-3"><StatusChip f={f} small /></td>
      <td className="py-2 pr-3"><DecisionChip d={d} small />{!d.waiting && !d.label && !needsCall(f) ? <span className="text-xs text-muted-foreground">Not needed</span> : null}</td>
      <td className="py-2 pr-3 text-xs text-muted-foreground whitespace-nowrap">{label(f.aiMode)}</td>
      <td className="py-2 pr-3 text-xs text-muted-foreground whitespace-nowrap">{rev && rev !== "0" ? `Rev ${rev}` : "First cut"}</td>
      <td className="py-2 pr-3 text-xs text-muted-foreground max-w-[180px] truncate">{label(f.briefName)}</td>
      <td className="py-2 pr-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDate(first(f.createdAt))}</td>
      <td className="py-2 pr-2 text-right"><CardMenu rec={rec} archived={archived} open={menuOpen} onOpen={onMenu} onPick={onPick} canDecide={needsCall(f)} /></td>
    </tr>
  );
}

// Confirm and request-changes modals, the briefs index look.
function Modal({ title, children, confirmLabel, onConfirm, onClose, danger, busy, disabled }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[950] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.55)" }} onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-card border border-border shadow-xl p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold" style={{ color: BL_NAVY_DEEP }}>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-muted"><X size={16} /></button>
        </div>
        <div className="mt-3 text-sm text-muted-foreground">{children}</div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} style={btnNeutral} disabled={busy}>Cancel</button>
          <button type="button" onClick={onConfirm} style={danger ? btnDanger : btnPrimary} disabled={busy || disabled}>{busy ? "Saving…" : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default function Block() {
  const user = useCurrentUser();
  const [urlWorkspace] = useState(() => param("workspace"));
  const me = useRecord({ recordId: user?.id || "", select: meFields, from: ds.users, enabled: !!user?.id });
  const myAccounts = useMemo(() => (Array.isArray(me.data?.fields?.accounts) ? me.data.fields.accounts : []).map((a) => ({ id: a?.id || a, name: label(a) || "Workspace" })).filter((a) => a.id), [me.data]);

  const { data, status, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useRecords({ select: listFields, count: 24, from: ds.submissions });
  const rows = data?.pages?.flatMap((p) => p?.items ?? []) ?? [];

  const updateFlags = useRecordUpdate({ fields: flagFields, from: ds.submissions });
  const updateReview = useRecordUpdate({ fields: decisionFields, from: ds.reviews });
  const [busyIds, setBusyIds] = useState(() => new Set());
  const [overrides, setOverrides] = useState({});   // id → { archive?, deleted? } after a local change
  const [decided, setDecided] = useState({});       // id → { human, at } after a local decision
  const [menuFor, setMenuFor] = useState(null);
  const [modal, setModal] = useState(null);         // { kind, rec }
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("grid");
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fWaiting, setFWaiting] = useState(false);
  const [fCreator, setFCreator] = useState("");
  const [fType, setFType] = useState("");
  const [fBrief, setFBrief] = useState("");
  const [sort, setSort] = useState("waiting");
  const [fWorkspace, setFWorkspace] = useState(urlWorkspace);

  useEffect(() => {
    if (!menuFor) return undefined;
    const close = () => setMenuFor(null);
    window.addEventListener("click", close); window.addEventListener("keydown", close);
    return () => { window.removeEventListener("click", close); window.removeEventListener("keydown", close); };
  }, [menuFor]);

  const flag = (r, k) => (overrides[r.id] && k in overrides[r.id] ? overrides[r.id][k] : isTrue(r.fields?.[k]));
  const isArchived = (r) => flag(r, "archive");
  const isDeleted = (r) => flag(r, "deleted");
  // The decision on a video: what you chose, or "waiting" when the call is yours.
  const decisionOf = (r) => {
    const f = r.fields || {};
    const local = decided[r.id];
    const human = local ? local.human : (label(f.humanDecision) || "Pending");
    const waiting = needsCall(f) && human === "Pending";
    const st = DECISION_STYLE[human];
    return { human, waiting, label: st ? st.label : "", age: waiting ? ageOf(first(f.createdAt)) : "", at: local?.at || "" };
  };

  // Rows in the user's workspaces, never the deleted ones, split by archived.
  // ?batch= narrows the page to one bulk run. The summary email sends
  // people straight here rather than to the whole library.
  const fBatch = param("batch");
  const scoped = useMemo(() => {
    const ids = new Set(myAccounts.map((a) => a.id));
    return rows.filter((r) => {
      if (isDeleted(r)) return false;
      if (fBatch && String(r.fields?.batchId || "") !== fBatch) return false;
      const acc = linkIds(r.fields?.accounts);
      if (fWorkspace) return acc.includes(fWorkspace);
      return ids.size === 0 ? true : acc.some((id) => ids.has(id));
    });
  }, [rows, myAccounts, fWorkspace, fBatch, overrides]);
  const live = useMemo(() => scoped.filter((r) => !isArchived(r)), [scoped, overrides]);
  const archivedRows = useMemo(() => scoped.filter((r) => isArchived(r)), [scoped, overrides]);
  const pool = showArchived ? archivedRows : live;

  const counts = useMemo(() => {
    const c = { All: live.length, Waiting: 0, Approved: 0, Flagged: 0, Rejected: 0, Pending: 0 };
    for (const r of live) { const f = r.fields || {}; const l = statusOf(f).label; const key = l === "Needs review" ? "Flagged" : l; if (key in c) c[key] += 1; if (decisionOf(r).waiting) c.Waiting += 1; }
    return c;
  }, [live, decided]);

  const options = useMemo(() => {
    const briefs = new Set(); const types = new Set(); const statuses = new Set(); const creators = new Set();
    for (const r of pool) { const f = r.fields || {}; const b = label(f.briefName); if (b) briefs.add(b); const t = typeOf(f); if (t) types.add(t); statuses.add(statusOf(f).label); const c = label(f.creatorName).trim(); if (c) creators.add(c); }
    return { briefs: [...briefs].sort(), types: [...types].sort(), statuses: [...statuses].sort(), creators: [...creators].sort((a, b) => a.localeCompare(b)) };
  }, [pool]);

  const filtered = useMemo(() => {
    const qx = search.trim().toLowerCase();
    const out = pool.filter((r) => {
      const f = r.fields || {};
      const s = statusOf(f).label;
      if (fStatus && !(s === fStatus || (fStatus === "Flagged" && s === "Needs review"))) return false;
      if (fWaiting && !decisionOf(r).waiting) return false;
      if (fCreator && label(f.creatorName).trim() !== fCreator) return false;
      if (fType && typeOf(f) !== fType) return false;
      if (fBrief && label(f.briefName) !== fBrief) return false;
      if (qx) { const hay = [label(f.name), label(f.creatorName), label(f.creatorEmail), label(f.briefName), label(f.platformName)].join(" ").toLowerCase(); if (!hay.includes(qx)) return false; }
      return true;
    });
    const t = (r) => String(first(r.fields?.createdAt) || "");
    if (sort === "oldest") out.sort((a, b) => t(a).localeCompare(t(b)));
    else if (sort === "name") out.sort((a, b) => label(a.fields?.name).localeCompare(label(b.fields?.name)));
    else if (sort === "newest") out.sort((a, b) => t(b).localeCompare(t(a)));
    else out.sort((a, b) => (decisionOf(b).waiting ? 1 : 0) - (decisionOf(a).waiting ? 1 : 0) || t(b).localeCompare(t(a)));
    return out;
  }, [pool, search, fStatus, fWaiting, fCreator, fType, fBrief, sort, decided]);

  // The scope filter runs client-side, so keep pulling pages (up to 8)
  // until the user's own videos fill the first screen.
  const pagesLoaded = data?.pages?.length || 0;
  useEffect(() => {
    if (status !== "success" || !hasNextPage || isFetchingNextPage) return;
    if (scoped.length >= 24 || pagesLoaded >= 8) return;
    fetchNextPage();
  }, [status, hasNextPage, isFetchingNextPage, scoped.length, pagesLoaded, fetchNextPage]);

  const busy = (id, on) => setBusyIds((s) => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n; });
  const setFlag = async (rec, k, value, word) => {
    if (updateFlags.enabled === false) { toast.error(`${word} isn't enabled on this block yet.`); return; }
    busy(rec.id, true);
    try {
      await updateFlags.mutateAsync({ recordId: rec.id, fields: { [k]: value } });
      setOverrides((o) => ({ ...o, [rec.id]: { ...(o[rec.id] || {}), [k]: value } }));
      toast.success(`${label(rec.fields?.name) || "Video"} ${word.toLowerCase()}`);
      await refetch?.();
    } catch (err) {
      console.error(`[${word}] failed:`, err);
      toast.error(`Couldn't ${word.toLowerCase()}`, { description: err?.message || "Try again." });
    } finally { busy(rec.id, false); }
  };

  // The decision goes on the review linked to the video. Undo puts it back
  // to Pending, from the toast, for a few seconds.
  const reviewIdOf = (rec) => linkIds(rec.fields?.reviews)[0] || "";
  const who = user?.fullName || user?.name || user?.email || "";
  const writeDecision = async (rec, opt, message) => {
    const reviewId = reviewIdOf(rec);
    if (!reviewId) { toast.error("No review on this video yet."); return false; }
    if (updateReview.enabled === false) { toast.error("Decisions aren't enabled on this block yet."); return false; }
    const at = new Date().toISOString();
    const fields = { humanDecision: { id: opt.id, label: opt.label }, decidedAt: opt.label === "Pending" ? null : at, decidedBy: opt.label === "Pending" ? "" : who };
    if (message !== undefined) fields.requestMessage = message;
    await updateReview.mutateAsync({ recordId: reviewId, fields });
    setDecided((d) => ({ ...d, [rec.id]: { human: opt.label, at } }));
    return true;
  };
  const decide = async (rec, opt, message) => {
    busy(rec.id, true);
    try {
      if (!(await writeDecision(rec, opt, message))) return;
      const name = label(rec.fields?.name) || "Video";
      const said = opt.label === "Approve" ? "approved" : opt.label === "Reject" ? "rejected" : "sent back for changes";
      toast.success(`${name} ${said}`, {
        duration: 8000,
        action: { label: "Undo", onClick: async () => { try { await writeDecision(rec, HUMAN.Pending, message !== undefined ? "" : undefined); toast.success("Decision undone"); } catch (e) { toast.error("Couldn't undo", { description: e?.message }); } } },
      });
      await refetch?.();
    } catch (err) {
      console.error("[Decision] failed:", err);
      toast.error("Couldn't save the decision", { description: err?.message || "Try again." });
    } finally { busy(rec.id, false); }
  };

  const onPick = (key, rec) => {
    setMenuFor(null);
    if (key === "archive") return setFlag(rec, "archive", true, "Archived");
    if (key === "restore") return setFlag(rec, "archive", false, "Restored");
    if (key === "changes") setNote(plain(label(rec.fields?.requestChanges)));
    setModal({ kind: key, rec });
  };
  const closeModal = () => { if (!saving) { setModal(null); setNote(""); } };
  const confirmModal = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      const { kind, rec } = modal;
      if (kind === "approve") await decide(rec, HUMAN.Approve);
      else if (kind === "reject") await decide(rec, HUMAN.Reject);
      else if (kind === "changes") await decide(rec, HUMAN.Changes, note.trim());
      else if (kind === "delete") await setFlag(rec, "deleted", true, "Deleted");
    } finally { setSaving(false); setModal(null); setNote(""); }
  };

  const onExport = () => {
    if (!filtered.length) { toast.error("Nothing to export with these filters."); return; }
    const stem = [fBrief, fCreator, fStatus, fWaiting ? "waiting-on-you" : "", fType, showArchived ? "archived" : ""].filter(Boolean).join("-").replace(/[^\w-]+/g, "_").toLowerCase();
    exportCsv(filtered, decisionOf, `brieflee-videos${stem ? "-" + stem : ""}-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success(`Exported ${filtered.length} video${filtered.length === 1 ? "" : "s"}`);
  };

  const loading = status === "loading" || status === "pending" || (!!user?.id && me.status !== "success" && me.status !== "error") || (isFetchingNextPage && scoped.length === 0 && pagesLoaded < 8);
  const chip = (active) => ({ height: 30, padding: "0 12px", borderRadius: 999, fontSize: 12, fontWeight: 600, border: `1px solid ${active ? BL_PERIWINKLE : BL_BORDER}`, background: active ? "#EEF1FF" : "#fff", color: BL_NAVY_DEEP, cursor: "pointer" });
  const seg = (active) => ({ height: 30, padding: "0 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: 0, background: active ? "#fff" : "transparent", color: active ? BL_NAVY_DEEP : "#6B7A99", boxShadow: active ? "0 1px 3px rgba(0,19,100,.12)" : "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 });
  const modalName = modal ? (label(modal.rec.fields?.name) || "this video") : "";
  const cardProps = (rec) => ({ rec, d: decisionOf(rec), archived: showArchived, menuOpen: menuFor === rec.id, onMenu: setMenuFor, onPick });

  return (
    <div id="videos-index" className="relative w-full">
      <div className="container py-6 md:py-8">
        <div className="content max-w-7xl mx-auto">

          <div className="mb-4 md:mb-5">
            <h1 className="text-xl font-semibold" style={{ color: BL_NAVY_DEEP, letterSpacing: "-0.01em" }}>Videos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{counts.Waiting ? `${counts.Waiting} waiting on you. ` : ""}Your AI analysed videos</p>
          </div>

          {/* Counts double as status filters */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <button type="button" style={chip(!fStatus && !fWaiting && !showArchived)} onClick={() => { setFStatus(""); setFWaiting(false); setShowArchived(false); }}>All {counts.All}</button>
            <button type="button" style={chip(fWaiting && !showArchived)} onClick={() => { setShowArchived(false); setFWaiting((v) => !v); }} title="The AI has reviewed these. The decision is yours.">
              {counts.Waiting ? <span className="inline-block rounded-full mr-1.5 align-middle" style={{ width: 7, height: 7, background: BL_NAVY_DEEP }} /> : null}Waiting on you {counts.Waiting}
            </button>
            {COUNT_ORDER.map((k) => (
              <button type="button" key={k} style={chip(fStatus === k && !showArchived)} onClick={() => { setShowArchived(false); setFStatus(fStatus === k ? "" : k); }}>{k} {counts[k]}</button>
            ))}
            <button type="button" style={chip(showArchived)} onClick={() => { setShowArchived((v) => !v); setFStatus(""); setFWaiting(false); }} title="Archived videos">Archived {archivedRows.length}</button>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap mb-5 md:mb-6">
            <div className="relative" style={{ flex: "1 1 240px", minWidth: 200 }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} color="#6B7A99" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, creator or brief…" className="w-full outline-none transition-colors"
                style={{ height: 38, padding: "0 36px", fontSize: 13, background: "#FFFFFF", border: `1px solid ${BL_BORDER}`, borderRadius: 10, color: BL_NAVY_DEEP }}
                onFocus={(e) => { e.currentTarget.style.borderColor = BL_PERIWINKLE; }} onBlur={(e) => { e.currentTarget.style.borderColor = BL_BORDER; }} />
              {search ? <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full" style={{ width: 22, height: 22, background: "rgba(217, 224, 255, 0.6)", color: "#6B7A99", border: "none" }}><X size={14} /></button> : null}
            </div>
            <FilterPill label="Status" options={options.statuses} value={fStatus} onChange={setFStatus} />
            <FilterPill label="Type" options={options.types} value={fType} onChange={setFType} />
            {options.briefs.length ? <FilterPill label="Brief" options={options.briefs} value={fBrief} onChange={setFBrief} /> : null}
            {options.creators.length ? <FilterPill label="Creator" options={options.creators} value={fCreator} onChange={setFCreator} /> : null}
            <FilterPill label="Waiting first" options={[{ value: "newest", label: "Newest first" }, { value: "oldest", label: "Oldest first" }, { value: "name", label: "Name A to Z" }]} value={sort === "waiting" ? "" : sort} onChange={(v) => setSort(v || "waiting")} />
            {myAccounts.length > 1 ? (
              <select value={fWorkspace} onChange={(e) => setFWorkspace(e.target.value)} aria-label="Workspace" className="appearance-none cursor-pointer outline-none transition-colors" style={pillStyle}>
                <option value="">All workspaces</option>
                {myAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            ) : null}
            <div className="flex items-center gap-2 ml-auto">
              <div className="inline-flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: "rgba(0,19,100,.05)" }} role="tablist" aria-label="View">
                <button type="button" role="tab" aria-selected={view === "grid"} style={seg(view === "grid")} onClick={() => setView("grid")}><LayoutGrid size={14} />Grid</button>
                <button type="button" role="tab" aria-selected={view === "list"} style={seg(view === "list")} onClick={() => setView("list")}><List size={14} />List</button>
              </div>
              <button type="button" onClick={onExport} className="inline-flex items-center gap-1" style={btnNeutral} title="Download what is on screen as a CSV"><Download size={14} />Export CSV</button>
              <button type="button" onClick={openNewVideo} className="inline-flex items-center gap-1" style={btnPrimary}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#6C7CC5"; }} onMouseLeave={(e) => { e.currentTarget.style.background = BL_PERIWINKLE; }}>
                <Plus size={14} />New video
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center"><Loader2 className="w-4 h-4 animate-spin" />Loading your videos</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">{showArchived ? "Nothing archived." : fWaiting && !fStatus && !fCreator && !fBrief && !fType && !search ? "Nothing waiting on you. Every reviewed video has your decision." : live.length === 0 ? "No videos yet. Upload example videos for AI to analyse or invite creators and see their submissions here 🎥" : "Nothing matches those filters."}</p>
              {!showArchived && live.length === 0 ? <button type="button" onClick={openNewVideo} className="inline-flex items-center gap-1 mt-4" style={btnPrimary}><Plus size={14} />New video</button> : null}
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filtered.map((rec) => <VideoCard key={rec.id} {...cardProps(rec)} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-x-auto">
              <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pl-3 pr-2 font-semibold" />
                    <th className="py-2 pr-3 font-semibold">Video</th>
                    <th className="py-2 pr-3 font-semibold">AI decision</th>
                    <th className="py-2 pr-3 font-semibold">Your decision</th>
                    <th className="py-2 pr-3 font-semibold">Mode</th>
                    <th className="py-2 pr-3 font-semibold">Revision</th>
                    <th className="py-2 pr-3 font-semibold">Brief</th>
                    <th className="py-2 pr-3 font-semibold">Submitted</th>
                    <th className="py-2 pr-2" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((rec) => <VideoRow key={rec.id} {...cardProps(rec)} />)}
                </tbody>
              </table>
            </div>
          )}

          {!loading && hasNextPage ? (
            <div className="flex justify-center mt-8">
              <button type="button" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="rounded-full border px-6 py-2.5 text-sm font-semibold hover:bg-muted disabled:opacity-60">{isFetchingNextPage ? "Loading…" : "Load more"}</button>
            </div>
          ) : null}
        </div>
      </div>

      {modal?.kind === "approve" ? (
        <Modal title="Approve this cut?" confirmLabel="Approve" onConfirm={confirmModal} onClose={closeModal} busy={saving}>
          <p><b style={{ color: BL_NAVY_DEEP }}>{modalName}</b> is marked approved and the creator hears it is good to go. You can undo for a few seconds after.</p>
        </Modal>
      ) : null}
      {modal?.kind === "reject" ? (
        <Modal title="Reject this cut?" confirmLabel="Reject" onConfirm={confirmModal} onClose={closeModal} danger busy={saving}>
          <p><b style={{ color: BL_NAVY_DEEP }}>{modalName}</b> is marked rejected. The creator sees "Not approved". You can undo for a few seconds after.</p>
        </Modal>
      ) : null}
      {modal?.kind === "changes" ? (
        <Modal title="Request changes" confirmLabel="Send to the creator" onConfirm={confirmModal} onClose={closeModal} busy={saving} disabled={!note.trim()}>
          <p className="mb-2">What should change in the next cut of <b style={{ color: BL_NAVY_DEEP }}>{modalName}</b>? The creator reads this on their result page.</p>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={5} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none" style={{ color: BL_NAVY_DEEP }} placeholder="One line per change." />
        </Modal>
      ) : null}
      {modal?.kind === "delete" ? (
        <Modal title="Delete this video?" confirmLabel="Delete" onConfirm={confirmModal} onClose={closeModal} danger busy={saving}>
          <p><b style={{ color: BL_NAVY_DEEP }}>{modalName}</b> disappears from every view, including Archived. The credit it used stays used. This cannot be undone.</p>
        </Modal>
      ) : null}
    </div>
  );
}
