import type { BlockedChannel } from '../storage/types';
import { incrementHiddenCount, isBlocked } from '../storage';
import { extractChannelFromCard } from './extract-channel';
import { cardSelector } from './selectors';

const HIDDEN_ATTR = 'data-ytdb-hidden';
const STYLE_ID = 'ytdb-hide-styles';

export function ensureHideStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  if (!document.head) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    ytd-rich-item-renderer:has(yt-lockup-view-model[style*="display: none"]),
    ytd-rich-item-renderer:has(yt-lockup-view-model[style*="display:none"]),
    ytd-rich-item-renderer:has(yt-lockup-view-model[data-ytdb-hidden="1"]) {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
}

function hide(el: HTMLElement): boolean {
  if (el.getAttribute(HIDDEN_ATTR) === '1') return false;
  el.setAttribute(HIDDEN_ATTR, '1');
  el.style.display = 'none';
  return true;
}

function show(el: HTMLElement): void {
  if (el.getAttribute(HIDDEN_ATTR) !== '1') return;
  el.removeAttribute(HIDDEN_ATTR);
  el.style.display = '';
}

export function processCardForHiding(
  card: HTMLElement,
  blocked: BlockedChannel[],
): void {
  const channel = extractChannelFromCard(card);
  if (isBlocked(channel, blocked)) {
    if (hide(card)) incrementHiddenCount(1);
  } else {
    show(card);
  }
}

export function resetAllHiding(): void {
  document
    .querySelectorAll<HTMLElement>(`[${HIDDEN_ATTR}="1"]`)
    .forEach(show);
}

export function reapplyHidingAll(blocked: BlockedChannel[]): void {
  document
    .querySelectorAll<HTMLElement>(cardSelector)
    .forEach((c) => processCardForHiding(c, blocked));
}
