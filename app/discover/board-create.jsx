// =====================================================================
// /app/create-board — Simple "Create board" form with full emoji picker.
//
// Source: brieflee beta → boards (XiLxhAkyOL9yrX). Writes:
//   • Name  (dsjPO)  ← text input
//   • Emoji (695Lf)  ← SELECT (allowToAddNewChoice = true)
//   • User  (enk5I)  ← LINKED_RECORD → current logged-in user
//
// On success it postMessages `brieflee:board-created` to the parent
// so the page that opened this modal can refetch its boards list.
//
// SOFTR UI SETUP:
//   1. Page: /create-board (modal, size sm or md)
//   2. Source: brieflee beta → boards (table XiLxhAkyOL9yrX)
//   3. Actions tab → enable Add Record
//   4. Visibility: signed-in users
// =====================================================================

import { useState, useMemo, useRef, useEffect } from "react";
import { useRecordCreate, q } from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { toast } from "sonner";

// Brand palette — only what this block uses
const NAVY_DEEP        = "#001364";
const PERIWINKLE       = "#879CF7";
const PERIWINKLE_HOVER = "#294FF6";
const MUTED            = "#6B7A99";
const BORDER           = "rgba(217, 224, 255, 0.55)";
const TINT_BG          = "rgba(135, 156, 247, 0.10)";
const SURFACE          = "#FAFBFF";

