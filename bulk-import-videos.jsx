import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRecordCreate, useLinkedRecords, useUpload, q } from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { ChevronRight, AlertCircle, Check, X, DownloadCloud, Video, ChevronDown, ChevronUp, FileText } from "lucide-react";

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

// Field select — includes lookup fields for filtered dropdowns
// userAccounts (gXpkS) and userBriefs (2xMIW) are lookup fields on the user
// that return ONLY the accounts/briefs assigned to the logged-in user.
// We READ from those lookups but WRITE to the actual fields (accounts / briefs).
const select = q.select({
  accounts: "v94f0",
  briefs: "fqtit",
  userAccounts: "gXpkS",
  userBriefs: "2xMIW",
  qaChecklist: "qYYxu",
  users: "DxNOa",
  videoFile: "PP7rO",
  creatorName: "9ZryL",
  creatorEmail: "INZs6",
  submissionType: "b82bF",
  userValidation: "QqS0I",
  platformName: "5Quiw",
  submissionNotes: "UzR32",
  briefAttachment: "GmjrC",
});

// ─── Step indicator (matches briefs import design) ───────────────────────────
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

// ─── Step 1 · Upload Videos ──────────────────────────────────────────────────
function UploadStep({ videos, onUpload, onRemove, isUploading, onNext }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  return (
    <div className="flex flex-col items-center justify-center">
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
        <Badge variant="secondary" className="text-xs">Video files only</Badge>
        <input ref={inputRef} type="file" accept="video/*" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} />
      </div>

      {isUploading && <p className="text-sm text-muted-foreground mt-4 animate-pulse">Uploading videos...</p>}

      {videos.length > 0 && (
        <div className="w-full max-w-lg mt-6 space-y-2">
          <p className="text-sm font-semibold text-foreground">{videos.length} video{videos.length !== 1 ? "s" : ""} ready</p>
          {videos.map((v) => (
            <div key={v.id} className="flex items-center justify-between p-3 rounded-xl border bg-card">
              <div className="flex items-center gap-2 min-w-0">
                <Video className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm truncate">{v.file.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">{(v.file.size / 1024 / 1024).toFixed(1)} MB</span>
                <button onClick={(e) => { e.stopPropagation(); onRemove(v.id); }} className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-all">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="w-full max-w-lg mt-6">
        <Button onClick={onNext} disabled={videos.length === 0} className="w-full">
          Continue <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 2 · Workspace Selection ────────────────────────────────────────────
function WorkspaceStep({ accounts, selectedAccount, onSelect, onNext, onBack }) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Select Workspace</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Choose which account these videos belong to.</p>
      </div>

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

      {accounts.length === 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <div className="text-sm text-destructive">No accounts found for your user. Contact your admin.</div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={!selectedAccount}>Continue <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
    </div>
  );
}

// ─── Step 3 · QA Checklist ───────────────────────────────────────────────────
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

// ─── Step 4 · Brief (optional) ───────────────────────────────────────────────
function BriefStep({ briefs, batchBrief, onSelectBrief, batchNotes, onNotesChange, batchPdf, onPdfUpload, isUploading, onNext, onBack }) {
  const [wantsBrief, setWantsBrief] = useState(null); // null = not answered, true, false

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Add a Brief?</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Would you like to attach a brief to these videos?</p>
      </div>

      {wantsBrief === null && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setWantsBrief(true)}
            className="p-6 rounded-2xl border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <span className="font-semibold text-foreground">Yes, add a brief</span>
            <span className="text-xs text-muted-foreground text-center">Select from your briefs and add details</span>
          </button>
          <button
            onClick={() => { setWantsBrief(false); onSelectBrief(null); }}
            className="p-6 rounded-2xl border-2 border-dashed hover:border-muted-foreground/50 hover:bg-muted/40 transition-all flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
              <X className="w-6 h-6" />
            </div>
            <span className="font-semibold text-foreground">No, skip</span>
            <span className="text-xs text-muted-foreground text-center">Go straight to review</span>
          </button>
        </div>
      )}

      {wantsBrief === true && (
        <div className="space-y-4 p-4 rounded-xl border bg-card">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Brief</label>
            <Select value={batchBrief || ""} onValueChange={onSelectBrief}>
              <SelectTrigger><SelectValue placeholder="Choose a brief..." /></SelectTrigger>
              <SelectContent>
                {briefs.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {briefs.length === 0 && (
              <p className="text-xs text-muted-foreground">No briefs found for your account.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Brief Details <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Textarea value={batchNotes} onChange={(e) => onNotesChange(e.target.value)} placeholder="Add any brief details or notes..." rows={4} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Attach PDF <span className="text-muted-foreground font-normal">(optional)</span></label>
            <Input type="file" accept="application/pdf" onChange={(e) => onPdfUpload(e.target.files?.[0] || null)} />
            {isUploading && <p className="text-xs text-muted-foreground animate-pulse">Uploading PDF...</p>}
            {batchPdf && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm truncate text-foreground">{batchPdf.filename}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {wantsBrief === false && (
        <div className="p-4 rounded-xl bg-muted/50 border border-dashed text-center">
          <p className="text-sm text-muted-foreground">No brief will be attached. You can still add one per-video in the review step.</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => { if (wantsBrief !== null) { setWantsBrief(null); } else { onBack(); } }}>
          {wantsBrief !== null ? "Change Answer" : "Back"}
        </Button>
        <Button onClick={onNext} disabled={wantsBrief === null}>
          Continue to Review <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 5 · Review & Submit (table-based, matching briefs import) ──────────
function ReviewStep({ videos, updateVideo, removeVideo, briefs, user, createEnabled, onSubmitOne, onSubmitAll, isSubmitting, onBack }) {
  const [rowStates, setRowStates] = useState(() => videos.map(() => "pending"));
  const [importedIds, setImportedIds] = useState(new Set());
  const [expandedQa, setExpandedQa] = useState(null);

  const toggleRow = (i, state) => { setRowStates((prev) => { const next = [...prev]; next[i] = state; return next; }); };
  const acceptedRows = videos.filter((_, i) => rowStates[i] === "pending" && !importedIds.has(i));
  const rejectedCount = rowStates.filter((s) => s === "rejected").length;

  const importRow = async (video, i) => {
    try {
      await onSubmitOne(video);
      setImportedIds((prev) => new Set([...prev, i]));
      toast.success("Video " + (i + 1) + " submitted!");
    } catch (e) {
      toast.error("Video " + (i + 1) + " failed", { description: e.message || "Unknown error" });
    }
  };

  const importAll = async () => {
    let success = 0;
    let fail = 0;
    for (let i = 0; i < videos.length; i++) {
      if (rowStates[i] === "rejected" || importedIds.has(i)) continue;
      try {
        await onSubmitOne(videos[i]);
        setImportedIds((prev) => new Set([...prev, i]));
        success++;
      } catch (e) {
        fail++;
        toast.error("Video " + (i + 1) + " failed", { description: e.message || "Unknown error" });
      }
    }
    if (success > 0) toast.success(success + " video" + (success > 1 ? "s" : "") + " submitted!");
    if (fail > 0) toast.error(fail + " video" + (fail > 1 ? "s" : "") + " failed.");
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
          {user?.id && <p className="text-xs text-green-600 mt-1">Logged in as {user.fullName || user.email}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} size="sm">Back</Button>
          <Button onClick={importAll} disabled={isSubmitting || acceptedRows.length === 0 || !createEnabled || !user?.id} size="sm">
            {isSubmitting ? "Submitting..." : "Submit All (" + acceptedRows.length + ")"}
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
                    {/* Row number */}
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{i + 1}</td>

                    {/* Video file info */}
                    <td className="px-4 py-3 max-w-[160px]">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate text-foreground text-sm font-medium">{video.file.name}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{(video.file.size / 1024 / 1024).toFixed(1)} MB</span>
                    </td>

                    {/* Creator name & email */}
                    <td className="px-4 py-3 min-w-[160px]">
                      <div className="space-y-1">
                        <Input
                          value={video.creatorName}
                          onChange={(e) => updateVideo(video.id, { creatorName: e.target.value })}
                          className="h-7 text-xs"
                          placeholder="Name"
                        />
                        <Input
                          value={video.creatorEmail}
                          onChange={(e) => updateVideo(video.id, { creatorEmail: e.target.value })}
                          className="h-7 text-xs"
                          placeholder="Email"
                        />
                      </div>
                    </td>

                    {/* QA Checklist — expandable per-video */}
                    <td className="px-4 py-3 min-w-[140px]">
                      <button
                        onClick={() => setExpandedQa(qaExpanded ? null : video.id)}
                        className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">{video.qaChecklist.length}</Badge>
                        <span>item{video.qaChecklist.length !== 1 ? "s" : ""}</span>
                        {qaExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      {qaExpanded && (
                        <div className="mt-2 grid grid-cols-1 gap-0.5 max-h-40 overflow-y-auto p-2 border rounded-lg bg-background shadow-sm">
                          {QA_OPTIONS.map((opt) => (
                            <div key={opt.id} className="flex items-center space-x-1.5 py-0.5">
                              <Checkbox
                                id={`${video.id}-${opt.id}`}
                                checked={video.qaChecklist.includes(opt.id)}
                                onCheckedChange={() => {
                                  const newList = video.qaChecklist.includes(opt.id)
                                    ? video.qaChecklist.filter((x) => x !== opt.id)
                                    : [...video.qaChecklist, opt.id];
                                  updateVideo(video.id, { qaChecklist: newList });
                                }}
                              />
                              <label htmlFor={`${video.id}-${opt.id}`} className="text-[11px] cursor-pointer">{opt.label}</label>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Brief dropdown */}
                    <td className="px-4 py-3 min-w-[140px]">
                      <Select
                        value={video.brief || "__none__"}
                        onValueChange={(val) => updateVideo(video.id, { brief: val === "__none__" ? null : val })}
                      >
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__"><span className="text-muted-foreground italic">None</span></SelectItem>
                          {briefs.map((b) => (
                            <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Notes */}
                    <td className="px-4 py-3 min-w-[140px]">
                      <Textarea
                        value={video.notes}
                        onChange={(e) => updateVideo(video.id, { notes: e.target.value })}
                        className="h-14 text-xs resize-none"
                        placeholder="Notes..."
                      />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      {imported
                        ? <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Submitted</Badge>
                        : state === "rejected"
                          ? <Badge variant="destructive" className="text-xs">Rejected</Badge>
                          : <Badge variant="secondary" className="text-xs">Pending</Badge>
                      }
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      {!imported && (
                        <div className="flex items-center justify-center gap-1.5">
                          {state !== "rejected" && (
                            <>
                              <button
                                onClick={() => importRow(video, i)}
                                disabled={isSubmitting || !createEnabled || !user?.id}
                                className="w-7 h-7 rounded-full bg-green-100 hover:bg-green-200 text-green-700 flex items-center justify-center transition-all disabled:opacity-50"
                                title="Submit"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => toggleRow(i, "rejected")}
                                className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-all"
                                title="Reject"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {state === "rejected" && (
                            <button onClick={() => toggleRow(i, "pending")} className="text-xs text-primary underline hover:no-underline">Restore</button>
                          )}
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

// ─── Main Block ──────────────────────────────────────────────────────────────
export default function Block() {
  const [step, setStep] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [batchQaChecklist, setBatchQaChecklist] = useState([]);
  const [batchBrief, setBatchBrief] = useState(null);
  const [batchNotes, setBatchNotes] = useState("");
  const [batchPdf, setBatchPdf] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useCurrentUser();
  const { uploadAsync, isUploading } = useUpload();
  const createRecord = useRecordCreate({ fields: select });

  // READ from lookup fields — only the logged-in user's accounts/briefs
  const { data: accountsData } = useLinkedRecords({ select, field: "userAccounts", count: 100 });
  const { data: briefsData } = useLinkedRecords({ select, field: "userBriefs", count: 100 });

  const accounts = accountsData?.pages.flatMap((p) => p.items) ?? [];
  const briefs = briefsData?.pages.flatMap((p) => p.items) ?? [];

  // ── Upload handler ────────────────────────────────────────────────────────
  const handleFilesDrop = async (files) => {
    if (!files || files.length === 0) return;
    const videoFiles = Array.from(files).filter((f) => f.type.startsWith("video/"));
    if (videoFiles.length === 0) { toast.error("Please upload video files only."); return; }

    const uploadResults = await uploadAsync(videoFiles);
    const newVideos = uploadResults
      .filter((r) => r.status === "completed" && r.url)
      .map((r) => ({
        id: r.id,
        file: r.file,
        uploadedUrl: r.url,
        creatorName: user?.fullName || "",
        creatorEmail: user?.email || "",
        qaChecklist: [],
        brief: null,
        notes: "",
        pdf: null,
      }));

    setVideos((prev) => [...prev, ...newVideos]);
    if (uploadResults.some((r) => r.status === "error")) { toast.error("Some files failed to upload."); }
  };

  // ── PDF upload handler ────────────────────────────────────────────────────
  const handlePdfUpload = async (file) => {
    if (!file) return;
    const [result] = await uploadAsync(file);
    if (result.status === "completed" && result.url) {
      setBatchPdf({ filename: result.file.name, url: result.url });
    } else {
      toast.error("PDF upload failed.");
    }
  };

  // ── Video helpers ─────────────────────────────────────────────────────────
  const updateVideo = (id, updates) => {
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const removeVideo = (id) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  // ── QA toggle ─────────────────────────────────────────────────────────────
  const toggleQaBatch = (optionId) => {
    setBatchQaChecklist((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  };

  // ── Apply batch settings when entering review ─────────────────────────────
  const goToReview = () => {
    setVideos((prev) =>
      prev.map((v) => ({
        ...v,
        qaChecklist: batchQaChecklist,
        brief: batchBrief,
        notes: batchNotes,
        pdf: batchPdf,
      }))
    );
    setStep(5);
  };

  // ── Submit a single video ─────────────────────────────────────────────────
  const submitOneVideo = async (video) => {
    if (!createRecord.enabled) throw new Error("Record creation not available.");
    if (!user?.id) throw new Error("User not detected.");

    await createRecord.mutateAsync({
      // WRITE to actual fields (accounts / briefs)
      accounts: selectedAccount,
      briefs: video.brief ? [{ id: video.brief }] : null,
      users: user.id,
      videoFile: [{ filename: video.file.name, url: video.uploadedUrl }],
      creatorName: video.creatorName,
      creatorEmail: video.creatorEmail,
      submissionType: "5ed52a56-f33e-475a-bc32-95b11756290f",
      userValidation: "0fb06c28-5e30-4a38-9cf4-2e75490f7d1a",
      platformName: "c72e31e0-d976-478e-ac07-2eeca1f811b0",
      qaChecklist: video.qaChecklist,
      submissionNotes: video.notes,
      briefAttachment: video.pdf ? [video.pdf] : null,
    });
  };

  return (
    <div className="container py-10">
      <div className="content">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Bulk Video Upload</h1>
          <p className="text-muted-foreground mt-1">Upload and submit multiple videos at once.</p>
        </div>

        <StepIndicator step={step} />

        {step === 1 && (
          <UploadStep
            videos={videos}
            onUpload={handleFilesDrop}
            onRemove={removeVideo}
            isUploading={isUploading}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <WorkspaceStep
            accounts={accounts}
            selectedAccount={selectedAccount}
            onSelect={setSelectedAccount}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <QAChecklistStep
            selected={batchQaChecklist}
            onToggle={toggleQaBatch}
            onSelectAll={() => setBatchQaChecklist(QA_OPTIONS.map((o) => o.id))}
            onDeselectAll={() => setBatchQaChecklist([])}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <BriefStep
            briefs={briefs}
            batchBrief={batchBrief}
            onSelectBrief={setBatchBrief}
            batchNotes={batchNotes}
            onNotesChange={setBatchNotes}
            batchPdf={batchPdf}
            onPdfUpload={handlePdfUpload}
            isUploading={isUploading}
            onNext={goToReview}
            onBack={() => setStep(3)}
          />
        )}

        {step === 5 && (
          <ReviewStep
            videos={videos}
            updateVideo={updateVideo}
            removeVideo={removeVideo}
            briefs={briefs}
            user={user}
            createEnabled={createRecord.enabled}
            onSubmitOne={submitOneVideo}
            isSubmitting={isSubmitting}
            onBack={() => setStep(4)}
          />
        )}
      </div>
    </div>
  );
}
