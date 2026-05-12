# 10 — README for unpacked install (friend distribution)

## What to build

A README at the repo root that a friend (or future-you) can follow to install and use the extension as an unpacked Chrome extension. No Chrome Web Store involved.

Contents:

- One-paragraph "what this does" intro.
- Prerequisites (Node + npm version).
- Build steps: `npm install`, `npm run build`, output goes to `dist/`.
- Install steps: open `chrome://extensions`, enable Developer Mode, "Load unpacked", select `dist/`.
- Usage walkthrough:
  - Hover any channel name on YouTube → click Block.
  - Open the extension popup to view, unblock, see counters, toggle Shorts.
  - Open the options page from the popup for search / bulk / export-import.
- Troubleshooting: what to do if a YouTube redesign breaks selectors (point at where in the code to look), how to wipe storage.
- A note that this is for personal / friend distribution, not the Chrome Web Store.

## Acceptance criteria

- [ ] README.md exists at the repo root.
- [ ] A user who has never seen this project can install and use it by following the README alone.
- [ ] Build and install instructions match the actual scripts and output path.
- [ ] Usage section describes every user-facing feature shipped through slices 02–09.
- [ ] No screenshots required for v1, but layout supports adding them later.

## Blocked by

- Issue 01
