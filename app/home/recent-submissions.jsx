// =====================================================================
// Vibe Coding block: Recent submissions (/new, the app home)
// =====================================================================
// A glimpse of what has come in, on the page people land on:
//   • Header "Recent submissions" with "N waiting on you · M in today"
//     and a See all videos link to /videos.
//   • Up to 8 cards in a grid: videos waiting on your decision first (the
//     AI has reviewed, the review ran in Hybrid or Manual mode and no
//     decision is recorded yet), then everything that arrived today. With
//     nothing waiting and nothing new today, the four latest videos, so
//     the block is never blank while the workspace has videos.
//   • The same card as the videos index: thumbnail, type badge, AI
//     decision chip, Waiting on you chip, and a three-dot menu with
//     Approve, Request changes, Reject, Archive, Delete. Approve and
//     Reject confirm in a small modal, Request changes takes the note the
//     creator reads, every decision offers Undo for a few seconds. Delete
//     is a soft delete (submissions.deleted = true); the credit stays used.
//   • Empty state for a workspace with no videos points at the briefs
//     page, where each brief carries the share link creators submit through.
// `?workspace=<accountId>` in the URL narrows the block to that workspace,
// the same switch the videos index honours.
// Datasources: submissions, reviews, users (aliases).
// =====================================================================

import { useEffect, useMemo, useState } from "react";
import { datasource, useRecord, useRecords, useRecordUpdate, q } from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { X, Archive, Loader2, MoreHorizontal, Check, Pencil, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const ds = datasource.define({
  submissions: "submissions",
  reviews:     "reviews",
  users:       "users",
});

// ─── submissions (YdF2bMFS5LkUR1) ─────────────────────────────
const listFields = q.select({
  name:           "XebTQ",
  createdAt:      "ywb3H",
  status:         "4flIO",
  type:           "b82bF",
  platformLogo:   "Q0JaD",
  thumbnail:      "HKHil",  // lookup → reviews.thumbnail
  overallStatus:  "n6vL1",  // lookup → reviews.overall_status (the AI decision)
  requestChanges: "gewdX",  // lookup → reviews.request_changes (what the AI would fix)
  humanDecision:  "B34Uf",  // lookup → reviews.human_decision
  aiMode:         "laVjU",  // lookup → reviews.ai_mode (Autonomous / Hybrid / Manual)
  creatorName:    "9ZryL",
  briefName:      "Au4N7",
  accounts:       "v94f0",
  archive:        "F2SdY",
  deleted:        "5BWby",
  revisionNumber: "jHVKv",
  reviews:        "kdfMm",  // link → the review the decision is written on
  videoFile:      "PP7rO",
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

// ─── Design tokens (the Discover grid) ───────────────────────
const BL_BORDER = "rgba(217, 224, 255, 0.55)";
const BL_NAVY_DEEP = "#000F4D";
const BL_PERIWINKLE = "#879CF7";
const btnPrimary = { height: 32, padding: "6px 12px", borderRadius: 8, background: BL_PERIWINKLE, color: "#fff", fontSize: 13, lineHeight: "20px", fontWeight: 600, border: 0, cursor: "pointer" };
const btnNeutral = { height: 32, padding: "6px 12px", borderRadius: 8, background: "#fff", color: BL_NAVY_DEEP, fontSize: 13, lineHeight: "20px", fontWeight: 600, border: `1px solid ${BL_BORDER}`, cursor: "pointer" };
const btnDanger = { ...btnPrimary, background: "#D9534F" };

const TYPE_LABEL = { "Content Review": "Review", "Brief": "Review", "Analyse": "Analyse", "Example/Swipe File": "Remix", "Revision": "Revision" };
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
// The call is the brand's: reviewed, in Hybrid or Manual, and not a remix or an analysis.
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

// ─── Pieces ──────────────────────────────────────────────────
const chipCls = "inline-flex items-center rounded-full font-semibold whitespace-nowrap px-2 py-1 text-[10px]";
function StatusChip({ f }) {
  const st = statusOf(f);
  return <span className={chipCls} style={{ background: st.bg, color: st.fg }} title="The AI decision">AI: {st.label}</span>;
}
function DecisionChip({ d }) {
  if (d.waiting) return <span className={chipCls} style={{ background: BL_NAVY_DEEP, color: "#fff" }} title="The AI has reviewed this video. The decision is yours.">Waiting on you{d.age ? ` · ${d.age}` : ""}</span>;
  if (!d.label) return null;
  const st = DECISION_STYLE[d.human] || STATUS_STYLE.PENDING;
  return <span className={chipCls} style={{ background: st.bg, color: st.fg, border: "1px solid rgba(0,15,77,.12)" }} title={d.at ? `Decided ${fmtDate(d.at)}` : "Your decision"}>{d.label}</span>;
}

// The three-dot menu on a card (the briefs index pattern).
function CardMenu({ rec, open, onOpen, onPick, canDecide }) {
  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };
  const item = (key, Icon, text, danger) => (
    <button type="button" key={key} onMouseDown={stop} onClick={(e) => { stop(e); onPick(key, rec); }}
      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted" style={{ color: danger ? "#A32E26" : BL_NAVY_DEEP }}>
      <Icon size={14} />{text}
    </button>
  );
  return (
    <span data-card-action="menu" className="absolute bottom-2 right-2" onMouseDown={stop} onClick={stop}>
      <button type="button" onClick={(e) => { stop(e); onOpen(open ? null : rec.id); }} aria-label="More" aria-expanded={open}
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-card/95 shadow-sm text-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        style={open ? { opacity: 1 } : undefined}>
        <MoreHorizontal size={16} />
      </button>
      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-48 rounded-xl border border-border bg-card shadow-lg py-1 overflow-hidden" style={{ bottom: 36 }}>
          {canDecide ? item("approve", Check, "Approve") : null}
          {canDecide ? item("changes", Pencil, "Request changes") : null}
          {canDecide ? item("reject", X, "Reject") : null}
          {item("archive", Archive, "Archive")}
          {item("delete", Trash2, "Delete", true)}
        </div>
      ) : null}
    </span>
  );
}

