// =====================================================================
// Vibe Coding block: How the readiness quiz works
// =====================================================================
// Sits below the benchmarks. Three-step explainer of the quiz flow.
// Matches the "How it works" pattern used across the other lead magnets.
//
// SOFTR UI SETUP:
//   1. Source tab → (none — pure content block)
//   2. Visibility tab → public
// =====================================================================

const NAVY = "#001364";

const STEPS = [
  {
    n: "1",
    title: "Answer 6 questions",
    body: "Tell us how you're running paid: platform, monthly creative volume, creator roster, approval cycle, and rejection rate. Takes 2 minutes.",
  },
  {
    n: "2",
    title: "Get a personalised score",
    body: "Your operation gets scored against the benchmarks high-performing brands are hitting under Andromeda. Overall score plus a category-by-category breakdown.",
  },
  {
    n: "3",
    title: "See what to fix",
    body: "Each category comes with a tailored response: what's working, what's blocking your output, and where you'd see the biggest lift. Export to CSV if you want to share.",
  },
];

export default function Block() {
  return (
    <div className="relative w-full">
      <div className="container py-14 md:py-20">
        <div className="content max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1]" style={{ color: NAVY }}>
              How it works
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
                  {s.n}
                </div>
                <h3 className="text-base font-bold text-foreground mb-2" style={{ color: NAVY }}>{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
