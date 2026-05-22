// =====================================================================
// Vibe Coding block: AI UGC Storyboard Generator (lead magnet)
// =====================================================================
// /ai-ugc-storyboard-generator
//
// Pick shots from a library of 279 (sourced from "AI UGC Prompts Master"),
// drop them into a storyboard, add a script line per shot, copy or
// download as CSV. Drag-and-drop works on desktop; click-to-add works
// everywhere (including touch screens).
//
// SOFTR UI SETUP:
//   1. Create a Softr page at /ai-ugc-storyboard-generator
//   2. Source tab → Database: Lead Magnets → Table: AI UGC Prompts Master
//   3. Visibility tab → public
// =====================================================================

import { useEffect, useMemo, useState } from "react";
import { useRecords, q } from "@/lib/datasource";
import {
  Check, ChevronDown, ChevronUp, Copy, Download, GripVertical,
  Search, Shuffle, Sparkles, Trash2, X,
} from "lucide-react";

const shotFields = q.select({
  name:           "4QSmO",  // SINGLE_LINE_TEXT
  category:       "NQwnv",  // SELECT
  subcategory:    "eecej",  // SELECT
  description:    "GsAE2",  // SINGLE_LINE_TEXT
  cloudinaryUrl:  "OlAxK",  // URL
  examplePrompt:  "qA2jz",  // LONG_TEXT
  templatePrompt: "E0uvw",  // LONG_TEXT
});

const NAVY = "#001364";
const PERIWINKLE = "#879CF7";
const BRIEFLEE_EYES = "https://res.cloudinary.com/dchroynzv/image/upload/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png";

// Same Softr workflow used by the checklist + brief generator.
const WORKFLOW_URL = "https://workflows-api.softr.io/v1/workflows/1e28685f-1a24-4042-80ac-cadfedef7336/executions/22b90d5d-a73b-43b5-ac1b-f24843b781bd";

// Personal / throwaway email domains — blocked across every Brieflee
// lead-magnet form to keep lead quality high. Mirrored in every magnet;
// keep in sync if the list changes.
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com",
  "yahoo.com", "yahoo.co.uk", "yahoo.fr", "yahoo.de", "ymail.com",
  "hotmail.com", "hotmail.co.uk", "hotmail.fr", "live.com", "live.co.uk",
  "msn.com", "outlook.com", "outlook.co.uk",
  "aol.com",
  "icloud.com", "me.com", "mac.com",
  "proton.me", "protonmail.com", "pm.me",
  "mail.com", "gmx.com", "gmx.de", "gmx.net",
  "yandex.com", "yandex.ru",
  "zoho.com", "hey.com",
  "fastmail.com", "fastmail.fm",
  "tutanota.com", "tutanota.de",
  "mailinator.com", "guerrillamail.com", "10minutemail.com",
  "tempmail.com", "trashmail.com", "throwawaymail.com", "yopmail.com",
]);

function isWorkEmail(value) {
  const v = (value || "").trim().toLowerCase();
  if (!v) return false;
  const at = v.lastIndexOf("@");
  if (at === -1) return false;
  return !FREE_EMAIL_DOMAINS.has(v.slice(at + 1));
}