function VideoCard({ rec, d, menuOpen, onMenu, onPick }) {
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
        <CardMenu rec={rec} open={menuOpen} onOpen={onMenu} onPick={onPick} canDecide={needsCall(f)} />
      </div>
    </a>
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
  const myAccountIds = useMemo(() => new Set(linkIds(me.data?.fields?.accounts)), [me.data]);

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

  useEffect(() => {
    if (!menuFor) return undefined;
    const close = () => setMenuFor(null);
    window.addEventListener("click", close); window.addEventListener("keydown", close);
    return () => { window.removeEventListener("click", close); window.removeEventListener("keydown", close); };
  }, [menuFor]);

  const flag = (r, k) => (overrides[r.id] && k in overrides[r.id] ? overrides[r.id][k] : isTrue(r.fields?.[k]));
  // The decision on a video: what you chose, or "waiting" when the call is yours.
  const decisionOf = (r) => {
    const f = r.fields || {};
    const local = decided[r.id];
    const human = local ? local.human : (label(f.humanDecision) || "Pending");
    const waiting = needsCall(f) && human === "Pending";
    const st = DECISION_STYLE[human];
    return { human, waiting, label: st ? st.label : "", age: waiting ? ageOf(first(f.createdAt)) : "", at: local?.at || "" };
  };

  // Live rows in the user's workspaces: never deleted, never archived.
  const scoped = useMemo(() => rows.filter((r) => {
    if (flag(r, "deleted") || flag(r, "archive")) return false;
    const acc = linkIds(r.fields?.accounts);
    if (urlWorkspace) return acc.includes(urlWorkspace);
    return myAccountIds.size === 0 ? true : acc.some((id) => myAccountIds.has(id));
  }), [rows, myAccountIds, overrides, urlWorkspace]);

  const stamp = (r) => String(first(r.fields?.createdAt) || "");
  const byNewest = (a, b) => stamp(b).localeCompare(stamp(a));
  const todayKey = new Date().toDateString();
  const arrivedToday = (r) => { const d = new Date(stamp(r)); return !Number.isNaN(d.getTime()) && d.toDateString() === todayKey; };
  const waiting = useMemo(() => scoped.filter((r) => decisionOf(r).waiting).sort(byNewest), [scoped, decided]);
  const today = useMemo(() => scoped.filter((r) => arrivedToday(r) && !decisionOf(r).waiting).sort(byNewest), [scoped, decided]);
  const quiet = waiting.length === 0 && today.length === 0;
  const shown = quiet ? [...scoped].sort(byNewest).slice(0, 4) : [...waiting, ...today].slice(0, 8);

  // The scope filter runs client-side, so keep pulling pages (up to 4)
  // until the user's own videos fill the block.
  const pagesLoaded = data?.pages?.length || 0;
  useEffect(() => {
    if (status !== "success" || !hasNextPage || isFetchingNextPage) return;
    if (scoped.length >= 8 || pagesLoaded >= 4) return;
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

  const loading = status === "loading" || status === "pending" || (!!user?.id && me.status !== "success" && me.status !== "error") || (isFetchingNextPage && scoped.length === 0 && pagesLoaded < 4);
  const modalName = modal ? (label(modal.rec.fields?.name) || "this video") : "";
  const subline = loading ? ""
    : scoped.length === 0 ? "Nothing has come in yet."
    : quiet ? "Nothing waiting on you and nothing new today. Your latest videos:"
    : `${waiting.length ? `${waiting.length} waiting on you` : "Nothing waiting on you"} · ${today.length ? `${today.length} in today` : "none in today"}`;

  return (
    <div id="recent-submissions" className="relative w-full">
      <div className="container py-6 md:py-8">
        <div className="content max-w-7xl mx-auto">

          <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
            <div>
              <h2 className="text-xl font-semibold" style={{ color: BL_NAVY_DEEP, letterSpacing: "-0.01em" }}>Recent submissions</h2>
              {subline ? <p className="text-sm text-muted-foreground mt-0.5">{waiting.length ? <span className="inline-block rounded-full mr-1.5 align-middle" style={{ width: 7, height: 7, background: BL_NAVY_DEEP }} /> : null}{subline}</p> : null}
            </div>
            <a href="/videos" className="inline-flex items-center gap-1" style={btnNeutral}>See all videos <ArrowRight size={14} /></a>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center"><Loader2 className="w-4 h-4 animate-spin" />Loading your videos</div>
          ) : shown.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">No videos yet. Creators submit through a brief's share link, and everything they send lands here with its AI review.</p>
              <a href="/briefs" className="inline-flex items-center gap-1 mt-4" style={btnPrimary}>Open your briefs</a>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {shown.map((rec) => <VideoCard key={rec.id} rec={rec} d={decisionOf(rec)} menuOpen={menuFor === rec.id} onMenu={setMenuFor} onPick={onPick} />)}
            </div>
          )}
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
