# YouTube Distraction Blocker

A Chrome extension that lets you block channels you don't want to see on YouTube.
Hover any channel name on a video card or channel page, click **Block**, and
that channel disappears from your feed, sidebar, and search results — and
visiting their pages redirects you to youtube.com. Includes a master toggle to
hide all Shorts.

This is a personal-use extension distributed unpacked. Not on the Chrome Web
Store.

## Install

Prerequisites: **Node 18+** and npm.

```bash
git clone <this repo>
cd youtube-distraction-blocker
npm install
npm run build
```

The built extension lives in `dist/`.

Then in Chrome:

1. Go to `chrome://extensions`.
2. Toggle **Developer mode** on (top right).
3. Click **Load unpacked**.
4. Select the `dist/` folder.

The extension's icon (a default puzzle piece, since no icons are bundled) will
appear in the toolbar.

## Use

- **Block from a video card.** Hover any video card on the homepage, in
  search results, or in the watch-page sidebar. A small **Block** button
  appears next to the channel name. Click it; an undo toast appears for ~5
  seconds.
- **Block from a channel page.** Visit a channel page (`/@handle` or
  `/channel/UCxxx`). A **Block** button appears next to Subscribe.
- **Visiting a blocked channel** (channel page or any of their videos) redirects
  to youtube.com.
- **Popup** (click the toolbar icon): see your blocklist, unblock with the ×
  button, toggle "Hide all Shorts", view today/total hide counters.
- **Options page** (Manage all… link in popup): search the blocklist, bulk
  unblock, export/import as JSON.

## Develop

```bash
npm run dev        # vite dev (rebuilds on save; reload extension after changes)
npm run build      # production build into dist/
npm run typecheck  # tsc --noEmit
```

After any code change, rebuild and click the reload icon for this extension on
`chrome://extensions`. Then refresh any open YouTube tab.

## Project layout

```
src/
  manifest.json          MV3 manifest
  background/index.ts    Service worker (seeds blocklist on first install)
  content/               Content script that runs on youtube.com
    index.ts             Entry: wires hide pipeline, button injection, routing
    selectors.ts         Shared video-card selectors
    extract-channel.ts   Extract channel id/handle from card or URL
    hide.ts              display:none cards from blocked channels
    block-button.ts      Hover "Block" button on cards
    channel-page.ts      "Block" button on channel page header
    page-router.ts       Channel-page + watch-page redirects
    shorts.ts            Hide-all-Shorts feature
    toast.ts             Undo toast (Shadow DOM)
    observer.ts          Generic MutationObserver runner
  popup/                 Toolbar popup UI
  options/               Full options page
  storage/               chrome.storage.sync wrappers
```

## Troubleshooting

- **Hover Block button isn't appearing.** YouTube's DOM occasionally changes.
  Selectors live in `src/content/selectors.ts` (video cards) and
  `src/content/channel-page.ts` (channel page Subscribe area). Inspect a card
  in DevTools and adjust if needed.
- **Wipe storage.** Open `chrome://extensions`, click **Inspect views: service
  worker** for this extension, and run
  `chrome.storage.sync.clear()` in the console.
- **Seeded MrBeast block on first install.** This is a one-time tracer for
  verifying the install — unblock from the popup if you don't want it.

## License

Personal project. Use, fork, share with friends. No warranty.
