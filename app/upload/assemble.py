# Builds app/upload/index from upload.src.jsx + the shared engine.
# Mirrors app/live/submissions/assemble.py; the only extras are the
# `logic` field this page has always written on its submissions rows.
import re
HERE = "/Users/beverlybanahene/Claude Code/Brieflee/brieflee-softr-code-blocks"
live = open(f"{HERE}/app/upload/upload.src.jsx", encoding="utf-8").read()
eng = open(f"{HERE}/app/video-analysis/engine.jsx", encoding="utf-8").read()
s = live

def once(text, marker):
    n = text.count(marker); assert n == 1, f"{marker[:70]!r} found {n}x"
    return text.index(marker)

# ── engine module ──
m0 = once(eng, "// ─── Page ──"); m1 = once(eng, "export default function Block() {")
module = eng[m0:m1]
module = re.sub(r"const ds = datasource\.define\(\{.*?\}\);\n", "", module, count=1, flags=re.S)
module = re.sub(r"(\n// =+\n// Block\n// =+\n)$", "\n", module)
module = module.replace('const PAGE = "review";', 'const PAGE = "upload";', 1)
module = re.sub(r"\bunwrap\(", "unwrapE(", module)
module = re.sub(r"\bfunction unwrap\b", "function unwrapE", module)
module = re.sub(r"\bisDirectVideoUrl\b", "isDirectVideoUrlE", module)
# this page writes `logic` on every submissions row; the engine's map has no slot
# accounts.logo_url is a FORMULA that never returns blank, so the uploaded
# logo has to be selected too or it can never be reached.
_lu = '  logoUrl:         "nPI65",\n'
assert module.count(_lu) == 1, "accountSelect logoUrl line moved"
module = module.replace(_lu, _lu + '  logo:            "q1B5K",\n', 1)

# A public page should pull no more of the brand than the review needs.
# These four are read nowhere in this block.
for _dead in ('  status:          "9Cdqq",\n', '  plan:            "YluGd",\n',
              '  cycleEnd:        "eaa3X",\n', '  maxVideos:       "cNlUS",\n'):
    assert module.count(_dead) == 1, f"accountSelect trim missed {_dead!r}"
    module = module.replace(_dead, "", 1)

module = module.replace('  reviews:            "kdfMm",\n});',
                        '  reviews:            "kdfMm",\n  logic:              "3uQTp",\n});', 1)
assert "__ENGINE_MODULE__" in s
s = s.replace("// __ENGINE_MODULE__", """// =====================================================================
// The engine (verbatim from app/video-analysis/engine.jsx, PAGE upload):
// field maps, option ids, Review Agents, prompts, Cloudinary, Gemini,
// the writes, notifications and EmailIt. Its unwrap and isDirectVideoUrl
// carry an E suffix because this page has its own. Only what this block
// uses survives the prune below.
// =====================================================================
""" + module, 1)

# ── pipeline chunk ──
p0 = once(eng, "  // ── Gemini video part (inline base64, sized for the proxy) ───")
p1 = once(eng, "  const reset = () => {")
pl = eng[p0:p1].rstrip() + "\n"

def prep(old, new):
    global pl
    n = pl.count(old); assert n == 1, f"pipeline: expected 1 for {old[:60]!r}, found {n}"
    pl = pl.replace(old, new)

prep('''  async function runPipeline(item, myRun, ui) {
    const alive = () => runRef.current === myRun;''',
'''  async function runPipeline(item, myRun, ui, ctx) {
    // Per-video settings from the submit queue.
    const { agents, briefId, brief, notes, pdf, creatorName, creatorEmail } = ctx;
    const aiModeLabel = unwrapE(brief?.aiMode) || unwrapE(af?.aiMode) || "Hybrid";
    const alive = () => runRef.current === myRun;''')
prep('''    let mp4 = ""; let handle = ""; let duration = 0; let uploaded = null; let pdfUploaded = null;''',
     '''    let mp4 = ""; let handle = ""; let duration = 0; let uploaded = item.uploaded || null; let pdfUploaded = ctx.pdfUploaded || null;''')