// ─── Full emoji set, grouped by category ──────────────────────
// Space-separated strings keep the source compact; split() at runtime.
// Categories follow the Unicode CLDR taxonomy. Most common emojis are
// covered (~1,000) — enough for any reasonable board name.
const EMOJI_CATEGORIES = [
  {
    name: "Smileys",
    icon: "😀",
    emojis: "😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 🫠 😉 😊 😇 🥰 😍 🤩 😘 😗 ☺️ 😚 😙 🥲 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🫢 🫣 🤫 🤔 🫡 🤐 🤨 😐 😑 😶 🫥 😶‍🌫️ 😏 😒 🙄 😬 😮‍💨 🤥 🫨 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🤧 🥵 🥶 🥴 😵 😵‍💫 🤯 🤠 🥳 🥸 😎 🤓 🧐 😕 🫤 😟 🙁 ☹️ 😮 😯 😲 😳 🥺 🥹 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 ☠️ 💩 🤡 👹 👺 👻 👽 👾 🤖 😺 😸 😹 😻 😼 😽 🙀 😿 😾",
  },
  {
    name: "People",
    icon: "👋",
    emojis: "👋 🤚 🖐 ✋ 🖖 🫱 🫲 🫳 🫴 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 🖕 👇 ☝️ 🫵 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 🫶 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🦿 🦵 🦶 👂 🦻 👃 🧠 🫀 🫁 🦷 🦴 👀 👁 👅 👄 🫦 💋 🩸 👶 🧒 👦 👧 🧑 👱 👨 🧔 👩 🧓 👴 👵 🙍 🙎 🙅 🙆 💁 🙋 🧏 🙇 🤦 🤷 👮 🕵 💂 🥷 👷 🫅 🤴 👸 👳 👲 🧕 🤵 👰 🤰 🫃 🫄 🤱 👼 🎅 🤶 🦸 🦹 🧙 🧚 🧛 🧜 🧝 🧞 🧟 🧌 💆 💇 🚶 🧍 🧎 🏃 💃 🕺 🕴 👯 🧖 🧗 🤺 🏇 ⛷ 🏂 🏌 🏄 🚣 🏊 ⛹ 🏋 🚴 🚵 🤸 🤼 🤽 🤾 🤹 🧘 🛀 🛌 👭 👫 👬 💏 💑 👪 🗣 👤 👥 🫂",
  },
  {
    name: "Animals",
    icon: "🐶",
    emojis: "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐻‍❄️ 🐨 🐯 🦁 🐮 🐷 🐽 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🐣 🐥 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🪱 🐛 🦋 🐌 🐞 🐜 🪰 🪲 🪳 🦟 🦗 🕷 🕸 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦞 🦀 🪸 🪼 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🦧 🐘 🦣 🦛 🦏 🐪 🐫 🦒 🦘 🦬 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🦮 🐕‍🦺 🐈 🐈‍⬛ 🪶 🐓 🦃 🦤 🦚 🦜 🦢 🦩 🕊 🐇 🦝 🦨 🦡 🦫 🦦 🦥 🐁 🐀 🐿 🦔 🐾 🐉 🐲 🌵 🎄 🌲 🌳 🌴 🪵 🌱 🌿 ☘️ 🍀 🎍 🪴 🎋 🍃 🍂 🍁 🍄 🐚 🪨 🌾 💐 🌷 🌹 🥀 🪻 🪷 🌺 🌸 🌼 🌻 🌞 🌝 🌛 🌜 🌚 🌕 🌖 🌗 🌘 🌑 🌒 🌓 🌔 🌙 🌎 🌍 🌏 🪐 💫 ⭐ 🌟 ✨ ⚡ ☄️ 💥 🔥 🌪 🌈 ☀️ 🌤 ⛅ 🌥 ☁️ 🌦 🌧 ⛈ 🌩 🌨 ❄️ ☃️ ⛄ 🌬 💨 💧 💦 🫧 ☔ ☂️ 🌊 🌫",
  },
  {
    name: "Food",
    icon: "🍔",
    emojis: "🍇 🍈 🍉 🍊 🍋 🍌 🍍 🥭 🍎 🍏 🍐 🍑 🍒 🍓 🫐 🥝 🍅 🫒 🥥 🥑 🍆 🥔 🥕 🌽 🌶 🫑 🥒 🥬 🥦 🧄 🧅 🍄 🥜 🫘 🌰 🫚 🫛 🍞 🥐 🥖 🫓 🥨 🥯 🥞 🧇 🧀 🍖 🍗 🥩 🥓 🍔 🍟 🍕 🌭 🥪 🌮 🌯 🫔 🥙 🧆 🥚 🍳 🥘 🍲 🫕 🥣 🥗 🍿 🧈 🧂 🥫 🫙 🍱 🍘 🍙 🍚 🍛 🍜 🍝 🍠 🍢 🍣 🍤 🍥 🥮 🍡 🥟 🥠 🥡 🦪 🍦 🍧 🍨 🍩 🍪 🎂 🍰 🧁 🥧 🍫 🍬 🍭 🍮 🍯 🍼 🥛 ☕ 🫖 🍵 🍶 🍾 🍷 🍸 🍹 🍺 🍻 🥂 🥃 🫗 🥤 🧋 🧃 🧉 🧊 🥢 🍽 🍴 🥄 🔪 🫕",
  },
  {
    name: "Activities",
    icon: "⚽",
    emojis: "⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🥏 🎱 🪀 🏓 🏸 🏒 🏑 🥍 🏏 🪃 🥅 ⛳ 🪁 🏹 🎣 🤿 🥊 🥋 🎽 🛹 🛼 🛷 ⛸ 🥌 🎿 ⛷ 🏂 🪂 🏋 🤼 🤸 ⛹ 🤺 🤾 🏌 🏇 🧘 🏄 🏊 🤽 🚣 🧗 🚵 🚴 🏆 🥇 🥈 🥉 🏅 🎖 🏵 🎗 🎫 🎟 🎪 🤹 🎭 🩰 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🪘 🎷 🎺 🪗 🎸 🪕 🎻 🪈 🎲 ♟ 🎯 🎳 🎮 🎰 🧩",
  },
  {
    name: "Travel",
    icon: "🚗",
    emojis: "🚗 🚕 🚙 🚌 🚎 🏎 🚓 🚑 🚒 🚐 🛻 🚚 🚛 🚜 🦯 🦽 🦼 🛴 🚲 🛵 🏍 🛺 🚨 🚔 🚍 🚘 🚖 🚡 🚠 🚟 🚃 🚋 🚞 🚝 🚄 🚅 🚈 🚂 🚆 🚇 🚊 🚉 ✈️ 🛫 🛬 🛩 💺 🛰 🚀 🛸 🚁 🛶 ⛵ 🚤 🛥 🛳 ⛴ 🚢 ⚓ 🛟 ⛽ 🚧 🚦 🚥 🚏 🗺 🗿 🗽 🗼 🏰 🏯 🏟 🎡 🎢 🎠 ⛲ ⛱ 🏖 🏝 🏜 🌋 ⛰ 🏔 🗻 🏕 ⛺ 🛖 🏠 🏡 🏘 🏚 🏗 🏭 🏢 🏬 🏣 🏤 🏥 🏦 🏨 🏪 🏫 🏩 💒 🏛 ⛪ 🕌 🕍 🛕 🕋 ⛩ 🛤 🛣 🗾 🎑 🏞 🌅 🌄 🌠 🎇 🎆 🌇 🌆 🏙 🌃 🌌 🌉 🌁",
  },
  {
    name: "Objects",
    icon: "💡",
    emojis: "⌚ 📱 📲 💻 ⌨️ 🖥 🖨 🖱 🖲 🕹 🗜 💽 💾 💿 📀 📼 📷 📸 📹 🎥 📽 🎞 📞 ☎️ 📟 📠 📺 📻 🎙 🎚 🎛 🧭 ⏱ ⏲ ⏰ 🕰 ⌛ ⏳ 📡 🔋 🪫 🔌 💡 🔦 🕯 🪔 🧯 🛢 💸 💵 💴 💶 💷 🪙 💰 💳 🪪 💎 ⚖️ 🪜 🧰 🪛 🔧 🔨 ⚒ 🛠 ⛏ 🪚 🔩 ⚙️ 🪤 🧱 ⛓ 🧲 🔫 💣 🧨 🪓 🔪 🗡 ⚔️ 🛡 🚬 ⚰️ 🪦 ⚱️ 🏺 🔮 📿 🧿 🪬 💈 ⚗️ 🔭 🔬 🕳 🩹 🩺 🩻 💊 💉 🩸 🧬 🦠 🧫 🧪 🌡 🧹 🪠 🧺 🧻 🚽 🚰 🚿 🛁 🛀 🧼 🪥 🪒 🧽 🪣 🧴 🛎 🔑 🗝 🚪 🪑 🛋 🛏 🛌 🧸 🪆 🖼 🪞 🪟 🛍 🛒 🎁 🎈 🎏 🎀 🪄 🪅 🎊 🎉 🎎 🏮 🎐 🧧 ✉️ 📩 📨 📧 💌 📥 📤 📦 🏷 🪧 📪 📫 📬 📭 📮 📯 📜 📃 📄 📑 🧾 📊 📈 📉 🗒 🗓 📆 📅 🗑 📇 🗃 🗳 🗄 📋 📁 📂 🗂 🗞 📰 📓 📔 📒 📕 📗 📘 📙 📚 📖 🔖 🧷 🔗 📎 🖇 📐 📏 🧮 📌 📍 ✂️ 🖊 🖋 ✒️ 🖌 🖍 📝 ✏️ 🔍 🔎 🔏 🔐 🔒 🔓",
  },
  {
    name: "Symbols",
    icon: "❤️",
    emojis: "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 🩷 🩵 🩶 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 ♾ ☮️ ✝️ ☪️ 🕉 ☸️ ✡️ 🔯 🕎 ☯️ ☦️ 🛐 ⛎ ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ 🆔 ⚛️ 🉑 ☢️ ☣️ 📴 📳 🈶 🈚 🈸 🈺 🈷 ✴️ 🆚 💮 🉐 ㊙️ ㊗️ 🈴 🈵 🈹 🈲 🅰️ 🅱️ 🆎 🆑 🅾️ 🆘 ❌ ⭕ 🛑 ⛔ 📛 🚫 💯 💢 ♨️ 🚷 🚯 🚳 🚱 🔞 📵 🚭 ❗ ❕ ❓ ❔ ‼️ ⁉️ 🔅 🔆 〽️ ⚠️ 🚸 🔱 ⚜️ 🔰 ♻️ ✅ 🈯 💹 ❇️ ✳️ ❎ 🌐 💠 Ⓜ️ 🌀 💤 🏧 🚾 ♿ 🅿️ 🛗 🈳 🈂 🛂 🛃 🛄 🛅 🛜 🚹 🚺 🚼 ⚧ 🚻 🚮 🎦 📶 🈁 🔣 ℹ️ 🔤 🔡 🔠 🆖 🆗 🆙 🆒 🆕 🆓 0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟 🔢 #️⃣ *️⃣ ⏏️ ▶️ ⏸ ⏯ ⏹ ⏺ ⏭ ⏮ ⏩ ⏪ ⏫ ⏬ ◀️ 🔼 🔽 ➡️ ⬅️ ⬆️ ⬇️ ↗️ ↘️ ↙️ ↖️ ↕️ ↔️ ↪️ ↩️ ⤴️ ⤵️ 🔀 🔁 🔂 🔄 🔃 🎵 🎶 ➕ ➖ ➗ ✖️ 🟰 🟧 💲 💱 ™️ ©️ ®️ 👁‍🗨 🔚 🔙 🔛 🔝 🔜 〰️ ➰ ➿ ✔️ ☑️ 🔘 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤 🔺 🔻 🔸 🔹 🔶 🔷 🔳 🔲 ▪️ ▫️ ◾ ◽ ◼️ ◻️ ⬛ ⬜ 🟥 🟨 🟩 🟦 🟪 🟫 🔈 🔇 🔉 🔊 🔔 🔕 📣 📢 💬 💭 🗯 ♠️ ♣️ ♥️ ♦️ 🃏 🎴 🀄",
  },
  {
    name: "Flags",
    icon: "🏁",
    emojis: "🏁 🚩 🎌 🏴 🏳️ 🏳️‍🌈 🏳️‍⚧️ 🏴‍☠️ 🇦🇨 🇦🇩 🇦🇪 🇦🇫 🇦🇬 🇦🇮 🇦🇱 🇦🇲 🇦🇴 🇦🇶 🇦🇷 🇦🇸 🇦🇹 🇦🇺 🇦🇼 🇦🇽 🇦🇿 🇧🇦 🇧🇧 🇧🇩 🇧🇪 🇧🇫 🇧🇬 🇧🇭 🇧🇮 🇧🇯 🇧🇱 🇧🇲 🇧🇳 🇧🇴 🇧🇷 🇧🇸 🇧🇹 🇧🇻 🇧🇼 🇧🇾 🇧🇿 🇨🇦 🇨🇨 🇨🇩 🇨🇫 🇨🇬 🇨🇭 🇨🇮 🇨🇰 🇨🇱 🇨🇲 🇨🇳 🇨🇴 🇨🇵 🇨🇷 🇨🇺 🇨🇻 🇨🇼 🇨🇽 🇨🇾 🇨🇿 🇩🇪 🇩🇬 🇩🇯 🇩🇰 🇩🇲 🇩🇴 🇩🇿 🇪🇦 🇪🇨 🇪🇪 🇪🇬 🇪🇭 🇪🇷 🇪🇸 🇪🇹 🇪🇺 🇫🇮 🇫🇯 🇫🇰 🇫🇲 🇫🇴 🇫🇷 🇬🇦 🇬🇧 🇬🇩 🇬🇪 🇬🇫 🇬🇬 🇬🇭 🇬🇮 🇬🇱 🇬🇲 🇬🇳 🇬🇵 🇬🇶 🇬🇷 🇬🇸 🇬🇹 🇬🇺 🇬🇼 🇬🇾 🇭🇰 🇭🇲 🇭🇳 🇭🇷 🇭🇹 🇭🇺 🇮🇨 🇮🇩 🇮🇪 🇮🇱 🇮🇲 🇮🇳 🇮🇴 🇮🇶 🇮🇷 🇮🇸 🇮🇹 🇯🇪 🇯🇲 🇯🇴 🇯🇵 🇰🇪 🇰🇬 🇰🇭 🇰🇮 🇰🇲 🇰🇳 🇰🇵 🇰🇷 🇰🇼 🇰🇾 🇰🇿 🇱🇦 🇱🇧 🇱🇨 🇱🇮 🇱🇰 🇱🇷 🇱🇸 🇱🇹 🇱🇺 🇱🇻 🇱🇾 🇲🇦 🇲🇨 🇲🇩 🇲🇪 🇲🇫 🇲🇬 🇲🇭 🇲🇰 🇲🇱 🇲🇲 🇲🇳 🇲🇴 🇲🇵 🇲🇶 🇲🇷 🇲🇸 🇲🇹 🇲🇺 🇲🇻 🇲🇼 🇲🇽 🇲🇾 🇲🇿 🇳🇦 🇳🇨 🇳🇪 🇳🇫 🇳🇬 🇳🇮 🇳🇱 🇳🇴 🇳🇵 🇳🇷 🇳🇺 🇳🇿 🇴🇲 🇵🇦 🇵🇪 🇵🇫 🇵🇬 🇵🇭 🇵🇰 🇵🇱 🇵🇲 🇵🇳 🇵🇷 🇵🇸 🇵🇹 🇵🇼 🇵🇾 🇶🇦 🇷🇪 🇷🇴 🇷🇸 🇷🇺 🇷🇼 🇸🇦 🇸🇧 🇸🇨 🇸🇩 🇸🇪 🇸🇬 🇸🇭 🇸🇮 🇸🇯 🇸🇰 🇸🇱 🇸🇲 🇸🇳 🇸🇴 🇸🇷 🇸🇸 🇸🇹 🇸🇻 🇸🇽 🇸🇾 🇸🇿 🇹🇦 🇹🇨 🇹🇩 🇹🇫 🇹🇬 🇹🇭 🇹🇯 🇹🇰 🇹🇱 🇹🇲 🇹🇳 🇹🇴 🇹🇷 🇹🇹 🇹🇻 🇹🇼 🇹🇿 🇺🇦 🇺🇬 🇺🇲 🇺🇳 🇺🇸 🇺🇾 🇺🇿 🇻🇦 🇻🇨 🇻🇪 🇻🇬 🇻🇮 🇻🇳 🇻🇺 🇼🇫 🇼🇸 🇽🇰 🇾🇪 🇾🇹 🇿🇦 🇿🇲 🇿🇼",
  },
];

