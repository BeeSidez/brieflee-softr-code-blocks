// =====================================================================
// /upload — Public bulk upload (Vibe Code block)
//
// One link per brand: /upload?recordId=<accountId>. No login, no seat.
// Agencies and creators drop everything first (per-file progress, 128MB
// guard), then one review screen: submitter name + email, a set-all
// brief control and a per-row override. When the account has no open
// public briefs the brief step disappears entirely.
//
// Writes, all anonymous CREATE-only:
//   • one submissions row per video — accounts + briefs links, video
//     file, creator name/email, type Brief (with a brief) or Content
//     Review (without), user_validation "proceed" so BL | New Video
//     sends each row to review on arrival, logic "Bulk upload" so the
//     per-row creator confirmation email stays quiet, platform Upload,
//     revision 0.
//   • one members row for the submitter — Active (they submitted),
//     Submit only, linked to the chosen briefs, the created
//     submissions and the account.
//
// Sources (hard boundary, set via MCP): briefs readable only when
// Active and public; submissions + members carry an always-false read
// filter so this public page can create but never read them; accounts
// is the same public read the brand briefs page already exposes.
//
// ── DESIGN, Aug 2026 ────────────────────────────────────────────────
// Built to `Brieflee Upload Page HANDOVER.dc.html` (Claude Design project
// ff3b0704). Full aurora wash, brand pill floating top left, the glass
// panel held on the right and the headline doing the welcoming, so the
// panel stays purely functional. Three steps: drop, details, sent.
//
// The brand mark reads logoUrl off the account: set, the square holds the
// logo on white; empty, it falls back to the initials tile, so a workspace
// with no logo never looks broken. Brieflee stays to the footer line only.
//
// On a phone the panel stops being the card and becomes the column: the
// glass moves to `.bl-up-card` around the dropzone and rows, and the action
// sits beneath it, full width, within thumb reach. Most creators open this
// link on the device the footage is already on, so that view is the real one.
//
// ── ENGINE, Sep 2026 ────────────────────────────────────────────────
// The review engine runs inside this block. n8n is gone: nothing picks
// rows up any more, so the page does the work itself. On submit each
// video goes through the same pipeline the brand's own pages use, one
// at a time: Cloudinary copy and frames, the Review Agents watching on
// Gemini, then the reviews, review_report, submissions and
// notifications rows and the EmailIt sends. The submitter watches it
// happen and gets the decisions on the last screen.
//
// The engine owns the submissions write now, so this block no longer
// creates that row itself. The members row is still written here.
// The design is untouched.
// =====================================================================

