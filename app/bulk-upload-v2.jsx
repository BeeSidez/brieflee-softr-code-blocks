import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { datasource, useRecordCreate, useRecords, useRecord, useUpload, useProxyFetch, q } from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { ChevronRight, AlertCircle, Check, X, DownloadCloud, Video, ChevronDown, ChevronUp, FileText, Building2, Loader2, Search, Paperclip, ClipboardList } from "lucide-react";

// =====================================================================
// Bulk upload v2 (4 September 2026): the same five steps and the same
// review table as before; the difference is what "Submit" does. It used
// to create a submission row and wait for n8n. It now runs the review
// engine (the same code as /review) here in the block for each video,
// one after the other: Cloudinary, Gemini with that video's Review Agents
// and the workspace thresholds, then the review, the submission, the
// report rows, the notifications and the emails. Review only: Content
// Review, or Brief when a brief is picked.
// Every hook names its source; the ids are this block's connection ids.
// =====================================================================
const ds = datasource.define({
  submissions:   "0234021d-fdc1-45ea-a9e5-18a70532a2ef",
  accounts:      "22a5e0ff-ea78-464a-9161-f9c8d5235dde",
  briefs:        "briefs",
  reviews:       "reviews",
  report:        "report",
  users:         "users",
  notifications: "notifications",
  emailit:       "e0356811-ccfc-489d-b325-3c029b7659da",
  google:        "a934af4b-5072-4f40-a3c6-b081d202fd7c",
});

// QA option IDs for the SUBMISSIONS table
const QA_OPTIONS = [
  { id: "40946cb6-2638-4c13-9aa2-3f66d1ab8d15", label: "Product visibility" },
  { id: "3f1ff82b-1fae-4ec8-b727-8ab4337d3d22", label: "Product usage" },
  { id: "f8968115-bdab-4360-afe5-fc4d53b26df3", label: "Hook quality" },
  { id: "94e77b01-88ec-4f9f-b6fb-7ca5b5be7b13", label: "Visual hook" },
  { id: "dcb604cb-132e-4928-bab7-1a5dbfd61258", label: "Audio clarity" },
  { id: "664e176a-ac4b-469a-b3fb-efa0abd5409c", label: "Audio delivery" },
  { id: "eac26e3c-8601-4c2a-a038-39b694084caf", label: "Pronunciation" },
  { id: "314d167a-7456-425b-aa9e-0cab135f06be", label: "Music & sound balance" },
  { id: "5e36d433-92b5-4ad7-9447-abcaa5401991", label: "Follows the brief" },
  { id: "a1d164a9-3972-45bb-a444-34bba3757621", label: "Brand name mentioned" },
  { id: "8b51a26d-6b1c-4b37-8939-b7339eb7f595", label: "Lighting & camera" },
  { id: "fe7f6d81-eda9-4c23-8650-43c9351b7334", label: "Setting & background" },
  { id: "641e6d1f-a3cd-451c-bbb8-c8e44c6aaf51", label: "Distracting elements" },
  { id: "c7b897ff-b5f8-4d4f-aaa4-07849c4c0fa6", label: "Text legibility" },
  { id: "c1d3605d-e91c-4509-aad0-b337ff3ed898", label: "Closed captions" },
  { id: "5410f4ee-20f3-4356-8180-f73b1ae859df", label: "Safe zones" },
  { id: "8c96bc97-ebde-44f3-b4ee-65640e6ba8f6", label: "Scene pacing" },
  { id: "ea740500-ef29-4246-aa61-1e1264cce230", label: "Video length" },
  { id: "15dfd7e3-226d-4ac3-bd2e-4383857ee08c", label: "Watchable on mute" },
  { id: "58615cda-8673-4d3d-a3ce-7ef871e81991", label: "Creator visibility" },
  { id: "8ab22af0-53f5-45a1-856e-1dcbbb048e19", label: "Energy & authenticity" },
  { id: "e9320bd8-73ac-4e89-95a6-70a87a40b3e0", label: "Wardrobe & appearance" },
  { id: "719b3047-73f8-4958-8080-05485b6859bd", label: "CTA present" },
  { id: "873be85d-9d67-4286-b7d7-49dc35c45baa", label: "Brand alignment" },
  { id: "82baef6f-fd83-4eac-a159-1298fd71eb07", label: "Copyright check" },
  { id: "a135797b-d452-4f83-9b39-9a40481f1411", label: "Inspiration link match" },
];


// ACCOUNTS table: the workspaces the logged-in user belongs to
const accountsSelect = q.select({
  name: "aAKkT",
});

// BRIEFS table: scoped to the logged-in user on the Source tab
const briefsSelect = q.select({
  name: "z3lpx",
  accounts: "EhzVx",
  status: "71Oud",
  contentType: "EO7S4",
});

const BRIEF_MODES = [
  { id: "existing", label: "Pick a brief", hint: "From this workspace", icon: FileText },
  { id: "paste", label: "Paste it in", hint: "Copy your brief text", icon: ClipboardList },
  { id: "pdf", label: "Attach a PDF", hint: "Upload a document", icon: Paperclip },
  { id: "none", label: "No brief", hint: "Go straight to review", icon: X },
];

const readText = (raw: any): string => {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw.map(readText).filter(Boolean).join(", ");
  if (raw && typeof raw === "object") return raw.label ?? raw.value ?? raw.title ?? raw.name ?? "";
  return raw == null ? "" : String(raw);
};

// Softr caps uploads from a published app at 128 MB
const MAX_UPLOAD_MB = 128;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

const UPLOAD_BAR_CSS = `@keyframes blUploadSlide { 0% { transform: translateX(-110%); } 100% { transform: translateX(320%); } }`;

