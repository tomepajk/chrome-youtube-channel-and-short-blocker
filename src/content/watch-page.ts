import { addBlockedChannel } from '../storage';
import type { BlockedChannel } from '../storage/types';
import { extractChannelFromWatchPage, type ChannelRef } from './extract-channel';
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

function hasUsableChannelRef(ref: ChannelRef | null): ref is ChannelRef {
  return !!ref && (!!ref.id || !!ref.handle || !!ref.name);
}

function findInjectionTarget(): Element | null {
  if (location.pathname !== '/watch') return null;
  const container = findOwnerContainer();
  if (!container) return null;
  if (container.querySelector(`.${BTN_CLASS}`)) return null;
  if (!hasUsableChannelRef(extractChannelFromWatchPage())) return null;
  return container;
}

function injectWatchBlockButton(container: Element): void {
  const button = document.createElement('button');
  button.className = BTN_CLASS;
  button.type = 'button';
  button.textContent = 'Block channel';
  button.setAttribute('aria-label', 'Block this channel');
  container.appendChild(button);
}

export function maybeInjectWatchBlockButton(): void {
  const container = findInjectionTarget();
  if (container) injectWatchBlockButton(container);
}

function findClickedBlockButton(e: MouseEvent): Element | null {
  const target = e.target as Element | null;
  return target?.closest?.(`.${BTN_CLASS}`) ?? null;
}

function blockCurrentWatchChannel(): void {
  const ref = extractChannelFromWatchPage();
  if (!hasUsableChannelRef(ref)) return;
  const entry: BlockedChannel = {
    id: ref.id ?? '',
    handle: ref.handle ?? '',
    name: ref.name || ref.handle || 'channel',
    blockedAt: Date.now(),
  };
  void addBlockedChannel(entry).then(() => {
    location.replace(REDIRECT_TARGET);
  });
}

function handleWatchBlockClick(e: MouseEvent): void {
  if (!findClickedBlockButton(e)) return;
  e.preventDefault();
  e.stopPropagation();
  blockCurrentWatchChannel();
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
