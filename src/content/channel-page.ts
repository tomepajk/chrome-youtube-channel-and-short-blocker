import { addBlockedChannel } from '../storage';
import type { BlockedChannel } from '../storage/types';
import { getCurrentChannelFromUrl } from './page-router';

const REDIRECT_TARGET = 'https://www.youtube.com/';
const BTN_CLASS = 'ytdb-channel-block-btn';

const FLEX_CONTAINER_SELECTORS = [
  '#page-header yt-flexible-actions-view-model',
  'yt-page-header-view-model yt-flexible-actions-view-model',
  'ytd-c4-tabbed-header-renderer yt-flexible-actions-view-model',
];

function findFlexContainer(): Element | null {
  for (const sel of FLEX_CONTAINER_SELECTORS) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return document.querySelector('yt-flexible-actions-view-model');
}

function getChannelDisplayName(): string {
  const h1 = document.querySelector(
    'h1.dynamicTextViewModelH1, h1.dynamic-text-view-model-wiz__h1, ytd-channel-name #text, yt-page-header-renderer h1',
  );
  return h1?.textContent?.trim() || '';
}

export function maybeInjectChannelBlockButton(): void {
  const path = location.pathname;
  if (!path.startsWith('/@') && !path.startsWith('/channel/')) return;
  const ref = getCurrentChannelFromUrl();
  if (!ref.id && !ref.handle) return;

  const flex = findFlexContainer();
  if (!flex) return;
  if (flex.querySelector(`.${BTN_CLASS}`)) return;

  const button = document.createElement('button');
  button.className = BTN_CLASS;
  button.type = 'button';
  button.textContent = 'Block channel';
  button.setAttribute('aria-label', 'Block this channel');
  flex.appendChild(button);
}

function handleChannelBlockClick(e: MouseEvent): void {
  const target = e.target as Element | null;
  if (!target) return;
  const btn = target.closest?.(`.${BTN_CLASS}`);
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();

  const ref = getCurrentChannelFromUrl();
  if (!ref.id && !ref.handle) return;
  const name = getChannelDisplayName() || ref.handle || 'channel';
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

export function startChannelPageWatcher(): void {
  document.addEventListener('click', handleChannelBlockClick, true);

  let pending = false;
  const schedule = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      maybeInjectChannelBlockButton();
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