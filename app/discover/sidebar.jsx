// =====================================================================
// Vibe Coding block: Discover · Vertical sidebar with Boards
// =====================================================================
// Full vertical nav for the /discover page. Matches the existing app
// nav (Brieflee mark + "lee" wordmark, collapsible left rail, the
// five main items: Home / Discover / Projects / Videos / Notifications)
// and adds a Boards section below — Motion-style — so users can
// create boards from the sidebar without leaving the feed.
//
// Boards data
//   • Reads boards table (XiLxhAkyOL9yrX) scoped to the current user
//     via the User link (enk5I) and renders each as emoji + name.
//   • "+ Create board" in the section header opens a modal that writes
//     a new board with the current user linked. The emoji field is a
//     SELECT with allowToAddNewChoice, so we pass {label} and Softr
//     creates the option on the fly.
//   • The Discover videos-grid block on the same page reads the same
//     boards table — newly created boards show up in the per-card
//     "Add to board" menu immediately after refetch.
//
// Collapse behaviour persists to localStorage so it survives reloads.
// Active item is highlighted by matching the current pathname.
//
// SOFTR UI SETUP:
//   1. Place this block in a narrow LEFT column on the Discover page
//      (~240px expanded / 64px collapsed). The block uses sticky top:0
//      so it stays visible while the content column scrolls.
//   2. Source tab → Database: brieflee beta → Table: boards
//   3. Actions tab → enable Add Record on boards (aliases auto-populate
//      from createBoardFields below).
//   4. Visibility tab → logged-in app users.
// =====================================================================

