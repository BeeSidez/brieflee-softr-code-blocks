import { useEffect } from "react";

/* Referly / PushLap Growth affiliate tracker. Injected from a block
   because app custom header code sits behind Softr's Business plan.
   Renders nothing. Must be on every page an affiliate can send traffic to. */

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
