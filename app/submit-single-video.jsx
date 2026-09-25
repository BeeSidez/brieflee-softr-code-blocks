// PROOF OF CONCEPT — submit ONE video by link, with the Workspace and Brief
// dropdowns scoped to the logged-in user (only their own show).
//
// The point this proves: `useLinkedRecords` returns the WHOLE linked table, so
// it can't scope a dropdown to the user. Instead we read the logged-in user's
// OWN record and pull their linked accounts + briefs. This is the exact pattern
// app/projects/index already uses in production.
//
// SOFTR SOURCE TAB: bind this block to brieflee beta -> submissions (one source).

import { useState, useMemo } from "react";
import { useRecord, useRecordCreate, q } from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// SUBMISSIONS write fields (ids confirmed from the Softr Database via MCP).
const createFields = q.select({
  accounts:       "v94f0", // LINKED_RECORD -> accounts
  briefs:         "fqtit", // LINKED_RECORD -> briefs
  users:          "DxNOa", // LINKED_RECORD -> users
  videoUrl:       "XrARi", // URL
  creatorName:    "9ZryL", // text
  submissionType: "b82bF", // SELECT
  userValidation: "QqS0I", // SELECT
  platformName:   "5Quiw", // SELECT
});

// The logged-in user's OWN linked accounts + briefs — this is what scopes the
// two dropdowns. Field ids from the USERS table (via MCP).
const userScopedSelect = q.select({
  accounts: "Nz6VX", // users.accounts
  briefs:   "3Ww0J", // users.briefs
});

// SELECT option ids reused from the working bulk-upload block.
const SUBMISSION_TYPE = "5ed52a56-f33e-475a-bc32-95b11756290f";
const USER_VALIDATION = "0fb06c28-5e30-4a38-9cf4-2e75490f7d1a";
const PLATFORM_NAME   = "c72e31e0-d976-478e-ac07-2eeca1f811b0";

function unwrap(raw) {
  if (raw == null) return "";
  if (typeof raw === "string") return raw.trim();
  if (Array.isArray(raw)) {
    const f = raw[0];
    return typeof f === "string" ? f.trim() : String(f?.label ?? f?.name ?? "").trim();
  }
  if (typeof raw === "object") return String(raw.label ?? raw.name ?? "").trim();
  return String(raw).trim();
}

export default function Block() {
  const user = useCurrentUser();
  const createRecord = useRecordCreate({ fields: createFields });

  // Read the user's OWN record -> their linked accounts + briefs.
  const userScoped = useRecord({ recordId: user?.id, select: userScopedSelect, enabled: !!user?.id });

  const accounts = useMemo(() => {
    const raw = userScoped?.data?.fields?.accounts;
    return Array.isArray(raw)
      ? raw.map((a) => ({ id: a?.id || "", name: unwrap(a) || "Untitled workspace" })).filter((x) => x.id)
      : [];
  }, [userScoped?.data]);

  const briefs = useMemo(() => {
    const raw = userScoped?.data?.fields?.briefs;
    return Array.isArray(raw)
      ? raw.map((b) => ({ id: b?.id || "", name: unwrap(b) || "Untitled brief" })).filter((x) => x.id)
      : [];
  }, [userScoped?.data]);

  const [account, setAccount] = useState("");
  const [brief, setBrief] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = createRecord.enabled && !!user?.id && !!account && !!videoUrl.trim();

  const onSubmit = async () => {
    // Mutations must be gated on `enabled` (docs: "always check it before ... calling the function").
    if (!createRecord.enabled) { toast.error("You don't have permission to submit."); return; }
    if (!account || !videoUrl.trim()) { toast.error("Pick a workspace and paste a video link."); return; }
    setSubmitting(true);
    try {
      await createRecord.mutateAsync({
        accounts: account,                       // single linked id (matches bulk-upload)
        briefs: brief ? [{ id: brief }] : null,  // linked array (matches bulk-upload)
        users: user.id,
        videoUrl: videoUrl.trim(),
        creatorName: user.fullName || "",
        submissionType: SUBMISSION_TYPE,
        userValidation: USER_VALIDATION,
        platformName: PLATFORM_NAME,
      });
      toast.success("Video submitted!");
      setVideoUrl("");
      setBrief("");
    } catch (e) {
      toast.error("Submit failed", { description: e?.message || "Try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-10">
      <div className="content max-w-md space-y-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Submit a video</h1>
          <p className="text-sm text-muted-foreground mt-1">Proof of concept: workspace + brief are scoped to you.</p>
        </div>

        {/* Workspace — only the user's own */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Workspace</label>
          <Select value={account} onValueChange={setAccount}>
            <SelectTrigger><SelectValue placeholder="Choose a workspace..." /></SelectTrigger>
            <SelectContent>
              {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {userScoped?.data && accounts.length === 0 && (
            <p className="text-xs text-destructive">No workspaces found on your user record.</p>
          )}
        </div>

        {/* Brief — only the user's own */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Brief <span className="text-muted-foreground font-normal">(optional)</span></label>
          <Select value={brief || "__none__"} onValueChange={(v) => setBrief(v === "__none__" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Choose a brief..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__"><span className="text-muted-foreground italic">None</span></SelectItem>
              {briefs.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Video link */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Video link</label>
          <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." />
        </div>

        <Button onClick={onSubmit} disabled={!canSubmit || submitting} className="w-full">
          {submitting ? "Submitting..." : "Submit video"}
        </Button>

        {!user?.id && <p className="text-xs text-destructive">User not detected. Please log in.</p>}
        {user?.id && !createRecord.enabled && <p className="text-xs text-destructive">You don't have permission to create submissions.</p>}
      </div>
    </div>
  );
}
