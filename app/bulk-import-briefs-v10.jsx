import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRecordCreate, useLinkedRecords, q } from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { ArrowRight, FileText, ChevronRight, AlertCircle, Check, X, DownloadCloud } from "lucide-react";

// QA option IDs for the BRIEFS table
const QA_OPTIONS = [
  { id: "20c847f5-7a3a-4349-bc9a-d31e3b1fa6b2", label: "Product visibility" },
  { id: "714e1e9d-7e02-47e5-86c8-c42da09b1ce6", label: "Product usage" },
  { id: "e004b609-b228-4ad4-9059-a5127eb8cf0d", label: "Hook quality" },
  { id: "5e173f41-8b57-4bd8-8d1d-3224d7f5e632", label: "Visual hook" },
  { id: "06cf18d0-39c8-4dc5-a4a9-ff25e83241df", label: "Audio clarity" },
  { id: "94a38177-20d1-4914-b782-9355b5387f3c", label: "Audio delivery" },
  { id: "e2a95018-742f-4c9f-bc06-41402c55071b", label: "Pronunciation" },
  { id: "3334dd25-72f8-46c2-aa04-f7e64d755a97", label: "Music & sound balance" },
  { id: "a80e1445-70bf-4896-b745-24578c26ba23", label: "Follows the brief" },
  { id: "f4f6d16e-f321-48b8-a9e5-f1d7899c9514", label: "Brand name mentioned" },
  { id: "2c6f1900-15b8-46fe-a5b7-493aac30c21b", label: "Lighting & camera" },
  { id: "f2d21ff6-8fa3-4db0-bf11-6978c340acd0", label: "Setting & background" },
  { id: "a75cf968-8b30-475c-9253-32fb7fc8a3bb", label: "Distracting elements" },
  { id: "d72c6246-e66d-4976-8aae-0bfbe2d18455", label: "Text legibility" },
  { id: "91c11efd-d37a-4e27-b831-cbe23425d23c", label: "Closed captions" },
  { id: "eb50e8f8-c014-44ee-b23f-7b39eb4fff0d", label: "Safe zones" },
  { id: "c5eb65dc-73ad-48c8-8ad2-f5f71a6e6dfd", label: "Scene pacing" },
  { id: "d215d5c1-1eba-4e76-a155-a576a92a65b8", label: "Video length" },
  { id: "d17106f1-11f4-4974-b909-551a8d2d24f6", label: "Watchable on mute" },
  { id: "e066946c-ea40-4e98-b184-032fb6beba4b", label: "Creator visibility" },
  { id: "b1e16483-3184-45b6-b064-11db0806e186", label: "Energy & authenticity" },
  { id: "f938727a-64b3-4771-b960-6d342d0975fc", label: "Wardrobe & appearance" },
  { id: "94b67c53-233c-4c3f-b39e-047ad8a00c79", label: "CTA present" },
  { id: "e1ec4a2a-296f-498d-b4db-a7ee34cd0b4a", label: "Brand alignment" },
  { id: "c84ffee1-c63d-4dd1-baf5-a92d5a41ad76", label: "Copyright check" },
  { id: "43a98f9d-f8c8-4a3a-ad5c-623cc406d1be", label: "Inspiration link match" },
];

// Platform option IDs for the BRIEFS table
const PLATFORM_OPTIONS = [
  { id: "25558459-6369-42f2-81ec-5948551e5b36", label: "TikTok" },
  { id: "ca31e322-1080-4d95-8172-ae73273aec9c", label: "Instagram" },
  { id: "5c83fc93-a646-4007-9c44-702c3e58fed8", label: "YouTube" },
  { id: "c308e328-5dc0-402c-93b4-0d7f7b4fc96e", label: "Facebook" },
  { id: "8d457ca8-21e3-4379-94d2-5527544eafd3", label: "Twitter/X" },
  { id: "6ad7fab3-74b1-435b-9032-f6e7a18b2c32", label: "LinkedIn" },
  { id: "2e269f77-2443-4815-82f4-151dcb1b1ed3", label: "Other" },
];

