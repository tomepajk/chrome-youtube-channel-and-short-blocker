# 08 — Hide counters: videos hidden today / total

## What to build

Give the user visible feedback that the extension is working by tracking how many video cards / sidebar items / search rows it has hidden, and surface that in the popup.

- Storage gains two counters: `hiddenToday: { date: 'YYYY-MM-DD', count: number }` and `hiddenTotal: number`, both in `chrome.storage.sync`.
- The content script's hide pipeline increments both counters once per element actually hidden (deduplicated — don't recount the same DOM node on subsequent MutationObserver passes).
- "Today" rolls over at local midnight: when incrementing, if `hiddenToday.date` is not today's local date, reset `count` to 0 and update `date` before incrementing.
- Popup displays both counters near the top, e.g., "Hidden today: 42 · Total: 1,287".
- Counters update live in the popup via `chrome.storage.onChanged`.

## Acceptance criteria

- [ ] Browsing YouTube with at least one channel blocked or Shorts hidden causes both counters to climb.
- [ ] The same DOM node is not counted multiple times across MutationObserver passes.
- [ ] At local midnight (or on next increment after midnight), the "today" counter resets to 0 while "total" continues.
- [ ] Popup shows both counters and updates them live without the popup needing to be reopened.
- [ ] Storage writes for counters are batched / throttled so rapid scrolling does not hammer `chrome.storage.sync` past its write quota.

## Blocked by

- Issue 02
- Issue 05
- Issue 06
