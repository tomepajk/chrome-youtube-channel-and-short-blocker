import { addBlockedChannel } from '../storage';
import type { BlockedChannel } from '../storage/types';
import { extractChannelFromCard } from './extract-channel';
import { showUndoToast } from './toast';
import { CARD_MARK_ATTR, cardSelector } from './selectors';

const PROCESSED_ATTR = 'data-ytdb-btn';
const STYLE_ID = 'ytdb-card-styles';

function findChannelNameLink(card: Element): HTMLAnchorElement | null {
  const links = card.querySelectorAll<HTMLAnchorElement>(
    'a[href^="/@"], a[href^="/channel/"]',
  );

  let avatarLink: HTMLAnchorElement | null = null;

  for (const link of links) {
    if (link.id === 'avatar-link' || link.id === 'thumbnail') {
      avatarLink = avatarLink ?? link;
      continue;
    }
    const text = link.textContent?.trim();
    if (text && text.length > 0) return link;
  }
  return avatarLink;
}

export function ensureBlockButtonStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  if (!document.head) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    button.ytdb-block-btn {
      display: block;
      width: calc(100% - 16px);
      margin: 8px 8px 4px;
      padding: 6px 10px;
      font: 500 12px Roboto, Arial, sans-serif;
      color: #606060;
      background: rgba(127,127,127,0.08);
      border: 1px solid rgba(127,127,127,0.25);
      border-radius: 8px;
      cursor: pointer;
      text-align: center;
      box-sizing: border-box;
      opacity: 0.55;
      transition: opacity 0.15s, background 0.15s, border-color 0.15s, color 0.15s;
    }
    html[dark] button.ytdb-block-btn,
    ytd-app[dark] button.ytdb-block-btn,
    [dark] button.ytdb-block-btn {
      color: #aaa;
      background: rgba(255,255,255,0.06);
      border-color: rgba(255,255,255,0.15);
    }
    [${CARD_MARK_ATTR}="1"]:hover button.ytdb-block-btn,
    button.ytdb-block-btn:focus-visible {
      opacity: 1;
    }
    button.ytdb-block-btn:hover {
      background: rgba(204,0,0,0.12);
      border-color: rgba(204,0,0,0.5);
      color: #cc0000;
      opacity: 1;
    }
    html[dark] button.ytdb-block-btn:hover,
    ytd-app[dark] button.ytdb-block-btn:hover,
    [dark] button.ytdb-block-btn:hover {
      background: rgba(255,82,82,0.18);
      border-color: rgba(255,82,82,0.6);
      color: #ff5252;
    }
    @media (prefers-color-scheme: dark) {
      button.ytdb-block-btn {
        color: #aaa;
        background: rgba(255,255,255,0.06);
        border-color: rgba(255,255,255,0.15);
      }
      button.ytdb-block-btn:hover {
        background: rgba(255,82,82,0.18);
        border-color: rgba(255,82,82,0.6);
        color: #ff5252;
      }
    }
  `;
  document.head.appendChild(style);
}

export function injectBlockButton(card: HTMLElement): void {
  if (card.getAttribute(PROCESSED_ATTR) === '1') return;
  if (card.parentElement?.closest(`[${PROCESSED_ATTR}="1"]`)) return;

  const channelLink = findChannelNameLink(card);
  if (!channelLink) return;

  if (card.parentElement?.closest(cardSelector)?.getAttribute(PROCESSED_ATTR) === '1') {
    return;
  }

  card.setAttribute(PROCESSED_ATTR, '1');
  card.setAttribute(CARD_MARK_ATTR, '1');

  const button = document.createElement('button');
  button.className = 'ytdb-block-btn';
  button.type = 'button';
  button.textContent = 'Block channel';
  button.setAttribute('aria-label', 'Block this channel');

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ref = extractChannelFromCard(card);
    if (!ref.id && !ref.handle) return;
    const name =
      channelLink.textContent?.trim() || ref.handle || 'channel';
    const entry: BlockedChannel = {
      id: ref.id ?? '',
      handle: ref.handle ?? '',
      name,
      blockedAt: Date.now(),
    };
    void addBlockedChannel(entry).then(() => {
      showUndoToast(name, ref.id || ref.handle || '');
    });
  });

  card.appendChild(button);
}