const createFields = q.select({
  name:  "dsjPO",
  emoji: "695Lf",
  user:  "enk5I",
});

export default function Block() {
  const user = useCurrentUser();
  const createRecord = useRecordCreate({ fields: createFields });

  const [name, setName]     = useState("");
  const [emoji, setEmoji]   = useState("📋");
  const [activeCategory, setActiveCategory] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy]     = useState(false);

  // Pre-split each category's emoji string once so we don't re-split
  // on every render.
  const categories = useMemo(
    () => EMOJI_CATEGORIES.map((c) => ({
      ...c,
      list: c.emojis.split(" ").filter(Boolean),
    })),
    [],
  );

  // Refs to each category's grid <section> so the nav buttons can
  // scroll into view rather than reflow the list.
  const sectionRefs = useRef([]);
  const scrollRef   = useRef(null);
  // Track which section is currently in view so the nav highlights
  // the right tab while the user scrolls.
  useEffect(() => {
    if (!pickerOpen) return;
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
  }, [pickerOpen]);
  const jumpTo = (i) => {
    const el = sectionRefs.current[i];
    const wrap = scrollRef.current;
    if (el && wrap) wrap.scrollTo({ top: el.offsetTop, behavior: "smooth" });
  };

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Give the board a name.");
      return;
    }
    if (!user?.id) {
      toast.error("You need to be signed in.");
      return;
    }
    setBusy(true);
    try {
      const created = await createRecord.mutateAsync({
        name:  trimmed,
        emoji: { label: emoji },
        user:  [{ id: user.id }],
      });
      toast.success("Board created");
      try {
        window.parent?.postMessage({
          type: "brieflee:board-created",
          boardId: created?.id || created?.recordId || "",
        }, "*");
      } catch { /* ignore cross-origin */ }
      try { window.parent?.closeSwModal?.(); } catch { /* ignore */ }
      setName("");
      setEmoji("📋");
    } catch (e) {
      console.error("Create board failed:", e);
      toast.error("Couldn't create board", { description: e?.message || "Try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Style />
      <div className="bl-cb">
        <h2 className="bl-cb-title">Create board</h2>

        <label className="bl-cb-field">
          <span className="bl-cb-label">Name</span>
          <input
            type="text"
            className="bl-cb-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What's this board for?"
            autoFocus
            disabled={busy}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          />
        </label>

        <div className="bl-cb-field">
          <span className="bl-cb-label">Emoji</span>
          <button
            type="button"
            className="bl-cb-trigger"
            aria-expanded={pickerOpen}
            onClick={() => setPickerOpen((v) => !v)}
            disabled={busy}
          >
            <span className="bl-cb-trigger-emoji">{emoji}</span>
            <span className="bl-cb-trigger-hint">
              {pickerOpen ? "Tap an emoji or close" : "Tap to change"}
            </span>
            <span
              className="bl-cb-trigger-caret"
              style={{ transform: pickerOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              aria-hidden
            >▾</span>
          </button>
          {pickerOpen && (
            <div className="bl-cb-picker">
              <div className="bl-cb-cat-nav" role="tablist" aria-label="Emoji category">
                {categories.map((c, i) => (
                  <button
                    key={c.name}
                    type="button"
                    role="tab"
                    aria-selected={activeCategory === i}
                    className={`bl-cb-cat ${activeCategory === i ? "is-active" : ""}`}
                    onClick={() => jumpTo(i)}
                    title={c.name}
                  >
                    {c.icon}
                  </button>
                ))}
              </div>
              <div className="bl-cb-grid-scroll" ref={scrollRef}>
                {categories.map((c, i) => (
                  <section
                    key={c.name}
                    ref={(el) => { sectionRefs.current[i] = el; }}
                    className="bl-cb-cat-section"
                    aria-label={c.name}
                  >
                    <div className="bl-cb-cat-heading">{c.name}</div>
                    <div className="bl-cb-grid">
                      {c.list.map((e, j) => (
                        <button
                          key={`${i}-${j}-${e}`}
                          type="button"
                          className={`bl-cb-emoji ${emoji === e ? "is-active" : ""}`}
                          onClick={() => { setEmoji(e); setPickerOpen(false); }}
                          disabled={busy}
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

        <button
          type="button"
          className="bl-cb-submit"
          onClick={submit}
          disabled={busy || !name.trim()}
        >
          {busy ? "Creating…" : "Create board"}
        </button>
      </div>
    </>
  );
}

function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700&display=swap');
      .bl-cb, .bl-cb * { font-family: 'League Spartan', sans-serif; box-sizing: border-box; }
      .bl-cb {
        max-width: 460px;
        margin: 0 auto;
        /* Extra top/bottom padding so the form sits with breathing room
           inside a Softr modal — the modal body has no built-in inset. */
        padding: 40px 24px;
        background: ${SURFACE};
        display: flex; flex-direction: column; gap: 18px;
      }
      .bl-cb-title {
        font-size: 22px; font-weight: 600; color: ${NAVY_DEEP};
        margin: 0; letter-spacing: -0.01em;
      }
      .bl-cb-field { display: flex; flex-direction: column; gap: 6px; }
      .bl-cb-label {
        font-size: 12px; font-weight: 500; color: ${NAVY_DEEP};
        letter-spacing: 0.01em;
      }
      .bl-cb-trigger {
        display: inline-flex; align-items: center; gap: 10px;
        height: 44px; padding: 0 14px;
        background: #FFFFFF;
        border: 1px solid ${BORDER};
        border-radius: 10px;
        cursor: pointer;
        text-align: left;
        transition: border-color 0.15s, background 0.15s;
      }
      .bl-cb-trigger:hover:not(:disabled) { border-color: ${PERIWINKLE}; }
      .bl-cb-trigger:disabled { opacity: 0.55; cursor: not-allowed; }
      .bl-cb-trigger[aria-expanded="true"] {
        border-color: ${PERIWINKLE};
        background: ${TINT_BG};
      }
      .bl-cb-trigger-emoji {
        font-size: 22px; line-height: 1;
        flex-shrink: 0;
      }
      .bl-cb-trigger-hint {
        flex: 1 1 auto;
        font-size: 13px; color: ${MUTED};
      }
      .bl-cb-trigger-caret {
        color: ${MUTED};
        font-size: 12px;
        transition: transform 0.15s;
      }
      .bl-cb-input {
        height: 40px; padding: 0 12px;
        background: #FFFFFF;
        border: 1px solid ${BORDER};
        border-radius: 10px;
        font-size: 14px; color: ${NAVY_DEEP};
        outline: none; transition: border-color 0.15s;
      }
      .bl-cb-input:focus { border-color: ${PERIWINKLE}; }
      .bl-cb-input:disabled { opacity: 0.6; cursor: not-allowed; }

      .bl-cb-picker {
        margin-top: 6px;
        background: #FFFFFF;
        border: 1px solid ${BORDER};
        border-radius: 12px;
        overflow: hidden;
        animation: bl-cb-slide 0.16s ease-out;
      }
      @keyframes bl-cb-slide {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .bl-cb-cat-nav {
        display: flex; align-items: center; gap: 2px;
        padding: 6px;
        border-bottom: 1px solid ${BORDER};
        background: ${TINT_BG};
      }
      .bl-cb-cat {
        flex: 1 1 auto;
        height: 32px;
        background: transparent;
        border: none;
        border-radius: 7px;
        font-size: 18px; line-height: 1;
        cursor: pointer;
        transition: background 0.15s;
      }
      .bl-cb-cat:hover { background: rgba(255,255,255,0.7); }
      .bl-cb-cat.is-active { background: #FFFFFF; box-shadow: 0 1px 3px rgba(0,15,77,0.12); }

      .bl-cb-grid-scroll {
        height: 280px;
        overflow-y: auto;
        padding: 8px;
      }
      .bl-cb-cat-section {
        margin-bottom: 12px;
      }
      .bl-cb-cat-section:last-child { margin-bottom: 4px; }
      .bl-cb-cat-heading {
        font-size: 10px; font-weight: 600; color: ${MUTED};
        text-transform: uppercase; letter-spacing: 0.06em;
        padding: 6px 4px 4px;
        position: sticky; top: 0;
        background: #FFFFFF;
        z-index: 1;
      }
      .bl-cb-grid {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 2px;
      }
      .bl-cb-emoji {
        aspect-ratio: 1 / 1;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 6px;
        font-size: 18px; line-height: 1;
        cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center;
        transition: background 0.1s, transform 0.08s;
      }
      .bl-cb-emoji:hover:not(:disabled) {
        background: ${TINT_BG};
        transform: scale(1.1);
      }
      .bl-cb-emoji.is-active {
        background: ${TINT_BG};
        border-color: ${PERIWINKLE};
      }
      .bl-cb-emoji:disabled { opacity: 0.5; cursor: not-allowed; }

      .bl-cb-submit {
        margin-top: 4px;
        height: 44px;
        background: ${PERIWINKLE};
        color: #FFFFFF;
        border: none; border-radius: 12px;
        font-size: 14px; font-weight: 500;
        cursor: pointer;
        transition: background 0.15s;
      }
      .bl-cb-submit:hover:not(:disabled) { background: ${PERIWINKLE_HOVER}; }
      .bl-cb-submit:disabled { opacity: 0.55; cursor: not-allowed; }

      @media (max-width: 480px) {
        .bl-cb-grid { grid-template-columns: repeat(7, 1fr); }
        .bl-cb-grid-scroll { height: 260px; }
      }
    `}</style>
  );
}
