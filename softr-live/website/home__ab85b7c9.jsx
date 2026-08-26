import { useEffect } from "react";

/* ------------------------------------------------------------------ *
 * Referly / PushLap Growth affiliate tracker.
 *
 * This belongs in the app's custom header code, which is behind Softr's
 * Business plan, so it is injected from a block instead. Same result:
 * the tracker reads ?ref= on landing and persists it to the checkout.
 *
 * Renders nothing and takes no layout space. It needs to sit on every
 * page an affiliate can send traffic to, and on the page a purchase
 * starts from. Adding a landing page in Referly without adding this
 * block to it means those clicks are invisible.
 * ------------------------------------------------------------------ */

const SRC = "https://pushlapgrowth.com/affiliate-tracker.js";
const PROGRAM_ID = "cf43de47-1d47-4866-bbdb-7eee0fe14cf6";

export default function Block() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.querySelector('script[data-affiliate][data-program-id="' + PROGRAM_ID + '"]')) return;

    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.setAttribute("data-affiliate", "");
    s.setAttribute("data-program-id", PROGRAM_ID);
    document.head.appendChild(s);
  }, []);

  return <span aria-hidden="true" style={{ display: "none" }} />;
}