// Content Type option IDs for the BRIEFS table
const CONTENT_TYPE_OPTIONS = [
  { id: "1aa3942b-d3d8-4a94-bc66-1e26b408c657", label: "Educational" },
  { id: "ffb25a43-37c2-4ad8-bebc-92192df5fc5a", label: "Direct sales" },
  { id: "a1951d4b-f34d-408f-8c63-e2594b9ed302", label: "Testimonial" },
  { id: "cefdd1a6-db70-4454-9717-b5807ffff8ba", label: "Behind the scenes" },
  { id: "148efe00-4a01-4f32-80bf-510009adcf92", label: "Product demo" },
  { id: "cfbfd531-434f-4541-8106-15b230f8d423", label: "Unboxing" },
  { id: "b291f409-e6ce-4272-9606-bf3b9ba4d16c", label: "Tutorial" },
  { id: "eb5d95ad-0e78-4f4f-a3b3-ed73c521419c", label: "Lifestyle" },
];

// Build lookups: lowercase label -> UUID
const QA_LABEL_TO_ID = {};
QA_OPTIONS.forEach((opt) => { QA_LABEL_TO_ID[opt.label.toLowerCase()] = opt.id; });

const PLATFORM_LABEL_TO_ID = {};
PLATFORM_OPTIONS.forEach((opt) => { PLATFORM_LABEL_TO_ID[opt.label.toLowerCase()] = opt.id; });

const CONTENT_TYPE_LABEL_TO_ID = {};
CONTENT_TYPE_OPTIONS.forEach((opt) => { CONTENT_TYPE_LABEL_TO_ID[opt.label.toLowerCase()] = opt.id; });

// Fields that need label-to-UUID conversion (multi-selects)
const MULTI_SELECT_LOOKUPS = {
  qa_checklist: QA_LABEL_TO_ID,
  platform: PLATFORM_LABEL_TO_ID,
  content_type: CONTENT_TYPE_LABEL_TO_ID,
};

const DESTINATION_FIELDS = [
  { id: "name", label: "Brief Name", required: true },
  { id: "projects", label: "Project Name", required: true, isLinked: true },
  { id: "description", label: "Description", required: true },
  { id: "qa_checklist", label: "QA_Checklist", required: true },
  { id: "creator_name", label: "Creator Name", required: false },
  { id: "creator_email", label: "Creator Email", required: false },
  { id: "submission_open_date", label: "Open Date", required: false },
  { id: "submission_close_date", label: "Close Date", required: false },
  { id: "example_video_1", label: "Example Video 1", required: false },
  { id: "example_video_2", label: "Example Video 2", required: false },
  { id: "example_video_3", label: "Example Video 3", required: false },
  { id: "platform", label: "Platform", required: false },
  { id: "duration", label: "Duration", required: false },
  { id: "duration_threshold", label: "Duration Threshold", required: false },
  { id: "aspect_ratio", label: "Aspect Ratio", required: false },
  { id: "content_type", label: "Content Type", required: false },
  { id: "product_screen_time_threshold", label: "Product Screen Time", required: false },
  { id: "hook_speed_threshold", label: "Hook Timing", required: false },
  { id: "brand_mention_count_threshold", label: "Brand Mentions", required: false },
  { id: "face_time_threshold", label: "Creator Visibility", required: false },
  { id: "engagement_pacing_threshold", label: "Scene Changes", required: false },
  { id: "cta_placement_threshold", label: "CTA Timing", required: false },
  { id: "visual_hook_threshold", label: "Visual Hook", required: false },
  { id: "ai_mode", label: "AI_Mode", required: true },
  { id: "content_delivery", label: "Content_Delivery", required: false },
];

