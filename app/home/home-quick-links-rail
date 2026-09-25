// Quick links — vertical side rail (Grammarly-style).
//
// Replaces the horizontal quick-link tiles. Pinned to the right edge, icons
// always visible; each label slides out to the left on hover. Uses the new
// clearer-periwinkle glass icon set.
//
// Each link navigates by default. Set `modal: true` to open it in a Softr
// modal instead (window.openSwModal), matching the old tiles' behaviour.
//
// NOTE: the hrefs below are best guesses — confirm/replace each route.

const MODAL_SIZE = 'lg';

const LINKS = [
  { label: 'Agents',   href: '/settings#tab4', modal: false, img: 'https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_agents-suited-character-glass-3d-clearer-periwinkle-transparent_2026-07.png' },
  { label: 'Briefs',   href: '/project',       modal: false, img: 'https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_brief-glass-3d-clearer-periwinkle-transparent_2026-07.png' },
  { label: 'Bulk',     href: '/bulk',          modal: true,  img: 'https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_bulk-cloud-upload-glass-3d-clearer-periwinkle-transparent_2026-07.png' },
  { label: 'Discover', href: '/discover',      modal: false, img: 'https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_discover-search-glass-3d-clearer-periwinkle-transparent_2026-07.png' },
  { label: 'Projects', href: '/project',       modal: false, img: 'https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_projects-folder-glass-3d-clearer-periwinkle-transparent_2026-07.png' },
  { label: 'Remix',    href: '/remix',         modal: true,  img: 'https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_remix-clapperboard-glass-3d-clearer-periwinkle-transparent_2026-07.png' },
  { label: 'Review',   href: '/review',        modal: true,  img: 'https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_review-eyes-glass-3d-clearer-periwinkle-transparent_2026-07.png' },
];

export default function Block() {
  const go = (e, link) => {
    if (link.modal && typeof window !== 'undefined' && typeof window.openSwModal === 'function') {
      e.preventDefault();
      window.openSwModal(link.href, MODAL_SIZE);
    }
    // Otherwise the anchor's href navigates normally.
  };

  return (
    <div className="ql-rail">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        .ql-rail {
          position: fixed; right: 14px; top: 50%; transform: translateY(-50%);
          z-index: 40; display: flex; flex-direction: column; gap: 6px;
          padding: 8px; border-radius: 16px; background: rgba(255,255,255,0.9);
          backdrop-filter: blur(8px); border: 1px solid #E6EAF5;
          box-shadow: 0 12px 32px -16px rgba(16,24,64,0.28);
          font-family: 'Inter', system-ui, sans-serif;
        }
        .ql-item {
          display: flex; align-items: center; justify-content: flex-end; gap: 0;
          text-decoration: none; cursor: pointer; border-radius: 12px;
        }
        .ql-label {
          max-width: 0; overflow: hidden; white-space: nowrap; opacity: 0;
          font-size: 13px; font-weight: 600; color: #001364;
          transition: max-width 0.28s cubic-bezier(0.32,0.72,0,1), opacity 0.2s, padding 0.28s;
          padding: 0;
        }
        .ql-item:hover .ql-label { max-width: 160px; opacity: 1; padding: 0 10px 0 6px; }
        .ql-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 48px; height: 48px; flex-shrink: 0;
        }
        .ql-icon img {
          width: 40px; height: 40px; object-fit: contain;
          transform-origin: center right;
          transition: transform 0.22s cubic-bezier(0.32,0.72,0,1);
          filter: drop-shadow(0 3px 6px rgba(135,156,247,0.26));
        }
        .ql-item:hover .ql-icon img { transform: scale(1.75); filter: drop-shadow(0 6px 12px rgba(135,156,247,0.4)); }
        @media (max-width: 640px) {
          .ql-rail {
            flex-direction: row; top: auto; bottom: 12px;
            right: auto; left: 50%; transform: translateX(-50%);
            padding: 6px; gap: 2px; max-width: calc(100vw - 20px); overflow-x: auto;
          }
          .ql-rail::-webkit-scrollbar { display: none; }
          .ql-label { display: none; }
          .ql-icon { width: 44px; height: 44px; }
          .ql-icon img { width: 34px; height: 34px; }
        }
      `}</style>

      {LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="ql-item"
          aria-label={link.label}
          onClick={(e) => go(e, link)}
        >
          <span className="ql-label">{link.label}</span>
          <span className="ql-icon"><img src={link.img} alt="" draggable="false" /></span>
        </a>
      ))}
    </div>
  );
}
