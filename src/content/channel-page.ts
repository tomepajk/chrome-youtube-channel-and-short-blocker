import { addBlockedChannel } from '../storage';
import type { BlockedChannel } from '../storage/types';
import { getCurrentChannelFromUrl } from './page-router';

const REDIRECT_TARGET = 'https://www.youtube.com/';

const STYLE_ID = 'ytdb-channel-page-styles';
const BTN_CLASS = 'ytdb-channel-block-btn';

const FLEX_CONTAINER_SELECTORS = [
  '#page-header yt-flexible-actions-view-model',
  'yt-page-header-view-model yt-flexible-actions-view-model',
  'ytd-c4-tabbed-header-renderer yt-flexible-actions-view-model',
];

function ensureStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  if (!document.head) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    yt-flexible-actions-view-model > button.${BTN_CLASS},
    button.${BTN_CLASS} {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-left: 8px;
      padding: 0 16px;
      height: 36px;
      min-width: 95px;
      font: 500 14px Roboto, Arial, sans-serif;
      color: #0f0f0f;
      background: rgba(0,0,0,0.06);
      border: 1px solid rgba(0,0,0,0.2);
      border-radius: 18px;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
      vertical-align: middle;
      white-space: nowrap;
      box-sizing: border-box;
      flex-shrink: 0;
    }
    html[dark] button.${BTN_CLASS},
    ytd-app[dark] button.${BTN_CLASS},
    [dark] button.${BTN_CLASS} {
      color: #f1f1f1;
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.2);
    }
    button.${BTN_CLASS}:hover {
      background: rgba(204,0,0,0.12);
      border-color: rgba(204,0,0,0.55);
      color: #cc0000;
    }
    html[dark] button.${BTN_CLASS}:hover,
    ytd-app[dark] button.${BTN_CLASS}:hover,
    [dark] button.${BTN_CLASS}:hover {
      background: rgba(255,82,82,0.18);
      border-color: rgba(255,82,82,0.6);
      color: #ff5252;
    }
    @media (prefers-color-scheme: dark) {
      button.${BTN_CLASS} {
        color: #f1f1f1;
        background: rgba(255,255,255,0.1);
        border-color: rgba(255,255,255,0.2);
      }
      button.${BTN_CLASS}:hover {
        background: rgba(255,82,82,0.18);
        border-color: rgba(255,82,82,0.6);
        color: #ff5252;
      }
    }
  `;
  document.head.appendChild(style);
}

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

  ensureStyles();

  const button = document.createElement('button');
  button.className = BTN_CLASS;
  button.type = 'button';
  button.textContent = 'Block channel';
  button.setAttribute('aria-label', 'Block this channel');

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
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
  });

  flex.appendChild(button);
}

export function startChannelPageWatcher(): void {
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
