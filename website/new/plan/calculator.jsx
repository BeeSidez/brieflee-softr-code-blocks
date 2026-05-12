// Marketing site — PLAN CALCULATOR (anonymous, sits below plan-trial /
// plan-marketing on the pricing page).
//
// Reads from the "Pricing" table in the Brieflee website database. Each
// row in that table represents a dimension of one of the plans, grouped
// by the `Plan` SELECT field:
//   - Plan = "Price"     → name is "Monthly" or "Yearly"; the four <tier>Price
//                          fields hold the price for that interval.
//   - Plan = "Team"      → name is a capacity dimension (Seats, Workspace);
//                          the four <tier>Allowance fields hold the limit.
//   - Plan = "Creative"  → name is a usage dimension (Video Reviews,
//                          Storage, Max Video Length); allowance same shape.
//   - Plan = "Campaigns" → name is a product feature (Asset Collect, AI
//                          Script Generator, etc.); the four <tier>Features
//                          booleans say which plans include it.
//   - Plan = "Support"   → name is a support tier (Priority, Dedicated etc.);
//                          features booleans same shape.
//   - Plan = "Demo"      → placeholder, ignored.
//
// User picks slider values + feature toggles + monthly/yearly. We
// recommend the cheapest plan whose allowances cover every slider and
// whose features include every selected feature. CTA goes to
// /sign-up?plan=<tier>&interval=<interval> — matching plan-trial.

import { useState, useMemo, useCallback } from "react";
import { useRecords, q } from "@/lib/datasource";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Info, ArrowRight, Sparkles } from "lucide-react";

// ─── Field map (Pricing table — Brieflee website DB) ──────────────
const select = q.select({
  rowName:             "t1EWr", // primary — required
  info:                "oJ7KX",
  plan:                "5wri1", // SELECT: Price / Team / Creative / Campaigns / Support / Demo
  creatorPrice:        "cKJyw",
  crewPrice:           "5B2Qw",
  studioPrice:         "0bMFx",
  enterprisePrice:     "t7Tyx",
  creatorAllowance:    "cxLuD",
  crewAllowance:       "HXcl5",
  studioAllowance:     "C2v1s",
  enterpriseAllowance: "moKRF",
  creatorFeatures:     "0Ud8K",
  crewFeatures:        "htgai",
  studioFeatures:      "ChJfz",
  enterpriseFeatures:  "90Ikq",
});

const SIGNUP_URL = "/sign-up";

// Maps row names (from the `name` field) to slider config. Anything not
// in this map but with allowance values still becomes a slider with
// auto-derived bounds; this just gives the well-known dimensions a nice
// label, unit, step, AND an enterpriseMax so the slider extends past
// Studio's limit into Enterprise territory. When the user picks past
// the largest non-Enterprise allowance, the recommendation logic falls
// through to Enterprise automatically.
const SLIDER_CONFIG = {
  "Seats":            { label: "Team members",       summary: "Team",        unit: "users",   step: 1,  enterpriseMax: 50 },
  "Workspace":        { label: "Brand workspaces",   summary: "Workspaces",  unit: "spaces",  step: 1,  enterpriseMax: 30 },
  "Video Reviews":    { label: "Video reviews / mo", summary: "Reviews/mo",  unit: "videos",  step: 50, enterpriseMax: 2000 },
  "Storage":          { label: "Storage",            summary: "Storage",     unit: "GB",      step: 10, enterpriseMax: 500 },
  "Max Video Length": { label: "Max video length",   summary: "Max length",  unit: "min",     step: 1,  enterpriseMax: 30 },
};

const TIER_ORDER = ["Creator", "Crew", "Studio", "Enterprise"];

// ─── Helpers ──────────────────────────────────────────────────────
function pickField(fields, ...keys) {
  for (const k of keys) {
    if (fields?.[k] !== undefined) return fields[k];
  }
  return undefined;
}

function asLabel(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0]?.label ?? "";
  return v.label ?? "";
}

function isTrue(v) {
  return v === true || v === "true" || v === 1;
}