import { useMemo, useRef, useState } from "react";
import { datasource, useRecord, useRecords, useRecordCreate, useUpload, useProxyFetch, q } from "@/lib/datasource";
import { X, Film, ChevronLeft, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const ds = datasource.define({
  accounts:      "accounts",
  briefs:        "briefs",
  members:       "members",
  notifications: "notifications",
  submissions:   "4da41b0d-e56e-4701-8188-78f1686a7416",
  reviews:       "98795613-37d4-4af0-a4b8-17ff5c715587",
  report:        "8db468a5-9939-4873-9673-01f1b82c7c8f",
  emailit:       "fee4e358-cada-4962-924f-561382677d65",
  google:        "c044105c-09cd-48ba-81d1-1b4c9316e4e6",
});

// briefs (RpoBGPxrsEOnmj) — the list and the submission window. The
// engine's own briefSelect carries the brief's content; this one only
// answers "is it open, and is it this brand's".
const pageBriefSelect = q.select({
  name: "z3lpx",
  accounts: "EhzVx",
  openDate: "tdVjp",
  closeDate: "M4hMa",
  status: "71Oud",
  visibility: "HvJoB",
});

// members (J8TKhfRL2rxNvA) — write schema, one row per submitter
const memberCreateFields = q.select({
  fullName: "qtE5x",
  email: "v0MOD",
  status: "ZjtKB",
  accessLevel: "8B5e8",
  briefs: "S8k72",
  submissions: "WmfhK",
  accounts: "O72qI",
});

const LOGIC_BULK_UPLOAD = "dd34c7ee-0dbb-4760-96b4-87b44c7e3442";
const MEMBER_ACTIVE = "f5ff441d-3478-4424-8f75-a43f28cf252d";
const ACCESS_SUBMIT_ONLY = "57c9deef-6375-4df1-839e-3ecdfe483d29";

const UPLOAD_MAX_MB = 128;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BRIEFLEE_LOCKUP =
  "https://res.cloudinary.com/dchroynzv/image/upload/v1777622988/brieflee_logo_powered-by-brieflee-lockup-blue_2025-03.svg";

function unwrap(raw) {
  if (raw == null) return "";
  if (typeof raw === "string") return raw.trim();
  if (Array.isArray(raw)) return raw.map(unwrap).filter(Boolean).join(", ");
  if (typeof raw === "object") return raw.label || raw.value || raw.name || "";
  return String(raw);
}

function linkedIds(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((it) => (it && typeof it === "object" ? it.id : null)).filter(Boolean);
}

// accounts.logo_url is a FORMULA built from the website, so it ALWAYS
// returns something: no website gives the Brieflee stamp, a website gives
// that DOMAIN's favicon. A brand living on a parent company's domain
// therefore gets the parent's mark. The upload the brand actually made
// lives on the logo attachment, so that has to be asked for first.
function logoFromAttachment(raw) {
  if (!raw) return "";
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (!first) return "";
  if (typeof first === "string") return first.trim();
  return String(first.url || first.thumbnailUrl || "").trim();
}

function niceName(filename) {
  return String(filename || "").replace(/\.[^.]+$/, "");
}

function fmtMb(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// The brand mark falls back to initials when the account has no logo, so
// a workspace that never uploaded one still looks deliberate.
function initialsOf(name) {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "•";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// The live count while the Review Agents work through the queue.
function done0Label(results, total) {
  const ok = results.filter((r) => r.ok).length;
  const failed = results.length - ok;
  if (!results.length) return total + " video" + (total === 1 ? "" : "s") + " in the queue";
  return ok + " of " + total + " reviewed" + (failed ? ", " + failed + " could not be" : "");
}

// Today at midnight for the submission-window check
function windowOpen(openIso, closeIso) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (openIso) {
    const o = new Date(openIso);
    if (!isNaN(o.getTime()) && o > today) return false;
  }
  if (closeIso) {
    const c = new Date(closeIso);
    c.setHours(23, 59, 59, 999);
    if (!isNaN(c.getTime()) && c < today) return false;
  }
  return true;
}

// __ENGINE_MODULE__

function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

      .bl-up, .bl-up * { font-family: 'Inter', system-ui, sans-serif; box-sizing: border-box; }

      /* ── Aurora wash ────────────────────────────────────────────── */
      .bl-up {
        position: relative;
        overflow: hidden;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background: linear-gradient(180deg, #F2F5FF 0%, #FAFBFF 100%);
      }
      .bl-up-bloom {
        position: absolute; inset: -12%;
        background:
          radial-gradient(ellipse 42% 40% at 14% 10%, rgba(135,156,247,0.4) 0%, rgba(135,156,247,0) 70%),
          radial-gradient(ellipse 40% 46% at 88% 86%, rgba(41,79,246,0.3) 0%, rgba(41,79,246,0) 68%),
          radial-gradient(ellipse 46% 44% at 74% 8%, rgba(217,224,255,0.95) 0%, rgba(217,224,255,0) 70%);
        animation: blBloom 18s ease-in-out infinite;
        pointer-events: none;
      }
      .bl-up-dots {
        position: absolute; inset: 0;
        background-image: radial-gradient(rgba(135,156,247,0.3) 1px, transparent 1.2px);
        background-size: 22px 22px;
        opacity: 0.45;
        mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, #000 20%, transparent 78%);
        -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, #000 20%, transparent 78%);
        pointer-events: none;
      }
      @keyframes blBloom { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(2%,-2%,0) scale(1.08); } }
      @keyframes blSweep { 0% { transform: translateX(-130%); } 55%,100% { transform: translateX(240%); } }
      @keyframes blRise { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }

      .bl-up-inner {
        position: relative; z-index: 1;
        flex: 1;
        width: 100%;
        max-width: 1180px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        padding: 34px 56px 26px;
      }

      /* ── Top row: brand pill left, aside right ───────────────────── */
      .bl-up-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
      .bl-up-brand {
        display: inline-flex; align-items: center; gap: 11px;
        padding: 8px 17px 8px 9px; border-radius: 999px;
        background: linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(244,246,255,0.62) 100%);
        backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(255,255,255,0.85);
        box-shadow: 0 12px 26px -16px rgba(0,19,100,0.38);
      }
      .bl-up-mark {
        width: 30px; height: 30px; border-radius: 9px; flex: none;
        background: #0E1B3D; color: #fff;
        display: flex; align-items: center; justify-content: center;
        font-size: 11.5px; font-weight: 800; letter-spacing: 0.01em;
        overflow: hidden;
      }
      .bl-up-mark.is-logo { background: #fff; border: 1px solid rgba(214,222,252,0.9); }
      .bl-up-mark img { width: 100%; height: 100%; object-fit: contain; display: block; padding: 3px; }
      .bl-up-brand-name { font-size: 14px; font-weight: 700; color: #001364; letter-spacing: -0.01em; }
      .bl-up-aside { font-size: 12.5px; font-weight: 600; color: #5A6790; }
      .bl-up-aside a { color: #294ff6; font-weight: 700; text-decoration: none; }
      .bl-up-aside a:hover { color: #001364; }

      /* ── Body: copy left, panel right ────────────────────────────── */
      .bl-up-body { flex: 1; display: flex; align-items: center; gap: 60px; padding-top: 8px; }
      .bl-up-body.is-centre { flex-direction: column; justify-content: center; text-align: center; gap: 0; }
      .bl-up-copy { flex: 1 1 0; min-width: 0; }

      .bl-up-eyebrow {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 7px 14px; border-radius: 999px;
        background: rgba(135,156,247,0.22);
        font-size: 10.5px; font-weight: 800; letter-spacing: 0.1em;
        text-transform: uppercase; color: #001364;
      }
      .bl-up-title {
        margin: 18px 0 0;
        font-size: clamp(30px, 3.6vw, 47px);
        font-weight: 700; letter-spacing: -0.034em; line-height: 1.04;
        color: #001364; text-wrap: pretty;
      }
      .bl-up-lede {
        margin: 18px 0 0; font-size: 16.5px; line-height: 1.6;
        color: #3A4770; max-width: 420px; text-wrap: pretty;
      }
      .bl-up-points { display: flex; flex-direction: column; gap: 11px; margin-top: 26px; }
      .bl-up-point { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 600; color: #001364; }
      .bl-up-tick {
        width: 20px; height: 20px; border-radius: 6px; flex: none;
        background: rgba(135,156,247,0.22); color: #294ff6;
        display: flex; align-items: center; justify-content: center;
      }

      /* ── The glass panel ─────────────────────────────────────────── */
      .bl-up-panel {
        flex: 0 0 452px; position: relative;
        border-radius: 26px; padding: 20px;
        background: linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(244,246,255,0.58) 55%, rgba(236,240,255,0.5) 100%);
        backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px);
        border: 1px solid rgba(255,255,255,0.8);
        box-shadow: 0 44px 84px -34px rgba(0,19,100,0.4), 0 1px 0 0 rgba(255,255,255,0.9) inset;
      }
      .bl-up-sweep { position: absolute; top: 0; bottom: 0; left: 0; width: 30%; border-radius: 26px; overflow: hidden; pointer-events: none; }
      .bl-up-sweep i {
        position: absolute; inset: 0; display: block;
        background: linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.32) 50%, transparent 100%);
        animation: blSweep 7s cubic-bezier(0.32,0.72,0,1) infinite;
      }
      .bl-up-card { position: relative; }

      /* ── Dropzone ────────────────────────────────────────────────── */
      .bl-up-drop {
        border-radius: 18px; border: 2px dashed rgba(135,156,247,0.5);
        background: rgba(255,255,255,0.55); padding: 38px 20px; text-align: center;
        cursor: pointer; transition: border-color 180ms ease, background 180ms ease;
      }
      .bl-up-drop:hover, .bl-up-drop.is-over { border-color: #879CF7; background: rgba(255,255,255,0.8); }
      .bl-up-stack { display: flex; align-items: flex-end; justify-content: center; gap: 9px; height: 64px; margin-bottom: 12px; }
      .bl-up-sheet { border: 1px solid rgba(255,255,255,0.9); }
      .bl-up-sheet.s1 { width: 40px; height: 52px; border-radius: 9px; background: linear-gradient(160deg,#E4E9FF,#C3CFFF); transform: rotate(-9deg); box-shadow: 0 12px 22px -12px rgba(0,19,100,0.3); }
      .bl-up-sheet.s2 { width: 46px; height: 60px; border-radius: 10px; background: linear-gradient(160deg,#CBD6FF,#9FB2FA); box-shadow: 0 16px 26px -12px rgba(0,19,100,0.34); }
      .bl-up-sheet.s3 { width: 40px; height: 52px; border-radius: 9px; background: linear-gradient(160deg,#E4E9FF,#C3CFFF); transform: rotate(9deg); box-shadow: 0 12px 22px -12px rgba(0,19,100,0.3); }
      .bl-up-drop-title { margin: 0 0 5px; font-size: 16px; font-weight: 700; color: #001364; letter-spacing: -0.01em; }
      .bl-up-drop-copy { margin: 0; font-size: 13px; color: #5A6790; }
      .bl-up-drop-copy b { color: #294ff6; font-weight: 700; }
      .bl-up-only-mobile { display: none; }

      /* ── File rows ───────────────────────────────────────────────── */
      .bl-up-rows { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
      .bl-up-row {
        display: flex; align-items: center; gap: 12px;
        padding: 11px 13px; border-radius: 12px;
        background: rgba(255,255,255,0.78); border: 1px solid rgba(255,255,255,0.9);
        box-shadow: 0 8px 20px -14px rgba(0,19,100,0.3);
      }
      .bl-up-row-icon {
        width: 34px; height: 34px; border-radius: 10px; flex: none;
        background: rgba(135,156,247,0.2); color: #001364;
        display: flex; align-items: center; justify-content: center;
      }
      .bl-up-row-icon.is-ok { background: #dcfce7; color: #166534; }
      .bl-up-row-icon.is-bad { background: rgba(247,55,48,0.12); color: #B31711; }
      .bl-up-row-main { min-width: 0; flex: 1; }
      .bl-up-row-name { margin: 0; font-size: 13px; font-weight: 700; color: #001364; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .bl-up-row-meta { margin: 3px 0 0; font-size: 11.5px; font-weight: 500; color: #5A6790; }
      .bl-up-bar { height: 4px; border-radius: 999px; background: rgba(214,222,252,0.8); margin-top: 7px; overflow: hidden; }
      .bl-up-bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #879CF7, #294ff6); transition: width 300ms ease; }
      .bl-up-row-x {
        border: 0; background: transparent; color: #8390B5; cursor: pointer;
        padding: 4px; border-radius: 8px; line-height: 0; flex: none;
      }
      .bl-up-row-x:hover { color: #B31711; background: rgba(247,55,48,0.08); }
      .bl-up-row-select {
        flex: none; max-width: 148px;
        font-size: 11.5px; font-weight: 600; color: #5A6790;
        background: rgba(0,0,0,0.05); border: 0; border-radius: 8px;
        padding: 6px 10px; cursor: pointer; appearance: none;
        text-overflow: ellipsis;
      }
      .bl-up-row-select:focus { outline: 2px solid #879CF7; outline-offset: 1px; }

      /* ── Form fields ─────────────────────────────────────────────── */
      .bl-up-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .bl-up-label { display: block; font-size: 11.5px; font-weight: 700; color: #334283; margin: 0 0 6px; }
      .bl-up-input, .bl-up-select {
        width: 100%; height: 40px; border-radius: 11px;
        background: rgba(255,255,255,0.85); border: 1px solid rgba(214,222,252,0.9);
        padding: 0 13px; font-size: 13.5px; font-weight: 600; color: #001364;
        transition: border-color 160ms ease, box-shadow 160ms ease;
      }
      .bl-up-input::placeholder { color: #A9B2CE; font-weight: 500; }
      .bl-up-select { border-color: rgba(135,156,247,0.7); appearance: none; cursor: pointer; }
      .bl-up-input:focus, .bl-up-select:focus { outline: none; border-color: #879CF7; box-shadow: 0 0 0 4px rgba(135,156,247,0.2); }
      .bl-up-hint { margin: 7px 0 0; font-size: 11.5px; font-weight: 500; line-height: 1.5; color: #5A6790; }

      /* ── Actions ─────────────────────────────────────────────────── */
      .bl-up-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 18px; }
      .bl-up-count { font-size: 12.5px; font-weight: 600; color: #5A6790; }
      .bl-up-primary {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        padding: 12px 24px; border-radius: 12px; border: 0; cursor: pointer;
        background: linear-gradient(180deg, #98ABFA 0%, #7B92F6 100%);
        color: #fff; font-size: 14px; font-weight: 700;
        box-shadow: 0 14px 26px -12px rgba(41,79,246,0.6);
        transition: transform 160ms ease, filter 160ms ease;
      }
      .bl-up-primary:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.03); }
      .bl-up-primary:disabled { opacity: 0.45; cursor: default; box-shadow: none; }
      .bl-up-ghost {
        display: inline-flex; align-items: center; justify-content: center; gap: 7px;
        padding: 10px 15px; border-radius: 11px; cursor: pointer;
        background: rgba(255,255,255,0.85); border: 1px solid rgba(214,222,252,0.9);
        font-size: 13px; font-weight: 700; color: #001364;
        transition: background 160ms ease;
      }
      .bl-up-ghost:hover:not(:disabled) { background: #fff; }
      .bl-up-ghost:disabled { opacity: 0.45; cursor: default; }

      /* ── Sent screen ─────────────────────────────────────────────── */
      .bl-up-done-mark {
        position: relative; width: 104px; height: 104px; border-radius: 32px;
        background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(236,240,255,0.6) 100%);
        backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
        border: 1px solid rgba(255,255,255,0.9);
        box-shadow: 0 30px 60px -26px rgba(0,19,100,0.4);
        display: flex; align-items: center; justify-content: center;
        animation: blRise 0.7s cubic-bezier(0.32,0.72,0,1) both;
      }
      .bl-up-done-mark i {
        width: 60px; height: 60px; border-radius: 20px;
        background: rgba(135,156,247,0.22); color: #001364;
        display: flex; align-items: center; justify-content: center;
      }
      .bl-up-done-title { margin: 26px 0 0; font-size: clamp(28px, 3.2vw, 44px); font-weight: 700; letter-spacing: -0.032em; line-height: 1.05; color: #001364; }
      .bl-up-done-lede { margin: 16px 0 0; font-size: 16.5px; line-height: 1.62; color: #3A4770; max-width: 470px; text-wrap: pretty; }
      .bl-up-done-actions { display: flex; gap: 10px; margin-top: 28px; }
      /* The desktop mock keeps the sent screen clear; the phone mock lists the files. */
      .bl-up-sent-list { display: none; }

      .bl-up-closed { max-width: 470px; }
      .bl-up-closed-copy { margin: 16px 0 0; font-size: 16px; line-height: 1.6; color: #3A4770; }

      .bl-up-foot { display: flex; justify-content: center; margin-top: 26px; }
      .bl-up-foot img { display: block; height: 34px; width: auto; opacity: 0.9; }

      @media (prefers-reduced-motion: reduce) {
        .bl-up-bloom, .bl-up-sweep i, .bl-up-done-mark { animation: none; }
        .bl-up-drop, .bl-up-primary, .bl-up-ghost { transition: none; }
      }

      /* ── Phone: one column, glass card, action pinned in reach ───── */
      @media (max-width: 860px) {
        .bl-up-inner { padding: 20px 24px 24px; }
        .bl-up-body { flex-direction: column; align-items: stretch; gap: 20px; }
        /* The sent, error and closed screens stay centred at every width. */
        .bl-up-body.is-centre { align-items: center; }
        .bl-up-panel { flex: 1 1 auto; }
        .bl-up-lede { max-width: none; }
      }
      @media (max-width: 640px) {
        .bl-up { background: linear-gradient(180deg, #F2F5FF 0%, #FAFBFF 62%); }
        .bl-up-dots { opacity: 0.14; mask-image: linear-gradient(180deg,#000 0%,transparent 55%); -webkit-mask-image: linear-gradient(180deg,#000 0%,transparent 55%); }
        .bl-up-inner { padding: 14px 20px 24px; }
        .bl-up-aside { font-size: 12px; font-weight: 700; }
        .bl-up-title { font-size: 32px; letter-spacing: -0.032em; line-height: 1.06; margin-top: 20px; }
        .bl-up-lede { font-size: 14.5px; line-height: 1.55; margin-top: 12px; }
        .bl-up-points { display: none; }
        /* The phone mock goes brand pill straight to headline. */
        .bl-up-eyebrow { display: none; }
        .bl-up-body { gap: 0; padding-top: 0; }

        /* The panel stops being the card and becomes the column, so the
           action sits under the glass and stays within thumb reach. */
        .bl-up-panel {
          flex: 1; display: flex; flex-direction: column;
          background: none; border: 0; box-shadow: none; padding: 0;
          backdrop-filter: none; -webkit-backdrop-filter: none;
          border-radius: 0; margin-top: 20px;
        }
        .bl-up-sweep { display: none; }
        .bl-up-card {
          border-radius: 24px; padding: 16px;
          background: linear-gradient(135deg, rgba(255,255,255,0.86) 0%, rgba(246,248,255,0.62) 100%);
          backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px);
          border: 1px solid rgba(255,255,255,0.88);
          box-shadow: 0 22px 46px -34px rgba(0,19,100,0.26), 0 1px 0 0 rgba(255,255,255,0.95) inset;
        }
        .bl-up-drop { padding: 30px 16px; }
        .bl-up-only-desktop { display: none; }
        .bl-up-only-mobile { display: block; }
        .bl-up-grid { grid-template-columns: 1fr; }
        .bl-up-input, .bl-up-select { height: 46px; border-radius: 12px; background: #fff; font-size: 14px; }
        .bl-up-actions { margin-top: auto; padding-top: 22px; }
        .bl-up-count { display: none; }
        .bl-up-primary { flex: 1; padding: 16px 22px; border-radius: 15px; font-size: 15.5px; }
        .bl-up-ghost { padding: 16px 18px; border-radius: 15px; font-size: 14.5px; }
        .bl-up-row-select { max-width: 120px; }
        .bl-up-done-mark { width: 104px; height: 104px; border-radius: 50%; background: rgba(135,156,247,0.2); border: 0; box-shadow: none; backdrop-filter: none; }
        .bl-up-done-mark i { border-radius: 19px; }
        .bl-up-done-title { font-size: 30px; letter-spacing: -0.03em; line-height: 1.08; margin-top: 22px; }
        .bl-up-done-lede { font-size: 14.5px; line-height: 1.6; margin-top: 12px; }
        .bl-up-sent-list { display: flex; flex-direction: column; gap: 8px; margin-top: 20px; width: 100%; text-align: left; }
        .bl-up-sent-row {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 13px; border-radius: 12px;
          background: rgba(255,255,255,0.88); border: 1px solid rgba(255,255,255,0.95);
          box-shadow: 0 12px 26px -18px rgba(0,19,100,0.35);
          font-size: 12.5px; font-weight: 700; color: #001364;
        }
        .bl-up-sent-tick {
          width: 26px; height: 26px; border-radius: 8px; flex: none;
          background: #dcfce7; color: #166534;
          display: flex; align-items: center; justify-content: center;
        }
        .bl-up-done-actions { width: 100%; margin-top: auto; padding-top: 22px; }
        .bl-up-done-actions .bl-up-primary { width: 100%; }
        .bl-up-foot img { height: 30px; }
      }
    `}</style>
  );
}

// The shell every screen sits inside: aurora, brand pill, footer lockup.
// The brand mark reads the account logo and falls back to initials, so a
// workspace that never uploaded one still looks deliberate.
function Shell({ logo, brandName, aside, children }) {
  return (
    <div className="bl-up">
      <span className="bl-up-bloom" aria-hidden="true" />
      <span className="bl-up-dots" aria-hidden="true" />
      <div className="bl-up-inner">
        <div className="bl-up-top">
          <span className="bl-up-brand">
            <span className={"bl-up-mark" + (logo ? " is-logo" : "")}>
              {logo ? <img src={logo} alt="" /> : initialsOf(brandName)}
            </span>
            <span className="bl-up-brand-name">{brandName}</span>
          </span>
          {aside ? <span className="bl-up-aside">{aside}</span> : <span />}
        </div>

        {children}

        <div className="bl-up-foot">
          <a href="https://www.brieflee.co" target="_blank" rel="noreferrer">
            <img src={BRIEFLEE_LOCKUP} alt="Powered by Brieflee" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Block() {
  // The brand this public link belongs to, read once from the URL.
  const [accountId] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("recordId") || "";
    } catch {
      return "";
    }
  });

  const { data: account, status: accountStatus } = useRecord({
    recordId: accountId,
    select: accountSelect,
    from: ds.accounts,
    enabled: !!accountId,
  });
  // Both reads are scoped to this brand on the wire. Without the where
  // clause every brand's briefs travel to a public page and only the
  // client hides them.
  const { data: briefsRaw } = useRecords({
    select: pageBriefSelect, from: ds.briefs, count: 100,
    where: q.array("accounts").is(accountId || ""), enabled: !!accountId,
  });
  // The engine reads the brief itself, not just its window.
  const { data: briefsFullRaw } = useRecords({
    select: briefSelect, from: ds.briefs, count: 100,
    where: q.array("accounts").is(accountId || ""), enabled: !!accountId,
  });

  // ── The engine's writes and services ──
  const createSubmission = useRecordCreate({ fields: submissionCreate, from: ds.submissions });
  const createReview = useRecordCreate({ fields: reviewCreate, from: ds.reviews });
  const createReport = useRecordCreate({ fields: reportCreate, from: ds.report });
  const createNotification = useRecordCreate({ fields: notificationCreate, from: ds.notifications });
  const createMember = useRecordCreate({ from: ds.members, fields: memberCreateFields });
  const { uploadAsync } = useUpload();
  const proxyGoogle = useProxyFetch(ds.google);
  const proxyEmailit = useProxyFetch(ds.emailit);
  // Everything here is an uploaded file, so the link scraper is never reached.
  const proxyRapid = async () => { throw new Error("Upload a video file."); };
  const runRef = useRef(0);

  const [screen, setScreen] = useState("upload"); // upload | review | done
  const [videos, setVideos] = useState([]); // {key, file, name, sizeMb, status: uploading|ready|error, url, briefId}
  const [dragOver, setDragOver] = useState(false);
  const [subName, setSubName] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [batchBrief, setBatchBrief] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [engStage, setEngStage] = useState("");
  const [engIndex, setEngIndex] = useState(0);
  const [engResults, setEngResults] = useState([]);
  const fileRef = useRef(null);
  const keyRef = useRef(0);

  const accountName = unwrap(account?.fields?.name);
  const accountLogo = logoFromAttachment(account?.fields?.logo) || unwrap(account?.fields?.logoUrl);
  const accountBio = unwrap(account?.fields?.brandBio);
  const remainingRaw = account?.fields?.videosRemaining;
  const remainingNum = Array.isArray(remainingRaw) ? Number(remainingRaw[0]) : Number(remainingRaw);
  const quotaClosed = Number.isFinite(remainingNum) && remainingNum <= 0;

  const brandLabel = accountName || "this brand";
  const failedCount = engResults.filter((r) => !r.ok).length;

  // This brand's open public briefs: the source already limits rows to
  // Active + public, so the block only scopes by account and window.
  const openBriefs = useMemo(() => {
    const rows = Array.isArray(briefsRaw?.records) ? briefsRaw.records
      : Array.isArray(briefsRaw) ? briefsRaw
      : Array.isArray(briefsRaw?.pages) ? briefsRaw.pages.flatMap((p) => p?.items ?? []) : [];
    return rows.filter((r) => {
      const f = r?.fields || {};
      if (!linkedIds(f.accounts).includes(accountId)) return false;
      // Active and public only. The source filter says the same thing;
      // this block says it again so a stray brief can never be offered.
      if (unwrap(f.status) !== "Active") return false;
      if (unwrap(f.visibility) !== "Public") return false;
      return windowOpen(f.openDate, f.closeDate);
    });
  }, [briefsRaw, accountId]);
  const hasBriefs = openBriefs.length > 0;

  // The brief's own content, by id, for the video being reviewed.
  const briefsFullById = useMemo(() => {
    const rows = Array.isArray(briefsFullRaw?.records) ? briefsFullRaw.records
      : Array.isArray(briefsFullRaw) ? briefsFullRaw
      : Array.isArray(briefsFullRaw?.pages) ? briefsFullRaw.pages.flatMap((p) => p?.items ?? []) : [];
    const map = {};
    for (const r of rows) if (r?.id) map[r.id] = r.fields || null;
    return map;
  }, [briefsFullRaw]);

  // ── The engine's view of this page: a public, first-time submission ──
  // No login, no parent, no revision. The brand comes from the link.
  const af = account?.fields || null;
  const kind = "review"; const context = "brief"; const isCreator = true; const multi = true; const urlName = "";
  const mf = {};
  const parent = null; const previous = null; const parentId = ""; const parentReviewId = ""; const revisionNo = 0;
  const workspaceId = accountId;
  const workspaceName = accountName || "";
  const brandUserId = linkedIds(af?.owner)[0] || "";
  const brandEmail = unwrap(af?.ownerEmail) || "";
  const brandFirstName = unwrap(af?.ownerFirstName) || "there";

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    incoming.forEach((file) => {
      if (!file.type.startsWith("video/")) {
        toast.error(file.name + " is not a video file.");
        return;
      }
      if (file.size > UPLOAD_MAX_MB * 1024 * 1024) {
        toast.error(file.name + " is over " + UPLOAD_MAX_MB + " MB.");
        return;
      }
      keyRef.current += 1;
      const key = "v" + keyRef.current;
      setVideos((prev) => [...prev, { key, file, name: file.name, sizeMb: fmtMb(file.size), status: "uploading", url: "", briefId: "" }]);
      uploadAsync(file)
        .then((res) => {
          const first = Array.isArray(res) ? res[0] : res;
          const url = first && (first.url || first);
          setVideos((prev) => prev.map((v) => (v.key === key ? { ...v, status: typeof url === "string" && url ? "ready" : "error", url: typeof url === "string" ? url : "" } : v)));
        })
        .catch(() => {
          setVideos((prev) => prev.map((v) => (v.key === key ? { ...v, status: "error" } : v)));
        });
    });
  };

  const removeVideo = (key) => setVideos((prev) => prev.filter((v) => v.key !== key));

  const readyVideos = videos.filter((v) => v.status === "ready");
  const stillUploading = videos.some((v) => v.status === "uploading");

  const applyBatchBrief = (id) => {
    setBatchBrief(id);
    setVideos((prev) => prev.map((v) => ({ ...v, briefId: id })));
  };

  // "Send more videos" on the sent screen. Keeps who they are, clears
  // the batch, so a second drop is two taps rather than a reload.
  const startAgain = () => {
    setVideos([]);
    setBatchBrief("");
    setSubmittedCount(0);
    setEngResults([]);
    setEngIndex(0);
    setEngStage("");
    setScreen("upload");
  };

  // __ENGINE_PIPELINE__

  const handleSubmit = async () => {
    const cleanName = subName.trim();
    const cleanEmail = subEmail.trim();
    if (!cleanName) { toast.error("Add your name."); return; }
    if (!EMAIL_RE.test(cleanEmail)) { toast.error("Enter a valid email address."); return; }
    if (!createSubmission.enabled || !createReview.enabled) { toast.error("Reviews are not available right now."); return; }
    if (readyVideos.length === 0) { toast.error("No finished uploads to submit."); return; }
    if (!af) { toast.error("Still loading. Try again in a moment."); return; }
    // Every video here spends one of the brand's credits, and this link
    // is public, so the batch has to fit what the account has left.
    if (Number.isFinite(remainingNum) && readyVideos.length > remainingNum) {
      const over = readyVideos.length - remainingNum;
      toast.error(brandLabel + " can take " + remainingNum + " more video" + (remainingNum === 1 ? "" : "s") + " right now.", { description: "Remove " + over + " and submit the rest." });
      return;
    }
    setSubmitting(true);
    setEngResults([]);
    setEngIndex(0);
    setEngStage("");
    setScreen("sending");
    const myRun = runRef.current + 1;
    runRef.current = myRun;
    let done = 0;
    const createdIds = [];
    const usedBriefIds = new Set();
    const results = [];
    try {
      for (let i = 0; i < readyVideos.length; i++) {
        const v = readyVideos[i];
        const briefId = hasBriefs ? v.briefId : "";
        setEngIndex(i);
        setEngStage("Getting your video ready");
        try {
          const ctx = {
            agents: [],
            briefId,
            brief: briefId ? briefsFullById[briefId] || null : null,
            notes: "",
            pdf: null,
            pdfUploaded: null,
            creatorName: cleanName,
            creatorEmail: cleanEmail,
            // One confirmation for the batch, not one per video. This is
            // what the `logic = Bulk upload` field used to buy from n8n.
            bulk: readyVideos.length > 1 && i > 0,
          };
          const item = { kind: "file", file: v.file, label: v.name, uploaded: { filename: v.name, url: v.url } };
          const r = await runPipeline(item, myRun, { stage: setEngStage, preview: () => {} }, ctx);
          if (runRef.current !== myRun) return;
          if (!r) throw new Error("The review did not finish.");
          if (r.subId) createdIds.push(r.subId);
          if (briefId) usedBriefIds.add(briefId);
          done += 1;
          results.push({ key: v.key, name: v.name, ok: true, decision: r.decision || "" });
        } catch (e) {
          console.error("review failed for", v.name, e);
          results.push({ key: v.key, name: v.name, ok: false, error: String(e?.message || e) });
        }
        setEngResults(results.slice());
        setSubmittedCount(done);
      }
      if (createMember.enabled) {
        try {
          await createMember.mutateAsync({
            fullName: cleanName,
            email: cleanEmail,
            status: MEMBER_ACTIVE,
            accessLevel: ACCESS_SUBMIT_ONLY,
            briefs: usedBriefIds.size ? [...usedBriefIds].map((id) => ({ id })) : null,
            submissions: createdIds.length ? createdIds.map((id) => ({ id })) : null,
            accounts: [{ id: accountId }],
          });
        } catch (e) {
          console.error("Member create failed:", e);
        }
      }
      setEngStage("");
      setScreen("done");
    } catch (e) {
      setScreen("review");
      toast.error("Submitting failed after " + done + " video" + (done === 1 ? "" : "s"), { description: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!accountId || (accountStatus !== "pending" && !account)) {
    return (
      <>
        <Style />
        <Shell logo="" brandName="Brieflee">
          <div className="bl-up-body is-centre">
            <div className="bl-up-closed">
              <h1 className="bl-up-title">This upload link isn't quite right</h1>
              <p className="bl-up-closed-copy">Check the link you were sent and try again.</p>
            </div>
          </div>
        </Shell>
      </>
    );
  }

  // ── Quota closed ───────────────────────────────────────────────────
  if (quotaClosed && screen !== "done") {
    return (
      <>
        <Style />
        <Shell logo={accountLogo} brandName={accountName || "Brieflee"}>
          <div className="bl-up-body is-centre">
            <div className="bl-up-closed">
              <h1 className="bl-up-title">Not accepting videos right now</h1>
              <p className="bl-up-closed-copy">
                {brandLabel + " isn't taking new uploads at the moment. Check back soon, or get in touch with the team who sent you this link."}
              </p>
            </div>
          </div>
        </Shell>
      </>
    );
  }

  // ── Step 2b · Reviewing ────────────────────────────────────────────
  // The engine runs in this tab, so the screen has to hold the sender's
  // attention while it works. Same panel, same rows, live status.
  if (screen === "sending") {
    const total = readyVideos.length;
    return (
      <>
        <Style />
        <Shell
          logo={accountLogo}
          brandName={accountName || "Brieflee"}
          aside={"Video " + Math.min(engIndex + 1, total) + " of " + total}
        >
          <div className="bl-up-body">
            <div className="bl-up-copy">
              <span className="bl-up-eyebrow">Review under way</span>
              <h1 className="bl-up-title">The Review Agents<br />are watching</h1>
              <p className="bl-up-lede">
                Keep this page open until every video is through. Each one takes about a minute.
              </p>
              <div className="bl-up-points">
                <span className="bl-up-point">
                  <span className="bl-up-tick"><Check size={12} strokeWidth={3} /></span>
                  {engStage || "Getting your video ready"}
                </span>
                <span className="bl-up-point">
                  <span className="bl-up-tick"><Check size={12} strokeWidth={3} /></span>
                  {done0Label(engResults, total)}
                </span>
              </div>
            </div>
            <div className="bl-up-panel">
              <div className="bl-up-card">
                <div className="bl-up-rows">
                  {readyVideos.map((v, i) => {
                    const r = engResults.find((x) => x.key === v.key);
                    const active = !r && i === engIndex;
                    return (
                      <div key={v.key} className="bl-up-row">
                        <span className={"bl-up-row-icon" + (r ? (r.ok ? " is-ok" : " is-bad") : "")}>
                          {r && r.ok ? <Check size={15} strokeWidth={3} /> : r ? <X size={15} /> : <Film size={15} />}
                        </span>
                        <div className="bl-up-row-main">
                          <p className="bl-up-row-name">{v.name}</p>
                          <p className="bl-up-row-meta">
                            {r ? (r.ok ? "Reviewed" : r.error) : active ? (engStage || "Working") : "Waiting"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Shell>
      </>
    );
  }

  // ── Step 3 · Sent ──────────────────────────────────────────────────
  if (screen === "done") {
    return (
      <>
        <Style />
        <Shell logo={accountLogo} brandName={accountName || "Brieflee"}>
          <div className="bl-up-body is-centre">
            <span className="bl-up-done-mark">
              <i><Check size={30} strokeWidth={2.4} /></i>
            </span>
            <h1 className="bl-up-done-title">
              {submittedCount + " video" + (submittedCount === 1 ? "" : "s") + " reviewed"}
            </h1>
            <p className="bl-up-done-lede">
              {failedCount > 0
                ? brandLabel + " has the ones that went through, and the result is on its way by email. " + failedCount + " could not be reviewed, so send " + (failedCount === 1 ? "it" : "them") + " again."
                : brandLabel + " has your content and the Review Agents have been through every video. The result is on its way by email. You can close this page."}
            </p>

            {engResults.length > 0 && (
              <div className="bl-up-sent-list">
                {engResults.map((r, i) => (
                  <div key={r.key + i} className="bl-up-sent-row">
                    <span className="bl-up-sent-tick">
                      {r.ok ? <Check size={13} strokeWidth={2.6} /> : <X size={13} strokeWidth={2.6} />}
                    </span>
                    {r.name}
                  </div>
                ))}
              </div>
            )}

            <div className="bl-up-done-actions">
              <button type="button" className="bl-up-primary" onClick={startAgain}>Send more videos</button>
            </div>
          </div>
        </Shell>
      </>
    );
  }

  // ── Step 2 · Details ───────────────────────────────────────────────
  if (screen === "review") {
    return (
      <>
        <Style />
        <Shell logo={accountLogo} brandName={accountName || "Brieflee"} aside="Step 2 of 2">
          <div className="bl-up-body">
            <div className="bl-up-copy">
              <h1 className="bl-up-title">Almost there</h1>
              <p className="bl-up-lede">
                {readyVideos.length === 1
                  ? "One video is in. Tell " + brandLabel + " who sent it and which brief it answers, and the review starts straight away."
                  : readyVideos.length + " videos are in. Tell " + brandLabel + " who sent them and which brief they answer, and the review starts straight away."}
              </p>
            </div>

            <div className="bl-up-panel">
              <span className="bl-up-sweep" aria-hidden="true"><i /></span>
              <div className="bl-up-card">
                <div className="bl-up-grid">
                  <div>
                    <label className="bl-up-label">Your name</label>
                    <input
                      className="bl-up-input"
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      placeholder="Full name"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="bl-up-label">Your email</label>
                    <input
                      className="bl-up-input"
                      type="email"
                      value={subEmail}
                      onChange={(e) => setSubEmail(e.target.value)}
                      placeholder="name@example.com"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {hasBriefs && (
                  <div style={{ marginTop: 14 }}>
                    <label className="bl-up-label">Which brief are these for?</label>
                    <select className="bl-up-select" value={batchBrief} onChange={(e) => applyBatchBrief(e.target.value)} disabled={submitting}>
                      <option value="">No brief, just a review</option>
                      {openBriefs.map((b) => (
                        <option key={b.id} value={b.id}>{unwrap(b.fields?.name) || "Untitled brief"}</option>
                      ))}
                    </select>
                    <p className="bl-up-hint">Sets every video below. Change any single one on its row.</p>
                  </div>
                )}

                <div className="bl-up-rows">
                  {readyVideos.map((v) => (
                    <div key={v.key} className="bl-up-row">
                      <span className="bl-up-row-icon"><Film size={15} /></span>
                      <p className="bl-up-row-name" style={{ flex: 1, minWidth: 0 }}>{v.name}</p>
                      {hasBriefs && (
                        <select
                          className="bl-up-row-select"
                          value={v.briefId}
                          disabled={submitting}
                          onChange={(e) => {
                            const id = e.target.value;
                            setVideos((prev) => prev.map((x) => (x.key === v.key ? { ...x, briefId: id } : x)));
                          }}
                        >
                          <option value="">No brief</option>
                          {openBriefs.map((b) => (
                            <option key={b.id} value={b.id}>{unwrap(b.fields?.name) || "Untitled brief"}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bl-up-actions">
                <button type="button" className="bl-up-ghost" onClick={() => setScreen("upload")} disabled={submitting}>
                  <ChevronLeft size={14} /> Back
                </button>
                <button type="button" className="bl-up-primary" disabled={submitting} onClick={handleSubmit}>
                  {submitting
                    ? "Submitting " + (submittedCount + 1) + " of " + readyVideos.length + "…"
                    : "Submit " + readyVideos.length + " video" + (readyVideos.length === 1 ? "" : "s")}
                </button>
              </div>
            </div>
          </div>
        </Shell>
      </>
    );
  }

  // ── Step 1 · Drop ──────────────────────────────────────────────────
  return (
    <>
      <Style />
      <Shell
        logo={accountLogo}
        brandName={accountName || "Brieflee"}
        aside={<>Trouble uploading? <a href="mailto:hello@brieflee.co">Get help</a></>}
      >
        <div className="bl-up-body">
          <div className="bl-up-copy">
            <span className="bl-up-eyebrow">Upload for review</span>
            <h1 className="bl-up-title">Drop your videos<br />for {brandLabel}</h1>
            <p className="bl-up-lede">
              No account, no login. Add your files, tell us who you are, and they go straight to the team.
            </p>
            <div className="bl-up-points">
              <span className="bl-up-point">
                <span className="bl-up-tick"><Check size={12} strokeWidth={3} /></span>
                Up to {UPLOAD_MAX_MB} MB per video
              </span>
              <span className="bl-up-point">
                <span className="bl-up-tick"><Check size={12} strokeWidth={3} /></span>
                As many videos as you need, in one go
              </span>
              <span className="bl-up-point">
                <span className="bl-up-tick"><Check size={12} strokeWidth={3} /></span>
                {hasBriefs ? "Scored against the brief in minutes" : "Reviewed by the team in minutes"}
              </span>
            </div>
          </div>

          <div className="bl-up-panel">
            <span className="bl-up-sweep" aria-hidden="true"><i /></span>
            <div className="bl-up-card">
              <div
                className={"bl-up-drop" + (dragOver ? " is-over" : "")}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              >
                <span className="bl-up-stack" aria-hidden="true">
                  <span className="bl-up-sheet s1" />
                  <span className="bl-up-sheet s2" />
                  <span className="bl-up-sheet s3" />
                </span>
                <p className="bl-up-drop-title">
                  <span className="bl-up-only-desktop">Drop your videos here</span>
                  <span className="bl-up-only-mobile">Add your videos</span>
                </p>
                <p className="bl-up-drop-copy">
                  <span className="bl-up-only-desktop">Or <b>browse your files</b></span>
                  <span className="bl-up-only-mobile">Camera roll or files. Up to {UPLOAD_MAX_MB} MB each.</span>
                </p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
              />

              {videos.length > 0 && (
                <div className="bl-up-rows">
                  {videos.map((v) => (
                    <div key={v.key} className="bl-up-row">
                      <span className={"bl-up-row-icon" + (v.status === "ready" ? " is-ok" : v.status === "error" ? " is-bad" : "")}>
                        {v.status === "ready" ? <Check size={15} strokeWidth={2.4} /> : <Film size={15} />}
                      </span>
                      <div className="bl-up-row-main">
                        <p className="bl-up-row-name">{v.name}</p>
                        <p className="bl-up-row-meta">
                          {v.sizeMb}
                          {v.status === "uploading" && " · uploading"}
                          {v.status === "ready" && " · ready"}
                          {v.status === "error" && " · upload failed, remove and try again"}
                        </p>
                        {v.status === "uploading" && (
                          <div className="bl-up-bar"><div className="bl-up-bar-fill" style={{ width: "70%" }} /></div>
                        )}
                      </div>
                      <button type="button" className="bl-up-row-x" onClick={() => removeVideo(v.key)} aria-label="Remove">
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bl-up-actions">
              <span className="bl-up-count">
                {videos.length === 0 ? "" : readyVideos.length + " of " + videos.length + " ready"}
              </span>
              <button
                type="button"
                className="bl-up-primary"
                disabled={readyVideos.length === 0 || stillUploading}
                onClick={() => setScreen("review")}
              >
                {stillUploading ? "Uploading…" : "Continue"}
                <ArrowRight size={15} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </div>
      </Shell>
    </>
  );
}
