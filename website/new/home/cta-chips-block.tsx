import type { MouseEvent } from "react";
import { useTextSetting, useImageSetting } from "@/lib/editable-settings";

/**
 * Brieflee floating CTA chips.
 *
 * Bottom left   "Book a demo"  -> centred modal      (window.openSwModal)
 * Bottom right   chat bubble   -> right side panel   (SoftrPageRenderer.setOpenPageModal)
 *
 * Lives as a vibe block so the two modals open the way they are meant to and so
 * the app pages can carry a different set of chips later. Add it to a page and
 * it is on that page, nowhere else. Hide it from signed-in visitors on the
 * block's Visibility tab (Non logged-in users), not in code.
 *
 * The block renders at zero height, so it costs no vertical space in the layout.
 */

const CSS = `
.bl-chips-root { height: 0; overflow: visible; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }

.bl-demo-chip { position: fixed; left: 20px; bottom: 20px; z-index: 9999; display: inline-flex; align-items: center; gap: 12px; padding: 10px 18px 10px 10px; background: #fff; border-radius: 14px; box-shadow: 0 16px 36px -10px rgba(0,19,100,.22), 0 6px 14px -4px rgba(0,19,100,.12), 0 0 0 1px rgba(0,19,100,.06); text-decoration: none !important; color: #001364; transition: transform .2s ease, box-shadow .2s ease; cursor: pointer; max-width: calc(100vw - 100px); }
.bl-demo-chip:hover { transform: translateY(-3px); box-shadow: 0 24px 48px -12px rgba(0,19,100,.28), 0 8px 18px -4px rgba(0,19,100,.16), 0 0 0 1px rgba(0,19,100,.1); }
.bl-demo-chip:focus-visible { outline: 3px solid #879CF7; outline-offset: 2px; }
.bl-demo-chip-avatar-wrap { position: relative; flex-shrink: 0; width: 40px; height: 40px; }
.bl-demo-chip-avatar { width: 40px; height: 40px; border-radius: 999px; object-fit: cover; display: block; background: #e9ecf6; }
.bl-demo-chip-status { position: absolute; right: -1px; bottom: -1px; width: 12px; height: 12px; border-radius: 999px; background: #22c55e; box-shadow: 0 0 0 2px #fff; }
.bl-demo-chip-text { display: flex; flex-direction: column; gap: 1px; line-height: 1.25; min-width: 0; }
.bl-demo-chip-title { font-size: 14px; font-weight: 700; color: #001364; letter-spacing: -.005em; }
.bl-demo-chip-sub { font-size: 12.5px; font-weight: 500; color: #001364; opacity: .62; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.bl-chat-chip { position: fixed; right: 20px; bottom: 20px; z-index: 9999; display: inline-flex; align-items: center; text-decoration: none !important; cursor: pointer; }
.bl-chat-chip-bubble { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 999px; background: #001364; color: #fff; box-shadow: 0 16px 32px -10px rgba(0,19,100,.4), 0 6px 14px -4px rgba(0,19,100,.2); transition: transform .2s ease, background .2s ease, box-shadow .2s ease; }
.bl-chat-chip:hover .bl-chat-chip-bubble { background: #879CF7; transform: translateY(-3px) scale(1.04); box-shadow: 0 22px 42px -12px rgba(0,19,100,.44), 0 8px 18px -4px rgba(0,19,100,.24); }
.bl-chat-chip:focus-visible .bl-chat-chip-bubble { outline: 3px solid #879CF7; outline-offset: 3px; }
.bl-chat-chip-icon { width: 25px; height: 25px; display: block; }
.bl-chat-chip-ping { position: absolute; inset: 0; border-radius: 999px; border: 2px solid #879CF7; opacity: 0; animation: blChatPing 2.8s cubic-bezier(0,0,.2,1) infinite; pointer-events: none; }
@keyframes blChatPing { 0% { transform: scale(1); opacity: .55; } 70%, 100% { transform: scale(1.45); opacity: 0; } }
.bl-chat-chip:hover .bl-chat-chip-ping { animation-play-state: paused; opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .bl-chat-chip-ping { animation: none; }
  .bl-demo-chip, .bl-chat-chip-bubble { transition: none; }
}
@media (max-width: 560px) {
  .bl-demo-chip { left: 12px; bottom: 12px; padding: 8px 14px 8px 8px; gap: 10px; max-width: calc(100vw - 92px); }
  .bl-demo-chip-avatar-wrap, .bl-demo-chip-avatar { width: 36px; height: 36px; }
  .bl-demo-chip-title { font-size: 13px; }
  .bl-demo-chip-sub { display: none; }
  .bl-chat-chip { right: 12px; bottom: 12px; }
  .bl-chat-chip-bubble { width: 50px; height: 50px; }
  .bl-chat-chip-icon { width: 22px; height: 22px; }
}
`;