// The 42 UGC formats — hardcoded because this block sources from
// AI UGC Prompts Master (not Formats), and Softr Vibe blocks only
// allow one Source tab. Each entry has up to 3 sample video URLs (used
// for the fanned-stack thumbnail, same pattern as /ugc-video-examples)
// + a one-line description from the Formats table's Description field.
// Keep in sync if Bev adds new formats.
const FORMATS = [
  { name: "AI Generated", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1539102087635186/69fe34969f9320f2b1b0861d/42f5670a-d595-4fca-883d-4da4fb7de623.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2480820659031774/69f6c3e7280f6afea1796502/d9d08339-ccd7-4009-a845-0f073703d1fc.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1288914972716693/69fcd59d9f9320f2b1a16cd9/7b7b5d7c-8369-4f98-b78a-7271419e9fa1.mp4"], desc: "Imagery your camera couldn't capture" },
  { name: "ASMR", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/26273338205702663/69fefc4d08c1a6eaf90e35cc/f1b99388-a6cb-4ee2-9a3a-3bb593b33cc5.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1453974715994143/69ff1ac608c1a6eaf90f86ab/1bb01da5-9c18-423f-bafa-c3409198c79c.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1650586402939477/69fcceaf9f9320f2b1a110b8/03949dfd-36ad-4c8b-bae2-7e35056f7fa7.mp4"], desc: "Show your product through sound" },
  { name: "Before and After", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/826249757202567/69ff257e08c1a6eaf90fd23e/2ecfe847-c072-4291-b0db-90321b3fb5ff.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/997349255980567/69fcceaf9f9320f2b1a110bf/ad15bbff-2558-4652-88c0-a41d11fc39fc.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2166649664155043/69ff586b08c1a6eaf911064c/198704e6-259d-41b5-b343-8736a024b7ae.mp4"], desc: "One frame of the before" },
  { name: "Behind The Scenes", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2074472573134109/69fd76f99f9320f2b1a8b16e/4b4f80c2-e4e6-49b2-adbb-f199ad55a58a.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1311243414274770/69fccf999f9320f2b1a11ffd/0684dffb-1d59-4252-9dce-2fcf1d0d5c8c.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1445797473361585/69e655fec58c09bbcefb07a5/a24a6e09-ba0a-49f7-8a5c-69ff776cebcf.mp4"], desc: "What the audience never sees" },
  { name: "Celebrity", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/992983046624907/69fd954f9f9320f2b1a9dbd3/79ed3a5b-3e97-41f0-8655-2553922e5eb8.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1280230653593745/69f1dcd9bdb47646c4ab3532/9c64dd18-ec20-455a-b10a-275a2dcd49c6.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/26513328624926776/6999513ed7b54bd21a7c642b/1f8887ef-88c7-49d9-9353-7a018f8e358e.mp4"], desc: "A face your audience already trusts" },
  { name: "Cinematic B-Roll", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/993171706996549/69fbf8bb9f9320f2b19dbbd6/fc1e675c-a0ac-47ea-a1a3-e535ba89fb47.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1207098988040414/69fccc139f9320f2b1a0e4d2/107106e7-27c9-4552-980a-d5612a6494c9.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1544067653729767/69fccc649f9320f2b1a0eb17/a24f9c65-993b-4a58-863f-7b2d3009bb7d.mp4"], desc: "Brand-led, beautifully shot moments" },
  { name: "Comment Response", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/814335377989198/69f30c80bdb47646c4b381b1/c1c60aee-15aa-4145-aa06-5ba3eff5bc0a.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1495263685389096/69fc3a319f9320f2b19eb378/521d8802-e766-4dca-ba26-8be8f5124a19.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1636968607555545/69f25ae0bdb47646c4aeac1e/2d483aa6-d836-4f26-8877-a5699a8d86b2.mp4"], desc: "Frame the ad as a reply" },
  { name: "Demo", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1847378409273214/69ff1afa08c1a6eaf90f890f/038b9e5e-39f7-4fe4-9119-3e93f79d5af1.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1548946033595808/69ff339008c1a6eaf9102910/d652cc8c-2171-4297-8f8e-8fdbb5b81a04.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2222893848474208/69fefddc08c1a6eaf90e46d6/b6b34e83-7d26-4191-b8d4-08b63a7dc23c.mp4"], desc: "Show it working" },
  { name: "Duet", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2148826109305543/69fbede19f9320f2b19d723c/b17ba13a-299f-4295-8704-8a4c235460ab.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2511326736005461/69fccd2d9f9320f2b1a0f96d/ee956cc7-d4fa-4c00-b5b9-f2914f28602f.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/965731989157771/69fefd8f08c1a6eaf90e4296/704b3cbd-0b5b-437c-9adc-7a37f5ad6fba.mp4"], desc: "Splitscreen with another video" },
  { name: "Educational", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/26925557923717582/69e8f287bdb47646c4836ab7/1424c942-6700-47d8-b4bb-f5de4cc9f90e.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/26383093261340327/69de3b1b5f662ed7aa2e0159/779b161c-0da1-4e5e-a6b3-011d2fdddbbd.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1706495643869303/69decd0c3f18261d3fd00d86/d0a27450-6042-404e-a0ee-a0178ce8b811.mp4"], desc: "Teach something they didn't know" },
  { name: "Expert Explainer", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1729883661659771/69fce06d9f9320f2b1a24549/d3eac495-2aba-480f-b7a4-b9973e3e239f.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/969768732118363/69fcf2049f9320f2b1a31264/89e94b42-e134-4825-848a-7cec57a97b3c.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1477341537503717/69f98b4146012bac5d82048e/b90ebf0b-d524-413c-8da1-82941464bc76.mp4"], desc: "An authority explains the product" },
  { name: "Founder", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1284979633759309/69fcfa1c9f9320f2b1a38302/85fda2ba-caea-44d0-8a56-dc11c68a6635.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1609278733465083/69fefa0508c1a6eaf90e1eaf/388c8dfd-1cf9-40ed-813b-1a2453c016f1.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2074472573134109/69fd76f99f9320f2b1a8b16e/4b4f80c2-e4e6-49b2-adbb-f199ad55a58a.mp4"], desc: "You, on camera" },
  { name: "Greenscreen", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1506899424324176/69f6e752280f6afea179e598/49e06cd1-3c8e-4648-90cf-a6659dc6c0bd.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1716657453080499/69fccd439f9320f2b1a0fb63/6837715b-a50b-4d37-82da-6cac73fb08d0.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1388180139785375/69fd18909f9320f2b1a4d53b/cac0e9b6-d154-41ad-bdf6-71689a529abc.mp4"], desc: "You, with a screen behind you" },
  { name: "Grid Swap", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2074129713144290/69f33989bdb47646c4b501d8/6524e4f8-2c79-402b-bc20-1ff8d8c2f165.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2108050316414234/69fccd4a9f9320f2b1a0fc61/1125b0d8-9045-4372-aec2-2bce291fe604.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1987980325420374/69ff00eb08c1a6eaf90e67a3/e500e2f2-be6b-46f0-9731-e2b036fcdc0d.mp4"], desc: "Same frame, one element swaps in" },
  { name: "How To", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/947569901477422/69ff1afa08c1a6eaf90f88b6/cd661be8-8c0d-4c71-90c7-d509934b7560.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/970964365671431/69fccf6d9f9320f2b1a11d45/484b8e6a-34be-40b7-a37b-869fbaf12d23.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1708869660779376/69ff7a7408c1a6eaf911ac09/5801058b-10ba-46df-9639-d5f5d158ea44.mp4"], desc: "Step one, step two, result" },
  { name: "Humour", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/949478807871737/69fbf8b79f9320f2b19dba63/6378d217-f4d6-437d-b448-4f53cdb4bf30.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/3223664521167031/69ff042f08c1a6eaf90e80ee/f775c866-c16e-4c0d-8829-385847056c65.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1452137506087073/69fd04889f9320f2b1a3f8f0/ef658399-0146-48bd-8a76-a3bd6f35b837.mp4"], desc: "Lead with the laugh, land the product" },
  { name: "Influencer Endorsement", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2177021209725365/69f13d63bdb47646c4a7964c/406447ae-3d22-4384-8f03-52bfa16a62b0.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1249072667438968/69f1acd4bdb47646c4a9ba83/61fe594f-5a62-4842-a554-d0b3fb8d18f1.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/3901104030024963/69ff26d808c1a6eaf90fddfa/e522c7fd-2c96-41f1-8be4-caad616079d5.mp4"], desc: "A creator they already follow" },
  { name: "Listicle", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1476002994213116/69ff106508c1a6eaf90f3300/4e5bea90-57b5-4f5b-a93e-da744be6b4a3.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1305415705012599/69fd39f19f9320f2b1a64814/faef2916-47d3-4863-acb7-351255c3d983.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2364370287380523/69fbbb209f9320f2b19b9397/259a487f-45ea-4bff-9a3b-795a5883573f.mp4"], desc: "Numbered, snappy, easy to follow" },
  { name: "Meme", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/959052956990072/69fcccee9f9320f2b1a0f75e/ce61819b-a7d2-4214-8d54-8480e0b1728d.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/811065625094650/69fcd1619f9320f2b1a13d70/cde46b82-9700-40a6-88ac-9c577c97bb40.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/997757716003514/69f9d1fe46012bac5d829c8f/234c06e7-e3c1-4c91-b3ee-bef1cbcbf9cb.mp4"], desc: "A current meme, used right" },
  { name: "Montage", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2432328390620599/69fccf999f9320f2b1a11ff8/d30bc866-1eaa-40c1-b0da-caa191045517.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1730214728417969/69fd5db69f9320f2b1a7b9e5/62bf0a45-9240-4345-a0ef-6c95b3c8ba93.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2384269982056400/69ff49fe08c1a6eaf910b52e/76e1dfb5-24b4-4447-b2d5-6bf429c00210.mp4"], desc: "Many shots, cut fast" },
  { name: "Pattern Interrupt", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/927361589680033/69fd2d6c9f9320f2b1a5c8e9/8eeb4b60-5f6a-422d-aa3c-057a6bc55795.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/943391541961169/69c9da581ae2df5b3c1d4ece/83975a22-cd48-4865-9f7a-240c01f9f188.mp4"], desc: "Opening with no obvious link to the product" },
  { name: "Podcast", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/959417213562148/69fefde208c1a6eaf90e49f1/83580862-f05d-44e3-9b00-6034c5a77c15.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/965264132870984/69fb42c846012bac5d86414a/5cecfe9d-ddc4-4845-bafd-ae60683f94ce.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1481211863454827/69ff091f08c1a6eaf90eccda/4bc0a557-d381-4246-99b2-6e200a92e457.mp4"], desc: "Two people, mics, jump cuts" },
  { name: "Postit", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1000779272689783/69fd6c8f9f9320f2b1a849b4/29a3d273-50a3-426f-912a-c00c96938f67.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1489969452634063/69fca8819f9320f2b1a03744/bf5f11b7-59d7-427b-8bb6-f7d47dbe894c.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1387971346683478/69f57e99280f6afea1724b5f/f89ad799-8234-4a73-b88c-bf8e4305f60c.mp4"], desc: "Sticky notes around the product" },
  { name: "POV", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/4495823210737103/69f6c3e9280f6afea17965c7/1d23f1a8-45fd-4148-b3e6-13a63d032b33.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1548131650071244/69ff1e0208c1a6eaf90f9b0f/30fab2d8-9f54-4b6c-ac77-6403e14650a1.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/936500102586285/69fefe4e08c1a6eaf90e4f0a/e8f57c1e-1bde-40b3-b337-ba01ff1c4f61.mp4"], desc: "Shot from the viewer's perspective" },
  { name: "Press", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1469376234882251/69f5010d280f6afea17040c2/2ab2047b-0bb7-4740-a1bf-0fd1bb49435d.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1684136069265999/69f8965f280f6afea17d8c9f/0a0edaa6-0ca2-443f-bc79-eb9577d54854.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1646661669994146/69eb5ebebdb47646c48f6a72/0f7667dd-ac6d-4945-a9de-6b2e3086cfcd.mp4"], desc: "Logos, headlines, article screenshots" },
  { name: "Problem Agitation", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1688175742215548/69ff9e8d08c1a6eaf9125217/2ed207c4-7158-4183-9feb-e20e9c970392.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/26596660979991001/69f73502280f6afea17a3b8e/d98b4d56-9d40-41fd-8656-4de517e4d673.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/960416513388202/69fff28808c1a6eaf913d723/1212902b-1609-4c85-b4f2-759c7b3c1677.mp4"], desc: "Show the problem at its worst" },
  { name: "Reaction Video", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/974355395134117/69f6e3b7280f6afea179d945/ec170f89-c1c7-443c-82a7-cc13188d726e.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1742924990390013/69fe00b79f9320f2b1ae6402/2fb109e5-8e50-4598-8e39-d6837c866308.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1020461623650546/69fcdb1c9f9320f2b1a1e061/05d0cade-e012-472b-8862-bae59563ae1c.mp4"], desc: "Someone reacting in real time" },
  { name: "Review", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1606867430374376/69fcd59d9f9320f2b1a16d2e/aaeb4d72-8ba8-446f-a367-32d1e59e658f.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1501829331481318/69fbac7e9f9320f2b19af494/68828e24-9308-40ec-854e-c139fb27dbb1.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2018948998701726/69fbdfa09f9320f2b19ce688/8a695602-c39a-476b-8242-8e85dc2e550c.mp4"], desc: "A real review, read or shown" },
  { name: "Screen Recording", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/4453521534925194/69ff0b8608c1a6eaf90f04b6/aaf49b82-5222-4c63-acae-532df016f1e8.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/997694569626846/69fe34979f9320f2b1b08662/5a533fb4-0f2a-49fd-a3f7-238857f40c77.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2260412234365744/69ff0e1708c1a6eaf90f2144/5495d1d1-17b5-43c0-bbee-70263c28214a.mp4"], desc: "Phone or computer screen, straight" },
  { name: "Skit", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2520628788391840/69f606ac280f6afea1756d19/fe4a15d7-10de-4efb-bf6c-fdd90f05c712.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2143063216491031/69fbebfc9f9320f2b19d5358/7eb107b7-f2d0-40e8-9e9b-e29f34906a0f.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1728432004991669/69f6e752280f6afea179e59a/3092237e-5be7-4a01-a68c-79821a2c985d.mp4"], desc: "A mini-story with characters" },
  { name: "Social Proof Mashup", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1300467098840754/69fefd8f08c1a6eaf90e42a7/1bc7ca5b-c848-434d-8692-7493f21edc5d.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/956235923838181/69ff059f08c1a6eaf90e92cf/44e240e2-3309-4cb5-a903-9e4e766355dc.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1285431753786403/69fcee2f9f9320f2b1a2e88e/47453679-7d67-46c1-b4a8-baee6b645e41.mp4"], desc: "Many pieces of proof, cut fast" },
  { name: "Stitch", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1000043605869180/69fd60729f9320f2b1a7d545/e502c7f2-69fd-435f-b971-36aea619bb91.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1519607686501738/69fcd1219f9320f2b1a13bb9/5774e20e-9dea-4add-891f-8c90af91e54d.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/26823698273921757/69f13119bdb47646c4a73e32/2fe5b0fc-f407-4bcb-8b4f-8b07fdaa9f11.mp4"], desc: "Start with their video, cut to your reply" },
  { name: "Stop Motion", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/4349911158630997/69fcedef9f9320f2b1a2e332/2ebdb7a9-4bf9-4fe2-ae94-337ec41a93e8.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1423374479473640/69fbb6f49f9320f2b19b68d2/37de6768-76ca-4d78-bd4b-b19fce0e0095.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1650928649474566/69fc7fd69f9320f2b19f937f/bd340113-eb0f-475f-9633-f023eaba4f98.mp4"], desc: "Frame-by-frame animation" },
  { name: "Street Interview", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/809167708625806/69fbede19f9320f2b19d71b6/db16375c-7ec8-4e80-9877-5a6100de5363.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1927975877695441/69fefcb308c1a6eaf90e3ab9/68149d35-ab97-4314-92bf-4ad2023ac372.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1494670028833663/69fcf9149f9320f2b1a37296/ce84b33c-606a-4ec2-b072-680b028db10c.mp4"], desc: "Man-on-the-street style" },
  { name: "Testimonial", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/26908390678850361/69fcce009f9320f2b1a10685/96730549-6725-460d-b231-6d9db46e7444.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/940276305299161/69ff219208c1a6eaf90fb78f/9d9bd3f8-2b81-4359-9215-d0405a95c011.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/27217375757847380/69ff11ea08c1a6eaf90f3e7f/bdcde3a4-91a2-4ef9-b3c8-55e3134185ae.mp4"], desc: "A real customer, on camera" },
  { name: "Time Lapse", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1599755551687991/69ffcf3508c1a6eaf91338f8/edf04e7e-643e-45f0-80b4-3abef613c224.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1510676210454575/69fce2079f9320f2b1a25394/b9e500aa-86b0-4124-9ed0-b6a19e301aff.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1703400574420222/6a00206008c1a6eaf914a259/cb9f11d9-3819-4bd8-9f9f-ac2b9730d98f.mp4"], desc: "Sped-up footage of a change" },
  { name: "Transformation", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1701051874670072/69ff213208c1a6eaf90fb4cc/9ffedfd1-3295-4f2e-81c9-3499b5ac5097.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1632738574650145/69fced589f9320f2b1a2dd85/75b3a305-7eac-4fac-aebc-20629a1d1433.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1355957369754679/69ff28eb08c1a6eaf90fe960/4de27a0e-e17b-4e5c-8d5d-d27797001b1a.mp4"], desc: "The change, in one tight cut" },
  { name: "Trend", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2187963178620533/69fa179746012bac5d838913/f541cffa-9511-4d82-b173-fa35dd8f6f02.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1261533739301837/69fcce9a9f9320f2b1a10f53/3ad28df3-65e2-4871-b117-e269f405a65b.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1716657453080499/69fccd439f9320f2b1a0fb63/6837715b-a50b-4d37-82da-6cac73fb08d0.mp4"], desc: "A current trend, used right" },
  { name: "Try-On", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1292449202287034/69fcd0859f9320f2b1a13384/6a080ae2-abb5-4d22-b42f-472dc320346b.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2031152041158093/69f9d83646012bac5d82b6d8/317c0d8d-a736-4a6c-8701-e68f53d4c11a.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1880827992620177/69e8ace0bdb47646c4818a06/5dd897d0-764f-4cc2-a905-e5094e646bdf.mp4"], desc: "Trying the product on, on camera" },
  { name: "Unboxing", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1495050481989422/69ff123e08c1a6eaf90f40c3/0da0dbd7-27f1-40bb-9cd1-433e11f3f150.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/1978000789474308/69ff16a308c1a6eaf90f644d/c76712ed-4970-489e-be31-c77bdc446ebc.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/954058654260446/69fcd1229f9320f2b1a13c04/c200f9c7-de2a-4f7a-941b-d8b0165b5ec1.mp4"], desc: "Opening the box on camera" },
  { name: "Whiteboard Explainer", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/9385028881518631/67a39cd00a70ccc0c5991b54/f904cb0a-4e77-4ce9-ac79-2ec0c0a362b4.mp4"], desc: "A whiteboard, a marker, an explanation" },
  { name: "Yapper", thumbs: ["https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/2439518439824234/69fd38c89f9320f2b1a63b96/821121ed-b5ce-431e-b130-03f447d14776.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/944329348441136/69ffcc0a08c1a6eaf9132aff/09a5f4c9-499c-45f3-80f3-715a0db635a5.mp4", "https://motionswipefile.blob.core.windows.net/swipe-file-cached-links/swipe-file-source-link/977514721768530/69ff306e08c1a6eaf91018f3/d9e7c49c-a84f-4ef6-8671-7265a8465fc4.mp4"], desc: "Creator talking straight to camera" },
];

// 3-clip fanned stack layout for the format picker card —
// middle on top, left rotated -8°, right rotated +8°. Mirrors curated-formats.jsx.
const FAN_LAYOUT = [
  { rotate: -8, x: "-22%", y: "4%",  z: 1 },
  { rotate:  0, x: "0",    y: "0",   z: 3 },
  { rotate:  8, x: "22%",  y: "4%",  z: 2 },
];
const MAX_FORMATS = 3;

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
function uniqueId() {
  return Math.random().toString(36).slice(2, 11);
}

function downloadFile(name, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------
// Library card — both clickable (mobile / touch) and draggable (desktop)
// ---------------------------------------------------------------------
function LibraryCard({ shot, onAdd, onDragStart, onDragEnd }) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(shot)}
      onDragEnd={onDragEnd}
      onClick={() => onAdd(shot)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAdd(shot); } }}
      className="group block text-left bg-card rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-colors shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing"
      title="Click or drag to add"
    >
      <div className="relative">
        {shot.cloudinaryUrl ? (
          <img
            src={shot.cloudinaryUrl}
            alt={shot.name}
            loading="lazy"
            decoding="async"
            className="w-full aspect-[9/16] object-cover bg-muted pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="w-full aspect-[9/16] bg-muted" />
        )}
        {shot.subcategory && (
          <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full bg-card/90 backdrop-blur text-[9px] font-semibold uppercase tracking-wider text-foreground">
            {shot.subcategory}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <div className="font-semibold text-foreground text-xs leading-tight line-clamp-2">
          {shot.name || shot.subcategory || "Shot"}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Storyboard slot — numbered, draggable for reorder, with note + actions
// ---------------------------------------------------------------------
function StoryboardSlot({ slot, index, total, isDropTarget, onUpdateNote, onMoveUp, onMoveDown, onRemove, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop }) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); onDrop(index); }}
      className={`bg-card border-2 rounded-2xl p-3 md:p-4 flex gap-3 transition-colors ${
        isDropTarget ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      <div className="hidden md:flex items-center text-muted-foreground cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="w-16 md:w-20 shrink-0 relative">
        {slot.cloudinaryUrl ? (
          <img src={slot.cloudinaryUrl} alt="" className="w-full aspect-[9/16] object-cover rounded-lg bg-muted" />
        ) : (
          <div className="w-full aspect-[9/16] bg-muted rounded-lg" />
        )}
        <div
          className="absolute -top-1 -left-1 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
          style={{ background: NAVY, color: "#fff" }}
        >
          {index + 1}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-foreground text-sm leading-tight" style={{ color: NAVY }}>
          {slot.name || slot.subcategory || "Shot"}
        </div>
        {slot.subcategory && (
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 truncate">{slot.subcategory}</div>
        )}
        <textarea
          value={slot.note}
          onChange={(e) => onUpdateNote(slot.id, e.target.value)}
          placeholder="Your script line or direction for this shot…"
          rows={2}
          className="w-full text-sm px-2 py-1.5 rounded-lg border border-border bg-card text-foreground resize-none focus:outline-none focus:border-primary mt-1"
        />
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <button
          type="button"
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          aria-label="Move up"
          className="w-7 h-7 rounded-md hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronUp className="w-4 h-4 mx-auto" />
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(index)}
          disabled={index === total - 1}
          aria-label="Move down"
          className="w-7 h-7 rounded-md hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronDown className="w-4 h-4 mx-auto" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(slot.id)}
          aria-label="Remove"
          className="w-7 h-7 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
        >
          <X className="w-4 h-4 mx-auto" />
        </button>
      </div>
    </div>
  );
}

// =====================================================================
// MAIN BLOCK
// =====================================================================
export default function Block() {
  const { data, status } = useRecords({ select: shotFields, count: 500 });
  const shots = useMemo(() => {
    const items = data?.pages?.flatMap((p) => p?.items ?? []) ?? [];
    return items.map((r) => {
      const f = r.fields || {};
      return {
        recordId: r.id,
        name: f.name || "",
        category: f.category?.label || "",
        subcategory: f.subcategory?.label || "",
        description: f.description || "",
        cloudinaryUrl: f.cloudinaryUrl || "",
        templatePrompt: f.templatePrompt || "",
        examplePrompt: f.examplePrompt || "",
      };
    });
  }, [data]);

  // Email gate
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [submitError, setSubmitError] = useState("");
  const isUnlocked = submitStatus === "sent";

  async function handleSubmit() {
    if (!email.trim() || !website.trim()) {
      setSubmitError("Fill in both fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setSubmitError("Enter a valid work email.");
      return;
    }
    if (!isWorkEmail(email)) {
      setSubmitError("Use your company email instead. Personal @gmail.com, @yahoo.com, etc. aren't supported.");
      return;
    }
    setSubmitStatus("submitting");
    setSubmitError("");
    try {
      const res = await fetch(WORKFLOW_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          website: website.trim(),
          source: "ai-ugc-storyboard-generator",
          formats: selectedFormats,
          page_url: typeof window !== "undefined" ? window.location.href : "",
          submitted_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error(`Workflow returned ${res.status}`);
      setSubmitStatus("sent");
    } catch (e) {
      console.error("Lead capture failed:", e);
      setSubmitStatus("sent");
    }
  }

  // Library filters
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState(null);

  const categories = useMemo(
    () => Array.from(new Set(shots.map((s) => s.category).filter(Boolean))).sort(),
    [shots]
  );

  const subcategories = useMemo(() => {
    const base = activeCategory ? shots.filter((s) => s.category === activeCategory) : shots;
    return Array.from(new Set(base.map((s) => s.subcategory).filter(Boolean))).sort();
  }, [shots, activeCategory]);

  const filteredShots = useMemo(() => {
    const qStr = search.trim().toLowerCase();
    return shots.filter((s) => {
      if (activeCategory && s.category !== activeCategory) return false;
      if (activeSubcategory && s.subcategory !== activeSubcategory) return false;
      if (qStr) {
        const hay = [s.name, s.category, s.subcategory, s.description].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(qStr)) return false;
      }
      return true;
    });
  }, [shots, search, activeCategory, activeSubcategory]);

  // Storyboard state
  const [storyboard, setStoryboard] = useState([]);

  // Selected UGC formats (max 3) — context for export + lead capture.
  const [selectedFormats, setSelectedFormats] = useState([]);

  function toggleFormat(name) {
    setSelectedFormats((prev) => {
      if (prev.includes(name)) return prev.filter((n) => n !== name);
      if (prev.length >= MAX_FORMATS) return prev; // cap at 3
      return [...prev, name];
    });
  }

  // Drag-and-drop state (React state, not dataTransfer — more reliable in
  // Softr's render context).
  const [draggedLibraryShot, setDraggedLibraryShot] = useState(null);
  const [draggedSlotIndex, setDraggedSlotIndex] = useState(null);
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState(null);

  // Library pagination
  const PAGE_SIZE = 16;
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  // Reset visible count when filters/search change.
  useEffect(() => {
    setDisplayLimit(PAGE_SIZE);
  }, [search, activeCategory, activeSubcategory]);

  function makeSlot(shot) {
    return {
      id: uniqueId(),
      recordId: shot.recordId,
      name: shot.name,
      category: shot.category,
      subcategory: shot.subcategory,
      description: shot.description,
      cloudinaryUrl: shot.cloudinaryUrl,
      // Pre-fill note with the shot's description so the user starts with
      // the rationale and can edit it into their own script line.
      note: shot.description || "",
    };
  }

  function addShot(shot) {
    setStoryboard((prev) => [...prev, makeSlot(shot)]);
  }

  function updateNote(id, note) {
    setStoryboard((prev) => prev.map((s) => (s.id === id ? { ...s, note } : s)));
  }

  function removeSlot(id) {
    setStoryboard((prev) => prev.filter((s) => s.id !== id));
  }

  function moveUp(i) {
    if (i === 0) return;
    setStoryboard((prev) => {
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  }

  function moveDown(i) {
    setStoryboard((prev) => {
      if (i === prev.length - 1) return prev;
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  }

  function clearStoryboard() {
    setStoryboard([]);
  }

  // ---- Drag-and-drop (state-based, like Creator Scans' working pattern) ----
  function handleLibraryDragStart(shot) {
    setDraggedLibraryShot(shot);
    setDraggedSlotIndex(null);
  }
  function handleSlotDragStart(index) {
    setDraggedSlotIndex(index);
    setDraggedLibraryShot(null);
  }
  function handleDragEnd() {
    setDraggedLibraryShot(null);
    setDraggedSlotIndex(null);
    setDragOverSlotIndex(null);
  }
  function handleSlotDragOver(index) {
    setDragOverSlotIndex(index);
  }
  function handleSlotDragLeave() {
    setDragOverSlotIndex(null);
  }
  function handleSlotDrop(targetIndex) {
    if (draggedLibraryShot) {
      // Drop a library shot at this slot position (insert before).
      setStoryboard((prev) => {
        const next = [...prev];
        next.splice(targetIndex, 0, makeSlot(draggedLibraryShot));
        return next;
      });
    } else if (draggedSlotIndex !== null && draggedSlotIndex !== targetIndex) {
      // Reorder within the storyboard.
      setStoryboard((prev) => {
        const next = [...prev];
        const [moved] = next.splice(draggedSlotIndex, 1);
        next.splice(targetIndex, 0, moved);
        return next;
      });
    }
    handleDragEnd();
  }
  function handleStoryboardAreaDrop() {
    // Drop into the storyboard area (not on a specific slot) — append.
    if (draggedLibraryShot) addShot(draggedLibraryShot);
    handleDragEnd();
  }

  // ---- Inspire me — replace storyboard with 6 random shots from the filtered library ----
  function inspireMe() {
    if (filteredShots.length === 0) return;
    const N = Math.min(6, filteredShots.length);
    const pool = [...filteredShots];
    const picks = [];
    for (let i = 0; i < N; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picks.push(pool.splice(idx, 1)[0]);
    }
    setStoryboard(picks.map(makeSlot));
  }

  // Copy + download
  const [copied, setCopied] = useState(false);

  function asText() {
    if (storyboard.length === 0) return "";
    const out = ["UGC Storyboard"];
    if (selectedFormats.length > 0) {
      out.push("");
      out.push(`VIDEO FORMAT: ${selectedFormats.join(" + ")}`);
      selectedFormats.forEach((n) => {
        const f = FORMATS.find((x) => x.name === n);
        if (f) out.push(`  • ${f.name} — ${f.desc}`);
      });
      out.push("");
      out.push("The format is the overall vibe of the video. The shots below are the visual building blocks that bring it to life.");
      out.push("");
      out.push("───────────────────────────");
      out.push("SHOTS");
    }
    out.push("");
    storyboard.forEach((s, i) => {
      const title = s.name || s.subcategory || (s.category ? s.category.replace(/_/g, " ") : "Shot");
      const sub = s.subcategory ? ` (${s.subcategory})` : "";
      out.push(`${i + 1}. ${title}${sub}`);
      if (s.note) out.push(`   ${s.note}`);
      out.push("");
    });
    out.push("Made with Brieflee — brieflee.co");
    return out.join("\n");
  }

  function asMarkdown() {
    if (storyboard.length === 0) return "";
    const out = ["# UGC Storyboard", ""];
    if (selectedFormats.length > 0) {
      out.push(`## Video Format: ${selectedFormats.join(" + ")}`);
      out.push("");
      selectedFormats.forEach((n) => {
        const f = FORMATS.find((x) => x.name === n);
        if (f) out.push(`- **${f.name}** — ${f.desc}`);
      });
      out.push("");
      out.push("> The format is the overall vibe of the video. The shots below are the visual building blocks that bring it to life.");
      out.push("");
      out.push("---");
      out.push("");
      out.push("## Shots");
      out.push("");
    }
    storyboard.forEach((s, i) => {
      const title = s.name || s.subcategory || (s.category ? s.category.replace(/_/g, " ") : "Shot");
      const sub = s.subcategory ? ` _(${s.subcategory})_` : "";
      out.push(`### ${i + 1}. ${title}${sub}`);
      if (s.note) {
        out.push("");
        out.push(s.note);
      }
      out.push("");
    });
    out.push("---");
    out.push("");
    out.push("Made with [Brieflee](https://brieflee.co)");
    return out.join("\n");
  }

  function handleCopy() {
    if (storyboard.length === 0) return;
    navigator.clipboard.writeText(asText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (storyboard.length === 0) return;
    const formatPart = selectedFormats.length
      ? "-" + selectedFormats.map((n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).filter(Boolean).join("-")
      : "";
    downloadFile(`ugc-storyboard${formatPart}.txt`, "text/plain;charset=utf-8", asText());
  }

  function handleDownloadMarkdown() {
    if (storyboard.length === 0) return;
    const formatPart = selectedFormats.length
      ? "-" + selectedFormats.map((n) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).filter(Boolean).join("-")
      : "";
    downloadFile(`ugc-storyboard${formatPart}.md`, "text/markdown;charset=utf-8", asMarkdown());
  }

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/[0.03] to-primary/[0.07]" />
      </div>

      {/* Hero */}
      <div className="container py-12 md:py-16">
        <div className="content max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <div
              className="inline-flex items-center mb-5 mx-auto"
              style={{
                gap: 10,
                padding: "10px 18px",
                background: "rgba(135,156,247,0.16)",
                color: NAVY,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                borderRadius: 999,
                width: "fit-content",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: PERIWINKLE,
                  boxShadow: `0 0 0 3px ${PERIWINKLE}33`,
                }}
              />
              Free AI UGC Storyboard Generator
            </div>
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] text-foreground"
              style={{ color: NAVY }}
            >
              AI UGC Storyboard Generator
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mt-4 leading-relaxed max-w-2xl mx-auto">
              Build a shot-by-shot UGC storyboard from a library of {shots.length || "279"}+ proven shot types. Drag (or tap) shots in, add your script line, copy or download as CSV.
            </p>
            <style>{`
              @keyframes briefleeHeroChipFloat {
                0%   { transform: translateY(0); }
                100% { transform: translateY(-6px); }
              }
            `}</style>
            <div className="flex justify-center mt-8 md:mt-10">
              <div className="relative w-full max-w-xl">
                <img
                  src="https://res.cloudinary.com/dchroynzv/image/upload/v1779273284/brieflee_lead-magnet_storyboard-generator-frames-icon_2026-05-v2.png"
                  alt="UGC Storyboard Generator frames icon"
                  className="w-full rounded-3xl shadow-[0_20px_60px_-25px_rgba(0,19,100,0.30)]"
                  draggable={false}
                />
                {/* Floating chip — pulse pill */}
                <div
                  className="absolute top-[6%] left-[55%] z-30 flex items-center gap-2 rounded-full bg-card border border-border shadow-md px-3 py-1.5 text-xs font-semibold"
                  style={{ animation: "briefleeHeroChipFloat 6s ease-in-out 0.4s infinite alternate", color: NAVY }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  Drag-drop shots
                </div>
                {/* Floating chip — number stat */}
                <div
                  className="absolute bottom-[6%] right-[55%] z-30 flex items-center gap-2 rounded-2xl bg-card border border-border shadow-lg px-4 py-2.5 text-left"
                  style={{ animation: "briefleeHeroChipFloat 6s ease-in-out 1.0s infinite alternate-reverse" }}
                >
                  <div className="text-2xl font-bold text-primary leading-none">100+</div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Shot types</div>
                    <div className="text-xs text-foreground font-medium">Hook to outro</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gate */}
          {!isUnlocked && (
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-5">
                <Sparkles className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base font-bold text-foreground" style={{ color: NAVY }}>
                    Unlock the storyboard builder
                  </h2>
                  <p className="text-xs text-muted-foreground">Drop your email and brand website to get started.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Work email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@brand.com"
                      className="w-full h-11 px-3 rounded-xl border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Brand website</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="brand.com"
                      className="w-full h-11 px-3 rounded-xl border-2 border-border bg-card text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                {submitError && <p className="text-sm text-destructive">{submitError}</p>}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitStatus === "submitting"}
                  className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {submitStatus === "submitting" ? "Unlocking…" : "Start building"}
                </button>
              </div>
            </div>
          )}

          {/* ===== Format picker (horizontal slider of cards) ===== */}
          {isUnlocked && (
            <div className="mt-2 mb-8">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-xl font-bold text-foreground" style={{ color: NAVY }}>
                  Pick your formats
                </h2>
                <span className="text-xs text-muted-foreground">
                  {selectedFormats.length}/{MAX_FORMATS} selected
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                You can mix up to 3 formats per video. The format is the vibe of the video; shots below are the building blocks.
              </p>

              <div
                className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 scroll-smooth"
                style={{ scrollbarWidth: "thin" }}
              >
                {FORMATS.map((f) => {
                  const active = selectedFormats.includes(f.name);
                  const disabled = !active && selectedFormats.length >= MAX_FORMATS;
                  const thumbs = (f.thumbs || []).slice(0, 3);
                  return (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => toggleFormat(f.name)}
                      disabled={disabled}
                      className={`shrink-0 w-[180px] md:w-[200px] snap-start text-left rounded-2xl transition-all outline-none ${
                        disabled ? "opacity-40 cursor-not-allowed" : "hover:-translate-y-0.5"
                      }`}
                    >
                      {/* Gray panel with 3-clip fanned stack */}
                      <div
                        className={`relative aspect-square rounded-2xl bg-muted/60 overflow-hidden transition-all ${
                          active ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          {thumbs.length === 0 ? (
                            <div className="text-xs text-muted-foreground">No clips yet</div>
                          ) : (
                            thumbs.map((url, i) => {
                              const slot =
                                thumbs.length === 1 ? FAN_LAYOUT[1] :
                                thumbs.length === 2 ? [FAN_LAYOUT[0], FAN_LAYOUT[2]][i] :
                                FAN_LAYOUT[i];
                              return (
                                <div
                                  key={url}
                                  className="absolute w-[58%] aspect-[4/5] rounded-xl overflow-hidden shadow-md border-2 border-card"
                                  style={{
                                    transform: `translate(${slot.x}, ${slot.y}) rotate(${slot.rotate}deg)`,
                                    zIndex: slot.z,
                                  }}
                                >
                                  <video
                                    src={url}
                                    muted
                                    playsInline
                                    preload="metadata"
                                    className="w-full h-full object-cover pointer-events-none"
                                  />
                                </div>
                              );
                            })
                          )}
                        </div>
                        {active && (
                          <div
                            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md z-10"
                            style={{ background: PERIWINKLE, color: NAVY }}
                          >
                            <Check className="w-4 h-4" strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      {/* Name + desc below the panel */}
                      <div className="mt-3 px-1">
                        <div className="font-bold text-sm md:text-base leading-snug truncate" style={{ color: NAVY }}>{f.name}</div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-snug">{f.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tool — library + storyboard */}
          {isUnlocked && (
            <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 md:gap-8 mt-4">

              {/* Library */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground" style={{ color: NAVY }}>Shot Library</h2>
                  <span className="text-sm text-muted-foreground">{filteredShots.length} shots</span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search shots…"
                      className="w-full h-10 pl-9 pr-3 rounded-xl border-2 border-border bg-card text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => { setActiveCategory(null); setActiveSubcategory(null); }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${!activeCategory ? "bg-primary/10 text-primary" : "bg-card border border-border text-muted-foreground hover:border-primary/40"}`}
                      >
                        All
                      </button>
                      {categories.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { setActiveCategory(c); setActiveSubcategory(null); }}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${activeCategory === c ? "bg-primary/10 text-primary" : "bg-card border border-border text-muted-foreground hover:border-primary/40"}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}

                  {activeCategory && subcategories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveSubcategory(null)}
                        className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${!activeSubcategory ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"}`}
                      >
                        Any
                      </button>
                      {subcategories.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setActiveSubcategory(s)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${activeSubcategory === s ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {status === "loading" || status === "pending" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="aspect-[9/16] bg-muted rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : filteredShots.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                    No shots match these filters.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                      {filteredShots.slice(0, displayLimit).map((shot) => (
                        <LibraryCard
                          key={shot.recordId}
                          shot={shot}
                          onAdd={addShot}
                          onDragStart={handleLibraryDragStart}
                          onDragEnd={handleDragEnd}
                        />
                      ))}
                    </div>
                    {filteredShots.length > displayLimit && (
                      <div className="flex justify-center mt-6">
                        <button
                          type="button"
                          onClick={() => setDisplayLimit((n) => n + PAGE_SIZE)}
                          className="inline-flex items-center gap-1.5 px-5 h-11 rounded-xl border-2 border-border bg-card text-foreground text-sm font-semibold hover:border-primary/40 transition-colors"
                        >
                          Load more
                          <span className="text-xs text-muted-foreground">
                            ({filteredShots.length - displayLimit} left)
                          </span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Storyboard */}
              <div className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground" style={{ color: NAVY }}>Your Storyboard</h2>
                  <span className="text-sm text-muted-foreground">{storyboard.length} {storyboard.length === 1 ? "shot" : "shots"}</span>
                </div>

                {/* Inspire me + Clear */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={inspireMe}
                    disabled={filteredShots.length === 0}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/15 transition-colors disabled:opacity-50"
                  >
                    <Shuffle className="w-4 h-4" /> Inspire me
                  </button>
                  <button
                    type="button"
                    onClick={clearStoryboard}
                    disabled={storyboard.length === 0}
                    className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl text-muted-foreground text-sm font-semibold hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" /> Clear
                  </button>
                </div>

                {/* Selected formats — context for the storyboard */}
                {selectedFormats.length > 0 && (
                  <div className="mb-5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Video Format
                    </div>
                    <div className="space-y-2 mb-3">
                      {selectedFormats.map((n) => {
                        const f = FORMATS.find((x) => x.name === n);
                        if (!f) return null;
                        return (
                          <div key={n} className="rounded-xl border p-3" style={{ borderColor: PERIWINKLE, background: "rgba(135,156,247,0.06)" }}>
                            <div className="font-bold text-sm" style={{ color: NAVY }}>{f.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                      The format is the overall vibe of the video. The shots below are the visual building blocks that bring it to life.
                    </p>
                    <div className="border-t border-border mt-5 mb-4" />
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Shots
                    </div>
                  </div>
                )}

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleStoryboardAreaDrop(); }}
                  className={storyboard.length === 0 ? "py-12 border-2 border-dashed border-border rounded-2xl text-center text-muted-foreground" : "space-y-3"}
                >
                  {storyboard.length === 0 ? (
                    <>
                      <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Drag or tap shots from the library<br />to start building.</p>
                    </>
                  ) : (
                    storyboard.map((slot, i) => (
                      <StoryboardSlot
                        key={slot.id}
                        slot={slot}
                        index={i}
                        total={storyboard.length}
                        isDropTarget={dragOverSlotIndex === i && (draggedLibraryShot || (draggedSlotIndex !== null && draggedSlotIndex !== i))}
                        onUpdateNote={updateNote}
                        onMoveUp={moveUp}
                        onMoveDown={moveDown}
                        onRemove={removeSlot}
                        onDragStart={handleSlotDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleSlotDragOver}
                        onDragLeave={handleSlotDragLeave}
                        onDrop={handleSlotDrop}
                      />
                    ))
                  )}
                </div>

                {storyboard.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 justify-end items-center">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl border text-sm font-semibold transition-colors ${copied ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-foreground hover:border-primary/40"}`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:border-primary/40 transition-colors"
                    >
                      <Download className="w-4 h-4" /> .txt
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadMarkdown}
                      className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Download className="w-4 h-4" /> .md
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="container py-14 md:py-20 border-t border-border">
        <div className="content max-w-6xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] mb-12" style={{ color: NAVY }}>
            How it works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {[
              { n: "1", title: "Pick your format(s)", body: "Choose up to 3 UGC formats that fit the video you're making. The format is the vibe; shots are the building blocks." },
              { n: "2", title: "Browse the shot library", body: "279 proven shot types organised by category. Filter, search, or hit \"Inspire me\" for a random starting point." },
              { n: "3", title: "Build your storyboard", body: "Drag or tap shots in. Add a script line for each. Reorder until it flows." },
              { n: "4", title: "Copy or download", body: "One click and your storyboard is ready to paste into your brief, send to your creator, or feed into AI image tools." },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">{s.n}</div>
                <h3 className="text-base font-bold text-foreground mb-2" style={{ color: NAVY }}>{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What makes a good UGC storyboard */}
      <div className="container py-14 md:py-20 border-t border-border">
        <div className="content max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] mb-3" style={{ color: NAVY }}>
              What makes a good UGC storyboard
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Seven things every storyboard for short-form video should answer before you hand it to a creator.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_trendy-flat-lightning-bolt-sticker-transparent_2026-05.png", title: "Format first, shots second", body: "Decide what kind of UGC you're making before you pick shots. The format sets the overall vibe; shots are how you bring it to life.", example: "Demo + Yapper feels different to Greenscreen + Reaction. Pick first, build cohesion second." },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_sticker-blue-target-bullseye-arrow-hit-goal_2026-03.png", title: "A real hook in the first shot", body: "The opening shot has to stop the scroll. Pick a hook tactic and pair it with a shot type that supports it.", example: "Pattern interrupt with a tight close-up of an unexpected expression." },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_sticker-blue-swipe-left-hand-gesture-arrow_2026-03.png", title: "A clear scene flow", body: "Each shot should connect to the next. Don't jump between unrelated frames.", example: "Reaction → demo → result → CTA." },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_trendy-flat-paint-palette-sticker-transparent_2026-05.png", title: "Variety of shot sizes", body: "Close-ups, mediums, and wides break visual monotony and hold attention longer.", example: "Open with extreme close-up, demo in medium, end with wide." },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_sticker-blue-cartoon-eyes-looking-side-navy_2026-03.png", title: "Product on screen", body: "The product should appear in at least 3 to 4 shots, naturally integrated.", example: "In-hand close-up, demonstrated in use, end card with logo." },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_trendy-flat-flag-sticker-transparent_2026-05.png", title: "A clear ending shot", body: "End with the offer, brand, or CTA. Don't leave viewers wondering what to do.", example: "Final shot: product + 'Order yours below' text." },
              { icon: "https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_icon_trendy-flat-pencil-sticker-transparent_2026-05.png", title: "Notes per shot", body: "Each storyboard shot should have a script line or direction note. Don't make the creator guess.", example: "Shot 3: 'Show the texture by squeezing onto fingertip.'" },
            ].map((p) => (
              <div key={p.title} className="bg-card border border-border rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="flex items-center gap-4 md:flex-1 md:min-w-0">
                  <img src={p.icon} alt="" className="w-12 h-12 shrink-0 object-contain" draggable={false} />
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground text-base" style={{ color: NAVY }}>{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{p.body}</p>
                  </div>
                </div>
                <div className="md:w-72 md:shrink-0 md:border-l md:border-border md:pl-6 text-sm text-muted-foreground italic leading-relaxed">
                  {p.example}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA — matches homepage final-cta design */}
      <section
        className="relative w-full py-20 md:py-28 px-5 md:px-10 overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(135,156,247,0.28) 0%, rgba(180,192,245,0.14) 40%, rgba(180,192,245,0) 75%), #FAFBFF",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        <style>{`
          .bl-cta-halo {
            position: absolute; left: 50%; top: 50%;
            width: min(90vw, 720px); height: min(70vw, 460px);
            transform: translate(-50%, -50%);
            background: radial-gradient(ellipse at center, rgba(135,156,247,0.30) 0%, rgba(135,156,247,0.12) 35%, rgba(135,156,247,0) 70%);
            pointer-events: none; filter: blur(8px);
          }
          .bl-cta-primary {
            display: inline-flex; align-items: center; gap: 10px;
            padding: 16px 28px; background: ${NAVY}; color: #fff;
            font-size: 16px; font-weight: 700; letter-spacing: -0.005em;
            border-radius: 12px; text-decoration: none;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            box-shadow: 0 12px 28px -10px rgba(0,19,100,0.35), 0 4px 10px -3px rgba(0,19,100,0.18), 0 0 0 1px rgba(255,255,255,0.12) inset;
          }
          .bl-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 18px 36px -12px rgba(0,19,100,0.45), 0 6px 14px -4px rgba(0,19,100,0.22), 0 0 0 1px rgba(255,255,255,0.18) inset; }
          .bl-cta-primary svg { transition: transform 0.25s ease; }
          .bl-cta-primary:hover svg { transform: translateX(3px); }
          .bl-cta-secondary {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 16px 26px; background: rgba(255,255,255,0.6); color: ${NAVY};
            font-size: 16px; font-weight: 700; letter-spacing: -0.005em;
            border-radius: 12px; text-decoration: none;
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            backdrop-filter: blur(12px) saturate(180%);
            transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
            box-shadow: 0 0 0 1px rgba(0,19,100,0.14) inset, 0 4px 12px -4px rgba(0,19,100,0.10);
          }
          .bl-cta-secondary:hover { transform: translateY(-2px); background: rgba(255,255,255,0.88); box-shadow: 0 0 0 1px rgba(0,19,100,0.22) inset, 0 8px 16px -6px rgba(0,19,100,0.15); }
          @media (max-width: 480px) {
            .bl-cta-primary, .bl-cta-secondary { width: 100%; justify-content: center; }
          }
        `}</style>

        <div className="bl-cta-halo" aria-hidden="true" />

        <div className="relative max-w-3xl mx-auto flex flex-col items-center text-center">
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "10px 18px", background: "rgba(135,156,247,0.16)",
              color: NAVY, fontSize: 14, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
              borderRadius: 999, width: "fit-content",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: PERIWINKLE, boxShadow: `0 0 0 3px ${PERIWINKLE}33` }} />
            Get started
          </div>

          <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05] text-balance" style={{ color: NAVY }}>
            Ready to brief creators visually?
          </h2>

          <p className="mt-5 text-base md:text-lg leading-relaxed max-w-xl mx-auto font-medium" style={{ color: NAVY, opacity: 0.7 }}>
            Brieflee turns your storyboard into a full creator brief and reviews every submission against it. Pass/fail on every video, with timestamps for what to fix.
          </p>

          <div className="mt-9 md:mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <a href="/sign-up" className="bl-cta-primary">
              Start free trial
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <a href="/book-a-demo" className="bl-cta-secondary">Book a demo</a>
          </div>
        </div>
      </section>
    </div>
  );
}
