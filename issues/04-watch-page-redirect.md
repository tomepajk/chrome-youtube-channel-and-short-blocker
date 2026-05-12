# 04 — Watch page: redirect when uploader is blocked

## What to build

When the user lands on `/watch?v=...` for a video whose uploader is on the blocklist (e.g., via search, external link, or autoplay), redirect to youtube.com.

- On every watch-page load and SPA navigation, identify the uploader's channel `id` and `handle` from the watch-page DOM (the channel name/avatar block under the video).
- Because the channel info renders asynchronously, wait for the relevant element via the existing `MutationObserver` rather than polling. Have a sensible timeout (e.g., 5s) to avoid hanging if the DOM never appears.
- If either identifier matches the blocklist, call `location.replace('https://www.youtube.com/')`.
- The video player should not begin playing audio before redirect; pause the player as soon as the match is detected, then redirect.

## Acceptance criteria

- [ ] Navigating directly to a watch URL whose uploader is blocked redirects to youtube.com.
- [ ] SPA-navigating to such a watch URL from another YouTube page also redirects.
- [ ] Autoplay into a blocked uploader's video triggers redirect before significant playback.
- [ ] Watch pages whose uploader is NOT blocked are unaffected (no flicker, no redirect).
- [ ] If the uploader element fails to appear within the timeout, the page is left alone (fail-open, not a hang).

## Blocked by

- Issue 01