prep('''    if (isFile) {
      const [up] = await uploadAsync(theFile);
      if (!up || up.status !== "completed" || !up.url) throw new Error("The video upload didn't complete. Try again.");
      uploaded = { filename: up.file?.name || theFile.name || "video.mp4", url: up.url };''',
'''    if (isFile) {
      if (!uploaded) {
        const [up] = await uploadAsync(theFile);
        if (!up || up.status !== "completed" || !up.url) throw new Error("The video upload didn't complete. Try again.");
        uploaded = { filename: up.file?.name || theFile.name || "video.mp4", url: up.url };
      }''')
prep('''        form.append("file", isFile ? theFile : mp4);''',
     '''        form.append("file", isFile && theFile ? theFile : (mp4 || uploaded?.url || ""));''')
# keep the field this page has always stamped so bulk rows stay identifiable
# this page never creates a revision, so every row it writes is revision 0,
# exactly as the block did before the engine owned this write
prep("""      revisionNumber: context === "submission" ? (OPT.revision[revisionNo] || OPT.revision[10]) : null,""",
     """      revisionNumber: OPT.revision[revisionNo] || OPT.revision[0],""")
# one "we have your video" mail for the batch, not one per video
prep("""    if (sendsEmail && creatorEmailFinal) await send("bl-sub-received-creator", creatorEmailFinal);""",
     """    if (sendsEmail && creatorEmailFinal && !ctx.bulk) await send("bl-sub-received-creator", creatorEmailFinal);""")
prep('''      isBulk: !!multi,
    };''',
     '''      isBulk: !!multi,
      logic: LOGIC_BULK_UPLOAD,
    };''')
pl = re.sub(r"\bunwrap\(", "unwrapE(", pl)
pl = re.sub(r"\bisDirectVideoUrl\(", "isDirectVideoUrlE(", pl)
assert "__ENGINE_PIPELINE__" in s
s = s.replace("  // __ENGINE_PIPELINE__", pl, 1)

# ── prune unused top-level declarations (comment-safe) ──
def code_only(t):
    t = re.sub(r"\{/\*.*?\*/\}", "", t)
    return "\n".join(l for l in t.split("\n") if not l.lstrip().startswith("//"))
decl_re = re.compile(r"^(?:const|let|var|function|async function) ([A-Za-z_$][\w$]*)", re.M)
removed = []
while True:
    lines = s.split("\n")
    starts = [(i, m.group(1)) for i, l in enumerate(lines) for m in [decl_re.match(l)] if m and not l.startswith("export")]
    bounds = [i for i, l in enumerate(lines) if l and not l[0].isspace() and not l.startswith("}") and not l.startswith(")") and not l.startswith("]") and not l.startswith("`")]
    co = code_only(s)
    victim = next(((i, n) for i, n in starts if len(re.findall(r"\b" + re.escape(n) + r"\b", co)) <= 1), None)
    if not victim: break
    i, name = victim
    nxt = min([b for b in bounds if b > i], default=len(lines))
    end = nxt
    while end - 1 > i and (lines[end - 1].strip() == "" or lines[end - 1].lstrip().startswith("//")): end -= 1
    del lines[i:end]; removed.append(name); s = "\n".join(lines)
s = re.sub(r"\n{4,}", "\n\n\n", s)

open(f"{HERE}/app/upload/index", "w", encoding="utf-8").write(s)
print("bytes:", len(s.encode("utf-8")))
print("removed:", ", ".join(removed))
co = code_only(s)
for m in ["function unwrapE(", "async function runPipeline(", "const submissionCreate =", "const reviewCreate =",
          "const reportCreate =", "const notificationCreate =", "const accountSelect =", "const briefSelect =",
          "const pageBriefSelect =", "const memberCreateFields =", "LOGIC_BULK_UPLOAD", "const PAGE ="]:
    print("  %-32s %d" % (m, s.count(m)))
imp = re.findall(r"import \{([^}]+)\} from", s)
names = [n.strip() for grp in imp for n in grp.split(",") if n.strip()]
for n in names:
    c = len(re.findall(r"\b" + re.escape(n) + r"\b", co))
    if c < 2: print("IMPORT UNUSED?", n, c)
