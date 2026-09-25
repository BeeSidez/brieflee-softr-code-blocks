// =====================================================================
// Vibe Coding block: /unsubscribe — email opt-out (Brieflee)
// =====================================================================
// WHY THIS EXISTS
// Every marketing email used to carry `<a href="{{unsubscribe}}">`, on the
// assumption EmailIt auto-injected the URL. It does not — EmailIt renders
// unknown Mustache vars as an empty string, so every unsubscribe link in
// every send was `href=""`, i.e. dead. Confirmed 2026-07-28 from the raw
// MIME of a delivered send. Email footers now hardcode:
//
//   https://www.brieflee.co/unsubscribe?utm_source=emailit&utm_medium=email
//     &utm_campaign=<template-alias>&utm_content=unsubscribe
//
// DESIGN (2026-07-29, Bev's spec): the email arrives pre-filled from ?e=,
// the visitor TICKS which email types to stop (all ticked by default),
// and each ticked group unsubscribes PER AUDIENCE — the workspace-global
// `unsubscribed` contact flag is never used, because it is shared with
// Creator Scans and would stop the other brand's mail too.
//
// MECHANISM (shapes verified against the live API 2026-07-29):
//   GET  /v2/contacts/{email}
//     → { audiences: [{ id, name, subscriber: { id: "sub_...", ... } }] }
//       (email works directly as the id; each membership carries its own
//        subscriber id, so no separate lookup)
//   DELETE /v2/audiences/{audience_id}/subscribers/{subscriber_id}
//     → removes that audience membership only. Transactional mail is
//       unaffected either way (sends via `to:`, not audiences).
//   Never /v2/suppressions — workspace-wide, shared with CS, and it
//   blocks transactional.
//
// TRANSPORT: the block's Sources tab carries the "Rest API - Emailit"
// data source (REST API sources in Vibe blocks: Softr feature
// 2026-04-21). All calls go through useProxyFetch — Softr proxies them
// server-side and attaches the source's Authorization header itself,
// so no key ever ships in this file and NO workflow is needed.
//
// Public-page caveat: the proxy authenticates whatever this page
// requests, so a technical visitor could call the EmailIt GET endpoint
// from the console with a known address. Accepted trade-off (exposes
// audience membership for a guessed email, nothing more); revisit if
// EmailIt adds scoped keys.
//
// SOFTR UI SETUP
//   1. Create a page at /unsubscribe
//   2. Visibility tab -> public  (recipients are logged out)
//   3. Sources tab -> add the "Rest API - Emailit" data source
//      (Data sources → REST API, Authorization: Bearer <key> header)
//   4. Paste this into a Vibe Coding block
// =====================================================================

import { useEffect, useState } from "react";
import { useProxyFetch } from "@/lib/datasource";

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";

// Brieflee audiences (ids pulled live 2026-09-23, the estate rebuilt on
// 8 September 2026), grouped into the choices a reader actually
// recognises. Unticking a group keeps them on those audiences. Every
// audience that takes subscribers must appear here before it takes its
// first one (email rules, rule 8).
const GROUPS = [
  {
    key: "tools",
    label: "Free tool email series",
    desc: "The tip series that came with a free tool you used.",
    audienceIds: [
      "aud_4J2sokpCp3VLZHFhnayoyKe4SXL", // BL | Leads (every tool that hands the visitor something)
      "aud_4J3HHTp4nJXLq1KfCVhRADpoy6M", // BL | Teaser Leads (the video pages)
    ],
  },
  {
    key: "onboarding",
    label: "Getting-started emails",
    desc: "Tips while you set up your Brieflee workspace.",
    audienceIds: [
      "aud_4J2pPYS3nk8st0p9lZmDCuxZrZh", // BL | Customers (product education + Crash Course)
      "aud_4J3sBxaC4vh0qbmfsvi78b0BASA", // BL | Onboarding no-show
      "aud_4J4CfxC0wvlGCVwIII4TOPQzTZ7", // BL | Onboarding cancelled
    ],
  },
  {
    key: "news",
    label: "News, offers and product updates",
    desc: "Occasional emails about what's new in Brieflee.",
    audienceIds: [
      "aud_4IGavLecASOXdGd4Sn0xIedzyN4", // BL | Newsletter
    ],
  },
  {
    key: "demo",
    label: "Demo call follow-ups",
    desc: "Reminders and follow-ups about a demo you booked.",
    audienceIds: [
      "aud_4J3sC8IX7S3d8SDQkakFDRvOd8V", // BL | Demo no-show
      "aud_4J4CfxC0wvl6wXm9LUoDuaJFW69", // BL | Demo cancelled
    ],
  },
];

