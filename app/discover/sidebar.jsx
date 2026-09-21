// =====================================================================
// Vibe Coding block: Discover · Boards strip
// =====================================================================
// Thin vertical strip that sits NEXT TO the existing app nav on the
// /discover page (NOT a replacement for it). Contains exactly two
// things: a "Discover" link at the top and a Boards section below
// where the user can create boards and jump into one.
//
// Boards visibility (current user only) is handled in Softr's Source
// tab — this block renders whatever the Source returns, no client-side
// user filter.
//
// SOFTR UI SETUP:
//   1. Place this block in a thin left column (~180px) NEXT TO your
//      existing nav on the Discover page. Block is sticky top:0 h-screen
//      so it stays visible while the content column scrolls.
//   2. Source tab → Database: brieflee beta → Table: boards
//      → Source filter: User = Logged-in user (this is where the
//      "only my boards" rule lives)
//   3. Actions tab → enable Add Record on boards (aliases auto-populate
//      from createBoardFields).
//   4. Visibility tab → logged-in app users.
// =====================================================================

import { useState } from "react";
import { useRecords, useRecordCreate, q } from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { Plus, X, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// ─── Brand tokens ────────────────────────────────────────────
const NAVY = "#001364";
const PERIWINKLE = "#879CF7";
const PERIWINKLE_TINT = "rgba(135, 156, 247, 0.16)";

// ─── boards table (XiLxhAkyOL9yrX) ───────────────────────────
const boardsSelect = q.select({
  name:  "dsjPO",  // primary
  emoji: "695Lf",  // SELECT (allowToAddNewChoice = true)
});

// `user` is included on writes so new boards get linked to the
// creator — Softr's Source filter is what scopes the READ, not this.
const createBoardFields = q.select({
  name:  "dsjPO",
  emoji: "695Lf",
  user:  "enk5I",  // LINKED_RECORD → users
});

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  const user = useCurrentUser();
  const userId = user?.id || null;

  const { data, refetch } = useRecords({ select: boardsSelect, count: 500 });
  const boards = data?.pages?.flatMap((p) => p?.items ?? []) ?? [];

  // ─── Create-board modal ──────────────────────────────────────
  const createBoard = useRecordCreate({ fields: createBoardFields });
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
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
      setName("");
      setEmoji("");
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

  return (
    <>
      <aside
        className="sticky top-0 h-screen w-[180px] flex flex-col bg-card border-r border-border"
      >
        {/* Discover */}
        <div className="px-2 pt-3 pb-2 border-b border-border">
          <a
            href="/discover"
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-semibold text-foreground"
            style={{ background: PERIWINKLE_TINT }}
          >
            <span style={{ color: NAVY }}>Discover</span>
          </a>
        </div>

        {/* Boards */}
        <div className="flex-1 overflow-y-auto py-3 px-2">
          <div className="flex items-center justify-between px-2.5 mb-2">
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

          {boards.length === 0 ? (
            <div className="px-2.5 py-2 text-xs text-muted-foreground leading-relaxed">
              No boards yet. Tap + to create your first.
            </div>
          ) : (
            <ul className="space-y-0.5">
              {boards.map((b) => {
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
      </aside>

      {/* ─── Create board modal ────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 19, 100, 0.32)" }}
          onClick={closeModal}
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
                onClick={closeModal}
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
                onClick={closeModal}
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
