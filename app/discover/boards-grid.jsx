// =====================================================================
// /app/discover/boards-grid.jsx — Simple grid of the user's boards.
//
// Source: brieflee beta → boards (XiLxhAkyOL9yrX). Softr scopes the
// list to the current user via the source binding's "Linked to logged-
// in user" filter on the User field.
//
// Each card shows the board's emoji + name + (optional) description
// on a sticky-note-ish tile. Click opens /boards/details as an xl
// Softr modal so the user can edit it (header block we built lives
// there, plus whatever board content blocks Bev places below).
//
// SOFTR UI SETUP:
//   1. Page: whatever — typically the Discover landing page.
//   2. Source: brieflee beta → boards, filter "User = logged-in user".
//   3. Visibility: signed-in users.
// =====================================================================

import { useMemo } from "react";
import { useRecords, q } from "@/lib/datasource";

// ─── Brand palette ────────────────────────────────────────────
const NAVY_DEEP        = "#001364";
const PERIWINKLE       = "#879CF7";
const PERIWINKLE_HOVER = "#294FF6";
const MUTED            = "#6B7A99";
const SOFT_MUTED       = "#9aa6c3";
const BORDER           = "rgba(217, 224, 255, 0.55)";
const TINT_BG          = "rgba(135, 156, 247, 0.08)";

const select = q.select({
  name:        "dsjPO",
  description: "B6lpT",
  emoji:       "695Lf",
});

function unwrap(raw) {
  if (raw == null) return "";
  if (typeof raw === "string") return raw.trim();
  if (Array.isArray(raw)) return raw.map(unwrap).filter(Boolean).join(", ");
  if (typeof raw === "object") return raw.label || raw.value || raw.name || "";
  return String(raw);
}

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  const { data, status } = useRecords({ select });
  const boards = useMemo(() => {
    const pages = data?.pages;
    if (Array.isArray(pages)) return pages.flatMap((p) => p?.items ?? []);
    return Array.isArray(data) ? data : [];
  }, [data]);

  const isLoading = status === "pending";

  // Navigate to the full board page in the same tab — NOT a Softr
  // modal. The board view is a standalone page at /board?recordId=…,
  // not the modal /boards/details. We use window.parent.location so
  // the navigation breaks OUT of any Softr modal iframe this grid
  // happens to be embedded inside; if there's no parent frame it
  // falls back to window.location and behaves the same.
  const openBoard = (id) => {
    if (typeof window === "undefined" || !id) return;
    const url = `/board?recordId=${encodeURIComponent(id)}`;
    try {
      (window.parent || window).location.href = url;
    } catch {
      window.location.href = url;
    }
  };

  // Empty-state CTA → open the /create-board form. Try the Softr modal
  // helper first so existing on-page state isn't lost; fall back to a
  // plain navigation if the helper isn't on window.
  const openCreateBoard = () => {
    if (typeof window === "undefined") return;
    const path = "/create-board";
    const opener = window.openSwModal || window.parent?.openSwModal;
    if (typeof opener === "function") {
      opener(path, "md");
    } else {
      window.location.href = path;
    }
  };

  return (
    <>
      <Style />
      <div className="container mx-auto px-4 py-8 md:py-10 max-w-3xl">
          <h2 className="bl-bg-heading">Your boards</h2>
          {isLoading ? (
            <div className="bl-bg-grid">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bl-bg-card bl-bg-skeleton" />
              ))}
            </div>
          ) : boards.length === 0 ? (
            <button
              type="button"
              className="bl-bg-empty"
              onClick={openCreateBoard}
            >
              <span className="bl-bg-empty-emoji">📋</span>
              <p className="bl-bg-empty-title">No boards yet</p>
              <p className="bl-bg-empty-sub">Click to create your first board</p>
            </button>
          ) : (
            <div className="bl-bg-grid">
              {boards.map((b) => {
                const f = b?.fields || {};
                const name  = unwrap(f.name)        || "Untitled board";
                const desc  = unwrap(f.description) || "";
                const emoji = unwrap(f.emoji)       || "📋";
                return (
                  <button
                    type="button"
                    key={b.id}
                    className="bl-bg-card"
                    onClick={() => openBoard(b.id)}
                  >
                    <span className="bl-bg-emoji">{emoji}</span>
                    <span className="bl-bg-name">{name}</span>
                    {desc && <span className="bl-bg-desc">{desc}</span>}
                  </button>
                );
              })}
            </div>
          )}
      </div>
    </>
  );
}

