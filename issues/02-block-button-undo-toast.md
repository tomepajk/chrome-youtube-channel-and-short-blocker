# 02 — Hover "Block" button on video cards + undo toast

## What to build

Give the user a one-click way to block a channel from any homepage video card. Clicking the button writes the channel to storage; the card (and any others from that channel) vanish immediately; a transient toast offers Undo.

- On hover of a homepage video card, inject a small "Block" button positioned next to the channel name link.
- Clicking the button:
  - Extracts the channel `id` (UCxxx) and `handle` (@name) from the card's DOM.
  - Calls `addBlockedChannel({ id, handle })`.
  - Storage change triggers existing hide pipeline from slice 01 — no manual DOM removal in the click handler.
- Show an undo toast at the bottom-right of the viewport for ~5 seconds: "Blocked {ChannelName} — Undo".
  - Clicking Undo calls `removeBlockedChannel(id)` and the card reappears.
  - The toast is rendered inside a Shadow DOM root attached to `document.body` so its styles can't leak or be leaked into.
- If a card is missing either `id` or `handle` (rare YouTube DOM variants), fall back to whichever is present; never block by display name alone.

## Acceptance criteria

- [ ] Hovering any homepage video card reveals a "Block" button next to the channel name.
- [ ] Clicking it hides that card and all other cards from the same channel without a page reload.
- [ ] An undo toast appears for ~5 seconds with the channel name.
- [ ] Clicking Undo within the window restores the channel and its cards.
- [ ] After the toast expires, the channel remains blocked.
- [ ] The injected button and toast styles do not bleed into YouTube's UI (Shadow DOM or scoped CSS).
- [ ] No duplicate buttons appear when YouTube re-renders cards during SPA navigation.

## Blocked by

- Issue 01
