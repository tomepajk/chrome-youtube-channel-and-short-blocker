# 07 — "Hide all Shorts" toggle

## What to build

Shorts are treated as a category-wide distraction independent of the channel blocklist. Add a single toggle in the popup that hides every Shorts surface site-wide when on.

- A boolean `hideAllShorts` setting in `chrome.storage.sync`, default off.
- Popup gains a labeled toggle that reads/writes this setting and updates live across tabs.
- When `hideAllShorts` is true, the content script:
  - Hides the Shorts shelf on the homepage.
  - Hides individual Shorts entries within search results and the watch-page sidebar.
  - Hides the "Shorts" item in the left-rail navigation.
  - Intercepts navigation to `/shorts/*` URLs and redirects to `https://www.youtube.com/` (early redirect, same approach as channel-page redirect from slice 03).
- When toggled off, all of the above stop applying without page reload.

## Acceptance criteria

- [ ] Popup shows a "Hide all Shorts" toggle with current state persisted across browser restarts and devices.
- [ ] With the toggle on: homepage Shorts shelf, sidebar Shorts items, search-result Shorts items, and the left-rail Shorts link are all hidden.
- [ ] With the toggle on: navigating to any `/shorts/<id>` URL redirects to youtube.com before the Shorts player meaningfully loads.
- [ ] Toggling off restores Shorts surfaces without a page reload (or on next navigation at worst).
- [ ] Channel blocklist behavior is unaffected by this setting (orthogonal features).

## Blocked by

- Issue 06