const createFields = q.select({
  name: "z3lpx",
  projects: "yrYvH",
  description: "FCBU5",
  qa_checklist: "OFoS6",
  creator_name: "oIsFn",
  creator_email: "Rogsr",
  submission_open_date: "tdVjp",
  submission_close_date: "M4hMa",
  example_video_1: "5QlsA",
  example_video_2: "1uPS0",
  example_video_3: "VyB9m",
  platform: "1lPXC",
  duration: "SleHY",
  duration_threshold: "9lwe4",
  aspect_ratio: "Z8kno",
  content_type: "EO7S4",
  product_screen_time_threshold: "7Zpeo",
  hook_speed_threshold: "CEkkg",
  brand_mention_count_threshold: "rD3qK",
  face_time_threshold: "jSDeR",
  engagement_pacing_threshold: "15284",
  cta_placement_threshold: "zo9Fo",
  visual_hook_threshold: "Drp5T",
  ai_mode: "wm1jM",
  content_delivery: "U9Cyn",
  users: "EdhwS",
  accounts: "EhzVx",
});

const linkedProjectSelect = q.select({ projectName: "yrYvH" });

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const values = []; let current = ""; let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQuotes = !inQuotes; }
      else if (line[i] === "," && !inQuotes) { values.push(current.trim()); current = ""; }
      else { current += line[i]; }
    }
    values.push(current.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    return row;
  });
  return { headers, rows };
}

// Convert semicolon-separated QA labels to array of UUIDs
function convertQaLabelsToIds(labelString) {
  if (!labelString) return [];
  const labels = labelString.split(";").map((s) => s.trim()).filter(Boolean);
  const ids = [];
  const unmatched = [];
  labels.forEach((label) => {
    const id = QA_LABEL_TO_ID[label.toLowerCase()];
    if (id) { ids.push(id); } else { unmatched.push(label); }
  });
  if (unmatched.length > 0) {
    console.log("=== v9 QA unmatched labels:", unmatched);
  }
  return ids;
}

// Convert common date formats to ISO YYYY-MM-DD
function convertToISODate(val) {
  if (!val) return val;
  const s = val.trim();
  // Already ISO: 2026-06-30
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s;
  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  let m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (m) { return m[3] + "-" + m[2].padStart(2, "0") + "-" + m[1].padStart(2, "0"); }
  // MM/DD/YYYY — try parsing with Date as fallback
  // YYYY/MM/DD
  m = s.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (m) { return m[1] + "-" + m[2].padStart(2, "0") + "-" + m[3].padStart(2, "0"); }
  // "June 30, 2026" or "30 June 2026" etc — let JS parse it
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return yyyy + "-" + mm + "-" + dd;
  }
  // Can't parse — return as-is and let Softr reject it with a clear error
  console.log("=== v10 Could not parse date:", val);
  return val;
}

const DATE_FIELDS = ["submission_open_date", "submission_close_date"];

