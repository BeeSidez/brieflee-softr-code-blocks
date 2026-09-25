/* Lucide-style icon set for the Brief Builder. window.Icon({name,size,stroke}) */
(function () {
  const P = {
    // brand / sections / modules
    "sparkles": <><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="m6.3 6.3 1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4"/></>,
    "tag": <><path d="M12.6 2.6 21 11a2 2 0 0 1 0 2.8l-6.2 6.2a2 2 0 0 1-2.8 0L3.6 11.6A2 2 0 0 1 3 10.2V4a1 1 0 0 1 1-1h6.2a2 2 0 0 1 1.4.6Z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none"/></>,
    "users": <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    "users-round": <><path d="M18 21a8 8 0 0 0-12 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-3-8a5 5 0 0 0-.45-8.3"/></>,
    "package": <><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.3 7 12 12l8.7-5"/><path d="M12 22V12"/></>,
    "gift": <><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/></>,
    "check-square": <><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
    "zap": <><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></>,
    "message-square": <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    "message-circle": <><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></>,
    "file-text": <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5"/><path d="M9 13h6M9 17h6"/></>,
    "file": <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5"/></>,
    "layout": <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>,
    "layout-template": <><rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="14" width="9" height="7" rx="1"/><rect x="16" y="14" width="5" height="7" rx="1"/></>,
    "image": <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/></>,
    "box": <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/></>,
    "video": <><path d="m16 13 5.2 3a1 1 0 0 0 1.5-.87V8.9A1 1 0 0 0 21.2 8L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/></>,
    "shield-check": <><path d="M20 13c0 5-3.5 7.5-7.7 9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1 1 0 0 1 1.3 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/></>,
    "scale": <><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></>,
    "upload-cloud": <><path d="M12 13v8M8 17l4-4 4 4"/><path d="M20 16.6A5 5 0 0 0 18 7h-1.3A8 8 0 1 0 4 15.2"/></>,
    "life-buoy": <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="m4.9 4.9 4.2 4.2M14.9 14.9l4.2 4.2M14.9 9.1l4.2-4.2M14.9 9.1 18.4 5.6M4.9 19.1l4.2-4.2"/></>,
    "user": <><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></>,
    "plus-circle": <><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></>,
    "info": <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></>,
    "list": <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
    "list-ordered": <><path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></>,
    "star": <><path d="M11.5 2.6a.6.6 0 0 1 1 0l2.4 5 5.4.8a.6.6 0 0 1 .3 1l-3.9 3.8.9 5.4a.6.6 0 0 1-.9.6L12 17l-4.8 2.6a.6.6 0 0 1-.9-.6l.9-5.4-3.9-3.8a.6.6 0 0 1 .3-1l5.4-.8Z"/></>,
    "target": <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    "pen-tool": <><path d="M15.7 18.3 12 22l-1.4-1.4a2 2 0 0 1 0-2.8L14 14"/><path d="m2 2 7.6 15.2a.5.5 0 0 0 .9 0l1.8-4a.5.5 0 0 1 .3-.3l4-1.8a.5.5 0 0 0 0-.9Z"/></>,
    "mail": <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,
    "link": <><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></>,
    "rectangle": <><rect x="2" y="5" width="20" height="14" rx="2"/></>,
    "code": <><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></>,
    "paperclip": <><path d="M13.2 8.4 8.6 13a2 2 0 1 0 2.8 2.8l5.7-5.6a4 4 0 1 0-5.7-5.7l-5.7 5.6a6 6 0 0 0 8.5 8.5l4.6-4.5"/></>,
    "music": <><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>,
    "crop": <><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></>,
    "layers": <><path d="m12.8 2.5 8.6 4a.6.6 0 0 1 0 1l-8.6 4a2 2 0 0 1-1.6 0l-8.6-4a.6.6 0 0 1 0-1l8.6-4a2 2 0 0 1 1.6 0Z"/><path d="m22 12.5-9.4 4.3a2 2 0 0 1-1.2 0L2 12.5M22 17l-9.4 4.3a2 2 0 0 1-1.2 0L2 17"/></>,
    "sliders": <><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/></>,
    "bot": <><path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></>,
    // text formats
    "heading": <><path d="M6 4v16M18 4v16M6 12h12"/></>,
    "quote": <><path d="M9 6H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3v2a2 2 0 0 1-2 2M20 6h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3v2a2 2 0 0 1-2 2"/></>,
    "table": <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M12 3v18"/></>,
    "minus": <><path d="M5 12h14"/></>,
    "columns": <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/></>,
    // ui chrome
    "arrow-left": <><path d="M19 12H5M12 19l-7-7 7-7"/></>,
    "share": <><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M16 6l-4-4-4 4M12 2v13"/></>,
    "calendar": <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    "chevron-down": <><path d="m6 9 6 6 6-6"/></>,
    "chevron-right": <><path d="m9 18 6-6-6-6"/></>,
    "chevrons-up-down": <><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></>,
    "search": <><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>,
    "plus": <><path d="M12 5v14M5 12h14"/></>,
    "x": <><path d="M18 6 6 18M6 6l12 12"/></>,
    "check": <><path d="M20 6 9 17l-5-5"/></>,
    "more-horizontal": <><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></>,
    "trash": <><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>,
    "grip": <><circle cx="9" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.3" fill="currentColor" stroke="none"/></>,
    "settings": <><path d="M12.2 2h-.4a2 2 0 0 0-2 2 1.7 1.7 0 0 1-2.6 1.5 2 2 0 0 0-2.4.3l-.3.3a2 2 0 0 0-.3 2.4A1.7 1.7 0 0 1 2 11a2 2 0 0 0-2 2v.4a2 2 0 0 0 2 2 1.7 1.7 0 0 1 1.5 2.6 2 2 0 0 0 .3 2.4l.3.3a2 2 0 0 0 2.4.3A1.7 1.7 0 0 1 9 22.9a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2 1.7 1.7 0 0 1 2.6-1.5 2 2 0 0 0 2.4-.3l.3-.3a2 2 0 0 0 .3-2.4A1.7 1.7 0 0 1 22 14a2 2 0 0 0 2-2v-.4a2 2 0 0 0-2-2 1.7 1.7 0 0 1-1.5-2.6 2 2 0 0 0-.3-2.4l-.3-.3a2 2 0 0 0-2.4-.3A1.7 1.7 0 0 1 15 3a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="3"/></>,
    "type": <><path d="M4 7V4h16v3M9 20h6M12 4v16"/></>,
    "wand": <><path d="m3 21 9-9M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M15 9h0M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5"/></>,
    "circle": <><circle cx="12" cy="12" r="9"/></>,
    "clock": <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    "eye": <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
  };
  function Icon({ name, size = 16, stroke = 2, style, fill }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"}
        stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
        strokeLinejoin="round" style={style} aria-hidden="true">
        {P[name] || P["circle"]}
      </svg>
    );
  }
  window.Icon = Icon;
})();
