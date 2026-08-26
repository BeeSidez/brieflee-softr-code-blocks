# softr-live

A mirror of the **live** vibe-coding block code in the Brieflee Softr app
(`5c5521fd-af6f-4488-9edf-1add48539912`).

## Why this folder exists

The rest of this repo is organised by hand, by feature. That is useful for
working, but it drifted: changes made directly in Softr Studio never came back
here, so a repo file and the live block could disagree with no way to tell.

This folder fixes that with one rule:

> **Softr is the source of truth.** Every file here is a straight pull of the
> live block. When Studio and this folder disagree, Studio is right and this
> folder is stale.

## Layout

    softr-live/<category>/<page-slug>__<block-id-prefix>.jsx

`<category>` is the top-level folder from the Studio page sidebar (App,
Website, Pricing, Admin). `<page-slug>` is the page path with `/` replaced by
`__`. `<block-id-prefix>` is the first 8 characters of the Softr block id, so a
file always maps back to exactly one block.

`MANIFEST.md` lists all 130 vibe blocks across the app with their page, path,
block id and expected file. `manifest.json` is the same data for scripts.

## Keeping it current

Pull the block from Softr and overwrite the file. Never hand-edit a file here
to match what you think Softr says; pull it.

The matching documentation lives in Notion, in the Pages database inside
Brieflee Product Docs. Each page row carries its Softr page id, folder path,
block count and code type.
