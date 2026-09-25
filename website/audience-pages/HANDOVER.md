# Audience pages: one block per page

`page.tsx` is the template. It is live on all 8 audience pages, one block each,
replacing **15 native Softr blocks per page** (120 in total).

The block on each page is titled after the page: **E-commerce page**,
**Mobile apps page**, and so on.

| Page | New single block |
|---|---|
| /e-commerce | `7eaae731-a9f8-4fc9-9983-a2c493b1b469` |
| /mobile-apps | `7130645b-d94c-4883-b420-04f44df3ff7c` |
| /marketing-agencies | `7bdfb040-d835-4500-961e-fa018b930d5f` |
| /b2b-saas | `baf12f8b-9ba4-4be9-be7c-14e0faffc7a7` |
| /personal-brand | `4d57a0d4-32d2-4c97-9463-532bc35d9be6` |
| /content-creators | `b97c18a6-16e5-4569-a27a-0d671b1fd27b` |
| /coaches-courses | `7f9a9557-6170-4fc2-9e16-178ca1591a0d` |
| /real-estate-agencies | `5049cad7-0840-4c41-8f6d-1cd46547f61f` |

## What to do in Studio, per page

1. Disable the 15 native blocks listed below.
2. Drag the new page block to sit directly under the **CTA chips** block.

Header, footer and CTA chips stay as they are. The chips block has to stay
separate because it is gated to non-logged-in visitors, and visibility is set
per block.

**On /e-commerce only**, also disable the three blocks from the earlier pass,
now superseded: Hero `482ae57c`, Feature grid `9fc4dcaf`, Closing CTA `df17935c`.

## Editing copy

34 editable settings per block, in **Content > Settings**. No code push needed.
`ctaLabel` and `ctaHref` are single settings used by all four buttons on the
page, so repointing a page is one edit in one field.

## Content corrections carried in

- **/mobile-apps hero.** The live typewriter string was two lists concatenated
  (`...perform consistentlyhiring more people, scaling your team...`), so an app
  marketing page was cycling agency phrases. It now carries only its own five.
- **The results section** had a "Get started" link pointing at `/sign-up1`. It
  never said "trial", so the trial sweep did not catch it. Now Book a demo.
- The problem intro had an em dash (`doesn't scale—it creates`), now a comma.

## Known, not changed

`/personal-brand` and `/content-creators` have byte-identical hero copy, and
both talk about YouTube Shorts ads. Carried across as-is.

## Also rebuilt in the earlier pass

Still one block each, still needing their native counterpart disabled:

- `/ai-video-ad-briefs-` Hero `63accfb0-e0fa-4514-aec3-fe98a9d006a8` replaces `hero2` `475d6bed-47cd-4dda-a555-cef9152c69dc`
- `/brieflee-vs-frame-io` Closing CTA `1f69151d-4110-4f68-87d3-b7ab8730537e` replaces `cta2` `8d529a5c-432f-488a-803f-637d7decaab3`
- `/faq` FAQ `1c41d252-a6df-4c75-bdbb-717579238fbb` replaces `faq` `d7632405-27b3-4084-9ae9-defb85830b23`

---

# Native block IDs to disable

Listed in page order. Note `cta5` appears twice on every page; `cta5#2` is the
closing CTA at the bottom.

### /e-commerce
- `hero3`  8a89ef7a-1a75-411a-a239-0b77860b425a
- `problem`  3fb4b189-84f0-4e33-8cf9-0d24c4c53fdc
- `feature-grid2`  1519f2af-f0a7-4ad9-8524-840020a76e7d
- `cta8`  16f9eb20-5514-4103-9148-8e1d0578febf
- `feature-grid5`  12a188ee-5b3b-4776-bfa8-8e8041ff7bc4
- `demo`  05943323-854b-445f-a344-d47a2cb6f6df
- `feature3`  5350f90e-caae-4afa-a272-ada621cdbda9
- `cta5`  a4104d06-6579-4d11-8221-189eb72e4bc5
- `features`  4cb8469e-45c9-4660-843f-268ba15640fb
- `quick-links2`  11021447-99ca-48cf-9b58-bf90badd43f0
- `quick-links3`  c337ee64-b32e-4f95-a051-1e929decf91a
- `cta6`  81feba69-6c47-43b3-8337-f2bcafc6a38d
- `feature2`  70735307-2487-4db4-b971-78efeb84f75d
- `cta10`  4576d99d-ced4-439e-8e55-922da2b48c6f
- `cta5#2`  699cabaa-aae4-4a21-911e-33b675dfb513