function StepIndicator({ step }) {
  const steps = [
    { num: 1, label: "Upload" },
    { num: 2, label: "Workspace" },
    { num: 3, label: "QA Checklist" },
    { num: 4, label: "Brief" },
    { num: 5, label: "Review" },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step > s.num ? "bg-primary text-primary-foreground" : step === s.num ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground"}`}>
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-xs mt-1 font-medium whitespace-nowrap ${step === s.num ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && <div className={`w-10 h-0.5 mx-1 mb-4 transition-all ${step > s.num ? "bg-primary" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

function UploadStep({ videos, onUpload, onRemove, onNext }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const uploadingCount = videos.filter((v) => v.status === "uploading").length;
  const readyCount = videos.filter((v) => v.status === "completed").length;
  return (
    <div className="flex flex-col items-center justify-center">
      <style>{UPLOAD_BAR_CSS}</style>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); onUpload(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-all ${dragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50 hover:bg-muted/40"}`}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${dragging ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          <DownloadCloud className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-foreground text-lg">Drop your video files here</p>
          <p className="text-muted-foreground text-sm mt-1">or click to browse from your computer</p>
        </div>
        <Badge variant="secondary" className="text-xs">Video files only, up to {MAX_UPLOAD_MB} MB each</Badge>
        <input ref={inputRef} type="file" accept="video/*" multiple className="hidden" onChange={(e) => { onUpload(e.target.files); e.target.value = ""; }} />
      </div>
      {videos.length > 0 && (
        <div className="w-full max-w-lg mt-6 space-y-2">
          <p className="text-sm font-semibold text-foreground">
            {uploadingCount > 0 ? `${readyCount} of ${videos.length} ready` : `${readyCount} video${readyCount !== 1 ? "s" : ""} ready`}
          </p>
          {videos.map((v) => (
            <div key={v.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${v.status === "error" ? "border-destructive/40 bg-destructive/5" : "bg-card"}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${v.status === "completed" ? "bg-primary/10 text-primary" : v.status === "error" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                {v.status === "completed" ? <Check className="w-4 h-4" /> : v.status === "error" ? <AlertCircle className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">{v.file.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{(v.file.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                {v.status === "uploading" && (
                  <>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: Math.max(3, v.pct || 0) + "%", transition: "width 180ms linear" }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 tabular-nums">Uploading {Math.round(v.pct || 0)}%</p>
                  </>
                )}
                {v.status === "completed" && <p className="text-xs text-primary mt-0.5">Ready</p>}
                {v.status === "error" && <p className="text-xs text-destructive mt-0.5">{v.error || "Upload failed"}</p>}
              </div>
              <button onClick={(e) => { e.stopPropagation(); onRemove(v.id); }} className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-all shrink-0">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="w-full max-w-lg mt-6">
        <Button onClick={onNext} disabled={readyCount === 0 || uploadingCount > 0} className="w-full">
          {uploadingCount > 0 ? `Uploading ${uploadingCount} video${uploadingCount !== 1 ? "s" : ""}...` : "Continue"}
          {uploadingCount === 0 && <ChevronRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
}

function WorkspaceStep({ accounts, isLoading, selectedAccount, onSelect, onNext, onBack }) {
  const single = accounts.length === 1 ? accounts[0] : null;
  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">{single ? "Confirm Workspace" : "Select Workspace"}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {single ? "These videos will be added to your workspace." : "Choose which account these videos belong to."}
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 p-4 rounded-xl border bg-card text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          Loading your workspaces...
        </div>
      )}

      {!isLoading && single && (
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-card">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">Workspace</p>
            <p className="font-semibold text-foreground truncate">{single.title}</p>
          </div>
          <Check className="w-5 h-5 text-primary ml-auto shrink-0" />
        </div>
      )}

      {!isLoading && accounts.length > 1 && (
        <Select value={selectedAccount || ""} onValueChange={onSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose an account..." />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>{acc.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {!isLoading && accounts.length === 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <div className="text-sm text-destructive">No accounts found for your user. Contact your admin.</div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={!selectedAccount}>
          {single ? "Confirm" : "Continue"} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function QAChecklistStep({ selected, onToggle, onSelectAll, onDeselectAll, onNext, onBack }) {
  const allSelected = selected.length === QA_OPTIONS.length;
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">QA Checklist</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Select what you'd like us to check on each video.</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{selected.length}</div>
          <div className="text-xs text-muted-foreground">Selected</div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onSelectAll} disabled={allSelected}>Select All</Button>
        <Button variant="outline" size="sm" onClick={onDeselectAll} disabled={selected.length === 0}>Deselect All</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto p-3 border rounded-xl">
        {QA_OPTIONS.map((opt) => {
          const isChecked = selected.includes(opt.id);
          return (
            <div key={opt.id} className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all ${isChecked ? "bg-primary/10" : "hover:bg-muted/50"}`} onClick={() => onToggle(opt.id)}>
              <Checkbox id={`qa-batch-${opt.id}`} checked={isChecked} onCheckedChange={() => onToggle(opt.id)} />
              <label htmlFor={`qa-batch-${opt.id}`} className="text-sm cursor-pointer">{opt.label}</label>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={selected.length === 0}>Continue <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </div>
  );
}

function BriefStep({ briefs, briefsLoading, briefMode, onModeChange, batchBrief, onSelectBrief, batchNotes, onNotesChange, batchPdf, onPdfUpload, isUploading, onNext, onBack }) {
  const [search, setSearch] = useState("");
  const pdfRef = useRef(null);
  const term = search.trim().toLowerCase();
  const visibleBriefs = term ? briefs.filter((b) => b.title.toLowerCase().includes(term)) : briefs;
  const canContinue =
    briefMode === "none" ? true :
    briefMode === "existing" ? !!batchBrief :
    briefMode === "paste" ? batchNotes.trim().length > 0 :
    briefMode === "pdf" ? !!batchPdf : false;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Add a brief</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Pick how you want to give us the brief for this batch.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {BRIEF_MODES.map((m) => {
          const Icon = m.icon;
          const active = briefMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onModeChange(active ? null : m.id)}
              className={`p-4 rounded-2xl border-2 text-center flex flex-col items-center gap-2 transition-all ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/40"}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-foreground leading-tight">{m.label}</span>
              <span className="text-xs text-muted-foreground leading-tight">{m.hint}</span>
            </button>
          );
        })}
      </div>

      {briefMode === "existing" && (
        <div className="rounded-xl border bg-card p-3 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your briefs..." className="pl-9" />
          </div>
          {briefsLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading your briefs...
            </div>
          )}
          {!briefsLoading && visibleBriefs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {briefs.length === 0 ? "No briefs on this workspace yet." : "No briefs match that search."}
            </p>
          )}
          {!briefsLoading && visibleBriefs.length > 0 && (
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {visibleBriefs.map((b) => {
                const active = batchBrief === b.id;
                const meta = [b.account, b.contentType].filter(Boolean).join(" · ");
                return (
                  <button
                    key={b.id}
                    onClick={() => onSelectBrief(active ? null : b.id)}
                    className={`w-full text-left p-3 rounded-lg border flex items-center gap-3 transition-all ${active ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{b.title}</p>
                      {meta && <p className="text-xs text-muted-foreground truncate mt-0.5">{meta}</p>}
                    </div>
                    {b.status && <Badge variant="secondary" className="text-xs shrink-0">{b.status}</Badge>}
                    {active && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {briefMode === "paste" && (
        <div className="rounded-xl border bg-card p-3 space-y-2">
          <Textarea value={batchNotes} onChange={(e) => onNotesChange(e.target.value)} placeholder="Paste your brief here..." rows={8} />
          <p className="text-xs text-muted-foreground">This is attached to every video in this batch.</p>
        </div>
      )}

      {briefMode === "pdf" && (
        <div className="rounded-xl border bg-card p-3 space-y-3">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onPdfUpload(e.dataTransfer.files?.[0] || null); }}
            onClick={() => pdfRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer transition-all border-border hover:border-primary/50 hover:bg-muted/40"
          >
            <div className="w-12 h-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
              <Paperclip className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">Choose a PDF</p>
            <p className="text-xs text-muted-foreground">or drop it here</p>
            <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { onPdfUpload(e.target.files?.[0] || null); e.target.value = ""; }} />
          </div>
          {isUploading && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" /> Uploading PDF...
            </div>
          )}
          {batchPdf && (
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-sm truncate flex-1 text-foreground">{batchPdf.filename}</span>
              <Check className="w-4 h-4 text-primary shrink-0" />
            </div>
          )}
        </div>
      )}

      {briefMode === "none" && (
        <div className="p-4 rounded-xl bg-muted/50 border border-dashed text-center">
          <p className="text-sm text-muted-foreground">No brief will be attached. You can still add one per video in the review step.</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={!canContinue}>Continue to Review <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </div>
  );
}

function ReviewStep({ videos, updateVideo, briefs, user, createEnabled, onSubmitOne, onBatchStart, onBatchDone, isSubmitting, onBack, creditsLeft }) {
  const [rowStates, setRowStates] = useState(() => videos.map(() => "pending"));
  const [importedIds, setImportedIds] = useState(new Set());
  const [runningIds, setRunningIds] = useState(new Set());
  const markRunning = (i, on) => setRunningIds((prev) => { const next = new Set(prev); if (on) next.add(i); else next.delete(i); return next; });
  const [expandedQa, setExpandedQa] = useState(null);
  const toggleRow = (i, state) => { setRowStates((prev) => { const next = [...prev]; next[i] = state; return next; }); };
  const acceptedRows = videos.filter((_, i) => rowStates[i] === "pending" && !importedIds.has(i));
  const rejectedCount = rowStates.filter((s) => s === "rejected").length;
  const creditsNow = () => Math.max(0, (creditsLeft || 0) - importedIds.size);
  const importRow = async (video, i) => {
    if (creditsNow() <= 0) { toast.error("No videos left this cycle.", { description: "Upgrade or wait until your next renewal." }); return; }
    markRunning(i, true);
    try {
      const r = await onSubmitOne(video);
      setImportedIds((prev) => new Set([...prev, i]));
      toast.success(`Video ${i + 1} reviewed: ${String(r?.decision || "").toLowerCase() || "done"}`);
    } catch (e) {
      toast.error(`Video ${i + 1} failed`, { description: e.message || "Unknown error" });
    } finally {
      markRunning(i, false);
    }
  };
  const importAll = async () => {
    const left = creditsNow();
    if (acceptedRows.length > left) { toast.error(`You have ${left} video${left === 1 ? "" : "s"} left this cycle.`, { description: `Remove ${acceptedRows.length - left} and try again.` }); return; }
    let success = 0; let fail = 0;
    // One id for the whole run. Every submission carries it, and the
    // summary at the end is the only thing anyone is told about.
    const batchId = onBatchStart ? onBatchStart() : "";
    const results = [];
    for (let i = 0; i < videos.length; i++) {
      if (rowStates[i] === "rejected" || importedIds.has(i)) continue;
      markRunning(i, true);
      try {
        const r = await onSubmitOne(videos[i], batchId);
        if (r) results.push(r);
        setImportedIds((prev) => new Set([...prev, i])); success++;
      }
      catch (e) { fail++; toast.error(`Video ${i + 1} failed`, { description: e.message || "Unknown error" }); }
      finally { markRunning(i, false); }
    }
    if (success > 0) toast.success(`${success} video${success > 1 ? "s" : ""} reviewed`);
    if (fail > 0) toast.error(`${fail} video${fail > 1 ? "s" : ""} failed.`);
    // Told once, after the last video, never per video.
    if (results.length && onBatchDone) {
      try { await onBatchDone(results, batchId); }
      catch (e) { console.error("batch summary failed:", e); }
    }
  };
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Review Videos</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            <span className="text-primary font-medium">{acceptedRows.length} to submit</span>
            {rejectedCount > 0 && <span className="text-muted-foreground"> | {rejectedCount} rejected</span>}
            {importedIds.size > 0 && <span className="text-green-600 font-medium"> | {importedIds.size} done</span>}
          </p>
          {!user?.id && <p className="text-xs text-destructive mt-1 font-medium">Warning: User not detected. Please log in.</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} size="sm">Back</Button>
          <Button onClick={importAll} disabled={isSubmitting || acceptedRows.length === 0 || !createEnabled || !user?.id} size="sm">
            {isSubmitting || runningIds.size > 0 ? "Reviewing..." : `Submit All (${acceptedRows.length})`}
          </Button>
        </div>
      </div>
      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/60 border-b">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-10">#</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Video</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Creator</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">QA Checklist</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Brief</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Notes</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground w-28">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video, i) => {
                const state = rowStates[i];
                const imported = importedIds.has(i);
                const qaExpanded = expandedQa === video.id;
                return (
                  <tr key={video.id} className={`border-b last:border-0 transition-all ${state === "rejected" ? "opacity-40 bg-muted/20" : imported ? "bg-green-50/50" : "hover:bg-muted/20"}`}>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{i + 1}</td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate text-foreground text-sm font-medium">{video.file.name}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{(video.file.size / 1024 / 1024).toFixed(1)} MB</span>
                    </td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <div className="space-y-1">
                        <Input value={video.creatorName} onChange={(e) => updateVideo(video.id, { creatorName: e.target.value })} className="h-7 text-xs" placeholder="Name" />
                        <Input value={video.creatorEmail} onChange={(e) => updateVideo(video.id, { creatorEmail: e.target.value })} className="h-7 text-xs" placeholder="Email" />
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <button onClick={() => setExpandedQa(qaExpanded ? null : video.id)} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">{video.qaChecklist.length}</Badge>
                        <span>item{video.qaChecklist.length !== 1 ? "s" : ""}</span>
                        {qaExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      {qaExpanded && (
                        <div className="mt-2 grid grid-cols-1 gap-0.5 max-h-40 overflow-y-auto p-2 border rounded-lg bg-background shadow-sm">
                          {QA_OPTIONS.map((opt) => (
                            <div key={opt.id} className="flex items-center space-x-1.5 py-0.5">
                              <Checkbox id={`${video.id}-${opt.id}`} checked={video.qaChecklist.includes(opt.id)} onCheckedChange={() => {
                                const newList = video.qaChecklist.includes(opt.id) ? video.qaChecklist.filter((x) => x !== opt.id) : [...video.qaChecklist, opt.id];
                                updateVideo(video.id, { qaChecklist: newList });
                              }} />
                              <label htmlFor={`${video.id}-${opt.id}`} className="text-[11px] cursor-pointer">{opt.label}</label>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <Select value={video.brief || "__none__"} onValueChange={(val) => updateVideo(video.id, { brief: val === "__none__" ? null : val })}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__"><span className="text-muted-foreground italic">None</span></SelectItem>
                          {briefs.map((b) => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <Textarea value={video.notes} onChange={(e) => updateVideo(video.id, { notes: e.target.value })} className="h-14 text-xs resize-none" placeholder="Notes..." />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {imported ? <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Reviewed</Badge> : runningIds.has(i) ? <Badge variant="secondary" className="text-xs"><Loader2 className="w-3 h-3 animate-spin mr-1 inline" />Reviewing</Badge> : state === "rejected" ? <Badge variant="destructive" className="text-xs">Rejected</Badge> : <Badge variant="secondary" className="text-xs">Pending</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      {!imported && (
                        <div className="flex items-center justify-center gap-1.5">
                          {state !== "rejected" && (
                            <>
                              <button onClick={() => importRow(video, i)} disabled={isSubmitting || runningIds.has(i) || !createEnabled || !user?.id} className="w-7 h-7 rounded-full bg-green-100 hover:bg-green-200 text-green-700 flex items-center justify-center transition-all disabled:opacity-50" title="Submit"><Check className="w-3.5 h-3.5" /></button>
                              <button onClick={() => toggleRow(i, "rejected")} className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-all" title="Reject"><X className="w-3.5 h-3.5" /></button>
                            </>
                          )}
                          {state === "rejected" && <button onClick={() => toggleRow(i, "pending")} className="text-xs text-primary underline hover:no-underline">Restore</button>}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// The engine (verbatim from app/video-analysis/engine.jsx, PAGE review):
// field maps, option ids, Review Agents, prompts, Cloudinary, Gemini,
// writes, notifications, EmailIt. Only what this block uses survives.
// =====================================================================
// ─── Page ──────────────────────────────────────────────────────
// The only line that changes between blocks.
const PAGE = "review";
// actor:   "user"    = logged-in brand user, gated on their users row
//          "creator" = public route, gated on the brief and its brand
// context: "workspace"  = pick a workspace and, optionally, a brief
//          "brief"      = ?recordId is the brief (creator brief page)
//          "submission" = ?recordId is the parent submission (revision)
// multi:   several videos in one go, two at a time
// /review follows the native form's logic: workspace, upload, a context choice
// (Brieflee brief, notes, or a PDF), the chosen detail, then the Review Agents
// only when the workspace has none saved.
const STEPPER = PAGE === "review";

// ─── Datasources (connection ids from THIS block's Source tab) ──

// ─── Reads ─────────────────────────────────────────────────────
// The logged-in user's own record: the gate and the workspace list.
const userSelect = q.select({
  id:              "6stLd",
  fullName:        "Pk6Tx",
  status:          "kClk9",
  videosRemaining: "3kzMt",
  accounts:        "Nz6VX",
  briefs:          "3Ww0J",
  firstName:       "0lVyD",
  email:           "PBrIP",
});
// The brand owner's row on the creator routes, read only when the brief
// and parent lookups carry no status. Nothing personal is selected.

// The chosen workspace: brand context, AI mode, thresholds, agents.
const accountSelect = q.select({
  name:            "aAKkT",
  logoUrl:         "nPI65",
  status:          "9Cdqq",
  aiMode:          "O9x4n",
  qaChecklist:     "mZaRc",
  brandBio:        "iVPat",
  brandVoice:      "ybmp8",
  brandCta:        "s9vzj",
  targetAudience:  "6g1Vd",
  painPoints:      "B4zya",
  objectives:      "5Wq2k",
  niche:           "vOp4b",
  owner:           "ISmqP",
  ownerEmail:      "pV6px",
  ownerFirstName:  "TMpNP",
  videosRemaining: "A0Cwp",
  maxVideos:       "cNlUS",
  plan:            "YluGd",
  cycleEnd:        "eaa3X",
  thProductScreen: "AFgpo",
  thHookSpeed:     "wthaW",
  thVisualHook:    "Nq4ZX",
  thCta:           "FA452",
  thFaceTime:      "FH27O",
  thTextLegibility:"TNRuM",
  thAudioClarity:  "dMTrN",
  thPacing:        "bR5PL",
  thBrandMentions: "HCvZw",
});

// Briefs in the workspace (picker) and the chosen brief (prompt).
const briefSelect = q.select({
  name:            "z3lpx",
  status:          "71Oud",
  accounts:        "EhzVx",
  projects:        "yrYvH",
  aiMode:          "wm1jM",
  qaChecklist:     "OFoS6",
  description:     "FCBU5",
  talkingPoints:   "YEfyw",
  script:          "YLabB",
  dos:             "CSbqb",
  donts:           "I5wOP",
  makeSure:        "SEksn",
  captionHooks:    "8EyqU",
  visualHooks:     "4dnWx",
  voiceoverHooks:  "3QPLK",
  productFeature:  "CSvl8",
  exampleAnalysis: "hIFSE",
  creatorName:     "oIsFn",
  creatorEmail:    "Rogsr",
  users:           "EdhwS",
  ownerEmail:      "kNX0h",
  ownerFirstName:  "oln9W",
  videosRemainingCount: "YJljG",
  usersStatus:     "7GTPj",
  closeDate:       "M4hMa",
  brandBio:        "zqP14",
  thProductScreen: "7Zpeo",
  thHookSpeed:     "CEkkg",
  thVisualHook:    "Drp5T",
  thCta:           "zo9Fo",
  thFaceTime:      "jSDeR",
  thTextLegibility:"aHH2x",
  thAudioClarity:  "zXqtt",
  thPacing:        "15284",
});

// The parent submission of a revision, and its review.

// ─── Writes ────────────────────────────────────────────────────
const submissionCreate = q.select({
  name:            "XebTQ",
  accounts:        "v94f0",
  briefs:          "fqtit",
  projects:        "M8O02",
  users:           "DxNOa",
  videoUrl:        "XrARi",
  videoFile:       "PP7rO",
  briefAttachment: "GmjrC",
  creatorName:     "9ZryL",
  creatorEmail:    "INZs6",
  submissionType:  "b82bF",
  status:          "4flIO",
  userValidation:  "QqS0I",
  platformName:    "5Quiw",
  platformUsername:"FmmVQ",
  submissionNotes: "UzR32",
  qaChecklist:     "qYYxu",
  duration:        "si3xT",
  resolution:      "1N0Zw",
  aspectRatio:     "8UXFt",
  fileSizeMb:      "BMnCc",
  format:          "opngB",
  fps:             "hXH3D",
  parentSubmission:   "9bJMy",
  parentSubmissionId: "4Nfb8",
  originalReviewId:   "N1Gzr",
  revisionNumber:     "jHVKv",
  isBulk:             "CIp0E",
  batchId:            "BqqJ6",
  reviews:            "kdfMm",
});

const reviewCreate = q.select({
  submissions:      "nB4G1",
  accounts:         "c6csA",
  briefs:           "3lQdp",
  projects:         "an3Rj",
  overallStatus:    "4ljXK",
  aiDecision:       "pxln3",
  aiMode:           "O8NvX",
  thresholdSource:  "CvnVd",
  overallRating:    "uRkEe",
  overallComment:   "Zqqx4",
  decisionReasoning:"yp7ca",
  recommendedAction:"j6SpS",
  transcript:       "5kQxm",
  adaptedScript:    "Z95A7",
  displayUrl:       "kIbht",
  thumbnail:        "4rkuC",
  offBrand:         "4KXgS",
  pstScore:   "wwk9X", pstStatus:  "MIomy", pstComment:  "Golmf", pstShot:  "bzZmF",
  hsScore:    "PPgD7", hsStatus:   "BCdmg", hsComment:   "FleWi", hsShot:   "tJHIq",
  vhScore:    "TuCZK", vhStatus:   "Q8htG", vhComment:   "H8mtq", vhShot:   "jku6W",
  ctaScore:   "58szQ", ctaStatus:  "O5wRt", ctaComment:  "MfmJY", ctaShot:  "t5EX4",
  ftScore:    "mCcVd", ftStatus:   "GNsfa", ftComment:   "wcLV7", ftShot:   "CKEBR",
  tlScore:    "CoAzZ", tlStatus:   "gJZmz", tlComment:   "S60Ob", tlShot:   "dPZEk",
  acScore:    "gQ2My", acStatus:   "O4iGG", acComment:   "ytuTT", acShot:   "Ltgaq",
  epScore:    "ZgN1w", epStatus:   "J6Hlm", epComment:   "dSTFY", epShot:   "q9hyL",
  bmScore:    "7fAI0", bmStatus:   "9kKJP", bmComment:   "JIpeg", bmShot:   "CCHAV",
  crStatus:   "cftY3", crDetails:  "UDj20", crShot:      "JMUZh",
  cmStatus:   "ZHNmv", cmDetails:  "1tXyK", cmShot:      "xgoo8",
  baStatus:   "36f1U", baDetails:  "H9Xkc", baShot:      "usb6i",
});

const reportCreate = q.select({
  threshold:      "E004U",
  score:          "iy2K3",
  thresholdValue: "Q5UCr",
  rating:         "uRkEe",
  severity:       "oO0ev",
  status:         "TxU8J",
  comment:        "3Pr6i",
  screenshotUrl:  "syqU5",
  keyMoment:      "BEfco",
  review:         "Iu9MX",
  submissions:    "nB4G1",
  accounts:       "c6csA",
  briefs:         "3lQdp",
  projects:       "an3Rj",
});

const notificationCreate = q.select({
  type:        "2xLr7",
  title:       "SATFD",
  message:     "tUnIi",
  isRead:      "AKYmp",
  accounts:    "esbPo",
  users:       "FR1cY",
  briefs:      "hY6Ve",
  projects:    "PWTz3",
  submissions: "8ajbS",
  reviews:     "5lyPE",
});

// ─── Option ids ────────────────────────────────────────────────
const OPT = {
  subTypeContentReview: "5ed52a56-f33e-475a-bc32-95b11756290f",
  subTypeRevision: "24ae35f5-8eef-4c6c-b6ac-947663b05c58",
  subTypeBrief: "0a16c65f-2230-4070-a530-0f6f6fa098bf",
  subTypeAnalyse: "93cc2c4e-01ea-40ee-9f0f-1c45206808c6",
  subTypeSwipe: "4d21296f-a7a6-4264-9298-21c7c4a7e6f2",
  userValidationProceed: "0fb06c28-5e30-4a38-9cf4-2e75490f7d1a",
  statusReviewed: "713723b2-f81f-46f9-ae7d-526e334706b3",
  revision: { 0: "4ff1da4b-6e26-48e5-93d0-fa7fc77526fc", 1: "d7f26c9f-b0b9-4d70-8331-c42c8fb452ef", 2: "07aa06a6-1434-460e-b8c8-d104e8d6d723", 3: "46857a9c-0d18-4947-9c54-95b48cbf7768", 4: "8c48fa4d-99aa-4382-84e9-afd572f61d57", 5: "ad223e90-9008-469a-a37d-b0fe160180e1", 6: "8f97b4db-5cb7-4a58-9994-8395bc32b54a", 7: "8a449fbc-9fb5-4b43-8bb6-0e7b2f0ae8ba", 8: "cca22ee1-7c85-43ab-ba4a-b6d71035c003", 9: "b9ce37f3-ebe2-4610-9bd0-f3893c0b2875", 10: "7624af34-e1ae-49ee-b289-d22da98122e2" },
  platform: {
    Upload: "c72e31e0-d976-478e-ac07-2eeca1f811b0",
    Instagram: "431bc4d5-34b7-4c5f-bcb0-21fb22f76198",
    TikTok: "5989f5cd-8d43-4cac-90c5-e08c592c99a7",
    YouTube: "041fcaf3-370c-44c2-b329-9a5aa33b46ed",
  },
  aiDecision: {
    APPROVED: "17004b4d-66c1-44fb-9a86-33a8a86110ee",
    FLAGGED: "c168c3d6-9b94-47b8-ac43-5fcc715e3d24",
    REJECTED: "e173acf9-d806-4ffa-a36c-154f07fe82f7",
    REVIEW: "269347ff-874c-4cb1-b3bd-a8450a6b5c32",
  },
  overallStatus: {
    APPROVED: "4cfaebf5-60cb-4eda-bdd4-fec0bd77c74c",
    FLAGGED: "34526a42-cd49-4094-9dee-bbe8b114e440",
    REJECTED: "75dd6d0f-e5a2-4ba8-941a-33e9e1f2ccc3",
    REVIEW: "dddaca4d-c893-4861-922f-687bc13b78db",
  },
  aiMode: {
    Autonomous: "243d3312-2ce6-4043-b07c-1bd4b9c4b56f",
    Hybrid: "9b7ec34f-7e9f-411e-bf8c-3b36334143b2",
    Manual: "ec386261-bf9b-4bef-b938-6d99327be4d3",
  },
  thresholdSource: { Account: "473a311b-6b5a-48ef-974e-92337b0b9173", Brief: "5d10b925-bdc0-41a8-98be-b12fa57ecf29" },
  notif: {
    received: "e2a3814d-eff1-433f-86f7-80970f20d15d",
    completed: "6179ae57-6d6f-45f5-8fad-ded42fee8d36",
    approved: "de8a97d2-3bcb-46c0-b1d8-02664d0928da",
    rejected: "e223f058-89dd-49a6-8424-e8d5423b0abb",
    flagged: "a1246fa4-011b-47c8-99c7-ade863da8cfb",
  },
  reportStatus: { PASS: "c2692420-bd22-458d-887f-b6e25531ff4e", FAIL: "b917f19e-db11-43e7-839c-49a4bdc26598", FLAGGED: "81091b5b-35d7-499b-8d47-1905236b6775" },
  reportSeverity: { INFO: "3dc78850-7f07-414f-adc1-e61fbf9ed7a4", WARNING: "bc29c288-5719-4ee5-b8b6-fd5fd9a3ac77", CRITICAL: "2f1d4555-e3f1-4d15-8460-31d11c82924e" },
};

// submissions.qa_checklist option ids by label. The account and brief
// columns carry their own ids, which are not valid on submissions.
const SUB_QA_IDS = {
  "Product visibility": "40946cb6-2638-4c13-9aa2-3f66d1ab8d15", "Product usage": "3f1ff82b-1fae-4ec8-b727-8ab4337d3d22",
  "Hook quality": "f8968115-bdab-4360-afe5-fc4d53b26df3", "Visual hook": "94e77b01-88ec-4f9f-b6fb-7ca5b5be7b13",
  "Audio clarity": "dcb604cb-132e-4928-bab7-1a5dbfd61258", "Audio delivery": "664e176a-ac4b-469a-b3fb-efa0abd5409c",
  "Pronunciation": "eac26e3c-8601-4c2a-a038-39b694084caf", "Music & sound balance": "314d167a-7456-425b-aa9e-0cab135f06be",
  "Follows the brief": "5e36d433-92b5-4ad7-9447-abcaa5401991", "Brand name mentioned": "a1d164a9-3972-45bb-a444-34bba3757621",
  "Lighting & camera": "8b51a26d-6b1c-4b37-8939-b7339eb7f595", "Setting & background": "fe7f6d81-eda9-4c23-8650-43c9351b7334",
  "Distracting elements": "641e6d1f-a3cd-451c-bbb8-c8e44c6aaf51", "Text legibility": "c7b897ff-b5f8-4d4f-aaa4-07849c4c0fa6",
  "Closed captions": "c1d3605d-e91c-4509-aad0-b337ff3ed898", "Safe zones": "5410f4ee-20f3-4356-8180-f73b1ae859df",
  "Scene pacing": "8c96bc97-ebde-44f3-b4ee-65640e6ba8f6", "Video length": "ea740500-ef29-4246-aa61-1e1264cce230",
  "Watchable on mute": "15dfd7e3-226d-4ac3-bd2e-4383857ee08c", "Creator visibility": "58615cda-8673-4d3d-a3ce-7ef871e81991",
  "Energy & authenticity": "8ab22af0-53f5-45a1-856e-1dcbbb048e19", "Wardrobe & appearance": "e9320bd8-73ac-4e89-95a6-70a87a40b3e0",
  "CTA present": "719b3047-73f8-4958-8080-05485b6859bd", "Brand alignment": "873be85d-9d67-4286-b7d7-49dc35c45baa",
  "Copyright check": "82baef6f-fd83-4eac-a159-1298fd71eb07", "Inspiration link match": "a135797b-d452-4f83-9b39-9a40481f1411",
};

// Per-column status option ids on reviews. A label missing from a
// column is written as the label itself (the columns allow new choices).
const STATUS_IDS = {
  pst: { PASS: "af8c3435-197f-49be-b54e-b74e167bf622", FAIL: "78650e4d-0603-4c49-af1a-699d080e34d0" },
  hs:  { PASS: "3f6d850b-103a-4659-a792-edbcecd2d282", FAIL: "f5b89379-77a7-490d-87b3-01fd1b5fbb38" },
  vh:  { PASS: "df620cda-696d-4f6a-be2e-dd5f9c69798d", FAIL: "b9298a48-418e-4e81-8284-a86b7484d0e5", FLAGGED: "c478aae9-8ffb-4431-892f-9a69e782ab93" },
  cta: { PASS: "df620cda-696d-4f6a-be2e-dd5f9c69798d", FAIL: "b9298a48-418e-4e81-8284-a86b7484d0e5" },
  ft:  { PASS: "f7a0b5f9-e6a4-45f7-b1c1-7f51d484915a", FAIL: "d91bf483-9674-4da7-9c85-6b46309a051f" },
  tl:  { PASS: "25306d8c-9cd7-4eff-96de-c34597e60e22", FAIL: "f8713bed-1302-4ee9-bdba-754f63d9d20e" },
  ac:  { PASS: "55e381c2-1289-4bca-9386-d49518f1d082", FAIL: "e821d3fd-19b5-48b9-90dc-15230103520d" },
  ep:  { PASS: "a05fedea-29ee-4c68-9865-1df3af7abb63", FAIL: "1e6a249e-e7b1-46bf-be6c-64b06485eb8f" },
  bm:  { PASS: "d99a59f6-76cc-46b2-963e-975f9cb4fe16", FAIL: "b61770f4-36f9-4db1-8d95-ddb6cce24ed0" },
  cr:  { PASS: "0035625f-c28b-41f2-bb1b-eba3afd5370a", FAIL: "d077c434-44e6-4ac1-a527-f1f69d8b67e6" },
  cm:  { PASS: "cd34f28d-6d67-4928-842f-3b89e5178187", FAIL: "496b41ef-a71f-479e-be75-7512d9191e61" },
  ba:  { PASS: "500f7b1c-3ab5-4980-85a1-f315afa35f8b", FAIL: "32992beb-86ef-4903-af2d-363046aa9bb5", ALIGNED: "b91c68cb-8420-47be-ae26-0b8f7e4a15fe", MISALIGNED: "bab6ec30-bf74-4429-9a48-062f7703f950", NEEDS_ADJUSTMENT: "b24f9862-9740-45ad-93f8-d32997561d70" },
};

// key_moment_timestamp on review_report is a SELECT whose options are
// second labels; the data layer wants option ids. Seconds without an
// option are left empty (the screenshot_url carries so_<n> anyway).
const KEY_MOMENT_IDS = {"0":"4981cd88-c4a1-42c7-a3b8-746a92e3e345","1":"82de4d8c-d992-48e8-969f-d966df56756a","2":"9ac8a835-bb8f-42d0-9389-ba67ca9befb3","3":"34fb58a0-6268-42a6-bbcb-51b6a7895607","4":"71cb3195-0f90-4284-934e-c557618c45ae","5":"3f8e8bd3-0b4c-4f5d-b305-e7ffc3ef0bc7","6":"d2b2d6ca-be3d-4af4-9c6e-2735dceaebd2","7":"4b67a1f5-deb3-47ed-8425-d32d9884ae0a","8":"9ba60323-fc19-4ee0-a23d-5cc2aae76344","9":"8628eccf-3bc4-483d-82a8-b89afdbb7de7","10":"0d60b4e1-e4e0-4f89-bf4d-501fa0956847","11":"48fbce09-ff20-4bfb-a2b8-92f04ea9a9d4","12":"efa57d4d-1a1e-4593-9b8c-721008317cc7","13":"56eafe0b-7497-4aad-aebc-d8b571bbc653","14":"1eda9aea-6a67-4d0e-97bf-52c24f0f5b69","15":"a03099b2-efa7-4f20-89c3-8c0f4faa1858","16":"3e27453e-3e14-463f-afe4-2f150c18fadb","17":"91c4f237-ac59-4714-9e40-18da0efbbbcd","18":"5d407291-45e0-433e-9b6a-4b574bb5b378","20":"acdaacde-a01f-40c2-8292-62de77c5e2b7","21":"6bd5a68f-a07a-441a-b6c3-4663d7e20a42","22":"a97d222c-a4a7-4e92-a8c4-675a4991df18","23":"d4560de5-61d5-4cca-9e16-385cb57cb63b","24":"7a04a1b1-9cc1-4775-bc45-ea302a3e9130","25":"9d63f1d8-44cd-4ed1-b649-fa58c8cc7410","26":"7b44dff6-4ea4-4e77-aee9-a10d78398e97","28":"c2bc6f34-d9da-4f3c-8065-d8d543d52eba","29":"da2aece4-aa06-4757-b4e2-36c301d6e2c2","30":"2130a146-0bab-41a5-a3e3-4158c3596c83","31":"560bd228-b87d-4973-a344-dbca4b6582fd","32":"672216cf-df45-4922-8271-4958bf9b12b6","33":"75bd8eb2-bbcc-4a02-b655-f91fc17f1f0e","34":"a8c71d05-15dd-4597-9893-910f6b791e82","35":"5c66e527-d187-4f4b-8a42-3b67822cb024","36":"7fad5f9f-7bba-4e09-98d3-49de455d163c","37":"1df1f818-606b-410a-8e73-9a6ac1311183","38":"0aae8f00-1eca-40fc-9a18-2c2778aab96f","40":"64318e46-feb9-495d-b0b3-10efc9c61f93","42":"643a6fb4-e857-4154-9164-9954a4f718e4","44":"ae5e5821-e71c-4129-901f-f491d991d0b1","45":"756f78ee-70ce-4e68-84a5-5faacb4b4498","50":"d2068a88-91cb-4fcd-af73-703f92f25e5a","51":"6fb88d8a-bea7-48b1-ad11-aa8d28b7088c","52":"a475e9c0-168b-461b-861a-995328ce7ce8","54":"71977fa7-63aa-45b6-aaa2-49bd4eb846ba","55":"33c244ec-72d3-43a6-a189-bc7350b04c06","56":"30974752-8792-4d40-8d39-5684d71fb21e","57":"b7d973b1-d671-4ce7-8541-adfed9bbe5df","58":"68902697-aa0d-4896-9333-f1a8433e239f","59":"975a8ed4-278e-428f-99f7-5a26c90e30ea","91":"6b2c2df3-a3a6-4fa1-985e-e40429e705f0","101":"d2ae9036-35f5-47de-a559-20d6e2567cc5","107":"55afc556-3df8-4102-ae31-5f198d92959c","109":"9b7df9b0-75f0-4855-b51c-3cd7fc5d6033","110":"85875ad6-a723-45b0-a7d5-853352942dac","112":"296ea1e5-a18f-40e4-8dc1-2e01034f8a80","114":"5d78176a-793e-4d17-a0e0-98529b9cd151","115":"ba7a9190-906a-4e50-8660-2965b0d5edf1","116":"d130e68e-345b-49e7-9427-e919942bf8a5","117":"dd6234bb-1be7-4c93-a881-c8143feffadd","119":"cbce2ba0-167a-4692-a57d-3e12aba51f23","120":"8df07ac9-3ae7-4644-9b30-ec68d7516ce9","123":"66754ac0-dd42-4d12-9f6d-e1d702b87b96","131":"21aa8520-b8e9-43cc-9be7-25e4b1a55baf","135":"65941da0-efd7-4b87-9c46-5dcd8eefb840","144":"c81baa95-9cc9-4a60-897c-f1449f005b21","157":"498d037c-d7b3-4ba3-a5b8-1072c8cc5337"};

// ─── Integration endpoints ─────────────────────────────────────
const SCRAPE_URL = "https://download-all-in-one-budget.p.rapidapi.com/v1/social/autolink";
const GEMINI_BASE = "https://generativelanguage.googleapis.com";
const GEMINI_MODEL = "gemini-3.6-flash";
const CLOUDINARY_CLOUD = "dspv9nm1n";
const CLOUDINARY_PRESET = "screen_shots";
const CLOUDINARY_FOLDER = "submissions";
const EMAIL_FROM = "Brieflee <support@brieflee.co>";
const APP_ORIGIN = "https://www.brieflee.co";
const DETAILS_PATH = "/submissions/details";
const LIVE_PATH = "/live/submissions";
// Largest video body the Softr proxy will carry to Gemini once base64 encoded.
const INLINE_MAX = 3 * 1024 * 1024;


// ─── The 26 Review Agents ──────────────────────────────────────
// key: reviews column prefix (null = review_report only)
// name: the exact threshold_name the prompt uses and Gemini echoes back
// pick: labels that switch the agent on from qa_checklist
// th: alias of the threshold field on brief/account ("" = none)
const AGENTS = [
  { key: "pst", name: "Product Screen Time", pick: ["Product visibility"], th: "thProductScreen", rule: "productVisibility" },
  { key: "hs",  name: "Hook Speed", pick: ["Hook quality"], th: "thHookSpeed", rule: "hookQuality" },
  { key: "vh",  name: "Visual Hook", pick: ["Visual hook"], th: "thVisualHook", rule: "visualHook" },
  { key: "cta", name: "CTA Placement", pick: ["CTA present"], th: "thCta", rule: "" },
  { key: "ft",  name: "Face Time (Creator Visibility)", pick: ["Creator visibility", "Creator visability"], th: "thFaceTime", rule: "" },
  { key: "tl",  name: "Text Legibility", pick: ["Text legibility", "Closed captions"], th: "thTextLegibility", rule: "" },
  { key: "ac",  name: "Audio Clarity", pick: ["Audio clarity"], th: "thAudioClarity", rule: "" },
  { key: "ep",  name: "Engagement Pacing (Scene Changes)", pick: ["Scene pacing"], th: "thPacing", rule: "" },
  { key: "bm",  name: "Brand Mentions", pick: ["Brand name mentioned"], th: "thBrandMentions", rule: "" },
  { key: "ba",  name: "Brand alignment", pick: ["Brand alignment"], th: "", rule: "brandAlignment" },
  { key: null,  name: "Follows the brief", pick: ["Follows the brief"], th: "", rule: "followsTheBrief" },
  { key: "cr",  name: "Copyright check", pick: ["Copyright check"], th: "", rule: "", always: true },
  { key: null,  name: "Closed captions", pick: ["Closed captions"], th: "thTextLegibility", rule: "" },
  { key: null,  name: "Audio delivery", pick: ["Audio delivery"], th: "", rule: "audioDelivery" },
  { key: null,  name: "Pronunciation", pick: ["Pronunciation"], th: "", rule: "" },
  { key: null,  name: "Music and sound balance", pick: ["Music & sound balance"], th: "", rule: "" },
  { key: null,  name: "Lighting camera", pick: ["Lighting & camera"], th: "", rule: "lightingCamera" },
  { key: null,  name: "Setting and background", pick: ["Setting & background"], th: "", rule: "settingBackground" },
  { key: null,  name: "Distracting elements", pick: ["Distracting elements"], th: "", rule: "distractingElements" },
  { key: null,  name: "Safe zones", pick: ["Safe zones"], th: "", rule: "" },
  { key: null,  name: "Watchable on mute", pick: ["Watchable on mute"], th: "", rule: "" },
  { key: null,  name: "Energy and authenticity", pick: ["Energy & authenticity"], th: "", rule: "energyAuthenticity" },
  { key: null,  name: "Wardrobe and appearance", pick: ["Wardrobe & appearance"], th: "", rule: "wardrobeAppearance" },
  { key: null,  name: "Product usage", pick: ["Product usage"], th: "", rule: "productUsage" },
  { key: null,  name: "Inspiration link match", pick: ["Inspiration link match"], th: "", rule: "inspirationLinkMatch" },
  { key: "cm",  name: "Content Moderation", pick: [], th: "", rule: "", always: true },
];

// Rules (verbatim from the n8n Code node).
const RULES = {
  productVisibility: "Product means the product in any form: packaging, removed from packaging, being applied, used, worn, consumed, demonstrated, visible results of use, close-ups, in hands, on body, in mouth, on a surface, or any scene with active interaction even if the product is not the dominant visual element.",
  hookQuality: "Rate how effectively the audio hook would stop someone scrolling. This refers to what the viewer hears: spoken words, opening sounds, or any audio that makes someone pay attention. Any hook type can score highly if it is compelling enough. A score between 80 and 100 means the audio immediately creates a reason to keep watching, opens a loop, sparks curiosity, or says something unexpected so the viewer would stop scrolling to hear what comes next. A score between 60 and 79 means the audio gets some attention but does not fully commit the viewer; the opening is decent but predictable or takes too long to land. A score below 60 means the audio is generic, boring, or slow to start, for example an unremarkable greeting with no follow-up hook and nothing that would make someone stop scrolling.",
  visualHook: "Rate how effectively the visual opening would stop someone scrolling. This refers to what the viewer sees: framing, movement, action, objects, or any visual surprise that grabs attention. Any visual approach can score highly if it is compelling enough. A score between 80 and 100 means the visuals are immediately eye-catching and something in the frame makes you stop and look, such as unexpected visuals, creative framing, strong movement, action, or something visually unusual. A score between 60 and 79 means there is some visual interest but nothing that demands attention, for example standard product demos, basic setups, or ordinary framing. A score below 60 means the opening uses a static talking head, a generic setup, or nothing visually interesting is happening in the first moments.",
  brandAlignment: "Rate whether the content matches the brand's visual identity, tone, and values as defined in the brand guidelines. A score between 80 and 100 means the content feels on-brand and the tone, colours, language, and overall vibe align with the brand guidelines provided. A score between 60 and 79 means the content is mostly on-brand but some elements feel off, such as tone in certain moments, colours or styling that do not quite match, or language that does not fully fit the brand voice. A score below 60 means the content feels off-brand and the tone, visuals, or messaging clash with the brand identity.",
  followsTheBrief: "Compare the video against every requirement listed in the brief, including talking points, product messaging, tone of voice, content structure, specific phrases, and any stated dos and don'ts, and treat each requirement as a checkpoint. A score between 80 and 100 means all key brief requirements are addressed, the main talking points are included, the tone matches, and the structure follows the direction in the brief. A score between 60 and 79 means most requirements are met but there are notable omissions, such as a missed talking point, tone that is slightly off, or a deviation from the requested structure. A score below 60 means multiple brief requirements are ignored or misunderstood so the content feels like the creator did not read or follow the brief carefully.",
  audioDelivery: "Rate how the creator delivers spoken content, focusing on performance and presentation rather than technical audio quality. A score between 80 and 100 means the delivery is confident and natural with good pacing and variation in tone, it does not sound scripted or robotic, and it is engaging to listen to. A score between 60 and 79 means the delivery is acceptable but flat, perhaps monotone, overly rehearsed, slightly rushed or hesitant, and lacking energy or a conversational feel. A score below 60 means the delivery is poor, with stumbling, awkward pauses, obvious script reading, whispering, or pacing that makes it hard to follow.",
  lightingCamera: "Rate the lighting and camera clarity. A score between 80 and 100 means the video is well lit with natural or intentional lighting, the face and product are clearly visible, the footage is stable, the framing is good, and the resolution is appropriate for the platform. A score between 60 and 79 means the lighting and camera work are adequate but have noticeable issues such as being slightly dark, minor shakiness, awkward framing, or mixed lighting temperatures. A score below 60 means the video is poorly lit with dark scenes or harsh shadows on the face or product, the footage is shaky or unstable, the subject is out of focus, or the framing cuts off key elements.",
  settingBackground: "Rate whether the environment supports the content and does not detract from the message. A score between 80 and 100 means the setting is clean and intentional, fits the content, and the background either adds helpful context or stays neutral without drawing attention, with no clutter or distracting elements. A score between 60 and 79 means the setting is acceptable but has minor issues, such as being slightly messy, not quite matching the product or brand vibe, or feeling like an unplanned or last-minute choice. A score below 60 means the setting is distracting or inappropriate, with visible mess, an unflattering environment, or a background that clashes with the product or undermines credibility.",
  distractingElements: "Flag anything that pulls viewer attention away from the creator, product, or message. A score between 80 and 100 means there are no meaningful distractions and viewer focus stays on the content throughout. A score between 60 and 79 means there are minor distractions such as some background movement, brief interruptions, notification sounds, slight wardrobe issues, or other people partially visible in ways that do not dominate the frame. A score below 60 means there are major distractions such as people walking through the frame, pets or children interrupting, loud background noise that competes with speech, visible competitor logos, or TVs and screens playing prominently in the background.",
  energyAuthenticity: "Rate whether the creator feels genuine and engaged, without judging them against a single personality type. Both high-energy and low-energy styles can score well if they feel authentic and appropriate for the content. A score between 80 and 100 means the creator feels natural and invested, their delivery matches the product and audience, and they come across as someone who actually uses or cares about what they are showing. A score between 60 and 79 means the performance feels slightly forced, flat, or performative, as if the creator is going through the motions rather than truly connecting with the content. A score below 60 means the creator appears clearly disengaged, reads a script with no conviction, or is so exaggerated that it feels fake, making it unlikely that a viewer would believe they use or like the product.",
  wardrobeAppearance: "Rate whether the creator's appearance is appropriate for the content and brand, focusing on intentionality rather than personal style preferences. A score between 80 and 100 means the creator looks put together and appropriate for the product and brand, their appearance does not distract from the message, and any look or vibe specified in the brief has been followed. A score between 60 and 79 means the appearance is acceptable but slightly off, for example not quite matching the brand tone, looking unconsidered, or showing minor grooming issues that catch the eye. A score below 60 means the appearance actively undermines the content, such as being visibly unkempt in a way that clashes with the brand, wearing competitor logos, or looking so mismatched with the product that it harms credibility.",
  productUsage: "Rate how the creator demonstrates or interacts with the product, focusing on usage quality rather than simple screen time. A score between 80 and 100 means the product is used naturally and correctly, demonstrated the way a real user would apply, wear, consume, or handle it in a believable context, and the usage matches any instructions given in the brief. A score between 60 and 79 means the product is shown being used but the interaction feels awkward, rushed, staged, or incomplete, the creator seems unfamiliar with it, or they skip key usage moments the viewer would expect to see. A score below 60 means the product is barely interacted with, used incorrectly, or handled in a way that makes it look bad so the creator treats it more like a prop than something they would actually use.",
  inspirationLinkMatch: "When an example or inspiration video has been provided with the brief, compare the submission against it for structural and stylistic alignment rather than exact replication. The creator should capture the spirit of the reference, not copy it frame for frame. A score between 80 and 100 means the submission clearly draws from the inspiration, with similar structure, pacing, energy, hook style, or creative approach, and it feels like the creator studied the reference and adapted it in their own way. A score between 60 and 79 means there are some similarities, but key elements that made the inspiration work are missing, such as different pacing, a weaker hook, or a failure to capture the tone or energy. A score below 60 means there is no visible connection to the inspiration video and it feels like the creator did not watch it or chose to ignore it. If no inspiration link was provided at all, set the score for this metric to 0 and do not provide a qualitative evaluation.",
};
const DO_NOT_CHECK = "DO NOT CHECK THIS";

// ─── Helpers ───────────────────────────────────────────────────
function unwrap(raw) {
  if (raw == null) return "";
  if (typeof raw === "string") return raw.trim();
  if (Array.isArray(raw)) { const f = raw[0]; if (typeof f === "string") return f.trim(); return String(f?.label ?? f?.name ?? "").trim(); }
  if (typeof raw === "object") return String(raw.label ?? raw.name ?? "").trim();
  return String(raw).trim();
}
function unwrapAll(raw) {
  if (raw == null) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map((x) => (typeof x === "string" ? x : String(x?.label ?? x?.name ?? ""))).map((s) => s.trim()).filter(Boolean);
}
function idsOf(raw) {
  if (raw == null) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map((x) => (typeof x === "string" ? x : x?.id || "")).filter(Boolean);
}
function num(raw) {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function cleanText(text) {
  if (!text) return "";
  return String(text)
    .replace(/<[^>]+>/g, " ")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}]/gu, "")
    .replace(/[\*\(\)\[\]\•]/g, "")
    .replace(/[^\x20-\x7E\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
function stripEmDash(text) { return String(text || "").replace(/—|–/g, ", ").replace(/ ,/g, ","); }
// A hosted video file (the Discover library hands these in) needs no scrape.
// It is never accepted as a pasted link: see linkOk in the form.
function isDirectVideoUrl(input) { return /^https?:\/\/\S+\.(mp4|mov|m4v|webm)(\?\S*)?$/i.test((input || "").trim()); }
// A pasted link has to be a video on one of the four platforms: a TikTok,
// an Instagram Reel, a Facebook Reel or a YouTube Short. Profiles, feeds
// and long-form YouTube links are turned away.
function detectPlatform(input) {
  const v = (input || "").toLowerCase();
  if (v.includes("tiktok.com")) return "TikTok";
  if (v.includes("instagram.com")) return "Instagram";
  if (v.includes("youtube.com") || v.includes("youtu.be")) return "YouTube";
  return "Upload";
}
function ytVideoId(u) { const m = String(u || "").match(/(?:shorts\/|watch\?v=|youtu\.be\/|embed\/)([\w-]{6,20})/); return m ? m[1] : ""; }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
async function blobToBase64(blob) {
  const buf = new Uint8Array(await blob.arrayBuffer());
  let bin = ""; const CH = 0x8000;
  for (let i = 0; i < buf.length; i += CH) bin += String.fromCharCode.apply(null, buf.subarray(i, i + CH));
  return btoa(bin);
}
function fmtDuration(seconds) {
  const s = Math.round(Number(seconds) || 0);
  if (!s) return "0s";
  const m = Math.floor(s / 60); const r = s % 60;
  return m === 0 ? `${r}s` : `${m}m ${r}s`;
}
function aspectRatio(w, h) {
  if (!w || !h) return "";
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}
function cldScreenshot(publicId, sec) {
  if (!publicId || sec === null || sec === undefined || sec === "") return "";
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/so_${Math.max(0, Math.round(Number(sec) || 0))}/c_fill,h_1920,w_1080/${publicId}.jpg`;
}
function cldThumb(publicId) {
  return publicId ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/so_1/c_fill,h_640,w_360/${publicId}.jpg` : "";
}
function parseGeminiJson(raw) {
  let text = raw;
  if (text && typeof text === "object") text = text?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("") || "";
  text = String(text || "").trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  const s = text.indexOf("{"); const e = text.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("The review came back in a shape we could not read.");
  return JSON.parse(text.slice(s, e + 1));
}
// Auto Download All In One adapter (from the checker).
function adaptScrape(json) {
  const d = json?.data || json || {};
  const medias = Array.isArray(d.medias) ? d.medias : [];
  const durRaw = Number(d.duration) || 0;
  const durSec = Math.round(durRaw > 600 ? durRaw / 1000 : durRaw);
  const sizeOf = (m) => {
    if (m.data_size) return Number(m.data_size) || 9e9;
    const clen = /[?&]clen=(\d+)/.exec(String(m.url || ""));
    if (clen) return Number(clen[1]);
    if (m.bitrate && durSec) return (Number(m.bitrate) / 8) * durSec;
    return 9e9;
  };
  const vids = medias.filter((m) => m?.type === "video" && m?.url);
  const withAudio = vids.filter((m) => m.audioQuality || m.is_audio);
  const audible = withAudio.length ? withAudio : vids;
  const direct = audible.filter((m) => !/api\.tiktokv\.com/i.test(m.url));
  const pool = direct.length ? direct : audible;
  pool.sort((a, b) => sizeOf(a) - sizeOf(b));
  const vid = pool[0] || medias.find((m) => m?.url) || {};
  const authorRaw = d.author;
  const handle = typeof authorRaw === "string" ? authorRaw : (authorRaw?.unique_id || authorRaw?.nickname || d.author_name || "");
  return {
    mp4: vid.url || d.hdplay || d.play || d.video_url || d.download_url || "",
    handle: handle ? (String(handle).startsWith("@") ? String(handle) : "@" + handle) : "",
    duration: durSec || Math.round(Number(vid.duration) || 0),
    cover: d.thumbnail || d.cover || d.origin_cover || "",
  };
}

// ─── Threshold and prompt builders (ported from n8n) ───────────
const isValidThreshold = (val) => {
  const s = unwrap(val).toLowerCase();
  return s !== "" && s !== "none" && s !== "0";
};

// Which agents run: the union of the brief's and the account's Review
// Agents. Thresholds come from the brief first, then the account.
function buildChecks(account, brief, extra) {
  const picked = new Set([...unwrapAll(account?.qaChecklist), ...unwrapAll(brief?.qaChecklist), ...(extra || [])].map((s) => s.toLowerCase()));
  const isChecked = (labels) => labels.some((l) => picked.has(l.toLowerCase()));
  let usedBrief = false;
  const checks = AGENTS.map((a) => {
    let th = "";
    if (a.th) {
      if (brief && isValidThreshold(brief[a.th])) { th = unwrap(brief[a.th]); usedBrief = true; }
      else if (account && isValidThreshold(account[a.th])) th = unwrap(account[a.th]);
    }
    const on = a.always || !!th || isChecked(a.pick);
    if (!on) return { ...a, value: DO_NOT_CHECK, on: false, threshold: "" };
    const rule = a.rule ? RULES[a.rule] : "";
    const value = (th ? th + ". " : "") + (rule || a.name);
    return { ...a, value: value.trim(), on: true, threshold: th };
  });
  return { checks, thresholdSource: usedBrief ? "Brief" : "Account" };
}

function buildPrompt({ account, brief, notes, checks, meta, screenshotBase, previous, kind }) {
  if (kind === "analyse" || kind === "remix") return buildSwipePrompt({ account, notes, checks, meta, screenshotBase, withScript: kind === "remix" });
  const briefLines = brief ? [
    brief.description ? `Brief: ${cleanText(brief.description)}` : "",
    brief.productFeature ? `Product or feature: ${cleanText(brief.productFeature)}` : "",
    brief.talkingPoints ? `Talking points: ${cleanText(brief.talkingPoints)}` : "",
    brief.script ? `Script or structure: ${cleanText(brief.script)}` : "",
    brief.captionHooks ? `Caption hooks: ${cleanText(brief.captionHooks)}` : "",
    brief.visualHooks ? `Visual action hooks: ${cleanText(brief.visualHooks)}` : "",
    brief.voiceoverHooks ? `Voiceover hooks: ${cleanText(brief.voiceoverHooks)}` : "",
    brief.dos ? `Do: ${cleanText(brief.dos)}` : "",
    brief.donts ? `Do not: ${cleanText(brief.donts)}` : "",
    brief.makeSure ? `Make sure: ${cleanText(brief.makeSure)}` : "",
  ].filter(Boolean).join("\n") : "No brief was attached. Judge brief compliance against the brand context only.";
  const brandLines = [
    account?.brandBio ? `Brand: ${cleanText(account.brandBio)}` : "",
    account?.brandVoice ? `Voice: ${cleanText(account.brandVoice)}` : "",
    account?.brandCta ? `CTA: ${cleanText(account.brandCta)}` : "",
    account?.targetAudience ? `Audience: ${cleanText(account.targetAudience)}` : "",
    account?.painPoints ? `Audience pain points: ${cleanText(account.painPoints)}` : "",
    account?.objectives ? `Audience objectives: ${cleanText(account.objectives)}` : "",
    account?.niche ? `Niche: ${cleanText(account.niche)}` : "",
  ].filter(Boolean).join("\n");
  const example = brief?.exampleAnalysis ? cleanText(typeof brief.exampleAnalysis === "string" ? brief.exampleAnalysis : JSON.stringify(brief.exampleAnalysis)).slice(0, 4000) : "";
  const checkLines = checks.map((c) => `- ${c.name}: ${c.value}`).join("\n");

  return `You are a professional content reviewer. Your role is to evaluate UGC and influencer videos against a specific creative brief and quality thresholds.

TWO-PASS ANALYSIS:
Pass 1 - Visual: Watch the entire video. Identify all scenes, objects, actions, text overlays, and visual transitions.
Pass 2 - Audio: Listen to the entire audio track. Cross-reference with visual observations. When visual and audio conflict, trust the audio for intent and the visual for presence.

BRAND CONTEXT:
${brandLines || "None provided."}

BRIEF REQUIREMENTS:
${briefLines}

SUBMISSION NOTES:
${cleanText(notes) || "None."}
${previous ? `
THIS IS A REVISION. THE EARLIER CUT WAS REVIEWED AS FOLLOWS:
Decision: ${previous.decision || "not recorded"}
Reasoning: ${cleanText(previous.reasoning) || "not recorded"}
Changes requested: ${cleanText(previous.request) || "not recorded"}
Recommended action: ${cleanText(previous.action) || "not recorded"}
Checks that failed last time: ${cleanText(previous.failed) || "not recorded"}
Check specifically whether each requested change was made in this cut, and name the earlier issue in your comment when you judge it.
` : ""}${example ? `
EXAMPLE VIDEO ANALYSIS:
The brief links an example video. Use this analysis to benchmark the submission. Where the submission matches the example's strengths, note it. Where it falls short, flag it.
${example}
` : ""}
QUALITY ASSURANCE CHECKS:
${checkLines}

SCORING TYPES (reference only for formatting):

Percentage (score = number only, value = number + %):
Product Screen Time, Product usage, Visual Hook, Audio Clarity, Audio delivery, Music and sound balance, Lighting camera, Setting and background, Text Legibility, Watchable on mute, Face Time (Creator Visibility), Energy and authenticity, Brand alignment, Follows the brief, Inspiration link match

Count (score = number, value = number + unit):
Brand Mentions (times), Distracting elements (elements)

Seconds (score = number, value = number + seconds):
Hook Speed, CTA Placement, Engagement Pacing (Scene Changes)

Status (score = PASS or FAIL or REVIEW, value = short description):
Pronunciation, Closed captions, Safe zones, Wardrobe and appearance, Copyright check, Content Moderation

SCORING RULES:
- If the QA check value contains a number or threshold: score against it. PASS if meets/exceeds. FAIL if below. Severity = CRITICAL for FAIL, WARNING for borderline.
- If the QA check value is descriptive text only (no threshold number): evaluate against the brief requirements. PASS for acceptable, FLAGGED for issues worth noting.
- Follows the brief: always evaluate against every stated brief requirement. Score as percentage of requirements met.
- Copyright check and Content Moderation: always PASS/REVIEW/FAIL with severity INFO/WARNING/CRITICAL.

DECISION HIERARCHY:
- APPROVED: All threshold items PASS. Brief requirements substantially met. No critical moderation issues.
- FLAGGED: One or more items score below threshold OR notable brief compliance issues.
- REJECTED: Critical content moderation failure OR multiple threshold failures OR fundamental brief non-compliance.

VIDEO METADATA:
Format: ${meta.format}
Size: ${meta.sizeMb}MB
Resolution: ${meta.resolution}
Aspect Ratio: ${meta.aspect}
Frame Rate: ${meta.fps}fps
Duration: ${meta.duration}

TIMESTAMP RULES:
- Plain integer seconds only. 3 seconds = 3. 1 minute 7 seconds = 67.
- Never zero-pad: not 0003, not 00:03
- screenshot_url uses so_{integer} format

Your Task: Watch this video and provide a comprehensive review against the brief. Return your response in JSON format with no additional commentary before or after.

The JSON structure must be EXACTLY as follows:

{
  "overall_review": {
    "video_title": "[3-6 words naming what is DISTINCTIVE about this particular video, taken from how it opens: the specific action, line, setting or visual in the first few seconds. Never restate the brief, the product name or the category. Never a generic label such as 'Product Review' or 'Daily Set Review', because fifty creators shooting one brief must not all land on the same title. Examples: 'Rain-soaked morning routine', 'Dropped the bottle twice', 'Deadpan piece to camera'.]",
    "overall_rating": [1-5],
    "overall_comment": "[Two short paragraphs, 120 words at most in total: (1) How well the video fulfils the brief and its production quality, (2) What needs to change if not approved]",
    "ai_decision": "APPROVED or FLAGGED or REJECTED",
    "decision_reasoning": "[Explain the decision. List any failing items or brief requirements not met. Be specific about what needs to change.]",
    "recommended_action": "[Specific next step for the creator or brand manager]"
  },
  "analysis": [
    {
      "threshold_name": "[exact name from QA checks list]",
      "score": "[see scoring type]",
      "value": "[score with unit]",
      "status": "PASS or FAIL or FLAGGED",
      "rating": [1-5],
      "severity": "INFO or WARNING or CRITICAL",
      "comment": "[One or two sentences, 40 words at most, on what you observed for this metric, with the timestamp. If the brief specifies requirements for this metric, reference them.]",
      "key_moment_timestamp": [seconds - the most relevant moment for this metric],
      "screenshot_url": "${screenshotBase}"
    }
  ],
  "transcript": "[Scene-by-scene breakdown, one line per scene change and never more than 25 lines. Format: [Xs] Visual: [action] | Dialogue: [words or None] | Text: [overlays or None]]"
}

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON with no text before or after
- Keep every comment short: the whole response must stay compact
- Only include analysis items where the QUALITY ASSURANCE CHECKS value is NOT "DO NOT CHECK THIS"
- Do not include any metric marked as "DO NOT CHECK THIS" in the analysis array
- Copyright check and Content Moderation are always included
- Use exact field names: threshold_name, score, value, status, rating, severity, comment, key_moment_timestamp, screenshot_url
- threshold_name must be copied EXACTLY from the QUALITY ASSURANCE CHECKS list
- Score must always be a string (even if it's a number)
- All analysis items must have ALL fields present
- Do not add any additional fields or sections`;
}

// Normalise Gemini's analysis array into a map keyed by agent name.
// Analyse and Remix: the swipe-file prompt from the New Video workflow.
// Analyse is the breakdown alone; Remix adds the adapted script.
function buildSwipePrompt({ account, notes, checks, meta, screenshotBase, withScript }) {
  const brandLines = [
    account?.brandBio ? `Brand: ${cleanText(account.brandBio)}` : "",
    account?.brandVoice ? `Voice: ${cleanText(account.brandVoice)}` : "",
    account?.brandCta ? `CTA: ${cleanText(account.brandCta)}` : "",
    account?.targetAudience ? `Audience: ${cleanText(account.targetAudience)}` : "",
    account?.painPoints ? `Audience pain points: ${cleanText(account.painPoints)}` : "",
    account?.objectives ? `Audience objectives: ${cleanText(account.objectives)}` : "",
    account?.niche ? `Niche: ${cleanText(account.niche)}` : "",
  ].filter(Boolean).join("\n");
  const checkLines = checks.map((c) => `- ${c.name}: ${c.value}`).join("\n");
  return `You are a professional content strategist working for the brand below. Your role is to analyze video examples (swipe files) the brand wants to learn from${withScript ? " or adapt for their own content" : ""}.

CONTEXT: The brand has shared this video because they see potential in its creative approach, storytelling, or production style. Your job is to:
1. Analyze why this video works
2. Evaluate it against the brand's quality standards${withScript ? `
3. Create an adapted script that translates the video's effective elements into content that aligns with the brand's voice, audience, and objectives` : ""}

The video may be from a completely different industry or brand. Focus on the underlying creative strategy${withScript ? " that could be adapted" : ""}.

BRAND CONTEXT:
${brandLines || "None provided."}

NOTES FROM THE BRAND:
${cleanText(notes) || "None."}

TWO-PASS ANALYSIS:
Pass 1 - Visual: Watch the entire video. Identify all scenes, objects, actions, text overlays, and visual transitions.
Pass 2 - Audio: Listen to the entire audio track. Cross-reference with visual observations. When visual and audio conflict, trust the audio for intent and the visual for presence.

SWIPE FILE SCORING RULES:
- Every item status = PASS (swipe files are informational, never FAIL)
- Every item severity = INFO
- Ratings (1-5) measure how effective the element is, not quality. 5 = exceptionally effective, 1 = not effective. If a metric's score is 0 (the element does not appear or is not applicable) set the rating to 0.
- ai_decision is always APPROVED

QUALITY ASSURANCE CHECKS:
${checkLines}

SCORING TYPES (reference only for formatting):

Percentage (score = number only, value = number + %):
Product Screen Time, Product usage, Visual Hook, Audio Clarity, Audio delivery, Music and sound balance, Lighting camera, Setting and background, Text Legibility, Watchable on mute, Face Time (Creator Visibility), Energy and authenticity, Brand alignment, Follows the brief, Inspiration link match

Count (score = number, value = number + unit):
Brand Mentions (times), Distracting elements (elements)

Seconds (score = number, value = number + seconds):
Hook Speed, CTA Placement, Engagement Pacing (Scene Changes)

Status (score = PASS or FAIL or REVIEW, value = short description):
Pronunciation, Closed captions, Safe zones, Wardrobe and appearance, Copyright check, Content Moderation
${withScript ? `
SCRIPT ADAPTATION GUIDELINES:
- Same creator, different product: keep the creator's voice and personality, only swap the product layer
- Preserve the format: an unboxing stays an unboxing, conversational stays conversational
- No polishing: if the original sounds like natural speech, the remix should too, no marketing-speak
- Genuine moments: if the original has a real reaction or discovery, create an equivalent one, never a sales pitch
- Stay within 15% of the original word count, no extra scenes or talking points
- Text overlays: only where the original has them, rewritten for the brand. If none exist, suggest one for the hook and one for the CTA
- Visual-only videos: instead of a script, provide a scene-by-scene recreation guide for the brand's product, with setup, framing, transitions and timing
- Replace product references, pain points and CTA with the brand's context
- End with the brand's CTA
` : ""}
VIDEO METADATA:
Format: ${meta.format}
Size: ${meta.sizeMb}MB
Resolution: ${meta.resolution}
Aspect Ratio: ${meta.aspect}
Frame Rate: ${meta.fps}fps
Duration: ${meta.duration}

TIMESTAMP RULES:
- Plain integer seconds only. 3 seconds = 3. 1 minute 7 seconds = 67.
- Never zero-pad: not 0003, not 00:03
- screenshot_url uses so_{integer} format

Your Task: Watch this video and provide a comprehensive analysis. Return your response in JSON format with no additional commentary before or after.

The JSON structure must be EXACTLY as follows:

{
  "overall_review": {
    "video_title": "[3-6 words naming what is DISTINCTIVE about this particular video, taken from how it opens: the specific action, line, setting or visual in the first few seconds. Never restate the brief, the product name or the category. Never a generic label such as 'Product Review' or 'Daily Set Review', because fifty creators shooting one brief must not all land on the same title. Examples: 'Rain-soaked morning routine', 'Dropped the bottle twice', 'Deadpan piece to camera'.]",
    "overall_rating": [1-5],
    "overall_comment": "[2-3 paragraph analysis covering: (1) What makes this video effective or ineffective, (2) Which creative elements could work for this brand, (3) How this approach could be reimagined for this brand]",
    "ai_decision": "APPROVED",
    "decision_reasoning": "[Explain whether this is a good reference video for the brand and why]",
    "recommended_action": "[What the brand should do with this video: adapt the hook structure, use similar pacing, recreate with brand messaging, and so on]"
  },
  "analysis": [
    {
      "threshold_name": "[exact name from QA checks list]",
      "score": "[see scoring type]",
      "value": "[score with unit]",
      "status": "PASS",
      "rating": [0-5],
      "severity": "INFO",
      "comment": "[2-3 sentences on what you observed for this metric. Be specific with timestamps. Do not pad with generic praise.]",
      "key_moment_timestamp": [seconds - the most relevant moment for this metric],
      "screenshot_url": "${screenshotBase}"
    }
  ],
  "transcript": "[Scene-by-scene breakdown. Format: [Xs] Visual: [action] | Dialogue: [words or None] | Text: [overlays or None]]"${withScript ? `,
  "adapted_script": "[If the video has spoken audio: rewrite the transcript as if the same creator made this video about the brand's product instead. Keep their tone, personality, natural speech patterns and narrative flow, only swap the product, claims and CTA. Stay within 15% of the original word count. Format as scene-by-scene with timestamps, spoken dialogue and visual directions. If the video has no spoken audio: provide a scene-by-scene visual recreation guide for the brand, with each scene's setup, framing, movement, transitions and timing, and suggest where to add voiceover or text overlays.]"` : ""}
}

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON with no text before or after
- Only include analysis items where the QUALITY ASSURANCE CHECKS value is NOT "DO NOT CHECK THIS"
- Do not include any metric marked as "DO NOT CHECK THIS" in the analysis array
- Copyright check and Content Moderation are always included
- Use exact field names: threshold_name, score, value, status, rating, severity, comment, key_moment_timestamp, screenshot_url
- threshold_name must be copied EXACTLY from the QUALITY ASSURANCE CHECKS list${withScript ? `
- The adapted_script field must be included and contain a complete adapted script` : ""}`;
}

function normaliseAnalysis(parsed, checks, publicId) {
  const byName = new Map();
  const wanted = checks.filter((c) => c.on);
  const lower = new Map(wanted.map((c) => [c.name.toLowerCase(), c]));
  for (const a of Array.isArray(parsed.analysis) ? parsed.analysis : []) {
    const nm = String(a?.threshold_name || "").trim();
    if (!nm) continue;
    const agent = lower.get(nm.toLowerCase()) || wanted.find((c) => c.pick.some((p) => p.toLowerCase() === nm.toLowerCase()));
    if (!agent) continue;
    const ts = a.key_moment_timestamp === null || a.key_moment_timestamp === undefined || a.key_moment_timestamp === "" ? null : Math.max(0, Math.round(Number(a.key_moment_timestamp) || 0));
    const statusRaw = String(a.status || "").toUpperCase();
    const status = statusRaw === "PASS" ? "PASS" : statusRaw === "FLAGGED" || statusRaw === "REVIEW" ? "FLAGGED" : "FAIL";
    const sevRaw = String(a.severity || "").toUpperCase();
    byName.set(agent.name, {
      agent,
      score: stripEmDash(String(a.score ?? "")),
      value: stripEmDash(String(a.value ?? "")),
      status,
      rating: Math.min(5, Math.max(1, Math.round(Number(a.rating) || 3))),
      severity: sevRaw === "CRITICAL" ? "CRITICAL" : sevRaw === "WARNING" ? "WARNING" : "INFO",
      comment: stripEmDash(a.comment || ""),
      timestamp: ts,
      screenshot: ts === null ? "" : cldScreenshot(publicId, ts),
    });
  }
  return byName;
}

// ─── Keyed loaders ─────────────────────────────────────────────
// Each mounts only with a real record id, so useRecord never runs
// with an empty id (that queries, fails and retries on a timer,
// toasting each round). Every loader reports { status, f } upward,
// and a loader that errors is unmounted by its parent so it never
// retries against a table the visitor cannot read.
function AccountLoader({ recordId, onState }) {
  const { data, status } = useRecord({ recordId, select: accountSelect, from: ds.accounts });
  useEffect(() => { onState({ status, f: status === "success" ? (data?.fields || null) : null }); }, [data, status, onState]);
  return null;
}
function UserLoader({ recordId, onState }) {
  const { data, status } = useRecord({ recordId, select: userSelect, from: ds.users });
  useEffect(() => { onState({ status, f: status === "success" ? (data?.fields || null) : null }); }, [data, status, onState]);
  return null;
}
// Briefs in the workspace for the picker. Mounted only in the
// workspace context, so the public creator routes never list briefs.
function BriefList({ workspaceId, onList }) {
  const briefsQ = useRecords({ select: briefSelect, from: ds.briefs, count: 100 });
  useEffect(() => {
    const all = (briefsQ?.data?.pages?.flatMap((p) => p?.items ?? []) ?? []).map((b) => ({ id: b.id, f: b.fields || {} }));
    onList(all.filter((b) => idsOf(b.f.accounts).includes(workspaceId)));
  }, [briefsQ?.data, workspaceId, onList]);
  return null;
}

// Reviews status columns take option ids only. Columns without a FLAGGED
// choice record it as needs adjustment or as a fail, never as loose text.
function statusValue(prefix, status) {
  const ids = STATUS_IDS[prefix] || {};
  if (ids[status]) return ids[status];
  if (status === "FLAGGED") return ids.NEEDS_ADJUSTMENT || ids.FAIL || null;
  return null;
}
function numericScore(s) {
  const n = parseFloat(String(s).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : null;
}
// A page opened as a side panel keeps its own query inside the host page's
// `modal` param (/videos?modal=%2Freview%3Furl%3D...), so look there too.
// The workspace the switcher last chose (it writes this key), so a panel
// opened without ?workspace= still follows the page's workspace.
function cleanName(s) { return String(s || "").replace(/<[^>]*>/g, " ").replace(/https?:\/\/\S+/gi, " ").replace(/[^\p{L}\p{N} .,'&-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 60); }
// The Review Agents step: every kind (Review, Analyse, Remix) shows it, pre-ticked
// with the workspace's saved agents, and the AI needs at least three to check.


// The credit ring and the Upgrade card, the same pieces as the New video form.
const UPGRADE_IMG = "https://assets.softr-files.com/applications/5c5521fd-af6f-4488-9edf-1add48539912/assets/ca989ee6-933c-4385-b957-6a9a6b2ca053.png";
const CREDIT_CSS = `
.bu-ringwrap{position:relative;display:inline-flex;align-items:center;flex:none}
.bu-ring{display:inline-grid;place-items:center;width:34px;height:34px;background:transparent;border:0;padding:0;cursor:pointer;border-radius:8px}
.bu-ring:hover{background:rgba(0,19,100,.05)}
.bu-ring svg{transform:rotate(-90deg);display:block}
.bu-ring-track{fill:none;stroke:rgba(0,19,100,.1);stroke-width:3.5}
.bu-ring-bar{fill:none;stroke:#879CF7;stroke-width:3.5;stroke-linecap:round;transition:stroke-dasharray .3s ease}
.bu-pop{position:absolute;right:0;top:calc(100% + 8px);width:250px;background:#fff;border:1px solid rgba(0,0,0,.08);border-radius:10px;box-shadow:0 10px 30px -18px rgba(0,19,100,.35);padding:12px;display:flex;flex-direction:column;gap:8px;z-index:20;text-align:left}
.bu-pop-row{display:flex;justify-content:space-between;gap:10px;font-size:12px;color:#64708C}
.bu-pop-row b{color:#001364;font-weight:600;white-space:nowrap}
.bu-pop-bar{height:5px;border-radius:99px;background:rgba(0,19,100,.05);overflow:hidden}
.bu-pop-bar i{display:block;height:100%;background:#879CF7;border-radius:99px}
.bu-pop-link{font-size:12px;font-weight:600;color:#334283;text-decoration:none;margin-top:2px}
.bu-pop-link:hover{color:#001364}
.bu-upgrade{display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;padding:40px 12px 24px;max-width:520px;margin:0 auto}
.bu-upgrade img{width:64px;height:64px;border-radius:14px;object-fit:cover}
.bu-upgrade h2{font-size:22px;font-weight:600;letter-spacing:-.01em;color:#001364;margin:0}
.bu-upgrade p{font-size:13.5px;color:#64708C;max-width:420px;line-height:1.5;margin:0}
.bu-upgrade a{display:inline-flex;align-items:center;height:32px;padding:6px 12px;border-radius:8px;background:#879CF7;color:#fff;font-size:13px;font-weight:600;text-decoration:none;margin-top:6px}
.bu-upgrade a:hover{background:#6C7CC5}
`;

export default function Block() {
  const [step, setStep] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [batchQaChecklist, setBatchQaChecklist] = useState([]);
  const [batchBrief, setBatchBrief] = useState(null);
  const [briefMode, setBriefMode] = useState(null);
  const [batchNotes, setBatchNotes] = useState("");
  const [batchPdf, setBatchPdf] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useCurrentUser({
    properties: {
      accounts: "Nz6VX",
    },
  });
  const uploadSeq = useRef(0);
  const { uploadAsync, isUploading } = useUpload();
  // The engine's writes and services (see the engine section above).
  const createSubmission = useRecordCreate({ fields: submissionCreate, from: ds.submissions });
  const createReview = useRecordCreate({ fields: reviewCreate, from: ds.reviews });
  const createReport = useRecordCreate({ fields: reportCreate, from: ds.report });
  const createNotification = useRecordCreate({ fields: notificationCreate, from: ds.notifications });
  const proxyGoogle = useProxyFetch(ds.google);
  const proxyEmailit = useProxyFetch(ds.emailit);
  // Bulk takes uploaded files only, so the link scraper is never reached.
  const proxyRapid = async () => { throw new Error("Bulk upload takes video files, not links."); };
  const [afState, setAfState] = useState({ status: "none", f: null });
  const af = afState.f;
  const [meState, setMeState] = useState({ status: "none", f: null });
  const mf = meState.f || {};
  const [briefsFull, setBriefsFull] = useState([]);
  const [showCredits, setShowCredits] = useState(false);
  const runRef = useRef(0);

  // Read workspaces straight from the accounts table, which is already scoped to the logged-in user on the Source tab
  const { data: accountsData, status: accountsStatus } = useRecords({ from: ds.accounts, select: accountsSelect, count: 100 });
  const { data: briefsData, status: briefsStatus } = useRecords({ from: ds.briefs, select: briefsSelect, count: 100 });

  const allAccounts = useMemo(
    () => (accountsData?.pages.flatMap((p) => p.items) ?? []).map((a: any) => ({ id: a.id, title: readText(a.fields.name) })),
    [accountsData]
  );
  const allBriefs = useMemo(
    () => (briefsData?.pages.flatMap((p) => p.items) ?? []).map((b: any) => ({
      id: b.id,
      title: readText(b.fields.name) || "Untitled brief",
      account: readText(b.fields.accounts),
      status: readText(b.fields.status),
      contentType: readText(b.fields.contentType),
    })),
    [briefsData]
  );

  // The user's own accounts, held as ids or as names depending on how the linked field comes back
  const userAccountKeys = useMemo(() => {
    const raw: any = user?.properties.accounts;
    const list: any[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return list.map((r: any) => (r && typeof r === "object" ? r.id ?? r.label ?? r.title ?? r.name ?? "" : String(r))).filter(Boolean);
  }, [user?.properties.accounts]);

  // Narrow to the user's own workspaces, keeping the source-filtered list when the keys match nothing
  const filteredAccounts = useMemo(() => {
    if (userAccountKeys.length === 0) return allAccounts;
    const matched = allAccounts.filter((acc) => userAccountKeys.includes(acc.id) || userAccountKeys.includes(acc.title));
    return matched.length > 0 ? matched : allAccounts;
  }, [allAccounts, userAccountKeys]);

  const accountsLoading = accountsStatus === "pending";
  const briefsLoading = briefsStatus === "pending";

  const selectedAccountTitle = useMemo(
    () => filteredAccounts.find((a) => a.id === selectedAccount)?.title || "",
    [filteredAccounts, selectedAccount]
  );

  // Narrow to the chosen workspace where a brief carries one, keeping the user-scoped list when nothing matches
  const briefs = useMemo(() => {
    if (!selectedAccountTitle) return allBriefs;
    const matched = allBriefs.filter((b) => b.account && b.account === selectedAccountTitle);
    return matched.length > 0 ? matched : allBriefs;
  }, [allBriefs, selectedAccountTitle]);

  // A single workspace is pre-picked, so the user only confirms it
  useEffect(() => {
    if (filteredAccounts.length === 1 && !selectedAccount) {
      setSelectedAccount(filteredAccounts[0].id);
    }
  }, [filteredAccounts, selectedAccount]);

  const handleFilesDrop = async (files) => {
    if (!files || files.length === 0) return;
    const picked = Array.from(files);
    const videoFiles = picked.filter((f) => f.type.startsWith("video/"));
    if (videoFiles.length === 0) { toast.error("Please upload video files only."); return; }

    const oversized = videoFiles.filter((f) => f.size > MAX_UPLOAD_BYTES);
    const accepted = videoFiles.filter((f) => f.size <= MAX_UPLOAD_BYTES);
    if (oversized.length > 0) {
      toast.error(`${oversized.length} file${oversized.length !== 1 ? "s are" : " is"} over ${MAX_UPLOAD_MB} MB and cannot be uploaded.`);
    }
    if (accepted.length === 0) return;

    // Rows appear straight away, then each one reports its own progress
    const queued = accepted.map((file) => ({
      id: `v${(uploadSeq.current += 1)}`, file, uploadedUrl: null, status: "uploading", pct: 0, error: null,
      creatorName: user?.fullName || "", creatorEmail: "", qaChecklist: [], brief: null, notes: "", pdf: null,
    }));
    setVideos((prev) => [...prev, ...queued]);

    const patch = (id, updates) => setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));

    // Softr's upload reports no bytes, so each row's bar is paced
    // rather than measured: it eases toward a ceiling it never
    // reaches on its own, at a rate read off that file's size, and
    // only lands on 100% when the upload really finishes. It always
    // moves, and it never says done before it is.
    const pace = (row) => {
      const half = Math.min(20000, 1100 + Math.max(0.5, row.file.size / (1024 * 1024)) * 400);
      const t0 = Date.now();
      return setInterval(() => {
        patch(row.id, { pct: 92 * (1 - Math.pow(2, -(Date.now() - t0) / half)) });
      }, 100);
    };

    await Promise.all(queued.map(async (row) => {
      const tick = pace(row);
      try {
        const [result] = await uploadAsync(row.file);
        clearInterval(tick);
        if (result?.status === "completed" && result.url) {
          patch(row.id, { status: "completed", pct: 100, uploadedUrl: result.url });
        } else {
          patch(row.id, { status: "error", pct: 0, error: result?.error?.message || "Upload failed" });
        }
      } catch (err: any) {
        clearInterval(tick);
        patch(row.id, { status: "error", pct: 0, error: err?.message || "Upload failed" });
      }
    }));
  };

  // Failed rows are cleared on the way out of the upload step, never carried forward silently
  const leaveUploadStep = () => {
    const failed = videos.filter((v) => v.status === "error");
    if (failed.length > 0) {
      setVideos((prev) => prev.filter((v) => v.status !== "error"));
      toast.error(`${failed.length} file${failed.length !== 1 ? "s" : ""} failed to upload and ${failed.length !== 1 ? "were" : "was"} removed.`);
    }
    setStep(2);
  };

  const handlePdfUpload = async (file) => {
    if (!file) return;
    const [result] = await uploadAsync(file);
    if (result.status === "completed" && result.url) { setBatchPdf({ filename: result.file.name, url: result.url }); }
    else { toast.error("PDF upload failed."); }
  };

  const updateVideo = (id, updates) => { setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v))); };
  const removeVideo = (id) => { setVideos((prev) => prev.filter((v) => v.id !== id)); };
  const toggleQaBatch = (optionId) => { setBatchQaChecklist((prev) => prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]); };
  const goToReview = () => {
    const brief = briefMode === "existing" ? batchBrief : null;
    const notes = briefMode === "paste" ? batchNotes : "";
    const pdf = briefMode === "pdf" ? batchPdf : null;
    setVideos((prev) => prev.map((v) => ({ ...v, qaChecklist: batchQaChecklist, brief, notes, pdf })));
    setStep(5);
  };

  // One id per run of Submit All, written on every submission it makes,
  // so the summary email can link to exactly these videos and the queue
  // can filter to them. A second batch an hour later is a different id.
  const newBatchId = () =>
    "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  // Everything the run has to say, said once. Counts are composed here as
  // finished sentences, so the templates need no conditionals and nothing
  // can render as an empty line.
  const handleBatchDone = async (results, batchId) => {
    const rows = (results || []).filter(Boolean);
    if (rows.length === 0) return;
    const count = (d) => rows.filter((x) => String(x.decision || "").toUpperCase() === d).length;
    const approved = count("APPROVED"); const rejected = count("REJECTED");
    const flagged = rows.length - approved - rejected;
    const phrase = (n, w) => n + " " + w;
    const countsLine = [phrase(approved, "passed"), phrase(flagged, "flagged"), phrase(rejected, "rejected")].join(", ");
    const needing = rows.filter((x) => String(x.decision || "").toUpperCase() !== "APPROVED");
    const namesOf = (list) => list.slice(0, 12).map((x) => x.title).filter(Boolean).join(", ")
      + (list.length > 12 ? ", and " + (list.length - 12) + " more" : "");
    const batchUrl = `${APP_ORIGIN}/videos?batch=${encodeURIComponent(batchId)}`;
    const briefNameFor = (list) => {
      const names = [...new Set(list.map((x) => x.briefName).filter(Boolean))];
      if (names.length === 1) return names[0];
      if (names.length > 1) return names.length + " briefs";
      return workspaceName || "this workspace";
    };

    const emailit = async (alias, to, vars) => {
      if (!to) return;
      const key = `${batchId}-${alias}-${to}`.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 200);
      try {
        await proxyEmailit("https://api.emailit.com/v2/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": key },
          body: JSON.stringify({ from: EMAIL_FROM, to, template: alias, variables: vars }),
        });
      } catch (e) { console.error("batch email failed:", alias, to, e); }
    };

    // the brand, once
    await emailit("bl-sub-batch-user", brandEmail, {
      account_name: workspaceName,
      brief_name: briefNameFor(rows),
      user_first_name: brandFirstName,
      batch_total: String(rows.length),
      batch_counts: countsLine,
      batch_needs_you: needing.length ? namesOf(needing) : "Nothing. Every video passed.",
      batch_url: batchUrl,
    });

    // each creator, once, about their own videos only
    const byCreator = new Map();
    for (const x of rows) {
      const to = String(x.creatorEmail || "").trim().toLowerCase();
      if (!to) continue;
      if (!byCreator.has(to)) byCreator.set(to, []);
      byCreator.get(to).push(x);
    }
    for (const [to, mine] of byCreator) {
      const a = mine.filter((x) => String(x.decision || "").toUpperCase() === "APPROVED").length;
      const rj = mine.filter((x) => String(x.decision || "").toUpperCase() === "REJECTED").length;
      const fl = mine.length - a - rj;
      const theirs = mine.filter((x) => String(x.decision || "").toUpperCase() !== "APPROVED");
      await emailit("bl-sub-batch-creator", to, {
        account_name: workspaceName,
        brief_name: briefNameFor(mine),
        creator_first_name: String(mine[0].creatorName || "there").split(" ")[0] || "there",
        creator_name: mine[0].creatorName || "the creator",
        batch_total: String(mine.length),
        batch_counts: [phrase(a, "passed"), phrase(fl, "flagged"), phrase(rj, "rejected")].join(", "),
        batch_needs_you: theirs.length ? namesOf(theirs) : "Nothing. All of them passed.",
      });
    }

    // and one row in the bell, not one per video
    if (createNotification.enabled) {
      try {
        await createNotification.mutateAsync({
          isRead: false,
          accounts: [{ id: selectedAccount }],
          users: user?.id ? [{ id: user.id }] : null,
          type: needing.length ? OPT.notif.flagged : OPT.notif.completed,
          title: `${rows.length} video${rows.length === 1 ? "" : "s"} reviewed`,
          message: `${countsLine}.${needing.length ? " Waiting on you: " + namesOf(needing) + "." : ""}`,
        });
      } catch (e) { console.error("batch notification failed:", e); }
    }
  };

  // ─── The engine's view of this block: one workspace, review only ───
  const workspaceId = selectedAccount || "";
  const kind = "review"; const context = "workspace"; const isCreator = false; const multi = true;
  const parent = null; const parentId = ""; const parentReviewId = ""; const previous = null; const revisionNo = 0; const urlName = "";
  const workspaceName = unwrap(af?.name) || allAccounts.find((a) => a.id === selectedAccount)?.title || "";
  const brandUserId = user?.id || "";
  const brandEmail = user?.email || unwrap(mf.email) || "";
  const brandFirstName = user?.firstName || unwrap(mf.firstName) || "there";
  const qaLabelsOf = (ids) => QA_OPTIONS.filter((o) => (ids || []).includes(o.id)).map((o) => o.label);

  // The credit ring reads the user's videos left against the workspace's
  // allowance; before a workspace is picked it shows the first one.
  const ringAccountId = selectedAccount || allAccounts[0]?.id || "";
  const creditsLeft = num(mf.videosRemaining);
  const maxVideos = num(af?.maxVideos) || 0;
  const ringPct = maxVideos > 0 ? Math.max(0, Math.min(1, creditsLeft / maxVideos)) : (creditsLeft > 0 ? 1 : 0);
  const planName = unwrap(af?.plan) || "";
  const cycleEnd = String(unwrap(af?.cycleEnd) || "").slice(0, 10);
  const modeLabel = unwrap(af?.aiMode) || "Hybrid";
  // The gate: an inactive account or no videos left shows the Upgrade card instead of the steps.
  const meSettled = meState.status === "success" || meState.status === "error";
  const meStatus = unwrap(mf.status);
  const gateCode = !meSettled ? "" : (meStatus && meStatus !== "Active") ? "inactive" : creditsLeft <= 0 ? "noCredits" : "";

  // ── Gemini video part (inline base64, sized for the proxy) ───
  // The proxy carries text only and caps bodies near 4MB, so the video
  // always travels inline and always below INLINE_MAX. Longer videos
  // come through the Cloudinary rungs; if none fits, say so plainly.
  async function makeVideoPart(blob, mime) {
    if (!blob || blob.size > INLINE_MAX) throw new Error("This video is too long to review here. Trim it to under 3 minutes, or upload a smaller file, and try again.");
    return { inline_data: { mime_type: mime, data: await blobToBase64(blob) } };
  }

  // ── The pipeline, one video at a time ────────────────────────
  async function runPipeline(item, myRun, ui, ctx) {
    // Per-video settings from the review table.
    const { agents, briefId, brief, notes, pdf, creatorName, creatorEmail } = ctx;
    const aiModeLabel = unwrap(brief?.aiMode) || unwrap(af?.aiMode) || "Hybrid";
    const alive = () => runRef.current === myRun;
    const isFile = item.kind === "file";
    const theFile = isFile ? item.file : null;
    const srcUrl = isFile ? "" : item.url;
    const isYouTube = !isFile && /youtube\.com|youtu\.be/i.test(srcUrl);
    const ytId = isYouTube ? ytVideoId(srcUrl) : "";
    const acct = af || (brief ? { brandBio: brief.brandBio } : null);

    // 1. Source the mp4
    let mp4 = ""; let handle = ""; let duration = 0; let uploaded = item.uploaded || null; let pdfUploaded = ctx.pdfUploaded || null;
    if (isFile) {
      if (!uploaded) {
        const [up] = await uploadAsync(theFile);
        if (!up || up.status !== "completed" || !up.url) throw new Error("The video upload didn't complete. Try again.");
        uploaded = { filename: up.file?.name || theFile.name || "video.mp4", url: up.url };
      }
      try { ui.preview(URL.createObjectURL(theFile)); } catch { /* no preview */ }
      if (STEPPER && pdf) {
        const [pu] = await uploadAsync(pdf);
        if (pu && pu.status === "completed" && pu.url) pdfUploaded = { filename: pu.file?.name || pdf.name || "brief.pdf", url: pu.url };
      }
    } else if (isDirectVideoUrl(srcUrl)) {
      mp4 = srcUrl; ui.preview(mp4);
    } else {
      const res = await proxyRapid(SCRAPE_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: srcUrl }) });
      if (!res.ok) { console.error("scrape failed", res.status, await res.text().catch(() => "")); throw new Error("We couldn't fetch that link. Check it opens in a browser and try again."); }
      const scraped = adaptScrape(await res.json());
      if (!scraped.mp4 && !isYouTube) throw new Error("We couldn't read that video. The link may be private or deleted.");
      mp4 = scraped.mp4; handle = scraped.handle; duration = scraped.duration;
      if (mp4) ui.preview(mp4);
    }
    if (!alive()) return null;

    // 2. Cloudinary: playback copy + frames
    ui.stage("Preparing frames");
    let publicId = ""; let deliveryUrl = ""; let cld = null;
    if (!isYouTube) {
      try {
        const form = new FormData();
        form.append("file", isFile ? theFile : mp4);
        form.append("upload_preset", CLOUDINARY_PRESET);
        form.append("folder", CLOUDINARY_FOLDER);
        const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/video/upload`, { method: "POST", body: form });
        if (cldRes.ok) {
          cld = await cldRes.json();
          publicId = cld.public_id || ""; deliveryUrl = cld.secure_url || "";
          if (!duration) duration = Math.round(Number(cld.duration) || 0);
        } else {
          console.error("Cloudinary upload rejected:", cldRes.status);
        }
      } catch (e) { console.error("Cloudinary upload failed:", e); }
    }
    if (!alive()) return null;

    // 3. The bytes, compressed to fit the proxy
    ui.stage("Review Agents watching");
    const INLINE_SAFE = 2.5 * 1024 * 1024;
    // Gemini samples one frame a second, so 640p is plenty; smaller copies
    // also travel through the proxy faster. Each rung is a lighter copy.
    const rungs = publicId ? [
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/q_auto:low,c_limit,h_640/${publicId}.mp4`,
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/q_35,c_limit,h_480/${publicId}.mp4`,
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/q_25,c_limit,h_360/${publicId}.mp4`,
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/q_20,c_limit,h_270/${publicId}.mp4`,
    ] : [];
    let blob = isFile ? theFile : null;
    let mime = (isFile && theFile?.type) || "video/mp4";
    let rungIdx = 0;
    for (; rungIdx < rungs.length; rungIdx++) {
      const r = await fetch(rungs[rungIdx]);
      if (!r.ok) { console.error(`Cloudinary rung ${rungIdx} returned ${r.status}`); continue; }
      const b = await r.blob();
      if (b.size > 1000) { blob = b; mime = "video/mp4"; }
      if (blob && blob.size <= INLINE_SAFE) break;
    }
    if (!blob && !isYouTube) {
      const v = await fetch(deliveryUrl || mp4);
      if (!v.ok) throw new Error("We couldn't read that video.");
      blob = await v.blob(); mime = blob.type || "video/mp4";
    }
    let videoPart = isYouTube ? { file_data: { file_uri: srcUrl } } : await makeVideoPart(blob, mime);
    if (!alive()) return null;

    // 4. Gemini
    const { checks, thresholdSource } = buildChecks(acct, brief, STEPPER ? agents : []);
    const meta = {
      format: String(cld?.format || (theFile?.type || "").split("/")[1] || "mp4").toUpperCase(),
      sizeMb: cld?.bytes ? (cld.bytes / 1e6).toFixed(1) : theFile ? (theFile.size / 1e6).toFixed(1) : "0",
      resolution: cld?.width && cld?.height ? `${cld.width}x${cld.height}` : "",
      aspect: cld?.width && cld?.height ? aspectRatio(cld.width, cld.height) : "",
      fps: cld?.frame_rate ?? "",
      duration: fmtDuration(duration || cld?.duration || 0),
    };
    const screenshotBase = publicId ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/so_{timestamp}/c_fill,h_1920,w_1080/${publicId}.jpg` : "";
    const prompt = buildPrompt({ account: acct, brief, notes, checks, meta, screenshotBase, previous, kind: STEPPER ? kind : "review" });
    const genUrl = `${GEMINI_BASE}/v1beta/models/${GEMINI_MODEL}:generateContent`;
    // The Softr proxy gives up on a call after about two minutes, so the
    // whole answer has to come back inside that. Thinking stays low and the
    // output is kept short (see the prompt). A timeout is never retried with
    // the same payload: the next lighter copy of the video goes instead.
    const attempt = (part, thinking) => proxyGoogle(genUrl, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }, part] }],
        generationConfig: {
          temperature: 0.4, topP: 1, topK: 32, maxOutputTokens: 8192, responseMimeType: "application/json",
          ...(thinking ? { thinkingConfig: { thinkingLevel: "low" } } : {}),
        },
      }),
    });
    const timedOut = (r) => !r.ok && (r.status === 504 || r.status === 502 || r.status === 408);
    const retryable = (r) => !r.ok && (r.status >= 500 || r.status === 400);
    let useThinking = true;
    let gRes = await attempt(videoPart, useThinking);
    if (!gRes.ok && gRes.status === 400) {
      // A model that does not take the thinking field answers 400; go without it.
      useThinking = false;
      gRes = await attempt(videoPart, useThinking);
    }
    let calls = 1;
    while (!gRes.ok && calls < 3 && (timedOut(gRes) || retryable(gRes))) {
      if (timedOut(gRes)) {
        if (rungIdx + 1 >= rungs.length) break;
        ui.stage("Still watching, trying a lighter copy");
        rungIdx += 1;
        const r = await fetch(rungs[rungIdx]);
        if (!r.ok) continue;
        const b = await r.blob();
        if (b.size < 1000) continue;
        blob = b; videoPart = await makeVideoPart(blob, "video/mp4");
      } else {
        await sleep(2500);
      }
      gRes = await attempt(videoPart, useThinking); calls += 1;
    }
    if (!gRes.ok) { console.error("gemini failed", gRes.status, await gRes.text().catch(() => "")); throw new Error(timedOut(gRes) ? "The Review Agents ran out of time on this video. A shorter or lighter cut usually gets through. Try again in a moment." : "The Review Agents couldn't watch the video right now. Try again in a moment."); }
    let parsed = parseGeminiJson(await gRes.json());
    const decisionRaw = String(parsed?.overall_review?.ai_decision || "").toUpperCase();
    if (!parsed?.overall_review || !Array.isArray(parsed?.analysis) || !["APPROVED", "FLAGGED", "REJECTED"].includes(decisionRaw)) {
      await sleep(1500);
      gRes = await attempt(videoPart);
      if (!gRes.ok) throw new Error("The review came back incomplete.");
      parsed = parseGeminiJson(await gRes.json());
    }
    const decision = ["APPROVED", "FLAGGED", "REJECTED"].includes(String(parsed?.overall_review?.ai_decision || "").toUpperCase())
      ? String(parsed.overall_review.ai_decision).toUpperCase() : "FLAGGED";
    const ov = parsed.overall_review || {};
    const byName = normaliseAnalysis(parsed, checks, publicId);
    if (byName.size === 0) throw new Error("The review came back without any checks.");
    if (!alive()) return null;

    // 5. Write at the end. The review goes first, then the submission that
    //    links it (submissions.reviews and reviews.submissions are a two-way
    //    pair, so the review side fills itself), then one review_report row
    //    per agent. If the submission write fails, nothing has been charged:
    //    the submission row is the credit.
    ui.stage("Saving the review");
    const platform = isFile ? "Upload" : detectPlatform(srcUrl);
    const videoTitle = (STEPPER && urlName) || stripEmDash(ov.video_title || "").slice(0, 80)
      // A filename like IMG_4821.MOV is worse than no name at all.
      // Who filmed it and when at least sorts and scans.
      || ((String(creatorName || "").trim().split(/\s+/)[0] || handle || "Untitled")
          + ", " + new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" }));
    const projectIds = idsOf(brief?.projects).length ? idsOf(brief.projects) : idsOf(parent?.projects);
    const normQa = (l) => String(l || "").toLowerCase().replace(/&/g, "and").replace(/visability/g, "visibility").replace(/\s+/g, " ").trim();
    const qaIndex = Object.fromEntries(Object.entries(SUB_QA_IDS).map(([k, v]) => [normQa(k), v]));
    const qaLabels = [...unwrapAll(acct?.qaChecklist), ...unwrapAll(brief?.qaChecklist), ...(STEPPER ? agents : [])];
    const qaIds = [...new Set(qaLabels.map((l) => qaIndex[normQa(l)] || "").filter(Boolean))];

    const g = (prefix) => byName.get(AGENTS.find((a) => a.key === prefix)?.name || "") || null;
    const col = (prefix) => {
      const r = g(prefix); if (!r) return {};
      const sc = numericScore(r.score);
      return { score: sc, status: statusValue(prefix, r.status), comment: r.comment.slice(0, 1000), shot: r.screenshot };
    };
    const pst = col("pst"), hs = col("hs"), vh = col("vh"), cta = col("cta"), ft = col("ft"), tl = col("tl"), ac = col("ac"), ep = col("ep"), bm = col("bm"), cr = col("cr"), cm = col("cm"), ba = col("ba");
    const links = {
      accounts: [{ id: workspaceId }],
      briefs: briefId ? [{ id: briefId }] : null,
      projects: projectIds.length ? projectIds.map((id) => ({ id })) : null,
    };
    const review = await createReview.mutateAsync({
      ...links,
      overallStatus: OPT.overallStatus[decision],
      aiDecision: OPT.aiDecision[decision],
      aiMode: OPT.aiMode[aiModeLabel] || OPT.aiMode.Hybrid,
      thresholdSource: OPT.thresholdSource[thresholdSource],
      overallRating: Math.min(5, Math.max(1, Math.round(Number(ov.overall_rating) || 3))),
      overallComment: stripEmDash(ov.overall_comment || ""),
      decisionReasoning: stripEmDash(ov.decision_reasoning || ""),
      recommendedAction: stripEmDash(ov.recommended_action || ""),
      transcript: stripEmDash(parsed.transcript || ""),
      adaptedScript: STEPPER && kind === "remix" ? stripEmDash(parsed.adapted_script || "") : "",
      displayUrl: (deliveryUrl || "").slice(0, 1000),
      thumbnail: cldThumb(publicId) || (ytId ? `https://i.ytimg.com/vi/${ytId}/hq2.jpg` : ""),
      offBrand: g("ba")?.value?.slice(0, 1000) || "",
      pstScore: pst.score ?? null, pstStatus: pst.status || null, pstComment: pst.comment || "", pstShot: pst.shot || "",
      hsScore: hs.score ?? null, hsStatus: hs.status || null, hsComment: hs.comment || "", hsShot: hs.shot || "",
      vhScore: vh.score ?? null, vhStatus: vh.status || null, vhComment: vh.comment || "", vhShot: vh.shot || "",
      ctaScore: g("cta")?.score || "", ctaStatus: cta.status || null, ctaComment: cta.comment || "", ctaShot: cta.shot || "",
      ftScore: ft.score ?? null, ftStatus: ft.status || null, ftComment: ft.comment || "", ftShot: ft.shot || "",
      tlScore: tl.score ?? null, tlStatus: tl.status || null, tlComment: tl.comment || "", tlShot: tl.shot || "",
      acScore: ac.score ?? null, acStatus: ac.status || null, acComment: ac.comment || "", acShot: ac.shot || "",
      epScore: ep.score ?? null, epStatus: ep.status || null, epComment: ep.comment || "", epShot: ep.shot || "",
      bmScore: bm.score ?? null, bmStatus: bm.status || null, bmComment: bm.comment || "", bmShot: bm.shot || "",
      crStatus: cr.status || null, crDetails: cr.comment || "", crShot: cr.shot || "",
      cmStatus: cm.status || null, cmDetails: cm.comment || "", cmShot: cm.shot || "",
      baStatus: ba.status || null, baDetails: ba.comment || "", baShot: ba.shot || "",
    });
    const reviewId = review?.id || review?.recordId || review?.record?.id || "";
    if (!reviewId) throw new Error("The review was not saved. No video was used.");

    const subFields = {
      name: videoTitle,
      accounts: workspaceId,
      briefs: briefId ? [{ id: briefId }] : null,
      projects: projectIds.length ? projectIds.map((id) => ({ id })) : null,
      users: brandUserId ? [{ id: brandUserId }] : null,
      reviews: [{ id: reviewId }],
      videoUrl: isFile ? "" : srcUrl,
      videoFile: uploaded ? [uploaded] : null,
      briefAttachment: pdfUploaded ? [pdfUploaded] : null,
      creatorName: cleanName(creatorName) || (isCreator ? cleanName(unwrap(parent?.creatorName)) : (STEPPER ? cleanName(unwrap(mf.fullName)) : "")),
      creatorEmail: isCreator ? (creatorEmail.trim() || unwrap(parent?.creatorEmail) || "") : creatorEmail.trim(),
      submissionType: context === "submission" ? OPT.subTypeRevision : (STEPPER && kind === "analyse" ? OPT.subTypeAnalyse : STEPPER && kind === "remix" ? OPT.subTypeSwipe : briefId ? OPT.subTypeBrief : OPT.subTypeContentReview),
      status: OPT.statusReviewed,
      userValidation: OPT.userValidationProceed,
      platformName: OPT.platform[platform] || OPT.platform.Upload,
      platformUsername: handle || "",
      submissionNotes: notes.trim(),
      qaChecklist: qaIds.length ? qaIds : null,
      duration: meta.duration,
      resolution: meta.resolution,
      aspectRatio: meta.aspect,
      fileSizeMb: String(meta.sizeMb),
      format: meta.format,
      fps: Number(meta.fps) || null,
      parentSubmission: context === "submission" ? [{ id: parentId }] : null,
      parentSubmissionId: context === "submission" ? parentId : "",
      originalReviewId: context === "submission" ? (unwrap(parent?.originalReviewId) || parentReviewId) : "",
      revisionNumber: context === "submission" ? (OPT.revision[revisionNo] || OPT.revision[10]) : null,
      isBulk: !!multi,
      batchId: ctx.batchId || "",
    };
    let sub = null;
    try { sub = await createSubmission.mutateAsync(subFields); }
    catch (e) { console.error("submission write failed, review left unattached:", reviewId, e); throw new Error("The review finished but couldn't be saved. No video was used. Try again in a moment."); }
    const subId = sub?.id || sub?.recordId || sub?.record?.id || "";
    if (!subId) { console.error("submission write returned no id, review left unattached:", reviewId); throw new Error("The review finished but couldn't be saved. No video was used. Try again in a moment."); }
    const rowLinks = { ...links, submissions: [{ id: subId }] };

    // One review_report row per agent, in order.
    if (!createReport.enabled) console.error("review_report create is not enabled for this visitor");
    let reportsWritten = 0;
    for (const [, r] of byName) {
      if (!createReport.enabled) break;
      try {
        await createReport.mutateAsync({
          threshold: r.agent.name,
          score: r.score,
          thresholdValue: r.value,
          rating: r.rating,
          severity: OPT.reportSeverity[r.severity],
          status: OPT.reportStatus[r.status] || r.status,
          comment: r.comment.slice(0, 4000),
          screenshotUrl: r.screenshot,
          keyMoment: r.timestamp === null ? null : (KEY_MOMENT_IDS[String(r.timestamp)] || null),
          review: [{ id: reviewId }],
          ...rowLinks,
        });
        reportsWritten += 1;
      } catch (e) { console.error("review_report row failed:", r.agent.name, String(e?.message || e)); }
    }
    console.log(`review_report rows written: ${reportsWritten} of ${byName.size}`);

    // 6. Notifications (to the brand user)
    const failed = [...byName.values()].filter((r) => r.status !== "PASS").map((r) => r.agent.name);
    const notifBase = { isRead: false, accounts: [{ id: workspaceId }], users: brandUserId ? [{ id: brandUserId }] : null, briefs: briefId ? [{ id: briefId }] : null, projects: links.projects, submissions: [{ id: subId }], reviews: [{ id: reviewId }] };
    const notify = async (type, title, message) => {
      if (!createNotification.enabled) return;
      try { await createNotification.mutateAsync({ ...notifBase, type, title, message }); } catch (e) { console.error("notification failed:", title, e); }
    };
    const creatorEmailFinal = subFields.creatorEmail;
    const what = context === "submission" ? `Revision ${revisionNo} of ${videoTitle}` : videoTitle;
    // A batch tells the story once, at the end, in handleBatchDone. Per
    // video it would be fifty emails and a hundred and fifty bell rows
    // for one upload.
    const quiet = !!ctx.batchId;
    if (!quiet) {
      if (creatorEmailFinal) await notify(OPT.notif.received, "Submission received", `${what} was submitted${brief ? ` for ${unwrap(brief.name)}` : ""}.`);
      await notify(OPT.notif.completed, "Review completed", `${what}: ${decision.toLowerCase()} by the Review Agents${failed.length ? ` (${failed.length} flagged)` : ""}.`);
      const decisionType = decision === "APPROVED" ? OPT.notif.approved : decision === "REJECTED" ? OPT.notif.rejected : OPT.notif.flagged;
      const decisionTitle = decision === "APPROVED" ? "Content approved" : decision === "REJECTED" ? "Content rejected" : "Flagged for review";
      await notify(decisionType, decisionTitle, stripEmDash(ov.decision_reasoning || "").slice(0, 500));
    }

    // 7. EmailIt by alias, idempotent per submission + event
    const reviewUrl = `${APP_ORIGIN}${DETAILS_PATH}?recordId=${encodeURIComponent(subId)}`;
    const submissionUrl = `${APP_ORIGIN}${LIVE_PATH}?recordId=${encodeURIComponent(subId)}`;
    const vars = {
      account_name: workspaceName,
      brief_name: unwrap(brief?.name) || "the brief",
      creator_first_name: (subFields.creatorName || "there").split(" ")[0],
      creator_name: subFields.creatorName || "the creator",
      user_first_name: brandFirstName,
      failed_thresholds: failed.length ? failed.join(", ") : "None",
      review_url: reviewUrl,
      submission_url: submissionUrl,
    };
    // EmailIt rate-limits bursts (429). Each send retries with a pause,
    // and the Idempotency-Key keeps a retry from ever sending twice.
    const send = async (alias, to) => {
      if (!to) { console.error("EmailIt skipped, no recipient for", alias); return; }
      const key = `${subId}-${alias}`.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 200);
      const waits = [2000, 5000, 12000];
      for (let attempt = 0; attempt <= waits.length; attempt++) {
        try {
          const r = await proxyEmailit("https://api.emailit.com/v2/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Idempotency-Key": key },
            body: JSON.stringify({ from: EMAIL_FROM, to, template: alias, variables: vars }),
          });
          if (r.ok) return;
          const again = r.status === 429 || r.status >= 500;
          console.error("EmailIt", alias, "returned", r.status, again && attempt < waits.length ? "retrying" : "giving up");
          if (!again || attempt >= waits.length) return;
          const retryAfter = Number(r.headers?.get?.("retry-after")) || 0;
          await sleep(Math.max(retryAfter * 1000, waits[attempt]));
        } catch (e) {
          console.error("EmailIt failed:", alias, e);
          if (attempt >= waits.length) return;
          await sleep(waits[attempt]);
        }
      }
    };
    const outcome = decision === "APPROVED" ? "approved" : decision === "REJECTED" ? "rejected" : "flagged";
    const mode = aiModeLabel === "Autonomous" ? "auto" : aiModeLabel === "Manual" ? "manual" : "hybrid";
    const sendsEmail = !(STEPPER && kind !== "review") && !quiet;
    if (sendsEmail && creatorEmailFinal) await send("bl-sub-received-creator", creatorEmailFinal);
    if (!sendsEmail) { /* analyse and remix are for the brand's own eyes, and a batch speaks at the end */ }
    else if (mode === "auto") { if (creatorEmailFinal) await send(`bl-sub-${outcome}-auto-creator`, creatorEmailFinal); }
    else if (mode === "hybrid") { if (creatorEmailFinal) await send(`bl-sub-${outcome}-hybrid-creator`, creatorEmailFinal); await send(`bl-sub-${outcome}-hybrid-user`, brandEmail); }
    else { await send(`bl-sub-${outcome}-manual-user`, brandEmail); }

    return { subId, reviewId, decision, title: videoTitle, failed, checks: byName.size, thumb: cldThumb(publicId),
             creatorEmail: creatorEmailFinal || "", creatorName: subFields.creatorName || "",
             briefName: unwrap(brief?.name) || "" };
  }

  // One video through the engine, with that row's own settings.
  const submitOneVideo = async (video, batchId) => {
    if (!createSubmission.enabled || !createReview.enabled) throw new Error("The review can't start right now. Refresh and try again.");
    if (!user?.id) throw new Error("User not detected.");
    if (!video.uploadedUrl) throw new Error("This video has not finished uploading.");
    if (!selectedAccount || !af) throw new Error("Your workspace is still loading. Try again in a moment.");
    const brief = briefsFull.find((b) => b.id === video.brief)?.f || null;
    const ctx = {
      agents: qaLabelsOf(video.qaChecklist),
      briefId: video.brief || "",
      brief,
      notes: video.notes || "",
      pdf: null,
      pdfUploaded: video.pdf || null,
      creatorName: video.creatorName || "",
      creatorEmail: video.creatorEmail || "",
      batchId: batchId || "",
    };
    const item = { kind: "file", file: video.file, label: video.file.name, uploaded: { filename: video.file.name, url: video.uploadedUrl } };
    const r = await runPipeline(item, runRef.current, { stage: () => {}, preview: () => {} }, ctx);
    if (!r) throw new Error("The review did not finish.");
    return r;
  };

  return (
    <div className="container py-10">
      <div className="content">
        <style>{CREDIT_CSS}</style>
        {user?.id ? <UserLoader recordId={user.id} onState={setMeState} /> : null}
        {ringAccountId ? <AccountLoader key={ringAccountId} recordId={ringAccountId} onState={setAfState} /> : null}
        {selectedAccount ? <BriefList key={`b-${selectedAccount}`} workspaceId={selectedAccount} onList={setBriefsFull} /> : null}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bulk Video Upload</h1>
            <p className="text-muted-foreground mt-1">Upload and submit multiple videos at once.</p>
          </div>
          <span className="bu-ringwrap">
            <button type="button" className="bu-ring" onClick={() => setShowCredits((v) => !v)} title={`${creditsLeft} video${creditsLeft === 1 ? "" : "s"} left this cycle`} aria-label="Videos left this cycle" aria-expanded={showCredits}>
              <svg viewBox="0 0 36 36" width="20" height="20" aria-hidden="true"><circle cx="18" cy="18" r="15" className="bu-ring-track" /><circle cx="18" cy="18" r="15" className="bu-ring-bar" style={{ strokeDasharray: `${(ringPct * 94.2).toFixed(1)} 94.2` }} /></svg>
            </button>
            {showCredits ? (
              <div className="bu-pop" role="dialog" aria-label="Videos this cycle">
                <div className="bu-pop-row"><span>Videos this cycle</span><b>{creditsLeft}{maxVideos ? ` of ${maxVideos}` : ""} left</b></div>
                <div className="bu-pop-bar"><i style={{ width: `${Math.round(ringPct * 100)}%` }} /></div>
                {planName ? <div className="bu-pop-row"><span>Plan</span><b>{planName}</b></div> : null}
                <div className="bu-pop-row"><span>Review mode</span><b>{modeLabel}</b></div>
                {cycleEnd ? <div className="bu-pop-row"><span>Resets</span><b>{cycleEnd}</b></div> : null}
                <a className="bu-pop-link" href="/settings#tab2">See your plan</a>
              </div>
            ) : null}
          </span>
        </div>
        {gateCode ? (
          <div className="bu-upgrade">
            <img src={UPGRADE_IMG} alt="" draggable={false} />
            <h2>Upgrade your account</h2>
            <p>Update your payment method to activate your account and access your videos and features.</p>
            <a href="/billing">Update payment method</a>
          </div>
        ) : (
          <>
        <StepIndicator step={step} />
        {step === 1 && <UploadStep videos={videos} onUpload={handleFilesDrop} onRemove={removeVideo} onNext={leaveUploadStep} />}
        {step === 2 && <WorkspaceStep accounts={filteredAccounts} isLoading={accountsLoading} selectedAccount={selectedAccount} onSelect={setSelectedAccount} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <QAChecklistStep selected={batchQaChecklist} onToggle={toggleQaBatch} onSelectAll={() => setBatchQaChecklist(QA_OPTIONS.map((o) => o.id))} onDeselectAll={() => setBatchQaChecklist([])} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <BriefStep briefs={briefs} briefsLoading={briefsLoading} briefMode={briefMode} onModeChange={setBriefMode} batchBrief={batchBrief} onSelectBrief={setBatchBrief} batchNotes={batchNotes} onNotesChange={setBatchNotes} batchPdf={batchPdf} onPdfUpload={handlePdfUpload} isUploading={isUploading} onNext={goToReview} onBack={() => setStep(3)} />}
        {step === 5 && <ReviewStep videos={videos} updateVideo={updateVideo} briefs={briefs} user={user} createEnabled={(createSubmission.enabled && createReview.enabled)} onSubmitOne={submitOneVideo} onBatchStart={newBatchId} onBatchDone={handleBatchDone} isSubmitting={isSubmitting} creditsLeft={creditsLeft} onBack={() => setStep(4)} />}
          </>
        )}
      </div>
    </div>
  );
}