export default function Block() {
  const title = useTextSetting({
    name: "chipTitle",
    label: "Demo chip title",
    initialValue: "Book a demo",
  });
  const subtitle = useTextSetting({
    name: "chipSubtitle",
    label: "Demo chip subtitle",
    initialValue: "Brieflee walkthrough",
  });
  const demoUrl = useTextSetting({
    name: "demoUrl",
    label: "Demo chip link (opens centred)",
    initialValue: "/book-call",
  });
  const chatUrl = useTextSetting({
    name: "chatUrl",
    label: "Chat bubble link (opens as a side panel)",
    initialValue: "/book-a-demo",
  });
  const avatar = useImageSetting({
    name: "chipAvatar",
    label: "Demo chip avatar",
    initialValue: {
      src: "https://res.cloudinary.com/dchroynzv/image/upload/v1778675610/_Profile_Picture_nwejiq.png",
      alt: "",
    },
  });

  // Centred dialog. openSwModal is always centred, it takes no placement.
  const openCentred = (e: MouseEvent<HTMLAnchorElement>) => {
    const open = (window as any).openSwModal;
    if (typeof open === "function") {
      e.preventDefault();
      open(demoUrl, "lg");
    }
  };

  // Right side panel. The renderer global is the only thing that can place a
  // modal at the edge, so it is tried first and the rest is fallback.
  const openSidePanel = (e: MouseEvent<HTMLAnchorElement>) => {
    const renderer = (window as any).SoftrPageRenderer;
    if (renderer && typeof renderer.setOpenPageModal === "function") {
      e.preventDefault();
      renderer.setOpenPageModal({ src: chatUrl, size: "M", placement: "end" });
      return;
    }
    try {
      const next = new URL(window.location.href);
      next.searchParams.set("modal", chatUrl);
      next.searchParams.set("modalSize", "M");
      next.searchParams.set("modalPlacement", "end");
      e.preventDefault();
      window.location.href = next.toString();
      return;
    } catch (err) {
      console.error("Side panel URL failed:", err);
    }
    const open = (window as any).openSwModal;
    if (typeof open === "function") {
      e.preventDefault();
      open(chatUrl, "lg");
    }
  };

  return (
    <div className="bl-chips-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <a
        href={demoUrl}
        className="bl-demo-chip"
        onClick={openCentred}
        aria-label={title}
      >
        <span className="bl-demo-chip-avatar-wrap">
          <img
            src={avatar.src}
            alt={avatar.alt}
            className="bl-demo-chip-avatar"
            draggable={false}
          />
          <span className="bl-demo-chip-status" aria-hidden="true" />
        </span>
        <span className="bl-demo-chip-text">
          <span className="bl-demo-chip-title">{title}</span>
          <span className="bl-demo-chip-sub">{subtitle}</span>
        </span>
      </a>

      <a
        href={chatUrl}
        className="bl-chat-chip"
        onClick={openSidePanel}
        aria-label="Chat with the team"
      >
        <span className="bl-chat-chip-bubble">
          <span className="bl-chat-chip-ping" aria-hidden="true" />
          <svg
            className="bl-chat-chip-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </span>
      </a>
    </div>
  );
}
