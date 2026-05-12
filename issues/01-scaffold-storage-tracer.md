# 01 — Scaffold + storage + tracer hide

## What to build

Stand up the Chrome extension project end-to-end so the rest of the slices have a working chassis to extend. This is the tracer bullet: one channel hidden from the homepage feed proves every layer is wired.

- Manifest V3 extension, loadable unpacked.
- TypeScript + Vite (or esbuild) build pipeline producing the unpacked extension into a `dist/` directory.
- Content script registered for `https://www.youtube.com/*`.
- A storage module wrapping `chrome.storage.sync` with a typed blocklist schema. Each entry stores both identifiers:

  ```ts
  type BlockedChannel = { id: string; handle: string; blockedAt: number };
  type Storage = { blockedChannels: BlockedChannel[] };
  ```

- Content script reads the blocklist on load, subscribes to `chrome.storage.onChanged`, and applies `display: none` to homepage video cards whose channel matches by `id` OR `handle`.
- A `MutationObserver` re-applies hiding as YouTube adds cards via SPA navigation and infinite scroll.
- For this slice, seed the blocklist with one hardcoded entry (any well-known channel) so the pipeline is demoable without UI.

## Acceptance criteria

- [ ] `npm run build` produces a `dist/` directory loadable as an unpacked extension in Chrome.
- [ ] Manifest is V3 and grants only the minimum needed permissions (`storage`, host permission for `https://www.youtube.com/*`).
- [ ] Storage helpers expose typed `getBlockedChannels()`, `addBlockedChannel(entry)`, `removeBlockedChannel(idOrHandle)`.
- [ ] Loading youtube.com with one channel seeded in storage hides all of its video cards on the homepage feed.
- [ ] Scrolling the homepage continues to hide newly-loaded cards from that channel (MutationObserver wired).
- [ ] Navigating to youtube.com from another page (SPA nav) also hides cards without a hard reload.

## Blocked by

None — can start immediately.