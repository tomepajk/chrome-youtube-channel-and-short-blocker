# 06 — Popup UI: blocklist management

## What to build

Clicking the extension toolbar icon opens a popup showing every blocked channel with a one-click unblock action. This is the user's escape hatch for misclicks.

- Plain HTML/CSS/TS popup (no React) built by the existing Vite pipeline.
- On open, reads the blocklist from `chrome.storage.sync` and renders a list of rows: `{handle} — {display name if available}  [X]`.
- Clicking the X removes the entry via `removeBlockedChannel(id)`; storage change propagates and the row disappears.
- Empty state: "No channels blocked yet. Hover any channel name on YouTube and click Block."
- Subscribes to `chrome.storage.onChanged` so the list stays in sync if storage is mutated elsewhere (e.g., options page in slice 09).
- Display name is stored alongside `id` and `handle` opportunistically when the user blocks (extend the schema from slice 01 with an optional `name?: string`); rows without a name show the handle only.

## Acceptance criteria

- [ ] Clicking the extension icon opens a popup listing all currently blocked channels.
- [ ] Each row shows the handle (and display name when known) plus an X unblock button.
- [ ] Clicking X unblocks the channel; the row disappears; any YouTube tabs immediately re-show that channel's content without reload.
- [ ] Empty state copy renders when no channels are blocked.
- [ ] Storing a display name on block does not break entries blocked before this slice landed (treat `name` as optional).
- [ ] Popup uses keyboard focus styles compatible with tab navigation.

## Blocked by

- Issue 01