import { useEffect, useMemo, useState } from "react";
import {
  useRecords,
  useRecordCreate,
  q,
} from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import {
  Home,
  Search,
  PlusSquare,
  UploadCloud,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  X,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// ─── Brand tokens ────────────────────────────────────────────
const NAVY = "#001364";
const PERIWINKLE = "#879CF7";

// ─── Main app items (mirror the existing top-level nav) ───────
// hrefs match the routes already in the Brieflee Softr app:
// /home, /discover, /projects, /videos, /notifications.
const MAIN_ITEMS = [
  { key: "home",          label: "Home",          href: "/home",          icon: Home },
  { key: "discover",      label: "Discover",      href: "/discover",      icon: Search },
  { key: "projects",      label: "Projects",      href: "/projects",      icon: PlusSquare },
  { key: "videos",        label: "Videos",        href: "/videos",        icon: UploadCloud },
  { key: "notifications", label: "Notifications", href: "/notifications", icon: Bell },
];

// ─── boards table (XiLxhAkyOL9yrX) ───────────────────────────
const boardsSelect = q.select({
  name:  "dsjPO",  // primary
  emoji: "695Lf",  // SELECT (allowToAddNewChoice = true)
  user:  "enk5I",  // LINKED_RECORD → users
});

const createBoardFields = q.select({
  name:  "dsjPO",
  emoji: "695Lf",
  user:  "enk5I",
});

// LINKED_RECORD / LOOKUP rows surface as either [{id,label}] or [id].
function linkIds(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => (typeof item === "string" ? item : item?.id || null))
    .filter(Boolean);
}

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  const user = useCurrentUser();
  const userId = user?.id || null;

  // Collapse state — persisted across reloads so the user's preference sticks.
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("brieflee_discover_nav_collapsed") === "1";
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "brieflee_discover_nav_collapsed",
      collapsed ? "1" : "0",
    );
  }, [collapsed]);

  // Active item — match pathname against each item's href. Tolerates
  // sub-paths (e.g. /projects/details/... still highlights Projects).
  const activeKey = useMemo(() => {
    if (typeof window === "undefined") return "discover";
    const path = window.location.pathname;
    for (const item of MAIN_ITEMS) {
      if (path === item.href || path.startsWith(item.href + "/")) return item.key;
    }
    return null;
  }, []);

  // Boards owned by the current user.
  const { data: boardsData, refetch } = useRecords({
    select: boardsSelect,
    count: 200,
  });
  const allBoards = boardsData?.pages?.flatMap((p) => p?.items ?? []) ?? [];
  const myBoards = useMemo(() => {
    if (!userId) return [];
    return allBoards.filter((b) => linkIds(b?.fields?.user).includes(userId));
  }, [allBoards, userId]);

  // Create-board modal state.
  const createBoard = useRecordCreate({ fields: createBoardFields });
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setEmoji("");
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Board name is required");
      return;
    }
    if (!userId) {
      toast.error("Please log in to create a board");
      return;
    }
    setSubmitting(true);
    try {
      const fields = {
        name: name.trim(),
        user: [{ id: userId }],
      };
      const trimmedEmoji = emoji.trim();
      if (trimmedEmoji) fields.emoji = { label: trimmedEmoji };
      await createBoard.mutateAsync(fields);
      toast.success("Board created");
      setModalOpen(false);
      resetForm();
      await refetch?.();
    } catch (err) {
      console.error("Create board failed:", err);
      toast.error("Couldn't create board", {
        description: err?.message || "Try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const widthClass = collapsed ? "w-[64px]" : "w-[240px]";

  return (
    <>
      <aside
        className={`sticky top-0 h-screen flex flex-col bg-card border-r border-border transition-[width] duration-200 ${widthClass}`}
      >
        {/* ─── Header: logo + collapse toggle ───────────────────────── */}
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-3 h-14 border-b border-border`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-md shrink-0"
              style={{ background: NAVY }}
              aria-hidden
            />
            {!collapsed && (
              <span
                className="text-base font-bold tracking-tight truncate"
                style={{ color: PERIWINKLE }}
              >
                lee
              </span>
            )}
          </div>
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Collapse sidebar"
              title="Collapse"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="mt-2 mx-auto p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Expand sidebar"
            title="Expand"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        )}

        {/* ─── Scrollable nav body ──────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-2">
          {/* Main items */}
          <ul className="space-y-0.5 px-2">
            {MAIN_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeKey === item.key;
              return (
                <li key={item.key}>
                  <a
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    } ${collapsed ? "justify-center" : ""}`}
                    style={isActive ? { background: "rgba(135, 156, 247, 0.16)" } : undefined}
                  >
                    <Icon
                      className="w-4 h-4 shrink-0"
                      style={isActive ? { color: PERIWINKLE } : undefined}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Boards section — expanded view */}
          {!collapsed && (
            <div className="mt-5 px-2">
              <div className="flex items-center justify-between px-2.5 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Boards
                </span>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  disabled={!userId}
                  className={`p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${
                    !userId ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                  aria-label="Create board"
                  title="Create board"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {myBoards.length === 0 ? (
                <div className="px-2.5 py-2 text-xs text-muted-foreground leading-relaxed">
                  No boards yet. Tap + to create your first.
                </div>
              ) : (
                <ul className="space-y-0.5">
                  {myBoards.map((b) => {
                    const f = b?.fields || {};
                    const boardName = f.name || "Untitled board";
                    const boardEmoji = f.emoji?.label || "";
                    const href = `/boards/r/${b.id}`;
                    return (
                      <li key={b.id}>
                        <a
                          href={href}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          <span className="w-4 h-4 flex items-center justify-center shrink-0 text-sm">
                            {boardEmoji || (
                              <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </span>
                          <span className="truncate">{boardName}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* Boards section — collapsed view (emoji-only rail) */}
          {collapsed && (
            <div className="mt-5 px-2 space-y-1 flex flex-col items-center">
              {/* Create button stays visible in collapsed mode too. */}
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                disabled={!userId}
                className={`flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${
                  !userId ? "opacity-40 cursor-not-allowed" : ""
                }`}
                aria-label="Create board"
                title="Create board"
              >
                <Plus className="w-4 h-4" />
              </button>
              {myBoards.map((b) => {
                const f = b?.fields || {};
                const boardName = f.name || "Untitled board";
                const boardEmoji = f.emoji?.label || "";
                const href = `/boards/r/${b.id}`;
                return (
                  <a
                    key={b.id}
                    href={href}
                    className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted text-base transition-colors"
                    title={boardName}
                  >
                    {boardEmoji || (
                      <Bookmark className="w-4 h-4 text-muted-foreground" />
                    )}
                  </a>
                );
              })}
            </div>
          )}
        </nav>
      </aside>

      {/* ─── Create board modal ────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 19, 100, 0.32)" }}
          onClick={() => !submitting && setModalOpen(false)}
        >
          <div
            className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cb-title"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3
                  id="cb-title"
                  className="text-lg font-bold"
                  style={{ color: NAVY }}
                >
                  Create board
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Organize saved videos into themed collections.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setModalOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Name <span style={{ color: "#d92626" }}>*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hooks · Week 1 Homework"
                  disabled={submitting}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Emoji{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="🤫"
                  maxLength={4}
                  disabled={submitting}
                  className="w-24 text-center text-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground rounded-lg"
              >
                Cancel
              </button>
              <Button
                onClick={handleCreate}
                disabled={submitting || !name.trim() || !userId}
                style={{ background: PERIWINKLE, color: "#fff" }}
              >
                {submitting ? "Creating…" : "Create board"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