function StepIndicator({ step }) {
  const steps = [{ num: 1, label: "Upload CSV" }, { num: 2, label: "Map Columns" }, { num: 3, label: "Review & Import" }];
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
          {i < steps.length - 1 && <div className={`w-16 h-0.5 mx-2 mb-4 transition-all ${step > s.num ? "bg-primary" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

function UploadStep({ onUpload }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const handleFile = (file) => {
    if (!file || !file.name.endsWith(".csv")) { toast.error("Please upload a valid CSV file."); return; }
    const reader = new FileReader();
    reader.onload = (e) => { const parsed = parseCSV(e.target.result); if (parsed.headers.length === 0) { toast.error("CSV appears to be empty."); return; } onUpload(parsed); };
    reader.readAsText(file);
  };
  return (
    <div className="flex flex-col items-center justify-center">
      <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }} onClick={() => inputRef.current?.click()} className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-all ${dragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50 hover:bg-muted/40"}`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${dragging ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><DownloadCloud className="w-8 h-8" /></div>
        <div className="text-center"><p className="font-semibold text-foreground text-lg">Drop your CSV file here</p><p className="text-muted-foreground text-sm mt-1">or click to browse from your computer</p></div>
        <Badge variant="secondary" className="text-xs">.csv files only</Badge>
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
      <p className="text-xs text-muted-foreground mt-4">Use semicolons to separate multi-select values in your CSV.</p>
      <a href="https://docs.google.com/spreadsheets/d/1UCrX60zuKWoN0KYqiJwaYJAjQK93LBejq1onR1ekO8E/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary underline hover:no-underline mt-2"><FileText className="w-3.5 h-3.5" />See Sample CSV File</a>
    </div>
  );
}

function MappingStep({ headers, onNext, onBack }) {
  const [mappings, setMappings] = useState(() => { const initial = {}; headers.forEach((h) => { const match = DESTINATION_FIELDS.find((f) => f.label.toLowerCase().replace(/[^a-z0-9]/g, "") === h.toLowerCase().replace(/[^a-z0-9]/g, "")); initial[h] = match ? match.id : "__skip__"; }); return initial; });
  const usedDestinations = Object.values(mappings).filter((v) => v !== "__skip__");
  const handleChange = (csvCol, destId) => { setMappings((prev) => ({ ...prev, [csvCol]: destId })); };
  const getAvailableOptions = (csvCol) => { const currentVal = mappings[csvCol]; return DESTINATION_FIELDS.filter((f) => !usedDestinations.includes(f.id) || f.id === currentVal); };
  const mappedCount = Object.values(mappings).filter((v) => v !== "__skip__").length;
  const skippedCount = Object.values(mappings).filter((v) => v === "__skip__").length;
  const requiredMapped = DESTINATION_FIELDS.filter((f) => f.required).every((f) => usedDestinations.includes(f.id));
  const missingRequired = DESTINATION_FIELDS.filter((f) => f.required && !usedDestinations.includes(f.id));
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-xl font-bold text-foreground">Map Your Columns</h2><p className="text-sm text-muted-foreground mt-0.5">Match each CSV column to a destination field, or skip it.</p></div>
        <div className="flex gap-3"><div className="text-center"><div className="text-2xl font-bold text-primary">{mappedCount}</div><div className="text-xs text-muted-foreground">Mapped</div></div><div className="w-px bg-border" /><div className="text-center"><div className="text-2xl font-bold text-muted-foreground">{skippedCount}</div><div className="text-xs text-muted-foreground">Skipped</div></div></div>
      </div>
      <div className="grid grid-cols-1 gap-2 mb-6">
        <div className="grid grid-cols-[1fr_40px_1fr] gap-2 px-3 py-1"><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CSV Column</span><span /><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Destination Field</span></div>
        {headers.map((header) => { const destId = mappings[header]; const isMapped = destId !== "__skip__"; return (
          <div key={header} className={`grid grid-cols-[1fr_40px_1fr] gap-2 items-center p-3 rounded-xl border transition-all ${isMapped ? "bg-card border-border" : "bg-muted/30 border-dashed border-border/50"}`}>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isMapped ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}><FileText className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{header}</span></div>
            <div className="flex items-center justify-center"><ArrowRight className={`w-4 h-4 transition-all ${isMapped ? "text-primary" : "text-muted-foreground/30"}`} /></div>
            <Select value={destId} onValueChange={(val) => handleChange(header, val)}><SelectTrigger className={`text-sm ${isMapped ? "border-primary/30 bg-primary/5" : "border-dashed"}`}><SelectValue placeholder="Select destination..." /></SelectTrigger><SelectContent><SelectItem value="__skip__"><span className="text-muted-foreground italic">-- Skip this column --</span></SelectItem>{getAvailableOptions(header).map((f) => (<SelectItem key={f.id} value={f.id}><span className="flex items-center gap-2">{f.label}{f.required && <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">Required</Badge>}</span></SelectItem>))}</SelectContent></Select>
          </div>); })}
      </div>
      {!requiredMapped && (<div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4"><AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" /><div className="text-sm text-destructive"><span className="font-semibold">Missing required fields: </span>{missingRequired.map((f) => f.label).join(", ")}</div></div>)}
      <div className="flex justify-between"><Button variant="outline" onClick={onBack}>Back</Button><Button onClick={() => onNext(mappings)} disabled={!requiredMapped}>Continue to Review <ChevronRight className="w-4 h-4 ml-1" /></Button></div>
    </div>
  );
}

function ReviewStep({ rows, mappings, onBack }) {
  const [rowStates, setRowStates] = useState(() => rows.map(() => "pending"));
  const [importing, setImporting] = useState(false);
  const [importedIds, setImportedIds] = useState(new Set());

  const user = useCurrentUser();

  const createRecord = useRecordCreate({ fields: createFields });

  const { data: linkedProjectData } = useLinkedRecords({ select: createFields, field: "projects", count: 100 });
  const linkedProjects = linkedProjectData?.pages.flatMap((p) => p.items) ?? [];

  const buildFieldsFromRow = (row) => {
    const fields = {};

    // Hidden fields - matching working form pattern
    // users: single string from useCurrentUser
    fields.users = user?.id || null;
    // accounts: NOT sent - let Softr auto-assign based on logged-in user
    
    console.log("=== v10 Hidden: userId:", user?.id, "(no account sent)");

    Object.entries(mappings).forEach(([csvCol, aliasName]) => {
      if (aliasName === "__skip__") return;
      const val = row[csvCol];
      if (!val) return;

      if (aliasName === "projects") {
        // Linked record - match by title, send as array with id object
        const match = linkedProjects.find((o) => o.title.toLowerCase() === val.toLowerCase());
        console.log("=== v10 Project:", val, "=>", match ? match.id : "NO MATCH");
        if (match) fields.projects = [{ id: match.id }];
      } else if (MULTI_SELECT_LOOKUPS[aliasName]) {
        // Multi-select field — convert semicolon labels to UUID array
        const lookup = MULTI_SELECT_LOOKUPS[aliasName];
        const labels = val.split(";").map((s) => s.trim()).filter(Boolean);
        const ids = [];
        const unmatched = [];
        labels.forEach((label) => {
          const id = lookup[label.toLowerCase()];
          if (id) { ids.push(id); } else { unmatched.push(label); }
        });
        if (unmatched.length > 0) { console.log("=== v10", aliasName, "unmatched:", unmatched); }
        console.log("=== v10", aliasName + ":", ids.length, "matched from", labels.length, "labels");
        if (ids.length > 0) fields[aliasName] = ids;
      } else {
        // Convert dates if needed
        if (DATE_FIELDS.includes(aliasName)) {
          fields[aliasName] = convertToISODate(val);
        } else {
          fields[aliasName] = val;
        }
      }
    });

    console.log("=== v10 Final fields ===", JSON.stringify(fields));
    return fields;
  };

  const toggleRow = (i, state) => { setRowStates((prev) => { const next = [...prev]; next[i] = state; return next; }); };
  const acceptedRows = rows.filter((_, i) => rowStates[i] === "pending");
  const rejectedCount = rowStates.filter((s) => s === "rejected").length;

  const importRow = async (row, i) => {
    if (!createRecord.enabled) { toast.error("Import not available."); return; }
    if (!user?.id) { toast.error("User not detected. Please log in."); return; }
    const fields = buildFieldsFromRow(row);
    try { await createRecord.mutateAsync(fields); setImportedIds((prev) => new Set([...prev, i])); toast.success("Row " + (i + 1) + " imported!"); }
    catch (e) { toast.error("Row " + (i + 1) + " failed", { description: e.message || "Unknown error" }); }
  };

  const importAll = async () => {
    if (!user?.id) { toast.error("User not detected. Please log in."); return; }
    setImporting(true); let success = 0; let fail = 0;
    for (let i = 0; i < rows.length; i++) {
      if (rowStates[i] === "rejected" || importedIds.has(i)) continue;
      const fields = buildFieldsFromRow(rows[i]);
      try { await createRecord.mutateAsync(fields); setImportedIds((prev) => new Set([...prev, i])); success++; }
      catch (e) { fail++; toast.error("Row " + (i + 1) + " failed", { description: e.message || "Unknown error" }); }
    }
    setImporting(false);
    if (success > 0) toast.success(success + " brief" + (success > 1 ? "s" : "") + " imported!");
    if (fail > 0) toast.error(fail + " row" + (fail > 1 ? "s" : "") + " failed.");
  };

  const mappedHeaders = Object.entries(mappings).filter(([, v]) => v !== "__skip__");
  const getLabel = (aliasName) => DESTINATION_FIELDS.find((f) => f.id === aliasName)?.label || aliasName;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Review Records</h2>
          <p className="text-sm text-muted-foreground mt-0.5"><span className="text-primary font-medium">{acceptedRows.length} to import</span>{rejectedCount > 0 && <span className="text-muted-foreground"> | {rejectedCount} rejected</span>}{importedIds.size > 0 && <span className="text-green-600 font-medium"> | {importedIds.size} done</span>}</p>
          {!user?.id && <p className="text-xs text-destructive mt-1 font-medium">Warning: User not detected. Please log in.</p>}
          {user?.id && <p className="text-xs text-green-600 mt-1">Logged in as {user.fullName || user.email}</p>}
        </div>
        <div className="flex gap-2"><Button variant="outline" onClick={onBack} size="sm">Back</Button><Button onClick={importAll} disabled={importing || acceptedRows.length === 0 || !createRecord.enabled || !user?.id} size="sm">{importing ? "Importing..." : "Import All (" + acceptedRows.length + ")"}</Button></div>
      </div>
      <div className="rounded-xl border overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-muted/60 border-b"><th className="text-left px-4 py-3 font-semibold text-muted-foreground w-10">#</th>{mappedHeaders.map(([csvCol, destId]) => (<th key={csvCol} className="text-left px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap"><div className="flex flex-col gap-0.5"><span className="text-foreground">{getLabel(destId)}</span><span className="text-[10px] font-normal text-muted-foreground/70">from {csvCol}</span></div></th>))}<th className="text-center px-4 py-3 font-semibold text-muted-foreground w-32">Status</th><th className="text-center px-4 py-3 font-semibold text-muted-foreground w-28">Actions</th></tr></thead>
        <tbody>{rows.map((row, i) => { const state = rowStates[i]; const imported = importedIds.has(i); return (
          <tr key={i} className={`border-b last:border-0 transition-all ${state === "rejected" ? "opacity-40 bg-muted/20" : imported ? "bg-green-50/50" : "hover:bg-muted/20"}`}>
            <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{i + 1}</td>
            {mappedHeaders.map(([csvCol]) => (<td key={csvCol} className="px-4 py-3 max-w-[180px]"><span className="truncate block text-foreground">{row[csvCol] || <span className="text-muted-foreground/40 italic">-</span>}</span></td>))}
            <td className="px-4 py-3 text-center">{imported ? <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Imported</Badge> : state === "rejected" ? <Badge variant="destructive" className="text-xs">Rejected</Badge> : <Badge variant="secondary" className="text-xs">Pending</Badge>}</td>
            <td className="px-4 py-3">{!imported && (<div className="flex items-center justify-center gap-1.5">{state !== "rejected" && (<><button onClick={() => importRow(row, i)} disabled={importing || !createRecord.enabled || !user?.id} className="w-7 h-7 rounded-full bg-green-100 hover:bg-green-200 text-green-700 flex items-center justify-center transition-all disabled:opacity-50" title="Import"><Check className="w-3.5 h-3.5" /></button><button onClick={() => toggleRow(i, "rejected")} className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-all" title="Reject"><X className="w-3.5 h-3.5" /></button></>)}{state === "rejected" && <button onClick={() => toggleRow(i, "pending")} className="text-xs text-primary underline hover:no-underline">Restore</button>}</div>)}</td>
          </tr>); })}</tbody></table></div></div>
    </div>
  );
}

export default function Block() {
  const [step, setStep] = useState(1);
  const [csvData, setCsvData] = useState(null);
  const [mappings, setMappings] = useState(null);
  return (
    <div className="container py-10"><div className="content">
      <div className="mb-8"><h1 className="text-2xl font-bold text-foreground">Bulk Import Briefs</h1><p className="text-muted-foreground mt-1">Upload a CSV file to create multiple briefs at once.</p></div>
      <StepIndicator step={step} />
      {step === 1 && <UploadStep onUpload={(parsed) => { setCsvData(parsed); setStep(2); }} />}
      {step === 2 && csvData && <MappingStep headers={csvData.headers} onNext={(m) => { setMappings(m); setStep(3); }} onBack={() => setStep(1)} />}
      {step === 3 && csvData && mappings && <ReviewStep rows={csvData.rows} mappings={mappings} onBack={() => setStep(2)} />}
    </div></div>
  );
}