### /mobile-apps
- `hero3`  3d810fae-dd08-4c07-9e78-232e0def3192
- `problem`  057f4ecf-67ef-4a32-ad4a-b1d603565f11
- `feature-grid2`  6b8a03b9-b862-4923-8cf4-f1730454196a
- `cta8`  f8ab5b53-b1f9-4133-b2b5-5afce9aa85f8
- `feature-grid5`  257d4a67-b3b9-4594-96fd-65e1bae9fc2c
- `demo`  0b812d83-9d67-473c-a712-a3ee20193c8a
- `feature3`  5bbf9401-158d-4cb1-bdfa-0e3e3bfa0cd2
- `cta5`  d358a02c-ad09-4634-a422-9955f4c6c5e6
- `features`  1020c939-4467-4666-b51b-723739372cd3
- `quick-links2`  3d44ee29-1946-4a75-82fc-0df0af384a03
- `quick-links3`  d9fa6045-5ca7-45c1-a133-56806fcf555c
- `cta6`  bd4aae77-eff0-4c9e-a433-4ce0107a37a1
- `feature2`  4e1301bd-d514-436e-b3db-3651925b8df4
- `cta10`  0d378241-145d-4351-872f-9b68bbbfc79a
- `cta5#2`  bdc42fd2-36f0-43af-96dc-8c37e0f8e675

### /marketing-agencies
- `hero3`  34301919-8bcf-4d89-b372-8716cce4c861
- `problem`  4a7248f8-0929-4b03-9126-34db47f2d80b
- `feature-grid2`  ba2557d8-0dac-471a-98e1-3d3a1c5c499a
- `cta8`  46f28a7b-7192-43fe-89ea-cee091737fd3
- `feature-grid5`  6407c6ee-dd85-4e15-8a73-46a61ad8b017
- `demo`  d9d84724-80ed-484c-9bfa-17e894b087fc
- `feature3`  69809b6e-6865-411c-8f1f-aa42100ff9d2
- `cta5`  96a51f3c-ed34-4989-beff-4a5ebcfe97dd
- `features`  16beb256-5803-4496-9255-253ac3347606
- `quick-links2`  b3dca9ec-f49b-42d2-b022-11e39fc1c7f3
- `quick-links3`  8b3d53dd-9fae-43e1-89cc-72b7dc84cb80
- `cta6`  227963d6-7458-4a52-bde1-a7cad12e0e23
- `feature2`  c7afca15-83e3-423c-aa11-ec7444cafb70
- `cta10`  a10981fe-12b7-4837-afcb-d8ec7205c153
- `cta5#2`  f3440fd7-4e53-4c45-a205-a7b944638005

### /b2b-saas
- `hero3`  37b411c3-9b34-42cd-af4a-27cef5eeedb5
- `problem`  5912552e-9b46-41ec-aec8-91674652ddd8
- `feature-grid2`  e67430a5-0a32-4135-8c33-bad18bf6a823
- `cta8`  8b16ab3e-6588-404d-9f55-b285ecf20509
- `feature-grid5`  3eadd508-a275-44bf-a59b-c18bdd90ce2a
- `demo`  f7891397-71e2-4fcd-8c56-489de5b49da0
- `feature3`  c4d4ec33-5b60-4b1b-af6c-12ab8733d706
- `cta5`  39a1dca3-bb74-4b61-b5fb-c0aa08702179
- `features`  b6d3f67d-23cb-4abc-86f3-cb0fc8511644
- `quick-links2`  d11e8466-79f9-4479-bdc0-c965b1618441
- `quick-links3`  5888e63e-be37-4034-afd0-f65b227e060f
- `cta6`  6d13a4aa-3de0-4f5a-b6a2-0983aa359cd8
- `feature2`  f2c11f52-c347-4437-8dde-7c9de189255b
- `cta10`  4923a736-b597-4794-a373-23875e15f2e0
- `cta5#2`  86034d1e-b7ef-4d0d-9206-3970037e4843

### /personal-brand
- `hero3`  81ef8b18-16f9-4377-bff8-c591b26e38ee
- `problem`  1ee6b134-2edd-46f0-88ce-195714af28b6
- `feature-grid2`  c4170074-5912-4e2b-ac6b-ca04fcfca392
- `cta8`  98811668-3579-423d-af4c-cce3eb2a466a
- `feature-grid5`  d33b76ca-e0b2-40a9-b001-4c5337e9267e
- `demo`  f30e65f1-4968-479f-a79c-d1e0c511713c
- `feature3`  bf9c1b59-9175-45f1-95fc-6e26a146248b
- `cta5`  db7f0c9a-9236-4580-8017-b6dbd5b592d9
- `features`  f3c0fbfd-b37a-474e-bad6-dc2996d6fcaa
- `quick-links2`  22f60b29-a89d-4782-94c4-4f4275aeb7a3
- `quick-links3`  e646e402-df73-4abc-b809-e11ee181f04c
- `cta6`  25b4d6ec-caa5-4613-8267-79a4c92ee1b6
- `feature2`  692f14d8-4cf0-4c1a-aeae-4bd37d0207f9
- `cta10`  452adbdb-5d9f-4179-829a-606225ef13c5
- `cta5#2`  6a77308e-26c1-49f2-a36e-7cef4cfcf654

