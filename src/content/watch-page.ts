import { addBlockedChannel } from '../storage';
import type { BlockedChannel } from '../storage/types';
import { extractChannelFromWatchPage } from './extract-channel';
import { WATCH_OWNER_CONTAINER_SELECTORS } from './selectors';

const REDIRECT_TARGET = 'https://www.youtube.com/';
const BTN_CLASS = 'ytdb-watch-block-btn';

function findOwnerContainer(): Element | null {
  for (const sel of WATCH_OWNER_CONTAINER_SELECTORS) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export function maybeInjectWatchBlockButton(): void {
  if (location.pathname !== '/watch') return;
  const container = findOwnerContainer();
  if (!container) return;
  if (container.querySelector(`.${BTN_CLASS}`)) return;

  const ref = extractChannelFromWatchPage();
  if (!ref || (!ref.id && !ref.handle && !ref.name)) return;

  const button = document.createElement('button');
  button.className = BTN_CLASS;
  button.type = 'button';
  button.textContent = 'Block channel';
  button.setAttribute('aria-label', 'Block this channel');
  container.appendChild(button);
}

function handleWatchBlockClick(e: MouseEvent): void {
  const target = e.target as Element | null;
  if (!target) return;
  const btn = target.closest?.(`.${BTN_CLASS}`);
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();

  const ref = extractChannelFromWatchPage();
  if (!ref || (!ref.id && !ref.handle && !ref.name)) return;
  const name = ref.name || ref.handle || 'channel';
  const entry: BlockedChannel = {
    id: ref.id ?? '',
    handle: ref.handle ?? '',
    name,
    blockedAt: Date.now(),
  };
  void addBlockedChannel(entry).then(() => {
    location.replace(REDIRECT_TARGET);
  });
}

export function startWatchPageWatcher(): void {
  document.addEventListener('click', handleWatchBlockClick, true);

  let pending = false;
  const schedule = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      maybeInjectWatchBlockButton();
    });
  };

  schedule();
  document.addEventListener('yt-navigate-finish', schedule);

  const obs = new MutationObserver(schedule);
  const begin = () => {
    obs.observe(document.body, { childList: true, subtree: true });
    schedule();
  };
  if (document.body) begin();
  else document.addEventListener('DOMContentLoaded', begin, { once: true });
}
