# CTA chips — where the blocks live

One vibe block per page, all running the same source: `cta-chips-block.tsx`.
Every block is set to **Non logged-in users** on its Visibility tab, so signed-in customers never see them.
Nothing in the code reads the login state; change it per block on the Visibility tab.

**This makes them invisible in preview,** which signs you in. Use the **Preview as** selector to view as a
logged-out visitor, or flip a block to All users, check, and flip it back.
App `5c5521fd-af6f-4488-9edf-1add48539912`. Built 2026-08-28.

Editing the copy or the links does NOT need a code push: the title, subtitle,
both URLs and the avatar are editable settings (Content > Settings on the block).
A code change does need a push to each of the 20 blocks.

| Page | Page ID | Block ID |
| --- | --- | --- |
| `/` | `a3f71933-4fa8-4bfe-8eb9-d8337181f2f3` | `0fe28d21-f672-4c5b-bac5-d8d8667a1896` |
| `/pricing` | `327e8184-8f0c-43af-860c-5634d33f96c7` | `6239062e-4f01-4b40-803c-179a12c829a8` |
| `/demo` | `cfcb7183-321c-4092-b2f0-146f4934b09f` | `29a3c2f2-b802-4680-a588-073793286f22` |
| `/faq` | `c95437c5-41c6-4926-9a68-5a82e23cd4b9` | `44e0c4ac-97b8-4ffc-9aa3-487fecdf6aa2` |
| `/help` | `98976abf-6d57-492d-8ca0-1239c55c4825` | `5c623357-30b6-4a92-bfde-efd9a90b6423` |
| `/partners` | `c0f30d9f-d237-4468-bdbb-0737b9d2beff` | `523b5cb7-0200-4903-8595-5c3cdc597256` |
| `/affiliates` | `e943e3a0-d413-4fe5-b9b3-76f6ac4ed4e5` | `d1fffcc5-c602-4dfd-bc13-33a6addfc98b` |
| `/blogs` | `9ef6050f-2033-4b1f-91c3-2298a6a5a71b` | `35cd8f9d-7d29-4e80-8da8-bbd58116b598` |
| `/blog` | `ed97a0a4-fb67-4548-8e75-14d0eca09f34` | `133fe6a7-f7d5-474c-8634-8832354b4c6d` |
| `/article` | `73351ccf-76e8-4642-8f4b-0c23fb7b21d4` | `75fa3bdb-c45d-4639-81e4-dbca5441649f` |
| `/brieflee-vs-frame-io` | `7df8c064-cfd9-4645-9651-8ede3ef125fd` | `fa6b5eaa-87bd-4ea4-ad3d-398ad2fd4d00` |
| `/ai-video-ad-briefs-` | `460655ee-55f6-4fcb-8a7c-e219d46d6d2d` | `26d65b65-ea15-4ffe-b68c-37f57e123920` |
| `/e-commerce` | `e6b007b7-e36b-4ccc-a41c-1d3243bd29f7` | `03819a3e-49be-41f8-bfce-35377a72d3b9` |
| `/mobile-apps` | `a2cacd8a-e11d-4444-a329-0ca1a94275be` | `eeb9d8ec-7288-442e-a62d-e535ebcc5396` |
| `/marketing-agencies` | `077fa9fc-b0ca-494b-9302-6337e7f30fda` | `8e57761f-5dd9-4595-a838-6db915383dbf` |
| `/b2b-saas` | `72ac39e5-d3ff-468f-94f7-2e94b6d40d03` | `caa68c44-f468-4097-923d-5f81406ceeb9` |
| `/content-creators` | `a7772b21-b182-46cc-a8ea-10e1385e9381` | `8fa0e665-0174-4656-ad03-4d97de2c9803` |
| `/personal-brand` | `417dc782-8882-4f03-b83d-d7184b7e9192` | `4e5bd42b-436c-4d84-b9d3-adf92f2fe2a8` |
| `/coaches-courses` | `cc95fd71-3794-4209-a63b-a8ee6d7fcdbb` | `4f7029aa-f172-40db-b9f5-35983ffd4074` |
| `/real-estate-agencies` | `ed9525b4-f2be-40b8-9468-794583704e84` | `a804a754-9103-4c61-834a-3c9bf62a5493` |