### /content-creators
- `hero3`  ed4ace7d-deef-4d76-92e1-632cb6af2183
- `problem`  8de99ada-009d-4c8e-b458-b98e2383e653
- `feature-grid2`  222aa178-1907-41e6-b14c-a094ff7479d9
- `cta8`  b63a0e3f-e73a-4e90-9dfa-4ed24eeb441b
- `feature-grid5`  2f7d3e6f-2f52-4397-ad19-bd61564fdc2d
- `demo`  48680d12-5cda-41aa-8e3c-5b950652d08b
- `feature3`  5145cf59-5e62-4ddd-b86c-7d8e000d2a53
- `cta5`  bfcbcc84-1b71-4aa5-be8c-6855244f89af
- `features`  b28817ec-dda7-4ef0-9b28-4acbb02dd7ee
- `quick-links2`  49177335-aca6-44ed-ad65-0fb342560482
- `quick-links3`  a5220f9b-4509-4328-948b-b466ef364eff
- `cta6`  5557dbf3-8c3a-4eee-bda3-0ceedd248fc4
- `feature2`  8cbc9cd4-8e75-4434-ad0c-96ee9ca79083
- `cta10`  83dadea8-182f-4b11-a963-7f2a4dec84a3
- `cta5#2`  87c66fc0-2c54-48e7-9cf5-509f1b0b8d73

### /coaches-courses
- `hero3`  0b007932-1590-4bcf-ac5c-f32b5c560e6f
- `problem`  36c08605-f963-4761-9c0b-3e76ade77705
- `feature-grid2`  08d99b06-1147-440e-9877-b80effa1433e
- `cta8`  e6c54da7-612e-4bc5-b6f4-d63cee7d291e
- `feature-grid5`  f0301691-e414-4ce9-a68a-832d8cdd1775
- `demo`  89c0244e-aabc-4b68-a7e2-b6aaa96a2778
- `feature3`  e38de8e4-3816-4504-8c79-379c9562ceca
- `cta5`  01fab64d-97b2-4744-aca4-e2bb2c585f5d
- `features`  a73b2f6b-9791-4d55-b3bb-25bd82672cf5
- `quick-links2`  8482786d-9581-47c7-a5f7-44cc55ced579
- `quick-links3`  d72a4cd4-c2a9-4c65-bdbd-4488c357df38
- `cta6`  2fd222f8-ffd7-4fc5-9abf-3df62b96ef6c
- `feature2`  d00fe812-b7ce-4e2a-bbf1-025b952a8325
- `cta10`  f31c51fd-d265-46ae-8821-a9da409d668e
- `cta5#2`  100b6070-77b2-4d1f-83f6-a8e100513df1

### /real-estate-agencies
- `hero3`  22db8501-22d7-417f-9050-e2f7260126ce
- `problem`  b678a383-78c1-4e03-b381-cf41e1561bbe
- `feature-grid2`  9eb0525b-e523-460b-88cf-55b1d7454d0c
- `cta8`  cabb7595-f804-4d43-a1cb-be408e3583db
- `feature-grid5`  3eeeddba-c90c-40a3-8a3d-8e71a5466141
- `demo`  fbb5c672-8994-4914-882a-931891c70338
- `feature3`  ad2cc9b6-0fda-4265-8526-62112a3fa711
- `cta5`  5ad2dbe5-07ed-4412-a186-501f51257b4b
- `features`  79a5e392-a77d-4866-9154-f5a27a8f4583
- `quick-links2`  22c77bba-bd03-49ea-add6-9c87a75140cb
- `quick-links3`  e9961f67-1373-4db2-9858-cf62dbcd45a5
- `cta6`  97d9e59f-559e-405b-b72e-3809be64fa1a
- `feature2`  3b971d13-6b8b-45e1-a00e-cfe7924d9704
- `cta10`  f0f229bd-e1b0-423d-9a48-241cab64911d
- `cta5#2`  2575465a-7222-4960-b7b8-e656dc6ba8ff

