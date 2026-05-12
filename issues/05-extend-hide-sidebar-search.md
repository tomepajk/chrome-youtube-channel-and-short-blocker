# 05 — Extend hide to sidebar suggestions and search results

## What to build

The existing hide pipeline (from slice 01) targets homepage cards. Extend its selector set so the same `display: none` rule runs on:

- Watch-page sidebar "Up next" / suggested video items.
- Search results pages (`/results?search_query=...`), including both video result rows and channel result rows from blocked channels.

This is the same MutationObserver, same matching logic — only the selectors and identifier-extraction helpers expand.

- Also inject the "Block" button (slice 02) onto sidebar items and search-result video rows so users can block from those surfaces too.

## Acceptance criteria

- [ ] On any watch page, sidebar suggestions from blocked channels are hidden, including those added by infinite scroll.
- [ ] On search results pages, video results uploaded by blocked channels are hidden.
- [ ] On search results pages, channel result rows for blocked channels are hidden.
- [ ] Hover Block button works on sidebar suggestions and search-result video rows the same way it does on homepage cards.
- [ ] No duplicate hiding work / no performance regression on long search-result pages.

## Blocked by

- Issue 02