// =====================================================================
// Style
// =====================================================================
function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700&display=swap');
      .bl-bg-grid, .bl-bg-grid *,
      .bl-bg-empty, .bl-bg-empty * { font-family: 'League Spartan', sans-serif; box-sizing: border-box; }

      /* Section heading */
      .bl-bg-heading {
        font-family: 'League Spartan', sans-serif;
        font-size: 20px; font-weight: 600;
        color: ${NAVY_DEEP};
        letter-spacing: -0.01em;
        line-height: 1.2;
        margin: 0 0 14px;
      }

      /* Grid — 3 columns desktop, 2 tablet, 1 mobile */
      .bl-bg-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }

      /* Card — sticky-note feel, periwinkle-tinted background, emoji
         big at the top so it reads like a little board cover */
      .bl-bg-card {
        background: ${TINT_BG};
        border: 1px solid ${BORDER};
        border-radius: 16px;
        padding: 20px 18px 18px;
        text-align: left;
        cursor: pointer;
        display: flex; flex-direction: column; gap: 8px;
        min-height: 150px;
        transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s, background 0.15s;
        position: relative;
        overflow: hidden;
      }
      .bl-bg-card:hover {
        transform: translateY(-2px);
        border-color: ${PERIWINKLE};
        background: rgba(135, 156, 247, 0.14);
        box-shadow: 0 14px 30px -16px rgba(0, 15, 77, 0.25);
      }
      .bl-bg-card:focus-visible {
        outline: 2px solid ${PERIWINKLE_HOVER};
        outline-offset: 2px;
      }
      /* Faint diagonal "board" line at the top for a touch of board
         flavour without being noisy. */
      .bl-bg-card::before {
        content: "";
        position: absolute; top: 0; left: 0; right: 0;
        height: 4px;
        background: linear-gradient(90deg, ${PERIWINKLE}, transparent);
        opacity: 0.55;
      }

      .bl-bg-emoji {
        font-size: 28px; line-height: 1;
        margin-bottom: 2px;
      }
      .bl-bg-name {
        font-size: 16px; font-weight: 600;
        color: ${NAVY_DEEP};
        letter-spacing: -0.005em;
        line-height: 1.25;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      .bl-bg-desc {
        font-size: 12px; line-height: 1.45;
        color: ${MUTED};
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }

      /* Loading skeleton */
      .bl-bg-skeleton {
        background:
          linear-gradient(120deg, ${TINT_BG} 30%, #f0f4ff 50%, ${TINT_BG} 70%);
        background-size: 200% 100%;
        animation: blGridShimmer 1.2s ease-in-out infinite;
        cursor: default;
      }
      .bl-bg-skeleton::before { display: none; }
      .bl-bg-skeleton:hover {
        transform: none;
        border-color: ${BORDER};
        box-shadow: none;
        background:
          linear-gradient(120deg, ${TINT_BG} 30%, #f0f4ff 50%, ${TINT_BG} 70%);
        background-size: 200% 100%;
      }
      @keyframes blGridShimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* Empty state — clickable, opens /create-board modal */
      .bl-bg-empty {
        display: block;
        width: 100%;
        text-align: center;
        padding: 56px 20px;
        background: #FFFFFF;
        border: 1px dashed ${BORDER};
        border-radius: 16px;
        color: ${SOFT_MUTED};
        cursor: pointer;
        transition: transform 0.15s, border-color 0.15s, background 0.15s, box-shadow 0.15s;
        font-family: 'League Spartan', sans-serif;
      }
      .bl-bg-empty:hover {
        transform: translateY(-2px);
        border-color: ${PERIWINKLE};
        background: rgba(135, 156, 247, 0.06);
        box-shadow: 0 14px 30px -16px rgba(0, 15, 77, 0.18);
      }
      .bl-bg-empty:focus-visible {
        outline: 2px solid ${PERIWINKLE_HOVER};
        outline-offset: 2px;
      }
      .bl-bg-empty-emoji {
        display: block;
        font-size: 34px;
        margin-bottom: 10px;
      }
      .bl-bg-empty-title {
        margin: 0 0 4px;
        font-size: 14px;
        font-weight: 600;
        color: ${NAVY_DEEP};
        letter-spacing: -0.005em;
      }
      .bl-bg-empty-sub {
        margin: 0;
        font-size: 13px;
        color: ${MUTED};
      }

      /* Responsive */
      @media (max-width: 880px) {
        .bl-bg-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 560px) {
        .bl-bg-grid { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}
