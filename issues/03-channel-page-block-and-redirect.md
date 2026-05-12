# 03 — Channel page: Block button + redirect blocked channels

## What to build

Make channel pages a first-class block surface and enforce that visiting a blocked channel sends the user back to the homepage.

- On `/@handle` and `/channel/UCxxx` pages, inject a "Block" button into the channel header, positioned next to the Subscribe button.
- Clicking the button uses the same `addBlockedChannel` flow as the video-card button (slice 02), including the undo toast.
- On every navigation (initial load and SPA `yt-navigate-finish`), if the current page is a channel page whose `id` or `handle` matches the blocklist, call `location.replace('https://www.youtube.com/')`.
- The redirect must run as early as possible to minimize the visual flash of the blocked page.

## Acceptance criteria

- [ ] Visiting a channel page (handle or ID URL form) shows a "Block" button in the header next to Subscribe.
- [ ] Clicking it blocks the channel and shows the undo toast; channel page immediately redirects to youtube.com.
- [ ] Visiting an already-blocked channel's page redirects to youtube.com before the user can meaningfully interact.
- [ ] SPA-navigating from another YouTube page to a blocked channel page also triggers the redirect.
- [ ] Unblocking the channel via undo (or popup, once available) makes the channel page reachable again.

## Blocked by

- Issue 01
