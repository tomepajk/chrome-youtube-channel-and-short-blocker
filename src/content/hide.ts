import type { BlockedChannel } from '../storage/types';
import { incrementHiddenCount, isBlocked } from '../storage';
import { extractChannelFromCard } from './extract-channel';
import { cardSelector } from './selectors';

const HIDDEN_ATTR = 'data-ytdb-hidden';

function hide(el: HTMLElement): boolean {
  if (el.getAttribute(HIDDEN_ATTR) === '1') return false;
  el.setAttribute(HIDDEN_ATTR, '1');
  return true;
}

function show(el: HTMLElement): void {
  if (el.getAttribute(HIDDEN_ATTR) !== '1') return;
  el.removeAttribute(HIDDEN_ATTR);
}

export function processCardForHiding(
  card: HTMLElement,
  blocked: BlockedChannel[],
): void {
  const channel = extractChannelFromCard(card);
  const blockedMatch = isBlocked(channel, blocked);
  if (blockedMatch) {
    console.log('[ytdb] 4. processCardForHiding MATCH → hiding', { channel, card });
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