// The whole unsubscribe via the EmailIt REST source: one GET returns
// every audience membership WITH its subscriber id (email works
// directly as the contact id, no lookup), then one DELETE per ticked
// membership. Failures are logged, never shown — someone opting out
// must never be told to try again.
async function runUnsubscribe(proxyFetch, email, audienceIds) {
  const res = await proxyFetch(
    `https://api.emailit.com/v2/contacts/${encodeURIComponent(email)}`
  );
  if (!res.ok) return; // unknown address: nothing to remove
  const contact = await res.json();
  const memberships = Array.isArray(contact?.audiences) ? contact.audiences : [];
  const targets = memberships.filter(
    (a) => a?.id && a?.subscriber?.id && audienceIds.includes(a.id)
  );
  const results = await Promise.allSettled(
    targets.map((a) =>
      proxyFetch(
        `https://api.emailit.com/v2/audiences/${a.id}/subscribers/${a.subscriber.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          // EmailIt requires a body on DELETE when Content-Type is json.
          body: JSON.stringify({}),
        }
      )
    )
  );
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error("Unsubscribe call failed:", targets[i]?.id, r.reason);
    }
  });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export default function BriefleeUnsubscribe() {
  const proxyFetch = useProxyFetch();
  const [email, setEmail] = useState("");
  const [ticked, setTicked] = useState(() => new Set(GROUPS.map((g) => g.key)));
  const [status, setStatus] = useState("idle"); // idle | submitting | done
  const [error, setError] = useState("");

  // Pre-fill from ?e= when the email link carries it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const e = new URL(window.location.href).searchParams.get("e");
      if (e && isValidEmail(e)) setEmail(e.trim());
    } catch (err) {
      console.error("Could not read URL params:", err);
    }
  }, []);

  const toggle = (key) =>
    setTicked((cur) => {
      const next = new Set(cur);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  async function handleSubmit() {
    setError("");
    if (!isValidEmail(email)) {
      setError("Enter the email address you receive our emails on.");
      return;
    }
    if (ticked.size === 0) {
      setError("Tick at least one email type to unsubscribe from.");
      return;
    }

    const audienceIds = GROUPS.filter((g) => ticked.has(g.key)).flatMap((g) => g.audienceIds);

    setStatus("submitting");
    try {
      await runUnsubscribe(proxyFetch, email.trim().toLowerCase(), audienceIds);
    } catch (e) {
      console.error("Unsubscribe request failed:", e);
    }
    setStatus("done");
  }

  // Always show success, even if the address was not found — otherwise this
  // page becomes an oracle for "is this person on Brieflee's list".
  if (status === "done") {
    return (
      <div className="container py-16 md:py-24">
        <div className="content max-w-lg mx-auto text-center">
          <div
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: `${PERIWINKLE}22` }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" stroke={NAVY} strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: NAVY }}>
            You are unsubscribed.
          </h1>

          <p className="text-base text-muted-foreground mt-4 leading-relaxed">
            We have stopped the ticked emails for{" "}
            <strong style={{ color: NAVY }}>{email.trim().toLowerCase()}</strong>.
            Anything already in flight can take a few minutes to stop.
          </p>

          <p className="text-sm text-muted-foreground mt-6 leading-relaxed">
            You will still get essential account emails, like billing and
            password resets, if you have a Brieflee account.
          </p>

          <a
            href="https://www.brieflee.co"
            className="inline-flex items-center justify-center mt-8 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: PERIWINKLE }}
          >
            Back to Brieflee
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-16 md:py-24">
      <div className="content max-w-lg mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-center" style={{ color: NAVY }}>
          Unsubscribe from Brieflee emails
        </h1>

        <p className="text-base text-muted-foreground mt-4 leading-relaxed text-center">
          Confirm your email address, tick what you want to stop, and untick
          anything you would like to keep.
        </p>

        <div className="mt-8">
          <label htmlFor="bl-unsub-email" className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>
            Email address
          </label>
          <input
            id="bl-unsub-email"
            type="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(135,156,247,0.25)]"
            style={{ color: NAVY }}
          />

          <div className="mt-6 space-y-3">
            {GROUPS.map((g) => {
              const on = ticked.has(g.key);
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => toggle(g.key)}
                  aria-pressed={on}
                  className="w-full flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors"
                  style={{
                    borderColor: on ? PERIWINKLE : "rgba(217, 224, 255, 0.8)",
                    backgroundColor: on ? "rgba(135, 156, 247, 0.06)" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded"
                    style={{
                      backgroundColor: on ? PERIWINKLE : "#fff",
                      border: on ? "none" : "1.5px solid rgba(135, 156, 247, 0.5)",
                    }}
                  >
                    {on && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="3"
                              strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold" style={{ color: NAVY }}>{g.label}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{g.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {error ? (
            <p className="text-sm mt-3" style={{ color: "#C0392B" }}>{error}</p>
          ) : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={status === "submitting"}
            className="w-full mt-5 rounded-xl px-5 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: PERIWINKLE }}
          >
            {status === "submitting" ? "Unsubscribing…" : "Unsubscribe from ticked emails"}
          </button>

          <p className="text-xs text-muted-foreground mt-5 leading-relaxed text-center">
            Changed your mind? Just close this page. Nothing happens until you
            confirm.
          </p>
        </div>
      </div>
    </div>
  );
}
