// =====================================================================
// /app/boards/details — Board header (inline-editable).
//
// Renders the board's emoji + name + description at the top of the
// board detail page. All three are click-to-edit:
//   • Emoji        — click to open a small emoji picker popover
//   • Name         — click to edit inline (Enter / blur saves)
//   • Description  — click to edit inline (blur saves; placeholder
//                    text when empty)
//
// Source: brieflee beta → boards (XiLxhAkyOL9yrX). Reads + writes the
// current board record via useCurrentRecordId + useRecord +
// useRecordUpdate.
//
// SOFTR UI SETUP:
//   1. Page: /boards/details (Details page of the boards table)
//   2. Source: brieflee beta → boards, find record by URL recordId
//   3. Actions tab → enable Update Record
//   4. Drop this block at the top of the page; other board content
//      (cards, briefs, videos, etc.) sits below.
// =====================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { useRecord, useCurrentRecordId, useRecordUpdate, q } from "@/lib/datasource";
import { toast } from "sonner";

// ─── Brand palette ────────────────────────────────────────────
const NAVY_DEEP        = "#001364";
const PERIWINKLE       = "#879CF7";
const PERIWINKLE_HOVER = "#294FF6";
const MUTED            = "#6B7A99";
const SOFT_MUTED       = "#9aa6c3";
const BORDER           = "rgba(217, 224, 255, 0.55)";
const TINT_BG          = "rgba(135, 156, 247, 0.10)";

