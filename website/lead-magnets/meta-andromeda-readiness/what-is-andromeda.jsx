// =====================================================================
// Vibe Coding block: What is Meta Andromeda? (explainer)
// =====================================================================
// Drop into a Softr Vibe Coding block on /facebook-creative-calculator,
// directly below the hero/quiz block. Educational long-form content —
// drives SEO and warms cold visitors before they hit the quiz.
//
// Voice is plain-English, Reddit-explainer style. No jargon, no
// marketing-speak. Every section ends with the practical takeaway.
//
// SOFTR UI SETUP:
//   1. Source tab → (none — this block has no data dependency)
//   2. Visibility tab → public
// =====================================================================

import { CheckCircle2, AlertTriangle, Zap } from "lucide-react";

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";

export default function Block() {
  return (
    <div className="relative w-full bg-muted/20 border-y border-border">
      <div className="container py-14 md:py-20">
        <div className="content max-w-3xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-10 md:mb-14">
            <div
              className="inline-flex items-center mb-5"
              style={{
                gap: 10,
                padding: "8px 16px",
                background: "rgba(135,156,247,0.16)",
                color: NAVY,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                borderRadius: 999,
              }}
            >
              The shift
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]" style={{ color: NAVY }}>
              What is Meta Andromeda?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mt-4 leading-relaxed">
              Plain English, no rocket science. Here's what actually changed and what you have to do about it.
            </p>
          </div>

          {/* Body — 4 sections */}
          <div className="space-y-10">

            <section>
              <h3 className="text-xl md:text-2xl font-bold mb-3" style={{ color: NAVY }}>
                It's just a tech upgrade.
              </h3>
              <p className="text-base text-foreground leading-relaxed">
                Andromeda is Meta's ad-ranking engine. Hardware, software, machine learning, mixed together. The MTIA chip, NVIDIA Grace Hopper, transformer models. Interesting if you're an engineer, irrelevant if you're a marketer. The real story is what Andromeda decides to do with the signals it now has.
              </p>
            </section>

            <section>
              <h3 className="text-xl md:text-2xl font-bold mb-3" style={{ color: NAVY }}>
                Before Andromeda, Meta was shallow.
              </h3>
              <p className="text-base text-foreground leading-relaxed mb-3">
                You looked at shoe ads, clicked on a shoe page, liked some shoe content. Meta concluded: "this person likes shoes." That was the whole logic.
              </p>
              <p className="text-base text-foreground leading-relaxed">
                Targeting an audience meant telling Meta "find me people who like shoes," and Meta would do its best.
              </p>
            </section>

            <section>
              <h3 className="text-xl md:text-2xl font-bold mb-3" style={{ color: NAVY }}>
                After Andromeda, Meta watches everything.
              </h3>
              <p className="text-base text-foreground leading-relaxed mb-4">
                Andromeda doesn't just notice that you like shoes. It notices:
              </p>
              <ul className="space-y-2 text-base text-foreground leading-relaxed">
                <li className="flex gap-3"><span className="text-primary font-bold shrink-0">•</span> what colour shoes make you stop scrolling</li>
                <li className="flex gap-3"><span className="text-primary font-bold shrink-0">•</span> which design slows your thumb down</li>
                <li className="flex gap-3"><span className="text-primary font-bold shrink-0">•</span> when you're browsing vs. when you actually buy</li>
                <li className="flex gap-3"><span className="text-primary font-bold shrink-0">•</span> whether you respond to video or static, emotional or funny, realistic or aspirational</li>
                <li className="flex gap-3"><span className="text-primary font-bold shrink-0">•</span> whether you're shopping from your sofa at 11pm, your desk at 11am, or your commute at 8am</li>
              </ul>
              <p className="text-base text-foreground leading-relaxed mt-4">
                Meta now builds a full behavioural pattern of every single user. Every scroll, every pause, every purchase, connected.
              </p>
            </section>

            <section>
              <h3 className="text-xl md:text-2xl font-bold mb-3" style={{ color: NAVY }}>
                Targeting moved out of the adset.<br />It lives in your creative now.
              </h3>
              <p className="text-base text-foreground leading-relaxed mb-3">
                This is the part most teams miss. Meta isn't matching adsets to audiences anymore. It's matching <span className="font-bold">creatives</span> to audiences. The audience signal Meta cares about is no longer your targeting box. It's the variations inside the creative itself.
              </p>
              <p className="text-base text-foreground leading-relaxed">
                Your creative decides who sees your ad. Not your adset.
              </p>
            </section>

            {/* Help / Hurt callout */}
            <section className="grid md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-2xl p-6 border-2" style={{ borderColor: "rgba(34,197,94,0.4)", background: "rgba(34,197,94,0.06)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h4 className="font-bold text-foreground">Andromeda helps you when…</h4>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  You're producing many variations: different angles, formats, personas, contexts. The algorithm has options to test, and matches the right creative to the right person.
                </p>
              </div>
              <div className="rounded-2xl p-6 border-2" style={{ borderColor: "rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.06)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h4 className="font-bold text-foreground">Andromeda hurts you when…</h4>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  You're producing a handful of similar creatives. Meta has nothing to match against, the algorithm can't do its job, and your ads underperform.
                </p>
              </div>
            </section>

            {/* What you need to do */}
            <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="text-xl md:text-2xl font-bold" style={{ color: NAVY }}>What you have to do</h3>
              </div>
              <p className="text-base text-foreground leading-relaxed mb-5">
                Stop trying to find the audience. Start producing the variations. Meta does the matching.
              </p>

              <div className="space-y-4 text-sm text-foreground">
                <div>
                  <div className="font-bold mb-1.5" style={{ color: NAVY }}>Different angles</div>
                  <p className="text-muted-foreground leading-relaxed">Problem / solution. Storyline. Pain point. Testimonial. Emotional. Humour. Product demo. Comparison.</p>
                </div>
                <div>
                  <div className="font-bold mb-1.5" style={{ color: NAVY }}>Different formats</div>
                  <p className="text-muted-foreground leading-relaxed">Reels. Static. Carousel. Collection ads. Long video. UGC clips.</p>
                </div>
                <div>
                  <div className="font-bold mb-1.5" style={{ color: NAVY }}>Different personas</div>
                  <p className="text-muted-foreground leading-relaxed">A parent. A student. A working professional. A gift-buyer. A home-decorator. Each gets a different framing.</p>
                </div>
                <div>
                  <div className="font-bold mb-1.5" style={{ color: NAVY }}>Different contexts</div>
                  <p className="text-muted-foreground leading-relaxed">Seasonal. Festival. Family moment. Urgent purchase. Gifting. The context inside the creative is now a targeting signal.</p>
                </div>
              </div>
            </section>

            {/* One-line summary */}
            <section className="text-center pt-4">
              <p
                className="inline-block text-base md:text-lg font-semibold leading-relaxed px-6 py-4 rounded-2xl"
                style={{ background: "rgba(135,156,247,0.16)", color: NAVY }}
              >
                Multi-variation content = Andromeda is your best ad buyer.<br />
                One-note content = Andromeda quietly kills your spend.
              </p>
            </section>

            <p className="text-sm text-muted-foreground text-center leading-relaxed pt-2">
              Note: retargeting is the one exception. Returning visitors already know your product, so message consistency wins there. Andromeda's variation rule applies to prospecting.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