// Returns a finite number, Infinity for "Custom"/"Unlimited", or null.
function parseAllowance(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v;
  const s = String(v).toLowerCase();
  if (s.includes("unlimited") || s.includes("custom") || s.includes("∞")) return Infinity;
  const m = s.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

function parseTable(records) {
  const plans = {
    Creator:    { priceMonthly: null, priceYearly: null, limits: {}, features: new Set(), isCustom: false },
    Crew:       { priceMonthly: null, priceYearly: null, limits: {}, features: new Set(), isCustom: false },
    Studio:     { priceMonthly: null, priceYearly: null, limits: {}, features: new Set(), isCustom: false },
    Enterprise: { priceMonthly: null, priceYearly: null, limits: {}, features: new Set(), isCustom: true  },
  };
  const sliderRows = [];     // [{ key, label, summary, unit, step, min, max, default }]
  const featureRows = [];    // [{ key, label, info }]

  for (const r of records) {
    const f = r?.fields || {};
    const name = String(pickField(f, "rowName", "name", "t1EWr") || "").trim();
    const planLabel = asLabel(pickField(f, "plan", "5wri1"));
    if (!name || planLabel === "Demo") continue;

    const cAllow = parseAllowance(pickField(f, "creatorAllowance", "cxLuD"));
    const crAllow = parseAllowance(pickField(f, "crewAllowance", "HXcl5"));
    const sAllow = parseAllowance(pickField(f, "studioAllowance", "C2v1s"));
    const eAllow = parseAllowance(pickField(f, "enterpriseAllowance", "moKRF"));

    const cPrice = pickField(f, "creatorPrice", "cKJyw");
    const crPrice = pickField(f, "crewPrice", "5B2Qw");
    const sPrice = pickField(f, "studioPrice", "0bMFx");
    // ePrice intentionally ignored — Enterprise stays Custom

    const cFeat = isTrue(pickField(f, "creatorFeatures", "0Ud8K"));
    const crFeat = isTrue(pickField(f, "crewFeatures", "htgai"));
    const sFeat = isTrue(pickField(f, "studioFeatures", "ChJfz"));
    const eFeat = isTrue(pickField(f, "enterpriseFeatures", "90Ikq"));

    // Price row
    if (planLabel === "Price") {
      const isYearly = name.toLowerCase().includes("year");
      const key = isYearly ? "priceYearly" : "priceMonthly";
      if (typeof cPrice === "number") plans.Creator[key] = cPrice;
      if (typeof crPrice === "number") plans.Crew[key] = crPrice;
      if (typeof sPrice === "number") plans.Studio[key] = sPrice;
      continue;
    }

    // Allowance row → slider (if it has any numeric allowance)
    const allowances = [cAllow, crAllow, sAllow].filter((x) => x !== null);
    const numericAllowances = allowances.filter((x) => Number.isFinite(x));
    if (numericAllowances.length > 0) {
      const cfg = SLIDER_CONFIG[name] || {
        label: name,
        summary: name,
        unit: "",
        step: 1,
      };
      const min = Math.min(...numericAllowances);
      const studioMax = Math.max(...numericAllowances);
      const max = cfg.enterpriseMax || studioMax;
      sliderRows.push({
        key: name,
        label: cfg.label,
        summary: cfg.summary,
        unit: cfg.unit,
        step: cfg.step,
        min,
        max,
        default: min,
      });
      if (cAllow !== null) plans.Creator.limits[name] = cAllow;
      if (crAllow !== null) plans.Crew.limits[name] = crAllow;
      if (sAllow !== null) plans.Studio.limits[name] = sAllow;
      plans.Enterprise.limits[name] = eAllow !== null ? eAllow : Infinity;
    }

    // Feature row → only useful as a toggle when it varies across plans
    const featBools = [cFeat, crFeat, sFeat, eFeat];
    const anyTrue = featBools.some(Boolean);
    const allTrue = featBools.every(Boolean);
    if (anyTrue && !allTrue) {
      const key = name;
      const info = pickField(f, "info", "oJ7KX");
      featureRows.push({ key, label: name, info: typeof info === "string" ? info : "" });
      if (cFeat) plans.Creator.features.add(key);
      if (crFeat) plans.Crew.features.add(key);
      if (sFeat) plans.Studio.features.add(key);
      if (eFeat) plans.Enterprise.features.add(key);
    }
  }

  return { plans, sliderRows, featureRows };
}

// ─── Block ────────────────────────────────────────────────────────
export default function Block() {
  const [billingInterval, setBillingInterval] = useState("Yearly");
  const [sliderValues, setSliderValues] = useState({});
  const [selectedFeatures, setSelectedFeatures] = useState(new Set());

  const { data, status } = useRecords({ select, count: 100 });
  const records = useMemo(
    () => data?.pages?.flatMap((p) => p?.items ?? []) ?? [],
    [data],
  );
  const { plans, sliderRows, featureRows } = useMemo(
    () => parseTable(records),
    [records],
  );

  const updateSlider = useCallback((key, value) => {
    setSliderValues((prev) => ({ ...prev, [key]: value }));
  }, []);
  const toggleFeature = useCallback((key) => {
    setSelectedFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Pick cheapest tier whose allowances cover every slider AND whose
  // features include every selected feature. Falls back to Enterprise.
  const recommendedTier = useMemo(() => {
    for (const tier of TIER_ORDER) {
      const p = plans[tier];
      if (!p) continue;
      const slidersOk = sliderRows.every((s) => {
        const need = sliderValues[s.key] ?? s.default;
        const limit = p.limits[s.key];
        if (limit === undefined || limit === null) return true;
        return limit === Infinity || limit >= need;
      });
      const featuresOk = [...selectedFeatures].every((f) => p.features.has(f));
      if (slidersOk && featuresOk) return tier;
    }
    return "Enterprise";
  }, [plans, sliderRows, sliderValues, selectedFeatures]);
  const recommended = plans[recommendedTier] || plans.Enterprise;

  const formatPrice = (tier) => {
    if (recommended.isCustom) return "Custom";
    const p = plans[tier];
    if (!p) return "—";
    const monthly = billingInterval === "Yearly" ? p.priceYearly : p.priceMonthly;
    if (typeof monthly !== "number") return "Custom";
    return `$${monthly}`;
  };

  const formatLimit = (sliderKey, value) => {
    if (value === Infinity) return "Custom";
    if (value === null || value === undefined) return "—";
    const cfg = SLIDER_CONFIG[sliderKey];
    const unit = cfg?.unit;
    return unit ? `${value.toLocaleString()} ${unit}` : value.toLocaleString();
  };

  const handleContinue = () => {
    if (recommended.isCustom) {
      window.location.href = "/book-a-demo";
      return;
    }
    const tier = recommendedTier.toLowerCase();
    const interval = billingInterval.toLowerCase();
    window.location.href = `${SIGNUP_URL}?plan=${tier}&interval=${interval}`;
  };

  if (status === "pending") {
    return (
      <div className="container py-12 md:py-20">
        <div className="content flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading pricing…</p>
        </div>
      </div>
    );
  }

  if (status === "error" || sliderRows.length === 0) {
    return (
      <div className="container py-12 md:py-20">
        <div className="content flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Couldn't load pricing right now. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Style />
      <div className="bl-calc container py-12 md:py-20">
        <div className="content">
          <div className="text-center mb-10">
            <h2 className="bl-calc-title">Find your plan</h2>
            <p className="bl-calc-sub">
              Pick what you need and we'll point you at the cheapest plan that fits.
            </p>
            <div className="bl-calc-toggle">
              {["Monthly", "Yearly"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setBillingInterval(opt)}
                  className={`bl-calc-toggle-btn ${billingInterval === opt ? "is-active" : ""}`}
                  type="button"
                >
                  {opt}
                  {opt === "Yearly" && <span className="bl-calc-toggle-pill">Save</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_minmax(280px,360px)] gap-8 md:gap-12 items-start">
            {/* ── Controls ── */}
            <div className="space-y-8">
              {sliderRows.map((s) => {
                const value = sliderValues[s.key] ?? s.default;
                return (
                  <div key={s.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="bl-calc-label">{s.label}</Label>
                      <span className="bl-calc-value">{formatLimit(s.key, value)}</span>
                    </div>
                    <Slider
                      min={s.min}
                      max={s.max}
                      step={s.step}
                      value={[value]}
                      onValueChange={([v]) => updateSlider(s.key, v)}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatLimit(s.key, s.min)}</span>
                      <span>{formatLimit(s.key, s.max)}</span>
                    </div>
                  </div>
                );
              })}

              {featureRows.length > 0 && (
                <div className="space-y-4">
                  <Label className="bl-calc-label">Features you need</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {featureRows.map((f) => {
                      const isOn = selectedFeatures.has(f.key);
                      return (
                        <button
                          key={f.key}
                          onClick={() => toggleFeature(f.key)}
                          className={`bl-calc-feature ${isOn ? "is-active" : ""}`}
                          type="button"
                        >
                          <span className={`bl-calc-feature-check ${isOn ? "is-active" : ""}`}>
                            {isOn && <Check className="h-3 w-3" strokeWidth={3} />}
                          </span>
                          <span className="bl-calc-feature-label">{f.label}</span>
                          {f.info && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 bl-calc-feature-info" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p style={{ maxWidth: 240 }}>{f.info}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Recommendation card ── */}
            <div className="md:sticky bl-calc-rec-wrap">
              <div className="bl-calc-rec">
                <div className="bl-calc-rec-pill">
                  <Sparkles className="h-4 w-4" />
                  Recommended
                </div>

                <div>
                  <h3 className="bl-calc-rec-tier">{recommendedTier}</h3>
                  <div className="bl-calc-rec-price-row">
                    <span className="bl-calc-rec-price">{formatPrice(recommendedTier)}</span>
                    {!recommended.isCustom && (
                      <span className="bl-calc-rec-period">/mo</span>
                    )}
                  </div>
                </div>

                <div className="bl-calc-rec-summary">
                  {sliderRows.map((s) => {
                    const limit = recommended.limits[s.key];
                    if (limit === undefined) return null;
                    const cfg = SLIDER_CONFIG[s.key];
                    return (
                      <div key={s.key} className="bl-calc-rec-row">
                        <span className="bl-calc-rec-row-label">{cfg?.summary || s.label}</span>
                        <span className="bl-calc-rec-row-value">{formatLimit(s.key, limit)}</span>
                      </div>
                    );
                  })}

                  {selectedFeatures.size > 0 && (
                    <div className="bl-calc-rec-feats">
                      {[...selectedFeatures].map((fKey) => {
                        const featRow = featureRows.find((x) => x.key === fKey);
                        const included = recommended.features.has(fKey);
                        return (
                          <div
                            key={fKey}
                            className={`bl-calc-rec-feat ${included ? "is-included" : "is-missing"}`}
                          >
                            <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
                            <span>{featRow?.label || fKey}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleContinue}
                  className="bl-calc-cta font-semibold gap-2 w-full"
                  size="lg"
                >
                  {recommended.isCustom ? "Talk to Sales" : "Start free trial"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function Style() {
  return (
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700&display=swap');
        .bl-calc, .bl-calc * { font-family: 'League Spartan', sans-serif; }

        .bl-calc-title {
          font-size: 32px;
          font-weight: 700;
          color: #000F4D;
          letter-spacing: -0.012em;
          line-height: 1.15;
          margin: 0 0 10px;
        }
        .bl-calc-sub {
          font-size: 16px;
          color: #6B7A99;
          margin: 0 auto 24px;
          max-width: 540px;
          line-height: 1.5;
        }

        /* Monthly / Yearly toggle */
        .bl-calc-toggle {
          display: inline-flex;
          background: #EEF4FD;
          border-radius: 999px;
          padding: 4px;
          gap: 2px;
        }
        .bl-calc-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          background: transparent;
          color: #6B7A99;
          border: none;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.18s ease, color 0.18s ease;
        }
        .bl-calc-toggle-btn.is-active {
          background: #FFFFFF;
          color: #001364;
          box-shadow: 0 1px 3px rgba(0, 15, 77, 0.08);
        }
        .bl-calc-toggle-pill {
          font-size: 10px;
          font-weight: 700;
          color: #FFFFFF;
          background: #879CF7;
          padding: 2px 6px;
          border-radius: 999px;
          letter-spacing: 0.02em;
        }

        /* Slider rows */
        .bl-calc-label {
          font-size: 14px;
          font-weight: 600;
          color: #000F4D;
        }
        .bl-calc-value {
          font-size: 13px;
          font-weight: 700;
          color: #001364;
          background: #EEF4FD;
          padding: 4px 12px;
          border-radius: 999px;
          font-variant-numeric: tabular-nums;
        }

        /* Feature toggle buttons */
        .bl-calc-feature {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: #FFFFFF;
          border: 1px solid rgba(217, 224, 255, 0.7);
          border-radius: 8px;
          font-size: 14px;
          color: #000F4D;
          text-align: left;
          cursor: pointer;
          transition: background 0.18s ease, border-color 0.18s ease;
        }
        .bl-calc-feature:hover { border-color: #879CF7; }
        .bl-calc-feature.is-active {
          background: rgba(135, 156, 247, 0.08);
          border-color: #879CF7;
        }
        .bl-calc-feature-check {
          width: 20px;
          height: 20px;
          border-radius: 5px;
          background: #EEF4FD;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.18s ease, color 0.18s ease;
        }
        .bl-calc-feature-check.is-active {
          background: #879CF7;
          color: #FFFFFF;
        }
        .bl-calc-feature-label {
          flex: 1;
          font-weight: 500;
        }
        .bl-calc-feature-info {
          color: #6B7A99;
          opacity: 0.6;
          flex-shrink: 0;
        }

        /* Recommendation card */
        .bl-calc-rec-wrap {
          top: 96px;
        }
        .bl-calc-rec {
          background: #FFFFFF;
          border: 1px solid rgba(135, 156, 247, 0.35);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          box-shadow: 0 4px 20px rgba(0, 15, 77, 0.06);
        }
        .bl-calc-rec-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #879CF7;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .bl-calc-rec-tier {
          font-size: 28px;
          font-weight: 700;
          color: #000F4D;
          margin: 0 0 6px;
          letter-spacing: -0.012em;
        }
        .bl-calc-rec-price-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .bl-calc-rec-price {
          font-size: 24px;
          font-weight: 600;
          color: #000F4D;
          font-variant-numeric: tabular-nums;
        }
        .bl-calc-rec-period {
          font-size: 14px;
          color: #6B7A99;
        }

        .bl-calc-rec-summary {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 14px;
          border-top: 1px solid rgba(217, 224, 255, 0.55);
        }
        .bl-calc-rec-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }
        .bl-calc-rec-row-label {
          color: #6B7A99;
        }
        .bl-calc-rec-row-value {
          color: #000F4D;
          font-weight: 600;
        }
        .bl-calc-rec-feats {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 6px;
        }
        .bl-calc-rec-feat {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
        .bl-calc-rec-feat.is-included { color: #001364; }
        .bl-calc-rec-feat.is-included svg { color: #879CF7; }
        .bl-calc-rec-feat.is-missing {
          color: #6B7A99;
          text-decoration: line-through;
        }
        .bl-calc-rec-feat.is-missing svg {
          color: rgba(107, 122, 153, 0.4);
        }

        .bl-calc-cta {
          background: #879CF7 !important;
          color: #FFFFFF !important;
          border-radius: 8px;
          font-size: 14px;
        }
        .bl-calc-cta:hover { background: #294FF6 !important; }
      `}
    </style>
  );
}