// ─── Emoji picker data — same set as /create-board ───────────
const EMOJI_CATEGORIES = [
  { name: "Smileys", icon: "😀", emojis: "😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 🫠 😉 😊 😇 🥰 😍 🤩 😘 😗 ☺️ 😚 😙 🥲 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🫢 🫣 🤫 🤔 🫡 🤐 🤨 😐 😑 😶 🫥 😶‍🌫️ 😏 😒 🙄 😬 😮‍💨 🤥 🫨 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🤧 🥵 🥶 🥴 😵 😵‍💫 🤯 🤠 🥳 🥸 😎 🤓 🧐 😕 🫤 😟 🙁 ☹️ 😮 😯 😲 😳 🥺 🥹 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 ☠️ 💩 🤡 👹 👺 👻 👽 👾 🤖 😺 😸 😹 😻 😼 😽 🙀 😿 😾" },
  { name: "People",  icon: "👋", emojis: "👋 🤚 🖐 ✋ 🖖 🫱 🫲 🫳 🫴 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 🖕 👇 ☝️ 🫵 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 🫶 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🦿 🦵 🦶 👂 🦻 👃 🧠 🫀 🫁 🦷 🦴 👀 👁 👅 👄 🫦 💋 🩸 👶 🧒 👦 👧 🧑 👱 👨 🧔 👩 🧓 👴 👵 🙍 🙎 🙅 🙆 💁 🙋 🧏 🙇 🤦 🤷 👮 🕵 💂 🥷 👷 🫅 🤴 👸 👳 👲 🧕 🤵 👰 🤰 🫃 🫄 🤱 👼 🎅 🤶 🦸 🦹 🧙 🧚 🧛 🧜 🧝 🧞 🧟 🧌 💆 💇 🚶 🧍 🧎 🏃 💃 🕺 🕴 👯 🧖 🧗 🤺 🏇 ⛷ 🏂 🏌 🏄 🚣 🏊 ⛹ 🏋 🚴 🚵 🤸 🤼 🤽 🤾 🤹 🧘 🛀 🛌 👭 👫 👬 💏 💑 👪 🗣 👤 👥 🫂" },
  { name: "Animals", icon: "🐶", emojis: "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐻‍❄️ 🐨 🐯 🦁 🐮 🐷 🐽 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🐣 🐥 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🪱 🐛 🦋 🐌 🐞 🐜 🪰 🪲 🪳 🦟 🦗 🕷 🕸 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦞 🦀 🪸 🪼 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🦧 🐘 🦣 🦛 🦏 🐪 🐫 🦒 🦘 🦬 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🦮 🐕‍🦺 🐈 🐈‍⬛ 🪶 🐓 🦃 🦤 🦚 🦜 🦢 🦩 🕊 🐇 🦝 🦨 🦡 🦫 🦦 🦥 🐁 🐀 🐿 🦔 🐾 🐉 🐲 🌵 🎄 🌲 🌳 🌴 🪵 🌱 🌿 ☘️ 🍀 🎍 🪴 🎋 🍃 🍂 🍁 🍄 🐚 🪨 🌾 💐 🌷 🌹 🥀 🪻 🪷 🌺 🌸 🌼 🌻 🌞 🌝 🌛 🌜 🌚 🌕 🌖 🌗 🌘 🌑 🌒 🌓 🌔 🌙 🌎 🌍 🌏 🪐 💫 ⭐ 🌟 ✨ ⚡ ☄️ 💥 🔥 🌪 🌈 ☀️ 🌤 ⛅ 🌥 ☁️ 🌦 🌧 ⛈ 🌩 🌨 ❄️ ☃️ ⛄ 🌬 💨 💧 💦 🫧 ☔ ☂️ 🌊 🌫" },
  { name: "Food",    icon: "🍔", emojis: "🍇 🍈 🍉 🍊 🍋 🍌 🍍 🥭 🍎 🍏 🍐 🍑 🍒 🍓 🫐 🥝 🍅 🫒 🥥 🥑 🍆 🥔 🥕 🌽 🌶 🫑 🥒 🥬 🥦 🧄 🧅 🍄 🥜 🫘 🌰 🫚 🫛 🍞 🥐 🥖 🫓 🥨 🥯 🥞 🧇 🧀 🍖 🍗 🥩 🥓 🍔 🍟 🍕 🌭 🥪 🌮 🌯 🫔 🥙 🧆 🥚 🍳 🥘 🍲 🫕 🥣 🥗 🍿 🧈 🧂 🥫 🫙 🍱 🍘 🍙 🍚 🍛 🍜 🍝 🍠 🍢 🍣 🍤 🍥 🥮 🍡 🥟 🥠 🥡 🦪 🍦 🍧 🍨 🍩 🍪 🎂 🍰 🧁 🥧 🍫 🍬 🍭 🍮 🍯 🍼 🥛 ☕ 🫖 🍵 🍶 🍾 🍷 🍸 🍹 🍺 🍻 🥂 🥃 🫗 🥤 🧋 🧃 🧉 🧊 🥢 🍽 🍴 🥄 🔪" },
  { name: "Activities", icon: "⚽", emojis: "⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🥏 🎱 🪀 🏓 🏸 🏒 🏑 🥍 🏏 🪃 🥅 ⛳ 🪁 🏹 🎣 🤿 🥊 🥋 🎽 🛹 🛼 🛷 ⛸ 🥌 🎿 ⛷ 🏂 🪂 🏋 🤼 🤸 ⛹ 🤺 🤾 🏌 🏇 🧘 🏄 🏊 🤽 🚣 🧗 🚵 🚴 🏆 🥇 🥈 🥉 🏅 🎖 🏵 🎗 🎫 🎟 🎪 🤹 🎭 🩰 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🪘 🎷 🎺 🪗 🎸 🪕 🎻 🪈 🎲 ♟ 🎯 🎳 🎮 🎰 🧩" },
  { name: "Travel",  icon: "🚗", emojis: "🚗 🚕 🚙 🚌 🚎 🏎 🚓 🚑 🚒 🚐 🛻 🚚 🚛 🚜 🦯 🦽 🦼 🛴 🚲 🛵 🏍 🛺 🚨 🚔 🚍 🚘 🚖 🚡 🚠 🚟 🚃 🚋 🚞 🚝 🚄 🚅 🚈 🚂 🚆 🚇 🚊 🚉 ✈️ 🛫 🛬 🛩 💺 🛰 🚀 🛸 🚁 🛶 ⛵ 🚤 🛥 🛳 ⛴ 🚢 ⚓ 🛟 ⛽ 🚧 🚦 🚥 🚏 🗺 🗿 🗽 🗼 🏰 🏯 🏟 🎡 🎢 🎠 ⛲ ⛱ 🏖 🏝 🏜 🌋 ⛰ 🏔 🗻 🏕 ⛺ 🛖 🏠 🏡 🏘 🏚 🏗 🏭 🏢 🏬 🏣 🏤 🏥 🏦 🏨 🏪 🏫 🏩 💒 🏛 ⛪ 🕌 🕍 🛕 🕋 ⛩ 🛤 🛣 🗾 🎑 🏞 🌅 🌄 🌠 🎇 🎆 🌇 🌆 🏙 🌃 🌌 🌉 🌁" },
  { name: "Objects", icon: "💡", emojis: "⌚ 📱 📲 💻 ⌨️ 🖥 🖨 🖱 🖲 🕹 🗜 💽 💾 💿 📀 📼 📷 📸 📹 🎥 📽 🎞 📞 ☎️ 📟 📠 📺 📻 🎙 🎚 🎛 🧭 ⏱ ⏲ ⏰ 🕰 ⌛ ⏳ 📡 🔋 🪫 🔌 💡 🔦 🕯 🪔 🧯 🛢 💸 💵 💴 💶 💷 🪙 💰 💳 🪪 💎 ⚖️ 🪜 🧰 🪛 🔧 🔨 ⚒ 🛠 ⛏ 🪚 🔩 ⚙️ 🪤 🧱 ⛓ 🧲 🔫 💣 🧨 🪓 🔪 🗡 ⚔️ 🛡 🚬 ⚰️ 🪦 ⚱️ 🏺 🔮 📿 🧿 🪬 💈 ⚗️ 🔭 🔬 🕳 🩹 🩺 🩻 💊 💉 🩸 🧬 🦠 🧫 🧪 🌡 🧹 🪠 🧺 🧻 🚽 🚰 🚿 🛁 🛀 🧼 🪥 🪒 🧽 🪣 🧴 🛎 🔑 🗝 🚪 🪑 🛋 🛏 🛌 🧸 🪆 🖼 🪞 🪟 🛍 🛒 🎁 🎈 🎏 🎀 🪄 🪅 🎊 🎉 🎎 🏮 🎐 🧧 ✉️ 📩 📨 📧 💌 📥 📤 📦 🏷 🪧 📪 📫 📬 📭 📮 📯 📜 📃 📄 📑 🧾 📊 📈 📉 🗒 🗓 📆 📅 🗑 📇 🗃 🗳 🗄 📋 📁 📂 🗂 🗞 📰 📓 📔 📒 📕 📗 📘 📙 📚 📖 🔖 🧷 🔗 📎 🖇 📐 📏 🧮 📌 📍 ✂️ 🖊 🖋 ✒️ 🖌 🖍 📝 ✏️ 🔍 🔎 🔏 🔐 🔒 🔓" },
  { name: "Symbols", icon: "❤️", emojis: "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 🩷 🩵 🩶 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 ♾ ☮️ ✝️ ☪️ 🕉 ☸️ ✡️ 🔯 🕎 ☯️ ☦️ 🛐 ⛎ ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ ⚛️ ☢️ ☣️ ✴️ 🆚 💯 💢 ♨️ 🔞 ❗ ❕ ❓ ❔ ‼️ ⁉️ 〽️ ⚠️ 🚸 🔱 ⚜️ 🔰 ♻️ ✅ 🌐 💠 🌀 💤 ♿ ⏏️ ▶️ ⏸ ⏯ ⏹ ⏺ ⏭ ⏮ ⏩ ⏪ ⏫ ⏬ ◀️ 🔼 🔽 ➡️ ⬅️ ⬆️ ⬇️ ↗️ ↘️ ↙️ ↖️ ↕️ ↔️ ↪️ ↩️ ⤴️ ⤵️ 🔀 🔁 🔂 🔄 🔃 🎵 🎶 ➕ ➖ ➗ ✖️ 🟰 💲 💱 ™️ ©️ ®️ 〰️ ➰ ➿ ✔️ ☑️ 🔘 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤 🔺 🔻 🔸 🔹 🔶 🔷 🔳 🔲 ⬛ ⬜ 🟥 🟨 🟩 🟦 🟪 🟫 🔈 🔇 🔉 🔊 🔔 🔕 📣 📢 💬 💭 🗯 ♠️ ♣️ ♥️ ♦️ 🃏 🎴 🀄" },
  { name: "Flags",   icon: "🏁", emojis: "🏁 🚩 🎌 🏴 🏳️ 🏳️‍🌈 🏳️‍⚧️ 🏴‍☠️ 🇺🇸 🇬🇧 🇨🇦 🇦🇺 🇫🇷 🇩🇪 🇮🇹 🇪🇸 🇯🇵 🇨🇳 🇰🇷 🇮🇳 🇧🇷 🇲🇽 🇿🇦 🇳🇬 🇪🇬 🇸🇦 🇦🇪 🇹🇷 🇮🇱 🇮🇪 🇳🇱 🇧🇪 🇨🇭 🇸🇪 🇳🇴 🇫🇮 🇩🇰 🇵🇱 🇬🇷 🇵🇹 🇨🇿 🇭🇺 🇷🇴 🇦🇷 🇨🇱 🇨🇴 🇵🇪 🇻🇪 🇹🇭 🇻🇳 🇲🇾 🇸🇬 🇮🇩 🇵🇭 🇳🇿 🇰🇪 🇬🇭 🇪🇹 🇲🇦 🇩🇿 🇹🇳 🇮🇶 🇮🇷 🇵🇰 🇧🇩 🇱🇰 🇳🇵 🇰🇿 🇺🇦 🇧🇾 🇷🇺" },
];

