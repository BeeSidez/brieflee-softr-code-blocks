#!/usr/bin/env node
// =====================================================================
// ops/bench.mjs — run one prompt across several OpenRouter models and
// score the results. Internal tool. No dependencies.
//
//   node ops/bench.mjs ops/prompts/workspace-blueprint.mjs
//   node ops/bench.mjs ops/prompts/workspace-blueprint.mjs --models deepseek/deepseek-v4-pro,anthropic/claude-sonnet-4.5
//   node ops/bench.mjs ops/prompts/workspace-blueprint.mjs --save
//   node ops/bench.mjs ops/prompts/workspace-blueprint.mjs --runs 3
//
// Reads OPENROUTER_API_KEY from .env at the repo root. Prices are
// fetched live from OpenRouter so cost figures are never stale.
//
// Reports per model: real cost, latency, tokens, JSON validity, schema
// compliance and em dash count. Schema and em dashes are what actually
// decide whether a cheaper model is usable here.
// =====================================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");

// ─── env ──────────────────────────────────────────────────────
function loadEnv() {
  const p = resolve(ROOT, ".env");
  if (!existsSync(p)) die(`No .env at ${p}. Create it with OPENROUTER_API_KEY=...`);
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
function die(msg) { console.error("\n  " + msg + "\n"); process.exit(1); }

// ─── default candidate set ────────────────────────────────────
const DEFAULT_MODELS = [
  "google/gemini-2.5-flash-lite",
  "deepseek/deepseek-v4-flash",
  "qwen/qwen3-235b-a22b-2507",
  "deepseek/deepseek-v4-pro",
  "anthropic/claude-haiku-4.5",
  "anthropic/claude-sonnet-4.5", // control: what production runs today
];

// ─── house style checks ───────────────────────────────────────
function styleScore(text) {
  const emDashes = (text.match(/—/g) || []).length;
  return { emDashes };
}

// ─── schema check ─────────────────────────────────────────────
function schemaScore(parsed, schema) {
  if (!schema || !parsed) return null;
  const problems = [];
  for (const k of schema.required || []) {
    if (!(k in parsed)) problems.push(`missing ${k}`);
  }
  for (const k of schema.arraysOfThree || []) {
    const v = parsed[k];
    if (v != null && (!Array.isArray(v) || v.length !== 3)) {
      problems.push(`${k} is ${Array.isArray(v) ? v.length : typeof v}, want array of 3`);
    }
  }
  const products = parsed.products;
  if (Array.isArray(products)) {
    products.forEach((p, i) => {
      for (const k of schema.productRequired || []) {
        if (!(k in (p || {}))) problems.push(`products[${i}] missing ${k}`);
      }
      for (const k of schema.productArraysOfThree || []) {
        const v = (p || {})[k];
        if (v != null && (!Array.isArray(v) || v.length !== 3)) {
          problems.push(`products[${i}].${k} is ${Array.isArray(v) ? v.length : typeof v}, want 3`);
        }
      }
    });
  }
  return problems;
}

function parseJson(text) {
  const s = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try { return { ok: true, parsed: JSON.parse(s) }; }
  catch (e) { return { ok: false, error: e.message }; }
}

// ─── live prices ──────────────────────────────────────────────
async function fetchPrices() {
  try {
    const r = await fetch("https://openrouter.ai/api/v1/models");
    const j = await r.json();
    const map = {};
    for (const m of j.data || []) {
      map[m.id] = {
        in: Number(m.pricing?.prompt || 0) * 1e6,
        out: Number(m.pricing?.completion || 0) * 1e6,
      };
    }
    return map;
  } catch {
    console.warn("  (could not fetch live prices, costs will show as —)");
    return {};
  }
}

// ─── one call ─────────────────────────────────────────────────
async function runOne(model, prompt, key, prices) {
  const body = {
    model,
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
  };
  if (prompt.temperature != null) body.temperature = prompt.temperature;
  if (prompt.response_format) body.response_format = prompt.response_format;

  const t0 = Date.now();
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const ms = Date.now() - t0;
    if (!res.ok) {
      const t = await res.text();
      return { model, ok: false, ms, error: `HTTP ${res.status} ${t.slice(0, 160)}` };
    }
    const j = await res.json();
    const text = (j?.choices?.[0]?.message?.content || "").trim();
    if (!text) return { model, ok: false, ms, error: "empty response" };

    const inTok = j?.usage?.prompt_tokens ?? 0;
    const outTok = j?.usage?.completion_tokens ?? 0;
    const p = prices[model];
    const cost = p ? (inTok / 1e6) * p.in + (outTok / 1e6) * p.out : null;
    const jp = parseJson(text);
    return {
      model, ok: true, ms, text, inTok, outTok, cost,
      json: jp,
      schema: jp.ok ? schemaScore(jp.parsed, prompt.schema) : null,
      style: styleScore(text),
    };
  } catch (e) {
    return { model, ok: false, ms: Date.now() - t0, error: e.message };
  }
}

// ─── output ───────────────────────────────────────────────────
const money = (n) => (n == null ? "—" : n < 0.01 ? `$${n.toFixed(5)}` : `$${n.toFixed(4)}`);
const pad = (s, n) => String(s).padEnd(n).slice(0, n);
const padL = (s, n) => String(s).padStart(n);

