import { addBlockedChannel } from '../storage';
import type { BlockedChannel } from '../storage/types';
import { extractChannelFromCard } from './extract-channel';
import { showUndoToast } from './toast';
import { CARD_MARK_ATTR, cardSelector } from './selectors';

const PROCESSED_ATTR = 'data-ytdb-btn';
const BTN_CLASS = 'ytdb-block-btn';

export function injectBlockButton(card: HTMLElement): void {
  if (card.getAttribute(PROCESSED_ATTR) === '1') return;
  if (card.parentElement?.closest(`[${PROCESSED_ATTR}="1"]`)) return;

  const ref = extractChannelFromCard(card);
  if (!ref.id && !ref.handle && !ref.name) return;

  if (
    card.parentElement?.closest(cardSelector)?.getAttribute(PROCESSED_ATTR) ===
    '1'
  ) {
    return;
  }

  card.setAttribute(PROCESSED_ATTR, '1');
  card.setAttribute(CARD_MARK_ATTR, '1');

  const button = document.createElement('button');
  button.className = BTN_CLASS;
  button.type = 'button';
  button.textContent = 'Block channel';
  button.setAttribute('aria-label', 'Block this channel');
  card.appendChild(button);
}

function handleCardBlockClick(e: MouseEvent): void {
  const target = e.target as Element | null;
  if (!target) return;
  // Checking if maybe I am also hitting the overlay
  const btn = target.closest?.(`.${BTN_CLASS}`) || target.querySelector(`.${BTN_CLASS}`);
  if (!btn) return;
  const card = btn.closest(cardSelector) as HTMLElement | null;
  if (!card) return;

  e.preventDefault();
  e.stopPropagation();

  console.log('[ytdb] 1. click handler fired', card);
  const ref = extractChannelFromCard(card);
  console.log('[ytdb] 1b. extracted ref from card', ref);
  if (!ref.id && !ref.handle && !ref.name) return;
  const name = ref.name || ref.handle || 'channel';
  const entry: BlockedChannel = {
    id: ref.id ?? '',
    handle: ref.handle ?? '',
    name,
    blockedAt: Date.now(),
  };
  void addBlockedChannel(entry).then(() => {
    showUndoToast(name, ref.id || ref.handle || '');
  });
}

export function startBlockButtonDelegation(): void {
  document.addEventListener('click', handleCardBlockClick, true);
}