// ─── Schemas (split read vs write) ────────────────────────────
const select = q.select({
  name:        "dsjPO",
  description: "B6lpT",
  emoji:       "695Lf",
});
const updateFields = q.select({
  name:        "dsjPO",
  description: "B6lpT",
  emoji:       "695Lf",
});

// ─── Helpers ──────────────────────────────────────────────────
function unwrap(raw) {
  if (raw == null) return "";
  if (typeof raw === "string") return raw.trim();
  if (Array.isArray(raw)) return raw.map(unwrap).filter(Boolean).join(", ");
  if (typeof raw === "object") return raw.label || raw.value || raw.name || "";
  return String(raw);
}

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  const boardId = useCurrentRecordId() || "";
  const { data: record, refetch } = useRecord({ recordId: boardId, select });
  const updateRecord = useRecordUpdate({ fields: updateFields });
  const f = record?.fields || {};

  const currentName        = unwrap(f.name) || "";
  const currentDescription = unwrap(f.description) || "";
  const currentEmoji       = unwrap(f.emoji) || "📋";

  // ─── Save helper ─────────────────────────────────────────
  const save = async (patch, label) => {
    if (!boardId) return;
    try {
      await updateRecord.mutateAsync({ recordId: boardId, fields: patch });
      await refetch?.();
    } catch (e) {
      console.error(`${label} save failed:`, e);
      toast.error(`Couldn't save ${label}`, { description: e?.message || "Try again." });
    }
  };

  return (
    <>
      <Style />
      <div className="container py-4 md:py-6">
        <div className="content max-w-7xl mx-auto bl-bh">
          <div className="bl-bh-row">
            <EmojiPicker
              value={currentEmoji}
              onSave={(next) => save({ emoji: { label: next } }, "emoji")}
            />
            <NameEdit
              value={currentName}
              onSave={(next) => save({ name: next }, "name")}
            />
          </div>
          <DescEdit
            value={currentDescription}
            onSave={(next) => save({ description: next }, "description")}
          />
        </div>
      </div>
    </>
  );
}