function report(rows, runs) {
  rows.sort((a, b) => (a.cost ?? 9e9) - (b.cost ?? 9e9));
  console.log("");
  console.log("  " + pad("MODEL", 32) + padL("COST", 10) + padL("TOKENS", 16) + padL("TIME", 8) + "  " + pad("JSON", 10) + pad("SCHEMA", 10) + "STYLE");
  console.log("  " + "─".repeat(108));
  for (const r of rows) {
    if (!r.ok) {
      console.log("  " + pad(r.model, 32) + padL("—", 10) + padL("—", 16) + padL(`${(r.ms / 1000).toFixed(1)}s`, 8) + "  FAILED: " + r.error);
      continue;
    }
    const jsonCell = r.json.ok ? "valid" : "INVALID";
    const schemaCell = r.schema == null ? "—" : r.schema.length === 0 ? "clean" : `${r.schema.length} issue${r.schema.length > 1 ? "s" : ""}`;
    const bits = [];
    if (r.style.emDashes) bits.push(`${r.style.emDashes} em dash`);
    console.log(
      "  " + pad(r.model, 32) + padL(money(r.cost), 10) +
      padL(`${r.inTok}/${r.outTok}`, 16) + padL(`${(r.ms / 1000).toFixed(1)}s`, 8) + "  " +
      pad(jsonCell, 10) + pad(schemaCell, 10) + (bits.length ? bits.join(" · ") : "clean")
    );
  }

  const okRows = rows.filter((r) => r.ok && r.cost != null);
  if (okRows.length) {
    const total = rows.reduce((a, r) => a + (r.cost || 0), 0);
    const control = rows.find((r) => r.model.includes("sonnet-4.5"));
    console.log("  " + "─".repeat(108));
    console.log(`  run total ${money(total)}${runs > 1 ? ` across ${runs} runs each` : ""}`);
    if (control?.cost) {
      console.log("");
      console.log("  vs current production (sonnet-4.5) per call:");
      for (const r of okRows) {
        if (r.model === control.model) continue;
        const save = (1 - r.cost / control.cost) * 100;
        console.log(`    ${pad(r.model, 32)} ${padL(save.toFixed(1) + "% cheaper", 16)}  ${padL(money(control.cost - r.cost), 10)} saved per call  ·  ${money((control.cost - r.cost) * 1000)} per 1,000`);
      }
    }
  }

  const detail = rows.filter((r) => r.ok && r.schema?.length);
  if (detail.length) {
    console.log("");
    console.log("  schema problems:");
    for (const r of detail) {
      console.log(`    ${r.model}`);
      for (const p of r.schema.slice(0, 8)) console.log(`      · ${p}`);
      if (r.schema.length > 8) console.log(`      · ...and ${r.schema.length - 8} more`);
    }
  }
  console.log("");
}

// ─── main ─────────────────────────────────────────────────────
const args = process.argv.slice(2);
const promptPath = args.find((a) => !a.startsWith("--"));
if (!promptPath) die("Usage: node ops/bench.mjs <prompt.mjs> [--models a,b] [--runs N] [--save]");

const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : null;
};
const models = (flag("models") || "").split(",").filter(Boolean);
const runs = Number(flag("runs") || 1);
const save = args.includes("--save");

loadEnv();
const key = process.env.OPENROUTER_API_KEY;
if (!key) die("OPENROUTER_API_KEY is empty in .env. Paste your ops-bench key after the = sign.");

const prompt = await import(pathToFileURL(resolve(promptPath)).href);
const chosen = models.length ? models : DEFAULT_MODELS;

console.log(`\n  prompt: ${prompt.name || basename(promptPath)}`);
console.log(`  models: ${chosen.length}   runs each: ${runs}`);
if (/PASTE A REAL SCRAPE/i.test(prompt.user)) {
  console.log("\n  WARNING: the prompt still has the placeholder scrape in it.");
  console.log("  Costs will be wrong (far too low) and output quality is untestable.");
  console.log("  Paste a real scrape into the prompt file first.");
}
console.log("\n  running...");

const prices = await fetchPrices();
const jobs = [];
for (const m of chosen) for (let i = 0; i < runs; i++) jobs.push(runOne(m, prompt, key, prices));
const all = await Promise.all(jobs);

// average repeat runs per model
const byModel = new Map();
for (const r of all) {
  if (!byModel.has(r.model)) byModel.set(r.model, []);
  byModel.get(r.model).push(r);
}
const rows = [...byModel.values()].map((list) => {
  const ok = list.filter((r) => r.ok);
  if (!ok.length) return list[0];
  const avg = (f) => ok.reduce((a, r) => a + (r[f] || 0), 0) / ok.length;
  return { ...ok[0], ms: avg("ms"), cost: ok[0].cost == null ? null : avg("cost"), inTok: Math.round(avg("inTok")), outTok: Math.round(avg("outTok")) };
});

report(rows, runs);

if (save) {
  const dir = resolve(ROOT, "ops/out");
  mkdirSync(dir, { recursive: true });
  for (const r of rows) {
    if (!r.ok) continue;
    const f = resolve(dir, `${prompt.name || "bench"}__${r.model.replace(/\//g, "_")}.txt`);
    writeFileSync(f, r.text, "utf8");
  }
  console.log(`  outputs written to ops/out/ (gitignored)\n`);
}