// =====================================================================
// EmojiPicker — clickable button + dropdown panel with categories
// =====================================================================
function EmojiPicker({ value, onSave }) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const wrapRef     = useRef(null);
  const scrollRef   = useRef(null);
  const sectionRefs = useRef([]);

  // Pre-split once.
  const categories = useMemo(
    () => EMOJI_CATEGORIES.map((c) => ({ ...c, list: c.emojis.split(" ").filter(Boolean) })),
    [],
  );

  // Close on click outside the wrapper.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Highlight the right category tab as the user scrolls.
  useEffect(() => {
    if (!open) return;
    const wrap = scrollRef.current;
    if (!wrap) return;
    const onScroll = () => {
      const top = wrap.scrollTop;
      let next = 0;
      sectionRefs.current.forEach((el, i) => {
        if (el && el.offsetTop - 40 <= top) next = i;
      });
      setActiveCategory(next);
    };
    wrap.addEventListener("scroll", onScroll, { passive: true });
    return () => wrap.removeEventListener("scroll", onScroll);
  }, [open]);

  const jumpTo = (i) => {
    const el = sectionRefs.current[i];
    const wrap = scrollRef.current;
    if (el && wrap) wrap.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  };

  return (
    <div className="bl-bh-emoji-wrap" ref={wrapRef}
         onMouseDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="bl-bh-emoji-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change emoji"
        aria-expanded={open}
      >
        {value}
      </button>
      {open && (
        <div className="bl-bh-emoji-panel" role="dialog" aria-label="Pick an emoji">
          <div className="bl-bh-emoji-cats" role="tablist">
            {categories.map((c, i) => (
              <button
                key={c.name}
                type="button"
                role="tab"
                aria-selected={activeCategory === i}
                className={`bl-bh-emoji-cat ${activeCategory === i ? "is-active" : ""}`}
                onClick={() => jumpTo(i)}
                title={c.name}
              >
                {c.icon}
              </button>
            ))}
          </div>
          <div className="bl-bh-emoji-scroll" ref={scrollRef}>
            {categories.map((c, i) => (
              <section
                key={c.name}
                ref={(el) => { sectionRefs.current[i] = el; }}
                className="bl-bh-emoji-section"
                aria-label={c.name}
              >
                <div className="bl-bh-emoji-heading">{c.name}</div>
                <div className="bl-bh-emoji-grid">
                  {c.list.map((e, j) => (
                    <button
                      key={`${i}-${j}-${e}`}
                      type="button"
                      className={`bl-bh-emoji-cell ${value === e ? "is-active" : ""}`}
                      onClick={() => {
                        onSave?.(e);
                        setOpen(false);
                      }}
                      title={e}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// NameEdit — h1-style text; click swaps in an inline <input>.
// =====================================================================
function NameEdit({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  useEffect(() => { setDraft(value); }, [value]);
  const commit = async () => {
    const next = draft.trim();
    if (next === value) { setEditing(false); return; }
    setEditing(false);
    if (next) await onSave(next);
  };
  if (editing) {
    return (
      <input
        type="text"
        className="bl-bh-name bl-bh-name-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        autoFocus
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        placeholder="Board name"
      />
    );
  }
  return (
    <button
      type="button"
      className="bl-bh-name bl-bh-name-btn"
      onClick={() => setEditing(true)}
      title="Click to rename"
    >
      {value || <span className="bl-bh-name-empty">Untitled board</span>}
    </button>
  );
}

// =====================================================================
// DescEdit — single line below the name; click to edit, blur to save.
// =====================================================================
function DescEdit({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(value);
  useEffect(() => { setDraft(value); }, [value]);
  const commit = async () => {
    const next = draft.trim();
    if (next === value) { setEditing(false); return; }
    setEditing(false);
    await onSave(next);
  };
  if (editing) {
    return (
      <input
        type="text"
        className="bl-bh-desc bl-bh-desc-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        autoFocus
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        placeholder="Type a description for this board"
      />
    );
  }
  return (
    <button
      type="button"
      className={`bl-bh-desc bl-bh-desc-btn ${value ? "" : "is-empty"}`}
      onClick={() => setEditing(true)}
      title="Click to edit description"
    >
      {value || "Type a description for this board"}
    </button>
  );
}

// =====================================================================
// Style
// =====================================================================
function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700&display=swap');
      .bl-bh, .bl-bh * { font-family: 'League Spartan', sans-serif; box-sizing: border-box; }
      .bl-bh {
        display: flex; flex-direction: column; gap: 4px;
      }
      .bl-bh-row {
        display: flex; align-items: center; gap: 10px;
      }

      /* Emoji button + dropdown */
      .bl-bh-emoji-wrap { position: relative; flex: 0 0 auto; }
      .bl-bh-emoji-btn {
        display: inline-flex; align-items: center; justify-content: center;
        width: 32px; height: 32px;
        background: transparent;
        border: none; border-radius: 8px;
        font-size: 22px; line-height: 1;
        cursor: pointer;
        transition: background 0.15s;
      }
      .bl-bh-emoji-btn:hover { background: ${TINT_BG}; }

      .bl-bh-emoji-panel {
        position: absolute; top: calc(100% + 6px); left: 0;
        width: 360px; max-width: calc(100vw - 24px);
        background: #FFFFFF;
        border: 1px solid ${BORDER};
        border-radius: 12px;
        box-shadow: 0 18px 40px -18px rgba(0, 15, 77, 0.30);
        z-index: 60;
        overflow: hidden;
        animation: bl-bh-fade 0.14s ease-out;
      }
      @keyframes bl-bh-fade {
        from { opacity: 0; transform: translateY(-4px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .bl-bh-emoji-cats {
        display: flex; gap: 2px;
        padding: 6px;
        background: ${TINT_BG};
        border-bottom: 1px solid ${BORDER};
      }
      .bl-bh-emoji-cat {
        flex: 1 1 auto;
        height: 28px;
        background: transparent;
        border: none; border-radius: 6px;
        font-size: 16px; line-height: 1;
        cursor: pointer;
        transition: background 0.12s;
      }
      .bl-bh-emoji-cat:hover { background: rgba(255,255,255,0.7); }
      .bl-bh-emoji-cat.is-active { background: #FFFFFF; box-shadow: 0 1px 3px rgba(0,15,77,0.10); }

      .bl-bh-emoji-scroll {
        height: 240px;
        overflow-y: auto;
        padding: 6px;
      }
      .bl-bh-emoji-section { margin-bottom: 10px; }
      .bl-bh-emoji-section:last-child { margin-bottom: 4px; }
      .bl-bh-emoji-heading {
        font-size: 10px; font-weight: 600; color: ${MUTED};
        text-transform: uppercase; letter-spacing: 0.06em;
        padding: 6px 4px 4px;
        position: sticky; top: 0;
        background: #FFFFFF; z-index: 1;
      }
      .bl-bh-emoji-grid {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 2px;
      }
      .bl-bh-emoji-cell {
        aspect-ratio: 1 / 1;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 6px;
        font-size: 17px; line-height: 1;
        cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center;
        transition: background 0.1s, transform 0.08s;
      }
      .bl-bh-emoji-cell:hover { background: ${TINT_BG}; transform: scale(1.1); }
      .bl-bh-emoji-cell.is-active {
        background: ${TINT_BG};
        border-color: ${PERIWINKLE};
      }

      /* Name (h1) */
      .bl-bh-name {
        flex: 1 1 auto;
        min-width: 0;
        font-size: 22px; font-weight: 600;
        color: ${NAVY_DEEP};
        letter-spacing: -0.01em;
        line-height: 1.25;
        background: transparent;
        border: none; outline: none;
        text-align: left;
        padding: 2px 4px;
        margin: 0 -4px;
        border-radius: 6px;
        cursor: text;
        font-family: inherit;
      }
      .bl-bh-name-btn { cursor: text; }
      .bl-bh-name-btn:hover { background: ${TINT_BG}; }
      .bl-bh-name-input {
        width: 100%;
      }
      .bl-bh-name-input:focus { background: ${TINT_BG}; }
      .bl-bh-name-empty { color: ${SOFT_MUTED}; font-weight: 500; font-style: italic; }

      /* Description (single-line muted) */
      .bl-bh-desc {
        font-size: 13px;
        color: ${NAVY_DEEP};
        line-height: 1.4;
        background: transparent;
        border: none; outline: none;
        text-align: left;
        padding: 2px 4px;
        margin: 0 -4px;
        border-radius: 6px;
        cursor: text;
        font-family: inherit;
        align-self: flex-start;
        max-width: 100%;
      }
      .bl-bh-desc-btn { cursor: text; }
      .bl-bh-desc-btn:hover { background: ${TINT_BG}; }
      .bl-bh-desc-btn.is-empty { color: ${SOFT_MUTED}; }
      .bl-bh-desc-input {
        width: 100%;
        max-width: 600px;
      }
      .bl-bh-desc-input::placeholder { color: ${SOFT_MUTED}; }
    `}</style>
  );
}
